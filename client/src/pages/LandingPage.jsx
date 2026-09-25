import React from 'react';
import { Link } from 'react-router-dom';
import {
  Coins,
  ArrowRight,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Star,
  Users,
  CheckCircle2,
  Code,
  Music,
  Camera,
  Globe,
  BookOpen,
  Table,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-50/50 via-slate-50 to-white -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 px-4 py-1.5 rounded-full text-xs font-bold text-emerald-800 shadow-2xs animate-fade-in">
            <Coins className="w-3.5 h-3.5 text-emerald-600" />
            <span>The Free Knowledge Currency Economy • 1 Hour = 1 Credit</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            Your knowledge is <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">worth something.</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Teach what you know. Earn time credits. Learn what you want. A peer-to-peer knowledge bank where zero money changes hands.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-brand-600/25 hover:shadow-brand-600/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <span>{isAuthenticated ? 'Go to Dashboard' : 'Start Exchanging'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/discover"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm sm:text-base border border-slate-200 shadow-xs hover:shadow transition-all"
            >
              Explore Skills
            </Link>
          </div>

          {/* Quick Stat Pill */}
          <div className="pt-8 flex items-center justify-center gap-6 sm:gap-12 text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Free Starter Credits (+3)</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span>Double-Confirmation Trust</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>100% Explainable Matching</span>
            </div>
          </div>
        </div>
      </section>

      {/* The Core Mechanism: Visual Time-Bank */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-14 text-white shadow-2xl relative overflow-hidden">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/20">
              The Time / Credit Economy
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Knowledge is the Only Currency You Need
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              We replace monetary barriers with a time-banking ledger. Teach someone for 1 hour to earn 1 knowledge credit. Spend your credit learning anything from anyone else.
            </p>
          </div>

          {/* Visual Equation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center font-black text-xl">
                1h
              </div>
              <h3 className="font-bold text-base">You Teach for 1 Hour</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Offer your knowledge in JavaScript, Guitar, Spanish, Excel, or Cooking to a peer.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-emerald-500/30 flex flex-col items-center text-center space-y-3 relative">
              <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-emerald-500/30">
                +1
              </div>
              <h3 className="font-bold text-base text-emerald-300">You Earn 1 Credit</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Our double-confirmation escrow validates the session and immediately credits your wallet.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center font-black text-xl">
                1h
              </div>
              <h3 className="font-bold text-base">You Learn for 1 Hour</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Spend that credit learning Spanish or Calisthenics from an entirely different member.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Barter Problem Explained */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <span className="text-xs uppercase font-extrabold tracking-widest text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
              Why Skill Exchange?
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Solving the Classic Barter Problem
            </h2>
            <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
              <p>
                In direct barter, exchange requires a rare "double coincidence of wants":
              </p>
              <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-xl text-rose-950 font-medium text-xs sm:text-sm">
                "Rahul wants to learn Guitar from Priya, but Priya doesn’t want Rahul's Excel skill. Barter fails."
              </div>
              <p>
                Our <strong>Time-Bank Credit Economy</strong> breaks this impasse completely:
              </p>
              <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-xl text-emerald-950 font-medium text-xs sm:text-sm">
                "Rahul teaches Excel to Sneha → Rahul earns +1 credit. Rahul spends his credit learning Guitar from Priya!"
              </div>
            </div>
          </div>

          {/* Interactive Knowledge Cycle Diagram */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl relative">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 mb-6 text-center">
              The Asynchronous Credit Cycle
            </h3>

            <div className="flex flex-col items-center space-y-4">
              <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">1. Rahul teaches Sneha (Excel)</span>
                <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">+1 Credit to Rahul</span>
              </div>

              <div className="flex items-center justify-center text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin text-brand-600" style={{ animationDuration: '8s' }} />
              </div>

              <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">2. Rahul learns from Priya (Guitar)</span>
                <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">-1 Credit from Rahul</span>
              </div>

              <div className="flex items-center justify-center text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin text-brand-600" style={{ animationDuration: '8s' }} />
              </div>

              <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">3. Priya learns from Amit (Spanish)</span>
                <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">+1 Credit to Amit</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center mt-6">
              Knowledge recirculates continuously without monetary friction.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works: 5 Clear Steps */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs uppercase font-extrabold tracking-widest text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Simple 5-Step Process
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            How Peer-to-Peer Exchange Works
          </h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            From listing your expertise to your first hour of learning in minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { step: '01', title: 'Add Skills You Teach', desc: 'List your practical skills with your experience level.' },
            { step: '02', title: 'Add Skills You Want', desc: 'Add wishlist skills you have always wanted to pick up.' },
            { step: '03', title: 'Get Smart Matches', desc: 'Explainable rule-based scoring pairs you with ideal peers.' },
            { step: '04', title: 'Teach to Earn', desc: 'Teach 1 hour to earn 1 knowledge credit in your ledger.' },
            { step: '05', title: 'Spend & Learn', desc: 'Spend your credits learning from community mentors.' }
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2 hover:border-brand-300 hover:shadow-md transition-all"
            >
              <span className="text-2xl font-black text-brand-600">{item.step}</span>
              <h3 className="font-extrabold text-sm text-slate-900">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-600 to-indigo-600 rounded-3xl p-10 sm:p-14 text-white text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="inline-flex items-center gap-1.5 bg-brand-700/60 text-emerald-300 px-3.5 py-1 rounded-full text-xs font-bold">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Join 20+ Early Peer Learners in India</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight max-w-2xl mx-auto">
            Ready to turn what you know into what you want to learn?
          </h2>
          <p className="text-sm sm:text-base text-brand-100 max-w-xl mx-auto">
            Sign up now and receive 3 bonus knowledge credits to jumpstart your learning journey immediately.
          </p>
          <div className="pt-2">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white text-brand-700 font-extrabold text-sm sm:text-base shadow-lg hover:bg-brand-50 hover:shadow-xl transition-all"
            >
              <span>Get 3 Starter Credits Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
