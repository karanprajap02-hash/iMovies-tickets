import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const Timer = ({ expiresAt, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!expiresAt) return;

    const calculateRemaining = () => {
      const difference = new Date(expiresAt).getTime() - new Date().getTime();
      return Math.max(0, Math.floor(difference / 1000));
    };

    setTimeLeft(calculateRemaining());

    const interval = setInterval(() => {
      const remaining = calculateRemaining();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        if (onExpire) {
          onExpire();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isUrgent = timeLeft < 60 && timeLeft > 0;

  return (
    <div
      className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill shadow-sm"
      style={{
        fontWeight: 700,
        fontSize: '0.9rem',
        background: isUrgent ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
        border: isUrgent ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(245, 158, 11, 0.4)',
        color: isUrgent ? '#f87171' : '#fbbf24',
        boxShadow: isUrgent ? '0 0 15px rgba(239, 68, 68, 0.4)' : '0 0 15px rgba(245, 158, 11, 0.25)',
        animation: isUrgent ? 'pulse 1s infinite' : 'none',
      }}
    >
      <Clock size={16} />
      <span>
        Seats locked: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
};

export default Timer;
