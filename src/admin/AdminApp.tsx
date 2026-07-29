import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import Dashboard from './pages/Dashboard';
import ProductManager from './pages/ProductManager';
import OrderManager from './pages/OrderManager';
import PlaceholderPage from './pages/PlaceholderPage';
import { Product, Order } from '../App';
import { motion } from 'motion/react';
import { Lock } from 'lucide-react';

export default function AdminApp({ 
  products, setProducts, settings, setSettings 
}: { 
  products: Product[], 
  setProducts: any, 
  settings: any, 
  setSettings: any 
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('rappani_admin_auth') === 'true';
  });

  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    localStorage.setItem('rappani_admin_auth', isAuthenticated.toString());
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      // Mock fetch orders for now, or you can import fetchOrders from App.tsx if exported
      // In a real app, we'd fetch this from the API
      fetch('/api/orders')
        .then(res => res.json())
        .then(data => setOrders(data))
        .catch(err => console.error(err));
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <AdminLayout setIsAuthenticated={setIsAuthenticated}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<ProductManager products={products} setProducts={setProducts} />} />
        <Route path="/orders" element={<OrderManager orders={orders} />} />
        
        {/* Placeholder Routes */}
        <Route path="/customers" element={<PlaceholderPage title="Customer Management" description="Advanced CRM features to track customer lifetime value and engagement." />} />
        <Route path="/categories" element={<PlaceholderPage title="Category Management" description="Organize your store hierarchy and category banners." />} />
        <Route path="/banners" element={<PlaceholderPage title="Banner Management" description="Manage homepage sliders and promotional banners." />} />
        <Route path="/coupons" element={<PlaceholderPage title="Coupons & Discounts" description="Create and track promotional codes and discount rules." />} />
        <Route path="/inventory" element={<PlaceholderPage title="Inventory Management" description="Track stock levels, set low-stock alerts, and manage suppliers." />} />
        <Route path="/sales" element={<PlaceholderPage title="Sales Analytics" description="Deep dive into sales reports, revenue tracking, and conversion rates." />} />
        <Route path="/settings" element={<PlaceholderPage title="Store Settings" description="Configure global store preferences, shipping rates, and tax rules." />} />
        <Route path="/roles" element={<PlaceholderPage title="Roles & Permissions" description="Manage staff accounts and their access levels." />} />
        <Route path="/activity" element={<PlaceholderPage title="Activity Logs" description="Track all actions performed by staff in the admin panel." />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
}

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'rappani123') { // Basic mock authentication
      onLogin();
    } else {
      setError('Invalid password. Please try again.');
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
        <h1 className="text-2xl font-bold font-heading text-stone-900 mb-2">Admin Portal</h1>
        <p className="text-stone-500 text-sm mb-8">Please enter your credentials to access the premium dashboard.</p>
        
        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1">Password</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-gold-500 focus:border-gold-500 outline-none transition-all"
              placeholder="Enter password"
            />
          </div>
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
          <button type="submit" className="w-full py-3.5 bg-black text-gold-500 font-bold rounded-xl hover:bg-gold-500 hover:text-black transition-all shadow-md shadow-gold-500/20 active:scale-95">
            Authenticate
          </button>
        </form>
      </motion.div>
    </div>
  );
}
