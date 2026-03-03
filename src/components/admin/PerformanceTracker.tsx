import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Zap, 
  Clock, 
  DollarSign,
  ShoppingCart,
  Award,
  Calendar,
  BarChart3,
  Users,
  Activity
} from 'lucide-react';

interface PerformanceMetrics {
  totalRecoveries: number;
  recoveryRate: number;
  averageResponseTime: number;
  totalRevenue: number;
  customerSatisfaction: number;
  weeklyProgress: number[];
  monthlyTarget: number;
  rank: number;
  totalReps: number;
}

interface PerformanceTrackerProps {
  repId: string;
  repName: string;
  metrics: PerformanceMetrics;
  period?: 'week' | 'month' | 'quarter';
  showDetails?: boolean;
  size?: 'compact' | 'detailed';
}

export function PerformanceTracker({ 
  repId, 
  repName, 
  metrics, 
  period = 'month',
  showDetails = false,
  size = 'compact'
}: PerformanceTrackerProps) {
  
  const calculatePerformanceScore = () => {
    const weights = {
      recoveryRate: 0.3,
      responseTime: 0.2,
      revenue: 0.25,
      satisfaction: 0.15,
      consistency: 0.1
    };

    const scores = {
      recoveryRate: Math.min((metrics.recoveryRate / 30) * 100, 100), // Target: 30%
      responseTime: Math.max(100 - (metrics.averageResponseTime / 10) * 100, 0), // Target: <10min
      revenue: Math.min((metrics.totalRevenue / 10000) * 100, 100), // Target: $10k
      satisfaction: metrics.customerSatisfaction, // Direct percentage
      consistency: metrics.weeklyProgress.reduce((sum, week) => sum + (week > 0 ? 1 : 0), 0) / metrics.weeklyProgress.length * 100
    };

    return Math.round(Object.entries(weights).reduce((total, [key, weight]) => {
      return total + (scores[key as keyof typeof scores] * weight);
    }, 0));
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { level: 'Exceptional', color: 'text-status-success', bg: 'bg-status-success/10' };
    if (score >= 75) return { level: 'Excellent', color: 'text-status-success', bg: 'bg-status-success/10' };
    if (score >= 60) return { level: 'Good', color: 'text-status-warning', bg: 'bg-status-warning/10' };
    if (score >= 40) return { level: 'Average', color: 'text-muted-foreground', bg: 'bg-muted/50' };
    return { level: 'Needs Improvement', color: 'text-destructive', bg: 'bg-destructive/10' };
  };

  const performanceScore = calculatePerformanceScore();
  const performanceLevel = getPerformanceLevel(performanceScore);
  const targetProgress = (metrics.totalRevenue / metrics.monthlyTarget) * 100;

  const getTrendIcon = (value: number, inverse = false) => {
    const isPositive = inverse ? value < 0 : value > 0;
    if (isPositive) return <TrendingUp className="h-3 w-3 text-status-success" />;
    if (value !== 0) return <TrendingDown className="h-3 w-3 text-destructive" />;
    return <Activity className="h-3 w-3 text-muted-foreground" />;
  };

  if (size === 'compact') {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50">
        <div className={`p-2 rounded-full ${performanceLevel.bg}`}>
          <BarChart3 className={`h-4 w-4 ${performanceLevel.color}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">{repName}</span>
            <Badge variant="outline" className={`text-xs ${performanceLevel.color} border-current/20`}>
              {performanceScore}
            </Badge>
          </div>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-xs text-muted-foreground">
              {metrics.totalRecoveries} recoveries
            </span>
            <span className="text-xs text-muted-foreground">
              {metrics.recoveryRate.toFixed(1)}% rate
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{repName}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={`${performanceLevel.color} border-current/20`}
            >
              {performanceLevel.level}
            </Badge>
            <Badge variant="secondary">
              #{metrics.rank} of {metrics.totalReps}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Performance Score */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Performance Score</span>
            <span className="font-semibold text-foreground">{performanceScore}/100</span>
          </div>
          <Progress value={performanceScore} className="h-2" />
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-primary/10">
              <ShoppingCart className="h-3 w-3 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Total Recoveries</p>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-foreground">
                  {metrics.totalRecoveries}
                </span>
                {getTrendIcon(metrics.weeklyProgress[metrics.weeklyProgress.length - 1] || 0)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-status-success/10">
              <Target className="h-3 w-3 text-status-success" />
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
            <div className="p-1.5 rounded bg-status-warning/10">
              <Clock className="h-3 w-3 text-status-warning" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Avg Response Time</p>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-foreground">
                  {metrics.averageResponseTime}m
                </span>
                {getTrendIcon(metrics.averageResponseTime, true)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-blue-500/10">
              <DollarSign className="h-3 w-3 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Total Revenue</p>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-foreground">
                  ${metrics.totalRevenue.toLocaleString()}
                </span>
                {getTrendIcon(metrics.totalRevenue - 5000)}
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Target Progress */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Monthly Target</span>
            <span className="font-medium text-foreground">
              ${metrics.totalRevenue.toLocaleString()} / ${metrics.monthlyTarget.toLocaleString()}
            </span>
          </div>
          <Progress value={Math.min(targetProgress, 100)} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {targetProgress.toFixed(1)}% complete
          </p>
        </div>

        {/* Weekly Progress Chart */}
        {showDetails && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Weekly Progress</h4>
            <div className="space-y-1">
              {metrics.weeklyProgress.map((week, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-8">W{index + 1}</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${Math.min((week / 10) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-foreground w-8 text-right">
                    {week}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customer Satisfaction */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-status-warning" />
            <span className="text-sm text-muted-foreground">Customer Satisfaction</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-foreground">
              {metrics.customerSatisfaction.toFixed(1)}%
            </span>
            {getTrendIcon(metrics.customerSatisfaction - 80)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Performance Leaderboard Component
interface PerformanceLeaderboardProps {
  reps: Array<{
    id: string;
    name: string;
    metrics: PerformanceMetrics;
  }>;
  period?: 'week' | 'month' | 'quarter';
  limit?: number;
}

export function PerformanceLeaderboard({ 
  reps, 
  period = 'month', 
  limit = 10 
}: PerformanceLeaderboardProps) {
  const sortedReps = useMemo(() => {
    return reps
      .map(rep => ({
        ...rep,
        score: (() => {
          const weights = {
            recoveryRate: 0.3,
            responseTime: 0.2,
            revenue: 0.25,
            satisfaction: 0.15,
            consistency: 0.1
          };

          const scores = {
            recoveryRate: Math.min((rep.metrics.recoveryRate / 30) * 100, 100),
            responseTime: Math.max(100 - (rep.metrics.averageResponseTime / 10) * 100, 0),
            revenue: Math.min((rep.metrics.totalRevenue / 10000) * 100, 100),
            satisfaction: rep.metrics.customerSatisfaction,
            consistency: rep.metrics.weeklyProgress.reduce((sum, week) => sum + (week > 0 ? 1 : 0), 0) / rep.metrics.weeklyProgress.length * 100
          };

          return Math.round(Object.entries(weights).reduce((total, [key, weight]) => {
            return total + (scores[key as keyof typeof scores] * weight);
          }, 0));
        })()
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }, [reps]);

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Performance Leaderboard
          <Badge variant="outline" className="ml-auto">
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {sortedReps.map((rep, index) => (
            <div key={rep.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/30 transition-colors">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                index === 0 ? 'bg-yellow-500/20 text-yellow-600' :
                index === 1 ? 'bg-gray-400/20 text-gray-600' :
                index === 2 ? 'bg-orange-600/20 text-orange-600' :
                'bg-muted text-muted-foreground'
              }`}>
                {index + 1}
              </div>
              
              <div className="flex-1">
                <p className="font-medium text-foreground">{rep.name}</p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {rep.metrics.totalRecoveries} recoveries
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {rep.metrics.recoveryRate.toFixed(1)}% rate
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ${rep.metrics.totalRevenue.toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-bold text-foreground">{rep.score}</div>
                <div className="text-xs text-muted-foreground">score</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
