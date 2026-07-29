import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Eye, Download, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Order } from '../../App';

export default function OrderManager({ orders }: { orders: Order[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Completed':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 font-bold text-xs rounded-full border border-green-200"><CheckCircle2 size={14}/> Delivered</span>;
      case 'Cancelled':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 font-bold text-xs rounded-full border border-red-200"><XCircle size={14}/> Cancelled</span>;
      default:
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-gold-100 text-gold-700 font-bold text-xs rounded-full border border-gold-200"><Clock size={14}/> Processing</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-10">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold font-heading text-stone-900">Orders</h1>
          <p className="text-sm font-medium text-stone-500 mt-1">Track and manage customer orders and shipments.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input 
              type="text" 
              placeholder="Search by Order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm font-medium w-64 focus:ring-gold-500 focus:border-gold-500 outline-none shadow-sm transition-all"
            />
          </div>
          <button className="flex items-center gap-2 bg-white border border-stone-200 font-bold rounded-xl px-4 py-2.5 text-stone-700 hover:bg-stone-50 transition-all shadow-sm">
            <Filter size={18} />
            Filters
          </button>
          <button className="flex items-center gap-2 bg-black text-gold-500 font-bold rounded-xl px-4 py-2.5 hover:bg-gold-500 hover:text-black transition-all shadow-md shadow-gold-500/20 active:scale-95">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50/80 text-stone-500 font-bold border-b border-stone-100">
              <tr>
                <th className="px-6 py-4">Order Details</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-stone-500 font-medium">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-stone-900 group-hover:text-gold-600 transition-colors">#{order.id.slice(-8).toUpperCase()}</p>
                      <p className="text-xs font-medium text-stone-400 mt-0.5">{order.items.length} items</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-stone-900">{order.customerDetails.name}</p>
                      <p className="text-xs text-stone-500 mt-0.5">{order.customerDetails.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-stone-700">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-stone-400">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-stone-900">
                      ₹{order.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 bg-stone-100 hover:bg-gold-500 hover:text-black rounded-lg text-stone-600 transition-all">
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
