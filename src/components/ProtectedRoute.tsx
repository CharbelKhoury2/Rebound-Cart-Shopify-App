import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/types";

export default function ProtectedRoute({ role }: { role: UserRole }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth/login" replace />;
  if (user.role !== role) {
    return <Navigate to={user.role === "PLATFORM_ADMIN" ? "/portal/admin" : "/portal/rep"} replace />;
  }
  return <Outlet />;
}
