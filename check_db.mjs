import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB Atlas.");

    const db = mongoose.connection.db;

    const productsCount = await db.collection('products').countDocuments();
    console.log(`Total Products: ${productsCount}`);

    const ordersCount = await db.collection('orders').countDocuments();
    console.log(`Total Orders: ${ordersCount}`);

    const adminUsers = await db.collection('adminusers').find().toArray();
    console.log(`Admins:`, adminUsers);

    mongoose.disconnect();
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
  });
