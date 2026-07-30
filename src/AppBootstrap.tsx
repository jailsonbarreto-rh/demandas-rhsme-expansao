import { lazy, Suspense } from 'react';
import { AuthSkeleton } from './components/LoadingSkeletons';

const App = lazy(() => import('./App').then((module) => ({ default: module.App })));

export function AppBootstrap() {
  return (
    <Suspense fallback={<AuthSkeleton />}>
      <App />
    </Suspense>
  );
}
