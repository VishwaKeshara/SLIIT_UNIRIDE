import React from "react";
import RouteList from "../features/Shuttle & Route Management/RouteList";

function Schedules() {
  return (
    <RouteList
      readOnly={true}
      title="Shuttle Schedules"
      description="View all available shuttle routes, departure times, stops, and recurrence details in one place."
    />
  );
}

export default Schedules;
