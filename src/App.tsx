import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { Phone, Mail, Instagram, MessageCircle, MapPin, Map, Lock, LogOut, Plus, Edit, Trash2, Store, ShoppingBag, Menu, X, Camera, Aperture, Globe, Database, Search, ArrowUp, Package, LayoutGrid, ShoppingCart, Minus, Image, ShieldCheck, Gift, Sparkles, Sticker, Rocket, Coffee, Eye, Star, TrendingUp, CheckCircle2, Info , Home, Heart, User, ChevronRight, CreditCard} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import LocationMap from './LocationMap';
import { removeBackground as imglyRemoveBackground } from '@imgly/background-removal';


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
  utrNumber?: string;
  status: string;
  createdAt: string;
}

// --- API Service ---
const API_BASE = '/api';

const getPremiumImageUrl = (url: string) => {
  if (!url) return url;
  if (url.includes('res.cloudinary.com')) {
    let transformedUrl = url;
    // Add quality auto, format auto, background removal, and subtle sharpening for that 'premium' look
    if (!url.includes('q_auto')) {
      transformedUrl = transformedUrl.replace('/image/upload/', '/image/upload/e_background_removal,q_auto,f_auto,e_sharpen:50/');
    }
    return transformedUrl;
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

async function checkoutCart(payload: { customerName: string; customerPhone: string; paymentMethod: string; totalAmount: number; items: CartItem[]; utrNumber?: string }) {
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
    freeDelivery: "Free Delivery",
    distanceToStore: "Distance to Store",
    tooFarError: "We deliver only within 5KM. You are too far.",
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
    freeDelivery: "இலவச டெலிவரி",
    distanceToStore: "கடைக்கும் உங்களுக்குமான தூரம்",
    tooFarError: "கடையிலிருந்து 5கிமீ சுற்றளவிற்குள் மட்டுமே டெலிவரி செய்யப்படும். நீங்கள் தூரமாக உள்ளீர்கள்.",
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

  
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('rappani_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('rappani_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error("Failed to save favorites to localStorage", e);
    }
  }, [favorites]);

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const [customerName, setCustomerName] = useState(() => localStorage.getItem('rappani_customer_name') || '');
  const [customerPhone, setCustomerPhone] = useState(() => localStorage.getItem('rappani_customer_phone') || '');
  const [isPhoneVerified, setIsPhoneVerified] = useState(() => localStorage.getItem('rappani_is_verified') === 'true');
  const [showLocationMap, setShowLocationMap] = useState<'checkout' | 'account' | null>(null);

  const [isFirstOrder, setIsFirstOrder] = useState<boolean | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number, lon: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'checking' | 'blocked' | 'done'>('idle');

  const [deliveryMethod, setDeliveryMethod] = useState<'home' | 'pickup'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [savedAddresses, setSavedAddresses] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('rappani_saved_addresses');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('rappani_saved_addresses', JSON.stringify(savedAddresses));
    } catch (e) {
      console.error("Failed to save addresses", e);
    }
  }, [savedAddresses]);
  
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);

  useEffect(() => {
    if (isOrdersModalOpen && customerPhone.length === 10) {
      fetch(`${API_BASE}/orders/customer/${customerPhone}`)
        .then(res => res.json())
        .then(data => setCustomerOrders(Array.isArray(data) ? data : []))
        .catch(err => console.error("Error fetching customer orders", err));
    }
  }, [isOrdersModalOpen, customerPhone]);

  const [newSavedAddress, setNewSavedAddress] = useState('');
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  
  const [isFetchingLocationCheckout, setIsFetchingLocationCheckout] = useState(false);
  const fetchLocationForCheckout = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsFetchingLocationCheckout(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data && data.display_name) {
            setDeliveryAddress(data.display_name);
          } else {
            alert("Could not fetch address details.");
          }
        } catch (err) {
          console.error(err);
          alert("Error fetching address details.");
        } finally {
          setIsFetchingLocationCheckout(false);
        }
      },
      (err) => {
        console.error(err);
        alert("Please allow location access in your browser.");
        setIsFetchingLocationCheckout(false);
      }
    );
  };
  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data && data.display_name) {
            setNewSavedAddress(data.display_name);
          } else {
            alert("Could not fetch address details.");
          }
        } catch (err) {
          console.error(err);
          alert("Error fetching address details.");
        } finally {
          setIsFetchingLocation(false);
        }
      },
      (err) => {
        console.error(err);
        alert("Please allow location access in your browser.");
        setIsFetchingLocation(false);
      }
    );
  };



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
  const [currentTab, setCurrentTab] = useState<'home' | 'products' | 'cart' | 'favorites' | 'account'>(
    () => (localStorage.getItem('rappani_current_tab') as any) || 'home'
  );
  useEffect(() => {
    localStorage.setItem('rappani_current_tab', currentTab);
  }, [currentTab]);
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

  const deliveryFee = 0; // Delivery is now completely free as requested
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
      if (distance !== null && distance > 5) {
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
        deliveryAddress: deliveryMethod === 'home' ? deliveryAddress : 'Shop Pickup',
        utrNumber: utrNumber ? utrNumber.trim() : undefined
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
      if (distance !== null && distance > 5) {
        setCheckoutError(t.tooFarError);
        return;
      }
    }

    let message = `Hi, I want to place an order:\n\n*Customer*: ${customerName}\n*Phone*: ${customerPhone}\n\n`;
    cart.forEach(item => {
      message += `- ${item.product.name} (x${item.quantity}) = ₹${Math.round(item.product.price * item.quantity)}\n`;
    });
    message += `\n*Cart Total: ₹${cartTotalAmount}*`;
    message += `\n*Delivery Fee: ₹${deliveryFee}* ${deliveryFee === 0 ? '(FREE)' : ''}`;
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
      if (distance !== null && distance > 5) {
        setCheckoutError(t.tooFarError);
        return;
      }
    }

    setCheckoutError('');

    try {
      await navigator.clipboard.writeText('mohammedazzam200512@okaxis');
      alert(`✅ UPI ID Copied!\n\nPlease open any UPI App (GPay/Paytm/PhonePe), paste this ID, and complete the payment of ₹${Math.round(finalTotal)}`);
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
    const success = await processCheckoutAndClearCart(`GPay Order`);
    if (success) {
      setShowGPayConfirm(false);
      setUtrNumber('');
    }
  };

  
  return (
    <div className="bg-gray-50 font-sans text-gray-900 pb-20 min-h-screen">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-[#2874F0] text-white shadow-md">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-yellow-400 rounded-lg flex items-center justify-center text-[#2874F0] font-black text-xl italic shadow-sm">
              R
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight italic tracking-wide">{t.storeName}</h1>
              <p className="text-[10px] text-blue-100 flex items-center gap-1 opacity-90 italic">
                Explore Plus <Sparkles className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleLanguage} className="text-[10px] font-bold text-white bg-blue-700/50 px-2 py-1 rounded">
               {lang === 'en' ? 'தமிழ்' : 'EN'}
            </button>
            <div onClick={() => setCurrentTab('account')} className="flex items-center gap-1 cursor-pointer font-medium text-sm">
              Login
            </div>
            <div onClick={() => setCurrentTab('cart')} className="relative cursor-pointer md:hidden">
              <ShoppingCart className="w-6 h-6 text-white" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-yellow-500 text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {cartItemsCount}
                </span>
              )}
            </div>
          </div>
        </div>
        {/* Search Bar - Sticky below top bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search for Products, Brands and More" 
              className="w-full bg-white text-gray-900 border-0 rounded-sm py-2.5 pl-10 pr-4 focus:outline-none shadow-inner text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Main Content Area based on Tab */}
      <main className="px-4 py-4 space-y-6">
        {currentTab === 'home' && (
          <div className="space-y-4 bg-gray-100 -mx-4 px-4 pb-4">
            {/* Banner Slider */}
            <div className="relative w-full h-44 bg-[#2874F0] rounded-sm overflow-hidden shadow-sm flex items-center px-6 mt-4">
              <div className="z-10 text-white w-2/3">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-yellow-400 text-black px-2 py-1 rounded inline-block mb-2">Big Deal</span>
                <h2 className="text-xl font-bold leading-tight mb-2">Super Value Days</h2>
                <button className="bg-white text-[#2874F0] text-xs font-bold px-4 py-2 shadow-sm uppercase" onClick={() => setCurrentTab('products')}>Shop Now</button>
              </div>
              <div className="absolute right-0 bottom-0 opacity-20 translate-x-4 translate-y-4">
                 <Sparkles className="w-48 h-48 text-white" />
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-sm shadow-sm p-3 -mx-2">
              <div className="flex justify-between items-center mb-3 px-2">
                <h3 className="text-sm font-bold text-gray-900">Shop by Category</h3>
              </div>
              <div className="flex overflow-x-auto no-scrollbar gap-4 px-2 pb-2">
                {categories.map((cat, idx) => (
                  <div key={idx} onClick={() => { setSelectedCategory(cat.id); setCurrentTab('products'); }} className="flex flex-col items-center gap-1 cursor-pointer min-w-[70px]">
                    <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 border border-blue-100 transition-colors relative">
                       {cat.icon}
                       {idx === 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">New</span>}
                    </div>
                    <span className="text-[10px] font-medium text-center text-gray-700 leading-tight">{getCategoryName(cat.id)}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Featured Products (Home Tab) */}
            <div>
               <div className="flex justify-between items-end mb-4">
                <h3 className="text-lg font-bold text-gray-900">Popular Now</h3>
                <button className="text-sm text-green-600 font-bold" onClick={() => setCurrentTab('products')}>See All</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {products.slice(0, 4).map(product => {
                  const cartItem = cart.find(item => item.product.id === product.id);
                  const qty = cartItem ? cartItem.quantity : 0;
                  return (
                    <div key={product.id} className="bg-white p-2 rounded-sm shadow-sm border border-gray-100 flex flex-col relative">
                       <button onClick={() => toggleFavorite(product.id)} className="absolute top-2 right-2 z-10 p-1.5 bg-white/80 backdrop-blur-md rounded-full text-gray-400">
                         <Heart className={`w-4 h-4 ${favorites.includes(product.id) ? 'fill-rose-500 text-rose-500' : 'text-gray-300'}`} />
                       </button>
                       <div className="w-full aspect-square bg-white mb-2 overflow-hidden flex items-center justify-center relative p-2">
                         <img src={getPremiumImageUrl(product.image) || "https://placehold.co/400x400?text=No+Image"} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                         {product.originalPrice && product.originalPrice > product.price && (
                           <span className="absolute bottom-0 left-0 bg-green-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-tr-lg">
                             {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                           </span>
                         )}
                       </div>
                       <h4 className="font-medium text-gray-700 text-xs mb-1 line-clamp-2 leading-tight h-8">{product.name}</h4>
                       <div className="flex items-center gap-1 mb-2">
                         <span className="bg-green-600 text-white text-[9px] font-bold px-1 py-0.5 rounded flex items-center gap-0.5">4.2 <Star className="w-2 h-2 fill-white" /></span>
                         <span className="text-[9px] text-gray-400">(84)</span>
                       </div>
                       <div className="mt-auto">
                         <div className="flex items-baseline gap-1.5 flex-wrap">
                           <span className="font-bold text-gray-900 text-sm">₹{product.price}</span>
                           {product.originalPrice && product.originalPrice > product.price && (
                             <span className="text-[10px] text-gray-500 line-through">₹{product.originalPrice}</span>
                           )}
                         </div>
                         <div className="mt-2">
                         {qty > 0 ? (
                            <div className="flex items-center justify-between border border-gray-300 rounded-sm overflow-hidden h-7">
                              <button onClick={() => updateQuantity(product.id, qty - 1)} className="bg-gray-100 text-gray-600 w-8 h-full flex items-center justify-center font-bold">-</button>
                              <span className="text-xs font-bold text-gray-900">{qty}</span>
                              <button onClick={() => updateQuantity(product.id, qty + 1)} className="bg-gray-100 text-gray-600 w-8 h-full flex items-center justify-center font-bold">+</button>
                            </div>
                         ) : (
                            <button onClick={() => addToCart(product)} className="w-full bg-white text-[#2874F0] text-xs font-bold py-1.5 rounded-sm border border-[#2874F0] hover:bg-blue-50 transition-colors uppercase">
                              Add
                            </button>
                         )}
                         </div>
                       </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {currentTab === 'products' && (
          <div className="space-y-4">
            {/* Filter Chips */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map(cat => (
                 <button 
                   key={cat.id}
                   onClick={() => setSelectedCategory(cat.id)}
                   className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm border ${selectedCategory === cat.id ? 'bg-[#2874F0] text-white border-[#2874F0]' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                 >
                   {getCategoryName(cat.id)}
                 </button>
              ))}
            </div>

            {/* Product List */}
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.length === 0 ? (
                <div className="col-span-2 text-center py-12 text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>{t.noProducts}</p>
                </div>
              ) : (
                filteredProducts.map(product => {
                  const cartItem = cart.find(item => item.product.id === product.id);
                  const qty = cartItem ? cartItem.quantity : 0;
                  return (
                    <div key={product.id} className="bg-white p-2 rounded-sm shadow-sm border border-gray-100 flex flex-col relative">
                       <button onClick={() => toggleFavorite(product.id)} className="absolute top-2 right-2 z-10 p-1.5 bg-white/80 backdrop-blur-md rounded-full text-gray-400">
                         <Heart className={`w-4 h-4 ${favorites.includes(product.id) ? 'fill-rose-500 text-rose-500' : 'text-gray-300'}`} />
                       </button>
                       <div className="w-full aspect-square bg-white mb-2 overflow-hidden flex items-center justify-center relative p-2">
                         <img src={getPremiumImageUrl(product.image) || "https://placehold.co/400x400?text=No+Image"} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                         {product.originalPrice && product.originalPrice > product.price && (
                           <span className="absolute bottom-0 left-0 bg-green-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-tr-lg">
                             {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                           </span>
                         )}
                       </div>
                       <h4 className="font-medium text-gray-700 text-xs mb-1 line-clamp-2 leading-tight h-8">{product.name}</h4>
                       <div className="flex items-center gap-1 mb-2">
                         <span className="bg-green-600 text-white text-[9px] font-bold px-1 py-0.5 rounded flex items-center gap-0.5">4.2 <Star className="w-2 h-2 fill-white" /></span>
                         <span className="text-[9px] text-gray-400">(84)</span>
                       </div>
                       <div className="mt-auto">
                         <div className="flex items-baseline gap-1.5 flex-wrap">
                           <span className="font-bold text-gray-900 text-sm">₹{product.price}</span>
                           {product.originalPrice && product.originalPrice > product.price && (
                             <span className="text-[10px] text-gray-500 line-through">₹{product.originalPrice}</span>
                           )}
                         </div>
                         <div className="mt-2">
                         {qty > 0 ? (
                            <div className="flex items-center justify-between border border-gray-300 rounded-sm overflow-hidden h-7">
                              <button onClick={() => updateQuantity(product.id, qty - 1)} className="bg-gray-100 text-gray-600 w-8 h-full flex items-center justify-center font-bold">-</button>
                              <span className="text-xs font-bold text-gray-900">{qty}</span>
                              <button onClick={() => updateQuantity(product.id, qty + 1)} className="bg-gray-100 text-gray-600 w-8 h-full flex items-center justify-center font-bold">+</button>
                            </div>
                         ) : (
                            <button onClick={() => addToCart(product)} className="w-full bg-white text-[#2874F0] text-xs font-bold py-1.5 rounded-sm border border-[#2874F0] hover:bg-blue-50 transition-colors uppercase">
                              Add
                            </button>
                         )}
                         </div>
                       </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        
        {currentTab === 'favorites' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Your Favorites</h2>
            <div className="grid grid-cols-2 gap-3">
              {products.filter(p => favorites.includes(p.id)).length === 0 ? (
                <div className="col-span-2 text-center py-12 text-gray-400">
                  <Heart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No favorites yet</p>
                </div>
              ) : (
                products.filter(p => favorites.includes(p.id)).map(product => {
                  const cartItem = cart.find(item => item.product.id === product.id);
                  const qty = cartItem ? cartItem.quantity : 0;
                  return (
                    <div key={product.id} className="bg-white p-2 rounded-sm shadow-sm border border-gray-100 flex flex-col relative">
                       <button onClick={() => toggleFavorite(product.id)} className="absolute top-2 right-2 z-10 p-1.5 bg-white/80 backdrop-blur-md rounded-full text-gray-400">
                         <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                       </button>
                       <div className="w-full aspect-square bg-white mb-2 overflow-hidden flex items-center justify-center relative p-2">
                         <img src={getPremiumImageUrl(product.image) || "https://placehold.co/400x400?text=No+Image"} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                         {product.originalPrice && product.originalPrice > product.price && (
                           <span className="absolute bottom-0 left-0 bg-green-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-tr-lg">
                             {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                           </span>
                         )}
                       </div>
                       <h4 className="font-medium text-gray-700 text-xs mb-1 line-clamp-2 leading-tight h-8">{product.name}</h4>
                       <div className="flex items-center gap-1 mb-2">
                         <span className="bg-green-600 text-white text-[9px] font-bold px-1 py-0.5 rounded flex items-center gap-0.5">4.2 <Star className="w-2 h-2 fill-white" /></span>
                         <span className="text-[9px] text-gray-400">(84)</span>
                       </div>
                       <div className="mt-auto">
                         <div className="flex items-baseline gap-1.5 flex-wrap">
                           <span className="font-bold text-gray-900 text-sm">₹{product.price}</span>
                           {product.originalPrice && product.originalPrice > product.price && (
                             <span className="text-[10px] text-gray-500 line-through">₹{product.originalPrice}</span>
                           )}
                         </div>
                         <div className="mt-2">
                         {qty > 0 ? (
                            <div className="flex items-center justify-between border border-gray-300 rounded-sm overflow-hidden h-7">
                              <button onClick={() => updateQuantity(product.id, qty - 1)} className="bg-gray-100 text-gray-600 w-8 h-full flex items-center justify-center font-bold">-</button>
                              <span className="text-xs font-bold text-gray-900">{qty}</span>
                              <button onClick={() => updateQuantity(product.id, qty + 1)} className="bg-gray-100 text-gray-600 w-8 h-full flex items-center justify-center font-bold">+</button>
                            </div>
                         ) : (
                            <button onClick={() => addToCart(product)} className="w-full bg-white text-[#2874F0] text-xs font-bold py-1.5 rounded-sm border border-[#2874F0] hover:bg-blue-50 transition-colors uppercase">
                              Add
                            </button>
                         )}
                         </div>
                       </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {currentTab === 'cart' && (
           <div className="space-y-6">
             <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
             {cart.length === 0 ? (
               <div className="text-center py-12 text-gray-400">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="font-medium text-lg text-gray-500">Your cart is empty</p>
                  <button onClick={() => setCurrentTab('home')} className="mt-6 bg-green-600 text-white px-6 py-2 rounded-full font-bold shadow-md hover:bg-green-700">Go to Home</button>
               </div>
             ) : (
               <>
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 space-y-4">
                      {cart.map((item, idx) => (
                         <div key={idx} className="flex gap-4 items-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                               <img src={getPremiumImageUrl(item.product.image) || "https://placehold.co/100x100"} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                               <h5 className="font-bold text-sm text-gray-900 leading-tight">{item.product.name}</h5>
                               <p className="font-black text-green-600 text-sm mt-1">₹{item.product.price}</p>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 shrink-0">
                              <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="text-gray-600 w-5 h-5 flex items-center justify-center font-bold">-</button>
                              <span className="text-sm font-bold text-gray-900">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="text-gray-600 w-5 h-5 flex items-center justify-center font-bold">+</button>
                            </div>
                         </div>
                      ))}
                    </div>
                    <div className="bg-gray-50 p-4 border-t border-gray-100">
                       <div className="flex justify-between text-sm text-gray-600 mb-2">
                         <span>Items Total</span>
                         <span className="font-bold text-gray-900">₹{cartTotalAmount}</span>
                       </div>
                       <div className="flex justify-between text-sm text-gray-600 mb-4">
                         <span>Delivery Fee</span>
                         <span className="font-bold text-green-600">Free</span>
                       </div>
                       <div className="flex justify-between text-lg font-black text-gray-900 pt-3 border-t border-gray-200">
                         <span>To Pay</span>
                         <span>₹{finalTotal}</span>
                       </div>
                    </div>
                  </div>

                  {/* Checkout Details */}
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                    <h3 className="font-bold text-gray-900">Delivery Details</h3>
                    {checkoutError && (
                      <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100 flex items-start gap-2">
                         <Info className="w-4 h-4 shrink-0 mt-0.5" />
                         <span>{checkoutError}</span>
                      </div>
                    )}
                    <div className="space-y-3">
                       <input 
                          type="text" 
                          placeholder="Your Name" 
                          value={customerName}
                          onChange={e => setCustomerName(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all shadow-sm"
                       />
                       <input 
                          type="tel" 
                          placeholder="Phone Number (10 digits)" 
                          value={customerPhone}
                          onChange={e => setCustomerPhone(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all shadow-sm"
                       />
                       {!isPhoneVerified && (
                          <div className="flex gap-2">
                            {isOtpSent ? (
                               <div className="flex w-full gap-2">
                                 <input type="text" placeholder="Enter OTP" value={otpInput} onChange={e=>setOtpInput(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4" />
                                 <button onClick={handleVerifyOtp} disabled={isVerifyingOtp} className="bg-green-600 text-white px-4 rounded-xl font-bold whitespace-nowrap">{isVerifyingOtp ? '...' : 'Verify'}</button>
                               </div>
                            ) : (
                               <button onClick={handleSendOtp} disabled={isSendingOtp} className="w-full bg-blue-50 text-blue-600 border border-blue-200 py-3 rounded-xl font-bold shadow-sm">{isSendingOtp ? 'Sending...' : 'Send OTP'}</button>
                            )}
                          </div>
                       )}
                       {isPhoneVerified && <div className="text-green-600 font-bold text-sm bg-green-50 p-2 rounded-lg text-center">✔ Phone Verified</div>}
                       
                       <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                          <button onClick={() => setDeliveryMethod('pickup')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${deliveryMethod === 'pickup' ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}>Shop Pickup</button>
                          <button onClick={() => setDeliveryMethod('home')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${deliveryMethod === 'home' ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}>Home Delivery</button>
                       </div>

                       {deliveryMethod === 'home' && (
                          <div className="space-y-3">
                             <div className="flex justify-between items-end mb-1">
                               <p className="text-sm font-bold text-gray-700">Delivery Address</p>
                               <button 
                                  onClick={fetchLocationForCheckout}
                                  disabled={isFetchingLocationCheckout}
                                  className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md flex items-center gap-1 disabled:opacity-50"
                                >
                                  <MapPin className="w-3 h-3" /> {isFetchingLocationCheckout ? "Fetching..." : "Use Current Location"}
                                </button>
                                <button 
                                  onClick={() => setShowLocationMap('checkout')}
                                  className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md flex items-center gap-1"
                                >
                                  <Map className="w-3 h-3" /> Pick from Map
                                </button>
                             </div>
                             <textarea 
                                placeholder="Enter Full Delivery Address" 
                                value={deliveryAddress}
                                onChange={e => setDeliveryAddress(e.target.value)}
                                rows={3}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all shadow-sm resize-none"
                             />
                             {savedAddresses.length > 0 && (
                                <div className="space-y-2 mt-2">
                                   <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Saved Address</p>
                                   <div className="flex gap-2 overflow-x-auto pb-2 snap-x hide-scrollbar">
                                      {savedAddresses.map((addr, idx) => (
                                         <div 
                                           key={idx} 
                                           onClick={() => setDeliveryAddress(addr)}
                                           className="snap-start shrink-0 w-[200px] bg-white border border-gray-200 rounded-xl p-3 cursor-pointer hover:border-green-500 transition-colors"
                                         >
                                            <p className="text-xs text-gray-700 line-clamp-2">{addr}</p>
                                         </div>
                                      ))}
                                   </div>
                                </div>
                             )}
                          </div>
                       )}

                       <div className="pt-4 space-y-3">
                          <button onClick={handleWhatsAppCheckout} className="w-full bg-[#25D366] text-white py-3.5 rounded-xl font-bold shadow-md shadow-green-500/20 flex items-center justify-center gap-2 hover:bg-[#20bd5a] transition-colors">
                             <MessageCircle className="w-5 h-5" /> Checkout on WhatsApp
                          </button>
                          <button onClick={handleGPayCheckout} className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold shadow-md shadow-gray-900/20 flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
                             <CreditCard className="w-5 h-5" /> Pay via GPay / UPI
                          </button>
                       </div>
                    </div>
                  </div>
               </>
             )}
           </div>
        )}

        {currentTab === 'account' && (
           <div className="space-y-6">
             <div 
                onClick={() => setIsProfileModalOpen(true)}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center relative hover:bg-gray-50 cursor-pointer transition-colors"
             >
                <div className="absolute top-4 right-4 bg-green-50 text-green-600 p-2 rounded-full">
                  <Edit className="w-4 h-4" />
                </div>
                <div className="w-24 h-24 bg-green-100 rounded-full mb-4 flex items-center justify-center text-green-600">
                  <User className="w-12 h-12" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{customerName || 'Guest User'}</h2>
                <p className="text-gray-500">{customerPhone || 'Register Number to track orders'}</p>
             </div>

             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-50 flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => setIsOrdersModalOpen(true)}>
                   <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0"><Package className="w-5 h-5" /></div>
                   <div className="flex-1">
                     <h4 className="font-bold text-gray-900">My Orders</h4>
                     <p className="text-xs text-gray-500">View order history</p>
                   </div>
                   <ChevronRight className="w-5 h-5 text-gray-300" />
                </div>
                <div className="p-4 border-b border-gray-50 flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => setIsAddressModalOpen(true)}>
                   <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center shrink-0"><MapPin className="w-5 h-5" /></div>
                   <div className="flex-1">
                     <h4 className="font-bold text-gray-900">Delivery Address</h4>
                     <p className="text-xs text-gray-500">{savedAddresses.length > 0 ? `${savedAddresses.length} saved addresses` : 'Manage saved addresses'}</p>
                   </div>
                   <ChevronRight className="w-5 h-5 text-gray-300" />
                </div>

             </div>
             
             
             {isProfileModalOpen && (
                <div className="fixed inset-0 z-[100] flex flex-col bg-gray-100">
                  <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm pt-safe">
                    <button onClick={() => setIsProfileModalOpen(false)} className="p-2 -ml-2 rounded-full hover:bg-gray-50">
                      <ChevronRight className="w-6 h-6 text-gray-900 rotate-180" />
                    </button>
                    <h2 className="font-black text-xl text-gray-900">Edit Profile</h2>
                  </div>
                  
                  <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Your Name</label>
                        <input 
                          type="text" 
                          value={customerName}
                          onChange={e => setCustomerName(e.target.value)}
                          placeholder="Enter your full name"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Register Number (Phone)</label>
                        <div className="flex gap-2">
                           <div className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-gray-600 font-medium flex items-center justify-center shrink-0">
                             +91
                           </div>
                           <input 
                             type="tel" 
                             maxLength={10}
                             value={customerPhone}
                             onChange={e => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                             placeholder="Enter 10-digit mobile number"
                             className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                           />
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => setIsProfileModalOpen(false)}
                        disabled={customerPhone.length !== 10}
                        className="w-full bg-green-600 text-white rounded-xl py-3 mt-4 font-bold disabled:opacity-50 disabled:bg-gray-400 flex items-center justify-center gap-2 transition-colors"
                      >
                        <User className="w-5 h-5" /> Save Profile
                      </button>
                    </div>
                  </div>
                </div>
             )}

             {showGPayConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-gray-900/40 backdrop-blur-sm">
                   <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm space-y-4">
                      <h3 className="font-bold text-lg text-gray-900">Confirm Payment</h3>
                      <p className="text-sm text-gray-600">Please enter the 12-digit UTR or Reference Number from your payment app to confirm your order.</p>
                      <input 
                          type="text" 
                          placeholder="Enter UTR Number" 
                          value={utrNumber}
                          onChange={e => setUtrNumber(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <div className="flex gap-3 pt-2">
                         <button onClick={() => setShowGPayConfirm(false)} className="flex-1 py-3 font-bold text-gray-600 bg-gray-100 rounded-xl">Cancel</button>
                         <button onClick={handleGPayConfirm} className="flex-1 py-3 font-bold text-white bg-green-600 rounded-xl shadow-md">Confirm</button>
                      </div>
                   </div>
                </div>
             )}
           </div>
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 pb-safe pt-2 px-6 flex justify-between items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] h-16 md:hidden">
         <button onClick={() => setCurrentTab('home')} className={`flex flex-col items-center gap-1 w-16 ${currentTab === 'home' ? 'text-[#2874F0]' : 'text-gray-400'}`}>
           <Home className={`w-6 h-6 ${currentTab === 'home' ? 'fill-blue-100' : ''}`} />
           <span className="text-[10px] font-bold">Home</span>
         </button>
         <button onClick={() => setCurrentTab('products')} className={`flex flex-col items-center gap-1 w-16 ${currentTab === 'products' ? 'text-[#2874F0]' : 'text-gray-400'}`}>
           <LayoutGrid className={`w-6 h-6 ${currentTab === 'products' ? 'fill-blue-100' : ''}`} />
           <span className="text-[10px] font-bold">Categories</span>
         </button>
         <button onClick={() => setCurrentTab('cart')} className={`relative flex flex-col items-center gap-1 w-16 ${currentTab === 'cart' ? 'text-[#2874F0]' : 'text-gray-400'}`}>
           <div className="relative">
             <ShoppingCart className={`w-6 h-6 ${currentTab === 'cart' ? 'fill-blue-100' : ''}`} />
             {cartItemsCount > 0 && (
               <span className="absolute -top-1 -right-2 bg-yellow-500 text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                 {cartItemsCount}
               </span>
             )}
           </div>
           <span className="text-[10px] font-bold">Cart</span>
         </button>
         <button onClick={() => setCurrentTab('favorites')} className={`flex flex-col items-center gap-1 w-16 ${currentTab === 'favorites' ? 'text-[#2874F0]' : 'text-gray-400'}`}>
           <Heart className={`w-6 h-6 ${currentTab === 'favorites' ? 'fill-blue-100' : ''}`} />
           <span className="text-[10px] font-bold">Favorites</span>
         </button>
         <button onClick={() => setCurrentTab('account')} className={`flex flex-col items-center gap-1 w-16 ${currentTab === 'account' ? 'text-[#2874F0]' : 'text-gray-400'}`}>
           <User className={`w-6 h-6 ${currentTab === 'account' ? 'fill-blue-100' : ''}`} />
           <span className="text-[10px] font-bold">Account</span>
         </button>
      </nav>
    
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-gray-100">
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm pt-safe">
            <button onClick={() => setIsAddressModalOpen(false)} className="p-2 -ml-2 rounded-full hover:bg-gray-50">
              <ChevronRight className="w-6 h-6 text-gray-900 rotate-180" />
            </button>
            <h2 className="font-black text-xl text-gray-900">Saved Addresses</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {savedAddresses.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <MapPin className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No saved addresses yet</p>
              </div>
            ) : (
              savedAddresses.map((addr, idx) => (
                <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-3 relative">
                  <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex-1 pr-8">
                    <h4 className="font-bold text-gray-900 mb-1">Address {idx + 1}</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{addr}</p>
                  </div>
                  <button 
                    onClick={() => setSavedAddresses(savedAddresses.filter((_, i) => i !== idx))}
                    className="absolute top-4 right-4 p-2 text-rose-500 bg-rose-50 rounded-full"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
            
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mt-6">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-gray-900">Add New Address</h4>
                <button 
                  onClick={fetchCurrentLocation}
                  disabled={isFetchingLocation}
                  className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg disabled:opacity-50"
                >
                  <MapPin className="w-3 h-3" />
                  {isFetchingLocation ? "Fetching..." : "Use Current Location"}
                </button>
              </div>
              <textarea 
                className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500 h-24 resize-none transition-shadow mb-3" 
                placeholder="Enter Full Delivery Address" 
                value={newSavedAddress}
                onChange={e => setNewSavedAddress(e.target.value)}
              />
              <button 
                onClick={() => {
                  if(newSavedAddress.trim()) {
                    setSavedAddresses([...savedAddresses, newSavedAddress.trim()]);
                    setNewSavedAddress('');
                  }
                }}
                disabled={!newSavedAddress.trim()}
                className="w-full bg-green-600 text-white rounded-xl py-3 font-bold disabled:opacity-50 disabled:bg-gray-300 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" /> Save Address
              </button>
            </div>
          </div>
        </div>
      )}

      {isOrdersModalOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-gray-100">
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm pt-safe">
            <button onClick={() => setIsOrdersModalOpen(false)} className="p-2 -ml-2 rounded-full hover:bg-gray-50">
              <ChevronRight className="w-6 h-6 text-gray-900 rotate-180" />
            </button>
            <h2 className="font-black text-xl text-gray-900">My Orders</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!customerPhone || customerPhone.length < 10 ? (
              <div className="text-center py-12 text-gray-400">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Please add your 10-digit phone number in Account to view orders.</p>
              </div>
            ) : customerOrders.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No orders found for this number.</p>
              </div>
            ) : (
              customerOrders.map((order, idx) => (
                <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${order.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2 whitespace-pre-wrap">{order.itemsSummary}</div>
                  <div className="font-black text-gray-900">₹{order.totalAmount}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {showLocationMap === 'checkout' && (
        <LocationMap 
          onCancel={() => setShowLocationMap(null)}
          onConfirm={(address) => {
            setDeliveryAddress(address);
            setShowLocationMap(null);
          }}
        />
      )}
      {showLocationMap === 'account' && (
        <LocationMap 
          onCancel={() => setShowLocationMap(null)}
          onConfirm={(address) => {
            setNewSavedAddress(address);
            setShowLocationMap(null);
          }}
        />
      )}

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
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('rappani_admin_auth') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('rappani_admin_auth', isAuthenticated.toString());
  }, [isAuthenticated]);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Admin section Tabs
  const [adminTab, setAdminTab] = useState<'dashboard' | 'products' | 'orders' | 'settings' | 'security'>(
    () => (localStorage.getItem('rappani_admin_tab') as any) || 'dashboard'
  );
  useEffect(() => {
    localStorage.setItem('rappani_admin_tab', adminTab);
  }, [adminTab]);
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
          try {
            const dataUrl = reader.result as string;
            const imageUrl = await uploadImage(dataUrl);
            await updateSetting('location_image', imageUrl);
            setSettings(prev => ({ ...prev, location_image: imageUrl }));
          } catch (err) {
            console.error("Upload failed", err);
            alert("Image upload failed. Please check your connection or Cloudinary settings.");
          } finally {
            setIsUpdatingLocation(false);
          }
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
          try {
            const dataUrl = reader.result as string;
            const imageUrl = await uploadImage(dataUrl);
            await updateSetting('hero_image', imageUrl);
            setSettings(prev => ({ ...prev, hero_image: imageUrl }));
          } catch (err) {
            console.error("Upload failed", err);
            alert("Image upload failed. Please check your connection or Cloudinary settings.");
          } finally {
            setIsUpdatingHero(false);
          }
        };
        reader.readAsDataURL(file);
      } catch (err) {
        console.error("Upload failed", err);
        setIsUpdatingHero(false);
      }
    }
  };

  const [isUploading, setIsUploading] = useState(false);
  const [isRemovingBackground, setIsRemovingBackground] = useState(false);

  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passForm, setPassForm] = useState({ current: '', newPhone: '', new: '', confirm: '' });
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
      try {
        setIsUploading(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const dataUrl = reader.result as string;
            const imageUrl = await uploadImage(dataUrl);
            setCurrentProduct({ ...currentProduct, image: imageUrl });
            setFormError('');
          } catch (err) {
            console.error("Upload failed", err);
            setFormError("Image upload failed. Please try again.");
          } finally {
            setIsUploading(false);
          }
        };
        reader.readAsDataURL(file);
      } catch (err) {
        console.error("Upload failed", err);
        setFormError("Upload failed. Please try again.");
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
        body: JSON.stringify({ phone, password })
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

    if (passForm.new && passForm.new !== passForm.confirm) {
      setPassError('New passwords do not match');
      return;
    }
    if (!passForm.new && !passForm.newPhone) {
      setPassError('Please enter a new phone number or a new password');
      return;
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passForm.current,
          newPassword: passForm.new || undefined,
          newPhone: passForm.newPhone || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');

      setPassSuccess('Password changed successfully!');
      setPassForm({ current: '', newPhone: '', new: '', confirm: '' });
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
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 -left-20 w-96 h-96 bg-gradient-to-r from-amber-500 to-amber-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl animate-pulse delay-700"></div>

        <div className="bg-zinc-900/40 glass/95 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl max-w-md w-full border border-white/20 relative z-10">
          <div className="text-center mb-10">
            <div className="bg-gradient-to-br from-amber-400 to-rose-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-6 shadow-lg shadow-amber-500/30">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">Admin Access</h2>
            <p className="text-zinc-400 mt-2 font-medium">Secure dashboard login</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-white/5 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all bg-zinc-800/50/50 text-white"
                  placeholder="9876543210"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-white/5 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all bg-zinc-800/50/50 text-white"
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
            <button type="submit" className="w-full bg-zinc-950 hover:bg-zinc-900 text-white py-4 rounded-2xl font-bold transition-all hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2">
              Unlock Dashboard <ArrowUp className="w-5 h-5 rotate-90" />
            </button>

          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col md:flex-row font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-zinc-900 border-b md:border-b-0 md:border-r border-white/5 flex flex-col z-20 md:sticky md:top-0 md:h-screen">
        <div className="p-4 md:p-6 flex items-center justify-between md:justify-start">
          <div className="flex items-center gap-3 text-white">
            <Store className="w-6 h-6 md:w-8 md:h-8 text-amber-500" />
            <h1 className="text-xl md:text-2xl font-black tracking-tight">Admin</h1>
          </div>
          <button onClick={handleLogout} className="md:hidden flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all text-sm border border-white/10">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
        
        <nav className="flex-1 overflow-x-auto md:overflow-y-auto px-4 md:px-6 pb-4 md:pb-6 flex md:flex-col gap-2 md:gap-2 no-scrollbar">
          <button onClick={() => setAdminTab('dashboard')} className={`flex-shrink-0 flex items-center gap-2 md:gap-3 px-4 py-2.5 md:py-3 rounded-xl font-bold transition-all ${adminTab === 'dashboard' ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}>
            <LayoutGrid className="w-4 h-4 md:w-5 md:h-5" /> <span className="hidden md:inline">Dashboard</span>
            <span className="md:hidden text-xs">Home</span>
          </button>
          <button onClick={() => setAdminTab('products')} className={`flex-shrink-0 flex items-center gap-2 md:gap-3 px-4 py-2.5 md:py-3 rounded-xl font-bold transition-all ${adminTab === 'products' ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}>
            <Package className="w-4 h-4 md:w-5 md:h-5" /> Products
          </button>
          <button onClick={() => setAdminTab('orders')} className={`flex-shrink-0 flex items-center gap-2 md:gap-3 px-4 py-2.5 md:py-3 rounded-xl font-bold transition-all ${adminTab === 'orders' ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}>
            <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" /> Orders
            {orders.length > 0 && <span className="ml-auto bg-rose-500 text-white text-[10px] md:text-xs px-2 py-0.5 rounded-full">{orders.filter(o => o.status === 'Pending').length}</span>}
          </button>
          <button onClick={() => setAdminTab('settings')} className={`flex-shrink-0 flex items-center gap-2 md:gap-3 px-4 py-2.5 md:py-3 rounded-xl font-bold transition-all ${adminTab === 'settings' ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}>
            <Database className="w-4 h-4 md:w-5 md:h-5" /> Settings
          </button>
          <button onClick={() => setAdminTab('security')} className={`flex-shrink-0 flex items-center gap-2 md:gap-3 px-4 py-2.5 md:py-3 rounded-xl font-bold transition-all ${adminTab === 'security' ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}>
            <Lock className="w-4 h-4 md:w-5 md:h-5" /> Security
          </button>
        </nav>

        <div className="hidden md:block mt-auto p-6 border-t border-white/5">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all border border-transparent hover:border-white/10">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-80px)] md:h-screen p-4 md:p-8 bg-zinc-950">
        <div className="max-w-6xl mx-auto pb-20 md:pb-8">
          {formError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center gap-3 animate-in fade-in duration-300">
              <X className="w-5 h-5 flex-shrink-0 cursor-pointer hover:text-white" onClick={() => setFormError('')} />
              <p className="text-sm font-semibold">{formError}</p>
            </div>
          )}

        {adminTab === 'dashboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-6">Dashboard Overview</h2>
        {/* Dashboard Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-lg flex items-center gap-4">
            <div className="bg-amber-500/10 p-3 rounded-xl text-amber-500">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Products</p>
              <h3 className="text-2xl font-bold text-white">{products.length}</h3>
            </div>
          </div>
          <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-lg flex items-center gap-4">
            <div className="bg-purple-500/10 p-3 rounded-xl text-purple-400">
              <LayoutGrid className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Categories</p>
              <h3 className="text-2xl font-bold text-white">{new Set(products.map(p => p.category)).size}</h3>
            </div>
          </div>
          <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-lg flex items-center gap-4">
            <div className="bg-emerald-500/10 p-3 rounded-xl text-emerald-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Database Status</p>
              <h3 className="text-sm font-bold text-emerald-600">Connected & Syncing</h3>
            </div>
          </div>

          <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-lg flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-orange-500/10 p-3 rounded-xl text-orange-400">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Store Location</p>
                <h3 className="text-sm font-bold text-white mt-1">Update Background</h3>
              </div>
            </div>
            <div className="relative">
              <input type="file" ref={locationImageRef} accept="image/*" onChange={handleLocationImageChange} className="hidden" />
              <button disabled={isUpdatingLocation} onClick={() => locationImageRef.current?.click()} className="flex items-center justify-center gap-2 bg-zinc-800/80 hover:bg-stone-200 text-zinc-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-white/10">
                {isUpdatingLocation ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-stone-600"></div> : <Camera className="w-4 h-4" />}
                {isUpdatingLocation ? 'Uploading...' : 'Upload Image'}
              </button>
            </div>
          </div>

          <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-lg flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-purple-500/10 p-3 rounded-xl text-purple-400">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Welcome Banner</p>
                <h3 className="text-sm font-bold text-white mt-1">Update Background</h3>
              </div>
            </div>
            <div className="relative">
              <input type="file" ref={heroImageRef} accept="image/*" onChange={handleHeroImageChange} className="hidden" />
              <button disabled={isUpdatingHero} onClick={() => heroImageRef.current?.click()} className="flex items-center justify-center gap-2 bg-zinc-800/80 hover:bg-stone-200 text-zinc-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-white/10">
                {isUpdatingHero ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-stone-600"></div> : <Camera className="w-4 h-4" />}
                {isUpdatingHero ? 'Uploading...' : 'Upload Image'}
              </button>
            </div>
          </div>
        </div>
        </div>
        )}

        {adminTab === 'settings' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-6">Store Settings</h2>

        {/* WhatsApp Management */}
        <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-lg mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#25D366]/10 p-2 rounded-xl text-[#25D366]">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Manage WhatsApp Numbers</h2>
          </div>
          <form onSubmit={handleWhatsappUpdate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">WhatsApp 1 (E.g. 916384137974)</label>
              <input
                type="text"
                value={whatsappForm.whatsapp_1}
                onChange={(e) => setWhatsappForm({ ...whatsappForm, whatsapp_1: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-white/10 focus:ring-2 focus:ring-[#25D366] outline-none"
                placeholder="Include country code, no + or spaces"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">WhatsApp 2</label>
              <input
                type="text"
                value={whatsappForm.whatsapp_2}
                onChange={(e) => setWhatsappForm({ ...whatsappForm, whatsapp_2: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-white/10 focus:ring-2 focus:ring-[#25D366] outline-none"
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
        <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-lg mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#1A73E8]/10 p-2 rounded-xl text-[#1A73E8] flex items-center justify-center">
              <span className="text-xl font-bold">₹</span>
            </div>
            <h2 className="text-xl font-bold text-white">Manage GPay / UPI Options</h2>
          </div>
          <p className="text-zinc-400 mb-4 text-sm font-medium">To use the direct GPay button, set your phone number's exact original UPI ID. E.g. 8940324030@okicici, 8940324030@ybl, etc. Or just use your business UPI ID.</p>
          <form onSubmit={handleUpiUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end max-w-2xl">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">UPI ID (VPA)</label>
              <input
                type="text"
                value={upiForm.upi_id}
                onChange={(e) => setUpiForm({ ...upiForm, upi_id: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-white/10 focus:ring-2 focus:ring-[#1A73E8] outline-none"
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
        </div>
        )}

        {adminTab === 'security' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-6">Security Settings</h2>
          <div className="mb-8 bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-500" /> Change Login Credentials
              </h3>
              <button onClick={() => setShowPasswordChange(false)} className="text-stone-400 hover:text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Current Password *</label>
                <input
                  type="password"
                  value={passForm.current}
                  onChange={(e) => setPassForm({ ...passForm, current: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-900 focus:ring-2 focus:ring-amber-500 outline-none text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">New Phone (Optional)</label>
                <input
                  type="tel"
                  value={passForm.newPhone}
                  onChange={(e) => setPassForm({ ...passForm, newPhone: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-900 focus:ring-2 focus:ring-amber-500 outline-none text-white"
                  placeholder="9876543210"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">New Password (Optional)</label>
                <input
                  type="password"
                  value={passForm.new}
                  onChange={(e) => setPassForm({ ...passForm, new: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-900 focus:ring-2 focus:ring-amber-500 outline-none text-white"
                />
              </div>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={passForm.confirm}
                    onChange={(e) => setPassForm({ ...passForm, confirm: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-900 focus:ring-2 focus:ring-amber-500 outline-none text-white"
                  />
                </div>
                <button type="submit" className="bg-amber-500 text-zinc-950 px-6 py-2 rounded-lg font-bold hover:bg-amber-400 transition-colors">
                  Update
                </button>
              </div>
            </form>
            {passError && <p className="mt-2 text-red-500 text-sm font-medium">{passError}</p>}
            {passSuccess && <p className="mt-2 text-green-600 text-sm font-medium">{passSuccess}</p>}
          </div>
          </div>
        )}

        {adminTab === 'products' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl md:text-3xl font-black text-white">Manage Products</h2>
              <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg shadow-amber-500/20 transition-all">
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </div>
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1">
              <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-lg lg:sticky lg:top-24">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  {isEditing ? <Edit className="w-5 h-5 text-amber-500" /> : <Plus className="w-5 h-5 text-amber-500" />}
                  {isEditing ? 'Edit Product' : 'Add New Product'}
                </h2>
                <form onSubmit={handleSaveProduct} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Product Name</label>
                    <input type="text" value={currentProduct.name} onChange={e => setCurrentProduct({ ...currentProduct, name: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-white/10 bg-black/20 text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-rose-500 outline-none" placeholder="e.g., Premium Notebook" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Category</label>
                    <select value={currentProduct.category} onChange={e => setCurrentProduct({ ...currentProduct, category: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-white/10 bg-zinc-800 text-white focus:ring-2 focus:ring-rose-500 outline-none">
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
                      <label className="block text-sm font-medium text-zinc-400 mb-1">Price (₹)</label>
                      <input type="number" value={currentProduct.price || ''} onChange={e => setCurrentProduct({ ...currentProduct, price: Number(e.target.value) })} className="w-full px-4 py-2 rounded-lg border border-white/10 bg-black/20 text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-rose-500 outline-none" placeholder="150" required min="1" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-zinc-400 mb-1">Original Price (₹)</label>
                      <input type="number" value={currentProduct.originalPrice || ''} onChange={e => setCurrentProduct({ ...currentProduct, originalPrice: Number(e.target.value) || undefined })} className="w-full px-4 py-2 rounded-lg border border-white/10 bg-black/20 text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Optional" min="1" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-zinc-400 mb-1">Stock (Max Qty)</label>
                      <input type="number" value={currentProduct.stock === undefined ? '' : currentProduct.stock} onChange={e => setCurrentProduct({ ...currentProduct, stock: e.target.value !== '' ? Number(e.target.value) : undefined })} className="w-full px-4 py-2 rounded-lg border border-white/10 bg-black/20 text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Unlimited" min="0" />
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
                      <div className="absolute inset-0 bg-zinc-900/40 glass/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-lg top-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mb-2"></div>
                        <p className="text-xs font-bold text-rose-600">Uploading Image...</p>
                      </div>
                    )}
                    {!isCameraOpen ? (
                      <div className="flex flex-col gap-3">
                        <div className="flex gap-2">
                          <input type="text" value={currentProduct.image} onChange={e => setCurrentProduct({ ...currentProduct, image: e.target.value })} className="flex-1 w-full px-4 py-2 rounded-lg border border-white/10 bg-black/20 text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-rose-500 outline-none" placeholder="Image URL or take photo" required />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          <button type="button" onClick={triggerGallery} className="w-full bg-purple-500/10 hover:bg-blue-100 text-blue-600 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border-2 border-dashed border-blue-200 transition-all">
                            <Image className="w-5 h-5" /> Gallery
                          </button>
                          <button type="button" onClick={triggerCamera} className="w-full bg-amber-500/10 hover:bg-rose-100 text-rose-600 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border-2 border-dashed border-rose-200 transition-all">
                            <Camera className="w-5 h-5" /> Camera App
                          </button>
                          <button type="button" onClick={startCamera} className="w-full bg-zinc-800/50 hover:bg-zinc-800/80 text-zinc-400 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border-2 border-dashed border-white/10 transition-all col-span-2 md:col-span-1">
                            <Aperture className="w-5 h-5" /> Live View
                          </button>
                        </div>
                        {currentProduct.image && (
                          <button type="button" onClick={triggerCamera} className="w-full bg-zinc-800/80 hover:bg-stone-200 text-zinc-400 py-2 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 border border-white/10 transition-all">
                            <Aperture className="w-4 h-4" /> Retake Photo
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="relative rounded-lg overflow-hidden bg-black aspect-video flex flex-col mt-2 shadow-inner">
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                        <canvas ref={canvasRef} className="hidden" />
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                          <button type="button" onClick={capturePhoto} className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-4 rounded-full shadow-2xl hover:from-amber-400 hover:to-amber-500 transition-transform hover:scale-110 border-4 border-white/30" title="Capture">
                            <Aperture className="w-8 h-8" />
                          </button>
                          <button type="button" onClick={stopCamera} className="bg-zinc-900/80 backdrop-blur-md text-white p-4 rounded-full shadow-2xl hover:bg-stone-700 transition-transform hover:scale-110 border-4 border-white/10" title="Cancel">
                            <X className="w-8 h-8" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {currentProduct.image && !isCameraOpen && (
                    <div className="mt-4 rounded-lg overflow-hidden border border-white/10 h-40 bg-zinc-800/50 flex items-center justify-center shadow-inner">
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
                    <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm font-medium">
                      {formError}
                    </div>
                  )}

                  <div className="pt-4 flex gap-3">
                    <button type="submit" className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white py-3 rounded-lg font-semibold transition-colors shadow-lg shadow-amber-500/20">
                      {isEditing ? 'Update Product' : 'Add Product'}
                    </button>
                    {isEditing && (
                      <button type="button" onClick={() => { setIsEditing(false); setCurrentProduct({ id: '', name: '', category: 'Stationary', price: 0, originalPrice: '' as unknown as number, image: '' }); }} className="px-4 py-3 bg-zinc-800/80 hover:bg-stone-200 text-stone-700 rounded-lg font-semibold transition-colors">
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-white/5 shadow-lg overflow-hidden">
                <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-xl font-bold text-white">Manage Products</h2>
                  <div className="flex items-center gap-3">
                    <button onClick={() => { setIsEditing(false); setCurrentProduct({ id: '', name: '', category: 'Stationary', price: 0, originalPrice: '' as unknown as number, image: '' }); triggerCamera(); }} className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95">
                      <Camera className="w-4 h-4" /> Take Photo & Add
                    </button>
                    <span className="bg-zinc-800/80 text-zinc-400 px-3 py-1 rounded-full text-sm font-medium">{products.length} Items</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-zinc-800/50 text-zinc-400 text-sm uppercase tracking-wider border-b border-white/10">
                        <th className="p-4 font-medium">Product</th>
                        <th className="p-4 font-medium">Category</th>
                        <th className="p-4 font-medium">Price</th>
                        <th className="p-4 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200">
                      {products.map(product => (
                        <tr key={product.id} className="hover:bg-zinc-800/50 transition-colors group">
                          <td className="p-4 flex items-center gap-4">
                            <img
                              src={getPremiumImageUrl(product.image)}
                              alt={product.name}
                              className="w-16 h-16 rounded-lg object-cover border border-white/10 shadow-sm"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=No+Image';
                              }}
                            />
                            <span className="font-semibold text-white text-base">{product.name}</span>
                          </td>
                          <td className="p-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getCategoryColor(product.category)}`}>
                              {product.category}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col gap-1">
                              <span className="font-bold text-white text-lg">₹{Math.round(product.price)}</span>
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
                              <button onClick={() => handleEdit(product)} className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-amber-500/10 rounded-lg transition-colors border border-transparent hover:border-rose-200">
                                <Edit className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(product.id)}
                                disabled={deletingId === product.id}
                                className={`p-2 rounded-lg transition-colors border border-transparent ${deletingId === product.id
                                  ? 'text-stone-300 bg-zinc-800/50 cursor-not-allowed'
                                  : 'text-zinc-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200'
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
          </div>
        )}

        {adminTab === 'orders' && (
          <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-white/5 shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 border-b border-white/10 bg-zinc-800/50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-500" /> Recent Orders
              </h2>
            </div>
            {isLoadingOrders ? (
              <div className="p-10 text-center text-zinc-400">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="p-10 text-center text-zinc-400">No orders found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-zinc-800/50 text-zinc-400 text-sm uppercase tracking-wider border-b border-white/10">
                      <th className="p-4 font-medium">Order ID</th>
                      <th className="p-4 font-medium">Customer</th>
                      <th className="p-4 font-medium">Items</th>
                      <th className="p-4 font-medium">Total</th>
                      <th className="p-4 font-medium">Status / Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-zinc-800/50 transition-colors">
                        <td className="p-4">
                          <span className="font-mono text-xs text-zinc-400">{order.id}</span><br />
                          <span className="text-xs text-stone-400">{new Date(order.createdAt).toLocaleString()}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-white block">{order.customerName}</span>
                          <span className="text-xs text-zinc-400 bg-stone-200 px-2 py-0.5 rounded-full inline-block mt-1">{order.customerPhone}</span>
                        </td>
                        <td className="p-4">
                          <div className="text-sm max-h-24 overflow-y-auto pr-2">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="mb-1 border-b border-white/5 last:border-0 pb-1 flex gap-2 items-center">
                                <img src={getPremiumImageUrl(item.product.image)} alt={item.product.name} className="w-8 h-8 rounded object-cover" />
                                <div>
                                  <p className="font-semibold text-zinc-200 line-clamp-1 leading-tight">{item.product.name}</p>
                                  <p className="text-xs text-zinc-400">₹{Math.round(item.product.price)} x {item.quantity}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-white">₹{Math.round(order.totalAmount)}</span><br />
                          <span className="text-[10px] uppercase bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded inline-block mt-1">{order.paymentMethod}</span>
                          {order.utrNumber && (
                            <div className="mt-2 bg-stone-800 p-2 rounded-lg border border-stone-700">
                              <p className="text-[9px] text-stone-400 uppercase tracking-wider mb-1 font-bold">UTR / Ref Number:</p>
                              <p className="text-emerald-400 font-mono text-xs tracking-widest font-black">{order.utrNumber}</p>
                            </div>
                          )}
                        </td>
                        <td className="p-4 flex flex-col gap-2">
                          {order.status === 'Pending' ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleMarkDelivered(order.id)}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm flex-1"
                              >
                                {order.utrNumber ? "Approve" : "Deliver"}
                              </button>
                              {order.utrNumber && (
                                <button
                                  onClick={() => handleDeleteOrder(order.id)}
                                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm flex-1"
                                >
                                  Reject
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="bg-stone-200 text-zinc-400 px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 justify-center">
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
        )}
        </div>
      </main>
    </div>
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
      <div className="min-h-screen bg-zinc-800/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-zinc-400 font-medium">Loading Store Memory...</p>
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
