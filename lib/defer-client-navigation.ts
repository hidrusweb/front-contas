/**
 * Navegação com recarregamento completo. Respeita `NEXT_PUBLIC_BASE_PATH`
 * e `trailingSlash` do Next (rotas como `/login/`).
 *
 * Útil quando a transição client-side (App Router) conflita com portais/outros
 * gerenciadores de DOM no React 19.
 */
export function hardNavigateToAppPath(path: string, delayMs = 0, searchParams?: string): void {
  const base = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/$/, '');
  let pathname = path.startsWith('/') ? path : `/${path}`;
  if (pathname !== '/' && !pathname.endsWith('/')) {
    pathname += '/';
  }
  let query = '';
  if (searchParams !== undefined && searchParams !== '') {
    query = searchParams.startsWith('?') ? searchParams : `?${searchParams}`;
  }
  const url = `${base}${pathname}${query}`;
  const go = () => {
    window.location.assign(url);
  };
  if (delayMs > 0) {
    window.setTimeout(go, delayMs);
  } else {
    go();
  }
}
