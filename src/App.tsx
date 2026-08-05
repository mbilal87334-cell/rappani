import React, {  useState, useEffect, useRef  } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { Phone, Mail, Instagram, MessageCircle, MapPin, Map, Lock, LogOut, Plus, Edit, Trash2, Store, ShoppingBag, Menu, X, Camera, Aperture, Globe, Database, Search, ArrowUp, Package, LayoutGrid, ShoppingCart, Minus, Image, ShieldCheck, Gift, Sparkles, Sticker, Rocket, Coffee, Eye, Star, TrendingUp, CheckCircle2, Info , Home, Heart, User, ChevronRight, CreditCard, Briefcase, Ticket, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AdminApp from './admin/AdminApp';
import LocationMap from './LocationMap';
import QRCode from 'react-qr-code';
import { removeBackground as imglyRemoveBackground } from '@imgly/background-removal';

// --- Types ---
export interface Product {
  id: string;
  name: string;
  category: string;
  brand?: string;
  sku?: string;
  description?: string;
  specifications?: any;
  variants?: any[];
  price: number;
  originalPrice?: number;
  deliveryCharge?: number;
  stock?: number;
  image: string;
  images?: string[];
  isFeatured?: boolean;
  isVisible?: boolean;
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
  trackingStatus?: string;
  status: string;
  createdAt: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paymentStatus?: string;
  shippingAddress?: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
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

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('adminToken');
  const headers = {
    ...options.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
  return fetch(url, { ...options, headers });
}

export async function updateSetting(key: string, value: string) {
  const res = await fetchWithAuth(`${API_BASE}/settings`, {
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

export async function saveProduct(product: Product, isEditing: boolean) {
  const method = isEditing ? 'PUT' : 'POST';
  const url = isEditing ? `${API_BASE}/products/${product.id}` : `${API_BASE}/products`;
  const res = await fetchWithAuth(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error("Failed to save product");
  return res.json();
}

export async function fetchCategoriesApi() {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function saveCategoryApi(category: any, isEditing: boolean) {
  const method = isEditing ? 'PUT' : 'POST';
  const url = isEditing ? `${API_BASE}/categories/${category.id}` : `${API_BASE}/categories`;
  const res = await fetchWithAuth(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(category),
  });
  if (!res.ok) throw new Error("Failed to save category");
  return res.json();
}

export async function deleteCategoryApi(id: string) {
  const res = await fetchWithAuth(`${API_BASE}/categories/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error("Failed to delete category");
  return res.json();
}

async function checkoutCart(payload: { customerName: string; customerPhone: string; paymentMethod: string; totalAmount: number; items: CartItem[]; utrNumber?: string; couponCode?: string; discountAmount?: number; }) {
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

export async function deleteProduct(id: string) {
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

const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam",
  "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
  "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const TN_DISTRICTS = [
  "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri",
  "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur",
  "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris",
  "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga",
  "Tenkasi", "Thanjavur", "Theni", "Thoothukudi (Tuticorin)", "Tiruchirappalli",
  "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur",
  "Vellore", "Viluppuram", "Virudhunagar"
];

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
function VisitorPanel({ products, settings, setProducts, hasMore, isLoadingMore, loadMoreProducts, apiCategories, setOrders }: { products: Product[], settings: Record<string, string>, setProducts: React.Dispatch<React.SetStateAction<Product[]>>, hasMore?: boolean, isLoadingMore?: boolean, loadMoreProducts?: () => void, apiCategories: any[], setOrders: React.Dispatch<React.SetStateAction<any[]>> }) {
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
  const [useStructuredAddress, setUseStructuredAddress] = useState(true);
  const [checkoutAddressFields, setCheckoutAddressFields] = useState({
    name: localStorage.getItem('rappani_customer_name') || '',
    phone: localStorage.getItem('rappani_customer_phone') || '',
    doorNo: '',
    building: '',
    street: '',
    area: '',
    landmark: '',
    country: 'India',
    state: 'Tamil Nadu',
    district: '',
    pincode: '',
    addressType: 'Home (All day delivery)',
    instructions: ''
  });
  const [addressErrors, setAddressErrors] = useState<Record<string, boolean>>({});
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const validateAddress = () => {
    if (deliveryMethod !== 'home') return true;

    const allowedStates = ["tamil nadu", "kerala", "karnataka", "andhra pradesh"];

    if (!useStructuredAddress) {
      if (!deliveryAddress.trim()) {
        toast.error("Please enter a delivery address or select a saved one!");
        return false;
      }
      
      const addressLower = deliveryAddress.toLowerCase();
      const isValidState = allowedStates.some(state => addressLower.includes(state));
      if (!isValidState) {
        toast.error("We currently deliver only to Tamil Nadu, Kerala, Karnataka, and Andhra Pradesh.");
        return false;
      }
      
      return true;
    }
    
    const errors: Record<string, boolean> = {};
    if (!checkoutAddressFields.name.trim()) errors.name = true;
    if (!checkoutAddressFields.phone.trim()) errors.phone = true;
    if (!checkoutAddressFields.doorNo.trim()) errors.doorNo = true;
    if (!checkoutAddressFields.street.trim()) errors.street = true;
    if (!checkoutAddressFields.area.trim()) errors.area = true;
    if (!checkoutAddressFields.state.trim()) errors.state = true;
    if (!checkoutAddressFields.district.trim()) errors.district = true;
    if (!checkoutAddressFields.pincode.trim()) errors.pincode = true;
    
    setAddressErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Please fill all the required address fields correctly.");
      return false;
    }

    const stateLower = checkoutAddressFields.state.toLowerCase();
    const isStructuredValidState = allowedStates.some(state => stateLower.includes(state));
    if (!isStructuredValidState) {
      toast.error("We currently deliver only to Tamil Nadu, Kerala, Karnataka, and Andhra Pradesh.");
      return false;
    }

    return true;
  };

  useEffect(() => {
    if (useStructuredAddress) {
      const parts = [];
      if (checkoutAddressFields.name) parts.push(`Name: ${checkoutAddressFields.name}`);
      if (checkoutAddressFields.phone) parts.push(`Phone: ${checkoutAddressFields.phone}`);
      if (checkoutAddressFields.doorNo) parts.push(`Door No: ${checkoutAddressFields.doorNo}`);
      if (checkoutAddressFields.building) parts.push(`Building: ${checkoutAddressFields.building}`);
      if (checkoutAddressFields.street) parts.push(`Street: ${checkoutAddressFields.street}`);
      if (checkoutAddressFields.area) parts.push(`Area/Locality: ${checkoutAddressFields.area}`);
      if (checkoutAddressFields.landmark) parts.push(`Landmark: ${checkoutAddressFields.landmark}`);
      if (checkoutAddressFields.district) parts.push(`District/City: ${checkoutAddressFields.district}`);
      if (checkoutAddressFields.state) parts.push(`State: ${checkoutAddressFields.state}`);
      if (checkoutAddressFields.pincode) parts.push(`Pincode: ${checkoutAddressFields.pincode}`);
      if (checkoutAddressFields.addressType) parts.push(`Address Type: ${checkoutAddressFields.addressType}`);
      if (checkoutAddressFields.instructions) parts.push(`Instructions: ${checkoutAddressFields.instructions}`);
      
      setDeliveryAddress(parts.join('\n'));
    }
  }, [checkoutAddressFields, useStructuredAddress]);
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
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent: number } | null>(null);
  const [couponError, setCouponError] = useState('');

  
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
            setCheckoutAddressFields(prev => ({...prev, mapsLink: `https://maps.google.com/?q=${latitude},${longitude}`}));
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
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
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
  const [orderSuccessModal, setOrderSuccessModal] = useState<string | null>(null);

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
  const t = {
    ...translations[lang],
    storeName: settings.store_name || translations[lang].storeName,
    tagline: settings.store_tagline || translations[lang].tagline,
    addressTitle: settings.store_name || translations[lang].addressTitle,
    addressDesc: settings.store_address || translations[lang].addressDesc
  };

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

  const getCategoryName = (catName: string) => {
    const cat = categories.find(c => c.name === catName);
    if (!cat) return catName;
    if (lang === 'ta' && cat.ta) return cat.ta;
    if (lang === 'en' && cat.en) return cat.en;
    return cat.name;
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
    { id: 'All', name: 'All', icon: '🛒', en: 'All', ta: 'அனைத்தும்' },
    ...(apiCategories.length > 0 ? apiCategories : [
      { id: 'Stationary', name: 'Stationary', icon: '📝', en: 'Stationery', ta: 'ஸ்டேஷனரி' },
      { id: 'Fancy', name: 'Fancy Items', icon: '🎀', en: 'Fancy Items', ta: 'ஃபேன்ஸி பொருட்கள்' }
    ])
  ];

  const publicProducts = products.filter(p => p.isVisible !== false);

  const filteredProducts = publicProducts.filter(product => {
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
  const deliveryFee = deliveryMethod === 'home' 
    ? cart.reduce((total, item) => total + ((item.product.deliveryCharge ?? 30) * item.quantity), 0)
    : 0;
  const discountAmount = appliedCoupon ? Math.round(cartTotalAmount * (appliedCoupon.discountPercent / 100)) : 0;
  const finalTotal = Math.round(cartTotalAmount + deliveryFee - discountAmount);

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleValidateCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponError('');
    try {
      const res = await fetch(`${API_BASE}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput })
      });
      const data = await res.json();
      if (data.success) {
        setAppliedCoupon({ code: couponInput.toUpperCase(), discountPercent: data.discountPercent });
        setCouponInput('');
      } else {
        setCouponError(data.error || 'Invalid coupon');
        setAppliedCoupon(null);
      }
    } catch (err) {
      setCouponError('Failed to validate coupon');
    }
  };

  const processCheckoutAndClearCart = async (paymentMethod: string) => {
    if (isCheckingOut) return false;
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
      if (!validateAddress()) {
        return false;
      }
      if (distance !== null && distance > 5) {
        setCheckoutError(t.tooFarError);
        return false;
      }
    }

    setCheckoutError('');
    setIsCheckingOut(true);
    console.log(`[CHECKOUT] processCheckoutAndClearCart called for: ${paymentMethod}`);

    try {
      const payload = {
        customerName,
        customerPhone,
        paymentMethod,
        totalAmount: finalTotal,
        couponCode: appliedCoupon?.code,
        discountAmount: discountAmount,
        shippingAddress: deliveryMethod === 'home' ? (deliveryAddress || (savedAddresses.length > 0 ? savedAddresses[0] : '')) : null,
        items: cart,
        deliveryMethod,
        utrNumber: utrNumber ? utrNumber.trim() : undefined
      };
      await checkoutCart(payload);

      // Refresh global orders so the Admin Panel sees the new order immediately
      fetchOrders().then(data => setOrders(Array.isArray(data) ? data : [])).catch(console.error);

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
      setAppliedCoupon(null);
      setTimeout(() => setIsCartOpen(false), 500);
      toast.success("✅ Order placed successfully! Check 'My Orders' in your Account.");
      return true;
    } catch (err) {
      console.error("Failed to checkout cart", err);
      // fallback just empty if fail but WhatsApp is opened
      return true;
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleWhatsAppCheckout = async () => {
    if (isCheckingOut) return;
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
      if (!validateAddress()) {
        return;
      }
      if (distance !== null && distance > 5) {
        setCheckoutError(t.tooFarError);
        return;
      }
    }

    let message = `*NEW ORDER ALERT* 🚀\n\n*Customer*: ${customerName}\n*Phone*: ${customerPhone}\n\n`;
    cart.forEach(item => {
      message += `- ${item.product.name} (x${item.quantity}) = ₹${Math.round(item.product.price * item.quantity)}\n`;
    });
    message += `\n*Cart Total: ₹${cartTotalAmount}*`;
    if (appliedCoupon) {
       message += `\n*Discount: -₹${Math.round(cartTotalAmount * (appliedCoupon.discountPercent / 100))} (${appliedCoupon.discountPercent}%)*`;
    }
    message += `\n*Delivery Fee: ₹${deliveryFee}* ${deliveryFee === 0 ? '(FREE)' : ''}`;
    message += `\n*Final Total: ₹${finalTotal}*`;
    message += `\n\n*Method*: ${deliveryMethod === 'home' ? 'Home Delivery' : 'Shop Pickup'}`;
    if (deliveryMethod === 'home') {
      message += `\n\n*Delivery Address*:\n${deliveryAddress}`;
    }
    message += `\n\nPlease confirm my order!`;

    // Save the order to Database
    const isSaved = await processCheckoutAndClearCart('WhatsApp Order');
    if (!isSaved) return;

    const encodedMsg = encodeURIComponent(message);
    window.open(`https://wa.me/${settings.admin_phone?.replace(/\\D/g, '') || '918189940301'}?text=${encodedMsg}`, '_blank');
    setAppliedCoupon(null);
    setTimeout(() => setIsCartOpen(false), 500);
  };

  const handleRazorpayCheckout = async () => {
    if (isCheckingOut) return;
    if (!customerName || customerPhone.length !== 10) {
      toast.error("Please enter a valid Name and 10-digit Phone Number!");
      return;
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(customerPhone.trim())) {
      toast.error(t.invalidPhone);
      return;
    }
    if (!isPhoneVerified) {
      toast.error(t.unverifiedPhoneError);
      return;
    }
    if (deliveryMethod === 'home') {
      if (!validateAddress()) {
        return;
      }
      if (distance !== null && distance > 5) {
        toast.error(t.tooFarError);
        return;
      }
    }

    setIsCheckingOut(true);
    try {
      const payload = {
        customerName,
        customerPhone,
        paymentMethod: 'Razorpay',
        totalAmount: finalTotal,
        couponCode: appliedCoupon?.code,
        discountAmount: discountAmount,
        shippingAddress: deliveryMethod === 'home' ? (deliveryAddress || (savedAddresses.length > 0 ? savedAddresses[0] : '')) : null,
        items: cart,
        deliveryMethod,
        userId: customerPhone
      };

      const res = await fetch(`${API_BASE}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Checkout failed");
      }

      setIsCheckingOut(false);

      if (!window.Razorpay) {
        toast.error("Payment system is still loading. Please wait a second.");
        return;
      }

      const options = {
        key: data.key,
        amount: data.amount,
        currency: "INR",
        name: "Rappani Store",
        description: "Order Payment",
        image: "/logo.png",
        order_id: data.razorpayOrderId,
        handler: async function (response: any) {
          const verifyRes = await fetch(`${API_BASE}/razorpay/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: data.orderId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            })
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            toast.success("✅ Payment successful! Order placed.");
            setOrderSuccessModal(data.orderId);
            setCart([]);
            localStorage.removeItem('rappani_cart');
            setAppliedCoupon(null);
            fetchOrders().then(d => setOrders(Array.isArray(d) ? d : [])).catch(console.error);
            setIsCartOpen(false);
          } else {
            toast.error("Payment verification failed! " + verifyData.error);
          }
        },
        prefill: {
          name: customerName,
          contact: customerPhone
        },
        theme: {
          color: "#000000"
        }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any){
        toast.error("Payment Failed! Reason: " + response.error.description);
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || "Failed to initialize payment");
      setIsCheckingOut(false);
    }
  };

  const handleRetryPayment = async (order: any) => {
    try {
      if (!window.Razorpay) {
        toast.error("Payment system loading...");
        return;
      }
      
      const keyRes = await fetch(`${API_BASE}/razorpay/key`);
      const keyData = await keyRes.json();
      
      const options = {
        key: keyData.key,
        amount: Math.round(order.totalAmount * 100),
        currency: "INR",
        name: "Rappani Store",
        description: "Retry Order Payment",
        image: "/logo.png",
        order_id: order.razorpayOrderId,
        handler: async function (response: any) {
          const verifyRes = await fetch(`${API_BASE}/razorpay/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: order.id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            })
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            toast.success("✅ Payment successful! Order placed.");
            setOrderSuccessModal(order.id);
            // Refresh orders to show updated status
            fetch(`${API_BASE}/orders?phone=${customerPhone}`)
              .then(res => res.json())
              .then(data => {
                if (Array.isArray(data)) setCustomerOrders(data.reverse());
              });
            fetchOrders().then(d => setOrders(Array.isArray(d) ? d : [])).catch(console.error);
          } else {
            toast.error("Payment verification failed! " + verifyData.error);
          }
        },
        prefill: {
          name: order.customerName,
          contact: order.customerPhone
        },
        theme: {
          color: "#000000"
        }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any){
        toast.error("Payment Failed! Reason: " + response.error.description);
      });
      rzp.open();
    } catch (err: any) {
      toast.error("Failed to retry payment");
    }
  };

  const handleGPayCheckout = async (e?: React.MouseEvent<any>) => {
    if (e) e.preventDefault();
    if (isCheckingOut) return;
    if (!customerName || !customerPhone) {
      setCheckoutError(t.enterDetails);
      toast.error(t.enterDetails);
      return;
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(customerPhone.trim())) {
      setCheckoutError(t.invalidPhone);
      toast.error(t.invalidPhone);
      return;
    }

    if (!isPhoneVerified) {
      setCheckoutError(t.unverifiedPhoneError);
      toast.error(t.unverifiedPhoneError);
      return;
    }

    if (deliveryMethod === 'home') {
      if (!validateAddress()) {
        return;
      }
      if (distance !== null && distance > 5) {
        setCheckoutError(t.tooFarError);
        toast.error(t.tooFarError);
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
    if (isCheckingOut) return;
    const utrRegex = /^[0-9]{12}$/;
    if (!utrRegex.test(utrNumber.trim())) {
      setCheckoutError('Please enter a valid 12-digit UTR/Ref No. from your bank app.');
      toast.error('Please enter a valid 12-digit UTR/Ref No.');
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
    <div className="bg-gold-50 font-sans text-primary pb-20 min-h-screen max-w-md md:max-w-6xl mx-auto shadow-2xl relative overflow-x-hidden border-x border-neutral-300">
      <Toaster position="top-center" />
      {/* Top Header */}
      <header className="sticky top-0 z-50 glass-dark shadow-md border-b border-gold-500/20">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gold-500 to-gold-600 rounded-xl flex items-center justify-center text-white font-black text-2xl italic shadow-lg shadow-gold-500/20">
              R
            </div>
            <div>
              <h1 className="font-black text-2xl leading-tight tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-gold-100 to-gold-500 uppercase drop-shadow-sm">{t.storeName}</h1>
              <p className="text-[11px] text-neutral-300 flex items-center gap-1 opacity-90 tracking-widest font-medium uppercase mt-0.5">
                Premium Quality <Sparkles className="w-3 h-3 text-gold-500" />
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleLanguage} className="text-xs font-bold text-white premium-button-outline border-white/20 px-3 py-1.5 rounded-full hover:bg-white/10">
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
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search for Products, Brands and More" 
              className="w-full bg-white text-primary border-0 rounded-sm py-2.5 pl-10 pr-4 focus:outline-none shadow-inner text-sm"
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
          <div className="space-y-4 bg-neutral-100 -mx-4 px-4 pb-4">
            {/* Auto-Sliding Banner */}
            <div className="relative w-full h-48 bg-white rounded-sm overflow-hidden shadow-sm mt-4 group">
               <div className="flex w-full h-full transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                  {slideProducts.map((product, idx) => (
                    <div key={idx} className="w-full h-full flex-shrink-0 relative bg-gradient-to-r from-violet-50 to-indigo-50 flex items-center p-4 cursor-pointer" onClick={() => setSelectedProduct(product)}>
                       <div className="w-1/2 z-10 pl-2">
                         <span className="text-[10px] font-bold uppercase tracking-wider bg-red-500 text-white px-2 py-1 rounded inline-block mb-2 shadow-sm">Featured</span>
                         <h2 className="text-lg font-bold leading-tight mb-2 text-primary line-clamp-2">{product.name}</h2>
                         <div className="flex items-baseline gap-1 mb-3">
                           <span className="text-lg font-black text-gold-500">₹{product.price}</span>
                           {product.originalPrice && <span className="text-xs text-neutral-400 line-through">₹{product.originalPrice}</span>}
                         </div>
                         <button className="premium-button text-[10px] font-bold px-4 py-2 shadow-sm rounded-sm uppercase tracking-wide">Buy Now</button>
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
                     <div className={`w-6 h-1.5 rounded-full transition-colors ${currentSlide === idx ? 'bg-primary' : 'bg-gray-300/80'}`} />
                   </div>
                 ))}
               </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-sm shadow-sm p-3 -mx-2">
              <div className="flex justify-between items-center mb-3 px-2">
                <h3 className="text-sm font-bold text-primary">Shop by Category</h3>
              </div>
              <div className="flex overflow-x-auto no-scrollbar gap-4 px-2 pb-2">
                {categories.map((cat, idx) => (
                  <div key={idx} onClick={() => { setSelectedCategory(cat.name); setCurrentTab('products'); }} className="flex flex-col items-center gap-1 cursor-pointer min-w-[70px]">
                    <div className="w-14 h-14 bg-gold-500/10 rounded-full flex items-center justify-center text-gold-500 border border-gold-500/20 transition-colors relative">
                       {cat.icon}
                    </div>
                    <span className="text-[10px] font-medium text-center text-primary-light leading-tight">{getCategoryName(cat.name)}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Featured Products (Home Tab) */}
            <div>
               <div className="flex justify-between items-end mb-4">
                <h3 className="text-lg font-bold text-primary">Popular Now</h3>
                <button className="text-sm text-gold-600 font-bold" onClick={() => setCurrentTab('products')}>See All</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {publicProducts.slice(0, 4).map(product => {
                  const cartItem = cart.find(item => item.product.id === product.id);
                  const qty = cartItem ? cartItem.quantity : 0;
                  return (
                    <div key={product.id} className="bg-white p-2 rounded-sm shadow-sm border border-neutral-300/50 flex flex-col relative">
                       <button onClick={() => toggleFavorite(product.id)} className="absolute top-2 right-2 z-10 p-1.5 bg-white/80 backdrop-blur-md rounded-full text-neutral-400">
                         <Heart className={`w-4 h-4 ${favorites.includes(product.id) ? 'fill-rose-500 text-rose-500' : 'text-neutral-300'}`} />
                       </button>
                       <div className="cursor-pointer group" onClick={() => setSelectedProduct(product)}>
                         <div className="w-full aspect-square bg-white mb-2 overflow-hidden flex items-center justify-center relative p-2">
                           <img src={getPremiumImageUrl(product.image) || "https://placehold.co/400x400?text=No+Image"} alt={product.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300" />
                           {product.originalPrice && product.originalPrice > product.price && (
                             <span className="absolute bottom-0 left-0 premium-button text-[9px] font-bold px-1.5 py-0.5 rounded-tr-lg z-10">
                               {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                             </span>
                           )}
                         </div>
                         <h4 className="font-medium text-primary-light text-xs mb-1 line-clamp-2 leading-tight h-8 group-hover:text-gold-500 transition-colors">{product.name}</h4>
                       </div>
                       <div className="flex items-center gap-1 mb-2">
                         {product.reviews && product.reviews.length > 0 ? (
                           <>
                             <span className="premium-button text-[9px] font-bold px-1 py-0.5 rounded flex items-center gap-0.5">
                               {(product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(1)} <Star className="w-2 h-2 fill-white" />
                             </span>
                             <span className="text-[9px] text-neutral-400">({product.reviews.length})</span>
                           </>
                         ) : (
                           <span className="text-[9px] text-neutral-400 italic">No Ratings</span>
                         )}
                       </div>
                       <div className="mt-auto">
                         <div className="flex items-baseline gap-1.5 flex-wrap">
                           <span className="font-bold text-primary text-sm">₹{product.price}</span>
                           {product.originalPrice && product.originalPrice > product.price && (
                             <span className="text-[10px] text-neutral-500 line-through">₹{product.originalPrice}</span>
                           )}
                         </div>
                         <div className="mt-2">
                         {qty > 0 ? (
                            <div className="flex items-center justify-between border border-neutral-300 rounded-sm overflow-hidden h-7">
                              <button onClick={() => updateQuantity(product.id, qty - 1)} className="bg-neutral-100 text-neutral-500 w-8 h-full flex items-center justify-center font-bold">-</button>
                              <span className="text-xs font-bold text-primary">{qty}</span>
                              <button onClick={() => updateQuantity(product.id, qty + 1)} className="bg-neutral-100 text-neutral-500 w-8 h-full flex items-center justify-center font-bold">+</button>
                            </div>
                         ) : (
                            <button onClick={() => addToCart(product)} className="w-full bg-white text-gold-500 text-xs font-bold py-1.5 rounded-sm border border-gold-500 hover:bg-gold-500/10 transition-colors uppercase">
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
                   onClick={() => setSelectedCategory(cat.name)}
                   className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm border ${selectedCategory === cat.name ? 'premium-button border-gold-500' : 'bg-white text-primary-light border-neutral-300 hover:bg-gold-50'}`}
                 >
                   {getCategoryName(cat.name)}
                 </button>
              ))}
            </div>

            {/* Product List */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredProducts.length === 0 ? (
                <div className="col-span-2 text-center py-12 text-neutral-400">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>{t.noProducts}</p>
                </div>
              ) : (
                filteredProducts.map(product => {
                  const cartItem = cart.find(item => item.product.id === product.id);
                  const qty = cartItem ? cartItem.quantity : 0;
                  return (
                    <div key={product.id} className="bg-white p-2 rounded-sm shadow-sm border border-neutral-300/50 flex flex-col relative">
                       <button onClick={() => toggleFavorite(product.id)} className="absolute top-2 right-2 z-10 p-1.5 bg-white/80 backdrop-blur-md rounded-full text-neutral-400">
                         <Heart className={`w-4 h-4 ${favorites.includes(product.id) ? 'fill-rose-500 text-rose-500' : 'text-neutral-300'}`} />
                       </button>
                       <div className="cursor-pointer group" onClick={() => setSelectedProduct(product)}>
                         <div className="w-full aspect-square bg-white mb-2 overflow-hidden flex items-center justify-center relative p-2">
                           <img src={getPremiumImageUrl(product.image) || "https://placehold.co/400x400?text=No+Image"} alt={product.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300" />
                           {product.originalPrice && product.originalPrice > product.price && (
                             <span className="absolute bottom-0 left-0 premium-button text-[9px] font-bold px-1.5 py-0.5 rounded-tr-lg z-10">
                               {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                             </span>
                           )}
                         </div>
                         <h4 className="font-medium text-primary-light text-xs mb-1 line-clamp-2 leading-tight h-8 group-hover:text-gold-500 transition-colors">{product.name}</h4>
                       </div>
                       <div className="flex items-center gap-1 mb-2">
                         {product.reviews && product.reviews.length > 0 ? (
                           <>
                             <span className="premium-button text-[9px] font-bold px-1 py-0.5 rounded flex items-center gap-0.5">
                               {(product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(1)} <Star className="w-2 h-2 fill-white" />
                             </span>
                             <span className="text-[9px] text-neutral-400">({product.reviews.length})</span>
                           </>
                         ) : (
                           <span className="text-[9px] text-neutral-400 italic">No Ratings</span>
                         )}
                       </div>
                       <div className="mt-auto">
                         <div className="flex items-baseline gap-1.5 flex-wrap">
                           <span className="font-bold text-primary text-sm">₹{product.price}</span>
                           {product.originalPrice && product.originalPrice > product.price && (
                             <span className="text-[10px] text-neutral-500 line-through">₹{product.originalPrice}</span>
                           )}
                         </div>
                         <div className="mt-2">
                         {qty > 0 ? (
                            <div className="flex items-center justify-between border border-neutral-300 rounded-sm overflow-hidden h-7">
                              <button onClick={() => updateQuantity(product.id, qty - 1)} className="bg-neutral-100 text-neutral-500 w-8 h-full flex items-center justify-center font-bold">-</button>
                              <span className="text-xs font-bold text-primary">{qty}</span>
                              <button onClick={() => updateQuantity(product.id, qty + 1)} className="bg-neutral-100 text-neutral-500 w-8 h-full flex items-center justify-center font-bold">+</button>
                            </div>
                         ) : (
                            <button onClick={() => addToCart(product)} className="w-full bg-white text-gold-500 text-xs font-bold py-1.5 rounded-sm border border-gold-500 hover:bg-gold-500/10 transition-colors uppercase">
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
                  className="bg-white border-2 border-gold-500 text-gold-500 font-bold py-2.5 px-8 rounded-full shadow-sm hover:bg-gold-500/10 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoadingMore ? (
                    <><div className="w-4 h-4 border-2 border-gold-500 border-t-transparent rounded-full animate-spin"></div> Loading...</>
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
            <h2 className="text-xl font-bold text-primary">Your Favorites</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {products.filter(p => favorites.includes(p.id)).length === 0 ? (
                <div className="col-span-2 text-center py-16 premium-card flex flex-col items-center justify-center">
                  <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-4">
                    <Heart className="w-12 h-12 text-rose-300" />
                  </div>
                  <h3 className="font-bold text-xl text-primary mb-2">No Favorites Yet</h3>
                  <p className="text-sm text-neutral-500 mb-6">Save your favorite items to view them here later.</p>
                  <button onClick={() => setCurrentTab('home')} className="bg-primary hover:bg-[#6D28D9] text-white px-8 py-3 rounded-full font-bold shadow-md transition-colors">Browse Products</button>
                </div>
              ) : (
                products.filter(p => favorites.includes(p.id)).map(product => {
                  const cartItem = cart.find(item => item.product.id === product.id);
                  const qty = cartItem ? cartItem.quantity : 0;
                  return (
                    <div key={product.id} className="bg-white p-2 rounded-sm shadow-sm border border-neutral-300/50 flex flex-col relative">
                       <button onClick={() => toggleFavorite(product.id)} className="absolute top-2 right-2 z-10 p-1.5 bg-white/80 backdrop-blur-md rounded-full text-neutral-400">
                         <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                       </button>
                       <div className="cursor-pointer group" onClick={() => setSelectedProduct(product)}>
                         <div className="w-full aspect-square bg-white mb-2 overflow-hidden flex items-center justify-center relative p-2">
                           <img src={getPremiumImageUrl(product.image) || "https://placehold.co/400x400?text=No+Image"} alt={product.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300" />
                           {product.originalPrice && product.originalPrice > product.price && (
                             <span className="absolute bottom-0 left-0 premium-button text-[9px] font-bold px-1.5 py-0.5 rounded-tr-lg z-10">
                               {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                             </span>
                           )}
                         </div>
                         <h4 className="font-medium text-primary-light text-xs mb-1 line-clamp-2 leading-tight h-8 group-hover:text-gold-500 transition-colors">{product.name}</h4>
                       </div>
                       <div className="flex items-center gap-1 mb-2">
                         {product.reviews && product.reviews.length > 0 ? (
                           <>
                             <span className="premium-button text-[9px] font-bold px-1 py-0.5 rounded flex items-center gap-0.5">
                               {(product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(1)} <Star className="w-2 h-2 fill-white" />
                             </span>
                             <span className="text-[9px] text-neutral-400">({product.reviews.length})</span>
                           </>
                         ) : (
                           <span className="text-[9px] text-neutral-400 italic">No Ratings</span>
                         )}
                       </div>
                       <div className="mt-auto">
                         <div className="flex items-baseline gap-1.5 flex-wrap">
                           <span className="font-bold text-primary text-sm">₹{product.price}</span>
                           {product.originalPrice && product.originalPrice > product.price && (
                             <span className="text-[10px] text-neutral-500 line-through">₹{product.originalPrice}</span>
                           )}
                         </div>
                         <div className="mt-2">
                         {qty > 0 ? (
                            <div className="flex items-center justify-between border border-neutral-300 rounded-sm overflow-hidden h-7">
                              <button onClick={() => updateQuantity(product.id, qty - 1)} className="bg-neutral-100 text-neutral-500 w-8 h-full flex items-center justify-center font-bold">-</button>
                              <span className="text-xs font-bold text-primary">{qty}</span>
                              <button onClick={() => updateQuantity(product.id, qty + 1)} className="bg-neutral-100 text-neutral-500 w-8 h-full flex items-center justify-center font-bold">+</button>
                            </div>
                         ) : (
                            <button onClick={() => addToCart(product)} className="w-full bg-white text-gold-500 text-xs font-bold py-1.5 rounded-sm border border-gold-500 hover:bg-gold-500/10 transition-colors uppercase">
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
             <h2 className="text-xl font-bold text-primary">Your Cart</h2>
             {cart.length === 0 ? (
               <div className="text-center py-16 premium-card flex flex-col items-center justify-center">
                  <div className="w-24 h-24 bg-gold-50 rounded-full flex items-center justify-center mb-4">
                    <ShoppingCart className="w-12 h-12 text-neutral-300" />
                  </div>
                  <h3 className="font-bold text-xl text-primary mb-2">Your cart is empty</h3>
                  <p className="text-sm text-neutral-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
                  <button onClick={() => setCurrentTab('home')} className="bg-primary hover:bg-[#6D28D9] text-white px-8 py-3 rounded-full font-bold shadow-md transition-colors">Start Shopping</button>
               </div>
             ) : (
               <>
                  <div className="premium-card overflow-hidden">
                    <div className="p-4 space-y-4">
                      {cart.map((item, idx) => (
                         <div key={idx} className="flex gap-4 items-center">
                            <div className="w-16 h-16 bg-gold-50 rounded-lg overflow-hidden shrink-0">
                               <img src={getPremiumImageUrl(item.product.image) || "https://placehold.co/100x100"} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                               <h5 className="font-bold text-sm text-primary leading-tight">{item.product.name}</h5>
                               <p className="font-black text-gold-600 text-sm mt-1">₹{item.product.price}</p>
                            </div>
                            <div className="flex items-center gap-2 bg-gold-50 border border-neutral-300 rounded-lg px-2 py-1 shrink-0">
                              <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="text-neutral-500 w-5 h-5 flex items-center justify-center font-bold">-</button>
                              <span className="text-sm font-bold text-primary">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="text-neutral-500 w-5 h-5 flex items-center justify-center font-bold">+</button>
                            </div>
                         </div>
                      ))}
                    </div>
                    <div className="bg-gold-50 p-4 border-t border-neutral-300/50">
                       <div className="flex justify-between text-sm text-neutral-500 mb-2">
                         <span>Items Total</span>
                         <span className="font-bold text-primary">₹{cartTotalAmount}</span>
                       </div>
                       <div className="flex justify-between text-sm text-neutral-500 mb-4">
                         <span>Delivery Fee</span>
                         <span className="font-bold text-gold-600">{deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`}</span>
                       </div>
                        {appliedCoupon && (
                          <div className="flex justify-between text-green-600 font-medium pb-2">
                            <span>Discount ({appliedCoupon.discountPercent}%)</span>
                            <span>-₹{Math.round(cartTotalAmount * (appliedCoupon.discountPercent / 100))}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-lg font-black text-primary pt-3 border-t border-neutral-300">
                          <span>To Pay</span>
                          <span>₹{finalTotal}</span>
                        </div>
                     </div>
                   </div>

                   {/* Coupon Section */}
                   <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-300/50 space-y-3">
                     <h3 className="font-bold text-primary">Apply Coupon</h3>
                     {appliedCoupon ? (
                       <div className="flex items-center justify-between bg-green-50 text-green-700 p-3 rounded-xl border border-green-200">
                         <div className="flex items-center gap-2 font-bold">
                           <Ticket className="w-5 h-5" />
                           {appliedCoupon.code} ({appliedCoupon.discountPercent}% OFF)
                         </div>
                         <button onClick={() => setAppliedCoupon(null)} className="text-green-700 hover:text-green-900 font-bold p-1">
                           <X className="w-5 h-5" />
                         </button>
                       </div>
                     ) : (
                       <div>
                         <div className="flex gap-2">
                           <input 
                             type="text" 
                             placeholder="Enter Code" 
                             value={couponInput}
                             onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                             className="w-full bg-gold-50 border border-neutral-300 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 font-bold uppercase transition-all shadow-sm text-primary"
                           />
                           <button onClick={handleValidateCoupon} className="premium-button px-5 rounded-xl font-bold whitespace-nowrap shadow-sm">
                             Apply
                           </button>
                         </div>
                         {couponError && <p className="text-red-500 text-sm font-medium mt-2">{couponError}</p>}
                       </div>
                     )}
                   </div>

                  {/* Checkout Details */}
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-300/50 space-y-4">
                    <h3 className="font-bold text-primary">Shipping Information</h3>
                    {checkoutError && (
                      <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100 flex items-start gap-2">
                         <Info className="w-4 h-4 shrink-0 mt-0.5" />
                         <span>{checkoutError}</span>
                      </div>
                    )}
                    <div className="space-y-4">
                       <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                         <div className="flex justify-between items-center mb-3">
                           <div className="flex gap-2">
                             <button 
                                onClick={fetchLocationForCheckout}
                                disabled={isFetchingLocationCheckout}
                                className="text-xs font-bold bg-white text-neutral-700 border border-neutral-300 px-3 py-2 rounded-lg flex items-center gap-1 hover:bg-neutral-100 transition-colors shadow-sm"
                              >
                                <MapPin className="w-3.5 h-3.5" /> {isFetchingLocationCheckout ? "Fetching..." : "Pin your location"}
                              </button>
                              <button 
                                onClick={() => setShowLocationMap('checkout')}
                                className="text-xs font-bold bg-white text-neutral-700 border border-neutral-300 px-3 py-2 rounded-lg flex items-center gap-1 hover:bg-neutral-100 transition-colors shadow-sm"
                              >
                                <Navigation className="w-3.5 h-3.5" /> Allow live location
                              </button>
                           </div>
                         </div>
                         <div className="h-32 bg-gray-200 rounded-lg overflow-hidden relative cursor-pointer" onClick={() => setShowLocationMap('checkout')}>
                           <div className="absolute inset-0 bg-map-pattern opacity-50"></div>
                           <div className="absolute inset-0 flex items-center justify-center flex-col">
                             <Map className="w-8 h-8 text-neutral-400 mb-1" />
                             <p className="text-[10px] text-neutral-500 font-bold text-center px-4">Click to auto-detect and pin your live delivery location.</p>
                           </div>
                         </div>
                       </div>

                       <div className="space-y-3">
                         <div>
                           <label className="text-[10px] font-bold text-neutral-500 uppercase">Full Name *</label>
                           <input 
                              type="text" 
                              placeholder="Enter your full name" 
                              value={checkoutAddressFields.name}
                              onChange={e => { setCheckoutAddressFields(prev => ({...prev, name: e.target.value})); setCustomerName(e.target.value); setAddressErrors(prev => ({...prev, name: false})); }}
                              className={`w-full bg-stone-50 border ${addressErrors.name ? 'border-red-500' : 'border-neutral-200'} rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-gold-500`}
                           />
                         </div>
                         <div>
                           <label className="text-[10px] font-bold text-neutral-500 uppercase">Mobile Number *</label>
                           <input 
                              type="tel" 
                              placeholder="Enter your 10-digit mobile number" 
                              value={checkoutAddressFields.phone}
                              onChange={e => { setCheckoutAddressFields(prev => ({...prev, phone: e.target.value})); setCustomerPhone(e.target.value); setAddressErrors(prev => ({...prev, phone: false})); }}
                              className={`w-full bg-stone-50 border ${addressErrors.phone ? 'border-red-500' : 'border-neutral-200'} rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-gold-500`}
                           />
                         </div>
                         
                         {!isPhoneVerified && checkoutAddressFields.phone.length === 10 && (
                            <div className="flex gap-2">
                              {isOtpSent ? (
                                 <div className="flex w-full gap-2">
                                   <input type="text" placeholder="Enter OTP" value={otpInput} onChange={e=>setOtpInput(e.target.value)} className="w-full bg-gold-50 border border-neutral-300 rounded-xl py-3 px-4" />
                                   <button onClick={handleVerifyOtp} disabled={isVerifyingOtp} className="premium-button px-4 rounded-xl font-bold whitespace-nowrap">{isVerifyingOtp ? '...' : 'Verify'}</button>
                                 </div>
                              ) : (
                                 <button onClick={handleSendOtp} disabled={isSendingOtp} className="w-full bg-gold-500/10 text-gold-500 border border-gold-500/30 py-3 rounded-xl font-bold shadow-sm">{isSendingOtp ? 'Sending...' : 'Send OTP'}</button>
                              )}
                            </div>
                         )}
                         {isPhoneVerified && <div className="text-gold-600 font-bold text-sm bg-gold-50 p-2 rounded-lg text-center">✔ Phone Verified</div>}
                       </div>
                               <div className="space-y-3 mt-2 bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
                                  <div className="flex gap-3">
                                    <div className="flex-1">
                                      <label className="text-[10px] font-bold text-neutral-500 uppercase">Door No / Flat No *</label>
                                      <input 
                                        type="text" 
                                        value={checkoutAddressFields.doorNo}
                                        onChange={e => { setCheckoutAddressFields(prev => ({...prev, doorNo: e.target.value})); setAddressErrors(prev => ({...prev, doorNo: false})); }}
                                        className={`w-full bg-stone-50 border ${addressErrors.doorNo ? 'border-red-500' : 'border-neutral-200'} rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gold-500`}
                                        placeholder="e.g. 21B"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <label className="text-[10px] font-bold text-neutral-500 uppercase">Building (Optional)</label>
                                      <input 
                                        type="text" 
                                        value={checkoutAddressFields.building}
                                        onChange={e => setCheckoutAddressFields(prev => ({...prev, building: e.target.value}))}
                                        className="w-full bg-stone-50 border border-neutral-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gold-500"
                                        placeholder="e.g. Royal Plaza"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase">Street / Main Street *</label>
                                    <input 
                                      type="text" 
                                      value={checkoutAddressFields.street}
                                      onChange={e => { setCheckoutAddressFields(prev => ({...prev, street: e.target.value})); setAddressErrors(prev => ({...prev, street: false})); }}
                                      className={`w-full bg-stone-50 border ${addressErrors.street ? 'border-red-500' : 'border-neutral-200'} rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gold-500`}
                                      placeholder="e.g. Kottikulam Road"
                                    />
                                  </div>
                                  <div className="flex gap-3">
                                    <div className="flex-1">
                                      <label className="text-[10px] font-bold text-neutral-500 uppercase">Area / Landmark *</label>
                                      <input 
                                        type="text" 
                                        value={checkoutAddressFields.area}
                                        onChange={e => { setCheckoutAddressFields(prev => ({...prev, area: e.target.value})); setAddressErrors(prev => ({...prev, area: false})); }}
                                        className={`w-full bg-stone-50 border ${addressErrors.area ? 'border-red-500' : 'border-neutral-200'} rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gold-500`}
                                        placeholder="e.g. Melapalayam"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <label className="text-[10px] font-bold text-neutral-500 uppercase">City / District *</label>
                                      <input 
                                        type="text" 
                                        value={checkoutAddressFields.district}
                                        onChange={e => { setCheckoutAddressFields(prev => ({...prev, district: e.target.value})); setAddressErrors(prev => ({...prev, district: false})); }}
                                        className={`w-full bg-stone-50 border ${addressErrors.district ? 'border-red-500' : 'border-neutral-200'} rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gold-500`}
                                        placeholder="e.g. Tirunelveli"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex gap-3">
                                    <div className="flex-1">
                                       <label className="text-[10px] font-bold text-neutral-500 uppercase">Pincode / Zipcode *</label>
                                       <input 
                                         type="text" 
                                         value={checkoutAddressFields.pincode}
                                         onChange={e => { setCheckoutAddressFields(prev => ({...prev, pincode: e.target.value})); setAddressErrors(prev => ({...prev, pincode: false})); }}
                                         className={`w-full bg-stone-50 border ${addressErrors.pincode ? 'border-red-500' : 'border-neutral-200'} rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-gold-500`}
                                         placeholder="Enter your pincode"
                                       />
                                     </div>
                                    <div className="flex-1">
                                      <label className="text-[10px] font-bold text-neutral-500 uppercase">State *</label>
                                      <select 
                                        value={checkoutAddressFields.state}
                                        onChange={e => { setCheckoutAddressFields(prev => ({...prev, state: e.target.value})); }}
                                        className="w-full bg-stone-50 border border-neutral-200 rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-gold-500 appearance-none"
                                      >
                                        <option value="Tamil Nadu">Tamil Nadu</option>
                                        <option value="Kerala">Kerala</option>
                                        <option value="Karnataka">Karnataka</option>
                                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase">Address Type *</label>
                                    <select 
                                      value={checkoutAddressFields.addressType}
                                      onChange={e => setCheckoutAddressFields(prev => ({...prev, addressType: e.target.value}))}
                                      className="w-full bg-stone-50 border border-neutral-200 rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-gold-500 appearance-none"
                                    >
                                      <option value="Home (All day delivery)">Home (All day delivery)</option>
                                      <option value="Office (Delivery between 10 AM - 5 PM)">Office (Delivery between 10 AM - 5 PM)</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase">Delivery Instructions (Optional)</label>
                                    <textarea 
                                      value={checkoutAddressFields.instructions}
                                      onChange={e => setCheckoutAddressFields(prev => ({...prev, instructions: e.target.value}))}
                                      className="w-full bg-stone-50 border border-neutral-200 rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-gold-500 resize-none"
                                      placeholder="Describe your delivery instructions (e.g. Leave at security)"
                                      rows={2}
                                    />
                                  </div>
                               </div>

                             {savedAddresses.length > 0 && (
                                <div className="space-y-2 mt-2">
                                   <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Select Saved Address</p>
                                   <div className="flex gap-2 overflow-x-auto pb-2 snap-x hide-scrollbar">
                                      {savedAddresses.map((addr, idx) => (
                                         <div 
                                           key={idx} 
                                           onClick={() => { setDeliveryAddress(addr); setUseStructuredAddress(false); }}
                                           className="snap-start shrink-0 w-[200px] bg-white border border-neutral-300 rounded-xl p-3 cursor-pointer hover:border-gold-500 transition-colors"
                                         >
                                            <p className="text-xs text-primary-light line-clamp-2">{addr}</p>
                                         </div>
                                      ))}
                                   </div>
                                </div>
                             )}


                       <div className="pt-2 space-y-3">
                           <h3 className="font-bold text-primary flex items-center gap-2"><CreditCard className="w-5 h-5" /> Payment</h3>
                           <div 
                             onClick={() => handleGPayCheckout()}
                             className="w-full bg-neutral-50 p-6 rounded-xl border border-neutral-200 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-neutral-100/80 transition-all hover:border-gold-500 group relative"
                           >
                             <p className="text-sm text-neutral-600 mb-2 font-medium">Scan the QR Code to pay <br/><strong className="text-lg text-primary">₹{finalTotal}</strong> via any UPI App</p>
                             <div className="w-40 h-40 bg-white rounded-xl shadow flex items-center justify-center border border-gray-100 mb-3 group-hover:scale-105 transition-transform duration-200">
                               <QRCode 
                                 value={`upi://pay?pa=mohammedazzam200512@okaxis&pn=Rappani Store&am=${finalTotal}&cu=INR`} 
                                 size={140}
                                 level="H"
                               />
                             </div>
                             <p className="text-xs font-bold text-gold-600 bg-gold-50 px-3 py-1 rounded-full group-hover:bg-gold-500 group-hover:text-white transition-colors">
                               {isCheckingOut ? 'Processing...' : 'Click here to Enter UTR / Confirm Order'}
                             </p>
                           </div>
                           
                           <button 
                             onClick={handleWhatsAppCheckout} 
                             disabled={isCheckingOut}
                             className="w-full bg-green-500 text-white py-3.5 rounded-xl font-bold shadow-md shadow-green-500/20 flex items-center justify-center gap-2 hover:bg-green-600 transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                           >
                              {isCheckingOut ? 'Processing...' : 'Checkout via WhatsApp'}
                           </button>
                           <button 
                             onClick={handleRazorpayCheckout} 
                             disabled={isCheckingOut}
                             className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                           >
                              <CreditCard className="w-5 h-5" /> {isCheckingOut ? 'Processing...' : 'Pay Online (Razorpay)'}
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
                className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-300/50 flex flex-col items-center justify-center relative hover:bg-gold-50 cursor-pointer transition-colors"
             >
                <div className="absolute top-4 right-4 bg-gold-50 text-gold-600 p-2 rounded-full">
                  <Edit className="w-4 h-4" />
                </div>
                <div className="w-24 h-24 bg-gold-100 rounded-full mb-4 flex items-center justify-center text-gold-600">
                  <User className="w-12 h-12" />
                </div>
                <h2 className="text-xl font-bold text-primary">{customerName || 'Guest User'}</h2>
                <p className="text-neutral-500">{customerPhone || 'Register Number to track orders'}</p>
             </div>

             <div className="premium-card overflow-hidden">
                <div className="p-4 border-b border-gray-50 flex items-center gap-4 hover:bg-gold-50 cursor-pointer transition-colors" onClick={() => setIsOrdersModalOpen(true)}>
                   <div className="w-10 h-10 bg-gold-500/10 text-gold-500 rounded-full flex items-center justify-center shrink-0"><Package className="w-5 h-5" /></div>
                   <div className="flex-1">
                     <h4 className="font-bold text-primary">My Orders</h4>
                     <p className="text-xs text-neutral-500">View order history</p>
                   </div>
                   <ChevronRight className="w-5 h-5 text-neutral-300" />
                </div>
                <div className="p-4 border-b border-gray-50 flex items-center gap-4 hover:bg-gold-50 cursor-pointer transition-colors" onClick={() => setIsAddressModalOpen(true)}>
                   <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center shrink-0"><MapPin className="w-5 h-5" /></div>
                   <div className="flex-1">
                     <h4 className="font-bold text-primary">Delivery Address</h4>
                     <p className="text-xs text-neutral-500">{savedAddresses.length > 0 ? `${savedAddresses.length} saved addresses` : 'Manage saved addresses'}</p>
                   </div>
                   <ChevronRight className="w-5 h-5 text-neutral-300" />
                </div>

             </div>

             <div className="premium-card overflow-hidden mt-4">
                <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gold-50/50">
                   <h3 className="font-bold text-primary">Store Contact Info</h3>
                </div>
                <a href={`https://wa.me/${settings.admin_phone?.replace(/\\D/g, '') || '918189940301'}`} target="_blank" rel="noreferrer" className="p-4 border-b border-gray-50 flex items-center gap-4 hover:bg-gold-50 transition-colors">
                   <div className="w-10 h-10 bg-gold-50 text-gold-600 rounded-full flex items-center justify-center shrink-0">
                     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                   </div>
                   <div className="flex-1">
                     <h4 className="font-bold text-primary">WhatsApp</h4>
                     <p className="text-xs text-neutral-500">+91 8189940301</p>
                   </div>
                </a>
                <a href="mailto:rappaniazzam@gmail.com" className="p-4 border-b border-gray-50 flex items-center gap-4 hover:bg-gold-50 transition-colors">
                   <div className="w-10 h-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center shrink-0">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                   </div>
                   <div className="flex-1">
                     <h4 className="font-bold text-primary">Email Us</h4>
                     <p className="text-xs text-neutral-500">rappaniazzam@gmail.com</p>
                   </div>
                </a>
                <a href="https://instagram.com/mr_rappani" target="_blank" rel="noreferrer" className="p-4 flex items-center gap-4 hover:bg-gold-50 transition-colors">
                   <div className="w-10 h-10 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center shrink-0">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01M6.5 6.5h11a3 3 0 013 3v11a3 3 0 01-3 3h-11a3 3 0 01-3-3v-11a3 3 0 013-3z"></path></svg>
                   </div>
                   <div className="flex-1">
                     <h4 className="font-bold text-primary">Instagram</h4>
                     <p className="text-xs text-neutral-500">@mr_rappani</p>
                   </div>
                </a>
             </div>
             
             
             {isProfileModalOpen && (
                <div className="fixed inset-0 z-[100] flex flex-col bg-neutral-100">
                  <div className="bg-white border-b border-neutral-300 px-4 py-3 flex items-center gap-3 shadow-sm pt-safe">
                    <button onClick={() => setIsProfileModalOpen(false)} className="p-2 -ml-2 rounded-full hover:bg-gold-50">
                      <ChevronRight className="w-6 h-6 text-primary rotate-180" />
                    </button>
                    <h2 className="font-black text-xl text-primary">Edit Profile</h2>
                  </div>
                  
                  <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-300/50 space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-primary-light mb-1">Your Name</label>
                        <input 
                          type="text" 
                          value={customerName}
                          onChange={e => setCustomerName(e.target.value)}
                          placeholder="Enter your full name"
                          className="w-full bg-gold-50 border border-neutral-300 rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-gold-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-primary-light mb-1">Register Number (Phone)</label>
                        <div className="flex gap-2">
                           <div className="bg-neutral-100 border border-neutral-300 rounded-xl px-4 py-3 text-neutral-500 font-medium flex items-center justify-center shrink-0">
                             +91
                           </div>
                           <input 
                             type="tel" 
                             maxLength={10}
                             value={customerPhone}
                             onChange={e => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                             placeholder="Enter 10-digit mobile number"
                             className="flex-1 bg-gold-50 border border-neutral-300 rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-gold-500"
                           />
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => setIsProfileModalOpen(false)}
                        disabled={customerPhone.length !== 10}
                        className="w-full premium-button rounded-xl py-3 mt-4 font-bold disabled:opacity-50 disabled:bg-gray-400 flex items-center justify-center gap-2 transition-colors"
                      >
                        <User className="w-5 h-5" /> Save Profile
                      </button>
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
               <button onClick={() => setSelectedProduct(null)} className="p-2 -ml-2 rounded-full hover:bg-gold-50">
                 <ChevronRight className="w-6 h-6 text-primary rotate-180" />
               </button>
               <h2 className="font-bold text-lg line-clamp-1">{selectedProduct.name}</h2>
               <button onClick={() => toggleFavorite(selectedProduct.id)} className="p-2 -mr-2 rounded-full hover:bg-gold-50 text-neutral-400">
                 <Heart className={`w-6 h-6 ${favorites.includes(selectedProduct.id) ? 'fill-rose-500 text-rose-500' : 'text-neutral-300'}`} />
               </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto pb-24">
               {/* Image */}
               <div className="w-full aspect-square bg-gold-50 flex items-center justify-center p-8 relative">
                 {selectedProduct.originalPrice && (
                    <div className="absolute top-4 left-4 premium-button text-xs font-bold px-2 py-1 rounded shadow-sm">
                      {Math.round(((selectedProduct.originalPrice - selectedProduct.price) / selectedProduct.originalPrice) * 100)}% OFF
                    </div>
                 )}
                 <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name} 
                    className="object-contain w-full h-full mix-blend-multiply cursor-pointer hover:scale-105 transition-transform" 
                    onClick={() => setFullScreenImage(selectedProduct.image)} 
                 />
               </div>
               
               {/* Details */}
               <div className="p-4 space-y-4">
                 <div>
                   <h1 className="text-2xl font-bold text-primary leading-tight mb-2">{selectedProduct.name}</h1>
                   <div className="flex items-end gap-2 mb-2">
                     <span className="text-3xl font-black text-primary">₹{selectedProduct.price}</span>
                     {selectedProduct.originalPrice && (
                       <>
                         <span className="text-lg text-neutral-500 line-through mb-1">₹{selectedProduct.originalPrice}</span>
                         <span className="text-sm font-bold text-gold-600 mb-1">Save ₹{selectedProduct.originalPrice - selectedProduct.price}</span>
                       </>
                     )}
                   </div>
                   {(() => {
                     const totalReviews = selectedProduct.reviews?.length || 0;
                     const avgRating = totalReviews > 0 ? (selectedProduct.reviews!.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1) : '5.0';
                     return (
                       <div className="flex items-center gap-2 mb-4">
                         <div className="premium-button text-xs font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                           {avgRating} <Star className="w-3 h-3 fill-current" />
                         </div>
                         <span className="text-xs text-neutral-500">{totalReviews} {totalReviews === 1 ? 'Rating' : 'Ratings'} & Reviews</span>
                       </div>
                     );
                   })()}
                 </div>

                 {/* Highlights */}
                 <div className="border-t border-neutral-300/50 pt-4 space-y-3">
                   <h3 className="font-bold text-primary">Highlights</h3>
                   <ul className="space-y-2 text-sm text-neutral-500 list-disc list-inside">
                     <li>Premium quality {selectedProduct.category}</li>
                     <li>Durable and long-lasting material</li>
                     <li>100% Genuine Product</li>
                     <li>2 Days Replacement Policy</li>
                     <li>Cash on Delivery available</li>
                   </ul>
                 </div>
                 </div>

                 {/* Reviews Section */}
                 <div className="border-t border-neutral-300/50 pt-4 space-y-4 pb-20">
                   <h3 className="font-bold text-primary">Customer Reviews</h3>
                   
                   {/* Review List */}
                   {(!selectedProduct.reviews || selectedProduct.reviews.length === 0) ? (
                     <p className="text-sm text-neutral-500 italic">No reviews yet. Be the first to review!</p>
                   ) : (
                     <div className="space-y-4">
                       {selectedProduct.reviews.slice().reverse().map((r, idx) => (
                         <div key={idx} className="bg-gold-50 p-3 rounded-lg border border-neutral-300/50">
                           <div className="flex justify-between items-start mb-1">
                             <span className="font-bold text-sm text-primary">{r.customerName}</span>
                             <div className="flex gap-0.5">
                               {[1,2,3,4,5].map(star => (
                                 <Star key={star} className={`w-3 h-3 ${star <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}`} />
                               ))}
                             </div>
                           </div>
                           <p className="text-xs text-neutral-500 mb-1">{r.review}</p>
                           <span className="text-[10px] text-neutral-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                         </div>
                       ))}
                     </div>
                   )}

                   {/* Write Review Form */}
                   <form onSubmit={handleSubmitReview} className="bg-white border border-neutral-300 p-3 rounded-xl shadow-sm mt-4">
                     <h4 className="font-bold text-sm text-primary mb-3">Write a Review</h4>
                     <div className="flex gap-1 mb-3">
                       {[1,2,3,4,5].map(star => (
                         <button type="button" key={star} onClick={() => setReviewRating(star)} className="focus:outline-none p-1">
                           <Star className={`w-6 h-6 ${star <= reviewRating ? 'fill-amber-400 text-amber-400 drop-shadow-sm' : 'text-neutral-300'}`} />
                         </button>
                       ))}
                     </div>
                     <input type="text" placeholder="Your Name" required value={reviewName} onChange={e => setReviewName(e.target.value)} className="w-full bg-gold-50 border border-neutral-300 text-sm p-2 rounded-lg mb-2 focus:ring-1 focus:ring-amber-500 outline-none" />
                     <textarea placeholder="Write your experience..." required value={reviewText} onChange={e => setReviewText(e.target.value)} className="w-full bg-gold-50 border border-neutral-300 text-sm p-2 rounded-lg mb-3 h-20 resize-none focus:ring-1 focus:ring-amber-500 outline-none" />
                     <button type="submit" disabled={isSubmittingReview} className="w-full bg-amber-500 text-white font-bold py-2 rounded-lg disabled:opacity-50">
                       {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                     </button>
                   </form>
                  </div>
                </div>
             
             {/* Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 max-w-md md:max-w-6xl mx-auto bg-white border-t border-neutral-300 p-3 pb-safe flex gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
               <button 
                 onClick={() => {
                   addToCart(selectedProduct);
                   setSelectedProduct(null);
                   setCurrentTab('cart');
                 }}
                 className="flex-1 bg-white border-2 border-neutral-300 text-primary py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2"
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

      {/* Full Screen Image Viewer Modal */}
      <AnimatePresence>
        {fullScreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setFullScreenImage(null)}
          >
            <button 
              onClick={(e) => { e.stopPropagation(); setFullScreenImage(null); }} 
              className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              src={fullScreenImage} 
              alt="Fullscreen Product" 
              className="w-full max-h-[85vh] object-contain cursor-zoom-out"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating WhatsApp Widget */}
      <a href={`https://wa.me/${settings.admin_phone?.replace(/\\D/g, '') || '918189940301'}`} target="_blank" rel="noreferrer" className="fixed bottom-24 right-4 z-50 premium-button p-3.5 rounded-full shadow-lg hover:bg-primary transition-colors flex items-center justify-center animate-bounce">
        <MessageCircle className="w-6 h-6 fill-white" />
      </a>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-md md:max-w-6xl bg-white border-t border-neutral-300 pb-safe pt-2 px-6 flex justify-between items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] h-16">
         <button onClick={() => setCurrentTab('home')} className={`flex flex-col items-center gap-1 w-16 ${currentTab === 'home' ? 'text-gold-500' : 'text-neutral-400'}`}>
           <Home className={`w-6 h-6 ${currentTab === 'home' ? 'fill-violet-100' : ''}`} />
           <span className="text-[10px] font-bold">Home</span>
         </button>
         <button onClick={() => setCurrentTab('products')} className={`flex flex-col items-center gap-1 w-16 ${currentTab === 'products' ? 'text-gold-500' : 'text-neutral-400'}`}>
           <LayoutGrid className={`w-6 h-6 ${currentTab === 'products' ? 'fill-violet-100' : ''}`} />
           <span className="text-[10px] font-bold">Categories</span>
         </button>
         <button onClick={() => setCurrentTab('cart')} className={`relative flex flex-col items-center gap-1 w-16 ${currentTab === 'cart' ? 'text-gold-500' : 'text-neutral-400'}`}>
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
         <button onClick={() => setCurrentTab('favorites')} className={`flex flex-col items-center gap-1 w-16 ${currentTab === 'favorites' ? 'text-gold-500' : 'text-neutral-400'}`}>
           <Heart className={`w-6 h-6 ${currentTab === 'favorites' ? 'fill-violet-100' : ''}`} />
           <span className="text-[10px] font-bold">Favorites</span>
         </button>
         <button onClick={() => setCurrentTab('account')} className={`flex flex-col items-center gap-1 w-16 ${currentTab === 'account' ? 'text-gold-500' : 'text-neutral-400'}`}>
           <User className={`w-6 h-6 ${currentTab === 'account' ? 'fill-violet-100' : ''}`} />
           <span className="text-[10px] font-bold">Account</span>
         </button>
      </nav>
    
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-neutral-100">
          <div className="bg-white border-b border-neutral-300 px-4 py-3 flex items-center gap-3 shadow-sm pt-safe">
            <button onClick={() => setIsAddressModalOpen(false)} className="p-2 -ml-2 rounded-full hover:bg-gold-50">
              <ChevronRight className="w-6 h-6 text-primary rotate-180" />
            </button>
            <h2 className="font-black text-xl text-primary">Saved Addresses</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {savedAddresses.length === 0 ? (
              <div className="text-center py-12 text-neutral-400">
                <MapPin className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No saved addresses yet</p>
              </div>
            ) : (
              savedAddresses.map((addr, idx) => (
                <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-300/50 flex gap-3 relative">
                  <div className="w-10 h-10 bg-gold-50 text-gold-600 rounded-full flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex-1 pr-8">
                    <h4 className="font-bold text-primary mb-1">Address {idx + 1}</h4>
                    <p className="text-sm text-neutral-500 whitespace-pre-wrap">{addr}</p>
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
            
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-300/50 mt-6">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-primary">Add New Address</h4>
                <button 
                  onClick={fetchCurrentLocation}
                  disabled={isFetchingLocation}
                  className="flex items-center gap-1 text-xs font-bold text-gold-500 bg-gold-500/10 px-3 py-1.5 rounded-lg disabled:opacity-50"
                >
                  <MapPin className="w-3 h-3" />
                  {isFetchingLocation ? "Fetching..." : "Use Current Location"}
                </button>
              </div>
              <textarea 
                className="w-full bg-gold-50 border-0 rounded-xl px-4 py-3 text-sm text-primary placeholder-gray-400 focus:ring-2 focus:ring-gold-500 h-24 resize-none transition-shadow mb-3" 
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
                className="w-full premium-button rounded-xl py-3 font-bold disabled:opacity-50 disabled:bg-gray-300 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" /> Save Address
              </button>
            </div>
          </div>
        </div>
      )}

      {isOrdersModalOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-neutral-100">
          <div className="bg-white border-b border-neutral-300 px-4 py-3 flex items-center gap-3 shadow-sm pt-safe">
            <button onClick={() => setIsOrdersModalOpen(false)} className="p-2 -ml-2 rounded-full hover:bg-gold-50">
              <ChevronRight className="w-6 h-6 text-primary rotate-180" />
            </button>
            <h2 className="font-black text-xl text-primary">My Orders</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!customerPhone || customerPhone.length < 10 ? (
              <div className="text-center py-12 text-neutral-400">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Please add your 10-digit phone number in Account to view orders.</p>
              </div>
            ) : customerOrders.length === 0 ? (
              <div className="text-center py-12 text-neutral-400">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No orders found for this number.</p>
              </div>
            ) : (
              customerOrders.map((order, idx) => (
                <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-300/50">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                       <span className="text-xs font-bold text-neutral-500">Order Placed: {new Date(order.createdAt).toLocaleDateString()}</span>
                       <div className="font-black text-lg text-primary mt-0.5">₹{order.totalAmount}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${order.status === 'Completed' ? 'bg-gold-100 text-gold-900' : 'bg-orange-100 text-orange-700'}`}>
                        {order.status}
                      </span>
                      {order.paymentMethod === 'Razorpay' && order.paymentStatus === 'Pending' && (
                        <button 
                          onClick={() => handleRetryPayment(order)}
                          className="text-[10px] font-bold px-3 py-1 bg-blue-600 text-white rounded-full shadow-sm shadow-blue-500/20 hover:bg-blue-700 transition-colors"
                        >
                          Retry Payment
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-neutral-500 mb-5 whitespace-pre-wrap leading-relaxed">{order.itemsSummary}</div>
                  
                  {/* Visual Timeline */}
                  <div className="relative mt-2 mb-2 px-1">
                     <div className="absolute top-[5px] left-1 right-1 h-1 bg-neutral-100 -translate-y-1/2 rounded-full"></div>
                     <div className="absolute top-[5px] left-1 h-1 bg-primary -translate-y-1/2 rounded-full transition-all duration-500" style={{ width: order.status === 'Pending' ? '25%' : order.status === 'Processing' ? '50%' : order.status === 'Shipped' ? '75%' : order.status === 'Completed' ? '100%' : '0%' }}></div>
                     <div className="relative flex justify-between z-10">
                        <div className={`w-2.5 h-2.5 rounded-full border-2 bg-white ${order.status !== 'Cancelled' ? 'border-gold-500' : 'border-neutral-300'}`}></div>
                        <div className={`w-2.5 h-2.5 rounded-full border-2 bg-white ${['Processing', 'Shipped', 'Completed'].includes(order.status) ? 'border-gold-500' : 'border-neutral-300'}`}></div>
                        <div className={`w-2.5 h-2.5 rounded-full border-2 bg-white ${['Shipped', 'Completed'].includes(order.status) ? 'border-gold-500' : 'border-neutral-300'}`}></div>
                        <div className={`w-2.5 h-2.5 rounded-full border-2 bg-white ${order.status === 'Completed' ? 'border-gold-500' : 'border-neutral-300'}`}></div>
                     </div>
                     <div className="flex justify-between text-[9px] text-neutral-500 font-bold mt-2 px-1">
                        <span className={order.status !== 'Cancelled' ? 'text-gold-500' : ''}>Placed</span>
                        <span className={['Processing', 'Shipped', 'Completed'].includes(order.status) ? 'text-gold-500' : ''}>Packed</span>
                        <span className={['Shipped', 'Completed'].includes(order.status) ? 'text-gold-500' : ''}>Shipped</span>
                        <span className={order.status === 'Completed' ? 'text-gold-500' : ''}>Delivered</span>
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
          onConfirm={(address, lat, lng) => {
            setDeliveryAddress(address);
            if (lat && lng) {
              setCheckoutAddressFields(prev => ({...prev, mapsLink: `https://maps.google.com/?q=${lat},${lng}`}));
            }
            setShowLocationMap(null);
          }}
        />
      )}
      {showLocationMap === 'account' && (
        <LocationMap 
          onCancel={() => setShowLocationMap(null)}
          onConfirm={(address, lat, lng) => {
            let finalAddress = address;
            if (lat && lng) {
              finalAddress += `\nMaps Link: https://maps.google.com/?q=${lat},${lng}`;
            }
            setNewSavedAddress(finalAddress);
            setShowLocationMap(null);
          }}
        />
      )}

      {showGPayConfirm && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-primary/60 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm space-y-4">
               <h3 className="font-bold text-lg text-primary">Confirm Payment</h3>
               <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 mb-2">
                 <p className="text-sm text-gray-500 mb-2 font-medium">Scan to Pay via UPI</p>
                 <div className="flex justify-center mb-4 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                    <QRCode 
                      value={`upi://pay?pa=mohammedazzam200512@okaxis&pn=Rappani Store&am=${finalTotal}&cu=INR`} 
                      size={150}
                      level="H"
                    />
                 </div>
                 <p className="text-sm text-gray-500 mb-1 font-medium">Or copy UPI ID</p>
                 <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-gray-100">
                    <span className="font-bold text-gray-900">mohammedazzam200512@okaxis</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText('mohammedazzam200512@okaxis');
                        toast.success("Copied!");
                      }}
                      className="text-gold-600 font-bold text-sm bg-gold-50 px-3 py-1 rounded-lg"
                    >
                      Copy
                    </button>
                 </div>
                 {/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && (
                    <a 
                      href={`upi://pay?pa=mohammedazzam200512@okaxis&pn=Rappani%20Store&am=${finalTotal}&cu=INR`}
                      className="block w-full text-center mt-3 bg-[#1A73E8] text-white py-2 rounded-lg font-bold shadow-sm"
                    >
                      Open UPI App
                    </a>
                 )}
               </div>
               <p className="text-sm text-neutral-500">After payment, enter the 12-digit UTR or Reference Number below to confirm your order.</p>
               <input 
                   type="text" 
                   placeholder="Enter UTR Number" 
                   value={utrNumber}
                   onChange={e => setUtrNumber(e.target.value)}
                   className="w-full bg-gold-50 border border-neutral-300 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-gold-500"
               />
               <div className="flex gap-3 pt-2">
                   <button 
                     onClick={() => setShowGPayConfirm(false)} 
                     disabled={isCheckingOut}
                     className="flex-1 py-3 font-bold text-neutral-500 bg-neutral-100 rounded-xl disabled:opacity-50"
                   >
                     Cancel
                   </button>
                   <button 
                     onClick={handleGPayConfirm} 
                     disabled={isCheckingOut}
                     className="flex-1 py-3 font-bold text-white bg-primary rounded-xl shadow-md disabled:opacity-50"
                   >
                     {isCheckingOut ? 'Confirming...' : 'Confirm'}
                   </button>
                </div>
            </div>
         </div>
      )}

      {/* Order Success Modal */}
      {orderSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-scale-up">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Order Confirmed!</h2>
            <p className="text-gray-500 text-sm mb-6">
              Thank you for shopping with Rappani Store! Your order has been successfully placed.
            </p>
            <button 
              onClick={() => {
                setOrderSuccessModal(null);
                setCurrentTab('account'); // Navigate to account tab to see the order
              }}
              className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors"
            >
              View My Orders
            </button>
          </div>
        </div>
      )}

</div>
  );
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Stationary': return 'bg-gold-500/20 text-gold-500';
    case 'Fancy': return 'bg-purple-100 text-purple-700';
    case 'Toys': return 'bg-yellow-100 text-yellow-700';
    case 'Sports Items': return 'bg-orange-100 text-orange-700';
    case 'Snacks': return 'bg-gold-100 text-gold-900';
    default: return 'bg-neutral-100 text-primary-light';
  }
};



export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [apiCategories, setApiCategories] = useState<any[]>([]);
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
        
        fetch(`${API_BASE}/orders`).then(res => res.json()).then(data => setOrders(Array.isArray(data) ? data : [])).catch(console.error);
        fetchCategoriesApi().then(data => setApiCategories(data)).catch(console.error);
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
        <Route path="/" element={<VisitorPanel products={products} settings={settings} setProducts={setProducts} hasMore={hasMore} isLoadingMore={isLoadingMore} loadMoreProducts={loadMoreProducts} apiCategories={apiCategories} setOrders={setOrders} />} />
        <Route path="/admin/*" element={<AdminApp orders={orders} products={products} setProducts={setProducts} apiCategories={apiCategories} setApiCategories={setApiCategories} settings={settings} setSettings={setSettings} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
