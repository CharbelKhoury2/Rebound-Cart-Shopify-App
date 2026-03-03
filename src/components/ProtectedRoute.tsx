import { Navigate, Outlet } from "react-router-dom";
import { useSimpleAuth } from "@/contexts/SimpleAuthContext";
import type { UserRole } from "@/types";

export default function ProtectedRoute({ role }: { role: UserRole }) {
  const { user, isLoading } = useSimpleAuth();
  
  console.log('🛡️ ProtectedRoute check:', { user: user?.email, userRole: user?.role, requiredRole: role, isLoading });
  
  if (isLoading) {
    console.log('🛡️ ProtectedRoute: Still loading...');
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--gradient-surface)" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    console.log('🛡️ ProtectedRoute: No user, redirecting to login');
    return <Navigate to="/auth/login" replace />;
  }
  
  if (user.role !== role) {
    console.log('🛡️ ProtectedRoute: Role mismatch, redirecting user:', user.role);
    return <Navigate to={user.role === "PLATFORM_ADMIN" ? "/portal/admin" : "/portal/rep"} replace />;
  }
  
  console.log('🛡️ ProtectedRoute: Access granted for:', user.email);
  return <Outlet />;
}
