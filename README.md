# TasteTrail Backend

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with:
```env
MONGODB_URI=mongodb://localhost:27017/tastetrail
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
```

3. Start the development server:
```bash
npm run dev
```

## Features

### Completed
- **Authentication**: JWT-based authentication with role-based access
- **User Management**: User registration, login, and profile management
- **Recipe Management**: CRUD operations for recipes
- **Category Management**: CRUD operations for categories
- **Review System**: User reviews with admin approval
- **Meal Planning**: Weekly meal planning with status tracking
- **Recommendation Engine**: Personalized recipe recommendations
- **Smart Grocery List**: Auto-generated lists from meal plans

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/favorites` - Add recipe to favorites
- `DELETE /api/auth/favorites/:id` - Remove recipe from favorites

#### Recipes
- `GET /api/recipes` - Get all recipes (with filtering)
- `GET /api/recipes/:id` - Get recipe by ID
- `POST /api/recipes` - Create new recipe (admin only)
- `PUT /api/recipes/:id` - Update recipe (admin only)
- `DELETE /api/recipes/:id` - Delete recipe (admin only)
- `GET /api/recipes/featured` - Get featured recipes
- `GET /api/recipes/top` - Get top rated recipes
- `GET /api/recipes/category/:category` - Get recipes by category
- `GET /api/recipes/cuisine/:cuisine` - Get recipes by cuisine
- `GET /api/recipes/search/ingredients` - Search recipes by ingredients

#### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create new category (admin only)
- `PUT /api/categories/:id` - Update category (admin only)
- `DELETE /api/categories/:id` - Delete category (admin only)

#### Reviews
- `GET /api/reviews/recipe/:id` - Get reviews for a recipe
- `POST /api/reviews` - Create a review
- `PUT /api/reviews/:id` - Update a review
- `DELETE /api/reviews/:id` - Delete a review
- `GET /api/reviews` - Get all reviews (admin only)
- `PUT /api/reviews/:id/approve` - Approve a review (admin only)
- `POST /api/reviews/:id/helpful` - Mark review as helpful
- `POST /api/reviews/:id/not-helpful` - Mark review as not helpful

#### Meal Plans
- `GET /api/meal-plans` - Get user's meal plans
- `GET /api/meal-plans/:id` - Get meal plan by ID
- `POST /api/meal-plans` - Create a meal plan
- `PUT /api/meal-plans/:id` - Update a meal plan
- `DELETE /api/meal-plans/:id` - Delete a meal plan
- `PUT /api/meal-plans/:id/cook` - Mark meal as cooked
- `GET /api/meal-plans/week/:week` - Get weekly meal plans
- `GET /api/meal-plans/stats` - Get meal plan statistics

#### Recommendations
- `GET /api/recommendations` - Get personalized recommendations
- `GET /api/recommendations/trending` - Get trending recipes
- `GET /api/recommendations/random` - Get random recipes
- `GET /api/recommendations/category/:category` - Get recommendations by category
- `GET /api/recommendations/cuisine/:cuisine` - Get recommendations by cuisine

#### Grocery Lists
- `GET /api/grocery-lists` - Get all user's grocery lists
- `GET /api/grocery-lists/:week` - Get grocery list for a week
- `POST /api/grocery-lists/generate` - Generate grocery list from meal plans
- `POST /api/grocery-lists/:week/items` - Add custom item to grocery list
- `PUT /api/grocery-lists/:week/items/:itemId` - Update grocery item
- `DELETE /api/grocery-lists/:week/items/:itemId` - Remove grocery item

## Deployment

### Render Deployment

1. Push your code to a GitHub repository
2. Create a new web service on Render
3. Connect your GitHub repository
4. Set environment variables in Render dashboard:
   - `MONGODB_URI` (your MongoDB connection string)
   - `JWT_SECRET` (your JWT secret)
   - `JWT_EXPIRE` (7d)
   - `PORT` (5000)
   - `NODE_ENV` (production)
5. Deploy!

## Environment Variables

Create a `.env` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/tastetrail
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
```

## Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Bcrypt.js
- Multer
- Cloudinary
// User management feature
// Recipe management enhancement
// Category management system
// Review moderation system
// Admin dashboard analytics
// Security enhancements
// API documentation
// Performance optimizations
// Database schema improvements
// Error handling improvements
// Testing framework setup
