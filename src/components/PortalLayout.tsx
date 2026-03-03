import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useSimpleAuth } from "@/contexts/SimpleAuthContext";
import { ShoppingCart, LayoutDashboard, Users, DollarSign, Zap, LogOut, Activity, TrendingUp, Store } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function PortalLayout() {
  const { user, logout } = useSimpleAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "PLATFORM_ADMIN";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const adminLinks = [
    { to: "/portal/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
    { to: "/portal/admin/analytics", icon: TrendingUp, label: "Analytics", end: false },
    { to: "/portal/admin/stores", icon: Store, label: "Stores", end: false },
    { to: "/portal/admin/reps", icon: Users, label: "Rep Management", end: false },
    { to: "/portal/admin/commissions", icon: DollarSign, label: "Commissions", end: false },
  ];

  const repLinks = [
    { to: "/portal/rep", icon: ShoppingCart, label: "Marketplace", end: true },
    { to: "/portal/rep/active", icon: Activity, label: "Active Recoveries", end: false },
    { to: "/portal/rep/earnings", icon: DollarSign, label: "Earnings", end: false },
  ];

  const links = isAdmin ? adminLinks : repLinks;

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  return (
    <div className="flex min-h-screen">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md bg-card border border-border text-foreground"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-sidebar
        transform transition-transform duration-200 ease-in-out
        lg:relative lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="flex items-center gap-2.5 px-6 py-5 border-b border-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-base font-bold tracking-tight text-foreground">ReboundCart</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                }`
              }
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* User Section - Fixed at Bottom */}
        <div className="border-t border-border bg-sidebar p-4 mt-auto">
          <div className="flex items-center gap-3">
            {/* User Avatar */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            
            {/* User Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.role === "PLATFORM_ADMIN" ? "Administrator" : "Sales Representative"}</p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              {/* Theme Toggle */}
              <div className="p-1 rounded hover:bg-sidebar-accent/50 transition-colors">
                <ThemeToggle />
              </div>
              
              {/* Logout Button */}
              <button 
                onClick={handleLogout} 
                className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 group"
                title="Logout"
              >
                <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
          
          {/* Additional User Info */}
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Session Active</span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Online
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 min-h-screen">
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
