import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Send, CheckCircle } from "lucide-react";
import { reviewService } from "../../utils/api";

const LABELS = ["Terrible", "Poor", "Okay", "Good", "Excellent"];

const RatingModal = ({ booking, userId, onClose, onSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill if already reviewed
  useEffect(() => {
    reviewService.getForBooking(booking.id).then(({ data }) => {
      if (data) {
        setRating(data.rating);
        setFeedback(data.feedback || "");
        setDone(true);
      }
    }).catch(() => {});
  }, [booking.id]);

  const handleSubmit = async () => {
    if (rating === 0) { setError("Please select a star rating."); return; }

    // Resolve IDs — prefer prop, fall back to booking fields
    const resolvedUserId = userId || booking.user_id;
    const resolvedStationId = booking.station_id;
    const resolvedBookingId = booking.id;

    if (!resolvedBookingId || !resolvedStationId || !resolvedUserId) {
      console.error("Missing fields:", { resolvedBookingId, resolvedStationId, resolvedUserId });
      setError("Missing booking info. Please refresh and try again.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      await reviewService.submit({
        booking_id: resolvedBookingId,
        station_id: resolvedStationId,
        user_id: resolvedUserId,
        rating,
        feedback: feedback.trim() || null,
      });
      setDone(true);
      if (onSubmitted) onSubmitted(booking.id);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to submit. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const active = hovered || rating;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          initial={{ scale: 0.85, y: 40, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.85, y: 40, opacity: 0 }}
          transition={{ type: "spring", damping: 22, stiffness: 300 }}
        >
          {/* Gradient header */}
          <div className="relative bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 px-6 pt-8 pb-14 text-white text-center">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/20 hover:bg-white/30 transition-all"
            >
              <X size={18} />
            </button>
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Star size={28} className="text-yellow-300 fill-yellow-300" />
            </div>
            <h2 className="text-xl font-black">Rate Your Ride</h2>
            <p className="text-white/80 text-sm mt-1 font-medium">
              {booking.station?.name || "Charging Session"}
            </p>
          </div>

          {/* Body */}
          <div className="px-6 pb-8 -mt-6 relative">
            <div className="bg-white rounded-2xl shadow-lg shadow-slate-100 p-5 border border-slate-100">
              {done ? (
                /* Already submitted view */
                <div className="text-center py-4">
                  <CheckCircle className="mx-auto text-emerald-500 mb-3" size={44} />
                  <p className="font-black text-slate-900 text-lg">Review Submitted!</p>
                  <p className="text-slate-500 text-sm mt-1">Thank you for your feedback.</p>
                  {/* Show the submitted stars */}
                  <div className="flex justify-center gap-1 mt-4">
                    {[1,2,3,4,5].map(s => (
                      <Star
                        key={s}
                        size={26}
                        className={s <= rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200 fill-slate-200"}
                      />
                    ))}
                  </div>
                  {feedback && (
                    <p className="mt-3 text-sm text-slate-600 italic bg-slate-50 rounded-xl p-3">
                      "{feedback}"
                    </p>
                  )}
                </div>
              ) : (
                <>
                  {/* Star picker */}
                  <p className="text-center text-sm font-bold text-slate-500 mb-3 uppercase tracking-widest">
                    How was your experience?
                  </p>
                  <div className="flex justify-center gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <motion.button
                        key={s}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onMouseEnter={() => setHovered(s)}
                        onMouseLeave={() => setHovered(0)}
                        onClick={() => setRating(s)}
                        className="focus:outline-none"
                        aria-label={`${s} star${s > 1 ? "s" : ""}`}
                      >
                        <Star
                          size={38}
                          className={`transition-colors duration-150 ${
                            s <= active
                              ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]"
                              : "text-slate-200 fill-slate-200"
                          }`}
                        />
                      </motion.button>
                    ))}
                  </div>

                  {/* Label */}
                  <motion.p
                    key={active}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center font-black text-emerald-600 text-sm h-5 mb-5"
                  >
                    {active ? LABELS[active - 1] : ""}
                  </motion.p>

                  {/* Feedback textarea */}
                  <div className="relative">
                    <textarea
                      id="rating-feedback"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Share details about your experience (optional)..."
                      rows={3}
                      maxLength={300}
                      className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all placeholder-slate-400 bg-slate-50"
                    />
                    <span className="absolute bottom-3 right-4 text-[10px] text-slate-400 font-bold">
                      {feedback.length}/300
                    </span>
                  </div>

                  {error && (
                    <p className="text-red-500 text-xs font-bold mt-2 text-center">{error}</p>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="mt-5 w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white font-black py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all disabled:opacity-60"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </span>
                    ) : (
                      <>
                        <Send size={16} /> Submit Feedback
                      </>
                    )}
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RatingModal;
