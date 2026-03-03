import { useState } from "react";
import { mockCommissions } from "@/data/mockData";
import { MetricCard } from "@/components/MetricCard";
import type { Commission } from "@/types";
import { toast } from "sonner";
import { DollarSign, Clock, CheckCircle, Download, Search, CheckSquare } from "lucide-react";

export default function AdminCommissions() {
  const [commissions, setCommissions] = useState<Commission[]>(mockCommissions);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCommissions, setSelectedCommissions] = useState<string[]>([]);

  const pending = commissions.filter((c) => c.status === "PENDING");
  const paid = commissions.filter((c) => c.status === "PAID");
  const pendingTotal = pending.reduce((s, c) => s + c.commissionAmount, 0);
  const paidTotal = paid.reduce((s, c) => s + c.commissionAmount, 0);

  // Filter commissions based on search
  const filteredCommissions = commissions.filter((commission) => {
    const matchesSearch = searchTerm === "" || 
      commission.repName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commission.shopName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const toggleSelection = (id: string) => {
    setSelectedCommissions(prev => 
      prev.includes(id) 
        ? prev.filter(commissionId => commissionId !== id)
        : [...prev, id]
    );
  };

  const toggleAllSelections = () => {
    const pendingIds = filteredCommissions
      .filter(c => c.status === "PENDING")
      .map(c => c.id);
    
    if (selectedCommissions.length === pendingIds.length) {
      setSelectedCommissions([]);
    } else {
      setSelectedCommissions(pendingIds);
    }
  };

  const markSelectedAsPaid = () => {
    if (selectedCommissions.length === 0) {
      toast.error("No commissions selected");
      return;
    }

    setCommissions((prev) => 
      prev.map((c) => 
        selectedCommissions.includes(c.id) 
          ? { ...c, status: "PAID" as const } 
          : c
      )
    );
    
    toast.success(`${selectedCommissions.length} commission(s) marked as paid`);
    setSelectedCommissions([]);
  };

  const markAsPaid = (id: string) => {
    setCommissions((prev) => prev.map((c) => (c.id === id ? { ...c, status: "PAID" as const } : c)));
    toast.success("Commission marked as paid");
  };

  const exportToCSV = () => {
    const headers = ["Rep Name", "Shop", "Order Value", "Commission", "Platform Fee", "Status", "Date"];
    const csvData = filteredCommissions.map(c => [
      c.repName,
      c.shopName,
      c.totalAmount.toFixed(2),
      c.commissionAmount.toFixed(2),
      c.platformFee.toFixed(2),
      c.status,
      c.createdAt
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `commissions-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success("Commission data exported successfully");
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
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">All Commissions</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search commissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-md border border-border bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm w-64"
              />
            </div>
            {selectedCommissions.length > 0 && (
              <button
                onClick={markSelectedAsPaid}
                className="flex items-center gap-2 px-3 py-2 rounded-md bg-status-success/10 text-status-success hover:bg-status-success/20 transition-colors text-sm"
              >
                <CheckSquare className="h-4 w-4" />
                Mark {selectedCommissions.length} as Paid
              </button>
            )}
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-secondary text-foreground hover:bg-accent transition-colors text-sm"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>
        {searchTerm && (
          <div className="px-5 py-2 text-xs text-muted-foreground border-b border-border">
            Showing {filteredCommissions.length} of {commissions.length} commissions
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={selectedCommissions.length === filteredCommissions.filter(c => c.status === "PENDING").length && filteredCommissions.filter(c => c.status === "PENDING").length > 0}
                    onChange={toggleAllSelections}
                    className="rounded border-border bg-secondary text-primary focus:ring-primary/50"
                  />
                </th>
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
              {filteredCommissions.map((c) => (
                <tr key={c.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                  <td className="px-5 py-3">
                    {c.status === "PENDING" && (
                      <input
                        type="checkbox"
                        checked={selectedCommissions.includes(c.id)}
                        onChange={() => toggleSelection(c.id)}
                        className="rounded border-border bg-secondary text-primary focus:ring-primary/50"
                      />
                    )}
                  </td>
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
