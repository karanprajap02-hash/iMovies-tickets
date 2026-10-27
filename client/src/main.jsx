import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './index.css';
import './App.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
