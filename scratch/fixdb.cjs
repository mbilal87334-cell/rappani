const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Product = mongoose.connection.collection('products');
  const products = await Product.find({ createdAt: { $exists: false } }).toArray();
  let count = 0;
  for (const p of products) {
    let date = p._id.getTimestamp(); // Fallback to ObjectId timestamp
    if (p.id && p.id.startsWith('prod_')) {
      const ts = parseInt(p.id.split('_')[1]);
      if (!isNaN(ts)) {
        date = new Date(ts);
      }
    }
    await Product.updateOne({ _id: p._id }, { $set: { createdAt: date, updatedAt: date } });
    count++;
  }
  console.log('Updated ' + count + ' products with createdAt timestamp');
  process.exit(0);
}).catch(console.error);
