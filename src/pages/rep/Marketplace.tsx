import { useState, useEffect } from "react";
import { mockCheckouts } from "@/data/mockData";
import { StatusDot } from "@/components/StatusDot";
import { ShoppingCart, ExternalLink, Clock, TrendingUp, Target, Zap } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Marketplace() {
  const [checkouts, setCheckouts] = useState(mockCheckouts);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const available = checkouts.filter(
    (c) => c.claimedById === null && c.status === "ABANDONED"
  );

  const myCheckouts = checkouts.filter((c) => c.claimedById === "u2");
  const totalValue = available.reduce((sum, c) => sum + c.totalPrice, 0);
  const avgValue = available.length > 0 ? totalValue / available.length : 0;

  // Sample performance data
  const performanceData = [
    { time: '12:00', available: 12, claimed: 3 },
    { time: '14:00', available: 15, claimed: 5 },
    { time: '16:00', available: 8, claimed: 7 },
    { time: '18:00', available: 11, claimed: 4 },
    { time: '20:00', available: 14, claimed: 6 },
  ];

  // Auto-refresh simulation
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      // Simulate new carts appearing
      const newCart = {
        id: `new-${Date.now()}`,
        shopName: "New Store",
        customerEmail: `customer${Date.now()}@email.com`,
        totalPrice: Math.random() * 500 + 100,
        currency: "USD",
        checkoutUrl: "https://example.com/checkout",
        status: "ABANDONED" as const,
        claimedById: null,
        claimedAt: null,
        createdAt: new Date().toISOString(),
        lineItems: [{ title: "Sample Product", quantity: 1, price: 150 }],
      };
      
      setCheckouts(prev => [newCart, ...prev.slice(0, 19)]);
      toast.info("New cart available!");
    }, 15000); // Every 15 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

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
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              autoRefresh 
                ? "bg-status-success/10 text-status-success" 
                : "bg-muted text-muted-foreground"
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
          </button>
          <StatusDot status="live" label={autoRefresh ? "Live • Auto-refreshing" : "Paused"} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <ShoppingCart className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Available</p>
              <p className="text-lg font-bold text-foreground">{available.length}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-status-success/10">
              <TrendingUp className="h-4 w-4 text-status-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Value</p>
              <p className="text-lg font-bold text-foreground">${totalValue.toFixed(0)}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-status-warning/10">
              <Target className="h-4 w-4 text-status-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Value</p>
              <p className="text-lg font-bold text-foreground">${avgValue.toFixed(0)}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">My Active</p>
              <p className="text-lg font-bold text-foreground">{myCheckouts.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="glass-card p-6 mb-8">
        <h2 className="text-sm font-semibold text-foreground mb-4">Today's Activity</h2>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="time" stroke="var(--muted-foreground)" fontSize={12} />
            <YAxis stroke="var(--muted-foreground)" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--card)', 
                border: '1px solid var(--border)',
                borderRadius: '8px'
              }}
            />
            <Line type="monotone" dataKey="available" stroke="var(--primary)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="claimed" stroke="var(--status-success)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
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
