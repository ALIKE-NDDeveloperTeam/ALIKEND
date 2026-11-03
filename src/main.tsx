import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { AdminEditProvider } from './context/AdminEditContext.tsx';
import { LocationProvider } from './context/LocationContext.tsx';
import './index.css';
import 'leaflet/dist/leaflet.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AdminEditProvider>
        <LocationProvider>
          <App />
        </LocationProvider>
      </AdminEditProvider>
    </ErrorBoundary>
  </StrictMode>,
);
