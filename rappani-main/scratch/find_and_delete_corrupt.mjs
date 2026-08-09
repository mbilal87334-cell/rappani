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

const Product = mongoose.model("Product", productSchema);

async function findAndDeleteCorrupt() {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");

    const products = await Product.find({});
    console.log(`Total products in database: ${products.length}`);

    const corruptIds = [];
    const corruptNames = [];

    // Helper to detect if a name is binary or corrupt
    const isCorrupt = (name) => {
      // If it contains null bytes, weird non-ASCII control characters, or Excel ZIP markers
      if (name.includes('\u0000') || name.includes('\u0003') || name.includes('\u0004')) return true;
      
      // If it contains ZIP/Excel file fragments
      if (/\[Content_Types\]|xml|rels|workbook|theme|styles|sharedStrings/i.test(name)) return true;

      // If it contains weird control character sequences or has high ratio of non-readable chars
      let nonReadable = 0;
      for (let i = 0; i < name.length; i++) {
        const code = name.charCodeAt(i);
        // Printable ASCII is 32 to 126
        // Tamil unicode range is 0x0B80 to 0x0BFF
        const isPrintable = (code >= 32 && code <= 126) || (code >= 0x0B80 && code <= 0x0BFF);
        if (!isPrintable) {
          nonReadable++;
        }
      }
      // If more than 10% or more than 3 characters are non-readable
      if (nonReadable > 3 || (name.length > 0 && nonReadable / name.length > 0.1)) {
        return true;
      }

      return false;
    };

    for (const prod of products) {
      if (isCorrupt(prod.name)) {
        corruptIds.push(prod._id);
        corruptNames.push(prod.name);
      }
    }

    console.log("Found corrupt products:");
    corruptNames.forEach(n => console.log(` - ${n.substring(0, 60)}`));

    if (corruptIds.length > 0) {
      const res = await Product.deleteMany({ _id: { $in: corruptIds } });
      console.log(`Deleted ${res.deletedCount} corrupt products.`);
    } else {
      console.log("No corrupt products found.");
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

findAndDeleteCorrupt();
