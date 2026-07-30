import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { ShoppingCart, Heart, Star, Share2, Truck, ShieldCheck, ArrowLeft, Plus, Minus, Video } from 'lucide-react';
import { ProductCard } from '../components/product/ProductCard';

export const ProductDetailsPage: React.FC<{
  productId: string;
  onBack: () => void;
  onProductClick: (id: string) => void;
}> = ({ productId, onBack, onProductClick }) => {
  const { products, addToCart, favorites, toggleFavorite, lang, addRecentlyViewed, recentlyViewed } = useStore();
  const product = products.find(p => p.id === productId);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (product) {
      addRecentlyViewed(product.id);
    }
  }, [product?.id]);

  if (!product) return <div className="p-12 text-center text-primary text-xl font-bold min-h-screen">Product not found.</div>;

  const images = [product.image, ...(product.images || [])].filter(Boolean);
  const isFavorite = favorites.includes(product.id);
  
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);
    
  const recentlyViewedProducts = recentlyViewed
    .filter(id => id !== product.id)
    .map(id => products.find(p => p.id === id))
    .filter(Boolean) as Product[];

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-neutral-100/50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-32">
        {/* Breadcrumb / Back */}
        <button onClick={onBack} className="flex items-center gap-2 text-neutral-500 hover:text-primary font-medium mb-10 transition-colors group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to shopping
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Image Gallery */}
          <div className="space-y-6">
            <div className="aspect-[4/5] bg-white rounded-[2.5rem] overflow-hidden relative shadow-[0_20px_40px_rgba(0,0,0,0.04)] border border-neutral-200/50 group">
              {discount > 0 && (
                <span className="absolute top-6 left-6 bg-crimson-500 text-white text-xs tracking-wider font-bold px-4 py-2 rounded-full shadow-lg z-10 uppercase">
                  {discount}% OFF
                </span>
              )}
              
              {showVideo && product.videoUrl ? (
                <video src={product.videoUrl} autoPlay loop controls className="w-full h-full object-cover" />
              ) : (
                <img 
                  src={images[activeImage]} 
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-[1.5s] ease-out cursor-zoom-in"
                />
              )}
            </div>
            
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {product.videoUrl && (
                  <button 
                    onClick={() => setShowVideo(true)}
                    className={`w-24 h-24 rounded-2xl overflow-hidden border-2 flex items-center justify-center bg-primary text-white transition-all ${showVideo ? 'border-gold-500 shadow-md scale-105' : 'border-transparent hover:border-gold-300'}`}
                  >
                    <Video className="w-8 h-8" />
                  </button>
                )}
                {images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => { setActiveImage(idx); setShowVideo(false); }}
                    className={`w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === idx && !showVideo ? 'border-gold-500 shadow-md scale-105' : 'border-transparent hover:border-gold-300'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col pt-4 lg:pt-10">
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-black text-primary tracking-tight leading-tight mb-4">
                {product.name}
              </h1>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(star => (
                    <Star key={star} className="w-5 h-5 fill-gold-500 text-gold-500" />
                  ))}
                  <span className="text-base font-bold text-primary ml-2">5.0</span>
                  <span className="text-sm text-neutral-500 hover:text-gold-600 ml-2 cursor-pointer transition-colors">({product.reviews?.length || 12} reviews)</span>
                </div>
              </div>
            </div>

            <div className="mb-10 flex items-end gap-4">
              <span className="text-5xl font-black text-primary">₹{product.price}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xl text-neutral-400 line-through font-medium mb-1">₹{product.originalPrice}</span>
              )}
            </div>

            <p className="text-neutral-600 text-lg mb-10 leading-relaxed font-light">
              {product.features && product.features.length > 0 
                ? product.features.join(' • ') 
                : 'Experience unparalleled quality and design with this premium addition to your collection.'}
            </p>

            <div className="flex gap-4 mb-10">
              {/* Quantity Selector */}
              <div className="flex items-center bg-white border border-neutral-300 rounded-full p-2 shrink-0 shadow-sm">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 flex items-center justify-center text-neutral-500 hover:text-primary transition-colors hover:bg-neutral-100 rounded-full">
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-10 text-center font-bold text-xl text-primary">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 flex items-center justify-center text-neutral-500 hover:text-primary transition-colors hover:bg-neutral-100 rounded-full">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              
              {/* Add to Cart */}
              <button 
                onClick={() => {
                  for (let i = 0; i < quantity; i++) addToCart(product);
                }}
                className="flex-1 premium-button-gold text-lg py-4 shadow-[0_8px_30px_rgba(212,175,55,0.3)]"
              >
                <ShoppingCart className="w-6 h-6 mr-3" /> Add to Bag
              </button>
              
              {/* Wishlist */}
              <button 
                onClick={() => toggleFavorite(product.id)}
                className="w-[72px] h-[72px] bg-white border border-neutral-300 rounded-full flex items-center justify-center text-neutral-500 hover:border-crimson-500 hover:text-crimson-500 hover:bg-crimson-50 transition-all shadow-sm shrink-0 active:scale-95"
              >
                <Heart className={`w-7 h-7 ${isFavorite ? 'fill-crimson-500 text-crimson-500' : ''}`} />
              </button>
            </div>
            
            {/* Stock Indicator */}
            {product.stock !== undefined && (
              <div className="mb-10">
                {product.stock > (product.lowStockThreshold || 10) ? (
                  <p className="text-emerald-500 font-bold flex items-center gap-3 bg-emerald-50 w-fit px-4 py-2 rounded-full text-sm">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    In Stock - Ready to ship
                  </p>
                ) : product.stock > 0 ? (
                  <p className="text-amber-500 font-bold flex items-center gap-3 bg-amber-50 w-fit px-4 py-2 rounded-full text-sm">
                    <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse"></span>
                    Hurry! Only {product.stock} remaining
                  </p>
                ) : (
                  <div className="flex flex-col gap-4">
                    <p className="text-crimson-500 font-bold flex items-center gap-3 bg-crimson-50 w-fit px-4 py-2 rounded-full text-sm">
                      <span className="w-2.5 h-2.5 bg-crimson-500 rounded-full"></span>
                      Currently Unavailable
                    </p>
                    <button className="premium-button-outline py-4 text-sm font-bold w-full">
                      Notify me when available
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-6 border-y border-neutral-200 py-8 mb-8">
              <div className="flex items-center gap-4 text-neutral-700">
                <div className="w-12 h-12 bg-primary-light/5 rounded-full flex items-center justify-center text-gold-600">
                  <Truck className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold">Complimentary<br/>Shipping</span>
              </div>
              <div className="flex items-center gap-4 text-neutral-700">
                <div className="w-12 h-12 bg-primary-light/5 rounded-full flex items-center justify-center text-gold-600">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold">Authenticity<br/>Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Reviews Section */}
        <div className="mt-32">
          <h2 className="text-3xl md:text-4xl font-black text-primary mb-12 flex items-center gap-4">
            Customer Reviews 
            <span className="text-base bg-gold-100 text-gold-900 px-4 py-1.5 rounded-full">{product.reviews?.length || 0}</span>
          </h2>
          
          {(!product.reviews || product.reviews.length === 0) ? (
            <div className="premium-card p-12 text-center text-neutral-500 text-lg">
              No reviews yet. Be the first to experience and review this item.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {product.reviews.map((review, idx) => (
                <div key={idx} className="premium-card p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary text-gold-500 font-bold rounded-full flex items-center justify-center text-lg">
                        {review.customerName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-primary tracking-wide">{review.customerName}</h4>
                        <div className="flex text-gold-500 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'text-neutral-300'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-neutral-400 font-medium">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-neutral-600 text-base leading-relaxed mb-6 font-light">{review.review}</p>
                  {review.imageUrl && (
                    <img src={review.imageUrl} alt="Review" className="w-28 h-28 object-cover rounded-2xl shadow-sm border border-neutral-200/50" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Frequently Bought Together */}
        {relatedProducts.length > 0 && (
          <div className="mt-32">
            <h2 className="text-3xl md:text-4xl font-black text-primary mb-12 tracking-tight">Frequently Bought Together</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
              {relatedProducts.map(rp => (
                <ProductCard key={rp.id} product={rp} onClick={() => onProductClick(rp.id)} />
              ))}
            </div>
          </div>
        )}

        {/* Recently Viewed */}
        {recentlyViewedProducts.length > 0 && (
          <div className="mt-32 border-t border-neutral-200 pt-20">
            <h2 className="text-3xl md:text-4xl font-black text-primary mb-12 tracking-tight">Recently Viewed</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
              {recentlyViewedProducts.slice(0,4).map(rp => (
                <ProductCard key={`recent-${rp.id}`} product={rp} onClick={() => onProductClick(rp.id)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
