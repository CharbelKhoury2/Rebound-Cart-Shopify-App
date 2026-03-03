import { ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: "increase" | "decrease" | "neutral";
  icon?: ReactNode;
  description?: string;
  target?: string;
  format?: "currency" | "percentage" | "number";
}

export function KPICard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon, 
  description, 
  target,
  format = "number" 
}: KPICardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case "currency":
        return `$${val.toLocaleString()}`;
      case "percentage":
        return `${val}%`;
      default:
        return val.toLocaleString();
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case "increase":
        return <TrendingUp className="h-3 w-3" />;
      case "decrease":
        return <TrendingDown className="h-3 w-3" />;
      default:
        return <Minus className="h-3 w-3" />;
    }
  };

  const getChangeColor = () => {
    switch (changeType) {
      case "increase":
        return "text-status-success";
      case "decrease":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="glass-card p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold text-foreground">{formatValue(value)}</p>
          {target && (
            <p className="text-xs text-muted-foreground mt-1">Target: {target}</p>
          )}
        </div>
        {icon && (
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>
      
      {change !== undefined && (
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 ${getChangeColor()}`}>
            {getChangeIcon()}
            <span className="text-sm font-medium">
              {change > 0 ? "+" : ""}{change}%
            </span>
          </div>
          <span className="text-xs text-muted-foreground">vs last period</span>
        </div>
      )}
      
      {description && (
        <p className="text-xs text-muted-foreground mt-2">{description}</p>
      )}
    </div>
  );
}

interface KPITrendProps {
  title: string;
  data: Array<{ name: string; value: number; target?: number }>;
  color?: string;
  targetColor?: string;
  format?: "currency" | "percentage" | "number";
}

export function KPITrend({ title, data, color = "var(--primary)", targetColor = "var(--status-warning)", format = "number" }: KPITrendProps) {
  const formatValue = (val: number) => {
    switch (format) {
      case "currency":
        return `$${val.toLocaleString()}`;
      case "percentage":
        return `${val}%`;
      default:
        return val.toLocaleString();
    }
  };

  const latestValue = data[data.length - 1]?.value || 0;
  const targetValue = data[data.length - 1]?.target;
  const hasTarget = targetValue !== undefined;

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {hasTarget && (
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-muted-foreground">Actual</span>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: targetColor }} />
            <span className="text-muted-foreground">Target</span>
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        {data.slice(-7).map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-8">{item.name}</span>
            <div className="flex-1 relative">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min((item.value / (targetValue || item.value * 1.2)) * 100, 100)}%`,
                    backgroundColor: color
                  }}
                />
                {hasTarget && (
                  <div 
                    className="absolute top-0 h-full w-0.5 rounded-full"
                    style={{ 
                      left: `${(targetValue / (targetValue * 1.2)) * 100}%`,
                      backgroundColor: targetColor
                    }}
                  />
                )}
              </div>
            </div>
            <span className="text-xs font-medium text-foreground w-16 text-right">
              {formatValue(item.value)}
            </span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Current</span>
          <span className="font-semibold text-foreground">{formatValue(latestValue)}</span>
        </div>
        {hasTarget && (
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-muted-foreground">Target</span>
            <span className="font-medium text-foreground">{formatValue(targetValue)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

interface KPIDashboardProps {
  title: string;
  period: string;
  children: ReactNode;
}

export function KPIDashboard({ title, period, children }: KPIDashboardProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{period}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {children}
      </div>
    </div>
  );
}
