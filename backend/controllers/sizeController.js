import Size from '../models/Size.js';

// Get all sizes
export const getSizes = async (req, res) => {
  try {
    const { category } = req.query;
    const query = category ? { $or: [{ category: category }, { category: null }] } : {};
    
    const sizes = await Size.find(query)
      .populate('category', 'name')
      .sort({ order: 1, name: 1 });
    
    res.json(sizes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single size
export const getSize = async (req, res) => {
  try {
    const size = await Size.findById(req.params.id)
      .populate('category', 'name');
    
    if (!size) {
      return res.status(404).json({ message: 'Size not found' });
    }
    
    res.json(size);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create size (Admin only)
export const createSize = async (req, res) => {
  try {
    const { name, displayName, category, order } = req.body;
    
    if (!name || !displayName) {
      return res.status(400).json({ message: 'Name and display name are required' });
    }

    const size = new Size({
      name: name.toUpperCase().trim(),
      displayName: displayName.trim(),
      category: category || null,
      order: order || 0
    });

    await size.save();
    await size.populate('category', 'name');
    
    res.status(201).json(size);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Size with this name already exists' });
    }
    res.status(400).json({ message: error.message });
  }
};

// Update size (Admin only)
export const updateSize = async (req, res) => {
  try {
    const size = await Size.findById(req.params.id);
    
    if (!size) {
      return res.status(404).json({ message: 'Size not found' });
    }

    const updateData = { ...req.body };
    
    if (updateData.name) {
      updateData.name = updateData.name.toUpperCase().trim();
    }
    if (updateData.displayName) {
      updateData.displayName = updateData.displayName.trim();
    }
    if (updateData.order !== undefined) {
      updateData.order = parseInt(updateData.order);
    }

    Object.assign(size, updateData);
    await size.save();
    await size.populate('category', 'name');

    res.json(size);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Size with this name already exists' });
    }
    res.status(400).json({ message: error.message });
  }
};

// Delete size (Admin only)
export const deleteSize = async (req, res) => {
  try {
    const size = await Size.findById(req.params.id);
    
    if (!size) {
      return res.status(404).json({ message: 'Size not found' });
    }

    await size.deleteOne();
    res.json({ message: 'Size deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

