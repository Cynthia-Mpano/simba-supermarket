import { Router } from 'express';
import { query } from '../db/connection.js';

const router = Router();

/**
 * GET /api/products
 * Query params: category, search, minPrice, maxPrice, sort, page, limit, inStock
 */
router.get('/', async (req, res, next) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      sort = 'default',
      page = 1,
      limit = 50,
      inStock,
    } = req.query;

    const conditions = [];
    const values = [];
    let idx = 1;

    if (category) {
      conditions.push(`category = $${idx++}`);
      values.push(category);
    }
    if (search) {
      conditions.push(`name ILIKE $${idx++}`);
      values.push(`%${search}%`);
    }
    if (minPrice !== undefined) {
      conditions.push(`price >= $${idx++}`);
      values.push(Number(minPrice));
    }
    if (maxPrice !== undefined) {
      conditions.push(`price <= $${idx++}`);
      values.push(Number(maxPrice));
    }
    if (inStock === 'true') {
      conditions.push(`in_stock = TRUE`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const orderMap = {
      'price-asc':  'price ASC',
      'price-desc': 'price DESC',
      'name-asc':   'name ASC',
      'name-desc':  'name DESC',
      'default':    'id ASC',
    };
    const orderBy = orderMap[sort] || 'id ASC';

    const offset = (Number(page) - 1) * Number(limit);

    // Count query
    const countResult = await query(
      `SELECT COUNT(*) FROM products ${where}`,
      values
    );
    const total = parseInt(countResult.rows[0].count, 10);

    // Data query
    values.push(Number(limit), offset);
    const dataResult = await query(
      `SELECT id, name, price, category, subcategory_id AS "subcategoryId",
              in_stock AS "inStock", image, unit
       FROM products ${where}
       ORDER BY ${orderBy}
       LIMIT $${idx++} OFFSET $${idx++}`,
      values
    );

    res.json({
      products: dataResult.rows,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/products/categories
 * Returns all distinct categories with product count
 */
router.get('/categories', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT category AS name, COUNT(*) AS count
       FROM products
       WHERE in_stock = TRUE
       GROUP BY category
       ORDER BY category`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/products/:id
 */
router.get('/:id', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, name, price, category, subcategory_id AS "subcategoryId",
              in_stock AS "inStock", image, unit
       FROM products WHERE id = $1`,
      [req.params.id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
