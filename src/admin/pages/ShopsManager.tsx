import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Store, Plus, Search, MapPin, Phone, Mail, ShieldAlert, Edit2, Trash2, Power, PowerOff, X, Map as MapIcon, Loader2, FileText, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationPicker({ position, setPosition }: { position: [number, number] | null, setPosition: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} /> : null;
}

function MapCenterUpdater({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 15);
    }
  }, [position, map]);
  return null;
}

export default function ShopsManager() {
  const [shops, setShops] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mapViewPosition, setMapViewPosition] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingShopId, setEditingShopId] = useState<string | null>(null);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const locateAddressOnMap = async () => {
    if (!formData.shopAddress.trim()) {
      toast.error("Please enter an address first");
      return;
    }
    setIsLocating(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.shopAddress)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setMapPosition([parseFloat(lat), parseFloat(lon)]);
        toast.success("Location found on map!");
      } else {
        toast.error("Could not find location for this address on map");
      }
    } catch (err) {
      toast.error("Error searching location");
    } finally {
      setIsLocating(false);
    }
  };

  const defaultLocation: [number, number] = [13.0827, 80.2707]; // Chennai default

  const [formData, setFormData] = useState({
    shopName: '',
    shopDescription: '',
    shopAddress: '',
    shopLatitude: '',
    shopLongitude: '',
    adminName: '',
    adminUsername: '',
    adminPassword: '',
    adminPhone: '',
    adminEmail: ''
  });

  const [mapPosition, setMapPosition] = useState<[number, number] | null>(null);

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
      
      if (Array.isArray(shopsData)) {
        setShops(shopsData);
      } else if (shopsData.error) {
        toast.error(shopsData.error);
        if (shopsData.error.includes("Access denied")) {
           toast.error("Please log out and log in again to refresh your session.");
        }
      }

      if (Array.isArray(adminsData)) {
        setAdmins(adminsData);
      }
    } catch (e) {
      toast.error('Failed to load shops and admins');
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (shop: any = null) => {
    if (shop) {
      const shopAdmin = admins.find(a => a.shopId === shop.id);
      setEditingShopId(shop.id);
      setFormData({
        shopName: shop.name || '',
        shopDescription: shop.description || '',
        shopAddress: shop.address || '',
        shopLatitude: shop.latitude || '',
        shopLongitude: shop.longitude || '',
        adminName: shopAdmin?.name || '',
        adminUsername: shopAdmin?.username || '',
        adminPassword: '', // Leave blank unless changing
        adminPhone: shopAdmin?.phone || '',
        adminEmail: shopAdmin?.email || ''
      });
      if (shop.latitude && shop.longitude) {
        setMapPosition([parseFloat(shop.latitude), parseFloat(shop.longitude)]);
      } else {
        setMapPosition(null);
      }
    } else {
      setEditingShopId(null);
      setFormData({
        shopName: '', shopDescription: '', shopAddress: '', shopLatitude: '', shopLongitude: '',
        adminName: '', adminUsername: '', adminPassword: '', adminPhone: '', adminEmail: ''
      });
      setMapPosition(null);
    }
    setIsModalOpen(true);
  };

  const handleSaveShop = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.shopName || !formData.adminUsername || !formData.adminPhone || !formData.adminEmail) {
      toast.error("Please fill all required fields.");
      return;
    }
    if (!editingShopId && !formData.adminPassword) {
      toast.error("Password is required for new admins.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const payload = {
        ...formData,
        shopLatitude: mapPosition ? mapPosition[0].toString() : '',
        shopLongitude: mapPosition ? mapPosition[1].toString() : ''
      };

      const token = localStorage.getItem('adminToken');
      const url = editingShopId ? `/api/admin/shops/${editingShopId}` : '/api/admin/shops';
      const method = editingShopId ? 'PUT' : 'POST';

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
        toast.success(editingShopId ? "Shop updated successfully" : "Shop and Admin created successfully!");
        setIsModalOpen(false);
        fetchData(); 
      } else {
        toast.error(data.error || "Failed to save shop");
      }
    } catch (err) {
      toast.error("Server error during save");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (id === 'main_store') {
      toast.error("Main Store cannot be deleted.");
      setShowDeleteConfirm(null);
      return;
    }
    
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/shops/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success("Shop deleted successfully");
        setShowDeleteConfirm(null);
        fetchData();
      } else {
        toast.error(data.error || "Failed to delete shop");
      }
    } catch (err) {
      toast.error("Server error during deletion");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/shops/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Shop ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
        fetchData();
      } else {
        toast.error(data.error || "Failed to update status");
      }
    } catch (err) {
      toast.error("Server error");
    }
  };

  const openMapView = (lat: string, lng: string) => {
    if (lat && lng) {
      setMapViewPosition([parseFloat(lat), parseFloat(lng)]);
      setIsMapModalOpen(true);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-gold-500" size={32} /></div>;
  }

  return (
    <div className="p-4 lg:p-8 pt-20 lg:pt-8 w-full max-w-7xl mx-auto min-h-screen pb-24 lg:pb-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-heading text-stone-900 tracking-tight">Shops & Admins</h1>
          <p className="text-stone-500 mt-1 text-sm lg:text-base">Manage all vendors, stores, and administrators.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-black text-gold-500 px-5 py-3 flex items-center justify-center gap-2 rounded-xl font-bold hover:bg-gold-500 hover:text-black transition-all shadow-md active:scale-95 w-full lg:w-auto"
        >
          <Plus size={20} /> Add New Shop
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {shops.map(shop => {
          const shopAdmin = admins.find(a => a.shopId === shop.id);
          const isMainStore = shop.id === 'main_store';
          
          return (
            <motion.div 
              key={shop.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-2xl border ${shop.status === 'inactive' ? 'border-red-200' : 'border-stone-200'} shadow-sm overflow-hidden flex flex-col`}
            >
              <div className="p-5 lg:p-6 flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${shop.status === 'inactive' ? 'bg-red-50 text-red-500' : 'bg-gold-500/10 text-gold-600'}`}>
                      <Store size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-stone-900 line-clamp-1">{shop.name}</h3>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block mt-1 ${shop.status === 'inactive' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {shop.status ? shop.status.toUpperCase() : 'ACTIVE'}
                      </span>
                    </div>
                  </div>
                  
                  {isMainStore && (
                    <span className="text-[10px] font-bold bg-black text-gold-500 px-2 py-1 rounded-md text-center">DEFAULT<br/>STORE</span>
                  )}
                </div>
                
                <div className="space-y-2.5 text-sm text-stone-600 mb-5 flex-1">
                  <p className="flex items-start gap-2"><MapPin size={16} className="text-stone-400 mt-0.5 flex-shrink-0" /> <span className="line-clamp-2">{shop.address || 'No address provided'}</span></p>
                  <p className="flex items-start gap-2"><FileText size={16} className="text-stone-400 mt-0.5 flex-shrink-0" /> <span className="line-clamp-2">{shop.description || 'No description'}</span></p>
                </div>

                <div className="pt-4 border-t border-stone-100">
                  <h4 className="font-semibold text-stone-900 mb-3 flex items-center gap-2"><ShieldAlert size={16} /> Assigned Admin</h4>
                  {shopAdmin ? (
                    <div className="space-y-2 text-sm text-stone-600">
                      <p className="flex items-center gap-2"><User size={16} className="text-stone-400 flex-shrink-0" /> <span className="truncate">{shopAdmin.username}</span></p>
                      <p className="flex items-center gap-2"><Phone size={16} className="text-stone-400 flex-shrink-0" /> {shopAdmin.phone}</p>
                      <p className="flex items-center gap-2"><Mail size={16} className="text-stone-400 flex-shrink-0" /> <span className="truncate">{shopAdmin.email}</span></p>
                    </div>
                  ) : (
                    <p className="text-red-500 text-sm font-medium">No admin assigned</p>
                  )}
                </div>
              </div>
              
              <div className="bg-stone-50 border-t border-stone-100 p-3 flex items-center justify-between gap-2 overflow-x-auto hide-scrollbar">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => openModal(shop)}
                    className="p-2 bg-white border border-stone-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1.5 text-sm font-medium whitespace-nowrap shadow-sm"
                  >
                    <Edit2 size={16} /> <span className="hidden sm:inline">Edit</span>
                  </button>
                  {shop.latitude && shop.longitude && (
                    <button 
                      onClick={() => openMapView(shop.latitude, shop.longitude)}
                      className="p-2 bg-white border border-stone-200 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-1.5 text-sm font-medium whitespace-nowrap shadow-sm"
                    >
                      <MapIcon size={16} /> <span className="hidden sm:inline">Map</span>
                    </button>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => toggleStatus(shop.id, shop.status || 'active')}
                    title={shop.status === 'inactive' ? 'Activate Shop' : 'Deactivate Shop'}
                    className={`p-2 bg-white border border-stone-200 rounded-lg transition-colors flex items-center justify-center shadow-sm ${shop.status === 'inactive' ? 'text-green-600 hover:bg-green-50' : 'text-orange-500 hover:bg-orange-50'}`}
                  >
                    {shop.status === 'inactive' ? <Power size={16} /> : <PowerOff size={16} />}
                  </button>
                  
                  {!isMainStore && (
                    <button 
                      onClick={() => setShowDeleteConfirm(shop.id)}
                      className="p-2 bg-white border border-stone-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center shadow-sm"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto pt-safe pb-safe">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] my-auto"
            >
              <div className="px-5 py-4 border-b border-stone-200 flex justify-between items-center bg-stone-50 rounded-t-2xl sm:rounded-t-3xl shrink-0 sticky top-0 z-10">
                <h2 className="text-lg sm:text-xl font-bold text-stone-900 font-heading">
                  {editingShopId ? 'Edit Shop & Admin' : 'Create New Shop & Admin'}
                </h2>
                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-stone-200 rounded-full transition-colors shrink-0">
                  <X size={20} className="text-stone-500" />
                </button>
              </div>
              
              <div className="overflow-y-auto flex-1 hide-scrollbar">
                <form id="shopForm" onSubmit={handleSaveShop} className="p-5 sm:p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Shop Details */}
                    <div className="space-y-4">
                      <h3 className="font-bold text-stone-900 border-b pb-2 flex items-center gap-2"><Store size={18} className="text-gold-600"/> Shop Details</h3>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Shop Name <span className="text-red-500">*</span></label>
                        <input required type="text" className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-black focus:border-transparent" placeholder="Enter shop name" value={formData.shopName} onChange={e => setFormData({...formData, shopName: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Shop Description</label>
                        <textarea rows={3} className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none" placeholder="Brief description about the shop" value={formData.shopDescription} onChange={e => setFormData({...formData, shopDescription: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Shop Address</label>
                        <div className="flex gap-2">
                          <input type="text" className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-black focus:border-transparent" placeholder="Full street address" value={formData.shopAddress} onChange={e => setFormData({...formData, shopAddress: e.target.value})} />
                          <button type="button" onClick={locateAddressOnMap} disabled={isLocating} className="px-4 py-2 bg-stone-100 border border-stone-200 text-stone-700 rounded-xl hover:bg-stone-200 transition-colors flex items-center justify-center disabled:opacity-50 min-w-[120px]">
                            {isLocating ? <Loader2 size={18} className="animate-spin" /> : <span className="flex items-center gap-1.5"><Search size={16}/> Search</span>}
                          </button>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <label className="block text-sm font-medium text-stone-700 mb-2">Shop Location (Map)</label>
                        <div className="h-[200px] rounded-xl overflow-hidden border border-stone-300 relative z-0">
                          <MapContainer center={mapPosition || defaultLocation} zoom={mapPosition ? 15 : 11} style={{ height: '100%', width: '100%' }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <LocationPicker position={mapPosition} setPosition={setMapPosition} />
                            <MapCenterUpdater position={mapPosition} />
                          </MapContainer>
                        </div>
                        <p className="text-xs text-stone-500 mt-2">Tap on the map to drop a pin for the shop location.</p>
                      </div>
                    </div>

                    {/* Admin Credentials */}
                    <div className="space-y-4">
                      <h3 className="font-bold text-stone-900 border-b pb-2 flex items-center gap-2"><Users size={18} className="text-gold-600"/> Admin Credentials</h3>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Username <span className="text-red-500">*</span></label>
                        <input required type="text" className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-black focus:border-transparent" placeholder="Admin username" value={formData.adminUsername} onChange={e => setFormData({...formData, adminUsername: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Password {editingShopId ? '(Leave blank to keep existing)' : '<span className="text-red-500">*</span>'}</label>
                        <input required={!editingShopId} type="text" className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-black focus:border-transparent" placeholder={editingShopId ? "Enter new password to change" : "Secure password"} value={formData.adminPassword} onChange={e => setFormData({...formData, adminPassword: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Admin Phone (For OTP) <span className="text-red-500">*</span></label>
                        <input required type="tel" className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-black focus:border-transparent" placeholder="e.g. +919876543210" value={formData.adminPhone} onChange={e => setFormData({...formData, adminPhone: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Admin Email <span className="text-red-500">*</span></label>
                        <input required type="email" className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-black focus:border-transparent" placeholder="admin@shop.com" value={formData.adminEmail} onChange={e => setFormData({...formData, adminEmail: e.target.value})} />
                      </div>
                    </div>

                  </div>
                </form>
              </div>

              <div className="p-4 sm:p-5 border-t border-stone-200 bg-white flex justify-end gap-3 shrink-0 rounded-b-2xl sm:rounded-b-3xl sticky bottom-0 z-10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-stone-600 hover:bg-stone-100 transition-colors w-full sm:w-auto">Cancel</button>
                <button type="submit" form="shopForm" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl font-bold bg-black text-gold-500 hover:bg-gold-500 hover:text-black transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[140px] w-full sm:w-auto">
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : (editingShopId ? 'Save Changes' : 'Create Shop & Admin')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldAlert size={32} />
                </div>
                <h2 className="text-xl font-bold text-stone-900 mb-2">Delete this shop?</h2>
                <p className="text-stone-500 text-sm">This action will permanently remove the shop and its associated shop admin data. Are you sure you want to continue?</p>
              </div>
              <div className="flex border-t border-stone-100">
                <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-3.5 font-medium text-stone-600 hover:bg-stone-50 transition-colors border-r border-stone-100">
                  Cancel
                </button>
                <button onClick={() => handleDelete(showDeleteConfirm)} disabled={isDeleting} className="flex-1 py-3.5 font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
                  {isDeleting ? <Loader2 size={18} className="animate-spin" /> : 'Delete Shop'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Map View Modal */}
      <AnimatePresence>
        {isMapModalOpen && mapViewPosition && (
          <div className="fixed inset-0 bg-black/60 z-[105] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col h-[60vh]"
            >
              <div className="px-5 py-3 border-b border-stone-200 flex justify-between items-center bg-stone-50 shrink-0">
                <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2"><MapPin size={18} className="text-gold-600"/> Shop Location</h2>
                <button onClick={() => setIsMapModalOpen(false)} className="p-1.5 hover:bg-stone-200 rounded-full transition-colors">
                  <X size={20} className="text-stone-500" />
                </button>
              </div>
              <div className="flex-1 w-full relative z-0">
                <MapContainer center={mapViewPosition} zoom={15} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={mapViewPosition} />
                </MapContainer>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
