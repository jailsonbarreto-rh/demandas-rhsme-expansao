import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { App } from './App';
import './responsive-modernization.css';
import './index.css';
import './brand.css';
import './brand-overrides.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
