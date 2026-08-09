import React, { useState } from 'react';
import { Save, Store, Globe, MapPin, Phone } from 'lucide-react';
import { updateSetting } from '../../App';
import LocationMap from '../../LocationMap';

export default function WebsiteSettings({ settings, setSettings }: { settings: any, setSettings: any }) {
  const [storeName, setStoreName] = useState(settings.store_name || 'Rappani Store');
  const [storeTagline, setStoreTagline] = useState(settings.store_tagline || 'Premium Stationery & Fancy Items');
  const [adminPhone, setAdminPhone] = useState(settings.admin_phone || '+91 87547 50013');
  const [adminEmail, setAdminEmail] = useState(settings.admin_email || 'admin@rappani.in');
  const [storeAddress, setStoreAddress] = useState(settings.store_address || 'Rappani Store, Main Street, TN, India');
  const [metaDesc, setMetaDesc] = useState(settings.meta_description || 'Discover a wide range of premium stationery, beautiful gifts, and fancy items for all your needs.');
  const [deliveryCharge, setDeliveryCharge] = useState(settings.delivery_charge || '30');
  const [showMap, setShowMap] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSetting('store_name', storeName);
      await updateSetting('store_tagline', storeTagline);
      await updateSetting('admin_phone', adminPhone);
      await updateSetting('admin_email', adminEmail);
      await updateSetting('store_address', storeAddress);
      await updateSetting('meta_description', metaDesc);
      await updateSetting('delivery_charge', deliveryCharge);
      
      setSettings({
        ...settings,
        store_name: storeName,
        store_tagline: storeTagline,
        admin_phone: adminPhone,
        admin_email: adminEmail,
        store_address: storeAddress,
        meta_description: metaDesc,
        delivery_charge: deliveryCharge
      });
      alert('Settings saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save settings. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Website Settings</h1>
        <p className="text-sm font-medium text-gray-500 mt-1">Configure your store details, SEO, and contact information.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store Details */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Store size={18} className="text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Store Details</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Store Name</label>
                <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Store Tagline</label>
                <input type="text" value={storeTagline} onChange={(e) => setStoreTagline(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Home Delivery Charge (?) </label>
                <input type="number" min="0" value={deliveryCharge} onChange={(e) => setDeliveryCharge(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all text-sm" placeholder="e.g. 30" />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Phone size={18} className="text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number (WhatsApp)</label>
                <input type="text" value={adminPhone} onChange={(e) => setAdminPhone(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all text-sm" />
              </div>
              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-semibold text-gray-700">Physical Address</label>
                  <button 
                    type="button" 
                    onClick={() => setShowMap(true)}
                    className="text-xs font-semibold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-md flex items-center gap-1.5 hover:bg-gray-200 transition-colors border border-gray-200"
                  >
                    <MapPin size={12} /> Pick from Map
                  </button>
                </div>
                <textarea rows={3} value={storeAddress} onChange={(e) => setStoreAddress(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all text-sm resize-none"></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* SEO Settings */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Globe size={18} className="text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">SEO & Display</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Meta Description</label>
              <textarea rows={2} value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all text-sm resize-none"></textarea>
              <p className="text-xs text-gray-500 mt-1.5">This description will appear on Google search results.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" className="flex items-center gap-2 bg-gray-900 text-white text-sm font-medium rounded-md px-6 py-2.5 hover:bg-gray-800 transition-colors shadow-sm">
            <Save size={16} />
            Save All Settings
          </button>
        </div>
      </form>

      {showMap && (
        <LocationMap 
          onConfirm={(address) => {
            setStoreAddress(address);
            setShowMap(false);
          }}
          onCancel={() => setShowMap(false)}
        />
      )}
    </div>
  );
}
