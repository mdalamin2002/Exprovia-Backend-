const express = require('express');
const router = express.Router();
const {
  getRecipeReviews,
  createReview,
  updateReview,
  deleteReview,
  getAllReviews,
  approveReview,
  markHelpful,
  markNotHelpful,
} = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/auth');

// Public routes
router.get('/recipe/:id', getRecipeReviews);

// Protected user routes
router.route('/').post(protect, createReview);
router.route('/:id')
  .put(protect, updateReview)
  .delete(protect, admin, deleteReview);  // Delete works for both user and admin

// Admin routes
router.get('/', protect, admin, getAllReviews);
router.put('/:id/approve', protect, admin, approveReview);

// User interaction routes
router.post('/:id/helpful', protect, markHelpful);
router.post('/:id/not-helpful', protect, markNotHelpful);

module.exports = router;