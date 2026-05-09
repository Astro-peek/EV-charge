import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user } = useAuth();

  // Not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Not admin
  if (user.role !== "admin") {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default AdminRoute;