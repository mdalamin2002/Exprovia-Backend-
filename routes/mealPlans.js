const express = require('express');
const router = express.Router();
const {
  getMealPlans,
  getMealPlanById,
  createMealPlan,
  updateMealPlan,
  deleteMealPlan,
  markAsCooked,
  getWeeklyMealPlans,
  getMealPlanStats,
} = require('../controllers/mealPlanController');
const { protect } = require('../middleware/auth');

// Protected routes
router.route('/').get(protect, getMealPlans).post(protect, createMealPlan);
router.get('/week/:week', protect, getWeeklyMealPlans);
router.get('/stats', protect, getMealPlanStats);
router.route('/:id')
  .get(protect, getMealPlanById)
  .put(protect, updateMealPlan)
  .delete(protect, deleteMealPlan);
router.put('/:id/cook', protect, markAsCooked);

module.exports = router;