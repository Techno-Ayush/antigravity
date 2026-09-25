import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Coins,
  Calendar,
  Clock,
  Star,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Plus,
  RefreshCw,
  BookOpen
} from 'lucide-react';
import api from '../api/axiosInstance';
import MatchCard from '../components/cards/MatchCard';
import SessionCard from '../components/cards/SessionCard';
import SkillBadge from '../components/common/SkillBadge';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import BookingModal from '../components/session/BookingModal';
import RatingModal from '../components/session/RatingModal';
import DoubleConfirmModal from '../components/session/DoubleConfirmModal';

export default function DashboardPage() {
  const { user, spendableCredits, refreshUser } = useAuth();

  const [matches, setMatches] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [creditSummary, setCreditSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [bookingTeacher, setBookingTeacher] = useState(null);
  const [ratingSession, setRatingSession] = useState(null);
  const [confirmSession, setConfirmSession] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [matchesRes, sessionsRes, creditsRes, transRes] = await Promise.all([
        api.get('/matches?limit=4'),
        api.get('/sessions?limit=5'),
        api.get('/credits/summary'),
        api.get('/credits/transactions?limit=5')
      ]);

      if (matchesRes.data.success) setMatches(matchesRes.data.matches);
      if (sessionsRes.data.success) setUpcomingSessions(sessionsRes.data.sessions);
      if (creditsRes.data.success) setCreditSummary(creditsRes.data.summary);
      if (transRes.data.success) setRecentTransactions(transRes.data.transactions);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptSession = async (sessionId) => {
    try {
      await api.patch(`/sessions/${sessionId}/accept`);
      loadDashboardData();
      refreshUser();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept session');
    }
  };

  const handleRejectSession = async (sessionId) => {
    try {
      await api.patch(`/sessions/${sessionId}/reject`, { reason: 'Teacher unavailable' });
      loadDashboardData();
      refreshUser();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to decline session');
    }
  };

  const handleCancelSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to cancel? Held credits will be released.')) return;
    try {
      await api.patch(`/sessions/${sessionId}/cancel`, { reason: 'User cancelled' });
      loadDashboardData();
      refreshUser();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel session');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading knowledge dashboard & matches..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome & Motivational Time-Bank Core Loop Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              Active Time-Bank
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed">
            You currently have <strong className="text-emerald-400 font-bold">{spendableCredits} spendable credits</strong>. 
            Teach someone for 1 hour to earn more knowledge currency.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          <Link
            to="/discover"
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
          >
            <span>Learn With Credits</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/profile/edit"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/10 transition-colors"
          >
            Update Teach Skills
          </Link>
        </div>
      </div>

      {/* Top 5 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Spendable Credits */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Spendable</span>
            <Coins className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{spendableCredits}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {creditSummary?.reservedCredits > 0 ? `(${creditSummary.reservedCredits} held in escrow)` : 'Available to book'}
          </p>
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Sessions</span>
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {upcomingSessions.filter((s) => ['REQUESTED', 'SCHEDULED', 'AWAITING_CONFIRMATION'].includes(s.status)).length}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Active or scheduled</p>
        </div>

        {/* Teaching Hours */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Taught</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{creditSummary?.completedTeachingHours || 0}h</p>
          <p className="text-[10px] text-slate-400 mt-0.5">+{creditSummary?.earnedCredits || 0} credits earned</p>
        </div>

        {/* Learning Hours */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Learned</span>
            <BookOpen className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{creditSummary?.completedLearningHours || 0}h</p>
          <p className="text-[10px] text-slate-400 mt-0.5">-{creditSummary?.spentCredits || 0} credits spent</p>
        </div>

        {/* Rating */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Reputation</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{user?.rating?.toFixed(1) || '5.0'} ★</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{user?.reviewCount || 0} verified reviews</p>
        </div>
      </div>

      {/* Main Grid: Upcoming Sessions & Rule-Based Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Matches & Sessions */}
        <div className="lg:col-span-2 space-y-8">
          {/* Smart Rule-Based Matches */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-600" />
                  <span>Smart Rule-Based Matches</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Deterministic overlap between what you want to learn and what peers offer.
                </p>
              </div>
              <Link
                to="/discover"
                className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {matches.length === 0 ? (
              <EmptyState type="no_matches" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {matches.map((match) => (
                  <MatchCard
                    key={match.user._id}
                    match={match}
                    onRequestSession={(teacher) => setBookingTeacher(teacher)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Sessions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <span>Upcoming & Pending Sessions</span>
              </h3>
              <Link
                to="/sessions"
                className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1"
              >
                <span>Manage Sessions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {upcomingSessions.length === 0 ? (
              <EmptyState type="no_sessions" />
            ) : (
              <div className="space-y-3">
                {upcomingSessions.slice(0, 3).map((session) => (
                  <SessionCard
                    key={session._id}
                    session={session}
                    onAccept={handleAcceptSession}
                    onReject={handleRejectSession}
                    onCancel={handleCancelSession}
                    onConfirmComplete={(id) => setConfirmSession(session)}
                    onRate={(s) => setRatingSession(s)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Skills & Recent Ledger */}
        <div className="space-y-6">
          {/* User Skills Summary */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900">Your Skills Exchange</h3>
              <Link to="/profile/edit" className="text-xs text-brand-600 hover:underline font-bold">
                Edit
              </Link>
            </div>

            {/* Teaching */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 mb-2 flex items-center justify-between">
                <span>I Can Teach (+1 Cr)</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {user?.skillsOffered?.length || 0} skills
                </span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {user?.skillsOffered?.map((so, idx) => (
                  <SkillBadge
                    key={idx}
                    name={so.skill?.name || 'Skill'}
                    category={so.skill?.category || 'default'}
                    level={so.level}
                    size="sm"
                  />
                ))}
              </div>
            </div>

            {/* Learning Wishlist */}
            <div className="pt-2 border-t border-slate-100">
              <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 mb-2 flex items-center justify-between">
                <span>I Want to Learn (-1 Cr)</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {user?.skillsWanted?.length || 0} wishlist
                </span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {user?.skillsWanted?.map((sw, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium"
                  >
                    {sw.skill?.name || 'Skill'}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Credit Activity Ledger Feed */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-emerald-600" />
                <span>Recent Credit Ledger</span>
              </h3>
              <Link to="/credits" className="text-xs text-brand-600 hover:underline font-bold">
                View Ledger
              </Link>
            </div>

            <div className="space-y-3">
              {recentTransactions.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No credit transactions yet.</p>
              ) : (
                recentTransactions.map((tx) => (
                  <div key={tx._id} className="flex items-start justify-between gap-2 text-xs">
                    <div>
                      <p className="font-bold text-slate-800 line-clamp-1">{tx.description}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`font-black shrink-0 ${
                        tx.type === 'EARN' || tx.type === 'BONUS'
                          ? 'text-emerald-600'
                          : tx.type === 'SPEND'
                          ? 'text-rose-600'
                          : 'text-amber-600'
                      }`}
                    >
                      {tx.type === 'EARN' || tx.type === 'BONUS' ? `+${tx.amount}` : `-${tx.amount}`} Cr
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {bookingTeacher && (
        <BookingModal
          isOpen={!!bookingTeacher}
          onClose={() => setBookingTeacher(null)}
          teacher={bookingTeacher}
          onBookingSuccess={() => loadDashboardData()}
        />
      )}

      {ratingSession && (
        <RatingModal
          isOpen={!!ratingSession}
          onClose={() => setRatingSession(null)}
          session={ratingSession}
          onRatingSuccess={() => loadDashboardData()}
        />
      )}

      {confirmSession && (
        <DoubleConfirmModal
          isOpen={!!confirmSession}
          onClose={() => setConfirmSession(null)}
          session={confirmSession}
          onConfirmSuccess={() => loadDashboardData()}
        />
      )}
    </div>
  );
}
