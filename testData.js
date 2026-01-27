require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Recipe = require('./models/Recipe');
const Review = require('./models/Review');
const connectDB = require('./config/db');

const testData = async () => {
  try {
    await connectDB();
    console.log('Connected to database for testing\n');

    // Test 1: Check users
    console.log('=== USERS ===');
    const users = await User.find({});
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ${user.role}`);
    });
    console.log(`Total users: ${users.length}\n`);

    // Test 2: Check recipes
    console.log('=== RECIPES ===');
    const recipes = await Recipe.find({});
    recipes.forEach(recipe => {
      console.log(`- ${recipe.name}`);
      console.log(`  Category: ${recipe.category}`);
      console.log(`  Cuisine: ${recipe.cuisine}`);
      console.log(`  Difficulty: ${recipe.difficulty}`);
      console.log(`  Rating: ${recipe.averageRating} (${recipe.numReviews} reviews)`);
      console.log(`  Featured: ${recipe.featured ? 'Yes' : 'No'}`);
      console.log('');
    });
    console.log(`Total recipes: ${recipes.length}\n`);

    // Test 3: Check reviews
    console.log('=== REVIEWS ===');
    const reviews = await Review.find({}).populate('user').populate('recipe');
    reviews.forEach(review => {
      console.log(`- Recipe: ${review.recipe?.name || 'Unknown'}`);
      console.log(`  User: ${review.user?.name || 'Unknown'}`);
      console.log(`  Rating: ${review.rating}/5`);
      console.log(`  Comment: ${review.comment.substring(0, 50)}${review.comment.length > 50 ? '...' : ''}`);
      console.log('');
    });
    console.log(`Total reviews: ${reviews.length}\n`);

    // Test 4: Test API endpoints
    console.log('=== API ENDPOINT TESTS ===');
    
    // Test auth endpoint
    const authResponse = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@test.com', password: 'admin123' })
    });
    
    if (authResponse.ok) {
      console.log('✅ Auth endpoint working');
      const authData = await authResponse.json();
      console.log(`   Token received: ${authData.token ? 'Yes' : 'No'}`);
    } else {
      console.log('❌ Auth endpoint failed');
    }

    // Test recipes endpoint
    const recipesResponse = await fetch('http://localhost:5001/api/recipes');
    if (recipesResponse.ok) {
      console.log('✅ Recipes endpoint working');
      const recipesData = await recipesResponse.json();
      console.log(`   Recipes returned: ${recipesData.recipes ? recipesData.recipes.length : 0}`);
    } else {
      console.log('❌ Recipes endpoint failed');
    }

    console.log('\n=== TEST COMPLETED ===');
    process.exit(0);

  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
};

testData();