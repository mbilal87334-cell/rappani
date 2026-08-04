import React, { useState, useMemo } from 'react';
import {
  Download, FileText, BarChart2, Users, ShoppingBag, Truck, Calendar,
  TrendingUp, Package, AlertTriangle, IndianRupee, CheckCircle, XCircle, Clock
} from 'lucide-react';
import { Order } from '../../App';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock?: number;
  lowStockThreshold?: number;
  deliveryCharge?: number;
  image?: string;
}

interface ReportsHubProps {
  orders?: Order[];
  products?: Product[];
}

type DateRange = 'today' | 'yesterday' | 'week' | 'month' | 'year' | 'custom';

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
  { value: 'custom', label: 'Custom Date' },
];

function getDateRange(range: DateRange, customStart?: string, customEnd?: string): [Date, Date] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  switch (range) {
    case 'today': return [today, new Date(today.getTime() + 86400000 - 1)];
    case 'yesterday': {
      const y = new Date(today); y.setDate(y.getDate() - 1);
      return [y, new Date(y.getTime() + 86400000 - 1)];
    }
    case 'week': {
      const s = new Date(today); s.setDate(s.getDate() - s.getDay());
      return [s, new Date(today.getTime() + 86400000 - 1)];
    }
    case 'month': return [new Date(now.getFullYear(), now.getMonth(), 1), new Date(today.getTime() + 86400000 - 1)];
    case 'year': return [new Date(now.getFullYear(), 0, 1), new Date(today.getTime() + 86400000 - 1)];
    case 'custom': {
      const s = customStart ? new Date(customStart) : today;
      const e = customEnd ? new Date(new Date(customEnd).getTime() + 86400000 - 1) : new Date(today.getTime() + 86400000 - 1);
      return [s, e];
    }
  }
}

