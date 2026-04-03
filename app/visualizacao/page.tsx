import { Suspense } from 'react';
import VisualizacaoClient from './VisualizacaoClient';

export default function VisualizacaoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-400 text-sm">
          Carregando…
        </div>
      }
    >
      <VisualizacaoClient />
    </Suspense>
  );
}
