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

async function cleanUncategorizedAndBinary() {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");

    // Find and delete products where category is 'Uncategorized' (these are from the binary Excel parser attempts)
    // or category has non-printable characters.
    const res = await Product.deleteMany({
      $or: [
        { category: 'Uncategorized' },
        { category: /^[^\x20-\x7E]+$/ }, // non-printable ASCII
        { name: /\[Content_Types\]/i },
        { name: /_rels/i },
        { name: /docProps/i },
        { name: /xl\/worksheets/i },
        { name: /sheet1\.xml/i },
        { name: /xml/i },
        { name: /PK/ }
      ]
    });

    console.log(`Deleted ${res.deletedCount} temporary/uncategorized/binary products.`);

    const total = await Product.countDocuments();
    console.log(`TOTAL PRODUCTS REMAINING IN DB: ${total}`);

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

cleanUncategorizedAndBinary();
