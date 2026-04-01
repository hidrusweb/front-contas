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
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('contas_token');
  if (!token) return null;
  const payload = parseJwt(token);
  if (!payload) return null;
  if (Date.now() / 1000 > payload.exp) {
    localStorage.removeItem('contas_token');
    return null;
  }
  return payload;
}

export function logout(): void {
  if (typeof window !== 'undefined') localStorage.removeItem('contas_token');
}
