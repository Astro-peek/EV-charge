import axios from "axios";
import { supabase } from "../supabase";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor for adding Auth Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const agentService = {
  orchestrate: (query) => api.post("/agent/orchestrate", { query }),
};

export const bookingService = {
  // Using Express Backend
  getBookings: (userId) => api.get("/bookings", { params: { userId } }),
  createBooking: (data) => api.post("/bookings", data),
  
  // Direct Supabase Option
  getBookingsSupabase: async (userId) => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, stations(*)')
      .eq('user_id', userId);
    return { data, error };
  }
};

export const stationService = {
  // Using Express Backend
  getStations: () => api.get("/stations"),
  getStationById: (id) => api.get(`/stations/${id}`),
  createStation: (data) => api.post("/stations", data),

  // Direct Supabase Option
  getStationsSupabase: async () => {
    const { data, error } = await supabase.from('stations').select('*');
    return { data, error };
  }
};

export const paymentService = {
  createOrder: (amount, bookingId) => api.post("/payments/create-order", { amount, bookingId }),
  verifyPayment: (data) => api.post("/payments/verify", data),
};

export const analyticsService = {
  getWaitTime: (stationId) => api.get(`/analytics/wait-time/${stationId}`),
  getStationStats: (stationId) => api.get(`/analytics/station-stats/${stationId}`),
};

export const queueService = {
  getQueue: (stationId) => api.get(`/queue/${stationId}`),
  getOccupancy: (stationId) => api.get(`/queue/occupancy/${stationId}`),
  completeBooking: (bookingId) => api.patch(`/queue/complete/${bookingId}`),
};

export const invoiceService = {
  downloadInvoice: (bookingId) => `${API_BASE_URL}/invoices/${bookingId}`,
  getPreview: (bookingId) => api.get(`/invoices/booking/${bookingId}/preview`),
};

export const tripService = {
  plan: (data) => api.post("/trips/plan", data),
  reroute: (data) => api.post("/trips/reroute", data),
};

export const hostService = {
  getMyStations: (hostId) => api.get(`/stations/my?hostId=${hostId}`),
  updateStationStatus: (stationId, status) => api.patch(`/stations/${stationId}/status`, { status }),
  getHostBookings: (hostId) => api.get(`/bookings/host/${hostId}`),
};

export default api;
