import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Heart, User, Menu, X, Globe, Mic, ScanLine, Moon, Sun } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';

export const Header: React.FC<{
  onOpenCart: () => void;
  onOpenMobileMenu: () => void;
  onOpenAccount: () => void;
  onOpenScanner: () => void;
  cartItemCount: number;
}> = ({ onOpenCart, onOpenMobileMenu, onOpenAccount, onOpenScanner, cartItemCount }) => {
  const { lang, setLang, searchQuery, setSearchQuery, settings, favorites, user, logout } = useStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const startVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'en' ? 'en-US' : lang === 'ta' ? 'ta-IN' : 'ar-SA';
      recognition.onresult = (event: any) => {
        setSearchQuery(event.results[0][0].transcript);
      };
      recognition.start();
    } else {
      alert("Voice search is not supported in your browser.");
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-500 ease-out ${
        isScrolled ? 'glass-premium py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          
          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 -ml-2 text-gray-700" onClick={onOpenMobileMenu}>
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <div className="flex-shrink-0 cursor-pointer group">
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2 transition-transform duration-300 group-hover:scale-105">
              <span className="text-gradient-gold">
                {settings.storeName || 'Rappani'}
              </span>
            </h1>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8 relative group">
            <input 
              type="text" 
              placeholder={lang === 'ta' ? 'பொருட்களை தேடுங்கள்...' : lang === 'ar' ? 'البحث عن المنتجات...' : 'Search for premium products...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="premium-input pl-12 pr-20"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-gold-500 transition-colors" />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
              <button onClick={startVoiceSearch} className="text-neutral-400 hover:text-gold-500 transition-colors hover:scale-110 active:scale-95">
                <Mic className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-neutral-300"></div>
              <button onClick={onOpenScanner} className="text-neutral-400 hover:text-gold-500 transition-colors hover:scale-110 active:scale-95">
                <ScanLine className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-4">
            {/* Dark Mode Toggle */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="hidden sm:flex p-2 rounded-full hover:bg-gold-50/50 text-neutral-600 hover:text-gold-600 transition-all hover:scale-110 active:scale-95"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Language Toggle */}
            <button 
              onClick={() => {
                const nextLang = lang === 'en' ? 'ta' : lang === 'ta' ? 'ar' : 'en';
                setLang(nextLang);
              }}
              className="hidden sm:flex items-center gap-1.5 p-2 rounded-full hover:bg-gold-50/50 text-neutral-600 hover:text-gold-600 font-medium text-sm transition-all hover:scale-105 active:scale-95"
            >
              <Globe className="w-4 h-4" />
              <span className="uppercase">{lang}</span>
            </button>

            {/* Wishlist */}
            <button className="p-2 relative rounded-full hover:bg-gold-50/50 text-neutral-600 hover:text-gold-600 transition-all hover:scale-110 active:scale-95 hidden sm:block">
              <Heart className="w-5 h-5" />
              {favorites.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-crimson-500 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.6)]"></span>
              )}
            </button>

            {/* Account */}
            {user ? (
              <button onClick={logout} className="p-2 rounded-full hover:bg-crimson-500/10 hover:text-crimson-500 text-neutral-600 transition-all hidden sm:flex items-center gap-2 hover:scale-105 active:scale-95">
                <User className="w-5 h-5" />
                <span className="text-sm font-bold truncate max-w-[80px]">{user.name}</span>
              </button>
            ) : (
              <button onClick={onOpenAccount} className="p-2 rounded-full hover:bg-gold-50/50 text-neutral-600 hover:text-gold-600 transition-all hidden sm:block hover:scale-110 active:scale-95">
                <User className="w-5 h-5" />
              </button>
            )}

            {/* Cart */}
            <button 
              onClick={onOpenCart}
              className="relative p-2.5 rounded-full bg-primary text-white hover:bg-primary-light hover:shadow-lg hover:shadow-primary/20 transition-all hover:scale-110 active:scale-95 group ml-2"
            >
              <ShoppingCart className="w-5 h-5" />
              <AnimatePresence>
                {cartItemCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1.5 -right-1.5 bg-gold-500 text-primary text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md shadow-gold-500/40"
                  >
                    {cartItemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
