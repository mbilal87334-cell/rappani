import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ticket, Plus, Trash2, Edit2, Loader, Save, X } from 'lucide-react';
import { fetchWithAuth } from '../../api';

export default function CouponManager() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: '', discountPercent: 10, maxUses: 100 });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await fetchWithAuth('/api/coupons');
      const data = await res.json();
      setCoupons(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code) return setError('Code is required');
    try {
      const res = await fetchWithAuth('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCoupon)
      });
      const data = await res.json();
      if (data.success) {
        fetchCoupons();
        setShowModal(false);
        setNewCoupon({ code: '', discountPercent: 10, maxUses: 100 });
      } else {
        setError(data.error || 'Failed to create coupon');
      }
    } catch (err) {
      setError('Server error');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await fetchWithAuth(`/api/coupons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      });
      fetchCoupons();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon permanently?')) return;
    try {
      await fetchWithAuth(`/api/coupons/${id}`, { method: 'DELETE' });
      fetchCoupons();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-primary">Discount Coupons</h2>
          <p className="text-neutral-500 text-sm mt-1">Manage promo codes and discounts</p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-black text-gold-500 px-5 py-2.5 rounded-lg font-bold hover:bg-gold-500 hover:text-black transition-all shadow-md active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Create Coupon
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 text-gold-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {coupons.map((coupon) => (
            <div key={coupon._id} className={`bg-white rounded-xl shadow-sm border p-6 relative overflow-hidden transition-all ${!coupon.isActive ? 'border-neutral-200 opacity-70' : 'border-gold-200 shadow-gold-500/5'}`}>
              {!coupon.isActive && (
                <div className="absolute top-0 left-0 w-full h-1 bg-neutral-300" />
              )}
              {coupon.isActive && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gold-500" />
              )}
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-gold-500" />
                    <h3 className="font-bold text-xl tracking-tight uppercase text-primary">{coupon.code}</h3>
                  </div>
                  <p className="text-sm text-neutral-500 mt-1">Created on {new Date(coupon.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                  {coupon.discountPercent}% OFF
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Usage limit:</span>
                  <span className="font-medium text-primary">{coupon.usedCount} / {coupon.maxUses}</span>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gold-500 h-2 rounded-full transition-all" 
                    style={{ width: `${Math.min(100, (coupon.usedCount / coupon.maxUses) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${coupon.isActive ? 'bg-green-500' : 'bg-neutral-300'}`}>
                    <div 
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${coupon.isActive ? 'left-[22px]' : 'left-0.5'}`} 
                    />
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={coupon.isActive}
                    onChange={() => handleToggleActive(coupon._id, coupon.isActive)}
                  />
                  <span className="text-sm font-medium text-neutral-600">{coupon.isActive ? 'Active' : 'Disabled'}</span>
                </label>
                
                <button 
                  onClick={() => handleDelete(coupon._id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          
          {coupons.length === 0 && (
            <div className="col-span-full bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center">
              <Ticket className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-neutral-700 mb-1">No Coupons Yet</h3>
              <p className="text-neutral-500">Create your first discount code to offer promotions to your customers.</p>
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto pt-safe sm:pt-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden mt-8 mb-20 sm:my-8 shrink-0"
            >
              <div className="flex items-center justify-between p-4 border-b border-neutral-100 bg-neutral-50">
                <h3 className="font-bold text-lg text-primary">Create New Coupon</h3>
                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-neutral-200 rounded-md transition-colors text-neutral-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                {error && <p className="text-red-500 text-sm font-medium p-3 bg-red-50 rounded-lg">{error}</p>}
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Coupon Code</label>
                  <input 
                    type="text" 
                    required
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none uppercase font-bold tracking-widest text-primary"
                    placeholder="e.g. SUMMER25"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Discount (%)</label>
                    <input 
                      type="number" 
                      min="1" max="100" required
                      value={newCoupon.discountPercent}
                      onChange={(e) => setNewCoupon({...newCoupon, discountPercent: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Usage Limit</label>
                    <input 
                      type="number" 
                      min="1" required
                      value={newCoupon.maxUses}
                      onChange={(e) => setNewCoupon({...newCoupon, maxUses: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none"
                    />
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-neutral-600 font-medium hover:bg-neutral-100 rounded-lg transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex items-center gap-2 bg-black text-gold-500 px-6 py-2.5 rounded-lg font-bold hover:bg-gold-500 hover:text-black transition-all shadow-md active:scale-95">
                    <Save className="w-4 h-4" />
                    Save Coupon
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
