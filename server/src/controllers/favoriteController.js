const Favorite = require('../models/Favorite');
const Movie = require('../models/Movie');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get user favorites / watchlist
// @route   GET /api/favorites
// @access  Private
const getMyFavorites = asyncHandler(async (req, res) => {
  const favorites = await Favorite.find({ userId: req.user._id })
    .populate('movieId')
    .sort({ createdAt: -1 });

  // Filter out any where movieId may have been deleted
  const validFavorites = favorites.filter((fav) => fav.movieId);

  res.status(200).json({
    success: true,
    count: validFavorites.length,
    data: validFavorites,
  });
});

// @desc    Toggle favorite on a movie
// @route   POST /api/favorites/toggle/:movieId
// @access  Private
const toggleFavorite = asyncHandler(async (req, res) => {
  const { movieId } = req.params;
  const userId = req.user._id;

  const movie = await Movie.findById(movieId);
  if (!movie) {
    return res.status(404).json({ success: false, message: 'Movie not found' });
  }

  const existing = await Favorite.findOne({ userId, movieId });

  if (existing) {
    await Favorite.findByIdAndDelete(existing._id);
    return res.status(200).json({
      success: true,
      isFavorite: false,
      message: 'Movie removed from your watchlist.',
    });
  }

  await Favorite.create({ userId, movieId });
  res.status(201).json({
    success: true,
    isFavorite: true,
    message: 'Movie added to your watchlist!',
  });
});

// @desc    Check if a movie is favorited by current user
// @route   GET /api/favorites/check/:movieId
// @access  Private
const checkFavorite = asyncHandler(async (req, res) => {
  const { movieId } = req.params;
  const userId = req.user._id;

  const existing = await Favorite.findOne({ userId, movieId });

  res.status(200).json({
    success: true,
    isFavorite: !!existing,
  });
});

// @desc    Remove favorite by movie ID
// @route   DELETE /api/favorites/:movieId
// @access  Private
const removeFavorite = asyncHandler(async (req, res) => {
  const { movieId } = req.params;
  const userId = req.user._id;

  await Favorite.findOneAndDelete({ userId, movieId });

  res.status(200).json({
    success: true,
    message: 'Movie removed from your watchlist.',
  });
});

module.exports = {
  getMyFavorites,
  toggleFavorite,
  checkFavorite,
  removeFavorite,
};

