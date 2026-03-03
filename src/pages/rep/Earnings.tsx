import { mockCommissions } from "@/data/mockData";
import { MetricCard } from "@/components/MetricCard";
import { DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react";

export default function Earnings() {
  const myCommissions = mockCommissions.filter((c) => c.repId === "u2");
  const totalEarned = myCommissions.reduce((s, c) => s + c.commissionAmount, 0);
  const pending = myCommissions.filter((c) => c.status === "PENDING");
  const paid = myCommissions.filter((c) => c.status === "PAID");
  const pendingAmount = pending.reduce((s, c) => s + c.commissionAmount, 0);
  const paidAmount = paid.reduce((s, c) => s + c.commissionAmount, 0);

  return (
    <div className="overflow-hidden">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Earnings</h1>
        <p className="text-sm text-muted-foreground mt-1">Track your commissions and payouts</p>
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
              {myCommissions.map((c) => (
                <tr key={c.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                  <td className="px-5 py-3 font-medium text-foreground whitespace-nowrap">{c.shopName}</td>
                  <td className="px-5 py-3 text-right text-muted-foreground whitespace-nowrap">${c.totalAmount.toFixed(2)}</td>
                  <td className="px-5 py-3 text-right font-semibold text-foreground whitespace-nowrap">${c.commissionAmount.toFixed(2)}</td>
                  <td className="px-5 py-3 text-center whitespace-nowrap">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      c.status === "PAID"
                        ? "bg-status-success/10 text-status-success"
                        : "bg-status-pending/10 text-status-pending"
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-muted-foreground whitespace-nowrap">{c.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
