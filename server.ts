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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = process.cwd();

// Get MONGODB_URI from environment variables or use a default one
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/rappani_store";

// Global connection state
let dbConnectionState = "initializing";
let dbConnectionError = "";

// Mongoose Models
const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number, required: false },
  image: { type: String, required: true }
});
const Product = mongoose.model("Product", productSchema);

const settingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true }
});
const Setting = mongoose.model("Setting", settingSchema);

async function startServer() {
  const app = express();
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
    params: async (req, file) => {
      return {
        folder: "rappani_store_uploads",
        allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"]
      };
    },
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

  // API Routes
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
      const { id, name, category, price, originalPrice, image } = req.body;
      await Product.create({ id, name, category, price, originalPrice, image });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: "Server error" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { name, category, price, originalPrice, image } = req.body;
      await Product.updateOne({ id }, { name, category, price, originalPrice, image });
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
  } catch (err) {
    console.error("Seeding error:", err);
  }
}

startServer();
