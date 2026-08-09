import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error("MONGODB_URI not found in .env");
  process.exit(1);
}

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  stock: { type: Number, default: 50 }
});

const Product = mongoose.model("Product", productSchema);

async function restore() {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");

    // Restore the three emoji products
    await Product.create({
      id: `prod_restored_${Date.now()}_1`,
      name: "College 🎒",
      category: "Bags",
      price: 299,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80",
      stock: 50
    });
    await Product.create({
      id: `prod_restored_${Date.now()}_2`,
      name: "Toy world 🌎 map",
      category: "Toys",
      price: 399,
      image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=500&q=80",
      stock: 50
    });
    await Product.create({
      id: `prod_restored_${Date.now()}_3`,
      name: "Board 📌 pin",
      category: "Stationary",
      price: 49,
      image: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=500&q=80",
      stock: 50
    });

    console.log("Restored the three emoji products successfully.");
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

restore();
