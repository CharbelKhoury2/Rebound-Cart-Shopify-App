import { mockCheckouts, mockCommissions, mockUsers } from "@/data/mockData";
import { MetricCard } from "@/components/MetricCard";
import { StatusDot } from "@/components/StatusDot";
import { DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const totalRecovered = mockCheckouts.filter((c) => c.status === "RECOVERED").length;
  const totalRevenue = mockCommissions.reduce((s, c) => s + c.totalAmount, 0);
  const platformRevenue = mockCommissions.reduce((s, c) => s + c.platformFee, 0);
  const pendingPayout = mockCommissions.filter((c) => c.status === "PENDING").reduce((s, c) => s + c.commissionAmount, 0);
  const activeReps = mockUsers.filter((u) => u.role === "SALES_REP" && u.status === "ACTIVE").length;
  const pendingReps = mockUsers.filter((u) => u.status === "PENDING").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Platform Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Global performance overview</p>
        </div>
        <StatusDot status="live" label="Live" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Total Recovered Revenue" value={`$${totalRevenue.toLocaleString()}`} subtitle={`${totalRecovered} recoveries`} icon={<TrendingUp className="h-5 w-5" />} />
        <MetricCard title="Platform Revenue" value={`$${platformRevenue.toFixed(2)}`} subtitle="Net fees earned" icon={<DollarSign className="h-5 w-5" />} />
        <MetricCard title="Platform Debt" value={`$${pendingPayout.toFixed(2)}`} subtitle="Pending rep payouts" icon={<ShoppingCart className="h-5 w-5" />} />
        <MetricCard title="Active Reps" value={String(activeReps)} subtitle={pendingReps > 0 ? `${pendingReps} pending approval` : "All approved"} icon={<Users className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Recent Recoveries</h2>
          </div>
          <div className="divide-y divide-border/50">
            {mockCheckouts
              .filter((c) => c.status === "RECOVERED")
              .map((c) => (
                <div key={c.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{c.shopName}</p>
                    <p className="text-xs text-muted-foreground">{c.customerEmail}</p>
                  </div>
                  <span className="text-sm font-bold text-status-success">${c.totalPrice.toFixed(2)}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Recent Commissions</h2>
          </div>
          <div className="divide-y divide-border/50">
            {mockCommissions.slice(0, 4).map((c) => (
              <div key={c.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{c.repName}</p>
                  <p className="text-xs text-muted-foreground">{c.shopName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">${c.commissionAmount.toFixed(2)}</p>
                  <span className={`text-xs ${c.status === "PAID" ? "text-status-success" : "text-status-pending"}`}>{c.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
