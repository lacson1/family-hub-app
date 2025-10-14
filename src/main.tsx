import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerServiceWorker, unregisterServiceWorker } from './registerSW'
import { AuthProvider } from './contexts/AuthContext'

// Register service worker for PWA (only in production)
if (import.meta.env.PROD) {
  registerServiceWorker()
} else {
  // Unregister any existing service workers in development
  unregisterServiceWorker().catch(console.error)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
