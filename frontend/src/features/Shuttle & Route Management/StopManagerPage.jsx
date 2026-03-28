import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  DragDropContext,
  Droppable,
  Draggable
} from "@hello-pangea/dnd";
import {
  ArrowLeft,
  CheckCircle2,
  GripVertical,
  MapPinned,
  Navigation,
  Pencil,
  PlusCircle,
  Route as RouteIcon,
  Trash2,
  AlertCircle,
} from "lucide-react";

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
    <section className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <div className="absolute inset-0 bg-slate-950/65" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-2xl backdrop-blur-md">
          <div className="grid gap-6 p-6 md:grid-cols-[1.3fr_0.7fr] md:p-8">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white">
                <Navigation size={16} />
                Stop Management
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                Manage Route Stops
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 md:text-base">
                Add, rename, delete, and reorder stop locations for each shuttle
                route from one dispatch-ready workspace.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/10 p-4 text-white">
                <p className="text-sm text-slate-200">Total Stops</p>
                <p className="mt-2 text-3xl font-bold">{stops.length}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 text-white">
                <p className="text-sm text-slate-200">Route Status</p>
                <p className="mt-2 text-lg font-semibold">
                  {routeId ? "Connected" : "No Route"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <Link
            to="/RouteList"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
          >
            <ArrowLeft size={18} />
            Back to Route List
          </Link>
        </div>

        {selectedRoute && (
          <div className="mb-6 rounded-3xl border border-white/10 bg-white/10 p-5 text-white shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-3 text-blue-200">
                <RouteIcon size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                  Active Route
                </p>
                <p className="mt-1 text-lg font-bold">{selectedRoute.routeName}</p>
                <p className="mt-1 text-sm text-slate-200">
                  {selectedRoute.startLocation} to {selectedRoute.endLocation}
                </p>
              </div>
            </div>
          </div>
        )}

        {!routeId && (
          <div className="mb-6 rounded-3xl border border-amber-400/20 bg-amber-400/10 px-5 py-4 text-sm text-amber-100 shadow-xl backdrop-blur-md">
            Open Stop Manager from a route to add and manage its stops.
          </div>
        )}

        {successMessage && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-green-400/20 bg-green-400/10 px-4 py-4 text-sm text-green-100 shadow-sm backdrop-blur-md">
            <CheckCircle2 size={18} />
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-4 text-sm text-red-100 shadow-sm backdrop-blur-md">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <div className="rounded-3xl border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur-md md:p-6">
          <div className="mb-5 flex items-center gap-2 text-white">
            <PlusCircle size={18} className="text-blue-300" />
            <h2 className="text-lg font-semibold">Add Stop</h2>
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <MapPinned
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={newStop}
                onChange={(e) => setNewStop(e.target.value)}
                placeholder="Enter stop name"
                className="w-full rounded-2xl border border-white/15 bg-slate-950/50 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                disabled={!routeId || isSaving}
              />
            </div>
            <button
              type="button"
              onClick={handleAddStop}
              disabled={!routeId || isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-500"
            >
              <PlusCircle size={18} />
              {isSaving ? "Adding..." : "Add Stop"}
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur-md md:p-6">
          <div className="mb-5 flex items-center gap-2 text-white">
            <Navigation size={18} className="text-blue-300" />
            <h2 className="text-lg font-semibold">Stop Sequence</h2>
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-8 text-center text-slate-200">
              Loading stops...
            </div>
          ) : stops.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-8 text-center text-slate-200">
              {routeId
                ? "No stops added for this route yet."
                : "Select a route to view stops."}
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
                            className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-white shadow-lg"
                          >
                            {editingStopId === stop._id ? (
                              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                                <span className="font-semibold text-slate-300">
                                  #{index + 1}
                                </span>
                                <input
                                  value={editingStopName}
                                  onChange={(e) => setEditingStopName(e.target.value)}
                                  className="flex-1 rounded-2xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStop(stop._id)}
                                  className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEditingStop}
                                  className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/15"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex items-center gap-4">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="cursor-grab rounded-2xl bg-white/10 p-2 text-slate-300 active:cursor-grabbing"
                                  >
                                    <GripVertical size={18} />
                                  </div>
                                  <div className="rounded-2xl bg-blue-500/15 px-3 py-2 text-sm font-semibold text-blue-100">
                                    #{index + 1}
                                  </div>
                                  <div>
                                    <p className="text-base font-semibold text-white">
                                      {stop.stopName}
                                    </p>
                                    <p className="text-sm text-slate-300">
                                      Drag to reorder this stop
                                    </p>
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() => startEditingStop(stop)}
                                    className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600"
                                  >
                                    <Pencil size={16} />
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(stop._id)}
                                    className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                                  >
                                    <Trash2 size={16} />
                                    Delete
                                  </button>
                                </div>
                              </div>
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
      </div>
    </section>
  );
}

export default StopManagerPage;
