const Recipe = require('../models/Recipe');
const asyncHandler = require('express-async-handler');

// @desc    Get all recipes
// @route   GET /api/recipes
// @access  Public
const getRecipes = asyncHandler(async (req, res) => {
  const pageSize = 12;
  const page = Number(req.query.page) || 1;

  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {};

  const category = req.query.category
    ? { category: req.query.category }
    : {};

  const cuisine = req.query.cuisine
    ? { cuisine: req.query.cuisine }
    : {};

  const difficulty = req.query.difficulty
    ? { difficulty: req.query.difficulty }
    : {};

  const query = {
    ...keyword,
    ...category,
    ...cuisine,
    ...difficulty,
    approved: true,
  };

  const count = await Recipe.countDocuments(query);
  const recipes = await Recipe.find(query)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    recipes,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc    Get recipe by ID
// @route   GET /api/recipes/:id
// @access  Public
const getRecipeById = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);

  if (recipe && recipe.approved) {
    res.json(recipe);
  } else {
    res.status(404);
    throw new Error('Recipe not found');
  }
});

// @desc    Create a recipe
// @route   POST /api/recipes
// @access  Private/Admin
const createRecipe = asyncHandler(async (req, res) => {
  const recipe = new Recipe({
    name: 'Sample name',
    description: 'Sample description',
    ingredients: [],
    instructions: [],
    category: 'Appetizer',
    cuisine: 'Italian',
    cookingTime: 0,
    servings: 1,
    calories: 0,
    difficulty: 'Easy',
    user: req.user._id,
  });

  const createdRecipe = await recipe.save();
  res.status(201).json(createdRecipe);
});

// @desc    Update a recipe
// @route   PUT /api/recipes/:id
// @access  Private/Admin
const updateRecipe = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    ingredients,
    instructions,
    category,
    cuisine,
    cookingTime,
    servings,
    calories,
    difficulty,
    image,
    featured,
    approved,
  } = req.body;

  const recipe = await Recipe.findById(req.params.id);

  if (recipe) {
    recipe.name = name || recipe.name;
    recipe.description = description || recipe.description;
    recipe.ingredients = ingredients || recipe.ingredients;
    recipe.instructions = instructions || recipe.instructions;
    recipe.category = category || recipe.category;
    recipe.cuisine = cuisine || recipe.cuisine;
    recipe.cookingTime = cookingTime || recipe.cookingTime;
    recipe.servings = servings || recipe.servings;
    recipe.calories = calories || recipe.calories;
    recipe.difficulty = difficulty || recipe.difficulty;
    recipe.image = image || recipe.image;
    recipe.featured = featured !== undefined ? featured : recipe.featured;
    recipe.approved = approved !== undefined ? approved : recipe.approved;

    const updatedRecipe = await recipe.save();
    res.json(updatedRecipe);
  } else {
    res.status(404);
    throw new Error('Recipe not found');
  }
});

// @desc    Delete a recipe
// @route   DELETE /api/recipes/:id
// @access  Private/Admin
const deleteRecipe = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);

  if (recipe) {
    await Recipe.deleteOne({ _id: req.params.id });
    res.json({ message: 'Recipe removed' });
  } else {
    res.status(404);
    throw new Error('Recipe not found');
  }
});

// @desc    Get featured recipes
// @route   GET /api/recipes/featured
// @access  Public
const getFeaturedRecipes = asyncHandler(async (req, res) => {
  const recipes = await Recipe.find({ featured: true, approved: true }).limit(10);
  res.json(recipes);
});

// @desc    Get top rated recipes
// @route   GET /api/recipes/top
// @access  Public
const getTopRecipes = asyncHandler(async (req, res) => {
  const recipes = await Recipe.find({ approved: true })
    .sort({ averageRating: -1 })
    .limit(10);
  res.json(recipes);
});

// @desc    Get recipes by category
// @route   GET /api/recipes/category/:category
// @access  Public
const getRecipesByCategory = asyncHandler(async (req, res) => {
  const recipes = await Recipe.find({
    category: req.params.category,
    approved: true,
  }).limit(12);
  res.json(recipes);
});

// @desc    Get recipes by cuisine
// @route   GET /api/recipes/cuisine/:cuisine
// @access  Public
const getRecipesByCuisine = asyncHandler(async (req, res) => {
  const recipes = await Recipe.find({
    cuisine: req.params.cuisine,
    approved: true,
  }).limit(12);
  res.json(recipes);
});

// @desc    Search recipes by ingredients
// @route   GET /api/recipes/search/ingredients
// @access  Public
const searchRecipesByIngredients = asyncHandler(async (req, res) => {
  const ingredients = req.query.ingredients
    ? req.query.ingredients.split(',').map((ing) => ing.trim())
    : [];

  if (ingredients.length === 0) {
    res.status(400);
    throw new Error('Please provide ingredients to search');
  }

  const recipes = await Recipe.find({
    'ingredients.name': { $in: ingredients.map((ing) => new RegExp(ing, 'i')) },
    approved: true,
  }).limit(20);

  res.json(recipes);
});

module.exports = {
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
};