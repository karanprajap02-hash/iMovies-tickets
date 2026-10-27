import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(() => {
    try {
      const stored = localStorage.getItem('imovies_notifications');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // fallback
    }
    return [
      {
        id: 'welcome-notif',
        title: 'Welcome to IMovies',
        message: 'Explore trending shows, pick your tiered seats, and experience seamless cinema ticketing!',
        type: 'info',
        time: new Date().toISOString(),
        read: false,
      },
    ];
  });

  const [activeToast, setActiveToast] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('imovies_notifications', JSON.stringify(notifications));
    } catch (e) {
      // ignore
    }
  }, [notifications]);

  const addNotification = (title, message, type = 'success') => {
    const newNotif = {
      id: Date.now().toString(),
      title,
      message,
      type,
      time: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 24)]);
    setActiveToast(newNotif);

    setTimeout(() => {
      setActiveToast((current) => (current?.id === newNotif.id ? null : current));
    }, 5000);
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAllRead,
        clearNotifications,
        activeToast,
        dismissToast: () => setActiveToast(null),
      }}
    >
      {children}
      {/* Real-time In-App Floating Toast Alert */}
      {activeToast && (
        <div
          className="position-fixed bottom-0 end-0 p-3"
          style={{ zIndex: 1080 }}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div
            className="card shadow-lg text-white border-0"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.95), rgba(15, 23, 42, 0.95))',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              borderRadius: 14,
              minWidth: 320,
              maxWidth: 400,
            }}
          >
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-start mb-1">
                <strong className="text-white fw-bold d-flex align-items-center gap-2">
                  <span
                    className={`badge ${
                      activeToast.type === 'error'
                        ? 'bg-danger'
                        : activeToast.type === 'warning'
                        ? 'bg-warning text-dark'
                        : 'badge-violet'
                    }`}
                  >
                    {activeToast.type.toUpperCase()}
                  </span>
                  {activeToast.title}
                </strong>
                <button
                  type="button"
                  className="btn-close btn-close-white ms-2"
                  style={{ fontSize: '0.75rem' }}
                  onClick={() => setActiveToast(null)}
                ></button>
              </div>
              <p className="small text-light opacity-90 mb-0">{activeToast.message}</p>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);

