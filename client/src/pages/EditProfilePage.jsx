import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Calendar,
  Video
} from 'lucide-react';
import api from '../api/axiosInstance';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function EditProfilePage() {
  const { user, updateUser, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [skillsList, setSkillsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Profile fields
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [preferredMode, setPreferredMode] = useState(user?.preferredMode || 'ONLINE');
  const [availability, setAvailability] = useState(
    user?.availability || { weekdays: true, weekends: true, timeSlots: ['EVENING'] }
  );

  // Skills Offered
  const [skillsOffered, setSkillsOffered] = useState(
    user?.skillsOffered?.map((so) => ({
      skill: so.skill?._id || so.skill,
      skillName: so.skill?.name || 'Skill',
      level: so.level || 'INTERMEDIATE',
      experienceYears: so.experienceYears || 2,
      description: so.description || ''
    })) || []
  );
  const [newOfferedSkillId, setNewOfferedSkillId] = useState('');
  const [newOfferedLevel, setNewOfferedLevel] = useState('INTERMEDIATE');
  const [newOfferedExp, setNewOfferedExp] = useState(2);

  // Skills Wanted
  const [skillsWanted, setSkillsWanted] = useState(
    user?.skillsWanted?.map((sw) => ({
      skill: sw.skill?._id || sw.skill,
      skillName: sw.skill?.name || 'Skill',
      desiredLevel: sw.desiredLevel || 'BEGINNER',
      urgency: sw.urgency || 'MEDIUM'
    })) || []
  );
  const [newWantedSkillId, setNewWantedSkillId] = useState('');
  const [newWantedLevel, setNewWantedLevel] = useState('BEGINNER');

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await api.get('/skills');
        if (res.data.success) {
          setSkillsList(res.data.skills);
          if (res.data.skills.length > 0) {
            setNewOfferedSkillId(res.data.skills[0]._id);
            setNewWantedSkillId(res.data.skills[0]._id);
          }
        }
      } catch (err) {
        console.error('Error fetching skills:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  const handleAddOffered = () => {
    if (!newOfferedSkillId) return;
    if (skillsOffered.some((s) => s.skill === newOfferedSkillId)) return;

    const skillObj = skillsList.find((s) => s._id === newOfferedSkillId);
    setSkillsOffered([
      ...skillsOffered,
      {
        skill: newOfferedSkillId,
        skillName: skillObj?.name || 'Skill',
        level: newOfferedLevel,
        experienceYears: Number(newOfferedExp),
        description: `1-on-1 practical coaching in ${skillObj?.name}`
      }
    ]);
  };

  const handleRemoveOffered = (id) => {
    setSkillsOffered(skillsOffered.filter((s) => s.skill !== id));
  };

  const handleAddWanted = () => {
    if (!newWantedSkillId) return;
    if (skillsWanted.some((s) => s.skill === newWantedSkillId)) return;

    const skillObj = skillsList.find((s) => s._id === newWantedSkillId);
    setSkillsWanted([
      ...skillsWanted,
      {
        skill: newWantedSkillId,
        skillName: skillObj?.name || 'Skill',
        desiredLevel: newWantedLevel,
        urgency: 'HIGH'
      }
    ]);
  };

  const handleRemoveWanted = (id) => {
    setSkillsWanted(skillsWanted.filter((s) => s.skill !== id));
  };

  const toggleSlot = (slot) => {
    const exists = availability.timeSlots.includes(slot);
    setAvailability({
      ...availability,
      timeSlots: exists
        ? availability.timeSlots.filter((s) => s !== slot)
        : [...availability.timeSlots, slot]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      // 1. Update Profile fields
      await api.put('/users/profile', {
        bio,
        location,
        preferredMode,
        availability
      });

      // 2. Update Skills fields
      await api.put('/users/skills', {
        skillsOffered: skillsOffered.map((s) => ({
          skill: s.skill,
          level: s.level,
          experienceYears: s.experienceYears,
          description: s.description
        })),
        skillsWanted: skillsWanted.map((s) => ({
          skill: s.skill,
          desiredLevel: s.desiredLevel,
          urgency: s.urgency
        }))
      });

      await refreshUser();
      setSuccessMsg('Profile and skills updated successfully!');
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading skill configuration..." />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Edit Profile & Skills Exchange
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Adjust the skills you teach to earn credits and wishlist skills you want to learn.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Bio & Location */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-extrabold text-slate-900">1. Basic Information</h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Bio</label>
            <textarea
              rows="3"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">City / Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Preferred Mode</label>
              <select
                value={preferredMode}
                onChange={(e) => setPreferredMode(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              >
                <option value="ONLINE">Online Video Sessions</option>
                <option value="IN_PERSON">In-Person Sessions</option>
                <option value="BOTH">Flexible / Both</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Skills You Teach */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 text-emerald-950">
                2. Skills I Can Teach (+1 Credit / Hour)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Every hour you teach another member earns you 1 credit.
              </p>
            </div>
          </div>

          {/* Add skill row */}
          <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 grid grid-cols-1 sm:grid-cols-4 gap-2">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Select Skill</label>
              <select
                value={newOfferedSkillId}
                onChange={(e) => setNewOfferedSkillId(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded-xl"
              >
                {skillsList.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.category})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Proficiency</label>
              <select
                value={newOfferedLevel}
                onChange={(e) => setNewOfferedLevel(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded-xl"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleAddOffered}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Skill</span>
              </button>
            </div>
          </div>

          {/* Current teaching list */}
          <div className="space-y-2">
            {skillsOffered.map((so) => (
              <div
                key={so.skill}
                className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{so.skillName}</span>
                  <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200 font-semibold uppercase">
                    {so.level}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveOffered(so.skill)}
                  className="text-rose-500 hover:text-rose-700 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Skills You Want to Learn */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 text-indigo-950">
              3. Skills I Want to Learn (-1 Credit / Hour)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              These dictate your smart rule-based match suggestions.
            </p>
          </div>

          {/* Add wanted row */}
          <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-200 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Select Skill</label>
              <select
                value={newWantedSkillId}
                onChange={(e) => setNewWantedSkillId(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded-xl"
              >
                {skillsList.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.category})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Desired Level</label>
              <select
                value={newWantedLevel}
                onChange={(e) => setNewWantedLevel(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded-xl"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleAddWanted}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Wishlist</span>
              </button>
            </div>
          </div>

          {/* Current wanted list */}
          <div className="space-y-2">
            {skillsWanted.map((sw) => (
              <div
                key={sw.skill}
                className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{sw.skillName}</span>
                  <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200 font-semibold uppercase">
                    Target: {sw.desiredLevel}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveWanted(sw.skill)}
                  className="text-rose-500 hover:text-rose-700 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Availability */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-extrabold text-slate-900">4. Availability Schedule</h2>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAvailability({ ...availability, weekdays: !availability.weekdays })}
              className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                availability.weekdays
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold'
                  : 'border-slate-200 text-slate-500'
              }`}
            >
              Weekdays (Mon-Fri) {availability.weekdays ? '✓' : ''}
            </button>
            <button
              type="button"
              onClick={() => setAvailability({ ...availability, weekends: !availability.weekends })}
              className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                availability.weekends
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold'
                  : 'border-slate-200 text-slate-500'
              }`}
            >
              Weekends (Sat-Sun) {availability.weekends ? '✓' : ''}
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Times of Day</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT'].map((slot) => {
                const selected = availability.timeSlots.includes(slot);
                return (
                  <button
                    type="button"
                    key={slot}
                    onClick={() => toggleSlot(slot)}
                    className={`py-2 px-2 rounded-xl border text-xs font-semibold text-center capitalize transition-all ${
                      selected
                        ? 'border-brand-600 bg-brand-50 text-brand-700 font-bold'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {slot.toLowerCase()} {selected ? '✓' : ''}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Profile & Update Matches'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
