import React, { useState, useEffect } from 'react';
import { ArrowRight, CalendarClock, ChevronRight, Clock3, Coins, GraduationCap, Star, UsersRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PersonCard } from '../components/People';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import RequestSessionModal from '../components/modals/RequestSessionModal';
import SessionDetailsModal from '../components/modals/SessionDetailsModal';
import AddSkillModal from '../components/modals/AddSkillModal';

function Stat({ icon: Icon, label, value, note, tone }) {
  return (
    <div className="stat">
      <span className={`stat-icon ${tone}`}><Icon size={20} /></span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, spendableCredits, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [upcomingSession, setUpcomingSession] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [stats, setStats] = useState({
    upcomingCount: 0,
    teachingHours: 0,
    learningHours: 0,
    rating: 5.0,
    reviewsCount: 0
  });

  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showAddSkill, setShowAddSkill] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch matches
        const matchRes = await api.get('/matches').catch(() => null);
        if (matchRes?.data?.success) {
          setMatches(matchRes.data.matches.slice(0, 2));
        }

        // Fetch upcoming confirmed session
        const sessionRes = await api.get('/sessions?status=CONFIRMED').catch(() => null);
        if (sessionRes?.data?.success) {
          const sessions = sessionRes.data.sessions || [];
          setUpcomingSession(sessions[0] || null);
          setStats((prev) => ({ ...prev, upcomingCount: sessions.length }));
        }

        // Fetch recent credit transactions
        const creditRes = await api.get('/credits/transactions').catch(() => null);
        if (creditRes?.data?.success) {
          setRecentTransactions((creditRes.data.transactions || []).slice(0, 3));
        }

        // Update stats from user profile
        if (user) {
          setStats((prev) => ({
            ...prev,
            teachingHours: user.totalTeachingHours || 0,
            learningHours: user.totalLearningHours || 0,
            rating: user.averageRating || 5.0,
            reviewsCount: user.totalRatingsCount || 0
          }));
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      }
    };

    fetchDashboardData();
  }, [user]);

  const firstName = user?.name ? user.name.split(' ')[0] : 'Ayush';
  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  }).toUpperCase();

  const reservedCredits = user?.reservedCredits || (upcomingSession ? upcomingSession.durationHours || 1 : 0);

  // Format date box for upcoming session
  const sessionDate = upcomingSession ? new Date(upcomingSession.scheduledDate) : null;
  const dayNumber = sessionDate ? sessionDate.getDate() : 28;
  const monthShort = sessionDate
    ? sessionDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
    : 'SEP';

  const upcomingPartnerName = upcomingSession
    ? (upcomingSession.teacher?._id === user?._id ? upcomingSession.learner?.name : upcomingSession.teacher?.name) || 'Peer'
    : 'Ananya';

  const upcomingFormattedTime = sessionDate
    ? `${sessionDate.toLocaleDateString('en-US', { weekday: 'long' })}, ${sessionDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
    : 'Saturday, 5:00 PM';

  return (
    <section className="page">
      <div className="welcome-row">
        <div>
          <p className="eyebrow">{currentDateFormatted}</p>
          <h1>Good morning, {firstName}.</h1>
          <p className="subcopy">Turn your knowledge into your next learning opportunity.</p>
        </div>
        <button className="dark-btn action-btn" onClick={() => navigate('/discover')}>
          Explore skills <ArrowRight size={17} />
        </button>
      </div>

      <section className="credit-banner">
        <div>
          <p className="eyebrow">YOUR KNOWLEDGE WALLET</p>
          <h2>
            {spendableCredits !== undefined ? spendableCredits.toFixed(1) : '2.0'} <small>credits</small>
          </h2>
          <p>
            {spendableCredits !== undefined ? spendableCredits.toFixed(1) : '2.0'} available to learn · {reservedCredits.toFixed(1)} reserved for a session
          </p>
        </div>
        <div className="credit-cycle">
          <span><GraduationCap size={18} /> Teach</span>
          <ArrowRight size={18} />
          <span><Coins size={18} /> Earn</span>
          <ArrowRight size={18} />
          <span><UsersRound size={18} /> Learn</span>
        </div>
        <button className="light-btn" onClick={() => navigate('/credits')}>
          View credits <ChevronRight size={16} />
        </button>
      </section>

      <div className="stats-grid">
        <Stat
          icon={Coins}
          tone="gold"
          label="Available credits"
          value={spendableCredits !== undefined ? spendableCredits.toFixed(1) : '2.0'}
          note={`${reservedCredits.toFixed(1)} reserved`}
        />
        <Stat
          icon={CalendarClock}
          tone="green"
          label="Upcoming sessions"
          value={stats.upcomingCount || (upcomingSession ? '1' : '0')}
          note="Confirmed"
        />
        <Stat
          icon={GraduationCap}
          tone="purple"
          label="Teaching hours"
          value={stats.teachingHours ? stats.teachingHours.toFixed(1) : '12.5'}
          note="+2.0 this month"
        />
        <Stat
          icon={Clock3}
          tone="blue"
          label="Learning hours"
          value={stats.learningHours ? stats.learningHours.toFixed(1) : '8.0'}
          note="3 skills explored"
        />
        <Stat
          icon={Star}
          tone="rose"
          label="Your rating"
          value={Number(stats.rating).toFixed(1)}
          note={`${stats.reviewsCount || 16} reviews`}
        />
      </div>

      <div className="section-heading">
        <div>
          <h2>Upcoming session</h2>
          <p>One credit is reserved until this exchange is complete.</p>
        </div>
        <button className="text-button" onClick={() => navigate('/sessions')}>
          View all <ChevronRight size={16} />
        </button>
      </div>

      {upcomingSession ? (
        <article className="session-card">
          <div className="date-box">
            <strong>{dayNumber}</strong>
            <small>{monthShort}</small>
          </div>
          <div className="session-person">
            <span className="avatar large alt">
              {upcomingPartnerName.slice(0, 2).toUpperCase()}
            </span>
            <div>
              <h3>{upcomingSession.skillName || 'Exchange session'} with {upcomingPartnerName}</h3>
              <p>
                <CalendarClock size={15} /> {upcomingFormattedTime} · {upcomingSession.durationHours || 1} hour · {upcomingSession.mode === 'in_person' ? 'In Person' : 'Online'}
              </p>
              <span className="skill-tag">{upcomingSession.skillName || 'Skill'}</span>
            </div>
          </div>
          <span className="session-status">Confirmed</span>
          <button className="outline-btn" onClick={() => setSelectedSession(upcomingSession)}>
            View details
          </button>
        </article>
      ) : (
        <article className="session-card" style={{ borderLeftColor: '#cbd5cb' }}>
          <div className="date-box" style={{ background: '#f5f7f5', color: '#68776f' }}>
            <strong>—</strong>
            <small>OPEN</small>
          </div>
          <div className="session-person">
            <div>
              <h3>No scheduled upcoming session</h3>
              <p style={{ margin: 0 }}>Browse available skills in the community to book your next exchange.</p>
            </div>
          </div>
          <button className="dark-btn" onClick={() => navigate('/discover')}>
            Explore skills
          </button>
        </article>
      )}

      <div className="two-column">
        <section>
          <div className="section-heading">
            <div>
              <h2>Suggested matches</h2>
              <p>People who can help you learn.</p>
            </div>
            <button className="text-button" onClick={() => navigate('/discover')}>
              See all <ChevronRight size={16} />
            </button>
          </div>
          <div className="people-grid">
            {matches && matches.length > 0 ? (
              matches.map((m) => (
                <PersonCard
                  key={m.user?._id || m.id || m._id}
                  person={m.user ? { ...m.user, matchScore: m.matchScore, score: Math.round(m.matchScore), match: m.reasons?.join(' · ') } : m}
                  onRequestSession={(p) => setSelectedPerson(p)}
                />
              ))
            ) : (
              <p style={{ color: '#748078', fontSize: '13px' }}>
                Add more learning and teaching skills to generate smart matches.
              </p>
            )}
          </div>
        </section>

        <section>
          <div className="section-heading">
            <div>
              <h2>Recent credit activity</h2>
              <p>Every movement is recorded.</p>
            </div>
            <button className="text-button" onClick={() => navigate('/credits')}>
              Ledger <ChevronRight size={16} />
            </button>
          </div>
          <div className="activity-list">
            {recentTransactions && recentTransactions.length > 0 ? (
              recentTransactions.map((t, idx) => {
                const isPositive = t.amount > 0 || t.type === 'CREDIT_EARNED' || t.type === 'STARTER_CREDIT';
                const sign = isPositive ? '+' : '−';
                const iconType = t.type?.toLowerCase().includes('earn') ? 'earn' : t.type?.toLowerCase().includes('reserve') ? 'reserve' : 'earn';
                return (
                  <div className="activity" key={t._id || idx}>
                    <span className={`activity-icon ${iconType}`}>
                      {sign}
                    </span>
                    <div>
                      <strong>{t.description || t.title || 'Credit Transaction'}</strong>
                      <small>{new Date(t.createdAt || t.date || Date.now()).toLocaleDateString()}</small>
                    </div>
                    <b className={isPositive ? 'positive' : ''}>
                      {sign}{Math.abs(t.amount || 1).toFixed(1)}
                    </b>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: '#78847c', fontSize: '13px' }}>
                No recent transactions recorded.
              </div>
            )}
          </div>

          <div className="skills-callout">
            <div>
              <p className="eyebrow">KEEP THE CYCLE MOVING</p>
              <h3>Teach one hour. Earn one credit.</h3>
              <p>List another skill to find your next learner.</p>
            </div>
            <button className="dark-btn" onClick={() => setShowAddSkill(true)}>
              Add a skill
            </button>
          </div>
        </section>
      </div>

      {selectedPerson && (
        <RequestSessionModal
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
          onSuccess={() => {
            refreshUser();
            navigate('/sessions');
          }}
        />
      )}

      {selectedSession && (
        <SessionDetailsModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          onRefresh={refreshUser}
        />
      )}

      {showAddSkill && (
        <AddSkillModal
          defaultType="teach"
          onClose={() => setShowAddSkill(false)}
          onSuccess={refreshUser}
        />
      )}
    </section>
  );
}
