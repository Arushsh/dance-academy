const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dance_academy');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('⚠️  Server will continue running. Please check your MongoDB Atlas IP whitelist.');
    console.error('   Go to Atlas ➜ Network Access ➜ Add IP Address ➜ Allow Access from Anywhere (0.0.0.0/0) for dev.');
  }
};

module.exports = connectDB;
