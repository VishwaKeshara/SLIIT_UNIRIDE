import axios from "axios";

const BASE = "http://localhost:5000/api/trips";

export const getTrips = () => axios.get(BASE);
export const getTrip = (id) => axios.get(`${BASE}/${id}`);
export const getTripsByDriver = (driverId) => axios.get(`${BASE}/driver/${driverId}`);
export const addTrip = (data) => axios.post(BASE, data);
export const updateTrip = (id, data) => axios.put(`${BASE}/${id}`, data);
export const updateTripStatus = (id, data) => axios.patch(`${BASE}/${id}/status`, data);
export const deleteTrip = (id) => axios.delete(`${BASE}/${id}`);
