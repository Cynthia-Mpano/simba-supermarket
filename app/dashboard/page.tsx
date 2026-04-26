'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  ShoppingBag, TrendingUp, Clock, CheckCircle2, Truck, XCircle,
  Package, LogOut, RefreshCw, ChevronDown, Home,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useStore } from '@/lib/store-context';
import { getTranslation } from '@/lib/translations';
import {
  adminLogin, getAdminOrders, updateOrderStatus, getAnalyticsSummary, getRevenueChart,
  type AdminOrder, type AnalyticsSummary, type RevenueDay,
} from '@/lib/api';

// ── Status helpers ────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  processing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  out_for_delivery: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const NEXT_STATUSES: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

const PAYMENT_COLORS: Record<string, string> = {
  paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

function formatPrice(n: number) {
  return new Intl.NumberFormat('en-RW', { minimumFractionDigits: 0 }).format(n);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-RW', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

// ── Login Screen ──────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: (token: string, email: string) => void }) {
  const { locale } = useStore();
  const t = (k: Parameters<typeof getTranslation>[1]) => getTranslation(locale, k);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await adminLogin(email, password);
      onLogin(res.token, res.admin.email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center pb-2">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-primary-foreground font-bold text-xl">S</span>
          </div>
          <CardTitle>{t('dashboardLogin')}</CardTitle>
          <p className="text-sm text-muted-foreground">Simba Supermarket</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">{t('dashboardEmail')}</Label>
              <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@simbasupermarket.rw" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('dashboardPassword')}</Label>
              <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('processing') : t('dashboardLoginBtn')}
            </Button>
            <Link href="/" className="block">
              <Button variant="ghost" className="w-full gap-2" type="button">
                <Home className="h-4 w-4" /> Back to Store
              </Button>
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────

function StatCard({ title, value, sub, icon, color }: { title: string; value: string; sub?: string; icon: React.ReactNode; color: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────

export default function DashboardPage() {
  const { locale, isDark, toggleTheme } = useStore();
  const t = (k: Parameters<typeof getTranslation>[1]) => getTranslation(locale, k);

  const [token, setToken] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueDay[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [backendOffline, setBackendOffline] = useState(false);

  const loadData = useCallback(async (tok: string) => {
    setLoading(true);
    try {
      const [analyticsRes, revenueRes, ordersRes] = await Promise.all([
        getAnalyticsSummary(tok),
        getRevenueChart(tok, 14),
        getAdminOrders(tok, statusFilter || undefined, page),
      ]);
      setAnalytics(analyticsRes);
      setRevenueData(revenueRes);
      setOrders(ordersRes.orders);
      setTotalPages(ordersRes.pagination.pages);
      setBackendOffline(false);
    } catch {
      setBackendOffline(true);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    // Restore token from sessionStorage
    const saved = sessionStorage.getItem('simba-admin-token');
    const savedEmail = sessionStorage.getItem('simba-admin-email');
    if (saved && savedEmail) {
      setToken(saved);
      setAdminEmail(savedEmail);
    }
  }, []);

  useEffect(() => {
    if (token) loadData(token);
  }, [token, loadData]);

  const handleLogin = (tok: string, email: string) => {
    sessionStorage.setItem('simba-admin-token', tok);
    sessionStorage.setItem('simba-admin-email', email);
    setToken(tok);
    setAdminEmail(email);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('simba-admin-token');
    sessionStorage.removeItem('simba-admin-email');
    setToken(null);
    setAdminEmail('');
    setAnalytics(null);
    setOrders([]);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    if (!token) return;
    setUpdatingOrder(orderId);
    try {
      await updateOrderStatus(token, orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, order_status: newStatus } : o));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setUpdatingOrder(null);
    }
  };

  if (!token) return <LoginScreen onLogin={handleLogin} />;

  const statusCounts = analytics?.byStatus.reduce((acc, s) => {
    acc[s.order_status] = s.count;
    return acc;
  }, {} as Record<string, number>) ?? {};

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">S</span>
              </div>
              <div>
                <h1 className="font-bold text-sm text-foreground leading-tight">{t('dashboardTitle')}</h1>
                <p className="text-xs text-muted-foreground">{adminEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {backendOffline && (
                <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full">
                  {t('backendOffline')}
                </span>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => token && loadData(token)} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Link href="/">
                <Button variant="ghost" size="sm" className="h-8 gap-1.5">
                  <Home className="h-3.5 w-3.5" /> Store
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-red-500 hover:text-red-600" onClick={handleLogout}>
                <LogOut className="h-3.5 w-3.5" /> {t('dashboardLogout')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={t('dashboardOrders')}
            value={String(analytics?.summary.total_orders ?? '—')}
            sub={`Today: ${analytics?.today.count ?? 0}`}
            icon={<ShoppingBag className="h-5 w-5 text-blue-600" />}
            color="bg-blue-100 dark:bg-blue-900/30"
          />
          <StatCard
            title={t('dashboardRevenue')}
            value={analytics ? `${formatPrice(Number(analytics.summary.total_revenue))} RWF` : '—'}
            sub={`Paid: ${analytics ? formatPrice(Number(analytics.summary.paid_revenue)) : 0} RWF`}
            icon={<TrendingUp className="h-5 w-5 text-green-600" />}
            color="bg-green-100 dark:bg-green-900/30"
          />
          <StatCard
            title={t('dashboardToday')}
            value={String(analytics?.today.count ?? '—')}
            icon={<Clock className="h-5 w-5 text-purple-600" />}
            color="bg-purple-100 dark:bg-purple-900/30"
          />
          <StatCard
            title={t('dashboardTodayRevenue')}
            value={analytics ? `${formatPrice(Number(analytics.today.revenue))} RWF` : '—'}
            icon={<Package className="h-5 w-5 text-orange-600" />}
            color="bg-orange-100 dark:bg-orange-900/30"
          />
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap gap-2">
          {['pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'cancelled'].map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(statusFilter === s ? '' : s); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                statusFilter === s ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:border-primary/50'
              }`}
            >
              {s.replace('_', ' ')} {statusCounts[s] ? `(${statusCounts[s]})` : ''}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Revenue — Last 14 Days</CardTitle>
              </CardHeader>
              <CardContent>
                {revenueData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={revenueData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        formatter={(v: number) => [`${formatPrice(v)} RWF`, 'Revenue']}
                        labelFormatter={l => `Date: ${l}`}
                        contentStyle={{ fontSize: 12 }}
                      />
                      <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                    {backendOffline ? 'Connect backend to see revenue data' : 'No data yet'}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top Products */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t('dashboardTopProducts')}</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics?.topProducts.length ? (
                <div className="space-y-3">
                  {analytics.topProducts.slice(0, 6).map((p, i) => (
                    <div key={p.product_name} className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p.product_name}</p>
                        <p className="text-xs text-muted-foreground">{p.qty_sold} sold</p>
                      </div>
                      <span className="text-xs font-medium text-primary shrink-0">
                        {formatPrice(Number(p.revenue))}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {backendOffline ? 'Connect backend to see top products' : 'No sales data yet'}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{t('dashboardRecentOrders')}</CardTitle>
              <span className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('dashboardOrderId')}</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('dashboardCustomer')}</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">{t('dashboardPayment')}</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('dashboardAmount')}</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('dashboardStatus')}</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">{t('dashboardDate')}</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('dashboardUpdateStatus')}</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-muted-foreground">
                        {backendOffline ? 'Connect backend to see orders' : 'No orders found'}
                      </td>
                    </tr>
                  ) : (
                    orders.map(order => (
                      <tr key={order.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs font-medium text-primary">{order.id}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground">{order.full_name}</p>
                          <p className="text-xs text-muted-foreground">{order.phone}</p>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="space-y-1">
                            <span className="text-xs capitalize">{order.payment_method}</span>
                            <br />
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${PAYMENT_COLORS[order.payment_status] || ''}`}>
                              {order.payment_status}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium">{formatPrice(Number(order.total))} RWF</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[order.order_status] || ''}`}>
                            {order.order_status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          {NEXT_STATUSES[order.order_status]?.length > 0 ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs gap-1"
                                  disabled={updatingOrder === order.id}
                                >
                                  {updatingOrder === order.id ? (
                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <>Update <ChevronDown className="h-3 w-3" /></>
                                  )}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {NEXT_STATUSES[order.order_status].map(s => (
                                  <DropdownMenuItem
                                    key={s}
                                    onClick={() => handleStatusUpdate(order.id, s)}
                                    className={s === 'cancelled' ? 'text-red-500 focus:text-red-500' : ''}
                                  >
                                    {s === 'confirmed' && <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-blue-500" />}
                                    {s === 'processing' && <Package className="h-3.5 w-3.5 mr-2 text-purple-500" />}
                                    {s === 'out_for_delivery' && <Truck className="h-3.5 w-3.5 mr-2 text-orange-500" />}
                                    {s === 'delivered' && <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-green-500" />}
                                    {s === 'cancelled' && <XCircle className="h-3.5 w-3.5 mr-2" />}
                                    {s.replace('_', ' ')}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 p-4 border-t border-border">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
