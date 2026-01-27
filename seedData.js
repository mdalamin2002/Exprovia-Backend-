require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Recipe = require('./models/Recipe');
const Category = require('./models/Category');
const Review = require('./models/Review');

const connectDB = require('./config/db');

// Sample data
// Note: Categories are stored as enums in Recipe model, not as separate documents
// The categories array is kept for reference but won't be used in recipe creation

const users = [
  {
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'John Doe',
    email: 'john@test.com',
    password: 'user123',
    role: 'user',
    preferences: {
      favoriteCuisines: ['Italian', 'Mexican'],
      dietaryRestrictions: ['Gluten-free'],
      cookingSkillLevel: 'Intermediate'
    }
  },
  {
    name: 'Jane Smith',
    email: 'jane@test.com',
    password: 'user123',
    role: 'user',
    preferences: {
      favoriteCuisines: ['Indian', 'Thai'],
      dietaryRestrictions: ['Vegetarian'],
      cookingSkillLevel: 'Advanced'
    }
  }
];

const recipes = [
  {
    name: 'Classic Spaghetti Carbonara',
    description: 'Creamy Italian pasta dish with eggs, cheese, pancetta, and black pepper',
    ingredients: [
      { name: 'Spaghetti', quantity: 400, unit: 'g' },
      { name: 'Pancetta', quantity: 150, unit: 'g' },
      { name: 'Eggs', quantity: 4, unit: 'pieces' },
      { name: 'Parmesan cheese', quantity: 100, unit: 'g' },
      { name: 'Black pepper', quantity: 1, unit: 'tsp' },
      { name: 'Salt', quantity: 1, unit: 'tsp' }
    ],
    instructions: [
      { step: 1, description: 'Bring a large pot of salted water to boil' },
      { step: 2, description: 'Cook spaghetti according to package instructions until al dente' },
      { step: 3, description: 'Meanwhile, dice the pancetta and cook in a pan until crispy' },
      { step: 4, description: 'In a bowl, whisk together eggs and grated Parmesan cheese' },
      { step: 5, description: 'Drain pasta, reserving some pasta water' },
      { step: 6, description: 'Add hot pasta to the egg mixture, stirring quickly to create a creamy sauce' },
      { step: 7, description: 'Add pancetta and season with black pepper' },
      { step: 8, description: 'Serve immediately with extra Parmesan' }
    ],
    cookingTime: 20,
    servings: 4,
    difficulty: 'Medium',
    cuisine: 'Italian',
    category: 'Main Course',
    calories: 650,
    featured: true,
    approved: true,
    image: 'https://images.unsplash.com/photo-1608423369490-9ec0dc2cbd58?w=800&h=600&fit=crop'
  },
  {
    name: 'Chicken Tikka Masala',
    description: 'Creamy Indian curry with tender chicken in a rich tomato-based sauce',
    ingredients: [
      { name: 'Chicken breast', quantity: 500, unit: 'g' },
      { name: 'Yogurt', quantity: 200, unit: 'ml' },
      { name: 'Tomato puree', quantity: 400, unit: 'g' },
      { name: 'Heavy cream', quantity: 200, unit: 'ml' },
      { name: 'Garam masala', quantity: 2, unit: 'tbsp' },
      { name: 'Ginger-garlic paste', quantity: 2, unit: 'tbsp' },
      { name: 'Onion', quantity: 2, unit: 'pieces' },
      { name: 'Basmati rice', quantity: 300, unit: 'g' }
    ],
    instructions: [
      { step: 1, description: 'Cut chicken into bite-sized pieces' },
      { step: 2, description: 'Marinate chicken with yogurt, ginger-garlic paste, and half the garam masala for 2 hours' },
      { step: 3, description: 'Grill or pan-fry the marinated chicken until cooked' },
      { step: 4, description: 'Sauté chopped onions until golden brown' },
      { step: 5, description: 'Add tomato puree and remaining garam masala, cook for 10 minutes' },
      { step: 6, description: 'Add cream and cooked chicken, simmer for 15 minutes' },
      { step: 7, description: 'Serve hot with basmati rice' }
    ],
    cookingTime: 45,
    servings: 4,
    difficulty: 'Medium',
    cuisine: 'Indian',
    category: 'Main Course',
    calories: 720,
    featured: true,
    approved: true,
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop'
  },
  {
    name: 'Avocado Toast with Poached Eggs',
    description: 'Healthy breakfast featuring mashed avocado on toast with perfectly poached eggs',
    ingredients: [
      { name: 'Whole grain bread', quantity: 2, unit: 'slices' },
      { name: 'Avocado', quantity: 1, unit: 'piece' },
      { name: 'Eggs', quantity: 2, unit: 'pieces' },
      { name: 'Lemon juice', quantity: 1, unit: 'tbsp' },
      { name: 'Red pepper flakes', quantity: 0.5, unit: 'tsp' },
      { name: 'Salt and pepper', quantity: 1, unit: 'tsp' }
    ],
    instructions: [
      { step: 1, description: 'Toast the bread slices until golden' },
      { step: 2, description: 'Cut avocado in half, remove pit, and scoop out the flesh' },
      { step: 3, description: 'Mash avocado with lemon juice, salt, and pepper' },
      { step: 4, description: 'Spread mashed avocado evenly on toasted bread' },
      { step: 5, description: 'Poach eggs in simmering water with vinegar for 3-4 minutes' },
      { step: 6, description: 'Place poached eggs on top of avocado toast' },
      { step: 7, description: 'Sprinkle with red pepper flakes and serve immediately' }
    ],
    cookingTime: 15,
    servings: 2,
    difficulty: 'Easy',
    cuisine: 'American',
    category: 'Breakfast',
    calories: 320,
    featured: true,
    approved: true,
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&h=600&fit=crop'
  },
  {
    name: 'Chocolate Chip Cookies',
    description: 'Classic homemade cookies with melty chocolate chips',
    ingredients: [
      { name: 'All-purpose flour', quantity: 250, unit: 'g' },
      { name: 'Butter', quantity: 200, unit: 'g' },
      { name: 'Brown sugar', quantity: 150, unit: 'g' },
      { name: 'White sugar', quantity: 100, unit: 'g' },
      { name: 'Eggs', quantity: 2, unit: 'pieces' },
      { name: 'Chocolate chips', quantity: 200, unit: 'g' },
      { name: 'Vanilla extract', quantity: 1, unit: 'tsp' },
      { name: 'Baking soda', quantity: 1, unit: 'tsp' }
    ],
    instructions: [
      { step: 1, description: 'Preheat oven to 190°C (375°F)' },
      { step: 2, description: 'Cream butter and sugars together until light and fluffy' },
      { step: 3, description: 'Beat in eggs one at a time, then add vanilla extract' },
      { step: 4, description: 'Mix flour, baking soda, and salt in separate bowl' },
      { step: 5, description: 'Gradually blend dry ingredients into wet mixture' },
      { step: 6, description: 'Stir in chocolate chips' },
      { step: 7, description: 'Drop spoonfuls of dough onto baking sheets' },
      { step: 8, description: 'Bake for 9-11 minutes until golden brown' },
      { step: 9, description: 'Cool on wire racks before serving' }
    ],
    cookingTime: 25,
    servings: 24,
    difficulty: 'Easy',
    cuisine: 'American',
    category: 'Dessert',
    calories: 180,
    featured: false,
    approved: true,
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&h=600&fit=crop'
  },
  {
    name: 'Caprese Salad',
    description: 'Fresh Italian salad with tomatoes, mozzarella, and basil',
    ingredients: [
      { name: 'Tomatoes', quantity: 4, unit: 'pieces' },
      { name: 'Fresh mozzarella', quantity: 200, unit: 'g' },
      { name: 'Fresh basil leaves', quantity: 20, unit: 'leaves' },
      { name: 'Extra virgin olive oil', quantity: 3, unit: 'tbsp' },
      { name: 'Balsamic vinegar', quantity: 1, unit: 'tbsp' },
      { name: 'Salt', quantity: 1, unit: 'tsp' },
      { name: 'Black pepper', quantity: 0.5, unit: 'tsp' }
    ],
    instructions: [
      { step: 1, description: 'Slice tomatoes and mozzarella into 1/4 inch thick slices' },
      { step: 2, description: 'Arrange alternating slices on a serving platter' },
      { step: 3, description: 'Tuck fresh basil leaves between the slices' },
      { step: 4, description: 'Drizzle with olive oil and balsamic vinegar' },
      { step: 5, description: 'Season with salt and freshly ground black pepper' },
      { step: 6, description: 'Serve immediately at room temperature' }
    ],
    cookingTime: 10,
    servings: 4,
    difficulty: 'Easy',
    cuisine: 'Italian',
    category: 'Salad',
    calories: 280,
    featured: false,
    approved: true,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop'
  }
];

