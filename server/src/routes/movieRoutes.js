const express = require('express');
const router = express.Router();
const {
  getMovies,
  getMovieById,
  getMovieShows,
  createMovie,
  updateMovie,
  deleteMovie,
} = require('../controllers/movieController');
const {
  getMovieReviews,
  addMovieReview,
  deleteMovieReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.route('/')
  .get(getMovies)
  .post(protect, authorize('admin'), createMovie);

router.route('/:id')
  .get(getMovieById)
  .put(protect, authorize('admin'), updateMovie)
  .delete(protect, authorize('admin'), deleteMovie);

router.get('/:id/shows', getMovieShows);

// Movie Review & Rating routes (Step 13)
router.route('/:id/reviews')
  .get(getMovieReviews)
  .post(protect, addMovieReview);

router.delete('/:id/reviews/:reviewId', protect, deleteMovieReview);

module.exports = router;
