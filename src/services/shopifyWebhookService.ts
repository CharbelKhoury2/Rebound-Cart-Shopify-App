export interface WebhookEvent {
  topic: string;
  shopDomain: string;
  data: any;
  timestamp: string;
}

export interface CheckoutWebhookData {
  id: string;
  token: string;
  cart_token?: string;
  email?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  abandoned_checkout_url: string;
  line_items: Array<{
    id: string;
    title: string;
    quantity: number;
    price: string;
    variant_id?: string;
  }>;
  total_price: string;
  currency: string;
  presentment_currency: string;
  customer?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
  };
  shipping_address?: {
    first_name: string;
    last_name: string;
    address1: string;
    city: string;
    province: string;
    country: string;
    zip: string;
  };
}

export interface OrderWebhookData {
  id: string;
  checkout_id?: string;
  email: string;
  created_at: string;
  total_price: string;
  currency: string;
  line_items: Array<{
    id: string;
    title: string;
    quantity: number;
    price: string;
  }>;
  customer: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  financial_status: string;
  fulfillment_status: string;
}

export class ShopifyWebhookService {
  private static instance: ShopifyWebhookService;
  private ws: WebSocket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  static getInstance(): ShopifyWebhookService {
    if (!ShopifyWebhookService.instance) {
      ShopifyWebhookService.instance = new ShopifyWebhookService();
    }
    return ShopifyWebhookService.instance;
  }

  // Connect to real-time updates
  connect() {
    try {
      // Connect to your Shopify app's WebSocket endpoint
      this.ws = new WebSocket(`${import.meta.env.VITE_WS_URL}/webhooks`);
      
      this.ws.onopen = () => {
        console.log('🔗 Connected to Shopify webhook stream');
      };

      this.ws.onmessage = (event) => {
        const webhookEvent: WebhookEvent = JSON.parse(event.data);
        this.handleWebhookEvent(webhookEvent);
      };

      this.ws.onclose = () => {
        console.log('🔌 Disconnected from webhook stream');
        // Auto-reconnect after 5 seconds
        setTimeout(() => this.connect(), 5000);
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
      };
    } catch (error) {
      console.error('❌ Failed to connect to webhook stream:', error);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // Subscribe to webhook events
  subscribe(topic: string, callback: Function) {
    if (!this.listeners.has(topic)) {
      this.listeners.set(topic, []);
    }
    this.listeners.get(topic)?.push(callback);
  }

  // Handle incoming webhook events
  private handleWebhookEvent(event: WebhookEvent) {
    console.log(`📨 Received webhook: ${event.topic} from ${event.shopDomain}`);
    
    const callbacks = this.listeners.get(event.topic);
    if (callbacks) {
      callbacks.forEach(callback => callback(event.data, event.shopDomain));
    }

    // Store event locally for dashboard updates
    this.storeEventLocally(event);
  }

  // Store webhook events locally for immediate dashboard updates
  private async storeEventLocally(event: WebhookEvent) {
    try {
      const events = JSON.parse(localStorage.getItem('webhook_events') || '[]');
      events.unshift({
        ...event,
        localTimestamp: new Date().toISOString()
      });
      
      // Keep only last 100 events
      if (events.length > 100) {
        events.splice(100);
      }
      
      localStorage.setItem('webhook_events', JSON.stringify(events));
    } catch (error) {
      console.error('❌ Failed to store webhook event locally:', error);
    }
  }

  // Get recent webhook events
  getRecentEvents(limit: number = 50): WebhookEvent[] {
    try {
      const events = JSON.parse(localStorage.getItem('webhook_events') || '[]');
      return events.slice(0, limit);
    } catch (error) {
      console.error('❌ Failed to get recent events:', error);
      return [];
    }
  }

  // Simulate webhook events for development
  simulateWebhook(topic: string, data: any, shopDomain: string = 'demo-store.myshopify.com') {
    const event: WebhookEvent = {
      topic,
      shopDomain,
      data,
      timestamp: new Date().toISOString()
    };
    
    this.handleWebhookEvent(event);
  }

  // Get webhook statistics
  getWebhookStats() {
    const events = this.getRecentEvents(1000);
    const stats = {
      total: events.length,
      byTopic: {} as Record<string, number>,
      byShop: {} as Record<string, number>,
      recent24h: 0
    };

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    events.forEach(event => {
      // Count by topic
      stats.byTopic[event.topic] = (stats.byTopic[event.topic] || 0) + 1;
      
      // Count by shop
      stats.byShop[event.shopDomain] = (stats.byShop[event.shopDomain] || 0) + 1;
      
      // Count last 24h
      const eventTime = new Date(event.timestamp);
      if (eventTime > yesterday) {
        stats.recent24h++;
      }
    });

    return stats;
  }
}

// Export singleton instance
export const webhookService = ShopifyWebhookService.getInstance();
