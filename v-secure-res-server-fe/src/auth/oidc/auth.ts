// auth.ts
import { generateCodeVerifier, codeChallengeS256 } from './pkce';

const authority = import.meta.env.VITE_OIDC_AUTHORITY;
const clientId = import.meta.env.VITE_OIDC_CLIENT_ID;
const redirectUri = import.meta.env.VITE_OIDC_REDIRECT_URI;
const scopes = import.meta.env.VITE_OIDC_SCOPES;

export async function beginLogin() {
  const verifier = await generateCodeVerifier();
  const challenge = await codeChallengeS256(verifier);
  const state = crypto.randomUUID();

  sessionStorage.setItem('pkce_verifier', verifier);
  sessionStorage.setItem('oidc_state', state);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: scopes,
    redirect_uri: redirectUri,
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256'
  });

  window.location.href = `${authority}/oauth2/authorize?${params.toString()}`;
}

export async function exchangeCode(code: string, state: string) {
  const storedState = sessionStorage.getItem('oidc_state');
  if (state !== storedState) {
    throw new Error('State mismatch');
  }
  const verifier = sessionStorage.getItem('pkce_verifier');
  if (!verifier) throw new Error('Missing PKCE verifier');

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    code,
    redirect_uri: redirectUri,
    code_verifier: verifier
  });

  const resp = await fetch(`${authority}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  if (!resp.ok) {
    throw new Error(`Token endpoint error: ${resp.status}`);
  }
  const json = await resp.json();
  // expires_in (seconds) relative
  const expiresAt = Math.floor(Date.now()/1000) + (json.expires_in ?? 0);

  // Cleanup one-time items
  sessionStorage.removeItem('pkce_verifier');
  sessionStorage.removeItem('oidc_state');

  return {
    accessToken: json.access_token,
    idToken: json.id_token,
    refreshToken: json.refresh_token,
    expiresAt
  };
}

export async function refresh(refreshToken: string) {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: clientId,
    refresh_token: refreshToken
  });
  const resp = await fetch(`${authority}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type':'application/x-www-form-urlencoded' },
    body
  });
  if (!resp.ok) throw new Error('Refresh failed');
  const json = await resp.json();
  const expiresAt = Math.floor(Date.now()/1000) + (json.expires_in ?? 0);
  return {
    accessToken: json.access_token,
    idToken: json.id_token ?? '',
    refreshToken: json.refresh_token ?? refreshToken, // might reuse
    expiresAt
  };
}

export function logoutFrontEnd() {
  // Local only logout
  sessionStorage.removeItem('pkce_verifier');
  sessionStorage.removeItem('oidc_state');
}
