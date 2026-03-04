import { useState, useEffect, useMemo } from "react";
import { CheckoutService } from "@/services/checkout";
import { useSimpleAuth } from "@/contexts/SimpleAuthContext";
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
import type { AbandonedCheckout } from "@prisma/client";

export default function Marketplace() {
  const { user } = useSimpleAuth();
  const [checkouts, setCheckouts] = useState<AbandonedCheckout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [showComparison, setShowComparison] = useState(false);

  // Load available carts from database
  const loadCarts = async () => {
    try {
      setIsLoading(true);
      const availableCarts = await CheckoutService.getAvailableCarts();
      setCheckouts(availableCarts);
    } catch (error) {
      console.error('Failed to load carts:', error);
      toast.error('Failed to load available carts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCarts();
  }, []);

  // Auto-refresh from database
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      loadCarts();
    }, 15000); // Every 15 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const available = checkouts; // Already filtered by service to show only available
  const totalValue = available.reduce((sum, c) => sum + Number(c.totalPrice), 0);
  const avgValue = available.length > 0 ? totalValue / available.length : 0;

  // Calculate cart score function
  const calculateCartScore = (cart: AbandonedCheckout) => {
    const avgOrderValue = 250; // Mock average order value
    const priceScore = Math.min(100, (Number(cart.totalPrice) / avgOrderValue) * 80);
    const timeScore = Math.max(0, 100 - (Date.now() - new Date(cart.createdAt).getTime()) / (1000 * 60 * 120)); // 2 hours = 0 score
    const itemScore = 75; // Mock item score (would need lineItems in schema)
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

  // Enhanced filtering and sorting
  const filteredAndSortedCarts = useMemo(() => {
    let filtered = available.filter(cart => {
      // Search filter
      const matchesSearch = searchTerm === "" || 
        cart.shop.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cart.email && cart.email.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Value range filter
      const cartValue = Number(cart.totalPrice);
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
          aValue = Number(a.totalPrice);
          bValue = Number(b.totalPrice);
          break;
        case "createdAt":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
      }
      
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    });
  }, [available, searchTerm, sortBy, sortOrder, minValue, maxValue, scoreFilter]);

  const handleClaim = async (id: string) => {
    if (!user) {
      toast.error('Please log in to claim carts');
      return;
    }

    try {
      await CheckoutService.claimCart(id, user.id);
      toast.success("Cart claimed successfully! Check Active Recoveries.");
      // Reload carts to update the list
      loadCarts();
    } catch (error: any) {
      console.error('Claim failed:', error);
      toast.error(error.message || 'Failed to claim cart');
    }
  };

  const timeSince = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "< 1h ago";
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ShoppingCart className="h-10 w-10 mx-auto text-muted-foreground mb-3 animate-pulse" />
          <p className="text-foreground font-medium">Loading available carts...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vetted Talent Network</h1>
          <p className="text-sm text-muted-foreground mt-1">Claim and recover abandoned carts from our specialist network</p>
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
            <LineChart data={[
              { time: '12:00', available: available.length, claimed: 0 },
              { time: '14:00', available: available.length, claimed: 0 },
              { time: '16:00', available: available.length, claimed: 0 },
              { time: '18:00', available: available.length, claimed: 0 },
              { time: '20:00', available: available.length, claimed: 0 },
            ]}>
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
          <p className="text-sm text-muted-foreground mt-1">Check back soon — new carts appear in real-time from our specialist network</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredAndSortedCarts.map((checkout, i) => (
            <div key={checkout.id} className="glass-card p-5 animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-bold text-foreground">
                      ${Number(checkout.totalPrice).toFixed(2)}
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                      {checkout.currency}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{checkout.shop}</p>
                  {checkout.email && (
                    <p className="text-xs text-muted-foreground mt-1">{checkout.email}</p>
                  )}
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
