import React, { useState } from 'react';
import { useStore } from './context/StoreContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { SEOTags } from './components/seo/SEOTags';
import { WhatsAppButton } from './components/common/WhatsAppButton';
import { ScannerModal } from './components/common/ScannerModal';
import { LoginModal } from './components/auth/LoginModal';
import { motion, AnimatePresence } from 'motion/react';
import Fuse from 'fuse.js';
import { X, Search, Filter } from 'lucide-react';
import { ProductCard } from './components/product/ProductCard';

export const Storefront: React.FC = () => {
  const { 
    settings, 
    cart, 
    searchQuery, 
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    categories,
    products,
    lang
  } = useStore();
  
  const [currentView, setCurrentView] = useState<'home' | 'product' | 'checkout' | 'search'>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  
  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleProductClick = (id: string) => {
    setSelectedProductId(id);
    setCurrentView('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const getCategoryName = (catName: string) => {
    const cat = categories.find(c => c.name === catName);
    if (!cat) return catName;
    if (lang === 'ta' && cat.ta) return cat.ta;
    if (lang === 'en' && cat.en) return cat.en;
    return cat.name;
  };

  const filteredProducts = React.useMemo(() => {
    let result = products.filter(p => p.isVisible !== false);

    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (searchQuery.trim() !== '') {
      const fuse = new Fuse(result, {
        keys: ['name', 'category', 'tags', 'barcode'],
        threshold: 0.3,
      });
      result = fuse.search(searchQuery).map(res => res.item);
    }

    return result;
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col">
      <SEOTags 
        title={settings.storeName || 'Rappani Store'} 
        description="Premium stationary, fancy items, and gifts for every occasion." 
      />

      <Header 
        onOpenCart={() => setIsCartOpen(true)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onOpenAccount={() => setIsAuthOpen(true)}
        onOpenScanner={() => setIsScannerOpen(true)}
        cartItemCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
      />

      <main className="flex-1">
        {currentView === 'home' && !searchQuery && selectedCategory === 'All' && (
          <HomePage 
            onProductClick={handleProductClick} 
            onViewAll={() => setCurrentView('search')} 
          />
        )}

        {(currentView === 'search' || searchQuery || selectedCategory !== 'All') && currentView !== 'product' && currentView !== 'checkout' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <h1 className="text-3xl font-black text-gray-900">
                {searchQuery ? `Search results for "${searchQuery}"` : getCategoryName(selectedCategory)}
              </h1>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map(cat => (
                   <button 
                     key={cat.id || cat.name}
                     onClick={() => setSelectedCategory(cat.name)}
                     className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm border ${selectedCategory === cat.name ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-stone-50'}`}
                   >
                     {getCategoryName(cat.name)}
                   </button>
                ))}
              </div>
            </div>
            
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 text-gray-500">No products found.</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} onClick={() => handleProductClick(product.id)} />
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === 'product' && selectedProductId && (
          <ProductDetailsPage 
            productId={selectedProductId} 
            onBack={() => setCurrentView('home')} 
            onProductClick={handleProductClick}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutPage 
            onBack={() => setCurrentView('home')} 
            onPlaceOrder={async (details) => {
              try {
                const res = await fetch('/api/checkout', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(details)
                });
                const data = await res.json();
                if (data.success) {
                  toast.success('Order Placed successfully!');
                  setCart([]);
                  // Mock WhatsApp Notification (Simulating sending a message to customer)
                  if (details.customerPhone) {
                    toast.success(`WhatsApp confirmation sent to ${details.customerPhone}`, { icon: '📱' });
                  }
                  setCurrentView('home');
                } else {
                  toast.error(data.error || 'Failed to place order');
                }
              } catch (err) {
                toast.error('Network error during checkout');
              }
            }}
          />
        )}
      </main>

      <Footer />
      <WhatsAppButton />

      {isScannerOpen && (
        <ScannerModal 
          onClose={() => setIsScannerOpen(false)}
          onScan={(text) => {
            setSearchQuery(text);
            setCurrentView('search');
          }}
        />
      )}

      {isAuthOpen && (
        <LoginModal onClose={() => setIsAuthOpen(false)} />
      )}

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold">Your Cart</h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center text-gray-500 py-10">Cart is empty</div>
                ) : (
                  cart.map(item => (
                    <div key={item.product.id} className="flex gap-4 border-b pb-4">
                      <img src={item.product.image} className="w-20 h-20 object-cover rounded-xl" alt="" />
                      <div>
                        <h4 className="font-bold line-clamp-1">{item.product.name}</h4>
                        <p className="font-bold text-violet-600">₹{item.product.price}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-4 border-t bg-stone-50 space-y-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{cartTotal}</span>
                  </div>
                  <button 
                    onClick={() => { setIsCartOpen(false); setCurrentView('checkout'); }}
                    className="w-full bg-violet-600 text-white font-bold py-4 rounded-xl hover:bg-violet-700"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
