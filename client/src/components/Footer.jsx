import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Heart, ShieldCheck, Zap, Award, Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer
      className="mt-auto border-top py-5"
      style={{
        background: '#070913',
        borderColor: 'rgba(255, 255, 255, 0.06)',
      }}
    >
      <div className="container">
        <div className="row g-4 justify-content-between">
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div
                className="d-flex align-items-center justify-content-center"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                  boxShadow: '0 0 15px rgba(139, 92, 246, 0.45)',
                }}
              >
                <Film size={20} color="#ffffff" />
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', fontWeight: 800 }}>
                <span className="text-white">I</span>
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
            </div>
            <p className="text-secondary small mb-3" style={{ lineHeight: 1.6 }}>
              Next-generation cinema experience with real-time atomic seat reservation, 
              live hall previews, and instant QR e-ticketing.
            </p>
            <div className="d-flex flex-wrap gap-2">
              <span className="badge badge-violet small px-2 py-1">
                Atomic Seat Locking
              </span>
              <span className="badge badge-cyan small px-2 py-1">
                Live Polling Sync
              </span>
              <span className="badge badge-amber small px-2 py-1">
                Instant QR Entry
              </span>
            </div>
          </div>

          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="text-white fw-bold mb-3 d-flex align-items-center gap-1">
              <Sparkles size={14} color="var(--cinema-cyan)" /> Navigation
            </h6>
            <ul className="list-unstyled text-secondary small d-flex flex-column gap-2 mb-0">
              <li>
                <Link to="/" className="text-decoration-none text-secondary hover-white transition">
                  Now Showing
                </Link>
              </li>
              <li>
                <Link to="/movies?status=coming_soon" className="text-decoration-none text-secondary hover-white transition">
                  Coming Soon
                </Link>
              </li>
              <li>
                <Link to="/movies" className="text-decoration-none text-secondary hover-white transition">
                  Explore Catalogue
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="text-decoration-none text-secondary hover-white transition">
                  My Bookings
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-3 col-6">
            <h6 className="text-white fw-bold mb-3">Cinema Experience</h6>
            <ul className="list-unstyled text-secondary small d-flex flex-column gap-2 mb-0">
              <li className="d-flex align-items-center gap-2">
                <ShieldCheck size={15} color="#10b981" /> 100% Guaranteed Seats
              </li>
              <li className="d-flex align-items-center gap-2">
                <Zap size={15} color="var(--cinema-amber)" /> Instant 5-Min Hold
              </li>
              <li className="d-flex align-items-center gap-2">
                <Award size={15} color="var(--cinema-cyan)" /> IMAX & Dolby Atmos
              </li>
            </ul>
          </div>
        </div>

        <hr className="my-4 border-secondary opacity-15" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center text-secondary small">
          <div>
            &copy; {new Date().getFullYear()} IMovies Entertainment Inc. All rights reserved.
          </div>
          <div className="mt-2 mt-md-0 d-flex align-items-center gap-1">
            Engineered with <Heart size={14} color="#8b5cf6" fill="#8b5cf6" /> for the ultimate movie-goer experience.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
