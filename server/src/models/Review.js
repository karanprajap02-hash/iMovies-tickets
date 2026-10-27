const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie ID is required'],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating between 1 and 10'],
      min: 1,
      max: 10,
    },
    comment: {
      type: String,
      required: [true, 'Please provide review text'],
      maxlength: [1000, 'Review cannot exceed 1000 characters'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate review per user for same movie
reviewSchema.index({ movieId: 1, userId: 1 }, { unique: true });

// Static method to recalculate average rating on Movie
reviewSchema.statics.calculateAverageRating = async function (movieId) {
  try {
    const stats = await this.aggregate([
      { $match: { movieId: new mongoose.Types.ObjectId(movieId) } },
      {
        $group: {
          _id: '$movieId',
          avgRating: { $avg: '$rating' },
          numReviews: { $sum: 1 },
        },
      },
    ]);

    const Movie = mongoose.model('Movie');
    if (stats.length > 0) {
      await Movie.findByIdAndUpdate(movieId, {
        rating: Math.round(stats[0].avgRating * 10) / 10,
      });
    }
  } catch (err) {
    console.error('Error updating movie rating:', err);
  }
};

reviewSchema.post('save', async function () {
  await this.constructor.calculateAverageRating(this.movieId);
});

reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.calculateAverageRating(doc.movieId);
  }
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;

