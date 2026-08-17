const fs = require('fs');

const content = `import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Store, MapPin, Phone, Mail, Instagram, Clock, CheckCircle, Loader2, Link as LinkIcon, Camera, LayoutTemplate, ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ShopProfile() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [shops, setShops] = useState<any[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string>('');

  const [profile, setProfile] = useState({
    id: '',
    name: '',
    description: '',
    about: '',
    address: '',
    latitude: '',
    longitude: '',
    logo: '',
    banner: '',
    phone: '',
    whatsapp: '',
    email: '',
    instagram: '',
    openingTime: '09:00 AM',
    closingTime: '09:00 PM',
    isOpen: true
  });

  useEffect(() => {
    fetchShops();
  }, []);

  useEffect(() => {
    fetchProfile(selectedShopId);
  }, [selectedShopId]);

  const fetchShops = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/shops', {
        headers: { 'Authorization': \`Bearer \${token}\` }
      });
      const data = await res.json();
      if (data.shops) {
        setShops(data.shops);
      }
    } catch (err) {
      // Not super admin, ignore
    }
  };

  const fetchProfile = async (shopIdToFetch?: string) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      let url = '/api/admin/shop-profile';
      if (shopIdToFetch) {
        url += \`?shopId=\${shopIdToFetch}\`;
      }
      const res = await fetch(url, {
        headers: { 'Authorization': \`Bearer \${token}\` }
      });
      const data = await res.json();
      if (data.success && data.shop) {
        setProfile({
          id: data.shop.id || '',
          name: data.shop.name || '',
          description: data.shop.description || '',
          about: data.shop.about || '',
          address: data.shop.address || '',
          latitude: data.shop.latitude || '',
          longitude: data.shop.longitude || '',
          logo: data.shop.logo || '',
          banner: data.shop.banner || '',
          phone: data.shop.phone || '',
          whatsapp: data.shop.whatsapp || '',
          email: data.shop.email || '',
          instagram: data.shop.instagram || '',
          openingTime: data.shop.openingTime || '09:00 AM',
          closingTime: data.shop.closingTime || '09:00 PM',
          isOpen: data.shop.isOpen ?? true
        });
        if (!selectedShopId) {
          setSelectedShopId(data.shop.id || 'main-shop');
        }
      }
    } catch (err) {
      toast.error('Failed to load shop profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/shop-profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${token}\` 
        },
        body: JSON.stringify({ ...profile, shopId: selectedShopId || profile.id })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Shop profile updated successfully! Changes will reflect immediately.");
      } else {
        toast.error(data.error || "Failed to update profile");
      }
    } catch (err) {
      toast.error("Server error while updating");
    } finally {
      setIsSaving(false);
    }
  };

  const uploadImage = async (field: 'logo' | 'banner', file: File) => {
    const toastId = toast.loading('Uploading image...');
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': \`Bearer \${token}\` },
        body: formData
      });
      const data = await res.json();
      
      if (data.imageUrl) {
        setProfile(prev => ({ ...prev, [field]: data.imageUrl }));
        toast.success('Image uploaded successfully', { id: toastId });
      } else {
        toast.error(data.error || 'Failed to upload image', { id: toastId });
      }
    } catch (error) {
      toast.error('Network error during upload', { id: toastId });
    }
  };

  if (isLoading && !profile.id) {
    return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-gold-500" size={32} /></div>;
  }

  return (
    <div className="p-4 lg:p-8 pt-20 lg:pt-8 w-full max-w-5xl mx-auto min-h-screen pb-24 lg:pb-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-heading text-stone-900 tracking-tight">Shop Profile</h1>
          <p className="text-stone-500 mt-1 text-sm lg:text-base">Manage your store details, branding, and contact information.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
            {shops.length > 0 && (
              <div className="relative">
                <select
                  value={selectedShopId}
                  onChange={(e) => setSelectedShopId(e.target.value)}
                  className="appearance-none bg-white border border-stone-200 text-stone-900 text-sm font-semibold rounded-lg pl-4 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-black shadow-sm cursor-pointer"
                >
                  <option value="main-shop">Main Shop</option>
                  {shops.filter(s => s.id !== 'main-shop').map(shop => (
                    <option key={shop.id} value={shop.id}>{shop.name} ({shop.id})</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
              </div>
            )}
            
            <span className="text-sm font-semibold bg-stone-100 px-3 py-2 rounded-lg border border-stone-200 hidden sm:inline-block">ID: {profile.id}</span>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-black text-gold-500 px-6 py-2.5 rounded-xl font-bold hover:bg-gold-500 hover:text-black transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 min-w-[140px]"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle size={18} /> Save Changes</>}
            </button>
        </div>
      </div>

      {isLoading && profile.id ? (
        <div className="flex justify-center my-10"><Loader2 className="animate-spin text-gold-500" size={32} /></div>
      ) : (
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Branding Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
           <div className="bg-stone-50 border-b border-stone-200 px-6 py-4 flex items-center gap-2">
              <LayoutTemplate className="text-gold-600" size={20} />
              <h2 className="font-bold text-stone-900">Branding & Identity</h2>
           </div>
           <div className="p-6">
              
              {/* Banner Upload */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-stone-700 mb-2">Shop Banner</label>
                <div className="relative w-full h-48 bg-stone-100 rounded-xl border-2 border-dashed border-stone-300 flex items-center justify-center overflow-hidden group">
                  {profile.banner ? (
                    <img src={profile.banner} alt="Banner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-stone-400 flex flex-col items-center">
                       <Camera size={32} className="mb-2" />
                       <span className="text-sm">Upload Banner Image (1200x400)</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="cursor-pointer bg-white text-stone-900 px-4 py-2 rounded-lg font-semibold shadow-md hover:bg-stone-100 transition-colors">
                      Change Banner
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) uploadImage('banner', e.target.files[0]) }} />
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Logo Upload */}
                  <div className="md:col-span-3">
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Shop Logo</label>
                    <div className="relative w-full aspect-square bg-stone-100 rounded-xl border-2 border-dashed border-stone-300 flex items-center justify-center overflow-hidden group">
                      {profile.logo ? (
                        <img src={profile.logo} alt="Logo" className="w-full h-full object-contain p-2 bg-white" />
                      ) : (
                        <div className="text-stone-400 flex flex-col items-center p-4 text-center">
                          <Camera size={24} className="mb-2" />
                          <span className="text-xs">Upload Logo (512x512)</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label className="cursor-pointer bg-white text-stone-900 px-3 py-1.5 rounded-lg font-semibold text-sm shadow-md hover:bg-stone-100 transition-colors text-center">
                          Change
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) uploadImage('logo', e.target.files[0]) }} />
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Name & Desc */}
                  <div className="md:col-span-9 space-y-4">
                     <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1">Shop Name <span className="text-red-500">*</span></label>
                        <input required type="text" className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-black focus:border-transparent" placeholder="Enter shop name" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
                     </div>
                     <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1">Short Description</label>
                        <input type="text" className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-black focus:border-transparent" placeholder="Brief tagline or description" value={profile.description} onChange={e => setProfile({...profile, description: e.target.value})} />
                     </div>
                     <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1">About the Shop</label>
                        <textarea rows={4} className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none" placeholder="Detailed description about your shop's history, products, and services..." value={profile.about} onChange={e => setProfile({...profile, about: e.target.value})} />
                     </div>
                  </div>
              </div>
           </div>
        </div>

        {/* Contact & Location */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
               <div className="bg-stone-50 border-b border-stone-200 px-6 py-4 flex items-center gap-2">
                  <Phone className="text-gold-600" size={20} />
                  <h2 className="font-bold text-stone-900">Contact Details</h2>
               </div>
               <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-5 h-5 text-stone-400" />
                      <input required type="tel" className="w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-black" placeholder="+91 XXXXX XXXXX" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1">WhatsApp Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-5 h-5 text-stone-400" />
                      <input type="tel" className="w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-black" placeholder="+91 XXXXX XXXXX" value={profile.whatsapp} onChange={e => setProfile({...profile, whatsapp: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-5 h-5 text-stone-400" />
                      <input type="email" className="w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-black" placeholder="contact@shop.com" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1">Instagram URL</label>
                    <div className="relative">
                      <Instagram className="absolute left-3 top-3 w-5 h-5 text-stone-400" />
                      <input type="url" className="w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-black" placeholder="https://instagram.com/shopname" value={profile.instagram} onChange={e => setProfile({...profile, instagram: e.target.value})} />
                    </div>
                  </div>
               </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
               <div className="bg-stone-50 border-b border-stone-200 px-6 py-4 flex items-center gap-2">
                  <MapPin className="text-gold-600" size={20} />
                  <h2 className="font-bold text-stone-900">Location & Hours</h2>
               </div>
               <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1">Full Address</label>
                    <textarea rows={3} className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-black resize-none" placeholder="Shop No, Street, City, Pincode" value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-1">Latitude</label>
                      <input type="text" className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-black" placeholder="e.g. 13.0827" value={profile.latitude} onChange={e => setProfile({...profile, latitude: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-1">Longitude</label>
                      <input type="text" className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-black" placeholder="e.g. 80.2707" value={profile.longitude} onChange={e => setProfile({...profile, longitude: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-1">Opening Time</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 w-5 h-5 text-stone-400" />
                        <input type="text" className="w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-black" placeholder="09:00 AM" value={profile.openingTime} onChange={e => setProfile({...profile, openingTime: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-1">Closing Time</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 w-5 h-5 text-stone-400" />
                        <input type="text" className="w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-black" placeholder="09:00 PM" value={profile.closingTime} onChange={e => setProfile({...profile, closingTime: e.target.value})} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={profile.isOpen} onChange={e => setProfile({...profile, isOpen: e.target.checked})} />
                      <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                      <span className="ml-3 text-sm font-bold text-stone-700">Currently Open</span>
                    </label>
                  </div>
               </div>
            </div>
        </div>
      </form>
      )}
    </div>
  );
}
`;

fs.writeFileSync('src/admin/pages/ShopProfile.tsx', content);
console.log("Updated ShopProfile.tsx successfully.");
