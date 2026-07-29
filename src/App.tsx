import React, {  useState, useEffect, useRef  } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { Phone, Mail, Instagram, MessageCircle, MapPin, Map, Lock, LogOut, Plus, Edit, Trash2, Store, ShoppingBag, Menu, X, Camera, Aperture, Globe, Database, Search, ArrowUp, Package, LayoutGrid, ShoppingCart, Minus, Image, ShieldCheck, Gift, Sparkles, Sticker, Rocket, Coffee, Eye, Star, TrendingUp, CheckCircle2, Info , Home, Heart, User, ChevronRight, CreditCard, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AdminApp from './admin/AdminApp';
import LocationMap from './LocationMap';
import { removeBackground as imglyRemoveBackground } from '@imgly/background-removal';

// --- Types ---
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  stock?: number;
  image: string;
  isFeatured?: boolean;
  reviews?: Review[];
}

interface Review {
  rating: number;
  review: string;
  customerName: string;
  createdAt: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface Setting {
  key: string;
  value: string;
}

export interface Order {
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
    // Add quality auto, format auto, and subtle sharpening for that 'premium' look
    if (!url.includes('q_auto')) {
      transformedUrl = transformedUrl.replace('/image/upload/', '/image/upload/q_auto,f_auto,e_sharpen:50/');
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

export async function updateSetting(key: string, value: string) {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value }),
  });
  if (!res.ok) throw new Error("Failed to update setting");
  return res.json();
}

