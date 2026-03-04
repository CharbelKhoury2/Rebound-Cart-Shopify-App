import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  Users,
  DollarSign,
  ShoppingCart,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface MetricData {
  title: string;
  value: number | string;
  previousValue?: number;
  target?: number;
  unit?: string;
  format?: 'currency' | 'percentage' | 'number';
  status?: 'success' | 'warning' | 'error' | 'neutral';
  icon?: React.ReactNode;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
}

interface PerformanceMetricsProps {
  metrics: MetricData[];
  title?: string;
  showTrends?: boolean;
  showTargets?: boolean;
  refreshInterval?: number;
  onRefresh?: () => void;
}

export function PerformanceMetrics({
  metrics,
  title = "Performance Metrics",
  showTrends = true,
  showTargets = true,
  refreshInterval,
  onRefresh
}: PerformanceMetricsProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());


  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
        setLastUpdated(new Date());
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  const formatValue = (value: number | string, format?: string, unit?: string) => {
    if (typeof value === 'string') return value;

    let formattedValue: string;
    switch (format) {
      case 'currency':
        formattedValue = `$${value.toLocaleString()}`;
        break;
      case 'percentage':
        formattedValue = `${value.toFixed(1)}%`;
        break;
      default:
        formattedValue = value.toLocaleString();
    }

    return unit ? `${formattedValue} ${unit}` : formattedValue;
  };

  const calculateTrend = (current: number, previous?: number) => {
    if (previous === undefined || previous === 0) return { trend: 'neutral', change: 0 };

    const change = ((current - previous) / previous) * 100;
    return {
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
      change: Math.abs(change)
    };
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success': return 'text-status-success';
      case 'warning': return 'text-status-warning';
      case 'error': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertCircle className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3" />;
      case 'down': return <TrendingDown className="h-3 w-3" />;
      default: return null;
    }
  };

  const getTrendColor = (trend?: string) => {
    switch (trend) {
      case 'up': return 'text-status-success';
      case 'down': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const calculateProgress = (current: number, target?: number) => {
    if (!target) return 0;
    return Math.min((current / target) * 100, 100);
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {lastUpdated.toLocaleTimeString()}
            </div>
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <Activity className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {metrics.map((metric, index) => {
            const numericValue = typeof metric.value === 'number' ? metric.value : 0;
            const trend = metric.previousValue !== undefined
              ? calculateTrend(numericValue, metric.previousValue)
              : { trend: metric.trend || 'neutral', change: 0 };
            const progress = calculateProgress(numericValue, metric.target);

            return (
              <Card key={index} className="p-4 border border-border/50 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {metric.icon && (
                        <div className="p-1 rounded bg-primary/10 text-primary">
                          {metric.icon}
                        </div>
                      )}
                      <h3 className="text-sm font-medium text-foreground truncate">
                        {metric.title}
                      </h3>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {formatValue(metric.value, metric.format, metric.unit)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(metric.status)}
                    {showTrends && getTrendIcon(trend.trend)}
                  </div>
                </div>

                {showTrends && metric.previousValue !== undefined && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-medium ${getTrendColor(trend.trend)}`}>
                      {trend.trend !== 'neutral' && (trend.trend === 'up' ? '+' : '-')}
                      {trend.change.toFixed(1)}%
                    </span>
                    <span className="text-xs text-muted-foreground">vs previous</span>
                  </div>
                )}

                {showTargets && metric.target && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {progress.toFixed(0)}% of {formatValue(metric.target, metric.format, metric.unit)}
                      </span>
                    </div>
                    <Progress
                      value={progress}
                      className="h-2"
                    />
                  </div>
                )}

                {metric.description && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {metric.description}
                  </p>
                )}

                {metric.status && (
                  <div className="mt-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${getStatusColor(metric.status)}`}
                    >
                      {metric.status.charAt(0).toUpperCase() + metric.status.slice(1)}
                    </Badge>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {metrics.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No metrics available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Predefined metric configurations for common use cases
export const createRevenueMetrics = (data: any): MetricData[] => [
  {
    title: "Total Revenue",
    value: data.totalRevenue || 0,
    previousValue: data.previousRevenue,
    target: data.revenueTarget,
    format: "currency",
    status: data.totalRevenue >= data.revenueTarget ? "success" : "warning",
    icon: <DollarSign className="h-4 w-4" />,
    description: "Total revenue from all sources"
  },
  {
    title: "Average Order Value",
    value: data.averageOrderValue || 0,
    previousValue: data.previousAOV,
    target: data.aovTarget,
    format: "currency",
    icon: <ShoppingCart className="h-4 w-4" />,
    description: "Average value per recovered cart"
  },
  {
    title: "Recovery Rate",
    value: data.recoveryRate || 0,
    previousValue: data.previousRecoveryRate,
    target: data.recoveryRateTarget,
    format: "percentage",
    status: data.recoveryRate >= data.recoveryRateTarget ? "success" : "warning",
    icon: <Target className="h-4 w-4" />,
    description: "Percentage of carts successfully recovered"
  },
  {
    title: "Active Reps",
    value: data.activeReps || 0,
    previousValue: data.previousActiveReps,
    target: data.activeRepsTarget,
    format: "number",
    icon: <Users className="h-4 w-4" />,
    description: "Number of active sales representatives"
  }
];

export const createOperationalMetrics = (data: any): MetricData[] => [
  {
    title: "Response Time",
    value: data.averageResponseTime || 0,
    target: data.responseTimeTarget,
    unit: "min",
    status: data.averageResponseTime <= data.responseTimeTarget ? "success" : "warning",
    icon: <Clock className="h-4 w-4" />,
    description: "Average time to respond to abandoned carts"
  },
  {
    title: "Daily Processed",
    value: data.dailyProcessed || 0,
    previousValue: data.previousDailyProcessed,
    format: "number",
    icon: <Activity className="h-4 w-4" />,
    description: "Number of carts processed daily"
  },
  {
    title: "Success Rate",
    value: data.successRate || 0,
    target: data.successRateTarget,
    format: "percentage",
    status: data.successRate >= data.successRateTarget ? "success" : "error",
    icon: <CheckCircle className="h-4 w-4" />,
    description: "Overall success recovery rate"
  },
  {
    title: "Efficiency Score",
    value: data.efficiencyScore || 0,
    format: "percentage",
    icon: <Zap className="h-4 w-4" />,
    description: "Overall operational efficiency"
  }
];
