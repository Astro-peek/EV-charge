import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  // Not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Logged in but admin trying to access user page
  if (user.role === "admin") {
    return <Navigate to="/admin" />;
  }

  return children;
};

export default ProtectedRoute;