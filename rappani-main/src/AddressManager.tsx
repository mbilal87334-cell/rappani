import React, { useState } from 'react';
import { Plus, Edit, Trash2, MapPin, CheckCircle2, Home, Briefcase, Map } from 'lucide-react';
import AddressFormModal from './AddressFormModal';
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

interface AddressManagerProps {
  addresses: Address[];
  onUpdateAddresses: (newAddresses: Address[]) => void;
}

export default function AddressManager({ addresses, onUpdateAddresses }: AddressManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const handleSave = (address: Address) => {
    let updated = [...addresses];
    
    // If setting as default, remove default from others
    if (address.isDefault) {
      updated = updated.map(a => ({ ...a, isDefault: false }));
    }

    if (address.id) {
      // Edit existing
      updated = updated.map(a => a.id === address.id ? address : a);
    } else {
      // Add new
      const newAddress = { ...address, id: Math.random().toString(36).substr(2, 9) };
      // If first address, make it default
      if (updated.length === 0) newAddress.isDefault = true;
      updated.push(newAddress);
    }

    onUpdateAddresses(updated);
    setIsModalOpen(false);
    setEditingAddress(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      const updated = addresses.filter(a => a.id !== id);
      if (updated.length > 0 && !updated.find(a => a.isDefault)) {
        updated[0].isDefault = true;
      }
      onUpdateAddresses(updated);
      toast.success("Address deleted!");
    }
  };

  const handleSetDefault = (id: string) => {
    const updated = addresses.map(a => ({ ...a, isDefault: a.id === id }));
    onUpdateAddresses(updated);
    toast.success("Default address updated!");
  };

  const getIcon = (type: string) => {
    if (type === 'Home') return <Home className="w-4 h-4" />;
    if (type === 'Work') return <Briefcase className="w-4 h-4" />;
    return <Map className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-neutral-800">Saved Addresses</h2>
        <button 
          onClick={() => { setEditingAddress(null); setIsModalOpen(true); }}
          className="bg-black text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-neutral-800 transition shadow-md shadow-black/10"
        >
          <Plus className="w-4 h-4" /> Add New
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.length === 0 ? (
          <div className="col-span-full py-12 bg-neutral-50 rounded-2xl border border-dashed border-neutral-300 flex flex-col items-center justify-center text-neutral-400">
            <MapPin className="w-12 h-12 mb-3 opacity-50" />
            <p className="font-bold text-neutral-600">No addresses saved yet.</p>
            <p className="text-sm">Add a delivery location to checkout faster.</p>
          </div>
        ) : (
          addresses.map((address) => (
            <div key={address.id} className={`relative p-5 rounded-2xl border transition-all ${address.isDefault ? 'bg-gold-50/50 border-gold-300 shadow-sm shadow-gold-500/10' : 'bg-white border-neutral-200 hover:border-neutral-300 hover:shadow-sm'}`}>
              
              {address.isDefault && (
                <div className="absolute top-0 right-0 bg-gold-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl rounded-tr-2xl flex items-center gap-1 shadow-sm shadow-gold-500/30">
                  <CheckCircle2 className="w-3 h-3" /> Default
                </div>
              )}

              <div className="flex items-center gap-2 mb-3">
                <div className="bg-neutral-100 text-neutral-600 p-1.5 rounded-lg">
                  {getIcon(address.addressType)}
                </div>
                <h3 className="font-bold text-neutral-800">{address.addressType}</h3>
              </div>

              <div className="space-y-1 mb-4">
                <p className="font-bold text-sm text-neutral-800">{address.fullName} <span className="font-normal text-neutral-500 ml-2">{address.mobile}</span></p>
                <p className="text-sm text-neutral-600 line-clamp-2">
                  {address.houseNo}, {address.street}
                  {address.landmark && `, Near ${address.landmark}`}
                </p>
                <p className="text-sm text-neutral-600">
                  {address.city}, {address.district}, {address.state} - <span className="font-bold text-neutral-800">{address.pincode}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-neutral-100/60 mt-auto">
                <button onClick={() => { setEditingAddress(address); setIsModalOpen(true); }} className="flex-1 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-lg transition flex items-center justify-center gap-1">
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => handleDelete(address.id!)} className="flex-1 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition flex items-center justify-center gap-1">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
                {!address.isDefault && (
                  <button onClick={() => handleSetDefault(address.id!)} className="flex-1 py-2 text-xs font-bold text-gold-600 hover:bg-gold-50 rounded-lg transition border border-gold-200/50">
                    Set Default
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <AddressFormModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingAddress(null); }}
        onSave={handleSave}
        initialData={editingAddress}
      />
    </div>
  );
}
