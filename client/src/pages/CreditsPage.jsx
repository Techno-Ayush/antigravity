import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Coins,
  TrendingUp,
  TrendingDown,
  Lock,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Clock
} from 'lucide-react';
import api from '../api/axiosInstance';
import CreditSummaryCard from '../components/cards/CreditSummaryCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';

export default function CreditsPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    fetchCreditData();
  }, []);

  const fetchCreditData = async () => {
    try {
      setLoading(true);
      const [sumRes, transRes] = await Promise.all([
        api.get('/credits/summary'),
        api.get('/credits/transactions?limit=50')
      ]);

      if (sumRes.data.success) setSummary(sumRes.data.summary);
      if (transRes.data.success) setTransactions(transRes.data.transactions);
    } catch (err) {
      console.error('Error fetching credit data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (filterType === 'EARN') return tx.type === 'EARN';
    if (filterType === 'SPEND') return tx.type === 'SPEND';
    if (filterType === 'HOLD') return tx.type === 'HOLD' || tx.type === 'RELEASE';
    return true;
  });

  if (loading) {
    return <LoadingSpinner text="Fetching immutable knowledge credit ledger..." />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-1 rounded-full text-xs font-bold text-emerald-800 mb-2">
          <Coins className="w-3.5 h-3.5 text-emerald-600" />
          <span>Core USP: Transparent Time-Bank Ledger</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Knowledge Credit Wallet & Ledger
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Credits represent verified hours of learning and teaching. Every transaction is immutable and audited on our server ledger.
        </p>
      </div>

      {/* Credit Summary & Economic Loop Card */}
      <CreditSummaryCard summary={summary} />

      {/* Transaction History Ledger Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-600" />
              <span>Immutable Ledger Timeline</span>
            </h3>
            <p className="text-xs text-slate-500">
              Audit log of credit holds, releases, earnings, and expenditures.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
            {['ALL', 'EARN', 'SPEND', 'HOLD'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-lg font-bold capitalize transition-all ${
                  filterType === type ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                {type.toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 italic">
            No transactions found matching this filter.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTransactions.map((tx) => {
              const isPositive = tx.type === 'EARN' || tx.type === 'BONUS' || tx.type === 'RELEASE';
              const isHold = tx.type === 'HOLD';
              const isSpend = tx.type === 'SPEND';

              return (
                <div key={tx._id} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isPositive
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : isHold
                          ? 'bg-amber-50 text-amber-600 border border-amber-200'
                          : 'bg-rose-50 text-rose-600 border border-rose-200'
                      }`}
                    >
                      {isPositive ? <TrendingUp className="w-5 h-5" /> : isHold ? <Lock className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    </div>

                    <div>
                      <p className="text-xs sm:text-sm font-bold text-slate-900">
                        {tx.description}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>{new Date(tx.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span>•</span>
                        <span>Type: {tx.type}</span>
                        <span>•</span>
                        <span>Balance after: {tx.balanceAfter} Cr</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-sm sm:text-base font-black ${
                        isPositive ? 'text-emerald-600' : isHold ? 'text-amber-600' : 'text-rose-600'
                      }`}
                    >
                      {isPositive ? `+${tx.amount}` : `-${tx.amount}`} Cr
                    </span>
                    <p className="text-[10px] text-slate-400">
                      {isPositive ? 'Earned/Released' : isHold ? 'Reserved Hold' : 'Spent'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Knowledge Currency FAQ Pill */}
      <div className="bg-slate-100/70 p-6 rounded-3xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-600">
        <div className="space-y-1">
          <p className="font-bold text-slate-900">How do Knowledge Credits work?</p>
          <p className="text-[11px] text-slate-500 max-w-xl">
            Credits are reserved in escrow when you book a session and only finalized when both participants confirm completion. If a session is cancelled according to fair policy, credits are automatically returned.
          </p>
        </div>
        <Link
          to="/discover"
          className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-xl border border-slate-200 shadow-2xs whitespace-nowrap"
        >
          Find Someone to Teach
        </Link>
      </div>
    </div>
  );
}
