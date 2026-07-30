import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { AppBootstrap } from './AppBootstrap';
import './responsive-modernization.css';
import './index.css';
import './brand.css';
import './minhas-demandas.css';
import './r3-refinements.css';
import './radar-governanca.css';
import './radar-governanca-accessibility.css';
import './r4-prazos-providencias.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppBootstrap />
  </StrictMode>,
);
