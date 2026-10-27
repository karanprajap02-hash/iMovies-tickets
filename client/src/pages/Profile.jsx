import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import { favoriteApi } from '../api/favoriteApi';
import {
  User,
  Mail,
  Lock,
  Shield,
  CheckCircle,
  AlertCircle,
  Heart,
  Ticket,
  Star,
  Trash2,
  Clock,
  Film,
} from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'watchlist' ? 'watchlist' : 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Watchlist State
  const [favorites, setFavorites] = useState([]);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'watchlist') setActiveTab('watchlist');
    else if (tab === 'profile') setActiveTab('profile');
  }, [searchParams]);

  useEffect(() => {
    if (activeTab === 'watchlist') {
      fetchFavorites();
    }
  }, [activeTab]);

  const fetchFavorites = async () => {
    try {
      setFavLoading(true);
      const res = await favoriteApi.getMyFavorites();
      if (res.success) {
        setFavorites(res.data);
      }
    } catch (err) {
      console.error('Failed to load favorites:', err);
    } finally {
      setFavLoading(false);
    }
  };

  const handleRemoveFavorite = async (movieId) => {
    try {
      await favoriteApi.removeFavorite(movieId);
      setFavorites((prev) => prev.filter((f) => f.movieId?._id !== movieId));
    } catch (err) {
      console.error('Failed to remove favorite:', err);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (password && password.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    if (password && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const payload = { name };
      if (password) payload.password = password;

      const res = await authApi.updateProfile(payload);
      if (res.success && res.data) {
        updateUser(res.data);
        setSuccess('Profile updated successfully!');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  return (
    <div className="profile-page py-5">
      <div className="container" style={{ maxWidth: 880 }}>
        {/* User Header Profile Badge */}
        <div className="glass-panel p-4 mb-4 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center p-3 rounded-circle text-white"
              style={{
                width: 60,
                height: 60,
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)',
              }}
            >
              <User size={30} />
            </div>
            <div>
              <h3 className="text-white fw-bold mb-1">{user?.name}</h3>
              <div className="d-flex align-items-center gap-2 text-secondary small">
                <span>{user?.email}</span>
                <span
                  className="badge text-uppercase"
                  style={{
                    background:
                      user?.role === 'admin'
                        ? 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)'
                        : 'rgba(139, 92, 246, 0.2)',
                    color: user?.role === 'admin' ? '#081726' : '#c4b5fd',
                    fontWeight: 700,
                    fontSize: '0.65rem',
                  }}
                >
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          {/* Tab buttons */}
          <div
            className="btn-group p-1 rounded-pill"
            style={{
              background: 'rgba(22, 26, 41, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <button
              className={`btn btn-sm rounded-pill px-3 transition ${
                activeTab === 'profile' ? 'btn-cinema fw-bold text-white' : 'text-secondary hover-white'
              }`}
              onClick={() => switchTab('profile')}
            >
              Profile Settings
            </button>
            <button
              className={`btn btn-sm rounded-pill px-3 transition d-flex align-items-center gap-1 ${
                activeTab === 'watchlist' ? 'btn-cinema fw-bold text-white' : 'text-secondary hover-white'
              }`}
              onClick={() => switchTab('watchlist')}
            >
              <Heart size={14} color="#ec4899" />
              Watchlist {favorites.length > 0 && `(${favorites.length})`}
            </button>
          </div>
        </div>

        {/* Tab 1: Profile Settings */}
        {activeTab === 'profile' && (
          <div
            className="glass-panel p-4 p-md-5"
            style={{
              border: '1px solid rgba(139, 92, 246, 0.25)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(139, 92, 246, 0.15)',
            }}
          >
            <h5 className="text-white fw-bold mb-4">Edit Personal Information</h5>

            {success && (
              <div className="alert alert-success d-flex align-items-center gap-2 mb-3 small">
                <CheckCircle size={16} />
                <span>{success}</span>
              </div>
            )}

            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 mb-3 small">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleUpdate}>
              <div className="mb-3">
                <label className="form-label text-secondary small">Full Name</label>
                <input
                  type="text"
                  className="form-control form-control-cinema"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-secondary small">Email Address (Read-only)</label>
                <input
                  type="email"
                  className="form-control form-control-cinema opacity-50"
                  value={user?.email || ''}
                  disabled
                />
              </div>

              <hr className="border-secondary opacity-20 my-4" />
              <h6 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
                <Lock size={16} color="var(--cinema-cyan)" /> Change Password (Optional)
              </h6>

              <div className="mb-3">
                <label className="form-label text-secondary small">New Password</label>
                <input
                  type="password"
                  className="form-control form-control-cinema"
                  placeholder="Leave blank to keep current password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="form-label text-secondary small">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control form-control-cinema"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-cinema w-100 py-3"
              >
                {loading ? 'Saving Changes...' : 'Update Profile'}
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Watchlist & Favorites (ER Diagram Entity) */}
        {activeTab === 'watchlist' && (
          <div className="glass-panel p-4 p-md-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 className="text-white fw-bold m-0 d-flex align-items-center gap-2">
                  <Heart size={20} color="#ec4899" fill="#ec4899" />
                  My Watchlist & Favorites
                </h5>
                <p className="text-secondary small m-0">
                  Movies you've saved to watch or book later.
                </p>
              </div>
            </div>

            {favLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-danger" role="status"></div>
              </div>
            ) : favorites.length === 0 ? (
              <div className="text-center py-5 text-secondary">
                <Film size={44} className="mb-2 opacity-40" />
                <h6 className="text-white">Your watchlist is empty</h6>
                <p className="small mb-3">Explore movies and tap the heart icon to save titles here.</p>
                <Link to="/movies" className="btn btn-cinema btn-sm px-4">
                  Explore Movies
                </Link>
              </div>
            ) : (
              <div className="row g-3">
                {favorites.map((fav) => {
                  const m = fav.movieId;
                  if (!m) return null;
                  return (
                    <div key={fav._id} className="col-md-6">
                      <div
                        className="p-3 rounded-3 d-flex gap-3 align-items-center"
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(139, 92, 246, 0.2)',
                        }}
                      >
                        <img
                          src={m.posterUrl}
                          alt={m.title}
                          className="rounded-2 shadow-sm"
                          style={{ width: 65, height: 95, objectFit: 'cover' }}
                        />
                        <div className="flex-grow-1 overflow-hidden">
                          <h6 className="text-white fw-bold mb-1 text-truncate" title={m.title}>
                            {m.title}
                          </h6>
                          <div className="d-flex align-items-center gap-2 text-secondary small mb-1">
                            <span className="d-flex align-items-center gap-1 text-warning fw-semibold">
                              <Star size={13} fill="var(--cinema-gold)" color="var(--cinema-gold)" />
                              {m.rating ? m.rating.toFixed(1) : 'N/A'}
                            </span>
                            <span>&bull;</span>
                            <span>{m.durationMin}m</span>
                            <span>&bull;</span>
                            <span className="badge bg-secondary bg-opacity-25 text-light" style={{ fontSize: '0.65rem' }}>
                              {m.status === 'now_showing' ? 'Now Showing' : 'Coming Soon'}
                            </span>
                          </div>
                          <p className="text-secondary small mb-2 text-truncate">{m.genres?.join(', ')}</p>

                          <div className="d-flex gap-2">
                            <Link
                              to={`/movies/${m._id}`}
                              className="btn btn-cinema btn-sm py-1 px-3 d-flex align-items-center gap-1"
                              style={{ fontSize: '0.78rem' }}
                            >
                              <Ticket size={13} /> Book Show
                            </Link>
                            <button
                              onClick={() => handleRemoveFavorite(m._id)}
                              className="btn btn-outline-danger btn-sm py-1 px-2 d-flex align-items-center"
                              title="Remove from watchlist"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
