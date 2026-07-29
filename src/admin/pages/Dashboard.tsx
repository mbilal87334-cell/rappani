import React from 'react';
import { motion } from 'motion/react';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Package
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

const salesData = [
  { name: 'Mon', revenue: 4000, orders: 24 },
  { name: 'Tue', revenue: 3000, orders: 18 },
  { name: 'Wed', revenue: 5500, orders: 35 },
  { name: 'Thu', revenue: 4500, orders: 28 },
  { name: 'Fri', revenue: 6000, orders: 42 },
  { name: 'Sat', revenue: 8000, orders: 55 },
  { name: 'Sun', revenue: 7500, orders: 50 },
];

const categoryData = [
  { name: 'Stationary', sales: 400 },
  { name: 'Toys', sales: 300 },
  { name: 'Bags', sales: 200 },
  { name: 'Fancy', sales: 278 },
];

const StatCard = ({ title, value, icon: Icon, trend, isPositive, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="bg-white rounded-2xl p-6 border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(212,175,55,0.1)] transition-all duration-300 relative overflow-hidden group"
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-bl-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-110"></div>
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div>
        <p className="text-sm font-semibold text-stone-500 mb-1">{title}</p>
        <h3 className="text-3xl font-heading font-bold text-stone-900">{value}</h3>
      </div>
      <div className="w-12 h-12 rounded-xl bg-stone-50 flex items-center justify-center text-gold-600 group-hover:bg-gold-500 group-hover:text-black transition-colors duration-300 shadow-sm">
        <Icon size={24} />
      </div>
    </div>
    <div className="flex items-center gap-2 relative z-10">
      <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {isPositive ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
        {trend}%
      </div>
      <span className="text-xs font-medium text-stone-400">vs last week</span>
    </div>
  </motion.div>
);

export default function Dashboard({ orders = [] }: { orders?: any[] }) {
  const recentOrders = orders.slice(0, 5); // Show top 5 recent orders

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-2xl font-bold font-heading text-stone-900">Dashboard Overview</h1>
          <p className="text-sm font-medium text-stone-500 mt-1">Welcome back, here's what's happening with your store today.</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <select className="bg-white border border-stone-200 text-stone-700 text-sm rounded-xl focus:ring-gold-500 focus:border-gold-500 block p-2.5 font-medium shadow-sm outline-none">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>This Month</option>
            <option>This Year</option>
          </select>
          <button className="bg-black text-gold-500 font-bold rounded-xl px-5 py-2.5 hover:bg-gold-500 hover:text-black transition-all shadow-md shadow-gold-500/20 active:scale-95">
            Download Report
          </button>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value="₹1,24,500" icon={DollarSign} trend="12.5" isPositive={true} delay={0.1} />
        <StatCard title="Total Orders" value="842" icon={ShoppingCart} trend="8.2" isPositive={true} delay={0.2} />
        <StatCard title="Active Customers" value="1,204" icon={Users} trend="3.1" isPositive={false} delay={0.3} />
        <StatCard title="Products Sold" value="3,492" icon={Package} trend="15.4" isPositive={true} delay={0.4} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Main Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="lg:col-span-2 bg-white rounded-2xl p-6 border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold font-heading text-stone-900">Revenue Overview</h2>
            <button className="text-sm font-medium text-gold-600 hover:text-black transition-colors">View Details</button>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a8a29e', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a8a29e', fontSize: 12 }} tickFormatter={(value) => `₹${value/1000}k`} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                  itemStyle={{ color: '#D4AF37' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Secondary Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white rounded-2xl p-6 border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
        >
          <h2 className="text-lg font-bold font-heading text-stone-900 mb-6">Sales by Category</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f5f5f4" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#57534e', fontSize: 13, fontWeight: 500 }} width={80} />
                <Tooltip 
                  cursor={{fill: '#fafaf9'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}
                />
                <Bar dataKey="sales" fill="#1c1917" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6 space-y-4">
             {categoryData.map((cat, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-black"></div>
                    <span className="text-sm font-medium text-stone-600">{cat.name}</span>
                  </div>
                  <span className="text-sm font-bold text-stone-900">{cat.sales} items</span>
                </div>
             ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Orders Table Preview */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="mt-8 bg-white rounded-2xl border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden"
      >
        <div className="p-6 border-b border-stone-100 flex justify-between items-center">
          <h2 className="text-lg font-bold font-heading text-stone-900">Recent Transactions</h2>
          <button className="text-sm font-bold text-gold-600 hover:text-black transition-colors">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-stone-500 font-medium">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {recentOrders.length > 0 ? recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-stone-900">#{order.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-6 py-4 font-medium text-stone-700">{order.customerDetails?.name || 'Guest'}</td>
                  <td className="px-6 py-4 text-stone-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-bold text-stone-900">₹{order.totalAmount?.toLocaleString() || 0}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 font-bold text-xs rounded-full ${
                      order.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                      order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-gold-100 text-gold-700'
                    }`}>
                      {order.status || 'Processing'}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-stone-500 font-medium">No recent transactions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
