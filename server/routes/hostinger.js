import express from 'express';
import { hostingerClient } from '../services/hostingerClient.js';

const router = express.Router();

// Middleware to check if Hostinger API is configured
const checkHostingerConfig = (req, res, next) => {
  if (!hostingerClient.isConfigured()) {
    return res.status(503).json({
      error: 'Hostinger API not configured',
      message: 'HOSTINGER_API_TOKEN environment variable is not set'
    });
  }
  next();
};

// Apply middleware to all routes
router.use(checkHostingerConfig);

// ==================== VPS Routes ====================

/**
 * GET /api/hostinger/vps
 * List all VPS instances
 */
router.get('/vps', async (req, res) => {
  try {
    const instances = await hostingerClient.listVPS();
    res.json({
      success: true,
      data: instances
    });
  } catch (error) {
    console.error('Error listing VPS instances:', error);
    res.status(500).json({
      error: 'Failed to fetch VPS instances',
      message: error.message
    });
  }
});

/**
 * GET /api/hostinger/vps/:id
 * Get VPS instance details
 */
router.get('/vps/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const details = await hostingerClient.getVPSDetails(id);
    res.json({
      success: true,
      data: details
    });
  } catch (error) {
    console.error('Error fetching VPS details:', error);
    res.status(500).json({
      error: 'Failed to fetch VPS details',
      message: error.message
    });
  }
});

/**
 * GET /api/hostinger/vps/:id/metrics
 * Get VPS instance metrics
 */
router.get('/vps/:id/metrics', async (req, res) => {
  try {
    const { id } = req.params;
    const metrics = await hostingerClient.getVPSMetrics(id);
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Error fetching VPS metrics:', error);
    res.status(500).json({
      error: 'Failed to fetch VPS metrics',
      message: error.message
    });
  }
});

/**
 * POST /api/hostinger/vps/:id/restart
 * Restart VPS instance
 */
router.post('/vps/:id/restart', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await hostingerClient.restartVPS(id);
    res.json({
      success: true,
      message: 'VPS restart initiated',
      data: result
    });
  } catch (error) {
    console.error('Error restarting VPS:', error);
    res.status(500).json({
      error: 'Failed to restart VPS',
      message: error.message
    });
  }
});

// ==================== Subscription Routes ====================

/**
 * GET /api/hostinger/subscriptions
 * List all subscriptions
 */
router.get('/subscriptions', async (req, res) => {
  try {
    const subscriptions = await hostingerClient.listSubscriptions();
    res.json({
      success: true,
      data: subscriptions
    });
  } catch (error) {
    console.error('Error listing subscriptions:', error);
    res.status(500).json({
      error: 'Failed to fetch subscriptions',
      message: error.message
    });
  }
});

/**
 * GET /api/hostinger/subscriptions/:id
 * Get subscription details
 */
router.get('/subscriptions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const subscription = await hostingerClient.getSubscription(id);
    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({
      error: 'Failed to fetch subscription',
      message: error.message
    });
  }
});

/**
 * POST /api/hostinger/subscriptions/:id/renew
 * Renew a subscription
 */
router.post('/subscriptions/:id/renew', async (req, res) => {
  try {
    const { id } = req.params;
    const options = req.body;
    const result = await hostingerClient.renewSubscription(id, options);
    res.json({
      success: true,
      message: 'Subscription renewed successfully',
      data: result
    });
  } catch (error) {
    console.error('Error renewing subscription:', error);
    res.status(500).json({
      error: 'Failed to renew subscription',
      message: error.message
    });
  }
});

/**
 * POST /api/hostinger/subscriptions/:id/cancel
 * Cancel a subscription
 */
router.post('/subscriptions/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await hostingerClient.cancelSubscription(id);
    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: result
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({
      error: 'Failed to cancel subscription',
      message: error.message
    });
  }
});

// ==================== Payment Methods Routes ====================

