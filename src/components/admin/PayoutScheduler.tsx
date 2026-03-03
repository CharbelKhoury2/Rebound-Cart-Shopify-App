import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Users, 
  CheckCircle, 
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Download,
  Mail,
  Settings,
  TrendingUp,
  BarChart3,
  Target
} from 'lucide-react';

interface PayoutSchedule {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  nextRunDate: Date;
  isActive: boolean;
  autoApprove: boolean;
  emailNotifications: boolean;
  minimumPayout: number;
  processingFee: number;
  lastRunDate?: Date;
  status: 'scheduled' | 'processing' | 'completed' | 'failed';
}

interface PayoutBatch {
  id: string;
  scheduleId: string;
  period: string;
  totalAmount: number;
  repCount: number;
  commissionCount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  processedAt?: Date;
  errorMessage?: string;
}

interface PayoutSchedulerProps {
  schedules: PayoutSchedule[];
  batches: PayoutBatch[];
  onCreateSchedule: (schedule: Omit<PayoutSchedule, 'id'>) => void;
  onToggleSchedule: (scheduleId: string) => void;
  onRunPayout: (scheduleId: string) => void;
  onExportBatch: (batchId: string) => void;
  onResendNotifications: (batchId: string) => void;
}

export function PayoutScheduler({
  schedules,
  batches,
  onCreateSchedule,
  onToggleSchedule,
  onRunPayout,
  onExportBatch,
  onResendNotifications
}: PayoutSchedulerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    name: '',
    frequency: 'weekly' as const,
    autoApprove: true,
    emailNotifications: true,
    minimumPayout: 50,
    processingFee: 2.5
  });

  const activeSchedules = schedules.filter(s => s.isActive);
  const pendingBatches = batches.filter(b => b.status === 'pending');
  const processingBatches = batches.filter(b => b.status === 'processing');

  const totalPendingAmount = pendingBatches.reduce((sum, batch) => sum + batch.totalAmount, 0);
  const totalRepsPending = pendingBatches.reduce((sum, batch) => sum + batch.repCount, 0);

  const getNextRunDate = (frequency: string) => {
    const now = new Date();
    switch (frequency) {
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'biweekly':
        return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
      case 'monthly':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      default:
        return now;
    }
  };

  const handleCreateSchedule = () => {
    if (!newSchedule.name) return;

    const schedule: Omit<PayoutSchedule, 'id'> = {
      ...newSchedule,
      nextRunDate: getNextRunDate(newSchedule.frequency),
      status: 'scheduled',
      isActive: true
    };

    onCreateSchedule(schedule);
    setNewSchedule({
      name: '',
      frequency: 'weekly',
      autoApprove: true,
      emailNotifications: true,
      minimumPayout: 50,
      processingFee: 2.5
    });
    setShowCreateForm(false);
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'biweekly': return 'Bi-weekly';
      case 'monthly': return 'Monthly';
      default: return frequency;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-status-pending';
      case 'processing': return 'text-status-warning';
      case 'completed': return 'text-status-success';
      case 'failed': return 'text-destructive';
      case 'pending': return 'text-status-pending';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      scheduled: 'bg-status-pending/10 text-status-pending',
      processing: 'bg-status-warning/10 text-status-warning',
      completed: 'bg-status-success/10 text-status-success',
      failed: 'bg-destructive/10 text-destructive',
      pending: 'bg-status-pending/10 text-status-pending'
    };
    return colors[status as keyof typeof colors] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{activeSchedules.length}</div>
            <p className="text-xs text-muted-foreground">Active Schedules</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-status-warning">${totalPendingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Pending Payouts</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{totalRepsPending}</div>
            <p className="text-xs text-muted-foreground">Reps Pending</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-status-success">{pendingBatches.length}</div>
            <p className="text-xs text-muted-foreground">Pending Batches</p>
          </CardContent>
        </Card>
      </div>

      {/* Payout Schedules */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Payout Schedules
            </CardTitle>
            <Button onClick={() => setShowCreateForm(!showCreateForm)}>
              {showCreateForm ? 'Cancel' : 'Create Schedule'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Create Schedule Form */}
          {showCreateForm && (
            <div className="p-4 rounded-lg border border-dashed border-border/50 bg-muted/20">
              <h4 className="font-medium text-foreground mb-3">Create New Schedule</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Schedule Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Weekly Payout Run"
                    value={newSchedule.name}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Frequency</label>
                  <select
                    value={newSchedule.frequency}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, frequency: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Minimum Payout ($)</label>
                  <input
                    type="number"
                    value={newSchedule.minimumPayout}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, minimumPayout: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Processing Fee (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newSchedule.processingFee}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, processingFee: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newSchedule.autoApprove}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, autoApprove: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm text-foreground">Auto-approve payouts</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newSchedule.emailNotifications}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm text-foreground">Send email notifications</span>
                </label>
              </div>
              
              <Button onClick={handleCreateSchedule} disabled={!newSchedule.name} className="mt-4">
                Create Schedule
              </Button>
            </div>
          )}

          {/* Existing Schedules */}
          {schedules.map(schedule => (
            <div key={schedule.id} className={`p-4 rounded-lg border ${schedule.isActive ? 'border-primary/50 bg-primary/5' : 'border-border/50 bg-muted/20'}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-foreground">{schedule.name}</h4>
                    <Badge variant={schedule.isActive ? "default" : "secondary"}>
                      {schedule.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline" className={getStatusColor(schedule.status)}>
                      {schedule.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {getFrequencyLabel(schedule.frequency)}
                    </span>
                    <span>Min: ${schedule.minimumPayout}</span>
                    <span>Fee: {schedule.processingFee}%</span>
                    {schedule.autoApprove && <span>Auto-approve</span>}
                    {schedule.emailNotifications && <span>Email alerts</span>}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span>Next run: {schedule.nextRunDate.toLocaleDateString()}</span>
                    {schedule.lastRunDate && (
                      <span>Last run: {schedule.lastRunDate.toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleSchedule(schedule.id)}
                  >
                    {schedule.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {schedule.isActive ? "Pause" : "Resume"}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRunPayout(schedule.id)}
                    disabled={!schedule.isActive || schedule.status === 'processing'}
                  >
                    <DollarSign className="h-4 w-4" />
                    Run Now
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Payout Batches */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Recent Payout Batches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {batches.slice(0, 10).map(batch => (
              <div key={batch.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{batch.period}</span>
                    <Badge variant="outline" className={getStatusBadge(batch.status)}>
                      {batch.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span>${batch.totalAmount.toLocaleString()}</span>
                    <span>{batch.repCount} reps</span>
                    <span>{batch.commissionCount} commissions</span>
                    <span>Created: {batch.createdAt.toLocaleDateString()}</span>
                  </div>
                  {batch.errorMessage && (
                    <p className="text-xs text-destructive mt-1">{batch.errorMessage}</p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {batch.status === 'completed' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onExportBatch(batch.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onResendNotifications(batch.id)}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  
                  {batch.status === 'failed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRunPayout(batch.scheduleId)}
                    >
                      <RotateCcw className="h-4 w-4" />
                      Retry
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
