const axios = require("axios");
const polyline = require("@mapbox/polyline");

const DIRECTIONS_URL = "https://maps.googleapis.com/maps/api/directions/json";
const PLACES_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
const SAMPLE_DISTANCE_KM = Number(process.env.ROUTE_SAMPLE_DISTANCE_KM || 7);
const SEARCH_RADIUS_METERS = Number(
  process.env.ROUTE_STOP_SEARCH_RADIUS_METERS || 2000
);
const ROUTE_TOLERANCE_METERS = Number(
  process.env.ROUTE_STOP_ROUTE_TOLERANCE_METERS || 1500
);
const MAX_SAMPLED_POINTS = Number(process.env.ROUTE_MAX_SAMPLED_POINTS || 25);

const STOP_SEARCH_CONFIGS = [
  { type: "bus_station" },
  { type: "transit_station" },
  { type: "train_station" },
  { keyword: "town" },
  { keyword: "city" }
];

class GoogleApiError extends Error {
  constructor(message, statusCode = 502) {
    super(message);
    this.name = "GoogleApiError";
    this.statusCode = statusCode;
  }
}

const mapAxiosError = (error, fallbackMessage) => {
  if (error.response?.data?.error_message) {
    return new GoogleApiError(error.response.data.error_message);
  }

  if (error.code === "ECONNABORTED") {
    return new GoogleApiError(`${fallbackMessage}: request timed out.`);
  }

  if (error.message) {
    return new GoogleApiError(`${fallbackMessage}: ${error.message}`);
  }

  return new GoogleApiError(fallbackMessage);
};

const ensureApiKey = () => {
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    throw new GoogleApiError(
      "GOOGLE_MAPS_API_KEY is missing. Add it to the backend environment variables.",
      500
    );
  }

  return process.env.GOOGLE_MAPS_API_KEY;
};

const toPoint = ([lat, lng]) => ({ lat, lng });

