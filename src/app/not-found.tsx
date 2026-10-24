import React from 'react';
import Link from 'next/link';
import { Home, ArrowLeft, Tv, AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-orange-500/10 border border-orange-500/20 text-ucr-orange">
          <Tv className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="text-xs font-mono font-bold text-ucr-orange uppercase tracking-widest">
            Error 404 — Signal Not Found
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Off the Air
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed">
            The page or broadcast transmission you requested does not exist or has been relocated within the Division portal.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-ucr-orange hover:bg-ucr-orange-hover shadow-orange-glow transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>

          <Link
            href="/students"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white bg-surface-lighter hover:bg-surface-hover border border-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Student Directory</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