async function fetchProducts(page = 1, limit = 50) {
  const res = await fetch(`${API_BASE}/products?page=${page}&limit=${limit}`);
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

async function uploadImage(dataUrl: string, removeBg: boolean = false) {
  let blob: Blob;

  if (removeBg) {
    console.log("Removing background locally...");
    blob = await imglyRemoveBackground(dataUrl);
    console.log("Background removed successfully!");
  } else {
    // Convert DataURL to Blob
    const res = await fetch(dataUrl);
    blob = await res.blob();
  }

  const formData = new FormData();
  formData.append('image', blob, removeBg ? 'upload.png' : 'upload.jpg');

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
function VisitorPanel({ products, settings, setProducts, hasMore, isLoadingMore, loadMoreProducts }: { products: Product[], settings: Record<string, string>, setProducts: React.Dispatch<React.SetStateAction<Product[]>>, hasMore?: boolean, isLoadingMore?: boolean, loadMoreProducts?: () => void }) {
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
      toast.error("Geolocation is not supported by your browser");
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
            toast.error("Could not fetch address details.");
          }
        } catch (err) {
          console.error(err);
          toast.error("Error fetching address details.");
        } finally {
          setIsFetchingLocationCheckout(false);
        }
      },
      (err) => {
        console.error(err);
        toast.error("Please allow location access in your browser.");
        setIsFetchingLocationCheckout(false);
      }
    );
  };
  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
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
            toast.error("Could not fetch address details.");
          }
        } catch (err) {
          console.error(err);
          toast.error("Error fetching address details.");
        } finally {
          setIsFetchingLocation(false);
        }
      },
      (err) => {
        console.error(err);
        toast.error("Please allow location access in your browser.");
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
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
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

  const [currentSlide, setCurrentSlide] = useState(0);
  const featuredProducts = products.filter(p => p.isFeatured);
  const slideProducts = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 3); // top 3 products for the banner fallback
  
  useEffect(() => {
    if (slideProducts.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideProducts.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [slideProducts.length]);
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
          toast.success("OTP Sent to your mobile successfully!");
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
    { id: 'Bags', icon: <Briefcase className="w-5 h-5" /> },
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
      toast.success("✅ UPI ID Copied!");
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

  
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !reviewName || !reviewText) return;
    
    setIsSubmittingReview(true);
    try {
      const res = await fetch(`${API_BASE}/products/${selectedProduct.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: reviewRating, review: reviewText, customerName: reviewName })
      });
      if (res.ok) {
        const newReview = { rating: reviewRating, review: reviewText, customerName: reviewName, createdAt: new Date().toISOString() };
        setSelectedProduct(prev => prev ? { ...prev, reviews: [...(prev.reviews || []), newReview] } : prev);
        setProducts(prev => prev.map(p => p.id === selectedProduct.id ? { ...p, reviews: [...(p.reviews || []), newReview] } : p));
        setReviewText('');
        setReviewRating(5);
        setReviewName('');
      } else {
        toast.error("Failed to submit review");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error submitting review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="bg-stone-50 font-sans text-gray-900 pb-20 min-h-screen max-w-md md:max-w-6xl mx-auto shadow-2xl relative overflow-x-hidden border-x border-gray-200">
      <Toaster position="top-center" />
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-[#7C3AED] text-white shadow-md">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-yellow-400 rounded-lg flex items-center justify-center text-[#7C3AED] font-black text-xl italic shadow-sm">
              R
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight italic tracking-wide">{t.storeName}</h1>
              <p className="text-[10px] text-violet-100 flex items-center gap-1 opacity-90 italic">
                Explore Plus <Sparkles className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleLanguage} className="text-[10px] font-bold text-white bg-violet-700/50 px-2 py-1 rounded">
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
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
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
      <main className="px-4 py-4 space-y-6 overflow-hidden pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full"
          >
        {currentTab === 'home' && (
          <div className="space-y-4 bg-gray-100 -mx-4 px-4 pb-4">
            {/* Auto-Sliding Banner */}
            <div className="relative w-full h-48 bg-white rounded-sm overflow-hidden shadow-sm mt-4 group">
               <div className="flex w-full h-full transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                  {slideProducts.map((product, idx) => (
                    <div key={idx} className="w-full h-full flex-shrink-0 relative bg-gradient-to-r from-violet-50 to-indigo-50 flex items-center p-4 cursor-pointer" onClick={() => setSelectedProduct(product)}>
                       <div className="w-1/2 z-10 pl-2">
                         <span className="text-[10px] font-bold uppercase tracking-wider bg-red-500 text-white px-2 py-1 rounded inline-block mb-2 shadow-sm">Featured</span>
                         <h2 className="text-lg font-bold leading-tight mb-2 text-gray-900 line-clamp-2">{product.name}</h2>
                         <div className="flex items-baseline gap-1 mb-3">
                           <span className="text-lg font-black text-[#7C3AED]">₹{product.price}</span>
                           {product.originalPrice && <span className="text-xs text-stone-400 line-through">₹{product.originalPrice}</span>}
                         </div>
                         <button className="bg-[#7C3AED] text-white text-[10px] font-bold px-4 py-2 shadow-sm rounded-sm uppercase tracking-wide">Buy Now</button>
                       </div>
                       <div className="w-1/2 h-full flex justify-end items-center relative pr-2">
                          <img src={getPremiumImageUrl(product.image) || "https://placehold.co/400x400?text=No+Image"} alt={product.name} className="h-full max-h-36 object-contain mix-blend-multiply drop-shadow-md" />
                       </div>
                    </div>
                  ))}
               </div>
               <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-2 z-20">
                 {slideProducts.map((_, idx) => (
                   <div key={idx} onClick={(e) => { e.stopPropagation(); setCurrentSlide(idx); }} className="p-2 cursor-pointer flex items-center justify-center">
                     <div className={`w-6 h-1.5 rounded-full transition-colors ${currentSlide === idx ? 'bg-[#7C3AED]' : 'bg-gray-300/80'}`} />
                   </div>
                 ))}
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
                    <div className="w-14 h-14 bg-violet-50 rounded-full flex items-center justify-center text-violet-600 border border-violet-100 transition-colors relative">
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
                <button className="text-sm text-gold-600 font-bold" onClick={() => setCurrentTab('products')}>See All</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {products.map(product => {
                  const cartItem = cart.find(item => item.product.id === product.id);
                  const qty = cartItem ? cartItem.quantity : 0;
                  return (
                    <div key={product.id} className="bg-white p-2 rounded-sm shadow-sm border border-gray-100 flex flex-col relative">
                       <button onClick={() => toggleFavorite(product.id)} className="absolute top-2 right-2 z-10 p-1.5 bg-white/80 backdrop-blur-md rounded-full text-stone-400">
                         <Heart className={`w-4 h-4 ${favorites.includes(product.id) ? 'fill-rose-500 text-rose-500' : 'text-gray-300'}`} />
                       </button>
                       <div className="cursor-pointer group" onClick={() => setSelectedProduct(product)}>
                         <div className="w-full aspect-square bg-white mb-2 overflow-hidden flex items-center justify-center relative p-2">
                           <img src={getPremiumImageUrl(product.image) || "https://placehold.co/400x400?text=No+Image"} alt={product.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300" />
                           {product.originalPrice && product.originalPrice > product.price && (
                             <span className="absolute bottom-0 left-0 bg-black text-white text-[9px] font-bold px-1.5 py-0.5 rounded-tr-lg z-10">
                               {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                             </span>
                           )}
                         </div>
                         <h4 className="font-medium text-gray-700 text-xs mb-1 line-clamp-2 leading-tight h-8 group-hover:text-[#7C3AED] transition-colors">{product.name}</h4>
                       </div>
                       <div className="flex items-center gap-1 mb-2">
                         {product.reviews && product.reviews.length > 0 ? (
                           <>
                             <span className="bg-black text-white text-[9px] font-bold px-1 py-0.5 rounded flex items-center gap-0.5">
                               {(product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(1)} <Star className="w-2 h-2 fill-white" />
                             </span>
                             <span className="text-[9px] text-stone-400">({product.reviews.length})</span>
                           </>
                         ) : (
                           <span className="text-[9px] text-stone-400 italic">No Ratings</span>
                         )}
                       </div>
                       <div className="mt-auto">
                         <div className="flex items-baseline gap-1.5 flex-wrap">
                           <span className="font-bold text-gray-900 text-sm">₹{product.price}</span>
                           {product.originalPrice && product.originalPrice > product.price && (
                             <span className="text-[10px] text-stone-500 line-through">₹{product.originalPrice}</span>
                           )}
                         </div>
                         <div className="mt-2">
                         {qty > 0 ? (
                            <div className="flex items-center justify-between border border-gray-300 rounded-sm overflow-hidden h-7">
                              <button onClick={() => updateQuantity(product.id, qty - 1)} className="bg-gray-100 text-stone-600 w-8 h-full flex items-center justify-center font-bold">-</button>
                              <span className="text-xs font-bold text-gray-900">{qty}</span>
                              <button onClick={() => updateQuantity(product.id, qty + 1)} className="bg-gray-100 text-stone-600 w-8 h-full flex items-center justify-center font-bold">+</button>
                            </div>
                         ) : (
                            <button onClick={() => addToCart(product)} className="w-full bg-white text-[#7C3AED] text-xs font-bold py-1.5 rounded-sm border border-[#7C3AED] hover:bg-violet-50 transition-colors uppercase">
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
                   className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm border ${selectedCategory === cat.id ? 'bg-[#7C3AED] text-white border-[#7C3AED]' : 'bg-white text-gray-700 border-gray-200 hover:bg-stone-50'}`}
                 >
                   {getCategoryName(cat.id)}
                 </button>
              ))}
            </div>

            {/* Product List */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredProducts.length === 0 ? (
                <div className="col-span-2 text-center py-12 text-stone-400">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>{t.noProducts}</p>
                </div>
              ) : (
                filteredProducts.map(product => {
                  const cartItem = cart.find(item => item.product.id === product.id);
                  const qty = cartItem ? cartItem.quantity : 0;
                  return (
                    <div key={product.id} className="bg-white p-2 rounded-sm shadow-sm border border-gray-100 flex flex-col relative">
                       <button onClick={() => toggleFavorite(product.id)} className="absolute top-2 right-2 z-10 p-1.5 bg-white/80 backdrop-blur-md rounded-full text-stone-400">
                         <Heart className={`w-4 h-4 ${favorites.includes(product.id) ? 'fill-rose-500 text-rose-500' : 'text-gray-300'}`} />
                       </button>
                       <div className="cursor-pointer group" onClick={() => setSelectedProduct(product)}>
                         <div className="w-full aspect-square bg-white mb-2 overflow-hidden flex items-center justify-center relative p-2">
                           <img src={getPremiumImageUrl(product.image) || "https://placehold.co/400x400?text=No+Image"} alt={product.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300" />
                           {product.originalPrice && product.originalPrice > product.price && (
                             <span className="absolute bottom-0 left-0 bg-black text-white text-[9px] font-bold px-1.5 py-0.5 rounded-tr-lg z-10">
                               {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                             </span>
                           )}
                         </div>
                         <h4 className="font-medium text-gray-700 text-xs mb-1 line-clamp-2 leading-tight h-8 group-hover:text-[#7C3AED] transition-colors">{product.name}</h4>
                       </div>
                       <div className="flex items-center gap-1 mb-2">
                         {product.reviews && product.reviews.length > 0 ? (
                           <>
                             <span className="bg-black text-white text-[9px] font-bold px-1 py-0.5 rounded flex items-center gap-0.5">
                               {(product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(1)} <Star className="w-2 h-2 fill-white" />
                             </span>
                             <span className="text-[9px] text-stone-400">({product.reviews.length})</span>
                           </>
                         ) : (
                           <span className="text-[9px] text-stone-400 italic">No Ratings</span>
                         )}
                       </div>
                       <div className="mt-auto">
                         <div className="flex items-baseline gap-1.5 flex-wrap">
                           <span className="font-bold text-gray-900 text-sm">₹{product.price}</span>
                           {product.originalPrice && product.originalPrice > product.price && (
                             <span className="text-[10px] text-stone-500 line-through">₹{product.originalPrice}</span>
                           )}
                         </div>
                         <div className="mt-2">
                         {qty > 0 ? (
                            <div className="flex items-center justify-between border border-gray-300 rounded-sm overflow-hidden h-7">
                              <button onClick={() => updateQuantity(product.id, qty - 1)} className="bg-gray-100 text-stone-600 w-8 h-full flex items-center justify-center font-bold">-</button>
                              <span className="text-xs font-bold text-gray-900">{qty}</span>
                              <button onClick={() => updateQuantity(product.id, qty + 1)} className="bg-gray-100 text-stone-600 w-8 h-full flex items-center justify-center font-bold">+</button>
                            </div>
                         ) : (
                            <button onClick={() => addToCart(product)} className="w-full bg-white text-[#7C3AED] text-xs font-bold py-1.5 rounded-sm border border-[#7C3AED] hover:bg-violet-50 transition-colors uppercase">
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
            
            {hasMore && (
              <div className="flex justify-center mt-6 mb-8">
                <button 
                  onClick={loadMoreProducts} 
                  disabled={isLoadingMore}
                  className="bg-white border-2 border-[#7C3AED] text-[#7C3AED] font-bold py-2.5 px-8 rounded-full shadow-sm hover:bg-violet-50 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoadingMore ? (
                    <><div className="w-4 h-4 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin"></div> Loading...</>
                  ) : (
                    "Load More Products"
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        
        {currentTab === 'favorites' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Your Favorites</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {products.filter(p => favorites.includes(p.id)).length === 0 ? (
                <div className="col-span-2 text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                  <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-4">
                    <Heart className="w-12 h-12 text-rose-300" />
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">No Favorites Yet</h3>
                  <p className="text-sm text-stone-500 mb-6">Save your favorite items to view them here later.</p>
                  <button onClick={() => setCurrentTab('home')} className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-8 py-3 rounded-full font-bold shadow-md transition-colors">Browse Products</button>
                </div>
              ) : (
                products.filter(p => favorites.includes(p.id)).map(product => {
                  const cartItem = cart.find(item => item.product.id === product.id);
                  const qty = cartItem ? cartItem.quantity : 0;
                  return (
                    <div key={product.id} className="bg-white p-2 rounded-sm shadow-sm border border-gray-100 flex flex-col relative">
                       <button onClick={() => toggleFavorite(product.id)} className="absolute top-2 right-2 z-10 p-1.5 bg-white/80 backdrop-blur-md rounded-full text-stone-400">
                         <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                       </button>
                       <div className="cursor-pointer group" onClick={() => setSelectedProduct(product)}>
                         <div className="w-full aspect-square bg-white mb-2 overflow-hidden flex items-center justify-center relative p-2">
                           <img src={getPremiumImageUrl(product.image) || "https://placehold.co/400x400?text=No+Image"} alt={product.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300" />
                           {product.originalPrice && product.originalPrice > product.price && (
                             <span className="absolute bottom-0 left-0 bg-black text-white text-[9px] font-bold px-1.5 py-0.5 rounded-tr-lg z-10">
                               {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                             </span>
                           )}
                         </div>
                         <h4 className="font-medium text-gray-700 text-xs mb-1 line-clamp-2 leading-tight h-8 group-hover:text-[#7C3AED] transition-colors">{product.name}</h4>
                       </div>
                       <div className="flex items-center gap-1 mb-2">
                         {product.reviews && product.reviews.length > 0 ? (
                           <>
                             <span className="bg-black text-white text-[9px] font-bold px-1 py-0.5 rounded flex items-center gap-0.5">
                               {(product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(1)} <Star className="w-2 h-2 fill-white" />
                             </span>
                             <span className="text-[9px] text-stone-400">({product.reviews.length})</span>
                           </>
                         ) : (
                           <span className="text-[9px] text-stone-400 italic">No Ratings</span>
                         )}
                       </div>
                       <div className="mt-auto">
                         <div className="flex items-baseline gap-1.5 flex-wrap">
                           <span className="font-bold text-gray-900 text-sm">₹{product.price}</span>
                           {product.originalPrice && product.originalPrice > product.price && (
                             <span className="text-[10px] text-stone-500 line-through">₹{product.originalPrice}</span>
                           )}
                         </div>
                         <div className="mt-2">
                         {qty > 0 ? (
                            <div className="flex items-center justify-between border border-gray-300 rounded-sm overflow-hidden h-7">
                              <button onClick={() => updateQuantity(product.id, qty - 1)} className="bg-gray-100 text-stone-600 w-8 h-full flex items-center justify-center font-bold">-</button>
                              <span className="text-xs font-bold text-gray-900">{qty}</span>
                              <button onClick={() => updateQuantity(product.id, qty + 1)} className="bg-gray-100 text-stone-600 w-8 h-full flex items-center justify-center font-bold">+</button>
                            </div>
                         ) : (
                            <button onClick={() => addToCart(product)} className="w-full bg-white text-[#7C3AED] text-xs font-bold py-1.5 rounded-sm border border-[#7C3AED] hover:bg-violet-50 transition-colors uppercase">
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
               <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                  <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center mb-4">
                    <ShoppingCart className="w-12 h-12 text-gray-300" />
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">Your cart is empty</h3>
                  <p className="text-sm text-stone-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
                  <button onClick={() => setCurrentTab('home')} className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-8 py-3 rounded-full font-bold shadow-md transition-colors">Start Shopping</button>
               </div>
             ) : (
               <>
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 space-y-4">
                      {cart.map((item, idx) => (
                         <div key={idx} className="flex gap-4 items-center">
                            <div className="w-16 h-16 bg-stone-50 rounded-lg overflow-hidden shrink-0">
                               <img src={getPremiumImageUrl(item.product.image) || "https://placehold.co/100x100"} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                               <h5 className="font-bold text-sm text-gray-900 leading-tight">{item.product.name}</h5>
                               <p className="font-black text-gold-600 text-sm mt-1">₹{item.product.price}</p>
                            </div>
                            <div className="flex items-center gap-2 bg-stone-50 border border-gray-200 rounded-lg px-2 py-1 shrink-0">
                              <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="text-stone-600 w-5 h-5 flex items-center justify-center font-bold">-</button>
                              <span className="text-sm font-bold text-gray-900">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="text-stone-600 w-5 h-5 flex items-center justify-center font-bold">+</button>
                            </div>
                         </div>
                      ))}
                    </div>
                    <div className="bg-stone-50 p-4 border-t border-gray-100">
                       <div className="flex justify-between text-sm text-stone-600 mb-2">
                         <span>Items Total</span>
                         <span className="font-bold text-gray-900">₹{cartTotalAmount}</span>
                       </div>
                       <div className="flex justify-between text-sm text-stone-600 mb-4">
                         <span>Delivery Fee</span>
                         <span className="font-bold text-gold-600">Free</span>
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
                          className="w-full bg-stone-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition-all shadow-sm"
                       />
                       <input 
                          type="tel" 
                          placeholder="Phone Number (10 digits)" 
                          value={customerPhone}
                          onChange={e => setCustomerPhone(e.target.value)}
                          className="w-full bg-stone-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition-all shadow-sm"
                       />
                       {!isPhoneVerified && (
                          <div className="flex gap-2">
                            {isOtpSent ? (
                               <div className="flex w-full gap-2">
                                 <input type="text" placeholder="Enter OTP" value={otpInput} onChange={e=>setOtpInput(e.target.value)} className="w-full bg-stone-50 border border-gray-200 rounded-xl py-3 px-4" />
                                 <button onClick={handleVerifyOtp} disabled={isVerifyingOtp} className="bg-black text-white px-4 rounded-xl font-bold whitespace-nowrap">{isVerifyingOtp ? '...' : 'Verify'}</button>
                               </div>
                            ) : (
                               <button onClick={handleSendOtp} disabled={isSendingOtp} className="w-full bg-violet-50 text-violet-600 border border-violet-200 py-3 rounded-xl font-bold shadow-sm">{isSendingOtp ? 'Sending...' : 'Send OTP'}</button>
                            )}
                          </div>
                       )}
                       {isPhoneVerified && <div className="text-gold-600 font-bold text-sm bg-gold-50 p-2 rounded-lg text-center">✔ Phone Verified</div>}
                       
                       <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                          <button onClick={() => setDeliveryMethod('pickup')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${deliveryMethod === 'pickup' ? 'bg-white shadow text-gold-600' : 'text-stone-500'}`}>Shop Pickup</button>
                          <button onClick={() => setDeliveryMethod('home')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${deliveryMethod === 'home' ? 'bg-white shadow text-gold-600' : 'text-stone-500'}`}>Home Delivery</button>
                       </div>

                       {deliveryMethod === 'home' && (
                          <div className="space-y-3">
                             <div className="flex justify-between items-end mb-1">
                               <p className="text-sm font-bold text-gray-700">Delivery Address</p>
                               <button 
                                  onClick={fetchLocationForCheckout}
                                  disabled={isFetchingLocationCheckout}
                                  className="text-xs font-bold text-violet-600 bg-violet-50 px-2 py-1 rounded-md flex items-center gap-1 disabled:opacity-50"
                                >
                                  <MapPin className="w-3 h-3" /> {isFetchingLocationCheckout ? "Fetching..." : "Use Current Location"}
                                </button>
                                <button 
                                  onClick={() => setShowLocationMap('checkout')}
                                  className="text-xs font-bold text-violet-600 bg-violet-50 px-2 py-1 rounded-md flex items-center gap-1"
                                >
                                  <Map className="w-3 h-3" /> Pick from Map
                                </button>
                             </div>
                             <textarea 
                                placeholder="Enter Full Delivery Address" 
                                value={deliveryAddress}
                                onChange={e => setDeliveryAddress(e.target.value)}
                                rows={3}
                                className="w-full bg-stone-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition-all shadow-sm resize-none"
                             />
                             {savedAddresses.length > 0 && (
                                <div className="space-y-2 mt-2">
                                   <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Select Saved Address</p>
                                   <div className="flex gap-2 overflow-x-auto pb-2 snap-x hide-scrollbar">
                                      {savedAddresses.map((addr, idx) => (
                                         <div 
                                           key={idx} 
                                           onClick={() => setDeliveryAddress(addr)}
                                           className="snap-start shrink-0 w-[200px] bg-white border border-gray-200 rounded-xl p-3 cursor-pointer hover:border-gold-500 transition-colors"
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
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center relative hover:bg-stone-50 cursor-pointer transition-colors"
             >
                <div className="absolute top-4 right-4 bg-gold-50 text-gold-600 p-2 rounded-full">
                  <Edit className="w-4 h-4" />
                </div>
                <div className="w-24 h-24 bg-gold-100 rounded-full mb-4 flex items-center justify-center text-gold-600">
                  <User className="w-12 h-12" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{customerName || 'Guest User'}</h2>
                <p className="text-stone-500">{customerPhone || 'Register Number to track orders'}</p>
             </div>

             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-50 flex items-center gap-4 hover:bg-stone-50 cursor-pointer transition-colors" onClick={() => setIsOrdersModalOpen(true)}>
                   <div className="w-10 h-10 bg-violet-50 text-violet-600 rounded-full flex items-center justify-center shrink-0"><Package className="w-5 h-5" /></div>
                   <div className="flex-1">
                     <h4 className="font-bold text-gray-900">My Orders</h4>
                     <p className="text-xs text-stone-500">View order history</p>
                   </div>
                   <ChevronRight className="w-5 h-5 text-gray-300" />
                </div>
                <div className="p-4 border-b border-gray-50 flex items-center gap-4 hover:bg-stone-50 cursor-pointer transition-colors" onClick={() => setIsAddressModalOpen(true)}>
                   <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center shrink-0"><MapPin className="w-5 h-5" /></div>
                   <div className="flex-1">
                     <h4 className="font-bold text-gray-900">Delivery Address</h4>
                     <p className="text-xs text-stone-500">{savedAddresses.length > 0 ? `${savedAddresses.length} saved addresses` : 'Manage saved addresses'}</p>
                   </div>
                   <ChevronRight className="w-5 h-5 text-gray-300" />
                </div>

             </div>

             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-4">
                <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-stone-50/50">
                   <h3 className="font-bold text-gray-900">Store Contact Info</h3>
                </div>
                <a href="https://wa.me/918189940301" target="_blank" rel="noreferrer" className="p-4 border-b border-gray-50 flex items-center gap-4 hover:bg-stone-50 transition-colors">
                   <div className="w-10 h-10 bg-gold-50 text-gold-600 rounded-full flex items-center justify-center shrink-0">
                     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                   </div>
                   <div className="flex-1">
                     <h4 className="font-bold text-gray-900">WhatsApp</h4>
                     <p className="text-xs text-stone-500">+91 8189940301</p>
                   </div>
                </a>
                <a href="mailto:rappaniazzam@gmail.com" className="p-4 border-b border-gray-50 flex items-center gap-4 hover:bg-stone-50 transition-colors">
                   <div className="w-10 h-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center shrink-0">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                   </div>
                   <div className="flex-1">
                     <h4 className="font-bold text-gray-900">Email Us</h4>
                     <p className="text-xs text-stone-500">rappaniazzam@gmail.com</p>
                   </div>
                </a>
                <a href="https://instagram.com/mr_rappani" target="_blank" rel="noreferrer" className="p-4 flex items-center gap-4 hover:bg-stone-50 transition-colors">
                   <div className="w-10 h-10 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center shrink-0">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01M6.5 6.5h11a3 3 0 013 3v11a3 3 0 01-3 3h-11a3 3 0 01-3-3v-11a3 3 0 013-3z"></path></svg>
                   </div>
                   <div className="flex-1">
                     <h4 className="font-bold text-gray-900">Instagram</h4>
                     <p className="text-xs text-stone-500">@mr_rappani</p>
                   </div>
                </a>
             </div>
             
             
             {isProfileModalOpen && (
                <div className="fixed inset-0 z-[100] flex flex-col bg-gray-100">
                  <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm pt-safe">
                    <button onClick={() => setIsProfileModalOpen(false)} className="p-2 -ml-2 rounded-full hover:bg-stone-50">
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
                          className="w-full bg-stone-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Register Number (Phone)</label>
                        <div className="flex gap-2">
                           <div className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-stone-600 font-medium flex items-center justify-center shrink-0">
                             +91
                           </div>
                           <input 
                             type="tel" 
                             maxLength={10}
                             value={customerPhone}
                             onChange={e => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                             placeholder="Enter 10-digit mobile number"
                             className="flex-1 bg-stone-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                           />
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => setIsProfileModalOpen(false)}
                        disabled={customerPhone.length !== 10}
                        className="w-full bg-black text-white rounded-xl py-3 mt-4 font-bold disabled:opacity-50 disabled:bg-gray-400 flex items-center justify-center gap-2 transition-colors"
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
                      <p className="text-sm text-stone-600">Please enter the 12-digit UTR or Reference Number from your payment app to confirm your order.</p>
                      <input 
                          type="text" 
                          placeholder="Enter UTR Number" 
                          value={utrNumber}
                          onChange={e => setUtrNumber(e.target.value)}
                          className="w-full bg-stone-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                      <div className="flex gap-3 pt-2">
                         <button onClick={() => setShowGPayConfirm(false)} className="flex-1 py-3 font-bold text-stone-600 bg-gray-100 rounded-xl">Cancel</button>
                         <button onClick={handleGPayConfirm} className="flex-1 py-3 font-bold text-white bg-black rounded-xl shadow-md">Confirm</button>
                      </div>
                   </div>
                </div>
             )}
           </div>
        )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Product Details Modal (Quick View) */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[200] bg-white flex flex-col"
          >
            {/* Header */}
            <div className="bg-white px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10 pt-safe">
               <button onClick={() => setSelectedProduct(null)} className="p-2 -ml-2 rounded-full hover:bg-stone-50">
                 <ChevronRight className="w-6 h-6 text-gray-900 rotate-180" />
               </button>
               <h2 className="font-bold text-lg line-clamp-1">{selectedProduct.name}</h2>
               <button onClick={() => toggleFavorite(selectedProduct.id)} className="p-2 -mr-2 rounded-full hover:bg-stone-50 text-stone-400">
                 <Heart className={`w-6 h-6 ${favorites.includes(selectedProduct.id) ? 'fill-rose-500 text-rose-500' : 'text-gray-300'}`} />
               </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto pb-24">
               {/* Image */}
               <div className="w-full aspect-square bg-stone-50 flex items-center justify-center p-8 relative">
                 {selectedProduct.originalPrice && (
                    <div className="absolute top-4 left-4 bg-black text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                      {Math.round(((selectedProduct.originalPrice - selectedProduct.price) / selectedProduct.originalPrice) * 100)}% OFF
                    </div>
                 )}
                 <img src={selectedProduct.image} alt={selectedProduct.name} className="object-contain w-full h-full mix-blend-multiply" />
               </div>
               
               {/* Details */}
               <div className="p-4 space-y-4">
                 <div>
                   <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-2">{selectedProduct.name}</h1>
                   <div className="flex items-end gap-2 mb-2">
                     <span className="text-3xl font-black text-gray-900">₹{selectedProduct.price}</span>
                     {selectedProduct.originalPrice && (
                       <>
                         <span className="text-lg text-stone-500 line-through mb-1">₹{selectedProduct.originalPrice}</span>
                         <span className="text-sm font-bold text-gold-600 mb-1">Save ₹{selectedProduct.originalPrice - selectedProduct.price}</span>
                       </>
                     )}
                   </div>
                   {(() => {
                     const totalReviews = selectedProduct.reviews?.length || 0;
                     const avgRating = totalReviews > 0 ? (selectedProduct.reviews!.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1) : '5.0';
                     return (
                       <div className="flex items-center gap-2 mb-4">
                         <div className="bg-black text-white text-xs font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                           {avgRating} <Star className="w-3 h-3 fill-current" />
                         </div>
                         <span className="text-xs text-stone-500">{totalReviews} {totalReviews === 1 ? 'Rating' : 'Ratings'} & Reviews</span>
                       </div>
                     );
                   })()}
                 </div>

                 {/* Highlights */}
                 <div className="border-t border-gray-100 pt-4 space-y-3">
                   <h3 className="font-bold text-gray-900">Highlights</h3>
                   <ul className="space-y-2 text-sm text-stone-600 list-disc list-inside">
                     <li>Premium quality {selectedProduct.category}</li>
                     <li>Durable and long-lasting material</li>
                     <li>100% Genuine Product</li>
                     <li>2 Days Replacement Policy</li>
                     <li>Cash on Delivery available</li>
                   </ul>
                 </div>
                 </div>

                 {/* Reviews Section */}
                 <div className="border-t border-gray-100 pt-4 space-y-4 pb-20">
                   <h3 className="font-bold text-gray-900">Customer Reviews</h3>
                   
                   {/* Review List */}
                   {(!selectedProduct.reviews || selectedProduct.reviews.length === 0) ? (
                     <p className="text-sm text-stone-500 italic">No reviews yet. Be the first to review!</p>
                   ) : (
                     <div className="space-y-4">
                       {selectedProduct.reviews.slice().reverse().map((r, idx) => (
                         <div key={idx} className="bg-stone-50 p-3 rounded-lg border border-gray-100">
                           <div className="flex justify-between items-start mb-1">
                             <span className="font-bold text-sm text-gray-800">{r.customerName}</span>
                             <div className="flex gap-0.5">
                               {[1,2,3,4,5].map(star => (
                                 <Star key={star} className={`w-3 h-3 ${star <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                               ))}
                             </div>
                           </div>
                           <p className="text-xs text-stone-600 mb-1">{r.review}</p>
                           <span className="text-[10px] text-stone-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                         </div>
                       ))}
                     </div>
                   )}

                   {/* Write Review Form */}
                   <form onSubmit={handleSubmitReview} className="bg-white border border-gray-200 p-3 rounded-xl shadow-sm mt-4">
                     <h4 className="font-bold text-sm text-gray-900 mb-3">Write a Review</h4>
                     <div className="flex gap-1 mb-3">
                       {[1,2,3,4,5].map(star => (
                         <button type="button" key={star} onClick={() => setReviewRating(star)} className="focus:outline-none p-1">
                           <Star className={`w-6 h-6 ${star <= reviewRating ? 'fill-amber-400 text-amber-400 drop-shadow-sm' : 'text-gray-300'}`} />
                         </button>
                       ))}
                     </div>
                     <input type="text" placeholder="Your Name" required value={reviewName} onChange={e => setReviewName(e.target.value)} className="w-full bg-stone-50 border border-gray-200 text-sm p-2 rounded-lg mb-2 focus:ring-1 focus:ring-amber-500 outline-none" />
                     <textarea placeholder="Write your experience..." required value={reviewText} onChange={e => setReviewText(e.target.value)} className="w-full bg-stone-50 border border-gray-200 text-sm p-2 rounded-lg mb-3 h-20 resize-none focus:ring-1 focus:ring-amber-500 outline-none" />
                     <button type="submit" disabled={isSubmittingReview} className="w-full bg-amber-500 text-white font-bold py-2 rounded-lg disabled:opacity-50">
                       {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                     </button>
                   </form>
                  </div>
                </div>
             
             {/* Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 max-w-md md:max-w-6xl mx-auto bg-white border-t border-gray-200 p-3 pb-safe flex gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
               <button 
                 onClick={() => {
                   addToCart(selectedProduct);
                   setSelectedProduct(null);
                   setCurrentTab('cart');
                 }}
                 className="flex-1 bg-white border-2 border-gray-200 text-gray-900 py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2"
               >
                 <ShoppingCart className="w-5 h-5" /> Add to Cart
               </button>
               <button 
                 onClick={() => {
                   addToCart(selectedProduct);
                   setSelectedProduct(null);
                   setCurrentTab('cart');
                 }}
                 className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-sm"
               >
                 <Gift className="w-5 h-5" /> Buy Now
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating WhatsApp Widget */}
      <a href="https://wa.me/918189940301" target="_blank" rel="noreferrer" className="fixed bottom-24 right-4 z-50 bg-black text-white p-3.5 rounded-full shadow-lg hover:bg-black transition-colors flex items-center justify-center animate-bounce">
        <MessageCircle className="w-6 h-6 fill-white" />
      </a>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-md md:max-w-6xl bg-white border-t border-gray-200 pb-safe pt-2 px-6 flex justify-between items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] h-16">
         <button onClick={() => setCurrentTab('home')} className={`flex flex-col items-center gap-1 w-16 ${currentTab === 'home' ? 'text-[#7C3AED]' : 'text-stone-400'}`}>
           <Home className={`w-6 h-6 ${currentTab === 'home' ? 'fill-violet-100' : ''}`} />
           <span className="text-[10px] font-bold">Home</span>
         </button>
         <button onClick={() => setCurrentTab('products')} className={`flex flex-col items-center gap-1 w-16 ${currentTab === 'products' ? 'text-[#7C3AED]' : 'text-stone-400'}`}>
           <LayoutGrid className={`w-6 h-6 ${currentTab === 'products' ? 'fill-violet-100' : ''}`} />
           <span className="text-[10px] font-bold">Categories</span>
         </button>
         <button onClick={() => setCurrentTab('cart')} className={`relative flex flex-col items-center gap-1 w-16 ${currentTab === 'cart' ? 'text-[#7C3AED]' : 'text-stone-400'}`}>
           <div className="relative">
             <ShoppingCart className={`w-6 h-6 ${currentTab === 'cart' ? 'fill-violet-100' : ''}`} />
             {cartItemsCount > 0 && (
               <span className="absolute -top-1 -right-2 bg-yellow-500 text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                 {cartItemsCount}
               </span>
             )}
           </div>
           <span className="text-[10px] font-bold">Cart</span>
         </button>
         <button onClick={() => setCurrentTab('favorites')} className={`flex flex-col items-center gap-1 w-16 ${currentTab === 'favorites' ? 'text-[#7C3AED]' : 'text-stone-400'}`}>
           <Heart className={`w-6 h-6 ${currentTab === 'favorites' ? 'fill-violet-100' : ''}`} />
           <span className="text-[10px] font-bold">Favorites</span>
         </button>
         <button onClick={() => setCurrentTab('account')} className={`flex flex-col items-center gap-1 w-16 ${currentTab === 'account' ? 'text-[#7C3AED]' : 'text-stone-400'}`}>
           <User className={`w-6 h-6 ${currentTab === 'account' ? 'fill-violet-100' : ''}`} />
           <span className="text-[10px] font-bold">Account</span>
         </button>
      </nav>
    
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-gray-100">
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm pt-safe">
            <button onClick={() => setIsAddressModalOpen(false)} className="p-2 -ml-2 rounded-full hover:bg-stone-50">
              <ChevronRight className="w-6 h-6 text-gray-900 rotate-180" />
            </button>
            <h2 className="font-black text-xl text-gray-900">Saved Addresses</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {savedAddresses.length === 0 ? (
              <div className="text-center py-12 text-stone-400">
                <MapPin className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No saved addresses yet</p>
              </div>
            ) : (
              savedAddresses.map((addr, idx) => (
                <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-3 relative">
                  <div className="w-10 h-10 bg-gold-50 text-gold-600 rounded-full flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex-1 pr-8">
                    <h4 className="font-bold text-gray-900 mb-1">Address {idx + 1}</h4>
                    <p className="text-sm text-stone-600 whitespace-pre-wrap">{addr}</p>
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
                  className="flex items-center gap-1 text-xs font-bold text-violet-600 bg-violet-50 px-3 py-1.5 rounded-lg disabled:opacity-50"
                >
                  <MapPin className="w-3 h-3" />
                  {isFetchingLocation ? "Fetching..." : "Use Current Location"}
                </button>
              </div>
              <textarea 
                className="w-full bg-stone-50 border-0 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gold-500 h-24 resize-none transition-shadow mb-3" 
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
                className="w-full bg-black text-white rounded-xl py-3 font-bold disabled:opacity-50 disabled:bg-gray-300 flex items-center justify-center gap-2"
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
            <button onClick={() => setIsOrdersModalOpen(false)} className="p-2 -ml-2 rounded-full hover:bg-stone-50">
              <ChevronRight className="w-6 h-6 text-gray-900 rotate-180" />
            </button>
            <h2 className="font-black text-xl text-gray-900">My Orders</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!customerPhone || customerPhone.length < 10 ? (
              <div className="text-center py-12 text-stone-400">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Please add your 10-digit phone number in Account to view orders.</p>
              </div>
            ) : customerOrders.length === 0 ? (
              <div className="text-center py-12 text-stone-400">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No orders found for this number.</p>
              </div>
            ) : (
              customerOrders.map((order, idx) => (
                <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                       <span className="text-xs font-bold text-stone-500">Order Placed: {new Date(order.createdAt).toLocaleDateString()}</span>
                       <div className="font-black text-lg text-gray-900 mt-0.5">₹{order.totalAmount}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${order.status === 'Completed' ? 'bg-gold-100 text-gold-900' : 'bg-orange-100 text-orange-700'}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="text-xs text-stone-600 mb-5 whitespace-pre-wrap leading-relaxed">{order.itemsSummary}</div>
                  
                  {/* Visual Timeline */}
                  <div className="relative mt-2 mb-2 px-1">
                     <div className="absolute top-[5px] left-1 right-1 h-1 bg-gray-100 -translate-y-1/2 rounded-full"></div>
                     <div className="absolute top-[5px] left-1 h-1 bg-[#7C3AED] -translate-y-1/2 rounded-full transition-all duration-500" style={{ width: order.status === 'Pending' ? '25%' : order.status === 'Processing' ? '50%' : order.status === 'Shipped' ? '75%' : order.status === 'Completed' ? '100%' : '0%' }}></div>
                     <div className="relative flex justify-between z-10">
                        <div className={`w-2.5 h-2.5 rounded-full border-2 bg-white ${order.status !== 'Cancelled' ? 'border-[#7C3AED]' : 'border-gray-300'}`}></div>
                        <div className={`w-2.5 h-2.5 rounded-full border-2 bg-white ${['Processing', 'Shipped', 'Completed'].includes(order.status) ? 'border-[#7C3AED]' : 'border-gray-300'}`}></div>
                        <div className={`w-2.5 h-2.5 rounded-full border-2 bg-white ${['Shipped', 'Completed'].includes(order.status) ? 'border-[#7C3AED]' : 'border-gray-300'}`}></div>
                        <div className={`w-2.5 h-2.5 rounded-full border-2 bg-white ${order.status === 'Completed' ? 'border-[#7C3AED]' : 'border-gray-300'}`}></div>
                     </div>
                     <div className="flex justify-between text-[9px] text-stone-500 font-bold mt-2 px-1">
                        <span className={order.status !== 'Cancelled' ? 'text-[#7C3AED]' : ''}>Placed</span>
                        <span className={['Processing', 'Shipped', 'Completed'].includes(order.status) ? 'text-[#7C3AED]' : ''}>Packed</span>
                        <span className={['Shipped', 'Completed'].includes(order.status) ? 'text-[#7C3AED]' : ''}>Shipped</span>
                        <span className={order.status === 'Completed' ? 'text-[#7C3AED]' : ''}>Delivered</span>
                     </div>
                  </div>
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
    case 'Stationary': return 'bg-violet-100 text-violet-700';
    case 'Fancy': return 'bg-purple-100 text-purple-700';
    case 'Toys': return 'bg-yellow-100 text-yellow-700';
    case 'Sports Items': return 'bg-orange-100 text-orange-700';
    case 'Snacks': return 'bg-gold-100 text-gold-900';
    default: return 'bg-gray-100 text-gray-700';
  }
};



export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  const loadMoreProducts = async () => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await fetchProducts(nextPage, 50);
      setProducts(prev => [...prev, ...(res.products || [])]);
      setPage(res.page);
      setHasMore(res.page < res.totalPages);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [allProducts, allSettings] = await Promise.all([
          fetchProducts(1).catch(() => ({ products: [], totalPages: 1, page: 1 })),
          fetchSettings().catch(() => [])
        ]);
        setProducts(allProducts.products || allProducts);
        if (allProducts.totalPages) {
          setPage(allProducts.page || 1);
          setHasMore((allProducts.page || 1) < allProducts.totalPages);
        }
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
        <Route path="/" element={<VisitorPanel products={products} settings={settings} setProducts={setProducts} hasMore={hasMore} isLoadingMore={isLoadingMore} loadMoreProducts={loadMoreProducts} />} />
        <Route path="/admin/*" element={<AdminApp products={products} setProducts={setProducts} settings={settings} setSettings={setSettings} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
