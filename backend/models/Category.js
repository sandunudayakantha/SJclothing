import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    lowercase: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  subcategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  image: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Compound unique index: slug must be unique per parent
// This allows same name/slug under different parents
// Multiple null values are allowed in unique indexes, but we want only one main category per slug
// So we need to ensure null is treated consistently
categorySchema.index({ slug: 1, parent: 1 }, { 
  unique: true
});

export default mongoose.model('Category', categorySchema);

