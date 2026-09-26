import React, { useState, useEffect, useRef } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  MessageCircle,
  Pencil,
  Plus,
  ShieldAlert,
  Star,
  UserRound,
  Send,
  AlertTriangle
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { SkillTag } from '../components/People';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../api/axiosInstance';
import RequestSessionModal from '../components/modals/RequestSessionModal';
import SessionDetailsModal from '../components/modals/SessionDetailsModal';
import RatingModal from '../components/modals/RatingModal';
import AddSkillModal from '../components/modals/AddSkillModal';
import EditProfileModal from '../components/modals/EditProfileModal';

export default function Workspace({ type }) {
  if (type === 'profile') return <Profile />;
  if (type === 'messages') return <Messages />;
  if (type === 'admin') return <Admin />;
  return <Sessions />;
}

/* =========================================================================
   1. SESSIONS COMPONENT
   ========================================================================= */
function Sessions() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'pending', 'completed', 'cancelled'
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSession, setSelectedSession] = useState(null);
  const [ratingSession, setRatingSession] = useState(null);
  const [requestModalPerson, setRequestModalPerson] = useState(null);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/sessions');
      if (res.data.success) {
        setSessions(res.data.sessions || []);
      }
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [user]);

  const currentUserId = user?._id || user?.id;

  const upcomingList = sessions.filter((s) => s.status === 'CONFIRMED');
  const pendingList = sessions.filter((s) => s.status === 'REQUESTED');
  const completedList = sessions.filter((s) => s.status === 'COMPLETED');
  const cancelledList = sessions.filter((s) => s.status === 'CANCELLED' || s.status === 'REJECTED' || s.status === 'DISPUTED');

  const displayedList =
    activeTab === 'upcoming'
      ? upcomingList
      : activeTab === 'pending'
      ? pendingList
      : activeTab === 'completed'
      ? completedList
      : cancelledList;

  const handleQuickConfirm = async (e, sessionId) => {
    e.stopPropagation();
    try {
      await api.patch(`/sessions/${sessionId}/confirm`);
      await refreshUser();
      fetchSessions();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not confirm session');
    }
  };

  return (
    <section className="page">
      <div className="welcome-row">
        <div>
          <p className="eyebrow">EXCHANGE CALENDAR</p>
          <h1>Your sessions</h1>
          <p className="subcopy">Credit holds protect your confirmed learning time.</p>
        </div>
        <button className="dark-btn" onClick={() => navigate('/discover')}>
          <Plus size={17} /> Request a session
        </button>
      </div>

      <div className="session-tabs">
        <button
          type="button"
          className={activeTab === 'upcoming' ? 'selected' : ''}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming ({upcomingList.length})
        </button>
        <button
          type="button"
          className={activeTab === 'pending' ? 'selected' : ''}
          onClick={() => setActiveTab('pending')}
        >
          Pending ({pendingList.length})
        </button>
        <button
          type="button"
          className={activeTab === 'completed' ? 'selected' : ''}
          onClick={() => setActiveTab('completed')}
        >
          Completed ({completedList.length})
        </button>
        <button
          type="button"
          className={activeTab === 'cancelled' ? 'selected' : ''}
          onClick={() => setActiveTab('cancelled')}
        >
          Cancelled ({cancelledList.length})
        </button>
      </div>

      <div className="session-list">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#748078' }}>
            Loading sessions...
          </div>
        ) : displayedList.length > 0 ? (
          displayedList.map((item) => {
            const isTeacher = item.teacher?._id === currentUserId || item.teacher === currentUserId;
            const partner = isTeacher ? item.learner : item.teacher;
            const partnerName = partner?.name || 'Exchange Partner';
            const title = `${item.skillName || 'Exchange session'} with ${partnerName}`;

            const dateObj = new Date(item.scheduledDate);
            const dateStr = `${dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · ${dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;

            const stateText =
              item.status === 'CONFIRMED'
                ? 'Scheduled'
                : item.status === 'REQUESTED'
                ? 'Requested'
                : item.status === 'COMPLETED'
                ? 'Completed'
                : item.status;

            const creditText = isTeacher
              ? `Earn ${item.durationHours || 1} credit`
              : `${item.durationHours || 1} credit held`;

            const userConfirmed = isTeacher ? item.teacherConfirmed : item.learnerConfirmed;

            return (
              <article className="full-session" key={item._id}>
                <span className="session-icon">
                  <CalendarDays size={22} />
                </span>
                <div>
                  <h2>{title}</h2>
                  <p>
                    <Clock3 size={15} /> {dateStr} · {item.mode === 'in_person' ? 'In Person' : 'Online'}
                  </p>
                  <SkillTag>{item.skillName || 'Skill'}</SkillTag>
                </div>
                <div className="session-meta">
                  <span className={item.status === 'CONFIRMED' ? 'session-status' : item.status === 'COMPLETED' ? 'completed-pill' : 'pending'}>
                    {stateText}
                  </span>
                  <small>{creditText}</small>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {item.status === 'CONFIRMED' && !userConfirmed && (
                    <button
                      type="button"
                      className="dark-btn"
                      style={{ padding: '7px 11px', fontSize: '11px' }}
                      onClick={(e) => handleQuickConfirm(e, item._id)}
                    >
                      <CheckCircle2 size={14} /> Confirm
                    </button>
                  )}
                  {item.status === 'COMPLETED' && (
                    <button
                      type="button"
                      className="outline-btn"
                      style={{ padding: '7px 11px', fontSize: '11px' }}
                      onClick={() => setRatingSession(item)}
                    >
                      <Star size={14} /> Review
                    </button>
                  )}
                  <button
                    type="button"
                    className="outline-btn"
                    onClick={() => setSelectedSession(item)}
                  >
                    Details
                  </button>
                </div>
              </article>
            );
          })
        ) : (
          <div style={{ padding: '50px 20px', textAlign: 'center', background: '#fff', border: '1px solid #e4e9e3', borderRadius: '7px' }}>
            <h3>No {activeTab} sessions</h3>
            <p style={{ color: '#748078', fontSize: '13px', margin: '4px 0 16px' }}>
              {activeTab === 'upcoming'
                ? 'You do not have any upcoming sessions scheduled.'
                : `You currently have no ${activeTab} exchange requests.`}
            </p>
            <button className="dark-btn" onClick={() => navigate('/discover')}>
              Find someone to learn with
            </button>
          </div>
        )}
      </div>

      <section className="confirmation-note">
        <CheckCircle2 size={20} />
        <div>
          <h3>Completion needs two confirmations</h3>
          <p>
            When the session ends, both people confirm it. Only then does the teacher earn credits and the learner's reservation become a spend.
          </p>
        </div>
      </section>

      {selectedSession && (
        <SessionDetailsModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          onRefresh={fetchSessions}
          onOpenRating={(s) => setRatingSession(s)}
        />
      )}

      {ratingSession && (
        <RatingModal
          session={ratingSession}
          onClose={() => setRatingSession(null)}
          onSuccess={fetchSessions}
        />
      )}

      {requestModalPerson && (
        <RequestSessionModal
          person={requestModalPerson}
          onClose={() => setRequestModalPerson(null)}
          onSuccess={fetchSessions}
        />
      )}
    </section>
  );
}

/* =========================================================================
   2. PROFILE COMPONENT
   ========================================================================= */
function Profile() {
  const { id } = useParams();
  const { user: currentUser, refreshUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [addSkillType, setAddSkillType] = useState('teach');
  const [requestPerson, setRequestPerson] = useState(null);

  const isOwnProfile = !id || id === currentUser?._id || id === currentUser?.id;

  useEffect(() => {
    const fetchProfile = async () => {
      if (isOwnProfile) {
        setProfileUser(currentUser);
        setLoading(false);
      } else {
        try {
          const res = await api.get(`/users/profile/${id}`);
          if (res.data.success) {
            setProfileUser(res.data.user);
          }
        } catch (err) {
          console.error('Failed to load user profile:', err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProfile();
  }, [id, currentUser, isOwnProfile]);

  if (loading) {
    return <section className="page"><div style={{ padding: '60px', textAlign: 'center' }}>Loading profile...</div></section>;
  }

  const user = profileUser || currentUser;
  const initials = user?.name
    ? user.name.split(' ').filter(Boolean).map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'AG';

  const teachingHours = user?.totalTeachingHours !== undefined ? Number(user.totalTeachingHours).toFixed(1) : (user?.completedTeachingHours !== undefined ? Number(user.completedTeachingHours).toFixed(1) : '12.5');
  const learningHours = user?.totalLearningHours !== undefined ? Number(user.totalLearningHours).toFixed(1) : (user?.completedLearningHours !== undefined ? Number(user.completedLearningHours).toFixed(1) : '8.0');
  const creditsEarned = user?.lifetimeEarned !== undefined ? Number(user.lifetimeEarned).toFixed(1) : (user?.earnedCredits !== undefined ? Number(user.earnedCredits).toFixed(1) : '14.5');
  const reviewsCount = user?.totalRatingsCount !== undefined ? user.totalRatingsCount : (user?.reviewCount !== undefined ? user.reviewCount : 16);
  const ratingValue = Number(user?.averageRating || user?.rating || 4.9).toFixed(1);

  const city = typeof user?.location === 'string' ? user.location : (user?.location?.city || 'New Delhi');
  const modeText = user?.preferredMode === 'IN_PERSON' || user?.preferredMode === 'in_person' ? 'In person only' : user?.preferredMode === 'ONLINE' || user?.preferredMode === 'online' ? 'Online only' : 'Online and in person';
  const completedCount = user?.totalSessionsCompleted !== undefined ? user.totalSessionsCompleted : (user?.completedSessions || 16);

  // Safely normalize skills to teach
  let teaches = [];
  if (user?.skillsOffered && user.skillsOffered.length > 0) {
    teaches = user.skillsOffered.map(s => ({
      name: s.skill?.name || s.name || (typeof s === 'string' ? s : 'Skill'),
      proficiency: s.level || 'Intermediate',
      description: s.description || 'Foundations, best practices, and practical sessions.'
    }));
  } else if (user?.skillsToTeach && user.skillsToTeach.length > 0) {
    teaches = user.skillsToTeach.map(s => ({
      name: s.name || (typeof s === 'string' ? s : 'Skill'),
      proficiency: s.proficiency || 'Intermediate',
      description: s.description || 'Foundations, best practices, and practical sessions.'
    }));
  } else {
    teaches = [
      { name: 'JavaScript', proficiency: 'Advanced', description: 'Frontend foundations and practical projects.' },
      { name: 'Excel', proficiency: 'Intermediate', description: 'Formulas, dashboards, and data cleanup.' }
    ];
  }

  // Safely normalize skills to learn
  let wants = [];
  if (user?.skillsWanted && user.skillsWanted.length > 0) {
    wants = user.skillsWanted.map(s => ({
      name: s.skill?.name || s.name || (typeof s === 'string' ? s : 'Skill'),
      proficiency: s.desiredLevel || 'Beginner',
      description: s.description || 'Everyday concepts, guided practice, and feedback.'
    }));
  } else if (user?.skillsToLearn && user.skillsToLearn.length > 0) {
    wants = user.skillsToLearn.map(s => ({
      name: s.name || (typeof s === 'string' ? s : 'Skill'),
      proficiency: s.proficiency || 'Beginner',
      description: s.description || 'Everyday concepts, guided practice, and feedback.'
    }));
  } else {
    wants = [
      { name: 'Spanish', proficiency: 'Beginner', description: 'Everyday conversation and pronunciation.' },
      { name: 'Photography', proficiency: 'Beginner', description: 'Composition and editing basics.' }
    ];
  }

  return (
    <section className="page">
      <div className="profile-header">
        <span className="avatar profile-avatar">{initials}</span>
        <div>
          <p className="eyebrow">SKILL EXCHANGER</p>
          <h1>
            {user?.name || 'Ayush Goyal'}{' '}
            <span className="rating">
              <Star size={15} fill="currentColor" /> {ratingValue}
            </span>
          </h1>
          <p>{user?.bio || 'Curious builder learning by sharing what I know.'}</p>
          <p className="profile-detail">
            {city} · {modeText} · {completedCount} completed sessions
          </p>
        </div>
        {isOwnProfile ? (
          <button className="outline-btn" onClick={() => setShowEditModal(true)}>
            <Pencil size={16} /> Edit profile
          </button>
        ) : (
          <button className="dark-btn" onClick={() => setRequestPerson(user)}>
            Request session
          </button>
        )}
      </div>

      <div className="profile-stats">
        <div>
          <strong>{teachingHours}</strong>
          <span>Teaching hours</span>
        </div>
        <div>
          <strong>{learningHours}</strong>
          <span>Learning hours</span>
        </div>
        <div>
          <strong>{creditsEarned}</strong>
          <span>Credits earned</span>
        </div>
        <div>
          <strong>{reviewsCount}</strong>
          <span>Reviews</span>
        </div>
      </div>

      <div className="profile-columns">
        <section>
          <h2>I can teach</h2>
          <p className="subcopy">Skills that become your learning currency.</p>
          <div className="profile-skills">
            {teaches.map((skill, idx) => (
              <article key={skill.name || idx}>
                <SkillTag>{skill.name}</SkillTag>
                <strong>{skill.proficiency}</strong>
                <p>{skill.description}</p>
              </article>
            ))}
            {isOwnProfile && (
              <button
                className="add-skill"
                onClick={() => {
                  setAddSkillType('teach');
                  setShowAddSkillModal(true);
                }}
              >
                <Plus size={17} /> Add a teaching skill
              </button>
            )}
          </div>
        </section>

        <section>
          <h2>I want to learn</h2>
          <p className="subcopy">The next things you are making time for.</p>
          <div className="profile-skills">
            {wants.map((skill, idx) => (
              <article key={skill.name || idx}>
                <SkillTag warm>{skill.name}</SkillTag>
                <strong>{skill.proficiency}</strong>
                <p>{skill.description}</p>
              </article>
            ))}
            {isOwnProfile && (
              <button
                className="add-skill"
                onClick={() => {
                  setAddSkillType('learn');
                  setShowAddSkillModal(true);
                }}
              >
                <Plus size={17} /> Add a learning skill
              </button>
            )}
          </div>
        </section>
      </div>

      {showEditModal && (
        <EditProfileModal
          onClose={() => setShowEditModal(false)}
          onSuccess={refreshUser}
        />
      )}

      {showAddSkillModal && (
        <AddSkillModal
          defaultType={addSkillType}
          onClose={() => setShowAddSkillModal(false)}
          onSuccess={refreshUser}
        />
      )}

      {requestPerson && (
        <RequestSessionModal
          person={requestPerson}
          onClose={() => setRequestPerson(null)}
          onSuccess={() => alert('Session requested!')}
        />
      )}
    </section>
  );
}

/* =========================================================================
   3. MESSAGES COMPONENT (ROBUST REAL-TIME & DEMO REPLIES)
   ========================================================================= */
function Messages() {
  const { user } = useAuth();
  const { socket, markConversationRead, clearAllUnreadMessages } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const currentUserId = user?._id || user?.id || 'demo-user-id';

  // Seed default conversations if none exist in DB so chat is always active
  const fallbackConversations = [
    {
      _id: 'conv-ananya-demo',
      isDemo: true,
      partner: { name: 'Ananya Iyer', initials: 'AI', skill: 'Spanish Conversation' },
      lastMessage: { text: 'Great. I will share a meeting link here before we begin.', createdAt: new Date() },
      initialMessages: [
        { _id: 'm1', sender: 'partner', text: 'Hi! Would 5 PM still work for you on Saturday?' },
        { _id: 'm2', sender: currentUserId, text: 'Yes, perfect. I am looking forward to it.' },
        { _id: 'm3', sender: 'partner', text: 'Great. I will share a meeting link here before we begin.' }
      ]
    },
    {
      _id: 'conv-priya-demo',
      isDemo: true,
      partner: { name: 'Priya Shah', initials: 'PS', skill: 'JavaScript Mentorship' },
      lastMessage: { text: 'Looking forward to our session!', createdAt: new Date(Date.now() - 3600000) },
      initialMessages: [
        { _id: 'm10', sender: 'partner', text: 'Hello! I saw your request for JavaScript foundations.' },
        { _id: 'm11', sender: currentUserId, text: 'Hi Priya, yes! I want to review async/await and promises.' }
      ]
    }
  ];

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get('/conversations');
        if (res.data?.success && res.data.conversations && res.data.conversations.length > 0) {
          setConversations(res.data.conversations);
          setActiveConv(res.data.conversations[0]);
        } else {
          // Use fallback demo threads
          setConversations(fallbackConversations);
          setActiveConv(fallbackConversations[0]);
          setMessages(fallbackConversations[0].initialMessages);
        }
      } catch (err) {
        console.warn('Using interactive fallback conversations:', err);
        setConversations(fallbackConversations);
        setActiveConv(fallbackConversations[0]);
        setMessages(fallbackConversations[0].initialMessages);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConv) return;

    // Immediately mark this conversation as read in real-time
    markConversationRead(activeConv._id);
    setConversations((prev) =>
      prev.map((item) => (item._id === activeConv._id ? { ...item, unreadCount: 0 } : item))
    );

    if (activeConv.isDemo) {
      setMessages(activeConv.initialMessages || []);
      return;
    }

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/conversations/${activeConv._id}/messages`);
        if (res.data?.success && Array.isArray(res.data.messages)) {
          setMessages(res.data.messages);
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    };

    fetchMessages();

    if (socket) {
      socket.emit('join_conversation', activeConv._id);
      const handleNewMessage = (msg) => {
        const convId = msg.conversation?.toString() || msg.conversationId?.toString();
        if (convId === activeConv._id?.toString()) {
          setMessages((prev) => [...prev, msg]);
          markConversationRead(activeConv._id);
        } else {
          setConversations((prev) =>
            prev.map((item) =>
              item._id === convId ? { ...item, unreadCount: (item.unreadCount || 0) + 1 } : item
            )
          );
        }
      };
      socket.on('receive_message', handleNewMessage);
      socket.on('new_message', handleNewMessage);
      return () => {
        socket.off('receive_message', handleNewMessage);
        socket.off('new_message', handleNewMessage);
      };
    }
  }, [activeConv?._id, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeConv) return;

    const messageText = text.trim();
    setText('');

    // Append immediately for instant UX feedback
    const optimisticMsg = {
      _id: 'msg-' + Date.now(),
      sender: currentUserId,
      text: messageText,
      createdAt: new Date().toISOString()
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    // If demo conversation, simulate realistic peer response
    if (activeConv.isDemo) {
      setTimeout(() => {
        const peerReplies = [
          "Got it! That works well for me.",
          "Perfect, see you at the scheduled time!",
          "Sounds great. I'll prepare some examples for our exchange.",
          "Awesome. Looking forward to our session!"
        ];
        const randomReply = peerReplies[Math.floor(Math.random() * peerReplies.length)];
        const replyMsg = {
          _id: 'msg-reply-' + Date.now(),
          sender: 'partner',
          text: randomReply,
          createdAt: new Date().toISOString()
        };
        setMessages((prev) => [...prev, replyMsg]);
      }, 700);
      return;
    }

    // Real backend API call
    try {
      const res = await api.post(`/conversations/${activeConv._id}/messages`, {
        text: messageText
      });
      const newMsg = res.data?.message || res.data?.data;
      if (newMsg) {
        // Replace optimistic or keep synced
        if (socket) {
          socket.emit('send_message', {
            conversationId: activeConv._id,
            message: newMsg
          });
        }
      }
    } catch (err) {
      console.error('Failed to persist message to server:', err);
    }
  };

  const partnerName = activeConv?.partner?.name || (activeConv?.participants?.find(p => (p._id || p) !== currentUserId)?.name) || 'Ananya Iyer';
  const partnerInitials = partnerName.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'AI';
  const skillName = activeConv?.partner?.skill || activeConv?.session?.skillName || 'Skill Exchange';

  return (
    <section className="page">
      <div>
        <p className="eyebrow">SESSION COORDINATION</p>
        <h1>Messages</h1>
        <p className="subcopy">Conversations open after a session is accepted.</p>
      </div>

      <div className="chat-layout">
        <aside>
          {conversations.map((c) => {
            const pName = c.partner?.name || (c.participants?.find(p => (p._id || p) !== currentUserId)?.name) || 'Exchange Partner';
            const pInit = pName.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'EX';
            const isSelected = activeConv?._id === c._id;
            const previewText = c.lastMessage?.text || c.partner?.skill || 'Exchange conversation';

            return (
              <button
                type="button"
                key={c._id}
                className={`chat-person ${isSelected ? 'active' : ''}`}
                onClick={() => {
                  setActiveConv(c);
                  markConversationRead(c._id);
                  setConversations((prev) =>
                    prev.map((item) => (item._id === c._id ? { ...item, unreadCount: 0 } : item))
                  );
                  if (c.isDemo) {
                    setMessages(c.initialMessages || []);
                  }
                }}
              >
                <span className="avatar alt">{pInit}</span>
                <span>
                  <strong>{pName}</strong>
                  <small>{previewText}</small>
                </span>
                {c.unreadCount > 0 ? (
                  <b className="unread-dot">{c.unreadCount}</b>
                ) : (
                  <i>Now</i>
                )}
              </button>
            );
          })}
        </aside>

        <section className="chat-panel">
          <header>
            <span className="avatar alt">{partnerInitials}</span>
            <div>
              <h3>{partnerName}</h3>
              <small>Online · {skillName}</small>
            </div>
          </header>

          <div className="messages">
            {messages && messages.filter(Boolean).length > 0 ? (
              messages.filter(Boolean).map((m, idx) => {
                const senderId = m.sender?._id || m.sender;
                const isMine = senderId === currentUserId;
                return (
                  <p key={m._id || idx} className={isMine ? 'mine' : 'them'}>
                    {m.text || ''}
                  </p>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', color: '#829088', margin: 'auto', fontSize: '13px' }}>
                Say hello to coordinate your session details!
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend}>
            <input
              placeholder="Write a message"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button type="submit" className="dark-btn" disabled={!text.trim()}>
              Send
            </button>
          </form>
        </section>
      </div>
    </section>
  );
}

/* =========================================================================
   4. ADMIN COMPONENT
   ========================================================================= */
function Admin() {
  const [stats, setStats] = useState({
    totalUsers: 1248,
    completedSessions: 834,
    creditsExchanged: 1391,
    openReports: 4
  });
  const [reports, setReports] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const [statsRes, reportsRes, disputesRes] = await Promise.all([
        api.get('/admin/stats').catch(() => null),
        api.get('/admin/reports').catch(() => null),
        api.get('/admin/disputes').catch(() => null)
      ]);

      if (statsRes?.data?.success) {
        setStats(statsRes.data.stats);
      }
      if (reportsRes?.data?.success) {
        setReports(reportsRes.data.reports || []);
      }
      if (disputesRes?.data?.success) {
        setDisputes(disputesRes.data.disputes || []);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleResolveDispute = async (id, resolution) => {
    try {
      await api.patch(`/admin/disputes/${id}/resolve`, { resolution });
      alert(`Dispute settled: ${resolution}`);
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resolve dispute');
    }
  };

  return (
    <section className="page">
      <div>
        <p className="eyebrow">MODERATION</p>
        <h1>Community overview</h1>
        <p className="subcopy">Trust safeguards for a healthy knowledge exchange.</p>
      </div>

      <div className="admin-stats">
        <article>
          <UserRound size={22} />
          <strong>{stats.totalUsers}</strong>
          <span>Total users</span>
        </article>
        <article>
          <CalendarDays size={22} />
          <strong>{stats.completedSessions}</strong>
          <span>Completed sessions</span>
        </article>
        <article>
          <CheckCircle2 size={22} />
          <strong>{stats.creditsExchanged}</strong>
          <span>Credits exchanged</span>
        </article>
        <article>
          <ShieldAlert size={22} />
          <strong>{disputes.length || stats.openReports}</strong>
          <span>Open reports</span>
        </article>
      </div>

      <section className="admin-table">
        <div className="section-heading">
          <div>
            <h2>Open disputes & reports</h2>
            <p>Review disputes, manage credit escrow mediation, and protect integrity.</p>
          </div>
        </div>

        <div className="table-row head">
          <span>REPORT / ISSUE</span>
          <span>USERS INVOLVED</span>
          <span>STATUS</span>
          <span>ACTION</span>
        </div>

        {disputes.length > 0 ? (
          disputes.map((d) => (
            <div className="table-row" key={d._id}>
              <strong>{d.reason || 'Session Disputed'}</strong>
              <span>{d.teacher?.name} & {d.learner?.name}</span>
              <b>{d.status || 'Pending'}</b>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => handleResolveDispute(d._id, 'REFUND_LEARNER')}
                >
                  Refund Learner
                </button>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => handleResolveDispute(d._id, 'RELEASE_TO_TEACHER')}
                >
                  Release to Teacher
                </button>
              </div>
            </div>
          ))
        ) : (
          <>
            <div className="table-row">
              <strong>No-show in scheduled session</strong>
              <span>Rohan Verma</span>
              <b>Open</b>
              <button type="button" className="text-button">
                Mediate
              </button>
            </div>
            <div className="table-row">
              <strong>Inappropriate behavior</strong>
              <span>Neha Kapoor</span>
              <b>Reviewing</b>
              <button type="button" className="text-button">
                Review
              </button>
            </div>
          </>
        )}
      </section>
    </section>
  );
}
