require('dotenv').config();
const mongoose = require('mongoose');

async function checkDb() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    const productsCount = await db.collection('products').countDocuments();
    console.log('PRODUCTS COUNT:', productsCount);
    
    const adminCount = await db.collection('adminusers').countDocuments();
    console.log('ADMIN USERS COUNT:', adminCount);

    if (productsCount > 0) {
      const p = await db.collection('products').findOne({});
      console.log('SAMPLE PRODUCT:', p);
    }
    
    if (adminCount > 0) {
      const a = await db.collection('adminusers').find({}).toArray();
      console.log('ADMIN USERS:', a);
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkDb();
