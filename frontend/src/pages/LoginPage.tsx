import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState<string>('');

  // Clock for real-time terminal timestamp
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.auth.login({ email, password });
      const token = response.data?.accessToken || response.data?.token;
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('accessToken', token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/');
      } else {
        setError('Token tidak ditemukan dalam respon server.');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal masuk. Periksa email dan kata sandi Anda.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex h-screen w-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans select-none">
      {/* LEFT: Industrial Form Panel (400px) */}
      <div className="w-full md:w-[420px] flex-shrink-0 h-full bg-zinc-950 border-r border-zinc-800 p-8 sm:p-12 flex flex-col justify-between z-10">
        {/* Top Header & Logo */}
        <div>
          <div className="flex items-center gap-2 mb-8">
            <div className="h-6 w-6 bg-zinc-100 flex items-center justify-center font-mono font-bold text-zinc-950 text-xs rounded-sm">
              W
            </div>
            <span className="font-mono font-bold text-sm tracking-wider text-zinc-100 uppercase">
              WMS CONTROL
            </span>
          </div>

          <div className="mb-6">
            <h1 className="text-xl font-bold tracking-wider text-zinc-100 uppercase">
              MASUK SISTEM
            </h1>
            <p className="text-xs text-zinc-400 mt-1 font-sans">
              Gunakan kredensial Anda untuk melanjutkan
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {error && (
              <div className="p-2.5 bg-red-950/50 border border-red-800 rounded-sm text-xs text-red-300 flex items-center gap-2 font-mono">
                <AlertCircle size={14} className="flex-shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                ALAMAT EMAIL
              </label>
              <input
                type="email"
                placeholder="nama@perusahaan.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`h-10 px-3 text-xs bg-zinc-900 text-zinc-100 border rounded-sm font-mono focus:outline-none focus:ring-1 focus:ring-accent ${
                  error && !email ? 'border-red-600' : 'border-zinc-800 focus:border-accent'
                }`}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                KATA SANDI
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`h-10 px-3 text-xs bg-zinc-900 text-zinc-100 border rounded-sm font-mono focus:outline-none focus:ring-1 focus:ring-accent ${
                  error && !password ? 'border-red-600' : 'border-zinc-800 focus:border-accent'
                }`}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-10 w-full mt-2 font-mono font-bold text-xs tracking-wider uppercase bg-zinc-100 text-zinc-900 hover:bg-zinc-200 rounded-sm shadow-none"
            >
              {loading ? 'MEMVERIFIKASI...' : 'MASUK KE WORKSPACE'}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-zinc-800/50 flex items-center justify-between text-[11px] font-mono text-zinc-600">
          <span>WMS CONTROL</span>
          <span className="flex items-center gap-1 text-zinc-500">
            <ShieldCheck size={12} className="text-accent" /> SECURE NODE
          </span>
        </div>
      </div>

      {/* RIGHT: Utilitarian Industrial Readout Visual */}
      <div className="hidden md:flex flex-1 h-full bg-zinc-900 relative items-center justify-center p-12 overflow-hidden">
        {/* Subtle SVG Grid Background */}
        <svg
          className="absolute inset-0 w-full h-full stroke-zinc-800/40 [mask-image:radial-gradient(ellipse_at_center,white,transparent_85%)]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" strokeWidth="0.75" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Center Terminal Readout Card */}
        <div className="relative z-10 max-w-lg w-full bg-zinc-950/80 border border-zinc-800 p-6 rounded-sm backdrop-blur-none font-mono">
          <div className="flex items-center justify-between text-[11px] text-zinc-500 border-b border-zinc-800 pb-2 mb-4">
            <span>TERMINAL ID: SSG-NODE-01</span>
            <span className="text-accent font-bold animate-pulse">● LIVE</span>
          </div>

          <div className="flex flex-col gap-1 text-zinc-300 text-xs">
            <div className="text-zinc-500 text-[10px] tracking-widest uppercase">SYSTEM CORE</div>
            <div className="text-base font-bold text-zinc-100 tracking-wider">
              INVENTORY CONTROL & LOGISTICS
            </div>
            <div className="text-[11px] text-zinc-400">
              LOCATION: WAREHOUSE-MAIN (ID-JKT)
            </div>
          </div>

          <div className="my-4 text-zinc-700 text-xs select-none">
            ─────────────────────────────────────────────
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block">TIMESTAMP</span>
              <span className="text-zinc-300">{time || '2026-09-18 00:00:00 UTC'}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block">NODE STATUS</span>
              <span className="text-emerald-500 font-bold">ONLINE / HEALTHY</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block">FIFO ENGINE</span>
              <span className="text-zinc-300">ACTIVE (STRICT)</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block">DB CLUSTER</span>
              <span className="text-zinc-300">NEON-SERVERLESS WS</span>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500">
            <span>ISOLATION LEVEL: SERIALIZABLE</span>
            <span>PORTFOLIO BUILD</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
