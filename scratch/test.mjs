import mongoose from 'mongoose';

async function test() {
  try {
    await mongoose.connect('mongodb+srv://user1:Zxcv1234@cluster0.puknt.mongodb.net/rappani_store?retryWrites=true&w=majority&appName=Cluster0');
    
    const orderSchema = new mongoose.Schema({}, { strict: false });
    const Order = mongoose.model("Order", orderSchema);
    
    const order = await Order.findOne({});
    console.log("Found order:", order.id);
    
    const updateData = { $set: {}, $push: {} };
    updateData.$set.status = "Shipped";
    updateData.$push = {
      timeline: { status: "Shipped", date: new Date() }
    };
    
    const res = await Order.updateOne({ id: order.id }, updateData);
    console.log("Update result:", res);
    
  } catch (err) {
    console.error("ERROR CAUGHT:", err);
  } finally {
    process.exit(0);
  }
}

test();
