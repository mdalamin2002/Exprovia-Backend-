const GroceryList = require('../models/GroceryList');
const MealPlan = require('../models/MealPlan');
const asyncHandler = require('express-async-handler');

// @desc    Get user's grocery list for a week
// @route   GET /api/grocery-lists/:week
// @access  Private
const getGroceryList = asyncHandler(async (req, res) => {
  const { week } = req.params; // Format: "YYYY-WW"
  const userId = req.user._id;

  const groceryList = await GroceryList.findOne({ user: userId, week });

  if (groceryList) {
    res.json(groceryList);
  } else {
    // Create empty list if not exists
    const newList = await GroceryList.create({
      user: userId,
      week,
      items: [],
    });
    res.json(newList);
  }
});

// @desc    Generate grocery list from meal plans
// @route   POST /api/grocery-lists/generate
// @access  Private
const generateGroceryList = asyncHandler(async (req, res) => {
  const { week, startDate, endDate } = req.body; // Format: "YYYY-WW" or specific dates
  const userId = req.user._id;

  // Get meal plans for the specified week
  let mealPlansQuery = { user: userId };
  
  if (startDate && endDate) {
    mealPlansQuery.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  } else {
    // Calculate dates from week format
    const [year, weekNumber] = week.split('-');
    const startDate = new Date(year, 0, (weekNumber - 1) * 7 + 1);
    const endDate = new Date(year, 0, weekNumber * 7);
    mealPlansQuery.date = { $gte: startDate, $lte: endDate };
  }

  const mealPlans = await MealPlan.find(mealPlansQuery)
    .populate('recipe', 'ingredients name')
    .sort({ date: 1 });

  // Aggregate ingredients from all recipes
  const ingredientMap = new Map();

  mealPlans.forEach(mealPlan => {
    if (mealPlan.recipe && mealPlan.recipe.ingredients) {
      mealPlan.recipe.ingredients.forEach(ingredient => {
        const key = `${ingredient.name}-${ingredient.unit}`.toLowerCase();
        
        if (ingredientMap.has(key)) {
          // Combine quantities if units match
          const existing = ingredientMap.get(key);
          if (existing.unit === ingredient.unit) {
            const existingQuantity = parseFloat(existing.quantity) || 0;
            const newQuantity = parseFloat(ingredient.quantity) || 0;
            existing.quantity = (existingQuantity + newQuantity).toString();
          } else {
            // Different units - add separately
            ingredientMap.set(`${key}-${Date.now()}`, {
              name: ingredient.name,
              quantity: ingredient.quantity,
              unit: ingredient.unit,
              category: categorizeIngredient(ingredient.name),
              purchased: false,
              recipe: mealPlan.recipe._id,
            });
          }
        } else {
          ingredientMap.set(key, {
            name: ingredient.name,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
            category: categorizeIngredient(ingredient.name),
            purchased: false,
            recipe: mealPlan.recipe._id,
          });
        }
      });
    }
  });

  // Convert map to array
  const items = Array.from(ingredientMap.values());

  // Create or update grocery list
  let groceryList = await GroceryList.findOne({ user: userId, week });
  
  if (groceryList) {
    groceryList.items = items;
    groceryList = await groceryList.save();
  } else {
    groceryList = await GroceryList.create({
      user: userId,
      week,
      items,
    });
  }

  res.json(groceryList);
});

// @desc    Add custom item to grocery list
// @route   POST /api/grocery-lists/:week/items
// @access  Private
const addGroceryItem = asyncHandler(async (req, res) => {
  const { week } = req.params;
  const { name, quantity, unit, category } = req.body;
  const userId = req.user._id;

  let groceryList = await GroceryList.findOne({ user: userId, week });
  
  if (!groceryList) {
    groceryList = await GroceryList.create({
      user: userId,
      week,
      items: [],
    });
  }

  const newItem = {
    name,
    quantity,
    unit: unit || '',
    category: category || 'Other',
    purchased: false,
  };

  groceryList.items.push(newItem);
  groceryList = await groceryList.save();

  res.json(groceryList);
});

// @desc    Update grocery item purchased status
// @route   PUT /api/grocery-lists/:week/items/:itemId
// @access  Private
const updateGroceryItem = asyncHandler(async (req, res) => {
  const { week, itemId } = req.params;
  const { purchased, name, quantity, unit, category } = req.body;
  const userId = req.user._id;

  const groceryList = await GroceryList.findOne({ user: userId, week });
  
  if (!groceryList) {
    res.status(404);
    throw new Error('Grocery list not found');
  }

  const itemIndex = groceryList.items.findIndex(item => item._id.toString() === itemId);
  
  if (itemIndex === -1) {
    res.status(404);
    throw new Error('Item not found');
  }

  if (purchased !== undefined) {
    groceryList.items[itemIndex].purchased = purchased;
  }
  if (name) groceryList.items[itemIndex].name = name;
  if (quantity) groceryList.items[itemIndex].quantity = quantity;
  if (unit) groceryList.items[itemIndex].unit = unit;
  if (category) groceryList.items[itemIndex].category = category;

  groceryList = await groceryList.save();
  res.json(groceryList);
});

// @desc    Remove grocery item
// @route   DELETE /api/grocery-lists/:week/items/:itemId
// @access  Private
const removeGroceryItem = asyncHandler(async (req, res) => {
  const { week, itemId } = req.params;
  const userId = req.user._id;

  const groceryList = await GroceryList.findOne({ user: userId, week });
  
  if (!groceryList) {
    res.status(404);
    throw new Error('Grocery list not found');
  }

  groceryList.items = groceryList.items.filter(item => item._id.toString() !== itemId);
  
  groceryList = await groceryList.save();
  res.json(groceryList);
});

// @desc    Get all user's grocery lists
// @route   GET /api/grocery-lists
// @access  Private
const getGroceryLists = asyncHandler(async (req, res) => {
  const groceryLists = await GroceryList.find({ user: req.user._id }).sort({ week: -1 });
  res.json(groceryLists);
});

// Helper function to categorize ingredients
const categorizeIngredient = (ingredientName) => {
  const name = ingredientName.toLowerCase();
  
  // Produce
  if (name.includes('apple') || name.includes('banana') || name.includes('orange') || 
      name.includes('tomato') || name.includes('lettuce') || name.includes('onion') ||
      name.includes('garlic') || name.includes('carrot') || name.includes('potato') ||
      name.includes('broccoli') || name.includes('spinach') || name.includes('pepper')) {
    return 'Produce';
  }
  
  // Dairy
  if (name.includes('milk') || name.includes('cheese') || name.includes('butter') ||
      name.includes('yogurt') || name.includes('cream')) {
    return 'Dairy';
  }
  
  // Meat
  if (name.includes('chicken') || name.includes('beef') || name.includes('pork') ||
      name.includes('fish') || name.includes('shrimp') || name.includes('lamb')) {
    return 'Meat';
  }
  
  // Beverages
  if (name.includes('water') || name.includes('juice') || name.includes('coffee') ||
      name.includes('tea') || name.includes('wine') || name.includes('beer')) {
    return 'Beverages';
  }
  
  // Default to Pantry
  return 'Pantry';
};

module.exports = {
  getGroceryList,
  generateGroceryList,
  addGroceryItem,
  updateGroceryItem,
  removeGroceryItem,
  getGroceryLists,
};