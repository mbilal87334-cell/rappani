import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Order, fetchCategoriesApi } from '../App';

export interface User {
  _id: string;
  phone: string;
  name: string;
  email?: string;
  role: string;
  addresses: any[];
  loyaltyPoints: number;
}

interface StoreContextType {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  lang: 'en' | 'ta' | 'ar';
  setLang: React.Dispatch<React.SetStateAction<'en' | 'ta' | 'ar'>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  selectedCategory: string;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
  apiCategories: any[];
  settings: Record<string, string>;
  recentlyViewed: string[];
  addRecentlyViewed: (productId: string) => void;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{
  children: React.ReactNode;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  apiCategories: any[];
  settings: Record<string, string>;
}> = ({ children, products, setProducts, apiCategories, settings }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('rappani_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('rappani_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => {
    const saved = localStorage.getItem('rappani_recently_viewed');
    return saved ? JSON.parse(saved) : [];
  });
  const [lang, setLang] = useState<'en' | 'ta' | 'ar'>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('rappani_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('rappani_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('rappani_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('rappani_recently_viewed', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('rappani_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('rappani_user');
      localStorage.removeItem('rappani_token');
    }
  }, [user]);

  useEffect(() => {
    if (lang === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [lang]);

  const categories = [
    { id: 'All', name: 'All', icon: '🛒', en: 'All', ta: 'அனைத்தும்', ar: 'الجميع' },
    ...apiCategories.map(c => ({
      ...c,
      en: c.name,
      ta: c.name,
      ar: c.name
    }))
  ];

  const addToCart = (product: Product) => {
    if (product.stock !== undefined && product.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (product.stock !== undefined && existing.quantity >= product.stock) {
          return prev;
        }
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (id: string, overrideQuantity: number) => {
    if (overrideQuantity <= 0) {
      removeFromCart(id);
    } else {
      setCart(prev => prev.map(item => {
        if (item.product.id === id) {
          if (item.product.stock !== undefined && overrideQuantity > item.product.stock) {
            return { ...item, quantity: item.product.stock };
          }
          return { ...item, quantity: overrideQuantity };
        }
        return item;
      }));
    }
  };

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const addRecentlyViewed = (productId: string) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(id => id !== productId);
      return [productId, ...filtered].slice(0, 10);
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <StoreContext.Provider value={{
      products, setProducts,
      cart, setCart, addToCart, removeFromCart, updateQuantity,
      favorites, toggleFavorite,
      recentlyViewed, addRecentlyViewed,
      lang, setLang,
      searchQuery, setSearchQuery,
      selectedCategory, setSelectedCategory,
      apiCategories: categories,
      settings,
      user, setUser, logout
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
