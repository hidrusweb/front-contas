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
  senhaAtual: z.string().min(1, 'Informe a senha atual'),
  novaSenha: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmar: z.string(),
}).refine((d) => d.novaSenha === d.confirmar, {
  message: 'Senhas não coincidem',
  path: ['confirmar'],
});

type FormData = z.infer<typeof schema>;

export default function AlterarSenhaPage() {
  const router = useRouter();
  const [step, setStep] = useState<'validate' | 'change'>('validate');
  const [validatedUser, setValidatedUser] = useState('');
  const [checking, setChecking] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const emailCpf = watch('emailCpf');

  const validateUser = async () => {
    if (!emailCpf) { toast.error('Informe e-mail ou CPF'); return; }
    setChecking(true);
    try {
      const { data } = await api.get('/account/exists/common', { params: { emailCpf } });
      if (!data?.hasEmailCpf) {
        toast.error('Usuário não encontrado ou sem cadastro de condômino.');
        return;
      }
      setValidatedUser(emailCpf);
      setStep('change');
    } catch {
      toast.error('Usuário não encontrado');
    } finally {
      setChecking(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      await api.put('/account/change-password', {
        emailCpf: validatedUser,
        senhaAtual: data.senhaAtual,
        novaSenha: data.novaSenha,
      });
      toast.success('Senha alterada com sucesso!');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao alterar senha');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <h1 className="text-xl font-bold text-gray-800 mb-2">Alterar Senha</h1>
        <p className="text-gray-500 text-sm mb-6">
          {step === 'validate' ? 'Informe seu e-mail ou CPF para continuar.' : `Alterando senha para: ${validatedUser}`}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">E-mail ou CPF *</label>
            <div className="flex gap-2">
              <input
                className="input"
                placeholder="seu@email.com ou 000.000.000-00"
                disabled={step === 'change'}
                {...register('emailCpf')}
              />
              {step === 'validate' && (
                <button
                  type="button"
                  onClick={validateUser}
                  disabled={checking}
                  className="shrink-0 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-60"
                >
                  {checking ? '...' : 'Verificar'}
                </button>
              )}
            </div>
          </div>

          {step === 'change' && (
            <>
              <div>
                <label className="label">Senha atual *</label>
                <input type="password" className="input" {...register('senhaAtual')} />
                {errors.senhaAtual && <p className="text-red-500 text-xs mt-1">{errors.senhaAtual.message}</p>}
              </div>
              <div>
                <label className="label">Nova Senha *</label>
                <input type="password" className="input" {...register('novaSenha')} />
                {errors.novaSenha && <p className="text-red-500 text-xs mt-1">{errors.novaSenha.message}</p>}
              </div>
              <div>
                <label className="label">Confirmar Nova Senha *</label>
                <input type="password" className="input" {...register('confirmar')} />
                {errors.confirmar && <p className="text-red-500 text-xs mt-1">{errors.confirmar.message}</p>}
              </div>
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? 'Salvando...' : 'Alterar Senha'}
              </button>
            </>
          )}
        </form>

        <p className="mt-4 text-center text-sm">
          <a href="/login" className="text-blue-600 hover:underline">Voltar ao login</a>
        </p>
      </div>
    </div>
  );
}
