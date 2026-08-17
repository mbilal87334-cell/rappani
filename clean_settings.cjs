const fs = require('fs');
let content = fs.readFileSync('src/admin/pages/Settings.tsx', 'utf8');

// Replace the entire Store Info section with an empty string
// We will just do a regex or substring replacement. Actually, it's easier to just overwrite Settings.tsx cleanly.

const newSettingsContent = `import React, { useState, useEffect } from 'react';
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
        headers: { 'Authorization': \`Bearer \${token}\` }
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
          'Authorization': \`Bearer \${token}\`
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
          'Authorization': \`Bearer \${token}\`
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
        <p className="text-sm font-medium text-gray-500 mt-1">Manage your account login credentials.</p>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-black text-gold-500 flex items-center justify-center mb-4">
            <User size={40} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">{profile.username}</h2>
          
          <div className="mt-2 flex items-center gap-2">
            <span className={\`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 \${profile.role === 'superadmin' ? 'bg-purple-50 text-purple-600' : 'bg-green-50 text-green-600'}\`}>
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

        {/* Login Credentials Form */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-stone-50">
            <KeyRound className="text-stone-500" size={20} />
            <h3 className="font-semibold text-gray-900">Login Credentials</h3>
          </div>
          <div className="p-6 space-y-8">
            <form onSubmit={handleSaveEmail}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Admin Email Address</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className="w-full pl-11 pr-4 py-2.5 bg-stone-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all text-sm" placeholder="Enter your email" required />
                </div>
                <button type="submit" disabled={isSavingEmail} className="bg-black text-gold-500 px-6 py-2.5 rounded-xl font-bold hover:bg-gold-500 hover:text-black transition-all whitespace-nowrap min-w-[120px] flex items-center justify-center">
                  {isSavingEmail ? <Loader2 size={18} className="animate-spin" /> : 'Update Email'}
                </button>
              </div>
            </form>
            
            <div className="h-px bg-gray-100"></div>

            <form onSubmit={handleSavePassword}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Change Password</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-gray-400" />
                  </div>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full pl-11 pr-4 py-2.5 bg-stone-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all text-sm" placeholder="Enter new password" required minLength={6} />
                </div>
                <button type="submit" disabled={isSavingPassword} className="bg-black text-gold-500 px-6 py-2.5 rounded-xl font-bold hover:bg-gold-500 hover:text-black transition-all whitespace-nowrap min-w-[120px] flex items-center justify-center">
                  {isSavingPassword ? <Loader2 size={18} className="animate-spin" /> : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/admin/pages/Settings.tsx', newSettingsContent);
console.log("Cleaned up Settings.tsx successfully.");
