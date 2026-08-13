import React, { useState, useEffect } from 'react';
import { User, KeyRound, Mail, Store, Phone, ShieldAlert, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Settings({ settings, setSettings }: any) {
  const [profile, setProfile] = useState<any>(null);
  const [shop, setShop] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [adminEmail, setAdminEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.admin);
        setShop(data.shop);
        setAdminEmail(data.admin.email || '');
      }
    } catch (err) {
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingEmail(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: adminEmail })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Email updated successfully!');
        setProfile(data.admin);
      } else {
        toast.error(data.error || 'Failed to update email');
      }
    } catch (err) {
      toast.error('Server error');
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      toast.error('Please enter a valid password.');
      return;
    }
    setIsSavingPassword(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: newPassword })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Password updated successfully!');
        setNewPassword('');
      } else {
        toast.error(data.error || 'Failed to update password');
      }
    } catch (err) {
      toast.error('Server error');
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-gold-500" size={32} /></div>;
  }

  if (!profile) {
    return <div className="p-8 text-center text-stone-500">Could not load profile.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto pb-10 p-4 lg:p-8 pt-20 lg:pt-8 w-full min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight font-heading">My Profile</h1>
        <p className="text-sm font-medium text-gray-500 mt-1">Manage your account settings and security.</p>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-black text-gold-500 flex items-center justify-center mb-4">
            <User size={40} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">{profile.username}</h2>
          
          <div className="mt-2 flex items-center gap-2">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 ${profile.role === 'superadmin' ? 'bg-purple-50 text-purple-600' : 'bg-green-50 text-green-600'}`}>
              <ShieldAlert size={12} />
              {profile.role === 'superadmin' ? 'Super Admin' : 'Shop Admin'}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-stone-600 w-full max-w-md">
            <div className="flex items-center gap-2 bg-stone-50 px-4 py-2 rounded-lg w-full sm:w-auto flex-1 justify-center">
              <Phone size={16} className="text-stone-400" />
              {profile.phone}
            </div>
            {shop && (
              <div className="flex items-center gap-2 bg-stone-50 px-4 py-2 rounded-lg w-full sm:w-auto flex-1 justify-center">
                <Store size={16} className="text-stone-400" />
                {shop.name}
              </div>
            )}
          </div>
        </div>

        {/* Change Email */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-stone-50">
            <Mail className="text-stone-500" size={20} />
            <h3 className="font-semibold text-gray-900">Email Address</h3>
          </div>
          <form onSubmit={handleSaveEmail} className="p-6">
            <p className="text-sm text-gray-500 mb-4">Update your email address for notifications and account recovery.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                placeholder="admin@example.com"
                required
              />
              <button 
                type="submit" 
                disabled={isSavingEmail}
                className="px-6 py-2.5 bg-black text-gold-500 rounded-xl font-medium hover:bg-gold-500 hover:text-black transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSavingEmail ? <Loader2 size={18} className="animate-spin" /> : 'Update Email'}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-stone-50">
            <KeyRound className="text-stone-500" size={20} />
            <h3 className="font-semibold text-gray-900">Change Password</h3>
          </div>
          <form onSubmit={handleSavePassword} className="p-6">
            <p className="text-sm text-gray-500 mb-4">Set a new password for your admin account.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                placeholder="Enter new password"
                required
              />
              <button 
                type="submit" 
                disabled={isSavingPassword}
                className="px-6 py-2.5 bg-black text-gold-500 rounded-xl font-medium hover:bg-gold-500 hover:text-black transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSavingPassword ? <Loader2 size={18} className="animate-spin" /> : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
