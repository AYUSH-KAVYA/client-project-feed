import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, UserCheck, Code, LogIn, Sparkles } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-500 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-brand-500/20">
            P
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-white tracking-tight">
          ProjectFeed
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-rose-950/60 border border-rose-800 rounded-lg text-rose-300 text-sm">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@agency.com"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 focus:outline-none transition-all disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Quick-Fill Seed Accounts */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" /> Demo Seed Accounts (Click to Fill)
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-purple-400 font-semibold flex items-center gap-1 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Admin:
                </span>
                <button
                  type="button"
                  onClick={() => fillCredentials('admin@agency.com')}
                  className="w-full text-left px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded text-slate-300 hover:text-white transition-colors"
                >
                  admin@agency.com
                </button>
              </div>

              <div>
                <span className="text-blue-400 font-semibold flex items-center gap-1 mb-1">
                  <UserCheck className="w-3.5 h-3.5" /> Project Managers:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => fillCredentials('pm.sarah@agency.com')}
                    className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded text-slate-300 hover:text-white transition-colors truncate"
                  >
                    Sarah PM
                  </button>
                  <button
                    type="button"
                    onClick={() => fillCredentials('pm.david@agency.com')}
                    className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded text-slate-300 hover:text-white transition-colors truncate"
                  >
                    David PM
                  </button>
                </div>
              </div>

              <div>
                <span className="text-emerald-400 font-semibold flex items-center gap-1 mb-1">
                  <Code className="w-3.5 h-3.5" /> Developers:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => fillCredentials('dev.ravi@agency.com')}
                    className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded text-slate-300 hover:text-white transition-colors truncate"
                  >
                    Ravi
                  </button>
                  <button
                    type="button"
                    onClick={() => fillCredentials('dev.elena@agency.com')}
                    className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded text-slate-300 hover:text-white transition-colors truncate"
                  >
                    Elena
                  </button>
                  <button
                    type="button"
                    onClick={() => fillCredentials('dev.marcus@agency.com')}
                    className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded text-slate-300 hover:text-white transition-colors truncate"
                  >
                    Marcus
                  </button>
                  <button
                    type="button"
                    onClick={() => fillCredentials('dev.chloe@agency.com')}
                    className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded text-slate-300 hover:text-white transition-colors truncate"
                  >
                    Chloe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
