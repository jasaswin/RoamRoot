import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Skeleton } from "./Skeleton";

// Only logged-in users can see the page. Others are sent to /login and come back afterwards.
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="container-page py-20"><Skeleton className="h-64 w-full" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  return children;
}

// Only users with one of the roles can see the page. (The backend checks roles again on every request.)
export function RoleRoute({ roles, children }) {
  const { currentUser } = useAuth();
  if (!roles.includes(currentUser?.role)) return <Navigate to="/" replace />;
  return children;
}
