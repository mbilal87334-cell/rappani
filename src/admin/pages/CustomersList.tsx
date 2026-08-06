import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreHorizontal, User, Mail, Phone, ShoppingBag, ShieldAlert, ShieldCheck, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchWithAuth } from '../../api';

export default function CustomersList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetchWithAuth('/api/customers');
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const toggleCustomerStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Blocked' : 'Active';
    if (!window.confirm(`Are you sure you want to ${newStatus === 'Blocked' ? 'block' : 'unblock'} this customer?`)) return;
    
    try {
      const res = await fetchWithAuth(`/api/customers/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        toast.success(`Customer ${newStatus === 'Blocked' ? 'blocked' : 'unblocked'} successfully`);
        fetchCustomers();
      } else {
        toast.error("Failed to update status");
      }
    } catch (err) {
      toast.error("Error updating status");
    }
  };

  const filteredCustomers = customers.filter(cus => 
    (cus.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cus.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cus.phone || '').includes(searchTerm)
  );

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Customers</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Manage and view your customer details and purchase history.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search customers..."
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
                <th className="px-5 py-3">CUSTOMER</th>
                <th className="px-5 py-3">CONTACT</th>
                <th className="px-5 py-3 text-center">ORDERS</th>
                <th className="px-5 py-3 text-right">TOTAL SPENT</th>
                <th className="px-5 py-3 text-center">STATUS</th>
                <th className="px-5 py-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0">
                        <User size={18} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{customer.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{customer._id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1.5">
                      {customer.email && (
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Mail size={14} className="text-gray-400" />
                          <a 
                            href={`mailto:${customer.email}`} 
                            title="Email Customer"
                            className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {customer.email}
                          </a>
                        </div>
                      )}
                      {customer.phone && (
                        <>
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Phone size={14} className="text-gray-400" />
                            <a 
                              href={`tel:${customer.phone}`} 
                              title="Call Customer"
                              className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {customer.phone}
                            </a>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <MessageCircle size={14} className="text-gray-400" />
                            <a 
                              href={`https://wa.me/91${customer.phone}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              title="Chat on WhatsApp"
                              className="text-xs font-medium text-green-600 hover:text-green-800 hover:underline"
                            >
                              WhatsApp Chat
                            </a>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="inline-flex items-center justify-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md text-gray-700 font-semibold border border-gray-200">
                      <ShoppingBag size={14} className="text-gray-400" />
                      {customer.totalOrders || 0}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-gray-900">
                    ₹{(customer.totalSpent || 0).toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-center">
                    {customer.status === 'Active' || !customer.status ? (
                      <span className="px-2 py-1 bg-green-50 text-green-600 text-xs font-semibold rounded-md inline-block">Active</span>
                    ) : (
                      <span className="px-2 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-md inline-block">Blocked</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button 
                      onClick={() => toggleCustomerStatus(customer._id, customer.status || 'Active')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-1.5 ml-auto transition-colors ${
                        (customer.status === 'Active' || !customer.status) 
                        ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' 
                        : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
                      }`}
                    >
                      {(customer.status === 'Active' || !customer.status) ? (
                        <><ShieldAlert size={14} /> Block User</>
                      ) : (
                        <><ShieldCheck size={14} /> Unblock</>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-500">
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
