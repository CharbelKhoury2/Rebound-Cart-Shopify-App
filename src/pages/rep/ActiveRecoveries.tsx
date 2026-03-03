import { mockCheckouts } from "@/data/mockData";
import { StatusDot } from "@/components/StatusDot";
import { ExternalLink, Copy, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function ActiveRecoveries() {
  const myCheckouts = mockCheckouts.filter((c) => c.claimedById === "u2");
  const active = myCheckouts.filter((c) => c.status === "ABANDONED");
  const recovered = myCheckouts.filter((c) => c.status === "RECOVERED");

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Recovery link copied to clipboard!");
  };

  return (
    <div className="overflow-hidden">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Active Recoveries</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your claimed carts and send recovery links</p>
      </div>

      <div className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
          <StatusDot status="live" /> In Progress ({active.length})
        </h2>
        <div className="grid gap-3">
          {active.map((c) => (
            <div key={c.id} className="glass-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-foreground">{c.shopName}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{c.customerEmail}</p>
                  <p className="text-lg font-bold text-foreground mt-2">${c.totalPrice.toFixed(2)}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {c.lineItems.map((item, j) => (
                      <span key={j} className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                        {item.title} × {item.quantity}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => copyLink(c.checkoutUrl)}
                    className="flex items-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground hover:bg-accent transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5" /> Copy Link
                  </button>
                  <a
                    href={c.checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Open
                  </a>
                </div>
              </div>
            </div>
          ))}
          {active.length === 0 && (
            <p className="text-sm text-muted-foreground py-4">No active recoveries. Claim carts from the Marketplace!</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
          <CheckCircle className="h-3.5 w-3.5 text-status-success" /> Recovered ({recovered.length})
        </h2>
        <div className="grid gap-3">
          {recovered.map((c) => (
            <div key={c.id} className="glass-card p-5 opacity-70">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">{c.shopName}</p>
                  <p className="text-sm text-muted-foreground">{c.customerEmail}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-status-success">${c.totalPrice.toFixed(2)}</p>
                  <StatusDot status="recovered" label="Recovered" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
