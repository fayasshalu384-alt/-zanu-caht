import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { Lock, User, KeyRound, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle, Info } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login, users } = useChat();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!identifier.trim() || !password) {
      setError('Please provide your username/phone and password.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = login(identifier, password);
      if (!res.success) {
        setError(res.error || 'Invalid credentials. Contact your admin.');
        setLoading(false);
      }
    }, 400);
  };

  const handleQuickLogin = (uname: string, pass: string) => {
    setIdentifier(uname);
    setPassword(pass);
    login(uname, pass);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 p-4 select-none chat-pattern-dark">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col p-6 sm:p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-slate-950 shadow-xl shadow-emerald-500/20 mb-1">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Welcome to Zanu Chat</h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Enter with the username and password provided by your administrator. You can change your password anytime after logging in.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-rose-950/70 border border-rose-500/40 rounded-xl text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Username or Phone
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. alex_chen or +1 555-0192"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-3.5 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-10 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold rounded-2xl shadow-lg shadow-emerald-500/20 text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Sign In to Zanu Chat'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Accounts and Admin Credentials helper */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Info className="w-3.5 h-3.5 text-emerald-400" />
            <span>Admin-Provided Accounts (Click to test):</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleQuickLogin('alex_chen', 'admin123')}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
            >
              <div className="font-semibold text-emerald-400">Alex Chen (Admin)</div>
              <div className="text-[11px] text-slate-400 font-mono">alex_chen / admin123</div>
            </button>

            <button
              onClick={() => handleQuickLogin('sarah_c', 'wave123')}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
            >
              <div className="font-semibold text-white">Sarah Connor</div>
              <div className="text-[11px] text-slate-400 font-mono">sarah_c / wave123</div>
            </button>

            <button
              onClick={() => handleQuickLogin('marcus_b', 'wave123')}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
            >
              <div className="font-semibold text-white">Marcus Brody</div>
              <div className="text-[11px] text-slate-400 font-mono">marcus_b / wave123</div>
            </button>

            <button
              onClick={() => handleQuickLogin('elena_r', 'wave123')}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
            >
              <div className="font-semibold text-white">Elena Rostova</div>
              <div className="text-[11px] text-slate-400 font-mono">elena_r / wave123</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
