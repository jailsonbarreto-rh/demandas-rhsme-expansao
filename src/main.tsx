import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import '@fontsource-variable/inter';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { AppBootstrap } from './AppBootstrap';
import { createAppQueryClient } from './query/queryClient';
import './responsive-modernization.css';
import './index.css';
import './brand.css';
import './minhas-demandas.css';
import './r3-refinements.css';
import './radar-governanca.css';
import './radar-governanca-accessibility.css';
import './r4-prazos-providencias.css';
import './form-field-polish.css';
import './error-boundary.css';
import './demandas-table-responsive.css';

const queryClient = createAppQueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppBootstrap />
    </QueryClientProvider>
  </StrictMode>,
);