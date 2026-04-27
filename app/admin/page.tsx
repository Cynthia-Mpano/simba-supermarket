'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  Menu, 
  X,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  Truck,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent 
} from '@/components/ui/chart';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import productData from '@/data/products.json';
import { useStore } from '@/lib/store-context';
import { getTranslation } from '@/lib/translations';
import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';

const products = productData.products as Product[];

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'out_for_delivery' | 'delivered' | 'cancelled';

interface Order {
  id: string;
  customer: string;
  email: string;
  phone: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  date: string;
  address: string;
}

const mockOrders: Order[] = [
  { id: 'SIM-001', customer: 'Jean Pierre', email: 'jean@example.rw', phone: '+250 788 123 456', items: [{ name: 'Tide Detergent', quantity: 2, price: 4500 }, { name: 'Bread', quantity: 1, price: 800 }], total: 9800, status: 'pending', paymentMethod: 'MoMo', date: '2026-04-27', address: 'Kigali, Gasabo' },
  { id: 'SIM-002', customer: 'Marie Uwase', email: 'marie@example.rw', phone: '+250 722 987 654', items: [{ name: 'Milk 1L', quantity: 3, price: 1200 }, { name: 'Eggs 30pcs', quantity: 1, price: 3500 }], total: 7100, status: 'confirmed', paymentMethod: 'Airtel', date: '2026-04-26', address: 'Kigali, Nyarugenge' },
  { id: 'SIM-003', customer: 'Claude Bizimungu', email: 'claude@example.rw', phone: '+250 734 456 789', items: [{ name: 'Rice 5kg', quantity: 2, price: 8500 }, { name: 'Oil 2L', quantity: 1, price: 6000 }], total: 23000, status: 'processing', paymentMethod: 'Cash', date: '2026-04-26', address: 'Kigali, Kicukiro' },
  { id: 'SIM-004', customer: 'Sarah Mukamana', email: 'sarah@example.rw', phone: '+250 735 111 222', items: [{ name: 'Chicken', quantity: 1, price: 12000 }, { name: 'Vegetables', quantity: 1, price: 3500 }], total: 15500, status: 'out_for_delivery', paymentMethod: 'MoMo', date: '2026-04-25', address: 'Kigali, Gasabo' },
  { id: 'SIM-005', customer: 'David Hategekimana', email: 'david@example.rw', phone: '+250 738 333 444', items: [{ name: 'Sugar 1kg', quantity: 2, price: 2200 }, { name: 'Tea Leaves', quantity: 1, price: 1500 }], total: 5900, status: 'delivered', paymentMethod: 'Airtel', date: '2026-04-24', address: 'Kigali, Nyarugenge' },
  { id: 'SIM-006', customer: 'Grace Nyirabega', email: 'grace@example.rw', phone: '+250 739 555 666', items: [{ name: 'Fish', quantity: 2, price: 8000 }, { name: 'Tomatoes', quantity: 1, price: 2000 }], total: 18000, status: 'cancelled', paymentMethod: 'MoMo', date: '2026-04-23', address: 'Kigali, Kicukiro' },
];

const dailyRevenue = [
  { day: 'Mon', revenue: 125000, orders: 12 },
  { day: 'Tue', revenue: 158000, orders: 15 },
  { day: 'Wed', revenue: 142000, orders: 14 },
  { day: 'Thu', revenue: 189000, orders: 18 },
  { day: 'Fri', revenue: 210000, orders: 22 },
  { day: 'Sat', revenue: 245000, orders: 28 },
  { day: 'Sun', revenue: 176000, orders: 19 },
];

const weeklyRevenue = [
  { week: 'W1', revenue: 850000 },
  { week: 'W2', revenue: 920000 },
  { week: 'W3', revenue: 780000 },
  { week: 'W4', revenue: 1100000 },
];

