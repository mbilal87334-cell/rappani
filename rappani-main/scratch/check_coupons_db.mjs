import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountPercent: { type: Number, required: true },
  maxUses: { type: Number, required: true },
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: false },
  
  // Custom Campaign Offer settings
  offerTitle: { type: String, default: '' },
  offerDescription: { type: String, default: '' },
  discountDetails: { type: String, default: '' },
  minOrderValue: { type: Number, default: 0 },
  maxDiscount: { type: Number, default: 0 },
  startTime: { type: Date, default: null },
  expiryTime: { type: Date, default: null },
  offerDuration: { type: Number, default: 0 }, // in minutes
  showToCustomers: { type: Boolean, default: false },
  viewsCount: { type: Number, default: 0 }
}, { timestamps: true });

let Coupon;
try {
  Coupon = mongoose.model('Coupon');
} catch (e) {
  Coupon = mongoose.model('Coupon', couponSchema);
}

async function run() {
  console.log('Connecting to database...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected!');

  const coupons = await Coupon.find({});
  console.log(`Found ${coupons.length} coupons in database:`);
  coupons.forEach(c => {
    console.log(`- Code: ${c.code}, isActive: ${c.isActive}, showToCustomers: ${c.showToCustomers}, offerTitle: "${c.offerTitle}", expiryTime: ${c.expiryTime}`);
  });

  await mongoose.disconnect();
  console.log('Disconnected.');
}

run().catch(console.error);
