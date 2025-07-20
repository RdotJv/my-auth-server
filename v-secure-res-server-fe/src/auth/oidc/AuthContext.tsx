import React, { createContext, useContext, useEffect, useState } from 'react';
import { tokenStore } from './store';
import { refresh } from './auth';
import { decodeJwt } from './jwt';

interface AuthState {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  register: () => void;
  claims: any | null;
  accessToken: string | null;
}

const AuthCtx = createContext<AuthState>({} as any);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [claims, setClaims] = useState<any|null>(null);
  const [accessToken, setAccessToken] = useState<string|null>(null);

  useEffect(() => {
    const t = tokenStore.get();
    if (t) {
      setAccessToken(t.accessToken);
      setClaims(decodeJwt(t.idToken));
    }
  }, []);

  // Auto refresh (basic)
  useEffect(() => {
    const id = setInterval(async () => {
      const t = tokenStore.get();
      if (!t) return;
      if (tokenStore.isExpired(30) && t.refreshToken) {
        try {
            const newTok = await refresh(t.refreshToken);
            tokenStore.set(newTok);
            setAccessToken(newTok.accessToken);
            setClaims(decodeJwt(newTok.idToken));
        } catch(e) {
            console.warn('Refresh failed', e);
            tokenStore.clear();
            setClaims(null);
            setAccessToken(null);
        }
      }
    }, 15_000);
    return () => clearInterval(id);
  }, []);

  function login() {
    import('./auth').then(m => m.beginLogin());
  }

  async function logout() {
    tokenStore.clear();
    setAccessToken(null);
    setClaims(null);

    await fetch(`${import.meta.env.VITE_OIDC_AUTHORITY}/logout`, {
        method: 'POST',
        credentials: 'include'  
    });
    window.location.href = '/';
    }

  function register() {
    window.location.href = `${import.meta.env.VITE_OIDC_AUTHORITY}/register`;
  }

  return (
    <AuthCtx.Provider value={{
      isAuthenticated: !!claims,
      login, logout, register, claims, accessToken
    }}>
      {children}
    </AuthCtx.Provider>
  );
};

export function useAuth() {
  return useContext(AuthCtx);
}
