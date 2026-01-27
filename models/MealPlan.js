const mongoose = require('mongoose');

const MealPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Please provide a date']
  },
  mealType: {
    type: String,
    required: [true, 'Please provide a meal type'],
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack']
  },
  status: {
    type: String,
    enum: ['Planned', 'Cooking', 'Cooked', 'Skipped'],
    default: 'Planned'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
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
MealPlanSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient querying
MealPlanSchema.index({ user: 1, date: 1 });
MealPlanSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('MealPlan', MealPlanSchema);