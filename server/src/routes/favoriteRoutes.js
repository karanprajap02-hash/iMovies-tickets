const express = require('express');
const router = express.Router();
const {
  getMyFavorites,
  toggleFavorite,
  checkFavorite,
  removeFavorite,
} = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getMyFavorites);
router.post('/toggle/:movieId', protect, toggleFavorite);
router.get('/check/:movieId', protect, checkFavorite);
router.delete('/:movieId', protect, removeFavorite);

module.exports = router;

