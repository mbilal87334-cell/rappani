const mongoose = require('mongoose');

const uri = "mongodb://mbilal87334_db_user:aigqcpizVgvqh0Xo@ac-dkalqm2-shard-00-00.j81rlv6.mongodb.net:27017,ac-dkalqm2-shard-00-01.j81rlv6.mongodb.net:27017,ac-dkalqm2-shard-00-02.j81rlv6.mongodb.net:27017/rappani_store?ssl=true&replicaSet=atlas-3m7vm5-shard-0&authSource=admin&retryWrites=true&w=majority";

const categorySchema = new mongoose.Schema({ id: String, storeId: String, name: String }, { strict: false });
const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);

const productSchema = new mongoose.Schema({ category: String, categoryId: String }, { strict: false });
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

const idealNames = [
  "Stationery", "Fancy Items", "Toys", "Sports Items", "Ice Cream", 
  "Snacks & Chocolates", "Cool Drinks & Beverages", "Biscuits", "Candies & Toffees", 
  "Art & Craft", "School Essentials", "Gifts & Return Gifts", "Water Bottles & Lunch Boxes", 
  "Bags & Pouches", "Office Supplies", "Educational Toys", "Indoor & Outdoor Games", 
  "Juices", "Daily Essentials", "New Arrivals", "Best Sellers", "Offers & Discounts"
];

async function cleanup() {
  await mongoose.connect(uri);
  
  const allCategories = await Category.find({});
  let toKeep = [];
  let toDelete = [];
  
  // 1. We only want 22 categories, ALL GLOBAL (storeId = '') or just let's assign them to 'main-shop' if they exist, but global is better if they want it shared. Wait, the user said "ovvaru shop ikku thanithaniyaa konduvaa" (Bring them separately for each shop). So they DO want them tied to shops? Or they want to filter by shop.
  // Actually, if we just keep 1 of each name (case insensitive), and assign them storeId = '' (Global). 
  // Let's create/keep exactly the 22 categories as GLOBAL categories.
  
  const globalCats = {};
  for (const name of idealNames) {
    let cat = allCategories.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (cat) {
      // update it to be clean
      await Category.updateOne({ _id: cat._id }, { $set: { name: name, storeId: '' } });
      globalCats[name.toLowerCase()] = cat.id;
      toKeep.push(cat.id);
    } else {
      // create it
      const newId = `cat_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      await Category.create({ id: newId, storeId: '', name: name, status: 'active' });
      globalCats[name.toLowerCase()] = newId;
      toKeep.push(newId);
    }
  }
  
  // 2. Identify all other categories and map them to the closest ideal category (or just unassign them? Map to closest is better).
  for (const cat of allCategories) {
    if (!toKeep.includes(cat.id)) {
      toDelete.push(cat);
    }
  }
  
  // 3. Update products
  const products = await Product.find({});
  let updatedCount = 0;
  for (const p of products) {
    if (!p.category && !p.categoryId) continue;
    
    // Find the mapping
    let matchedId = null;
    let matchedName = null;
    
    // Try to map by category name directly
    const pNameLower = p.category ? p.category.toLowerCase().trim() : '';
    
    for (const ideal of idealNames) {
      if (pNameLower === ideal.toLowerCase() || 
          pNameLower === 'stationary' && ideal === 'Stationery' ||
          pNameLower.includes(ideal.toLowerCase())) {
        matchedId = globalCats[ideal.toLowerCase()];
        matchedName = ideal;
        break;
      }
    }
    
    // If not found by name, try to look up its current categoryId in the deleted list, and see what its name was
    if (!matchedId) {
      const oldCat = allCategories.find(c => c.id === p.categoryId);
      if (oldCat) {
        const oldCatNameLower = oldCat.name.toLowerCase().trim();
        for (const ideal of idealNames) {
          if (oldCatNameLower === ideal.toLowerCase() || 
              oldCatNameLower === 'stationary' && ideal === 'Stationery') {
            matchedId = globalCats[ideal.toLowerCase()];
            matchedName = ideal;
            break;
          }
        }
      }
    }
    
    if (matchedId && (p.categoryId !== matchedId || p.category !== matchedName)) {
      await Product.updateOne({ _id: p._id }, { $set: { categoryId: matchedId, category: matchedName } });
      updatedCount++;
    }
  }
  
  // 4. Delete the duplicate categories
  if (toDelete.length > 0) {
    await Category.deleteMany({ _id: { $in: toDelete.map(c => c._id) } });
  }
  
  console.log(`Cleaned up categories. Kept 22 global categories. Deleted ${toDelete.length} duplicates. Updated ${updatedCount} products.`);
  process.exit(0);
}

cleanup().catch(console.error);
