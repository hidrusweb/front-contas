'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../../../lib/api';
import { getUser } from '../../../../../lib/auth';
import toast from 'react-hot-toast';

interface Props {
  params: Promise<{ tabelaId: string; ano: string; mes: string }>;
  searchParams: Promise<{ idUnidade?: string }>;
}

type Tab = 'demonstrativo' | 'geral' | 'informativo' | 'excedentes';

export default function VisualizacaoPage({ params, searchParams }: Props) {
  const { tabelaId, ano, mes } = use(params);
  const { idUnidade } = use(searchParams);
  const router = useRouter();
  const user = getUser();

  const [activeTab, setActiveTab] = useState<Tab>('demonstrativo');
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchData(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, idUnidade, tabelaId, ano, mes]);

  const fetchData = async (tab: Tab) => {
    if (!idUnidade) {
      toast.error('Unidade não informada.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setData(null);
    try {
      const y = Number(ano);
      const m = Number(mes);
      const dataSelecionada = `${ano}-${String(mes).padStart(2, '0')}-01`;

      const ctxRes = await api.get(`/consumption/context/unidade/${idUnidade}`, {
        params: { ano: y, mes: m },
      });
      const idConsumo = ctxRes.data.idConsumo as number;

      let res;
      if (tab === 'demonstrativo') {
        res = await api.get(`/reports/bill/unidade/${idUnidade}`, {
          params: { idTabela: tabelaId, dataSelecionada },
        });
      } else if (tab === 'geral') {
        res = await api.get(`/reports/general/consumo/${idConsumo}/tabela/${tabelaId}`);
      } else if (tab === 'informativo') {
        res = await api.get(`/reports/informative/10`, {
          params: { idConsumption: idConsumo },
        });
      } else {
        const geral = await api.get(`/reports/general/consumo/${idConsumo}/tabela/${tabelaId}`);
        const rows = Array.isArray(geral.data) ? geral.data : [];
        res = { data: rows.filter((r: { Consumo?: number }) => (r.Consumo ?? 0) > 10) };
      }
      setData(res?.data);
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      toast.error(ax.response?.data?.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: 'demonstrativo', label: 'Conta' },
    { key: 'geral', label: 'Relatório Geral' },
    { key: 'informativo', label: 'Informativo' },
    { key: 'excedentes', label: 'Excedentes' },
  ];

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];
  const mesLabel = monthNames[Number(mes) - 1] ?? mes;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-700 text-white px-4 py-4 flex items-center justify-between">
        <div>
          <button type="button" onClick={() => router.back()} className="text-blue-200 text-sm mb-1 hover:text-white">
            ← Voltar
          </button>
          <h1 className="font-bold text-base">Conta {mesLabel}/{ano}</h1>
        </div>
      </header>

      <div className="bg-white border-b border-gray-200 overflow-x-auto">
        <div className="flex">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === t.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-2xl mx-auto p-4">
        {loading ? (
          <div className="text-center py-16 text-gray-400">Carregando...</div>
        ) : !data ? (
          <div className="text-center py-16 text-gray-400">Nenhum dado disponível.</div>
        ) : (
          <div className="card">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto">
              {typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </main>
    </div>
  );
}
