import React, { useState } from 'react';
import { Download, Trash2, Filter, PackageOpen } from 'lucide-react';
import { Order } from '../../App';
import { fetchWithAuth } from '../../api';

export default function OrderManager({ orders }: { orders: Order[] }) {
  const [statusFilter, setStatusFilter] = useState('All Status');

  const filteredOrders = orders.filter(order => 
    statusFilter === 'All Status' || 
    (order.status && order.status.toLowerCase() === statusFilter.toLowerCase())
  );

  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      alert("No orders to export!");
      return;
    }
    const headers = ["Order ID", "Customer Name", "Phone", "Date", "Total Amount", "Payment Method", "Status", "Tracking Status"];
    const csvRows = [headers.join(',')];

    filteredOrders.forEach(order => {
      const row = [
        order.id,
        `"${order.customerName || 'Guest'}"`,
        order.customerPhone || '',
        new Date(order.createdAt).toLocaleDateString(),
        order.totalAmount || 0,
        order.paymentMethod || '',
        order.status || 'Processing',
        order.trackingStatus || 'Processing'
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `orders_export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleResetDB = async () => {
    const confirmation = window.prompt("WARNING: This will permanently delete ALL orders. Type RESET to confirm.");
    if (confirmation === 'RESET') {
      try {
        const res = await fetchWithAuth('/api/orders', { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to reset');
        setOrders([]);
        window.location.reload();
      } catch (err) {
        alert("Failed to reset orders.");
      }
    } else if (confirmation !== null) {
      alert("Action cancelled. You must type RESET exactly.");
    }
  };

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
          <button onClick={handleExportCSV} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-md px-3 py-1.5 hover:bg-gray-50 transition-colors shadow-sm">
            <Download size={16} />
            Export CSV
          </button>
          <button onClick={handleResetDB} className="flex items-center gap-2 bg-red-50 text-red-600 text-sm font-medium rounded-md px-3 py-1.5 hover:bg-red-100 transition-colors">
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
          <option>Pending</option>
          <option>Confirmed</option>
          <option>Processing</option>
          <option>Packed</option>
          <option>Shipped</option>
          <option>Out For Delivery</option>
          <option>Delivered</option>
          <option>Cancelled</option>
          <option>Returned</option>
          <option>Refunded</option>
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
                  <th className="px-5 py-3">DELIVERY ADDRESS</th>
                  <th className="px-5 py-3">DATE</th>
                  <th className="px-5 py-3">TOTAL</th>
                  <th className="px-5 py-3">PAYMENT / UTR</th>
                  <th className="px-5 py-3">STATUS</th>
                  <th className="px-5 py-3">TRACKING</th>
                  <th className="px-5 py-3 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-4 font-medium text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</td>
                    <td className="px-5 py-4 text-gray-600">
                      <div>{order.customerName || 'Guest'}</div>
                      <div className="text-xs text-gray-400">{order.customerPhone}</div>
                    </td>
                    <td className="px-5 py-4 text-gray-600 max-w-[200px] whitespace-normal">
                      <div className="text-xs line-clamp-3" title={order.deliveryAddress || 'N/A'}>
                        {order.deliveryAddress ? (
                          order.deliveryAddress.split('\n').map((line: string, i: number) => {
                            if (line.includes('https://maps.google.com')) {
                              const urlMatch = line.match(/(https?:\/\/[^\s]+)/g);
                              const url = urlMatch ? urlMatch[0] : '';
                              return (
                                <div key={i} className="mt-1">
                                  <a href={url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-1 font-semibold">
                                    📍 View on Map
                                  </a>
                                </div>
                              );
                            }
                            return <div key={i}>{line}</div>;
                          })
                        ) : (
                          'N/A'
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4 font-medium text-gray-900">₹{order.totalAmount?.toLocaleString() || 0}</td>
                    <td className="px-5 py-4 text-gray-600">
                      <div>{order.paymentMethod}</div>
                      {order.utrNumber && <div className="text-xs text-gray-400 mt-1 font-mono">UTR: {order.utrNumber}</div>}
                    </td>
                    <td className="px-5 py-4">
                      <select 
                        value={order.status || 'Processing'}
                        onChange={async (e) => {
                          try {
                            const res = await fetchWithAuth(`/api/orders/${order.id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: e.target.value })
                            });
                            if (!res.ok) {
                              const text = await res.text();
                              alert(`Backend error: ${res.status} - ${text}`);
                              return;
                            }
                            window.location.reload();
                          } catch (err: any) {
                            alert('Network or JS error: ' + err.message);
                          }
                        }}
                        className={`text-xs rounded-full px-3 py-1 font-medium outline-none border-none focus:ring-1 cursor-pointer
                          ${order.status === 'Completed' || order.status === 'Delivered' ? 'bg-green-50 text-green-700' : 
                            order.status === 'Cancelled' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Packed">Packed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out For Delivery">Out For Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Returned">Returned</option>
                        <option value="Refunded">Refunded</option>
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <select 
                        value={order.trackingStatus || 'Processing'}
                        onChange={async (e) => {
                          try {
                            const res = await fetchWithAuth(`/api/orders/${order.id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ trackingStatus: e.target.value })
                            });
                            if (!res.ok) {
                              const text = await res.text();
                              alert(`Backend error: ${res.status} - ${text}`);
                              return;
                            }
                            window.location.reload();
                          } catch (err: any) {
                            alert('Network or JS error: ' + err.message);
                          }
                        }}
                        className="bg-stone-50 border border-gray-200 text-xs rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-violet-500"
                      >
                        <option value="Processing">Processing</option>
                        <option value="Packed">Packed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out For Delivery">Out For Delivery</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button 
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this order?')) {
                            fetchWithAuth(`/api/orders/${order.id}`, { method: 'DELETE' })
                              .then(() => window.location.reload());
                          }
                        }}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors inline-flex items-center justify-center"
                        title="Delete Order"
                      >
                        <Trash2 size={16} />
                      </button>
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
