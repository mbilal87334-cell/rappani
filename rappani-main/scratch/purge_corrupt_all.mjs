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
});

const categorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
});

const Product = mongoose.model("Product", productSchema);
const Category = mongoose.model("Category", categorySchema);

async function purgeCorrupt() {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");

    const products = await Product.find({});
    console.log(`Total products in database: ${products.length}`);

    const corruptIds = [];
    const corruptProductNames = [];
    
    // Helper to detect if a string is binary or corrupt
    const isCorrupt = (str) => {
      if (!str) return true;
      if (str.includes('\u0000') || str.includes('\u0003') || str.includes('\u0004')) return true;
      if (/\[Content_Types\]|xml|rels|workbook|theme|styles|sharedStrings/i.test(str)) return true;
      
      let nonReadable = 0;
      for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        // Printable ASCII is 32 to 126
        // Tamil unicode range is 0x0B80 to 0x0BFF
        const isPrintable = (code >= 32 && code <= 126) || (code >= 0x0B80 && code <= 0x0BFF);
        if (!isPrintable) {
          nonReadable++;
        }
      }
      // If more than 3 characters or 10% are non-readable
      if (nonReadable > 3 || (str.length > 0 && nonReadable / str.length > 0.1)) {
        return true;
      }
      return false;
    };

    for (const prod of products) {
      if (isCorrupt(prod.category) || isCorrupt(prod.name)) {
        corruptIds.push(prod._id);
        corruptProductNames.push(`${prod.name} (Category: ${prod.category})`);
      }
    }

    console.log(`Found ${corruptIds.length} corrupt products to delete.`);
    if (corruptIds.length > 0) {
      const res = await Product.deleteMany({ _id: { $in: corruptIds } });
      console.log(`Successfully deleted ${res.deletedCount} products.`);
    }

    // Also clean up Categories collection
    const categories = await Category.find({});
    const corruptCatIds = [];
    for (const cat of categories) {
      if (isCorrupt(cat.name)) {
        corruptCatIds.push(cat._id);
      }
    }
    console.log(`Found ${corruptCatIds.length} corrupt categories to delete.`);
    if (corruptCatIds.length > 0) {
      const res = await Category.deleteMany({ _id: { $in: corruptCatIds } });
      console.log(`Successfully deleted ${res.deletedCount} categories.`);
    }

    const finalCount = await Product.countDocuments();
    console.log(`Final product count in DB: ${finalCount}`);

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

purgeCorrupt();
