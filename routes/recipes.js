const express = require('express');
const router = express.Router();
const {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getFeaturedRecipes,
  getTopRecipes,
  getRecipesByCategory,
  getRecipesByCuisine,
  searchRecipesByIngredients,
} = require('../controllers/recipeController');
const { protect, admin } = require('../middleware/auth');

router.route('/').get(getRecipes).post(protect, admin, createRecipe);
router.get('/featured', getFeaturedRecipes);
router.get('/top', getTopRecipes);
router.get('/category/:category', getRecipesByCategory);
router.get('/cuisine/:cuisine', getRecipesByCuisine);
router.get('/search/ingredients', searchRecipesByIngredients);
router
  .route('/:id')
  .get(getRecipeById)
  .put(protect, admin, updateRecipe)
  .delete(protect, admin, deleteRecipe);

module.exports = router;