import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Clock, Globe, Ticket, Eye, Heart } from 'lucide-react';
import { favoriteApi } from '../api/favoriteApi';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const MovieCard = ({ movie, isFavoriteInitial = false, onFavoriteChange }) => {
  const isComingSoon = movie.status === 'coming_soon';
  const { isAuthenticated } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const [isFav, setIsFav] = useState(isFavoriteInitial);
  const [favLoading, setFavLoading] = useState(false);

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setFavLoading(true);
      const res = await favoriteApi.toggleFavorite(movie._id);
      if (res.success) {
        setIsFav(res.isFavorite);
        addNotification(
          res.isFavorite ? 'Watchlist Updated' : 'Removed from Watchlist',
          `"${movie.title}" has been ${res.isFavorite ? 'added to' : 'removed from'} your watchlist.`,
          'info'
        );
        if (onFavoriteChange) {
          onFavoriteChange(movie._id, res.isFavorite);
        }
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    } finally {
      setFavLoading(false);
    }
  };

  return (
    <div className="movie-card h-100 d-flex flex-column position-relative">
      <Link to={`/movies/${movie._id}`} className="text-decoration-none">
        <div className="movie-poster-container position-relative">
          <img
            src={movie.posterUrl}
            alt={movie.title}
            loading="lazy"
            onError={(e) => {
              e.target.src =
                'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop';
            }}
          />

          {/* Quick Favorite Button */}
          <button
            onClick={handleToggleFavorite}
            disabled={favLoading}
            className="btn btn-sm position-absolute top-0 end-0 m-2 p-2 rounded-circle border-0 d-flex align-items-center justify-content-center transition shadow"
            style={{
              background: isFav ? 'rgba(236, 72, 153, 0.9)' : 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(8px)',
              zIndex: 3,
              width: 32,
              height: 32,
            }}
            title={isFav ? 'Remove from Watchlist' : 'Add to Watchlist'}
          >
            <Heart
              size={16}
              fill={isFav ? '#ffffff' : 'none'}
              color={isFav ? '#ffffff' : '#f472b6'}
            />
          </button>

          {movie.rating > 0 && (
            <div className="rating-badge">
              <Star size={14} fill="var(--cinema-amber)" color="var(--cinema-amber)" />
              <span>{movie.rating.toFixed(1)}</span>
            </div>
          )}
          {isComingSoon && (
            <div
              className="position-absolute bottom-0 start-0 m-3 px-3 py-1 rounded-pill small fw-bold"
              style={{
                background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
                color: '#0a0c14',
                fontSize: '0.72rem',
                boxShadow: '0 4px 12px rgba(251, 191, 36, 0.4)',
              }}
            >
              COMING SOON
            </div>
          )}
        </div>
      </Link>

      <div className="p-3 d-flex flex-column flex-grow-1 justify-content-between">
        <div>
          <Link to={`/movies/${movie._id}`} className="text-decoration-none">
            <h5
              className="card-title text-white mb-2 text-truncate"
              title={movie.title}
              style={{ fontSize: '1.05rem', fontWeight: 700 }}
            >
              {movie.title}
            </h5>
          </Link>

          <div className="d-flex align-items-center gap-3 text-secondary small mb-2">
            <span className="d-flex align-items-center gap-1">
              <Clock size={13} color="var(--cinema-cyan)" /> {movie.durationMin}m
            </span>
            <span className="d-flex align-items-center gap-1">
              <Globe size={13} color="var(--cinema-violet)" /> {movie.language}
            </span>
          </div>

          <div className="d-flex flex-wrap gap-1 mb-3">
            {movie.genres?.slice(0, 3).map((genre, idx) => (
              <span
                key={idx}
                className="genre-badge"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>

        <div>
          <Link
            to={`/movies/${movie._id}`}
            className={`btn w-100 py-2 d-flex align-items-center justify-content-center gap-2 ${
              isComingSoon ? 'btn-cinema-outline' : 'btn-cinema'
            }`}
            style={{ fontSize: '0.9rem' }}
          >
            {isComingSoon ? (
              <>
                <Eye size={15} /> View Details
              </>
            ) : (
              <>
                <Ticket size={15} /> Book Tickets
              </>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
