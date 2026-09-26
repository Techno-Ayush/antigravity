import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import api from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';

export default function AddSkillModal({ defaultType = 'teach', onClose, onSuccess }) {
  const { user, refreshUser } = useAuth();
  const [type, setType] = useState(defaultType); // 'teach' or 'learn'
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Programming');
  const [proficiency, setProficiency] = useState('Intermediate');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a skill name.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const currentTeach = user?.skillsToTeach || [];
      const currentLearn = user?.skillsToLearn || [];

      const newSkillObj = {
        name: name.trim(),
        category,
        proficiency,
        description: description.trim()
      };

      let updatedTeach = [...currentTeach];
      let updatedLearn = [...currentLearn];

      if (type === 'teach') {
        updatedTeach.push(newSkillObj);
      } else {
        updatedLearn.push(newSkillObj);
      }

      const res = await api.put('/users/skills', {
        skillsToTeach: updatedTeach,
        skillsToLearn: updatedLearn
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
      console.error('Error adding skill:', err);
      setError(err.response?.data?.message || 'Failed to add skill');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add a skill</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <X size={19} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {success ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#274e3e' }}>
                <CheckCircle size={44} style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '18px', marginBottom: '6px' }}>Skill Added!</h3>
                <p style={{ margin: 0, color: '#607268' }}>Your profile has been updated successfully.</p>
              </div>
            ) : (
              <>
                {error && (
                  <div style={{ background: '#fdeeed', border: '1px solid #f9d2ce', color: '#b23b2b', padding: '10px 12px', borderRadius: '6px', fontSize: '12px', marginBottom: '14px' }}>
                    {error}
                  </div>
                )}

                <label>Skill Type</label>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                  <button
                    type="button"
                    className={`theme-btn ${type === 'teach' ? 'active' : ''}`}
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => setType('teach')}
                  >
                    I can teach (Earn credits)
                  </button>
                  <button
                    type="button"
                    className={`theme-btn ${type === 'learn' ? 'active' : ''}`}
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => setType('learn')}
                  >
                    I want to learn (Spend credits)
                  </button>
                </div>

                <label>Skill Name</label>
                <input
                  type="text"
                  placeholder="e.g. React, Spanish, Classical Guitar, Data Structures..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label>Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)}>
                      <option value="Programming">Programming</option>
                      <option value="Language">Language</option>
                      <option value="Creative">Creative / Design</option>
                      <option value="Music">Music</option>
                      <option value="Academics">Academics</option>
                      <option value="Fitness">Fitness</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label>Proficiency</label>
                    <select value={proficiency} onChange={(e) => setProficiency(e.target.value)}>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <label>Brief Description</label>
                <textarea
                  rows={3}
                  placeholder={type === 'teach' ? 'What can you help someone understand or build?' : 'What are your goals with this skill?'}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </>
            )}
          </div>

          {!success && (
            <div className="modal-footer">
              <button type="button" className="outline-btn" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="dark-btn" disabled={loading}>
                {loading ? 'Adding...' : 'Add Skill'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
