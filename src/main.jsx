import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import AuthProvider from './auth/AuthProvider.jsx';
import App from './App.jsx';
import { STATIC_DEMO } from './utils.js';
import './index.css';

// GitHub Pages cannot rewrite URLs, so the static build uses #/ routes
const Router = STATIC_DEMO ? HashRouter : BrowserRouter;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Router>
  </StrictMode>,
);
