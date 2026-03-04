import { useEffect, useState } from "react";
import { apiService } from "@/services/api";
import { useSimpleAuth } from "@/contexts/SimpleAuthContext";
import { MetricCard } from "@/components/MetricCard";
import { StatusDot } from "@/components/StatusDot";
import { DollarSign, TrendingUp, Clock, CheckCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Earnings() {
  const { user } = useSimpleAuth();
  const [commissions, setCommissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadCommissions = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const data = await apiService.getRepCommissions(user.id);
      setCommissions(data);
    } catch (error) {
      console.error("Failed to load commissions:", error);
      toast.error("Failed to load your earnings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCommissions();
  }, [user]);

  const totalEarned = commissions.reduce((s, c) => s + Number(c.commissionAmount), 0);
  const pending = commissions.filter((c) => c.status === "PENDING");
  const paid = commissions.filter((c) => c.status === "PAID");
  const pendingAmount = pending.reduce((s, c) => s + Number(c.commissionAmount), 0);
  const paidAmount = paid.reduce((s, c) => s + Number(c.commissionAmount), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-10 w-10 mx-auto text-primary animate-spin mb-3" />
          <p className="text-foreground font-medium">Loading your earnings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Earnings</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your commissions and payouts</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            setIsRefreshing(true);
            await loadCommissions();
            setIsRefreshing(false);
          }}
          disabled={isRefreshing || isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <MetricCard title="Total Earned" value={`$${totalEarned.toFixed(2)}`} subtitle="All time" icon={<DollarSign className="h-5 w-5" />} />
        <MetricCard title="Pending Payout" value={`$${pendingAmount.toFixed(2)}`} subtitle={`${pending.length} pending`} icon={<Clock className="h-5 w-5" />} />
        <MetricCard title="Paid Out" value={`$${paidAmount.toFixed(2)}`} subtitle={`${paid.length} completed`} icon={<CheckCircle className="h-5 w-5" />} />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Commission History</h2>
        </div>
        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">Shop</th>
                <th className="text-right px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">Order Value</th>
                <th className="text-right px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">Your Commission</th>
                <th className="text-center px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">Status</th>
                <th className="text-right px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">Date</th>
              </tr>
            </thead>
            <tbody>
              {commissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                    No commission records found.
                  </td>
                </tr>
              ) : (
                commissions.map((c) => (
                  <tr key={c.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                    <td className="px-5 py-3 font-medium text-foreground whitespace-nowrap">{c.shopName}</td>
                    <td className="px-5 py-3 text-right text-muted-foreground whitespace-nowrap">${Number(c.totalAmount).toFixed(2)}</td>
                    <td className="px-5 py-3 text-right font-semibold text-foreground whitespace-nowrap">${Number(c.commissionAmount).toFixed(2)}</td>
                    <td className="px-5 py-3 text-center whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${c.status === "PAID"
                        ? "bg-status-success/10 text-status-success"
                        : "bg-status-pending/10 text-status-pending"
                        }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-muted-foreground whitespace-nowrap">{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
