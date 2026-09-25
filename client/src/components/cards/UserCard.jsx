import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Video, Users, ArrowRight } from 'lucide-react';
import SkillBadge from '../common/SkillBadge';

export default function UserCard({ user, onRequestSession }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between group hover:border-brand-200">
      <div>
        {/* User Info Header */}
        <div className="flex items-center gap-3.5 mb-4">
          <img
            src={user.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
            alt={user.name}
            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100 group-hover:scale-105 transition-transform"
          />
          <div>
            <Link
              to={`/profile/${user._id}`}
              className="font-bold text-base text-slate-900 hover:text-brand-600 transition-colors"
            >
              {user.name}
            </Link>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1 text-amber-600 font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {user.rating?.toFixed(1) || '5.0'}
              </span>
              <span>•</span>
              <span>{user.completedSessions || 0} sessions</span>
            </div>
            {user.location && (
              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate max-w-[160px]">{user.location}</span>
              </p>
            )}
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
            {user.bio}
          </p>
        )}

        {/* Skills Offered (Teaches) */}
        <div className="mb-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Can Teach (1 hr = +1 Cr)
          </p>
          <div className="flex flex-wrap gap-1.5">
            {user.skillsOffered && user.skillsOffered.length > 0 ? (
              user.skillsOffered.map((so, idx) => (
                <SkillBadge
                  key={idx}
                  name={so.skill?.name || 'Skill'}
                  category={so.skill?.category || 'default'}
                  level={so.level}
                  size="sm"
                />
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">No skills listed yet</span>
            )}
          </div>
        </div>

        {/* Skills Wanted (Learns) */}
        {user.skillsWanted && user.skillsWanted.length > 0 && (
          <div className="mb-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Wants to Learn
            </p>
            <div className="flex flex-wrap gap-1.5">
              {user.skillsWanted.map((sw, idx) => (
                <span
                  key={idx}
                  className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 font-medium"
                >
                  {sw.skill?.name || 'Skill'}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Card Footer */}
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
