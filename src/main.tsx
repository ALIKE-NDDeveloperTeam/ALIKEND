import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
import { AdminEditProvider } from './context/AdminEditContext.tsx';
import { LocationProvider } from './context/LocationContext.tsx';
import './index.css';
import 'leaflet/dist/leaflet.css';
<<<<<<< HEAD
=======
=======
import './index.css';
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      <AdminEditProvider>
        <LocationProvider>
          <App />
        </LocationProvider>
      </AdminEditProvider>
<<<<<<< HEAD
=======
=======
      <App />
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
    </ErrorBoundary>
  </StrictMode>,
);
