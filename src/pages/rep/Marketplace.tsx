import { useState, useEffect, useMemo } from "react";
import { mockCheckouts } from "@/data/mockData";
import { StatusDot } from "@/components/StatusDot";
import { CartScoring, CartScoreComparison } from "@/components/rep/CartScoring";
import { ShoppingCart, ExternalLink, Clock, TrendingUp, Target, Zap, Filter, SortAsc, SortDesc, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Marketplace() {
  const [checkouts, setCheckouts] = useState(mockCheckouts);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [showComparison, setShowComparison] = useState(false);

  const available = checkouts.filter(
    (c) => c.claimedById === null && c.status === "ABANDONED"
  );

  const myCheckouts = checkouts.filter((c) => c.claimedById === "u2");
  const totalValue = available.reduce((sum, c) => sum + c.totalPrice, 0);
  const avgValue = available.length > 0 ? totalValue / available.length : 0;

  // Enhanced filtering and sorting
  const filteredAndSortedCarts = useMemo(() => {
    let filtered = available.filter(cart => {
      // Search filter
      const matchesSearch = searchTerm === "" || 
        cart.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cart.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Value range filter
      const cartValue = cart.totalPrice;
      const matchesMinValue = minValue === "" || cartValue >= parseFloat(minValue);
      const matchesMaxValue = maxValue === "" || cartValue <= parseFloat(maxValue);
      
      return matchesSearch && matchesMinValue && matchesMaxValue;
    });

    // Score filter
    if (scoreFilter !== "all") {
      filtered = filtered.filter(cart => {
        const score = calculateCartScore(cart);
        if (scoreFilter === "excellent") return score >= 80;
        if (scoreFilter === "good") return score >= 60 && score < 80;
        if (scoreFilter === "fair") return score >= 40 && score < 60;
        if (scoreFilter === "low") return score < 40;
        return true;
      });
    }

    // Sorting
    return filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "score":
          aValue = calculateCartScore(a);
          bValue = calculateCartScore(b);
          break;
        case "value":
          aValue = a.totalPrice;
          bValue = b.totalPrice;
          break;
        case "time":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case "items":
          aValue = a.lineItems.length;
          bValue = b.lineItems.length;
          break;
        default:
          aValue = calculateCartScore(a);
          bValue = calculateCartScore(b);
      }
      
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    });
  }, [available, searchTerm, sortBy, sortOrder, minValue, maxValue, scoreFilter]);

  // Calculate cart score function
  const calculateCartScore = (cart: any) => {
    const avgOrderValue = 250; // Mock average order value
    const priceScore = Math.min(100, (cart.totalPrice / avgOrderValue) * 80);
    const timeScore = Math.max(0, 100 - (Date.now() - new Date(cart.createdAt).getTime()) / (1000 * 60 * 120)); // 2 hours = 0 score
    const itemScore = cart.lineItems.length === 1 ? 60 : cart.lineItems.length <= 3 ? 90 : cart.lineItems.length <= 6 ? 100 : 85;
    const historyScore = 75; // Mock store conversion rate
    const competitionScore = Math.max(0, 100 - (Math.random() * 5 * 20)); // Mock competition
    
    const weights = { priceScore: 0.25, timeScore: 0.30, itemScore: 0.20, historyScore: 0.15, competitionScore: 0.10 };
    
    return Math.round(
      priceScore * weights.priceScore +
      timeScore * weights.timeScore +
      itemScore * weights.itemScore +
      historyScore * weights.historyScore +
      competitionScore * weights.competitionScore
    );
  };

  const claimCart = (cartId: string) => {
    setCheckouts(prev => prev.map(cart => 
      cart.id === cartId 
        ? { ...cart, claimedById: "u2", claimedAt: new Date().toISOString() }
        : cart
    ));
    toast.success("Cart claimed successfully!");
  };

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
          <h1 className="text-2xl font-bold text-foreground">Cart Marketplace</h1>
          <p className="text-sm text-muted-foreground mt-1">Claim and recover abandoned carts</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm">
            {available.length} available
          </Badge>
          <Badge variant="outline" className="text-sm">
            ${totalValue.toLocaleString()} total value
          </Badge>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="glass-card p-6 mb-8 overflow-hidden">
        <h2 className="text-sm font-semibold text-foreground mb-4">Today's Activity</h2>
        <div className="w-full overflow-hidden">
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
