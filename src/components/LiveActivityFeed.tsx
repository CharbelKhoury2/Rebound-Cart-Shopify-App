import { useState, useEffect } from "react";
import { ShoppingBag, DollarSign, Clock, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { webhookService, WebhookEvent } from "@/services/shopifyWebhookService";
import { toast } from "sonner";

interface LiveActivityProps {
  className?: string;
}

export default function LiveActivityFeed({ className = "" }: LiveActivityProps) {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    recent24h: 0,
    byTopic: {} as Record<string, number>
  });

  useEffect(() => {
    // Connect to webhook stream
    webhookService.connect();
    setIsConnected(true);

    // Subscribe to webhook events
    webhookService.subscribe('CHECKOUTS_CREATE', handleCheckoutCreate);
    webhookService.subscribe('CHECKOUTS_UPDATE', handleCheckoutUpdate);
    webhookService.subscribe('ORDERS_CREATE', handleOrderCreate);
    webhookService.subscribe('APP_UNINSTALLED', handleAppUninstalled);

    // Load recent events
    const recentEvents = webhookService.getRecentEvents(20);
    setEvents(recentEvents);

    // Load stats
    const webhookStats = webhookService.getWebhookStats();
    setStats(webhookStats);

    // Cleanup
    return () => {
      webhookService.disconnect();
    };
  }, []);

  const handleCheckoutCreate = (data: any, shopDomain: string) => {
    console.log('🛒 New checkout created:', data);
    toast.success(`New abandoned cart from ${shopDomain}`, {
      description: `Value: $${data.total_price}`,
      icon: <ShoppingBag className="h-4 w-4" />,
    });
  };

  const handleCheckoutUpdate = (data: any, shopDomain: string) => {
    console.log('🔄 Checkout updated:', data);
    toast.info(`Cart updated from ${shopDomain}`, {
      icon: <Clock className="h-4 w-4" />,
    });
  };

  const handleOrderCreate = (data: any, shopDomain: string) => {
    console.log('💰 New order created:', data);
    toast.success(`Cart recovered! ${shopDomain}`, {
      description: `Order value: $${data.total_price}`,
      icon: <DollarSign className="h-4 w-4" />,
    });
  };

  const handleAppUninstalled = (data: any, shopDomain: string) => {
    console.log('👋 App uninstalled:', shopDomain);
    toast.error(`App uninstalled from ${shopDomain}`, {
      icon: <AlertCircle className="h-4 w-4" />,
    });
  };

  const getEventIcon = (topic: string) => {
    switch (topic) {
      case 'CHECKOUTS_CREATE':
        return <ShoppingBag className="h-4 w-4 text-blue" />;
      case 'CHECKOUTS_UPDATE':
        return <Clock className="h-4 w-4 text-yellow" />;
      case 'ORDERS_CREATE':
        return <DollarSign className="h-4 w-4 text-green" />;
      case 'APP_UNINSTALLED':
        return <AlertCircle className="h-4 w-4 text-red" />;
      default:
        return <TrendingUp className="h-4 w-4 text-gray" />;
    }
  };

  const getEventColor = (topic: string) => {
    switch (topic) {
      case 'CHECKOUTS_CREATE':
        return 'border-blue bg-blue/10';
      case 'CHECKOUTS_UPDATE':
        return 'border-yellow bg-yellow/10';
      case 'ORDERS_CREATE':
        return 'border-green bg-green/10';
      case 'APP_UNINSTALLED':
        return 'border-red bg-red/10';
      default:
        return 'border-gray bg-gray/10';
    }
  };

  const formatEventTitle = (topic: string) => {
    switch (topic) {
      case 'CHECKOUTS_CREATE':
        return 'New Abandoned Cart';
      case 'CHECKOUTS_UPDATE':
        return 'Cart Updated';
      case 'ORDERS_CREATE':
        return 'Cart Recovered!';
      case 'APP_UNINSTALLED':
        return 'App Uninstalled';
      default:
        return 'Unknown Event';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Live Activity Feed</h2>
          <p className="text-sm text-muted-foreground">Real-time Shopify events</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
            isConnected ? 'bg-green text-white' : 'bg-red text-white'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-white' : 'bg-white'
            }`} />
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray">Total Events</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
            <div className="p-2 bg-blue/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray">Last 24h</p>
              <p className="text-2xl font-bold text-green">{stats.recent24h}</p>
            </div>
            <div className="p-2 bg-green/10 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray">Connection</p>
              <p className="text-lg font-bold text-foreground">
                {isConnected ? 'Live' : 'Offline'}
              </p>
            </div>
            <div className={`p-2 rounded-lg ${
              isConnected ? 'bg-green/10' : 'bg-red/10'
            }`}>
              <div className={`w-5 h-5 rounded-full ${
                isConnected ? 'bg-green' : 'bg-red'
              }`} />
            </div>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-lg border border-gray">
        <div className="p-4 border-b border-gray">
          <h3 className="font-medium text-foreground">Recent Activity</h3>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {events.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray/10 rounded-full mb-3">
                <Clock className="h-6 w-6 text-gray" />
              </div>
              <p className="text-gray">No recent activity</p>
              <p className="text-sm text-gray">
                Waiting for real-time events from your Shopify stores...
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray">
              {events.map((event, index) => (
                <div
                  key={`${event.timestamp}-${index}`}
                  className={`p-4 border-l-4 ${getEventColor(event.topic)} hover:bg-gray/50 transition-colors`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getEventIcon(event.topic)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-foreground">
                          {formatEventTitle(event.topic)}
                        </h4>
                        <span className="text-sm text-gray">
                          {formatTime(event.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray mt-1">
                        {event.shopDomain}
                      </p>
                      {event.data?.total_price && (
                        <p className="text-sm font-medium text-foreground mt-1">
                          Value: ${event.data.total_price}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Test Buttons (Development) */}
      {import.meta.env.DEV && (
        <div className="bg-yellow/10 border border-yellow rounded-lg p-4">
          <h3 className="font-medium text-foreground mb-3">Test Webhooks (Dev Only)</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => webhookService.simulateWebhook('CHECKOUTS_CREATE', {
                id: 'test-checkout-123',
                total_price: '125.50',
                currency: 'USD',
                customer: { email: 'test@example.com' }
              })}
              className="px-3 py-1 bg-blue text-white rounded text-sm hover:bg-blue/90"
            >
              Simulate Checkout
            </button>
            <button
              onClick={() => webhookService.simulateWebhook('ORDERS_CREATE', {
                id: 'test-order-456',
                total_price: '125.50',
                currency: 'USD',
                customer: { email: 'test@example.com' }
              })}
              className="px-3 py-1 bg-green text-white rounded text-sm hover:bg-green/90"
            >
              Simulate Recovery
            </button>
            <button
              onClick={() => webhookService.simulateWebhook('APP_UNINSTALLED', {})}
              className="px-3 py-1 bg-red text-white rounded text-sm hover:bg-red/90"
            >
              Simulate Uninstall
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
