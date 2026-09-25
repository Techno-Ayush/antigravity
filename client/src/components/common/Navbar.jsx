import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import {
  Coins,
  Bell,
  User,
  LogOut,
  Calendar,
  Compass,
  MessageSquare,
  ShieldCheck,
  CheckCircle,
  Clock,
  Sparkles,
  Menu,
  X
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout, spendableCredits } = useAuth();
  const { notifications, unreadCount, markNotificationRead, markAllRead } = useSocket();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Coins className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">SkillExchange</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                  Time-Bank
                </span>
              </div>
              <p className="text-[11px] text-slate-500 -mt-1 font-medium">Your knowledge is currency</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/discover"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/discover') ? 'bg-slate-100 text-brand-600' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Compass className="w-4 h-4" />
              Discover Skills
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/dashboard') ? 'bg-slate-100 text-brand-600' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Dashboard
                </Link>

                <Link
                  to="/sessions"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/sessions') ? 'bg-slate-100 text-brand-600' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Sessions
                </Link>

                <Link
                  to="/credits"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/credits') ? 'bg-slate-100 text-brand-600' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Coins className="w-4 h-4 text-emerald-600" />
                  Credit Ledger
                </Link>

                <Link
                  to="/chat"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/chat') ? 'bg-slate-100 text-brand-600' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Chat
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/admin') ? 'bg-brand-50 text-brand-700' : 'text-amber-700 hover:bg-amber-50'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    Admin
                  </Link>
                )}
              </>
            ) : null}
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Visual Time-Bank Credit Wallet Pill */}
                <Link
                  to="/credits"
                  className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 px-3 py-1.5 rounded-full transition-all group shadow-sm"
                  title="Your Spendable Knowledge Credits (1 credit = 1 hour)"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    ⚡
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-extrabold text-sm text-emerald-900">{spendableCredits}</span>
                    <span className="text-[11px] font-semibold text-emerald-700">Credits</span>
                  </div>
                  {user?.reservedCredits > 0 && (
                    <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded-full" title={`${user.reservedCredits} credit(s) reserved in escrow for upcoming sessions`}>
                      {user.reservedCredits} held
                    </span>
                  )}
                </Link>

                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotifs(!showNotifs);
                      setShowUserMenu(false);
                    }}
                    className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifs && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 px-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-slate-900">Notifications</span>
                          {unreadCount > 0 && (
                            <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-semibold">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="text-xs text-brand-600 hover:text-brand-800 font-medium"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto space-y-1">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-xs text-slate-500">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.slice(0, 8).map((notif) => (
                            <div
                              key={notif._id}
                              onClick={() => {
                                markNotificationRead(notif._id);
                                if (notif.link) {
                                  navigate(notif.link);
                                  setShowNotifs(false);
                                }
                              }}
                              className={`p-2.5 rounded-xl cursor-pointer transition-colors text-left ${
                                notif.read ? 'hover:bg-slate-50' : 'bg-brand-50/50 hover:bg-brand-50 border-l-4 border-brand-500'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <p className="text-xs font-bold text-slate-900">{notif.title}</p>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Avatar Menu */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowUserMenu(!showUserMenu);
                      setShowNotifs(false);
                    }}
                    className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full hover:bg-slate-100 border border-slate-200 transition-colors"
                  >
                    <img
                      src={user?.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                      alt={user?.name}
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-brand-500/20"
                    />
                    <span className="text-xs font-semibold text-slate-700 max-w-[100px] truncate hidden sm:inline">
                      {user?.name?.split(' ')[0]}
                    </span>
                  </button>

                  {/* User Dropdown */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-2 border-b border-slate-100 mb-1">
                        <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      </div>

                      <Link
                        to={`/profile/${user?._id}`}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                      >
                        <User className="w-4 h-4 text-slate-500" />
                        My Skill Profile
                      </Link>

                      <Link
                        to="/profile/edit"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                      >
                        <Sparkles className="w-4 h-4 text-brand-600" />
                        Edit Teach & Learn Skills
                      </Link>

                      <Link
                        to="/credits"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                      >
                        <Coins className="w-4 h-4 text-emerald-600" />
                        Knowledge Ledger ({spendableCredits} Cr)
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg mt-1 border-t border-slate-100"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-600/20 rounded-xl transition-all hover:shadow-lg flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>Start Exchanging</span>
                  <span className="hidden sm:inline text-xs bg-brand-700/80 px-1.5 py-0.5 rounded-full text-emerald-300 font-bold">
                    +3 Credits
                  </span>
                </Link>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden text-slate-600 hover:text-slate-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 space-y-2">
            <Link
              to="/discover"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Discover Skills
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Dashboard
                </Link>
                <Link
                  to="/sessions"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Sessions
                </Link>
                <Link
                  to="/credits"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Credit Ledger ({spendableCredits} available)
                </Link>
                <Link
                  to="/chat"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Chat
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-amber-700 hover:bg-amber-50"
                  >
                    Admin Console
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2 text-sm font-medium text-white bg-brand-600 rounded-lg"
                >
                  Get Started (+3 Starter Credits)
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
