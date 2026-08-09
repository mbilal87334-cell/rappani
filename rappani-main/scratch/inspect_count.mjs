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

async function inspectCount() {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");

    const total = await Product.countDocuments();
    console.log(`TOTAL PRODUCTS IN DATABASE RIGHT NOW: ${total}`);

    // Group products by category to see what's happening
    const stats = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    console.log("Category Stats:");
    stats.forEach(s => console.log(` - Category: ${s._id}, Count: ${s.count}`));

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

inspectCount();
