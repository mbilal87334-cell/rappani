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

async function cleanup() {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");

    // Delete products whose names contain "PK" zip headers or worksheets/xml
    const count = await Product.deleteMany({
      $or: [
        { name: /\[Content_Types\]/i },
        { name: /_rels/i },
        { name: /docProps/i },
        { name: /xl\/worksheets/i },
        { name: /sheet1\.xml/i },
        { name: /xml/i },
        { name: /PK/ }
      ]
    });

    console.log(`Deleted ${count.deletedCount} garbage products.`);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

cleanup();
