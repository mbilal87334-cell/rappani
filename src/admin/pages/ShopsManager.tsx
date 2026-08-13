import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Store, Plus, Search, MapPin, Phone, Mail, ShieldAlert } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ShopsManager() {
  const [shops, setShops] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    shopName: '',
    shopDescription: '',
    shopAddress: '',
    adminName: '',
    adminUsername: '',
    adminPassword: '',
    adminPhone: '',
    adminEmail: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [shopsRes, adminsRes] = await Promise.all([
        fetch('/api/admin/shops', { headers }),
        fetch('/api/admin/admins', { headers })
      ]);
      
      const shopsData = await shopsRes.json();
      const adminsData = await adminsRes.json();
      
      setShops(shopsData);
      setAdmins(adminsData);
    } catch (e) {
      toast.error('Failed to load shops and admins');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/shops', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Shop and Admin Created Successfully!");
        setIsModalOpen(false);
        fetchData(); // Refresh list
      } else {
        toast.error(data.error || "Failed to create shop");
      }
    } catch (err) {
      toast.error("Server error");
    }
  };

  return (
    <div className="p-4 lg:p-8 pt-20 lg:pt-8 w-full max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-stone-900 tracking-tight">Shops & Admins</h1>
          <p className="text-stone-500 mt-1">Manage all vendors, stores, and administrators.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-black text-gold-500 px-6 py-3 flex items-center gap-2 rounded-xl font-bold hover:bg-gold-500 hover:text-black transition-all shadow-md active:scale-95"
        >
          <Plus size={20} /> Add New Shop
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shops.map(shop => {
          const shopAdmin = admins.find(a => a.shopId === shop.id);
          return (
            <motion.div 
              key={shop.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gold-500/10 rounded-xl flex items-center justify-center text-gold-600">
                    <Store size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-stone-900">{shop.name}</h3>
                    <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-full">
                      {shop.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm text-stone-600 mb-6">
                  <p className="flex items-center gap-2"><MapPin size={16} className="text-stone-400" /> {shop.address || 'No address provided'}</p>
                  <p className="flex items-center gap-2 line-clamp-2"><FileText size={16} className="text-stone-400" /> {shop.description || 'No description'}</p>
                </div>

                <div className="pt-4 border-t border-stone-100">
                  <h4 className="font-semibold text-stone-900 mb-3 flex items-center gap-2"><ShieldAlert size={16} /> Assigned Admin</h4>
                  {shopAdmin ? (
                    <div className="space-y-2 text-sm text-stone-600">
                      <p className="flex items-center gap-2"><User size={16} className="text-stone-400" /> {shopAdmin.username}</p>
                      <p className="flex items-center gap-2"><Phone size={16} className="text-stone-400" /> {shopAdmin.phone}</p>
                      <p className="flex items-center gap-2"><Mail size={16} className="text-stone-400" /> {shopAdmin.email}</p>
                    </div>
                  ) : (
                    <p className="text-red-500 text-sm font-medium">No admin assigned</p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="px-6 py-4 border-b border-stone-200 flex justify-between items-center bg-stone-50">
              <h2 className="text-xl font-bold text-stone-900 font-heading">Create New Shop & Admin</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-stone-200 rounded-full transition-colors">
                <Users size={20} className="text-stone-500" />
              </button>
            </div>
            
            <form onSubmit={handleCreateShop} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-bold text-stone-900 border-b pb-2">Shop Details</h3>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Shop Name</label>
                    <input required type="text" className="w-full px-4 py-2 border rounded-xl" value={formData.shopName} onChange={e => setFormData({...formData, shopName: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Shop Description</label>
                    <input type="text" className="w-full px-4 py-2 border rounded-xl" value={formData.shopDescription} onChange={e => setFormData({...formData, shopDescription: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Shop Address</label>
                    <input type="text" className="w-full px-4 py-2 border rounded-xl" value={formData.shopAddress} onChange={e => setFormData({...formData, shopAddress: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-stone-900 border-b pb-2">Admin Credentials</h3>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Username</label>
                    <input required type="text" className="w-full px-4 py-2 border rounded-xl" value={formData.adminUsername} onChange={e => setFormData({...formData, adminUsername: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
                    <input required type="text" className="w-full px-4 py-2 border rounded-xl" value={formData.adminPassword} onChange={e => setFormData({...formData, adminPassword: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Admin Phone (For OTP)</label>
                    <input required type="text" className="w-full px-4 py-2 border rounded-xl" value={formData.adminPhone} onChange={e => setFormData({...formData, adminPhone: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Admin Email</label>
                    <input required type="email" className="w-full px-4 py-2 border rounded-xl" value={formData.adminEmail} onChange={e => setFormData({...formData, adminEmail: e.target.value})} />
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-stone-200 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl font-medium text-stone-600 hover:bg-stone-100">Cancel</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl font-bold bg-black text-gold-500 hover:bg-gold-500 hover:text-black transition-all">Create Shop & Admin</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function FileText({ size, className }: any) { return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>; }
function User({ size, className }: any) { return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
