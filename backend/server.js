import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Import Routes
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import authRoutes from './routes/authRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import sizeRoutes from './routes/sizeRoutes.js';
import colorRoutes from './routes/colorRoutes.js';
import Category from './models/Category.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'https://shop.mydomain.com',
      'https://admin.mydomain.com',
      'http://shop.mydomain.com',
      'http://admin.mydomain.com'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth/admin', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/sizes', sizeRoutes);
app.use('/api/colors', colorRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SJ Clothing API is running' });
});

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sjclothing';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    // Ensure category index is properly set up
    try {
      // Drop existing index if it exists (to recreate with correct options)
      const indexes = await Category.collection.getIndexes();
      if (indexes['slug_1_parent_1']) {
        await Category.collection.dropIndex('slug_1_parent_1');
        console.log('🔄 Recreated category index for proper parent handling');
      }
      // Create the index (will be created automatically by Mongoose, but ensure it exists)
      await Category.collection.createIndex({ slug: 1, parent: 1 }, { unique: true });
      console.log('✅ Category index verified');
    } catch (error) {
      // Index might not exist or already be correct - that's okay
      if (error.code !== 27 && error.code !== 85) { // 27 = IndexNotFound, 85 = IndexOptionsConflict
        console.log('ℹ️  Category index setup:', error.message);
      }
    }
    
    const PORT = process.env.PORT || 5007;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('\n💡 Solutions:');
    console.error('   1. Start MongoDB locally: brew services start mongodb-community (macOS)');
    console.error('   2. Use MongoDB Atlas: Set MONGODB_URI in .env file');
    console.error('   3. Check if MongoDB is installed and running');
    console.error(`\n   Current MONGODB_URI: ${MONGODB_URI}`);
    process.exit(1);
  });

export default app;

