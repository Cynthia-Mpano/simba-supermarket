import { Router } from 'express';
import { query } from '../db/connection.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// All analytics routes require admin
router.use(requireAdmin);

/**
 * GET /api/analytics/summary
 * High-level stats for the dashboard
 */
router.get('/summary', async (req, res, next) => {
  try {
    const [totals, byStatus, todayOrders, topProducts] = await Promise.all([
      // Revenue & order totals
      query(`
        SELECT
          COUNT(*)::INT AS total_orders,
          COALESCE(SUM(total), 0)::NUMERIC AS total_revenue,
          COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total ELSE 0 END), 0)::NUMERIC AS paid_revenue,
          COALESCE(AVG(total), 0)::NUMERIC AS avg_order_value
        FROM orders
      `),

      // Orders by status
      query(`
        SELECT order_status, COUNT(*)::INT AS count
        FROM orders GROUP BY order_status ORDER BY count DESC
      `),

      // Today's orders
      query(`
        SELECT COUNT(*)::INT AS count, COALESCE(SUM(total),0)::NUMERIC AS revenue
        FROM orders WHERE DATE(created_at) = CURRENT_DATE
      `),

      // Top 10 products by quantity sold
      query(`
        SELECT oi.product_name, SUM(oi.quantity)::INT AS qty_sold,
               SUM(oi.line_total)::NUMERIC AS revenue
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        WHERE o.order_status != 'cancelled'
        GROUP BY oi.product_name
        ORDER BY qty_sold DESC LIMIT 10
      `),
    ]);

    res.json({
      summary: totals.rows[0],
      byStatus: byStatus.rows,
      today: todayOrders.rows[0],
      topProducts: topProducts.rows,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/analytics/revenue?days=30
 * Daily revenue for the past N days
 */
router.get('/revenue', async (req, res, next) => {
  try {
    const days = Math.min(Number(req.query.days) || 30, 365);
    const result = await query(`
      SELECT
        DATE(created_at) AS date,
        COUNT(*)::INT AS orders,
        COALESCE(SUM(total),0)::NUMERIC AS revenue
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '${days} days'
        AND order_status != 'cancelled'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/analytics/categories
 * Revenue and orders broken down by category
 */
router.get('/categories', async (req, res, next) => {
  try {
    const result = await query(`
      SELECT p.category,
             COUNT(DISTINCT o.id)::INT AS order_count,
             SUM(oi.quantity)::INT AS qty_sold,
             SUM(oi.line_total)::NUMERIC AS revenue
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      JOIN products p ON p.id = oi.product_id
      WHERE o.order_status != 'cancelled'
      GROUP BY p.category
      ORDER BY revenue DESC
    `);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

export default router;
