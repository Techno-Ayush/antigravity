import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Coins, Calendar, Compass, ArrowRight } from 'lucide-react';

export default function EmptyState({
  type = 'default',
  title,
  description,
  actionText,
  actionLink,
  onActionClick
}) {
  const presets = {
    no_skills: {
      icon: Sparkles,
      iconColor: 'text-brand-500 bg-brand-50 border-brand-200',
      title: 'Your first skill is your first currency.',
      description: 'Add skills you know to start earning knowledge credits from eager learners in your community.',
      actionText: 'Add Skills to Teach',
      actionLink: '/profile/edit'
    },
    no_matches: {
      icon: Compass,
      iconColor: 'text-indigo-500 bg-indigo-50 border-indigo-200',
      title: 'We couldn’t find a match yet.',
      description: 'Expand your possibilities! Add another skill you can teach or wish to learn to trigger new rule-based matches.',
      actionText: 'Update Skills',
      actionLink: '/profile/edit'
    },
    no_credits: {
      icon: Coins,
      iconColor: 'text-amber-500 bg-amber-50 border-amber-200',
      title: 'Out of credits?',
      description: 'Teach someone for an hour to earn a knowledge credit. Your knowledge is always rechargeable.',
      actionText: 'Browse Learners Who Need You',
      actionLink: '/discover'
    },
    no_sessions: {
      icon: Calendar,
      iconColor: 'text-emerald-500 bg-emerald-50 border-emerald-200',
      title: 'Your next learning session will appear here.',
      description: 'Request a session with an expert teacher or accept incoming learning requests.',
      actionText: 'Find Someone to Learn From',
      actionLink: '/discover'
    }
  };

  const current = presets[type] || {
    icon: Sparkles,
    iconColor: 'text-slate-500 bg-slate-50 border-slate-200',
    title: title || 'Nothing found',
    description: description || 'No items available at the moment.',
    actionText: actionText || null,
    actionLink: actionLink || null
  };

  const IconComponent = current.icon;

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border shadow-sm ${current.iconColor}`}>
        <IconComponent className="w-7 h-7" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mb-1">
        {title || current.title}
      </h3>
      <p className="text-xs sm:text-sm text-slate-500 max-w-md leading-relaxed mb-6">
        {description || current.description}
      </p>

      {(actionText || current.actionText) && (
        actionLink || current.actionLink ? (
          <Link
            to={actionLink || current.actionLink}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm hover:shadow transition-all"
          >
            <span>{actionText || current.actionText}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <button
            onClick={onActionClick}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm hover:shadow transition-all"
          >
            <span>{actionText || current.actionText}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )
      )}
    </div>
  );
}
