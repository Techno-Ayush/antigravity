import React, { useState } from 'react';
import { Sun, Moon, Laptop, User, Shield, LogOut, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axiosInstance';

export default function Settings() {
  const { user, logout, switchUser, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const demoAccounts = [
    { name: 'Rahul Sharma', email: 'rahul@example.com', role: 'Learner & Teacher', credits: '3.0 Cr', desc: 'Teaches JS & Excel, wants Guitar & Spanish' },
    { name: 'Priya Shah', email: 'priya@example.com', role: 'Teacher', credits: '5.0 Cr', desc: 'Teaches Guitar & UX Design, wants Python' },
    { name: 'Amit Patel', email: 'amit@example.com', role: 'Teacher', credits: '4.0 Cr', desc: 'Teaches Spanish & English, wants Web Dev' },
    { name: 'Admin', email: 'admin@skillexchange.in', role: 'Administrator', credits: 'Admin', desc: 'Dispute arbitration & platform moderation' }
  ];

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage('');
    setErrorMessage('');
    try {
      const res = await api.put('/users/profile', { name });
      if (res.data.success) {
        setStatusMessage('Profile information saved.');
        await refreshUser();
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSwitch = async (account) => {
    try {
      const pwd = account.email.startsWith('admin') ? 'admin123' : 'password123';
      await switchUser(account.email, pwd);
    } catch (err) {
      alert('Failed to switch user');
    }
  };

  return (
    <section className="page">
      <div>
        <p className="eyebrow">PREFERENCES & ACCOUNT</p>
        <h1>Settings</h1>
        <p className="subcopy">Manage appearance, theme, account details, and testing accounts.</p>
      </div>

      <div className="settings-grid" style={{ marginTop: '28px' }}>
        {/* Appearance Section */}
        <section className="settings-card">
          <h2>Appearance & Theme</h2>
          <p className="subcopy">Choose your interface theme. Matches the approved Codex visual design.</p>
          <div className="theme-switcher">
            <button
              type="button"
              className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
              onClick={() => setTheme('light')}
            >
              <Sun size={17} /> Light {theme === 'light' && <Check size={14} />}
            </button>
            <button
              type="button"
              className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => setTheme('dark')}
            >
              <Moon size={17} /> Dark {theme === 'dark' && <Check size={14} />}
            </button>
            <button
              type="button"
              className={`theme-btn ${theme === 'system' ? 'active' : ''}`}
              onClick={() => setTheme('system')}
            >
              <Laptop size={17} /> System {theme === 'system' && <Check size={14} />}
            </button>
          </div>
        </section>

        {/* 1-Click Fast Role Switcher for Testing Time Bank Economy */}
        <section className="settings-card">
          <h2>1-Click Evaluator Account Switcher</h2>
          <p className="subcopy">
            Instantly switch between student profiles to test requests, escrow holds, and double confirmations.
          </p>
          <div style={{ display: 'grid', gap: '10px', marginTop: '16px' }}>
            {demoAccounts.map((account) => {
              const isCurrent = user?.email === account.email;
              return (
                <button
                  type="button"
                  key={account.email}
                  className="test-user-chip"
                  style={{ borderColor: isCurrent ? '#274e3e' : '#dce2dc', background: isCurrent ? '#edf5ef' : '' }}
                  onClick={() => handleDemoSwitch(account)}
                >
                  <div>
                    <strong>{account.name} {isCurrent && '(Active)'}</strong>
                    <small style={{ display: 'block', color: '#7a867f', marginTop: '2px' }}>
                      {account.desc}
                    </small>
                  </div>
                  <span className="skill-tag">{account.credits}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Account Details Form */}
        <section className="settings-card">
          <h2>Account Details</h2>
          <p className="subcopy">Your display identity across the skill exchange community.</p>

          {statusMessage && (
            <div style={{ background: '#edf5ed', border: '1px solid #d6e8d8', color: '#274e3e', padding: '10px 12px', borderRadius: '6px', fontSize: '12px', margin: '14px 0' }}>
              {statusMessage}
            </div>
          )}

          {errorMessage && (
            <div style={{ background: '#fdeeed', border: '1px solid #f9d2ce', color: '#b23b2b', padding: '10px 12px', borderRadius: '6px', fontSize: '12px', margin: '14px 0' }}>
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} style={{ marginTop: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#55625a', marginBottom: '5px' }}>
              FULL NAME
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '9px 11px', border: '1px solid #dce2dc', borderRadius: '6px', fontSize: '13px', marginBottom: '14px' }}
              required
            />

            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#55625a', marginBottom: '5px' }}>
              EMAIL ADDRESS (READ-ONLY)
            </label>
            <input
              type="email"
              value={email}
              disabled
              style={{ width: '100%', padding: '9px 11px', border: '1px solid #e5ebe5', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', background: '#f8faf8', color: '#88948e' }}
            />

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button type="submit" className="dark-btn" disabled={loading}>
                {loading ? 'Saving...' : 'Save changes'}
              </button>
              <button
                type="button"
                className="outline-btn"
                style={{ color: '#a3483b' }}
                onClick={logout}
              >
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          </form>
        </section>
      </div>
    </section>
  );
}
