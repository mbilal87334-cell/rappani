const mongoose = require("mongoose");

const uri = "mongodb://mbilal87334_db_user:aigqcpizVgvqh0Xo@ac-dkalqm2-shard-00-00.j81rlv6.mongodb.net:27017,ac-dkalqm2-shard-00-01.j81rlv6.mongodb.net:27017,ac-dkalqm2-shard-00-02.j81rlv6.mongodb.net:27017/rappani_store?ssl=true&replicaSet=atlas-3m7vm5-shard-0&authSource=admin&retryWrites=true&w=majority";

const CouponSchema = new mongoose.Schema({
  code: String,
  isActive: Boolean,
  showToCustomers: Boolean,
  startTime: Date,
  expiryTime: Date,
});

const Coupon = mongoose.model("Coupon", CouponSchema, "coupons");

async function checkAndFix() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB!");

    const now = new Date();
    console.log("Current server time (UTC):", now.toISOString());

    const coupons = await Coupon.find({});
    console.log(`Found ${coupons.length} coupons in DB:\n`);

    for (const c of coupons) {
      console.log(`- Code: ${c.code}`);
      console.log(`  isActive: ${c.isActive}`);
      console.log(`  showToCustomers: ${c.showToCustomers}`);
      console.log(`  startTime: ${c.startTime ? c.startTime.toISOString() : "null"}`);
      console.log(`  expiryTime: ${c.expiryTime ? c.expiryTime.toISOString() : "null"}`);
      
      const isScheduled = c.isActive && c.startTime && c.startTime > now;
      console.log(`  Is Scheduled/Future: ${isScheduled}`);

      if (c.isActive && c.showToCustomers) {
        const newStart = new Date(now.getTime() - 60000);
        const newExpiry = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        
        await Coupon.findByIdAndUpdate(c._id, {
          startTime: newStart,
          expiryTime: newExpiry
        });
        console.log(`  --> UPDATED to be active immediately!`);
      }
      console.log("");
    }

    console.log("Done!");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

checkAndFix();
