/**
 * Simba Supermarket — Frontend API client
 * Connects to the Express backend at NEXT_PUBLIC_API_URL
 * Falls back gracefully when backend is offline.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Orders ────────────────────────────────────────────────────────────

export interface PlaceOrderPayload {
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  district: string;
  paymentMethod: 'momo' | 'airtel' | 'cash';
  items: { id: number; quantity: number }[];
}

export interface PlaceOrderResponse {
  orderId: string;
  total: number;
  subtotal: number;
  deliveryFee: number;
  paymentMethod: string;
  momoReference?: string;
  message: string;
}

export async function placeOrder(payload: PlaceOrderPayload): Promise<PlaceOrderResponse> {
  return apiFetch<PlaceOrderResponse>('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getOrder(orderId: string) {
  return apiFetch<Record<string, unknown>>(`/orders/${orderId}`);
}

export async function getMomoStatus(orderId: string) {
  return apiFetch<{ status: string; momoStatus?: string }>(`/orders/${orderId}/momo-status`);
}

// ── Admin ─────────────────────────────────────────────────────────────

export interface AdminLoginResponse {
  token: string;
  admin: { email: string; role: string };
}

export async function adminLogin(email: string, password: string): Promise<AdminLoginResponse> {
  return apiFetch<AdminLoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getAdminOrders(token: string, status?: string, page = 1) {
  const params = new URLSearchParams({ page: String(page), limit: '20' });
  if (status) params.set('status', status);
  return apiFetch<{ orders: AdminOrder[]; pagination: Pagination }>(`/orders?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateOrderStatus(token: string, orderId: string, status: string) {
  return apiFetch(`/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status }),
  });
}

export async function getAnalyticsSummary(token: string) {
  return apiFetch<AnalyticsSummary>('/analytics/summary', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getRevenueChart(token: string, days = 30) {
  return apiFetch<RevenueDay[]>(`/analytics/revenue?days=${days}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ── Types ─────────────────────────────────────────────────────────────

export interface AdminOrder {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  order_status: string;
  payment_status: string;
  payment_method: string;
  total: number;
  created_at: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface AnalyticsSummary {
  summary: {
    total_orders: number;
    total_revenue: number;
    paid_revenue: number;
    avg_order_value: number;
  };
  byStatus: { order_status: string; count: number }[];
  today: { count: number; revenue: number };
  topProducts: { product_name: string; qty_sold: number; revenue: number }[];
}

export interface RevenueDay {
  date: string;
  orders: number;
  revenue: number;
}
