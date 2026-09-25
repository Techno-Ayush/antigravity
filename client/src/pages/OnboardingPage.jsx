import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  BookOpen,
  Calendar,
  Compass,
  Coins,
  Plus,
  Trash2
} from 'lucide-react';
import api from '../api/axiosInstance';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function OnboardingPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [skillsList, setSkillsList] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(true);

  // Form states
  const [bio, setBio] = useState(user?.bio || 'Enthusiastic about peer learning and skill sharing!');
  const [preferredMode, setPreferredMode] = useState(user?.preferredMode || 'ONLINE');
  const [availability, setAvailability] = useState({
    weekdays: true,
    weekends: true,
    timeSlots: ['EVENING', 'AFTERNOON']
  });

  // Skills offered array
  const [offeredSkills, setOfferedSkills] = useState([]);
  const [currentOfferedSkillId, setCurrentOfferedSkillId] = useState('');
  const [currentOfferedLevel, setCurrentOfferedLevel] = useState('INTERMEDIATE');
  const [currentOfferedExp, setCurrentOfferedExp] = useState(2);

  // Skills wanted array
  const [wantedSkills, setWantedSkills] = useState([]);
  const [currentWantedSkillId, setCurrentWantedSkillId] = useState('');
  const [currentWantedLevel, setCurrentWantedLevel] = useState('BEGINNER');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await api.get('/skills');
        if (res.data.success) {
          setSkillsList(res.data.skills);
          if (res.data.skills.length > 0) {
            setCurrentOfferedSkillId(res.data.skills[0]._id);
            setCurrentWantedSkillId(res.data.skills[1]?._id || res.data.skills[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load skills:', err);
      } finally {
        setLoadingSkills(false);
      }
    };

    fetchSkills();
  }, []);

  const addOfferedSkill = () => {
    if (!currentOfferedSkillId) return;
    if (offeredSkills.some((s) => s.skill === currentOfferedSkillId)) return;

    const skillObj = skillsList.find((s) => s._id === currentOfferedSkillId);
    setOfferedSkills([
      ...offeredSkills,
      {
        skill: currentOfferedSkillId,
        skillObj,
        level: currentOfferedLevel,
        experienceYears: Number(currentOfferedExp),
        description: `1-on-1 tutoring in ${skillObj?.name}`
      }
    ]);
  };

  const removeOfferedSkill = (id) => {
    setOfferedSkills(offeredSkills.filter((s) => s.skill !== id));
  };

  const addWantedSkill = () => {
    if (!currentWantedSkillId) return;
    if (wantedSkills.some((s) => s.skill === currentWantedSkillId)) return;

    const skillObj = skillsList.find((s) => s._id === currentWantedSkillId);
    setWantedSkills([
      ...wantedSkills,
      {
        skill: currentWantedSkillId,
        skillObj,
        desiredLevel: currentWantedLevel,
        urgency: 'HIGH'
      }
    ]);
  };

  const removeWantedSkill = (id) => {
    setWantedSkills(wantedSkills.filter((s) => s.skill !== id));
  };

  const toggleTimeSlot = (slot) => {
    const exists = availability.timeSlots.includes(slot);
    if (exists) {
      setAvailability({
        ...availability,
        timeSlots: availability.timeSlots.filter((s) => s !== slot)
      });
    } else {
      setAvailability({
        ...availability,
        timeSlots: [...availability.timeSlots, slot]
      });
    }
  };

  const handleFinish = async () => {
    if (offeredSkills.length === 0) {
      setError('Please add at least 1 skill you can teach to earn credits.');
      setStep(2);
      return;
    }
    if (wantedSkills.length === 0) {
      setError('Please add at least 1 skill you wish to learn.');
      setStep(3);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        bio,
        preferredMode,
        availability,
        skillsOffered: offeredSkills.map((s) => ({
          skill: s.skill,
          level: s.level,
          experienceYears: s.experienceYears,
          description: s.description
        })),
        skillsWanted: wantedSkills.map((s) => ({
          skill: s.skill,
          desiredLevel: s.desiredLevel,
          urgency: s.urgency
        }))
      };

      const res = await api.put('/users/onboarding', payload);
      if (res.data.success) {
        await refreshUser();
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Onboarding failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingSkills) {
    return <LoadingSpinner text="Setting up your knowledge profile..." />;
  }

  return (
    <div className="min-h-[85vh] max-w-2xl mx-auto px-4 py-12">
      {/* Progress Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
          <span>Step {step} of 5</span>
          <span>
            {step === 1 && 'Basic Profile'}
            {step === 2 && 'What You Can Teach'}
            {step === 3 && 'What You Want to Learn'}
            {step === 4 && 'Availability & Mode'}
            {step === 5 && 'Confirmation'}
          </span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-brand-600 h-full transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        {error && (
          <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
            {error}
          </div>
        )}

        {/* STEP 1: Basic Profile */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-brand-600">
                Step 1 of 5
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                Tell the community about yourself
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                A brief bio helps other members feel confident exchanging time with you.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Bio / Learning Philosophy
              </label>
              <textarea
                rows="4"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="e.g. Software engineer and guitarist. Excited to teach web dev and pick up conversational Spanish!"
                className="w-full text-xs sm:text-sm p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Skills You Can Teach */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-600">
                Step 2 of 5 • Your Knowledge Currency
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                What skills can you teach?
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Every hour you teach earns you <strong>+1 Credit</strong> in your ledger.
              </p>
            </div>

            {/* Selector */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Skill</label>
                  <select
                    value={currentOfferedSkillId}
                    onChange={(e) => setCurrentOfferedSkillId(e.target.value)}
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
                    value={currentOfferedLevel}
                    onChange={(e) => setCurrentOfferedLevel(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-200 rounded-xl"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Years Experience</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={currentOfferedExp}
                    onChange={(e) => setCurrentOfferedExp(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={addOfferedSkill}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add to My Teaching Skills</span>
              </button>
            </div>

            {/* List */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-700">Skills you are offering ({offeredSkills.length}):</p>
              {offeredSkills.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No teaching skills added yet. Add at least one above.</p>
              ) : (
                offeredSkills.map((item) => (
                  <div
                    key={item.skill}
                    className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-950">{item.skillObj?.name}</span>
                      <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-emerald-300 font-semibold uppercase">
                        {item.level}
                      </span>
                      <span className="text-slate-500 text-[11px]">({item.experienceYears}y exp)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeOfferedSkill(item.skill)}
                      className="text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* STEP 3: Skills You Want to Learn */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-600">
                Step 3 of 5 • Your Learning Wishlist
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                What skills do you want to learn?
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Our rule-based engine will pair you with community members who teach these skills.
              </p>
            </div>

            {/* Selector */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Skill</label>
                  <select
                    value={currentWantedSkillId}
                    onChange={(e) => setCurrentWantedSkillId(e.target.value)}
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
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Target Level</label>
                  <select
                    value={currentWantedLevel}
                    onChange={(e) => setCurrentWantedLevel(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-200 rounded-xl"
                  >
                    <option value="BEGINNER">Beginner (Starting from scratch)</option>
                    <option value="INTERMEDIATE">Intermediate (Leveling up)</option>
                    <option value="ADVANCED">Advanced (Mastery)</option>
                  </select>
                </div>
              </div>
              <button
                type="button"
                onClick={addWantedSkill}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add to My Learning Wishlist</span>
              </button>
            </div>

            {/* List */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-700">Wishlist items ({wantedSkills.length}):</p>
              {wantedSkills.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No wishlist skills added yet. Add at least one above.</p>
              ) : (
                wantedSkills.map((item) => (
                  <div
                    key={item.skill}
                    className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/60 border border-indigo-200 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-indigo-950">{item.skillObj?.name}</span>
                      <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-indigo-300 font-semibold uppercase">
                        Target: {item.desiredLevel}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeWantedSkill(item.skill)}
                      className="text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* STEP 4: Availability & Preferred Mode */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-brand-600">
                Step 4 of 5
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                When & how do you prefer to meet?
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Used by the rule-based matching engine (+20 points for overlapping schedules).
              </p>
            </div>

            {/* Mode selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Preferred Mode</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'ONLINE', label: 'Online Video' },
                  { id: 'IN_PERSON', label: 'In-Person' },
                  { id: 'BOTH', label: 'Flexible / Both' }
                ].map((m) => (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setPreferredMode(m.id)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold text-center transition-all ${
                      preferredMode === m.id
                        ? 'border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-500/10'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Days */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Days Available</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAvailability({ ...availability, weekdays: !availability.weekdays })}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
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
                  className={`py-2.5 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                    availability.weekends
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold'
                      : 'border-slate-200 text-slate-500'
                  }`}
                >
                  Weekends (Sat-Sun) {availability.weekends ? '✓' : ''}
                </button>
              </div>
            </div>

            {/* Time Slots */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Time of Day</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT'].map((slot) => {
                  const selected = availability.timeSlots.includes(slot);
                  return (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => toggleTimeSlot(slot)}
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
        )}

        {/* STEP 5: Ready to Exchange */}
        {step === 5 && (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-md">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                You’re Ready to Exchange Knowledge!
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                Your profile is configured with <strong>{offeredSkills.length} teaching skills</strong> and <strong>{wantedSkills.length} learning goals</strong>.
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between text-left max-w-md mx-auto">
              <div className="flex items-center gap-3">
                <Coins className="w-6 h-6 text-emerald-600" />
                <div>
                  <p className="text-xs font-bold text-emerald-950">Active Ledger Balance</p>
                  <p className="text-[11px] text-emerald-800">3 Starter Credits ready to spend</p>
                </div>
              </div>
              <span className="text-lg font-black text-emerald-700">3 Cr</span>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 2 && offeredSkills.length === 0) {
                  setError('Please add at least 1 skill you can teach.');
                  return;
                }
                if (step === 3 && wantedSkills.length === 0) {
                  setError('Please add at least 1 skill you want to learn.');
                  return;
                }
                setError('');
                setStep(step + 1);
              }}
              className="px-6 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={submitting}
              className="px-8 py-3 text-xs sm:text-sm font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-2xl shadow-lg transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{submitting ? 'Finishing...' : 'Explore My Matches Now'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
