# Shopify App Setup for Rebound Cart Dashboard

## 🚀 Quick Setup Guide

### 📋 Your Dashboard URL
```
https://rebound-cart.lovable.app
```

### 🔧 Shopify App Configuration

#### 1. CORS Setup
Add this to your Remix app middleware:

```javascript
// app/entry.server.ts or root middleware
export function loader({ request }) {
  // Add CORS headers for your dashboard
  const response = new Response();
  response.headers.set('Access-Control-Allow-Origin', 'https://rebound-cart.lovable.app');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}
```

#### 2. Environment Variables
Add these to your Shopify app `.env`:

```env
# Dashboard CORS
DASHBOARD_URL=https://rebound-cart.lovable.app

# API Security
API_KEY=your-secure-api-key-here
```

#### 3. WebSocket Server
Add WebSocket endpoint to your Shopify app:

```javascript
// Add to your Remix app
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ 
  port: 3001,
  path: '/ws' 
});

wss.on('connection', (ws) => {
  console.log('Dashboard connected from Rebound Cart');
  
  // Send real-time webhook events
  ws.send(JSON.stringify({
    topic: 'CONNECTION_TEST',
    message: 'Connected to Rebound Cart dashboard!',
    timestamp: new Date().toISOString()
  }));
});

// Broadcast webhook events to dashboard
function broadcastToDashboard(event) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(event));
    }
  });
}
```

#### 4. API Endpoints
Create these endpoints in your Shopify app:

```javascript
// routes/api/stores.js
export async function loader() {
  const stores = await prisma.shopifyStore.findMany();
  return json({ 
    success: true, 
    data: stores 
  });
}

// routes/api/stores/:id/sync.js
export async function action({ params }) {
  const store = await syncStoreFromShopify(params.id);
  return json({ 
    success: true,
    message: 'Store synced successfully'
  });
}

// routes/api/health.js
export async function loader() {
  return json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    dashboard: 'https://rebound-cart.lovable.app'
  });
}
```

### 🎯 Required Webhooks

Register these webhooks in your Shopify app:

```javascript
const webhooks = [
  {
    topic: 'CHECKOUTS_CREATE',
    address: `${process.env.HOST}/api/webhooks/checkouts-create`
  },
  {
    topic: 'CHECKOUTS_UPDATE', 
    address: `${process.env.HOST}/api/webhooks/checkouts-update`
  },
  {
    topic: 'ORDERS_CREATE',
    address: `${process.env.HOST}/api/webhooks/orders-create`
  },
  {
    topic: 'APP_UNINSTALLED',
    address: `${process.env.HOST}/api/webhooks/app-uninstalled`
  }
];

// Register webhooks
webhooks.forEach(async webhook => {
  await shopify.webhook.create({
    topic: webhook.topic,
    address: webhook.address,
    format: 'json'
  });
});
```

### 🔌 Webhook Handlers

```javascript
// routes/api/webhooks/checkouts-create.js
export async function action({ request }) {
  const webhook = await request.json();
  
  // Process webhook
  await processCheckoutCreate(webhook);
  
  // Broadcast to dashboard
  broadcastToDashboard({
    topic: 'CHECKOUTS_CREATE',
    shopDomain: webhook.shop_domain,
    data: webhook,
    timestamp: new Date().toISOString()
  });
  
  return json({ success: true });
}
```

### 🧪 Testing Connection

#### 1. Start Both Apps
```bash
# Your Shopify app
npm run dev

# Dashboard (already running on lovable.app)
# Visit: https://rebound-cart.lovable.app
```

#### 2. Test API Connection
```bash
# Test from anywhere
curl https://your-shopify-app.com/api/health \
  -H "Origin: https://rebound-cart.lovable.app"
```

#### 3. Test Webhook Delivery
Use Shopify CLI or app testing tools to trigger webhooks.

### 📊 Database Schema

```sql
-- Prisma schema for shared database
model ShopifyStore {
  id              String   @id @default(cuid())
  shopDomain      String   @unique
  shopName        String
  plan            Plan     @default(FREE)
  status          Status   @default(PENDING)
  totalRevenue    Decimal  @default(0)
  recoveredCarts  Int      @default(0)
  recoveryRate    Float    @default(0)
  installedAt     DateTime @default(now())
  lastActiveAt    DateTime @default(now())
  
  @@map("shopify_stores")
}

model WebhookEvent {
  id          String   @id @default(cuid())
  topic       String
  shopDomain  String
  data        Json
  timestamp   DateTime @default(now())
  
  @@map("webhook_events")
}
```

### 🚨 Troubleshooting

#### CORS Issues
```javascript
// Make sure to handle preflight requests
app.all('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'https://rebound-cart.lovable.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});
```

#### WebSocket Issues
```javascript
// Handle connection errors
wss.on('error', (error) => {
  console.error('WebSocket error:', error);
});

wss.on('connection', (ws, req) => {
  const origin = req.headers.origin;
  if (origin !== 'https://rebound-cart.lovable.app') {
    ws.close(1008, 'Invalid origin');
    return;
  }
  
  console.log('Dashboard connected from:', origin);
});
```

### 🎯 Production Deployment

When ready for production:

1. **Update URLs** in both apps
2. **Use HTTPS** for WebSocket (wss://)
3. **Set up monitoring** for webhook delivery
4. **Configure scaling** for multiple dashboard users

### 📱 Dashboard Features

Your dashboard will automatically:
- ✅ Connect to your Shopify app APIs
- ✅ Receive real-time webhook events
- ✅ Display store management data
- ✅ Show live activity feed
- ✅ Handle cart recovery operations
- ✅ Export data to CSV
- ✅ Sync store data manually

---

**🚀 Your dashboard is ready to connect to your Shopify app!**
