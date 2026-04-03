'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '../lib/auth';

/** Raiz: no servidor não há token; redireciona no cliente conforme sessão. */
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (getUser()) {
      router.replace('/inicio');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-900 text-white">
      Carregando…
    </div>
  );
}
