import React, { useState } from 'react';
import { X, Star, CheckCircle } from 'lucide-react';
import api from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';

export default function RatingModal({ session, onClose, onSuccess }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!session) return null;

  const currentUserId = user?._id || user?.id;
  const isTeacher = session.teacher?._id === currentUserId || session.teacher === currentUserId;
  const reviewee = isTeacher ? session.learner : session.teacher;
  const revieweeId = reviewee?._id || reviewee;
  const revieweeName = reviewee?.name || 'Session Partner';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/ratings', {
        sessionId: session._id,
        revieweeId,
        rating,
        comment
      });

      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error('Error submitting rating:', err);
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Rate your exchange</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <X size={19} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {success ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#274e3e' }}>
                <CheckCircle size={44} style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '18px', marginBottom: '6px' }}>Review Submitted!</h3>
                <p style={{ margin: 0, color: '#607268' }}>
                  Thank you for keeping our community trustworthy and high quality.
                </p>
              </div>
            ) : (
              <>
                <p style={{ margin: '0 0 16px', color: '#69776f' }}>
                  How was your experience learning with <strong>{revieweeName}</strong>?
                </p>

                {error && (
                  <div style={{ background: '#fdeeed', border: '1px solid #f9d2ce', color: '#b23b2b', padding: '10px 12px', borderRadius: '6px', fontSize: '12px', marginBottom: '14px' }}>
                    {error}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', margin: '20px 0' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      style={{ background: 'transparent', border: 0, padding: '4px', cursor: 'pointer', color: (hoverRating || rating) >= star ? '#e5a847' : '#d2dad4' }}
                    >
                      <Star size={32} fill={(hoverRating || rating) >= star ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>

                <label>Feedback & Comments</label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share what went well, how clear the concepts were, or any highlights from the session..."
                  required
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
                {loading ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
