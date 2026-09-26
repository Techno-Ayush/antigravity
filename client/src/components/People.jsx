import React from 'react';
import { Calendar, MapPin, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function SkillTag({ children, warm = false }) {
  if (!children) return null;
  return <span className={`skill-tag ${warm ? 'warm' : ''}`}>{children}</span>;
}

export function PersonCard({ person, onRequestSession, onViewProfile }) {
  if (!person) return null;
  const navigate = useNavigate();

  const personId = person._id || person.id || '';
  const initials = person.initials || (person.name ? person.name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'EX');
  const score = person.score !== undefined ? person.score : (person.matchScore !== undefined ? Math.round(person.matchScore) : 88);
  const rating = Number(person.rating || person.averageRating || 5.0).toFixed(1);
  const sessionsCount = person.sessions !== undefined ? person.sessions : (person.completedSessions !== undefined ? person.completedSessions : (person.totalSessionsCompleted || 0));

  // Safely extract teaches skills
  let teaches = [];
  if (Array.isArray(person.teaches)) {
    teaches = person.teaches;
  } else if (Array.isArray(person.skillsOffered)) {
    teaches = person.skillsOffered.map(s => s.skill?.name || s.name || (typeof s === 'string' ? s : '')).filter(Boolean);
  } else if (Array.isArray(person.skillsToTeach)) {
    teaches = person.skillsToTeach.map(s => s.name || (typeof s === 'string' ? s : '')).filter(Boolean);
  }
  if (teaches.length === 0) teaches = ['General Tutoring'];

  // Safely extract wants to learn skills
  let wants = [];
  if (Array.isArray(person.wants)) {
    wants = person.wants;
  } else if (Array.isArray(person.skillsWanted)) {
    wants = person.skillsWanted.map(s => s.skill?.name || s.name || (typeof s === 'string' ? s : '')).filter(Boolean);
  } else if (Array.isArray(person.skillsToLearn)) {
    wants = person.skillsToLearn.map(s => s.name || (typeof s === 'string' ? s : '')).filter(Boolean);
  }
  if (wants.length === 0) wants = ['Open to learn'];

  // Safely parse availability string - PREVENT OBJECT CRASH
  let availabilityStr = 'Flexible availability';
  if (typeof person.availability === 'string') {
    availabilityStr = person.availability;
  } else if (person.availability && typeof person.availability === 'object') {
    const parts = [];
    if (person.availability.weekends) parts.push('Weekends');
    if (person.availability.weekdays) parts.push('Evenings');
    availabilityStr = parts.length > 0 ? parts.join(' & ') : 'Available this week';
  } else if (person.availabilitySchedule) {
    availabilityStr = 'Available this week';
  }

  // Safely parse session mode string
  let modeStr = 'Online · In person';
  if (typeof person.mode === 'string') {
    modeStr = person.mode;
  } else if (person.preferredMode) {
    const pm = String(person.preferredMode).toUpperCase();
    if (pm === 'ONLINE') modeStr = 'Online';
    else if (pm === 'IN_PERSON') modeStr = 'In person';
    else modeStr = 'Online · In person';
  }

  // Safely parse match reason string
  let matchReasonStr = 'High complementary skill overlap';
  if (typeof person.match === 'string') {
    matchReasonStr = person.match;
  } else if (Array.isArray(person.reasons) && person.reasons.length > 0) {
    matchReasonStr = person.reasons.join(' · ');
  } else if (teaches.length > 0 && teaches[0] !== 'General Tutoring') {
    matchReasonStr = `Teaches ${teaches[0]}`;
  }

  const handleView = () => {
    if (onViewProfile) {
      onViewProfile(person);
    } else {
      navigate(`/profile/${personId}`);
    }
  };

  const handleRequest = () => {
    if (onRequestSession) {
      onRequestSession(person);
    }
  };

  return (
    <article className="person-card">
      <div className="card-top">
        <span className="avatar large" style={{ background: person.color || '#d6dccc' }}>
          {initials}
        </span>
        <span className="match-score">{score}% match</span>
      </div>
      <h3>{person.name || 'Student Peer'}</h3>
      <p className="muted">
        <Star size={14} fill="currentColor" /> {rating} <span>·</span> {sessionsCount} sessions
      </p>
      
      <p className="label">TEACHES</p>
      <div className="tags">
        {teaches.slice(0, 3).map((s) => (
          <SkillTag key={s}>{s}</SkillTag>
        ))}
      </div>

      <p className="label">WANTS TO LEARN</p>
      <div className="tags">
        {wants.slice(0, 3).map((s) => (
          <SkillTag warm key={s}>{s}</SkillTag>
        ))}
      </div>

      <div className="availability">
        <span><Calendar size={15} />{availabilityStr}</span>
        <span><MapPin size={15} />{modeStr}</span>
      </div>

      <p className="match-reason">{matchReasonStr}</p>

      <button type="button" className="outline-btn" onClick={handleView}>
        View profile
      </button>
      <button type="button" className="dark-btn" onClick={handleRequest}>
        Request session
      </button>
    </article>
  );
}
