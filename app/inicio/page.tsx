'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { getUser, logout, type JwtPayload } from '../../lib/auth';

interface Unidade {
  id: number;
  unidade: string;
  endereco: string;
  condominio: string;
  agrupamento: string;
}

function accountLoginId(me: Record<string, unknown>): string {
  const u = me.UserName ?? me.userName;
  const e = me.Email ?? me.email;
  const s = String(u || e || '').trim();
  return s;
}

const MESES: { value: number; label: string }[] = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
];

export default function InicioPage() {
  const router = useRouter();
  /** undefined = ainda não leu localStorage (alinha hidratação com HTML estático do export). */
  const [session, setSession] = useState<JwtPayload | null | undefined>(undefined);
  const [greeting, setGreeting] = useState('');
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [idUnidade, setIdUnidade] = useState('');
  const [ano, setAno] = useState(() => String(new Date().getFullYear()));
  const [mes, setMes] = useState(() => String(new Date().getMonth() + 1));

  const anos = useMemo(() => {
    const y = new Date().getFullYear();
    const list: string[] = [];
    for (let a = y; a >= 2020; a--) list.push(String(a));
    return list;
  }, []);

  const load = useCallback(async () => {
    if (!getUser()) return;
    setLoading(true);
    try {
      const meRes = await api.get<Record<string, unknown>>('/account/me');
      const me = meRes.data;
      const nome =
        (me.Nome as string) ||
        (me.nome as string) ||
        (me.GivenName as string) ||
        '';
      const sob =
        (me.Sobrenome as string) ||
        (me.sobrenome as string) ||
        (me.FamilyName as string) ||
        '';
      const display = [nome, sob].filter(Boolean).join(' ').trim();
      setGreeting(display || (me.Email as string) || (me.email as string) || '');

      const emailCpf = accountLoginId(me);
      if (!emailCpf) {
        toast.error('Não foi possível identificar seu usuário. Entre em contato com o suporte.');
        setUnidades([]);
        return;
      }

      const uRes = await api.get<Unidade[]>('/Unit/condomino/disponiveis', {
        params: { emailCpf },
      });
      const list = Array.isArray(uRes.data) ? uRes.data : [];
      setUnidades(list);
      if (list.length > 0) {
        setIdUnidade(String(list[0].id));
      }
    } catch {
      toast.error('Não foi possível carregar suas unidades.');
      setUnidades([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useLayoutEffect(() => {
    setSession(getUser());
  }, []);

  useEffect(() => {
    if (session === undefined) return;
    if (session === null) {
      router.replace('/login');
      return;
    }
    load();
  }, [router, load, session]);

  const onGerarConta = async () => {
    const uid = Number(idUnidade);
    const y = Number(ano);
    const m = Number(mes);
    if (!Number.isFinite(uid) || uid <= 0) {
      toast('Selecione uma unidade válida.', { icon: '⚠️' });
      return;
    }
    if (!Number.isFinite(y) || !Number.isFinite(m)) {
      toast('Selecione ano e mês.', { icon: '⚠️' });
      return;
    }
    setGerando(true);
    try {
      const ctxRes = await api.get<{ idTabelaImposto: number }>(
        `/consumption/context/unidade/${uid}`,
        { params: { ano: y, mes: m } }
      );
      const idTabela = ctxRes.data.idTabelaImposto;
      if (idTabela == null || Number.isNaN(Number(idTabela))) {
        toast.error('Período sem tabela de impostos configurada.');
        return;
      }
      router.push(
        `/visualizacao?tabelaId=${idTabela}&ano=${y}&mes=${m}&idUnidade=${uid}`
      );
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      toast.error(ax.response?.data?.message || 'Não há consumo ativo para o período selecionado.');
    } finally {
      setGerando(false);
    }
  };

  if (session === undefined || session === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-900 text-white">
        Carregando…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex flex-col items-center justify-center p-4 py-10">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-800">Acesse suas contas</h1>
          <p className="text-gray-500 text-sm mt-2">
            Olá{greeting ? `, ${greeting}` : ', condômino'} — aqui você pode gerar e visualizar seu consumo de água por
            mês.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Carregando unidades…</div>
        ) : unidades.length === 0 ? (
          <div className="rounded-xl bg-amber-50 border border-amber-100 text-amber-900 text-sm p-4 mb-6">
            Nenhuma unidade vinculada a este login. Se ainda não criou sua senha, use o primeiro acesso.
            <Link href="/cadastro" className="block mt-3 text-blue-600 font-medium hover:underline">
              Primeiro acesso / cadastro
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="label" htmlFor="slc-ano">
                Ano do consumo
              </label>
              <select
                id="slc-ano"
                className="input"
                value={ano}
                onChange={(e) => setAno(e.target.value)}
              >
                {anos.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="slc-mes">
                Mês do consumo
              </label>
              <select id="slc-mes" className="input" value={mes} onChange={(e) => setMes(e.target.value)}>
                {MESES.map((item) => (
                  <option key={item.value} value={String(item.value)}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="slc-unidade">
                Sua unidade
              </label>
              <select
                id="slc-unidade"
                className="input"
                value={idUnidade}
                onChange={(e) => setIdUnidade(e.target.value)}
              >
                {unidades.map((u) => (
                  <option key={u.id} value={String(u.id)}>
                    {u.condominio}: {u.agrupamento} — {u.unidade}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              disabled={gerando}
              onClick={onGerarConta}
              className="btn-primary w-full mt-2 disabled:opacity-60"
            >
              {gerando ? 'Abrindo…' : 'Gerar conta'}
            </button>
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center border-t border-gray-100 pt-6">
          <button
            type="button"
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            Sair
          </button>
          <Link href="/cadastro" className="text-sm text-blue-600 hover:underline text-center sm:text-right">
            Primeiro acesso
          </Link>
        </div>
      </div>
    </div>
  );
}
