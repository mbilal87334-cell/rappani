require('dotenv').config();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  const admin = await mongoose.connection.db.collection('adminusers').findOne({ role: 'superadmin' });
  const token = jwt.sign(
    { 
      userId: admin._id,
      role: admin.role,
      shopId: admin.shopId
    }, 
    process.env.JWT_SECRET || 'rappani_super_secret_key'
  );
  
  const res = await fetch('http://localhost:3000/api/products/all', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  console.log('Status:', res.status);
  console.log('Total returned:', data.total);
  if(data.products) console.log('Products length:', data.products.length);
  process.exit(0);
}
test();
