import React, { useState } from 'react';
import { Store, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export const LoginPage: React.FC = () => {
  const { login } = useAdmin();
  const [email, setEmail] = useState('admin@suruvelas.com.br');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const success = await login(email, password);
    if (!success) setError('Credenciais inválidas. Verifique seu email e senha.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F1F0E2] flex items-center justify-center p-4 font-['Plus_Jakarta_Sans']">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-[#56443F] items-center justify-center mb-4 shadow-lg">
            <Store size={26} className="text-white" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#56443F]">SURU Admin</h1>
          <p className="text-xs text-[#A28776] mt-1 tracking-wide uppercase">Painel Administrativo</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-[#E4C7B7]/30 p-8">
          <h2 className="text-lg font-bold text-[#56443F] mb-1">Bem-vindo de volta</h2>
          <p className="text-sm text-[#A28776] mb-6">Acesse o painel para gerenciar a loja.</p>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#56443F] mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A28776]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-[#E4C7B7]/40 bg-white text-sm text-[#56443F] focus:outline-none focus:border-[#8B645A] focus:ring-2 focus:ring-[#8B645A]/10 transition-all"
                  placeholder="admin@suruvelas.com.br"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#56443F] mb-1.5">Senha</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A28776]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-[#E4C7B7]/40 bg-white text-sm text-[#56443F] focus:outline-none focus:border-[#8B645A] focus:ring-2 focus:ring-[#8B645A]/10 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#56443F] text-white py-2.5 rounded-lg text-sm font-bold hover:bg-[#8B645A] transition-all disabled:opacity-50 shadow-sm"
            >
              {loading ? 'Entrando...' : 'Entrar'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#E4C7B7]/20">
            <p className="text-[11px] text-[#A28776] text-center">
              Acesso de demonstração: <span className="font-semibold text-[#56443F]">admin@suruvelas.com.br</span> / <span className="font-semibold text-[#56443F]">admin123</span>
            </p>
          </div>
        </div>

        <p className="text-center text-[11px] text-[#A28776] mt-6">
          <a href="/" className="hover:text-[#8B645A] transition-colors">← Voltar para a loja</a>
        </p>
      </div>
    </div>
  );
};
