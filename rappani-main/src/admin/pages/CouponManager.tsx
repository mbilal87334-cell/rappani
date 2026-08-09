import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Ticket, Plus, Trash2, Edit2, Loader, Save, X, Clock, Eye, 
  Users, CheckCircle2, AlertCircle, Calendar, RefreshCw, EyeOff 
} from 'lucide-react';
import { fetchWithAuth } from '../../api';
import toast from 'react-hot-toast';

export default function CouponManager() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'manage' | 'active-offers'>('manage');
  const [tick, setTick] = useState(0);

  // Modal State
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedCouponId, setSelectedCouponId] = useState<string | null>(null);

  // Form State
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountPercent: 10,
    maxUses: 100,
    offerTitle: '',
    offerDescription: '',
    discountDetails: '',
    minOrderValue: 0,
    maxDiscount: 0,
    showToCustomers: false
  });

  // Offer Activation State
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [activateTargetCoupon, setActivateTargetCoupon] = useState<any | null>(null);
  const [activationDuration, setActivationDuration] = useState<string>('60'); // minutes or 'custom'
  const [customStartTime, setCustomStartTime] = useState<string>('');
  const [customExpiryTime, setCustomExpiryTime] = useState<string>('');

  // Extension Modal State
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendTargetCoupon, setExtendTargetCoupon] = useState<any | null>(null);
  const [extendMinutes, setExtendMinutes] = useState<string>('15');

  const [error, setError] = useState('');

  // Ticking effect to refresh remaining times in real-time
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
      toast.error('Failed to load coupons');
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedCouponId(null);
    setNewCoupon({
      code: '',
      discountPercent: 10,
      maxUses: 100,
      offerTitle: '',
      offerDescription: '',
      discountDetails: '',
      minOrderValue: 0,
      maxDiscount: 0,
      showToCustomers: false
    });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (coupon: any) => {
    setModalMode('edit');
    setSelectedCouponId(coupon._id);
    setNewCoupon({
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      maxUses: coupon.maxUses,
      offerTitle: coupon.offerTitle || '',
      offerDescription: coupon.offerDescription || '',
      discountDetails: coupon.discountDetails || '',
      minOrderValue: coupon.minOrderValue || 0,
      maxDiscount: coupon.maxDiscount || 0,
      showToCustomers: coupon.showToCustomers || false
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code.trim()) return setError('Code is required');

    try {
      let res;
      if (modalMode === 'create') {
        res = await fetchWithAuth('/api/coupons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newCoupon)
        });
      } else {
        res = await fetchWithAuth(`/api/coupons/${selectedCouponId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newCoupon)
        });
      }

      const data = await res.json();
      if (data.success) {
        toast.success(modalMode === 'create' ? 'Coupon created successfully' : 'Coupon updated successfully');
        fetchCoupons();
        setShowModal(false);
      } else {
        setError(data.error || 'Failed to save coupon');
      }
    } catch (err) {
      setError('Server error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon permanently?')) return;
    try {
      const res = await fetchWithAuth(`/api/coupons/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Coupon deleted');
        fetchCoupons();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete coupon');
    }
  };

  // Offer Activation Submit
  const handleActivateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activateTargetCoupon) return;

    try {
      const res = await fetchWithAuth(`/api/coupons/${activateTargetCoupon._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'activate',
          duration: activationDuration,
          customStartTime: activationDuration === 'custom' ? customStartTime : undefined,
          customExpiryTime: activationDuration === 'custom' ? customExpiryTime : undefined
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Promotional offer activated for ${activateTargetCoupon.code}`);
        fetchCoupons();
        setShowActivateModal(false);
      } else {
        toast.error(data.error || 'Failed to activate offer');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error');
    }
  };

  // Offer Deactivation Submit
  const handleDeactivate = async (coupon: any) => {
    try {
      const res = await fetchWithAuth(`/api/coupons/${coupon._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deactivate' })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Offer deactivated for ${coupon.code}`);
        fetchCoupons();
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error');
    }
  };

  // End Offer Now
  const handleEndNow = async (coupon: any) => {
    try {
      const res = await fetchWithAuth(`/api/coupons/${coupon._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'endNow' })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Offer ended immediately for ${coupon.code}`);
        fetchCoupons();
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error');
    }
  };

  // Offer Extension Submit
  const handleExtendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extendTargetCoupon) return;

    try {
      const res = await fetchWithAuth(`/api/coupons/${extendTargetCoupon._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'extend',
          extendMinutes: extendMinutes
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Offer extended by ${extendMinutes} minutes`);
        fetchCoupons();
        setShowExtendModal(false);
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error');
    }
  };

  // Dynamic Status Getter
  const getStatus = (coupon: any) => {
    if (!coupon.isActive) return 'Disabled';
    const now = Date.now();
    if (coupon.startTime && now < new Date(coupon.startTime).getTime()) return 'Scheduled';
    if (coupon.expiryTime && now > new Date(coupon.expiryTime).getTime()) return 'Expired';
    if (coupon.startTime && coupon.expiryTime && now >= new Date(coupon.startTime).getTime() && now <= new Date(coupon.expiryTime).getTime()) return 'Active';
    return 'Active';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold border border-green-200">🟢 Active</span>;
      case 'Scheduled':
        return <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-full text-xs font-bold border border-yellow-200">🟡 Scheduled</span>;
      case 'Expired':
        return <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2.5 py-1 rounded-full text-xs font-bold border border-red-200">🔴 Expired</span>;
      default:
        return <span className="inline-flex items-center gap-1 bg-neutral-100 text-neutral-600 px-2.5 py-1 rounded-full text-xs font-bold border border-neutral-200">⚪ Disabled</span>;
    }
  };

  const formatRemainingTime = (expiryTime: string) => {
    if (!expiryTime) return 'N/A';
    const diff = new Date(expiryTime).getTime() - Date.now();
    if (diff <= 0) return '00:00:00 (Expired)';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-primary">Coupon & Offer Settings</h2>
          <p className="text-neutral-500 text-sm mt-1">Manage promotional discount codes and limited-time banners</p>
        </div>
        
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-black text-gold-500 px-5 py-2.5 rounded-lg font-bold hover:bg-gold-500 hover:text-black transition-all shadow-md active:scale-95 shrink-0"
        >
          <Plus className="w-5 h-5" />
          Create New Coupon
        </button>
      </div>

      {/* Tabs Selection */}
      <div className="flex border-b border-neutral-200">
        <button
          onClick={() => setActiveTab('manage')}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 ${activeTab === 'manage' ? 'border-gold-500 text-primary' : 'border-transparent text-neutral-500 hover:text-primary'}`}
        >
          Manage Coupons
        </button>
        <button
          onClick={() => setActiveTab('active-offers')}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'active-offers' ? 'border-gold-500 text-primary' : 'border-transparent text-neutral-500 hover:text-primary'}`}
        >
          <Clock className="w-4 h-4" />
          Active Promotional Offers View
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 text-gold-500 animate-spin" />
        </div>
      ) : activeTab === 'manage' ? (
        /* tab: MANAGE COUPONS */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {coupons.map((coupon) => {
            const status = getStatus(coupon);
            return (
              <div key={coupon._id} className={`bg-white rounded-xl shadow-sm border p-6 relative overflow-hidden transition-all ${status === 'Disabled' ? 'border-neutral-200 opacity-70' : 'border-gold-200 shadow-gold-500/5'}`}>
                {status === 'Disabled' ? (
                  <div className="absolute top-0 left-0 w-full h-1 bg-neutral-300" />
                ) : (
                  <div className="absolute top-0 left-0 w-full h-1 bg-gold-500" />
                )}
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Ticket className="w-5 h-5 text-gold-500" />
                      <h3 className="font-bold text-xl tracking-tight uppercase text-primary">{coupon.code}</h3>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5">
                      {getStatusBadge(status)}
                      {coupon.showToCustomers && (
                        <span className="inline-flex items-center gap-0.5 bg-violet-50 text-violet-700 px-1.5 py-0.5 rounded text-[10px] font-bold border border-violet-100">
                          Visible
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                    {coupon.discountPercent}% OFF
                  </div>
                </div>

                {coupon.offerTitle && (
                  <div className="mb-4 bg-neutral-50 rounded-lg p-3 border border-neutral-100">
                    <p className="text-xs font-bold text-primary truncate">{coupon.offerTitle}</p>
                    <p className="text-[11px] text-neutral-500 line-clamp-2 mt-0.5">{coupon.offerDescription}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-medium text-neutral-600">
                      {coupon.minOrderValue > 0 && <span>Min Order: ₹{coupon.minOrderValue}</span>}
                      {coupon.maxDiscount > 0 && <span>Max Discount: ₹{coupon.maxDiscount}</span>}
                    </div>
                  </div>
                )}

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-xs text-neutral-500">
                    <span>Usage Limit:</span>
                    <span className="font-bold text-primary">{coupon.usedCount} / {coupon.maxUses}</span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-gold-500 h-1.5 rounded-full transition-all" 
                      style={{ width: `${Math.min(100, (coupon.usedCount / coupon.maxUses) * 100)}%` }}
                    />
                  </div>

                  {coupon.expiryTime && (
                    <div className="pt-2 border-t border-neutral-50 flex justify-between text-xs text-neutral-500">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Expiry:</span>
                      <span className="font-medium text-primary">
                        {status === 'Expired' ? 'Expired' : formatRemainingTime(coupon.expiryTime)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-neutral-100 gap-2">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openEditModal(coupon)}
                      className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-lg transition-colors"
                      title="Edit settings"
                    >
                      <Edit2 className="w-4.5 h-4.5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(coupon._id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete coupon"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>

                  <div className="flex gap-2">
                    {(status === 'Active' || status === 'Scheduled') ? (
                      <>
                        <button
                          onClick={() => {
                            setExtendTargetCoupon(coupon);
                            setShowExtendModal(true);
                          }}
                          className="bg-neutral-100 hover:bg-neutral-200 text-primary text-xs px-2.5 py-1.5 rounded-lg font-bold transition-all"
                        >
                          + Extend Time
                        </button>
                        <button
                          onClick={() => handleEndNow(coupon)}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs px-2.5 py-1.5 rounded-lg font-bold transition-all"
                        >
                          End Now
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setActivateTargetCoupon(coupon);
                          setActivationDuration('60');
                          setShowActivateModal(true);
                        }}
                        className="bg-black hover:bg-gold-500 hover:text-black text-gold-500 text-xs px-4 py-1.5 rounded-lg font-bold transition-all"
                      >
                        Activate Offer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {coupons.length === 0 && (
            <div className="col-span-full bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center">
              <Ticket className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-neutral-700 mb-1">No Coupons Yet</h3>
              <p className="text-neutral-500">Create your first discount code to offer promotions to your customers.</p>
            </div>
          )}
        </div>
      ) : (
        /* tab: ACTIVE OFFERS VIEW (Metrics Dashboard) */
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-neutral-200 bg-neutral-50/50 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-primary text-lg">Active & Scheduled Promotional Offers</h3>
              <p className="text-neutral-500 text-xs mt-0.5">Real-time statistics of running limited time campaign codes</p>
            </div>
            <button 
              onClick={fetchCoupons}
              className="p-2 hover:bg-neutral-200 rounded-lg text-neutral-600 transition-all active:scale-95"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-100 border-b border-neutral-200 text-neutral-600 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Coupon Code</th>
                  <th className="py-4 px-6">Offer Details</th>
                  <th className="py-4 px-6 text-center">Discount</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6">Remaining Time</th>
                  <th className="py-4 px-6 text-center">Views count</th>
                  <th className="py-4 px-6 text-center">coupon Uses</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-sm text-primary">
                {coupons.filter(c => getStatus(c) !== 'Disabled').map((coupon) => {
                  const status = getStatus(coupon);
                  return (
                    <tr key={coupon._id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold tracking-wider text-base uppercase">
                        {coupon.code}
                      </td>
                      <td className="py-4 px-6 max-w-xs">
                        <div className="font-bold text-primary">{coupon.offerTitle || 'N/A'}</div>
                        <div className="text-xs text-neutral-500 line-clamp-1 mt-0.5">{coupon.offerDescription || 'No description'}</div>
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-green-600">
                        {coupon.discountPercent}%
                      </td>
                      <td className="py-4 px-6 text-center">
                        {getStatusBadge(status)}
                      </td>
                      <td className="py-4 px-6 font-mono font-medium">
                        {coupon.expiryTime ? formatRemainingTime(coupon.expiryTime) : 'Indefinite'}
                      </td>
                      <td className="py-4 px-6 text-center font-bold">
                        <div className="flex items-center justify-center gap-1">
                          <Eye className="w-4 h-4 text-neutral-400" />
                          {coupon.viewsCount || 0}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center font-bold">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="w-4 h-4 text-neutral-400" />
                          {coupon.usedCount || 0} / {coupon.maxUses}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                        {status === 'Active' || status === 'Scheduled' ? (
                          <>
                            <button
                              onClick={() => {
                                setExtendTargetCoupon(coupon);
                                setShowExtendModal(true);
                              }}
                              className="text-xs bg-neutral-100 hover:bg-neutral-200 text-primary font-bold px-3 py-1.5 rounded-lg border border-neutral-300 transition-all active:scale-95"
                            >
                              Extend
                            </button>
                            <button
                              onClick={() => handleEndNow(coupon)}
                              className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg transition-all active:scale-95"
                            >
                              End Now
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              setActivateTargetCoupon(coupon);
                              setActivationDuration('60');
                              setShowActivateModal(true);
                            }}
                            className="text-xs bg-black hover:bg-gold-500 hover:text-black text-gold-500 font-bold px-3 py-1.5 rounded-lg transition-all active:scale-95"
                          >
                            Re-Activate
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {coupons.filter(c => getStatus(c) !== 'Disabled').length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-neutral-500">
                      <Clock className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                      <h4 className="font-bold text-neutral-700">No active promotions currently</h4>
                      <p className="text-xs text-neutral-400 mt-1">Activate any coupon from the "Manage Coupons" tab to start a countdown campaign.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto pt-safe sm:pt-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden mt-8 mb-20 sm:my-8 shrink-0 border border-neutral-100"
            >
              <div className="flex items-center justify-between p-4 border-b border-neutral-100 bg-neutral-50">
                <h3 className="font-bold text-lg text-primary">
                  {modalMode === 'create' ? 'Create New Coupon & Promo Offer' : 'Edit Coupon Settings'}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-neutral-200 rounded-md transition-colors text-neutral-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                {error && <p className="text-red-500 text-sm font-medium p-3 bg-red-50 rounded-lg">{error}</p>}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Coupon Code</label>
                    <input 
                      type="text" 
                      required
                      disabled={modalMode === 'edit'}
                      value={newCoupon.code}
                      onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                      className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none uppercase font-bold tracking-widest text-primary disabled:bg-neutral-50 disabled:cursor-not-allowed"
                      placeholder="e.g. FLASH50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Discount (%)</label>
                    <input 
                      type="number" 
                      min="1" max="100" required
                      value={newCoupon.discountPercent}
                      onChange={(e) => setNewCoupon({...newCoupon, discountPercent: parseInt(e.target.value)})}
                      className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Usage Limit</label>
                    <input 
                      type="number" 
                      min="1" required
                      value={newCoupon.maxUses}
                      onChange={(e) => setNewCoupon({...newCoupon, maxUses: parseInt(e.target.value)})}
                      className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Min Order Value (₹)</label>
                    <input 
                      type="number" 
                      min="0"
                      value={newCoupon.minOrderValue}
                      onChange={(e) => setNewCoupon({...newCoupon, minOrderValue: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Max Discount Cap (₹)</label>
                    <input 
                      type="number" 
                      min="0"
                      value={newCoupon.maxDiscount}
                      onChange={(e) => setNewCoupon({...newCoupon, maxDiscount: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none"
                      placeholder="0 for uncapped"
                    />
                  </div>
                </div>

                <div className="border-t border-neutral-100 pt-4 space-y-4">
                  <h4 className="font-bold text-sm text-neutral-800 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-gold-600" />
                    Promotional Customer Banner Settings (Optional)
                  </h4>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Offer Title</label>
                    <input 
                      type="text" 
                      value={newCoupon.offerTitle}
                      onChange={(e) => setNewCoupon({...newCoupon, offerTitle: e.target.value})}
                      className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none"
                      placeholder="e.g. 🎉 Special Weekend Flash Sale!"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Offer Description</label>
                    <textarea 
                      value={newCoupon.offerDescription}
                      onChange={(e) => setNewCoupon({...newCoupon, offerDescription: e.target.value})}
                      className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none h-18 resize-none"
                      placeholder="e.g. Apply code to get 10% off on all notebooks. Valid on orders above Rs.500."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Banner Discount Details Label</label>
                    <input 
                      type="text" 
                      value={newCoupon.discountDetails}
                      onChange={(e) => setNewCoupon({...newCoupon, discountDetails: e.target.value})}
                      className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none"
                      placeholder="e.g. Get Flat ₹100 Off"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                    <div>
                      <span className="block text-sm font-bold text-primary">Show to Customers</span>
                      <span className="block text-[11px] text-neutral-500">Show this code in the customer "Offers" section and popups</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={newCoupon.showToCustomers}
                        onChange={(e) => setNewCoupon({...newCoupon, showToCustomers: e.target.checked})}
                      />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-neutral-100">
                  <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-neutral-600 font-medium hover:bg-neutral-100 rounded-lg transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex items-center gap-2 bg-black text-gold-500 px-6 py-2.5 rounded-lg font-bold hover:bg-gold-500 hover:text-black transition-all shadow-md active:scale-95">
                    <Save className="w-4.5 h-4.5" />
                    Save settings
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ACTIVATE OFFER MODAL */}
      <AnimatePresence>
        {showActivateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-neutral-100"
            >
              <div className="flex items-center justify-between p-4 border-b border-neutral-100 bg-neutral-50">
                <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gold-600 animate-pulse" />
                  Activate Campaign: {activateTargetCoupon?.code}
                </h3>
                <button onClick={() => setShowActivateModal(false)} className="p-1 hover:bg-neutral-200 rounded-md transition-colors text-neutral-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleActivateSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-2">Campaign Duration</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: '1 Hour', val: '60' },
                      { label: '1.5 Hours', val: '90' },
                      { label: '2 Hours', val: '120' },
                      { label: 'Custom Time', val: 'custom' }
                    ].map(opt => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setActivationDuration(opt.val)}
                        className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                          activationDuration === opt.val 
                            ? 'bg-black text-gold-500 border-black' 
                            : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {activationDuration === 'custom' && (
                  <div className="space-y-3 pt-2 bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">Start Time</label>
                      <input 
                        type="datetime-local" 
                        required
                        value={customStartTime}
                        onChange={(e) => setCustomStartTime(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-neutral-300 rounded-lg outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">Expiry / End Time</label>
                      <input 
                        type="datetime-local" 
                        required
                        value={customExpiryTime}
                        onChange={(e) => setCustomExpiryTime(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-neutral-300 rounded-lg outline-none"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-4 flex justify-end gap-3 border-t border-neutral-100">
                  <button type="button" onClick={() => setShowActivateModal(false)} className="px-4 py-2 text-neutral-600 font-medium hover:bg-neutral-100 rounded-lg text-sm transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="bg-black text-gold-500 px-5 py-2 rounded-lg font-bold hover:bg-gold-500 hover:text-black text-sm transition-all shadow-md active:scale-95">
                    Start Campaign 🚀
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EXTEND TIME MODAL */}
      <AnimatePresence>
        {showExtendModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-neutral-100"
            >
              <div className="flex items-center justify-between p-4 border-b border-neutral-100 bg-neutral-50">
                <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                  <Plus className="w-5 h-5 text-gold-600 animate-bounce" />
                  Extend Offer: {extendTargetCoupon?.code}
                </h3>
                <button onClick={() => setShowExtendModal(false)} className="p-1 hover:bg-neutral-200 rounded-md transition-colors text-neutral-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleExtendSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-2">Extend Campaign By</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: '+15 Min', val: '15' },
                      { label: '+30 Min', val: '30' },
                      { label: '+1 Hour', val: '60' }
                    ].map(opt => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setExtendMinutes(opt.val)}
                        className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                          extendMinutes === opt.val 
                            ? 'bg-black text-gold-500 border-black' 
                            : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-neutral-100">
                  <button type="button" onClick={() => setShowExtendModal(false)} className="px-4 py-2 text-neutral-600 font-medium hover:bg-neutral-100 rounded-lg text-sm transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="bg-black text-gold-500 px-5 py-2 rounded-lg font-bold hover:bg-gold-500 hover:text-black text-sm transition-all shadow-md active:scale-95">
                    Extend Expiry ⏰
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
