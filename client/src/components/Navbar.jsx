import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  Film,
  Ticket,
  User as UserIcon,
  Shield,
  LogOut,
  ChevronDown,
  Compass,
  Bell,
  Heart,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { notifications, unreadCount, markAllRead, clearNotifications } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar navbar-expand-lg glass-nav sticky-top py-3">
      <div className="container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2">
          <div
            className="d-flex align-items-center justify-content-center"
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.55)',
            }}
          >
            <Film size={22} color="#ffffff" />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.65rem',
              fontWeight: 800,
              letterSpacing: '-0.5px',
            }}
          >
            <span style={{ color: '#ffffff' }}>I</span>
            <span
              style={{
                background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 50%, #06b6d4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Movies
            </span>
          </span>
        </Link>

        {/* Mobile toggler */}
        <button
          className="navbar-toggler border-0 p-2"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{
            filter: 'invert(1)',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 8,
          }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar Links */}
        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 gap-lg-1">
            <li className="nav-item">
              <Link
                to="/"
                className={`nav-link px-3 rounded-pill transition ${
                  isActive('/')
                    ? 'text-white fw-bold bg-white bg-opacity-10'
                    : 'text-secondary hover-white'
                }`}
                style={{ fontSize: '0.95rem' }}
              >
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/movies"
                className={`nav-link px-3 rounded-pill transition d-flex align-items-center gap-1 ${
                  isActive('/movies')
                    ? 'text-white fw-bold bg-white bg-opacity-10'
                    : 'text-secondary hover-white'
                }`}
                style={{ fontSize: '0.95rem' }}
              >
                <Compass size={15} /> Explore Movies
              </Link>
            </li>
            {isAdmin && (
              <li className="nav-item">
                <Link
                  to="/admin"
                  className="nav-link px-3 rounded-pill d-flex align-items-center gap-1 transition"
                  style={{
                    color: 'var(--cinema-cyan)',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                  }}
                >
                  <Shield size={16} /> Admin Portal
                </Link>
              </li>
            )}
          </ul>

          {/* User actions */}
          <div className="d-flex align-items-center gap-2 mt-3 mt-lg-0">
            {/* Notification Bell Center (Step 11) */}
            <div className="dropdown">
              <button
                className="btn btn-cinema-outline p-2 position-relative d-flex align-items-center justify-content-center"
                type="button"
                id="notifDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                onClick={markAllRead}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  borderColor: 'rgba(139, 92, 246, 0.3)',
                  background: 'rgba(22, 26, 41, 0.8)',
                }}
                title="Notifications"
              >
                <Bell size={18} color="var(--cinema-cyan)" />
                {unreadCount > 0 && (
                  <span
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                    style={{ fontSize: '0.65rem' }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              <div
                className="dropdown-menu dropdown-menu-end shadow-lg p-3 mt-2"
                aria-labelledby="notifDropdown"
                style={{
                  backgroundColor: 'rgba(22, 26, 41, 0.98)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: 14,
                  width: 320,
                  maxHeight: 380,
                  overflowY: 'auto',
                }}
              >
                <div className="d-flex justify-content-between align-items-center pb-2 mb-2 border-bottom border-secondary border-opacity-25">
                  <span className="fw-bold text-white small">Alerts & Notifications</span>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="btn btn-link btn-sm text-secondary p-0 text-decoration-none"
                      style={{ fontSize: '0.72rem' }}
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <div className="text-center py-3 text-secondary small">
                    No recent notifications
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {notifications.slice(0, 5).map((n) => (
                      <div
                        key={n.id}
                        className="p-2 rounded-3"
                        style={{ background: 'rgba(255, 255, 255, 0.04)' }}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <strong className="text-white" style={{ fontSize: '0.8rem' }}>
                            {n.title}
                          </strong>
                          <span className="text-secondary" style={{ fontSize: '0.65rem' }}>
                            {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-secondary mb-0" style={{ fontSize: '0.75rem', lineHeight: 1.3 }}>
                          {n.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {isAuthenticated ? (
              <div className="dropdown">
                <button
                  className="btn btn-cinema-outline dropdown-toggle d-flex align-items-center gap-2 py-2 px-3"
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{
                    borderColor: 'rgba(139, 92, 246, 0.3)',
                    background: 'rgba(22, 26, 41, 0.8)',
                  }}
                >
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle"
                    style={{
                      width: 26,
                      height: 26,
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                    }}
                  >
                    <UserIcon size={14} color="#ffffff" />
                  </div>
                  <span className="fw-semibold text-white">{user?.name || 'My Account'}</span>
                  {isAdmin && (
                    <span
                      className="badge ms-1"
                      style={{
                        background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                        color: '#081726',
                        fontWeight: 800,
                        fontSize: '0.65rem',
                      }}
                    >
                      ADMIN
                    </span>
                  )}
                  <ChevronDown size={14} className="text-secondary" />
                </button>
                <ul
                  className="dropdown-menu dropdown-menu-end shadow-lg py-2 mt-2"
                  aria-labelledby="userDropdown"
                  style={{
                    backgroundColor: 'rgba(22, 26, 41, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(139, 92, 246, 0.25)',
                    borderRadius: 14,
                    minWidth: 210,
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6)',
                  }}
                >
                  <li>
                    <Link
                      to="/my-bookings"
                      className="dropdown-item d-flex align-items-center gap-2 text-white py-2 px-3 transition"
                      style={{ fontSize: '0.9rem' }}
                    >
                      <Ticket size={16} color="var(--cinema-violet)" />
                      My Bookings
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/profile?tab=watchlist"
                      className="dropdown-item d-flex align-items-center gap-2 text-white py-2 px-3 transition"
                      style={{ fontSize: '0.9rem' }}
                    >
                      <Heart size={16} color="#ec4899" />
                      My Watchlist
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/profile"
                      className="dropdown-item d-flex align-items-center gap-2 text-white py-2 px-3 transition"
                      style={{ fontSize: '0.9rem' }}
                    >
                      <UserIcon size={16} color="var(--cinema-amber)" />
                      Profile Settings
                    </Link>
                  </li>
                  {isAdmin && (
                    <>
                      <li><hr className="dropdown-divider border-secondary opacity-25" /></li>
                      <li>
                        <Link
                          to="/admin"
                          className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 transition"
                          style={{ fontSize: '0.9rem', color: 'var(--cinema-cyan)' }}
                        >
                          <Shield size={16} />
                          Admin Dashboard
                        </Link>
                      </li>
                    </>
                  )}
                  <li><hr className="dropdown-divider border-secondary opacity-25" /></li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="dropdown-item d-flex align-items-center gap-2 text-danger py-2 px-3 w-100 border-0 bg-transparent transition"
                      style={{ fontSize: '0.9rem' }}
                    >
                      <LogOut size={16} />
                      Log Out
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="btn btn-cinema-outline">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-cinema">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
