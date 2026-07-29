import React, { useState, useEffect } from 'react';
import { User, KeyRound, Mail, Save } from 'lucide-react';
import { updateSetting } from '../../App';

export default function Settings({ settings, setSettings }: { settings: any, setSettings: any }) {
  const [adminEmail, setAdminEmail] = useState(settings.admin_email || 'admin@rappani.in');

  useEffect(() => {
    if (settings.admin_email) {
      setAdminEmail(settings.admin_email);
    }
  }, [settings.admin_email]);

  const handleSendReset = (e: React.MouseEvent) => {
    e.preventDefault();
    alert(`Password reset link sent to ${adminEmail}`);
  };

  const handleSaveEmail = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await updateSetting('admin_email', adminEmail);
      setSettings({ ...settings, admin_email: adminEmail });
      alert('Email updated permanently in the database!');
    } catch (err) {
      console.error(err);
      alert('Failed to update email. Please try again.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Profile</h1>
        <p className="text-sm font-medium text-gray-500 mt-1">Manage your account settings and security.</p>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gray-900 text-white flex items-center justify-center mb-4">
            <User size={40} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Store Admin</h2>
          <div className="mt-2 px-3 py-1 bg-green-50 text-green-600 text-xs font-semibold rounded-full flex items-center gap-1.5 w-max">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            Super Admin
          </div>
        </div>

        {/* Security & Login Card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6 text-gray-900 font-semibold text-lg">
            <KeyRound size={20} className="text-gray-500" />
            Security & Login
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Registered Email Address</h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus-within:ring-2 focus-within:ring-gray-900 focus-within:border-gray-900 transition-all">
                <Mail size={18} className="text-gray-400" />
                <input 
                  type="email" 
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-gray-800 outline-none"
                />
              </div>
              <button 
                onClick={handleSaveEmail}
                className="flex items-center justify-center gap-2 bg-gray-900 text-white text-sm font-medium rounded-lg px-4 py-3 hover:bg-gray-800 transition-colors shadow-sm whitespace-nowrap"
              >
                <Save size={16} />
                Save 
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              This email is used for logging into the admin dashboard.
            </p>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Change Password</h3>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
              For security reasons, password changes are handled via a secure email link. Click the button below to receive a password reset email.
            </p>
            <button 
              onClick={handleSendReset}
              className="bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md px-4 py-2 hover:bg-gray-50 transition-colors shadow-sm"
            >
              Send Reset Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
