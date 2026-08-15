const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://mbilal87334_db_user:aigqcpizVgvqh0Xo@ac-dkalqm2-shard-00-00.j81rlv6.mongodb.net:27017,ac-dkalqm2-shard-00-01.j81rlv6.mongodb.net:27017,ac-dkalqm2-shard-00-02.j81rlv6.mongodb.net:27017/rappani_store?ssl=true&replicaSet=atlas-3m7vm5-shard-0&authSource=admin&retryWrites=true&w=majority";

const productSchema = new mongoose.Schema({
  id: String,
  shopId: String,
  category: String,
  categoryId: String,
  subcategory: String,
  subcategoryId: String
}, { strict: false });

const categorySchema = new mongoose.Schema({
  id: String,
  storeId: String,
  name: String,
  slug: String,
  status: String
}, { strict: false });

const subcategorySchema = new mongoose.Schema({
  id: String,
  storeId: String,
  categoryId: String,
  name: String,
  slug: String,
  status: String
}, { strict: false });

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);
const Subcategory = mongoose.models.Subcategory || mongoose.model("Subcategory", subcategorySchema);

async function migrate() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB for migration");

    const products = await Product.find({});
    console.log(`Found ${products.length} products to check.`);

    let updatedCount = 0;

    for (const p of products) {
      if (!p.category) continue;
      
      const shopId = p.shopId || 'main-shop';
      
      let cat = await Category.findOne({ storeId: shopId, name: p.category });
      if (!cat) {
        cat = await Category.create({
          id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          storeId: shopId,
          name: p.category,
          status: 'active'
        });
        console.log(`Created Category: ${p.category} for shop: ${shopId}`);
      }

      let subcat = null;
      if (p.subcategory) {
        subcat = await Subcategory.findOne({ storeId: shopId, categoryId: cat.id, name: p.subcategory });
        if (!subcat) {
          subcat = await Subcategory.create({
            id: `subcat_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            storeId: shopId,
            categoryId: cat.id,
            name: p.subcategory,
            status: 'active'
          });
          console.log(`Created Subcategory: ${p.subcategory} for shop: ${shopId}`);
        }
      }

      let needsUpdate = false;
      if (p.categoryId !== cat.id) {
        p.categoryId = cat.id;
        needsUpdate = true;
      }
      if (subcat && p.subcategoryId !== subcat.id) {
        p.subcategoryId = subcat.id;
        needsUpdate = true;
      }
      if (!subcat && p.subcategoryId) {
        p.subcategoryId = '';
        needsUpdate = true;
      }

      if (needsUpdate) {
        await Product.updateOne(
          { _id: p._id }, 
          { $set: { categoryId: p.categoryId, subcategoryId: p.subcategoryId || '' } }
        );
        updatedCount++;
      }
    }

    console.log(`Migration complete. Updated ${updatedCount} products.`);
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
}

migrate();
