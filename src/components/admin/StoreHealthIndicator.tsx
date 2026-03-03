import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Zap,
  Clock,
  DollarSign,
  Users,
  ShoppingCart
} from 'lucide-react';

interface StoreHealthMetrics {
  recoveryRate: number;
  revenueGrowth: number;
  activeUsers: number;
  responseTime: number;
  errorRate: number;
  lastSync: Date;
  uptime: number;
}

interface StoreHealthIndicatorProps {
  storeId: string;
  storeName: string;
  metrics: StoreHealthMetrics;
  showDetails?: boolean;
  size?: 'compact' | 'detailed';
}

export function StoreHealthIndicator({ 
  storeId, 
  storeName, 
  metrics, 
  showDetails = false,
  size = 'compact'
}: StoreHealthIndicatorProps) {
  
  const calculateHealthScore = () => {
    const weights = {
      recoveryRate: 0.3,
      revenueGrowth: 0.2,
      activeUsers: 0.15,
      responseTime: 0.15,
      errorRate: 0.1,
      uptime: 0.1
    };

    const scores = {
      recoveryRate: Math.min(metrics.recoveryRate / 30 * 100, 100), // Target: 30%
      revenueGrowth: Math.max((metrics.revenueGrowth + 10) * 5, 0), // Target: 10% growth
      activeUsers: Math.min(metrics.activeUsers / 100 * 100, 100), // Target: 100 active users
      responseTime: Math.max(100 - metrics.responseTime * 2, 0), // Target: <500ms
      errorRate: Math.max(100 - metrics.errorRate * 10, 0), // Target: <10% error rate
      uptime: metrics.uptime // Direct uptime percentage
    };

    const weightedScore = Object.entries(weights).reduce((total, [key, weight]) => {
      return total + (scores[key as keyof typeof scores] * weight);
    }, 0);

    return Math.round(weightedScore);
  };

  const getHealthStatus = (score: number) => {
    if (score >= 80) return { status: 'HEALTHY', color: 'text-status-success', bg: 'bg-status-success/10', icon: CheckCircle };
    if (score >= 60) return { status: 'WARNING', color: 'text-status-warning', bg: 'bg-status-warning/10', icon: AlertCircle };
    return { status: 'CRITICAL', color: 'text-destructive', bg: 'bg-destructive/10', icon: XCircle };
  };

  const healthScore = calculateHealthScore();
  const healthStatus = getHealthStatus(healthScore);
  const StatusIcon = healthStatus.icon;

  const formatLastSync = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const getTrendIcon = (value: number, inverse = false) => {
    const isPositive = inverse ? value < 0 : value > 0;
    if (isPositive) return <TrendingUp className="h-3 w-3 text-status-success" />;
    if (value !== 0) return <TrendingDown className="h-3 w-3 text-destructive" />;
    return <Activity className="h-3 w-3 text-muted-foreground" />;
  };

  if (size === 'compact') {
    return (
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-full ${healthStatus.bg}`}>
          <StatusIcon className={`h-3 w-3 ${healthStatus.color}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{healthScore}</span>
            <div className="w-12">
              <Progress value={healthScore} className="h-1.5" />
            </div>
            <Badge variant="outline" className={`text-xs ${healthStatus.color} border-current/20`}>
              {healthStatus.status}
            </Badge>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="glass-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${healthStatus.bg}`}>
              <StatusIcon className={`h-5 w-5 ${healthStatus.color}`} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{storeName}</h3>
              <p className="text-xs text-muted-foreground">Health Score: {healthScore}/100</p>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={`${healthStatus.color} border-current/20`}
          >
            {healthStatus.status}
          </Badge>
        </div>

        <div className="space-y-3">
          {/* Overall Progress */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Overall Health</span>
              <span className="font-medium">{healthScore}%</span>
            </div>
            <Progress value={healthScore} className="h-2" />
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-primary/10">
                <ShoppingCart className="h-3 w-3 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Recovery Rate</p>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-foreground">
                    {metrics.recoveryRate.toFixed(1)}%
                  </span>
                  {getTrendIcon(metrics.recoveryRate - 25)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-status-success/10">
                <DollarSign className="h-3 w-3 text-status-success" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Revenue Growth</p>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-foreground">
                    {metrics.revenueGrowth > 0 ? '+' : ''}{metrics.revenueGrowth.toFixed(1)}%
                  </span>
                  {getTrendIcon(metrics.revenueGrowth)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-status-warning/10">
                <Users className="h-3 w-3 text-status-warning" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Active Users</p>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-foreground">
                    {metrics.activeUsers}
                  </span>
                  {getTrendIcon(metrics.activeUsers - 50)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-blue-500/10">
                <Zap className="h-3 w-3 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Response Time</p>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-foreground">
                    {metrics.responseTime}ms
                  </span>
                  {getTrendIcon(metrics.responseTime, true)}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Last sync: {formatLastSync(metrics.lastSync)}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Activity className="h-3 w-3" />
              Uptime: {metrics.uptime.toFixed(1)}%
            </div>
          </div>
        </div>

        {showDetails && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <h4 className="text-sm font-medium text-foreground mb-2">Health Breakdown</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Error Rate</span>
                <span className={`font-medium ${
                  metrics.errorRate > 10 ? 'text-destructive' : 
                  metrics.errorRate > 5 ? 'text-status-warning' : 
                  'text-status-success'
                }`}>
                  {metrics.errorRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">System Status</span>
                <span className={`font-medium ${healthStatus.color}`}>
                  {healthStatus.status}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Store Health Summary Component
interface StoreHealthSummaryProps {
  stores: Array<{
    id: string;
    name: string;
    metrics: StoreHealthMetrics;
  }>;
}

export function StoreHealthSummary({ stores }: StoreHealthSummaryProps) {
  const totalStores = stores.length;
  const healthyStores = stores.filter(store => {
    const score = calculateHealthScore(store.metrics);
    return score >= 80;
  }).length;
  
  const warningStores = stores.filter(store => {
    const score = calculateHealthScore(store.metrics);
    return score >= 60 && score < 80;
  }).length;
  
  const criticalStores = stores.filter(store => {
    const score = calculateHealthScore(store.metrics);
    return score < 60;
  }).length;

  const calculateHealthScore = (metrics: StoreHealthMetrics) => {
    const weights = {
      recoveryRate: 0.3,
      revenueGrowth: 0.2,
      activeUsers: 0.15,
      responseTime: 0.15,
      errorRate: 0.1,
      uptime: 0.1
    };

    const scores = {
      recoveryRate: Math.min(metrics.recoveryRate / 30 * 100, 100),
      revenueGrowth: Math.max((metrics.revenueGrowth + 10) * 5, 0),
      activeUsers: Math.min(metrics.activeUsers / 100 * 100, 100),
      responseTime: Math.max(100 - metrics.responseTime * 2, 0),
      errorRate: Math.max(100 - metrics.errorRate * 10, 0),
      uptime: metrics.uptime
    };

    return Math.round(Object.entries(weights).reduce((total, [key, weight]) => {
      return total + (scores[key as keyof typeof scores] * weight);
    }, 0));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="glass-card">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{totalStores}</div>
          <p className="text-sm text-muted-foreground">Total Stores</p>
        </CardContent>
      </Card>
      
      <Card className="glass-card">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-status-success">{healthyStores}</div>
          <p className="text-sm text-muted-foreground">Healthy</p>
        </CardContent>
      </Card>
      
      <Card className="glass-card">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-status-warning">{warningStores}</div>
          <p className="text-sm text-muted-foreground">Warning</p>
        </CardContent>
      </Card>
      
      <Card className="glass-card">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-destructive">{criticalStores}</div>
          <p className="text-sm text-muted-foreground">Critical</p>
        </CardContent>
      </Card>
    </div>
  );
}
