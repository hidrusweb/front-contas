'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import api from '../../../lib/api';

const schema = z.object({
  email: z.string().email('E-mail inválido'),
});

type FormData = z.infer<typeof schema>;

export default function EsqueciSenhaPage() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await api.post('/account/password/forgot', { email: data.email });
      setSent(true);
    } catch {
      toast.error('Erro ao enviar e-mail. Verifique o endereço informado.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <h1 className="text-xl font-bold text-gray-800 mb-2">Esqueci minha senha</h1>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-3xl">✓</span>
            </div>
            <p className="text-gray-600 text-sm">
              Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.
            </p>
            <a href="/login" className="text-blue-600 hover:underline text-sm">Voltar ao login</a>
          </div>
        ) : (
          <>
            <p className="text-gray-500 text-sm mb-6">
              Informe seu e-mail para receber o link de redefinição de senha.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">E-mail *</label>
                <input type="email" className="input" placeholder="seu@email.com" {...register('email')} />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? 'Enviando...' : 'Enviar link'}
              </button>
            </form>
            <p className="mt-4 text-center text-sm">
              <a href="/login" className="text-blue-600 hover:underline">Voltar ao login</a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
