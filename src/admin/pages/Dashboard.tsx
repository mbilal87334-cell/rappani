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
  CheckCircle
} from 'lucide-react';
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
  <div className="premium-card p-5 flex items-center gap-5">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorClass}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-neutral-500 text-sm font-bold uppercase tracking-wide mb-1">{title}</p>
      <h3 className="text-primary text-2xl font-black tracking-tight">{value}</h3>
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
    let tRev = 0, tOrd = 0, pOrd = 0, cOrd = 0, cxOrd = 0, mRev = 0, wRev = 0, oRev = 0;
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
      else if (status === 'cancelled' || status === 'failed') cxOrd++;
      else if (status === 'completed' || status === 'delivered' || status === 'shipped' || status === 'success') {
        cOrd++;
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
    
    const colors = ['#1A1A1A', '#D4AF37', '#6B7280', '#9CA3AF', '#374151'];
    const catData = Object.keys(catCounts).map((cat, i) => ({
       name: cat,
       value: catCounts[cat],
       color: colors[i % colors.length]
    }));

    return {
      todayRevenue: tRev,
      todayOrdersCount: tOrd,
      pendingOrdersCount: pOrd,
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

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-primary tracking-tight">Dashboard Overview</h1>
        <button className="premium-button">
          Generate Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <StatRow title="Today's Revenue" value={`₹${todayRevenue.toLocaleString('en-IN')}`} icon={IndianRupee} colorClass="bg-primary/5 text-primary" />
        <StatRow title="Today's Orders" value={todayOrdersCount} icon={ShoppingCart} colorClass="bg-gold-500/10 text-gold-600" />
        <StatRow title="Pending Orders" value={pendingOrdersCount} icon={Clock} colorClass="bg-amber-500/10 text-amber-600" />
        <StatRow title="Completed Orders" value={completedOrdersCount} icon={CheckCircle2} colorClass="bg-emerald-500/10 text-emerald-600" />
        <StatRow title="Cancelled Orders" value={cancelledOrdersCount} icon={XCircle} colorClass="bg-crimson-500/10 text-crimson-600" />
        <StatRow title="Total Customers" value={totalCustomers} icon={Users} colorClass="bg-primary/5 text-primary" />
        <StatRow title="Total Products" value={totalProducts} icon={Package} colorClass="bg-gold-500/10 text-gold-600" />
        <StatRow title="Monthly Revenue" value={`₹${monthlyRevenue.toLocaleString('en-IN')}`} icon={Calendar} colorClass="bg-primary/5 text-primary" />
        <StatRow title="Weekly Revenue" value={`₹${weeklyRevenue.toLocaleString('en-IN')}`} icon={TrendingUp} colorClass="bg-emerald-500/10 text-emerald-600" />
        <div className="premium-card p-5 flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-primary text-gold-500 flex items-center justify-center shadow-lg">
            <IndianRupee size={24} />
          </div>
          <div>
            <p className="text-neutral-500 text-sm font-bold uppercase tracking-wide mb-1">Overall Revenue</p>
            <h3 className="text-primary text-2xl font-black tracking-tight">₹{overallRevenue.toLocaleString('en-IN')}</h3>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Weekly Revenue */}
        <div className="premium-card p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
              <TrendingUp size={20} />
            </div>
            <h2 className="text-lg font-black text-primary tracking-tight">Weekly Revenue</h2>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyRevenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1A1A1A" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#1A1A1A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 600 }} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)' }} />
                <Area type="monotone" dataKey="revenue" stroke="#1A1A1A" strokeWidth={3} fillOpacity={1} fill="url(#colorPrimary)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Sales Growth */}
        <div className="premium-card p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gold-500/10 rounded-xl flex items-center justify-center text-gold-600">
              <Calendar size={20} />
            </div>
            <h2 className="text-lg font-black text-primary tracking-tight">Monthly Sales Growth</h2>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyGrowthData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 600 }} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)' }} />
                <Area type="monotone" dataKey="sales" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorGold)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Category Distribution */}
        <div className="premium-card p-6 lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
              <Package size={20} />
            </div>
            <h2 className="text-lg font-black text-primary tracking-tight">Category Distribution</h2>
          </div>
          <div className="h-80 w-full flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="premium-card overflow-hidden mt-6">
        <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
          <h2 className="text-lg font-black text-primary tracking-tight">Recent Orders</h2>
          <button className="text-sm font-bold text-neutral-500 hover:text-primary transition-colors">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-neutral-100/80 text-neutral-500 font-bold tracking-wide uppercase text-xs">
              <tr>
                <th className="px-6 py-4">ORDER ID</th>
                <th className="px-6 py-4">CUSTOMER</th>
                <th className="px-6 py-4">STATUS</th>
                <th className="px-6 py-4">TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {recentOrders.length > 0 ? recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-6 py-5 font-bold text-primary">#{order.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-6 py-5 text-neutral-600 font-medium">{order.customerDetails?.name || 'Guest'}</td>
                  <td className="px-6 py-5">
                    <span className="text-neutral-600 font-bold bg-neutral-100 px-3 py-1 rounded-full text-xs uppercase tracking-wider">{order.status || 'Processing'}</span>
                  </td>
                  <td className="px-6 py-5 font-black text-primary text-base">₹{order.totalAmount?.toLocaleString() || 0}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-neutral-500 font-medium">No recent orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Latest Customers & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="premium-card overflow-hidden">
          <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
            <h2 className="text-lg font-black text-primary tracking-tight">Latest Customers</h2>
            <button className="text-sm font-bold text-neutral-500 hover:text-primary transition-colors">View All</button>
          </div>
          <div className="p-2">
            {latestCustomers.length > 0 ? (
              <div className="space-y-1">
                 {latestCustomers.map((cust, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 hover:bg-neutral-50 rounded-2xl transition-colors">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary font-bold">
                           {cust.name ? cust.name.charAt(0) : <Users size={16} />}
                         </div>
                         <div>
                           <p className="text-sm font-bold text-primary">{cust.name || 'Guest'}</p>
                           <p className="text-xs text-neutral-500 font-medium">{cust.phone}</p>
                         </div>
                      </div>
                    </div>
                 ))}
              </div>
            ) : (
              <div className="text-center text-neutral-500 text-sm p-6 font-medium">
                No customers found.
              </div>
            )}
          </div>
        </div>

        <div className="premium-card overflow-hidden">
          <div className="p-6 border-b border-neutral-100 bg-neutral-50/50">
            <h2 className="text-lg font-black text-primary tracking-tight">Low Stock Alerts</h2>
          </div>
          <div className="p-2">
            {lowStockProducts.length > 0 ? (
              <div className="space-y-1">
                {lowStockProducts.slice(0, 5).map(product => (
                  <div key={product.id} className="flex justify-between items-center p-4 hover:bg-neutral-50 rounded-2xl transition-colors">
                    <div>
                      <p className="text-sm font-bold text-primary truncate max-w-[200px]">{product.name}</p>
                      <p className="text-xs text-neutral-500 font-medium">ID: {product.id.slice(0, 8)}</p>
                    </div>
                    <span className="text-xs font-bold text-crimson-600 bg-crimson-50 px-3 py-1.5 rounded-lg shadow-sm">
                      {product.stock} left
                    </span>
                  </div>
                ))}
                {lowStockProducts.length > 5 && (
                  <p className="text-xs font-bold text-neutral-500 text-center py-4 bg-neutral-50/50 rounded-xl mt-2 mx-2">+{lowStockProducts.length - 5} more products running low</p>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3 text-emerald-600 p-8">
                <CheckCircle size={24} />
                <span className="text-sm font-bold tracking-wide">All products have good stock.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
