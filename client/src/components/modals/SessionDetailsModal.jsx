import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, CheckCircle2, AlertTriangle, MessageSquare, Star } from 'lucide-react';
import api from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function SessionDetailsModal({ session, onClose, onRefresh, onOpenRating }) {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  if (!session) return null;

  const currentUserId = user?._id || user?.id;
  const isTeacher = session.teacher?._id === currentUserId || session.teacher === currentUserId;
  const isLearner = session.learner?._id === currentUserId || session.learner === currentUserId;
  const partner = isTeacher ? session.learner : session.teacher;
  const partnerName = partner?.name || 'Partner';
  const partnerInitials = partnerName.slice(0, 2).toUpperCase();

  const handleAction = async (endpoint, actionName) => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await api.patch(`/sessions/${session._id}/${endpoint}`);
      if (res.data.success) {
        setMessage(`${actionName} successful!`);
        await refreshUser();
        if (onRefresh) onRefresh();
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error(`Error with session action ${endpoint}:`, err);
      setError(err.response?.data?.message || `Failed to ${actionName.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDispute = async () => {
    const reason = window.prompt('Please provide a reason for disputing this session:');
    if (!reason) return;
    setLoading(true);
    try {
      const res = await api.patch(`/sessions/${session._id}/dispute`, { reason });
      if (res.data.success) {
        setMessage('Dispute reported to administrators for mediation.');
        await refreshUser();
        if (onRefresh) onRefresh();
        setTimeout(() => onClose(), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to file dispute');
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = new Date(session.scheduledDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedTime = new Date(session.scheduledDate).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Session details</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <X size={19} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div style={{ background: '#fdeeed', border: '1px solid #f9d2ce', color: '#b23b2b', padding: '10px 12px', borderRadius: '6px', fontSize: '12px', marginBottom: '14px' }}>
              {error}
            </div>
          )}

          {message && (
            <div style={{ background: '#edf5ed', border: '1px solid #d6e8d8', color: '#274e3e', padding: '10px 12px', borderRadius: '6px', fontSize: '12px', marginBottom: '14px', fontWeight: 600 }}>
              {message}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span className={session.status === 'CONFIRMED' ? 'session-status' : session.status === 'COMPLETED' ? 'completed-pill' : session.status === 'CANCELLED' ? 'cancelled-pill' : 'pending'}>
              {session.status}
            </span>
            <span className="skill-tag">{session.skillName || session.skill?.name || 'Skill Exchange'}</span>
          </div>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '12px', background: '#f8faf8', borderRadius: '6px', marginBottom: '18px' }}>
            <span className="avatar large" style={{ background: '#bddbcf' }}>{partnerInitials}</span>
            <div>
              <strong style={{ fontSize: '14px', display: 'block' }}>{partnerName}</strong>
              <small style={{ color: '#6e7b73' }}>
                {isTeacher ? 'Learner (Spends credits)' : 'Teacher (Earns credits)'} · {session.durationHours || 1} hour session
              </small>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
            <div style={{ border: '1px solid #edf0eb', padding: '10px', borderRadius: '6px' }}>
              <small style={{ color: '#8a958e', display: 'block', fontSize: '10px', fontWeight: 700 }}>DATE & TIME</small>
              <strong style={{ fontSize: '12px', color: '#27352d', marginTop: '2px', display: 'block' }}>{formattedDate}</strong>
              <small style={{ color: '#6b7570' }}>{formattedTime}</small>
            </div>
            <div style={{ border: '1px solid #edf0eb', padding: '10px', borderRadius: '6px' }}>
              <small style={{ color: '#8a958e', display: 'block', fontSize: '10px', fontWeight: 700 }}>CREDIT ESCROW</small>
              <strong style={{ fontSize: '12px', color: '#27352d', marginTop: '2px', display: 'block' }}>{session.creditsHeld || session.durationHours || 1}.0 Credit</strong>
              <small style={{ color: '#6b7570' }}>{session.status === 'COMPLETED' ? 'Settled' : 'Reserved in escrow'}</small>
            </div>
          </div>

          {session.meetingLink && (
            <div style={{ border: '1px solid #edf0eb', padding: '10px', borderRadius: '6px', marginBottom: '18px' }}>
              <small style={{ color: '#8a958e', display: 'block', fontSize: '10px', fontWeight: 700 }}>MEETING DETAILS</small>
              <a href={session.meetingLink} target="_blank" rel="noreferrer" style={{ color: '#286346', fontWeight: 600, fontSize: '12px', wordBreak: 'break-all' }}>
                {session.meetingLink}
              </a>
            </div>
          )}

          {session.notes && (
            <div style={{ marginBottom: '18px' }}>
              <small style={{ color: '#8a958e', display: 'block', fontSize: '10px', fontWeight: 700, marginBottom: '4px' }}>LEARNING GOALS / NOTES</small>
              <p style={{ margin: 0, fontSize: '12px', color: '#56645c', background: '#fcfdfc', border: '1px solid #eef2ed', padding: '10px', borderRadius: '6px' }}>
                "{session.notes}"
              </p>
            </div>
          )}

          {/* Double Confirmation Rule Card */}
          <div className="confirmation-note" style={{ marginTop: '10px' }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <div>
              <h3 style={{ fontSize: '13px' }}>Double-Confirmation Protection</h3>
              <p style={{ fontSize: '11px', marginTop: '2px' }}>
                Learner confirmed: <strong>{session.learnerConfirmed ? 'Yes ✓' : 'Pending'}</strong> · 
                Teacher confirmed: <strong>{session.teacherConfirmed ? 'Yes ✓' : 'Pending'}</strong>
              </p>
              <p style={{ fontSize: '11px', marginTop: '2px', color: '#749283' }}>
                Credits only release to teacher when both confirm completion.
              </p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          {session.status === 'REQUESTED' && isTeacher && (
            <>
              <button className="outline-btn" onClick={() => handleAction('reject', 'Decline')} disabled={loading}>
                Decline
              </button>
              <button className="dark-btn" onClick={() => handleAction('accept', 'Accept')} disabled={loading}>
                Accept Session
              </button>
            </>
          )}

          {session.status === 'REQUESTED' && isLearner && (
            <button className="outline-btn" onClick={() => handleAction('cancel', 'Cancel Request')} disabled={loading} style={{ color: '#a3483b' }}>
              Cancel Request (Refund Hold)
            </button>
          )}

          {session.status === 'CONFIRMED' && (
            <>
              <button
                className="outline-btn"
                onClick={() => {
                  onClose();
                  navigate('/messages');
                }}
              >
                <MessageSquare size={15} /> Message
              </button>
              <button className="outline-btn" onClick={handleDispute} disabled={loading} style={{ color: '#9c6d25' }}>
                <AlertTriangle size={15} /> Dispute
              </button>
              {((isLearner && !session.learnerConfirmed) || (isTeacher && !session.teacherConfirmed)) ? (
                <button className="dark-btn" onClick={() => handleAction('confirm', 'Confirm Completion')} disabled={loading}>
                  <CheckCircle2 size={15} /> Confirm Completion
                </button>
              ) : (
                <button className="outline-btn" disabled style={{ opacity: 0.7 }}>
                  Waiting for partner
                </button>
              )}
            </>
          )}

          {session.status === 'COMPLETED' && onOpenRating && (
            <button className="dark-btn" onClick={() => { onClose(); onOpenRating(session); }}>
              <Star size={15} /> Leave Review
            </button>
          )}

          <button className="outline-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
