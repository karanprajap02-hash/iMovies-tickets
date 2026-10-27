import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Film,
  Building2,
  CalendarDays,
  Ticket,
  Shield,
  Sparkles,
} from 'lucide-react';

const AdminLayout = () => {
  return (
    <div className="admin-layout py-4">
      <div className="container">
        {/* Admin Header */}
        <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom border-secondary border-opacity-20">
          <div className="d-flex align-items-center gap-2">
            <div
              className="d-flex align-items-center justify-content-center p-2 rounded-3"
              style={{
                background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)',
              }}
            >
              <Shield size={22} color="#0a0c14" />
            </div>
            <h3 className="text-white fw-bold m-0" style={{ fontFamily: 'var(--font-heading)' }}>
              IMovies Admin Portal
            </h3>
          </div>
          <span
            className="badge px-3 py-2 fw-bold text-uppercase rounded-pill"
            style={{
              background: 'rgba(6, 182, 212, 0.15)',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              color: '#38bdf8',
            }}
          >
            Administrator Control
          </span>
        </div>

        {/* Tab Navigation */}
        <div className="d-flex gap-2 overflow-x-auto pb-2 mb-4">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `btn btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-3 text-nowrap transition ${
                isActive ? 'btn-cinema fw-bold text-white' : 'btn-cinema-outline text-secondary hover-white'
              }`
            }
          >
            <LayoutDashboard size={16} /> Dashboard
          </NavLink>

          <NavLink
            to="/admin/movies"
            className={({ isActive }) =>
              `btn btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-3 text-nowrap transition ${
                isActive ? 'btn-cinema fw-bold text-white' : 'btn-cinema-outline text-secondary hover-white'
              }`
            }
          >
            <Film size={16} /> Movies Catalogue
          </NavLink>

          <NavLink
            to="/admin/theatres"
            className={({ isActive }) =>
              `btn btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-3 text-nowrap transition ${
                isActive ? 'btn-cinema fw-bold text-white' : 'btn-cinema-outline text-secondary hover-white'
              }`
            }
          >
            <Building2 size={16} /> Theatres & Screens
          </NavLink>

          <NavLink
            to="/admin/shows"
            className={({ isActive }) =>
              `btn btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-3 text-nowrap transition ${
                isActive ? 'btn-cinema fw-bold text-white' : 'btn-cinema-outline text-secondary hover-white'
              }`
            }
          >
            <CalendarDays size={16} /> Shows & Schedules
          </NavLink>

          <NavLink
            to="/admin/bookings"
            className={({ isActive }) =>
              `btn btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-3 text-nowrap transition ${
                isActive ? 'btn-cinema fw-bold text-white' : 'btn-cinema-outline text-secondary hover-white'
              }`
            }
          >
            <Ticket size={16} /> All Bookings
          </NavLink>
        </div>

        {/* Child Admin Pages */}
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
