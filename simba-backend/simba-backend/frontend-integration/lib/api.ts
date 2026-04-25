/**
 * lib/api.ts
 * Drop this file into your Next.js frontend.
 * Replace the simulated handleSubmit in app/checkout/page.tsx with these calls.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface PlaceOrderPayload {
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  district: string;
  paymentMethod: 'momo' | 'cash';
  items: { id: number; quantity: number }[];
}

export interface PlaceOrderResponse {
  orderId: string;
  total: number;
  subtotal: number;
  deliveryFee: number;
  paymentMethod: string;
  momoReference: string | null;
  message: string;
}

/**
 * Submit the cart to the backend and create a real order.
 */
export async function placeOrder(payload: PlaceOrderPayload): Promise<PlaceOrderResponse> {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to place order');
  }

  return res.json();
}

/**
 * Fetch a single order by ID (for order-confirmation page).
 */
export async function getOrder(orderId: string) {
  const res = await fetch(`${API_BASE}/orders/${orderId}`);
  if (!res.ok) throw new Error('Order not found');
  return res.json();
}

/**
 * Poll the MoMo payment status for an order.
 * Call every 5s until status is SUCCESSFUL or FAILED.
 */
export async function getMomoStatus(orderId: string) {
  const res = await fetch(`${API_BASE}/orders/${orderId}/momo-status`);
  if (!res.ok) throw new Error('Failed to fetch payment status');
  return res.json(); // { status: 'PENDING' | 'SUCCESSFUL' | 'FAILED' }
}

/**
 * Fetch products from the backend (replaces reading products.json directly).
 */
export async function fetchProducts(params?: {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  const qs = new URLSearchParams(
    Object.entries(params || {})
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)])
  ).toString();

  const res = await fetch(`${API_BASE}/products${qs ? `?${qs}` : ''}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

/**
 * Fetch categories with counts.
 */
export async function fetchCategories() {
  const res = await fetch(`${API_BASE}/products/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}
