const express = require('express');
const router = express.Router();
const {
  getRecommendations,
  getTrendingRecipes,
  getRandomRecipes,
  getRecommendationsByCategory,
  getRecommendationsByCuisine,
} = require('../controllers/recommendationController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/trending', getTrendingRecipes);
router.get('/random', getRandomRecipes);

// Protected routes
router.get('/', protect, getRecommendations);
router.get('/category/:category', protect, getRecommendationsByCategory);
router.get('/cuisine/:cuisine', protect, getRecommendationsByCuisine);

module.exports = router;