import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tags, Plus, Search, Edit2, Trash2, X, Loader2, Image as ImageIcon, Layers } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SubcategoryManager() {
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [userRole, setUserRole] = useState('shopadmin');
  const [userShopId, setUserShopId] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    storeId: '',
    categoryId: '',
    description: '',
    image: '',
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
        fetch('/api/subcategories', { headers }),
        fetch('/api/categories', { headers })
      ];
      
      if (true) { 
        reqs.push(fetch('/api/admin/shops', { headers }));
      }
      
      const responses = await Promise.all(reqs);
      
      const subcatData = await responses[0].json();
      if (Array.isArray(subcatData)) setSubcategories(subcatData);
      
      const catData = await responses[1].json();
      if (Array.isArray(catData)) setCategories(catData);
      
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

  const openModal = (subcat: any = null) => {
    if (subcat) {
      setEditingId(subcat.id);
      setFormData({
        name: subcat.name || '',
        storeId: subcat.storeId || '',
        categoryId: subcat.categoryId || '',
        description: subcat.description || '',
        image: subcat.image || '',
        slug: subcat.slug || '',
        status: subcat.status || 'active'
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '', 
        storeId: userRole === 'superadmin' ? '' : userShopId, 
        categoryId: '',
        description: '', 
        image: '', 
        slug: '', 
        status: 'active'
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Name is required");
    if (userRole === 'superadmin' && !formData.storeId) return toast.error("Please select a store");
    if (!formData.categoryId) return toast.error("Please select a category");

    setIsSubmitting(true);
    const token = localStorage.getItem('adminToken');
    
    try {
      const isEdit = !!editingId;
      const url = isEdit ? `/api/subcategories/${editingId}` : '/api/subcategories';
      const method = isEdit ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        id: isEdit ? editingId : `subcat_${Date.now()}`
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
        toast.success(isEdit ? "Subcategory updated" : "Subcategory created");
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

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    const token = localStorage.getItem('adminToken');
    
    try {
      const res = await fetch(`/api/subcategories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success("Subcategory deleted successfully");
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

  const filteredSubcategories = subcategories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.storeId && c.storeId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getShopName = (shopId: string) => {
    const s = shops.find(s => s.id === shopId);
    return s ? s.name : shopId;
  };

  const getCatName = (catId: string) => {
    const c = categories.find(c => c.id === catId);
    return c ? c.name : catId;
  };

  // Filter categories based on selected store in form
  const availableFormCategories = categories.filter(c => {
    const targetStore = userRole === 'superadmin' ? formData.storeId : userShopId;
    return c.storeId === targetStore;
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
              <Layers className="text-gold-500" />
              Subcategories
            </h1>
            <p className="text-stone-500 text-sm mt-1">Manage subcategories for {userRole === 'superadmin' ? 'all stores' : 'your store'}</p>
          </div>
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors shadow-sm font-medium"
          >
            <Plus size={18} />
            Add Subcategory
          </button>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center gap-3">
          <Search className="text-stone-400" size={20} />
          <input 
            type="text" 
            placeholder="Search subcategories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-stone-700 placeholder:text-stone-400"
          />
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 text-sm">
                  <th className="p-4 font-medium">Subcategory</th>
                  <th className="p-4 font-medium">Category</th>
                  {userRole === 'superadmin' && <th className="p-4 font-medium">Store</th>}
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredSubcategories.length > 0 ? (
                  filteredSubcategories.map(subcat => (
                    <tr key={subcat.id} className="hover:bg-stone-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center overflow-hidden">
                            {subcat.image ? (
                              <img src={subcat.image} alt={subcat.name} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="text-stone-400" size={20} />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-stone-800">{subcat.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-medium text-stone-700">{getCatName(subcat.categoryId)}</span>
                      </td>
                      {userRole === 'superadmin' && (
                        <td className="p-4 text-sm text-stone-600">
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-stone-100 border border-stone-200 text-xs font-medium">
                            {getShopName(subcat.storeId)}
                          </span>
                        </td>
                      )}
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                          subcat.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {subcat.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => openModal(subcat)}
                            className="p-2 text-stone-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => setShowDeleteConfirm(subcat.id)}
                            className="p-2 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-stone-500">
                      No subcategories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
              onClick={closeModal}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-stone-200"
            >
              <div className="flex justify-between items-center p-6 border-b border-stone-100 bg-stone-50/50">
                <h2 className="text-xl font-bold text-stone-800">
                  {editingId ? 'Edit Subcategory' : 'Add Subcategory'}
                </h2>
                <button onClick={closeModal} className="text-stone-400 hover:bg-stone-100 p-2 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                {userRole === 'superadmin' && (
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Store *</label>
                    <select 
                      value={formData.storeId} 
                      onChange={e => {
                        setFormData({...formData, storeId: e.target.value, categoryId: ''});
                      }}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                      required
                    >
                      <option value="">Select a store</option>
                      {shops.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Parent Category *</label>
                  <select 
                    value={formData.categoryId} 
                    onChange={e => setFormData({...formData, categoryId: e.target.value})}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                    required
                    disabled={userRole === 'superadmin' && !formData.storeId}
                  >
                    <option value="">Select a category</option>
                    {availableFormCategories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {userRole === 'superadmin' && !formData.storeId && (
                    <p className="text-xs text-red-500 mt-1">Select a store first</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Subcategory Name *</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Image URL</label>
                  <input 
                    type="text" 
                    value={formData.image} 
                    onChange={e => setFormData({...formData, image: e.target.value})}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Status</label>
                  <select 
                    value={formData.status} 
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-stone-100">
                  <button type="button" onClick={closeModal} className="px-5 py-2.5 text-stone-600 bg-stone-100 rounded-xl">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-primary text-white rounded-xl flex items-center gap-2">
                    {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                    Save
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteConfirm && (
          // ... (Delete modal similar to CategoryManager)
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-stone-900/40" onClick={() => !isDeleting && setShowDeleteConfirm(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-2xl shadow-xl max-w-sm p-6 text-center z-10">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={24} /></div>
              <h3 className="text-xl font-bold mb-2">Delete Subcategory?</h3>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-2.5 bg-stone-100 rounded-xl">Cancel</button>
                <button onClick={() => handleDelete(showDeleteConfirm)} disabled={isDeleting} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl flex justify-center gap-2">
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
