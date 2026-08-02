import React, { useState } from 'react';
import { Search, Filter, ArrowUpRight, ArrowDownRight, CreditCard, Wallet, Smartphone } from 'lucide-react';
import { Order } from '../../App';

export default function TransactionsLedger({ orders = [] }: { orders?: Order[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('confirmed');

  const safeOrders = Array.isArray(orders) ? orders : [];
  
  const filteredTransactions = safeOrders.filter((order) => {
    const matchesSearch = (order.id || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'confirmed') {
      const isPaid = order.paymentStatus?.toLowerCase() === 'paid' || 
                     order.paymentStatus?.toLowerCase() === 'completed' || 
                     order.paymentStatus?.toLowerCase() === 'success';
      
      const isCodDelivered = order.paymentMethod === 'cod' && 
                             (order.status?.toLowerCase() === 'delivered' || order.status?.toLowerCase() === 'completed');
                             
      const isUpiConfirmed = order.paymentMethod === 'upi' && order.utrNumber;
      
      if (!isPaid && !isCodDelivered && !isUpiConfirmed) {
        return false;
      }
    }
    
    return matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Transactions</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Monitor all incoming payments and refunds.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search TXN ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-md text-sm font-medium w-64 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none shadow-sm transition-all"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900 shadow-sm"
          >
            <option value="confirmed">Confirmed Only</option>
            <option value="all">All Transactions</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="px-5 py-3">TRANSACTION</th>
                <th className="px-5 py-3">DATE & TIME</th>
                <th className="px-5 py-3">METHOD</th>
                <th className="px-5 py-3 text-right">AMOUNT</th>
                <th className="px-5 py-3 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.map((order) => {
                const method = order.paymentMethod === 'cod' ? 'Cash' : 'UPI';
                const status = order.status === 'completed' || order.status === 'delivered' ? 'Completed' : order.status === 'pending' ? 'Pending' : 'Refunded';
                return (
                  <tr key={order.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-green-50 text-green-600">
                          <ArrowDownRight size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{order.id.slice(0, 8)}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{order.customerName || 'Guest'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                        {method === 'Cash' && <Wallet size={16} className="text-gray-400" />}
                        {method === 'UPI' && <Smartphone size={16} className="text-gray-400" />}
                        {method}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-gray-900">
                      <span className="text-green-600">
                        +₹{(order.totalAmount || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-md inline-block ${
                        status === 'Completed' ? 'bg-green-50 text-green-600' :
                        status === 'Pending' ? 'bg-yellow-50 text-yellow-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
