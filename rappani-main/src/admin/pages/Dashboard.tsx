import React from 'react';
import { 
  IndianRupee, 
  ShoppingCart, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Users, 
  Package, 
  Calendar,
  TrendingUp,
  CheckCircle,
  Truck,
  Box,
  AlertTriangle,
  Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';



const StatRow = ({ title, value, icon: Icon, colorClass }: any) => (
  <div className="bg-white rounded-lg p-4 border border-neutral-300/50 shadow-sm flex items-center gap-4">
    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-neutral-500 text-sm font-medium">{title}</p>
      <h3 className="text-primary text-lg font-semibold">{value}</h3>
    </div>
  </div>
);

export default function Dashboard({ orders = [], products = [] }: { orders?: any[], products?: any[] }) {
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeProducts = Array.isArray(products) ? products : [];

  const {
    todayRevenue,
    todayOrdersCount,
    pendingOrdersCount,
    processingOrdersCount,
    packedOrdersCount,
    shippedOrdersCount,
    deliveredOrdersCount,
    completedOrdersCount,
    cancelledOrdersCount,
    totalCustomers,
    monthlyRevenue,
    weeklyRevenue,
    overallRevenue,
    weeklyRevenueData,
    recentOrders,
    monthlyGrowthData,
    categoryData,
    latestCustomers
  } = React.useMemo(() => {
    let tRev = 0, tOrd = 0, pOrd = 0, prOrd = 0, pkOrd = 0, shOrd = 0, dlOrd = 0, cOrd = 0, cxOrd = 0, mRev = 0, wRev = 0, oRev = 0;
    const customers = new Set();
    const customerList: any[] = [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfWeek = today - (now.getDay() * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    // Last 7 days including today
    const weekMap = new Map();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today - (i * 24 * 60 * 60 * 1000));
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      weekMap.set(dayName, 0);
    }
    
    // Last 6 months
    const monthMap = new Map();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      monthMap.set(monthName, 0);
    }

    const sortedOrders = [...safeOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    sortedOrders.forEach(order => {
      const status = (order.status || '').toLowerCase();
      const amount = order.totalAmount || 0;
      const orderTime = new Date(order.createdAt).getTime();

      if (order.customerDetails?.phone) {
        if (!customers.has(order.customerDetails.phone)) {
           customers.add(order.customerDetails.phone);
           customerList.push(order.customerDetails);
        }
      }

      if (status === 'pending') pOrd++;
      else if (status === 'processing') prOrd++;
      else if (status === 'packed') pkOrd++;
      else if (status === 'shipped') shOrd++;
      else if (status === 'delivered') dlOrd++;
      else if (status === 'cancelled' || status === 'failed' || status === 'returned' || status === 'refunded') cxOrd++;
      
      if (['completed', 'delivered', 'shipped', 'packed', 'processing', 'success'].includes(status) || !['cancelled', 'failed', 'returned', 'refunded', 'pending'].includes(status)) {
        cOrd++; // legacy counter for generic "completed/active" stats if needed
        oRev += amount;

        if (orderTime >= today) tRev += amount;
        if (orderTime >= startOfWeek) wRev += amount;
        if (orderTime >= startOfMonth) mRev += amount;

        // Fill weekly chart
        if (orderTime >= today - (6 * 24 * 60 * 60 * 1000)) {
          const dayName = new Date(orderTime).toLocaleDateString('en-US', { weekday: 'short' });
          if (weekMap.has(dayName)) {
            weekMap.set(dayName, weekMap.get(dayName) + amount);
          }
        }
        
        // Fill monthly chart
        const orderMonth = new Date(orderTime).toLocaleDateString('en-US', { month: 'short' });
        if (monthMap.has(orderMonth)) {
           monthMap.set(orderMonth, monthMap.get(orderMonth) + amount);
        }
      }

      if (orderTime >= today) {
        tOrd++;
      }
    });

    const weeklyData = Array.from(weekMap.entries()).map(([name, revenue]) => ({ name, revenue }));
    const monthlyData = Array.from(monthMap.entries()).map(([name, sales]) => ({ name, sales }));
    
    // Compute category distribution from products
    const catCounts: Record<string, number> = {};
    safeProducts.forEach(p => {
       const cat = p.category || 'Uncategorized';
       catCounts[cat] = (catCounts[cat] || 0) + 1;
    });
    
    const colors = ['#ef4444', '#a855f7', '#f59e0b', '#10b981', '#3b82f6'];
    const catData = Object.keys(catCounts).map((cat, i) => ({
       name: cat,
       value: catCounts[cat],
       color: colors[i % colors.length]
    }));

    return {
      todayRevenue: tRev,
      todayOrdersCount: tOrd,
      pendingOrdersCount: pOrd,
      processingOrdersCount: prOrd,
      packedOrdersCount: pkOrd,
      shippedOrdersCount: shOrd,
      deliveredOrdersCount: dlOrd,
      completedOrdersCount: cOrd,
      cancelledOrdersCount: cxOrd,
      totalCustomers: customers.size,
      monthlyRevenue: mRev,
      weeklyRevenue: wRev,
      overallRevenue: oRev,
      weeklyRevenueData: weeklyData,
      monthlyGrowthData: monthlyData,
      categoryData: catData.length > 0 ? catData : [{ name: 'No Products', value: 1, color: '#e5e7eb' }],
      recentOrders: sortedOrders.slice(0, 5),
      latestCustomers: customerList.slice(0, 5)
    };
  }, [safeOrders, safeProducts]);

  const totalProducts = safeProducts.length;
  const lowStockProducts = safeProducts.filter(p => (p.stock || 0) <= 5);
  const navigate = useNavigate();

  const handleGenerateReport = () => {
    try {
      const headers = ["Metric", "Value"];
      const rows: (string | number)[][] = [
        ["Report Title", "Rappani Store Executive Summary Report"],
        ["Generated At", new Date().toLocaleString('en-IN')],
        ["Today's Revenue", `₹${todayRevenue.toLocaleString('en-IN')}`],
        ["Today's Orders Count", todayOrdersCount],
        ["Pending Orders Count", pendingOrdersCount],
        ["Processing Orders Count", processingOrdersCount],
        ["Packed Orders Count", packedOrdersCount],
        ["Shipped Orders Count", shippedOrdersCount],
        ["Delivered Orders Count", deliveredOrdersCount],
        ["Completed Orders Count", completedOrdersCount],
        ["Cancelled Orders Count", cancelledOrdersCount],
        ["Weekly Revenue", `₹${weeklyRevenue.toLocaleString('en-IN')}`],
        ["Monthly Revenue", `₹${monthlyRevenue.toLocaleString('en-IN')}`],
        ["Overall Lifetime Revenue", `₹${overallRevenue.toLocaleString('en-IN')}`],
        ["Total Orders Count", safeOrders.length],
        ["Total Active Products", totalProducts],
        ["Low Stock Products Count (<=5)", lowStockProducts.length],
        ["Total Unique Customers", totalCustomers],
      ];

      const csvContent = [headers.join(','), ...rows.map(r => `"${r[0]}","${r[1]}"`)].join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `executive_summary_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Executive summary report downloaded!");
      navigate('/admin/reports');
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate report");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary tracking-tight">Dashboard</h1>
        <button 
          onClick={handleGenerateReport}
          className="flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-gray-800 transition-colors shadow-sm cursor-pointer"
        >
          <Download size={16} />
          Generate Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatRow title="Today's Revenue" value={`₹${todayRevenue.toLocaleString('en-IN')}`} icon={IndianRupee} colorClass="bg-blue-50 text-blue-500" />
        <StatRow title="Today's Orders" value={todayOrdersCount} icon={ShoppingCart} colorClass="bg-purple-50 text-purple-500" />
        
        <StatRow title="Pending Orders" value={pendingOrdersCount} icon={Clock} colorClass="bg-yellow-50 text-yellow-600" />
        <StatRow title="Processing Orders" value={processingOrdersCount} icon={Package} colorClass="bg-orange-50 text-orange-500" />
        <StatRow title="Packed Orders" value={packedOrdersCount} icon={Box} colorClass="bg-indigo-50 text-indigo-500" />
        <StatRow title="Shipped Orders" value={shippedOrdersCount} icon={Truck} colorClass="bg-sky-50 text-sky-500" />
        <StatRow title="Delivered Orders" value={deliveredOrdersCount} icon={CheckCircle2} colorClass="bg-green-50 text-green-500" />
        <StatRow title="Cancelled Orders" value={cancelledOrdersCount} icon={XCircle} colorClass="bg-red-50 text-red-500" />
        
        <StatRow title="Low Stock Products" value={lowStockProducts.length} icon={AlertTriangle} colorClass="bg-rose-50 text-rose-600" />
        
        <StatRow title="Total Customers" value={totalCustomers} icon={Users} colorClass="bg-teal-50 text-teal-500" />
        <StatRow title="Total Products" value={totalProducts} icon={Package} colorClass="bg-pink-50 text-pink-500" />
        <StatRow title="Monthly Revenue" value={`₹${monthlyRevenue.toLocaleString('en-IN')}`} icon={Calendar} colorClass="bg-sky-50 text-sky-500" />
        <StatRow title="Weekly Revenue" value={`₹${weeklyRevenue.toLocaleString('en-IN')}`} icon={TrendingUp} colorClass="bg-emerald-50 text-emerald-500" />
        <div className="bg-white rounded-lg p-4 border border-neutral-300/50 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg premium-button flex items-center justify-center">
            <IndianRupee size={20} />
          </div>
          <div>
            <p className="text-neutral-500 text-sm font-medium">Overall Revenue</p>
            <h3 className="text-primary text-lg font-semibold">₹{overallRevenue.toLocaleString('en-IN')}</h3>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Weekly Revenue */}
        <div className="bg-white rounded-xl p-5 border border-neutral-300/50 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-primary" size={18} />
            <h2 className="text-base font-semibold text-primary">Weekly Revenue</h2>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyRevenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorBlue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Sales Growth */}
        <div className="bg-white rounded-xl p-5 border border-neutral-300/50 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="text-primary" size={18} />
            <h2 className="text-base font-semibold text-primary">Monthly Sales Growth</h2>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyGrowthData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPurple" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Area type="monotone" dataKey="sales" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorPurple)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Category Distribution */}
        <div className="bg-white rounded-xl p-5 border border-neutral-300/50 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Package className="text-primary" size={18} />
            <h2 className="text-base font-semibold text-primary">Category Distribution</h2>
          </div>
          <div className="h-64 w-full flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-neutral-300/50 shadow-sm overflow-hidden mt-6">
        <div className="p-5 border-b border-neutral-300/50 flex justify-between items-center">
          <h2 className="text-base font-semibold text-primary">Recent Orders</h2>
          <button className="text-sm font-medium text-neutral-500 hover:text-primary">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-neutral-100 text-neutral-500 font-medium">
              <tr>
                <th className="px-5 py-3">ORDER ID</th>
                <th className="px-5 py-3">CUSTOMER</th>
                <th className="px-5 py-3">STATUS</th>
                <th className="px-5 py-3">TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.length > 0 ? recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-neutral-100/50">
                  <td className="px-5 py-4 font-medium text-primary">#{order.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-5 py-4 text-neutral-500">{order.customerDetails?.name || 'Guest'}</td>
                  <td className="px-5 py-4">
                    <span className="text-neutral-500 font-medium">{order.status || 'Processing'}</span>
                  </td>
                  <td className="px-5 py-4 font-medium text-primary">₹{order.totalAmount?.toLocaleString() || 0}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-neutral-500">No recent orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Latest Customers & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-xl border border-neutral-300/50 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-neutral-300/50 flex justify-between items-center">
            <h2 className="text-base font-semibold text-primary">Latest Customers</h2>
            <button className="text-sm font-medium text-neutral-500 hover:text-primary">View All</button>
          </div>
          <div className="p-6">
            {latestCustomers.length > 0 ? (
              <div className="space-y-4">
                 {latestCustomers.map((cust, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-500">
                           <Users size={14} />
                         </div>
                         <div>
                           <p className="text-sm font-semibold text-primary">{cust.name || 'Guest'}</p>
                           <p className="text-xs text-neutral-500">{cust.phone}</p>
                         </div>
                      </div>
                    </div>
                 ))}
              </div>
            ) : (
              <div className="text-center text-neutral-500 text-sm">
                No customers found.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-300/50 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-neutral-300/50">
            <h2 className="text-base font-semibold text-primary">Low Stock Alerts</h2>
          </div>
          <div className="p-6">
            {lowStockProducts.length > 0 ? (
              <div className="space-y-4">
                {lowStockProducts.slice(0, 5).map(product => (
                  <div key={product.id} className="flex justify-between items-center border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-semibold text-primary truncate max-w-[200px]">{product.name}</p>
                      <p className="text-xs text-neutral-500">ID: {product.id.slice(0, 8)}</p>
                    </div>
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md">
                      {product.stock} left
                    </span>
                  </div>
                ))}
                {lowStockProducts.length > 5 && (
                  <p className="text-xs text-neutral-500 text-center pt-2">+{lowStockProducts.length - 5} more products running low</p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 text-green-600">
                <CheckCircle size={20} />
                <span className="text-sm font-medium">All products have good stock.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
