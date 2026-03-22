import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MapPin, Route, Users, Clock, Repeat } from "lucide-react";

function RouteForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    routeName: "",
    startLocation: "",
    endLocation: "",
    seatCapacity: "",
    startTime: "",
    recurrence: "none", // none | daily | weekly
    days: []
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // 🔍 Validation
  const validate = () => {
    let newErrors = {};

    if (!form.routeName.trim()) {
      newErrors.routeName = "Route name is required";
    }

    if (!form.startLocation.trim()) {
      newErrors.startLocation = "Start location is required";
    }

    if (!form.endLocation.trim()) {
      newErrors.endLocation = "End location is required";
    }

    if (form.startLocation === form.endLocation && form.startLocation !== "") {
      newErrors.endLocation = "Start and End cannot be the same";
    }

    if (!form.seatCapacity) {
      newErrors.seatCapacity = "Seat capacity is required";
    } else if (form.seatCapacity <= 0) {
      newErrors.seatCapacity = "Must be greater than 0";
    } else if (form.seatCapacity > 100) {
      newErrors.seatCapacity = "Max 100 seats allowed";
    }

    if (!form.startTime) {
      newErrors.startTime = "Start time is required";
    }

    if (form.recurrence === "weekly" && form.days.length === 0) {
      newErrors.days = "Select at least one day";
    }

    return newErrors;
  };

  // 🗓️ Toggle days
  const toggleDay = (day) => {
    if (form.days.includes(day)) {
      setForm({
        ...form,
        days: form.days.filter((d) => d !== day)
      });
    } else {
      setForm({
        ...form,
        days: [...form.days, day]
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);
    setSubmitError("");

    if (Object.keys(validationErrors).length > 0) return;

    try {
      await axios.post("http://localhost:5000/api/routes", {
        ...form,
        seatCapacity: Number(form.seatCapacity)
      });
      alert("✅ Route Added Successfully");

      setForm({
        routeName: "",
        startLocation: "",
        endLocation: "",
        seatCapacity: "",
        startTime: "",
        recurrence: "none",
        days: []
      });

      setErrors({});
      navigate("/RouteList", {
        state: { successMessage: "Route added successfully." }
      });
    } catch (err) {
      alert("❌ Error adding route");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-indigo-200 p-6">
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-lg p-8">

        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          🚍 Add Shuttle Route
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Route Name */}
          <div>
            <label className="text-sm font-medium text-gray-600">Route Name</label>
            <div className={`flex items-center border rounded-lg px-3 mt-1 ${errors.routeName ? "border-red-500" : ""}`}>
              <Route className="mr-2 text-gray-400" size={18} />
              <input
                type="text"
                value={form.routeName}
                onChange={(e) => setForm({ ...form, routeName: e.target.value })}
                className="w-full py-2 outline-none"
                placeholder="Malabe - Colombo"
              />
            </div>
            {errors.routeName && <p className="text-red-500 text-sm">{errors.routeName}</p>}
          </div>

          {/* Start */}
          <div>
            <label className="text-sm font-medium text-gray-600">Start Location</label>
            <div className={`flex items-center border rounded-lg px-3 mt-1 ${errors.startLocation ? "border-red-500" : ""}`}>
              <MapPin className="mr-2 text-green-500" size={18} />
              <input
                type="text"
                value={form.startLocation}
                onChange={(e) => setForm({ ...form, startLocation: e.target.value })}
                className="w-full py-2 outline-none"
              />
            </div>
            {errors.startLocation && <p className="text-red-500 text-sm">{errors.startLocation}</p>}
          </div>

          {/* End */}
          <div>
            <label className="text-sm font-medium text-gray-600">End Location</label>
            <div className={`flex items-center border rounded-lg px-3 mt-1 ${errors.endLocation ? "border-red-500" : ""}`}>
              <MapPin className="mr-2 text-red-500" size={18} />
              <input
                type="text"
                value={form.endLocation}
                onChange={(e) => setForm({ ...form, endLocation: e.target.value })}
                className="w-full py-2 outline-none"
              />
            </div>
            {errors.endLocation && <p className="text-red-500 text-sm">{errors.endLocation}</p>}
          </div>

          {/* Seats */}
          <div>
            <label className="text-sm font-medium text-gray-600">Seat Capacity</label>
            <div className={`flex items-center border rounded-lg px-3 mt-1 ${errors.seatCapacity ? "border-red-500" : ""}`}>
              <Users className="mr-2 text-blue-500" size={18} />
              <input
                type="number"
                value={form.seatCapacity}
                onChange={(e) => setForm({ ...form, seatCapacity: e.target.value })}
                className="w-full py-2 outline-none"
              />
            </div>
            {errors.seatCapacity && <p className="text-red-500 text-sm">{errors.seatCapacity}</p>}
          </div>

          {/* Time */}
          <div>
            <label className="text-sm font-medium text-gray-600">Start Time</label>
            <div className={`flex items-center border rounded-lg px-3 mt-1 ${errors.startTime ? "border-red-500" : ""}`}>
              <Clock className="mr-2 text-purple-500" size={18} />
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full py-2 outline-none"
              />
            </div>
            {errors.startTime && <p className="text-red-500 text-sm">{errors.startTime}</p>}
          </div>

          {/* Recurrence */}
          <div>
            <label className="text-sm font-medium text-gray-600">Recurrence</label>
            <div className="flex items-center border rounded-lg px-3 mt-1">
              <Repeat className="mr-2 text-indigo-500" size={18} />
              <select
                value={form.recurrence}
                onChange={(e) => setForm({ ...form, recurrence: e.target.value, days: [] })}
                className="w-full py-2 outline-none"
              >
                <option value="none">One Time</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>

          {/* Weekly Days */}
          {form.recurrence === "weekly" && (
            <div>
              <label className="text-sm font-medium text-gray-600">Select Days</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {weekDays.map((day) => (
                  <button
                    type="button"
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1 rounded-full border ${
                      form.days.includes(day)
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              {errors.days && <p className="text-red-500 text-sm">{errors.days}</p>}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold"
          >
            ➕ Add Route
          </button>

        </form>
      </div>
    </div>
  );
}

export default RouteForm;
