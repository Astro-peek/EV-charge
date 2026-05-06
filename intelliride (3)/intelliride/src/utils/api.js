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
  getBookings: () => api.get("/bookings"),
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

  // Direct Supabase Option
  getStationsSupabase: async () => {
    const { data, error } = await supabase.from('stations').select('*');
    return { data, error };
  }
};

export default api;
