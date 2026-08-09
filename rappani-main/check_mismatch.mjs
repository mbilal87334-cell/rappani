import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/rappani_store";

mongoose.connect(MONGODB_URI)
  .then(async () => {
    const db = mongoose.connection.db;
    const products = await db.collection('products').find({}).toArray();
    const categories = await db.collection('categories').find({}).toArray();
    
    console.log('--- PRODUCTS ---');
    products.forEach(p => console.log(p.name, '=>', p.category));
    
    console.log('\n--- CATEGORIES ---');
    categories.forEach(c => console.log(c.name));
    
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
