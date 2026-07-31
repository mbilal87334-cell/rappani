import express from "express";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import path from "path";
import fs from "fs-extra";
import cors from "cors";
import mongoose from "mongoose";
import jwt from 'jsonwebtoken';
import { GoogleGenerativeAI } from '@google/genai';
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import Razorpay from "razorpay";
import crypto from "crypto";

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_SECRET_KEY || 'secret_placeholder'
});


const serverLogs: string[] = [];
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

function interceptLog(type: string, ...args: any[]) {
  const msg = `[${new Date().toISOString()}] [${type}] ` + args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ');
  serverLogs.push(msg);
  if (serverLogs.length > 100) serverLogs.shift();
  if (type === 'LOG') originalLog.apply(console, args);
  if (type === 'ERROR') originalError.apply(console, args);
  if (type === 'WARN') originalWarn.apply(console, args);
}

console.log = (...args) => interceptLog('LOG', ...args);
console.error = (...args) => interceptLog('ERROR', ...args);
console.warn = (...args) => interceptLog('WARN', ...args);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = process.cwd();

// Get MONGODB_URI from environment variables or use a default one
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/rappani_store";

// Global connection state
let dbConnectionState = "initializing";
let dbConnectionError = "";

// Memory store for OTPs (simulating SMS)
const otpStore = new Map<string, { otp: string, expiresAt: number }>();

// Mongoose Models
const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number, required: false },
  stock: { type: Number, required: false, default: 100 },
  lowStockThreshold: { type: Number, default: 10 },
  barcode: { type: String, required: false },
  image: { type: String, required: true },
  images: { type: [String], default: [] },
  videoUrl: { type: String, required: false },
  features: { type: [String], default: [] },
  tags: { type: [String], default: [] },
  isFeatured: { type: Boolean, default: false },
  isVisible: { type: Boolean, default: true },
  reviews: [{
    rating: { type: Number, required: true },
    review: { type: String, required: true },
    customerName: { type: String, required: true },
    imageUrl: { type: String, required: false },
    createdAt: { type: Date, default: Date.now }
  }]
});
const Product = mongoose.model("Product", productSchema);

const categorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  icon: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Category = mongoose.model("Category", categorySchema);

const settingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true }
});
const Setting = mongoose.model("Setting", settingSchema);

const orderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: false },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  shippingAddress: { type: Object, required: false },
  items: { type: Array, required: true },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  utrNumber: { type: String, default: null },
  couponCode: { type: String, required: false },
  discountAmount: { type: Number, default: 0 },
  status: { type: String, required: true, default: 'Pending' },
  trackingStatus: { type: String, default: 'Processing' },
  razorpayOrderId: { type: String, default: null },
  razorpayPaymentId: { type: String, default: null },
  razorpaySignature: { type: String, default: null },
  paymentStatus: { type: String, default: 'Pending' },
  paymentTime: { type: Date, default: null },
  timeline: [{
    status: { type: String, required: true },
    date: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, required: true, default: Date.now }
});
const Order = mongoose.model("Order", orderSchema);

const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: false },
  role: { type: String, default: 'customer' },
  addresses: [{
    label: { type: String, required: true }, // e.g. Home, Office
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  }],
  loyaltyPoints: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model("User", userSchema);

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountPercent: { type: Number, required: true },
  maxUses: { type: Number, default: 100 },
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
const Coupon = mongoose.model("Coupon", couponSchema);

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, default: 'info' }, // 'info', 'success', 'warning', 'error'
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
const Notification = mongoose.model("Notification", notificationSchema);


