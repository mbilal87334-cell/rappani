import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tags, Plus, Search, Edit2, Trash2, X, Loader2, Image as ImageIcon, ChevronRight, Layers, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
export default function CategoryManager({ products = [] }: { products?: any[] }) {
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShopId, setSelectedShopId] = useState<string>('all');
  
  // Navigation State
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  // Modal State
  const [modalType, setModalType] = useState<'category' | 'subcategory' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{id: string, type: 'category' | 'subcategory'} | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [userRole, setUserRole] = useState('shopadmin');
  const [userShopId, setUserShopId] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    storeId: '',
    categoryId: '',
    description: '',
    image: '',
    icon: '',
    slug: '',
    status: 'active'
  });

  useEffect(() => {
    try {
      const token = localStorage.getItem('adminToken');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role || 'shopadmin');
        setUserShopId(payload.shopId || '');
      }
    } catch (e) {
      console.error("Failed to parse token");
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const reqs = [
        fetch('/api/categories', { headers }),
        fetch('/api/subcategories', { headers })
      ];
      
      if (true) { 
        reqs.push(fetch('/api/admin/shops', { headers }));
      }
      
      const responses = await Promise.all(reqs);
      
      const catData = await responses[0].json();
      if (Array.isArray(catData)) setCategories(catData);
      
      const subcatData = await responses[1].json();
      if (Array.isArray(subcatData)) setSubcategories(subcatData);
      
      if (responses[2]) {
        const shopData = await responses[2].json();
        if (Array.isArray(shopData)) setShops(shopData);
      }
    } catch (e) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (type: 'category' | 'subcategory', item: any = null) => {
    setModalType(type);
    if (item) {
      setEditingId(item.id);
      setFormData({
        name: item.name || '',
        storeId: item.storeId || '',
        categoryId: item.categoryId || activeCategoryId || '',
        description: item.description || '',
        image: item.image || '',
        icon: item.icon || '',
        slug: item.slug || '',
        status: item.status || 'active'
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '', 
        storeId: '', 
        categoryId: type === 'subcategory' && activeCategoryId ? activeCategoryId : '',
        description: '', 
        image: '', 
        icon: '',
        slug: '', 
        status: 'active'
      });
    }
  };

  const closeModal = () => {
    setModalType(null);
    setEditingId(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Name is required");
    if (modalType === 'subcategory' && !formData.categoryId) return toast.error("Please select a category");

    setIsSubmitting(true);
    const token = localStorage.getItem('adminToken');
    
    try {
      const isEdit = !!editingId;
      const endpoint = modalType === 'category' ? '/api/categories' : '/api/subcategories';
      const url = isEdit ? `${endpoint}/${editingId}` : endpoint;
      const method = isEdit ? 'PUT' : 'POST';
      
      const prefix = modalType === 'category' ? 'cat' : 'subcat';
      const payload = {
        ...formData,
        id: isEdit ? editingId : `${prefix}_${Date.now()}`
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast.success(isEdit ? "Updated successfully" : "Created successfully");
        fetchData();
        closeModal();
      } else {
        toast.error(data.error || "Failed to save");
      }
    } catch (err) {
      toast.error("An error occurred while saving");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) return;
    const { id, type } = showDeleteConfirm;
    
    setIsDeleting(true);
    const token = localStorage.getItem('adminToken');
    
    try {
      const endpoint = type === 'category' ? '/api/categories' : '/api/subcategories';
      const res = await fetch(`${endpoint}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success("Deleted successfully");
        fetchData();
      } else {
        toast.error(data.error || "Failed to delete");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(null);
    }
  };

  const getShopName = (shopId: string) => {
    const s = shops.find(s => s.id === shopId);
    return s ? s.name : shopId;
  };

  const activeCategory = activeCategoryId ? categories.find(c => c.id === activeCategoryId) : null;

  const currentList = activeCategoryId 
    ? subcategories.filter(sc => sc.categoryId === activeCategoryId)
    : categories;

  const filteredList = currentList.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (userRole === 'superadmin' && selectedShopId !== 'all') {
      const hasProducts = !activeCategoryId 
        ? products.some(p => (p.shopId || 'main-shop') === selectedShopId && (p.categoryId === item.id || p.category === item.name))
        : products.some(p => (p.shopId || 'main-shop') === selectedShopId && (p.subcategoryId === item.id || p.subcategory === item.name));
      return hasProducts;
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-stone-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <div>
            {activeCategoryId && activeCategory ? (
              <div className="flex flex-col items-start">
                <button 
                  onClick={() => setActiveCategoryId(null)}
                  className="flex items-center gap-1 text-sm font-medium text-stone-500 hover:text-stone-800 transition-colors mb-2"
                >
                  <ArrowLeft size={16} /> Back to Categories
                </button>
                <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
                  <Layers className="text-gold-500" />
                  {activeCategory.name} - Sub-categories
                </h1>
                <p className="text-stone-500 text-sm mt-1">Manage sub-categories for {activeCategory.name}</p>
              </div>
            ) : (
              <div>
                <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
                  <Tags className="text-gold-500" />
                  Categories
                </h1>
                <p className="text-stone-500 text-sm mt-1">Manage categories for {userRole === 'superadmin' ? 'all stores' : 'your store'}</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => openModal(activeCategoryId ? 'subcategory' : 'category')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors shadow-sm font-medium shrink-0"
          >
            <Plus size={18} />
            {activeCategoryId ? 'Add Sub-category' : 'Add Category'}
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center gap-3 flex-1">
            <Search className="text-stone-400" size={20} />
            <input 
              type="text" 
              placeholder={`Search ${activeCategoryId ? 'sub-categories' : 'categories'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-stone-700 placeholder:text-stone-400"
            />
          </div>

          {userRole === 'superadmin' && (
            <div className="bg-white px-4 py-2 rounded-xl border border-stone-200 shadow-sm shrink-0 flex items-center min-w-[200px]">
              <select 
                value={selectedShopId}
                onChange={e => setSelectedShopId(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-stone-700 cursor-pointer font-medium"
              >
                <option value="all">All Shops (Combined)</option>
                <option value="main-shop">Main Shop</option>
                {shops.filter(s => s.id !== 'main-shop').map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* List */}
        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 text-sm">
                  <th className="p-4 font-medium">{activeCategoryId ? 'Sub-category Name' : 'Category Name'}</th>
                  <th className="p-4 font-medium">Products</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredList.length > 0 ? (
                  filteredList.map(item => {
                    const shopProducts = selectedShopId === 'all' ? products : products.filter(p => (p.shopId || 'main-shop') === selectedShopId);
                    const productCount = !activeCategoryId 
                      ? shopProducts.filter(p => p.categoryId === item.id || p.category === item.name).length 
                      : shopProducts.filter(p => p.subcategoryId === item.id || p.subcategory === item.name).length;
                    
                    return (
                      <tr 
                        key={item.id} 
                        className={`transition-colors ${!activeCategoryId ? 'cursor-pointer hover:bg-stone-50 group' : 'hover:bg-stone-50'}`}
                        onClick={() => {
                          if (!activeCategoryId) setActiveCategoryId(item.id);
                        }}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center overflow-hidden shrink-0">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              ) : item.icon ? (
                                <span className="text-xl">{item.icon}</span>
                              ) : (
                                <ImageIcon className="text-stone-400" size={20} />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-stone-800 flex items-center gap-2">
                                {item.name}
                                {!activeCategoryId && (
                                  <ChevronRight size={16} className="text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                              </div>
                              {item.slug && <div className="text-xs text-stone-500">/{item.slug}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-stone-50 border border-stone-200 text-xs font-bold text-stone-600">
                            {productCount} Products
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                            item.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {item.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <button 
                              onClick={() => openModal(activeCategoryId ? 'subcategory' : 'category', item)}
                              className="p-2 text-stone-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => setShowDeleteConfirm({ id: item.id, type: activeCategoryId ? 'subcategory' : 'category' })}
                              className="p-2 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-stone-500">
                      No {activeCategoryId ? 'sub-categories' : 'categories'} found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
              onClick={closeModal}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-stone-200"
            >
              <div className="flex justify-between items-center p-6 border-b border-stone-100 bg-stone-50/50">
                <h2 className="text-xl font-bold text-stone-800">
                  {editingId ? `Edit ${modalType === 'category' ? 'Category' : 'Sub-category'}` : `Add New ${modalType === 'category' ? 'Category' : 'Sub-category'}`}
                </h2>
                <button onClick={closeModal} className="text-stone-400 hover:text-stone-600 p-2 hover:bg-stone-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">

                {modalType === 'subcategory' && (
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Parent Category *</label>
                    <select 
                      value={formData.categoryId} 
                      onChange={e => setFormData({...formData, categoryId: e.target.value})}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      required
                      disabled={!!activeCategoryId}
                    >
                      <option value="">Select a category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Name *</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Stationery, Pens"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                  <textarea 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Brief description..."
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none h-20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Image URL</label>
                  <input 
                    type="text" 
                    value={formData.image} 
                    onChange={e => setFormData({...formData, image: e.target.value})}
                    placeholder="https://..."
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>

                {modalType === 'category' && (
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Emoji Icon</label>
                    <input 
                      type="text" 
                      value={formData.icon} 
                      onChange={e => setFormData({...formData, icon: e.target.value})}
                      placeholder="e.g. 🎁"
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Status</label>
                  <select 
                    value={formData.status} 
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-stone-100">
                  <button 
                    type="button" 
                    onClick={closeModal}
                    className="px-5 py-2.5 text-stone-600 font-medium hover:bg-stone-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="px-5 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-70 flex items-center gap-2 shadow-sm"
                  >
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : null}
                    {editingId ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
              onClick={() => !isDeleting && setShowDeleteConfirm(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center border border-stone-200"
            >
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-2">Delete {showDeleteConfirm.type === 'category' ? 'Category' : 'Sub-category'}?</h3>
              <p className="text-stone-500 mb-6 text-sm">
                This action cannot be undone. {showDeleteConfirm.type === 'category' && 'You can only delete empty categories.'}
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteConfirm(null)}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex justify-center items-center gap-2 disabled:opacity-70 shadow-sm"
                >
                  {isDeleting ? <Loader2 size={18} className="animate-spin" /> : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
