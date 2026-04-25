/**
 * Seed script — imports products.json into PostgreSQL.
 * Run: node scripts/seed.js
 */
import { pool } from '../src/db/connection.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = join(__dirname, '../data/products.json');

async function seed() {
  const { products } = JSON.parse(readFileSync(dataPath, 'utf-8'));
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Upsert all products
    let inserted = 0;
    for (const p of products) {
      await client.query(
        `INSERT INTO products (id, name, price, category, subcategory_id, in_stock, image, unit)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           price = EXCLUDED.price,
           category = EXCLUDED.category,
           in_stock = EXCLUDED.in_stock,
           image = EXCLUDED.image,
           updated_at = NOW()`,
        [p.id, p.name, p.price, p.category, p.subcategoryId, p.inStock, p.image, p.unit]
      );
      inserted++;
    }

    await client.query('COMMIT');
    console.log(`✅ Seeded ${inserted} products.`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
