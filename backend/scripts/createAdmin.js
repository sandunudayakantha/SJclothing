import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AdminUser from '../models/AdminUser.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sjclothing';

// Default admin credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_EMAIL = 'admin@sjclothing.com';
const ADMIN_PASSWORD = 'Admin@123';

async function createAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if admin already exists
    const existingAdmin = await AdminUser.findOne({
      $or: [{ username: ADMIN_USERNAME }, { email: ADMIN_EMAIL }]
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log('\n💡 If you want to create a new admin, use different credentials.');
      process.exit(0);
    }

    // Create new admin
    const admin = new AdminUser({
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    await admin.save();
    
    console.log('✅ Admin user created successfully!\n');
    console.log('📋 Admin Credentials:');
    console.log('   Username:', ADMIN_USERNAME);
    console.log('   Email:', ADMIN_EMAIL);
    console.log('   Password:', ADMIN_PASSWORD);
    console.log('\n🔐 Please change the password after first login!');
    console.log('\n🌐 Login at: http://localhost:5174/login');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 MongoDB is not running. Please:');
      console.error('   1. Start MongoDB locally, OR');
      console.error('   2. Update MONGODB_URI in .env file to use MongoDB Atlas');
    }
    process.exit(1);
  }
}

createAdmin();

