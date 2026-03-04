import { useState, useEffect, useMemo } from "react";
import { apiService } from "@/services/api";
import { MetricCard } from "@/components/MetricCard";
import { StatusDot } from "@/components/StatusDot";
import { ReportGenerator } from "@/components/admin/ReportGenerator";
import { Calendar, TrendingUp, Users, DollarSign, Activity, Download, Filter, Search, X, RefreshCw } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type TimeRange = "7d" | "30d" | "90d" | "1y";
type MetricType = "revenue" | "recoveries" | "commissions" | "users";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [selectedMetric, setSelectedMetric] = useState<MetricType>("revenue");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const [commissions, setCommissions] = useState<any[]>([]);
  const [checkouts, setCheckouts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [comms, carts, usrData] = await Promise.all([
        apiService.getAllCommissions(),
        apiService.getAllCarts(),
        apiService.getUsers()
      ]);
      setCommissions(comms || []);
      setCheckouts(carts || []);
      setUsers(usrData || []);
    } catch (error) {
      console.error("Failed to load analytics data:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Advanced filters
  const [filters, setFilters] = useState({
    stores: [] as string[],
    reps: [] as string[],
    tiers: [] as string[],
    status: [] as string[],
    minRevenue: "",
    maxRevenue: "",
    minRecoveries: "",
    maxRecoveries: ""
  });

  // Get unique values for filter options
  const uniqueStores = useMemo(() => {
    const stores = new Set(checkouts.map(c => c.shop).filter(Boolean));
    return Array.from(stores);
  }, [checkouts]);

  const uniqueReps = useMemo(() => {
    const reps = new Set(commissions.map(c => c.rep ? `${c.rep.firstName} ${c.rep.lastName}` : '').filter(Boolean));
    return Array.from(reps);
  }, [commissions]);

  const availableTiers = ["BRONZE", "SILVER", "GOLD", "PLATINUM"];
  const availableStatus = ["ACTIVE", "PENDING", "INACTIVE"];

  // Apply filters to data
  const filteredData = useMemo(() => {
    let filtered = [...commissions];

    if (searchTerm) {
      filtered = filtered.filter(c => {
        const repName = c.rep ? `${c.rep.firstName} ${c.rep.lastName}`.toLowerCase() : '';
        const shopName = (c.checkout?.shop || c.shopName || '').toLowerCase();
        return repName.includes(searchTerm.toLowerCase()) || shopName.includes(searchTerm.toLowerCase());
      });
    }

    if (filters.stores.length > 0) {
      filtered = filtered.filter(c => filters.stores.includes(c.checkout?.shop || c.shopName));
    }

    if (filters.reps.length > 0) {
      filtered = filtered.filter(c => {
        const repName = c.rep ? `${c.rep.firstName} ${c.rep.lastName}` : '';
        return filters.reps.includes(repName);
      });
    }

    if (filters.minRevenue) {
      filtered = filtered.filter(c => Number(c.totalAmount) >= parseFloat(filters.minRevenue));
    }

    if (filters.maxRevenue) {
      filtered = filtered.filter(c => Number(c.totalAmount) <= parseFloat(filters.maxRevenue));
    }

    return filtered;
  }, [searchTerm, filters, commissions]);

  const clearFilters = () => {
    setFilters({
      stores: [],
      reps: [],
      tiers: [],
      status: [],
      minRevenue: "",
      maxRevenue: "",
      minRecoveries: "",
      maxRecoveries: ""
    });
    setSearchTerm("");
  };

  const activeFilterCount = Object.values(filters).filter(value =>
    Array.isArray(value) ? value.length > 0 : value !== ""
  ).length + (searchTerm ? 1 : 0);

  // Generate time-based data based on selected range (using real data counts where possible)
  const timeSeriesData = useMemo(() => {
    const labels = timeRange === "7d" ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] :
      timeRange === "30d" ? Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`) :
        timeRange === "90d" ? Array.from({ length: 12 }, (_, i) => `Week ${i + 1}`) :
          ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return labels.map((label, index) => {
      // For now we still use some randomization for the chart trend but anchored to real totals if we want, 
      // or just keep the visual mock trend since real historical data might be slim
      return {
        name: label,
        revenue: Math.floor(Math.random() * 5000) + 2000 + (index * 100),
        recoveries: Math.floor(Math.random() * 50) + 10 + (index * 2),
        commissions: Math.floor(Math.random() * 1000) + 300 + (index * 50),
        users: users.length || 5,
        conversionRate: (Math.random() * 30 + 20).toFixed(1),
      };
    });
  }, [timeRange, users.length]);

  // Calculate metrics based on real data
  const metrics = useMemo(() => {
    const totalRevenue = commissions.reduce((sum, c) => sum + Number(c.totalAmount), 0);
    const totalRecoveries = commissions.length;
    const totalCommissions = commissions.reduce((sum, c) => sum + Number(c.commissionAmount), 0);
    const totalAbandoned = checkouts.length;
    const avgConversionRate = totalAbandoned > 0 ? ((totalRecoveries / totalAbandoned) * 100).toFixed(1) : "0.0";

    return {
      totalRevenue,
      totalRecoveries,
      totalCommissions,
      avgConversionRate,
      revenueGrowth: "+12.5%", // static for now
      recoveryGrowth: "+8.3%",
      commissionGrowth: "+15.2%",
      conversionGrowth: "+2.1%"
    };
  }, [commissions, checkouts]);

  // Performance by tier from real users
  const tierPerformance = useMemo(() => {
    return availableTiers.map(tier => {
      const tierUsers = users.filter(u => u.tier === tier);
      const tierComms = commissions.filter(c => c.rep?.tier === tier);
      const revenue = tierComms.reduce((sum, c) => sum + Number(c.totalAmount), 0);
      const recoveries = tierComms.length;
      return {
        tier: tier.charAt(0) + tier.slice(1).toLowerCase(),
        reps: tierUsers.length,
        revenue,
        recoveries,
        conversionRate: tierUsers.length > 0 ? (recoveries / tierUsers.length).toFixed(1) : 0
      };
    });
  }, [users, commissions]);

  // Top performers from real data
  const topPerformers = useMemo(() => {
    const repStats = new Map();
    commissions.forEach(c => {
      const repId = c.repId;
      const stats = repStats.get(repId) || { name: `${c.rep?.firstName} ${c.rep?.lastName}`, revenue: 0, recoveries: 0, tier: c.rep?.tier };
      stats.revenue += Number(c.totalAmount);
      stats.recoveries += 1;
      repStats.set(repId, stats);
    });

    return Array.from(repStats.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [commissions]);

  const exportAnalytics = () => {
    const headers = ["Period", "Revenue", "Recoveries", "Commissions", "Conversion Rate"];
    const csvContent = [
      headers.join(","),
      ...timeSeriesData.map(d => [d.name, d.revenue, d.recoveries, d.commissions, d.conversionRate].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${timeRange}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Analytics exported successfully");
  };

  const handleGenerateReport = async (config: any) => {
    setIsGeneratingReport(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsGeneratingReport(false);
    toast.success("Report generated successfully");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Activity className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Deep insights into platform performance</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
            {(["7d", "30d", "90d", "1y"] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${timeRange === range
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : range === "90d" ? "90 Days" : "1 Year"}
              </button>
            ))}
          </div>
          <button
            onClick={exportAnalytics}
            className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-secondary text-foreground hover:bg-accent transition-colors text-sm"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <Button
            variant="outline"
            onClick={async () => {
              setIsRefreshing(true);
              await loadData();
              setIsRefreshing(false);
            }}
            disabled={isRefreshing || isLoading}
            className="flex items-center gap-2 text-sm"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by rep name or store..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && <Badge variant="secondary" className="ml-1">{activeFilterCount}</Badge>}
          </Button>

          {activeFilterCount > 0 && (
            <Button variant="ghost" onClick={clearFilters} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" /> Clear
            </Button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="glass-card p-6 mb-6 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">Advanced Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Stores</label>
              <Select value={filters.stores[0] || ""} onValueChange={(v) => setFilters(p => ({ ...p, stores: v ? [v] : [] }))}>
                <SelectTrigger><SelectValue placeholder="All stores" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-stores">All stores</SelectItem>
                  {uniqueStores.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Sales Reps</label>
              <Select value={filters.reps[0] || ""} onValueChange={(v) => setFilters(p => ({ ...p, reps: v ? [v] : [] }))}>
                <SelectTrigger><SelectValue placeholder="All reps" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-reps">All reps</SelectItem>
                  {uniqueReps.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Revenue Range</label>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="Min" value={filters.minRevenue} onChange={(e) => setFilters(p => ({ ...p, minRevenue: e.target.value }))} />
                <Input type="number" placeholder="Max" value={filters.maxRevenue} onChange={(e) => setFilters(p => ({ ...p, maxRevenue: e.target.value }))} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Total Revenue" value={`$${metrics.totalRevenue.toLocaleString()}`} subtitle={metrics.revenueGrowth} icon={<DollarSign className="h-5 w-5" />} trend="up" />
        <MetricCard title="Total Recoveries" value={metrics.totalRecoveries.toLocaleString()} subtitle={metrics.recoveryGrowth} icon={<TrendingUp className="h-5 w-5" />} trend="up" />
        <MetricCard title="Commissions" value={`$${metrics.totalCommissions.toLocaleString()}`} subtitle={metrics.commissionGrowth} icon={<Users className="h-5 w-5" />} trend="up" />
        <MetricCard title="Conversion Rate" value={`${metrics.avgConversionRate}%`} subtitle={metrics.conversionGrowth} icon={<Activity className="h-5 w-5" />} trend="up" />
      </div>

      <div className="glass-card p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Performance Overview</h2>
          <div className="flex items-center gap-2">
            {(["revenue", "recoveries", "commissions"] as MetricType[]).map((m) => (
              <button key={m} onClick={() => setSelectedMetric(m)} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${selectedMetric === m ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
            <YAxis stroke="var(--muted-foreground)" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }} />
            <Area type="monotone" dataKey={selectedMetric} stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.2} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Performance by Tier</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={tierPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="tier" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }} />
              <Bar dataKey="revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="recoveries" fill="var(--status-success)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6 text-center flex flex-col justify-center items-center">
          <h2 className="text-lg font-semibold text-foreground mb-2">Performance Reports</h2>
          <p className="text-sm text-muted-foreground mb-4 text-center max-w-xs">Generate custom reports across all platform activities</p>
          <ReportGenerator data={filteredData} onGenerateReport={handleGenerateReport} isLoading={isGeneratingReport} />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Top Performers</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider">Rep Name</th>
                <th className="text-right px-5 py-3 text-xs font-medium uppercase tracking-wider">Revenue</th>
                <th className="text-right px-5 py-3 text-xs font-medium uppercase tracking-wider">Recoveries</th>
                <th className="text-center px-5 py-3 text-xs font-medium uppercase tracking-wider">Tier</th>
              </tr>
            </thead>
            <tbody>
              {topPerformers.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">No performance data yet</td></tr>
              ) : (
                topPerformers.map((p, idx) => (
                  <tr key={idx} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                    <td className="px-5 py-3 font-medium text-foreground">{p.name}</td>
                    <td className="px-5 py-3 text-right font-semibold text-foreground">${p.revenue.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right text-muted-foreground">{p.recoveries}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground`}>
                        {p.tier}
                      </span>
                    </td>
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
