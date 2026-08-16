import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import AdminLayout from './AdminLayout';
import Dashboard from './pages/Dashboard';
import ProductManager from './pages/ProductManager';
import OrderManager from './pages/OrderManager';
import PlaceholderPage from './pages/PlaceholderPage';
import SettingsPage from './pages/Settings';
import { Product, Order } from '../App';
import { motion } from 'motion/react';
import { Lock } from 'lucide-react';

import CategoriesManager from './pages/CategoriesManager';
import CustomersList from './pages/CustomersList';
import RevenueDashboard from './pages/RevenueDashboard';
import TransactionsLedger from './pages/TransactionsLedger';
import WebsiteSettings from './pages/WebsiteSettings';
import ReportsHub from './pages/ReportsHub';
import ReviewManager from './pages/ReviewManager';
import CouponManager from './pages/CouponManager';
import NotificationHub from './pages/NotificationHub';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import WhatsAppManager from './pages/WhatsAppManager';
import ShopsManager from './pages/ShopsManager';
import CategoryManager from './pages/CategoryManager';
import ShopProfile from './pages/ShopProfile';

export default function AdminApp({ 
  orders, products, setProducts, settings, setSettings, apiCategories, setApiCategories, fetchError 
}: { 
  orders: any[], 
  products: Product[], 
  setProducts: any, 
  settings: any, 
  setSettings: any, 
  apiCategories: any[], 
  setApiCategories: any,
  fetchError?: string | null
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('rappani_admin_auth') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('rappani_admin_auth', isAuthenticated.toString());
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    const actualPassword = settings.admin_password || 'rappani123';
    const actualPhone = settings.admin_phone || '9876543210';
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} actualPassword={actualPassword} actualPhone={actualPhone} />;
  }

  return (
    <AdminLayout setIsAuthenticated={setIsAuthenticated}>
      <Routes>
        <Route path="/" element={<Dashboard orders={orders} products={products} fetchError={fetchError} />} />
        <Route path="/products" element={<ProductManager products={products} setProducts={setProducts} apiCategories={apiCategories} />} />
        <Route path="/orders" element={<OrderManager orders={orders} />} />
        
        {/* Fully Implemented Premium UIs */}
        <Route path="/shops" element={<ShopsManager />} />
        <Route path="/categories" element={<CategoryManager products={products} />} />
        <Route path="/legacy-categories" element={<CategoriesManager apiCategories={apiCategories} setApiCategories={setApiCategories} products={products} />} />
        <Route path="/customers" element={<CustomersList orders={orders} />} />
        <Route path="/revenue" element={<RevenueDashboard orders={orders} />} />
        <Route path="/transactions" element={<TransactionsLedger orders={orders} />} />
        <Route path="/whatsapp" element={<WhatsAppManager />} />
        <Route path="/settings" element={<WebsiteSettings settings={settings} setSettings={setSettings} />} />
        <Route path="/reports" element={<ReportsHub orders={orders} products={products} />} />
        
        {/* Remaining Modules */}
        <Route path="/coupons" element={<CouponManager />} />
        <Route path="/reviews" element={<ReviewManager />} />
        <Route path="/notifications" element={<NotificationHub />} />
        <Route path="/analytics" element={<AnalyticsDashboard orders={orders} products={products} />} />
        
        <Route path="/shop-profile" element={<ShopProfile />} />
        <Route path="/profile" element={<SettingsPage settings={settings} setSettings={setSettings} />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
}

function AdminLogin({ onLogin, actualPassword, actualPhone }: { onLogin: () => void, actualPassword: string, actualPhone: string }) {
  const [step, setStep] = useState<'login' | 'otp'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpToken, setOtpToken] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(120);
  const [isLoading, setIsLoading] = useState(false);

  const otpInputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let timer: any;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      // Pass the username to the new multi-admin auth endpoint.
      // (The backend will lookup the user by username/phone/email)
      const payload = { username, password };
      
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success && data.requireOtp) {
        setOtpToken(data.otpToken);
        setStep('otp');
        setCountdown(300);
      } else if (data.success) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('rappani_admin_auth', 'true');
        window.location.reload();
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Server error during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otpToken, otp: enteredOtp })
      });
      
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('rappani_admin_auth', 'true');
        window.location.reload();
      } else {
        setError(data.error || 'Invalid OTP. Please try again.');
        if (data.error?.includes('expired') || data.error?.includes('Too many failed')) {
          setTimeout(() => setStep('login'), 3000);
        }
      }
    } catch (err) {
      setError('Server error during verification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otpToken })
      });
      
      const data = await res.json();
      if (data.success) {
        setCountdown(300);
        setOtp(['', '', '', '', '', '']);
        otpInputRefs.current[0]?.focus();
      } else {
        setError(data.error || 'Failed to resend OTP');
      }
    } catch (err) {
      setError('Server error during resend');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value && isNaN(Number(value))) return;
    
    // Allow single digit
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value !== '' && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      const focusIndex = Math.min(pastedData.length, 5);
      if (focusIndex < 6) otpInputRefs.current[focusIndex]?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-8 rounded-3xl border border-stone-200 shadow-[0_8px_30px_rgba(0,0,0,0.05)] text-center"
      >
        <div className="w-16 h-16 mx-auto bg-black rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-black/20">
          <Lock className="text-gold-500" size={32} />
        </div>
        
        {step === 'login' ? (
          <>
            <h1 className="text-2xl font-bold font-heading text-stone-900 mb-2">Admin Portal</h1>
            <p className="text-stone-500 text-sm mb-8">Please enter your credentials to access the premium dashboard.</p>
            
            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Username / Phone</label>
                <input 
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(''); }}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-gold-500 focus:border-gold-500 outline-none transition-all"
                  placeholder="Enter username or phone"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Password</label>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-gold-500 focus:border-gold-500 outline-none transition-all"
                  placeholder="Enter password"
                  disabled={isLoading}
                />
              </div>
              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-3.5 bg-black text-gold-500 font-bold rounded-xl hover:bg-gold-500 hover:text-black transition-all shadow-md shadow-gold-500/20 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isLoading ? <div className="w-5 h-5 border-2 border-gold-500 border-t-transparent rounded-full animate-spin"></div> : "Authenticate"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold font-heading text-stone-900 mb-2">Verify Your Identity</h1>
            <p className="text-stone-500 text-sm mb-8">We've sent a 6-digit OTP securely to authenticate your login.</p>
            
            <form onSubmit={handleVerifyOtp} className="space-y-6 text-left">
              <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => otpInputRefs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(index, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(index, e)}
                    disabled={isLoading}
                    className="w-12 h-14 text-center text-xl font-bold bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-all text-stone-900"
                  />
                ))}
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-500 font-medium">Time remaining: <span className="text-stone-900 font-mono">{formatTime(countdown)}</span></span>
                <button 
                  type="button" 
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || isLoading}
                  className="font-bold text-black hover:text-gold-600 disabled:text-stone-300 transition-colors"
                >
                  Resend OTP
                </button>
              </div>

              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
              
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-3.5 bg-black text-gold-500 font-bold rounded-xl hover:bg-gold-500 hover:text-black transition-all shadow-md shadow-gold-500/20 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isLoading ? <div className="w-5 h-5 border-2 border-gold-500 border-t-transparent rounded-full animate-spin"></div> : "Verify OTP"}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
