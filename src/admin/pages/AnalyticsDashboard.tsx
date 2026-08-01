import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Loader } from 'lucide-react';
import { fetchWithAuth } from '../../App';

export default function AnalyticsDashboard() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetchWithAuth('/api/analytics/summary');
      const data = await res.json();
      setData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader className="w-10 h-10 text-gold-500 animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-primary">Store Analytics</h2>
        <p className="text-neutral-500 text-sm mt-1">Key performance metrics and sales data</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 relative overflow-hidden group hover:border-gold-500/30 transition-colors"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-neutral-500 text-sm font-medium mb-1">Total Revenue</p>
              <h3 className="text-3xl font-bold font-heading text-primary">₹{data.totalRevenue?.toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center text-sm font-medium text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>Lifetime Sales</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 relative overflow-hidden group hover:border-gold-500/30 transition-colors"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-neutral-500 text-sm font-medium mb-1">Total Orders</p>
              <h3 className="text-3xl font-bold font-heading text-primary">{data.totalOrders}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center text-sm font-medium text-blue-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>All time orders</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 relative overflow-hidden group hover:border-gold-500/30 transition-colors"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-neutral-500 text-sm font-medium mb-1">Today's Revenue</p>
              <h3 className="text-3xl font-bold font-heading text-primary">₹{data.todayRevenue?.toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 bg-gold-50 rounded-xl flex items-center justify-center text-gold-600 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
          </div>
          <div className="text-sm font-medium text-neutral-500">
            Current day earnings
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 relative overflow-hidden group hover:border-gold-500/30 transition-colors"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-neutral-500 text-sm font-medium mb-1">Today's Orders</p>
              <h3 className="text-3xl font-bold font-heading text-primary">{data.todayOrders}</h3>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
          <div className="text-sm font-medium text-neutral-500">
            Orders placed today
          </div>
        </motion.div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100 mt-8 text-center min-h-[300px] flex flex-col justify-center">
        <BarChart3 className="w-16 h-16 text-neutral-200 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-neutral-700 mb-2">Advanced Charts Coming Soon</h3>
        <p className="text-neutral-500 max-w-md mx-auto">We are working on integrating advanced visualization tools to help you better understand your sales trends and customer behavior.</p>
      </div>
    </div>
  );
}
