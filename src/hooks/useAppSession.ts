import { useCallback, useEffect, useState } from 'react';
import type { AppUser } from '../types';
import type { AuthService } from '../services/contracts';

export function useAppSession(auth: AuthService) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void auth.restore()
      .then((restored) => { if (active) setUser(restored); })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : 'Falha ao restaurar a sessão.'); })
      .finally(() => { if (active) setLoading(false); });
    const cleanup = auth.subscribe((nextUser) => { if (active) setUser(nextUser); });
    return () => { active = false; cleanup(); };
  }, [auth]);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      setUser(await auth.signIn(email, password));
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'Não foi possível entrar.';
      setError(message);
      throw reason;
    } finally {
      setLoading(false);
    }
  }, [auth]);

  const requestAccess = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await auth.requestAccess(email, password);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'Não foi possível solicitar acesso.';
      setError(message);
      throw reason;
    } finally {
      setLoading(false);
    }
  }, [auth]);

  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await auth.signOut();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [auth]);

  return { user, loading, error, signIn, requestAccess, signOut };
}
