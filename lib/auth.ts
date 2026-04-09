export interface JwtPayload {
  sub: string;
  email?: string;
  unique_name: string;
  given_name?: string;
  family_name?: string;
  role: string | string[];
  nbf: number;
  exp: number;
  iat: number;
}

const TOKEN_STORAGE_KEY = 'contas_token';
const LEGACY_TOKEN_KEYS = ['token', 'access_token', 'accessToken'] as const;

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  for (const key of LEGACY_TOKEN_KEYS) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (stored) return stored;

  const legacy = LEGACY_TOKEN_KEYS.map((k) => localStorage.getItem(k)).find((v) => !!v);
  if (legacy) {
    localStorage.setItem(TOKEN_STORAGE_KEY, legacy);
    return legacy;
  }

  const fromSession = [TOKEN_STORAGE_KEY, ...LEGACY_TOKEN_KEYS]
    .map((k) => sessionStorage.getItem(k))
    .find((v) => !!v);
  if (fromSession) {
    localStorage.setItem(TOKEN_STORAGE_KEY, fromSession);
    return fromSession;
  }
  return null;
}

export function parseJwt(token: string): JwtPayload | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getUser(): JwtPayload | null {
  const token = getToken();
  if (!token) return null;
  const payload = parseJwt(token);
  if (!payload) return null;
  if (Date.now() / 1000 > payload.exp) {
    clearToken();
    return null;
  }
  return payload;
}

export function logout(): void {
  clearToken();
}
