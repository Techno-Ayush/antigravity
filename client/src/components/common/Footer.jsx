import React from 'react';
import { Link } from 'react-router-dom';
import { Coins, Heart, RefreshCw, Shield, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center text-white">
                <Coins className="w-5 h-5 text-emerald-300" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">Peer-to-Peer Skill Exchange</span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              The free knowledge time-bank that solves the classic barter problem. 
              Teach what you know for 1 hour to earn 1 knowledge credit, and spend your credits learning anything from anyone.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-slate-800/80 w-fit px-3 py-1.5 rounded-full border border-emerald-500/20">
              <RefreshCw className="w-3.5 h-3.5" />
              1 Hour Teaching = +1 Credit = 1 Hour Learning
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/discover" className="hover:text-white transition-colors">
                  Explore Skills
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  Exchange Dashboard
                </Link>
              </li>
              <li>
                <Link to="/credits" className="hover:text-white transition-colors">
                  Time-Bank Ledger
                </Link>
              </li>
              <li>
                <Link to="/sessions" className="hover:text-white transition-colors">
                  Session Room
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Community */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-4">Trust & Ethics</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-1.5 text-slate-400">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Double-Confirmation Escrow</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-400">
                <Sparkles className="w-4 h-4 text-brand-400" />
                <span>Explainable Match Rules</span>
              </li>
              <li className="text-xs text-slate-500 pt-2 leading-relaxed">
                100% Free peer-learning platform. No monetization or paid barriers.
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Peer-to-Peer Skill Exchange. Built for open knowledge sharing.</p>
          <p className="flex items-center gap-1">
            Knowledge is meant to be shared freely.
          </p>
        </div>
      </div>
    </footer>
  );
}
