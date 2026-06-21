import express from "express";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import path from "path";
import fs from "fs-extra";
import cors from "cors";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

dotenv.config();

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
  stock: { type: Number, required: false },
  image: { type: String, required: true }
});
const Product = mongoose.model("Product", productSchema);

const settingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true }
});
const Setting = mongoose.model("Setting", settingSchema);

const orderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  items: { type: Array, required: true },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  utrNumber: { type: String, default: null },
  status: { type: String, required: true, default: 'Pending' },
  createdAt: { type: Date, required: true, default: Date.now }
});
const Order = mongoose.model("Order", orderSchema);

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
      const { password } = req.body;
      const setting = await Setting.findOne({ key: 'admin_password' });
      if (setting && password === setting.value) {
        res.json({ success: true });
      } else {
        res.status(401).json({ success: false, error: "Invalid password" });
      }
    } catch (err: any) {
      console.error("[SERVER] Login err:", err);
      res.status(500).json({ success: false, error: err?.message || "Server error" });
    }
  });

  app.post("/api/auth/change-password", async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const setting = await Setting.findOne({ key: 'admin_password' });

      if (!setting || currentPassword !== setting.value) {
        return res.status(401).json({ success: false, error: "Current password incorrect" });
      }

      await Setting.updateOne({ key: 'admin_password' }, { value: newPassword });
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
    res.json({ success: true });
  });

  // API Routes
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await Setting.find({ key: { $ne: 'admin_password' } }, '-_id -__v');
      res.json(settings);
    } catch (err) {
      res.status(500).json({ success: false, error: "Server error" });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const { key, value } = req.body;
      if (key === 'admin_password') {
        return res.status(403).json({ success: false, error: "Cannot modify password here" });
      }
      await Setting.updateOne({ key }, { value }, { upsert: true });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: "Server error" });
    }
  });

  app.get("/api/products", async (req, res) => {
    try {
      const products = await Product.find({}, '-_id -__v');
      res.json(products);
    } catch (err) {
      res.status(500).json({ success: false, error: "Server error" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const { id, name, category, price, originalPrice, stock, image } = req.body;
      await Product.create({ id, name, category, price, originalPrice, stock, image });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: "Server error" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { name, category, price, originalPrice, stock, image } = req.body;
      await Product.updateOne({ id }, { name, category, price, originalPrice, stock, image });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: "Server error" });
    }
  });

  app.post("/api/checkout", async (req, res) => {
    try {
      console.log(`[SERVER] Checkout hit. Body:`, JSON.stringify(req.body));
      const { customerName, customerPhone, items, totalAmount, paymentMethod, utrNumber } = req.body;

      if (!customerName || !customerPhone || !items || !totalAmount || !paymentMethod) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
      }

      // SERVER-SIDE SAFEGUARD: Ignore WhatsApp orders if they somehow reach here
      if (paymentMethod && paymentMethod.toLowerCase().includes('whatsapp')) {
        console.warn(`[SERVER] Ignoring WhatsApp checkout request for ${customerName}. Not saving to DB.`);
        return res.json({ success: true, message: "WhatsApp inquiry received (not booked as order)" });
      }

      const orderId = Date.now().toString();
      await Order.create({
        id: orderId,
        customerName,
        customerPhone,
        items,
        totalAmount,
        paymentMethod,
        utrNumber: utrNumber || null,
        status: 'Pending',
        createdAt: new Date()
      });

      // Automatically reduce stock based on items
      for (const item of items) {
        await Product.updateOne(
          { id: item.product.id, stock: { $exists: true, $gte: item.quantity } },
          { $inc: { stock: -item.quantity } }
        );
      }
      res.json({ success: true, orderId });
    } catch (err: any) {
      console.error("[SERVER] Checkout error:", err);
      res.status(500).json({ success: false, error: err?.message || "Server error" });
    }
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
      const { status } = req.body;
      await Order.updateOne({ id }, { status });
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
      const body = req.body;
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
    // Forcibly update UPI ID to ensure synchronization between code and database
    await Setting.updateOne({ key: 'upi_id' }, { value: 'mohammedazzam200512@okaxis' }, { upsert: true });
  } catch (err) {
    console.error("Seeding error:", err);
  }
}

startServer();
