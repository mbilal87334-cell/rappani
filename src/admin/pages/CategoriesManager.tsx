import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';

const CATEGORIES_DATA = [
  { id: '1', name: 'Stationery', icon: '📝', count: 124 },
  { id: '2', name: 'Fancy Items', icon: '🎀', count: 85 },
  { id: '3', name: 'Toys', icon: '🧸', count: 42 },
  { id: '4', name: 'Sports Items', icon: '⚽', count: 18 },
  { id: '5', name: 'Ice Cream', icon: '🍦', count: 12 },
  { id: '6', name: 'Snacks & Chocolates', icon: '🍫', count: 67 },
  { id: '7', name: 'Cool Drinks & Beverages', icon: '🥤', count: 24 },
  { id: '8', name: 'Biscuits', icon: '🍪', count: 35 },
  { id: '9', name: 'Candies & Toffees', icon: '🍬', count: 89 },
  { id: '10', name: 'Art & Craft', icon: '🎨', count: 56 },
  { id: '11', name: 'School Essentials', icon: '🎒', count: 112 },
  { id: '12', name: 'Gifts & Return Gifts', icon: '🎁', count: 45 },
  { id: '13', name: 'Water Bottles & Lunch Boxes', icon: '💧', count: 38 },
  { id: '14', name: 'Bags & Pouches', icon: '👜', count: 54 },
  { id: '15', name: 'Office Supplies', icon: '🗂️', count: 92 },
  { id: '16', name: 'Educational Toys', icon: '🧩', count: 21 },
  { id: '17', name: 'Indoor & Outdoor Games', icon: '🪀', count: 29 },
  { id: '18', name: 'Juices', icon: '🧃', count: 16 },
  { id: '19', name: 'Daily Essentials', icon: '🧼', count: 145 },
  { id: '20', name: 'New Arrivals', icon: '⭐', count: 15 },
  { id: '21', name: 'Best Sellers', icon: '🔥', count: 20 },
  { id: '22', name: 'Offers & Discounts', icon: '💥', count: 8 }
];

export default function CategoriesManager() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = CATEGORIES_DATA.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Categories</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Organize your products into meaningful categories.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-md text-sm font-medium w-64 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none shadow-sm transition-all"
            />
          </div>
          <button className="flex items-center gap-2 bg-gray-900 text-white text-sm font-medium rounded-md px-4 py-2 hover:bg-gray-800 transition-colors shadow-sm">
            <Plus size={16} />
            Add Category
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 w-16 text-center">ICON</th>
                <th className="px-5 py-3">CATEGORY NAME</th>
                <th className="px-5 py-3 text-center">PRODUCTS COUNT</th>
                <th className="px-5 py-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCategories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-4 text-center">
                    <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-xl mx-auto shadow-sm">
                      {cat.icon}
                    </div>
                  </td>
                  <td className="px-5 py-4 font-semibold text-gray-900">
                    {cat.name}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                      {cat.count} Items
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-blue-500 hover:text-blue-600 transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-1.5 text-red-500 hover:text-red-600 transition-colors bg-red-50 rounded-md">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCategories.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-gray-500">
                    No categories found.
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
