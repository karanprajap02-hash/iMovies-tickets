import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { bookingApi } from '../api/bookingApi';
import { showApi } from '../api/showApi';
import { useNotification } from '../context/NotificationContext';
import Timer from '../components/Timer';
import {
  CreditCard,
  ShieldCheck,
  Film,
  Calendar,
  Clock,
  MapPin,
  Lock,
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
  Smartphone,
  Landmark,
  Tv,
  RefreshCw,
} from 'lucide-react';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const { showId, show, selectedSeats, lockExpiresAt, totalAmount } =
    location.state || {};

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [cardData, setCardData] = useState({
    name: 'Karan Prajapat',
    number: '4242 •••• •••• 4242',
    expiry: '12/28',
    cvv: '888',
  });
  const [upiId, setUpiId] = useState('karan@okaxis');

  // If page accessed directly without state, redirect to movies
  if (!showId || !selectedSeats || !show) {
    return (
      <div className="container py-5 text-center text-secondary">
        <h5 className="text-white">No active checkout session found.</h5>
        <p className="small mb-4">Please select a movie and seats first.</p>
        <Link to="/movies" className="btn btn-cinema">Browse Movies</Link>
      </div>
    );
  }

  const movie = show.movieId;
  const screen = show.screenId;
  const theatre = screen?.theatreId;

  const handleTimerExpire = () => {
    alert('Your 5-minute seat hold has expired. The seats have been released.');
    navigate(`/shows/${showId}/seats`);
  };

  const handleCancelHold = async () => {
    try {
      await showApi.unlockSeats(showId, selectedSeats);
    } catch (e) {
      console.warn('Unlock failed or already expired');
    }
    navigate(`/shows/${showId}/seats`);
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    try {
      setPaymentProcessing(true);
      setErrorMessage('');

      // Test Step 9: Simulated failure handler
      if (simulateFailure) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        setErrorMessage(
          'Payment Declined: Bank transaction was rejected. Don\'t worry! Your 5-minute seat hold remains safely active. You can retry immediately with another payment method.'
        );
        addNotification(
          'Payment Unsuccessful',
          'Simulated payment failed. Your seat session is preserved — click retry to complete checkout.',
          'warning'
        );
        setPaymentProcessing(false);
        return;
      }

      // Call booking confirmation endpoint (simulated mock payment)
      const res = await bookingApi.createBooking({
        showId,
        seats: selectedSeats,
      });

      if (res.success && res.data) {
        // Step 11: In-app confirmation notification alert
        addNotification(
          'Booking Confirmed!',
          `Admission pass generated for "${movie?.title}". Ref: ${res.data.reference}.`,
          'success'
        );

        navigate(`/bookings/${res.data._id}`, {
          state: { booking: res.data, isNew: true },
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Payment processing failed. Please retry without losing your seats.';
      setErrorMessage(msg);
      setPaymentProcessing(false);
    }
  };

  const convenienceFee = Math.round(totalAmount * 0.05); // 5% mock tax/fee
  const grandTotal = totalAmount + convenienceFee;

  return (
    <div className="checkout-page py-5">
      <div className="container">
        {/* Navigation & Timer Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <button
            onClick={handleCancelHold}
            className="btn btn-cinema-outline d-inline-flex align-items-center gap-2"
            style={{ width: 'fit-content' }}
          >
            <ChevronLeft size={16} /> Release Seats & Back
          </button>

          {/* Countdown timer */}
          {lockExpiresAt && (
            <Timer expiresAt={lockExpiresAt} onExpire={handleTimerExpire} />
          )}
        </div>

        {errorMessage && (
          <div
            className="alert alert-danger d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 p-3 rounded-3 shadow-sm"
            role="alert"
          >
            <div className="d-flex align-items-center gap-2">
              <AlertCircle size={22} className="flex-shrink-0 text-danger" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => {
                setErrorMessage('');
                setSimulateFailure(false);
              }}
              className="btn btn-outline-light btn-sm d-flex align-items-center gap-1 text-nowrap align-self-start align-self-md-auto"
            >
              <RefreshCw size={14} /> Retry Payment
            </button>
          </div>
        )}

        <div className="row g-4">
          {/* Order Breakdown Column */}
          <div className="col-lg-7">
            <div className="glass-panel p-4 mb-4">
              <h5 className="text-white fw-bold mb-4 d-flex align-items-center gap-2">
                <Film size={20} color="var(--cinema-violet)" />
                Order Summary
              </h5>

              <div className="d-flex gap-3 mb-4">
                <img
                  src={movie?.posterUrl}
                  alt={movie?.title}
                  className="rounded-3 shadow"
                  style={{
                    width: 85,
                    height: 120,
                    objectFit: 'cover',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                  }}
                />
                <div>
                  <h5 className="text-white fw-bold mb-1">{movie?.title}</h5>
                  <p className="text-secondary small mb-2">{movie?.genres?.join(', ')}</p>
                  <p className="text-light small mb-1 d-flex align-items-center gap-1">
                    <MapPin size={14} color="var(--cinema-cyan)" />
                    {theatre?.name} ({screen?.name})
                  </p>
                  <p className="text-secondary small mb-0 d-flex align-items-center gap-2">
                    <span>
                      <Calendar size={13} className="me-1" color="var(--cinema-violet)" />
                      {new Date(show.startTime).toLocaleDateString()}
                    </span>
                    <span>
                      <Clock size={13} className="me-1" color="var(--cinema-amber)" />
                      {new Date(show.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </p>
                </div>
              </div>

              <hr className="border-secondary opacity-20 my-3" />

              {/* Seats and price breakdown */}
              <div className="mb-3">
                <div className="d-flex justify-content-between text-secondary small mb-2">
                  <span>Reserved Seats ({selectedSeats.length})</span>
                  <div className="d-flex gap-1 flex-wrap">
                    {selectedSeats.map((s) => (
                      <span
                        key={s}
                        className="badge px-2 py-1 fw-bold"
                        style={{
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                          color: '#ffffff',
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="d-flex justify-content-between text-light small mb-2">
                  <span>Base Ticket Fare</span>
                  <span>₹{totalAmount}</span>
                </div>

                <div className="d-flex justify-content-between text-light small mb-2">
                  <span>Cinema Convenience Fee & GST (5%)</span>
                  <span>₹{convenienceFee}</span>
                </div>
              </div>

              <hr className="border-secondary opacity-20 my-3" />

              <div className="d-flex justify-content-between align-items-center">
                <span className="text-white fw-bold fs-5">Amount Payable</span>
                <span className="fw-black fs-4" style={{ color: 'var(--cinema-amber)' }}>
                  ₹{grandTotal}
                </span>
              </div>
            </div>

            <div
              className="glass-panel p-3 d-flex align-items-center gap-3"
              style={{ border: '1px solid rgba(16, 185, 129, 0.25)' }}
            >
              <ShieldCheck size={28} color="#10b981" />
              <div className="small text-secondary">
                <strong className="text-white d-block">Guaranteed Seat Hold</strong>
                Seats are locked exclusively to your account until the checkout timer completes.
              </div>
            </div>
          </div>

          {/* Payment Gateway Column */}
          <div className="col-lg-5">
            <div className="glass-panel p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="text-white fw-bold m-0 d-flex align-items-center gap-2">
                  <CreditCard size={20} color="var(--cinema-cyan)" />
                  Payment Gateway
                </h5>
                <div className="d-flex align-items-center gap-2">
                  <label className="form-check-label text-secondary small user-select-none" htmlFor="failToggle" style={{ fontSize: '0.72rem' }}>
                    Simulate Failure
                  </label>
                  <div className="form-check form-switch m-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="failToggle"
                      checked={simulateFailure}
                      onChange={(e) => setSimulateFailure(e.target.checked)}
                      title="Toggle simulated bank decline to test Step 9 retry flow"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Selector Tabs */}
              <div className="d-flex gap-2 mb-4 p-1 rounded-3" style={{ background: 'rgba(255, 255, 255, 0.04)' }}>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`btn btn-sm flex-grow-1 rounded-2 d-flex align-items-center justify-content-center gap-1 ${
                    paymentMethod === 'card' ? 'btn-cinema fw-bold text-white' : 'text-secondary'
                  }`}
                  style={{ fontSize: '0.8rem' }}
                >
                  <CreditCard size={14} /> Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`btn btn-sm flex-grow-1 rounded-2 d-flex align-items-center justify-content-center gap-1 ${
                    paymentMethod === 'upi' ? 'btn-cinema fw-bold text-white' : 'text-secondary'
                  }`}
                  style={{ fontSize: '0.8rem' }}
                >
                  <Smartphone size={14} /> UPI
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`btn btn-sm flex-grow-1 rounded-2 d-flex align-items-center justify-content-center gap-1 ${
                    paymentMethod === 'netbanking' ? 'btn-cinema fw-bold text-white' : 'text-secondary'
                  }`}
                  style={{ fontSize: '0.8rem' }}
                >
                  <Landmark size={14} /> Net Banking
                </button>
              </div>

              <form onSubmit={handleConfirmPayment}>
                {paymentMethod === 'card' && (
                  <>
                    <div className="mb-3">
                      <label className="form-label text-secondary small">Cardholder Name</label>
                      <input
                        type="text"
                        className="form-control form-control-cinema"
                        value={cardData.name}
                        onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label text-secondary small">Card Number</label>
                      <input
                        type="text"
                        className="form-control form-control-cinema"
                        value={cardData.number}
                        onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                        required
                      />
                    </div>

                    <div className="row g-2 mb-4">
                      <div className="col-6">
                        <label className="form-label text-secondary small">Expiry</label>
                        <input
                          type="text"
                          className="form-control form-control-cinema"
                          value={cardData.expiry}
                          onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label text-secondary small">CVV</label>
                        <input
                          type="password"
                          className="form-control form-control-cinema"
                          value={cardData.cvv}
                          onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                {paymentMethod === 'upi' && (
                  <div className="mb-4">
                    <label className="form-label text-secondary small">Virtual Payment Address (VPA / UPI ID)</label>
                    <input
                      type="text"
                      className="form-control form-control-cinema"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@upi"
                      required
                    />
                    <div className="text-secondary small mt-2">
                      A simulated instant payment request will be auto-approved.
                    </div>
                  </div>
                )}

                {paymentMethod === 'netbanking' && (
                  <div className="mb-4">
                    <label className="form-label text-secondary small">Select Bank</label>
                    <select className="form-select form-select-cinema mb-2" defaultValue="hdfc">
                      <option value="hdfc">HDFC Bank</option>
                      <option value="icici">ICICI Bank</option>
                      <option value="sbi">State Bank of India</option>
                      <option value="axis">Axis Bank</option>
                    </select>
                    <div className="text-secondary small">
                      Simulated secure net banking portal integration.
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={paymentProcessing}
                  className="btn btn-cinema btn-lg w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                >
                  {paymentProcessing ? (
                    <>
                      <div className="spinner-border spinner-border-sm" role="status"></div>
                      <span>Authorizing Payment...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={18} />
                      <span>Pay ₹{grandTotal} & Confirm</span>
                    </>
                  )}
                </button>
              </form>

              <div className="text-center mt-3 text-secondary" style={{ fontSize: '0.78rem' }}>
                <CheckCircle2 size={14} className="text-success me-1" />
                256-Bit SSL Encrypted Mock Payment Transaction
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
