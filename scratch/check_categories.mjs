const mongoose = require('mongoose');
const uri = "mongodb://mbilal87334_db_user:aigqcpizVgvqh0Xo@ac-dkalqm2-shard-00-00.j81rlv6.mongodb.net:27017,ac-dkalqm2-shard-00-01.j81rlv6.mongodb.net:27017,ac-dkalqm2-shard-00-02.j81rlv6.mongodb.net:27017/rappani_store?ssl=true&replicaSet=atlas-3m7vm5-shard-0&authSource=admin&retryWrites=true&w=majority";
mongoose.connect(uri).then(async () => {
  const cats = await mongoose.connection.db.collection('categories').find({}).toArray();
  console.log(`Total categories: ${cats.length}`);
  const grouped = {};
  for (let c of cats) {
    if (!grouped[c.name]) grouped[c.name] = [];
    grouped[c.name].push(c.storeId);
  }
  for (let name in grouped) {
    console.log(`${name}: ${grouped[name].join(', ')}`);
  }
  process.exit(0);
});
