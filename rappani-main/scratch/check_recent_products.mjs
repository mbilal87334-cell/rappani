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
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model("Product", productSchema);

async function checkRecent() {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");

    // Fetch the 30 most recently created products
    const recent = await Product.find({}).sort({ createdAt: -1 }).limit(30);
    console.log("Most recent products in DB:");
    for (const p of recent) {
      console.log(` - ID: ${p.id}, Name: ${p.name}, Price: ${p.price}, Image: ${p.image}`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

checkRecent();
