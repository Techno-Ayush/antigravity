import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowRight } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-500">
        <Compass className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-black text-slate-900 tracking-tight">404 - Page Not Found</h1>
      <p className="text-xs sm:text-sm text-slate-500 max-w-md">
        The knowledge route you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
      >
        Return to Home
      </Link>
    </div>
  );
}
