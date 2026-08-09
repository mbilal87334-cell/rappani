import 'dotenv/config';
import mongoose from 'mongoose';

const uri = "mongodb://mbilal87334_db_user:aigqcpizVgvqh0Xo@ac-dkalqm2-shard-00-00.j81rlv6.mongodb.net:27017,ac-dkalqm2-shard-00-01.j81rlv6.mongodb.net:27017,ac-dkalqm2-shard-00-02.j81rlv6.mongodb.net:27017/rappani_store?ssl=true&replicaSet=atlas-3m7vm5-shard-0&authSource=admin&retryWrites=true&w=majority";
console.log("Attempting to connect to MongoDB...");

mongoose.connect(uri)
  .then(() => {
    console.log("MongoDB Connection SUCCESSFUL!");
    process.exit(0);
  })
  .catch(err => {
    console.error("MongoDB Connection FAILED:", err.message);
    process.exit(1);
  });
