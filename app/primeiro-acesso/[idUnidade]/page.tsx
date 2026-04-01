'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import api from '../../../lib/api';

const schema = z.object({
  senha: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmar: z.string(),
}).refine((d) => d.senha === d.confirmar, {
  message: 'Senhas não coincidem',
  path: ['confirmar'],
});

type FormData = z.infer<typeof schema>;

interface Props {
  params: Promise<{ idUnidade: string }>;
  searchParams: Promise<{ cpf?: string }>;
}

export default function PrimeiroAcessoPage({ params, searchParams }: Props) {
  const { idUnidade } = use(params);
  const { cpf } = use(searchParams);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await api.post('/account/register/common', {
        cpf: cpf ?? '',
        idUnidade: Number(idUnidade),
        senha: data.senha,
      });
      toast.success('Cadastro realizado! Faça login.');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao criar acesso');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <h1 className="text-xl font-bold text-gray-800 mb-2">Criar Acesso</h1>
        <p className="text-gray-500 text-sm mb-6">
          Defina uma senha para seu primeiro acesso à unidade #{idUnidade}.
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
