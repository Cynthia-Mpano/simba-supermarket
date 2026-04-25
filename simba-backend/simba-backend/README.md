# Simba Supermarket — Backend

REST API for the Simba Supermarket Next.js website (Kigali, Rwanda).

## Stack
- **Runtime**: Node.js 20+ (ESM)
- **Framework**: Express.js
- **Database**: PostgreSQL (Supabase recommended)
- **Payments**: MTN Mobile Money (Rwanda) — Collections API, Airtel Money
- **Email**: Resend (3000 free emails/month)
- **SMS**: Africa's Talking

---

## Quick Start

### 1. Install dependencies
```bash
cd simba-backend
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your credentials
```

### 3. Set up the database

**Option A — Supabase (easiest)**
1. Create a free project at https://supabase.com
2. Go to Settings → Database → Connection string → copy the URI
3. Set `DATABASE_URL` in your `.env`

**Option B — Local PostgreSQL**
```bash
createdb simba_db
```

### 4. Run the schema and seed products
```bash
npm run db:setup
```
This creates all tables and imports all 500+ products from `data/products.json`.

### 5. Create your first admin user
```bash
node -e "
import('./src/db/connection.js').then(async ({query}) => {
  const bcrypt = await import('bcrypt');
  const hash = await bcrypt.hash('your-password', 12);
  await query(
    'INSERT INTO admin_users (email, password_hash, role) VALUES (\$1, \$2, \$3)',
    ['admin@simbasupermarket.rw', hash, 'admin']
  );
  console.log('Admin created!');
  process.exit(0);
});
"
```

### 6. Start the server
```bash
npm run dev      # development (auto-restarts on changes)
npm start        # production
```

---

## API Reference

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (filter, search, sort, paginate) |
| GET | `/api/products/categories` | All categories with counts |
| GET | `/api/products/:id` | Single product |

**Query params for GET /api/products:**
- `category` — filter by category name
- `search` — full-text search on name
- `minPrice` / `maxPrice` — price range (RWF)
- `sort` — `price-asc`, `price-desc`, `name-asc`, `name-desc`, `default`
- `page`, `limit` — pagination
- `inStock=true` — only in-stock items

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Place a new order |
| GET | `/api/orders/:id` | Get order details |
| GET | `/api/orders/:id/momo-status` | Poll MoMo payment status |
| POST | `/api/orders/momo-callback` | MTN MoMo webhook |
| GET | `/api/orders` | List all orders (admin) |
| PATCH | `/api/orders/:id/status` | Update order status (admin) |

**POST /api/orders body:**
```json
{
  "fullName": "Jean Baptiste",
  "phone": "+250788123456",
  "email": "jean@example.com",
  "address": "KG 123 St, Kacyiru",
  "city": "Kigali",
  "district": "Gasabo",
  "paymentMethod": "momo | airtel | cash",
  "items": [
    { "id": 235004, "quantity": 2 },
    { "id": 72002, "quantity": 1 }
  ]
}
```

### Auth (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Get JWT token |
| POST | `/api/auth/register` | Create staff user (admin only) |
| GET | `/api/auth/me` | Get current admin |

### Analytics (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/summary` | Orders, revenue, top products |
| GET | `/api/analytics/revenue?days=30` | Daily revenue chart data |
| GET | `/api/analytics/categories` | Revenue by product category |

---

## Frontend Integration

1. Copy `frontend-integration/lib/api.ts` → your Next.js `lib/api.ts`
2. Add to your frontend `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:4000/api
   ```
3. In `app/checkout/page.tsx`, replace the mock `handleSubmit` with the one in `frontend-integration/checkout-patch.tsx`

---

## MTN MoMo Setup

1. Register at https://momodeveloper.mtn.com
2. Subscribe to the **Collections** product
3. Create an API User (Sandbox tab or via API)
4. Set `MTN_MOMO_PRIMARY_KEY`, `MTN_MOMO_API_USER`, `MTN_MOMO_API_KEY` in `.env`
5. For production, switch `MTN_MOMO_ENVIRONMENT=production` and update the base URL

The payment flow:
1. Customer places order → backend calls `requesttopay` → customer gets a prompt on their phone
2. Frontend polls `/api/orders/:id/momo-status` every 5 seconds
3. MTN also sends a callback to `/api/orders/momo-callback`
4. Order status updates to `confirmed` when payment is successful

---

## Database Schema

```
customers          — customer profiles (upserted by phone)
products           — 500+ products from products.json
orders             — one row per order
order_items        — line items (price snapshot at order time)
momo_transactions  — MTN MoMo payment log
order_status_history — full audit trail of status changes
admin_users        — staff / admin accounts
```

---

## Deployment

**Recommended stack:**
- Backend: [Railway](https://railway.app) or [Render](https://render.com) (free tiers available)
- Database: [Supabase](https://supabase.com) (free PostgreSQL)
- Frontend: Vercel (already set up for Next.js)

Set all `.env` values as environment variables in your hosting dashboard.
