import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { bookingApi } from '../api/bookingApi';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import {
  CheckCircle,
  Printer,
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Tv,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const BookingConfirmation = () => {
  const { id } = useParams();
  const location = useLocation();
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!booking);

  useEffect(() => {
    // Fire celebratory confetti if freshly booked
    try {
      confetti({
        particleCount: 85,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#8b5cf6', '#06b6d4', '#fbbf24', '#10b981'],
      });
    } catch (e) {
      // Confetti fallback
    }

    if (!booking) {
      const fetchBooking = async () => {
        try {
          const res = await bookingApi.getBookingById(id);
          if (res.success) {
            setBooking(res.data);
          }
        } catch (err) {
          console.error('Failed to load booking details:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchBooking();
    }
  }, [id, booking]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="text-center py-5 my-5">
        <div className="spinner-border" style={{ color: 'var(--cinema-violet)' }} role="status"></div>
        <p className="text-secondary mt-2">Loading digital e-ticket...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container py-5 text-center text-secondary">
        <h5 className="text-white">Booking Not Found</h5>
        <Link to="/my-bookings" className="btn btn-cinema mt-3">View My Bookings</Link>
      </div>
    );
  }

  const show = booking.showId;
  const movie = show?.movieId;
  const screen = show?.screenId;
  const theatre = screen?.theatreId;

  const formattedDate = show?.startTime
    ? new Date(show.startTime).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const formattedTime = show?.startTime
    ? new Date(show.startTime).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <div className="booking-confirmation-page py-5">
      <div className="container" style={{ maxWidth: 780 }}>
        {/* Success header */}
        <div className="text-center mb-4">
          <div
            className="d-inline-flex p-3 rounded-circle mb-3 shadow"
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              boxShadow: '0 0 25px rgba(16, 185, 129, 0.3)',
            }}
          >
            <CheckCircle size={44} />
          </div>
          <h2 className="text-white fw-bold mb-1">Booking Confirmed!</h2>
          <p className="text-secondary small">
            Your seats are reserved and your digital boarding pass is ready for cinema entry.
          </p>
        </div>

        {/* Premium Boarding Pass E-Ticket Card */}
        <div className="ticket-card p-4 p-md-5 mb-4 text-white">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center gap-2">
              <div
                className="d-flex align-items-center justify-content-center p-2 rounded-3"
                style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' }}
              >
                <Ticket size={20} color="#ffffff" />
              </div>
              <span className="fw-bold tracking-wider fs-5" style={{ fontFamily: 'var(--font-heading)' }}>
                IMOVIES ADMISSION PASS
              </span>
            </div>
            <span
              className="badge px-3 py-2 fw-bold text-uppercase rounded-pill"
              style={{
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.5)',
                color: '#34d399',
              }}
            >
              {booking.status}
            </span>
          </div>

          <div className="row g-4 align-items-center">
            {/* Movie Info */}
            <div className="col-md-8">
              <h3 className="fw-bold text-white mb-2">{movie?.title}</h3>
              <p className="text-secondary small mb-3">
                {movie?.language} &bull; {movie?.genres?.join(', ')} &bull; {movie?.durationMin} mins
              </p>

              <div className="mb-3">
                <div className="d-flex align-items-center gap-2 text-warning fw-semibold mb-1">
                  <MapPin size={16} color="var(--cinema-cyan)" /> {theatre?.name}
                </div>
                <div className="text-secondary small ps-4">
                  {theatre?.address}, {theatre?.city}
                </div>
              </div>

              <div className="d-flex flex-wrap gap-4 text-light small mb-3">
                <div>
                  <span className="text-secondary d-block small" style={{ fontSize: '0.72rem' }}>AUDITORIUM</span>
                  <strong>{screen?.name}</strong>
                </div>
                <div>
                  <span className="text-secondary d-block small" style={{ fontSize: '0.72rem' }}>DATE</span>
                  <strong>{formattedDate}</strong>
                </div>
                <div>
                  <span className="text-secondary d-block small" style={{ fontSize: '0.72rem' }}>SHOWTIME</span>
                  <strong>{formattedTime}</strong>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-4 pt-3 border-top border-secondary border-opacity-25">
                <div>
                  <span className="text-secondary d-block small mb-1" style={{ fontSize: '0.72rem' }}>RESERVED SEATS</span>
                  <div className="d-flex gap-2 flex-wrap">
                    {booking.seats?.map((seat) => (
                      <span
                        key={seat}
                        className="badge px-3 py-1 fw-bold fs-6"
                        style={{
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                          color: '#ffffff',
                          boxShadow: '0 0 10px rgba(139, 92, 246, 0.4)',
                        }}
                      >
                        {seat}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-secondary d-block small mb-1" style={{ fontSize: '0.72rem' }}>TOTAL PAID</span>
                  <span className="fw-bold fs-5" style={{ color: 'var(--cinema-amber)' }}>
                    ₹{booking.totalAmount}
                  </span>
                </div>
              </div>
            </div>

            {/* QR Code Column */}
            <div className="col-md-4 text-center border-start-md border-secondary border-opacity-20 ps-md-4">
              <div
                className="bg-white p-3 rounded-4 d-inline-block shadow-lg mb-2"
                style={{ width: 'fit-content' }}
              >
                <QRCodeSVG
                  value={`IMOVIES:${booking.reference}:${booking._id}`}
                  size={140}
                  level="H"
                />
              </div>
              <div className="small text-secondary mt-2">
                Booking Reference:
                <strong className="d-block text-white fw-bold tracking-wider fs-6 mt-1">
                  {booking.reference}
                </strong>
              </div>
              <div className="text-secondary mt-1" style={{ fontSize: '0.74rem' }}>
                Scan at turnstile for entry
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <button
            onClick={handlePrint}
            className="btn btn-cinema-outline d-flex align-items-center gap-2"
          >
            <Printer size={18} /> Print / Save E-Ticket
          </button>

          <div className="d-flex gap-2">
            <Link to="/my-bookings" className="btn btn-cinema-outline">
              My Bookings
            </Link>
            <Link to="/" className="btn btn-cinema d-flex align-items-center gap-2">
              Browse More <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
