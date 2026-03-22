import React from "react";
import { useLocation } from "react-router-dom";

function BookRide() {
  const location = useLocation();
  const selectedRoute = location.state?.selectedRoute;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold mb-4">Book a Shuttle Ride</h1>
      <p>Reserve your seat for an upcoming shuttle.</p>

      {selectedRoute && (
        <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <h2 className="text-xl font-semibold text-slate-900">{selectedRoute.routeName}</h2>
          <p className="mt-2 text-sm text-slate-700">
            {selectedRoute.startLocation} to {selectedRoute.endLocation}
          </p>
          <p className="mt-1 text-sm text-slate-700">Start time: {selectedRoute.startTime}</p>
          <p className="mt-1 text-sm text-slate-700">Seats: {selectedRoute.seatCapacity}</p>
          <p className="mt-1 text-sm text-slate-700">
            Recurrence: {selectedRoute.recurrence}
            {selectedRoute.recurrence === "weekly" && selectedRoute.days?.length > 0
              ? ` (${selectedRoute.days.join(", ")})`
              : ""}
          </p>
        </div>
      )}
    </div>
  );
}

export default BookRide;
