export const SETTINGS_STORAGE_KEY = "unirideSystemSettings";

export const defaultSystemSettings = {
  general: {
    systemName: "UniRide",
    supportEmail: "support@uniride.lk",
    supportPhone: "+94 11 123 4567",
    timezone: "Asia/Colombo",
    maintenanceMode: false,
  },
  booking: {
    allowAdvanceBooking: true,
    maxBookingDays: 14,
    cancellationDeadlineHours: 12,
    autoConfirmBookings: true,
    allowGuestBookings: true,
    bookingWindowOpen: "05:30",
    bookingWindowClose: "21:00",
  },
  payment: {
    enableCashPayments: true,
    enableCardPayments: true,
    defaultPaymentMethod: "cash",
    verificationRequired: true,
    autoFlagFailedPayments: true,
    refundPolicy:
      "Refunds can be approved by admins for cancelled paid bookings after review.",
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    bookingAlerts: true,
    delayAlerts: true,
    refundAlerts: true,
    complaintAlerts: true,
  },
  security: {
    adminSessionTimeoutMinutes: 60,
    passwordMinLength: 8,
    loginAttemptLimit: 5,
    auditLogging: true,
  },
};

export function loadSystemSettings() {
  try {
    const rawSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!rawSettings) return defaultSystemSettings;

    const parsed = JSON.parse(rawSettings);
    return {
      ...defaultSystemSettings,
      ...parsed,
      general: {
        ...defaultSystemSettings.general,
        ...(parsed.general || {}),
      },
      booking: {
        ...defaultSystemSettings.booking,
        ...(parsed.booking || {}),
      },
      payment: {
        ...defaultSystemSettings.payment,
        ...(parsed.payment || {}),
      },
      notifications: {
        ...defaultSystemSettings.notifications,
        ...(parsed.notifications || {}),
      },
      security: {
        ...defaultSystemSettings.security,
        ...(parsed.security || {}),
      },
    };
  } catch (error) {
    console.error("Failed to load system settings", error);
    return defaultSystemSettings;
  }
}
