require('dotenv').config();
const mongoose = require('mongoose');

async function fixOrders() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI not found in .env");

    await mongoose.connect(uri);
    console.log("Connected to MongoDB.");

    const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));
    
    // Find all orders
    const orders = await Order.find({});
    console.log(`Found ${orders.length} total orders to process.`);

    let fixedCount = 0;
    for (const order of orders) {
      if (order.items && Array.isArray(order.items)) {
        const shopIds = [...new Set(order.items.map(i => i.product?.shopId || i.product?.storeId || 'main-shop'))];
        await Order.updateOne({ _id: order._id }, { $set: { shopIds } });
        console.log(`Updated Order ${order.id || order._id} with shopIds: ${shopIds.join(', ')}`);
        fixedCount++;
      }
    }
    
    console.log(`Migration complete. Fixed ${fixedCount} orders.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixOrders();
