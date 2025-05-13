import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductVariant'
    },
    name: String,
    sku: String,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    },
    attributes: [{
      name: String,
      value: String
    }]
  }],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    amount: {
      type: Number,
      default: 0,
      min: 0
    },
    rate: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  shipping: {
    method: {
      type: String,
      required: true
    },
    cost: {
      type: Number,
      required: true,
      min: 0
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },
    tracking: {
      number: String,
      carrier: String,
      status: String,
      estimatedDelivery: Date
    }
  },
  discount: {
    code: String,
    amount: {
      type: Number,
      default: 0,
      min: 0
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'fixed'
    }
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  payment: {
    method: {
      type: String,
      required: true,
      enum: ['cash', 'card', 'bank_transfer', 'hesabpay', 'mtn_momo']
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    gateway: String,
    details: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  },
  status: {
    type: String,
    enum: [
      'pending',
      'processing',
      'confirmed',
      'shipped',
      'delivered',
      'cancelled',
      'refunded'
    ],
    default: 'pending'
  },
  notes: [{
    content: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  timeline: [{
    status: String,
    note: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
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
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ store: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'payment.status': 1 });

// Virtual for order age
orderSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Get count of orders for today
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999))
      }
    });
    
    this.orderNumber = `ORD-${year}${month}${day}-${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

// Pre-save middleware to update timeline
orderSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.timeline.push({
      status: this.status,
      note: `Order status changed to ${this.status}`
    });
  }
  next();
});

// Method to calculate totals
orderSchema.methods.calculateTotals = function() {
  // Calculate items total
  this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
  
  // Calculate tax
  if (this.tax.rate > 0) {
    this.tax.amount = (this.subtotal * this.tax.rate) / 100;
  }
  
  // Calculate discount
  let discountAmount = 0;
  if (this.discount.amount > 0) {
    if (this.discount.type === 'percentage') {
      discountAmount = (this.subtotal * this.discount.amount) / 100;
    } else {
      discountAmount = this.discount.amount;
    }
  }
  
  // Calculate final total
  this.total = this.subtotal + this.tax.amount + this.shipping.cost - discountAmount;
};

// Method to add note
orderSchema.methods.addNote = async function(content, author) {
  this.notes.push({
    content,
    author,
    createdAt: new Date()
  });
  await this.save();
};

// Method to update status
orderSchema.methods.updateStatus = async function(status, note) {
  this.status = status;
  this.timeline.push({
    status,
    note: note || `Order status changed to ${status}`,
    createdAt: new Date()
  });
  await this.save();
};

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order; 