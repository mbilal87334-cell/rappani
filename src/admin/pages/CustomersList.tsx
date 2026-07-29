import React, { useState } from 'react';
import { Search, Filter, MoreHorizontal, User, Mail, Phone, ShoppingBag } from 'lucide-react';

const CUSTOMERS_DATA = [
  { id: 'CUS-001', name: 'Aarav Patel', email: 'aarav.p@example.com', phone: '+91 98765 43210', orders: 12, spent: 4500, status: 'Active', lastActive: '2 hours ago' },
  { id: 'CUS-002', name: 'Diya Sharma', email: 'diya.sharma@example.com', phone: '+91 87654 32109', orders: 5, spent: 1250, status: 'Active', lastActive: '1 day ago' },
  { id: 'CUS-003', name: 'Rohan Kumar', email: 'rohan.k@example.com', phone: '+91 76543 21098', orders: 1, spent: 450, status: 'Inactive', lastActive: '2 months ago' },
  { id: 'CUS-004', name: 'Ananya Singh', email: 'ananya.s@example.com', phone: '+91 65432 10987', orders: 24, spent: 12400, status: 'Active', lastActive: '5 mins ago' },
  { id: 'CUS-005', name: 'Karthik Raja', email: 'karthik.r@example.com', phone: '+91 54321 09876', orders: 3, spent: 890, status: 'Active', lastActive: '3 days ago' },
];

export default function CustomersList() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = CUSTOMERS_DATA.filter(cus => 
    cus.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cus.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cus.phone.includes(searchTerm)
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
                        <p className="text-xs text-gray-500 mt-0.5">{customer.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Mail size={14} className="text-gray-400" />
                        <span className="text-xs font-medium">{customer.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Phone size={14} className="text-gray-400" />
                        <span className="text-xs font-medium">{customer.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="inline-flex items-center justify-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md text-gray-700 font-semibold border border-gray-200">
                      <ShoppingBag size={14} className="text-gray-400" />
                      {customer.orders}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-gray-900">
                    ₹{customer.spent.toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-center">
                    {customer.status === 'Active' ? (
                      <span className="px-2 py-1 bg-green-50 text-green-600 text-xs font-semibold rounded-md inline-block">Active</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-md inline-block">Inactive</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors">
                      <MoreHorizontal size={18} />
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
