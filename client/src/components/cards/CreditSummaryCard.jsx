import React from 'react';
import { Coins, Lock, TrendingUp, TrendingDown, Clock, Sparkles } from 'lucide-react';

export default function CreditSummaryCard({ summary }) {
  const {
    totalCredits = 0,
    reservedCredits = 0,
    spendableCredits = 0,
    earnedCredits = 0,
    spentCredits = 0,
    completedTeachingHours = 0,
    completedLearningHours = 0
  } = summary || {};

  return (
    <div className="space-y-4">
      {/* Motivational Knowledge Loop Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
              Core Economic Principle
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white pt-1">
              Your Knowledge Becomes Currency
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              1 hour of teaching equals 1 credit. No real money changes hands. Teach someone what you know to earn credits, then spend them learning something new.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/15">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-300 font-medium">Available Balance</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-emerald-400">{spendableCredits}</span>
                <span className="text-xs font-bold text-slate-200">Credits</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Credit Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Spendable Credits */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Spendable</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{spendableCredits}</p>
          <p className="text-[11px] text-slate-500 mt-1">Ready to book learning sessions</p>
        </div>

        {/* Reserved in Escrow */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">In Escrow</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600">{reservedCredits}</p>
          <p className="text-[11px] text-slate-500 mt-1">Held for upcoming sessions</p>
        </div>

        {/* Total Earned (Teaching) */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Earned</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">+{earnedCredits}</p>
          <p className="text-[11px] text-slate-500 mt-1">{completedTeachingHours} hours taught</p>
        </div>

        {/* Total Spent (Learning) */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Spent</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">-{spentCredits}</p>
          <p className="text-[11px] text-slate-500 mt-1">{completedLearningHours} hours learned</p>
        </div>
      </div>
    </div>
  );
}
