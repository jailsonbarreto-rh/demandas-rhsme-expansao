import { QueryClient } from '@tanstack/react-query';

export const demandasQueryKeys = {
  root: ['demandas'] as const,
  session: (userId: string) => ['demandas', 'session', userId] as const,
  trash: (userId: string) => ['demandas', 'trash', userId] as const,
};

export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
