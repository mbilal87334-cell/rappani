import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error("MONGODB_URI not found in .env");
  process.exit(1);
}

const categorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
});

const Category = mongoose.model("Category", categorySchema);

async function listCategories() {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");

    const categories = await Category.find({});
    console.log("All categories in DB:");
    for (const c of categories) {
      console.log(` - ID: ${c.id}, Name: ${c.name}`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

listCategories();
