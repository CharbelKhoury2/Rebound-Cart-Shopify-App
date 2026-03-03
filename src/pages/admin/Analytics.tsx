import { useState, useMemo } from "react";
import { mockCheckouts, mockCommissions, mockUsers } from "@/data/mockData";
import { MetricCard } from "@/components/MetricCard";
import { StatusDot } from "@/components/StatusDot";
import { ReportGenerator } from "@/components/admin/ReportGenerator";
import { Calendar, TrendingUp, Users, DollarSign, Activity, Download, Filter, Search, X } from "lucide-react";
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

type TimeRange = "7d" | "30d" | "90d" | "1y";
type MetricType = "revenue" | "recoveries" | "commissions" | "users";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [selectedMetric, setSelectedMetric] = useState<MetricType>("revenue");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  
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
    const stores = new Set(mockCheckouts.map(c => c.shopName));
    return Array.from(stores);
  }, []);

  const uniqueReps = useMemo(() => {
    const reps = new Set(mockCommissions.map(c => c.repName));
    return Array.from(reps);
  }, []);

  const availableTiers = ["BRONZE", "SILVER", "GOLD", "PLATINUM"];
  const availableStatus = ["ACTIVE", "PENDING", "INACTIVE"];

  // Apply filters to data
  const filteredData = useMemo(() => {
    let filtered = [...mockCommissions];

    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.repName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.shopName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.stores.length > 0) {
      filtered = filtered.filter(c => filters.stores.includes(c.shopName));
    }

    if (filters.reps.length > 0) {
      filtered = filtered.filter(c => filters.reps.includes(c.repName));
    }

    if (filters.minRevenue) {
      filtered = filtered.filter(c => c.totalAmount >= parseFloat(filters.minRevenue));
    }

    if (filters.maxRevenue) {
      filtered = filtered.filter(c => c.totalAmount <= parseFloat(filters.maxRevenue));
    }

    return filtered;
  }, [searchTerm, filters]);

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

  // Generate time-based data based on selected range
  const generateTimeSeriesData = (range: TimeRange) => {
    const dataPoints = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 12 : 12;
    const labels = range === "7d" ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] :
                   range === "30d" ? Array.from({length: 30}, (_, i) => `Day ${i + 1}`) :
                   range === "90d" ? ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7", "Week 8", "Week 9", "Week 10", "Week 11", "Week 12"] :
                   ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return labels.map((label, index) => ({
      name: label,
      revenue: Math.floor(Math.random() * 5000) + 2000 + (index * 100),
      recoveries: Math.floor(Math.random() * 50) + 10 + (index * 2),
      commissions: Math.floor(Math.random() * 1000) + 300 + (index * 50),
      users: Math.floor(Math.random() * 20) + 5 + (index),
      conversionRate: (Math.random() * 30 + 20).toFixed(1),
    }));
  };

  const timeSeriesData = useMemo(() => generateTimeSeriesData(timeRange), [timeRange]);

  // Calculate metrics based on time range
  const metrics = useMemo(() => {
    const totalRevenue = timeSeriesData.reduce((sum, d) => sum + d.revenue, 0);
    const totalRecoveries = timeSeriesData.reduce((sum, d) => sum + d.recoveries, 0);
    const totalCommissions = timeSeriesData.reduce((sum, d) => sum + d.commissions, 0);
    const avgConversionRate = (timeSeriesData.reduce((sum, d) => sum + parseFloat(d.conversionRate), 0) / timeSeriesData.length).toFixed(1);

    return {
      totalRevenue,
      totalRecoveries,
      totalCommissions,
      avgConversionRate,
      revenueGrowth: "+12.5%",
      recoveryGrowth: "+8.3%",
      commissionGrowth: "+15.2%",
      conversionGrowth: "+2.1%"
    };
  }, [timeSeriesData]);

  // Performance by tier
  const tierPerformance = [
    { tier: "Bronze", reps: 2, revenue: 12500, recoveries: 45, conversionRate: 18.5 },
    { tier: "Silver", reps: 1, revenue: 18900, recoveries: 67, conversionRate: 24.2 },
    { tier: "Gold", reps: 1, revenue: 25600, recoveries: 89, conversionRate: 31.7 },
    { tier: "Platinum", reps: 2, revenue: 42300, recoveries: 156, conversionRate: 42.3 },
  ];

  // Top performers
  const topPerformers = [
    { name: "Nina Patel", revenue: 28400, recoveries: 98, tier: "PLATINUM" },
    { name: "James Wilson", revenue: 22100, recoveries: 76, tier: "GOLD" },
    { name: "Maria Garcia", revenue: 18900, recoveries: 62, tier: "SILVER" },
    { name: "Alex Kim", revenue: 12400, recoveries: 41, tier: "BRONZE" },
  ];

  const exportAnalytics = () => {
    const csvData = [
      ["Period", "Revenue", "Recoveries", "Commissions", "Users", "Conversion Rate"],
      ...timeSeriesData.map(d => [d.name, d.revenue, d.recoveries, d.commissions, d.users, d.conversionRate])
    ];

    const csvContent = csvData.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${timeRange}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleGenerateReport = async (config: any) => {
    setIsGeneratingReport(true);
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGeneratingReport(false);
    console.log("Generating report with config:", config);
  };

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
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  timeRange === range
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
        </div>
      </div>

      {/* Search and Filter Bar */}
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
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="glass-card p-6 mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Advanced Filters</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Store Filter */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Stores</label>
              <Select
                value={filters.stores[0] || ""}
                onValueChange={(value) => 
                  setFilters(prev => ({
                    ...prev,
                    stores: value ? [value] : []
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All stores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All stores</SelectItem>
                  {uniqueStores.map((store) => (
                    <SelectItem key={store} value={store}>
                      {store}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rep Filter */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Sales Reps</label>
              <Select
                value={filters.reps[0] || ""}
                onValueChange={(value) => 
                  setFilters(prev => ({
                    ...prev,
                    reps: value ? [value] : []
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All reps" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All reps</SelectItem>
                  {uniqueReps.map((rep) => (
                    <SelectItem key={rep} value={rep}>
                      {rep}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tier Filter */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Tiers</label>
              <Select
                value={filters.tiers[0] || ""}
                onValueChange={(value) => 
                  setFilters(prev => ({
                    ...prev,
                    tiers: value ? [value] : []
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All tiers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All tiers</SelectItem>
                  {availableTiers.map((tier) => (
                    <SelectItem key={tier} value={tier}>
                      {tier.charAt(0) + tier.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Revenue Range */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Min Revenue</label>
              <Input
                type="number"
                placeholder="0"
                value={filters.minRevenue}
                onChange={(e) => 
                  setFilters(prev => ({
                    ...prev,
                    minRevenue: e.target.value
                  }))
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Max Revenue</label>
              <Input
                type="number"
                placeholder="No limit"
                value={filters.maxRevenue}
                onChange={(e) => 
                  setFilters(prev => ({
                    ...prev,
                    maxRevenue: e.target.value
                  }))
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard 
          title="Total Revenue" 
          value={`$${metrics.totalRevenue.toLocaleString()}`} 
          subtitle={metrics.revenueGrowth} 
          icon={<DollarSign className="h-5 w-5" />}
          trend="up"
        />
        <MetricCard 
          title="Total Recoveries" 
          value={metrics.totalRecoveries.toLocaleString()} 
          subtitle={metrics.recoveryGrowth} 
          icon={<TrendingUp className="h-5 w-5" />}
          trend="up"
        />
        <MetricCard 
          title="Commissions" 
          value={`$${metrics.totalCommissions.toLocaleString()}`} 
          subtitle={metrics.commissionGrowth} 
          icon={<Users className="h-5 w-5" />}
          trend="up"
        />
        <MetricCard 
          title="Conversion Rate" 
          value={`${metrics.avgConversionRate}%`} 
          subtitle={metrics.conversionGrowth} 
          icon={<Activity className="h-5 w-5" />}
          trend="up"
        />
      </div>

      {/* Main Chart */}
      <div className="glass-card p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Performance Overview</h2>
          <div className="flex items-center gap-2">
            {(["revenue", "recoveries", "commissions", "users"] as MetricType[]).map((metric) => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  selectedMetric === metric
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {metric.charAt(0).toUpperCase() + metric.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
            <YAxis stroke="var(--muted-foreground)" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--card)', 
                border: '1px solid var(--border)',
                borderRadius: '8px'
              }}
            />
            <Area 
              type="monotone" 
              dataKey={selectedMetric} 
              stroke="var(--primary)" 
              fill="var(--primary)" 
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Tier Performance */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Performance by Tier</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={tierPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="tier" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--card)', 
                  border: '1px solid var(--border)',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="recoveries" fill="var(--status-success)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Conversion Rate Trend */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Conversion Rate Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--card)', 
                  border: '1px solid var(--border)',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="conversionRate" 
                stroke="var(--status-warning)" 
                strokeWidth={2}
                dot={{ fill: "var(--status-warning)", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Report Generator */}
      <div className="mb-8">
        <ReportGenerator
          data={filteredData}
          onGenerateReport={handleGenerateReport}
          isLoading={isGeneratingReport}
        />
      </div>

      {/* Top Performers Table */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Top Performers</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Rep Name</th>
                <th className="text-right px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Revenue</th>
                <th className="text-right px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Recoveries</th>
                <th className="text-center px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Tier</th>
              </tr>
            </thead>
            <tbody>
              {topPerformers.map((performer, index) => (
                <tr key={performer.name} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                  <td className="px-5 py-3 font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {index + 1}
                      </div>
                      {performer.name}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-foreground">${performer.revenue.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right text-muted-foreground">{performer.recoveries}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      performer.tier === "PLATINUM" ? "bg-tier-platinum/10 text-tier-platinum" :
                      performer.tier === "GOLD" ? "bg-tier-gold/10 text-tier-gold" :
                      performer.tier === "SILVER" ? "bg-tier-silver/10 text-tier-silver" :
                      "bg-tier-bronze/10 text-tier-bronze"
                    }`}>
                      {performer.tier}
                    </span>
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
