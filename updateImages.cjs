const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number, required: false },
  stock: { type: Number, required: false },
  image: { type: String, required: true },
  isFeatured: { type: Boolean, default: false },
  reviews: [{
    rating: { type: Number, required: true },
    review: { type: String, required: true },
    customerName: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
});
const Product = mongoose.model("Product", productSchema);

const categoryKeywords = {
  'Stationary': 'stationery,pen,pencil,notebook',
  'Fancy': 'gift,mug,decor,fancy',
  'Toys': 'toy,toys,kids,puzzle',
  'Sports Items': 'sports,fitness,ball,cricket',
  'Bags': 'bag,backpack,purse,luggage'
};

async function updateImages() {
  const mongoURI = process.env.MONGODB_URI;
  await mongoose.connect(mongoURI);
  console.log("Connected to MongoDB!");

  const products = await Product.find({}, '_id category');
  console.log(`Found ${products.length} products. Updating images with category-specific photos...`);

  let count = 0;
  const bulkOps = [];
  
  for (let p of products) {
    const keyword = categoryKeywords[p.category] || 'product';
    const randomSeed = Math.floor(Math.random() * 100000);
    // LoremFlickr allows fetching random images by keyword and seed to ensure uniqueness
    const randomImage = `https://loremflickr.com/400/400/${keyword}?lock=${randomSeed}`;
    
    bulkOps.push({
      updateOne: {
        filter: { _id: p._id },
        update: { $set: { image: randomImage } }
      }
    });

    if (bulkOps.length === 500) {
      await Product.bulkWrite(bulkOps);
      count += 500;
      console.log(`Updated ${count} products...`);
      bulkOps.length = 0;
    }
  }

  if (bulkOps.length > 0) {
    await Product.bulkWrite(bulkOps);
    count += bulkOps.length;
    console.log(`Updated ${count} products...`);
  }

  console.log("All products updated with exact category-matching images!");
  process.exit(0);
}

updateImages().catch(err => {
  console.error(err);
  process.exit(1);
});
