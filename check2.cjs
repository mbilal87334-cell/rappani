require('dotenv').config();
const mongoose = require('mongoose');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Order = mongoose.model('Order', new mongoose.Schema({}, {strict:false}));
  let orders = await Order.find({ 'items.product.id': 'prod_1786607102818' }, '-_id -__v').lean();

  const targetShopId = "shop_1786595158870_mtyqo";
  
  orders = orders.map(order => {
    const shopItems = order.items.filter((item) => {
      const id = item.product?.shopId || item.product?.storeId || 'main-shop';
      return id === targetShopId || (!id && targetShopId === 'main-shop');
    });
    console.log("Filtered items length:", shopItems.length);
    const shopTotal = shopItems.reduce((acc, item) => acc + ((item.product?.price || 0) * item.quantity), 0);
    console.log("Shop total calculated:", shopTotal);
    return {
      ...order,
      items: shopItems,
      totalAmount: shopTotal
    };
  });

  console.log("Final total:", orders[0].totalAmount);
  process.exit(0);
}
check();
