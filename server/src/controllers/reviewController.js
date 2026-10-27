const Review = require('../models/Review');
const Movie = require('../models/Movie');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all reviews for a movie
// @route   GET /api/movies/:id/reviews
// @access  Public
const getMovieReviews = asyncHandler(async (req, res) => {
  const movieId = req.params.id;

  const reviews = await Review.find({ movieId })
    .populate('userId', 'name email')
    .sort({ createdAt: -1 });

  const count = reviews.length;
  const avgRating = count > 0
    ? (reviews.reduce((acc, item) => acc + item.rating, 0) / count).toFixed(1)
    : 0;

  res.status(200).json({
    success: true,
    count,
    avgRating: Number(avgRating),
    data: reviews,
  });
});

// @desc    Add or update review for a movie
// @route   POST /api/movies/:id/reviews
// @access  Private
const addMovieReview = asyncHandler(async (req, res) => {
  const movieId = req.params.id;
  const { rating, comment } = req.body;
  const userId = req.user._id;
  const userName = req.user.name || 'Anonymous Moviegoer';

  if (!rating || rating < 1 || rating > 10) {
    return res.status(400).json({
      success: false,
      message: 'Rating must be a valid number between 1 and 10',
    });
  }

  if (!comment || comment.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide review comments',
    });
  }

  const movie = await Movie.findById(movieId);
  if (!movie) {
    return res.status(404).json({
      success: false,
      message: 'Movie not found',
    });
  }

  let review = await Review.findOne({ movieId, userId });

  if (review) {
    review.rating = Number(rating);
    review.comment = comment.trim();
    review.userName = userName;
    await review.save();

    return res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: review,
    });
  }

  review = await Review.create({
    movieId,
    userId,
    userName,
    rating: Number(rating),
    comment: comment.trim(),
  });

  res.status(201).json({
    success: true,
    message: 'Review submitted successfully',
    data: review,
  });
});

// @desc    Delete a review
// @route   DELETE /api/movies/:id/reviews/:reviewId
// @access  Private
const deleteMovieReview = asyncHandler(async (req, res) => {
  const { id: movieId, reviewId } = req.params;

  const review = await Review.findById(reviewId);
  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found',
    });
  }

  // Ensure caller is review owner or admin
  if (review.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this review',
    });
  }

  await Review.findByIdAndDelete(reviewId);

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully',
  });
});

module.exports = {
  getMovieReviews,
  addMovieReview,
  deleteMovieReview,
};

