import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import api from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';

export default function EditProfileModal({ onClose, onSuccess }) {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [city, setCity] = useState(user?.location?.city || '');
  const [preferredMode, setPreferredMode] = useState(user?.preferredMode || 'both');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.put('/users/profile', {
        name,
        bio,
        location: { city },
        preferredMode
      });

      if (res.data.success) {
        setSuccess(true);
        await refreshUser();
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1000);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit profile</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <X size={19} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {success ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#274e3e' }}>
                <CheckCircle size={44} style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '18px', marginBottom: '6px' }}>Profile Updated!</h3>
                <p style={{ margin: 0, color: '#607268' }}>Your personal details are updated.</p>
              </div>
            ) : (
              <>
                {error && (
                  <div style={{ background: '#fdeeed', border: '1px solid #f9d2ce', color: '#b23b2b', padding: '10px 12px', borderRadius: '6px', fontSize: '12px', marginBottom: '14px' }}>
                    {error}
                  </div>
                )}

                <label>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <label>Bio / Headline</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short introduction..."
                />

                <label>City / Campus Location</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. New Delhi, IIT Delhi Campus"
                />

                <label>Preferred Session Mode</label>
                <select value={preferredMode} onChange={(e) => setPreferredMode(e.target.value)}>
                  <option value="both">Online and In person</option>
                  <option value="online">Online only</option>
                  <option value="in_person">In person only</option>
                </select>
              </>
            )}
          </div>

          {!success && (
            <div className="modal-footer">
              <button type="button" className="outline-btn" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="dark-btn" disabled={loading}>
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
