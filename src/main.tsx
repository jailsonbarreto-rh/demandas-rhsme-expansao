import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import '@fontsource-variable/inter';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { AppBootstrap } from './AppBootstrap';
import { createAppQueryClient, DemandasQueryClientContext } from './query/queryClient';
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

const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(async () => {
      const module = await import('@tanstack/react-query-devtools');
      return { default: module.ReactQueryDevtools };
    })
  : null;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DemandasQueryClientContext.Provider value={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AppBootstrap />
        {ReactQueryDevtools ? (
          <Suspense fallback={null}>
            <ReactQueryDevtools initialIsOpen={false} />
          </Suspense>
        ) : null}
      </QueryClientProvider>
    </DemandasQueryClientContext.Provider>
  </StrictMode>,
);