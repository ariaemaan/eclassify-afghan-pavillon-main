import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Store name is required'],
    trim: true,
    maxLength: [100, 'Store name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    maxLength: [2000, 'Description cannot exceed 2000 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  logo: {
    url: String,
    alt: String
  },
  banner: {
    url: String,
    alt: String
  },
  contact: {
    email: {
      type: String,
      required: [true, 'Store email is required'],
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },
    social: {
      facebook: String,
      twitter: String,
      instagram: String,
      linkedin: String,
      website: String
    }
  },
  settings: {
    currency: {
      type: String,
      default: 'AFN',
      uppercase: true
    },
    language: {
      type: String,
      default: 'en',
      lowercase: true
    },
    timezone: {
      type: String,
      default: 'Asia/Kabul'
    },
    tax: {
      enabled: {
        type: Boolean,
        default: false
      },
      rate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      }
    },
    shipping: {
      enabled: {
        type: Boolean,
        default: true
      },
      freeShippingThreshold: {
        type: Number,
        default: 0
      },
      shippingClasses: [{
        name: String,
        cost: Number,
        description: String
      }]
    },
    payment: {
      methods: [{
        type: String,
        enum: ['cash', 'card', 'bank_transfer', 'hesabpay', 'mtn_momo']
      }],
      bankDetails: {
        accountName: String,
        accountNumber: String,
        bankName: String,
        swiftCode: String
      }
    }
  },
  stats: {
    totalSales: {
      type: Number,
      default: 0
    },
    totalOrders: {
      type: Number,
      default: 0
    },
    totalProducts: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviewCount: {
      type: Number,
      default: 0
    }
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  seo: {
    title: String,
    description: String,
    keywords: [String]
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'closed'],
    default: 'pending'
  },
  verification: {
    isVerified: {
      type: Boolean,
      default: false
    },
    documents: [{
      type: {
        type: String,
        enum: ['business_license', 'tax_certificate', 'id_card', 'other']
      },
      url: String,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      notes: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  subscription: {
    plan: {
      type: String,
      enum: ['basic', 'premium', 'enterprise'],
      default: 'basic'
    },
    startDate: Date,
    endDate: Date,
    features: [String],
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
      default: 'active'
    }
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
storeSchema.index({ slug: 1 }, { unique: true });
storeSchema.index({ owner: 1 });
storeSchema.index({ status: 1 });
storeSchema.index({ 'verification.isVerified': 1 });

// Virtual for products
storeSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'store'
});

// Virtual for orders
storeSchema.virtual('orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'store'
});

// Pre-save middleware to generate slug
storeSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Method to update store statistics
storeSchema.methods.updateStats = async function() {
  const Product = mongoose.model('Product');
  const Order = mongoose.model('Order');
  const Review = mongoose.model('Review');

  const [productCount, orderStats, reviewStats] = await Promise.all([
    Product.countDocuments({ store: this._id }),
    Order.aggregate([
      { $match: { store: this._id } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$total' },
          totalOrders: { $sum: 1 }
        }
      }
    ]),
    Review.aggregate([
      { $match: { store: this._id } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 }
        }
      }
    ])
  ]);

  this.stats = {
    totalProducts: productCount,
    totalSales: orderStats[0]?.totalSales || 0,
    totalOrders: orderStats[0]?.totalOrders || 0,
    averageRating: reviewStats[0]?.averageRating || 0,
    reviewCount: reviewStats[0]?.reviewCount || 0
  };

  await this.save();
};

const Store = mongoose.models.Store || mongoose.model('Store', storeSchema);

export default Store; 