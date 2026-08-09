import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://mbilal87334:oO7EicbYkX5e9T9v@rappaniapp.x8f0y.mongodb.net/rappani?retryWrites=true&w=majority";

const categorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  icon: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);

const BASE_CATEGORIES = [
  { id: '1', name: 'Stationery', icon: '📝' },
  { id: '2', name: 'Fancy Items', icon: '🎀' },
  { id: '3', name: 'Toys', icon: '🧸' },
  { id: '4', name: 'Sports Items', icon: '⚽' },
  { id: '5', name: 'Ice Cream', icon: '🍦' },
  { id: '6', name: 'Snacks & Chocolates', icon: '🍫' },
  { id: '7', name: 'Cool Drinks & Beverages', icon: '🥤' },
  { id: '8', name: 'Biscuits', icon: '🍪' },
  { id: '9', name: 'Candies & Toffees', icon: '🍬' },
  { id: '10', name: 'Art & Craft', icon: '🎨' },
  { id: '11', name: 'School Essentials', icon: '🎒' },
  { id: '12', name: 'Gifts & Return Gifts', icon: '🎁' },
  { id: '13', name: 'Water Bottles & Lunch Boxes', icon: '💧' },
  { id: '14', name: 'Bags & Pouches', icon: '👜' },
  { id: '15', name: 'Office Supplies', icon: '🗂️' },
  { id: '16', name: 'Educational Toys', icon: '🧩' },
  { id: '17', name: 'Indoor & Outdoor Games', icon: '🪀' },
  { id: '18', name: 'Juices', icon: '🧃' },
  { id: '19', name: 'Daily Essentials', icon: '🧼' },
  { id: '20', name: 'New Arrivals', icon: '⭐' },
  { id: '21', name: 'Best Sellers', icon: '🔥' },
  { id: '22', name: 'Offers & Discounts', icon: '💥' }
];

async function seedCategories() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected.");
    
    // Check if categories already exist
    const count = await Category.countDocuments();
    if (count > 0) {
      console.log(`Categories already exist (${count}). Clearing...`);
      await Category.deleteMany({});
    }

    console.log("Inserting default categories...");
    await Category.insertMany(BASE_CATEGORIES);
    console.log("Categories seeded successfully!");
    
    mongoose.disconnect();
  } catch (error) {
    console.error("Error seeding categories:", error);
    process.exit(1);
  }
}

seedCategories();
