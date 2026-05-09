import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, MapPin, Clock, TrendingUp, Users, ToggleLeft, ToggleRight,
  CheckCircle, AlertCircle, RefreshCw, Download, BarChart3,
  Wifi, WifiOff, Star, IndianRupee
} from "lucide-react";
import { hostService, queueService, analyticsService, invoiceService } from "../utils/api";

const StatusBadge = ({ status }) => {
  const map = {
    available: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500", label: "Available" },
    occupied: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500", label: "Occupied" },
    offline: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500", label: "Offline" },
  };
  const s = map[status] || map.offline;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${s.bg} ${s.text}`}>
      <span className={`w-2 h-2 rounded-full ${s.dot}`}></span>
      {s.label}
    </span>
  );
};

const HostDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stations, setStations] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [queue, setQueue] = useState({});
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [togglingStation, setTogglingStation] = useState(null);
  const [completingBooking, setCompletingBooking] = useState(null);

  const fetchData = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const [stationsRes, bookingsRes] = await Promise.all([
        hostService.getMyStations(user.uid),
        hostService.getHostBookings(user.uid),
      ]);
      setStations(stationsRes.data || []);
      setBookings(bookingsRes.data || []);

      // Fetch queue + stats for each station
      const queueData = {};
      const statsData = {};
      await Promise.all(
        (stationsRes.data || []).map(async (s) => {
          const [qRes, statsRes] = await Promise.all([
            queueService.getQueue(s.id).catch(() => ({ data: { queue: [], queueLength: 0 } })),
            analyticsService.getStationStats(s.id).catch(() => ({ data: {} })),
          ]);
          queueData[s.id] = qRes.data;
          statsData[s.id] = statsRes.data;
        })
      );
      setQueue(queueData);
      setStats(statsData);
    } catch (err) {
      console.error("Host dashboard error:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    // Role guard: if user has no host_id relationship, redirect
    if (user === null) { navigate("/login"); return; }
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchData, user, navigate]);

  const handleToggleStatus = async (stationId, currentStatus) => {
    const next = currentStatus === "available" ? "offline" : "available";
    setTogglingStation(stationId);
    try {
      await hostService.updateStationStatus(stationId, next);
      setStations(prev => prev.map(s => s.id === stationId ? { ...s, status: next } : s));
    } catch (err) { alert("Failed to toggle status"); }
    finally { setTogglingStation(null); }
  };

  const handleCompleteBooking = async (bookingId) => {
    setCompletingBooking(bookingId);
    try {
      await queueService.completeBooking(bookingId);
      await fetchData();
    } catch (err) { alert("Failed to complete booking"); }
    finally { setCompletingBooking(null); }
  };

  // Aggregate stats
  const totalRevenue = Object.values(stats).reduce((s, st) => s + parseFloat(st.totalRevenue || 0), 0);
  const totalBookingsToday = Object.values(stats).reduce((s, st) => s + (st.todayBookings || 0), 0);
  const totalQueueLength = Object.values(queue).reduce((s, q) => s + (q.queueLength || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-bold">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (stations.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center px-4">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <MapPin className="text-green-500" size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-900">No Stations Yet</h2>
        <p className="text-slate-500 mt-3 max-w-sm">You don't have any registered stations. Register as a host to start earning.</p>
        <button
          onClick={() => navigate("/become-host")}
          className="mt-8 bg-green-500 text-white px-8 py-4 rounded-2xl font-black hover:bg-green-600 transition-all"
        >
          Register as Host →
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* HEADER */}
      <div className="bg-slate-900 text-white px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Host Portal</p>
              <h1 className="text-3xl font-black mt-1">
                Welcome back, {user?.user_metadata?.full_name || user?.email?.split("@")[0]} 👋
              </h1>
            </div>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-bold transition-all"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {/* QUICK STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { icon: MapPin, label: "Your Stations", value: stations.length, color: "text-green-400" },
              { icon: IndianRupee, label: "Total Revenue", value: `₹${totalRevenue.toFixed(0)}`, color: "text-emerald-400" },
              { icon: Users, label: "Today's Bookings", value: totalBookingsToday, color: "text-blue-400" },
              { icon: Zap, label: "Active Queue", value: totalQueueLength, color: "text-amber-400" },
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 rounded-2xl p-5 border border-white/10">
                <stat.icon className={stat.color} size={20} />
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-3">{stat.label}</p>
                <p className="text-2xl font-black mt-1">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-8">
        {/* TABS */}
        <div className="flex gap-2 mb-8 bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 inline-flex">
          {["overview", "queue", "bookings"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl font-black text-sm capitalize transition-all ${
                activeTab === tab ? "bg-slate-900 text-white shadow" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {stations.map(station => (
              <motion.div
                key={station.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[24px] p-6 shadow-lg shadow-slate-100 border border-slate-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-black text-slate-900 text-lg leading-tight">{station.name}</h3>
                    <p className="text-slate-400 text-sm mt-1 flex items-center gap-1">
                      <MapPin size={12} /> {station.address}
                    </p>
                  </div>
                  <StatusBadge status={station.status} />
                </div>

                <div className="grid grid-cols-2 gap-3 my-4">
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Revenue</p>
                    <p className="text-lg font-black text-slate-900 mt-1">₹{parseFloat(stats[station.id]?.totalRevenue || 0).toFixed(0)}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Bookings</p>
                    <p className="text-lg font-black text-slate-900 mt-1">{stats[station.id]?.totalBookings || 0}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Queue Now</p>
                    <p className="text-lg font-black text-amber-500 mt-1">{queue[station.id]?.queueLength || 0}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Avg Value</p>
                    <p className="text-lg font-black text-slate-900 mt-1">₹{parseFloat(stats[station.id]?.avgSessionValue || 0).toFixed(0)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-sm font-bold text-slate-500">
                    {station.status === "available" ? "Station is Live" : "Station is Offline"}
                  </span>
                  <button
                    onClick={() => handleToggleStatus(station.id, station.status)}
                    disabled={togglingStation === station.id}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all ${
                      station.status === "available"
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-green-50 text-green-600 hover:bg-green-100"
                    }`}
                  >
                    {station.status === "available" ? <WifiOff size={16} /> : <Wifi size={16} />}
                    {station.status === "available" ? "Go Offline" : "Go Live"}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* QUEUE TAB */}
        {activeTab === "queue" && (
          <div className="space-y-8">
            {stations.map(station => {
              const stationQueue = queue[station.id];
              return (
                <div key={station.id} className="bg-white rounded-[24px] p-6 shadow-lg shadow-slate-100 border border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-black text-slate-900 text-xl">{station.name}</h3>
                      <p className="text-slate-400 text-sm mt-1">{stationQueue?.queueLength || 0} in queue · {stationQueue?.currentlyCharging || 0} charging now</p>
                    </div>
                    <StatusBadge status={station.status} />
                  </div>

                  {(!stationQueue?.queue || stationQueue.queue.length === 0) ? (
                    <div className="text-center py-10 text-slate-400">
                      <CheckCircle className="mx-auto mb-3 text-green-300" size={40} />
                      <p className="font-bold">No active bookings. Station is free!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {stationQueue.queue.map((booking, i) => (
                        <div key={booking.id} className={`flex items-center justify-between p-4 rounded-2xl border ${
                          booking.isCurrentlyCharging
                            ? "bg-green-50 border-green-200"
                            : "bg-slate-50 border-slate-100"
                        }`}>
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                              booking.isCurrentlyCharging ? "bg-green-500 text-white" : "bg-slate-200 text-slate-600"
                            }`}>
                              {i + 1}
                            </div>
                            <div>
                              <p className="font-black text-slate-900">{booking.userName}</p>
                              <p className="text-xs text-slate-400">
                                {new Date(booking.start_time).toLocaleTimeString()} →{" "}
                                {new Date(booking.end_time).toLocaleTimeString()}
                                {booking.isCurrentlyCharging && (
                                  <span className="ml-2 text-green-600 font-bold">· {booking.remainingMinutes} min left</span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {booking.total_amount && (
                              <span className="text-sm font-black text-slate-700">₹{booking.total_amount}</span>
                            )}
                            {booking.isCurrentlyCharging && (
                              <button
                                onClick={() => handleCompleteBooking(booking.id)}
                                disabled={completingBooking === booking.id}
                                className="bg-green-500 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-green-600 transition-all flex items-center gap-1"
                              >
                                <CheckCircle size={14} />
                                {completingBooking === booking.id ? "..." : "Done"}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === "bookings" && (
          <div className="bg-white rounded-[24px] shadow-lg shadow-slate-100 border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-xl">Recent Bookings</h3>
              <p className="text-slate-400 text-sm mt-1">All bookings across your stations (last 50)</p>
            </div>
            <div className="divide-y divide-slate-50">
              {bookings.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <BarChart3 className="mx-auto mb-3" size={40} />
                  <p className="font-bold">No bookings yet</p>
                </div>
              ) : (
                bookings.map(booking => (
                  <div key={booking.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                        <Zap size={18} className="text-green-500" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-sm">{booking.station?.name}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(booking.start_time).toLocaleDateString()} · {booking.status}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-black px-3 py-1 rounded-full ${
                        booking.status === "completed" ? "bg-green-100 text-green-700"
                          : booking.status === "active" ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {booking.status}
                      </span>
                      {booking.total_amount && (
                        <span className="font-black text-slate-900">₹{booking.total_amount}</span>
                      )}
                      {(booking.status === "completed" || booking.status === "active") && (
                        <a
                          href={invoiceService.downloadInvoice(booking.id)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-black transition-all"
                        >
                          <Download size={12} /> Invoice
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HostDashboard;