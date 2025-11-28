import Category from '../models/Category.js';
import Product from '../models/Product.js';

// Get all categories with subcategories
export const getCategories = async (req, res) => {
  try {
    const { includeSubcategories } = req.query;
    
    if (includeSubcategories === 'true') {
      // Return all categories (main + subcategories) for admin management
      const categories = await Category.find()
        .populate('subcategories')
        .populate('parent', 'name')
        .sort({ parent: 1, name: 1 });
      res.json(categories);
    } else {
      // Return only main categories with populated subcategories (for frontend)
      const categories = await Category.find({ parent: null })
        .populate('subcategories')
        .sort({ name: 1 });
      res.json(categories);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single category
export const getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('subcategories')
      .populate('parent');
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create category (Admin only)
export const createCategory = async (req, res) => {
  try {
    const { name, parent, image } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
    
    // Normalize parent: convert empty string to null, keep valid IDs as-is
    const normalizedParent = parent && parent.trim() !== '' ? parent : null;
    
    // Check if category with same slug exists under the same parent
    // This check ensures uniqueness within the same parent only
    const existingCategory = await Category.findOne({ 
      slug, 
      parent: normalizedParent 
    });
    if (existingCategory) {
      return res.status(400).json({ 
        message: normalizedParent 
          ? 'Subcategory with this name already exists under this parent' 
          : 'Category with this name already exists' 
      });
    }

    const categoryData = {
      name,
      slug,
      image: req.file ? `/uploads/${req.file.filename}` : image || null
    };

    if (normalizedParent) {
      const parentCategory = await Category.findById(normalizedParent);
      if (!parentCategory) {
        return res.status(404).json({ message: 'Parent category not found' });
      }
      categoryData.parent = normalizedParent;
    } else {
      // Explicitly set parent to null for main categories
      categoryData.parent = null;
    }

    const category = new Category(categoryData);
    await category.save();

    // If parent exists, add this category to parent's subcategories
    if (normalizedParent) {
      await Category.findByIdAndUpdate(normalizedParent, {
        $push: { subcategories: category._id }
      });
    }

    await category.populate('parent', 'name');
    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      // MongoDB duplicate key error - compound unique index violation
      const parent = req.body.parent && req.body.parent.trim() !== '' ? req.body.parent : null;
      return res.status(400).json({ 
        message: parent 
          ? 'Subcategory with this name already exists under this parent' 
          : 'Category with this name already exists' 
      });
    }
    res.status(400).json({ message: error.message });
  }
};

// Update category (Admin only)
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const updateData = { ...req.body };
    const oldParent = category.parent;
    const newParent = req.body.parent || null;

    if (req.body.name && req.body.name !== category.name) {
      const newSlug = req.body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
      
      // Check if slug already exists under the new parent (or same parent if not changing)
      const checkParent = newParent !== undefined ? newParent : category.parent;
      const existingCategory = await Category.findOne({ 
        slug: newSlug, 
        parent: checkParent || null,
        _id: { $ne: category._id }
      });
      
      if (existingCategory) {
        return res.status(400).json({ 
          message: checkParent 
            ? 'Subcategory with this name already exists under this parent' 
            : 'Category with this name already exists' 
        });
      }
      
      updateData.slug = newSlug;
    }

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    // Handle parent change
    if (newParent !== undefined && newParent !== oldParent?.toString()) {
      // Remove from old parent's subcategories
      if (oldParent) {
        await Category.findByIdAndUpdate(oldParent, {
          $pull: { subcategories: category._id }
        });
      }

      // Add to new parent's subcategories
      if (newParent) {
        const parentCategory = await Category.findById(newParent);
        if (!parentCategory) {
          return res.status(404).json({ message: 'Parent category not found' });
        }
        await Category.findByIdAndUpdate(newParent, {
          $addToSet: { subcategories: category._id }
        });
        updateData.parent = newParent;
      } else {
        // Removing parent - making it a main category
        updateData.parent = null;
      }
    }

    Object.assign(category, updateData);
    await category.save();
    await category.populate('subcategories');
    await category.populate('parent');

    res.json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Category with this name already exists under this parent' 
      });
    }
    res.status(400).json({ message: error.message });
  }
};

// Delete category (Admin only)
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category has products
    const productsCount = await Product.countDocuments({ category: category._id });
    if (productsCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category. ${productsCount} product(s) are using this category.` 
      });
    }

    // Remove from parent's subcategories if exists
    if (category.parent) {
      await Category.findByIdAndUpdate(category.parent, {
        $pull: { subcategories: category._id }
      });
    }

    // Delete subcategories first
    if (category.subcategories && category.subcategories.length > 0) {
      await Category.deleteMany({ _id: { $in: category.subcategories } });
    }

    await category.deleteOne();
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

