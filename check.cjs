require('dotenv').config();
const mongoose = require('mongoose');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Order = mongoose.model('Order', new mongoose.Schema({}, {strict:false}));
  const order = await Order.findOne({'items.0': {$exists: true}});
  console.log(JSON.stringify(order.items[0], null, 2));
  process.exit(0);
}
check();
