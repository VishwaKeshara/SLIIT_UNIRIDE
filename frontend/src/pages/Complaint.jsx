import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../axiosinstance";
import bgImage from "../assets/bus.jpg";

const complaintTypes = [
  {
    value: "booking",
    label: "Booking issue",
    detail: "Problems with reservations, cancellations, or assigned seats.",
  },
  {
    value: "driver",
    label: "Driver conduct",
    detail: "Unsafe driving, unprofessional behavior, or missed service standards.",
  },
  {
    value: "schedule",
    label: "Schedule issue",
    detail: "Late arrivals, route timing issues, or missed pickups.",
  },
  {
    value: "payment",
    label: "Payment concern",
    detail: "Incorrect charges, payment confirmation, or refund-related concerns.",
  },
  {
    value: "other",
    label: "Other support issue",
    detail: "Anything else that requires review from the support team.",
  },
];

const initialForm = {
  title: "",
  type: "booking",
  message: "",
};

const initialTouched = {
  title: false,
  type: false,
  message: false,
};

const TITLE_MIN_LENGTH = 8;
const TITLE_MAX_LENGTH = 100;
const MESSAGE_MIN_LENGTH = 30;
const MESSAGE_MAX_LENGTH = 1000;

function validateComplaint(formData) {
  const errors = {};
  const trimmedTitle = formData.title.trim();
  const trimmedMessage = formData.message.trim();

  if (!trimmedTitle) {
    errors.title = "Please enter a short subject for your complaint.";
  } else if (trimmedTitle.length < TITLE_MIN_LENGTH) {
    errors.title = `Subject must be at least ${TITLE_MIN_LENGTH} characters.`;
  } else if (trimmedTitle.length > TITLE_MAX_LENGTH) {
    errors.title = `Subject cannot exceed ${TITLE_MAX_LENGTH} characters.`;
  }

  if (!complaintTypes.some((item) => item.value === formData.type)) {
    errors.type = "Please choose a valid complaint category.";
  }

  if (!trimmedMessage) {
    errors.message = "Please describe what happened.";
  } else if (trimmedMessage.length < MESSAGE_MIN_LENGTH) {
    errors.message = `Description must be at least ${MESSAGE_MIN_LENGTH} characters so the team can investigate properly.`;
  } else if (trimmedMessage.length > MESSAGE_MAX_LENGTH) {
    errors.message = `Description cannot exceed ${MESSAGE_MAX_LENGTH} characters.`;
  }

  return errors;
}