const haversineDistanceMeters = (pointA, pointB) => {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const earthRadiusMeters = 6371000;

  const dLat = toRadians(pointB.lat - pointA.lat);
  const dLng = toRadians(pointB.lng - pointA.lng);
  const lat1 = toRadians(pointA.lat);
  const lat2 = toRadians(pointB.lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * earthRadiusMeters * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const buildCumulativeDistances = (points) => {
  const cumulative = [0];

  for (let index = 1; index < points.length; index += 1) {
    const segmentDistance = haversineDistanceMeters(points[index - 1], points[index]);
    cumulative.push(cumulative[index - 1] + segmentDistance);
  }

  return cumulative;
};

const interpolatePoint = (start, end, ratio) => ({
  lat: start.lat + (end.lat - start.lat) * ratio,
  lng: start.lng + (end.lng - start.lng) * ratio
});

const sampleRoutePoints = (points, cumulativeDistances, sampleDistanceKm) => {
  if (points.length <= 2) {
    return points;
  }

  const totalDistanceMeters = cumulativeDistances[cumulativeDistances.length - 1];
  const sampleDistanceMeters = Math.max(sampleDistanceKm, 1) * 1000;
  const sampledPoints = [points[0]];

  for (
    let targetDistance = sampleDistanceMeters;
    targetDistance < totalDistanceMeters;
    targetDistance += sampleDistanceMeters
  ) {
    let segmentIndex = 1;

    while (
      segmentIndex < cumulativeDistances.length &&
      cumulativeDistances[segmentIndex] < targetDistance
    ) {
      segmentIndex += 1;
    }

    if (segmentIndex >= points.length) {
      break;
    }

    const startDistance = cumulativeDistances[segmentIndex - 1];
    const endDistance = cumulativeDistances[segmentIndex];
    const ratio =
      endDistance === startDistance
        ? 0
        : (targetDistance - startDistance) / (endDistance - startDistance);

    sampledPoints.push(
      interpolatePoint(points[segmentIndex - 1], points[segmentIndex], ratio)
    );
  }

  sampledPoints.push(points[points.length - 1]);

  if (sampledPoints.length <= MAX_SAMPLED_POINTS) {
    return sampledPoints;
  }

  const trimmedPoints = [];
  const stride = (sampledPoints.length - 1) / (MAX_SAMPLED_POINTS - 1);

  for (let index = 0; index < MAX_SAMPLED_POINTS; index += 1) {
    trimmedPoints.push(sampledPoints[Math.round(index * stride)]);
  }

  return trimmedPoints;
};

const findRouteProgress = (candidatePoint, routePoints, cumulativeDistances) => {
  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let index = 0; index < routePoints.length; index += 1) {
    const currentDistance = haversineDistanceMeters(candidatePoint, routePoints[index]);

    if (currentDistance < bestDistance) {
      bestDistance = currentDistance;
      bestIndex = index;
    }
  }

  return {
    distanceFromRouteMeters: bestDistance,
    progressMeters: cumulativeDistances[bestIndex]
  };
};

const isValidStopType = (types = []) =>
  types.some((type) =>
    [
      "bus_station",
      "train_station",
      "transit_station",
      "locality",
      "sublocality",
      "neighborhood",
      "administrative_area_level_3"
    ].includes(type)
  );

const fetchDirections = async (origin, destination, apiKey) => {
  try {
    const response = await axios.get(DIRECTIONS_URL, {
      params: {
        origin,
        destination,
        mode: "driving",
        key: apiKey
      },
      timeout: 15000
    });

    if (response.data.status !== "OK" || !response.data.routes?.length) {
      throw new GoogleApiError(
        `Directions API failed: ${response.data.status || "Unknown error"}`
      );
    }

    return response.data.routes[0];
  } catch (error) {
    if (error instanceof GoogleApiError) {
      throw error;
    }

    throw mapAxiosError(error, "Directions API request failed");
  }
};

const fetchNearbyPlaces = async (point, apiKey) => {
  const placeResults = [];

  for (const config of STOP_SEARCH_CONFIGS) {
    try {
      const response = await axios.get(PLACES_URL, {
        params: {
          location: `${point.lat},${point.lng}`,
          radius: SEARCH_RADIUS_METERS,
          key: apiKey,
          ...config
        },
        timeout: 15000
      });

      if (response.data.status !== "OK" && response.data.status !== "ZERO_RESULTS") {
        throw new GoogleApiError(
          `Places API failed: ${response.data.status || "Unknown error"}`
        );
      }

      if (Array.isArray(response.data.results)) {
        placeResults.push(...response.data.results);
      }
    } catch (error) {
      if (error instanceof GoogleApiError) {
        throw error;
      }

      throw mapAxiosError(error, "Places API request failed");
    }
  }

  return placeResults;
};

const dedupeAndSortStops = (places, routePoints, cumulativeDistances) => {
  const stopMap = new Map();

  for (const place of places) {
    const location = place.geometry?.location;

    if (!location || !place.name) {
      continue;
    }

    if (!isValidStopType(place.types)) {
      continue;
    }

    const candidatePoint = { lat: location.lat, lng: location.lng };
    const routeMatch = findRouteProgress(candidatePoint, routePoints, cumulativeDistances);

    if (routeMatch.distanceFromRouteMeters > ROUTE_TOLERANCE_METERS) {
      continue;
    }

    const key =
      place.place_id ||
      `${place.name.toLowerCase()}-${candidatePoint.lat.toFixed(5)}-${candidatePoint.lng.toFixed(5)}`;

    const existing = stopMap.get(key);
    const stopRecord = {
      name: place.name,
      lat: candidatePoint.lat,
      lng: candidatePoint.lng,
      progressMeters: routeMatch.progressMeters,
      distanceFromRouteMeters: routeMatch.distanceFromRouteMeters
    };

    if (
      !existing ||
      stopRecord.distanceFromRouteMeters < existing.distanceFromRouteMeters
    ) {
      stopMap.set(key, stopRecord);
    }
  }

  return [...stopMap.values()]
    .sort((left, right) => left.progressMeters - right.progressMeters)
    .map(({ name, lat, lng }) => ({ name, lat, lng }));
};

const buildRoutePayload = async ({ startLocation, endLocation }) => {
  const apiKey = ensureApiKey();
  const route = await fetchDirections(startLocation, endLocation, apiKey);
  const leg = route.legs?.[0];

  if (!leg || !route.overview_polyline?.points) {
    throw new GoogleApiError("Directions API response did not include route details.");
  }

  const decodedPolyline = polyline.decode(route.overview_polyline.points).map(toPoint);
  const cumulativeDistances = buildCumulativeDistances(decodedPolyline);
  const sampledPoints = sampleRoutePoints(
    decodedPolyline,
    cumulativeDistances,
    SAMPLE_DISTANCE_KM
  );

  const allPlaces = [];

  for (const point of sampledPoints) {
    const nearbyPlaces = await fetchNearbyPlaces(point, apiKey);
    allPlaces.push(...nearbyPlaces);
  }

  const stops = dedupeAndSortStops(allPlaces, decodedPolyline, cumulativeDistances);

  return {
    startLocation,
    endLocation,
    distance: Number((leg.distance.value / 1000).toFixed(2)),
    duration: Number((leg.duration.value / 60).toFixed(1)),
    polyline: route.overview_polyline.points,
    stops
  };
};

module.exports = {
  GoogleApiError,
  buildRoutePayload
};
