import { useState } from "react";
import { mockCheckouts } from "@/data/mockData";
import { StatusDot } from "@/components/StatusDot";
import { ShoppingCart, ExternalLink, Clock } from "lucide-react";
import { toast } from "sonner";

export default function Marketplace() {
  const [checkouts, setCheckouts] = useState(mockCheckouts);

  const available = checkouts.filter(
    (c) => c.claimedById === null && c.status === "ABANDONED"
  );

  const handleClaim = (id: string) => {
    setCheckouts((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, claimedById: "u2", claimedAt: new Date().toISOString() } : c
      )
    );
    toast.success("Cart claimed successfully! Check Active Recoveries.");
  };

  const timeSince = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "< 1h ago";
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Marketplace</h1>
          <p className="text-sm text-muted-foreground mt-1">Claim abandoned carts and recover sales</p>
        </div>
        <StatusDot status="live" label="Live • Auto-refreshing" />
      </div>

      {available.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <ShoppingCart className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-foreground font-medium">No carts available</p>
          <p className="text-sm text-muted-foreground mt-1">Check back soon — new carts appear in real-time</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {available
            .sort((a, b) => b.totalPrice - a.totalPrice)
            .map((checkout, i) => (
              <div key={checkout.id} className="glass-card p-5 animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-bold text-foreground">
                        ${checkout.totalPrice.toFixed(2)}
                      </span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                        {checkout.currency}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{checkout.shopName}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {checkout.lineItems.map((item, j) => (
                        <span key={j} className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                          {item.title} × {item.quantity}
                        </span>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {timeSince(checkout.createdAt)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleClaim(checkout.id)}
                    className="shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20"
                  >
                    Claim Cart
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
