import { useState } from "react";
import { mockCommissions } from "@/data/mockData";
import { MetricCard } from "@/components/MetricCard";
import type { Commission } from "@/types";
import { toast } from "sonner";
import { DollarSign, Clock, CheckCircle } from "lucide-react";

export default function AdminCommissions() {
  const [commissions, setCommissions] = useState<Commission[]>(mockCommissions);

  const pending = commissions.filter((c) => c.status === "PENDING");
  const paid = commissions.filter((c) => c.status === "PAID");
  const pendingTotal = pending.reduce((s, c) => s + c.commissionAmount, 0);
  const paidTotal = paid.reduce((s, c) => s + c.commissionAmount, 0);

  const markAsPaid = (id: string) => {
    setCommissions((prev) => prev.map((c) => (c.id === id ? { ...c, status: "PAID" as const } : c)));
    toast.success("Commission marked as paid");
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Commission Settlement</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and settle rep payouts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <MetricCard title="Total Commissions" value={`$${(pendingTotal + paidTotal).toFixed(2)}`} subtitle={`${commissions.length} total`} icon={<DollarSign className="h-5 w-5" />} />
        <MetricCard title="Pending Settlement" value={`$${pendingTotal.toFixed(2)}`} subtitle={`${pending.length} awaiting payout`} icon={<Clock className="h-5 w-5" />} />
        <MetricCard title="Settled" value={`$${paidTotal.toFixed(2)}`} subtitle={`${paid.length} completed`} icon={<CheckCircle className="h-5 w-5" />} />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">All Commissions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Rep</th>
                <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Shop</th>
                <th className="text-right px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Order Value</th>
                <th className="text-right px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Rep Commission</th>
                <th className="text-right px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Platform Fee</th>
                <th className="text-center px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="text-right px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {commissions.map((c) => (
                <tr key={c.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                  <td className="px-5 py-3 font-medium text-foreground">{c.repName}</td>
                  <td className="px-5 py-3 text-muted-foreground">{c.shopName}</td>
                  <td className="px-5 py-3 text-right text-muted-foreground">${c.totalAmount.toFixed(2)}</td>
                  <td className="px-5 py-3 text-right font-semibold text-foreground">${c.commissionAmount.toFixed(2)}</td>
                  <td className="px-5 py-3 text-right text-muted-foreground">${c.platformFee.toFixed(2)}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      c.status === "PAID" ? "bg-status-success/10 text-status-success" : "bg-status-pending/10 text-status-pending"
                    }`}>{c.status}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {c.status === "PENDING" && (
                      <button
                        onClick={() => markAsPaid(c.id)}
                        className="rounded-md bg-status-success/10 px-3 py-1.5 text-xs font-medium text-status-success hover:bg-status-success/20 transition-colors"
                      >
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
