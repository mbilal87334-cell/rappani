import React, { useState } from 'react';
import { Download, Trash2, Filter, PackageOpen, X, MapPin, Search } from 'lucide-react';
import { Order } from '../../App';
import { fetchWithAuth } from '../../api';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in react-leaflet
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

export default function OrderManager({ orders }: { orders: Order[] }) {
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMap, setViewMap] = useState<{lat: number, lng: number} | null>(null);

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'All Status' ||
      (order.status && order.status.toLowerCase() === statusFilter.toLowerCase());
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch = !q || 
      (order.id || '').toLowerCase().includes(q) ||
      (order.customerName || '').toLowerCase().includes(q) ||
      (order.customerPhone || '').includes(q);
    return matchesStatus && matchesSearch;
  });

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
        window.location.reload();
      } catch (err) {
        alert("Failed to reset orders.");
      }
    } else if (confirmation !== null) {
      alert("Action cancelled. You must type RESET exactly.");
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'delivered' || s === 'completed') return <span className="px-3 py-1 bg-green-50 text-green-700 font-semibold text-xs rounded-full">✅ {status}</span>;
    if (s === 'shipped' || s === 'out for delivery') return <span className="px-3 py-1 bg-blue-50 text-blue-700 font-semibold text-xs rounded-full">🚚 {status}</span>;
    if (s === 'packed') return <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-semibold text-xs rounded-full">📦 {status}</span>;
    if (s === 'confirmed') return <span className="px-3 py-1 bg-teal-50 text-teal-700 font-semibold text-xs rounded-full">✔ {status}</span>;
    if (s === 'cancelled') return <span className="px-3 py-1 bg-red-50 text-red-700 font-semibold text-xs rounded-full">❌ {status}</span>;
    if (s === 'returned' || s === 'refunded') return <span className="px-3 py-1 bg-orange-50 text-orange-700 font-semibold text-xs rounded-full">↩ {status}</span>;
    return <span className="px-3 py-1 bg-yellow-50 text-yellow-700 font-semibold text-xs rounded-full">⏳ {status || 'Processing'}</span>;
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

      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search Order ID, Customer, Phone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-md text-sm font-medium w-72 focus:ring-2 focus:ring-gray-900 outline-none shadow-sm transition-all"
          />
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-md px-3 py-2 w-max shadow-sm">
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
        <span className="text-sm text-gray-400 self-center">{filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}</span>
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
                  <th className="px-5 py-3">METHOD</th>
                  <th className="px-5 py-3">DELIVERY ADDRESS</th>
                  <th className="px-5 py-3">LOCATION</th>
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
                    <td className="px-5 py-4">
                      {order.deliveryMethod === 'pickup' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                          🏪 Store Pickup
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                          🚚 Home Delivery
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-600 max-w-[200px] whitespace-normal">
                      <div className="text-xs" title={typeof order.shippingAddress === 'string' ? order.shippingAddress : order.shippingAddress?.addressText || 'N/A'}>
                        {order.shippingAddress ? (
                          (() => {
                            const isString = typeof order.shippingAddress === 'string';
                            const addressString = isString ? order.shippingAddress : (
                              order.shippingAddress.addressText 
                                ? order.shippingAddress.addressText 
                                : `${order.shippingAddress.fullName || ''}\n${order.shippingAddress.houseNo || ''}, ${order.shippingAddress.street || ''}\n${order.shippingAddress.city || ''}, ${order.shippingAddress.state || ''} - ${order.shippingAddress.pincode || ''}`.trim()
                            );
                            const displayLines = addressString.split('\n').filter((line: string) => !line.includes('https://maps.google.com'));

                            return (
                              <div>
                                {displayLines.map((line: string, i: number) => <div key={i}>{line}</div>)}
                              </div>
                            );
                          })()
                        ) : (
                          'N/A'
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {order.shippingAddress ? (
                        (() => {
                            const isString = typeof order.shippingAddress === 'string';
                            const addressString = isString ? order.shippingAddress : (
                              order.shippingAddress.addressText 
                                ? order.shippingAddress.addressText 
                                : `${order.shippingAddress.fullName || ''}\n${order.shippingAddress.houseNo || ''}, ${order.shippingAddress.street || ''}\n${order.shippingAddress.city || ''}, ${order.shippingAddress.state || ''} - ${order.shippingAddress.pincode || ''}`.trim()
                            );
                            
                            let exactLat: number | null = null;
                            let exactLng: number | null = null;
                            let externalMapLink = '';

                            if (isString) {
                              const coordsMatch = addressString.match(/https:\/\/maps\.google\.com\/\?q=([\d.-]+),([\d.-]+)/);
                              if (coordsMatch) {
                                  exactLat = parseFloat(coordsMatch[1]);
                                  exactLng = parseFloat(coordsMatch[2]);
                              }
                            } else {
                              if (order.shippingAddress.lat && order.shippingAddress.lng) {
                                  exactLat = order.shippingAddress.lat;
                                  exactLng = order.shippingAddress.lng;
                              } else if (order.shippingAddress.mapsLink) {
                                  const coordsMatch = order.shippingAddress.mapsLink.match(/q=([\d.-]+),([\d.-]+)/);
                                  if (coordsMatch) {
                                    exactLat = parseFloat(coordsMatch[1]);
                                    exactLng = parseFloat(coordsMatch[2]);
                                  } else {
                                    externalMapLink = order.shippingAddress.mapsLink;
                                  }
                              }
                            }
                            
                            const displayLines = addressString.split('\n').filter((line: string) => !line.includes('https://maps.google.com'));

                            return (
                              <button 
                                onClick={() => {
                                  let mapUrl = '';
                                  if (exactLat !== null && exactLng !== null) {
                                    mapUrl = `https://maps.google.com/?q=${exactLat},${exactLng}`;
                                  } else if (externalMapLink) {
                                    mapUrl = externalMapLink;
                                  } else {
                                    const searchQuery = displayLines.join(', ').replace(/\s+/g, ' ').trim();
                                    mapUrl = `https://maps.google.com/?q=${encodeURIComponent(searchQuery)}`;
                                  }
                                  window.open(mapUrl, '_blank');
                                }}
                                className="text-blue-500 hover:underline flex items-center gap-1 font-semibold cursor-pointer text-left whitespace-nowrap"
                              >
                                🗺️ View on Map
                              </button>
                            );
                        })()
                      ) : <span className="text-xs text-neutral-400">No location</span>}
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
      {viewMap && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-bold text-lg flex items-center gap-2"><MapPin className="w-5 h-5 text-gold-500"/> Order Location</h3>
              <button onClick={() => setViewMap(null)} className="p-2 hover:bg-neutral-100 rounded-full transition"><X className="w-5 h-5"/></button>
            </div>
            <div className="h-[500px] w-full bg-neutral-100 relative">
              <MapContainer center={[viewMap.lat, viewMap.lng]} zoom={15} style={{ height: '100%', width: '100%', zIndex: 10 }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[viewMap.lat, viewMap.lng]} icon={customIcon} />
              </MapContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
