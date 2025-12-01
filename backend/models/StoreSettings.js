import mongoose from 'mongoose';

const storeSettingsSchema = new mongoose.Schema({
  contact: {
    phone: {
      type: String,
      default: ''
    },
    callPhone: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      default: ''
    },
    address: {
      type: String,
      default: ''
    },
    whatsapp: {
      type: String,
      default: ''
    }
  },
  banner: {
    images: [{
      type: String,
      default: null
    }],
    image: {
      type: String,
      default: null
    },
    title: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    }
  },
  specialOffer: {
    enabled: {
      type: Boolean,
      default: false
    },
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    title: {
      type: String,
      default: ''
    }
  },
  deliveryFee: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
storeSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

export default mongoose.model('StoreSettings', storeSettingsSchema);

