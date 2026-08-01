import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/rappani_store";

mongoose.connect(MONGODB_URI)
  .then(async () => {
    const db = mongoose.connection.db;
    const coupons = await db.collection('coupons').find({}).toArray();
    console.log(coupons);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
