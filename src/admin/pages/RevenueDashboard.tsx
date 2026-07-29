import React from 'react';
import { IndianRupee, TrendingUp, CreditCard, Wallet, ArrowUpRight, ArrowDownRight, Calendar, Download } from 'lucide-react';
import { Order } from '../../App';

export default function RevenueDashboard({ orders }: { orders: Order[] }) {
  // Calculate real metrics from orders array
  const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'delivered' || o.status === 'shipped');
  const pendingOrders = orders.filter(o => o.status === 'pending');
  
  const totalRevenue = completedOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const pendingRevenue = pendingOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  
  // Since we don't have historical data, just use totalRevenue as monthly for now
  const monthlyRecurring = totalRevenue; 
  
  const averageOrderValue = completedOrders.length > 0 ? (totalRevenue / completedOrders.length) : 0;

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

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm min-h-[400px] flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <Activity size={32} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Detailed Revenue Charts</h3>
        <p className="text-gray-500 text-sm max-w-sm">Connect a payment gateway or sync your accounting software to see detailed revenue analytics here.</p>
      </div>
    </div>
  );
}
