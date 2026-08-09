import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  BarChart3, TrendingUp, DollarSign, ShoppingBag, Loader, Users,
  Package, ArrowUpRight, ArrowDownRight, Star
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { fetchWithAuth } from '../../api';
import { Order } from '../../App';

interface Product {
  id: string;
  name: string;
  price: number;
  stock?: number;
  category?: string;
  image?: string;
}

interface AnalyticsDashboardProps {
  orders?: Order[];
  products?: Product[];
}

export default function AnalyticsDashboard({ orders = [], products = [] }: AnalyticsDashboardProps) {
  const [summaryData, setSummaryData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeProducts = Array.isArray(products) ? products : [];

  useEffect(() => {
    fetchWithAuth('/api/analytics/summary')
      .then(r => r.json())
      .then(d => setSummaryData(d))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const now = new Date();

  // Last 7 days revenue chart
  const last7DaysChart = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - i));
      const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
      const revenue = safeOrders
        .filter(o => {
          const od = new Date(o.createdAt);
          return od.getDate() === d.getDate() && od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
        })
        .reduce((s, o) => s + (o.totalAmount || 0), 0);
      const count = safeOrders.filter(o => {
        const od = new Date(o.createdAt);
        return od.getDate() === d.getDate() && od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
      }).length;
      return { date: label, revenue, orders: count };
    });
  }, [safeOrders]);

  // Last 6 months chart
  const last6MonthsChart = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const m = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const label = m.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      const revenue = safeOrders
        .filter(o => {
          const od = new Date(o.createdAt);
          return od.getMonth() === m.getMonth() && od.getFullYear() === m.getFullYear();
        })
        .reduce((s, o) => s + (o.totalAmount || 0), 0);
      return { month: label, revenue };
    });
  }, [safeOrders]);

  // Top selling products
  const topProducts = useMemo(() => {
    const sales: Record<string, { name: string; qty: number; revenue: number; image?: string }> = {};
    safeOrders.forEach(o => {
      (o.items || []).forEach((item: any) => {
        const id = item.productId || item.product?.id || item.id || Math.random().toString();
        const name = item.productName || item.product?.name || item.name || 'Unknown';
        const image = item.product?.image || item.image;
        if (!sales[id]) sales[id] = { name, qty: 0, revenue: 0, image };
        sales[id].qty += item.quantity || 1;
        sales[id].revenue += (item.price || 0) * (item.quantity || 1);
      });
    });
    return Object.values(sales).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [safeOrders]);

  // Recent orders
  const recentOrders = useMemo(() =>
    [...safeOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    [safeOrders]
  );

  // Key stats
  const totalRevenue = safeOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const thisMonthOrders = safeOrders.filter(o => {
    const d = new Date(o.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const lastMonthOrders = safeOrders.filter(o => {
    const d = new Date(o.createdAt);
    let m = now.getMonth() - 1, y = now.getFullYear();
    if (m < 0) { m = 11; y--; }
    return d.getMonth() === m && d.getFullYear() === y;
  });
  const thisMonthRev = thisMonthOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const lastMonthRev = lastMonthOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const revGrowth = lastMonthRev === 0 ? 100 : ((thisMonthRev - lastMonthRev) / lastMonthRev) * 100;
  const totalCustomers = new Set(safeOrders.map(o => o.customerPhone).filter(Boolean)).size;
  const lowStock = safeProducts.filter(p => (p.stock || 0) <= 10 && (p.stock || 0) > 0).length;
  const outOfStock = safeProducts.filter(p => (p.stock || 0) <= 0).length;

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      sub: `This month: ₹${thisMonthRev.toLocaleString('en-IN')}`,
      trend: revGrowth,
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Total Orders',
      value: safeOrders.length,
      sub: `This month: ${thisMonthOrders.length}`,
      trend: lastMonthOrders.length === 0 ? 100 : ((thisMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100,
      icon: ShoppingBag,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Customers',
      value: totalCustomers,
      sub: `${safeProducts.length} products active`,
      trend: 0,
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'Stock Alerts',
      value: lowStock + outOfStock,
      sub: `${outOfStock} out of stock`,
      trend: 0,
      icon: Package,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      isAlert: outOfStock > 0,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader className="w-10 h-10 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Analytics Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">Real-time overview of your store's performance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => {
          const Icon = card.icon;
          const isPositive = card.trend >= 0;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`bg-white p-5 rounded-2xl shadow-sm border ${card.isAlert ? 'border-amber-200' : 'border-gray-100'} relative overflow-hidden group`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                {card.trend !== 0 && (
                  <div className={`flex items-center gap-1 text-xs font-bold ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
                    {isPositive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                    {Math.abs(card.trend).toFixed(1)}%
                  </div>
                )}
              </div>
              <p className="text-gray-500 text-xs font-semibold mb-1">{card.title}</p>
              <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
              <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 7-day Revenue Area Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-1">Revenue — Last 7 Days</h3>
          <p className="text-xs text-gray-400 mb-5">Daily revenue trend</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7DaysChart} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#d1d5db" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#d1d5db" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
                  formatter={(v: any) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 6-month Bar Chart */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-1">Monthly Revenue</h3>
          <p className="text-xs text-gray-400 mb-5">Last 6 months</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last6MonthsChart} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#d1d5db" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#d1d5db" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <Tooltip
                  contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
                  formatter={(v: any) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#6366f1" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Top Products + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Products */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-gray-900">Top Products</h3>
          </div>
          {topProducts.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">No sales data yet.</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  {p.image && <img src={p.image} alt={p.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" onError={e => (e.currentTarget.style.display = 'none')} />}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.qty} sold</p>
                  </div>
                  <span className="font-bold text-sm text-gray-900 flex-shrink-0">₹{p.revenue.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag className="w-4 h-4 text-blue-500" />
            <h3 className="font-bold text-gray-900">Recent Orders</h3>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((o, i) => {
                const s = (o.status || '').toLowerCase();
                const statusColor = s === 'delivered' || s === 'completed' ? 'bg-green-50 text-green-700' :
                  s === 'cancelled' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700';
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                      <ShoppingBag size={16} className="text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{o.customerName || 'Guest'}</p>
                      <p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-bold text-sm text-gray-900">₹{(o.totalAmount || 0).toLocaleString('en-IN')}</span>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusColor}`}>{o.status || 'Processing'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