function Complaint() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialForm);
  const [touched, setTouched] = useState(initialTouched);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const errors = useMemo(() => validateComplaint(formData), [formData]);
  const selectedType =
    complaintTypes.find((item) => item.value === formData.type) ||
    complaintTypes[0];
  const isFormValid = Object.keys(errors).length === 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
    setSuccess("");
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("Please log in with your UniRide account before submitting a complaint.");
      return;
    }

    const nextErrors = validateComplaint(formData);
    if (Object.keys(nextErrors).length > 0) {
      setTouched({
        title: true,
        type: true,
        message: true,
      });
      setError("Please correct the highlighted fields before submitting.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await axios.post("/complaints", {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        title: formData.title.trim(),
        type: formData.type,
        message: formData.message.trim(),
        status: "pending",
      });

      setSuccess("Your complaint has been submitted successfully. Our team will review it shortly.");
      setFormData(initialForm);
      setTouched(initialTouched);

      setTimeout(() => {
        navigate("/");
      }, 1600);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "We could not submit your complaint right now. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClassName = (fieldName) =>
    `mt-2 w-full rounded-2xl border px-4 py-3 text-sm transition outline-none ${
      touched[fieldName] && errors[fieldName]
        ? "border-red-400 bg-red-500/10 text-white placeholder:text-red-200/70 focus:border-red-300 focus:ring-4 focus:ring-red-500/20"
        : "border-white/12 bg-white/6 text-white placeholder:text-slate-400 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-400/20"
    }`;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(17,94,89,0.18),_transparent_32%),linear-gradient(135deg,_#08121f_0%,_#0d2034_48%,_#13324d_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl overflow-hidden rounded-[36px] border border-white/10 bg-[#07111d]/80 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
        <section
          className="relative hidden min-h-[760px] flex-col justify-between bg-cover bg-center p-10 lg:flex"
          style={{ backgroundImage: `url(${bgImage})` }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,12,24,0.38)_0%,rgba(5,13,24,0.84)_45%,rgba(5,13,24,0.96)_100%)]" />

          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.38em] text-cyan-200/80">
                UniRide Support Desk
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-white">
                Raise a complaint with clarity
              </h2>
            </div>
            <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
              Student Service
            </div>
          </div>

          <div className="relative z-10 max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-cyan-200/75">
              Professional reporting flow
            </p>
            <h1 className="mt-5 text-5xl font-black leading-[1.05] text-white">
              Help us investigate the issue the right way.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-8 text-slate-200/80">
              Submit a clear complaint with the category, subject, and full incident
              details. Stronger reports help the admin team review cases faster and
              respond more accurately.
            </p>
          </div>

          <div className="relative z-10 grid gap-4">
            {[
              "Use a specific subject line so the case can be triaged quickly.",
              "Include dates, route names, payment references, or driver details when relevant.",
              "Complaints are submitted with an initial status of pending for admin review.",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/12 bg-white/10 px-5 py-4 text-sm leading-6 text-slate-100/85 backdrop-blur-sm"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
          <div className="w-full max-w-2xl">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
                Support Request
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Add a complaint
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">
                Provide a professional summary of the issue so our team can verify,
                prioritize, and respond properly.
              </p>
            </div>

            <div className="mb-6 grid gap-4 rounded-[28px] border border-white/10 bg-white/5 p-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Submitted by
                </p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {user?.name || "Not logged in"}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {user?.email || "Sign in to file a complaint"}
                </p>
              </div>
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                  Service standard
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-100/90">
                  Complaints should be factual, respectful, and specific enough for
                  investigation.
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-white">Case details</h2>
                    <p className="mt-1 text-sm text-slate-400">
                      Start with the subject and the issue category.
                    </p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
                    Step 1
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label htmlFor="title" className="text-sm font-semibold text-white">
                      Complaint subject
                    </label>
                    <input
                      id="title"
                      type="text"
                      name="title"
                      placeholder="Example: Driver missed the scheduled Malabe pickup"
                      value={formData.title}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      maxLength={TITLE_MAX_LENGTH}
                      className={fieldClassName("title")}
                    />
                    <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                      <span
                        className={
                          touched.title && errors.title ? "text-red-300" : "text-slate-400"
                        }
                      >
                        {touched.title && errors.title
                          ? errors.title
                          : `Use a clear subject between ${TITLE_MIN_LENGTH} and ${TITLE_MAX_LENGTH} characters.`}
                      </span>
                      <span className="text-slate-500">
                        {formData.title.trim().length}/{TITLE_MAX_LENGTH}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="type" className="text-sm font-semibold text-white">
                      Complaint category
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={fieldClassName("type")}
                    >
                      {complaintTypes.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                    <p
                      className={`mt-2 text-xs ${
                        touched.type && errors.type ? "text-red-300" : "text-slate-400"
                      }`}
                    >
                      {touched.type && errors.type ? errors.type : selectedType.detail}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-white">Incident description</h2>
                    <p className="mt-1 text-sm text-slate-400">
                      Explain what happened, when it happened, and how it affected you.
                    </p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
                    Step 2
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="text-sm font-semibold text-white">
                    Detailed description
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="8"
                    placeholder="Include relevant dates, routes, pickup points, payment references, and the exact issue you experienced."
                    value={formData.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    maxLength={MESSAGE_MAX_LENGTH}
                    className={`${fieldClassName("message")} resize-none`}
                  />
                  <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                    <span
                      className={
                        touched.message && errors.message
                          ? "text-red-300"
                          : "text-slate-400"
                      }
                    >
                      {touched.message && errors.message
                        ? errors.message
                        : `Minimum ${MESSAGE_MIN_LENGTH} characters. Focus on facts that help investigation.`}
                    </span>
                    <span className="text-slate-500">
                      {formData.message.trim().length}/{MESSAGE_MAX_LENGTH}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(34,197,94,0.08),rgba(6,78,59,0.18))] p-5 sm:p-6">
                <h2 className="text-lg font-bold text-white">Before you submit</h2>
                <div className="mt-3 grid gap-3 text-sm text-slate-200/85 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
                    Keep the description respectful and factual.
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
                    Add enough detail for admin staff to verify the case.
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !isFormValid}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-cyan-400 px-5 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
                >
                  {isSubmitting ? "Submitting complaint..." : "Submit complaint"}
                </button>

                {!user && (
                  <p className="mt-3 text-xs text-amber-300">
                    Sign in first to submit the complaint under your UniRide account.
                  </p>
                )}
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Complaint;
