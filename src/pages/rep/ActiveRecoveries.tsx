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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Active Recoveries</h1>
          <p className="text-muted-foreground">Manage and recover abandoned carts</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Target className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Carts</p>
                <p className="text-2xl font-bold text-foreground">{active.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Recovered</p>
                <p className="text-2xl font-bold text-foreground">{recovered.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Recovery Rate</p>
                <p className="text-2xl font-bold text-foreground">{recoveryRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Clock className="h-6 w-6 text-orange-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Avg Recovery Time</p>
                <p className="text-2xl font-bold text-foreground">{avgRecoveryTime}m</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-foreground">Weekly Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="week" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Line type="monotone" dataKey="claimed" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="recovered" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active Carts ({active.length})</TabsTrigger>
          <TabsTrigger value="recovered">Recovered ({recovered.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          <div className="grid gap-4">
            {active.map((cart) => (
              <Card key={cart.id} className="glass-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <StatusDot status={cart.status === "ABANDONED" ? "live" : "recovered"} />
                      <div>
                        <h3 className="font-semibold text-foreground">{cart.shopName}</h3>
                        <p className="text-sm text-muted-foreground">{cart.customerEmail}</p>
                        <p className="text-sm font-medium text-foreground">${cart.totalPrice.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyLink(cart.checkoutUrl)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Link
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(cart.checkoutUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          setSelectedCart(cart);
                          setShowCommunication(true);
                        }}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recovered" className="space-y-6">
          <div className="grid gap-4">
            {recovered.map((cart) => (
              <Card key={cart.id} className="glass-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <StatusDot status={cart.status === "ABANDONED" ? "live" : "recovered"} />
                      <div>
                        <h3 className="font-semibold text-foreground">{cart.shopName}</h3>
                        <p className="text-sm text-muted-foreground">{cart.customerEmail}</p>
                        <p className="text-sm font-medium text-foreground">${cart.totalPrice.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
                        Recovered
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="glass-card">
            <CardContent className="p-8 text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Analytics Coming Soon</h3>
              <p className="text-sm text-muted-foreground">
                Advanced analytics and reporting features will be available soon.
              </p>
            </CardContent>
          </Card>
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
