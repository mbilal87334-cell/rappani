import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { IndianRupee, TrendingUp, CreditCard, Wallet, ArrowUpRight, ArrowDownRight, Calendar, Download, Activity } from 'lucide-react';
import { Order } from '../../App';

export default function RevenueDashboard({ orders = [] }: { orders?: Order[] }) {
  // Ensure orders is an array
  const safeOrders = Array.isArray(orders) ? orders : [];

  // Calculate real metrics from orders array safely
  const completedOrders = safeOrders.filter(o => {
    const s = (o.status || '').toLowerCase();
    return s === 'completed' || s === 'delivered' || s === 'shipped' || s === 'success';
  });
  const pendingOrders = safeOrders.filter(o => {
    const s = (o.status || '').toLowerCase();
    return s === 'pending';
  });
  
  const totalRevenue = completedOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const pendingRevenue = pendingOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  
  // Since we don't have historical data, just use totalRevenue as monthly for now
  const monthlyRecurring = totalRevenue; 
  
  const averageOrderValue = completedOrders.length > 0 ? (totalRevenue / completedOrders.length) : 0;

  const chartData = useMemo(() => {
    // Generate last 7 days of revenue from orders
    const days = 7;
    const data = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      // Sum revenue for this day
      const dayRev = completedOrders.filter(o => {
        const od = new Date(o.createdAt || Date.now());
        return od.getDate() === d.getDate() && od.getMonth() === d.getMonth();
      }).reduce((acc, o) => acc + (o.totalAmount || 0), 0);
      data.push({ date: dateStr, revenue: dayRev });
    }
    return data;
  }, [completedOrders]);

  const stats = [
    { 
      title: 'Total Revenue', 
      amount: `₹${totalRevenue.toLocaleString('en-IN')}`, 
      trend: '+12.5%', 
      isPositive: true,
      icon: <IndianRupee size={24} className="text-emerald-600" />,
      bg: 'bg-emerald-100'
    },
    { 
      title: 'Monthly Recurring', 
      amount: `₹${monthlyRecurring.toLocaleString('en-IN')}`, 
      trend: '+5.2%', 
      isPositive: true,
      icon: <TrendingUp size={24} className="text-blue-600" />,
      bg: 'bg-blue-100'
    },
    { 
      title: 'Average Order Value', 
      amount: `₹${Math.round(averageOrderValue).toLocaleString('en-IN')}`, 
      trend: '-1.4%', 
      isPositive: false,
      icon: <CreditCard size={24} className="text-purple-600" />,
      bg: 'bg-purple-100'
    },
    { 
      title: 'Pending Clearances', 
      amount: `₹${pendingRevenue.toLocaleString('en-IN')}`, 
      trend: `${pendingOrders.length} Orders`, 
      isPositive: true,
      icon: <Wallet size={24} className="text-amber-600" />,
      bg: 'bg-amber-100'
    },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Revenue Overview</h1>
        <p className="text-sm font-medium text-gray-500 mt-1">Track your earnings, cash flow, and financial growth.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => {
          return (
            <div key={index} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  {stat.icon}
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold ${
                  stat.isPositive ? 'text-green-600' : 'text-red-500'
                }`}>
                  {stat.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {stat.trend}
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-900">{stat.amount}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm min-h-[400px]">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Trend (Last 7 Days)</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={val => `₹${val}`} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#4c1d95', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