const reviews = [
  {
    recipe: null, // Will be populated later
    user: null,   // Will be populated later
    rating: 5,
    comment: 'Absolutely delicious! This carbonara recipe is perfect - creamy, rich, and authentic. Will definitely make it again!'
  },
  {
    recipe: null,
    user: null,
    rating: 4,
    comment: 'Great flavor and relatively easy to make. The chicken was tender and the sauce was creamy. My family loved it.'
  },
  {
    recipe: null,
    user: null,
    rating: 5,
    comment: 'Best avocado toast I\'ve ever had! The poached eggs were perfectly cooked and the combination of flavors is amazing.'
  },
  {
    recipe: null,
    user: null,
    rating: 4,
    comment: 'These cookies turned out great! Chewy on the inside, crispy on the outside. The chocolate chips were perfectly melted.'
  },
  {
    recipe: null,
    user: null,
    rating: 5,
    comment: 'So fresh and simple! Perfect summer dish. The combination of flavors is incredible and it looks beautiful on the plate.'
  }
];

const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to database');

    // Clear existing data
    await User.deleteMany({});
    await Recipe.deleteMany({});
    await Review.deleteMany({});
    console.log('Cleared existing data');

    // Create users and hash passwords
    const usersWithHashedPasswords = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 12)
      }))
    );
    const createdUsers = await User.insertMany(usersWithHashedPasswords);
    console.log(`Created ${createdUsers.length} users`);

    // Create recipes
    const createdRecipes = await Recipe.insertMany(recipes);
    console.log(`Created ${createdRecipes.length} recipes`);

    // Create reviews
    const reviewsWithRefs = reviews.map((review, index) => ({
      ...review,
      recipe: createdRecipes[index % createdRecipes.length]._id,
      user: createdUsers[(index % 2) + 1]._id // Alternate between John and Jane
    }));
    const createdReviews = await Review.insertMany(reviewsWithRefs);
    console.log(`Created ${createdReviews.length} reviews`);

    // Update recipes with average ratings
    for (const recipe of createdRecipes) {
      const recipeReviews = createdReviews.filter(review => review.recipe.toString() === recipe._id.toString());
      if (recipeReviews.length > 0) {
        const avgRating = recipeReviews.reduce((sum, review) => sum + review.rating, 0) / recipeReviews.length;
        await Recipe.findByIdAndUpdate(recipe._id, {
          averageRating: Math.round(avgRating * 10) / 10,
          numReviews: recipeReviews.length
        });
      }
    }

    console.log('\n=== SEED DATA SUMMARY ===');
    console.log(`Admin Account: admin@test.com / admin123`);
    console.log(`User Accounts: john@test.com / user123, jane@test.com / user123`);
    console.log(`${createdRecipes.length} Recipes created`);
    console.log(`${createdReviews.length} Reviews created`);
    console.log('=========================\n');

    console.log('Database seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeding function
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;