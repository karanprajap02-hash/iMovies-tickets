import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { movieApi } from '../api/movieApi';
import { reviewApi } from '../api/reviewApi';
import { favoriteApi } from '../api/favoriteApi';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  Star,
  Clock,
  Globe,
  Calendar,
  MapPin,
  Play,
  Ticket,
  ChevronRight,
  Info,
  Tv,
  Sparkles,
  Heart,
  MessageSquare,
  Send,
  Trash2,
  Award,
} from 'lucide-react';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { addNotification } = useNotification();

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedCity, setSelectedCity] = useState('');
  const [trailerOpen, setTrailerOpen] = useState(false);

  // Review submission state
  const [reviewRating, setReviewRating] = useState(9);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  // Generate next 5 dates for the date selector
  const availableDates = Array.from({ length: 5 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() + idx);
    return {
      iso: d.toISOString().split('T')[0],
      dayName: idx === 0 ? 'Today' : idx === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateNum: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
    };
  });

  useEffect(() => {
    const fetchMovieAndShows = async () => {
      try {
        setLoading(true);
        const [movieRes, showsRes, reviewsRes] = await Promise.all([
          movieApi.getMovieById(id),
          movieApi.getMovieShows(id, { date: selectedDate, city: selectedCity }),
          reviewApi.getMovieReviews(id).catch(() => ({ success: false, data: [] })),
        ]);

        if (movieRes.success) setMovie(movieRes.data);
        if (showsRes.success) setShows(showsRes.data);
        if (reviewsRes.success) setReviews(reviewsRes.data || []);

        if (isAuthenticated) {
          try {
            const favRes = await favoriteApi.checkFavorite(id);
            if (favRes.success) setIsFavorite(favRes.isFavorite);
          } catch (e) {
            // ignore
          }
        }
      } catch (err) {
        console.error('Failed to fetch movie details or shows:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieAndShows();
  }, [id, selectedDate, selectedCity, isAuthenticated]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      setFavLoading(true);
      const res = await favoriteApi.toggleFavorite(id);
      if (res.success) {
        setIsFavorite(res.isFavorite);
        addNotification(
          res.isFavorite ? 'Watchlist Updated' : 'Removed from Watchlist',
          `"${movie.title}" has been ${res.isFavorite ? 'added to' : 'removed from'} your watchlist.`,
          'info'
        );
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    } finally {
      setFavLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!reviewComment.trim()) {
      setReviewError('Please write your review thoughts before submitting.');
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewError('');
      setReviewSuccess('');

      const res = await reviewApi.addMovieReview(id, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      });

      if (res.success) {
        setReviewSuccess('Review published successfully!');
        setReviewComment('');
        addNotification(
          'Review Published',
          `Your review for "${movie.title}" has been shared with fellow moviegoers!`,
          'success'
        );
        // Refresh reviews
        const updated = await reviewApi.getMovieReviews(id);
        if (updated.success) {
          setReviews(updated.data);
          if (movie) {
            setMovie((prev) => ({ ...prev, rating: updated.avgRating }));
          }
        }
      }
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await reviewApi.deleteMovieReview(id, reviewId);
      if (res.success) {
        setReviews((prev) => prev.filter((r) => r._id !== reviewId));
        // Refresh average
        const updated = await reviewApi.getMovieReviews(id);
        if (updated.success && movie) {
          setMovie((prev) => ({ ...prev, rating: updated.avgRating }));
        }
      }
    } catch (err) {
      console.error('Failed to delete review:', err);
    }
  };

  // Group shows by Theatre -> Screen
  const groupedTheatres = shows.reduce((acc, show) => {
    const screen = show.screenId;
    const theatre = screen?.theatreId;
    if (!theatre) return acc;

    const theatreId = theatre._id;
    if (!acc[theatreId]) {
      acc[theatreId] = {
        theatre,
        screens: {},
      };
    }

    const screenId = screen._id;
    if (!acc[theatreId].screens[screenId]) {
      acc[theatreId].screens[screenId] = {
        screen,
        shows: [],
      };
    }

    acc[theatreId].screens[screenId].shows.push(show);
    return acc;
  }, {});

  const theatresList = Object.values(groupedTheatres);

  if (loading && !movie) {
    return (
      <div className="text-center py-5 my-5">
        <div className="spinner-border" style={{ color: 'var(--cinema-violet)' }} role="status"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container py-5 text-center text-secondary">
        <h3 className="text-white">Movie Not Found</h3>
        <Link to="/movies" className="btn btn-cinema mt-3">Back to Movies</Link>
      </div>
    );
  }

  return (
    <div className="movie-details-page pb-5">
      {/* Backdrop Header */}
      <div
        className="position-relative py-5 mb-5"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(10, 12, 20, 0.72) 0%, #0a0c14 96%), radial-gradient(circle at 75% 20%, rgba(139, 92, 246, 0.25) 0%, transparent 60%), url(${movie.posterUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%',
        }}
      >
        <div className="container position-relative pt-4" style={{ zIndex: 2 }}>
          <div className="row g-4 align-items-center">
            {/* Poster Column */}
            <div className="col-md-4 col-lg-3 text-center text-md-start">
              <div
                className="rounded-4 overflow-hidden shadow-lg mx-auto"
                style={{
                  maxWidth: 280,
                  border: '1px solid rgba(139, 92, 246, 0.35)',
                  boxShadow: '0 20px 45px rgba(0, 0, 0, 0.8), 0 0 30px rgba(139, 92, 246, 0.25)',
                }}
              >
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-100 d-block"
                  style={{ aspectRatio: '2/3', objectFit: 'cover' }}
                />
              </div>
            </div>

            {/* Movie Info Column */}
            <div className="col-md-8 col-lg-9">
              <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                <span
                  className="badge px-3 py-1 rounded-pill fw-bold text-uppercase"
                  style={{
                    background: movie.status === 'now_showing'
                      ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)'
                      : 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
                    color: movie.status === 'now_showing' ? '#ffffff' : '#0a0c14',
                    fontSize: '0.75rem',
                  }}
                >
                  {movie.status === 'now_showing' ? 'Now Showing' : 'Coming Soon'}
                </span>
                <span
                  className="genre-badge-cyan fw-bold px-2 py-1"
                  style={{ fontSize: '0.75rem' }}
                >
                  {movie.certification || 'UA 16+'}
                </span>
                {movie.genres?.map((g) => (
                  <span
                    key={g}
                    className="genre-badge px-2 py-1"
                    style={{ fontSize: '0.75rem' }}
                  >
                    {g}
                  </span>
                ))}
              </div>

              <h1
                className="display-5 fw-bold text-white mb-2"
                style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}
              >
                {movie.title}
              </h1>

              <div className="d-flex flex-wrap align-items-center gap-3 text-secondary mb-3">
                {movie.rating > 0 && (
                  <div className="d-flex align-items-center gap-1 fw-bold" style={{ color: 'var(--cinema-amber)' }}>
                    <Star size={18} fill="var(--cinema-amber)" color="var(--cinema-amber)" />
                    <span>{movie.rating.toFixed(1)} / 10</span>
                  </div>
                )}
                <span>&bull;</span>
                <span className="d-flex align-items-center gap-1 text-light">
                  <Clock size={16} color="var(--cinema-cyan)" /> {movie.durationMin} Minutes
                </span>
                <span>&bull;</span>
                <span className="d-flex align-items-center gap-1 text-light">
                  <Globe size={16} color="var(--cinema-violet)" /> {movie.language}
                </span>
                <span>&bull;</span>
                <span className="text-light">
                  {new Date(movie.releaseDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>

              <p className="text-light opacity-80 mb-4" style={{ maxWidth: 720, lineHeight: 1.65 }}>
                {movie.description}
              </p>

              {movie.cast && movie.cast.length > 0 && (
                <div className="mb-4">
                  <span className="text-secondary small fw-bold text-uppercase d-block mb-1">
                    Starring
                  </span>
                  <div className="d-flex flex-wrap gap-2">
                    {movie.cast.map((actor, idx) => (
                      <span
                        key={idx}
                        className="genre-badge rounded-pill py-1 px-3"
                        style={{ fontSize: '0.8rem' }}
                      >
                        {actor}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="d-flex flex-wrap gap-3 align-items-center">
                {movie.trailerUrl && (
                  <button
                    onClick={() => setTrailerOpen(true)}
                    className="btn btn-cinema-outline d-inline-flex align-items-center gap-2"
                  >
                    <Play size={18} fill="#ffffff" /> Watch Official Trailer
                  </button>
                )}

                <button
                  onClick={handleToggleFavorite}
                  disabled={favLoading}
                  className={`btn d-inline-flex align-items-center gap-2 ${
                    isFavorite ? 'btn-danger shadow-sm' : 'btn-cinema-outline'
                  }`}
                  style={{
                    backgroundColor: isFavorite ? '#ec4899' : undefined,
                    borderColor: isFavorite ? '#ec4899' : undefined,
                  }}
                >
                  <Heart
                    size={18}
                    fill={isFavorite ? '#ffffff' : 'none'}
                    color={isFavorite ? '#ffffff' : '#f472b6'}
                  />
                  <span>{isFavorite ? 'In Watchlist' : 'Add to Watchlist'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Modal (if open) */}
      {trailerOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.88)', zIndex: 1050, backdropFilter: 'blur(8px)' }}
          onClick={() => setTrailerOpen(false)}
        >
          <div
            className="glass-panel p-3 w-100"
            style={{ maxWidth: 820, borderColor: 'rgba(139, 92, 246, 0.4)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="text-white m-0 d-flex align-items-center gap-2">
                <Play size={18} color="var(--cinema-cyan)" fill="var(--cinema-cyan)" />
                {movie.title} - Official Trailer
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setTrailerOpen(false)}
              ></button>
            </div>
            <div className="ratio ratio-16x9 rounded-3 overflow-hidden shadow-lg">
              <iframe
                src={
                  movie.trailerUrl.includes('watch?v=')
                    ? movie.trailerUrl.replace('watch?v=', 'embed/')
                    : movie.trailerUrl
                }
                title="Trailer"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* Showtimes & Booking Section */}
      <div className="container">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h3 className="text-white fw-bold m-0 d-flex align-items-center gap-2">
              <Sparkles size={22} color="var(--cinema-cyan)" />
              Select Showtimes
            </h3>
            <p className="text-secondary small m-0">Pick your preferred theatre, screen format, and showtime slot.</p>
          </div>

          {/* City Filter */}
          <div className="d-flex align-items-center gap-2">
            <MapPin size={18} color="var(--cinema-violet)" />
            <select
              className="form-select form-select-cinema"
              style={{ width: 180 }}
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              <option value="">All Cities</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Delhi NCR">Delhi NCR</option>
            </select>
          </div>
        </div>

        {/* Date Selector Pills */}
        <div className="d-flex gap-2 overflow-x-auto pb-3 mb-4">
          {availableDates.map((item) => {
            const isSelected = selectedDate === item.iso;
            return (
              <button
                key={item.iso}
                onClick={() => setSelectedDate(item.iso)}
                className={`btn text-center p-2 px-3 rounded-3 transition ${
                  isSelected
                    ? 'btn-cinema text-white fw-bold'
                    : 'btn-cinema-outline text-secondary'
                }`}
                style={{
                  minWidth: 98,
                  ...(isSelected ? { boxShadow: '0 0 20px rgba(139, 92, 246, 0.45)' } : {}),
                }}
              >
                <div className="small fw-semibold text-uppercase">{item.dayName}</div>
                <div className="fs-5 fw-bold">{item.dateNum}</div>
                <div className="small opacity-75">{item.month}</div>
              </button>
            );
          })}
        </div>

        {/* Grouped Showtimes List */}
        {theatresList.length === 0 ? (
          <div className="glass-panel p-5 text-center text-secondary">
            <Info size={40} className="mb-2 text-warning" />
            <h5 className="text-white">No shows available for the selected date & city.</h5>
            <p className="small mb-0">Try selecting another date or check back later.</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-4">
            {theatresList.map(({ theatre, screens }) => (
              <div key={theatre._id} className="glass-panel p-4">
                <div className="mb-3">
                  <h5 className="text-white fw-bold mb-1">{theatre.name}</h5>
                  <p className="text-secondary small mb-0 d-flex align-items-center gap-1">
                    <MapPin size={14} color="var(--cinema-amber)" />
                    {theatre.address}, {theatre.city}
                  </p>
                </div>

                <hr className="border-secondary opacity-15 my-3" />

                {/* Screens in this Theatre */}
                <div className="d-flex flex-column gap-3">
                  {Object.values(screens).map(({ screen, shows }) => (
                    <div key={screen._id} className="row g-2 align-items-center">
                      <div className="col-md-3">
                        <span className="text-light fw-semibold d-flex align-items-center gap-2">
                          <Tv size={16} color="var(--cinema-cyan)" />
                          {screen.name}
                        </span>
                      </div>

                      <div className="col-md-9">
                        <div className="d-flex flex-wrap gap-2">
                          {shows.map((show) => {
                            const timeStr = new Date(show.startTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            });
                            const minPrice = Math.min(
                              show.prices?.regular || 150,
                              show.prices?.premium || 250,
                              show.prices?.recliner || 400
                            );

                            return (
                              <Link
                                key={show._id}
                                to={`/shows/${show._id}/seats`}
                                className="btn btn-cinema-outline text-decoration-none d-flex flex-column align-items-center py-2 px-3 transition"
                                style={{ minWidth: 105 }}
                              >
                                <span className="text-white fw-bold" style={{ fontSize: '0.95rem' }}>
                                  {timeStr}
                                </span>
                                <span className="small fw-semibold" style={{ fontSize: '0.74rem', color: '#10b981' }}>
                                  from ₹{minPrice}
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Audience Reviews & Ratings Section (Step 13) */}
        <div id="reviews" className="mt-5 pt-3">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
            <div>
              <h3 className="text-white fw-bold m-0 d-flex align-items-center gap-2">
                <MessageSquare size={24} color="var(--cinema-cyan)" />
                Audience Reviews & Ratings
              </h3>
              <p className="text-secondary small m-0">
                Read what fellow cinema lovers think or share your own thoughts.
              </p>
            </div>

            {movie.rating > 0 && (
              <div
                className="d-flex align-items-center gap-2 px-3 py-2 rounded-3"
                style={{
                  background: 'rgba(251, 191, 36, 0.12)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                }}
              >
                <Star size={20} fill="var(--cinema-amber)" color="var(--cinema-amber)" />
                <span className="fs-5 fw-bold text-white">{movie.rating.toFixed(1)}</span>
                <span className="text-secondary small">/ 10 ({reviews.length} reviews)</span>
              </div>
            )}
          </div>

          <div className="row g-4">
            {/* Review Submission Form */}
            <div className="col-lg-5">
              <div className="glass-panel p-4 h-100">
                <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
                  <Award size={18} color="var(--cinema-violet)" />
                  Rate & Write a Review
                </h5>

                {isAuthenticated ? (
                  <form onSubmit={handleSubmitReview}>
                    {reviewSuccess && (
                      <div className="alert alert-success small py-2 mb-3">
                        {reviewSuccess}
                      </div>
                    )}
                    {reviewError && (
                      <div className="alert alert-danger small py-2 mb-3">
                        {reviewError}
                      </div>
                    )}

                    {/* Star Rating Slider / Selector */}
                    <div className="mb-3">
                      <label className="form-label text-secondary small d-flex justify-content-between">
                        <span>Your Rating</span>
                        <strong className="text-warning fs-6">{reviewRating} / 10 Stars</strong>
                      </label>
                      <div className="d-flex align-items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <button
                            type="button"
                            key={num}
                            onClick={() => setReviewRating(num)}
                            className="btn btn-sm p-1 border-0"
                            style={{ background: 'transparent' }}
                            title={`${num}/10`}
                          >
                            <Star
                              size={18}
                              fill={num <= reviewRating ? 'var(--cinema-amber)' : 'none'}
                              color={num <= reviewRating ? 'var(--cinema-amber)' : 'rgba(255, 255, 255, 0.25)'}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label text-secondary small">Your Review</label>
                      <textarea
                        className="form-control form-control-cinema"
                        rows="4"
                        placeholder="What did you think of the directing, acting, soundtrack, or visuals?"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        required
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="btn btn-cinema w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                    >
                      {submittingReview ? (
                        <>
                          <div className="spinner-border spinner-border-sm" role="status"></div>
                          <span>Publishing Review...</span>
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          <span>Publish Review</span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-4 text-secondary">
                    <p className="small mb-3">
                      Have you watched <strong>{movie.title}</strong>? Sign in to share your rating and review.
                    </p>
                    <Link to="/login" className="btn btn-cinema btn-sm px-4">
                      Sign In to Review
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews List */}
            <div className="col-lg-7">
              {reviews.length === 0 ? (
                <div className="glass-panel p-5 text-center text-secondary h-100 d-flex flex-column align-items-center justify-content-center">
                  <MessageSquare size={36} className="text-secondary opacity-50 mb-2" />
                  <h6 className="text-white">No reviews yet</h6>
                  <p className="small mb-0">Be the first to rate and review this movie!</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {reviews.map((r) => {
                    const isOwner = user?._id && (r.userId?._id === user._id || r.userId === user._id);
                    return (
                      <div key={r._id} className="glass-panel p-3 p-md-4">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold small"
                                style={{
                                  width: 32,
                                  height: 32,
                                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                                }}
                              >
                                {(r.userName || r.userId?.name || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <strong className="text-white d-block" style={{ fontSize: '0.92rem' }}>
                                  {r.userName || r.userId?.name || 'Moviegoer'}
                                </strong>
                                <span className="text-secondary" style={{ fontSize: '0.72rem' }}>
                                  {new Date(r.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="d-flex align-items-center gap-2">
                            <span
                              className="badge px-2 py-1 rounded-pill d-flex align-items-center gap-1"
                              style={{
                                background: 'rgba(251, 191, 36, 0.15)',
                                color: 'var(--cinema-amber)',
                                border: '1px solid rgba(251, 191, 36, 0.3)',
                                fontSize: '0.78rem',
                              }}
                            >
                              <Star size={13} fill="var(--cinema-amber)" color="var(--cinema-amber)" />
                              {r.rating}/10
                            </span>

                            {(isOwner || isAdmin) && (
                              <button
                                onClick={() => handleDeleteReview(r._id)}
                                className="btn btn-sm btn-link text-danger p-0 ms-1"
                                title="Delete review"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-light opacity-90 mb-0 ps-md-4 ms-md-2" style={{ fontSize: '0.88rem', lineHeight: 1.5 }}>
                          {r.comment}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
