import React from 'react';
import { ShoppingCart, Eye, Heart, Star } from 'lucide-react';
import { Product } from '../../App';
import { useStore } from '../../context/StoreContext';
import { motion } from 'motion/react';

export const ProductCard: React.FC<{
  product: Product;
  onClick: () => void;
}> = ({ product, onClick }) => {
  const { lang, addToCart, favorites, toggleFavorite } = useStore();
  
  const isFavorite = favorites.includes(product.id);
  const avgRating = product.reviews && product.reviews.length > 0
    ? (product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length).toFixed(1)
    : '5.0';
  const reviewsCount = product.reviews ? product.reviews.length : 12;

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group premium-card flex flex-col relative overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      {/* Badges */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
        {discount > 0 && (
          <span className="bg-crimson-500 text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full shadow-lg">
            {discount}% OFF
          </span>
        )}
        {product.isFeatured && (
          <span className="bg-gradient-to-r from-gold-500 to-gold-600 text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full shadow-lg">
            FEATURED
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button 
        onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
        className="absolute top-4 right-4 z-10 w-9 h-9 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:scale-110 active:scale-95 transition-all"
      >
        <Heart className={`w-4 h-4 transition-colors ${isFavorite ? 'fill-crimson-500 text-crimson-500' : 'text-neutral-400 hover:text-crimson-500'}`} />
      </button>

      {/* Image Container with Hover Zoom & Quick View */}
      <div className="w-full aspect-[4/5] bg-neutral-50 overflow-hidden relative">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-4 backdrop-blur-[2px]">
          <button 
            className="w-12 h-12 bg-white text-primary rounded-full flex items-center justify-center hover:bg-gold-500 hover:text-white transition-all transform translate-y-8 group-hover:translate-y-0 duration-500 shadow-xl"
            title="Quick View"
          >
            <Eye className="w-5 h-5" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); addToCart(product); }}
            className="w-12 h-12 bg-white text-primary rounded-full flex items-center justify-center hover:bg-gold-500 hover:text-white transition-all transform translate-y-8 group-hover:translate-y-0 duration-500 delay-75 shadow-xl"
            title="Add to Cart"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-5 flex flex-col flex-grow bg-white">
        <div className="flex items-center gap-1.5 mb-2">
          <Star className="w-4 h-4 fill-gold-500 text-gold-500" />
          <span className="text-xs font-bold text-primary">{avgRating}</span>
          <span className="text-[11px] text-neutral-400">({reviewsCount} reviews)</span>
        </div>
        
        <h3 className="text-[15px] font-bold text-primary line-clamp-2 leading-relaxed group-hover:text-gold-600 transition-colors mb-3">
          {product.name}
        </h3>
        
        <div className="mt-auto flex items-end justify-between">
          <div>
            <span className="text-xl font-black text-primary">₹{product.price}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-neutral-400 line-through ml-2 font-medium">₹{product.originalPrice}</span>
            )}
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); addToCart(product); }}
            className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-gold-500 transition-all shadow-md active:scale-95 md:hidden"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
