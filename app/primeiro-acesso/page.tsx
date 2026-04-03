import { Suspense } from 'react';
import PrimeiroAcessoClient from './PrimeiroAcessoClient';

export default function PrimeiroAcessoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center text-white text-sm">
          Carregando…
        </div>
      }
    >
      <PrimeiroAcessoClient />
    </Suspense>
  );
}
