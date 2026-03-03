import React, { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Calendar, Download, Filter } from 'lucide-react';

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
  recoveryRate: number;
}

interface SalesChartProps {
  data: SalesData[];
  title?: string;
  height?: number;
  showControls?: boolean;
  chartType?: 'line' | 'bar' | 'area';
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
}

export function SalesChart({ 
  data, 
  title = "Sales Performance", 
  height = 300,
  showControls = true,
  chartType = 'line',
  timeRange = 'month'
}: SalesChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'orders' | 'recoveryRate'>('revenue');
  const [selectedChartType, setSelectedChartType] = useState<'line' | 'bar' | 'area'>(chartType);

  const metrics = [
    { key: 'revenue', label: 'Revenue', color: 'var(--primary)', format: 'currency' },
    { key: 'orders', label: 'Orders', color: 'var(--status-success)', format: 'number' },
    { key: 'recoveryRate', label: 'Recovery Rate', color: 'var(--status-warning)', format: 'percentage' }
  ];

  const currentMetric = metrics.find(m => m.key === selectedMetric);

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'currency':
        return `$${value.toLocaleString()}`;
      case 'percentage':
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString();
    }
  };

  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      formattedDate: new Date(item.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }));
  }, [data]);

  const renderChart = () => {
    const chartHeight = height;
    const dataKey = selectedMetric;
    const strokeColor = currentMetric?.color || 'var(--primary)';

    switch (selectedChartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis 
                dataKey="formattedDate" 
                stroke="var(--muted-foreground)" 
                fontSize={12}
              />
              <YAxis 
                stroke="var(--muted-foreground)" 
                fontSize={12}
                tickFormatter={(value) => formatValue(value, currentMetric?.format || 'number')}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--card)', 
                  border: '1px solid var(--border)',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [formatValue(value, currentMetric?.format || 'number'), currentMetric?.label]}
              />
              <Bar 
                dataKey={dataKey} 
                fill={strokeColor}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis 
                dataKey="formattedDate" 
                stroke="var(--muted-foreground)" 
                fontSize={12}
              />
              <YAxis 
                stroke="var(--muted-foreground)" 
                fontSize={12}
                tickFormatter={(value) => formatValue(value, currentMetric?.format || 'number')}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--card)', 
                  border: '1px solid var(--border)',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [formatValue(value, currentMetric?.format || 'number'), currentMetric?.label]}
              />
              <Area 
                type="monotone" 
                dataKey={dataKey} 
                stroke={strokeColor}
                fill={strokeColor}
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      default:
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis 
                dataKey="formattedDate" 
                stroke="var(--muted-foreground)" 
                fontSize={12}
              />
              <YAxis 
                stroke="var(--muted-foreground)" 
                fontSize={12}
                tickFormatter={(value) => formatValue(value, currentMetric?.format || 'number')}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--card)', 
                  border: '1px solid var(--border)',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [formatValue(value, currentMetric?.format || 'number'), currentMetric?.label]}
              />
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke={strokeColor}
                strokeWidth={2}
                dot={{ fill: strokeColor, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  const calculateTrend = () => {
    if (data.length < 2) return { trend: 'neutral', change: 0 };
    
    const recent = data.slice(-7).reduce((sum, item) => sum + (item[selectedMetric as keyof SalesData] as number), 0);
    const previous = data.slice(-14, -7).reduce((sum, item) => sum + (item[selectedMetric as keyof SalesData] as number), 0);
    
    if (previous === 0) return { trend: 'neutral', change: 0 };
    
    const change = ((recent - previous) / previous) * 100;
    return {
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
      change: Math.abs(change)
    };
  };

  const trend = calculateTrend();
  const totalValue = data.reduce((sum, item) => sum + (item[selectedMetric as keyof SalesData] as number), 0);
  const averageValue = totalValue / data.length;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                {trend.trend === 'up' && <TrendingUp className="h-4 w-4 text-status-success" />}
                {trend.trend === 'down' && <TrendingDown className="h-4 w-4 text-destructive" />}
                <span className={`text-sm font-medium ${
                  trend.trend === 'up' ? 'text-status-success' : 
                  trend.trend === 'down' ? 'text-destructive' : 
                  'text-muted-foreground'
                }`}>
                  {trend.trend !== 'neutral' && '+'}{trend.change.toFixed(1)}%
                </span>
              </div>
              <Badge variant="outline" className="text-xs">
                {timeRange}
              </Badge>
            </div>
          </div>
          {showControls && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {showControls && (
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
              {metrics.map((metric) => (
                <Button
                  key={metric.key}
                  variant={selectedMetric === metric.key ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedMetric(metric.key as any)}
                  className="text-xs h-7"
                >
                  {metric.label}
                </Button>
              ))}
            </div>
            
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
              <Button
                variant={selectedChartType === 'line' ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedChartType('line')}
                className="text-xs h-7"
              >
                Line
              </Button>
              <Button
                variant={selectedChartType === 'bar' ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedChartType('bar')}
                className="text-xs h-7"
              >
                Bar
              </Button>
              <Button
                variant={selectedChartType === 'area' ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedChartType('area')}
                className="text-xs h-7"
              >
                Area
              </Button>
            </div>
          </div>
        )}
        
        {renderChart()}
        
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">Total {currentMetric?.label}</p>
            <p className="text-lg font-semibold">
              {formatValue(totalValue, currentMetric?.format || 'number')}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Average {currentMetric?.label}</p>
            <p className="text-lg font-semibold">
              {formatValue(averageValue, currentMetric?.format || 'number')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
