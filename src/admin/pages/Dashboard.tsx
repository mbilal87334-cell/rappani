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

const weeklyRevenueData = [
  { name: 'Mon', revenue: 1200 },
  { name: 'Tue', revenue: 2100 },
  { name: 'Wed', revenue: 800 },
  { name: 'Thu', revenue: 2780 },
  { name: 'Fri', revenue: 1890 },
  { name: 'Sat', revenue: 2390 },
  { name: 'Sun', revenue: 3490 },
];

const monthlyGrowthData = [
  { name: 'Jan', sales: 4000 },
  { name: 'Feb', sales: 3000 },
  { name: 'Mar', sales: 2000 },
  { name: 'Apr', sales: 2780 },
  { name: 'May', sales: 1890 },
  { name: 'Jun', sales: 2390 },
  { name: 'Jul', sales: 3490 },
];

const categoryData = [
  { name: 'Stationery', value: 16, color: '#ef4444' }, // Red
  { name: 'Fancy Items', value: 24, color: '#a855f7' }, // Purple
  { name: 'Toys', value: 12, color: '#f59e0b' }, // Yellow
  { name: 'Snacks', value: 8, color: '#10b981' }, // Green
];

const StatRow = ({ title, value, icon: Icon, colorClass }: any) => (
  <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm flex items-center gap-4">
    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <h3 className="text-gray-900 text-lg font-semibold">{value}</h3>
    </div>
  </div>
);

export default function Dashboard({ orders = [] }: { orders?: any[] }) {
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <button className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-800 transition-colors">
          Generate Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatRow title="Today's Revenue" value="₹0" icon={IndianRupee} colorClass="bg-blue-50 text-blue-500" />
        <StatRow title="Today's Orders" value="0" icon={ShoppingCart} colorClass="bg-purple-50 text-purple-500" />
        <StatRow title="Pending Orders" value="0" icon={Clock} colorClass="bg-yellow-50 text-yellow-600" />
        <StatRow title="Completed Orders" value="0" icon={CheckCircle2} colorClass="bg-green-50 text-green-500" />
        <StatRow title="Cancelled Orders" value="0" icon={XCircle} colorClass="bg-red-50 text-red-500" />
        <StatRow title="Total Customers" value="0" icon={Users} colorClass="bg-indigo-50 text-indigo-500" />
        <StatRow title="Total Products" value="84" icon={Package} colorClass="bg-pink-50 text-pink-500" />
        <StatRow title="Monthly Revenue" value="₹0" icon={Calendar} colorClass="bg-sky-50 text-sky-500" />
        <StatRow title="Weekly Revenue" value="₹0" icon={TrendingUp} colorClass="bg-emerald-50 text-emerald-500" />
        <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-gray-900 text-white flex items-center justify-center">
            <IndianRupee size={20} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Overall Revenue</p>
            <h3 className="text-gray-900 text-lg font-semibold">₹0</h3>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Weekly Revenue */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-gray-800" size={18} />
            <h2 className="text-base font-semibold text-gray-900">Weekly Revenue</h2>
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
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="text-gray-800" size={18} />
            <h2 className="text-base font-semibold text-gray-900">Monthly Sales Growth</h2>
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
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Package className="text-gray-800" size={18} />
            <h2 className="text-base font-semibold text-gray-900">Category Distribution</h2>
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
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mt-6">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-base font-semibold text-gray-900">Recent Orders</h2>
          <button className="text-sm font-medium text-gray-500 hover:text-gray-900">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-5 py-3">ORDER ID</th>
                <th className="px-5 py-3">CUSTOMER</th>
                <th className="px-5 py-3">STATUS</th>
                <th className="px-5 py-3">TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.length > 0 ? recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-4 font-medium text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-5 py-4 text-gray-600">{order.customerDetails?.name || 'Guest'}</td>
                  <td className="px-5 py-4">
                    <span className="text-gray-600 font-medium">{order.status || 'Processing'}</span>
                  </td>
                  <td className="px-5 py-4 font-medium text-gray-900">₹{order.totalAmount?.toLocaleString() || 0}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-gray-500">No recent orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Latest Customers & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-base font-semibold text-gray-900">Latest Customers</h2>
            <button className="text-sm font-medium text-gray-500 hover:text-gray-900">View All</button>
          </div>
          <div className="p-8 text-center text-gray-500 text-sm">
            No customers found.
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Low Stock Alerts</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-3 text-green-600">
              <CheckCircle size={20} />
              <span className="text-sm font-medium">All products have good stock.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
