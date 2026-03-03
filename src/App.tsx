import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import PortalLayout from "@/components/PortalLayout";
import LoginPage from "@/pages/LoginPage";
import Marketplace from "@/pages/rep/Marketplace";
import ActiveRecoveries from "@/pages/rep/ActiveRecoveries";
import Earnings from "@/pages/rep/Earnings";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import RepManagement from "@/pages/admin/RepManagement";
import AdminCommissions from "@/pages/admin/AdminCommissions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/auth/login" replace />} />
            <Route path="/auth/login" element={<LoginPage />} />

            {/* Sales Rep Portal */}
            <Route element={<ProtectedRoute role="SALES_REP" />}>
              <Route element={<PortalLayout />}>
                <Route path="/portal/rep" element={<Marketplace />} />
                <Route path="/portal/rep/active" element={<ActiveRecoveries />} />
                <Route path="/portal/rep/earnings" element={<Earnings />} />
              </Route>
            </Route>

            {/* Admin Portal */}
            <Route element={<ProtectedRoute role="PLATFORM_ADMIN" />}>
              <Route element={<PortalLayout />}>
                <Route path="/portal/admin" element={<AdminDashboard />} />
                <Route path="/portal/admin/reps" element={<RepManagement />} />
                <Route path="/portal/admin/commissions" element={<AdminCommissions />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
