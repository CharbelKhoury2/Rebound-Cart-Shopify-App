import { mockCheckouts, mockCommissions, mockUsers } from "@/data/mockData";
import { MetricCard } from "@/components/MetricCard";
import { KPICard, KPIDashboard, KPITrend } from "@/components/KPIDashboard";
import { StatusDot } from "@/components/StatusDot";
import { SalesChart } from "@/components/admin/SalesChart";
import { PerformanceMetrics, createRevenueMetrics, createOperationalMetrics } from "@/components/admin/PerformanceMetrics";
import { DollarSign, ShoppingCart, Users, TrendingUp, Activity, ArrowUpRight, ArrowDownRight, Target, Zap, RefreshCw } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const totalRecovered = mockCheckouts.filter((c) => c.status === "RECOVERED").length;
  const totalRevenue = mockCommissions.reduce((s, c) => s + c.totalAmount, 0);
  const platformRevenue = mockCommissions.reduce((s, c) => s + c.platformFee, 0);
  const pendingPayout = mockCommissions.filter((c) => c.status === "PENDING").reduce((s, c) => s + c.commissionAmount, 0);
  const activeReps = mockUsers.filter((u) => u.role === "SALES_REP" && u.status === "ACTIVE").length;
  const pendingReps = mockUsers.filter((u) => u.status === "PENDING").length;

  // Enhanced data for new components
  const salesData = [
    { date: '2024-01-01', revenue: 4000, orders: 24, averageOrderValue: 167, recoveryRate: 22.5 },
    { date: '2024-01-02', revenue: 3000, orders: 18, averageOrderValue: 167, recoveryRate: 24.8 },
    { date: '2024-01-03', revenue: 5000, orders: 29, averageOrderValue: 172, recoveryRate: 26.2 },
    { date: '2024-01-04', revenue: 2780, orders: 15, averageOrderValue: 185, recoveryRate: 23.1 },
    { date: '2024-01-05', revenue: 6890, orders: 38, averageOrderValue: 181, recoveryRate: 28.4 },
    { date: '2024-01-06', revenue: 7390, orders: 42, averageOrderValue: 176, recoveryRate: 31.2 },
    { date: '2024-01-07', revenue: 8200, orders: 45, averageOrderValue: 182, recoveryRate: 29.6 },
  ];

  const revenueMetricsData = {
    totalRevenue,
    previousRevenue: totalRevenue * 0.85,
    revenueTarget: 50000,
    averageOrderValue: salesData.reduce((sum, item) => sum + item.averageOrderValue, 0) / salesData.length,
    previousAOV: 165,
    aovTarget: 200,
    recoveryRate: salesData.reduce((sum, item) => sum + item.recoveryRate, 0) / salesData.length,
    previousRecoveryRate: 24.5,
    recoveryRateTarget: 30,
    activeReps,
    previousActiveReps: activeReps - 2,
    activeRepsTarget: 25
  };

  const operationalMetricsData = {
    averageResponseTime: 12,
    responseTimeTarget: 15,
    dailyProcessed: 156,
    previousDailyProcessed: 142,
    successRate: 28.4,
    successRateTarget: 25,
    efficiencyScore: 87,
    previousEfficiencyScore: 82
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdated(new Date());
    }, 1000);
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(handleRefresh, 30000);
    return () => clearInterval(interval);
  }, []);

  // Sample data for charts
  const revenueData = [
    { name: 'Jan', revenue: 4000, recoveries: 24 },
    { name: 'Feb', revenue: 3000, recoveries: 18 },
    { name: 'Mar', revenue: 5000, recoveries: 29 },
    { name: 'Apr', revenue: 2780, recoveries: 15 },
    { name: 'May', revenue: 6890, recoveries: 38 },
    { name: 'Jun', revenue: 7390, recoveries: 42 },
  ];

  const tierDistribution = [
    { name: 'Bronze', value: mockUsers.filter(u => u.tier === 'BRONZE').length, color: '#f97316' },
    { name: 'Silver', value: mockUsers.filter(u => u.tier === 'SILVER').length, color: '#6366f1' },
    { name: 'Gold', value: mockUsers.filter(u => u.tier === 'GOLD').length, color: '#eab308' },
    { name: 'Platinum', value: mockUsers.filter(u => u.tier === 'PLATINUM').length, color: '#06b6d4' },
  ];

  const performanceData = [
    { name: 'Week 1', recovered: 65, claimed: 28 },
    { name: 'Week 2', recovered: 78, claimed: 35 },
    { name: 'Week 3', recovered: 90, claimed: 42 },
    { name: 'Week 4', recovered: 81, claimed: 38 },
  ];

  // KPI trend data
  const weeklyRevenue = [
    { name: 'W1', value: 12000, target: 15000 },
    { name: 'W2', value: 14500, target: 15000 },
    { name: 'W3', value: 16800, target: 16000 },
    { name: 'W4', value: 19200, target: 18000 },
    { name: 'W5', value: 21000, target: 20000 },
    { name: 'W6', value: 23500, target: 22000 },
    { name: 'W7', value: 25800, target: 25000 },
  ];

  const conversionRate = [
    { name: 'Mon', value: 22.5, target: 25 },
    { name: 'Tue', value: 24.8, target: 25 },
    { name: 'Wed', value: 26.2, target: 25 },
    { name: 'Thu', value: 23.1, target: 25 },
    { name: 'Fri', value: 28.4, target: 25 },
    { name: 'Sat', value: 31.2, target: 30 },
    { name: 'Sun', value: 29.6, target: 30 },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Platform Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Global performance overview</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusDot status="live" label="Live" />
        </div>
      </div>

      {/* Enhanced Performance Metrics */}
      <div className="mb-8">
        <PerformanceMetrics
          metrics={createRevenueMetrics(revenueMetricsData)}
          title="Revenue Performance"
          showTrends={true}
          showTargets={true}
          refreshInterval={30000}
          onRefresh={handleRefresh}
        />
      </div>

      {/* Interactive Sales Chart */}
      <div className="mb-8">
        <SalesChart
          data={salesData}
          title="Sales Analytics & Trends"
          height={350}
          showControls={true}
          chartType="area"
          timeRange="week"
        />
      </div>

      {/* Operational Metrics */}
      <div className="mb-8">
        <PerformanceMetrics
          metrics={createOperationalMetrics(operationalMetricsData)}
          title="Operational Performance"
          showTrends={true}
          showTargets={true}
        />
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Total Recovered Revenue" value={`$${totalRevenue.toLocaleString()}`} subtitle={`${totalRecovered} recoveries`} icon={<TrendingUp className="h-5 w-5" />} />
        <MetricCard title="Platform Revenue" value={`$${platformRevenue.toFixed(2)}`} subtitle="Net fees earned" icon={<DollarSign className="h-5 w-5" />} />
        <MetricCard title="Platform Debt" value={`$${pendingPayout.toFixed(2)}`} subtitle="Pending rep payouts" icon={<ShoppingCart className="h-5 w-5" />} />
        <MetricCard title="Active Reps" value={String(activeReps)} subtitle={pendingReps > 0 ? `${pendingReps} pending approval` : "All approved"} icon={<Users className="h-5 w-5" />} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trend Chart */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Revenue Trend</h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3 text-status-success" />
              <span className="text-status-success">+12.5%</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueData}>
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
                dataKey="revenue" 
                stroke="var(--primary)" 
                fill="var(--primary)" 
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Tier Distribution */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Rep Tier Distribution</h2>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={tierDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {tierDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--card)', 
                  border: '1px solid var(--border)',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {tierDistribution.map((tier) => (
              <div key={tier.name} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tier.color }} />
                <span className="text-muted-foreground">{tier.name}</span>
                <span className="font-medium text-foreground">{tier.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="glass-card p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">Weekly Performance</h2>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Recovery Rate: </span>
            <span className="text-status-success font-medium">47.3%</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={performanceData}>
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
            <Bar dataKey="recovered" fill="var(--status-success)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="claimed" fill="var(--primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* KPI Dashboard */}
      <KPIDashboard title="Key Performance Indicators" period="Last 30 days">
        <KPICard
          title="Avg Recovery Rate"
          value={26.8}
          change={3.2}
          changeType="increase"
          icon={<Target className="h-5 w-5" />}
          description="Percentage of claimed carts recovered"
          target="30%"
          format="percentage"
        />
        <KPICard
          title="Rep Productivity"
          value={4.2}
          change={0.8}
          changeType="increase"
          icon={<Zap className="h-5 w-5" />}
          description="Average recoveries per active rep"
          target="5"
          format="number"
        />
        <KPICard
          title="Platform Commission"
          value={15680}
          change={12.5}
          changeType="increase"
          icon={<DollarSign className="h-5 w-5" />}
          description="Total platform earnings from fees"
          target="20000"
          format="currency"
        />
        <KPICard
          title="Cart Value"
          value={287}
          change={-2.1}
          changeType="decrease"
          icon={<ShoppingCart className="h-5 w-5" />}
          description="Average abandoned cart value"
          target="300"
          format="currency"
        />
      </KPIDashboard>

      {/* KPI Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <KPITrend
          title="Weekly Revenue Trend"
          data={weeklyRevenue}
          format="currency"
        />
        <KPITrend
          title="Daily Conversion Rate"
          data={conversionRate}
          format="percentage"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Recent Recoveries</h2>
          </div>
          <div className="divide-y divide-border/50">
            {mockCheckouts
              .filter((c) => c.status === "RECOVERED")
              .map((c) => (
                <div key={c.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{c.shopName}</p>
                    <p className="text-xs text-muted-foreground">{c.customerEmail}</p>
                  </div>
                  <span className="text-sm font-bold text-status-success">${c.totalPrice.toFixed(2)}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Recent Commissions</h2>
          </div>
          <div className="divide-y divide-border/50">
            {mockCommissions.slice(0, 4).map((c) => (
              <div key={c.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{c.repName}</p>
                  <p className="text-xs text-muted-foreground">{c.shopName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">${c.commissionAmount.toFixed(2)}</p>
                  <span className={`text-xs ${c.status === "PAID" ? "text-status-success" : "text-status-pending"}`}>{c.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
