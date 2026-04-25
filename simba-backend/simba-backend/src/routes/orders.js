import { Router } from 'express';
import { query, pool } from '../db/connection.js';
import { config } from '../config.js';
import { requestPayment, getPaymentStatus } from '../services/momoService.js';
import { sendOrderConfirmation, sendStatusUpdate } from '../services/emailService.js';
import { sendOrderConfirmationSMS, sendStatusUpdateSMS } from '../services/smsService.js';
import { requireAdmin } from '../middleware/auth.js';
import { validateOrder } from '../middleware/validators.js';

const router = Router();

/** Generate a human-readable order ID like SIM-A1B2C3 */
function generateOrderId() {
  return `SIM-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

// ── POST /api/orders  ─────────────────────────────────────────────────
// Place a new order
router.post('/', validateOrder, async (req, res, next) => {
  const client = await pool.connect();
  try {
    const {
      fullName, phone, email, address, city, district,
      paymentMethod, items,
    } = req.body;

    // 1. Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // 2. Fetch live prices from DB (never trust client-sent prices)
    const productIds = items.map(i => i.id);
    const productsResult = await client.query(
      `SELECT id, name, price, in_stock FROM products WHERE id = ANY($1)`,
      [productIds]
    );
    const productMap = Object.fromEntries(productsResult.rows.map(p => [p.id, p]));

    // 3. Verify all products exist and are in stock
    for (const item of items) {
      const p = productMap[item.id];
      if (!p) return res.status(400).json({ error: `Product ${item.id} not found` });
      if (!p.in_stock) return res.status(400).json({ error: `${p.name} is out of stock` });
    }

    // 4. Calculate totals using DB prices
    const subtotal = items.reduce((sum, item) => {
      const p = productMap[item.id];
      return sum + p.price * item.quantity;
    }, 0);
    const deliveryFee = subtotal >= config.FREE_DELIVERY_THRESHOLD ? 0 : config.DELIVERY_FEE;
    const total = subtotal + deliveryFee;

    const orderId = generateOrderId();

    await client.query('BEGIN');

    // 5. Upsert customer record
    const customerResult = await client.query(
      `INSERT INTO customers (full_name, phone, email)
       VALUES ($1,$2,$3)
       ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name, email = EXCLUDED.email
       RETURNING id`,
      [fullName, phone, email || null]
    );
    const customerId = customerResult.rows[0].id;

    // 6. Create order
    await client.query(
      `INSERT INTO orders
         (id, customer_id, full_name, phone, email, address, city, district,
          payment_method, payment_status, order_status, subtotal, delivery_fee, total)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending','pending',$10,$11,$12)`,
      [orderId, customerId, fullName, phone, email || null, address, city, district,
       paymentMethod, subtotal, deliveryFee, total]
    );

    // 7. Insert order items (using DB prices)
    for (const item of items) {
      const p = productMap[item.id];
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity)
         VALUES ($1,$2,$3,$4,$5)`,
        [orderId, p.id, p.name, p.price, item.quantity]
      );
    }

    // 8. Log initial status
    await client.query(
      `INSERT INTO order_status_history (order_id, new_status, changed_by)
       VALUES ($1,'pending','system')`,
      [orderId]
    );

    await client.query('COMMIT');

    // 9. Trigger MoMo payment if selected
    let momoReference = null;
    if (paymentMethod === 'momo' && config.MTN_MOMO_PRIMARY_KEY) {
      try {
        momoReference = await requestPayment({
          orderId,
          phone,
          amount: total,
          note: `Simba order ${orderId}`,
        });
        await query(
          `UPDATE orders SET momo_reference = $1 WHERE id = $2`,
          [momoReference, orderId]
        );
      } catch (momoErr) {
        console.error('MoMo request failed (non-blocking):', momoErr.message);
      }
    }

    // 10. Send notifications (non-blocking)
    const orderForNotif = {
      id: orderId, full_name: fullName, phone, email,
      address, city, district, payment_method: paymentMethod,
      subtotal, delivery_fee: deliveryFee, total,
      items: items.map(item => ({
        product_name: productMap[item.id].name,
        unit_price: productMap[item.id].price,
        quantity: item.quantity,
        line_total: productMap[item.id].price * item.quantity,
      })),
    };
    Promise.allSettled([
      sendOrderConfirmation(orderForNotif),
      sendOrderConfirmationSMS(orderForNotif),
    ]).then(results => {
      results.forEach(r => { if (r.status === 'rejected') console.error('Notification error:', r.reason); });
    });

    res.status(201).json({
      orderId,
      total,
      subtotal,
      deliveryFee,
      paymentMethod,
      momoReference,
      message: paymentMethod === 'momo'
        ? 'Order placed. Check your phone to approve the MoMo payment.'
        : 'Order placed. Pay cash on delivery.',
    });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    next(err);
  } finally {
    client.release();
  }
});

// ── GET /api/orders/:id  ──────────────────────────────────────────────
// Get order details (publicly accessible with order ID)
router.get('/:id', async (req, res, next) => {
  try {
    const orderResult = await query(
      `SELECT o.*, 
              json_agg(json_build_object(
                'product_id', oi.product_id,
                'product_name', oi.product_name,
                'unit_price', oi.unit_price,
                'quantity', oi.quantity,
                'line_total', oi.line_total
              ) ORDER BY oi.id) AS items
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       WHERE o.id = $1
       GROUP BY o.id`,
      [req.params.id]
    );

    if (!orderResult.rows.length) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(orderResult.rows[0]);
  } catch (err) {
    next(err);
  }
});

// ── GET /api/orders/:id/momo-status  ─────────────────────────────────
// Poll MoMo payment status
router.get('/:id/momo-status', async (req, res, next) => {
  try {
    const orderResult = await query(
      `SELECT id, momo_reference, payment_status FROM orders WHERE id = $1`,
      [req.params.id]
    );
    if (!orderResult.rows.length) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];
    if (!order.momo_reference) {
      return res.json({ status: order.payment_status });
    }

    const { status, financialTransactionId } = await getPaymentStatus(order.momo_reference);

    // Update order payment status if changed
    if (status === 'SUCCESSFUL' && order.payment_status !== 'paid') {
      await query(
        `UPDATE orders SET payment_status = 'paid', order_status = 'confirmed', updated_at = NOW()
         WHERE id = $1`,
        [order.id]
      );
      await query(
        `INSERT INTO order_status_history (order_id, old_status, new_status, changed_by)
         VALUES ($1,'pending','confirmed','momo-callback')`,
        [order.id]
      );
    } else if (status === 'FAILED' && order.payment_status !== 'failed') {
      await query(
        `UPDATE orders SET payment_status = 'failed', updated_at = NOW() WHERE id = $1`,
        [order.id]
      );
    }

    res.json({ status, financialTransactionId, momoStatus: status });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/orders/momo-callback  ──────────────────────────────────
// MTN MoMo webhook callback
router.post('/momo-callback', async (req, res) => {
  try {
    const { externalId, status, financialTransactionId } = req.body;
    if (!externalId) return res.sendStatus(400);

    const txResult = await query(
      `SELECT order_id FROM momo_transactions WHERE external_id = $1`,
      [externalId]
    );
    if (!txResult.rows.length) return res.sendStatus(404);

    const { order_id } = txResult.rows[0];

    if (status === 'SUCCESSFUL') {
      await query(
        `UPDATE orders SET payment_status = 'paid', order_status = 'confirmed', updated_at = NOW()
         WHERE id = $1`,
        [order_id]
      );
      await query(
        `UPDATE momo_transactions SET status = $1, financial_txn = $2 WHERE external_id = $3`,
        [status, financialTransactionId || null, externalId]
      );
    } else if (status === 'FAILED') {
      await query(
        `UPDATE orders SET payment_status = 'failed', updated_at = NOW() WHERE id = $1`,
        [order_id]
      );
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('MoMo callback error:', err);
    res.sendStatus(500);
  }
});

// ── ADMIN ROUTES (require JWT) ────────────────────────────────────────

// GET /api/orders  — list all orders (admin)
router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const conditions = [];
    const values = [];
    let idx = 1;

    if (status) {
      conditions.push(`order_status = $${idx++}`);
      values.push(status);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (Number(page) - 1) * Number(limit);

    const countResult = await query(`SELECT COUNT(*) FROM orders ${where}`, values);
    const total = parseInt(countResult.rows[0].count, 10);

    values.push(Number(limit), offset);
    const result = await query(
      `SELECT id, full_name, phone, email, order_status, payment_status,
              payment_method, total, created_at
       FROM orders ${where}
       ORDER BY created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      values
    );

    res.json({
      orders: result.rows,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/orders/:id/status — update order status (admin)
router.patch('/:id/status', requireAdmin, async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['confirmed','processing','out_for_delivery','delivered','cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const orderResult = await query(
      `SELECT id, order_status, full_name, phone, email FROM orders WHERE id = $1`,
      [req.params.id]
    );
    if (!orderResult.rows.length) return res.status(404).json({ error: 'Order not found' });

    const order = orderResult.rows[0];

    await query(
      `UPDATE orders SET order_status = $1, updated_at = NOW() WHERE id = $2`,
      [status, order.id]
    );
    await query(
      `INSERT INTO order_status_history (order_id, old_status, new_status, changed_by, note)
       VALUES ($1,$2,$3,$4,$5)`,
      [order.id, order.order_status, status, req.admin.email, note || null]
    );

    // Notify customer
    Promise.allSettled([
      sendStatusUpdate({ ...order, email: order.email }, status),
      sendStatusUpdateSMS(order, status),
    ]);

    res.json({ message: 'Status updated', orderId: order.id, status });
  } catch (err) {
    next(err);
  }
});

export default router;
