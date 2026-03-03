import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar,
  Target,
  AlertCircle,
  CheckCircle,
  Settings,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

interface CommissionRule {
  id: string;
  name: string;
  type: 'percentage' | 'fixed' | 'tiered';
  value: number;
  conditions: {
    minOrderValue?: number;
    maxOrderValue?: number;
    repTier?: string[];
    productCategory?: string[];
  };
  isActive: boolean;
}

interface CommissionCalculation {
  orderId: string;
  orderValue: number;
  repName: string;
  repTier: string;
  baseCommission: number;
  bonusCommission: number;
  totalCommission: number;
  platformFee: number;
  netPayout: number;
  appliedRules: string[];
}

interface CommissionCalculatorProps {
  orders: Array<{
    id: string;
    totalAmount: number;
    repName: string;
    repTier: string;
    productCategory?: string;
  }>;
  onCalculationsComplete: (calculations: CommissionCalculation[]) => void;
  platformFeeRate?: number;
}

export function CommissionCalculator({ 
  orders, 
  onCalculationsComplete, 
  platformFeeRate = 0.05 
}: CommissionCalculatorProps) {
  const [rules, setRules] = useState<CommissionRule[]>([
    {
      id: 'basic-percentage',
      name: 'Basic Commission - 10%',
      type: 'percentage',
      value: 10,
      conditions: {},
      isActive: true
    },
    {
      id: 'high-value-bonus',
      name: 'High Value Bonus - 15%',
      type: 'percentage',
      value: 15,
      conditions: { minOrderValue: 1000 },
      isActive: true
    },
    {
      id: 'platinum-tier-bonus',
      name: 'Platinum Tier Bonus - 5%',
      type: 'percentage',
      value: 5,
      conditions: { repTier: ['PLATINUM'] },
      isActive: true
    },
    {
      id: 'fixed-bonus',
      name: 'Fixed Bonus - $50',
      type: 'fixed',
      value: 50,
      conditions: { minOrderValue: 500 },
      isActive: false
    }
  ]);

  const [isCalculating, setIsCalculating] = useState(false);
  const [newRule, setNewRule] = useState<Partial<CommissionRule>>({
    name: '',
    type: 'percentage',
    value: 0,
    conditions: {},
    isActive: true
  });

  const calculateCommission = (order: typeof orders[0]): CommissionCalculation => {
    const appliedRules: string[] = [];
    let baseCommission = 0;
    let bonusCommission = 0;

    // Apply active rules
    rules.filter(rule => rule.isActive).forEach(rule => {
      let isApplicable = true;

      // Check conditions
      if (rule.conditions.minOrderValue && order.totalAmount < rule.conditions.minOrderValue) {
        isApplicable = false;
      }
      if (rule.conditions.maxOrderValue && order.totalAmount > rule.conditions.maxOrderValue) {
        isApplicable = false;
      }
      if (rule.conditions.repTier && !rule.conditions.repTier.includes(order.repTier)) {
        isApplicable = false;
      }
      if (rule.conditions.productCategory && order.productCategory && 
          !rule.conditions.productCategory.includes(order.productCategory)) {
        isApplicable = false;
      }

      if (isApplicable) {
        appliedRules.push(rule.name);
        
        if (rule.type === 'percentage') {
          const commission = (order.totalAmount * rule.value) / 100;
          if (rule.id.includes('bonus')) {
            bonusCommission += commission;
          } else {
            baseCommission += commission;
          }
        } else if (rule.type === 'fixed') {
          bonusCommission += rule.value;
        } else if (rule.type === 'tiered') {
          // Tiered logic would go here
          baseCommission += (order.totalAmount * rule.value) / 100;
        }
      }
    });

    const totalCommission = baseCommission + bonusCommission;
    const platformFee = order.totalAmount * platformFeeRate;
    const netPayout = totalCommission - platformFee;

    return {
      orderId: order.id,
      orderValue: order.totalAmount,
      repName: order.repName,
      repTier: order.repTier,
      baseCommission,
      bonusCommission,
      totalCommission,
      platformFee,
      netPayout,
      appliedRules
    };
  };

  const runCalculations = async () => {
    setIsCalculating(true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const calculations = orders.map(order => calculateCommission(order));
    onCalculationsComplete(calculations);
    setIsCalculating(false);
  };

  const addRule = () => {
    if (!newRule.name || newRule.value === undefined) return;
    
    const rule: CommissionRule = {
      id: `rule-${Date.now()}`,
      name: newRule.name,
      type: newRule.type as 'percentage' | 'fixed' | 'tiered',
      value: newRule.value,
      conditions: newRule.conditions || {},
      isActive: newRule.isActive || true
    };
    
    setRules(prev => [...prev, rule]);
    setNewRule({ name: '', type: 'percentage', value: 0, conditions: {}, isActive: true });
  };

  const toggleRule = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
    ));
  };

  const deleteRule = (ruleId: string) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId));
  };

  const summary = useMemo(() => {
    const activeRules = rules.filter(rule => rule.isActive);
    const totalOrders = orders.length;
    const estimatedCommissions = orders.reduce((sum, order) => {
      const calc = calculateCommission(order);
      return sum + calc.totalCommission;
    }, 0);
    const estimatedPlatformFees = orders.reduce((sum, order) => {
      return sum + (order.totalAmount * platformFeeRate);
    }, 0);

    return {
      activeRules: activeRules.length,
      totalRules: rules.length,
      totalOrders,
      estimatedCommissions,
      estimatedPlatformFees,
      estimatedNetPayout: estimatedCommissions - estimatedPlatformFees
    };
  }, [rules, orders, platformFeeRate]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{summary.activeRules}</div>
            <p className="text-xs text-muted-foreground">Active Rules</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-status-success">${summary.estimatedCommissions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Est. Commissions</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-status-warning">${summary.estimatedPlatformFees.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Est. Platform Fees</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">${summary.estimatedNetPayout.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Est. Net Payout</p>
          </CardContent>
        </Card>
      </div>

      {/* Commission Rules */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Commission Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {rules.map(rule => (
            <div key={rule.id} className={`p-4 rounded-lg border ${rule.isActive ? 'border-primary/50 bg-primary/5' : 'border-border/50 bg-muted/20'}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-foreground">{rule.name}</h4>
                    <Badge variant={rule.isActive ? "default" : "secondary"}>
                      {rule.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm text-muted-foreground">
                      {rule.type === 'percentage' ? `${rule.value}%` : 
                       rule.type === 'fixed' ? `$${rule.value}` : 
                       `Tiered ${rule.value}%`}
                    </span>
                    {rule.conditions.minOrderValue && (
                      <span className="text-xs text-muted-foreground">
                        Min: ${rule.conditions.minOrderValue}
                      </span>
                    )}
                    {rule.conditions.repTier && (
                      <span className="text-xs text-muted-foreground">
                        Tiers: {rule.conditions.repTier.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleRule(rule.id)}
                  >
                    {rule.isActive ? "Disable" : "Enable"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteRule(rule.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          {/* Add New Rule */}
          <div className="p-4 rounded-lg border border-dashed border-border/50">
            <h4 className="font-medium text-foreground mb-3">Add New Rule</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Input
                placeholder="Rule name"
                value={newRule.name}
                onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
              />
              <select
                value={newRule.type}
                onChange={(e) => setNewRule(prev => ({ ...prev, type: e.target.value as any }))}
                className="px-3 py-2 rounded-md border border-border bg-background text-foreground"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed</option>
                <option value="tiered">Tiered</option>
              </select>
              <Input
                type="number"
                placeholder="Value"
                value={newRule.value || ''}
                onChange={(e) => setNewRule(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
              />
              <Button onClick={addRule} disabled={!newRule.name}>
                Add Rule
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calculate Button */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Ready to Calculate</h3>
              <p className="text-sm text-muted-foreground">
                Process {orders.length} orders with {summary.activeRules} active rules
              </p>
            </div>
            <Button 
              onClick={runCalculations} 
              disabled={isCalculating || orders.length === 0}
              className="flex items-center gap-2"
            >
              {isCalculating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4" />
                  Run Calculations
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
