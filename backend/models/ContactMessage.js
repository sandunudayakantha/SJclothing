import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 200
  },
  phone: {
    type: String,
    trim: true,
    maxlength: 50
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  ipAddress: {
    type: String,
    default: null
  },
  read: {
    type: Boolean,
    default: false
  },
  spam: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for spam prevention queries
contactMessageSchema.index({ email: 1, createdAt: -1 });
contactMessageSchema.index({ ipAddress: 1, createdAt: -1 });
contactMessageSchema.index({ read: 1, createdAt: -1 });

export default mongoose.model('ContactMessage', contactMessageSchema);

