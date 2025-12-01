import Product from '../models/Product.js';
import Category from '../models/Category.js';
import StoreSettings from '../models/StoreSettings.js';

// Get all products
export const getProducts = async (req, res) => {
  try {
    const { category, featured, newArrival, search } = req.query;
    const query = {};
    const andConditions = [];

    // Handle category filtering (supports both main categories and subcategories)
    if (category && category !== 'null' && category !== 'undefined') {
      // Validate that category is a valid MongoDB ObjectId format
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(category);
      
      if (!isValidObjectId) {
        // Invalid category ID format, return empty results
        query.category = 'invalid-id-that-will-not-match';
      } else {
        const categoryDoc = await Category.findById(category);
        
        if (categoryDoc) {
          if (categoryDoc.parent) {
            // It's a subcategory - filter by subcategory ID or parent category with matching subcategory name
            andConditions.push({
              $or: [
                { category: category }, // Products directly assigned to this subcategory
                {
                  category: categoryDoc.parent, // Products assigned to parent category
                  subcategory: { $regex: categoryDoc.name, $options: 'i' } // With matching subcategory name
                }
              ]
            });
          } else {
            // It's a main category - show all products in this category and its subcategories
            const subcategoryIds = categoryDoc.subcategories || [];
            andConditions.push({
              $or: [
                { category: category }, // Products in main category
                { category: { $in: subcategoryIds } } // Products in subcategories
              ]
            });
          }
        } else {
          // Category not found, return empty results
          query.category = 'invalid-id-that-will-not-match';
        }
      }
    }
    
    // Handle featured filter
    if (featured === 'true') {
      query.featured = true;
    }
    
    // Handle new arrival filter
    if (newArrival === 'true') {
      query.newArrival = true;
    }
    
    // Handle search filter
    if (search) {
      andConditions.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      });
    }

    // Combine all conditions
    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });

    // Apply special offer if enabled
    const settings = await StoreSettings.getSettings();
    if (settings.specialOffer.enabled && settings.specialOffer.percentage > 0) {
      products.forEach(product => {
        if (!product.discountPrice) {
          product.discountPrice = product.price * (1 - settings.specialOffer.percentage / 100);
        }
      });
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single product
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Apply special offer if enabled
    const settings = await StoreSettings.getSettings();
    if (settings.specialOffer.enabled && settings.specialOffer.percentage > 0) {
      if (!product.discountPrice) {
        product.discountPrice = product.price * (1 - settings.specialOffer.percentage / 100);
      }
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create product (Admin only)
export const createProduct = async (req, res) => {
  try {
    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    
    if (images.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    const product = new Product({
      ...req.body,
      images: images,
      price: parseFloat(req.body.price),
      discountPrice: req.body.discountPrice ? parseFloat(req.body.discountPrice) : null,
      featured: req.body.featured === 'true' || req.body.featured === true,
      newArrival: req.body.newArrival === 'true' || req.body.newArrival === true,
      sizes: Array.isArray(req.body.sizes) ? req.body.sizes : req.body.sizes?.split(',').map(s => s.trim()) || [],
      colors: Array.isArray(req.body.colors) ? req.body.colors : req.body.colors?.split(',').map(c => c.trim()) || [],
      stock: parseInt(req.body.stock) || 0
    });

    await product.save();
    await product.populate('category', 'name slug');
    
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update product (Admin only)
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updateData = { ...req.body };
    
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      updateData.images = [...product.images, ...newImages];
    }

    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.discountPrice) updateData.discountPrice = parseFloat(updateData.discountPrice);
    if (updateData.featured !== undefined) updateData.featured = updateData.featured === 'true' || updateData.featured === true;
    if (updateData.newArrival !== undefined) updateData.newArrival = updateData.newArrival === 'true' || updateData.newArrival === true;
    if (updateData.sizes) {
      updateData.sizes = Array.isArray(updateData.sizes) ? updateData.sizes : updateData.sizes.split(',').map(s => s.trim());
    }
    if (updateData.colors) {
      updateData.colors = Array.isArray(updateData.colors) ? updateData.colors : updateData.colors.split(',').map(c => c.trim());
    }
    if (updateData.stock !== undefined) updateData.stock = parseInt(updateData.stock);

    Object.assign(product, updateData);
    await product.save();
    await product.populate('category', 'name slug');

    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete product (Admin only)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.deleteOne();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

