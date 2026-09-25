import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  ShieldAlert,
  Coins,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const statusConfig = {
  REQUESTED: { label: 'Requested', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
  ACCEPTED: { label: 'Accepted', bg: 'bg-blue-50 text-blue-800 border-blue-200' },
  SCHEDULED: { label: 'Scheduled', bg: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  IN_PROGRESS: { label: 'In Progress', bg: 'bg-purple-50 text-purple-800 border-purple-200' },
  AWAITING_CONFIRMATION: { label: 'Awaiting Double Confirmation', bg: 'bg-amber-100 text-amber-900 border-amber-300' },
  COMPLETED: { label: 'Completed & Settled', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-slate-100 text-slate-600 border-slate-200' },
  REJECTED: { label: 'Declined', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
  DISPUTED: { label: 'Under Dispute', bg: 'bg-red-100 text-red-900 border-red-300' }
};

export default function SessionCard({
  session,
  onAccept,
  onReject,
  onCancel,
  onConfirmComplete,
  onRate,
  onDispute
}) {
  const { user } = useAuth();
  const currentUserId = user?._id?.toString();

  const isTeacher = session.teacher?._id?.toString() === currentUserId;
  const isLearner = session.learner?._id?.toString() === currentUserId;
  const counterparty = isTeacher ? session.learner : session.teacher;

  const status = statusConfig[session.status] || { label: session.status, bg: 'bg-slate-100 text-slate-700' };

  const hasConfirmed = isTeacher ? session.teacherConfirmed : session.learnerConfirmed;
  const counterpartyConfirmed = isTeacher ? session.learnerConfirmed : session.teacherConfirmed;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-6 space-y-4">
      {/* Top Bar: Role Pill, Status, & Credit Amount */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
              isTeacher
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
            }`}
          >
            {isTeacher ? '🎓 You are Teaching' : '📖 You are Learning'}
          </span>
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${status.bg}`}>
            {status.label}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
          <Coins className="w-3.5 h-3.5 text-emerald-600" />
          <span>
            {session.creditAmount} Credit{session.creditAmount > 1 ? 's' : ''} ({session.duration} hr)
          </span>
        </div>
      </div>

      {/* Main Details: Skill, Topic, Participants */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
            {session.skill?.name || 'Skill Exchange'}
          </h4>
          <p className="text-xs text-slate-600 mt-0.5 italic">"{session.topic}"</p>
        </div>

        <div className="flex items-center gap-3">
          <img
            src={counterparty?.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
            alt={counterparty?.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
          />
          <div>
            <p className="text-xs text-slate-500 font-medium">{isTeacher ? 'Learner:' : 'Teacher:'}</p>
            <Link
              to={`/profile/${counterparty?._id}`}
              className="text-xs font-bold text-slate-900 hover:text-brand-600 transition-colors"
            >
              {counterparty?.name}
            </Link>
          </div>
        </div>
      </div>

      {/* Date, Time, and Venue/Meet Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>{new Date(session.scheduledDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>{session.startTime} ({session.duration} hour session)</span>
        </div>
        <div className="flex items-center gap-2 sm:col-span-2">
          {session.mode === 'ONLINE' ? (
            <>
              <Video className="w-4 h-4 text-brand-500" />
              <span className="truncate">
                Online Video:{' '}
                {session.meetingLink ? (
                  <a
                    href={session.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-600 underline font-medium hover:text-brand-800"
                  >
                    Open Meeting Link
                  </a>
                ) : (
                  'Meeting link generated upon acceptance'
                )}
              </span>
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4 text-rose-500" />
              <span className="truncate">In-Person: {session.location || 'Location TBD by participants'}</span>
            </>
          )}
        </div>
      </div>

      {/* Double Confirmation Status Notice */}
      {(session.status === 'SCHEDULED' || session.status === 'AWAITING_CONFIRMATION') && (
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3 text-xs text-amber-900 space-y-1">
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-amber-600" />
              Double-Confirmation Protocol
            </span>
            <span className="text-[11px] font-semibold text-amber-700">
              {session.teacherConfirmed && session.learnerConfirmed
                ? '2/2 Confirmed'
                : session.teacherConfirmed || session.learnerConfirmed
                ? '1/2 Confirmed'
                : '0/2 Confirmed'}
            </span>
          </div>
          <p className="text-[11px] text-amber-800">
            {hasConfirmed
              ? '✓ You have marked this session complete. Awaiting counterparty confirmation to finalize knowledge credits.'
              : counterpartyConfirmed
              ? '⚡ Counterparty has marked complete! Please confirm completion to finalize credit transfer.'
              : 'Both participants must confirm after the session ends before credits are transferred.'}
          </p>
        </div>
      )}

      {/* Action Controls */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <Link
            to="/chat"
            className="p-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
            title="Chat with partner"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat</span>
          </Link>
          <Link
            to={`/sessions/${session._id}`}
            className="p-2 text-xs font-semibold text-brand-600 hover:text-brand-800 rounded-xl transition-colors"
          >
            Details
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {/* Teacher actions on REQUESTED */}
          {session.status === 'REQUESTED' && isTeacher && (
            <>
              <button
                onClick={() => onReject(session._id)}
                className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
              >
                Decline
              </button>
              <button
                onClick={() => onAccept(session._id)}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors shadow-xs"
              >
                Accept Session
              </button>
            </>
          )}

          {/* Cancellation allowed before completion */}
          {(session.status === 'REQUESTED' || session.status === 'SCHEDULED') && (
            <button
              onClick={() => onCancel(session._id)}
              className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
          )}

          {/* Double Confirmation buttons */}
          {(session.status === 'SCHEDULED' || session.status === 'AWAITING_CONFIRMATION') && (
            <button
              disabled={hasConfirmed}
              onClick={() => onConfirmComplete(session._id)}
              className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 ${
                hasConfirmed
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{hasConfirmed ? 'You Confirmed' : 'Confirm Completion'}</span>
            </button>
          )}

          {/* Rate button on COMPLETED */}
          {session.status === 'COMPLETED' && (
            <button
              onClick={() => onRate(session)}
              className="px-3.5 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors flex items-center gap-1"
            >
              <span>★ Leave Review</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
