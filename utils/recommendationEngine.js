// Recommendation Engine Utility Functions

class RecommendationEngine {
  // Calculate similarity between two recipes based on multiple factors
  static calculateRecipeSimilarity(recipe1, recipe2) {
    let similarity = 0;
    
    // Cuisine similarity (40% weight)
    if (recipe1.cuisine === recipe2.cuisine) {
      similarity += 0.4;
    }
    
    // Category similarity (30% weight)
    if (recipe1.category === recipe2.category) {
      similarity += 0.3;
    }
    
    // Difficulty similarity (15% weight)
    if (recipe1.difficulty === recipe2.difficulty) {
      similarity += 0.15;
    }
    
    // Cooking time similarity (15% weight)
    const timeDiff = Math.abs(recipe1.cookingTime - recipe2.cookingTime);
    const maxTime = Math.max(recipe1.cookingTime, recipe2.cookingTime);
    if (maxTime > 0) {
      similarity += (1 - (timeDiff / maxTime)) * 0.15;
    }
    
    return similarity;
  }

  // Find similar recipes to a given recipe
  static findSimilarRecipes(recipe, allRecipes, limit = 10) {
    const similarities = allRecipes
      .filter(r => r._id.toString() !== recipe._id.toString() && r.approved)
      .map(r => ({
        recipe: r,
        similarity: this.calculateRecipeSimilarity(recipe, r)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
    
    return similarities.map(item => item.recipe);
  }

  // Get user preferences based on cooking history
  static getUserPreferences(cookingHistory) {
    if (!cookingHistory || cookingHistory.length === 0) {
      return { cuisines: [], categories: [], preferredTime: 0 };
    }

    const cuisineCount = {};
    const categoryCount = {};
    let totalTime = 0;

    cookingHistory.forEach(entry => {
      if (entry.cuisine) {
        cuisineCount[entry.cuisine] = (cuisineCount[entry.cuisine] || 0) + 1;
      }
      if (entry.category) {
        categoryCount[entry.category] = (categoryCount[entry.category] || 0) + 1;
      }
      // Note: entry doesn't have cookingTime, we'll get it from the recipe
    });

    const cuisines = Object.entries(cuisineCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([cuisine]) => cuisine);

    const categories = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category]) => category);

    return { cuisines, categories };
  }

  // Generate recommendations based on user profile
  static generateRecommendations(user, allRecipes, limit = 18) {
    const { cuisines, categories } = this.getUserPreferences(user.cookingHistory);

    if (cuisines.length === 0 && categories.length === 0) {
      // No history, return popular recipes
      return allRecipes
        .filter(recipe => recipe.approved)
        .sort((a, b) => 
          (b.averageRating + b.cookCount / 100) - (a.averageRating + a.cookCount / 100)
        )
        .slice(0, limit);
    }

    // Score recipes based on user preferences
    const scoredRecipes = allRecipes
      .filter(recipe => recipe.approved)
      .map(recipe => {
        let score = 0;
        
        // Cuisine preference score (50% weight)
        if (cuisines.includes(recipe.cuisine)) {
          const rank = cuisines.indexOf(recipe.cuisine) + 1;
          score += (1 / rank) * 0.5;
        }
        
        // Category preference score (30% weight)
        if (categories.includes(recipe.category)) {
          const rank = categories.indexOf(recipe.category) + 1;
          score += (1 / rank) * 0.3;
        }
        
        // Rating score (20% weight)
        score += (recipe.averageRating / 5) * 0.2;
        
        return { recipe, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scoredRecipes.map(item => item.recipe);
  }

  // Get trending recipes based on cook count and ratings
  static getTrendingRecipes(recipes, limit = 18) {
    return recipes
      .filter(recipe => recipe.approved)
      .sort((a, b) => {
        const scoreA = a.cookCount + (a.averageRating * 10);
        const scoreB = b.cookCount + (b.averageRating * 10);
        return scoreB - scoreA;
      })
      .slice(0, limit);
  }

  // Get seasonal recommendations
  static getSeasonalRecommendations(recipes, season, limit = 18) {
    const seasonalCategories = {
      winter: ['Soup', 'Main Course', 'Dessert'],
      summer: ['Salad', 'Beverage', 'Snack'],
      spring: ['Salad', 'Appetizer', 'Beverage'],
      autumn: ['Soup', 'Main Course', 'Dessert']
    };

    const categories = seasonalCategories[season] || [];
    
    return recipes
      .filter(recipe => 
        recipe.approved && 
        (categories.includes(recipe.category) || 
         recipe.name.toLowerCase().includes(season))
      )
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, limit);
  }
}

module.exports = RecommendationEngine;