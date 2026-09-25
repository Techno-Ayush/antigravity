import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Filter, Sparkles, Plus, Clock, CheckCircle2 } from 'lucide-react';
import api from '../api/axiosInstance';
import SessionCard from '../components/cards/SessionCard';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import RatingModal from '../components/session/RatingModal';
import DoubleConfirmModal from '../components/session/DoubleConfirmModal';
import { useAuth } from '../context/AuthContext';

export default function SessionsPage() {
  const { refreshUser } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modals
  const [ratingSession, setRatingSession] = useState(null);
  const [confirmSession, setConfirmSession] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, [statusFilter, roleFilter]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (roleFilter === 'teaching') params.append('type', 'teaching');
      if (roleFilter === 'learning') params.append('type', 'learning');

      const res = await api.get(`/sessions?${params.toString()}`);
      if (res.data.success) {
        setSessions(res.data.sessions);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await api.patch(`/sessions/${id}/accept`);
      fetchSessions();
      refreshUser();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept session');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.patch(`/sessions/${id}/reject`, { reason: 'Teacher declined' });
      fetchSessions();
      refreshUser();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to decline session');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this session? Held credits will be released.')) return;
    try {
      await api.patch(`/sessions/${id}/cancel`, { reason: 'Cancelled by user' });
      fetchSessions();
      refreshUser();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel session');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Calendar className="w-7 h-7 text-indigo-600" />
            <span>Exchange Sessions</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your booked learning sessions and incoming teaching requests.
          </p>
        </div>

        <Link
          to="/discover"
          className="px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Learning Session</span>
        </Link>
      </div>

      {/* Filter Tabs & Role Pills */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
          {[
            { id: 'ALL', label: 'All Sessions' },
            { id: 'SCHEDULED', label: 'Scheduled' },
            { id: 'REQUESTED', label: 'Pending Requests' },
            { id: 'AWAITING_CONFIRMATION', label: 'Awaiting Confirm' },
            { id: 'COMPLETED', label: 'Completed' },
            { id: 'CANCELLED', label: 'Cancelled' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Role Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs">
          <button
            onClick={() => setRoleFilter('ALL')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              roleFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
            }`}
          >
            All Roles
          </button>
          <button
            onClick={() => setRoleFilter('teaching')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              roleFilter === 'teaching' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-500'
            }`}
          >
            🎓 Teaching
          </button>
          <button
            onClick={() => setRoleFilter('learning')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              roleFilter === 'learning' ? 'bg-white text-indigo-800 shadow-2xs' : 'text-slate-500'
            }`}
          >
            📖 Learning
          </button>
        </div>
      </div>

      {/* Sessions Content List */}
      {loading ? (
        <LoadingSpinner text="Loading session records..." />
      ) : sessions.length === 0 ? (
        <EmptyState
          type="no_sessions"
          title="No sessions found in this view."
          description="Ready to exchange knowledge? Find a community member who teaches what you want to learn!"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sessions.map((session) => (
            <SessionCard
              key={session._id}
              session={session}
              onAccept={handleAccept}
              onReject={handleReject}
              onCancel={handleCancel}
              onConfirmComplete={() => setConfirmSession(session)}
              onRate={() => setRatingSession(session)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {ratingSession && (
        <RatingModal
          isOpen={!!ratingSession}
          onClose={() => setRatingSession(null)}
          session={ratingSession}
          onRatingSuccess={() => {
            fetchSessions();
            refreshUser();
          }}
        />
      )}

      {confirmSession && (
        <DoubleConfirmModal
          isOpen={!!confirmSession}
          onClose={() => setConfirmSession(null)}
          session={confirmSession}
          onConfirmSuccess={() => {
            fetchSessions();
            refreshUser();
          }}
        />
      )}
    </div>
  );
}
