const mongoose = require('mongoose');

const GroceryListSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  week: {
    type: String, // Format: "YYYY-WW" (e.g., "2024-01")
    required: [true, 'Please provide a week'],
    index: true
  },
  items: [{
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: String,
      required: true
    },
    unit: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['Produce', 'Dairy', 'Meat', 'Pantry', 'Beverages', 'Other'],
      default: 'Other'
    },
    purchased: {
      type: Boolean,
      default: false
    },
    recipe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe'
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt before save
GroceryListSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Ensure unique list per user per week
GroceryListSchema.index({ user: 1, week: 1 }, { unique: true });

module.exports = mongoose.model('GroceryList', GroceryListSchema);