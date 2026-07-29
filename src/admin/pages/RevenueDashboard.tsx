import React from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign, CreditCard, Activity } from 'lucide-react';

const STATS = [
  { title: "Total Revenue", value: "₹4,25,000", change: "+12.5%", trend: "up", icon: DollarSign },
  { title: "Monthly Recurring", value: "₹85,000", change: "+5.2%", trend: "up", icon: Activity },
  { title: "Average Order Value", value: "₹1,250", change: "-2.1%", trend: "down", icon: TrendingUp },
  { title: "Pending Clearances", value: "₹12,400", change: "2 pending", trend: "neutral", icon: CreditCard },
];

export default function RevenueDashboard() {
  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Revenue Overview</h1>
        <p className="text-sm font-medium text-gray-500 mt-1">Track your earnings, cash flow, and financial growth.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {STATS.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${
                  index === 0 ? 'bg-green-50 text-green-600' :
                  index === 1 ? 'bg-blue-50 text-blue-600' :
                  index === 2 ? 'bg-purple-50 text-purple-600' :
                  'bg-orange-50 text-orange-600'
                }`}>
                  <Icon size={20} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold ${
                  stat.trend === 'up' ? 'text-green-600' : 
                  stat.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                }`}>
                  {stat.trend === 'up' && <ArrowUpRight size={14} />}
                  {stat.trend === 'down' && <ArrowDownRight size={14} />}
                  {stat.change}
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
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
