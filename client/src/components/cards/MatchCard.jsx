import React from 'react';
import { Link } from 'react-router-dom';
import { Star, CheckCircle2, ArrowRight, Sparkles, MapPin, Video, Users } from 'lucide-react';
import SkillBadge from '../common/SkillBadge';

export default function MatchCard({ match, onRequestSession }) {
  const { user, matchScore, isMutualMatch, reasons } = match;

  const getScoreBadgeColor = (score) => {
    if (score >= 80) return 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-500/10';
    if (score >= 60) return 'bg-indigo-50 text-indigo-700 border-indigo-300 ring-2 ring-indigo-500/10';
    return 'bg-amber-50 text-amber-700 border-amber-300';
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between group hover:border-brand-200">
      <div>
        {/* Top Header: Score & Mutual Badge */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className="flex items-center gap-3">
            <img
              src={user.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
              alt={user.name}
              className="w-13 h-13 rounded-2xl object-cover ring-2 ring-slate-100 group-hover:scale-105 transition-transform"
            />
            <div>
              <Link
                to={`/profile/${user._id}`}
                className="font-bold text-base text-slate-900 hover:text-brand-600 transition-colors"
              >
                {user.name}
              </Link>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span className="flex items-center gap-1 text-amber-600 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {user.rating?.toFixed(1) || '5.0'}
                </span>
                <span>•</span>
                <span>{user.completedSessions || 0} sessions</span>
                {user.location && (
                  <>
                    <span>•</span>
                    <span className="truncate max-w-[120px]">{user.location.split(',')[0]}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span
              className={`text-xs font-extrabold px-3 py-1 rounded-full border shadow-2xs ${getScoreBadgeColor(
                matchScore
              )}`}
            >
              {matchScore}% Match
            </span>
            {isMutualMatch && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-300 px-2 py-0.5 rounded-full mt-1.5 flex items-center gap-1 animate-pulse-subtle">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                Mutual Barter
              </span>
            )}
          </div>
        </div>

        {/* Explainable Match Reasons (USP #2) */}
        <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100 mb-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-brand-600" />
            Why you matched (Deterministic Logic)
          </p>
          <ul className="space-y-1.5">
            {reasons.slice(0, 3).map((reason, idx) => (
              <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-tight">{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Skills Offered */}
        <div className="mb-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Teaches</p>
          <div className="flex flex-wrap gap-1.5">
            {user.skillsOffered?.map((so, idx) => (
              <SkillBadge
                key={idx}
                name={so.skill?.name || 'Skill'}
                category={so.skill?.category || 'default'}
                level={so.level}
                size="sm"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
        <Link
          to={`/profile/${user._id}`}
          className="flex-1 py-2 text-center text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
        >
          View Profile
        </Link>
        <button
          onClick={() => onRequestSession(user)}
          className="flex-1 py-2 text-center text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-sm hover:shadow flex items-center justify-center gap-1"
        >
          <span>Request Session</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
