import React, { useState } from 'react';
import { Search, Plus, Eye, Edit2, Trash2, Copy, Image as ImageIcon } from 'lucide-react';
import { Product } from '../../App';

export default function ProductManager({ products, setProducts }: { products: Product[], setProducts: any }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  
  const tabs = [
    'All',
    'Stationery',
    'Fancy Items',
    'Toys',
    'Sports Items',
    'Ice Cream',
    'Snacks & Chocolates',
    'Cool Drinks & Beverages',
    'Biscuits',
    'Candies & Toffees',
    'Art & Craft',
    'School Essentials',
    'Gifts & Return Gifts',
    'Water Bottles & Lunch Boxes',
    'Bags & Pouches',
    'Office Supplies',
    'Educational Toys',
    'Indoor & Outdoor Games',
    'Juices',
    'Daily Essentials',
    'New Arrivals',
    'Best Sellers',
    'Offers & Discounts'
  ];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'All' || p.category === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="max-w-7xl mx-auto pb-10">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Products</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
        {tabs.map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab 
                ? 'bg-gray-900 text-white' 
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Advanced Data Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm align-middle">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 text-center w-24">HERO<br/>SLIDER</th>
                <th className="px-5 py-3">PRODUCT</th>
                <th className="px-5 py-3">CATEGORY</th>
                <th className="px-5 py-3">PRICE</th>
                <th className="px-5 py-3 text-center">STOCK</th>
                <th className="px-5 py-3">VISIBILITY</th>
                <th className="px-5 py-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product, idx) => (
                <tr key={product.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-4 text-center">
                    <input type="checkbox" defaultChecked={idx % 4 === 0} className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900" />
                  </td>
                  <td className="px-5 py-4 min-w-[250px]">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={20} className="text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 line-clamp-2 leading-tight">{product.name}</p>
                        <p className="text-xs text-gray-500 mt-1">SKU: N/A</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    <div className="max-w-[120px]">
                      {product.category}
                    </div>
                  </td>
                  <td className="px-5 py-4 font-semibold text-gray-900">
                    ₹{product.price}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-center">
                      <div className="bg-green-50 text-green-600 rounded-md px-2 py-1 text-xs font-semibold text-center min-w-[60px]">
                        {product.stock || 50} in<br/>stock
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-gray-700 font-medium text-sm">
                      <Eye size={16} className="text-gray-400" />
                      Visible
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors">
                        <Copy size={16} />
                      </button>
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
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-500">
                    No products found.
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
