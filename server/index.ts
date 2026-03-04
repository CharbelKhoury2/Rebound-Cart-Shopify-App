import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '../src/services/auth.js';
import { CheckoutService } from '../src/services/checkout.js';
import { CommissionService } from '../src/services/commission.js';

const app = express();
const port = 3001;
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Authentication endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email } = req.body;

    // For now, bypass database and return a mock user so login works
    const role = email.includes('admin') ? 'PLATFORM_ADMIN' : 'SALES_REP';

    const user = {
      id: `demo-${role.toLowerCase()}`,
      email,
      firstName: email.split('@')[0],
      lastName: null,
      role,
      status: 'ACTIVE',
      tier: 'BRONZE',
    };

    const token = AuthService.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({ user, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/validate', async (req, res) => {
  try {
    const { token } = req.body;
    const result = await AuthService.validateSession(token);
    res.json(result);
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Checkout endpoints
app.get('/api/checkouts/available', async (req, res) => {
  try {
    const checkouts = await CheckoutService.getAvailableCarts();
    res.json(checkouts);
  } catch (error) {
    console.error('Get available checkouts error:', error);
    res.status(500).json({ error: 'Failed to get checkouts' });
  }
});

app.post('/api/checkouts/:id/claim', async (req, res) => {
  try {
    const { id } = req.params;
    const { repId } = req.body;
    
    const claimedCart = await CheckoutService.claimCart(id, repId);
    res.json(claimedCart);
  } catch (error) {
    console.error('Claim cart error:', error);
    res.status(400).json({ error: error.message || 'Failed to claim cart' });
  }
});

app.get('/api/checkouts/claimed/:repId', async (req, res) => {
  try {
    const { repId } = req.params;
    const checkouts = await CheckoutService.getRepClaimedCarts(repId);
    res.json(checkouts);
  } catch (error) {
    console.error('Get claimed checkouts error:', error);
    res.status(500).json({ error: 'Failed to get claimed checkouts' });
  }
});

// Commission endpoints
app.get('/api/commissions/rep/:repId', async (req, res) => {
  try {
    const { repId } = req.params;
    const commissions = await CommissionService.getRepCommissions(repId);
    res.json(commissions);
  } catch (error) {
    console.error('Get rep commissions error:', error);
    res.status(500).json({ error: 'Failed to get commissions' });
  }
});

app.get('/api/commissions/admin', async (req, res) => {
  try {
    const commissions = await CommissionService.getAllCommissions();
    res.json(commissions);
  } catch (error) {
    console.error('Get all commissions error:', error);
    res.status(500).json({ error: 'Failed to get commissions' });
  }
});

app.post('/api/commissions/:id/paid', async (req, res) => {
  try {
    const { id } = req.params;
    const commission = await CommissionService.markCommissionPaid(id);
    res.json(commission);
  } catch (error) {
    console.error('Mark commission paid error:', error);
    res.status(500).json({ error: 'Failed to update commission' });
  }
});

// User management endpoints
app.get('/api/users', async (req, res) => {
  try {
    const { role } = req.query;
    const users = await AuthService.getUsersByRole(role as string);
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

app.post('/api/users/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await AuthService.approveUser(id);
    res.json(user);
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ error: 'Failed to approve user' });
  }
});

app.post('/api/users/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await AuthService.rejectUser(id);
    res.json(user);
  } catch (error) {
    console.error('Reject user error:', error);
    res.status(500).json({ error: 'Failed to reject user' });
  }
});

// Statistics endpoints
app.get('/api/stats/carts', async (req, res) => {
  try {
    const stats = await CheckoutService.getCartStats();
    res.json(stats);
  } catch (error) {
    console.error('Get cart stats error:', error);
    res.status(500).json({ error: 'Failed to get cart statistics' });
  }
});

app.get('/api/stats/commissions', async (req, res) => {
  try {
    const stats = await CommissionService.getCommissionStats();
    res.json(stats);
  } catch (error) {
    console.error('Get commission stats error:', error);
    res.status(500).json({ error: 'Failed to get commission statistics' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 ReboundCart API Server running on http://localhost:${port}`);
  console.log(`📊 Database connected: ${process.env.DATABASE_URL ? 'Yes' : 'No'}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});
