import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/rappani_store";

mongoose.connect(MONGODB_URI)
  .then(async () => {
    const db = mongoose.connection.db;
    const categories = await db.collection('categories').find({}).toArray();
    console.log(`Total categories: ${categories.length}`);
    for (const c of categories) {
      console.log(c.name, c.icon);
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
