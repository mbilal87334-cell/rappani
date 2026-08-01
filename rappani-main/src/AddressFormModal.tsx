import React, { useState, useEffect } from 'react';
import { X, MapPin, Search, Navigation } from 'lucide-react';
import { getCountries, getStates, getDistricts, getCities } from './utils/indiaData';
import LocationMap from './LocationMap';
import toast from 'react-hot-toast';

interface Address {
  id?: string;
  fullName: string;
  mobile: string;
  altMobile: string;
  houseNo: string;
  street: string;
  landmark: string;
  country: string;
  state: string;
  district: string;
  city: string;
  pincode: string;
  addressType: string;
  isDefault: boolean;
  lat?: number;
  lng?: number;
}

interface AddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: Address) => void;
  initialData?: Address | null;
}

export default function AddressFormModal({ isOpen, onClose, onSave, initialData }: AddressFormModalProps) {
  const [formData, setFormData] = useState<Address>({
    fullName: '', mobile: '', altMobile: '', houseNo: '', street: '', landmark: '',
    country: 'India', state: '', district: '', city: '', pincode: '', addressType: 'Home', isDefault: false
  });
  
  const [showMap, setShowMap] = useState(false);
  const [isFetchingPincode, setIsFetchingPincode] = useState(false);

  const countries = getCountries();
  const states = getStates(formData.country);
  const districts = getDistricts(formData.country, formData.state);
  const cities = getCities(formData.country, formData.state, formData.district);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        fullName: '', mobile: '', altMobile: '', houseNo: '', street: '', landmark: '',
        country: 'India', state: '', district: '', city: '', pincode: '', addressType: 'Home', isDefault: false
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      // Reset dependent fields if parent changes
      ...(name === 'country' && { state: '', district: '', city: '' }),
      ...(name === 'state' && { district: '', city: '' }),
      ...(name === 'district' && { city: '' })
    }));
  };

  const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const pin = e.target.value.replace(/\D/g, '').slice(0, 6);
    setFormData(prev => ({ ...prev, pincode: pin }));
    
    if (pin.length === 6) {
      setIsFetchingPincode(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const data = await res.json();
        if (data && data[0].Status === "Success") {
          const postOffice = data[0].PostOffice[0];
          setFormData(prev => ({
            ...prev,
            state: postOffice.State || prev.state,
            district: postOffice.District || prev.district,
            city: postOffice.Name || prev.city
          }));
          toast.success("Location auto-filled from pincode!");
        } else {
          toast.error("Invalid pincode or not found.");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsFetchingPincode(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || formData.mobile.length !== 10 || !formData.houseNo || !formData.street || !formData.state || !formData.city || formData.pincode.length !== 6) {
      toast.error("Please fill all required fields correctly.");
      return;
    }
    onSave(formData);
  };

  if (!isOpen) return null;

  if (showMap) {
    return (
      <div className="fixed inset-0 z-[100] bg-white flex flex-col">
         <LocationMap 
           onCancel={() => setShowMap(false)}
           onConfirm={(addressStr, lat, lng) => {
             // Basic parsing of addressStr could go here if we used reverse geocoding fully.
             // For now, just set street and coords.
             setFormData(prev => ({ ...prev, street: addressStr || prev.street, lat, lng }));
             setShowMap(false);
             toast.success("Location pinned successfully!");
           }}
         />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative my-8" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-neutral-100 p-4 flex justify-between items-center rounded-t-2xl z-10">
          <h2 className="text-xl font-bold text-neutral-800">{initialData ? 'Edit Address' : 'Add New Address'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Map Pinning Section */}
          <div className="bg-gold-50 p-4 rounded-xl border border-gold-200 flex items-center justify-between cursor-pointer hover:bg-gold-100 transition" onClick={() => setShowMap(true)}>
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-full shadow-sm text-gold-600"><MapPin className="w-5 h-5" /></div>
              <div>
                <p className="font-bold text-neutral-800 text-sm">Use Current Location</p>
                <p className="text-xs text-neutral-500">Auto-fill address using Google Maps / GPS</p>
              </div>
            </div>
            <Navigation className="w-5 h-5 text-gold-600" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Full Name *</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full bg-stone-50 border border-neutral-200 rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50" placeholder="John Doe" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Mobile Number *</label>
              <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} maxLength={10} className="w-full bg-stone-50 border border-neutral-200 rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50" placeholder="10-digit mobile number" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Pincode *</label>
              <div className="relative">
                <input type="text" name="pincode" value={formData.pincode} onChange={handlePincodeChange} maxLength={6} className="w-full bg-stone-50 border border-neutral-200 rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50" placeholder="6-digit pincode" required />
                {isFetchingPincode && <div className="absolute right-3 top-3 w-4 h-4 border-2 border-gold-500 border-t-transparent rounded-full animate-spin"></div>}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Alternate Mobile (Optional)</label>
              <input type="tel" name="altMobile" value={formData.altMobile} onChange={handleChange} maxLength={10} className="w-full bg-stone-50 border border-neutral-200 rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50" placeholder="Alternate number" />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">House No / Flat / Building *</label>
              <input type="text" name="houseNo" value={formData.houseNo} onChange={handleChange} className="w-full bg-stone-50 border border-neutral-200 rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50" placeholder="e.g. Flat 4B, XYZ Apartments" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Street / Area / Locality *</label>
              <input type="text" name="street" value={formData.street} onChange={handleChange} className="w-full bg-stone-50 border border-neutral-200 rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50" placeholder="e.g. Main Street, Anna Nagar" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Landmark (Optional)</label>
              <input type="text" name="landmark" value={formData.landmark} onChange={handleChange} className="w-full bg-stone-50 border border-neutral-200 rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50" placeholder="e.g. Near Apollo Hospital" />
            </div>

            {/* Dropdowns */}
            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Country *</label>
              <select name="country" value={formData.country} onChange={handleChange} className="w-full bg-stone-50 border border-neutral-200 rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50" required>
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">State *</label>
              <select name="state" value={formData.state} onChange={handleChange} className="w-full bg-stone-50 border border-neutral-200 rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50" required>
                <option value="">Select State</option>
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">District *</label>
              <select name="district" value={formData.district} onChange={handleChange} className="w-full bg-stone-50 border border-neutral-200 rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50" required>
                <option value="">Select District</option>
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">City / Town *</label>
              <select name="city" value={formData.city} onChange={handleChange} className="w-full bg-stone-50 border border-neutral-200 rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50" required>
                <option value="">Select City</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Address Type</label>
            <div className="flex gap-4">
              {['Home', 'Work', 'Other'].map(type => (
                <label key={type} className={`flex-1 py-2 px-4 rounded-xl border text-center cursor-pointer transition ${formData.addressType === type ? 'border-gold-500 bg-gold-50 text-gold-700 font-bold' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}>
                  <input type="radio" name="addressType" value={type} checked={formData.addressType === type} onChange={handleChange} className="hidden" />
                  {type}
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer mt-4">
            <input type="checkbox" name="isDefault" checked={formData.isDefault} onChange={handleChange} className="w-4 h-4 text-gold-600 rounded focus:ring-gold-500" />
            <span className="text-sm font-medium text-neutral-700">Make this my default address</span>
          </label>

          <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t border-neutral-100 flex gap-3 mt-6">
             <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition">Cancel</button>
             <button type="submit" className="flex-1 py-3 rounded-xl font-bold text-white bg-black hover:bg-neutral-800 transition shadow-lg shadow-black/20">Save Address</button>
          </div>
        </form>
      </div>
    </div>
  );
}
