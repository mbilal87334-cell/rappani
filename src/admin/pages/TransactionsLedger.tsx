import React, { useState } from 'react';
import { Search, Filter, ArrowUpRight, ArrowDownRight, CreditCard, Wallet, Smartphone } from 'lucide-react';

const TRANSACTIONS = [
  { id: 'TXN-001', date: '2026-07-29T10:30:00Z', amount: 1250, method: 'GPay', type: 'Credit', status: 'Completed', customer: 'Aarav Patel' },
  { id: 'TXN-002', date: '2026-07-29T11:15:00Z', amount: 450, method: 'Cash', type: 'Credit', status: 'Completed', customer: 'Guest' },
  { id: 'TXN-003', date: '2026-07-28T14:20:00Z', amount: 890, method: 'Card', type: 'Credit', status: 'Pending', customer: 'Diya Sharma' },
  { id: 'TXN-004', date: '2026-07-28T16:45:00Z', amount: 150, method: 'GPay', type: 'Debit', status: 'Refunded', customer: 'Rohan Kumar' },
  { id: 'TXN-005', date: '2026-07-27T09:10:00Z', amount: 3200, method: 'UPI', type: 'Credit', status: 'Completed', customer: 'Ananya Singh' },
];

export default function TransactionsLedger() {
  const [searchTerm, setSearchTerm] = useState('');

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
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-md px-3 py-2 hover:bg-gray-50 transition-colors shadow-sm">
            <Filter size={16} />
            Filters
          </button>
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
              {TRANSACTIONS.map((txn) => (
                <tr key={txn.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        txn.type === 'Credit' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {txn.type === 'Credit' ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{txn.id}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{txn.customer}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    <div>{new Date(txn.date).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{new Date(txn.date).toLocaleTimeString()}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                      {txn.method === 'Cash' && <Wallet size={16} className="text-gray-400" />}
                      {txn.method === 'Card' && <CreditCard size={16} className="text-gray-400" />}
                      {(txn.method === 'GPay' || txn.method === 'UPI') && <Smartphone size={16} className="text-gray-400" />}
                      {txn.method}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-gray-900">
                    <span className={txn.type === 'Credit' ? 'text-green-600' : 'text-red-600'}>
                      {txn.type === 'Credit' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-md inline-block ${
                      txn.status === 'Completed' ? 'bg-green-50 text-green-600' :
                      txn.status === 'Pending' ? 'bg-yellow-50 text-yellow-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {txn.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
