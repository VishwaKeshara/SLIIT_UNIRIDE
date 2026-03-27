import React from "react";
import RouteList from "../features/Shuttle & Route Management/RouteList";

function Schedules() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <RouteList
        readOnly={true}
        title="Shuttle Schedules"
        description="View all available shuttle routes, start times, and recurrence details."
      />
    </div>
  );
}

export default Schedules;
