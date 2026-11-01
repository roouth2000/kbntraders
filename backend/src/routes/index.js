import { Router } from 'express';
import authRoutes from './authRoutes.js';
import customerRoutes from './customerRoutes.js';
import varietyRoutes from './varietyRoutes.js';
import invoiceRoutes from './invoiceRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import ledgerRoutes from './ledgerRoutes.js';
import reportRoutes from './reportRoutes.js';
import roleRoutes from './roleRoutes.js';
import { isDbConnected } from '../config/database.js';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: {
      connected: isDbConnected(),
      mode: isDbConnected() ? 'mysql' : 'resilient-in-memory',
    },
    version: '1.0.0',
  });
});

// Mount Sub-routers
router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);
router.use('/varieties', varietyRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/payments', paymentRoutes);
router.use('/ledgers', ledgerRoutes);
router.use('/reports', reportRoutes);
router.use('/roles', roleRoutes);

export default router;