/**
 * GET /api/hostinger/payment-methods
 * List payment methods
 */
router.get('/payment-methods', async (req, res) => {
  try {
    const paymentMethods = await hostingerClient.listPaymentMethods();
    res.json({
      success: true,
      data: paymentMethods
    });
  } catch (error) {
    console.error('Error listing payment methods:', error);
    res.status(500).json({
      error: 'Failed to fetch payment methods',
      message: error.message
    });
  }
});

/**
 * POST /api/hostinger/payment-methods
 * Add a new payment method
 */
router.post('/payment-methods', async (req, res) => {
  try {
    const paymentData = req.body;
    const result = await hostingerClient.addPaymentMethod(paymentData);
    res.json({
      success: true,
      message: 'Payment method added successfully',
      data: result
    });
  } catch (error) {
    console.error('Error adding payment method:', error);
    res.status(500).json({
      error: 'Failed to add payment method',
      message: error.message
    });
  }
});

/**
 * DELETE /api/hostinger/payment-methods/:id
 * Remove a payment method
 */
router.delete('/payment-methods/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await hostingerClient.removePaymentMethod(id);
    res.json({
      success: true,
      message: 'Payment method removed successfully',
      data: result
    });
  } catch (error) {
    console.error('Error removing payment method:', error);
    res.status(500).json({
      error: 'Failed to remove payment method',
      message: error.message
    });
  }
});

// ==================== Invoices Routes ====================

/**
 * GET /api/hostinger/invoices
 * List invoices
 */
router.get('/invoices', async (req, res) => {
  try {
    const params = req.query;
    const invoices = await hostingerClient.listInvoices(params);
    res.json({
      success: true,
      data: invoices
    });
  } catch (error) {
    console.error('Error listing invoices:', error);
    res.status(500).json({
      error: 'Failed to fetch invoices',
      message: error.message
    });
  }
});

/**
 * GET /api/hostinger/invoices/:id
 * Get invoice details
 */
router.get('/invoices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await hostingerClient.getInvoice(id);
    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({
      error: 'Failed to fetch invoice',
      message: error.message
    });
  }
});

/**
 * GET /api/hostinger/invoices/:id/download
 * Download invoice PDF
 */
router.get('/invoices/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    const pdfBuffer = await hostingerClient.downloadInvoice(id);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${id}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error downloading invoice:', error);
    res.status(500).json({
      error: 'Failed to download invoice',
      message: error.message
    });
  }
});

// ==================== Orders Routes ====================

/**
 * GET /api/hostinger/orders
 * List orders
 */
router.get('/orders', async (req, res) => {
  try {
    const params = req.query;
    const orders = await hostingerClient.listOrders(params);
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error listing orders:', error);
    res.status(500).json({
      error: 'Failed to fetch orders',
      message: error.message
    });
  }
});

/**
 * GET /api/hostinger/orders/:id
 * Get order details
 */
router.get('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await hostingerClient.getOrder(id);
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      error: 'Failed to fetch order',
      message: error.message
    });
  }
});

// ==================== Account Routes ====================

/**
 * GET /api/hostinger/account/balance
 * Get account balance
 */
router.get('/account/balance', async (req, res) => {
  try {
    const balance = await hostingerClient.getAccountBalance();
    res.json({
      success: true,
      data: balance
    });
  } catch (error) {
    console.error('Error fetching account balance:', error);
    res.status(500).json({
      error: 'Failed to fetch account balance',
      message: error.message
    });
  }
});

/**
 * GET /api/hostinger/account/info
 * Get account information
 */
router.get('/account/info', async (req, res) => {
  try {
    const info = await hostingerClient.getAccountInfo();
    res.json({
      success: true,
      data: info
    });
  } catch (error) {
    console.error('Error fetching account info:', error);
    res.status(500).json({
      error: 'Failed to fetch account information',
      message: error.message
    });
  }
});

export { router as hostingerRouter };
