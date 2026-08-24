import { useState } from 'react';
import { Eye, EyeOff, Gavel, Lock, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { verifyOfficialLogin } from '@/lib/verifyLogin';
import type { Official } from '@/types/official';

export type { Official };

type Tab = 'police' | 'court';

const TAB_COPY: Record<Tab, { label: string; idLabel: string; placeholder: string }> = {
  police: { label: 'Police Official', idLabel: 'Badge ID', placeholder: 'e.g. PD-1042' },
  court: { label: 'Court Official', idLabel: 'Court ID', placeholder: 'e.g. CRT-5001' },
};

export default function Login({ onLogin }: { onLogin: (official: Official) => void }) {
  const [tab, setTab] = useState<Tab>('police');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const copy = TAB_COPY[tab];

  const switchTab = (next: Tab) => {
    setTab(next);
    setIdentifier('');
    setPassword('');
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!identifier.trim() || !password) {
      setError(`Enter your ${copy.idLabel} and password.`);
      return;
    }
    setLoading(true);
    setError('');
    const result = await verifyOfficialLogin(tab, identifier, password);
    setLoading(false);

    if (!result.ok) {
      setError(
        result.reason === 'invalid'
          ? 'Invalid credentials. Please check your ID and password.'
          : 'Something went wrong signing you in. Please try again.',
      );
      return;
    }

    onLogin(result.official);
  };

  const fillDemo = (demoTab: Tab, demoId: string, demoPass: string) => {
    setTab(demoTab);
    setIdentifier(demoId);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003c36] via-[#0b423c] to-[#00251f] px-4 py-10">
      <p className="mb-8 text-center text-lg font-semibold text-white/70">Digital Justice Network — Secure Portal</p>

      <div className="mx-auto w-full max-w-[560px] overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="grid grid-cols-2">
          <button
            type="button"
            onClick={() => switchTab('police')}
            className={`flex items-center justify-center gap-2 border-b-2 py-5 text-sm font-bold transition sm:text-base ${
              tab === 'police' ? 'border-[#18a765] bg-white text-[#003c36]' : 'border-transparent bg-slate-50 text-slate-500 hover:text-slate-700'
            }`}
          >
            <ShieldCheck size={20} className={tab === 'police' ? 'text-[#18a765]' : 'text-slate-400'} />
            Police Official
          </button>
          <button
            type="button"
            onClick={() => switchTab('court')}
            className={`flex items-center justify-center gap-2 border-b-2 py-5 text-sm font-bold transition sm:text-base ${
              tab === 'court' ? 'border-[#18a765] bg-white text-[#003c36]' : 'border-transparent bg-slate-50 text-slate-500 hover:text-slate-700'
            }`}
          >
            <Gavel size={20} className={tab === 'court' ? 'text-[#18a765]' : 'text-slate-400'} />
            Court Official
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-7 py-8 sm:px-10">
          <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{copy.idLabel}</label>
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 focus-within:border-[#18a765] focus-within:bg-white">
            {tab === 'police' ? <ShieldCheck size={18} className="text-slate-400" /> : <Gavel size={18} className="text-slate-400" />}
            <input
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder={copy.placeholder}
              autoComplete="username"
              className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
          </div>

          <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Password</label>
          <div className="mb-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 focus-within:border-[#18a765] focus-within:bg-white">
            <Lock size={18} className="text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
            <button type="button" onClick={() => setShowPassword((value) => !value)} className="text-slate-400 hover:text-slate-600" aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <div className="mb-2 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#075e51] py-4 text-sm font-bold text-white shadow-lg transition hover:bg-[#00483f] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Signing in…' : 'Sign In'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="border-t border-slate-100 bg-slate-50 px-7 py-7 sm:px-10">
          <p className="mb-4 text-center text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Demo credentials</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <button type="button" onClick={() => fillDemo('police', 'PD-1042', 'police123')} className="rounded-xl border border-slate-200 bg-white p-4 text-center transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="mb-1 flex items-center justify-center gap-1.5 text-sm font-bold text-[#003c36]"><ShieldCheck size={15} className="text-[#18a765]" /> Delhi Police</p>
              <p className="text-xs text-slate-500">Badge: <b className="text-slate-700">PD-1042</b></p>
              <p className="text-xs text-slate-500">Pass: <b className="text-slate-700">police123</b></p>
            </button>
            <button type="button" onClick={() => fillDemo('police', 'PD-2088', 'police123')} className="rounded-xl border border-slate-200 bg-white p-4 text-center transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="mb-1 flex items-center justify-center gap-1.5 text-sm font-bold text-[#003c36]"><ShieldCheck size={15} className="text-[#18a765]" /> Mumbai Police</p>
              <p className="text-xs text-slate-500">Badge: <b className="text-slate-700">PD-2088</b></p>
              <p className="text-xs text-slate-500">Pass: <b className="text-slate-700">police123</b></p>
            </button>
            <button type="button" onClick={() => fillDemo('court', 'CRT-5001', 'court123')} className="rounded-xl border border-slate-200 bg-white p-4 text-center transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="mb-1 flex items-center justify-center gap-1.5 text-sm font-bold text-[#003c36]"><Gavel size={15} className="text-[#18a765]" /> Court</p>
              <p className="text-xs text-slate-500">Court: <b className="text-slate-700">CRT-5001</b></p>
              <p className="text-xs text-slate-500">Pass: <b className="text-slate-700">court123</b></p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
