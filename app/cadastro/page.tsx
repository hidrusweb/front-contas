'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import api from '../../lib/api';

const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

const schema = z.object({
  cpf: z.string().regex(cpfRegex, 'CPF inválido. Formato: 000.000.000-00'),
});

type FormData = z.infer<typeof schema>;

interface Unidade {
  id: number;
  unidade: string;
  endereco: string;
  condominio: string;
  agrupamento: string;
}

export default function CadastroPage() {
  const router = useRouter();
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'cpf' | 'units'>('cpf');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const cpf = watch('cpf');

  const onSubmitCpf = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await api.get('/Unit/condomino/disponiveis', {
        params: { emailCpf: data.cpf },
      });
      const list: Unidade[] = Array.isArray(res.data) ? res.data : [];
      if (list.length === 0) {
        toast.error('Nenhuma unidade disponível para este CPF.');
        return;
      }
      setUnidades(list);
      setStep('units');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'CPF não encontrado');
    } finally {
      setLoading(false);
    }
  };

  const selectUnit = (unidadeId: number) => {
    router.push(`/primeiro-acesso/${unidadeId}?cpf=${encodeURIComponent(cpf)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-800">Primeiro acesso</h1>
          <p className="text-gray-500 text-sm mt-1">
            {step === 'cpf' ? 'Informe seu CPF para encontrar sua unidade.' : 'Selecione sua unidade para continuar.'}
          </p>
        </div>

        {step === 'cpf' ? (
          <form onSubmit={handleSubmit(onSubmitCpf)} className="space-y-4">
            <div>
              <label className="label">CPF *</label>
              <input
                className="input"
                placeholder="000.000.000-00"
                {...register('cpf')}
              />
              {errors.cpf && <p className="text-red-500 text-xs mt-1">{errors.cpf.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Buscando...' : 'Continuar'}
            </button>
          </form>
        ) : (
          <div className="space-y-3">
            {unidades.map((u) => (
              <button
                key={u.id}
                onClick={() => selectUnit(u.id)}
                className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <p className="font-semibold text-gray-800">Unidade {u.unidade}</p>
                <p className="text-sm text-gray-500">{u.endereco}</p>
                <p className="text-xs text-gray-400">{u.condominio} — {u.agrupamento}</p>
              </button>
            ))}
          </div>
        )}

        <p className="mt-4 text-center text-sm">
          <a href="/login" className="text-blue-600 hover:underline">Já tenho acesso</a>
        </p>
      </div>
    </div>
  );
}
