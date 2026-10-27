import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { movieApi } from '../api/movieApi';
import MovieCard from '../components/MovieCard';
import { Search, Film, Calendar, Sparkles, Flame, Play, ArrowRight, ShieldCheck, Ticket, Zap } from 'lucide-react';

const Home = () => {
  const [nowShowing, setNowShowing] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const navigate = useNavigate();

  const genres = ['All', 'Action', 'Sci-Fi', 'Drama', 'Adventure', 'Animation', 'Thriller'];

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const [showingRes, comingRes] = await Promise.all([
          movieApi.getMovies({ status: 'now_showing', limit: 8 }),
          movieApi.getMovies({ status: 'coming_soon', limit: 4 }),
        ]);

        if (showingRes.success) setNowShowing(showingRes.data);
        if (comingRes.success) setComingSoon(comingRes.data);
      } catch (err) {
        console.error('Error fetching home movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movies?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const filteredShowing = selectedGenre === 'All'
    ? nowShowing
    : nowShowing.filter((m) => m.genres?.includes(selectedGenre));

  // Spotlight movie for hero banner
  const spotlightMovie = nowShowing[0] || null;

  return (
    <div className="home-page pb-5">
      {/* Hero Premiere Banner */}
      {spotlightMovie && (
        <section
          className="hero-banner position-relative overflow-hidden mb-5"
          style={{
            minHeight: '78vh',
            backgroundImage: `linear-gradient(to right, #0a0c14 20%, rgba(10, 12, 20, 0.85) 60%, rgba(10, 12, 20, 0.45) 100%), radial-gradient(circle at 75% 20%, rgba(139, 92, 246, 0.25) 0%, transparent 60%), url(${spotlightMovie.posterUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div className="container py-5 my-auto position-relative" style={{ zIndex: 2 }}>
            <div className="row">
              <div className="col-lg-7 col-md-9">
                <div
                  className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-3 fw-bold small"
                  style={{
                    background: 'rgba(139, 92, 246, 0.18)',
                    border: '1px solid rgba(139, 92, 246, 0.45)',
                    color: '#c4b5fd',
                    boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)',
                  }}
                >
                  <Flame size={16} color="var(--cinema-cyan)" /> NOW TRENDING PREMIERE
                </div>

                <h1
                  className="display-4 fw-black text-white mb-3"
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 800,
                    lineHeight: 1.15,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {spotlightMovie.title}
                </h1>

                <p className="lead text-light opacity-80 mb-4" style={{ fontSize: '1.1rem', maxWidth: 620, lineHeight: 1.6 }}>
                  {spotlightMovie.description}
                </p>

                <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
                  <span
                    className="badge d-flex align-items-center gap-1 px-3 py-2 fw-bold"
                    style={{
                      background: 'rgba(245, 158, 11, 0.15)',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      color: 'var(--cinema-amber)',
                    }}
                  >
                    ★ {spotlightMovie.rating.toFixed(1)} / 10
                  </span>
                  <span className="text-secondary">&bull;</span>
                  <span className="text-light">{spotlightMovie.durationMin} mins</span>
                  <span className="text-secondary">&bull;</span>
                  <span className="text-light">{spotlightMovie.language}</span>
                  <span className="text-secondary">&bull;</span>
                  <span className="text-light">{spotlightMovie.genres?.join(', ')}</span>
                </div>

                <div className="d-flex flex-wrap gap-3">
                  <Link
                    to={`/movies/${spotlightMovie._id}`}
                    className="btn btn-cinema btn-lg px-4 py-3"
                  >
                    <Ticket size={20} /> Book Tickets Now
                  </Link>
                  {spotlightMovie.trailerUrl && (
                    <a
                      href={spotlightMovie.trailerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-cinema-outline btn-lg px-4 py-3"
                    >
                      <Play size={18} fill="#ffffff" /> Watch Trailer
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Search & Genre Filter Bar */}
      <div className="container mb-5">
        <div className="glass-panel p-4">
          <div className="row g-3 align-items-center">
            {/* Search input */}
            <div className="col-lg-6">
              <form onSubmit={handleSearchSubmit} className="position-relative">
                <Search
                  size={18}
                  className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
                />
                <input
                  type="text"
                  className="form-control form-control-cinema ps-5"
                  placeholder="Search movies, actors, genres..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>

            {/* Quick Genre Chips */}
            <div className="col-lg-6">
              <div className="d-flex gap-2 overflow-x-auto pb-1 align-items-center">
                {genres.map((genre) => {
                  const isSelected = selectedGenre === genre;
                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => setSelectedGenre(genre)}
                      className={`btn btn-sm text-nowrap rounded-pill px-3 py-2 transition ${
                        isSelected
                          ? 'btn-cinema fw-bold text-white'
                          : 'btn-cinema-outline text-secondary'
                      }`}
                      style={{
                        fontSize: '0.85rem',
                        ...(isSelected
                          ? { boxShadow: '0 0 16px rgba(139, 92, 246, 0.45)' }
                          : {}),
                      }}
                    >
                      {genre}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Now Showing Section */}
      <section className="container mb-5">
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <div
              className="d-flex align-items-center gap-2 fw-bold small text-uppercase tracking-wider mb-1"
              style={{ color: 'var(--cinema-cyan)' }}
            >
              <Sparkles size={16} /> Currently in Cinemas
            </div>
            <h2 className="text-white fw-bold m-0">Now Showing</h2>
          </div>
          <Link
            to="/movies?status=now_showing"
            className="text-secondary text-decoration-none d-flex align-items-center gap-1 hover-white transition"
          >
            <span>View All</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: 'var(--cinema-violet)' }} role="status"></div>
          </div>
        ) : filteredShowing.length === 0 ? (
          <div className="glass-panel p-5 text-center text-secondary">
            No movies found for the selected category.
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
            {filteredShowing.map((movie) => (
              <div key={movie._id} className="col">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Coming Soon Section */}
      {comingSoon.length > 0 && (
        <section className="container mb-5">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <div className="d-flex align-items-center gap-2 text-warning fw-bold small text-uppercase tracking-wider mb-1">
                <Calendar size={16} /> Mark Your Calendar
              </div>
              <h2 className="text-white fw-bold m-0">Coming Soon</h2>
            </div>
            <Link
              to="/movies?status=coming_soon"
              className="text-secondary text-decoration-none d-flex align-items-center gap-1 hover-white transition"
            >
              <span>View All</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
            {comingSoon.map((movie) => (
              <div key={movie._id} className="col">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Why Choose IMovies Perks */}
      <section className="container">
        <div className="glass-panel p-4 p-md-5">
          <div className="row g-4 text-center">
            <div className="col-md-4">
              <div
                className="d-inline-flex p-3 rounded-circle mb-3"
                style={{
                  background: 'rgba(139, 92, 246, 0.15)',
                  color: 'var(--cinema-violet)',
                  boxShadow: '0 0 20px rgba(139, 92, 246, 0.25)',
                }}
              >
                <Ticket size={28} />
              </div>
              <h5 className="text-white fw-bold mb-2">Atomic Seat Locking</h5>
              <p className="text-secondary small mb-0">
                Guaranteed zero double-bookings. Reserve your favorite seats instantly with an exclusive 5-minute hold.
              </p>
            </div>
            <div className="col-md-4">
              <div
                className="d-inline-flex p-3 rounded-circle mb-3"
                style={{
                  background: 'rgba(6, 182, 212, 0.15)',
                  color: 'var(--cinema-cyan)',
                  boxShadow: '0 0 20px rgba(6, 182, 212, 0.25)',
                }}
              >
                <Zap size={28} />
              </div>
              <h5 className="text-white fw-bold mb-2">Instant QR E-Tickets</h5>
              <p className="text-secondary small mb-0">
                Paperless direct entry. Access your digital ticket and turnstile QR barcode anywhere from your account.
              </p>
            </div>
            <div className="col-md-4">
              <div
                className="d-inline-flex p-3 rounded-circle mb-3"
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.25)',
                }}
              >
                <ShieldCheck size={28} />
              </div>
              <h5 className="text-white fw-bold mb-2">Flexible Cancellation</h5>
              <p className="text-secondary small mb-0">
                Plans changed? Cancel up to 2 hours before showtime for an instant full refund back to your account.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
