import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Star, AlertCircle, Sparkles } from 'lucide-react';
import api from '../../api/axiosInstance';

export default function RatingModal({ isOpen, onClose, session, onRatingSuccess }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!session) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/ratings', {
        sessionId: session._id,
        rating,
        review: review.trim()
      });

      if (res.data.success) {
        onClose();
        if (onRatingSuccess) onRatingSuccess(res.data.rating);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rate Knowledge Exchange"
      subtitle={`Session: ${session.skill?.name || 'Skill Session'}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Interactive Star Rating */}
        <div className="text-center py-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Your Rating
          </p>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 text-amber-400 transition-transform hover:scale-125 focus:outline-hidden"
              >
                <Star
                  className={`w-8 h-8 ${
                    (hoverRating || rating) >= star
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-200'
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="inline-block mt-2 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
            {rating} of 5 Stars
          </span>
        </div>

        {/* Written Review */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Feedback & Testimonial (Optional)
          </label>
          <textarea
            rows="3"
            placeholder="Share how this session helped you or how prepared the participant was..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
          />
        </div>

        {/* Actions */}
        <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all"
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
