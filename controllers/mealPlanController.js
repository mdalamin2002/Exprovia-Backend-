const MealPlan = require('../models/MealPlan');
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Get user's meal plans
// @route   GET /api/meal-plans
// @access  Private
const getMealPlans = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  let query = { user: req.user._id };

  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const mealPlans = await MealPlan.find(query)
    .populate('recipe', 'name image cookingTime category cuisine')
    .sort({ date: 1 });

  res.json(mealPlans);
});

// @desc    Get meal plan by ID
// @route   GET /api/meal-plans/:id
// @access  Private
const getMealPlanById = asyncHandler(async (req, res) => {
  const mealPlan = await MealPlan.findById(req.params.id).populate(
    'recipe',
    'name image cookingTime category cuisine'
  );

  if (mealPlan && mealPlan.user.toString() === req.user._id.toString()) {
    res.json(mealPlan);
  } else {
    res.status(404);
    throw new Error('Meal plan not found');
  }
});

// @desc    Create a meal plan
// @route   POST /api/meal-plans
// @access  Private
const createMealPlan = asyncHandler(async (req, res) => {
  const { recipeId, date, mealType, notes } = req.body;

  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    res.status(404);
    throw new Error('Recipe not found');
  }

  const mealPlan = await MealPlan.create({
    user: req.user._id,
    recipe: recipeId,
    date: new Date(date),
    mealType,
    notes: notes || '',
  });

  const populatedMealPlan = await MealPlan.findById(mealPlan._id).populate(
    'recipe',
    'name image cookingTime category cuisine'
  );

  res.status(201).json(populatedMealPlan);
});

// @desc    Update a meal plan
// @route   PUT /api/meal-plans/:id
// @access  Private
const updateMealPlan = asyncHandler(async (req, res) => {
  const { date, mealType, status, notes } = req.body;

  const mealPlan = await MealPlan.findById(req.params.id);

  if (mealPlan && mealPlan.user.toString() === req.user._id.toString()) {
    mealPlan.date = date || mealPlan.date;
    mealPlan.mealType = mealType || mealPlan.mealType;
    mealPlan.status = status || mealPlan.status;
    mealPlan.notes = notes || mealPlan.notes;

    const updatedMealPlan = await mealPlan.save();

    const populatedMealPlan = await MealPlan.findById(updatedMealPlan._id).populate(
      'recipe',
      'name image cookingTime category cuisine'
    );

    res.json(populatedMealPlan);
  } else {
    res.status(404);
    throw new Error('Meal plan not found');
  }
});

// @desc    Delete a meal plan
// @route   DELETE /api/meal-plans/:id
// @access  Private
const deleteMealPlan = asyncHandler(async (req, res) => {
  const mealPlan = await MealPlan.findById(req.params.id);

  if (mealPlan && mealPlan.user.toString() === req.user._id.toString()) {
    await MealPlan.deleteOne({ _id: req.params.id });
    res.json({ message: 'Meal plan removed' });
  } else {
    res.status(404);
    throw new Error('Meal plan not found');
  }
});

// @desc    Mark meal as cooked
// @route   PUT /api/meal-plans/:id/cook
// @access  Private
const markAsCooked = asyncHandler(async (req, res) => {
  const mealPlan = await MealPlan.findById(req.params.id);

  if (mealPlan && mealPlan.user.toString() === req.user._id.toString()) {
    mealPlan.status = 'Cooked';
    const updatedMealPlan = await mealPlan.save();

    // Add to user's cooking history
    const user = await User.findById(req.user._id);
    const recipe = await Recipe.findById(mealPlan.recipe);

    if (user && recipe) {
      const historyEntry = {
        recipeId: recipe._id,
        cuisine: recipe.cuisine,
        category: recipe.category,
        date: new Date(),
      };

      // Check if recipe already exists in history to avoid duplicates
      const existingIndex = user.cookingHistory.findIndex(
        (entry) => entry.recipeId.toString() === recipe._id.toString()
      );

      if (existingIndex > -1) {
        user.cookingHistory[existingIndex].date = new Date();
      } else {
        user.cookingHistory.push(historyEntry);
      }

      await user.save();

      // Update recipe cook count
      recipe.cookCount += 1;
      await recipe.save();
    }

    const populatedMealPlan = await MealPlan.findById(updatedMealPlan._id).populate(
      'recipe',
      'name image cookingTime category cuisine'
    );

    res.json(populatedMealPlan);
  } else {
    res.status(404);
    throw new Error('Meal plan not found');
  }
});

// @desc    Get weekly meal plans
// @route   GET /api/meal-plans/week/:week
// @access  Private
const getWeeklyMealPlans = asyncHandler(async (req, res) => {
  const week = req.params.week; // Format: "YYYY-WW"
  const [year, weekNumber] = week.split('-');
  
  // Calculate start and end dates of the week
  const startDate = new Date(year, 0, (weekNumber - 1) * 7 + 1);
  const endDate = new Date(year, 0, weekNumber * 7);

  const mealPlans = await MealPlan.find({
    user: req.user._id,
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  })
    .populate('recipe', 'name image cookingTime category cuisine')
    .sort({ date: 1, mealType: 1 });

  res.json(mealPlans);
});

// @desc    Get meal plan statistics
// @route   GET /api/meal-plans/stats
// @access  Private
const getMealPlanStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const totalPlans = await MealPlan.countDocuments({ user: userId });
  const cookedPlans = await MealPlan.countDocuments({ user: userId, status: 'Cooked' });
  const plannedPlans = await MealPlan.countDocuments({ user: userId, status: 'Planned' });
  
  const recentPlans = await MealPlan.find({ user: userId })
    .sort({ date: -1 })
    .limit(5)
    .populate('recipe', 'name');

  res.json({
    totalPlans,
    cookedPlans,
    plannedPlans,
    completionRate: totalPlans > 0 ? (cookedPlans / totalPlans) * 100 : 0,
    recentPlans,
  });
});

module.exports = {
  getMealPlans,
  getMealPlanById,
  createMealPlan,
  updateMealPlan,
  deleteMealPlan,
  markAsCooked,
  getWeeklyMealPlans,
  getMealPlanStats,
};