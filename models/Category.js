const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a category name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  image: {
    type: String,
    default: ''
  },
  recipeCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Update recipe count before saving
CategorySchema.pre('save', async function(next) {
  const Recipe = mongoose.model('Recipe');
  this.recipeCount = await Recipe.countDocuments({ category: this.name });
  next();
});

module.exports = mongoose.model('Category', CategorySchema);