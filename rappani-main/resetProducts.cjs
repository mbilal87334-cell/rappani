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

const curatedProducts = [
  // Original 5
  { name: 'Premium Geometry Box (Math Set)', category: 'Stationary', price: 250, originalPrice: 350, image: '/images/geometry_box.png' },
  { name: 'Executive Fountain Pen', category: 'Stationary', price: 850, image: '/images/pen.png' },
  { name: 'Leather Cricket Ball', category: 'Sports Items', price: 350, image: '/images/cricket_ball.png' },
  { name: 'Classic Brown Teddy Bear', category: 'Toys', price: 450, image: '/images/teddy_bear.png' },
  { name: 'Modern Daily Backpack', category: 'Bags', price: 850, originalPrice: 1200, image: '/images/backpack.png' },
  
  // New 12
  { name: 'Hardcover Moleskine Notebook', category: 'Stationary', price: 450, originalPrice: 600, image: '/images/notebook.png' },
  { name: 'Vibrant Multi-Color Marker Set', category: 'Stationary', price: 320, image: '/images/marker.png' },
  { name: 'Bright Yellow Sticky Notes', category: 'Stationary', price: 120, image: '/images/sticky_notes.png' },
  { name: 'Wooden Desk Organizer', category: 'Stationary', price: 750, originalPrice: 999, image: '/images/desk_organizer.png' },
  { name: 'Artist Spiral Sketch Pad', category: 'Stationary', price: 250, image: '/images/sketch_pad.png' },
  
  { name: 'Ceramic Cursive Coffee Mug', category: 'Fancy', price: 350, image: '/images/coffee_mug.png' },
  { name: 'Romantic LED Rose Desk Lamp', category: 'Fancy', price: 850, originalPrice: 1200, image: '/images/led_lamp.png' },
  { name: 'Aesthetic Scented Candle', category: 'Fancy', price: 450, image: '/images/scented_candle.png' },
  { name: 'Vintage Brass Table Clock', category: 'Fancy', price: 1250, originalPrice: 1800, image: '/images/table_clock.png' },
  { name: 'Minimalist Ceramic Flower Vase', category: 'Fancy', price: 650, image: '/images/flower_vase.png' },
  
  { name: 'Superhero Action Figure', category: 'Toys', price: 950, originalPrice: 1500, image: '/images/action_figure.png' },
  { name: 'Classic Colorful Rubiks Cube', category: 'Toys', price: 300, image: '/images/rubiks_cube.png' }
];

async function resetAndSeed() {
  const mongoURI = process.env.MONGODB_URI;
  await mongoose.connect(mongoURI);
  console.log("Connected to MongoDB!");

  console.log("Deleting old products...");
  await Product.deleteMany({});
  
  console.log("Inserting exactly 17 perfect products...");
  
  const docsToInsert = curatedProducts.map((p, idx) => {
    const reviews = [];
    for(let r=0; r<3; r++) {
       reviews.push({
          rating: 5,
          review: "Excellent quality, exactly as shown in the picture!",
          customerName: "Customer " + Math.floor(Math.random() * 1000)
       });
    }

    return {
      id: `prod_${Date.now()}_${idx}`,
      name: p.name,
      category: p.category,
      price: p.price,
      originalPrice: p.originalPrice,
      stock: 50,
      image: p.image,
      isFeatured: true,
      reviews
    };
  });

  await Product.insertMany(docsToInsert);
  console.log("Database seeded with 17 PERFECT products successfully!");
  process.exit(0);
}

resetAndSeed().catch(err => {
  console.error(err);
  process.exit(1);
});
