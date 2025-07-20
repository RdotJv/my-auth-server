import React, { useEffect, useState } from 'react';
import { exchangeCode } from '@/auth/oidc/auth';
import { tokenStore } from '@/auth/oidc/store';  
import { decodeJwt } from '@/auth/oidc/jwt';
import { useNavigate, useLocation } from 'react-router-dom';

export const Callback: React.FC = () => {
  const nav = useNavigate();
  const loc = useLocation();
  const [err, setErr] = useState<string|null>(null);

  useEffect(() => {
    const params = new URLSearchParams(loc.search);
    const code = params.get('code');
    const state = params.get('state');
    if (!code || !state) {
      setErr('Missing code/state');
      return;
    }
    (async () => {
      try {
        const tokens = await exchangeCode(code, state);
        tokenStore.set(tokens);
        // Could store minimal user info somewhere or rely on context refresh
        // nav('/', { replace: true });
        console.log(tokens);
        window.location.replace('/');

      } catch (e:any) {
        setErr(e.message);
      }
    })();
  }, [loc.search, nav]);

  if (err) {
    return <div className="p-6 text-red-600">Callback error: {err}</div>;
  }
  return <div className="p-6 animate-pulse">Signing you in...</div>;
};
