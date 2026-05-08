'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import api from '../../lib/api';
import { formatCpfMask, cpfDigitsOnly } from '../../lib/cpf-mask';
import { hardNavigateToAppPath } from '../../lib/defer-client-navigation';

const schema = z.object({
  senha: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmar: z.string(),
}).refine((d) => d.senha === d.confirmar, {
  message: 'Senhas não coincidem',
  path: ['confirmar'],
});

type FormData = z.infer<typeof schema>;

export default function PrimeiroAcessoClient() {
  const searchParams = useSearchParams();
  const idUnidade = searchParams.get('idUnidade') ?? '';
  const cpf = searchParams.get('cpf') ?? '';
  const cpfDecoded = decodeURIComponent(cpf);

  return (
    <PrimeiroAcessoInner key={`${idUnidade}:${cpfDecoded}`} cpfDecoded={cpfDecoded} idUnidade={idUnidade} />
  );
}

function PrimeiroAcessoInner({ cpfDecoded, idUnidade }: { cpfDecoded: string; idUnidade: string }) {
  const digitsOk = cpfDigitsOnly(cpfDecoded).length === 11 && !!idUnidade;
  const cpfDisplay =
    cpfDigitsOnly(cpfDecoded).length === 11 ? formatCpfMask(cpfDecoded) : cpfDecoded || '—';

  const [alreadyRegistered, setAlreadyRegistered] = useState<boolean | null>(() => (digitsOk ? null : false));

  useEffect(() => {
    if (!digitsOk) {
      return;
    }
    let cancelled = false;
    api
      .get<{ hasEmailCpf?: boolean }>('/account/exists/common', {
        params: { emailCpf: cpfDecoded },
      })
      .then(({ data }) => {
        if (!cancelled) {
          setAlreadyRegistered(!!data?.hasEmailCpf);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAlreadyRegistered(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [cpfDecoded, digitsOk]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await api.post('/account/register/common', {
        cpf: cpfDecoded,
        idUnidade: Number(idUnidade),
        senha: data.senha,
      });
      toast.success('Cadastro realizado! Faça login.');
      hardNavigateToAppPath('/login', 400);
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      toast.error(ax.response?.data?.message || 'Erro ao criar acesso');
    }
  };

  if (alreadyRegistered === true) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center space-y-4">
          <p className="text-gray-800 font-medium">Este CPF já possui cadastro na área do condômino.</p>
          <p className="text-gray-600 text-sm">Faça login ou recupere sua senha se necessário.</p>
          <div className="flex flex-col gap-2 pt-2">
            <a href="/login" className="btn-primary text-center">
              Ir para o login
            </a>
            <a href="/senha/esqueci" className="text-sm text-blue-600 hover:underline">
              Esqueci minha senha
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (alreadyRegistered === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center p-4 text-white text-sm">
        Verificando cadastro…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <h1 className="text-xl font-bold text-gray-800 mb-2">Criar Acesso</h1>
        <p className="text-gray-500 text-sm mb-6">
          Defina uma senha para seu primeiro acesso à unidade #{idUnidade || '—'}.
          <span className="block mt-2 text-gray-600">
            CPF: <span className="font-medium tabular-nums">{cpfDisplay}</span>
          </span>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Senha *</label>
            <input type="password" className="input" autoFocus {...register('senha')} />
            {errors.senha && <p className="text-red-500 text-xs mt-1">{errors.senha.message}</p>}
          </div>
          <div>
            <label className="label">Confirmar Senha *</label>
            <input type="password" className="input" {...register('confirmar')} />
            {errors.confirmar && <p className="text-red-500 text-xs mt-1">{errors.confirmar.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Criando acesso...' : 'Criar Acesso'}
          </button>
        </form>
      </div>
    </div>
  );
}
