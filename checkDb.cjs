const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB");
    
    // We need to use the same schema as server.ts or just a dynamic one
    const shopSchema = new mongoose.Schema({}, { strict: false });
    const Shop = mongoose.models.Shop || mongoose.model('Shop', shopSchema);

    const shops = await Shop.find({});
    console.log("Total shops in DB:", shops.length);
    console.log("Shops:", shops.map(s => ({ id: s.id, name: s.name, status: s.status })));
    
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
