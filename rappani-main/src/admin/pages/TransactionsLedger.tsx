import React, { useState } from 'react';
import { Search, CreditCard, Wallet, Smartphone, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { Order } from '../../App';

export default function TransactionsLedger({ orders = [] }: { orders?: Order[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const safeOrders = Array.isArray(orders) ? orders : [];

  // Determine payment status type per order
  const getPaymentType = (order: Order): 'confirmed' | 'rejected' | 'pending' => {
    const payStatus = (order.paymentStatus || '').toLowerCase();
    const orderStatus = (order.status || '').toLowerCase();
    
    const isConfirmed =
      payStatus === 'paid' ||
      payStatus === 'completed' ||
      payStatus === 'success' ||
      !!order.razorpayPaymentId ||
      orderStatus === 'completed' ||
      orderStatus === 'delivered' ||
      (order.paymentMethod?.toLowerCase() === 'upi' && !!order.utrNumber);

    const isRejected =
      payStatus === 'failed' ||
      payStatus === 'rejected' ||
      orderStatus === 'cancelled' ||
      orderStatus === 'refunded';

    if (isConfirmed) return 'confirmed';
    if (isRejected) return 'rejected';
    return 'pending';
  };

  const filteredTransactions = safeOrders.filter((order) => {
    const matchesSearch =
      (order.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerPhone || '').includes(searchTerm);

    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && getPaymentType(order) === filterStatus;
  });

  // Summary stats
  const confirmed = safeOrders.filter(o => getPaymentType(o) === 'confirmed');
  const pending = safeOrders.filter(o => getPaymentType(o) === 'pending');
  const rejected = safeOrders.filter(o => getPaymentType(o) === 'rejected');
  const totalConfirmed = confirmed.reduce((s, o) => s + (o.totalAmount || 0), 0);

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Transactions</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Monitor all incoming payments and refunds.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search ID, Name, Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-md text-sm font-medium w-56 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none shadow-sm transition-all"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900 shadow-sm"
          >
            <option value="all">All Transactions</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <p className="text-xs font-semibold text-green-600 mb-1">✅ Confirmed</p>
          <p className="text-xl font-bold text-green-700">+₹{totalConfirmed.toLocaleString('en-IN')}</p>
          <p className="text-xs text-green-500 mt-0.5">{confirmed.length} transactions</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
          <p className="text-xs font-semibold text-yellow-600 mb-1">⏳ Pending</p>
          <p className="text-xl font-bold text-yellow-700">₹{pending.reduce((s, o) => s + (o.totalAmount || 0), 0).toLocaleString('en-IN')}</p>
          <p className="text-xs text-yellow-500 mt-0.5">{pending.length} transactions</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <p className="text-xs font-semibold text-red-600 mb-1">❌ Rejected</p>
          <p className="text-xl font-bold text-red-700">-₹{rejected.reduce((s, o) => s + (o.totalAmount || 0), 0).toLocaleString('en-IN')}</p>
          <p className="text-xs text-red-500 mt-0.5">{rejected.length} transactions</p>
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
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-gray-400">No transactions found.</td>
                </tr>
              ) : filteredTransactions.map((order) => {
                const payType = getPaymentType(order);
                const method = order.paymentMethod;

                // Amount display based on status
                let amountDisplay;
                if (payType === 'confirmed') {
                  amountDisplay = (
                    <span className="font-bold text-green-600">
                      +₹{(order.totalAmount || 0).toLocaleString('en-IN')}
                    </span>
                  );
                } else if (payType === 'rejected') {
                  amountDisplay = (
                    <span className="font-bold text-red-500">
                      -₹{(order.totalAmount || 0).toLocaleString('en-IN')}
                    </span>
                  );
                } else {
                  amountDisplay = (
                    <span className="font-bold text-yellow-600">
                      ₹{(order.totalAmount || 0).toLocaleString('en-IN')}
                    </span>
                  );
                }

                // Status badge
                let statusBadge;
                if (payType === 'confirmed') {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100">
                      <ArrowUpRight size={12} /> Confirmed
                    </span>
                  );
                } else if (payType === 'rejected') {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full border border-red-100">
                      <ArrowDownRight size={12} /> Rejected
                    </span>
                  );
                } else {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-50 text-yellow-700 text-xs font-bold rounded-full border border-yellow-100">
                      <Clock size={12} /> Pending
                    </span>
                  );
                }

                // Row icon
                const rowIconBg = payType === 'confirmed' ? 'bg-green-50 text-green-600' : payType === 'rejected' ? 'bg-red-50 text-red-500' : 'bg-yellow-50 text-yellow-600';

                return (
                  <tr key={order.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${rowIconBg}`}>
                          {payType === 'confirmed' ? <ArrowUpRight size={18} /> : payType === 'rejected' ? <ArrowDownRight size={18} /> : <Clock size={18} />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">#{(order.id || '').slice(0, 8).toUpperCase()}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{order.customerName || 'Guest'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      <div>{new Date(order.createdAt).toLocaleDateString('en-IN')}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-gray-700 font-medium capitalize">
                        {method?.toLowerCase() === 'razorpay' && <CreditCard size={16} className="text-blue-400" />}
                        {method?.toLowerCase() === 'upi' && <Smartphone size={16} className="text-green-400" />}
                        {method?.toLowerCase() === 'cod' && <Wallet size={16} className="text-amber-400" />}
                        {method || 'N/A'}
                      </div>
                      {order.utrNumber && <div className="text-xs text-gray-400 mt-0.5 font-mono">UTR: {order.utrNumber}</div>}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {amountDisplay}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {statusBadge}
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
