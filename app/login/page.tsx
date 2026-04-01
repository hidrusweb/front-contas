'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import api from '../../lib/api';

const schema = z.object({
  emailCpf: z.string().min(1, 'Informe e-mail ou CPF'),
  senha: z.string().min(1, 'Informe a senha'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await api.post('/account/login/common', {
        emailCpf: data.emailCpf,
        senha: data.senha,
      });
      const token: string =
        res.data.accessToken ?? res.data.token ?? res.data.access_token ?? res.data;
      localStorage.setItem('contas_token', token);
      router.push('/');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Credenciais inválidas';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">H</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Hidrus</h1>
          <p className="text-gray-500 text-sm mt-1">Área do Condômino</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">E-mail ou CPF</label>
            <input
              autoComplete="username"
              placeholder="seu@email.com ou 000.000.000-00"
              className="input"
              {...register('emailCpf')}
            />
            {errors.emailCpf && <p className="text-red-500 text-xs mt-1">{errors.emailCpf.message}</p>}
          </div>

          <div>
            <label className="label">Senha</label>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="••••••"
              className="input"
              {...register('senha')}
            />
            {errors.senha && <p className="text-red-500 text-xs mt-1">{errors.senha.message}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary mt-2">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 space-y-2 text-center text-sm">
          <a href="/cadastro" className="text-blue-600 hover:underline block">
            Primeiro acesso? Cadastre-se
          </a>
          <a href="/alterar-senha" className="text-gray-500 hover:underline block">
            Alterar senha
          </a>
          <a href="/senha/esqueci" className="text-gray-500 hover:underline block">
            Esqueci minha senha
          </a>
        </div>
      </div>
    </div>
  );
}
