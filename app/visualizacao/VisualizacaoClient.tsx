'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '../../lib/api';
import { getUser } from '../../lib/auth';
import toast from 'react-hot-toast';
import DemonstrativoConta, { type UnitBill } from '../../components/conta/DemonstrativoConta';

export default function VisualizacaoClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabelaId = searchParams.get('tabelaId') ?? '';
  const ano = searchParams.get('ano') ?? '';
  const mes = searchParams.get('mes') ?? '';
  const idUnidade = searchParams.get('idUnidade') ?? '';

  const [bill, setBill] = useState<UnitBill | null>(null);
  const [loading, setLoading] = useState(true);

  const y = Number(ano);
  const m = Number(mes);

  useEffect(() => {
    if (!getUser()) {
      router.push('/login');
      return;
    }

    const load = async () => {
      if (!idUnidade) {
        toast.error('Unidade não informada.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setBill(null);
      const dataSelecionada = `${ano}-${String(mes).padStart(2, '0')}-01`;
      try {
        const res = await api.get<UnitBill>(`/reports/bill/unidade/${idUnidade}`, {
          params: { idTabela: tabelaId, dataSelecionada },
        });
        setBill(res.data);
      } catch (err: unknown) {
        const ax = err as { response?: { data?: { message?: string } } };
        toast.error(ax.response?.data?.message || 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router, idUnidade, tabelaId, ano, mes]);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];
  const mesLabel = monthNames[m - 1] ?? mes;

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white">
      <header className="print:hidden sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.push('/inicio')}
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            ← Voltar
          </button>
          <p className="text-sm text-slate-500 truncate">
            Conta · {mesLabel} {ano}
          </p>
        </div>
      </header>

      <main>
        {loading ? (
          <div className="text-center py-20 text-slate-400 text-sm">Carregando…</div>
        ) : bill ? (
          <DemonstrativoConta bill={bill} anoRef={y} mesRef={m} />
        ) : (
          <div className="text-center py-20 text-slate-500 text-sm max-w-md mx-auto px-4">
            Não foi possível carregar a conta para este período.
          </div>
        )}
      </main>
    </div>
  );
}
