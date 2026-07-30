import React from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/product/ProductCard';
import { ArrowRight, Sparkles, TrendingUp, Gift } from 'lucide-react';
import { motion } from 'motion/react';
import { Product } from '../types';

export const HomePage: React.FC<{
  onProductClick: (id: string) => void;
  onViewAll: () => void;
}> = ({ onProductClick, onViewAll }) => {
  const { products, recentlyViewed } = useStore();

  const publicProducts = products.filter(p => p.isVisible !== false);
  const featured = publicProducts.filter(p => p.isFeatured).slice(0, 4);
  const newArrivals = [...publicProducts].reverse().slice(0, 8);
  const bestSellers = [...publicProducts].sort(() => 0.5 - Math.random()).slice(0, 8);
  const recommended = recentlyViewed
    .map(id => products.find(p => p.id === id))
    .filter(Boolean) as Product[];

  const heroBanners = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&q=80",
      title: "Luxury Essentials",
      subtitle: "Elevate your everyday with our curated selection of ultra-premium stationery and exclusive accessories.",
      cta: "Discover the Collection"
    }
  ];

  return (
    <div className="pb-20 bg-neutral-100 min-h-screen">
      {/* Cinematic Hero Section */}
      <section className="relative w-full h-[70vh] min-h-[500px] md:h-[85vh] bg-primary overflow-hidden">
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={heroBanners[0].image} 
          alt="Hero" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-transparent to-primary" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="max-w-5xl"
          >
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tight leading-tight">
              {heroBanners[0].title}
            </h2>
            <p className="text-lg md:text-2xl text-neutral-300 mb-10 max-w-3xl mx-auto font-light leading-relaxed">
              {heroBanners[0].subtitle}
            </p>
            <div className="flex justify-center">
              <button 
                onClick={onViewAll}
                className="premium-button-gold px-10 py-5 text-lg shadow-[0_0_40px_rgba(212,175,55,0.4)]"
              >
                {heroBanners[0].cta}
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured / Best Sellers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 text-gold-500 mb-3">
              <TrendingUp className="w-5 h-5" />
              <span className="font-bold text-sm tracking-[0.2em] uppercase">Signature Collection</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-primary tracking-tight">Best Sellers</h2>
          </div>
          <button onClick={onViewAll} className="hidden sm:flex items-center gap-2 font-bold text-neutral-500 hover:text-primary transition-colors group">
            <span className="group-hover:underline underline-offset-4">View All</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
          {bestSellers.map(product => (
            <ProductCard key={product.id} product={product} onClick={() => onProductClick(product.id)} />
          ))}
        </div>
        <button onClick={onViewAll} className="w-full mt-8 py-4 premium-button-outline sm:hidden">
          View All Products
        </button>
      </section>

      {/* Recommended for You */}
      {recommended.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-primary tracking-tight">Curated For You</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            {recommended.slice(0, 4).map(product => (
              <ProductCard 
                key={`rec-${product.id}`} 
                product={product} 
                onClick={() => onProductClick(product.id)} 
              />
            ))}
          </div>
        </section>
      )}

      {/* Categories Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32">
        <div className="bg-primary rounded-[2.5rem] p-10 md:p-16 text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden group">
          {/* Animated background elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 group-hover:bg-gold-500/20 transition-colors duration-700"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
          
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-gradient-gold">The Art of Gifting</h2>
            <p className="text-neutral-300 text-lg md:text-xl font-light leading-relaxed">
              Explore our exclusive collections crafted for those who appreciate the finer things in life. Perfect for every memorable occasion.
            </p>
          </div>
          <button onClick={onViewAll} className="relative z-10 bg-white text-primary px-10 py-4 rounded-full font-bold text-lg whitespace-nowrap hover:bg-gold-50 transition-colors shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 duration-300">
            Explore Categories
          </button>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32 mb-16">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 text-gold-500 mb-3">
              <Sparkles className="w-5 h-5" />
              <span className="font-bold text-sm tracking-[0.2em] uppercase">Just Arrived</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-primary tracking-tight">New Additions</h2>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
          {newArrivals.map(product => (
            <ProductCard key={`new-${product.id}`} product={product} onClick={() => onProductClick(product.id)} />
          ))}
        </div>
      </section>

    </div>
  );
};
