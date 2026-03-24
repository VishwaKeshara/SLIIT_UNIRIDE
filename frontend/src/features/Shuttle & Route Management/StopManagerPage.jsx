import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  DragDropContext,
  Droppable,
  Draggable
} from "@hello-pangea/dnd";

function StopManagerPage() {
  const { routeId: routeIdParam } = useParams();
  const location = useLocation();
  const selectedRoute = location.state?.route || null;
  const routeId = routeIdParam || selectedRoute?._id || "";

  const [stops, setStops] = useState([]);
  const [newStop, setNewStop] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editingStopId, setEditingStopId] = useState("");
  const [editingStopName, setEditingStopName] = useState("");

  const fetchStops = async () => {
    if (!routeId) {
      setStops([]);
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const res = await axios.get(`http://localhost:5000/api/stops/route/${routeId}`);
      setStops(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load stops.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setSuccessMessage("");
    fetchStops();
  }, [routeId]);

  const handleAddStop = async () => {
    if (!routeId) {
      setError("Select a route before adding stops.");
      return;
    }

    if (!newStop.trim()) {
      setError("Enter a stop name.");
      return;
    }

    try {
      setIsSaving(true);
      setError("");
      setSuccessMessage("");
      await axios.post("http://localhost:5000/api/stops", {
        stopName: newStop.trim(),
        route: routeId
      });
      setNewStop("");
      setSuccessMessage("Stop added successfully.");
      await fetchStops();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to add stop.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setError("");
      setSuccessMessage("");
      await axios.delete(`http://localhost:5000/api/stops/${id}`);
      setSuccessMessage("Stop deleted successfully.");
      await fetchStops();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete stop.");
    }
  };

  const startEditingStop = (stop) => {
    setEditingStopId(stop._id);
    setEditingStopName(stop.stopName);
    setError("");
    setSuccessMessage("");
  };

  const cancelEditingStop = () => {
    setEditingStopId("");
    setEditingStopName("");
  };

  const handleUpdateStop = async (id) => {
    if (!editingStopName.trim()) {
      setError("Enter a stop name.");
      return;
    }

    try {
      setError("");
      setSuccessMessage("");
      await axios.put(`http://localhost:5000/api/stops/${id}`, {
        stopName: editingStopName.trim()
      });
      setSuccessMessage("Stop updated successfully.");
      setEditingStopId("");
      setEditingStopName("");
      await fetchStops();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update stop.");
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(stops);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setStops(items);

    try {
      setError("");
      setSuccessMessage("");
      await Promise.all(
        items.map((stop, index) =>
          axios.put(`http://localhost:5000/api/stops/${stop._id}`, {
            order: index + 1
          })
        )
      );
      setSuccessMessage("Stop order updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update stop order.");
      await fetchStops();
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl rounded-2xl bg-white p-6 shadow-lg">
      <h2 className="mb-4 text-center text-xl font-bold text-slate-900">
        Manage Stops
      </h2>

      {selectedRoute && (
        <div className="mb-4 rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-700">
          Route: <span className="font-semibold">{selectedRoute.routeName}</span>
        </div>
      )}

      {!routeId && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Open Stop Manager from a route to add and manage its stops.
          <div className="mt-2">
            <Link to="/RouteList" className="font-medium text-amber-800 underline">
              Go to Route List
            </Link>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-4 flex gap-2">
        <input
          value={newStop}
          onChange={(e) => setNewStop(e.target.value)}
          placeholder="Enter stop name"
          className="flex-1 rounded-lg border px-3 py-2"
          disabled={!routeId || isSaving}
        />
        <button
          type="button"
          onClick={handleAddStop}
          disabled={!routeId || isSaving}
          className="rounded-lg bg-blue-600 px-4 text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isSaving ? "Adding..." : "Add"}
        </button>
      </div>

      {isLoading ? (
        <div className="rounded-lg bg-slate-100 px-4 py-6 text-center text-slate-600">
          Loading stops...
        </div>
      ) : stops.length === 0 ? (
        <div className="rounded-lg bg-slate-100 px-4 py-6 text-center text-slate-600">
          {routeId ? "No stops added for this route yet." : "Select a route to view stops."}
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="stops">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-3"
              >
                {stops.map((stop, index) => (
                  <Draggable
                    key={stop._id}
                    draggableId={stop._id}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="flex items-center justify-between rounded-lg bg-gray-100 p-3 shadow-sm"
                      >
                        {editingStopId === stop._id ? (
                          <div className="flex w-full items-center gap-2">
                            <span className="font-semibold text-slate-700">#{index + 1}</span>
                            <input
                              value={editingStopName}
                              onChange={(e) => setEditingStopName(e.target.value)}
                              className="flex-1 rounded-lg border px-3 py-2"
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateStop(stop._id)}
                              className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditingStop}
                              className="rounded-lg bg-slate-200 px-3 py-2 text-sm text-slate-700"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <div>
                              <span className="mr-2 font-semibold">#{index + 1}</span>
                              {stop.stopName}
                            </div>

                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => startEditingStop(stop)}
                                className="text-amber-600 hover:text-amber-700"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(stop._id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}

export default StopManagerPage;
