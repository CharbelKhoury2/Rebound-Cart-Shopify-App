import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import PortalLayout from "@/components/PortalLayout";
import LoginPage from "@/pages/LoginPage";
import Marketplace from "@/pages/rep/Marketplace";
import ActiveRecoveries from "@/pages/rep/ActiveRecoveries";
import Earnings from "@/pages/rep/Earnings";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import Analytics from "@/pages/admin/Analytics";
import RepManagement from "@/pages/admin/RepManagement";
import AdminCommissions from "@/pages/admin/AdminCommissions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
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
                  <Route path="/portal/admin/analytics" element={<Analytics />} />
                  <Route path="/portal/admin/reps" element={<RepManagement />} />
                  <Route path="/portal/admin/commissions" element={<AdminCommissions />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
