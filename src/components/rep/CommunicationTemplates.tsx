import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  MessageSquare, 
  Send, 
  Copy, 
  Edit, 
  Star, 
  Clock, 
  CheckCircle,
  Mail,
  Phone,
  Zap,
  Target,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

interface CommunicationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'phone_script';
  category: 'initial' | 'follow_up' | 'urgent' | 'success' | 'custom';
  subject?: string;
  content: string;
  variables: string[];
  successRate?: number;
  responseTime?: number;
  isFavorite?: boolean;
  usageCount: number;
}

interface CommunicationTemplatesProps {
  customerEmail?: string;
  customerName?: string;
  cartValue?: number;
  storeName?: string;
  onSendMessage?: (template: CommunicationTemplate, customMessage?: string) => void;
}

export function CommunicationTemplates({ 
  customerEmail = '', 
  customerName = '', 
  cartValue = 0, 
  storeName = '',
  onSendMessage 
}: CommunicationTemplatesProps) {
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([
    {
      id: 'initial-email',
      name: 'Initial Contact Email',
      type: 'email',
      category: 'initial',
      subject: 'Regarding your recent cart at {{storeName}}',
      content: `Hi {{customerName}},

I noticed you recently left some items in your cart at {{storeName}}. I'm here to help you complete your purchase and answer any questions you might have.

Your cart total is ${{cartValue}}, and I'd be happy to assist with:
- Product questions
- Payment issues
- Shipping information
- Discount opportunities

Would you like me to help you complete your order?

Best regards,
{{repName}}`,
      variables: ['customerName', 'storeName', 'cartValue', 'discountedValue', 'repName'],
      successRate: 78,
      responseTime: 45,
      usageCount: 156
    },
    {
      id: 'follow-up-sms',
      name: 'Follow-up SMS',
      type: 'sms',
      category: 'follow_up',
      content: `Hi {{customerName}}! Following up on your {{storeName}} cart (${{cartValue}}). Can I help you complete your purchase? Reply YES for assistance!`,
      variables: ['customerName', 'storeName', 'cartValue'],
      successRate: 65,
      responseTime: 15,
      usageCount: 89
    },
    {
      id: 'urgent-call',
      name: 'Urgent Phone Script',
      type: 'phone_script',
      category: 'urgent',
      content: `"Hi {{customerName}}, this is {{repName}} from {{storeName}}. I'm calling about your recent cart worth ${{cartValue}}. I noticed it was abandoned and wanted to make sure everything was okay. Is there anything I can help you with to complete your purchase?"

Key points:
- Verify customer information
- Address any concerns
- Offer assistance
- Create urgency if appropriate`,
      variables: ['customerName', 'repName', 'storeName', 'cartValue'],
      successRate: 82,
      responseTime: 5,
      usageCount: 45
    },
    {
      id: 'discount-offer',
      name: 'Discount Offer Email',
      type: 'email',
      category: 'follow_up',
      subject: 'Special offer for your {{storeName}} cart',
      content: `Hi {{customerName}},

Great news! I can offer you a 10% discount on your {{storeName}} cart worth ${{cartValue}}.

This special offer is available for the next 24 hours only. Your discounted total would be ${{discountedValue}}.

Would you like me to apply this discount and help you complete your purchase?

Best regards,
{{repName}}`,
      variables: ['customerName', 'storeName', 'cartValue', 'discountedValue', 'repName'],
      successRate: 71,
      responseTime: 30,
      usageCount: 67
    },
    {
      id: 'success-confirmation',
      name: 'Success Confirmation',
      type: 'email',
      category: 'success',
      subject: 'Thank you for your purchase!',
      content: `Hi {{customerName}},

Thank you for completing your purchase at {{storeName}}! Your order for ${{cartValue}} has been successfully processed.

Your order details:
- Order ID: {{orderId}}
- Estimated delivery: {{deliveryDate}}
- Tracking: {{trackingNumber}}

If you have any questions about your order, please don't hesitate to reach out.

Best regards,
{{repName}}`,
      variables: ['customerName', 'storeName', 'cartValue', 'orderId', 'deliveryDate', 'trackingNumber', 'repName'],
      successRate: 95,
      responseTime: 60,
      usageCount: 234
    }
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<CommunicationTemplate | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const replaceVariables = (content: string, customCartValue?: number) => {
    const valueToUse = customCartValue || cartValue;
    return content
      .replace(/\{\{customerName\}\}/g, customerName || 'Valued Customer')
      .replace(/\{\{customerEmail\}\}/g, customerEmail || '')
      .replace(/\{\{storeName\}\}/g, storeName || 'Store')
      .replace(/\{\{cartValue\}\}/g, valueToUse.toFixed(2))
      .replace(/\{\{discountedValue\}\}/g, (valueToUse * 0.9).toFixed(2))
      .replace(/\{\{repName\}\}/g, 'Sales Representative')
      .replace(/\{\{orderId\}\}/g, 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase())
      .replace(/\{\{deliveryDate\}\}/g, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString())
      .replace(/\{\{trackingNumber\}\}/g, '1Z' + Math.random().toString(36).substr(2, 15).toUpperCase());
  };

  const filteredTemplates = templates.filter(template => {
    const categoryMatch = filterCategory === 'all' || template.category === filterCategory;
    const typeMatch = filterType === 'all' || template.type === filterType;
    return categoryMatch && typeMatch;
  });

  const handleSendMessage = (template: CommunicationTemplate) => {
    const message = customMessage || replaceVariables(template.content);
    onSendMessage?.(template, message);
    toast.success(`${template.type === 'email' ? 'Email' : template.type === 'sms' ? 'SMS' : 'Phone script'} sent successfully!`);
    
    // Update usage count
    setTemplates(prev => prev.map(t => 
      t.id === template.id ? { ...t, usageCount: t.usageCount + 1 } : t
    ));
  };

  const toggleFavorite = (templateId: string) => {
    setTemplates(prev => prev.map(template => 
      template.id === templateId ? { ...template, isFavorite: !template.isFavorite } : template
    ));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <MessageSquare className="h-4 w-4" />;
      case 'phone_script': return <Phone className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'initial': return 'bg-blue-500/10 text-blue-500';
      case 'follow_up': return 'bg-status-warning/10 text-status-warning';
      case 'urgent': return 'bg-red-500/10 text-red-500';
      case 'success': return 'bg-status-success/10 text-status-success';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Message copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
              <div className="flex gap-2">
                {['all', 'initial', 'follow_up', 'urgent', 'success'].map(category => (
                  <Button
                    key={category}
                    variant={filterCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterCategory(category)}
                    className="text-xs"
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Type</label>
              <div className="flex gap-2">
                {['all', 'email', 'sms', 'phone_script'].map(type => (
                  <Button
                    key={type}
                    variant={filterType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterType(type)}
                    className="text-xs"
                  >
                    {type.replace('_', ' ').charAt(0).toUpperCase() + type.slice(2)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template List */}
      <div className="grid gap-4">
        {filteredTemplates.map(template => (
          <Card key={template.id} className={`glass-card ${selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    {getTypeIcon(template.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{template.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={`text-xs ${getCategoryColor(template.category)}`}>
                        {template.category.replace('_', ' ')}
                      </Badge>
                      {template.successRate && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <TrendingUp className="h-3 w-3" />
                          {template.successRate}% success
                        </div>
                      )}
                      {template.responseTime && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {template.responseTime}m avg
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(template.id)}
                  >
                    <Star className={`h-4 w-4 ${template.isFavorite ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingTemplate(editingTemplate === template.id ? null : template.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Template Content */}
              <div className="space-y-3">
                {template.subject && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Subject:</label>
                    <p className="text-sm text-foreground mt-1">{replaceVariables(template.subject)}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Message:</label>
                  {editingTemplate === template.id ? (
                    <Textarea
                      value={customMessage || replaceVariables(template.content)}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      className="mt-1 min-h-[100px]"
                      placeholder="Customize your message..."
                    />
                  ) : (
                    <div className="mt-1 p-3 rounded-lg bg-muted/30 text-sm text-foreground whitespace-pre-wrap">
                      {replaceVariables(template.content)}
                    </div>
                  )}
                </div>

                {/* Variables */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Available Variables:</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {template.variables.map(variable => (
                      <Badge key={variable} variant="outline" className="text-xs">
                        {`{{${variable}}}`}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    onClick={() => handleSendMessage(template)}
                    className="flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Send {template.type.replace('_', ' ')}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(replaceVariables(template.content))}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setSelectedTemplate(template)}
                    className="flex items-center gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    Quick Use
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Send Panel */}
      {selectedTemplate && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Quick Send: {selectedTemplate.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Custom Message (Optional)</label>
                <Textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Customize your message before sending..."
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleSendMessage(selectedTemplate)}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Send Message
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedTemplate(null);
                    setCustomMessage('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Communication Analytics Component
interface CommunicationAnalyticsProps {
  templates: CommunicationTemplate[];
}

export function CommunicationAnalytics({ templates }: CommunicationAnalyticsProps) {
  const totalUsage = templates.reduce((sum, template) => sum + template.usageCount, 0);
  const avgSuccessRate = templates.reduce((sum, template) => sum + (template.successRate || 0), 0) / templates.length;
  const avgResponseTime = templates.reduce((sum, template) => sum + (template.responseTime || 0), 0) / templates.length;

  const mostUsedTemplate = templates.reduce((prev, current) => 
    current.usageCount > prev.usageCount ? current : prev
  );

  const bestPerformingTemplate = templates.reduce((prev, current) => 
    (current.successRate || 0) > (prev.successRate || 0) ? current : prev
  );

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Communication Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{totalUsage}</div>
            <p className="text-xs text-muted-foreground">Total Messages Sent</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-status-success">{avgSuccessRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Average Success Rate</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-status-warning">{avgResponseTime.toFixed(0)}m</div>
            <p className="text-xs text-muted-foreground">Avg Response Time</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{templates.length}</div>
            <p className="text-xs text-muted-foreground">Active Templates</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Most Used Template</h4>
            <div className="p-3 rounded-lg border border-border/50">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">{mostUsedTemplate.name}</span>
                <Badge variant="outline">{mostUsedTemplate.usageCount} uses</Badge>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Best Performing</h4>
            <div className="p-3 rounded-lg border border-border/50">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">{bestPerformingTemplate.name}</span>
                <Badge variant="outline">{bestPerformingTemplate.successRate}% success</Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
