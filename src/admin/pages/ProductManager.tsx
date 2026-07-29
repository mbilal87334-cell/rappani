import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Plus, Filter, Edit2, Trash2, MoreVertical, Image as ImageIcon } from 'lucide-react';
import { Product } from '../../App'; // We will adjust imports later

export default function ProductManager({ products, setProducts }: { products: Product[], setProducts: any }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto pb-10">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold font-heading text-stone-900">Products</h1>
          <p className="text-sm font-medium text-stone-500 mt-1">Manage your store inventory, pricing, and details.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input 
              type="text" 
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm font-medium w-64 focus:ring-gold-500 focus:border-gold-500 outline-none shadow-sm transition-all"
            />
          </div>
          <button className="p-2.5 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 text-stone-600 transition-colors shadow-sm">
            <Filter size={20} />
          </button>
          <button className="flex items-center gap-2 bg-black text-gold-500 font-bold rounded-xl px-5 py-2.5 hover:bg-gold-500 hover:text-black transition-all shadow-md shadow-gold-500/20 active:scale-95">
            <Plus size={18} />
            Add Product
          </button>
        </div>
      </div>

      {/* Advanced Data Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50/80 text-stone-500 font-bold border-b border-stone-100">
              <tr>
                <th className="px-6 py-4 rounded-tl-2xl">
                  <input type="checkbox" className="rounded text-gold-500 focus:ring-gold-500 border-stone-300 w-4 h-4" />
                </th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 rounded-tr-2xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-stone-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <input type="checkbox" className="rounded text-gold-500 focus:ring-gold-500 border-stone-300 w-4 h-4" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={20} className="text-stone-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-stone-900 group-hover:text-gold-600 transition-colors line-clamp-1">{product.name}</p>
                        <p className="text-xs font-medium text-stone-400 mt-0.5">ID: {product.id.substring(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-stone-100 text-stone-600 font-bold text-xs rounded-lg">{product.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-stone-900">₹{product.price}</div>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <div className="text-xs text-stone-400 line-through">₹{product.originalPrice}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-bold text-stone-700">
                    {product.stock || 0}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-green-100 text-green-700 font-bold text-xs rounded-full">Active</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-black transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 hover:bg-red-50 rounded-lg text-stone-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                      <button className="p-2 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-black transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-stone-500 font-medium">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-stone-100 flex items-center justify-between text-sm font-medium text-stone-500">
          <p>Showing 1 to {filteredProducts.length} of {filteredProducts.length} entries</p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-50">Prev</button>
            <button className="px-3 py-1 border border-stone-200 rounded-lg bg-black text-gold-500">1</button>
            <button className="px-3 py-1 border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-50">Next</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
