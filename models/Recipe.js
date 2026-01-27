const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a recipe name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description']
  },
  ingredients: [{
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
    }
  }],
  instructions: [{
    step: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  }],
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['Appetizer', 'Main Course', 'Dessert', 'Snack', 'Beverage', 'Salad', 'Soup', 'Breakfast']
  },
  cuisine: {
    type: String,
    required: [true, 'Please provide a cuisine'],
    enum: ['Italian', 'Mexican', 'Indian', 'Chinese', 'Thai', 'French', 'American', 'Japanese', 'Korean', 'Middle Eastern', 'Greek', 'Mediterranean', 'Other']
  },
  cookingTime: {
    type: Number,
    required: [true, 'Please provide cooking time in minutes']
  },
  servings: {
    type: Number,
    required: [true, 'Please provide number of servings']
  },
  calories: {
    type: Number,
    required: [true, 'Please provide calorie count per serving']
  },
  difficulty: {
    type: String,
    required: [true, 'Please provide difficulty level'],
    enum: ['Easy', 'Medium', 'Hard']
  },
  image: {
    type: String,
    default: ''
  },
  featured: {
    type: Boolean,
    default: false
  },
  approved: {
    type: Boolean,
    default: false
  },
  ratings: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0
  },
  cookCount: {
    type: Number,
    default: 0
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
RecipeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate average rating
RecipeSchema.methods.calculateAverageRating = async function() {
  const reviews = await mongoose.model('Review').find({ recipe: this._id });
  if (reviews.length === 0) {
    this.averageRating = 0;
    return;
  }

  const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
  this.averageRating = totalRating / reviews.length;
  this.numReviews = reviews.length;

  await this.save();
};

module.exports = mongoose.model('Recipe', RecipeSchema);