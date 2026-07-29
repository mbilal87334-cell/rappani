import React, { useState } from 'react';
import { Download, Trash2, Filter, PackageOpen } from 'lucide-react';
import { Order } from '../../App';

export default function OrderManager({ orders }: { orders: Order[] }) {
  const [statusFilter, setStatusFilter] = useState('All Status');

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Completed':
        return <span className="px-3 py-1 bg-green-50 text-green-600 font-medium text-xs rounded-full">Completed</span>;
      case 'Cancelled':
        return <span className="px-3 py-1 bg-red-50 text-red-600 font-medium text-xs rounded-full">Cancelled</span>;
      default:
        return <span className="px-3 py-1 bg-yellow-50 text-yellow-600 font-medium text-xs rounded-full">Processing</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-10">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Orders</h1>
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-md px-3 py-1.5 hover:bg-gray-50 transition-colors shadow-sm">
            <Download size={16} />
            Export CSV
          </button>
          <button className="flex items-center gap-2 bg-red-50 text-red-600 text-sm font-medium rounded-md px-3 py-1.5 hover:bg-red-100 transition-colors">
            <Trash2 size={16} />
            Reset Orders DB
          </button>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-2 bg-white border border-gray-200 rounded-md px-3 py-2 w-max shadow-sm">
        <Filter size={16} className="text-gray-400" />
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-transparent text-gray-700 text-sm font-medium outline-none border-none focus:ring-0"
        >
          <option>All Status</option>
          <option>Completed</option>
          <option>Processing</option>
          <option>Cancelled</option>
        </select>
      </div>

      {/* Orders List / Empty State */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center mb-4">
              <PackageOpen size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No Orders Found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3">ORDER ID</th>
                  <th className="px-5 py-3">CUSTOMER</th>
                  <th className="px-5 py-3">DATE</th>
                  <th className="px-5 py-3">TOTAL</th>
                  <th className="px-5 py-3">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-4 font-medium text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</td>
                    <td className="px-5 py-4 text-gray-600">{order.customerDetails?.name || 'Guest'}</td>
                    <td className="px-5 py-4 text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4 font-medium text-gray-900">₹{order.totalAmount?.toLocaleString() || 0}</td>
                    <td className="px-5 py-4">
                      {getStatusBadge(order.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
