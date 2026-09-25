import React from 'react';

const categoryStyles = {
  Programming: 'bg-blue-50 text-blue-700 border-blue-200',
  Creative: 'bg-purple-50 text-purple-700 border-purple-200',
  Music: 'bg-amber-50 text-amber-700 border-amber-200',
  Academic: 'bg-rose-50 text-rose-700 border-rose-200',
  Professional: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Languages: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Fitness: 'bg-orange-50 text-orange-700 border-orange-200',
  Lifestyle: 'bg-teal-50 text-teal-700 border-teal-200',
  default: 'bg-slate-100 text-slate-700 border-slate-200'
};

export default function SkillBadge({
  name,
  category = 'default',
  level = null,
  type = 'teach', // 'teach' | 'learn'
  removable = false,
  onRemove = null,
  size = 'md'
}) {
  const colorClass = categoryStyles[category] || categoryStyles.default;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-lg border ${colorClass} ${sizeClasses[size] || sizeClasses.md} transition-all shadow-2xs`}
    >
      <span className="font-semibold">{name}</span>
      {level && (
        <span className="opacity-75 text-[10px] font-normal uppercase tracking-wider bg-white/60 px-1 py-0.2 rounded">
          {level}
        </span>
      )}
      {removable && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:opacity-100 opacity-60 ml-0.5 text-xs font-bold leading-none"
        >
          ×
        </button>
      )}
    </span>
  );
}