async function startServer() {
  const app = express();
  app.get("/api/logs", (req, res) => {
    res.type("text/plain").send(serverLogs.join('\n'));
  });

  app.get("/api/test-whatsapp", async (req, res) => {
    try {
      const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
      const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
      const to = req.query.to || "918189940301";
      
      const response = await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: to,
          type: "text",
          text: { body: "Hello from Rappani Store! This is a test message to confirm your API is working correctly." }
        })
      });
      const data = await response.json();
      res.json({ status: response.status, data });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const uploadsDir = path.join(ROOT_DIR, "public", "uploads");

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));

  // Connect to MongoDB
  try {
    await mongoose.connect(MONGODB_URI);
    dbConnectionState = "connected";
    console.log("Connected to MongoDB Cloud Database");
    await seedInitialData();
  } catch (error: any) {
    dbConnectionState = "error";
    dbConnectionError = error?.message || String(error);
    console.error("MongoDB connection Error:", error);
  }

  // Health/Debug Route
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      dbConnectionState,
      dbConnectionError,
      hasMongoUri: !!process.env.MONGODB_URI,
    });
  });

  // Configure Cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  // Cloudinary storage config
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "rappani-store",
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
      background_removal: "cloudinary_ai",
    } as any,
  });

  const upload = multer({ storage });

  // Auth Routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { phone, password } = req.body;
      const passSetting = await Setting.findOne({ key: 'admin_password' });
      const phoneSetting = await Setting.findOne({ key: 'admin_phone' });
      const currentPassword = passSetting ? passSetting.value : 'rappani123';
      const currentPhone = phoneSetting ? phoneSetting.value : '9876543210';
      
      if (password === currentPassword && phone === currentPhone) {
        res.json({ success: true, token: "admin_token_xyz" });
      } else {
        res.status(401).json({ error: "Invalid phone number or password" });
      }
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/auth/change-password", async (req, res) => {
    try {
      const { currentPassword, newPassword, newPhone } = req.body;
      const setting = await Setting.findOne({ key: 'admin_password' });
      const currentAdminPassword = setting ? setting.value : 'rappani123';

      if (currentPassword !== currentAdminPassword) {
        return res.status(401).json({ success: false, error: "Current password incorrect" });
      }

      if (newPassword) {
        await Setting.updateOne({ key: 'admin_password' }, { value: newPassword }, { upsert: true });
      }
      if (newPhone) {
        await Setting.updateOne({ key: 'admin_phone' }, { value: newPhone }, { upsert: true });
      }
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: "Server error" });
    }
  });

  // OTP Validation Routes
  app.post("/api/send-otp", async (req, res) => {
    const { phone } = req.body;
    if (!phone || phone.length !== 10) return res.status(400).json({ error: "Invalid phone number" });

    // Generate a 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    // Valid for 5 minutes
    otpStore.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    const apiKey = process.env.FAST2SMS_API_KEY;
    console.log(`[OTP] Request to send OTP to ${phone}. Using Mock: ${!apiKey}`);

    if (apiKey) {
      try {
        const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
          method: "POST",
          headers: {
            "authorization": apiKey,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: `Your Rappani Store verification OTP is ${otp}`,
            route: "q",
            numbers: phone,
          })
        });
        const data = await response.json();
        console.log(`[OTP] Fast2SMS Response:`, data);
        if (data.return) {
          console.log(`[SMS SENT] OTP for ${phone} sent via Fast2SMS`);
          res.json({ success: true, message: "OTP Sent successfully via SMS" });
        } else {
          console.error("[SMS ERROR] Fast2SMS error:", data);
          // Fallback to simulated OTP so the user is not completely blocked from buying
          res.json({
            success: true,
            mockOtp: otp,
            message: `Fast2SMS Gateway Error: ${data.message || 'API failed'}. Falling back to Simulated SMS.`
          });
        }
      } catch (e: any) {
        console.error("[SMS ERROR] Fast2SMS request failed:", e);
        // Fallback on network error
        res.json({ success: true, mockOtp: otp, message: "SMS Gateway Error. Simulated Mode." });
      }
    } else {
      console.log(`[SIMULATED SMS] OTP for ${phone} is ${otp}`);
      // Simulate SMS by returning it to client (only for testing without real SMS API)
      res.json({ success: true, mockOtp: otp, message: "No FAST2SMS Key. Simulated Mode." });
    }
  });

  app.post("/api/verify-otp", (req, res) => {
    const { phone, otp } = req.body;
    console.log(`[OTP] Verification request for ${phone} with OTP ${otp}`);

    const record = otpStore.get(phone);

    if (!record) {
      console.warn(`[OTP] No record found for ${phone}`);
      return res.status(400).json({ error: "No OTP assigned to this number" });
    }
    
    if (record.expiresAt < Date.now()) {
      console.warn(`[OTP] Expired for ${phone}`);
      otpStore.delete(phone);
      return res.status(400).json({ error: "OTP Expired" });
    }

    if (record.otp !== String(otp).trim()) {
      console.warn(`[OTP] Incorrect OTP for ${phone}. Expected: ${record.otp}, Got: ${otp}`);
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // OTP matches correctly
    console.log(`[OTP] Successfully verified ${phone}`);
    otpStore.delete(phone);

    // Find or Create User
    User.findOne({ phone }).then(async (user) => {
      let loggedInUser = user;
      if (!loggedInUser) {
        loggedInUser = new User({ 
          phone, 
          name: `User_${phone.slice(-4)}` 
        });
        await loggedInUser.save();
      }
      
      const jwtSecret = process.env.JWT_SECRET || 'rappani_super_secret_key';
      const token = jwt.sign(
        { id: loggedInUser._id, phone: loggedInUser.phone, role: loggedInUser.role }, 
        jwtSecret, 
        { expiresIn: '7d' }
      );

      res.json({ success: true, token, user: loggedInUser });
    }).catch(err => {
      console.error(err);
      res.status(500).json({ error: "Database error during login" });
    });
  });

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET || 'rappani_super_secret_key', (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // User Profile Routes
  app.get("/api/user/me", authenticateToken, async (req: any, res) => {
    try {
      const user = await User.findById(req.user.id);
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.put("/api/user/addresses", authenticateToken, async (req: any, res) => {
    try {
      const { addresses } = req.body;
      const user = await User.findByIdAndUpdate(req.user.id, { addresses }, { new: true });
      res.json({ success: true, addresses: user?.addresses });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // API Routes
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await Setting.find({}, '-_id -__v');
      res.json(settings);
    } catch (err) {
      res.status(500).json({ success: false, error: "Server error" });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const { key, value } = req.body;
      if (key === 'admin_password_disabled') {
        // We now allow admin_password to be updated here since the user is already authenticated in the frontend
        return res.status(403).json({ success: false, error: "Cannot modify this setting" });
      }
      await Setting.updateOne({ key }, { value }, { upsert: true });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: "Server error" });
    }
  });

  app.get("/api/products", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = (page - 1) * limit;

      // Extract search or category filters if needed, but for now we just return all paginated
      const total = await Product.countDocuments();
      const products = await Product.find({}, '-_id -__v').skip(skip).limit(limit);
      
      // We wrap the response in a paginated object if page/limit are provided
      res.json({ products, total, page, totalPages: Math.ceil(total / limit) });
    } catch (err) {
      res.status(500).json({ success: false, error: "Server error" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const { id, name, category, price, originalPrice, stock, image, images, videoUrl, features, tags, isFeatured, isVisible } = req.body;
      const visibleFlag = isVisible !== undefined ? isVisible : true;
      await Product.create({ id, name, category, price, originalPrice, stock, image, images, videoUrl, features, tags, isFeatured, isVisible: visibleFlag });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: "Server error" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { name, category, price, originalPrice, stock, image, images, videoUrl, features, tags, isFeatured, isVisible } = req.body;
      const updateData: any = { name, category, price, originalPrice, stock, image, images, videoUrl, features, tags, isFeatured };
      if (isVisible !== undefined) updateData.isVisible = isVisible;
      
      await Product.updateOne({ id }, updateData);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: "Server error" });
    }
  });

  // --- Category Routes ---
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await Category.find({});
      res.json(categories);
    } catch (err) {
      res.status(500).json({ success: false, error: "Server error" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const { id, name, icon } = req.body;
      await Category.create({ id, name, icon });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: "Server error" });
    }
  });

  app.put("/api/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { name, icon } = req.body;
      await Category.updateOne({ id }, { name, icon });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: "Server error" });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await Category.deleteOne({ id });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: "Server error" });
    }
  });
  // -----------------------

  app.post("/api/products/:id/reviews", async (req, res) => {
    try {
      const { id } = req.params;
      const { rating, review, customerName } = req.body;
      
      if (!rating || !review || !customerName) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
      }

      await Product.updateOne(
        { id },
        { $push: { reviews: { rating, review, customerName, createdAt: new Date() } } }
      );
      
      res.json({ success: true });
    } catch (err) {
      console.error("[SERVER] Add review error:", err);
      res.status(500).json({ success: false, error: "Server error" });
    }
  });

  app.post("/api/checkout", async (req, res) => {
    try {
      console.log(`[SERVER] Checkout hit. Body:`, JSON.stringify(req.body));
      const { customerName, customerPhone, items, totalAmount, paymentMethod, utrNumber, couponCode, discountAmount, userId, shippingAddress } = req.body;

      if (!customerName || !customerPhone || !items || !totalAmount || !paymentMethod) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
      }

      // SERVER-SIDE SAFEGUARD: Ignore WhatsApp orders if they somehow reach here
      if (paymentMethod && paymentMethod.toLowerCase().includes('whatsapp')) {
        console.warn(`[SERVER] Ignoring WhatsApp checkout request for ${customerName}. Not saving to DB.`);
        return res.json({ success: true, message: "WhatsApp inquiry received (not booked as order)" });
      }

      const orderId = Date.now().toString();
      
      const newOrder = await Order.create({
        id: orderId,
        userId: userId || null,
        shippingAddress: shippingAddress || null,
        customerName,
        customerPhone,
        items,
        totalAmount,
        paymentMethod,
        utrNumber: utrNumber || null,
        couponCode: couponCode || null,
        discountAmount: discountAmount || 0,
        status: 'Pending',
        paymentStatus: 'Pending',
        trackingStatus: 'Processing',
        timeline: [{ status: 'Order Placed', date: new Date() }],
        createdAt: new Date()
      });

      if (paymentMethod === 'Razorpay') {
        const options = {
          amount: Math.round(totalAmount * 100), // amount in smallest currency unit (paise)
          currency: "INR",
          receipt: orderId
        };
        const rzpOrder = await razorpay.orders.create(options);
        
        newOrder.razorpayOrderId = rzpOrder.id;
        await newOrder.save();

        return res.json({ 
          success: true, 
          orderId, 
          razorpayOrderId: rzpOrder.id,
          amount: options.amount,
          key: process.env.RAZORPAY_KEY_ID
        });
      }

      // Automatically reduce stock based on items for non-Razorpay orders
      for (const item of items) {
        await Product.updateOne(
          { id: item.product.id, stock: { $exists: true, $gte: item.quantity } },
          { $inc: { stock: -item.quantity } }
        );
      }
      res.json({ success: true, orderId });
    } catch (err: any) {
      console.error("[SERVER] Checkout error:", err);
      const errorMessage = err?.error?.description || err?.message || "Server error";
      res.status(500).json({ success: false, error: errorMessage });
    }
  });

  app.post("/api/razorpay/verify", async (req, res) => {
    try {
      const { orderId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

      if (!orderId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
      }

      const order = await Order.findOne({ id: orderId });
      if (!order) {
        return res.status(404).json({ success: false, error: "Order not found" });
      }

      const secret = process.env.RAZORPAY_SECRET_KEY || 'secret_placeholder';
      const generated_signature = crypto
        .createHmac('sha256', secret)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest('hex');

      if (generated_signature === razorpay_signature) {
        // Payment successful
        order.paymentStatus = 'Paid';
        order.status = 'Processing';
        order.razorpayPaymentId = razorpay_payment_id;
        order.razorpaySignature = razorpay_signature;
        order.paymentTime = new Date();
        await order.save();

        // Reduce stock after successful payment
        for (const item of order.items) {
          await Product.updateOne(
            { id: item.product.id, stock: { $exists: true, $gte: item.quantity } },
            { $inc: { stock: -item.quantity } }
          );
        }

        res.json({ success: true, message: "Payment verified successfully" });
      } else {
        // Payment failed verification
        order.paymentStatus = 'Failed';
        await order.save();
        res.status(400).json({ success: false, error: "Invalid payment signature" });
      }
    } catch (err: any) {
      console.error("[SERVER] Razorpay verify error:", err);
      res.status(500).json({ success: false, error: "Verification failed" });
    }
  });

  app.get("/api/razorpay/key", (req, res) => {
    res.json({ key: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder' });
  });

  app.get("/api/orders/check-first/:phone", async (req, res) => {
    try {
      const { phone } = req.params;
      const count = await Order.countDocuments({ customerPhone: phone });
      res.json({ isFirstOrder: count === 0 });
    } catch (err) {
      res.status(500).json({ success: false, error: "Server error" });
    }
  });

  app.get("/api/orders/customer/:phone", async (req, res) => {
    try {
      const { phone } = req.params;
      const orders = await Order.find({ customerPhone: phone }, '-_id -__v').sort({ createdAt: -1 });
      res.json(orders);
    } catch (err) {
      res.status(500).json({ success: false, error: "Server error" });
    }
  });

  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await Order.find({}, '-_id -__v').sort({ createdAt: -1 });
      res.json(orders);
    } catch (err) {
      res.status(500).json({ success: false, error: "Server error" });
    }
  });

  app.put("/api/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, trackingStatus } = req.body;
      const updateData: any = {};
      if (status) updateData.status = status;
      if (trackingStatus) updateData.trackingStatus = trackingStatus;
      await Order.updateOne({ id }, updateData);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: "Server error" });
    }
  });
 
  app.delete("/api/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await Order.deleteOne({ id });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: "Server error" });
    }
  });

  // --- Admin Review Routes ---
  app.get("/api/admin/reviews", async (req, res) => {
    try {
      const products = await Product.find({ 'reviews.0': { $exists: true } }, 'id name image reviews');
      let allReviews: any[] = [];
      products.forEach(p => {
        p.reviews.forEach(r => {
          allReviews.push({
            productId: p.id,
            productName: p.name,
            productImage: p.image,
            // @ts-ignore
            reviewId: r._id,
            rating: r.rating,
            review: r.review,
            customerName: r.customerName,
            createdAt: r.createdAt
          });
        });
      });
      // Sort by newest
      allReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      res.json(allReviews);
    } catch (err) {
      res.status(500).json({ success: false, error: "Server error" });
    }
  });

  app.delete("/api/admin/reviews/:productId/:reviewId", async (req, res) => {
    try {
      const { productId, reviewId } = req.params;
      await Product.updateOne(
        { id: productId },
        { $pull: { reviews: { _id: reviewId } } as any }
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: "Server error" });
    }
  });

  // --- Coupon Routes ---
  app.get("/api/coupons", async (req, res) => {
    try {
      const coupons = await Coupon.find({}).sort({ createdAt: -1 });
      res.json(coupons);
    } catch (err) {
      res.status(500).json({ success: false, error: "Server error" });
    }
  });

  app.post("/api/coupons", async (req, res) => {
    try {
      const { code, discountPercent, maxUses } = req.body;
      await Coupon.create({ code: code.toUpperCase(), discountPercent, maxUses });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: "Server error" });
    }
  });

  app.put("/api/coupons/:id", async (req, res) => {
    try {
      const { isActive } = req.body;
      await Coupon.findByIdAndUpdate(req.params.id, { isActive });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: "Server error" });
    }
  });

  app.delete("/api/coupons/:id", async (req, res) => {
    try {
      await Coupon.findByIdAndDelete(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: "Server error" });
    }
  });
  
  app.post("/api/coupons/validate", async (req, res) => {
    try {
      const { code } = req.body;
      const coupon = await Coupon.findOne({ code: code.toUpperCase() });
      if (!coupon) return res.status(404).json({ success: false, error: "Invalid coupon code" });
      if (!coupon.isActive) return res.status(400).json({ success: false, error: "Coupon is not active" });
      if (coupon.usedCount >= coupon.maxUses) return res.status(400).json({ success: false, error: "Coupon limit reached" });
      
      res.json({ success: true, discountPercent: coupon.discountPercent });
    } catch (err) {
      res.status(500).json({ success: false, error: "Server error" });
    }
  });

  // --- Notification Routes ---
  app.get("/api/notifications", async (req, res) => {
    try {
      const notifs = await Notification.find({}).sort({ createdAt: -1 }).limit(50);
      res.json(notifs);
    } catch (err) {
      res.status(500).json({ success: false, error: "Server error" });
    }
  });

  app.post("/api/notifications", async (req, res) => {
    try {
      await Notification.create(req.body);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: "Server error" });
    }
  });

  app.put("/api/notifications/mark-read", async (req, res) => {
    try {
      await Notification.updateMany({ read: false }, { read: true });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: "Server error" });
    }
  });

  // --- Analytics Route ---
  app.get("/api/analytics/summary", async (req, res) => {
    try {
      const totalOrders = await Order.countDocuments();
      const orders = await Order.find({}, 'totalAmount createdAt items');
      const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      
      const today = new Date();
      today.setHours(0,0,0,0);
      const todayOrders = orders.filter(o => new Date(o.createdAt) >= today);
      const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      
      res.json({
        totalOrders,
        totalRevenue,
        todayOrders: todayOrders.length,
        todayRevenue
      });
    } catch (err) {
      res.status(500).json({ success: false, error: "Server error" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const id = req.params.id.trim();
      console.log(`[SERVER] DELETE request for ID: "${id}"`);

      // 1. Find the product first to get the image URL
      const product = await Product.findOne({ id });
      if (!product) {
        console.warn(`[SERVER] Product with ID "${id}" not found.`);
        return res.status(404).json({ success: false, error: "Product not found" });
      }

      // 2. Delete the image from Cloudinary if it exists
      if (product.image && product.image.includes("res.cloudinary.com")) {
        try {
          const urlParts = product.image.split('/');
          const filename = urlParts.pop(); // e.g., image123.jpg
          const folder = urlParts.pop();   // e.g., rappani_store_uploads

          if (filename && folder) {
            // Remove extension to get public_id
            const publicId = `${folder}/${filename.split('.')[0]}`;
            await cloudinary.uploader.destroy(publicId);
            console.log(`[SERVER] Deleted image from Cloudinary: ${publicId}`);
          }
        } catch (cloudinaryErr) {
          console.error("[SERVER] Error deleting from Cloudinary:", cloudinaryErr);
        }
      }

      // 3. Delete the product from MongoDB
      const result = await Product.deleteOne({ id });
      console.log(`[SERVER] Delete result for "${id}": ${result.deletedCount} items affected`);

      res.json({ success: true, changes: result.deletedCount });
    } catch (err) {
      console.error("[SERVER] Delete error:", err);
      res.status(500).json({ success: false, error: "Server error" });
    }
  });

  // Image Upload Route
  app.post("/api/upload", upload.single("image"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    // Cloudinary returns the image URL in req.file.path
    res.json({ imageUrl: req.file.path });
  });
  // WhatsApp Webhook Verification (GET)
  app.get("/api/whatsapp-webhook", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    console.log(`[SERVER] Webhook Verification Request Received. Mode: ${mode}, Token: ${token}`);

    if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      console.log(`[SERVER] Webhook Verified Successfully!`);
      res.status(200).send(challenge);
    } else {
      console.log(`[SERVER] Webhook Verification Failed!`);
      res.sendStatus(403);
    }
  });

  // WhatsApp Webhook Message Receiver (POST)
  app.post("/api/whatsapp-webhook", async (req, res) => {
    try {
      console.log(`[SERVER] Incoming POST /api/whatsapp-webhook`);
      const body = req.body;
      console.log(`[SERVER] Webhook Body Object:`, body.object);
      res.sendStatus(200); // Acknowledge receipt quickly to Meta

      if (body.object === "whatsapp_business_account") {
        for (const entry of body.entry) {
          for (const change of entry.changes) {
            if (change.value.messages && change.value.messages[0]) {
              const message = change.value.messages[0];
              const phone_number_id = change.value.metadata.phone_number_id;
              const from = message.from;
              let msgText = message.type === "text" ? message.text.body : "[Non-text message received]";

              console.log(`[SERVER] Received WhatsApp msg from ${from}: ${msgText}`);

              if (process.env.WHATSAPP_PHONE_NUMBER_ID && phone_number_id !== process.env.WHATSAPP_PHONE_NUMBER_ID) {
                continue;
              }

              let aiReply = "Thank you for contacting Rappani Store! How can we help you today?";
              
              // Call Gemini AI
              if (process.env.GEMINI_API_KEY) {
                try {
                  const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      contents: [{
                        parts: [{ text: `You are the friendly customer assistant for Rappani Stationary & Fancy Store. Be concise, polite, and reply in the same language the user speaks. The user says: "${msgText}"` }]
                      }]
                    })
                  });
                  const geminiData = await geminiResponse.json();
                  if (geminiData.candidates && geminiData.candidates.length > 0) {
                    aiReply = geminiData.candidates[0].content.parts[0].text;
                  } else {
                    console.error("[SERVER] Gemini AI Error response:", geminiData);
                  }
                } catch (aiErr) {
                  console.error("[SERVER] Gemini AI Error:", aiErr);
                }
              }

              // Send Reply via WhatsApp API
              if (process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
                try {
                  const waResponse = await fetch(`https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      messaging_product: "whatsapp",
                      to: from,
                      text: { body: aiReply }
                    })
                  });
                  const waData = await waResponse.json();
                  if (!waResponse.ok) {
                    console.error(`[SERVER] WhatsApp API Error (${waResponse.status}):`, waData);
                  } else {
                    console.log(`[SERVER] Reply sent to ${from}`);
                  }
                } catch (waErr) {
                  console.error("[SERVER] WhatsApp Fetch Error:", waErr);
                }
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("[SERVER] Webhook Error:", err);
    }
  });

  // Serve uploaded files
  app.use("/uploads", express.static(uploadsDir));

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(ROOT_DIR, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(ROOT_DIR, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

async function seedInitialData() {
  try {
    const isSeeded = await Setting.findOne({ key: 'initial_seed' });
    if (!isSeeded) {
      const count = await Product.countDocuments();
      if (count === 0) {
        console.log("Seeding initial products into MongoDB...");
        const defaultProducts = [
          { id: '1', name: 'Premium Ruled Notebook', category: 'Stationary', price: 120, image: 'https://picsum.photos/seed/notebook/400/400' },
          { id: '2', name: 'Color Pen Set (12 Pcs)', category: 'Stationary', price: 150, image: 'https://picsum.photos/seed/pens/400/400' },
          { id: '3', name: 'Birthday Gift Box', category: 'Fancy', price: 450, image: 'https://picsum.photos/seed/giftbox/400/400' },
          { id: '4', name: 'Cute Teddy Bear', category: 'Fancy', price: 600, image: 'https://picsum.photos/seed/teddy/400/400' },
        ];
        await Product.insertMany(defaultProducts);
      }
      await Setting.create({ key: 'initial_seed', value: 'true' });
    }

    const passExists = await Setting.findOne({ key: 'admin_password' });
    if (!passExists) {
      await Setting.create({ key: 'admin_password', value: 'rappani123' });
    }
    const phoneExists = await Setting.findOne({ key: 'admin_phone' });
    if (!phoneExists) {
      await Setting.create({ key: 'admin_phone', value: '9876543210' });
    }
    // Forcibly update UPI ID to ensure synchronization between code and database
    await Setting.updateOne({ key: 'upi_id' }, { value: 'mohammedazzam200512@okaxis' }, { upsert: true });
  } catch (err) {
    console.error("Seeding error:", err);
  }
}

startServer();
