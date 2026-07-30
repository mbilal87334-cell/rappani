import React from 'react';
import { Phone, Mail, Instagram, MapPin, ShieldCheck, Truck, RefreshCw, CreditCard } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const Footer: React.FC = () => {
  const { settings, lang } = useStore();

  const trustBadges = [
    { icon: <ShieldCheck className="w-6 h-6" />, title: lang === 'ta' ? 'பாதுகாப்பானது' : 'Secure Payment', desc: '100% secure checkout' },
    { icon: <Truck className="w-6 h-6" />, title: lang === 'ta' ? 'வேகமான டெலிவரி' : 'Fast Delivery', desc: 'Ships within 24 hours' },
    { icon: <RefreshCw className="w-6 h-6" />, title: lang === 'ta' ? 'எளிதான ரிட்டர்ன்' : 'Easy Returns', desc: '7-day return policy' },
    { icon: <CreditCard className="w-6 h-6" />, title: lang === 'ta' ? 'பல்வேறு பேமெண்ட்' : 'Multiple Options', desc: 'UPI, Cards, Wallets' },
  ];

  return (
    <footer className="bg-primary text-white border-t border-white/5 mt-20 relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent"></div>
      
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {trustBadges.map((badge, idx) => (
              <div key={idx} className="flex flex-col items-center text-center gap-3 group">
                <div className="w-14 h-14 bg-primary-light text-gold-500 rounded-2xl flex items-center justify-center mb-1 transition-transform duration-500 group-hover:scale-110 group-hover:bg-gold-500/20 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                  {badge.icon}
                </div>
                <h4 className="font-bold text-white text-sm tracking-wide">{badge.title}</h4>
                <p className="text-xs text-neutral-400">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1">
            <h2 className="text-3xl font-black tracking-tight text-gradient-gold mb-6">
              {settings.storeName || 'Rappani'}
            </h2>
            <p className="text-neutral-400 text-sm mb-8 leading-relaxed">
              Premium stationary, luxury items, and exclusive gifts. Experience world-class quality delivered directly to your doorstep.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center text-neutral-400 hover:bg-gold-500 hover:text-primary transition-all duration-300 hover:scale-110">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Quick Links</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-sm text-neutral-400 hover:text-gold-500 transition-colors">Home</a></li>
              <li><a href="#" className="text-sm text-neutral-400 hover:text-gold-500 transition-colors">Shop</a></li>
              <li><a href="#" className="text-sm text-neutral-400 hover:text-gold-500 transition-colors">Categories</a></li>
              <li><a href="#" className="text-sm text-neutral-400 hover:text-gold-500 transition-colors">Track Order</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Customer Service</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-sm text-neutral-400 hover:text-gold-500 transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-sm text-neutral-400 hover:text-gold-500 transition-colors">Shipping Policy</a></li>
              <li><a href="#" className="text-sm text-neutral-400 hover:text-gold-500 transition-colors">Returns & Exchanges</a></li>
              <li><a href="#" className="text-sm text-neutral-400 hover:text-gold-500 transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Contact Us</h3>
            <ul className="space-y-5">
              <li className="flex items-start gap-3 text-sm text-neutral-400 group">
                <MapPin className="w-5 h-5 shrink-0 text-gold-500 mt-0.5 group-hover:scale-110 transition-transform" />
                <span className="group-hover:text-white transition-colors">{settings.storeAddress || 'Rappani Store, Madurai, Tamil Nadu'}</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-neutral-400 group">
                <Phone className="w-5 h-5 shrink-0 text-gold-500 group-hover:scale-110 transition-transform" />
                <span className="group-hover:text-white transition-colors">{settings.storePhone || '+91 0000000000'}</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-neutral-400 group">
                <Mail className="w-5 h-5 shrink-0 text-gold-500 group-hover:scale-110 transition-transform" />
                <span className="group-hover:text-white transition-colors">support@rappanistore.com</span>
              </li>
            </ul>
          </div>

        </div>
      </div>
      
      <div className="bg-primary-light py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-400 text-center md:text-left">
            &copy; {new Date().getFullYear()} {settings.storeName || 'Rappani Store'}. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-neutral-400">
            <a href="#" className="hover:text-gold-500 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gold-500 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
