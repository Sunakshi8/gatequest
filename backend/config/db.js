const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('💡 Make sure you have:');
    console.error('   1. Created a free MongoDB Atlas account at https://mongodb.com/atlas');
    console.error('   2. Created a cluster and database user');
    console.error('   3. Added your IP to the whitelist (or use 0.0.0.0/0 for all)');
    console.error('   4. Copied the connection string to backend/.env as MONGO_URI');
    process.exit(1);
  }
};

module.exports = connectDB;
