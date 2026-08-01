import React, { useState, useRef } from 'react';
import { Search, Plus, Eye, EyeOff, Edit2, Trash2, Copy, Image as ImageIcon, X, Upload, Camera, Loader } from 'lucide-react';
import { Product, saveProduct, deleteProduct } from '../../App';
import toast from 'react-hot-toast';
import { fetchWithAuth } from '../../App';

export default function ProductManager({ products, setProducts, apiCategories = [] }: { products: Product[], setProducts: any, apiCategories?: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    id: '', name: '', category: '', brand: '', sku: '', description: '', price: 0, originalPrice: 0, stock: 50, image: '', images: [], isVisible: true, isFeatured: false
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const tabs = ['All', ...apiCategories.map(c => c.name)];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'All' || p.category === activeTab;
    return matchesSearch && matchesTab;
  });

  const openModal = (product?: Product, isCopy = false) => {
    if (product) {
      if (isCopy) {
        setEditingProduct(null);
        setFormData({ ...product, id: `prod_${Date.now()}`, name: `${product.name} (Copy)` });
      } else {
        setEditingProduct(product);
        setFormData({ ...product });
      }
    } else {
      setEditingProduct(null);
      setFormData({ 
        id: `prod_${Date.now()}`, name: '', category: apiCategories[0]?.name || 'Stationery', brand: '', sku: '', description: '',
        price: 0, stock: 50, image: '', images: [], isVisible: true, isFeatured: false 
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const saved = await saveProduct(formData as Product, !!editingProduct);
      if (editingProduct) {
        setProducts(products.map(p => p.id === saved.id ? saved : p));
        toast.success("Product updated successfully");
      } else {
        setProducts([saved, ...products]);
        toast.success("Product created successfully");
      }
      closeModal();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save product");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    try {
      // If multiple files are uploaded (drag&drop or multi-select)
      if (files.length > 1) {
        let uploadedUrls: string[] = [];
        for (let i = 0; i < files.length; i++) {
          const formDataPayload = new FormData();
          formDataPayload.append('image', files[i]);
          const res = await fetchWithAuth('/api/upload', { method: 'POST', body: formDataPayload });
          const data = await res.json();
          if (data.imageUrl) uploadedUrls.push(data.imageUrl);
        }
        
        const existingImages = formData.images || [];
        if (!formData.image && uploadedUrls.length > 0) {
          setFormData({ ...formData, image: uploadedUrls[0], images: [...existingImages, ...uploadedUrls] });
        } else {
          setFormData({ ...formData, images: [...existingImages, ...uploadedUrls] });
        }
        toast.success(`${uploadedUrls.length} images uploaded!`);
      } else {
        // Single file upload
        const formDataPayload = new FormData();
        formDataPayload.append('image', files[0]);
        const res = await fetchWithAuth('/api/upload', { method: 'POST', body: formDataPayload });
        const data = await res.json();
        
        if (data.imageUrl) {
          const existingImages = formData.images || [];
          setFormData({ 
            ...formData, 
            image: formData.image ? formData.image : data.imageUrl,
            images: [...existingImages, data.imageUrl]
          });
          toast.success("Image uploaded!");
        } else {
          toast.error(data.error || "Upload failed");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Error uploading image");
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...(formData.images || [])];
    newImages.splice(index, 1);
    
    // If the removed image was the primary image, set a new primary if available
    let newPrimary = formData.image;
    if (formData.image === (formData.images || [])[index]) {
      newPrimary = newImages.length > 0 ? newImages[0] : '';
    }
    
    setFormData({ ...formData, images: newImages, image: newPrimary });
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Are you sure you want to delete ${product.name}?`)) return;
    try {
      await deleteProduct(product.id);
      setProducts((prev: Product[]) => prev.filter(p => p.id !== product.id));
      toast.success("Product deleted");
    } catch (err) {
      toast.error("Failed to delete product");
    }
  };

  const handleToggleVisibility = async (product: Product) => {
    const updated = { ...product, isVisible: product.isVisible === false ? true : false };
    try {
      await saveProduct(updated, true);
      setProducts((prev: Product[]) => prev.map(p => p.id === product.id ? updated : p));
      toast.success(updated.isVisible ? "Product is now visible" : "Product hidden from store");
    } catch (err) {
      toast.error("Failed to update visibility");
    }
  };

  const handleToggleFeatured = async (product: Product, isFeatured: boolean) => {
    const updated = { ...product, isFeatured };
    try {
      await saveProduct(updated, true);
      setProducts((prev: Product[]) => prev.map(p => p.id === product.id ? updated : p));
      toast.success(updated.isFeatured ? "Added to Hero Slider" : "Removed from Hero Slider");
    } catch (err) {
      toast.error("Failed to update featured status");
    }
  };

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').map(l => l.trim()).filter(l => l);
        if (lines.length < 2) return toast.error('CSV is empty or missing headers');
        
        // Assume CSV: name,category,price,stock,image
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const newProducts: Product[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const obj: any = {};
          headers.forEach((h, idx) => { obj[h] = values[idx] || ''; });
          
          if (!obj.name || !obj.price) continue;
          
          const newProduct: Product = {
            id: `prod_${Date.now()}_${i}`,
            name: obj.name,
            category: obj.category || 'Uncategorized',
            price: parseFloat(obj.price) || 0,
            originalPrice: obj.originalprice ? parseFloat(obj.originalprice) : undefined,
            stock: parseInt(obj.stock) || 50,
            image: obj.image || '',
            isVisible: true,
            isFeatured: false
          };
          newProducts.push(newProduct);
        }

        if (newProducts.length === 0) return toast.error('No valid products found in CSV');
        
        toast.loading(`Importing ${newProducts.length} products...`, { id: 'bulkUpload' });
        
        // Process sequentially
        for (const p of newProducts) {
          await saveProduct(p, false);
        }
        
        setProducts((prev: Product[]) => [...newProducts, ...prev]);
        toast.success(`Successfully imported ${newProducts.length} products!`, { id: 'bulkUpload' });
      } catch (err) {
        toast.error('Failed to parse CSV', { id: 'bulkUpload' });
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset
  };

  return (
    <div className="max-w-7xl mx-auto pb-10">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Products</h1>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-auto flex-1 sm:flex-none">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-md text-sm font-medium w-full sm:w-64 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none shadow-sm transition-all"
            />
          </div>
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            onChange={handleBulkUpload} 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-md px-4 py-2 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Upload size={16} />
            CSV
          </button>
          <button 
            onClick={() => openModal()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gray-900 text-white text-sm font-medium rounded-md px-4 py-2 hover:bg-gray-800 transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus size={16} />
            Add Product
          </button>
        </div>
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
              {filteredProducts.map((product) => (
                <tr key={product.id} className={`hover:bg-gray-50/50 ${product.isVisible === false ? 'opacity-60' : ''}`}>
                  <td className="px-5 py-4 text-center">
                    <input 
                      type="checkbox" 
                      checked={product.isFeatured || false}
                      onChange={(e) => handleToggleFeatured(product, e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer" 
                    />
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
                        <p className="text-xs text-gray-500 mt-1">ID: {product.id.slice(0,8)}</p>
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
                      <div className={`${(product.stock || 0) > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} rounded-md px-2 py-1 text-xs font-semibold text-center min-w-[60px]`}>
                        {product.stock || 0} in<br/>stock
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <button 
                      onClick={() => handleToggleVisibility(product)}
                      className={`flex items-center gap-1.5 font-medium text-sm px-3 py-1.5 rounded-full transition-colors ${
                        product.isVisible !== false 
                        ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {product.isVisible !== false ? (
                        <><Eye size={16} /> Visible</>
                      ) : (
                        <><EyeOff size={16} /> Hidden</>
                      )}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openModal(product, true)} title="Duplicate" className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors">
                        <Copy size={16} />
                      </button>
                      <button onClick={() => openModal(product)} title="Edit" className="p-1.5 text-blue-500 hover:text-blue-600 transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(product)} title="Delete" className="p-1.5 text-red-500 hover:text-red-600 transition-colors bg-red-50 rounded-md">
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

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center bg-black/50 p-4 overflow-y-auto pt-safe sm:pt-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden mt-8 mb-20 sm:my-8 shrink-0">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                    <input 
                      type="text" required value={formData.name || ''}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      required value={formData.category || ''}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-gray-900"
                    >
                      {apiCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Brand (Optional)</label>
                      <input 
                        type="text" value={formData.brand || ''}
                        onChange={e => setFormData({...formData, brand: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-gray-900"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">SKU (Optional)</label>
                      <input 
                        type="text" value={formData.sku || ''}
                        onChange={e => setFormData({...formData, sku: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-gray-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea 
                      rows={3}
                      value={formData.description || ''}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                      <input 
                        type="number" required min="0" value={formData.price || ''}
                        onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-gray-900"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Original Price</label>
                      <input 
                        type="number" min="0" value={formData.originalPrice || ''}
                        onChange={e => setFormData({...formData, originalPrice: Number(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-gray-900"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                    <input 
                      type="number" min="0" value={formData.stock || 0}
                      onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Images (Drag & Drop)</label>
                    <div className="flex flex-col gap-3">
                      
                      {/* Image Gallery Preview */}
                      {(formData.images && formData.images.length > 0) ? (
                        <div className="grid grid-cols-3 gap-2">
                          {formData.images.map((img, idx) => (
                            <div key={idx} className={`relative h-24 bg-gray-100 rounded-lg overflow-hidden border ${img === formData.image ? 'border-gray-900 ring-2 ring-gray-900' : 'border-gray-200'}`}>
                              <img src={img} alt="Preview" className="w-full h-full object-cover" />
                              <button 
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-gray-100 text-red-500"
                              >
                                <X size={14} />
                              </button>
                              {img !== formData.image && (
                                <button
                                  type="button"
                                  onClick={() => setFormData({...formData, image: img})}
                                  className="absolute bottom-1 left-1 right-1 bg-white/90 text-xs font-semibold py-0.5 rounded shadow text-center text-gray-700"
                                >
                                  Set Main
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="w-full h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400">
                          {isUploading ? (
                            <Loader className="w-8 h-8 animate-spin text-gray-900" />
                          ) : (
                            <>
                              <ImageIcon size={32} className="mb-2 text-gray-300" />
                              <span className="text-sm">No images selected</span>
                            </>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <input 
                          type="file" 
                          accept="image/*"
                          multiple
                          className="hidden" 
                          ref={fileInputRef} 
                          onChange={handleFileUpload} 
                        />
                        <button 
                          type="button" 
                          disabled={isUploading}
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors border border-gray-300"
                        >
                          <Upload size={16} />
                          Gallery
                        </button>

                        <input 
                          type="file" 
                          accept="image/*"
                          capture="environment"
                          className="hidden" 
                          ref={cameraInputRef} 
                          onChange={handleFileUpload} 
                        />
                        <button 
                          type="button" 
                          disabled={isUploading}
                          onClick={() => cameraInputRef.current?.click()}
                          className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <Camera size={16} />
                          Camera
                        </button>
                      </div>

                      <div className="relative mt-2">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span className="bg-white px-2 text-gray-500">Or Paste URL</span>
                        </div>
                      </div>

                      <input 
                        type="url" placeholder="https://..." value={formData.image || ''}
                        onChange={e => setFormData({...formData, image: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" checked={formData.isVisible !== false}
                        onChange={e => setFormData({...formData, isVisible: e.target.checked})}
                        className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                      />
                      <span className="text-sm font-medium text-gray-700">Visible on Storefront</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" checked={formData.isFeatured || false}
                        onChange={e => setFormData({...formData, isFeatured: e.target.checked})}
                        className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                      />
                      <span className="text-sm font-medium text-gray-700">Show in Hero Slider</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-8 border-t border-gray-100 mt-6">
                <button 
                  type="button" onClick={closeModal}
                  className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit" disabled={isSaving}
                  className="px-6 py-2 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