function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvRows = [headers.join(','), ...rows.map(r => r.join(','))];
  const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function ReportsHub({ orders = [], products = [] }: ReportsHubProps) {
  const [activeTab, setActiveTab] = useState<'sales' | 'stock' | 'customers' | 'orders' | 'tax'>('sales');
  const [dateRange, setDateRange] = useState<DateRange>('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeProducts = Array.isArray(products) ? products : [];

  const [rangeStart, rangeEnd] = useMemo(() => getDateRange(dateRange, customStart, customEnd), [dateRange, customStart, customEnd]);

  const filteredOrders = useMemo(() => safeOrders.filter(o => {
    const d = new Date(o.createdAt);
    return d >= rangeStart && d <= rangeEnd;
  }), [safeOrders, rangeStart, rangeEnd]);

  // ===== SALES METRICS =====
  const totalRevenue = filteredOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const totalOrders = filteredOrders.length;
  const deliveredOrders = filteredOrders.filter(o => ['delivered', 'completed'].includes((o.status || '').toLowerCase()));
  const pendingOrders = filteredOrders.filter(o => ['pending', 'processing', 'confirmed', 'packed', 'shipped'].includes((o.status || '').toLowerCase()));
  const cancelledOrders = filteredOrders.filter(o => ['cancelled', 'returned', 'refunded'].includes((o.status || '').toLowerCase()));
  const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Top selling products from order items
  const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};
  filteredOrders.forEach(o => {
    (o.items || []).forEach((item: any) => {
      const id = item.productId || item.product?.id || item.id || 'unknown';
      const name = item.productName || item.product?.name || item.name || 'Unknown Product';
      if (!productSales[id]) productSales[id] = { name, qty: 0, revenue: 0 };
      productSales[id].qty += item.quantity || 1;
      productSales[id].revenue += (item.price || 0) * (item.quantity || 1);
    });
  });
  const topProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  // Category breakdown
  const categorySales: Record<string, number> = {};
  filteredOrders.forEach(o => {
    (o.items || []).forEach((item: any) => {
      const cat = item.product?.category || item.category || 'Uncategorized';
      categorySales[cat] = (categorySales[cat] || 0) + (item.price || 0) * (item.quantity || 1);
    });
  });
  const topCategories = Object.entries(categorySales).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // ===== STOCK METRICS =====
  const inStock = safeProducts.filter(p => (p.stock || 0) > (p.lowStockThreshold || 10));
  const lowStock = safeProducts.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= (p.lowStockThreshold || 10));
  const outOfStock = safeProducts.filter(p => (p.stock || 0) <= 0);
  const inventoryValue = safeProducts.reduce((s, p) => s + (p.price || 0) * (p.stock || 0), 0);

  // ===== CUSTOMER METRICS =====
  const allCustomers = Array.from(new Set(safeOrders.map(o => o.customerPhone).filter(Boolean)));
  const periodCustomers = Array.from(new Set(filteredOrders.map(o => o.customerPhone).filter(Boolean)));
  const prevOrders = safeOrders.filter(o => new Date(o.createdAt) < rangeStart);
  const prevCustomers = new Set(prevOrders.map(o => o.customerPhone).filter(Boolean));
  const newCustomers = periodCustomers.filter(p => !prevCustomers.has(p));
  const returningCustomers = periodCustomers.filter(p => prevCustomers.has(p));

  // Top customers by spend
  const customerSpend: Record<string, { name: string; phone: string; spend: number; orders: number }> = {};
  safeOrders.forEach(o => {
    const phone = o.customerPhone || '';
    if (!customerSpend[phone]) customerSpend[phone] = { name: o.customerName || 'Guest', phone, spend: 0, orders: 0 };
    customerSpend[phone].spend += o.totalAmount || 0;
    customerSpend[phone].orders++;
  });
  const topCustomers = Object.values(customerSpend).sort((a, b) => b.spend - a.spend).slice(0, 5);

  // ===== TAX / GST =====
  const GST_RATE = 0.18;
  const taxOrders = filteredOrders.map(o => ({
    id: o.id,
    customer: o.customerName || 'Guest',
    date: new Date(o.createdAt).toLocaleDateString('en-IN'),
    amount: o.totalAmount || 0,
    taxable: Math.round((o.totalAmount || 0) / (1 + GST_RATE)),
    gst: Math.round(((o.totalAmount || 0) / (1 + GST_RATE)) * GST_RATE),
  }));
  const totalGST = taxOrders.reduce((s, o) => s + o.gst, 0);
  const totalTaxable = taxOrders.reduce((s, o) => s + o.taxable, 0);

  // ===== CSV DOWNLOADS =====
  const downloadSalesCSV = () => {
    downloadCSV(`sales_report_${dateRange}.csv`,
      ['Order ID', 'Customer', 'Phone', 'Date', 'Amount', 'Status', 'Payment Method'],
      filteredOrders.map(o => [
        o.id, `"${o.customerName || 'Guest'}"`, o.customerPhone || '',
        new Date(o.createdAt).toLocaleDateString('en-IN'),
        o.totalAmount || 0, o.status || '', o.paymentMethod || ''
      ])
    );
  };
  const downloadStockCSV = () => {
    downloadCSV(`stock_report.csv`,
      ['Product ID', 'Name', 'Category', 'Price', 'Stock', 'Status', 'Inventory Value'],
      safeProducts.map(p => [
        p.id, `"${p.name}"`, `"${p.category}"`, p.price, p.stock || 0,
        (p.stock || 0) <= 0 ? 'Out of Stock' : (p.stock || 0) <= (p.lowStockThreshold || 10) ? 'Low Stock' : 'In Stock',
        (p.price || 0) * (p.stock || 0)
      ])
    );
  };
  const downloadTaxCSV = () => {
    downloadCSV(`tax_report_${dateRange}.csv`,
      ['Order ID', 'Customer', 'Date', 'Total Amount', 'Taxable Amount', 'GST (18%)'],
      taxOrders.map(o => [o.id, `"${o.customer}"`, o.date, o.amount, o.taxable, o.gst])
    );
  };
  const downloadOrdersCSV = () => {
    downloadCSV(`orders_report_${dateRange}.csv`,
      ['Order ID', 'Customer', 'Phone', 'Date', 'Total', 'Status', 'Payment', 'Delivery Method'],
      filteredOrders.map(o => [
        o.id, `"${o.customerName || 'Guest'}"`, o.customerPhone || '',
        new Date(o.createdAt).toLocaleDateString('en-IN'),
        o.totalAmount || 0, o.status || '', o.paymentMethod || '', o.deliveryMethod || ''
      ])
    );
  };

  const tabs = [
    { id: 'sales', label: 'Sales', icon: TrendingUp },
    { id: 'stock', label: 'Stock', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'tax', label: 'Tax / GST', icon: FileText },
  ] as const;

  return (
    <div className="max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Reports & Analytics</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Detailed reports for sales, stock, customers, orders, and tax.</p>
        </div>
        {/* Date Range Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-md px-3 py-2 shadow-sm">
            <Calendar size={16} className="text-gray-400" />
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value as DateRange)}
              className="text-sm font-medium text-gray-700 bg-transparent outline-none border-none"
            >
              {DATE_RANGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          {dateRange === 'custom' && (
            <>
              <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)}
                className="border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900 shadow-sm" />
              <span className="text-gray-400 text-sm">to</span>
              <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)}
                className="border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900 shadow-sm" />
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <Icon size={15} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* ===== SALES TAB ===== */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: 'bg-green-50 text-green-700', icon: IndianRupee },
              { label: 'Total Orders', value: totalOrders, color: 'bg-blue-50 text-blue-700', icon: ShoppingBag },
              { label: 'Avg. Order Value', value: `₹${Math.round(aov).toLocaleString('en-IN')}`, color: 'bg-purple-50 text-purple-700', icon: TrendingUp },
              { label: 'Delivered', value: deliveredOrders.length, color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className={`${stat.color} rounded-xl p-4 border border-opacity-30`}>
                  <div className="flex items-center gap-2 mb-2"><Icon size={18} /></div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs font-semibold mt-1 opacity-70">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900">🏆 Top Selling Products</h3>
              <button onClick={downloadSalesCSV} className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors">
                <Download size={14} /> Export Sales CSV
              </button>
            </div>
            {topProducts.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No sales data for this period.</p>
            ) : (
              <div className="space-y-3">
                {topProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                      <span className="font-medium text-gray-800 text-sm">{p.name}</span>
                    </div>
                    <div className="flex gap-6 text-sm">
                      <span className="text-gray-500">Qty: <span className="font-bold text-gray-800">{p.qty}</span></span>
                      <span className="text-green-600 font-bold">₹{p.revenue.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category Breakdown */}
          {topCategories.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4">📂 Sales by Category</h3>
              <div className="space-y-3">
                {topCategories.map(([cat, rev], i) => {
                  const pct = totalRevenue > 0 ? Math.round((rev / totalRevenue) * 100) : 0;
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">{cat}</span>
                        <span className="font-bold text-gray-900">₹{rev.toLocaleString('en-IN')} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== STOCK TAB ===== */}
      {activeTab === 'stock' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'In Stock', value: inStock.length, color: 'bg-green-50 text-green-700' },
              { label: 'Low Stock', value: lowStock.length, color: 'bg-yellow-50 text-yellow-700' },
              { label: 'Out of Stock', value: outOfStock.length, color: 'bg-red-50 text-red-700' },
              { label: 'Inventory Value', value: `₹${inventoryValue.toLocaleString('en-IN')}`, color: 'bg-blue-50 text-blue-700' },
            ].map((stat, i) => (
              <div key={i} className={`${stat.color} rounded-xl p-4`}>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs font-semibold mt-1 opacity-70">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">📦 Stock Report</h3>
              <button onClick={downloadStockCSV} className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors">
                <Download size={14} /> Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs font-semibold border-b border-gray-100">
                  <tr>
                    <th className="px-5 py-3">PRODUCT</th>
                    <th className="px-5 py-3">CATEGORY</th>
                    <th className="px-5 py-3 text-right">PRICE</th>
                    <th className="px-5 py-3 text-right">STOCK</th>
                    <th className="px-5 py-3 text-right">INV. VALUE</th>
                    <th className="px-5 py-3 text-center">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[...outOfStock, ...lowStock, ...inStock].map(p => {
                    const stockQty = p.stock || 0;
                    const threshold = p.lowStockThreshold || 10;
                    let statusBadge;
                    if (stockQty <= 0) statusBadge = <span className="px-2 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full">Out of Stock</span>;
                    else if (stockQty <= threshold) statusBadge = <span className="px-2 py-1 bg-yellow-50 text-yellow-600 text-xs font-bold rounded-full flex items-center gap-1"><AlertTriangle size={11} /> Low Stock</span>;
                    else statusBadge = <span className="px-2 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full">In Stock</span>;
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3 font-medium text-gray-900">{p.name}</td>
                        <td className="px-5 py-3 text-gray-500">{p.category}</td>
                        <td className="px-5 py-3 text-right text-gray-700">₹{(p.price || 0).toLocaleString('en-IN')}</td>
                        <td className="px-5 py-3 text-right font-bold text-gray-900">{stockQty}</td>
                        <td className="px-5 py-3 text-right text-gray-700">₹{((p.price || 0) * stockQty).toLocaleString('en-IN')}</td>
                        <td className="px-5 py-3 text-center">{statusBadge}</td>
                      </tr>
                    );
                  })}
                  {safeProducts.length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">No products found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===== CUSTOMERS TAB ===== */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Customers', value: allCustomers.length, color: 'bg-blue-50 text-blue-700' },
              { label: 'New Customers', value: newCustomers.length, color: 'bg-green-50 text-green-700' },
              { label: 'Returning Customers', value: returningCustomers.length, color: 'bg-purple-50 text-purple-700' },
              { label: 'Period Active', value: periodCustomers.length, color: 'bg-amber-50 text-amber-700' },
            ].map((stat, i) => (
              <div key={i} className={`${stat.color} rounded-xl p-4`}>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs font-semibold mt-1 opacity-70">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-4">🌟 Top Customers by Spend</h3>
            {topCustomers.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No customer data yet.</p>
            ) : (
              <div className="space-y-3">
                {topCustomers.map((c, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">{i + 1}</div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{c.name}</p>
                        <p className="text-xs text-gray-400">{c.phone} • {c.orders} orders</p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900">₹{c.spend.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== ORDERS TAB ===== */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: 'Total Orders', value: totalOrders, color: 'bg-gray-100 text-gray-700', icon: ShoppingBag },
              { label: 'Delivered', value: deliveredOrders.length, color: 'bg-green-50 text-green-700', icon: CheckCircle },
              { label: 'Pending', value: pendingOrders.length, color: 'bg-yellow-50 text-yellow-700', icon: Clock },
              { label: 'Cancelled', value: cancelledOrders.length, color: 'bg-red-50 text-red-700', icon: XCircle },
              { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: 'bg-blue-50 text-blue-700', icon: IndianRupee },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className={`${stat.color} rounded-xl p-4`}>
                  <Icon size={20} className="mb-2 opacity-70" />
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs font-semibold mt-1 opacity-70">{stat.label}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">📋 Order Report</h3>
              <button onClick={downloadOrdersCSV} className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors">
                <Download size={14} /> Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs font-semibold border-b border-gray-100">
                  <tr>
                    <th className="px-5 py-3">ORDER ID</th>
                    <th className="px-5 py-3">CUSTOMER</th>
                    <th className="px-5 py-3">DATE</th>
                    <th className="px-5 py-3 text-right">AMOUNT</th>
                    <th className="px-5 py-3 text-center">STATUS</th>
                    <th className="px-5 py-3">METHOD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredOrders.slice(0, 50).map(o => {
                    const s = (o.status || '').toLowerCase();
                    const statusColor = s === 'delivered' || s === 'completed' ? 'bg-green-50 text-green-700' :
                      s === 'cancelled' || s === 'refunded' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700';
                    return (
                      <tr key={o.id} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3 font-mono text-xs text-gray-600">#{(o.id || '').slice(0, 8).toUpperCase()}</td>
                        <td className="px-5 py-3 font-medium text-gray-800">{o.customerName || 'Guest'}</td>
                        <td className="px-5 py-3 text-gray-500">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                        <td className="px-5 py-3 text-right font-bold text-gray-900">₹{(o.totalAmount || 0).toLocaleString('en-IN')}</td>
                        <td className="px-5 py-3 text-center"><span className={`px-2 py-1 text-xs font-bold rounded-full ${statusColor}`}>{o.status || 'Processing'}</span></td>
                        <td className="px-5 py-3 text-gray-500 capitalize">{o.paymentMethod || 'N/A'}</td>
                      </tr>
                    );
                  })}
                  {filteredOrders.length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">No orders for this period.</td></tr>
                  )}
                </tbody>
              </table>
              {filteredOrders.length > 50 && <p className="text-center text-xs text-gray-400 py-3">Showing 50 of {filteredOrders.length} orders. Export CSV for full data.</p>}
            </div>
          </div>
        </div>
      )}

      {/* ===== TAX TAB ===== */}
      {activeTab === 'tax' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Gross Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: 'bg-blue-50 text-blue-700' },
              { label: 'Taxable Amount (excl. GST)', value: `₹${totalTaxable.toLocaleString('en-IN')}`, color: 'bg-purple-50 text-purple-700' },
              { label: 'Total GST Collected (18%)', value: `₹${totalGST.toLocaleString('en-IN')}`, color: 'bg-green-50 text-green-700' },
            ].map((stat, i) => (
              <div key={i} className={`${stat.color} rounded-xl p-4`}>
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-xs font-semibold mt-1 opacity-70">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <strong>Note:</strong> GST is calculated at 18% (CGST 9% + SGST 9%) inclusive of the order total. Please verify with your CA for compliance.
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">🧾 Tax Summary</h3>
              <button onClick={downloadTaxCSV} className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors">
                <Download size={14} /> Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs font-semibold border-b border-gray-100">
                  <tr>
                    <th className="px-5 py-3">ORDER ID</th>
                    <th className="px-5 py-3">CUSTOMER</th>
                    <th className="px-5 py-3">DATE</th>
                    <th className="px-5 py-3 text-right">TOTAL</th>
                    <th className="px-5 py-3 text-right">TAXABLE (excl.)</th>
                    <th className="px-5 py-3 text-right">GST @18%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {taxOrders.slice(0, 50).map(o => (
                    <tr key={o.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3 font-mono text-xs text-gray-600">#{(o.id || '').slice(0, 8).toUpperCase()}</td>
                      <td className="px-5 py-3 font-medium text-gray-800">{o.customer}</td>
                      <td className="px-5 py-3 text-gray-500">{o.date}</td>
                      <td className="px-5 py-3 text-right font-bold text-gray-900">₹{o.amount.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-3 text-right text-gray-700">₹{o.taxable.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-3 text-right font-bold text-green-700">₹{o.gst.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                  {taxOrders.length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">No orders for this period.</td></tr>
                  )}
                </tbody>
              </table>
              {taxOrders.length > 50 && <p className="text-center text-xs text-gray-400 py-3">Showing 50 of {taxOrders.length} orders. Export CSV for full data.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
