import { useState } from "react";
import { mockCheckouts } from "@/data/mockData";
import { StatusDot } from "@/components/StatusDot";
import { CommunicationTemplates, CommunicationAnalytics } from "@/components/rep/CommunicationTemplates";
import { CartScoring } from "@/components/rep/CartScoring";
import { ExternalLink, Copy, CheckCircle, MessageSquare, Phone, Mail, TrendingUp, Clock, Target, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export default function ActiveRecoveries() {
  const myCheckouts = mockCheckouts.filter((c) => c.claimedById === "u2");
  const active = myCheckouts.filter((c) => c.status === "ABANDONED");
  const recovered = myCheckouts.filter((c) => c.status === "RECOVERED");
  const [selectedCart, setSelectedCart] = useState<any>(null);
  const [showCommunication, setShowCommunication] = useState(false);

  // Analytics data
  const recoveryRate = myCheckouts.length > 0 ? (recovered.length / myCheckouts.length) * 100 : 0;
  const totalValueRecovered = recovered.reduce((sum, c) => sum + c.totalPrice, 0);
  const avgRecoveryTime = 45; // Mock data in minutes
  const totalActiveValue = active.reduce((sum, c) => sum + c.totalPrice, 0);

  // Performance data for charts
  const weeklyPerformance = [
    { week: 'Week 1', claimed: 12, recovered: 8, value: 2450 },
    { week: 'Week 2', claimed: 15, recovered: 11, value: 3200 },
    { week: 'Week 3', claimed: 18, recovered: 14, value: 4100 },
    { week: 'Week 4', claimed: 14, recovered: 10, value: 3800 },
  ];

  const communicationStats = [
    { type: 'Email', sent: 45, responses: 23, success: 51 },
    { type: 'SMS', sent: 32, responses: 18, success: 56 },
    { type: 'Phone', sent: 15, responses: 12, success: 80 },
  ];

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Recovery link copied to clipboard!");
  };

  const handleSendMessage = (template: any, customMessage?: string) => {
    if (selectedCart) {
      toast.success(`Message sent to ${selectedCart.customerEmail}`);
      // In a real app, this would send the actual message
    }
  };

  const markAsRecovered = (cartId: string) => {
    // Mock function to mark cart as recovered
    toast.success("Cart marked as recovered!");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Active Recoveries</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your claimed carts and track recovery progress</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm">
            {active.length} active
          </Badge>
          <Badge variant="outline" className="text-sm">
            {recovered.length} recovered
          </Badge>
          <Badge variant="outline" className="text-sm">
            {recoveryRate.toFixed(1)}% rate
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="active">Active Carts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Performance Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{recoveryRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Recovery Rate</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-status-success">${totalValueRecovered.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Total Recovered</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-status-warning">{avgRecoveryTime}m</div>
                <p className="text-xs text-muted-foreground">Avg Recovery Time</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-foreground">${totalActiveValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Active Value</p>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Performance Chart */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Weekly Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={weeklyPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="claimed" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="recovered" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Communication Success Rates */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Communication Success Rates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={communicationStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="success" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <StatusDot status="live" /> In Progress ({active.length})
            </h2>
            <div className="grid gap-4">
              {active.map((c) => (
                <Card key={c.id} className="glass-card">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-semibold text-foreground">{c.shopName}</p>
                          <CartScoring
                            cartValue={c.totalPrice}
                            abandonmentTime={Math.floor((Date.now() - new Date(c.createdAt).getTime()) / (1000 * 60))}
                            itemCount={c.lineItems.length}
                            storeConversionRate={0.25}
                            competitorCount={Math.floor(Math.random() * 5)}
                            avgOrderValue={250}
                            size="compact"
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">{c.customerEmail}</p>
                        <p className="text-lg font-bold text-foreground mt-2">${c.totalPrice.toFixed(2)}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {c.lineItems.map((item, j) => (
                            <span key={j} className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                              {item.title} × {item.quantity}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <button
                          onClick={() => copyLink(c.checkoutUrl)}
                          className="flex items-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground hover:bg-accent transition-colors"
                        >
                          <Copy className="h-3.5 w-3.5" /> Copy Link
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCart(c);
                            setShowCommunication(true);
                          }}
                          className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                          <MessageSquare className="h-3.5 w-3.5" /> Contact
                        </button>
                        <button
                          onClick={() => markAsRecovered(c.id)}
                          className="flex items-center gap-2 rounded-md bg-status-success px-3 py-2 text-sm font-medium text-status-success-foreground hover:bg-status-success/90 transition-colors"
                        >
                          <CheckCircle className="h-3.5 w-3.5" /> Mark Recovered
                        </button>
                        <a
                          href={c.checkoutUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground hover:bg-accent transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" /> View Store
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recovered Carts */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-status-success" /> Recently Recovered ({recovered.length})
            </h2>
            <div className="grid gap-3">
              {recovered.slice(0, 5).map((c) => (
                <Card key={c.id} className="glass-card opacity-75">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{c.shopName}</p>
                        <p className="text-sm text-muted-foreground">{c.customerEmail}</p>
                        <p className="font-semibold text-foreground mt-1">${c.totalPrice.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-status-success border-status-success">
                          Recovered
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <CommunicationAnalytics templates={[]} />
        </TabsContent>

        <TabsContent value="communication" className="space-y-6">
          {selectedCart ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Communication for {selectedCart.shopName}
                </h2>
                <Button variant="outline" onClick={() => setShowCommunication(false)}>
                  Back to List
                </Button>
              </div>
              
              <CommunicationTemplates
                customerEmail={selectedCart.customerEmail}
                customerName={selectedCart.customerEmail.split('@')[0]}
                cartValue={selectedCart.totalPrice}
                storeName={selectedCart.shopName}
                onSendMessage={handleSendMessage}
              />
            </div>
          ) : (
            <Card className="glass-card">
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Select a Cart to Contact</h3>
                <p className="text-sm text-muted-foreground">
                  Choose an active cart from the Active Carts tab to start communicating with the customer.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
                  }
}