const monthlyRevenue = [
  { month: 'Jan', revenue: 3200000 },
  { month: 'Feb', revenue: 2800000 },
  { month: 'Mar', revenue: 3500000 },
  { month: 'Apr', revenue: 4100000 },
];

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Package, label: 'Products', href: '/admin/products' },
  { icon: ShoppingCart, label: 'Orders', href: '/admin/orders' },
  { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: <Clock className="h-3 w-3" /> },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: <CheckCircle2 className="h-3 w-3" /> },
  processing: { label: 'Processing', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', icon: <Package className="h-3 w-3" /> },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', icon: <Truck className="h-3 w-3" /> },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircle2 className="h-3 w-3" /> },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: <AlertCircle className="h-3 w-3" /> },
};

function DashboardOverview({ locale }: { locale: string }) {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(locale, key);
  
  const totalRevenue = dailyRevenue.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = dailyRevenue.reduce((sum, d) => sum + d.orders, 0);
  const pendingOrders = mockOrders.filter(o => o.status === 'pending').length;
  const lowStockItems = products.filter(p => !p.inStock).length;

  const formatPrice = (price: number) => new Intl.NumberFormat('en-RW', { style: 'decimal', minimumFractionDigits: 0 }).format(price);

  const stats = [
    { title: t('dashboardRevenue'), value: formatPrice(totalRevenue), change: '+12.5%', trend: 'up', icon: DollarSign, color: 'bg-green-500' },
    { title: t('dashboardOrders'), value: totalOrders.toString(), change: '+8.2%', trend: 'up', icon: ShoppingCart, color: 'bg-blue-500' },
    { title: t('dashboardPending'), value: pendingOrders.toString(), change: '-3', trend: 'down', icon: Clock, color: 'bg-yellow-500' },
    { title: 'Low Stock', value: lowStockItems.toString(), change: '+2', trend: 'up', icon: AlertCircle, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center p-4">
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mr-4', stat.color)}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <span className={cn('text-xs flex items-center', stat.trend === 'up' ? 'text-green-500' : 'text-red-500')}>
                      {stat.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {stat.change}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Daily Revenue (This Week)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ revenue: { label: 'Revenue', color: 'hsl(var(--primary))' } }} className="h-[300px]">
              <AreaChart data={dailyRevenue}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <ChartTooltip content={<ChartTooltipContent />} formatter={(value: number) => [formatPrice(value) + ' RWF', 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#revenueGradient)" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ orders: { label: 'Orders', color: 'hsl(var(--chart-2))' } }} className="h-[300px]">
              <BarChart data={dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="orders" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders & Inventory */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{t('dashboardRecentOrders')}</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link href="/admin/orders">View All</Link></Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{order.id}</p>
                    <p className="text-xs text-muted-foreground">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{formatPrice(order.total)} RWF</p>
                    <Badge variant="secondary" className={cn('text-xs', statusConfig[order.status].color)}>
                      {statusConfig[order.status].icon}
                      <span className="ml-1">{statusConfig[order.status].label}</span>
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Inventory Alert</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link href="/admin/products">View All</Link></Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {products.filter(p => !p.inStock).slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <div>
                      <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.category}</p>
                    </div>
                  </div>
                  <Badge variant="destructive">Out of Stock</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function OrdersPage({ locale }: { locale: string }) {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(locale, key);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  
  const formatPrice = (price: number) => new Intl.NumberFormat('en-RW', { style: 'decimal', minimumFractionDigits: 0 }).format(price);
  
  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    console.log('Update order:', orderId, 'to', newStatus);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">{t('dashboardOrders')}</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search orders..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[200px]"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
            className="px-3 py-2 rounded-md border border-input bg-background text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-muted/50 border-b text-sm">
                <tr>
                  <th className="p-4 font-medium">{t('dashboardOrderId')}</th>
                  <th className="p-4 font-medium">{t('dashboardCustomer')}</th>
                  <th className="p-4 font-medium">{t('dashboardPayment')}</th>
                  <th className="p-4 font-medium">{t('dashboardAmount')}</th>
                  <th className="p-4 font-medium">{t('dashboardStatus')}</th>
                  <th className="p-4 font-medium">{t('dashboardDate')}</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30">
                    <td className="p-4 font-medium">{order.id}</td>
                    <td className="p-4">
                      <p className="font-medium">{order.customer}</p>
                      <p className="text-xs text-muted-foreground">{order.phone}</p>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline">{order.paymentMethod}</Badge>
                    </td>
                    <td className="p-4 font-medium">{formatPrice(order.total)} RWF</td>
                    <td className="p-4">
                      <Badge className={cn(statusConfig[order.status].color, 'gap-1')}>
                        {statusConfig[order.status].icon}
                        {statusConfig[order.status].label}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{order.date}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProductsPage({ locale }: { locale: string }) {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(locale, key);
  const [searchQuery, setSearchQuery] = useState('');
  
  const formatPrice = (price: number) => new Intl.NumberFormat('en-RW', { style: 'decimal', minimumFractionDigits: 0 }).format(price);
  
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 50);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Products</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[200px]"
            />
          </div>
          <Button><Plus className="h-4 w-4 mr-2" />Add Product</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-muted/50 border-b text-sm">
                <tr>
                  <th className="p-4 font-medium">ID</th>
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">{t('category')}</th>
                  <th className="p-4 font-medium">{t('dashboardAmount')}</th>
                  <th className="p-4 font-medium">Stock</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/30">
                    <td className="p-4 text-sm text-muted-foreground">#{product.id}</td>
                    <td className="p-4 font-medium">{product.name}</td>
                    <td className="p-4 text-sm text-muted-foreground">{product.category}</td>
                    <td className="p-4 font-medium">{formatPrice(product.price)} RWF</td>
                    <td className="p-4">
                      <Badge className={product.inStock ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t text-center text-sm text-muted-foreground">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AnalyticsPage({ locale }: { locale: string }) {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(locale, key);
  const formatPrice = (price: number) => new Intl.NumberFormat('en-RW', { style: 'decimal', minimumFractionDigits: 0 }).format(price);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics</h2>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Daily Revenue (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ revenue: { label: 'Revenue', color: 'hsl(var(--primary))' } }} className="h-[350px]">
              <LineChart data={dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <ChartTooltip content={<ChartTooltipContent />} formatter={(value: number) => [formatPrice(value) + ' RWF', 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Weekly Revenue (Last 4 Weeks)</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ revenue: { label: 'Revenue', color: 'hsl(var(--chart-2))' } }} className="h-[250px]">
                <BarChart data={weeklyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis dataKey="week" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} />
                  <ChartTooltip content={<ChartTooltipContent />} formatter={(value: number) => [formatPrice(value) + ' RWF', 'Revenue']} />
                  <Bar dataKey="revenue" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Monthly Revenue (This Year)</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ revenue: { label: 'Revenue', color: 'hsl(var(--chart-3))' } }} className="h-[250px]">
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} />
                  <ChartTooltip content={<ChartTooltipContent />} formatter={(value: number) => [formatPrice(value) + ' RWF', 'Revenue']} />
                  <Bar dataKey="revenue" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { locale } = useStore();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(locale, key);
  const pathname = usePathname();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');

  const renderContent = () => {
    switch (activePage) {
      case 'orders':
        return <OrdersPage locale={locale} />;
      case 'products':
        return <ProductsPage locale={locale} />;
      case 'analytics':
        return <AnalyticsPage locale={locale} />;
      default:
        return <DashboardOverview locale={locale} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-card border-b">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
          <h1 className="font-bold text-lg">Admin Panel</h1>
          <div className="w-10" />
        </div>
      </header>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed top-0 left-0 z-50 h-full w-64 bg-card border-r transition-transform duration-300',
        'lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">S</span>
              </div>
              <span className="font-bold text-lg">Admin</span>
            </Link>
          </div>
          
          <nav className="flex-1 p-4 space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.href}
                onClick={() => { setActivePage(item.href.replace('/admin/', '').replace('/', '') || 'dashboard'); setSidebarOpen(false); }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  activePage === (item.href.replace('/admin/', '').replace('/', '') || 'dashboard')
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t">
            <Link href="/" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground">
              <Settings className="h-5 w-5" />
              Back to Store
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}