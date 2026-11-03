import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
<<<<<<< HEAD
import { AdminEditProvider } from './context/AdminEditContext.tsx';
import { LocationProvider } from './context/LocationContext.tsx';
import './index.css';
import 'leaflet/dist/leaflet.css';
=======
import './index.css';
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
<<<<<<< HEAD
      <AdminEditProvider>
        <LocationProvider>
          <App />
        </LocationProvider>
      </AdminEditProvider>
=======
      <App />
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
    </ErrorBoundary>
  </StrictMode>,
);
