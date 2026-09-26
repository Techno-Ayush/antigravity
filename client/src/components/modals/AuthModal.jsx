import React, { useState } from 'react';
import { X, User, LogIn, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AuthModal({ onClose }) {
  const { login, register, switchUser } = useAuth();
  const [tab, setTab] = useState('demo'); // 'demo', 'login', 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const demoAccounts = [
    { name: 'Rahul Sharma', email: 'rahul@example.com', role: 'Active Learner / Teacher', credits: '3.0 Cr', desc: 'Teaches JS & Excel, wants Guitar & Spanish' },
    { name: 'Priya Shah', email: 'priya@example.com', role: 'Teacher', credits: '5.0 Cr', desc: 'Teaches Guitar & UX Design, wants Python' },
    { name: 'Amit Patel', email: 'amit@example.com', role: 'Teacher', credits: '4.0 Cr', desc: 'Teaches Spanish & English, wants Web Dev' },
    { name: 'Admin', email: 'admin@skillexchange.in', role: 'Platform Admin', credits: 'Admin', desc: 'Dispute arbitration & system moderation' }
  ];

  const handleDemoSwitch = async (account) => {
    setLoading(true);
    setError('');
    try {
      const pwd = account.email.startsWith('admin') ? 'admin123' : 'password123';
      await switchUser(account.email, pwd);
      onClose();
    } catch (err) {
      setError(err.message || 'Demo login failed');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        await register({ name, email, password });
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Exchange account</h2>
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

          <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
            <button
              type="button"
              className={`theme-btn ${tab === 'demo' ? 'active' : ''}`}
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => setTab('demo')}
            >
              Demo Switcher
            </button>
            <button
              type="button"
              className={`theme-btn ${tab === 'login' ? 'active' : ''}`}
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => setTab('login')}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`theme-btn ${tab === 'register' ? 'active' : ''}`}
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => setTab('register')}
            >
              Register
            </button>
          </div>

          {tab === 'demo' ? (
            <div style={{ display: 'grid', gap: '10px' }}>
              <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#6a7870' }}>
                Instantly switch roles to test time-banking, requests, and double confirmations:
              </p>
              {demoAccounts.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  className="test-user-chip"
                  onClick={() => handleDemoSwitch(account)}
                  disabled={loading}
                >
                  <div>
                    <strong>{account.name}</strong>
                    <small style={{ display: 'block', color: '#7a867f', marginTop: '2px' }}>
                      {account.desc}
                    </small>
                  </div>
                  <span className="skill-tag" style={{ marginLeft: '12px' }}>{account.credits}</span>
                </button>
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {tab === 'register' && (
                <>
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Ayush Goyal"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </>
              )}

              <label>Email Address</label>
              <input
                type="email"
                placeholder="you@campus.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" className="outline-btn" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="dark-btn" disabled={loading}>
                  {loading ? 'Please wait...' : tab === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
