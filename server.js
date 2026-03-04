// Simple Node.js server for ReboundCart API
// Connects to Supabase database and serves the frontend

import { createServer } from 'http';
import { parse } from 'url';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const port = 3001;

// Enable CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Helper function to send JSON responses
function sendJson(res, data, statusCode = 200) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json', ...corsHeaders });
  res.end(JSON.stringify(data));
}

// Helper function to parse POST data
function parsePostData(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve({});
      }
    });
  });
}

// JWT implementation (simple for demo)
class SimpleJWT {
  static encode(payload) {
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  static decode(token) {
    try {
      return JSON.parse(Buffer.from(token, 'base64').toString());
    } catch {
      return null;
    }
  }
}

// Routes
const routes = {
  // Health check
  'GET /health': async (req, res) => {
    sendJson(res, { status: 'OK', timestamp: new Date().toISOString() });
  },

  // Login
  'POST /api/auth/login': async (req, res) => {
    try {
      const { email, password } = await parsePostData(req);
      
      // Find or create user
      let user = await prisma.platformUser.findUnique({
        where: { email }
      });

      if (!user) {
        user = await prisma.platformUser.create({
          data: {
            email,
            firstName: email.split('@')[0],
            role: email.includes('admin') ? 'PLATFORM_ADMIN' : 'SALES_REP',
            tier: 'BRONZE',
            status: 'PENDING'
          }
        });
      }

      if (user.status === 'PENDING') {
        user = await prisma.platformUser.update({
          where: { id: user.id },
          data: { status: 'ACTIVE' }
        });
      }

      if (user.status !== 'ACTIVE') {
        return sendJson(res, { error: 'User not active' }, 401);
      }

      const token = SimpleJWT.encode({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      sendJson(res, { user, token });
    } catch (error) {
      console.error('Login error:', error);
      sendJson(res, { error: 'Login failed' }, 500);
    }
  },

  // Validate token
  'POST /api/auth/validate': async (req, res) => {
    try {
      const { token } = await parsePostData(req);
      const payload = SimpleJWT.decode(token);
      
      if (!payload) {
        return sendJson(res, { error: 'Invalid token' }, 401);
      }

      const user = await prisma.platformUser.findUnique({
        where: { email: payload.email }
      });

      sendJson(res, { user: user && user.status === 'ACTIVE' ? user : null });
    } catch (error) {
      console.error('Token validation error:', error);
      sendJson(res, { error: 'Invalid token' }, 401);
    }
  },

  // Get available carts
  'GET /api/checkouts/available': async (req, res) => {
    try {
      // Get marketplace enabled shops
      const shopSettings = await prisma.shopSettings.findMany({
        where: { isMarketplaceEnabled: true },
        select: { shop: true }
      });

      const enabledShops = shopSettings.map(setting => setting.shop);

      const checkouts = await prisma.abandonedCheckout.findMany({
        where: {
          claimedById: null,
          status: 'ABANDONED',
          shop: { in: enabledShops }
        },
        orderBy: { createdAt: 'desc' }
      });

      sendJson(res, checkouts);
    } catch (error) {
      console.error('Get available checkouts error:', error);
      sendJson(res, { error: 'Failed to get checkouts' }, 500);
    }
  },

  // Claim cart
  'POST /api/checkouts/:id/claim': async (req, res) => {
    try {
      const { id } = req.params;
      const { repId } = await parsePostData(req);

      const result = await prisma.$transaction(async (tx) => {
        const cart = await tx.abandonedCheckout.findFirst({
          where: {
            id: id,
            claimedById: null,
            status: 'ABANDONED'
          }
        });

        if (!cart) {
          throw new Error('Cart is no longer available or has already been claimed');
        }

        const shopSetting = await tx.shopSettings.findUnique({
          where: { shop: cart.shop }
        });

        if (!shopSetting?.isMarketplaceEnabled) {
          throw new Error('This shop does not participate in the Vetted Talent Network');
        }

        return await tx.abandonedCheckout.update({
          where: { id: id },
          data: {
            claimedById: repId,
            claimedAt: new Date()
          },
          include: { claimedBy: true }
        });
      });

      sendJson(res, result);
    } catch (error) {
      console.error('Claim cart error:', error);
      sendJson(res, { error: error.message || 'Failed to claim cart' }, 400);
    }
  },

  // Get claimed carts for rep
  'GET /api/checkouts/claimed/:repId': async (req, res) => {
    try {
      const { repId } = req.params;
      const checkouts = await prisma.abandonedCheckout.findMany({
        where: { claimedById: repId },
        include: { claimedBy: true },
        orderBy: { claimedAt: 'desc' }
      });
      sendJson(res, checkouts);
    } catch (error) {
      console.error('Get claimed checkouts error:', error);
      sendJson(res, { error: 'Failed to get claimed checkouts' }, 500);
    }
  },

  // Get cart statistics
  'GET /api/stats/carts': async (req, res) => {
    try {
      const stats = await prisma.abandonedCheckout.groupBy({
        by: ['status'],
        _count: { id: true }
      });

      const result = {
        total: 0,
        abandoned: 0,
        claimed: 0,
        recovered: 0
      };

      stats.forEach(stat => {
        result.total += stat._count.id;
        if (stat.status === 'ABANDONED') result.abandoned = stat._count.id;
        if (stat.status === 'RECOVERED') result.recovered = stat._count.id;
      });

      const claimedCount = await prisma.abandonedCheckout.count({
        where: { claimedById: { not: null } }
      });
      result.claimed = claimedCount;

      sendJson(res, result);
    } catch (error) {
      console.error('Get cart stats error:', error);
      sendJson(res, { error: 'Failed to get cart statistics' }, 500);
    }
  }
};

// Create server
const server = createServer(async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    res.end();
    return;
  }

  const parsedUrl = parse(req.url, true);
  const routeKey = `${req.method} ${parsedUrl.pathname}`;

  if (routes[routeKey]) {
    req.params = parsedUrl.query;
    await routes[routeKey](req, res);
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json', ...corsHeaders });
    res.end(JSON.stringify({ error: 'Route not found' }));
  }
});

// Start server
server.listen(port, () => {
  console.log(`🚀 ReboundCart API Server running on http://localhost:${port}`);
  console.log(`📊 Database connected: ${process.env.DATABASE_URL ? 'Yes' : 'No'}`);
  console.log(`🔗 Frontend should connect to: http://localhost:${port}/api`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});
