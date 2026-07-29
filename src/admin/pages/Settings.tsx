import React, { useState } from 'react';
import { motion } from 'motion/react';
import { KeyRound, CheckCircle2 } from 'lucide-react';
import { updateSetting } from '../../App';

export default function Settings({ settings, setSettings }: { settings: any, setSettings: any }) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim().length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }
    
    setIsLoading(true);
    setSuccessMsg('');
    try {
      await updateSetting('admin_password', password);
      setSettings((prev: any) => ({ ...prev, admin_password: password }));
      setSuccessMsg('Password updated successfully!');
      setPassword('');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error(error);
      alert("Failed to update password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-heading text-stone-900">Settings</h1>
        <p className="text-sm font-medium text-stone-500 mt-1">Configure your store preferences and security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <h2 className="text-lg font-bold text-stone-900 mb-2">Security</h2>
          <p className="text-sm text-stone-500">Update your administrator password. Make sure it's secure.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 bg-white rounded-2xl border border-stone-200 shadow-sm p-6"
        >
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100">
            <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center">
              <KeyRound className="text-gold-600" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-stone-900">Change Admin Password</h3>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">New Password</label>
              <input 
                type="text" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password (min. 6 characters)"
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-gold-500 focus:border-gold-500 outline-none transition-all"
                required
              />
            </div>
            
            <div className="flex items-center gap-4 mt-6">
              <button 
                type="submit" 
                disabled={isLoading}
                className="px-6 py-2.5 bg-black text-gold-500 font-bold rounded-xl hover:bg-gold-500 hover:text-black transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Update Password'}
              </button>
              
              {successMsg && (
                <span className="flex items-center gap-2 text-sm font-bold text-green-600">
                  <CheckCircle2 size={16} />
                  {successMsg}
                </span>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
