import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'
import ErrorBoundary from './components/ui/ErrorBoundary'

// Mobile viewport height fix for Safari
document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
window.addEventListener('resize', () => {
  document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
});

// Unregister old service workers to prevent stale cache issues
// If a SW is currently controlling this page, force a one-time reload to get fresh files
if ('serviceWorker' in navigator) {
  const swControlled = !!navigator.serviceWorker.controller;
  const alreadyReloaded = sessionStorage.getItem('sw-cleared') === '1';
  
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
    }
  });
  
  if (swControlled && !alreadyReloaded) {
    sessionStorage.setItem('sw-cleared', '1');
    window.location.reload();
  }
}

// Prevent double-tap zoom on iOS Safari
document.addEventListener('touchstart', () => {}, { passive: true });

// iOS standalone mode detection
if ((window.navigator as any).standalone === true) {
  document.documentElement.classList.add('standalone-mode');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
