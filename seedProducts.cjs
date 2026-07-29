const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Mongoose Models
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

const categories = ['Stationary', 'Fancy', 'Toys', 'Sports Items', 'Bags'];
const productNames = {
  'Stationary': ['Premium Gel Pen', 'Notebook 200 Pages', 'Highlighter Set', 'Sticky Notes', 'Mechanical Pencil', 'Correction Tape', 'Geometry Box'],
  'Fancy': ['Designer Mug', 'LED Desk Lamp', 'Aesthetic Keychain', 'Cute Sticker Pack', 'Mini Desk Plant', 'Glitter Pen', 'Decorative Tape'],
  'Toys': ['Action Figure', 'Puzzle Set', 'Remote Control Car', 'Plush Teddy Bear', 'Building Blocks', 'Yo-Yo', 'Fidget Spinner'],
  'Sports Items': ['Cricket Ball', 'Badminton Racket', 'Football', 'Tennis Ball', 'Skipping Rope', 'Yoga Mat', 'Swimming Goggles'],
  'Bags': ['School Backpack', 'Laptop Bag', 'Travel Duffle Bag', 'Tote Bag', 'Gym String Bag', 'Crossbody Bag', 'Pencil Pouch']
};
const categoryImages = {
  'Stationary': ['https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=500&q=80', 'https://images.unsplash.com/photo-1522881113591-b6d98d40e118?w=500&q=80', 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500&q=80'],
  'Fancy': ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&q=80', 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=500&q=80', 'https://images.unsplash.com/photo-1555529733-0e670560f8e1?w=500&q=80'],
  'Toys': ['https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=500&q=80', 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=500&q=80', 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500&q=80'],
  'Sports Items': ['https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500&q=80', 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=500&q=80', 'https://images.unsplash.com/photo-1626248356877-c93d9ce4df93?w=500&q=80'],
  'Bags': ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80', 'https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?w=500&q=80', 'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=500&q=80']
};

async function seed() {
  console.log("Connecting to DB...");
  const mongoURI = process.env.MONGODB_URI;
  await mongoose.connect(mongoURI);
  console.log("Connected to MongoDB!");

  const TOTAL_PRODUCTS = 10000;
  
  // We'll insert in batches of 500 to avoid out-of-memory errors
  const BATCH_SIZE = 500;
  
  console.log(`Starting to seed ${TOTAL_PRODUCTS} products...`);
  
  let inserted = 0;
  while (inserted < TOTAL_PRODUCTS) {
    const batch = [];
    for (let i = 0; i < BATCH_SIZE; i++) {
      if (inserted + i >= TOTAL_PRODUCTS) break;
      
      const category = categories[Math.floor(Math.random() * categories.length)];
      const namePool = productNames[category];
      const baseName = namePool[Math.floor(Math.random() * namePool.length)];
      
      const price = Math.floor(Math.random() * (1000 - 200 + 1)) + 200;
      // 30% chance to have an original price
      const hasDiscount = Math.random() > 0.7;
      const originalPrice = hasDiscount ? price + Math.floor(Math.random() * 500) + 50 : undefined;
      
      const imgPool = categoryImages[category];
      const image = imgPool[Math.floor(Math.random() * imgPool.length)];
      
      // Random reviews (0 to 5)
      const reviewCount = Math.floor(Math.random() * 6);
      const reviews = [];
      for(let r=0; r<reviewCount; r++) {
         reviews.push({
            rating: Math.floor(Math.random() * 3) + 3, // 3 to 5 stars
            review: "Great product!",
            customerName: "Customer " + Math.floor(Math.random() * 1000)
         });
      }

      batch.push({
        id: `prod_${Date.now()}_${Math.floor(Math.random() * 1000000)}_${inserted + i}`,
        name: `${baseName} - Variant ${Math.floor(Math.random() * 1000)}`,
        category,
        price,
        originalPrice,
        stock: Math.floor(Math.random() * 100) + 10,
        image,
        isFeatured: Math.random() > 0.9,
        reviews
      });
    }
    
    await Product.insertMany(batch);
    inserted += batch.length;
    console.log(`Inserted ${inserted} / ${TOTAL_PRODUCTS} products...`);
  }

  console.log("Database seeded successfully!");
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
