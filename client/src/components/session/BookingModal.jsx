import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Modal from '../common/Modal';
import { Coins, Calendar, Clock, Video, MapPin, AlertCircle, Sparkles } from 'lucide-react';
import api from '../../api/axiosInstance';

export default function BookingModal({ isOpen, onClose, teacher, onBookingSuccess }) {
  const { user, spendableCredits, refreshUser } = useAuth();

  const [selectedSkillId, setSelectedSkillId] = useState(
    teacher?.skillsOffered?.[0]?.skill?._id || ''
  );
  const [duration, setDuration] = useState(1);
  const [scheduledDate, setScheduledDate] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState('18:00');
  const [mode, setMode] = useState(teacher?.preferredMode === 'IN_PERSON' ? 'IN_PERSON' : 'ONLINE');
  const [topic, setTopic] = useState('');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/skill-exchange-room');
  const [location, setLocation] = useState(teacher?.location || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!teacher) return null;

  const creditsRequired = duration; // 1 hr = 1 credit
  const hasEnoughCredits = spendableCredits >= creditsRequired;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSkillId) {
      setError('Please select a skill to learn.');
      return;
    }
    if (!topic.trim()) {
      setError('Please describe what you want to learn in this session.');
      return;
    }
    if (!hasEnoughCredits) {
      setError(`Insufficient credits. You need ${creditsRequired} credits, but have ${spendableCredits} available.`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/sessions', {
        teacherId: teacher._id,
        skillId: selectedSkillId,
        duration: Number(duration),
        scheduledDate,
        startTime,
        mode,
        topic: topic.trim(),
        meetingLink: mode === 'ONLINE' ? meetingLink : '',
        location: mode === 'IN_PERSON' ? location : ''
      });

      if (res.data.success) {
        await refreshUser();
        onClose();
        if (onBookingSuccess) onBookingSuccess(res.data.session);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to request session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Request Session with ${teacher.name}`}
      subtitle="1 Hour of Learning = 1 Knowledge Credit"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Credit Reservation Notice */}
        <div className="bg-emerald-50/80 border border-emerald-200 p-3.5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-950">Time-Bank Escrow</p>
              <p className="text-[11px] text-emerald-800">
                {creditsRequired} Credit will be reserved on hold until both confirm completion.
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400">Spendable</span>
            <p className="text-sm font-extrabold text-emerald-900">{spendableCredits} Cr</p>
          </div>
        </div>

        {/* Skill to learn */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Select Skill to Learn *
          </label>
          <select
            value={selectedSkillId}
            onChange={(e) => setSelectedSkillId(e.target.value)}
            className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            required
          >
            {teacher.skillsOffered?.map((so) => (
              <option key={so.skill?._id} value={so.skill?._id}>
                {so.skill?.name} ({so.level || 'Intermediate'})
              </option>
            ))}
          </select>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Duration & Credit Cost *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDuration(1)}
              className={`p-3 rounded-2xl border text-center transition-all ${
                duration === 1
                  ? 'border-brand-600 bg-brand-50/50 text-brand-900 font-bold ring-2 ring-brand-500/10'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              <div className="text-xs font-semibold">1 Hour</div>
              <div className="text-xs text-emerald-600 font-bold mt-0.5">1 Credit</div>
            </button>
            <button
              type="button"
              onClick={() => setDuration(2)}
              className={`p-3 rounded-2xl border text-center transition-all ${
                duration === 2
                  ? 'border-brand-600 bg-brand-50/50 text-brand-900 font-bold ring-2 ring-brand-500/10'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              <div className="text-xs font-semibold">2 Hours</div>
              <div className="text-xs text-emerald-600 font-bold mt-0.5">2 Credits</div>
            </button>
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Scheduled Date *
            </label>
            <input
              type="date"
              value={scheduledDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Start Time *
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              required
            />
          </div>
        </div>

        {/* Mode */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Preferred Session Mode
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode('ONLINE')}
              className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                mode === 'ONLINE'
                  ? 'border-brand-600 bg-brand-50 text-brand-700 font-bold'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              Online Video
            </button>
            <button
              type="button"
              onClick={() => setMode('IN_PERSON')}
              className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                mode === 'IN_PERSON'
                  ? 'border-brand-600 bg-brand-50 text-brand-700 font-bold'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              In-Person
            </button>
          </div>
        </div>

        {/* Topic details */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Learning Goal / Specific Topic *
          </label>
          <input
            type="text"
            placeholder="e.g. Acoustic fingerstyle intro & reading chord charts"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            required
          />
        </div>

        {/* Action Buttons */}
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
            disabled={loading || !hasEnoughCredits}
            className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-md transition-all flex items-center gap-1.5 ${
              loading || !hasEnoughCredits
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-brand-600 hover:bg-brand-700 hover:shadow-lg'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>{loading ? 'Reserving...' : `Confirm & Reserve ${creditsRequired} Cr`}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
