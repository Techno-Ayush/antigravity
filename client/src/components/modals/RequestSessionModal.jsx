import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Coins, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';

export default function RequestSessionModal({ person, onClose, onSuccess }) {
  const { user, spendableCredits, refreshUser } = useAuth();
  
  if (!person) return null;

  // Safely extract teaching skills from all possible schemas
  const skillsList = [];
  if (Array.isArray(person.skillsOffered)) {
    person.skillsOffered.forEach(s => {
      const n = s.skill?.name || s.name || (typeof s === 'string' ? s : '');
      if (n) skillsList.push(n);
    });
  } else if (Array.isArray(person.skillsToTeach)) {
    person.skillsToTeach.forEach(s => {
      const n = s.name || (typeof s === 'string' ? s : '');
      if (n) skillsList.push(n);
    });
  } else if (Array.isArray(person.teaches)) {
    skillsList.push(...person.teaches);
  }
  if (skillsList.length === 0) skillsList.push('General Tutoring');

  const [selectedSkill, setSelectedSkill] = useState(skillsList[0] || 'General Tutoring');
  const [durationHours, setDurationHours] = useState(1);
  const [scheduledDate, setScheduledDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    d.setHours(17, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  
  const defaultMode = (person.mode === 'In person' || String(person.preferredMode).toUpperCase() === 'IN_PERSON') ? 'in_person' : 'online';
  const [mode, setMode] = useState(defaultMode);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const cost = durationHours;
  const hasEnoughCredits = spendableCredits >= cost;
  const remainingAfter = spendableCredits - cost;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasEnoughCredits) {
      setError(`You need ${cost} credit(s) but only have ${spendableCredits} available. Teach someone to earn credits!`);
      return;
    }
    if (!selectedSkill) {
      setError('Please select a skill to learn.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const teacherId = person._id || person.id;
      const res = await api.post('/sessions', {
        teacherId,
        skillName: selectedSkill,
        scheduledDate: new Date(scheduledDate).toISOString(),
        durationHours: Number(durationHours),
        mode,
        notes
      });

      if (res.data.success) {
        setSuccess(true);
        await refreshUser();
        setTimeout(() => {
          if (onSuccess) onSuccess(res.data.session);
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error('Request session error:', err);
      setError(err.response?.data?.message || 'Failed to submit session request.');
    } finally {
      setLoading(false);
    }
  };

  const initials = person.initials || (person.name ? person.name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'EX');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Request a session</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <X size={19} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {success ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#274e3e' }}>
                <CheckCircle size={44} style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '18px', marginBottom: '6px' }}>Session Requested!</h3>
                <p style={{ margin: 0, color: '#607268' }}>
                  {durationHours} credit has been reserved in escrow. Awaiting {person.name}'s confirmation.
                </p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', padding: '10px 12px', background: '#f7f9f7', borderRadius: '6px' }}>
                  <span className="avatar" style={{ background: person.color || '#395f4d' }}>
                    {initials}
                  </span>
                  <div>
                    <strong style={{ display: 'block', fontSize: '13px' }}>{person.name || 'Student Peer'}</strong>
                    <small style={{ color: '#748078' }}>
                      Teaching · {person.rating || 5.0} ★ · {typeof person.mode === 'string' ? person.mode : 'Online and in person'}
                    </small>
                  </div>
                </div>

                {error && (
                  <div style={{ background: '#fdeeed', border: '1px solid #f9d2ce', color: '#b23b2b', padding: '10px 12px', borderRadius: '6px', fontSize: '12px', marginBottom: '14px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <AlertCircle size={16} flex="none" />
                    <span>{error}</span>
                  </div>
                )}

                <div className={`credit-calc-box ${!hasEnoughCredits ? 'insufficient' : ''}`}>
                  <strong>Escrow Hold Rule: 1 Hour = 1 Credit</strong>
                  <span>Available to spend: {spendableCredits.toFixed(1)} Cr · Cost: {cost}.0 Cr · Remaining: {remainingAfter >= 0 ? remainingAfter.toFixed(1) : 0} Cr</span>
                  {!hasEnoughCredits && (
                    <div style={{ marginTop: '5px', fontWeight: 600 }}>
                      ⚠️ Insufficient balance. You must teach to earn credits before booking!
                    </div>
                  )}
                </div>

                <label>Skill to learn</label>
                <select value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)} required>
                  {skillsList.map((skill) => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label>Duration</label>
                    <select value={durationHours} onChange={(e) => setDurationHours(Number(e.target.value))}>
                      <option value={1}>1 hour (1.0 credit)</option>
                      <option value={2}>2 hours (2.0 credits)</option>
                    </select>
                  </div>
                  <div>
                    <label>Session Mode</label>
                    <select value={mode} onChange={(e) => setMode(e.target.value)}>
                      <option value="online">Online (Video Meet)</option>
                      <option value="in_person">In Person (Campus/Cafe)</option>
                    </select>
                  </div>
                </div>

                <label>Date & Preferred Time</label>
                <input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  required
                />

                <label>Learning goals / Note for {person.name}</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. I'd love to review conversational basics or ask questions about recent project setups..."
                />
              </>
            )}
          </div>

          {!success && (
            <div className="modal-footer">
              <button type="button" className="outline-btn" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button
                type="submit"
                className="dark-btn"
                disabled={loading || !hasEnoughCredits}
                style={{ opacity: !hasEnoughCredits ? 0.6 : 1 }}
              >
                {loading ? 'Submitting...' : `Request Session (${cost}.0 Cr)`}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
