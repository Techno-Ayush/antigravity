import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  CheckCircle,
  Coins,
  ArrowLeft,
  ShieldCheck,
  MessageSquare,
  AlertTriangle,
  User
} from 'lucide-react';
import api from '../api/axiosInstance';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DoubleConfirmModal from '../components/session/DoubleConfirmModal';
import RatingModal from '../components/session/RatingModal';
import { useAuth } from '../context/AuthContext';

export default function SessionDetailPage() {
  const { id } = useParams();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');

  useEffect(() => {
    fetchSession();
  }, [id]);

  const fetchSession = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/sessions/${id}`);
      if (res.data.success) {
        setSession(res.data.session);
      }
    } catch (err) {
      console.error('Error fetching session:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDisputeSubmit = async (e) => {
    e.preventDefault();
    if (!disputeReason.trim()) return;

    try {
      await api.patch(`/sessions/${id}/dispute`, { reason: disputeReason.trim() });
      setDisputeOpen(false);
      fetchSession();
      alert('Dispute submitted for admin review.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit dispute');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading session specifications..." />;
  }

  if (!session) {
    return (
      <div className="py-20 text-center space-y-3">
        <h2 className="text-xl font-bold text-slate-800">Session Not Found</h2>
        <Link to="/sessions" className="text-sm font-semibold text-brand-600 hover:underline">
          Return to Sessions
        </Link>
      </div>
    );
  }

  const isTeacher = session.teacher?._id?.toString() === user?._id?.toString();
  const counterparty = isTeacher ? session.learner : session.teacher;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link
        to="/sessions"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Sessions</span>
      </Link>

      {/* Main Session Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-800">
                {session.status}
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {session.creditAmount} Credit{session.creditAmount > 1 ? 's' : ''} ({session.duration} hr)
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {session.skill?.name || 'Skill Exchange Session'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">Topic: "{session.topic}"</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/chat"
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat</span>
            </Link>
            {(session.status === 'SCHEDULED' || session.status === 'AWAITING_CONFIRMATION') && (
              <button
                onClick={() => setConfirmOpen(true)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Confirm Completion</span>
              </button>
            )}
            {session.status === 'COMPLETED' && (
              <button
                onClick={() => setRatingOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs"
              >
                ★ Leave Review
              </button>
            )}
          </div>
        </div>

        {/* Double-Confirmation Status Box */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Double-Confirmation Protocol
            </span>
            <span className="text-xs font-bold text-slate-500">
              {session.teacherConfirmed && session.learnerConfirmed
                ? 'Both Parties Confirmed ✓'
                : 'Awaiting Mutual Confirmation'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <p className="font-bold text-slate-900">Teacher: {session.teacher?.name}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {session.teacherConfirmed
                  ? `Confirmed at ${new Date(session.teacherConfirmedAt).toLocaleTimeString()}`
                  : 'Pending confirmation'}
              </p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <p className="font-bold text-slate-900">Learner: {session.learner?.name}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {session.learnerConfirmed
                  ? `Confirmed at ${new Date(session.learnerConfirmedAt).toLocaleTimeString()}`
                  : 'Pending confirmation'}
              </p>
            </div>
          </div>
        </div>

        {/* Schedule & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <p className="text-[11px] font-bold uppercase text-slate-400">Date & Time</p>
            <p className="font-extrabold text-slate-900 text-sm">
              {new Date(session.scheduledDate).toLocaleDateString()}
            </p>
            <p className="text-slate-500">{session.startTime} ({session.duration} hr)</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 sm:col-span-2">
            <p className="text-[11px] font-bold uppercase text-slate-400">Connection Mode</p>
            {session.mode === 'ONLINE' ? (
              <div className="space-y-1">
                <p className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5 text-brand-600">
                  <Video className="w-4 h-4" />
                  Online Video Exchange
                </p>
                {session.meetingLink && (
                  <a
                    href={session.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-brand-600 underline font-medium break-all hover:text-brand-800"
                  >
                    {session.meetingLink}
                  </a>
                )}
              </div>
            ) : (
              <div>
                <p className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5 text-rose-600">
                  <MapPin className="w-4 h-4" />
                  In-Person Meetup
                </p>
                <p className="text-slate-500">{session.location || 'Location specified by participants'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Counterparty card */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={counterparty?.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
              alt={counterparty?.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
            />
            <div>
              <p className="text-xs font-bold text-slate-900">{counterparty?.name}</p>
              <p className="text-[10px] text-slate-400">
                {isTeacher ? 'Learner in this session' : 'Teacher in this session'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDisputeOpen(true)}
              className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Report Issue</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dispute Modal */}
      {disputeOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">File a Session Dispute</h3>
            <p className="text-xs text-slate-500">
              If the counterparty did not show up or there was an issue, describe it below. Our administrator will review and adjust escrow credits accordingly.
            </p>
            <textarea
              rows="3"
              required
              placeholder="e.g. Teacher did not attend the scheduled video call..."
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDisputeOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDisputeSubmit}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 rounded-xl"
              >
                Submit Dispute
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmOpen && (
        <DoubleConfirmModal
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          session={session}
          onConfirmSuccess={() => {
            fetchSession();
            refreshUser();
          }}
        />
      )}

      {ratingOpen && (
        <RatingModal
          isOpen={ratingOpen}
          onClose={() => setRatingOpen(false)}
          session={session}
          onRatingSuccess={() => {
            fetchSession();
            refreshUser();
          }}
        />
      )}
    </div>
  );
}
