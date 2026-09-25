import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Coins, AlertCircle, ArrowRight, Lock, Mail, Sparkles, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      if (data.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    // Instant submission
    login(demoEmail, demoPass)
      .then((data) => {
        if (data.user.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || 'Demo login failed');
      });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-md">
            <Coins className="w-6 h-6 text-emerald-300" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Welcome back to SkillExchange
          </h2>
          <p className="text-xs text-slate-500">
            Sign in to check your credits and exchange knowledge
          </p>
        </div>

        {/* 1-Click Demo Profiles for Viva & Testing */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-brand-600" />
              1-Click Demo Profiles (For Testing)
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickLogin('rahul@example.com', 'password123')}
              className="p-2 text-left rounded-xl bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-300 transition-colors"
            >
              <p className="font-bold text-slate-800">Rahul Sharma</p>
              <p className="text-[10px] text-slate-500">Teaches JS, React, Excel</p>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('priya@example.com', 'password123')}
              className="p-2 text-left rounded-xl bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-300 transition-colors"
            >
              <p className="font-bold text-slate-800">Priya Patel</p>
              <p className="text-[10px] text-slate-500">Teaches Guitar, UI/UX</p>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('amit@example.com', 'password123')}
              className="p-2 text-left rounded-xl bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-300 transition-colors"
            >
              <p className="font-bold text-slate-800">Amit Verma</p>
              <p className="text-[10px] text-slate-500">Teaches Spanish, English</p>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@skillexchange.in', 'admin123')}
              className="p-2 text-left rounded-xl bg-amber-50/70 hover:bg-amber-100 border border-amber-200 transition-colors"
            >
              <p className="font-bold text-amber-900">Admin Console</p>
              <p className="text-[10px] text-amber-700">Platform Moderation</p>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs sm:text-sm pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs sm:text-sm pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-xs sm:text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-6 text-center text-xs text-slate-500 border-t border-slate-100 mt-6">
            New to SkillExchange?{' '}
            <Link to="/register" className="text-brand-600 font-bold hover:underline">
              Create an account (+3 free credits)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
