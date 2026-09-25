import React from 'react';
import { Star, CheckCircle } from 'lucide-react';

export default function ReviewCard({ review }) {
  const { rater, rating, review: comment, role, createdAt, session } = review;

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img
            src={rater?.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
            alt={rater?.name}
            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
          />
          <div>
            <p className="text-xs font-bold text-slate-900">{rater?.name || 'Community Member'}</p>
            <p className="text-[10px] text-slate-400">
              {role === 'TEACHER' ? 'Learned from them' : 'Taught by them'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="text-xs font-bold text-amber-800">{rating}</span>
        </div>
      </div>

      {comment ? (
        <p className="text-xs text-slate-600 leading-relaxed italic">
          "{comment}"
        </p>
      ) : (
        <p className="text-xs text-slate-400 italic">No written comment provided.</p>
      )}

      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
        <span>{session?.skill?.name ? `Skill: ${session.skill.name}` : 'Verified Exchange'}</span>
        <span>{new Date(createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
