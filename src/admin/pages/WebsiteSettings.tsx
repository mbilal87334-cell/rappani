import React from 'react';
import { Save, Store, Globe, MapPin, Phone } from 'lucide-react';

export default function WebsiteSettings() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Settings saved successfully!');
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
                <input type="text" defaultValue="Rappani Store" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Store Tagline</label>
                <input type="text" defaultValue="Premium Stationery & Fancy Items" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all text-sm" />
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
                <input type="text" defaultValue="+91 87547 50013" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                <input type="email" defaultValue="admin@rappani.in" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Physical Address</label>
                <textarea rows={3} defaultValue="Rappani Store, Main Street, TN, India" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all text-sm resize-none"></textarea>
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
              <textarea rows={2} defaultValue="Discover a wide range of premium stationery, beautiful gifts, and fancy items for all your needs." className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all text-sm resize-none"></textarea>
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
    </div>
  );
}
