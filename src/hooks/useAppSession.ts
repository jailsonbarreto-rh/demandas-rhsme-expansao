import { useCallback, useEffect, useRef, useState } from 'react';
import type { AppUser } from '../types';
import type { AuthService } from '../services/contracts';
import { getUserFacingError } from '../domain/userFacingErrors';

export function useAppSession(auth: AuthService) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passwordRecoveryReady, setPasswordRecoveryReady] = useState(false);
  const passwordRecoveryRef = useRef(false);

  useEffect(() => {
    let active = true;
    const cleanup = auth.subscribe(
      (nextUser) => {
        if (!active || passwordRecoveryRef.current) return;
        setUser(nextUser);
      },
      () => {
        if (!active) return;
        passwordRecoveryRef.current = true;
        setPasswordRecoveryReady(true);
        setUser(null);
        setLoading(false);
      },
    );
    void auth.restore()
      .then((restored) => {
        if (active && !passwordRecoveryRef.current) setUser(restored);
      })
      .catch((reason: unknown) => {
        if (active) setError(getUserFacingError(reason, 'Não foi possível restaurar a sessão.'));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; cleanup(); };
  }, [auth]);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      setUser(await auth.signIn(email, password));
    } catch (reason) {
      const message = getUserFacingError(reason, 'Não foi possível entrar.');
      setError(message);
      throw new Error(message);
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
      const message = getUserFacingError(reason, 'Não foi possível solicitar acesso.');
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [auth]);

  const requestPasswordReset = useCallback(async (email: string, redirectTo: string) => {
    setLoading(true);
    setError(null);
    try {
      await auth.requestPasswordReset(email, redirectTo);
    } catch (reason) {
      const message = getUserFacingError(reason, 'Não foi possível enviar o link de recuperação agora.');
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [auth]);

  const completePasswordReset = useCallback(async (password: string) => {
    setLoading(true);
    setError(null);
    try {
      await auth.completePasswordReset(password);
      passwordRecoveryRef.current = false;
      setPasswordRecoveryReady(false);
      setUser(null);
    } catch (reason) {
      const message = getUserFacingError(reason, 'Não foi possível redefinir a senha. Solicite um novo link.');
      setError(message);
      throw new Error(message);
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
      passwordRecoveryRef.current = false;
      setPasswordRecoveryReady(false);
    } finally {
      setLoading(false);
    }
  }, [auth]);

  return {
    user,
    loading,
    error,
    passwordRecoveryReady,
    signIn,
    requestAccess,
    requestPasswordReset,
    completePasswordReset,
    signOut,
  };
}
