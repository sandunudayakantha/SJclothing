import Color from '../models/Color.js';

// Get all colors
export const getColors = async (req, res) => {
  try {
    const { category } = req.query;
    const query = category ? { $or: [{ category: category }, { category: null }] } : {};
    
    const colors = await Color.find(query)
      .populate('category', 'name')
      .sort({ order: 1, name: 1 });
    
    res.json(colors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single color
export const getColor = async (req, res) => {
  try {
    const color = await Color.findById(req.params.id)
      .populate('category', 'name');
    
    if (!color) {
      return res.status(404).json({ message: 'Color not found' });
    }
    
    res.json(color);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create color (Admin only)
export const createColor = async (req, res) => {
  try {
    const { name, displayName, hexCode, category, order } = req.body;
    
    if (!name || !displayName) {
      return res.status(400).json({ message: 'Name and display name are required' });
    }

    const color = new Color({
      name: name.toLowerCase().trim(),
      displayName: displayName.trim(),
      hexCode: hexCode || '#000000',
      category: category || null,
      order: order || 0
    });

    await color.save();
    await color.populate('category', 'name');
    
    res.status(201).json(color);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Color with this name already exists' });
    }
    res.status(400).json({ message: error.message });
  }
};

// Update color (Admin only)
export const updateColor = async (req, res) => {
  try {
    const color = await Color.findById(req.params.id);
    
    if (!color) {
      return res.status(404).json({ message: 'Color not found' });
    }

    const updateData = { ...req.body };
    
    if (updateData.name) {
      updateData.name = updateData.name.toLowerCase().trim();
    }
    if (updateData.displayName) {
      updateData.displayName = updateData.displayName.trim();
    }
    if (updateData.order !== undefined) {
      updateData.order = parseInt(updateData.order);
    }

    Object.assign(color, updateData);
    await color.save();
    await color.populate('category', 'name');

    res.json(color);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Color with this name already exists' });
    }
    res.status(400).json({ message: error.message });
  }
};

// Delete color (Admin only)
export const deleteColor = async (req, res) => {
  try {
    const color = await Color.findById(req.params.id);
    
    if (!color) {
      return res.status(404).json({ message: 'Color not found' });
    }

    await color.deleteOne();
    res.json({ message: 'Color deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

