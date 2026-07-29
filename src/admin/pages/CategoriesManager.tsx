import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, X } from 'lucide-react';
import { Product, saveCategoryApi, deleteCategoryApi } from '../../App';
import toast from 'react-hot-toast';

export default function CategoriesManager({ apiCategories = [], setApiCategories, products = [] }: { apiCategories?: any[], setApiCategories?: any, products?: Product[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({ id: '', name: '', icon: '' });
  const [isSaving, setIsSaving] = useState(false);

  const safeProducts = Array.isArray(products) ? products : [];
  
  const categoriesWithCounts = apiCategories.map(cat => ({
    ...cat,
    count: safeProducts.filter(p => p.category === cat.name).length
  }));

  const filteredCategories = categoriesWithCounts.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (category?: any) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ id: category.id, name: category.name, icon: category.icon });
    } else {
      setEditingCategory(null);
      setFormData({ id: `cat_${Date.now()}`, name: '', icon: '📁' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Category name is required");
    
    setIsSaving(true);
    try {
      await saveCategoryApi(formData, !!editingCategory);
      if (setApiCategories) {
        setApiCategories((prev: any[]) => {
          if (editingCategory) {
            return prev.map(c => c.id === formData.id ? formData : c);
          }
          return [...prev, formData];
        });
      }
      toast.success(`Category ${editingCategory ? 'updated' : 'added'} successfully`);
      closeModal();
    } catch (err) {
      toast.error("Failed to save category");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (category: any) => {
    if (category.count > 0) {
      return toast.error(`Cannot delete category with ${category.count} products. Move or delete them first.`);
    }
    if (!window.confirm(`Are you sure you want to delete ${category.name}?`)) return;

    try {
      await deleteCategoryApi(category.id);
      if (setApiCategories) {
        setApiCategories((prev: any[]) => prev.filter(c => c.id !== category.id));
      }
      toast.success("Category deleted");
    } catch (err) {
      toast.error("Failed to delete category");
    }
  };

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
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-gray-900 text-white text-sm font-medium rounded-md px-4 py-2 hover:bg-gray-800 transition-colors shadow-sm"
          >
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
                      <button onClick={() => openModal(cat)} className="p-1.5 text-blue-500 hover:text-blue-600 transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(cat)} className="p-1.5 text-red-500 hover:text-red-600 transition-colors bg-red-50 rounded-md">
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="e.g., Fancy Items"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emoji Icon</label>
                <input 
                  type="text" 
                  required
                  value={formData.icon}
                  onChange={e => setFormData({...formData, icon: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="e.g., 🎀"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
