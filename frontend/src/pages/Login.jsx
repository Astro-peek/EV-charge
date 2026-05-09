import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase";
import Button from "../components/common/Button";

const Login = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if logged in
  useEffect(() => {
    if (user) {
      navigate(user.role === "admin" ? "/admin" : "/dashboard");
    }
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });
      if (error) throw error;
    } catch (err) {
      setError("Google login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert("Check your email for the confirmation link!");
      } else {
        const { error } = await login(email, password);
        if (error) throw error;
      }
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* LEFT SIDE (Branding) */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-green-500 to-green-700 text-white items-center justify-center p-10">
        <div className="max-w-md">
          <h1 className="text-5xl font-black leading-tight">
            Welcome to IntelliRide ⚡
          </h1>
          <p className="mt-6 text-lg text-green-100">
            Plan EV journeys, find charging stations, and book slots instantly with smart AI-powered routing.
          </p>
          <div className="mt-10 space-y-4 text-green-100 font-medium">
            <p>✔ Smart Trip Planning</p>
            <p>✔ Real-time Charging Stations</p>
            <p>✔ Instant Slot Booking</p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE (FORM) */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-black text-green-600 mb-6 text-center">IntelliRide</h1>

          <div className="bg-white shadow-2xl border border-gray-100 rounded-3xl p-8 space-y-6">
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setIsSignup(false)}
                className={`w-1/2 py-2 rounded-xl font-semibold transition-all ${!isSignup ? "bg-white shadow-sm text-green-600" : "text-gray-500"}`}
              >
                Login
              </button>
              <button
                onClick={() => setIsSignup(true)}
                className={`w-1/2 py-2 rounded-xl font-semibold transition-all ${isSignup ? "bg-white shadow-sm text-green-600" : "text-gray-500"}`}
              >
                Sign Up
              </button>
            </div>

            <Button
              onClick={handleGoogleLogin}
              variant="secondary"
              className="w-full"
              disabled={loading}
              icon={() => <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />}
            >
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200"></span></div>
              <div className="relative flex justify-center text-sm uppercase"><span className="px-2 bg-white text-gray-400">Or continue with email</span></div>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <input
                type="email"
                placeholder="Email address"
                required
                className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition"
                onChange={(e) => setEmail(e.target.value.trim())}
              />
              <input
                type="password"
                placeholder="Password"
                required
                className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition"
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Processing..." : isSignup ? "Create Account" : "Login"}
              </Button>
            </form>
          </div>
          <p className="text-center text-gray-400 text-sm mt-6">By continuing, you agree to IntelliRide terms.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;