import React, { useState } from 'react';
import {
  Bell,
  BookOpen,
  CalendarDays,
  Compass,
  Coins,
  Home,
  MessageSquare,
  Search,
  Settings,
  ShieldAlert,
  Info
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import AuthModal from './modals/AuthModal';

const links = [
  [Info, 'Overview', '/'],
  [Home, 'Dashboard', '/dashboard'],
  [Compass, 'Discover', '/discover'],
  [CalendarDays, 'Sessions', '/sessions'],
  [Coins, 'Credits', '/credits'],
  [MessageSquare, 'Messages', '/messages']
];

export default function Layout({ children }) {
  const { user, spendableCredits, isAuthenticated, isAdmin } = useAuth();
  const {
    notifications,
    unreadCount,
    unreadMessagesCount,
    clearAllUnreadMessages,
    markNotificationRead,
    markAllRead
  } = useSocket();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const initials = user?.name
    ? user.name.split(' ').filter(Boolean).map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'AG';

  const userName = user?.name || 'Ayush Goyal';
  const creditsText = `${spendableCredits !== undefined ? spendableCredits.toFixed(1) : '3.0'} credits`;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/discover?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/discover');
    }
  };

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <NavLink to="/" className="brand">
          <span className="brand-mark"><BookOpen size={18} /></span>
          <span>Skill<span>Cycle</span></span>
        </NavLink>

        <p className="nav-label">YOUR EXCHANGE</p>
        <nav>
          {links.map(([Icon, label, to]) => (
            <NavLink
              key={label}
              to={to}
              end={to === '/'}
              onClick={() => {
                if (label === 'Messages') clearAllUnreadMessages();
              }}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={19} />
              <span>{label}</span>
              {label === 'Messages' && unreadMessagesCount > 0 && <b>{unreadMessagesCount}</b>}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <ShieldAlert size={19} />
              <span>Admin</span>
            </NavLink>
          )}
        </nav>

        <div className="sidebar-bottom">
          <NavLink to="/settings" className="nav-item">
            <Settings size={19} />
            <span>Settings</span>
          </NavLink>
          {isAuthenticated ? (
            <NavLink to="/profile" className="profile-mini">
              <span className="avatar small">{initials}</span>
              <span>
                <strong>{userName}</strong>
                <small>{creditsText}</small>
              </span>
            </NavLink>
          ) : (
            <button
              type="button"
              className="outline-btn"
              style={{ width: '100%', marginTop: '10px' }}
              onClick={() => setShowAuthModal(true)}
            >
              Sign In / Switch
            </button>
          )}
        </div>
      </aside>

      {/* Main Area */}
      <main>
        <header className="topbar">
          <div className="mobile-brand">
            Skill<span>Cycle</span>
          </div>

          <form className="search" onSubmit={handleSearchSubmit}>
            <Search size={18} />
            <input
              placeholder="Search skills or people"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <div className="top-actions">
            <button
              type="button"
              className="icon-button"
              aria-label="Notifications"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={19} />
              {unreadCount > 0 && <i />}
            </button>

            {/* Notification Menu */}
            {showNotifications && (
              <div className="notification-menu">
                <div className="notification-menu-header">
                  <h4>NOTIFICATIONS</h4>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      className="text-button"
                      style={{ fontSize: '11px' }}
                      onClick={markAllRead}
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="notification-items">
                  {notifications && notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n._id || n.id}
                        className={`notification-item ${!n.read ? 'unread' : ''}`}
                        onClick={() => {
                          if (!n.read) markNotificationRead(n._id || n.id);
                          if (n.type.includes('SESSION')) navigate('/sessions');
                          if (n.type.includes('CREDIT')) navigate('/credits');
                        }}
                      >
                        <strong>{n.title}</strong>
                        <p style={{ margin: '3px 0 0', fontSize: '11px' }}>{n.message}</p>
                        <small>
                          {new Date(n.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </small>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '24px 16px', textAlign: 'center', color: '#88948d', fontSize: '12px' }}>
                      No notifications yet
                    </div>
                  )}
                </div>
              </div>
            )}

            {isAuthenticated ? (
              <NavLink to="/profile" className="avatar" title={`${userName} (${creditsText})`}>
                {initials}
              </NavLink>
            ) : (
              <button
                type="button"
                className="dark-btn"
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={() => setShowAuthModal(true)}
              >
                Sign In
              </button>
            )}
          </div>
        </header>

        {children}
      </main>

      {/* Mobile Nav */}
      <nav className="mobile-nav">
        {links.map(([Icon, label, to]) => (
          <NavLink
            to={to}
            key={label}
            end={to === '/'}
            onClick={() => {
              if (label === 'Messages') clearAllUnreadMessages();
            }}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            <Icon size={20} />
            <small>{label}</small>
            {label === 'Messages' && unreadMessagesCount > 0 && <b>{unreadMessagesCount}</b>}
          </NavLink>
        ))}
      </nav>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}
