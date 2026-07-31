import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/rappani_store";

mongoose.connect(MONGODB_URI)
  .then(async () => {
    const db = mongoose.connection.db;
    
    // Update 'Stationary' to 'Stationery'
    await db.collection('products').updateMany(
      { category: 'Stationary' },
      { $set: { category: 'Stationery' } }
    );
    
    // Update 'Fancy' to 'Fancy Items'
    await db.collection('products').updateMany(
      { category: 'Fancy' },
      { $set: { category: 'Fancy Items' } }
    );
    
    // Update 'Bags' to 'Bags & Pouches'
    await db.collection('products').updateMany(
      { category: 'Bags' },
      { $set: { category: 'Bags & Pouches' } }
    );

    console.log("Categories updated successfully!");
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
