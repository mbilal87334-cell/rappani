import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { Phone, Mail, Instagram, MessageCircle, MapPin, Lock, LogOut, Plus, Edit, Trash2, Store, ShoppingBag, Menu, X, Camera, Aperture, Globe, Database, Search, ArrowUp, Package, LayoutGrid, ShoppingCart, Minus, Image, ShieldCheck, Gift, Sparkles, Sticker, Rocket, Coffee, Eye, Star, TrendingUp, CheckCircle2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';


// --- Types ---
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  stock?: number;
  image: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface Setting {
  key: string;
  value: string;
}

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  items: CartItem[];
  totalAmount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

// --- API Service ---
const API_BASE = '/api';

const getPremiumImageUrl = (url: string) => {
  if (!url) return url;
  if (url.includes('res.cloudinary.com') && !url.includes('e_background_removal')) {
    return url.replace('/image/upload/', '/image/upload/e_background_removal/');
  }
  return url;
};

async function fetchSettings() {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) throw new Error("Failed to fetch settings");
  return res.json();
}

async function updateSetting(key: string, value: string) {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value }),
  });
  if (!res.ok) throw new Error("Failed to update setting");
  return res.json();
}

async function fetchProducts() {
  const res = await fetch(`${API_BASE}/products`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

async function saveProduct(product: Product, isEditing: boolean) {
  const method = isEditing ? 'PUT' : 'POST';
  const url = isEditing ? `${API_BASE}/products/${product.id}` : `${API_BASE}/products`;
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error("Failed to save product");
  return res.json();
}

async function checkoutCart(payload: { customerName: string; customerPhone: string; paymentMethod: string; totalAmount: number; items: CartItem[] }) {
  const res = await fetch(`${API_BASE}/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to checkout");
  return res.json();
}

async function fetchOrders() {
  const res = await fetch(`${API_BASE}/orders`);
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
}

async function updateOrderStatus(id: string, status: string) {
  const res = await fetch(`${API_BASE}/orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error("Failed to update order status");
  return res.json();
}

async function deleteProduct(id: string) {
  console.log(`API Service: Calling DELETE /api/products/${id}`);
  const res = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error(`API Service: DELETE failed with status ${res.status}`, errorData);
    throw new Error(errorData.error || "Failed to delete product");
  }
  console.log(`API Service: DELETE successful for ID: ${id}`);
  return res.json();
}

async function deleteOrder(id: string) {
  const res = await fetch(`${API_BASE}/orders/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error("Failed to delete order");
  return res.json();
}

async function uploadImage(dataUrl: string) {
  // Convert DataURL to Blob
  const res = await fetch(dataUrl);
  const blob = await res.blob();

  const formData = new FormData();
  formData.append('image', blob, 'upload.jpg');

  const uploadRes = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!uploadRes.ok) throw new Error("Failed to upload image");
  const data = await uploadRes.json();
  return data.imageUrl;
}

// --- Translations (தமிழ் & English) ---
const translations = {
  en: {
    storeName: "Rappani",
    tagline: "Stationary & Fancy Store",
    home: "Home",
    products: "Products",
    contact: "Contact",
    adminLogin: "Admin Login",
    welcome: "Welcome to Rappani Premium Store v3.0",
    heroTitle1: "Your One-Stop Shop for",
    heroTitle2: "Stationary",
    heroTitle3: "&",
    heroTitle4: "Fancy",
    heroTitle5: "Items",
    heroDesc: "Discover a wide range of premium stationary, beautiful gifts, and fancy items for all your needs. Quality products at the best prices.",
    shopNow: "Shop Now",
    contactUs: "Contact Us",
    featuredProducts: "Our Featured Products",
    featuredDesc: "Explore our handpicked collection of stationary and fancy items.",
    buyWhatsapp: "Buy via WhatsApp",
    getInTouch: "Get in Touch",
    contactDesc: "Visit our store or contact us online for orders and inquiries. We're always happy to help!",
    callUs: "Call Us",
    emailUs: "Email Us",
    addressTitle: "Rappani Store",
    addressDesc: "21,B Kottikulam Road Rappani Bazar\nMelapalayam, Tirunelveli-627005",
    rights: "Rappani Stationary and Fancy Store. All rights reserved.",
    all: "All",
    stationary: "Stationary",
    fancy: "Fancy",
    searchPlaceholder: "Search products...",
    noProducts: "No products found",
    storageStatus: "Memory Status: Local Database Active",
    toys: "Toys",
    sports: "Sports Items",
    snacks: "Snacks",
    cart: "Cart",
    addToCart: "Add to Cart",
    checkoutWhatsapp: "Checkout on WhatsApp",
    emptyCart: "Your cart is empty",
    total: "Total",
    offer: "Offer",
    offers: "Special Offers",
    originalPrice: "Original Price (Optional)",
    paymentInfo: "Pay via GPay to 8940324030 and collect your items at the shop.",
    payGpay: "Pay Now with GPay / UPI",
    outOfStock: "Out of Stock",
    enterDetails: "Please enter your details",
    invalidPhone: "Please enter a valid 10-digit mobile number",
    nameLabel: "Your Name",
    phoneLabel: "Phone Number",
    sendOtp: "Send OTP (Simulated)",
    verifyOtp: "Verify OTP",
    enterOtp: "Enter 4-digit OTP",
    phoneVerified: "✔ Phone Verified",
    unverifiedPhoneError: "Please verify your phone number using OTP.",
    productDetails: "Product Details",
    clickToSee: "Click to see more details",
    stockAvailable: "Stock Available",
    shareProduct: "Share on WhatsApp",
    viewProduct: "View",
    deliveryFee: "Delivery Fee",
    freeDelivery: "Free Delivery (1st Order)",
    distanceToStore: "Distance to Store",
    tooFarError: "We deliver only within 3KM. You are too far.",
    calculatingLocation: "Checking location...",
    locationBlocked: "Allow location access for delivery.",
    refreshLocation: "Refresh Location",
    deliveryMethod: "Delivery Method",
    homeDelivery: "Home Delivery",
    shopPickup: "Shop Pickup",
    enterAddress: "Enter Full Delivery Address",
  },

  ta: {
    storeName: "ரப்பாணி",
    tagline: "ஸ்டேஷனரி & ஃபேன்ஸி ஸ்டோர்",
    title: "ரப்பாணி ஸ்டேஷனரி & ஃபேன்ஸி ஸ்டோர்",
    home: "முகப்பு",
    products: "பொருட்கள்",
    contact: "தொடர்புக்கு",
    adminLogin: "அட்மின்",
    welcome: "ரப்பாணி பிரீமியம் ஸ்டோர் v3.0-க்கு வரவேற்கிறோம்",
    heroTitle1: "உங்களுக்கு தேவையான",
    heroTitle2: "ஸ்டேஷனரி",
    heroTitle3: "மற்றும்",
    heroTitle4: "ஃபேன்ஸி",
    heroTitle5: "பொருட்கள்",
    heroDesc: "உங்களுக்குத் தேவையான அனைத்து சிறந்த ஸ்டேஷனரி, அழகான பரிசுகள் மற்றும் ஃபேன்ஸி பொருட்களை இங்கே கண்டறியுங்கள். சிறந்த விலையில் தரமான பொருட்கள்.",
    shopNow: "பொருட்களைப் பார்க்க",
    contactUs: "தொடர்பு கொள்ள",
    featuredProducts: "எங்கள் சிறப்பான பொருட்கள்",
    featuredDesc: "நாங்கள் உங்களுக்காகத் தேர்ந்தெடுத்த ஸ்டேஷனரி மற்றும் ஃபேன்ஸி பொருட்களைப் பாருங்கள்.",
    buyWhatsapp: "WhatsApp-ல் வாங்க",
    getInTouch: "தொடர்பு கொள்ளுங்கள்",
    contactDesc: "ஆர்டர்கள் மற்றும் விவரங்களுக்கு எங்கள் கடையை நேரில் அணுகவும் அல்லது ஆன்லைனில் தொடர்பு கொள்ளவும். உங்களுக்கு உதவ நாங்கள் காத்திருக்கிறோம்!",
    callUs: "அழைக்க",
    emailUs: "இமெயில் அனுப்ப",
    addressTitle: "ரப்பானி ஸ்டோர்",
    addressDesc: "21,B கொட்டிகுளம் ரோடு, ரப்பானி பஜார்\nமேலப்பாளையம், திருநெல்வேலி-627005",
    rights: "ரப்பானி ஸ்டேஷனரி மற்றும் ஃபேன்ஸி ஸ்டோர். அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.",
    all: "அனைத்தும்",
    stationary: "ஸ்டேஷனரி",
    fancy: "ஃபேன்ஸி",
    searchPlaceholder: "பொருட்களைத் தேடுங்கள்...",
    noProducts: "பொருட்கள் எதுவும் இல்லை",
    storageStatus: "நினைவக நிலை: உள்ளூர் தரவுத்தளம் செயலில் உள்ளது",
    toys: "பொம்மைகள்",
    sports: "விளையாட்டுப் பொருட்கள்",
    snacks: "ஸ்நாக்ஸ்",
    cart: "கார்ட்",
    addToCart: "கார்ட்டில் சேர்க்க",
    checkoutWhatsapp: "WhatsApp-ல் வாங்க",
    emptyCart: "கார்ட் காலியாக உள்ளது",
    total: "மொத்தம்",
    offer: "ஆஃபர்",
    offers: "சிறப்பு ஆஃபர்கள்",
    originalPrice: "பழைய விலை (விருப்பமிருந்தால்)",
    paymentInfo: "8940324030 என்ற எண்ணிற்கு GPay செய்துவிட்டு, கடைக்கு வந்து பொருட்களைப் பெற்றுக்கொள்ளவும்.",
    payGpay: "GPay / UPI-ல் செலுத்துங்கள்",
    outOfStock: "ஸ்டாக் இல்லை",
    enterDetails: "உங்கள் விவரங்களை உள்ளிடவும்",
    invalidPhone: "சரியான 10-இலக்க போன் நம்பரை உள்ளிடவும்",
    nameLabel: "உங்கள் பெயர்",
    phoneLabel: "போன் நம்பர்",
    sendOtp: "OTP அனுப்பு",
    verifyOtp: "OTP-ஐ சரிபார்",
    enterOtp: "4-இலக்க OTP",
    phoneVerified: "✔ சரிபார்க்கப்பட்டது",
    unverifiedPhoneError: "OTP மூலம் உங்கள் எண்ணை சரிபார்க்கவும்.",
    productDetails: "பொருள் விவரங்கள்",
    clickToSee: "கூடுதல் விவரங்களைப் பார்க்க தட்டவும்",
    stockAvailable: "இருப்பு உள்ளது",
    shareProduct: "WhatsApp-ல் பகிர",
    viewProduct: "பார்க்க",
    deliveryFee: "டெலிவரி கட்டணம்",
    freeDelivery: "இலவச டெலிவரி (முதல் ஆர்டர்)",
    distanceToStore: "கடைக்கும் உங்களுக்குமான தூரம்",
    tooFarError: "கடையிலிருந்து 3கிமீ சுற்றளவிற்குள் மட்டுமே டெலிவரி செய்யப்படும். நீங்கள் தூரமாக உள்ளீர்கள்.",
    calculatingLocation: "இருப்பிடத்தை சரிபார்க்கிறது...",
    locationBlocked: "டெலிவரி கட்டணத்தை கணக்கிட லொகேஷன் அனுமதியை வழங்கவும்.",
    refreshLocation: "லொகேஷனை புதுப்பி",
    deliveryMethod: "டெலிவரி முறை",
    homeDelivery: "Home Delivery (வீட்டிற்கே வரும்)",
    shopPickup: "Shop Pickup (கடைக்கு வந்து வாங்கிக்கொள்ளலாம்)",
    enterAddress: "முழு வீட்டு முகவரியை உள்ளிடவும்",
  }

};

// --- Store Coordinates ---
const STORE_LAT = 8.7012438;
const STORE_LON = 77.7110061;

function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// --- Visitor Panel ---
function VisitorPanel({ products, settings, setProducts }: { products: Product[], settings: Record<string, string>, setProducts: React.Dispatch<React.SetStateAction<Product[]>> }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('rappani_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('rappani_cart', JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [cart]);

  const [customerName, setCustomerName] = useState(() => localStorage.getItem('rappani_customer_name') || '');
  const [customerPhone, setCustomerPhone] = useState(() => localStorage.getItem('rappani_customer_phone') || '');
  const [isPhoneVerified, setIsPhoneVerified] = useState(() => localStorage.getItem('rappani_is_verified') === 'true');

  const [isFirstOrder, setIsFirstOrder] = useState<boolean | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number, lon: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'checking' | 'blocked' | 'done'>('idle');

  const [deliveryMethod, setDeliveryMethod] = useState<'home' | 'pickup'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  useEffect(() => {
    localStorage.setItem('rappani_customer_name', customerName);
  }, [customerName]);

  useEffect(() => {
    localStorage.setItem('rappani_customer_phone', customerPhone);
    // When phone changes and is 10 digits, check if first order
    if (customerPhone.length === 10) {
      fetch(`${API_BASE}/orders/check-first/${customerPhone}`)
        .then(res => res.json())
        .then(data => setIsFirstOrder(data.isFirstOrder))
        .catch(err => console.error("Error checking first order", err));
    } else {
      setIsFirstOrder(null);
    }
  }, [customerPhone]);

  useEffect(() => {
    localStorage.setItem('rappani_is_verified', String(isPhoneVerified));
  }, [isPhoneVerified]);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lang, setLang] = useState<'en' | 'ta'>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [showGPayConfirm, setShowGPayConfirm] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [mockOtp, setMockOtp] = useState<string | null>(null);
  const t = translations[lang];

  const refreshLocation = () => {
    setLocationStatus('checking');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          setUserLocation({ lat, lon });
          const d = getDistanceInKm(STORE_LAT, STORE_LON, lat, lon);
          setDistance(d);
          setLocationStatus('done');
        },
        (err) => {
          console.error("Location error:", err);
          setLocationStatus('blocked');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationStatus('blocked');
    }
  };

  useEffect(() => {
    if (isCartOpen && locationStatus === 'idle') {
      refreshLocation();
    }
  }, [isCartOpen, locationStatus]);


  const handleSendOtp = async (e: React.MouseEvent) => {
    e.preventDefault();
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(customerPhone.trim())) {
      setCheckoutError(t.invalidPhone);
      return;
    }
    setCheckoutError('');
    setIsSendingOtp(true);
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: customerPhone }),
      });
      const data = await res.json();
      if (data.success) {
        setIsOtpSent(true);
        if (data.mockOtp) {
          setMockOtp(data.mockOtp);
          // Still alert as fallback
          alert(`SIMULATED SMS\n\nYour Rappani Store OTP is: ${data.mockOtp}`);
        } else {
          setMockOtp(null);
          alert(`OTP Sent to your mobile successfully! Please check your SMS.`);
        }
      } else {
        setCheckoutError(data.error || "Failed to send OTP");
      }
    } catch (err) {
      setCheckoutError("Failed to send OTP.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!otpInput) return;
    setIsVerifyingOtp(true);
    setCheckoutError('');
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: customerPhone, otp: otpInput }),
      });
      const data = await res.json();
      if (data.success) {
        setIsPhoneVerified(true);
        setIsOtpSent(false);
        setMockOtp(null); // Clear mock OTP
      } else {
        setCheckoutError(data.error || "Invalid OTP");
      }
    } catch (err) {
      setCheckoutError("Failed to verify OTP.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const getCategoryName = (cat: string) => {
    switch (cat) {
      case 'All': return t.all;
      case 'Offers': return t.offers;
      case 'Stationary': return t.stationary;
      case 'Fancy': return t.fancy;
      case 'Toys': return t.toys;
      case 'Sports Items': return t.sports;
      case 'Snacks': return t.snacks;
      default: return cat;
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => {
    setLang(lang === 'en' ? 'ta' : 'en');
  };


  const categories = [
    { id: 'All', icon: <LayoutGrid className="w-5 h-5" /> },
    { id: 'Offers', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'Stationary', icon: <Edit className="w-5 h-5" /> },
    { id: 'Fancy', icon: <Gift className="w-5 h-5" /> },
    { id: 'Toys', icon: <Rocket className="w-5 h-5" /> },
    { id: 'Sports Items', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'Snacks', icon: <Coffee className="w-5 h-5" /> }
  ];


  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    let matchesCategory = false;

    if (selectedCategory === 'All') {
      matchesCategory = true;
    } else if (selectedCategory === 'Offers') {
      matchesCategory = product.category === 'Offers' || (product.originalPrice !== undefined && product.originalPrice > product.price);
    } else {
      matchesCategory = product.category === selectedCategory;
    }

    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    // If tracking stock and stock is less than 1, do not add
    if (product.stock !== undefined && product.stock <= 0) return;

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        // Prevent adding more than stock
        if (product.stock !== undefined && existing.quantity >= product.stock) {
          return prev;
        }
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
    // We do NOT open the cart immediately (setIsCartOpen) for a smoother inline "Add" experience
  };

  const updateQuantity = (id: string, overrideQuantity: number) => {
    if (overrideQuantity <= 0) {
      setCart(prev => prev.filter(item => item.product.id !== id));
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

  const cartTotalAmount = Math.round(cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0));

  const deliveryFee = (deliveryMethod === 'pickup' || isFirstOrder === true) ? 0 : 30;
  const finalTotal = Math.round(cartTotalAmount + deliveryFee);

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const processCheckoutAndClearCart = async (paymentMethod: string) => {
    if (!customerName || !customerPhone) {
      setCheckoutError(t.enterDetails);
      return false;
    }

    // Validate Indian phone number format (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(customerPhone.trim())) {
      setCheckoutError(t.invalidPhone);
      return false;
    }

    if (!isPhoneVerified) {
      setCheckoutError(t.unverifiedPhoneError);
      return false;
    }

    if (deliveryMethod === 'home') {
      if (!deliveryAddress.trim()) {
        setCheckoutError(t.enterAddress);
        return false;
      }
      if (distance !== null && distance > 3) {
        setCheckoutError(t.tooFarError);
        return false;
      }
    }

    setCheckoutError('');
    console.log(`[CHECKOUT] processCheckoutAndClearCart called for: ${paymentMethod}`);

    // Explicitly block WhatsApp from being saved to the database (Robust check)
    if (paymentMethod.toLowerCase().includes('whatsapp')) {
      console.warn(`[CHECKOUT] WhatsApp mode detected (${paymentMethod}). NOT saving to server.`);
      setCart([]);
      setTimeout(() => setIsCartOpen(false), 500);
      return true;
    }

    try {
      const payload = {
        customerName,
        customerPhone,
        paymentMethod,
        totalAmount: finalTotal,
        items: cart,
        deliveryMethod,
        deliveryAddress: deliveryMethod === 'home' ? deliveryAddress : 'Shop Pickup'
      };
      await checkoutCart(payload);

      setProducts(prev => prev.map(p => {
        const cartItem = cart.find(ci => ci.product.id === p.id);
        if (cartItem && p.stock !== undefined) {
          return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
        }
        return p;
      }));
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setTimeout(() => setIsCartOpen(false), 500);
      return true;
    } catch (err) {
      console.error("Failed to checkout cart", err);
      // fallback just empty if fail but WhatsApp is opened
      return true;
    }
  };

  const handleWhatsAppCheckout = async () => {
    if (cart.length === 0) return;
    if (!customerName || !customerPhone) {
      setCheckoutError(t.enterDetails);
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(customerPhone.trim())) {
      setCheckoutError(t.invalidPhone);
      return;
    }

    if (!isPhoneVerified) {
      setCheckoutError(t.unverifiedPhoneError);
      return;
    }

    if (deliveryMethod === 'home') {
      if (!deliveryAddress.trim()) {
        setCheckoutError(t.enterAddress);
        return;
      }
      if (distance !== null && distance > 3) {
        setCheckoutError(t.tooFarError);
        return;
      }
    }

    let message = `Hi, I want to place an order:\n\n*Customer*: ${customerName}\n*Phone*: ${customerPhone}\n\n`;
    cart.forEach(item => {
      message += `- ${item.product.name} (x${item.quantity}) = ₹${Math.round(item.product.price * item.quantity)}\n`;
    });
    message += `\n*Cart Total: ₹${cartTotalAmount}*`;
    message += `\n*Delivery Fee: ₹${deliveryFee}* ${deliveryFee === 0 ? '(1st Order FREE)' : ''}`;
    message += `\n*Final Total: ₹${finalTotal}*`;
    message += `\n\nMethod: ${deliveryMethod === 'home' ? 'Home Delivery' : 'Shop Pickup'}`;
    if (deliveryMethod === 'home') {
      message += `\nAddress: ${deliveryAddress}`;
    }
    message += `\n\nPlease confirm!`;

    const encodedMsg = encodeURIComponent(message);
    console.log(`[CHECKOUT] WhatsApp clicked. ONLY opening WhatsApp. NO DB call.`);

    // Open WhatsApp without booking the order in the system
    window.open(`https://wa.me/${settings.whatsapp_1 || '916384137974'}?text=${encodedMsg}`, '_blank');

    // Optional: Clear cart locally so user knows it's sent, but don't save to DB
    // If you want to keep the items in cart for WhatsApp, comment out the next 2 lines
    setCart([]);
    setTimeout(() => setIsCartOpen(false), 500);
  };

  const handleGPayCheckout = async (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      setCheckoutError(t.enterDetails);
      return;
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(customerPhone.trim())) {
      setCheckoutError(t.invalidPhone);
      return;
    }

    if (!isPhoneVerified) {
      setCheckoutError(t.unverifiedPhoneError);
      return;
    }

    if (deliveryMethod === 'home') {
      if (!deliveryAddress.trim()) {
        setCheckoutError(t.enterAddress);
        return;
      }
      if (distance !== null && distance > 3) {
        setCheckoutError(t.tooFarError);
        return;
      }
    }

    setCheckoutError('');

    try {
      await navigator.clipboard.writeText('mohammedazzam200512@okaxis');
      alert(`✅ UPI ID Copied!\n\nPlease open any UPI App (GPay/Paytm/PhonePe), paste this ID, and complete the payment of ₹${Math.round(cartTotalAmount)}`);
    } catch (err) {
      console.log('Clipboard copy failed');
    }

    setShowGPayConfirm(true);
  };

  const handleGPayConfirm = async () => {
    const utrRegex = /^[0-9]{12}$/;
    if (!utrRegex.test(utrNumber.trim())) {
      setCheckoutError('Please enter a valid 12-digit UTR/Ref No. from your bank app.');
      return;
    }

    setCheckoutError('');
    console.log(`[CHECKOUT] GPay Confirm clicked. This WILL save to DB.`);
    const success = await processCheckoutAndClearCart(`GPay Order (UTR: ${utrNumber})`);
    if (success) {
      setShowGPayConfirm(false);
      setUtrNumber('');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
      {/* Dynamic Announcement Bar */}
      <div className="bg-stone-900 text-white py-2 overflow-hidden relative z-[60]">
        <div className="flex whitespace-nowrap animate-marquee">
          <div className="flex items-center gap-8 px-4">
            <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-rose-400" /> New Arrivals in Stationary Section • Free Pickup Available • Premium Fancy Items now in stock!
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <Rocket className="w-3 h-3 text-blue-400" /> Shop online and collect in store for 10% discount on select items!
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-rose-400" /> New Arrivals in Stationary Section • Free Pickup Available • Premium Fancy Items now in stock!
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced Premium Header */}
      <header className="fixed w-full top-0 z-50 transition-all duration-300 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-rose-400 to-orange-500 p-2.5 rounded-2xl text-white shadow-lg shadow-rose-500/30 ring-1 ring-white/50">
                <Store className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl md:text-2xl font-black text-stone-900 tracking-tight leading-none mb-1">{t.storeName}</h1>
                <p className="text-[10px] font-bold text-rose-500 tracking-[0.2em] uppercase">{t.tagline}</p>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1 bg-white/50 p-1.5 rounded-full border border-stone-100 shadow-sm">
              <a href="#home" className="text-xs font-bold px-4 py-2 rounded-full text-stone-600 hover:text-rose-600 hover:bg-rose-50 transition-all">{t.home}</a>
              <a href="#products" className="text-xs font-bold px-4 py-2 rounded-full text-stone-600 hover:text-rose-600 hover:bg-rose-50 transition-all">{t.products}</a>
              <a href="#contact" className="text-xs font-bold px-4 py-2 rounded-full text-stone-600 hover:text-rose-600 hover:bg-rose-50 transition-all">{t.contact}</a>
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <button onClick={toggleLanguage} className="flex items-center gap-2 text-xs font-black text-rose-600 bg-rose-50 px-4 py-2 rounded-full hover:bg-rose-100 transition-all border border-rose-100 uppercase tracking-widest shadow-sm">
                <Globe className="w-3.5 h-3.5" /> {lang === 'en' ? 'தமிழ்' : 'English'}
              </button>

              <button onClick={() => setIsCartOpen(true)} className="relative p-2.5 bg-stone-100 text-stone-600 hover:text-rose-500 hover:bg-stone-200 rounded-full transition-all shadow-sm">
                <ShoppingCart className="w-5 h-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center translate-x-1/4 -translate-y-1/4 shadow-md ring-2 ring-white">
                    {cartItemsCount}
                  </span>
                )}
              </button>

              <Link to="/admin" className="flex items-center gap-2 text-xs font-bold bg-[#1a1a1a] text-white px-5 py-2.5 rounded-full hover:bg-black transition-all shadow-md active:scale-95 border border-stone-800">
                <Lock className="w-3.5 h-3.5" /> {t.adminLogin}
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-3">
              <button onClick={toggleLanguage} className="flex items-center gap-1 text-[10px] font-black text-rose-600 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100 uppercase tracking-widest">
                <Globe className="w-3 h-3" /> {lang === 'en' ? 'தமிழ்' : 'EN'}
              </button>

              <button onClick={() => setIsCartOpen(true)} className="relative p-2 bg-stone-100 rounded-full text-stone-600">
                <ShoppingCart className="w-4 h-4" />
                {cartItemsCount > 0 && (
                  <span className="absolute top-0 right-0 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center translate-x-1/4 -translate-y-1/4 shadow border border-white">
                    {cartItemsCount}
                  </span>
                )}
              </button>

              <button className="p-2 bg-stone-100 rounded-full text-stone-800" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden absolute w-full top-20 left-0 bg-white border-b border-stone-100 shadow-xl overflow-hidden"
            >
              <div className="px-4 py-6 space-y-2 flex flex-col">
                <a href="#home" className="block px-4 py-3 text-sm font-bold text-stone-700 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors" onClick={() => setIsMenuOpen(false)}>{t.home}</a>
                <a href="#products" className="block px-4 py-3 text-sm font-bold text-stone-700 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors" onClick={() => setIsMenuOpen(false)}>{t.products}</a>
                <a href="#contact" className="block px-4 py-3 text-sm font-bold text-stone-700 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors" onClick={() => setIsMenuOpen(false)}>{t.contact}</a>
                <Link to="/admin" className="mt-2 flex items-center justify-center gap-2 text-sm font-bold bg-stone-900 text-white px-4 py-4 rounded-xl shadow-md" onClick={() => setIsMenuOpen(false)}>
                  <Lock className="w-4 h-4" /> {t.adminLogin}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        {/* Premium Hero Section */}
        <section 
          id="home" 
          className="relative bg-[#0a0a0a] text-white overflow-hidden min-h-[95vh] flex items-center"
        >
          {/* Animated Background Orbs */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none animate-pulse duration-10000"></div>
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px] mix-blend-screen pointer-events-none"></div>

          <div className="absolute inset-0 z-0">
            <img src={settings.hero_image || "https://images.unsplash.com/photo-1583485088034-697b5a69f0bd?auto=format&fit=crop&q=80"} alt="Store Background" className="w-full h-full object-cover opacity-20 mix-blend-luminosity" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full mt-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-stone-300 text-sm font-bold tracking-widest mb-8 shadow-2xl shadow-rose-500/10 hover:bg-white/10 transition-colors uppercase cursor-default">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                {t.welcome}
              </div>

              <h2 className="text-6xl md:text-7xl lg:text-[6rem] font-black tracking-tighter mb-8 leading-[0.95] drop-shadow-2xl">
                {t.heroTitle1} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-500 to-orange-400 italic">{t.heroTitle2}</span> {t.heroTitle3}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 italic">{t.heroTitle4}</span><br />
                {t.heroTitle5}
              </h2>

              <p className="text-xl md:text-2xl text-stone-400 mb-12 max-w-xl leading-relaxed font-medium">
                {t.heroDesc}
              </p>

              <div className="flex flex-wrap gap-5 items-center">
                <a href="#products" className="group relative bg-white text-stone-900 hover:text-rose-600 px-10 py-5 rounded-full font-black text-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3 overflow-hidden shadow-2xl shadow-rose-500/10">
                  <span className="absolute inset-0 bg-gradient-to-r from-rose-100 to-orange-100 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <ShoppingBag className="w-6 h-6 relative z-10" />
                  <span className="relative z-10">{t.shopNow}</span>
                </a>

                <a href="#contact" className="group bg-white/5 hover:bg-white/10 backdrop-blur-md text-white border border-white/10 px-10 py-5 rounded-full font-bold text-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3 shadow-xl">
                  <div className="bg-white/10 p-2.5 rounded-full group-hover:bg-rose-500 group-hover:text-white transition-all">
                    <Phone className="w-5 h-5" />
                  </div>
                  {t.contactUs}
                </a>
              </div>

              {/* Quick stats */}
              <div className="mt-20 pt-10 border-t border-white/10 grid grid-cols-2 md:grid-cols-3 gap-8 max-w-2xl">
                <div className="flex flex-col gap-1">
                  <h4 className="text-3xl font-black text-white">100%</h4>
                  <p className="text-xs text-stone-500 font-black uppercase tracking-[0.2em]">Quality Assured</p>
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-3xl font-black text-white">Fast</h4>
                  <p className="text-xs text-stone-500 font-black uppercase tracking-[0.2em]">Store Pickup</p>
                </div>
                <div className="flex flex-col gap-1 hidden md:flex">
                  <h4 className="text-3xl font-black text-white">Secure</h4>
                  <p className="text-xs text-stone-500 font-black uppercase tracking-[0.2em]">UPI Payments</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Products Section */}
        <section id="products" className="py-24 bg-stone-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-stone-900 mb-6 tracking-tight">{t.featuredProducts}</h2>
              <p className="text-stone-500 max-w-2xl mx-auto text-lg font-medium tracking-wide">{t.featuredDesc}</p>
            </div>

            {/* Search Bar */}
            <div className="mb-12 flex justify-center sticky top-6 z-50">
              <div className="w-full max-w-2xl bg-white/95 backdrop-blur-3xl rounded-none md:rounded-3xl shadow-2xl shadow-stone-200/50 border border-stone-100 p-2 transition-all focus-within:shadow-rose-500/10 focus-within:border-rose-200">
                <div className="relative flex items-center w-full group">
                  <div className="flex-shrink-0 p-3 md:p-4 text-stone-400 group-focus-within:text-rose-500 transition-colors">
                    <Search className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border-none rounded-r-3xl focus:ring-0 focus:border-transparent transition-all outline-none text-stone-800 font-bold bg-transparent text-xl md:text-2xl px-2 py-4"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 text-rose-500 bg-rose-50 hover:bg-rose-100 p-2 rounded-xl transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Always Visible Category Bar */}
            <div className="mb-10 flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-1 items-center justify-start md:justify-center">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all border whitespace-nowrap group relative overflow-hidden ${selectedCategory === cat.id
                    ? 'bg-stone-900 border-stone-800 text-white shadow-lg'
                    : 'bg-white border-stone-100 text-stone-500 hover:border-rose-200 hover:text-rose-600'
                    }`}
                >
                  <div className={`p-1.5 rounded-lg transition-colors ${selectedCategory === cat.id ? 'text-white' : 'text-stone-400 group-hover:text-rose-500'}`}>
                    {React.cloneElement(cat.icon as React.ReactElement, { size: 14 })}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">{getCategoryName(cat.id)}</span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="popLayout">
              {filteredProducts.length > 0 ? (
                <motion.div
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                >
                  {filteredProducts.map((product, idx) => {
                    const cartItem = cart.find(item => item.product.id === product.id);
                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.4) }}
                        key={product.id}
                        className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-500 border border-stone-100 group flex flex-col relative h-full"
                      >
                        <div className="aspect-[4/5] sm:aspect-square overflow-hidden relative bg-[#fafaf9] p-6 flex items-center justify-center border-b border-stone-100/60">
                          <div className="absolute inset-3 sm:inset-4 border border-stone-200/60 rounded-xl pointer-events-none z-10"></div>
                          <img
                            src={getPremiumImageUrl(product.image)}
                            alt={product.name}
                            className="w-full h-full object-contain mix-blend-multiply drop-shadow-md group-hover:scale-105 transition-transform duration-700 ease-out cursor-pointer relative z-0"
                            referrerPolicy="no-referrer"
                            onClick={() => setSelectedProduct(product)}
                          />

                          <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                            <button
                              onClick={() => setSelectedProduct(product)}
                              className="w-12 h-12 bg-white shadow-2xl rounded-2xl flex items-center justify-center text-stone-600 hover:text-rose-500 hover:scale-110 transition-all border border-stone-100"
                            >
                              <Eye className="w-6 h-6" />
                            </button>
                          </div>

                          <div className="absolute top-6 left-6 flex flex-col gap-2">
                            <div className="bg-white/90 backdrop-blur-sm shadow-sm text-stone-700 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-stone-100 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> {getCategoryName(product.category)}
                            </div>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <div className="bg-emerald-500 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 animate-pulse">
                                <Sparkles className="w-3 h-3" /> {t.offer}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="p-6 flex flex-col flex-1 relative bg-white">
                          <h3 className="text-lg font-bold text-stone-800 mb-2 line-clamp-2 leading-relaxed group-hover:text-rose-600 transition-colors tracking-tight">{product.name}</h3>
                          <div className="mt-auto pt-5 flex items-end justify-between border-t border-stone-100">
                            <div className="flex flex-col">
                              <span className="text-3xl font-black text-stone-900 tracking-tighter">₹{Math.round(product.price)}</span>
                              {product.originalPrice && product.originalPrice > product.price && (
                                <span className="text-xs font-bold text-stone-400 line-through decoration-rose-500/50 tracking-wide">₹{Math.round(product.originalPrice)}</span>
                              )}
                            </div>

                            {cartItem ? (
                              <div className="flex items-center gap-2 bg-stone-50 rounded-2xl p-1.5 border border-stone-100 shadow-inner">
                                <button onClick={() => updateQuantity(product.id, cartItem.quantity - 1)} className="w-10 h-10 flex items-center justify-center bg-white rounded-xl text-stone-500 shadow-sm hover:text-rose-500 hover:bg-rose-50 active:scale-90 transition-all border border-stone-100">
                                  <Minus className="w-4 h-4 font-bold" />
                                </button>
                                <span className="w-8 text-center text-sm font-black text-stone-800">
                                  {cartItem.quantity}
                                </span>
                                <button onClick={() => updateQuantity(product.id, cartItem.quantity + 1)} disabled={product.stock !== undefined && cartItem.quantity >= product.stock} className="w-10 h-10 flex items-center justify-center bg-stone-900 rounded-xl text-white shadow-xl hover:bg-stone-800 active:scale-90 transition-all disabled:opacity-50">
                                  <Plus className="w-4 h-4 font-bold" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => addToCart(product)}
                                disabled={product.stock !== undefined && product.stock <= 0}
                                className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all shadow-xl active:scale-90 relative overflow-hidden ${product.stock !== undefined && product.stock <= 0 ? 'bg-stone-100 text-stone-300 cursor-not-allowed' : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20 group-hover:rotate-6'}`}
                              >
                                {product.stock !== undefined && product.stock <= 0 ? (
                                  <X className="w-6 h-6" />
                                ) : (
                                  <Plus className="w-8 h-8 relative z-10" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-stone-200"
                >
                  <div className="bg-stone-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-stone-300" />
                  </div>
                  <h3 className="text-2xl font-black text-stone-900 mb-2">{t.noProducts}</h3>
                  <p className="text-stone-500 font-medium tracking-wide">Try adjusting your search or filter.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Premium Contact Section */}
        <section id="contact" className="py-24 bg-stone-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-rose-500/5 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="bg-white rounded-[3rem] overflow-hidden shadow-2xl shadow-stone-200/50 border border-stone-100">
              <div className="grid lg:grid-cols-2">
                <div className="p-10 md:p-20 flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                  <h2 className="text-4xl md:text-5xl font-black text-[#1a1a1a] mb-6 tracking-tight relative z-10">{t.getInTouch}</h2>
                  <p className="text-stone-500 mb-12 text-lg font-medium leading-relaxed relative z-10">{t.contactDesc}</p>

                  <div className="space-y-8 relative z-10">
                    <div className="flex items-start gap-5 group">
                      <div className="bg-stone-50 group-hover:bg-rose-500 group-hover:text-white p-4 rounded-2xl text-stone-600 transition-all duration-300 shadow-sm border border-stone-100">
                        <Phone className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mb-1.5">{t.callUs}</p>
                        <div className="flex flex-col gap-1.5">
                          <a href={`https://wa.me/${settings.whatsapp_1 || '916384137974'}`} target="_blank" rel="noopener noreferrer" className="text-stone-800 font-black text-xl hover:text-rose-500 transition-colors flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-[#25D366]" /> +{settings.whatsapp_1 || '91 6384137974'}
                          </a>
                          <a href={`https://wa.me/${settings.whatsapp_2 || '918940324030'}`} target="_blank" rel="noopener noreferrer" className="text-stone-800 font-black text-xl hover:text-rose-500 transition-colors flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-[#25D366]" /> +{settings.whatsapp_2 || '91 8940324030'}
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-5 group">
                      <div className="bg-stone-50 group-hover:bg-rose-500 group-hover:text-white p-4 rounded-2xl text-stone-600 transition-all duration-300 shadow-sm border border-stone-100">
                        <Mail className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mb-1.5">{t.emailUs}</p>
                        <a href="mailto:rappaniazzam@gmail.com" className="text-stone-800 font-black text-xl hover:text-rose-500 transition-colors">rappaniazzam@gmail.com</a>
                      </div>
                    </div>
                  </div>

                  <div className="mt-14 pt-10 border-t border-stone-100 flex flex-wrap gap-4 relative z-10">
                    <a href={`https://wa.me/${settings.whatsapp_1 || '916384137974'}`} target="_blank" rel="noopener noreferrer" className="bg-stone-50 hover:bg-[#25D366] text-stone-700 hover:text-white px-8 py-4 rounded-full transition-all hover:scale-105 active:scale-95 shadow-sm hover:shadow-[#25D366]/30 flex items-center gap-3 font-bold border border-stone-200 hover:border-transparent group">
                      <MessageCircle className="w-5 h-5 text-[#25D366] group-hover:text-white" /> Link 1
                    </a>
                    <a href={`https://wa.me/${settings.whatsapp_2 || '918940324030'}`} target="_blank" rel="noopener noreferrer" className="bg-stone-50 hover:bg-[#25D366] text-stone-700 hover:text-white px-8 py-4 rounded-full transition-all hover:scale-105 active:scale-95 shadow-sm hover:shadow-[#25D366]/30 flex items-center gap-3 font-bold border border-stone-200 hover:border-transparent group">
                      <MessageCircle className="w-5 h-5 text-[#25D366] group-hover:text-white" /> Link 2
                    </a>
                    <a href="https://instagram.com/frds_call_me_rappani" target="_blank" rel="noopener noreferrer" className="bg-stone-50 hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#e6683c] hover:to-[#bc1888] text-stone-600 hover:text-white p-4 rounded-full transition-all hover:scale-110 shadow-sm hover:shadow-[#bc1888]/30 border border-stone-200 hover:border-transparent">
                      <Instagram className="w-5 h-5" />
                    </a>
                  </div>
                </div>

                <a
                  href="https://maps.app.goo.gl/QwQ3ePTo52WKz6A79?g_st=aw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative min-h-[400px] lg:h-auto bg-stone-100 block cursor-pointer group overflow-hidden p-6"
                >
                  <div className="absolute inset-4 rounded-[2rem] overflow-hidden shadow-inner">
                    <img src={settings.location_image || "https://picsum.photos/seed/storefront/800/800"} alt="Store Location" className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-1000 ease-out" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/90 via-[#1a1a1a]/40 to-transparent"></div>
                    <div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl group-hover:bg-white/20 transition-all group-hover:-translate-y-2 duration-500">
                      <div className="flex items-center gap-3 text-white mb-3">
                        <div className="bg-rose-500 p-2 rounded-full shadow-lg shadow-rose-500/40">
                          <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-black text-xl">{t.addressTitle}</h3>
                      </div>
                      <p className="text-stone-200 text-sm font-medium leading-relaxed">{t.addressDesc}</p>
                      <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-white bg-white/20 px-4 py-2 rounded-full backdrop-blur-md">
                        Get Directions ↗
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Premium Footer */}
        <footer className="bg-[#0a0a0a] text-stone-400 py-16 border-t border-white/5 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-64 bg-rose-500/5 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="bg-rose-500/10 p-3 rounded-2xl border border-rose-500/20">
                <Store className="w-8 h-8 text-rose-500" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white">{t.storeName}</h2>
            </div>
            <p className="mb-10 font-medium text-stone-500">&copy; {new Date().getFullYear()} {t.rights}</p>
            <div className="flex items-center justify-center gap-2 text-[10px] text-stone-600 font-bold uppercase tracking-[0.2em]">
              <Database className="w-3.5 h-3.5" /> {t.storageStatus}
            </div>
          </div>
        </footer>
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 flex flex-col items-end gap-4 z-40">

        {/* Back to Top */}
        {showBackToTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-stone-900 text-white p-3.5 rounded-full shadow-xl hover:bg-rose-500 transition-all hover:scale-110 active:scale-95 animate-in fade-in zoom-in duration-300 border border-white/10"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}

        {/* WhatsApp Chat Button */}
        <a
          href={`https://wa.me/${settings.whatsapp_1 || '916384137974'}?text=Hi Rappani Store! 🛍️`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#25D366] text-white p-4 rounded-full shadow-[0_8px_30px_rgba(37,211,102,0.4)] hover:bg-[#20bd5a] transition-all hover:scale-110 active:scale-95 group flex items-center justify-center relative border-2 border-white/20"
        >
          <MessageCircle className="w-7 h-7" />
          <span className="absolute right-full mr-4 bg-white/95 backdrop-blur-md text-stone-800 text-xs font-black py-2.5 px-4 rounded-[1.25rem] shadow-xl opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap border border-stone-100">
            Chat with us! 👋
          </span>
          {/* Notification Badge */}
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-white"></span>
          </span>
        </a>
      </div>

      {/* Premium Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-[420px] bg-[#fdfdfd] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-500 sm:rounded-l-[2rem] overflow-hidden border-l border-white/20">
            {/* Header */}
            <div className="px-6 py-5 bg-white/90 backdrop-blur-xl border-b border-stone-100 flex items-center justify-between sticky top-0 z-20">
              <h2 className="text-xl font-extrabold text-stone-800 flex items-center gap-3">
                <div className="bg-rose-100 p-2.5 rounded-xl shadow-inner shadow-rose-200">
                  <ShoppingCart className="w-5 h-5 text-rose-500" />
                </div>
                {t.cart} <span className="bg-stone-800 text-white text-[10px] px-2.5 py-1 rounded-full">{cartItemsCount} Items</span>
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2.5 bg-stone-100 text-stone-500 hover:text-stone-800 hover:bg-stone-200 rounded-full transition-all shadow-sm border border-stone-200/50">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto hidden-scrollbar flex flex-col relative z-0">
              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-400 h-full min-h-[50vh]">
                  <div className="bg-white w-32 h-32 rounded-full flex items-center justify-center mb-6 shadow-sm border border-stone-100 relative">
                    <div className="absolute inset-0 bg-rose-500/10 rounded-full animate-ping opacity-75"></div>
                    <ShoppingBag className="w-12 h-12 text-stone-200 relative z-10" />
                  </div>
                  <h3 className="text-xl font-extrabold text-stone-700 mb-2">{t.emptyCart}</h3>
                  <p className="text-sm mb-6 text-stone-400">Looks like you haven't added anything yet.</p>
                  <button onClick={() => setIsCartOpen(false)} className="bg-rose-500 text-white px-8 py-3 rounded-full font-bold shadow-xl shadow-rose-500/30 hover:bg-rose-600 transition-all hover:-translate-y-1 active:scale-95">Start Shopping</button>
                </div>
              ) : (
                <div className="p-4 sm:p-6 flex flex-col gap-4">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4 rounded-2xl text-white shadow-lg shadow-emerald-500/20 flex gap-3 items-center mb-2">
                    <div className="bg-white/20 p-2.5 rounded-full backdrop-blur-sm text-lg leading-none flex items-center justify-center shadow-inner">✨</div>
                    <div>
                      <h4 className="font-bold text-sm tracking-wide">Fast Dispatch Available</h4>
                      <p className="text-[11px] text-white/90 font-medium">Clear payment to confirm your items.</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {cart.map(item => (
                      <div key={item.product.id} className="flex gap-4 bg-white p-3.5 rounded-2xl shadow-sm border border-stone-100/80 items-center justify-between group hover:shadow-md transition-all hover:border-stone-200">
                        <div className="flex gap-3 items-center">
                          <div className="w-[4.5rem] h-[4.5rem] p-2 rounded-xl bg-[#fafaf9] border border-stone-200/60 shadow-sm relative shrink-0 flex items-center justify-center">
                            <img src={getPremiumImageUrl(item.product.image)} alt={item.product.name} className="w-full h-full object-contain mix-blend-multiply drop-shadow-sm group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                          </div>
                          <div className="flex flex-col max-w-[140px]">
                            <h4 className="font-bold text-stone-800 text-sm line-clamp-2 leading-tight mb-1">{item.product.name}</h4>
                            <p className="font-black text-rose-500 text-sm tracking-tight">₹{Math.round(item.product.price)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 bg-stone-50 p-1 rounded-xl border border-stone-200/60 shadow-inner shrink-0">
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-2 text-stone-500 hover:text-rose-500 hover:bg-white hover:shadow-sm rounded-lg transition-all active:scale-90"><Minus className="w-3.5 h-3.5" /></button>
                          <span className="font-bold text-stone-800 text-xs min-w-[20px] text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-2 text-stone-500 hover:text-emerald-500 hover:bg-white hover:shadow-sm rounded-lg transition-all active:scale-90"><Plus className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Bottom Checkout Footer */}
            {cart.length > 0 && (
              <div className="bg-white border-t border-stone-100 shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.08)] z-20 shrink-0 relative flex flex-col max-h-[60vh]">
                <div className="p-5 sm:p-6 overflow-y-auto hidden-scrollbar pb-6">

                  {/* Delivery Method Selector */}
                  <div className="mb-5">
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2.5 ml-1">{t.deliveryMethod}</p>
                    <div className="grid grid-cols-2 gap-2 p-1.5 bg-stone-100 rounded-2xl border border-stone-200">
                      <button
                        onClick={() => setDeliveryMethod('pickup')}
                        className={`flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${deliveryMethod === 'pickup' ? 'bg-white text-stone-900 shadow-md ring-1 ring-stone-200' : 'text-stone-500 hover:text-stone-700'}`}
                      >
                        <Store className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-tighter leading-none">{t.shopPickup}</span>
                      </button>
                      <button
                        onClick={() => {
                          setDeliveryMethod('home');
                          if (locationStatus === 'idle') refreshLocation();
                        }}
                        className={`flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${deliveryMethod === 'home' ? 'bg-white text-stone-900 shadow-md ring-1 ring-stone-200' : 'text-stone-500 hover:text-stone-700'}`}
                      >
                        <Rocket className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-tighter leading-none">{t.homeDelivery}</span>
                      </button>
                    </div>
                  </div>

                  {/* Delivery Info Section */}
                  {deliveryMethod === 'home' && (
                    <div className="bg-stone-50/50 p-4 rounded-2xl border border-stone-100 mb-5 space-y-3">
                      <div className="flex justify-between items-start text-[10px] font-black tracking-widest text-stone-400">
                        <div className="flex flex-col gap-1.5 uppercase">
                          {distance !== null ? (
                            <div className="flex items-center gap-2">
                              <span className={`flex items-center gap-1.5 ${distance > 3 ? 'text-red-500' : 'text-stone-600'}`}>
                                <MapPin className="w-3.5 h-3.5" />
                                {distance.toFixed(1)}KM {t.distanceToStore}
                              </span>
                              <button
                                onClick={refreshLocation}
                                className="bg-stone-100 hover:bg-stone-200 p-1.5 rounded-lg text-stone-500 transition-all active:scale-95"
                                title={t.refreshLocation}
                              >
                                <Aperture className={`w-3.5 h-3.5 ${locationStatus === 'checking' ? 'animate-spin text-rose-500' : ''}`} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2">
                              <span className="flex items-center gap-1.5 text-stone-400">
                                {locationStatus === 'checking' ? (
                                  <><div className="w-3 h-3 border-2 border-stone-300 border-t-stone-500 rounded-full animate-spin" /> {t.calculatingLocation}</>
                                ) : (
                                  <><Info className="w-3.5 h-3.5 text-amber-500" /> {t.locationBlocked}</>
                                )}
                              </span>
                              {locationStatus !== 'checking' && (
                                <button
                                  onClick={refreshLocation}
                                  className="bg-stone-900 hover:bg-stone-800 text-white px-3 py-2 rounded-xl flex items-center gap-2 text-[10px] uppercase font-black transition-all shadow-md active:scale-95 w-max"
                                >
                                  <Aperture className="w-3.5 h-3.5" /> {t.refreshLocation}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                        {distance !== null && distance > 3 && (
                          <span className="text-red-500 font-black animate-pulse px-2 py-1 bg-red-50 rounded-lg border border-red-100">OVER LIMIT</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-stone-500 uppercase tracking-widest">{t.deliveryFee}</span>
                        <span className={`font-black text-sm ${deliveryFee === 0 ? 'text-emerald-500' : 'text-stone-900'}`}>
                          {deliveryFee === 0 ? t.freeDelivery : `₹${deliveryFee}`}
                        </span>
                      </div>

                      <textarea
                        placeholder={t.enterAddress}
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className={`w-full px-4 py-3 bg-white border rounded-xl text-sm font-bold outline-none transition-all focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 text-stone-800 placeholder:text-stone-400 placeholder:font-medium mb-1 resize-none h-20 ${checkoutError && !deliveryAddress ? 'border-red-400 bg-red-50/50' : 'border-stone-200'}`}
                      />
                    </div>
                  )}

                  <div className="flex items-end justify-between mb-5">
                    <span className="text-stone-500 font-bold uppercase tracking-widest text-[11px] flex items-center gap-1.5"><ShoppingBag className="w-3.5 h-3.5" /> Total Amount</span>
                    <span className="text-3xl font-black text-stone-900 tracking-tight relative group cursor-default">
                      <span className="absolute -inset-1 bg-rose-500/10 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      <span className="relative">₹{finalTotal}</span>
                    </span>
                  </div>

                  {/* Customer Details Form */}
                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/60 mb-5 relative overflow-hidden transition-all shadow-sm">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                    <div className="space-y-3 pl-1.5">
                      <div className="relative group">
                        <input
                          type="text"
                          placeholder={t.nameLabel}
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className={`w-full px-4 py-3 bg-white border rounded-xl text-sm font-bold outline-none transition-all focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-stone-800 placeholder:text-stone-400 placeholder:font-medium ${checkoutError && !customerName ? 'border-red-400 bg-red-50/50' : 'border-stone-200 group-hover:border-stone-300'}`}
                        />
                      </div>
                      <div className="relative group">
                        <input
                          type="tel"
                          placeholder={t.phoneLabel}
                          value={customerPhone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            if (val !== customerPhone) {
                              setCustomerPhone(val);
                              setIsPhoneVerified(false);
                              if (val.length !== 10) {
                                setIsOtpSent(false);
                                setMockOtp(null);
                              }
                            }
                          }}
                          disabled={isPhoneVerified}
                          maxLength={10}
                          className={`w-full px-4 py-3 bg-white border rounded-xl text-sm font-bold tracking-widest outline-none transition-all focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-stone-800 placeholder:text-stone-400 placeholder:font-medium placeholder:tracking-normal ${checkoutError && (!customerPhone || !isPhoneVerified) ? 'border-red-400 bg-red-50/50' : 'border-stone-200 group-hover:border-stone-300'} ${isPhoneVerified ? 'bg-stone-100 text-stone-400 border-dashed cursor-not-allowed' : ''}`}
                        />

                        {!isPhoneVerified && !isOtpSent && customerPhone.length === 10 && (
                          <button onClick={handleSendOtp} disabled={isSendingOtp} className="mt-2.5 w-full text-xs bg-stone-900 hover:bg-stone-800 text-white py-3 rounded-xl font-extrabold uppercase tracking-widest transition-all shadow-md active:scale-95 flex justify-center items-center gap-2">
                            {isSendingOtp ? 'SENDING...' : t.sendOtp}
                          </button>
                        )}

                        {isOtpSent && !isPhoneVerified && (
                          <div className="flex flex-col gap-2 mt-2.5 animate-in fade-in slide-in-from-top-2">
                            {mockOtp && (
                              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl mb-1">
                                <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5" /> Test Mode: Enter this OTP
                                </p>
                                <div className="flex gap-2">
                                  {mockOtp.split('').map((digit, i) => (
                                    <span key={i} className="flex-1 bg-white border border-amber-300 py-2 rounded-lg text-center font-black text-amber-600 text-lg shadow-sm">{digit}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div className="flex gap-2 items-center">
                              <input
                                type="text"
                                maxLength={4}
                                value={otpInput}
                                onChange={e => setOtpInput(e.target.value.replace(/[^0-9]/g, ''))}
                                placeholder="Enter 4-digit OTP"
                                className="w-full px-4 py-3 bg-white border border-stone-300 rounded-xl text-lg font-black tracking-[0.3em] text-center outline-none focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 shadow-inner"
                              />
                              <button onClick={handleVerifyOtp} disabled={isVerifyingOtp} className="whitespace-nowrap bg-stone-900 hover:bg-stone-800 text-white px-6 py-3 rounded-xl font-extrabold text-[11px] uppercase tracking-widest transition-all shadow-md active:scale-95 shrink-0 flex items-center justify-center min-w-[100px] border border-stone-800">
                                {isVerifyingOtp ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : t.verifyOtp}
                              </button>
                            </div>
                            <button
                              onClick={() => { setIsOtpSent(false); setMockOtp(null); }}
                              className="text-[10px] text-stone-400 font-bold uppercase tracking-widest hover:text-rose-500 transition-colors self-center p-2"
                            >
                              Wrong number? Change it
                            </button>
                          </div>
                        )}

                        {isPhoneVerified && (
                          <p className="text-[11px] text-emerald-600 font-extrabold mt-2 flex items-center gap-1.5 bg-emerald-50 py-2 px-3 rounded-xl border border-emerald-100 w-max tracking-wide uppercase"><ShieldCheck className="w-4 h-4" /> Verified Identity</p>
                        )}
                      </div>
                    </div>
                    {checkoutError && <p className="text-[11px] text-red-600 bg-red-50 font-bold mt-3 p-2.5 rounded-xl border border-red-100 flex gap-2 items-center tracking-wide"><ShieldCheck className="w-4 h-4 shrink-0 text-red-500" /> {checkoutError}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="col-span-2 bg-stone-100 p-4 rounded-2xl border border-stone-200 flex items-center gap-4 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-tr from-stone-200/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="bg-white p-1.5 rounded-xl shadow-sm border border-stone-200 shrink-0 relative z-10">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`upi://pay?pa=mohammedazzam200512@okaxis&pn=MOHAMMED AZZAM M&tr=RAPTXN12345&tn=RappaniStore&am=${Math.round(cartTotalAmount)}&cu=INR`)}`}
                          alt="Scan to Pay"
                          className="w-14 h-14 rounded-lg mix-blend-multiply"
                        />
                      </div>
                      <div className="relative z-10 overflow-hidden">
                        <p className="text-[10px] font-black text-stone-500 mb-0.5 uppercase tracking-widest">Verify & Scan</p>
                        <p className="text-[11px] text-stone-800 font-bold tracking-wider truncate">mohammedazzam200512@okaxis</p>
                      </div>
                    </div>

                    <button
                      onClick={handleGPayCheckout}
                      className="col-span-2 bg-[#202124] hover:bg-black text-white py-4 rounded-2xl font-extrabold text-[15px] transition-all hover:shadow-xl hover:shadow-[#202124]/30 active:scale-[0.98] flex flex-col items-center justify-center gap-0.5 cursor-pointer relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 flex">
                        <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out"></div>
                      </div>
                      <div className="flex items-center gap-2 relative z-10">
                        📋 COPY UPI ID & PAY
                      </div>
                      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-[0.2em] relative z-10">100% Secure • Bank Bypass</span>
                    </button>

                    <button
                      onClick={handleWhatsAppCheckout}
                      className="col-span-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-4 rounded-2xl font-extrabold text-[15px] transition-all hover:shadow-xl hover:shadow-[#25D366]/30 active:scale-[0.98] flex items-center justify-center gap-2 relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 flex">
                        <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out"></div>
                      </div>
                      <MessageCircle className="w-5 h-5 fill-white/20 relative z-10" /> <span className="relative z-10 uppercase tracking-wide">Buy through WhatsApp</span>
                    </button>
                  </div>

                  {showGPayConfirm && (
                    <div className="mt-2 bg-[#1C1C1E] p-5 sm:p-6 rounded-2xl border border-stone-800 flex flex-col items-center justify-center transition-all animate-in zoom-in-95 duration-300 text-center shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl translate-x-12 -translate-y-12 pointer-events-none"></div>
                      <p className="font-extrabold text-white text-sm mb-2 flex items-center gap-2 uppercase tracking-wide"><ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" /> Secure Verification</p>
                      <p className="text-[11px] text-stone-400 mb-5 font-medium px-2 leading-relaxed tracking-wide">Please copy and paste the 12-digit UPI Reference / UTR Number from your banking app to confirm the order.</p>
                      <input
                        type="text"
                        placeholder="e.g. 412345678901"
                        maxLength={12}
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full text-center tracking-[0.25em] font-mono p-4 bg-black/50 text-emerald-400 rounded-xl border border-stone-700 mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-black placeholder:text-stone-700 text-lg shadow-inner"
                      />
                      <button
                        onClick={handleGPayConfirm}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2 text-sm uppercase tracking-widest relative overflow-hidden group"
                      >
                        <span className="relative z-10 flex items-center gap-2">Confirm Payment <ShieldCheck className="w-4 h-4" /></span>
                        <div className="absolute inset-0 bg-white/20 w-full h-full -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-in-out blur-md"></div>
                      </button>
                      <button onClick={() => setShowGPayConfirm(false)} className="mt-4 text-[11px] text-stone-500 hover:text-white uppercase font-bold tracking-[0.1em] transition-colors p-2">Close / Go Back</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-stone-950/80 backdrop-blur-xl"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:grid md:grid-cols-2 max-h-[90vh]"
            >
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-6 right-6 w-12 h-12 bg-white/80 backdrop-blur-md hover:bg-rose-100 text-stone-500 hover:text-rose-600 rounded-full flex items-center justify-center transition-all z-20 shadow-md border border-stone-100"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="h-full bg-[#fafaf9] flex items-center justify-center p-8 md:p-14 relative overflow-hidden xl:border-r border-stone-100">
                <div className="absolute inset-6 md:inset-8 border border-stone-200/80 rounded-2xl pointer-events-none z-20"></div>
                <img
                  src={getPremiumImageUrl(selectedProduct.image)}
                  alt={selectedProduct.name}
                  className="w-full h-full object-contain mix-blend-multiply drop-shadow-xl relative z-10 hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="p-8 md:p-12 flex flex-col h-full overflow-y-auto">
                <div className="flex items-center gap-3 mb-6">
                  <span className="px-4 py-1.5 bg-rose-50 text-rose-600 rounded-full text-xs font-black uppercase tracking-widest border border-rose-100">
                    {getCategoryName(selectedProduct.category)}
                  </span>
                  {selectedProduct.stock !== undefined && selectedProduct.stock > 0 ? (
                    <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {t.stockAvailable}
                    </span>
                  ) : (
                    <span className="px-4 py-1.5 bg-red-50 text-red-600 rounded-full text-xs font-black uppercase tracking-widest border border-red-100">
                      {t.outOfStock}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-4 h-4 ${s <= 4 ? 'text-amber-400 fill-amber-400' : 'text-stone-200 fill-stone-200'}`} />
                  ))}
                  <span className="text-xs font-bold text-stone-400 ml-2">(4.8/5)</span>
                  <span className="ml-auto bg-stone-900 text-white text-[9px] font-black uppercase px-2 py-1 rounded flex items-center gap-1 leading-none tracking-tighter">
                    <TrendingUp className="w-3 h-3 text-rose-400" /> Best Seller
                  </span>
                </div>

                <h2 className="text-3xl md:text-4xl font-black text-stone-900 mb-6 leading-tight">{selectedProduct.name}</h2>

                <div className="flex items-end gap-3 mb-10 pb-10 border-b border-stone-100">
                  <span className="text-5xl font-black text-stone-900 tracking-tighter">₹{Math.round(selectedProduct.price)}</span>
                  {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                    <div className="flex flex-col mb-1">
                      <span className="text-base text-stone-400 line-through decoration-rose-500 font-bold tracking-tight">₹{Math.round(selectedProduct.originalPrice)}</span>
                      <span className="text-emerald-500 text-xs font-black uppercase tracking-widest">
                        Save {Math.round(((selectedProduct.originalPrice - selectedProduct.price) / selectedProduct.originalPrice) * 100)}% OFF
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-auto flex flex-col gap-4">
                  {cart.find(c => c.product.id === selectedProduct.id) ? (
                    <div className="flex items-center justify-between bg-stone-50 p-6 rounded-3xl border border-stone-100 shadow-inner">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">In your cart</span>
                        <span className="text-stone-800 font-black text-xl">{cart.find(c => c.product.id === selectedProduct.id)?.quantity} Items</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(selectedProduct.id, (cart.find(c => c.product.id === selectedProduct.id)?.quantity || 1) - 1)} className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl text-rose-500 shadow-sm hover:bg-rose-50 transition-all border border-stone-100">
                          <Minus className="w-5 h-5 font-bold" />
                        </button>
                        <button onClick={() => updateQuantity(selectedProduct.id, (cart.find(c => c.product.id === selectedProduct.id)?.quantity || 1) + 1)} disabled={selectedProduct.stock !== undefined && (cart.find(c => c.product.id === selectedProduct.id)?.quantity || 0) >= selectedProduct.stock} className="w-12 h-12 flex items-center justify-center bg-stone-900 rounded-2xl text-white shadow-xl hover:bg-stone-800 transition-all disabled:opacity-50">
                          <Plus className="w-5 h-5 font-bold" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(selectedProduct)}
                      disabled={selectedProduct.stock !== undefined && selectedProduct.stock <= 0}
                      className="w-full bg-rose-500 hover:bg-rose-600 text-white py-6 rounded-[2rem] font-black text-xl shadow-2xl shadow-rose-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-4 disabled:opacity-50"
                    >
                      <ShoppingCart className="w-6 h-6" /> {t.addToCart}
                    </button>
                  )}

                  <a
                    href={`https://wa.me/${settings.whatsapp_1 || '916384137974'}?text=Hi, I'm interested in: ${selectedProduct.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-stone-50 hover:bg-[#25D366] text-stone-600 hover:text-white py-5 rounded-[2rem] font-bold text-base transition-all flex items-center justify-center gap-3 border border-stone-200 hover:border-transparent group"
                  >
                    <MessageCircle className="w-5 h-5 text-[#25D366] group-hover:text-white" /> {t.shareProduct}
                  </a>

                  {/* Related Products */}
                  <div className="mt-10 pt-10 border-t border-stone-100">
                    <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-rose-500" /> You might also like
                    </h3>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                      {products
                        .filter(p => p.category === selectedProduct.category && p.id !== selectedProduct.id)
                        .slice(0, 4)
                        .map(p => (
                          <div
                            key={p.id}
                            onClick={() => setSelectedProduct(p)}
                            className="min-w-[140px] group cursor-pointer"
                          >
                            <div className="aspect-square bg-[#fafaf9] rounded-xl p-3 mb-3 border border-stone-200/60 shadow-sm group-hover:border-stone-300 transition-all overflow-hidden flex items-center justify-center relative">
                              <img src={getPremiumImageUrl(p.image)} alt={p.name} className="w-full h-full object-contain mix-blend-multiply drop-shadow-sm group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <h4 className="text-xs font-bold text-stone-800 line-clamp-1 group-hover:text-rose-500 transition-colors uppercase tracking-tight">{p.name}</h4>
                            <p className="text-xs font-black text-stone-900 mt-0.5">₹{Math.round(p.price)}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Stationary': return 'bg-blue-100 text-blue-700';
    case 'Fancy': return 'bg-purple-100 text-purple-700';
    case 'Toys': return 'bg-yellow-100 text-yellow-700';
    case 'Sports Items': return 'bg-orange-100 text-orange-700';
    case 'Snacks': return 'bg-green-100 text-green-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

// --- Admin Panel ---
function AdminPanel({ products, setProducts, settings, setSettings }: { products: Product[], setProducts: React.Dispatch<React.SetStateAction<Product[]>>, settings: Record<string, string>, setSettings: React.Dispatch<React.SetStateAction<Record<string, string>>> }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Admin section Tabs
  const [adminTab, setAdminTab] = useState<'products' | 'orders'>('products');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  useEffect(() => {
    if (isAuthenticated && adminTab === 'orders') {
      setIsLoadingOrders(true);
      fetchOrders().then(setOrders).catch(console.error).finally(() => setIsLoadingOrders(false));
    }
  }, [isAuthenticated, adminTab]);

  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    setDeletingOrderId(orderId);
    try {
      await deleteOrder(orderId);
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (err) {
      console.error("Failed to delete order", err);
    } finally {
      setDeletingOrderId(null);
    }
  };

  const handleMarkDelivered = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, 'Completed');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Completed' } : o));
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product>({ id: '', name: '', category: 'Stationary', price: 0, originalPrice: '' as unknown as number, stock: '' as unknown as number, image: '' });
  const [formError, setFormError] = useState('');

  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const locationImageRef = useRef<HTMLInputElement>(null);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);

  const heroImageRef = useRef<HTMLInputElement>(null);
  const [isUpdatingHero, setIsUpdatingHero] = useState(false);

  const handleLocationImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUpdatingLocation(true);
      try {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const dataUrl = reader.result as string;
          const imageUrl = await uploadImage(dataUrl);
          await updateSetting('location_image', imageUrl);
          setSettings(prev => ({ ...prev, location_image: imageUrl }));
          setIsUpdatingLocation(false);
        };
        reader.readAsDataURL(file);
      } catch (err) {
        console.error("Upload failed", err);
        setIsUpdatingLocation(false);
      }
    }
  };

  const handleHeroImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUpdatingHero(true);
      try {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const dataUrl = reader.result as string;
          const imageUrl = await uploadImage(dataUrl);
          await updateSetting('hero_image', imageUrl);
          setSettings(prev => ({ ...prev, hero_image: imageUrl }));
          setIsUpdatingHero(false);
        };
        reader.readAsDataURL(file);
      } catch (err) {
        console.error("Upload failed", err);
        setIsUpdatingHero(false);
      }
    }
  };

  const [isUploading, setIsUploading] = useState(false);

  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passForm, setPassForm] = useState({ current: '', new: '', confirm: '' });
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  const [whatsappForm, setWhatsappForm] = useState({
    whatsapp_1: settings.whatsapp_1 || '',
    whatsapp_2: settings.whatsapp_2 || ''
  });
  const [isUpdatingWhatsapp, setIsUpdatingWhatsapp] = useState(false);
  const [whatsappSuccess, setWhatsappSuccess] = useState('');

  const handleWhatsappUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingWhatsapp(true);
    setWhatsappSuccess('');
    try {
      if (whatsappForm.whatsapp_1) await updateSetting('whatsapp_1', whatsappForm.whatsapp_1);
      if (whatsappForm.whatsapp_2) await updateSetting('whatsapp_2', whatsappForm.whatsapp_2);
      setSettings(prev => ({ ...prev, whatsapp_1: whatsappForm.whatsapp_1, whatsapp_2: whatsappForm.whatsapp_2 }));
      setWhatsappSuccess('WhatsApp numbers updated successfully!');
    } catch (err) {
      console.error("Failed to update whatsapp numbers", err);
    } finally {
      setIsUpdatingWhatsapp(false);
      setTimeout(() => setWhatsappSuccess(''), 3000);
    }
  };

  const [upiForm, setUpiForm] = useState({ upi_id: settings.upi_id || '' });
  const [isUpdatingUpi, setIsUpdatingUpi] = useState(false);
  const [upiSuccess, setUpiSuccess] = useState('');

  const handleUpiUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingUpi(true);
    setUpiSuccess('');
    try {
      if (upiForm.upi_id) await updateSetting('upi_id', upiForm.upi_id);
      setSettings(prev => ({ ...prev, upi_id: upiForm.upi_id }));
      setUpiSuccess('UPI ID updated successfully!');
    } catch (err) {
      console.error("Failed to update UPI", err);
    } finally {
      setIsUpdatingUpi(false);
      setTimeout(() => setUpiSuccess(''), 3000);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const dataUrl = reader.result as string;
          const imageUrl = await uploadImage(dataUrl);
          setCurrentProduct({ ...currentProduct, image: imageUrl });
          setFormError('');
          setIsUploading(false);
        };
        reader.readAsDataURL(file);
      } catch (err) {
        console.error("Upload failed", err);
        setFormError("Image upload failed. Please try again.");
        setIsUploading(false);
      }
    }
  };

  const triggerCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const triggerGallery = () => {
    if (galleryInputRef.current) {
      galleryInputRef.current.click();
    }
  };

  const startCamera = async () => {
    setFormError('');
    try {
      stopCamera();

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Your browser does not support camera access.");
      }

      let stream: MediaStream;
      try {
        // Try with ideal constraints first (back camera)
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
      } catch (e) {
        console.warn("Ideal constraints failed, trying simple video access", e);
        // Fallback to any available camera
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Important: Wait for metadata to load before playing
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch(err => {
              console.error("Video play failed:", err);
              setFormError("Camera started but could not play video. Try clicking the camera icon again.");
            });
          }
        };
      }
      setIsCameraOpen(true);
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      let msg = "Could not access the camera.";
      if (err.name === 'NotAllowedError') msg = "Camera permission denied. Please allow camera access in your browser settings.";
      if (err.name === 'NotFoundError') msg = "No camera found on this device.";
      setFormError(msg);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setIsUploading(true);
        try {
          const imageUrl = await uploadImage(dataUrl);
          setCurrentProduct({ ...currentProduct, image: imageUrl });
          stopCamera();
        } catch (err) {
          console.error("Upload failed", err);
          setFormError("Image upload failed. Please try again.");
        } finally {
          setIsUploading(false);
        }
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      setIsAuthenticated(true);
      setError('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (passForm.new !== passForm.confirm) {
      setPassError('New passwords do not match');
      return;
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passForm.current,
          newPassword: passForm.new
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');

      setPassSuccess('Password changed successfully!');
      setPassForm({ current: '', new: '', confirm: '' });
      setTimeout(() => {
        setShowPasswordChange(false);
        setPassSuccess('');
      }, 2000);
    } catch (err: any) {
      setPassError(err.message);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct.name || !currentProduct.price || !currentProduct.image) {
      setFormError('Please fill in all required fields.');
      return;
    }
    setFormError('');

    const productToSave = isEditing
      ? { ...currentProduct }
      : { ...currentProduct, id: Date.now().toString() };

    try {
      await saveProduct(productToSave, isEditing);

      if (isEditing) {
        setProducts(prev => prev.map(p => p.id === productToSave.id ? productToSave : p));
      } else {
        setProducts(prev => [...prev, productToSave]);
      }

      setCurrentProduct({ id: '', name: '', category: 'Stationary', price: 0, originalPrice: '' as unknown as number, image: '' });
      setIsEditing(false);
    } catch (err) {
      console.error("Save failed", err);
      setFormError("Failed to save product to server.");
    }
  };

  const handleEdit = (product: Product) => {
    setCurrentProduct({ ...product });
    setIsEditing(true);
    setFormError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    console.log(`Frontend: handleDelete called for ID: ${id}`);
    setDeletingId(id);
    setFormError('');

    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      console.log(`Frontend: Successfully deleted product ID: ${id}`);
    } catch (err: any) {
      console.error("Delete failed", err);
      setFormError(`Failed to delete product: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 -left-20 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>

        <div className="bg-white/95 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl max-w-md w-full border border-white/20 relative z-10">
          <div className="text-center mb-10">
            <div className="bg-gradient-to-br from-rose-500 to-rose-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-6 shadow-lg shadow-rose-500/30">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-black text-stone-900 tracking-tight">Admin Access</h2>
            <p className="text-stone-500 mt-2 font-medium">Secure dashboard login</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-stone-100 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all bg-stone-50/50"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100">
                {error}
              </div>
            )}
            <button type="submit" className="w-full bg-stone-900 hover:bg-stone-800 text-white py-4 rounded-2xl font-bold transition-all hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2">
              Unlock Dashboard <ArrowUp className="w-5 h-5 rotate-90" />
            </button>
            <button type="button" onClick={() => navigate('/')} className="w-full text-stone-400 hover:text-stone-600 py-2 text-sm font-bold transition-colors">
              ← Return to Store
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-12">
      <header className="bg-stone-900 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Store className="w-6 h-6 text-rose-400" />
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setShowPasswordChange(!showPasswordChange)}
              className="flex items-center gap-2 bg-stone-800 hover:bg-stone-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-rose-400 border border-rose-500/30"
            >
              <Lock className="w-4 h-4" />
              <span>Change Password</span>
            </button>
            <div className="hidden lg:flex items-center gap-2 text-xs text-stone-400 bg-stone-800 px-3 py-1 rounded-full border border-stone-700">
              <Database className="w-3 h-3" /> Dedicated Storage Active
            </div>
            <button onClick={() => navigate('/')} className="text-sm font-medium text-stone-300 hover:text-white transition-colors hidden sm:block">View Store</button>
            <button onClick={handleLogout} className="flex items-center gap-2 bg-stone-800 hover:bg-stone-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex items-center gap-4">
            <div className="bg-rose-50 p-3 rounded-xl text-rose-500">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Total Products</p>
              <h3 className="text-2xl font-bold text-stone-900">{products.length}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-xl text-blue-500">
              <LayoutGrid className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Categories</p>
              <h3 className="text-2xl font-bold text-stone-900">{new Set(products.map(p => p.category)).size}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex items-center gap-4">
            <div className="bg-emerald-50 p-3 rounded-xl text-emerald-500">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Database Status</p>
              <h3 className="text-sm font-bold text-emerald-600">Connected & Syncing</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-orange-50 p-3 rounded-xl text-orange-500">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Store Location</p>
                <h3 className="text-sm font-bold text-stone-900 mt-1">Update Background</h3>
              </div>
            </div>
            <div className="relative">
              <input type="file" ref={locationImageRef} accept="image/*" onChange={handleLocationImageChange} className="hidden" />
              <button disabled={isUpdatingLocation} onClick={() => locationImageRef.current?.click()} className="flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-stone-200">
                {isUpdatingLocation ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-stone-600"></div> : <Camera className="w-4 h-4" />}
                {isUpdatingLocation ? 'Uploading...' : 'Upload Image'}
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-purple-50 p-3 rounded-xl text-purple-500">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Welcome Banner</p>
                <h3 className="text-sm font-bold text-stone-900 mt-1">Update Background</h3>
              </div>
            </div>
            <div className="relative">
              <input type="file" ref={heroImageRef} accept="image/*" onChange={handleHeroImageChange} className="hidden" />
              <button disabled={isUpdatingHero} onClick={() => heroImageRef.current?.click()} className="flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-stone-200">
                {isUpdatingHero ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-stone-600"></div> : <Camera className="w-4 h-4" />}
                {isUpdatingHero ? 'Uploading...' : 'Upload Image'}
              </button>
            </div>
          </div>
        </div>

        {/* WhatsApp Management */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#25D366]/10 p-2 rounded-xl text-[#25D366]">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-stone-900">Manage WhatsApp Numbers</h2>
          </div>
          <form onSubmit={handleWhatsappUpdate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">WhatsApp 1 (E.g. 916384137974)</label>
              <input
                type="text"
                value={whatsappForm.whatsapp_1}
                onChange={(e) => setWhatsappForm({ ...whatsappForm, whatsapp_1: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-2 focus:ring-[#25D366] outline-none"
                placeholder="Include country code, no + or spaces"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">WhatsApp 2</label>
              <input
                type="text"
                value={whatsappForm.whatsapp_2}
                onChange={(e) => setWhatsappForm({ ...whatsappForm, whatsapp_2: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-2 focus:ring-[#25D366] outline-none"
                placeholder="Secondary Number"
              />
            </div>
            <div className="flex gap-4 items-end">
              <button
                type="submit"
                disabled={isUpdatingWhatsapp}
                className="bg-[#25D366] hover:bg-[#22c35e] text-white px-6 py-2 rounded-lg font-bold transition-colors shadow-lg shadow-[#25D366]/20 disabled:opacity-50 h-10 flex items-center justify-center min-w-[120px]"
              >
                {isUpdatingWhatsapp ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : 'Save Changes'}
              </button>
            </div>
          </form>
          {whatsappSuccess && (
            <p className="mt-4 text-green-600 font-medium text-sm animate-in fade-in slide-in-from-top-2">{whatsappSuccess}</p>
          )}
        </div>

        {/* UPI Management */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#1A73E8]/10 p-2 rounded-xl text-[#1A73E8] flex items-center justify-center">
              <span className="text-xl font-bold">₹</span>
            </div>
            <h2 className="text-xl font-bold text-stone-900">Manage GPay / UPI Options</h2>
          </div>
          <p className="text-stone-500 mb-4 text-sm font-medium">To use the direct GPay button, set your phone number's exact original UPI ID. E.g. 8940324030@okicici, 8940324030@ybl, etc. Or just use your business UPI ID.</p>
          <form onSubmit={handleUpiUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end max-w-2xl">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">UPI ID (VPA)</label>
              <input
                type="text"
                value={upiForm.upi_id}
                onChange={(e) => setUpiForm({ ...upiForm, upi_id: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-2 focus:ring-[#1A73E8] outline-none"
                placeholder="e.g. 8940324030@upi"
              />
            </div>
            <div className="flex gap-4 items-end">
              <button
                type="submit"
                disabled={isUpdatingUpi}
                className="bg-[#1A73E8] hover:bg-[#155ebb] text-white px-6 py-2 rounded-lg font-bold transition-colors shadow-lg shadow-[#1A73E8]/20 disabled:opacity-50 h-10 flex items-center justify-center min-w-[120px]"
              >
                {isUpdatingUpi ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : 'Save Changes'}
              </button>
            </div>
          </form>
          {upiSuccess && (
            <p className="mt-4 text-green-600 font-medium text-sm animate-in fade-in slide-in-from-top-2">{upiSuccess}</p>
          )}
        </div>

        {showPasswordChange && (
          <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-stone-200 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-rose-500" /> Change Admin Password
              </h3>
              <button onClick={() => setShowPasswordChange(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Current Password</label>
                <input
                  type="password"
                  value={passForm.current}
                  onChange={(e) => setPassForm({ ...passForm, current: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-2 focus:ring-rose-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">New Password</label>
                <input
                  type="password"
                  value={passForm.new}
                  onChange={(e) => setPassForm({ ...passForm, new: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-2 focus:ring-rose-500 outline-none"
                  required
                />
              </div>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={passForm.confirm}
                    onChange={(e) => setPassForm({ ...passForm, confirm: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-2 focus:ring-rose-500 outline-none"
                    required
                  />
                </div>
                <button type="submit" className="bg-stone-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-stone-800 transition-colors">
                  Update
                </button>
              </div>
            </form>
            {passError && <p className="mt-2 text-red-500 text-sm font-medium">{passError}</p>}
            {passSuccess && <p className="mt-2 text-green-600 text-sm font-medium">{passSuccess}</p>}
          </div>
        )}

        {formError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
            <X className="w-5 h-5 flex-shrink-0 cursor-pointer" onClick={() => setFormError('')} />
            <p className="text-sm font-semibold">{formError}</p>
          </div>
        )}

        <div className="flex gap-4 mb-6 border-b border-stone-200 pb-4">
          <button
            onClick={() => setAdminTab('products')}
            className={`px-6 py-2 font-bold rounded-lg transition-colors ${adminTab === 'products' ? 'bg-rose-500 text-white shadow-md' : 'bg-white text-stone-500 hover:bg-stone-100'}`}
          >
            Manage Products
          </button>
          <button
            onClick={() => setAdminTab('orders')}
            className={`px-6 py-2 font-bold rounded-lg transition-colors flex items-center gap-2 ${adminTab === 'orders' ? 'bg-rose-500 text-white shadow-md' : 'bg-white text-stone-500 hover:bg-stone-100'}`}
          >
            Manage Orders
            {orders.length > 0 && adminTab !== 'orders' && <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full">{orders.filter(o => o.status === 'Pending').length}</span>}
          </button>
        </div>

        {adminTab === 'products' ? (
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 lg:sticky lg:top-24">
                <h2 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                  {isEditing ? <Edit className="w-5 h-5 text-rose-500" /> : <Plus className="w-5 h-5 text-rose-500" />}
                  {isEditing ? 'Edit Product' : 'Add New Product'}
                </h2>
                <form onSubmit={handleSaveProduct} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Product Name</label>
                    <input type="text" value={currentProduct.name} onChange={e => setCurrentProduct({ ...currentProduct, name: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-500 outline-none" placeholder="e.g., Premium Notebook" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
                    <select value={currentProduct.category} onChange={e => setCurrentProduct({ ...currentProduct, category: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-500 outline-none">
                      <option value="Stationary">Stationary</option>
                      <option value="Fancy">Fancy</option>
                      <option value="Toys">Toys</option>
                      <option value="Sports Items">Sports Items</option>
                      <option value="Snacks">Snacks</option>
                      <option value="Offers">Offers (Special)</option>
                    </select>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-stone-700 mb-1">Price (₹)</label>
                      <input type="number" value={currentProduct.price || ''} onChange={e => setCurrentProduct({ ...currentProduct, price: Number(e.target.value) })} className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-500 outline-none" placeholder="150" required min="1" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-stone-700 mb-1">Original Price (₹)</label>
                      <input type="number" value={currentProduct.originalPrice || ''} onChange={e => setCurrentProduct({ ...currentProduct, originalPrice: Number(e.target.value) || undefined })} className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Optional" min="1" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-stone-700 mb-1">Stock (Max Qty)</label>
                      <input type="number" value={currentProduct.stock === undefined ? '' : currentProduct.stock} onChange={e => setCurrentProduct({ ...currentProduct, stock: e.target.value !== '' ? Number(e.target.value) : undefined })} className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Unlimited" min="0" />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-stone-700 mb-1">Image</label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <input
                      type="file"
                      ref={galleryInputRef}
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {isUploading && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-lg top-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mb-2"></div>
                        <p className="text-xs font-bold text-rose-600">Uploading Image...</p>
                      </div>
                    )}
                    {!isCameraOpen ? (
                      <div className="flex flex-col gap-3">
                        <div className="flex gap-2">
                          <input type="text" value={currentProduct.image} onChange={e => setCurrentProduct({ ...currentProduct, image: e.target.value })} className="flex-1 w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-500 outline-none" placeholder="Image URL or take photo" required />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          <button type="button" onClick={triggerGallery} className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border-2 border-dashed border-blue-200 transition-all">
                            <Image className="w-5 h-5" /> Gallery
                          </button>
                          <button type="button" onClick={triggerCamera} className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border-2 border-dashed border-rose-200 transition-all">
                            <Camera className="w-5 h-5" /> Camera App
                          </button>
                          <button type="button" onClick={startCamera} className="w-full bg-stone-50 hover:bg-stone-100 text-stone-600 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border-2 border-dashed border-stone-200 transition-all col-span-2 md:col-span-1">
                            <Aperture className="w-5 h-5" /> Live View
                          </button>
                        </div>
                        {currentProduct.image && (
                          <button type="button" onClick={triggerCamera} className="w-full bg-stone-100 hover:bg-stone-200 text-stone-600 py-2 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 border border-stone-200 transition-all">
                            <Aperture className="w-4 h-4" /> Retake Photo
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="relative rounded-lg overflow-hidden bg-black aspect-video flex flex-col mt-2 shadow-inner">
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                        <canvas ref={canvasRef} className="hidden" />
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                          <button type="button" onClick={capturePhoto} className="bg-rose-500 text-white p-4 rounded-full shadow-2xl hover:bg-rose-600 transition-transform hover:scale-110 border-4 border-white/30" title="Capture">
                            <Aperture className="w-8 h-8" />
                          </button>
                          <button type="button" onClick={stopCamera} className="bg-stone-800/80 backdrop-blur-md text-white p-4 rounded-full shadow-2xl hover:bg-stone-700 transition-transform hover:scale-110 border-4 border-white/10" title="Cancel">
                            <X className="w-8 h-8" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {currentProduct.image && !isCameraOpen && (
                    <div className="mt-4 rounded-lg overflow-hidden border border-stone-200 h-40 bg-stone-50 flex items-center justify-center shadow-inner">
                      <img
                        src={currentProduct.image}
                        alt="Preview"
                        className="h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=Invalid+Image+URL';
                        }}
                      />
                    </div>
                  )}

                  {formError && (
                    <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm font-medium">
                      {formError}
                    </div>
                  )}

                  <div className="pt-4 flex gap-3">
                    <button type="submit" className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-lg font-semibold transition-colors shadow-lg shadow-rose-500/20">
                      {isEditing ? 'Update Product' : 'Add Product'}
                    </button>
                    {isEditing && (
                      <button type="button" onClick={() => { setIsEditing(false); setCurrentProduct({ id: '', name: '', category: 'Stationary', price: 0, originalPrice: '' as unknown as number, image: '' }); }} className="px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-semibold transition-colors">
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                <div className="p-6 border-b border-stone-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-xl font-bold text-stone-900">Manage Products</h2>
                  <div className="flex items-center gap-3">
                    <button onClick={() => { setIsEditing(false); setCurrentProduct({ id: '', name: '', category: 'Stationary', price: 0, originalPrice: '' as unknown as number, image: '' }); triggerCamera(); }} className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg shadow-rose-500/20 transition-all hover:scale-105 active:scale-95">
                      <Camera className="w-4 h-4" /> Take Photo & Add
                    </button>
                    <span className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-sm font-medium">{products.length} Items</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-stone-50 text-stone-500 text-sm uppercase tracking-wider border-b border-stone-200">
                        <th className="p-4 font-medium">Product</th>
                        <th className="p-4 font-medium">Category</th>
                        <th className="p-4 font-medium">Price</th>
                        <th className="p-4 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200">
                      {products.map(product => (
                        <tr key={product.id} className="hover:bg-stone-50 transition-colors group">
                          <td className="p-4 flex items-center gap-4">
                            <img
                              src={getPremiumImageUrl(product.image)}
                              alt={product.name}
                              className="w-16 h-16 rounded-lg object-cover border border-stone-200 shadow-sm"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=No+Image';
                              }}
                            />
                            <span className="font-semibold text-stone-900 text-base">{product.name}</span>
                          </td>
                          <td className="p-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getCategoryColor(product.category)}`}>
                              {product.category}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col gap-1">
                              <span className="font-bold text-stone-900 text-lg">₹{Math.round(product.price)}</span>
                              {product.originalPrice && product.originalPrice > product.price && (
                                <span className="text-xs font-bold text-stone-400 line-through">₹{Math.round(product.originalPrice)}</span>
                              )}
                              {product.stock !== undefined && (
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow-sm inline-block self-start ${product.stock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                  {product.stock > 0 ? `Stock: ${product.stock}` : 'Out of Stock'}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => handleEdit(product)} className="p-2 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200">
                                <Edit className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(product.id)}
                                disabled={deletingId === product.id}
                                className={`p-2 rounded-lg transition-colors border border-transparent ${deletingId === product.id
                                  ? 'text-stone-300 bg-stone-50 cursor-not-allowed'
                                  : 'text-stone-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200'
                                  }`}
                              >
                                {deletingId === product.id ? (
                                  <div className="w-5 h-5 border-2 border-stone-300 border-t-stone-500 rounded-full animate-spin" />
                                ) : (
                                  <Trash2 className="w-5 h-5" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="p-6 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-rose-500" /> Recent Orders
              </h2>
            </div>
            {isLoadingOrders ? (
              <div className="p-10 text-center text-stone-500">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="p-10 text-center text-stone-500">No orders found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-stone-50 text-stone-500 text-sm uppercase tracking-wider border-b border-stone-200">
                      <th className="p-4 font-medium">Order ID</th>
                      <th className="p-4 font-medium">Customer</th>
                      <th className="p-4 font-medium">Items</th>
                      <th className="p-4 font-medium">Total</th>
                      <th className="p-4 font-medium">Status / Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                        <td className="p-4">
                          <span className="font-mono text-xs text-stone-500">{order.id}</span><br />
                          <span className="text-xs text-stone-400">{new Date(order.createdAt).toLocaleString()}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-stone-900 block">{order.customerName}</span>
                          <span className="text-xs text-stone-500 bg-stone-200 px-2 py-0.5 rounded-full inline-block mt-1">{order.customerPhone}</span>
                        </td>
                        <td className="p-4">
                          <div className="text-sm max-h-24 overflow-y-auto pr-2">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="mb-1 border-b border-stone-100 last:border-0 pb-1 flex gap-2 items-center">
                                <img src={getPremiumImageUrl(item.product.image)} alt={item.product.name} className="w-8 h-8 rounded object-cover" />
                                <div>
                                  <p className="font-semibold text-stone-800 line-clamp-1 leading-tight">{item.product.name}</p>
                                  <p className="text-xs text-stone-500">₹{Math.round(item.product.price)} x {item.quantity}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-stone-900">₹{Math.round(order.totalAmount)}</span><br />
                          <span className="text-[10px] uppercase bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded inline-block mt-1">{order.paymentMethod}</span>
                        </td>
                        <td className="p-4 flex flex-col gap-2">
                          {order.status === 'Pending' ? (
                            <button
                              onClick={() => handleMarkDelivered(order.id)}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm"
                            >
                              Mark Delivered
                            </button>
                          ) : (
                            <span className="bg-stone-200 text-stone-600 px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 justify-center">
                              ✓ Completed
                            </span>
                          )}
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            disabled={deletingOrderId === order.id}
                            className="text-red-400 hover:text-red-600 text-[10px] font-bold uppercase tracking-widest text-center"
                          >
                            {deletingOrderId === order.id ? 'Deleting...' : 'Delete Order'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
        }
      </main >
    </div >
  );
}

// --- Main App ---
export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [allProducts, allSettings] = await Promise.all([
          fetchProducts().catch(() => []),
          fetchSettings().catch(() => [])
        ]);
        setProducts(allProducts);
        const settingsMap = allSettings.reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {});
        setSettings(settingsMap);
      } catch (e) {
        console.error("Failed to load backend data", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-stone-500 font-medium">Loading Store Memory...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<VisitorPanel products={products} settings={settings} setProducts={setProducts} />} />
        <Route path="/admin" element={<AdminPanel products={products} setProducts={setProducts} settings={settings} setSettings={setSettings} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
