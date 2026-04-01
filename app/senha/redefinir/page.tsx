'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import api from '../../../lib/api';

const schema = z.object({
  novaSenha: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmar: z.string(),
}).refine((d) => d.novaSenha === d.confirmar, {
  message: 'Senhas não coincidem',
  path: ['confirmar'],
});

type FormData = z.infer<typeof schema>;

interface Props {
  searchParams: Promise<{ urlKey?: string; token?: string; email?: string }>;
}

export default function RedefinirSenhaPage({ searchParams }: Props) {
  const { urlKey, token: tokenQ, email: emailQ } = use(searchParams);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    const token = tokenQ || urlKey;
    const email = emailQ;
    if (!token || !email) {
      toast.error('Link inválido: faltam token ou e-mail. Use o link enviado por e-mail.');
      return;
    }
    try {
      await api.post('/account/password/reset', {
        token,
        email,
        novaSenha: data.novaSenha,
        password_confirmation: data.novaSenha,
      });
      toast.success('Senha redefinida! Faça login.');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Token inválido ou expirado');
    }
  };

  if (!(tokenQ || urlKey) || !emailQ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center space-y-2">
          <p className="text-red-600 font-semibold">Link inválido ou expirado.</p>
          <p className="text-gray-600 text-sm">
            O e-mail de recuperação do Laravel inclui <code className="text-xs bg-gray-100 px-1">token</code> e{' '}
            <code className="text-xs bg-gray-100 px-1">email</code> na URL. Configure o template de e-mail para apontar para{' '}
            <code className="text-xs bg-gray-100 px-1">/senha/redefinir?token=...&email=...</code>.
          </p>
          <a href="/senha/esqueci" className="text-blue-600 hover:underline text-sm mt-4 block">
            Solicitar novo link
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <h1 className="text-xl font-bold text-gray-800 mb-2">Redefinir Senha</h1>
        <p className="text-gray-500 text-sm mb-6">Crie uma nova senha para sua conta.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Nova Senha *</label>
            <input type="password" className="input" autoFocus {...register('novaSenha')} />
            {errors.novaSenha && <p className="text-red-500 text-xs mt-1">{errors.novaSenha.message}</p>}
          </div>
          <div>
            <label className="label">Confirmar Senha *</label>
            <input type="password" className="input" {...register('confirmar')} />
            {errors.confirmar && <p className="text-red-500 text-xs mt-1">{errors.confirmar.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Redefinindo...' : 'Redefinir Senha'}
          </button>
        </form>
      </div>
    </div>
  );
}
