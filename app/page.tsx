'use client';

import { useEffect } from 'react';
import { getUser } from '../lib/auth';
import { hardNavigateToAppPath } from '../lib/defer-client-navigation';

/** Raiz: no servidor não há token; redireciona no cliente conforme sessão. */
export default function Home() {
  useEffect(() => {
    if (getUser()) {
      hardNavigateToAppPath('/inicio');
    } else {
      hardNavigateToAppPath('/login');
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-900 text-white">
      Carregando…
    </div>
  );
}
