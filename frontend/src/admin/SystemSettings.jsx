import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { getStoredAdminData } from "./adminAccess";
import {
  SETTINGS_STORAGE_KEY,
  defaultSystemSettings as defaultSettings,
  loadSystemSettings,
} from "./systemSettingsConfig";

function ToggleField({ label, checked, onChange, description }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-[22px] border border-blue-100 bg-[#f7faff] px-5 py-4">
      <div>
        <p className="text-base font-extrabold text-[#0b1f45]">{label}</p>
        {description && (
          <p className="mt-1 text-sm text-[#617ba4]">{description}</p>
        )}
      </div>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative mt-1 h-8 w-16 rounded-full transition ${
          checked ? "bg-[#143d7a]" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${
            checked ? "left-9" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function TextField({ label, value, onChange, type = "text", description }) {
  return (
    <div>
      <label className="mb-2 block text-base font-bold text-[#5c79a8]">
        {label}
      </label>
      {description && (
        <p className="mb-2 text-sm text-[#617ba4]">{description}</p>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-[20px] border border-blue-100 bg-[#f7faff] p-3 text-base text-[#0b1f45] outline-none transition focus:border-[#3464d4] focus:ring-2 focus:ring-[#dbe7ff]"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="mb-2 block text-base font-bold text-[#5c79a8]">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-[20px] border border-blue-100 bg-[#f7faff] p-3 text-base text-[#0b1f45] outline-none transition focus:border-[#3464d4] focus:ring-2 focus:ring-[#dbe7ff]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function SettingsCard({ title, badge, children }) {
  return (
    <section className="rounded-[34px] border border-blue-100 bg-white p-7 shadow-[0_18px_45px_rgba(80,122,191,0.18)]">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h3 className="text-2xl font-extrabold text-[#0b2f67] sm:text-4xl">
          {title}
        </h3>
        {badge && (
          <span className="rounded-full bg-[#e8eefb] px-5 py-2 text-lg font-bold text-[#3464d4]">
            {badge}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function SystemSettings() {
  const adminData = getStoredAdminData();
  const [settings, setSettings] = useState(defaultSettings);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setSettings(loadSystemSettings());
  }, []);

  const updateSection = (section, key, value) => {
    setSettings((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [key]: value,
      },
    }));
  };

  const handleSave = () => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    localStorage.setItem(
      "unirideSystemSettingsMeta",
      JSON.stringify({
        updatedBy: adminData?.name || adminData?.email || "Admin",
        updatedAt: new Date().toISOString(),
      })
    );
    setSuccessMessage("System settings saved successfully.");
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify(defaultSettings)
    );
    setSuccessMessage("System settings reset to defaults.");
  };

  const settingsMeta = (() => {
    try {
      return JSON.parse(localStorage.getItem("unirideSystemSettingsMeta")) || null;
    } catch {
      return null;
    }
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eff4fb] via-[#f7fbff] to-[#eef3f9] lg:flex">
      <AdminSidebar />

      <main className="flex-1 p-6 lg:p-10">
        <div className="mb-10 flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-[#0b2f67] sm:text-6xl">
              System Settings
            </h1>
            <p className="mt-3 max-w-3xl text-base text-[#5c79a8] sm:text-lg">
              Configure how bookings, payments, notifications, and admin
              security behave across the UniRide platform.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/admin/dashboard"
              className="rounded-3xl bg-[#e8eefb] px-7 py-4 text-lg font-extrabold text-[#0a3772] shadow-sm transition hover:opacity-90"
            >
              Dashboard
            </Link>
            <Link
              to="/admin/reports"
              className="rounded-3xl bg-[#ffbf00] px-7 py-4 text-lg font-extrabold text-[#111827] shadow-sm transition hover:opacity-90"
            >
              Reports
            </Link>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-[30px] border border-blue-100 bg-white p-7 shadow-[0_18px_45px_rgba(80,122,191,0.18)]">
            <p className="text-[1.05rem] font-bold text-[#5c79a8]">
              Maintenance Mode
            </p>
            <h2 className="mt-5 text-4xl font-extrabold text-[#0b2f67]">
              {settings.general.maintenanceMode ? "Enabled" : "Disabled"}
            </h2>
          </div>

          <div className="rounded-[30px] border border-blue-100 bg-white p-7 shadow-[0_18px_45px_rgba(80,122,191,0.18)]">
            <p className="text-[1.05rem] font-bold text-[#5c79a8]">
              Default Payment
            </p>
            <h2 className="mt-5 text-4xl font-extrabold capitalize text-[#0b2f67]">
              {settings.payment.defaultPaymentMethod}
            </h2>
          </div>

          <div className="rounded-[30px] border border-blue-100 bg-white p-7 shadow-[0_18px_45px_rgba(80,122,191,0.18)]">
            <p className="text-[1.05rem] font-bold text-[#5c79a8]">
              Admin Timeout
            </p>
            <h2 className="mt-5 text-4xl font-extrabold text-[#0b2f67]">
              {settings.security.adminSessionTimeoutMinutes} min
            </h2>
          </div>
        </div>

        {successMessage && (
          <div className="mb-8 rounded-[24px] border border-green-200 bg-green-50 px-5 py-4 text-sm font-bold text-green-700">
            {successMessage}
          </div>
        )}

        <div className="space-y-8">
          <SettingsCard title="General Settings" badge="Core Platform">
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <TextField
                label="System Name"
                value={settings.general.systemName}
                onChange={(value) => updateSection("general", "systemName", value)}
              />
              <TextField
                label="Support Email"
                value={settings.general.supportEmail}
                onChange={(value) => updateSection("general", "supportEmail", value)}
                type="email"
              />
              <TextField
                label="Support Phone"
                value={settings.general.supportPhone}
                onChange={(value) => updateSection("general", "supportPhone", value)}
              />
              <TextField
                label="Timezone"
                value={settings.general.timezone}
                onChange={(value) => updateSection("general", "timezone", value)}
              />
            </div>

            <div className="mt-5">
              <ToggleField
                label="Maintenance Mode"
                description="Temporarily stop new bookings while keeping admin tools available."
                checked={settings.general.maintenanceMode}
                onChange={(value) =>
                  updateSection("general", "maintenanceMode", value)
                }
              />
            </div>
          </SettingsCard>

          <SettingsCard title="Booking Settings" badge="Reservation Rules">
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <TextField
                label="Maximum Booking Days"
                type="number"
                value={settings.booking.maxBookingDays}
                onChange={(value) =>
                  updateSection("booking", "maxBookingDays", Number(value))
                }
              />
              <TextField
                label="Cancellation Deadline (Hours)"
                type="number"
                value={settings.booking.cancellationDeadlineHours}
                onChange={(value) =>
                  updateSection(
                    "booking",
                    "cancellationDeadlineHours",
                    Number(value)
                  )
                }
              />
              <TextField
                label="Booking Open Time"
                type="time"
                value={settings.booking.bookingWindowOpen}
                onChange={(value) =>
                  updateSection("booking", "bookingWindowOpen", value)
                }
              />
              <TextField
                label="Booking Close Time"
                type="time"
                value={settings.booking.bookingWindowClose}
                onChange={(value) =>
                  updateSection("booking", "bookingWindowClose", value)
                }
              />
            </div>

            <div className="mt-5 space-y-4">
              <ToggleField
                label="Allow Advance Booking"
                checked={settings.booking.allowAdvanceBooking}
                onChange={(value) =>
                  updateSection("booking", "allowAdvanceBooking", value)
                }
              />
              <ToggleField
                label="Auto Confirm Bookings"
                checked={settings.booking.autoConfirmBookings}
                onChange={(value) =>
                  updateSection("booking", "autoConfirmBookings", value)
                }
              />
              <ToggleField
                label="Allow Guest Bookings"
                checked={settings.booking.allowGuestBookings}
                onChange={(value) =>
                  updateSection("booking", "allowGuestBookings", value)
                }
              />
            </div>
          </SettingsCard>

          <SettingsCard title="Payment Settings" badge="Finance Rules">
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <SelectField
                label="Default Payment Method"
                value={settings.payment.defaultPaymentMethod}
                onChange={(value) =>
                  updateSection("payment", "defaultPaymentMethod", value)
                }
                options={[
                  { value: "cash", label: "Cash" },
                  { value: "card", label: "Card" },
                ]}
              />
            </div>

            <div className="mt-5 space-y-4">
              <ToggleField
                label="Enable Cash Payments"
                checked={settings.payment.enableCashPayments}
                onChange={(value) =>
                  updateSection("payment", "enableCashPayments", value)
                }
              />
              <ToggleField
                label="Enable Card Payments"
                checked={settings.payment.enableCardPayments}
                onChange={(value) =>
                  updateSection("payment", "enableCardPayments", value)
                }
              />
              <ToggleField
                label="Require Payment Verification"
                description="Admins must verify transactions before final approval."
                checked={settings.payment.verificationRequired}
                onChange={(value) =>
                  updateSection("payment", "verificationRequired", value)
                }
              />
              <ToggleField
                label="Auto Flag Failed Payments"
                checked={settings.payment.autoFlagFailedPayments}
                onChange={(value) =>
                  updateSection("payment", "autoFlagFailedPayments", value)
                }
              />
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-base font-bold text-[#5c79a8]">
                Refund Policy
              </label>
              <textarea
                rows="4"
                value={settings.payment.refundPolicy}
                onChange={(e) =>
                  updateSection("payment", "refundPolicy", e.target.value)
                }
                className="w-full rounded-[20px] border border-blue-100 bg-[#f7faff] p-3 text-base text-[#0b1f45] outline-none transition focus:border-[#3464d4] focus:ring-2 focus:ring-[#dbe7ff]"
              />
            </div>
          </SettingsCard>

          <SettingsCard title="Notification Settings" badge="Alerts">
            <div className="space-y-4">
              <ToggleField
                label="Email Notifications"
                checked={settings.notifications.emailNotifications}
                onChange={(value) =>
                  updateSection("notifications", "emailNotifications", value)
                }
              />
              <ToggleField
                label="SMS Notifications"
                checked={settings.notifications.smsNotifications}
                onChange={(value) =>
                  updateSection("notifications", "smsNotifications", value)
                }
              />
              <ToggleField
                label="Booking Alerts"
                checked={settings.notifications.bookingAlerts}
                onChange={(value) =>
                  updateSection("notifications", "bookingAlerts", value)
                }
              />
              <ToggleField
                label="Trip Delay Alerts"
                checked={settings.notifications.delayAlerts}
                onChange={(value) =>
                  updateSection("notifications", "delayAlerts", value)
                }
              />
              <ToggleField
                label="Refund Alerts"
                checked={settings.notifications.refundAlerts}
                onChange={(value) =>
                  updateSection("notifications", "refundAlerts", value)
                }
              />
              <ToggleField
                label="Complaint Alerts"
                checked={settings.notifications.complaintAlerts}
                onChange={(value) =>
                  updateSection("notifications", "complaintAlerts", value)
                }
              />
            </div>
          </SettingsCard>

          <SettingsCard title="Security Settings" badge="Admin Access">
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
              <TextField
                label="Session Timeout (Minutes)"
                type="number"
                value={settings.security.adminSessionTimeoutMinutes}
                onChange={(value) =>
                  updateSection(
                    "security",
                    "adminSessionTimeoutMinutes",
                    Number(value)
                  )
                }
              />
              <TextField
                label="Minimum Password Length"
                type="number"
                value={settings.security.passwordMinLength}
                onChange={(value) =>
                  updateSection("security", "passwordMinLength", Number(value))
                }
              />
              <TextField
                label="Login Attempt Limit"
                type="number"
                value={settings.security.loginAttemptLimit}
                onChange={(value) =>
                  updateSection("security", "loginAttemptLimit", Number(value))
                }
              />
            </div>

            <div className="mt-5">
              <ToggleField
                label="Audit Logging"
                description="Keep a record of important admin actions and configuration changes."
                checked={settings.security.auditLogging}
                onChange={(value) =>
                  updateSection("security", "auditLogging", value)
                }
              />
            </div>
          </SettingsCard>
        </div>

        <div className="mt-8 rounded-[28px] border border-blue-100 bg-white p-6 shadow-[0_18px_45px_rgba(80,122,191,0.12)]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="text-sm text-slate-500">
              <p>
                Last updated by{" "}
                <span className="font-extrabold text-[#0a3772]">
                  {settingsMeta?.updatedBy || "No saved settings yet"}
                </span>
              </p>
              <p className="mt-1">
                {settingsMeta?.updatedAt
                  ? new Date(settingsMeta.updatedAt).toLocaleString()
                  : "Save settings to start tracking updates."}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="rounded-[18px] bg-slate-200 px-5 py-3 text-sm font-extrabold text-slate-700 transition hover:opacity-90"
              >
                Reset to Default
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="rounded-[18px] bg-[#143d7a] px-5 py-3 text-sm font-extrabold text-white transition hover:opacity-90"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SystemSettings;
