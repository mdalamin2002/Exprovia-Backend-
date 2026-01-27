const Review = require('../models/Review');
const Recipe = require('../models/Recipe');
const asyncHandler = require('express-async-handler');

// @desc    Get reviews for a recipe
// @route   GET /api/reviews/recipe/:id
// @access  Public
const getRecipeReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ 
    recipe: req.params.id, 
    approved: true 
  }).populate('user', 'name profilePhoto');

  res.json(reviews);
});

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
  const { rating, comment, recipeId } = req.body;

  const recipe = await Recipe.findById(recipeId);

  if (recipe) {
    const alreadyReviewed = await Review.findOne({
      user: req.user._id,
      recipe: recipeId,
    });

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Recipe already reviewed');
    }

    const review = await Review.create({
      rating: Number(rating),
      comment,
      user: req.user._id,
      recipe: recipeId,
    });

    // Update recipe ratings
    await recipe.calculateAverageRating();

    res.status(201).json(review);
  } else {
    res.status(404);
    throw new Error('Recipe not found');
  }
});

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const review = await Review.findById(req.params.id);

  if (review) {
    if (review.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized');
    }

    review.rating = rating;
    review.comment = comment;

    const updatedReview = await review.save();

    // Update recipe ratings
    const recipe = await Recipe.findById(review.recipe);
    if (recipe) {
      await recipe.calculateAverageRating();
    }

    res.json(updatedReview);
  } else {
    res.status(404);
    throw new Error('Review not found');
  }
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (review) {
    await Review.deleteOne({ _id: req.params.id });

    // Update recipe ratings
    const recipe = await Recipe.findById(review.recipe);
    if (recipe) {
      await recipe.calculateAverageRating();
    }

    res.json({ message: 'Review removed' });
  } else {
    res.status(404);
    throw new Error('Review not found');
  }
});

// @desc    Get all reviews (admin)
// @route   GET /api/reviews
// @access  Private/Admin
const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({}).populate('user', 'name email').populate('recipe', 'name');
  res.json(reviews);
});

// @desc    Approve a review
// @route   PUT /api/reviews/:id/approve
// @access  Private/Admin
const approveReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (review) {
    review.approved = true;
    const updatedReview = await review.save();
    res.json(updatedReview);
  } else {
    res.status(404);
    throw new Error('Review not found');
  }
});

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
// @access  Private
const markHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (review) {
    if (!review.helpful.includes(req.user._id)) {
      review.helpful.push(req.user._id);
      await review.save();
    }
    res.json({ helpful: review.helpful.length });
  } else {
    res.status(404);
    throw new Error('Review not found');
  }
});

// @desc    Mark review as not helpful
// @route   POST /api/reviews/:id/not-helpful
// @access  Private
const markNotHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (review) {
    if (!review.notHelpful.includes(req.user._id)) {
      review.notHelpful.push(req.user._id);
      await review.save();
    }
    res.json({ notHelpful: review.notHelpful.length });
  } else {
    res.status(404);
    throw new Error('Review not found');
  }
});

module.exports = {
  getRecipeReviews,
  createReview,
  updateReview,
  deleteReview,
  getAllReviews,
  approveReview,
  markHelpful,
  markNotHelpful,
};