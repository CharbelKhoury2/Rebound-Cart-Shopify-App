import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Download, 
  FileText, 
  Calendar as CalendarIcon,
  Filter,
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

interface ReportConfig {
  title: string;
  description: string;
  metrics: string[];
  filters: string[];
  formats: string[];
  icon: React.ReactNode;
}

interface ReportGeneratorProps {
  data: any[];
  onGenerateReport: (config: ReportConfiguration) => void;
  isLoading?: boolean;
}

interface ReportConfiguration {
  reportType: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  metrics: string[];
  filters: {
    stores?: string[];
    reps?: string[];
    tiers?: string[];
    status?: string[];
  };
  format: 'csv' | 'excel' | 'pdf';
  includeCharts: boolean;
  emailReport: boolean;
}

const reportTypes: ReportConfig[] = [
  {
    title: "Revenue Report",
    description: "Comprehensive revenue analysis with trends and forecasts",
    metrics: ["totalRevenue", "averageOrderValue", "revenueGrowth", "revenueByStore"],
    filters: ["stores", "reps", "tiers", "dateRange"],
    formats: ["csv", "excel", "pdf"],
    icon: <DollarSign className="h-5 w-5" />
  },
  {
    title: "Performance Report",
    description: "Sales rep performance metrics and rankings",
    metrics: ["recoveries", "conversionRate", "responseTime", "efficiency"],
    filters: ["reps", "tiers", "status", "dateRange"],
    formats: ["csv", "excel", "pdf"],
    icon: <TrendingUp className="h-5 w-5" />
  },
  {
    title: "Analytics Summary",
    description: "High-level analytics dashboard summary",
    metrics: ["overview", "trends", "comparisons", "forecasts"],
    filters: ["stores", "dateRange"],
    formats: ["pdf", "excel"],
    icon: <BarChart3 className="h-5 w-5" />
  },
  {
    title: "User Activity",
    description: "Detailed user activity and engagement metrics",
    metrics: ["activeUsers", "loginFrequency", "featureUsage", "performance"],
    filters: ["reps", "tiers", "status", "dateRange"],
    formats: ["csv", "excel"],
    icon: <Users className="h-5 w-5" />
  }
];

export function ReportGenerator({ data, onGenerateReport, isLoading = false }: ReportGeneratorProps) {
  const [selectedReport, setSelectedReport] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [config, setConfig] = useState<ReportConfiguration>({
    reportType: "",
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    },
    metrics: [],
    filters: {},
    format: "csv",
    includeCharts: true,
    emailReport: false
  });

  const availableMetrics = selectedReport 
    ? reportTypes.find(r => r.title === selectedReport)?.metrics || []
    : [];

  const handleGenerateReport = () => {
    if (!selectedReport) return;
    
    const reportConfig = {
      ...config,
      reportType: selectedReport
    };
    
    onGenerateReport(reportConfig);
    setIsDialogOpen(false);
    
    // Reset form
    setConfig({
      reportType: "",
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
      },
      metrics: [],
      filters: {},
      format: "csv",
      includeCharts: true,
      emailReport: false
    });
    setSelectedReport("");
  };

  const handleMetricToggle = (metric: string, checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      metrics: checked 
        ? [...prev.metrics, metric]
        : prev.metrics.filter(m => m !== metric)
    }));
  };

  const exportData = (format: 'csv' | 'excel' | 'json') => {
    const csvContent = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { 
      type: format === 'csv' ? 'text/csv' : 'application/json' 
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report.${format}`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Report Generator
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Quick Export Options */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Quick Export</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportData('csv')}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportData('json')}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export JSON
            </Button>
          </div>
        </div>

        {/* Report Types */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Custom Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {reportTypes.map((report) => (
              <Card 
                key={report.title}
                className={`p-4 border cursor-pointer transition-all hover:shadow-md ${
                  selectedReport === report.title 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedReport(report.title)}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {report.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{report.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {report.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {report.formats.map((fmt) => (
                        <Badge key={fmt} variant="secondary" className="text-xs">
                          {fmt.toUpperCase()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Generate Report Button */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="w-full" 
              disabled={!selectedReport || isLoading}
              onClick={() => setIsDialogOpen(true)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate Custom Report
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Generate Report: {selectedReport}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Date Range */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Date Range
                </label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="flex-1">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {format(config.dateRange.start, "MMM dd, yyyy")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={config.dateRange.start}
                        onSelect={(date) => date && setConfig(prev => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, start: date }
                        }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="flex-1">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {format(config.dateRange.end, "MMM dd, yyyy")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={config.dateRange.end}
                        onSelect={(date) => date && setConfig(prev => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, end: date }
                        }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Metrics Selection */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Include Metrics
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {availableMetrics.map((metric) => (
                    <div key={metric} className="flex items-center space-x-2">
                      <Checkbox
                        id={metric}
                        checked={config.metrics.includes(metric)}
                        onCheckedChange={(checked) => 
                          handleMetricToggle(metric, checked as boolean)
                        }
                      />
                      <label 
                        htmlFor={metric} 
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {metric.charAt(0).toUpperCase() + metric.slice(1).replace(/([A-Z])/g, ' $1')}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Format Selection */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Export Format
                </label>
                <Select value={config.format} onValueChange={(value: any) => 
                  setConfig(prev => ({ ...prev, format: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Additional Options */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="charts"
                    checked={config.includeCharts}
                    onCheckedChange={(checked) => 
                      setConfig(prev => ({ ...prev, includeCharts: checked as boolean }))
                    }
                  />
                  <label htmlFor="charts" className="text-sm font-medium leading-none">
                    Include charts and visualizations
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="email"
                    checked={config.emailReport}
                    onCheckedChange={(checked) => 
                      setConfig(prev => ({ ...prev, emailReport: checked as boolean }))
                    }
                  />
                  <label htmlFor="email" className="text-sm font-medium leading-none">
                    Email report when ready
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleGenerateReport}
                  disabled={config.metrics.length === 0 || isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Recent Reports */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Recent Reports</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Revenue Report - Q1 2024</p>
                  <p className="text-xs text-muted-foreground">Generated 2 hours ago</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Performance Summary</p>
                  <p className="text-xs text-muted-foreground">Generated yesterday</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
