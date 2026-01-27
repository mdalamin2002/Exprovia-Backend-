const Recipe = require('../models/Recipe');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Get personalized recommendations
// @route   GET /api/recommendations
// @access  Private
const getRecommendations = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId).populate('cookingHistory.recipeId');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Get user's cooking history
  const cookingHistory = user.cookingHistory || [];
  
  // If user has cooking history, generate personalized recommendations
  if (cookingHistory.length > 0) {
    const recommendations = await generatePersonalizedRecommendations(user, cookingHistory);
    res.json(recommendations);
  } else {
    // If no history, return trending recipes
    const trendingRecipes = await Recipe.find({ 
      approved: true,
      averageRating: { $gte: 4.0 }
    })
    .sort({ cookCount: -1, averageRating: -1 })
    .limit(18);

    res.json(trendingRecipes);
  }
});

// @desc    Get trending recipes
// @route   GET /api/recommendations/trending
// @access  Public
const getTrendingRecipes = asyncHandler(async (req, res) => {
  const recipes = await Recipe.find({ approved: true })
    .sort({ cookCount: -1, averageRating: -1 })
    .limit(18);

  res.json(recipes);
});

// @desc    Get random recipes
// @route   GET /api/recommendations/random
// @access  Public
const getRandomRecipes = asyncHandler(async (req, res) => {
  const recipes = await Recipe.aggregate([
    { $match: { approved: true } },
    { $sample: { size: 18 } }
  ]);

  res.json(recipes);
});

// Helper function to generate personalized recommendations
const generatePersonalizedRecommendations = async (user, cookingHistory) => {
  // 1. Analyze user preferences
  const cuisinePreferences = {};
  const categoryPreferences = {};
  const recipeRatings = {};

  cookingHistory.forEach(entry => {
    // Count cuisine preferences
    if (entry.cuisine) {
      cuisinePreferences[entry.cuisine] = (cuisinePreferences[entry.cuisine] || 0) + 1;
    }
    
    // Count category preferences
    if (entry.category) {
      categoryPreferences[entry.category] = (categoryPreferences[entry.category] || 0) + 1;
    }
  });

  // 2. Get user's rated recipes
  const userReviews = await require('../models/Review').find({ user: user._id, approved: true });
  userReviews.forEach(review => {
    recipeRatings[review.recipe.toString()] = review.rating;
  });

  // 3. Calculate recommendation scores
  const allRecipes = await Recipe.find({ approved: true });
  
  const scoredRecipes = allRecipes.map(recipe => {
    let score = 0;
    
    // Cuisine preference score (40% weight)
    if (cuisinePreferences[recipe.cuisine]) {
      score += (cuisinePreferences[recipe.cuisine] / cookingHistory.length) * 0.4;
    }
    
    // Category preference score (30% weight)
    if (categoryPreferences[recipe.category]) {
      score += (categoryPreferences[recipe.category] / cookingHistory.length) * 0.3;
    }
    
    // High-rated recipes score (20% weight)
    if (recipeRatings[recipe._id.toString()]) {
      score += (recipeRatings[recipe._id.toString()] / 5) * 0.2;
    }
    
    // Community popularity score (10% weight)
    const popularityScore = (recipe.averageRating / 5) * 0.05 + 
                           (recipe.cookCount / 1000) * 0.05; // Normalize cookCount
    score += Math.min(popularityScore, 0.1);
    
    return {
      recipe,
      score
    };
  });

  // 4. Sort by score and return top 18
  const recommendations = scoredRecipes
    .sort((a, b) => b.score - a.score)
    .slice(0, 18)
    .map(item => item.recipe);

  return recommendations;
};

// @desc    Get recommendations by category
// @route   GET /api/recommendations/category/:category
// @access  Private
const getRecommendationsByCategory = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const category = req.params.category;
  
  const user = await User.findById(userId);
  const cookingHistory = user.cookingHistory || [];

  // Get recipes from the specified category
  let recipes = await Recipe.find({ 
    category: category,
    approved: true 
  }).limit(18);

  // If user has cooking history, prioritize recipes from preferred cuisines
  if (cookingHistory.length > 0) {
    const preferredCuisines = {};
    cookingHistory.forEach(entry => {
      if (entry.cuisine) {
        preferredCuisines[entry.cuisine] = (preferredCuisines[entry.cuisine] || 0) + 1;
      }
    });

    // Sort recipes by user's preferred cuisines
    recipes = recipes.sort((a, b) => {
      const aScore = preferredCuisines[a.cuisine] || 0;
      const bScore = preferredCuisines[b.cuisine] || 0;
      return bScore - aScore;
    });
  }

  res.json(recipes);
});

// @desc    Get recommendations by cuisine
// @route   GET /api/recommendations/cuisine/:cuisine
// @access  Private
const getRecommendationsByCuisine = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const cuisine = req.params.cuisine;
  
  const user = await User.findById(userId);
  const cookingHistory = user.cookingHistory || [];

  // Get recipes from the specified cuisine
  let recipes = await Recipe.find({ 
    cuisine: cuisine,
    approved: true 
  }).limit(18);

  // If user has cooking history, prioritize recipes from preferred categories
  if (cookingHistory.length > 0) {
    const preferredCategories = {};
    cookingHistory.forEach(entry => {
      if (entry.category) {
        preferredCategories[entry.category] = (preferredCategories[entry.category] || 0) + 1;
      }
    });

    // Sort recipes by user's preferred categories
    recipes = recipes.sort((a, b) => {
      const aScore = preferredCategories[a.category] || 0;
      const bScore = preferredCategories[b.category] || 0;
      return bScore - aScore;
    });
  }

  res.json(recipes);
});

module.exports = {
  getRecommendations,
  getTrendingRecipes,
  getRandomRecipes,
  getRecommendationsByCategory,
  getRecommendationsByCuisine,
};