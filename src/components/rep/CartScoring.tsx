import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Target, 
  Zap, 
  AlertCircle,
  CheckCircle,
  Star,
  BarChart3,
  Timer
} from 'lucide-react';

interface CartScoreFactors {
  priceScore: number;        // 0-100 based on cart value
  timeScore: number;         // 0-100 based on abandonment time
  itemScore: number;         // 0-100 based on item quality/count
  historyScore: number;      // 0-100 based on store conversion history
  competitionScore: number;  // 0-100 based on other reps activity
}

interface CartScoringProps {
  cartValue: number;
  abandonmentTime: number; // in minutes
  itemCount: number;
  storeConversionRate: number;
  competitorCount: number;
  avgOrderValue: number;
  showDetails?: boolean;
  size?: 'compact' | 'detailed';
}

export function CartScoring({ 
  cartValue, 
  abandonmentTime, 
  itemCount, 
  storeConversionRate, 
  competitorCount, 
  avgOrderValue,
  showDetails = false,
  size = 'compact'
}: CartScoringProps) {
  
  // Calculate individual scores
  const calculateScores = (): CartScoreFactors => {
    // Price Score: Higher cart value = higher score, but with diminishing returns
    const priceScore = Math.min(100, (cartValue / avgOrderValue) * 80);
    
    // Time Score: Recent abandonment = higher score (more likely to recover)
    const timeScore = Math.max(0, 100 - (abandonmentTime / 120) * 100); // 2 hours = 0 score
    
    // Item Score: More items = higher score, but with optimal range
    const itemScore = itemCount === 1 ? 60 : itemCount <= 3 ? 90 : itemCount <= 6 ? 100 : 85;
    
    // History Score: Based on store's historical conversion rate
    const historyScore = Math.min(100, storeConversionRate * 100);
    
    // Competition Score: Fewer competitors = higher score
    const competitionScore = Math.max(0, 100 - (competitorCount * 20));
    
    return {
      priceScore,
      timeScore,
      itemScore,
      historyScore,
      competitionScore
    };
  };

  const scores = calculateScores();
  
  // Calculate weighted total score
  const weights = {
    priceScore: 0.25,
    timeScore: 0.30,
    itemScore: 0.20,
    historyScore: 0.15,
    competitionScore: 0.10
  };

  const totalScore = Math.round(
    scores.priceScore * weights.priceScore +
    scores.timeScore * weights.timeScore +
    scores.itemScore * weights.itemScore +
    scores.historyScore * weights.historyScore +
    scores.competitionScore * weights.competitionScore
  );

  const getScoreLevel = (score: number) => {
    if (score >= 80) return { level: 'Excellent', color: 'text-status-success', bg: 'bg-status-success/10', icon: Star };
    if (score >= 60) return { level: 'Good', color: 'text-status-warning', bg: 'bg-status-warning/10', icon: TrendingUp };
    if (score >= 40) return { level: 'Fair', color: 'text-muted-foreground', bg: 'bg-muted/50', icon: Target };
    return { level: 'Low', color: 'text-destructive', bg: 'bg-destructive/10', icon: AlertCircle };
  };

  const scoreLevel = getScoreLevel(totalScore);
  const ScoreIcon = scoreLevel.icon;

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m ago`;
  };

  if (size === 'compact') {
    return (
      <div className="flex items-center gap-3 p-2 rounded-lg border border-border/50">
        <div className={`p-1.5 rounded-full ${scoreLevel.bg}`}>
          <ScoreIcon className={`h-3 w-3 ${scoreLevel.color}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">{totalScore}</span>
            <Badge variant="outline" className={`text-xs ${scoreLevel.color} border-current/20`}>
              {scoreLevel.level}
            </Badge>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-muted-foreground">
              ${cartValue.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatTime(abandonmentTime)}
            </span>
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
            <div className={`p-2 rounded-full ${scoreLevel.bg}`}>
              <ScoreIcon className={`h-4 w-4 ${scoreLevel.color}`} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Recovery Score</h3>
              <p className="text-xs text-muted-foreground">Likelihood of successful recovery</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground">{totalScore}</div>
            <Badge variant="outline" className={`${scoreLevel.color} border-current/20`}>
              {scoreLevel.level}
            </Badge>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="mb-4">
          <Progress value={totalScore} className="h-2" />
        </div>

        {/* Score Breakdown */}
        {showDetails && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Score Breakdown</h4>
            
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-3 w-3 text-primary" />
                  <span className="text-sm text-muted-foreground">Cart Value</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{scores.priceScore.toFixed(0)}</span>
                  <Progress value={scores.priceScore} className="w-16 h-1" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Timer className="h-3 w-3 text-status-warning" />
                  <span className="text-sm text-muted-foreground">Timing</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{scores.timeScore.toFixed(0)}</span>
                  <Progress value={scores.timeScore} className="w-16 h-1" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-3 w-3 text-blue-500" />
                  <span className="text-sm text-muted-foreground">Items</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{scores.itemScore.toFixed(0)}</span>
                  <Progress value={scores.itemScore} className="w-16 h-1" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3 w-3 text-status-success" />
                  <span className="text-sm text-muted-foreground">Store History</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{scores.historyScore.toFixed(0)}</span>
                  <Progress value={scores.historyScore} className="w-16 h-1" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-orange-500" />
                  <span className="text-sm text-muted-foreground">Competition</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{scores.competitionScore.toFixed(0)}</span>
                  <Progress value={scores.competitionScore} className="w-16 h-1" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">Cart Value:</span>
              <span className="ml-1 font-medium text-foreground">${cartValue.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Abandoned:</span>
              <span className="ml-1 font-medium text-foreground">{formatTime(abandonmentTime)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Items:</span>
              <span className="ml-1 font-medium text-foreground">{itemCount}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Store Rate:</span>
              <span className="ml-1 font-medium text-foreground">{(storeConversionRate * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Cart Score Comparison Component
interface CartScoreComparisonProps {
  carts: Array<{
    id: string;
    shopName: string;
    cartValue: number;
    abandonmentTime: number;
    itemCount: number;
    storeConversionRate: number;
    competitorCount: number;
    avgOrderValue: number;
  }>;
  onCartSelect?: (cartId: string) => void;
}

export function CartScoreComparison({ carts, onCartSelect }: CartScoreComparisonProps) {
  const sortedCarts = [...carts].sort((a, b) => {
    const scoreA = calculateCartScore(a);
    const scoreB = calculateCartScore(b);
    return scoreB - scoreA;
  });

  const calculateCartScore = (cart: CartScoreComparisonProps['carts'][0]) => {
    const avgOrderValue = cart.avgOrderValue;
    const priceScore = Math.min(100, (cart.cartValue / avgOrderValue) * 80);
    const timeScore = Math.max(0, 100 - (cart.abandonmentTime / 120) * 100);
    const itemScore = cart.itemCount === 1 ? 60 : cart.itemCount <= 3 ? 90 : cart.itemCount <= 6 ? 100 : 85;
    const historyScore = Math.min(100, cart.storeConversionRate * 100);
    const competitionScore = Math.max(0, 100 - (cart.competitorCount * 20));
    
    const weights = { priceScore: 0.25, timeScore: 0.30, itemScore: 0.20, historyScore: 0.15, competitionScore: 0.10 };
    
    return Math.round(
      priceScore * weights.priceScore +
      timeScore * weights.timeScore +
      itemScore * weights.itemScore +
      historyScore * weights.historyScore +
      competitionScore * weights.competitionScore
    );
  };

  return (
    <Card className="glass-card">
      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Cart Ranking by Recovery Score
        </h3>
        
        <div className="space-y-2">
          {sortedCarts.map((cart, index) => {
            const score = calculateCartScore(cart);
            const getScoreColor = (score: number) => {
              if (score >= 80) return 'text-status-success';
              if (score >= 60) return 'text-status-warning';
              if (score >= 40) return 'text-muted-foreground';
              return 'text-destructive';
            };
            
            return (
              <div 
                key={cart.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/30 transition-colors cursor-pointer"
                onClick={() => onCartSelect?.(cart.id)}
              >
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {index + 1}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{cart.shopName}</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${getScoreColor(score)}`}>{score}</span>
                      <span className="text-xs text-muted-foreground">${cart.cartValue.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span>{cart.itemCount} items</span>
                    <span>{Math.round(cart.abandonmentTime)}m ago</span>
                    <span>{(cart.storeConversionRate * 100).toFixed(1)}% rate</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
