// store.ts
export interface Tokens {
  accessToken: string;
  idToken: string;
  refreshToken?: string;
  expiresAt: number; // epoch seconds
}

// store.ts
const KEY = 'oidc_tokens';

export const tokenStore = {
  set(t: Tokens) { sessionStorage.setItem(KEY, JSON.stringify(t)); },
  get() {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  },
  clear() { sessionStorage.removeItem(KEY); },
  isExpired(skew = 30) {
    const t = tokenStore.get();
    return !t || (Date.now()/1000) >= (t.expiresAt - skew);
  }
};
