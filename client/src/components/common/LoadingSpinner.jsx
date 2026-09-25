import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ text = 'Loading...', size = 'md' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-7 h-7',
    lg: 'w-10 h-10'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
      <Loader2 className={`animate-spin text-brand-600 ${sizeClasses[size] || sizeClasses.md}`} />
      {text && <p className="text-xs text-slate-500 font-medium tracking-wide">{text}</p>}
    </div>
  );
}
