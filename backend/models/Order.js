import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  title: String,
  size: String,
  color: String,
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: false // Will be generated in pre-save hook
  },
  items: [orderItemSchema],
  customer: {
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  deliveryFee: {
    type: Number,
    default: 0,
    min: 0
  },
  paymentMethod: {
    type: String,
    default: 'Cash on Delivery'
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Dispatched', 'Delivered'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

// Generate order number before saving (always generate if not provided)
orderSchema.pre('save', async function(next) {
  // Always generate orderNumber if it doesn't exist
  if (!this.orderNumber || this.orderNumber.trim() === '') {
    try {
      // Use a more unique order number with timestamp and random component
      // This combination makes collisions extremely unlikely
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 100000);
      const processId = process.pid || 0;
      this.orderNumber = `ORD-${timestamp}-${random}-${processId}`;
    } catch (error) {
      console.error('Error generating order number:', error);
      return next(error);
    }
  }
  next();
});

// Also generate on validate to ensure it's set before validation
orderSchema.pre('validate', function(next) {
  if (!this.orderNumber || this.orderNumber.trim() === '') {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 100000);
    const processId = process.pid || 0;
    this.orderNumber = `ORD-${timestamp}-${random}-${processId}`;
  }
  next();
});

export default mongoose.model('Order', orderSchema);

