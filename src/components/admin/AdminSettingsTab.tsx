'use client';

import React, { useState } from 'react';
import ConfirmModal from '@/components/ConfirmModal';
import { Database, RotateCcw, Server, Shield, HardDrive, CheckCircle2, AlertTriangle, Key } from 'lucide-react';

interface AdminSettingsTabProps {
  onResetDatabase: () => void;
}

export default function AdminSettingsTab({ onResetDatabase }: AdminSettingsTabProps) {
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = async () => {
    setResetting(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to reset database');
      setResetSuccess(true);
      setIsResetConfirmOpen(false);
      onResetDatabase();
      setTimeout(() => setResetSuccess(false), 5000);
    } catch (err: any) {
      alert(err.message || 'Reset failed');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* System Status Overview */}
      <div className="p-6 rounded-3xl bg-surface border border-white/10 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-orange-500/10 text-ucr-orange">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">System Architecture & Persistence</h3>
            <p className="text-xs text-text-muted">
              Production data access layer with file-backed JSON database and server-side authentication.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-[#091728] border border-white/5 space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <HardDrive className="w-3.5 h-3.5" />
              <span>Storage Driver</span>
            </div>
            <div className="text-sm font-bold text-white">Persistent JSON Engine</div>
            <div className="text-[11px] font-mono text-text-muted">data/db.json</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#091728] border border-white/5 space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
              <Shield className="w-3.5 h-3.5" />
              <span>Authentication</span>
            </div>
            <div className="text-sm font-bold text-white">Jose JWT + Bcrypt</div>
            <div className="text-[11px] text-text-muted">HTTP-only Secure Cookie</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#091728] border border-white/5 space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-orange-400">
              <Database className="w-3.5 h-3.5" />
              <span>Media Assets</span>
            </div>
            <div className="text-sm font-bold text-white">Local Upload Storage</div>
            <div className="text-[11px] font-mono text-text-muted">public/uploads/</div>
          </div>
        </div>
      </div>

      {/* Database Reset Action */}
      <div className="p-6 rounded-3xl bg-surface border border-white/10 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-ucr-orange" />
              Reset Database to Initial Sample Seed
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed max-w-xl">
              Restores the portal database to the pristine starting state: 49 registered students (26 TPOPT + 23 TPRPT), assigned batch representatives, 6 academic learning stages, sample ongoing & upcoming modules, events, and gallery records.
            </p>
          </div>

          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/30 transition-all flex items-center gap-1.5 flex-shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Database</span>
          </button>
        </div>

        {resetSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Database successfully re-seeded with 49 students, modules, and events!</span>
          </div>
        )}
      </div>

      {/* Production Migration Guide */}
      <div className="p-6 rounded-3xl bg-surface/50 border border-white/10 space-y-3">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
          Connecting External Managed Cloud Database (Supabase / PostgreSQL)
        </h4>
        <p className="text-xs text-text-secondary leading-relaxed">
          The application is built with an isolated data access layer in <code className="text-orange-400 font-mono">src/lib/db.ts</code>. To switch from the file-backed JSON engine to Supabase or PostgreSQL in production:
        </p>
        <ul className="list-disc list-inside text-xs text-text-muted space-y-1 font-mono">
          <li>Set <span className="text-slate-300">DATABASE_URL</span> or <span className="text-slate-300">SUPABASE_URL</span> &amp; <span className="text-slate-300">SUPABASE_SERVICE_ROLE_KEY</span> in your environment (.env).</li>
          <li>Point the database access methods in <span className="text-slate-300">src/lib/db.ts</span> to the database client.</li>
          <li>All API endpoints and UI components remain completely unchanged!</li>
        </ul>
      </div>

      {isResetConfirmOpen && (
        <ConfirmModal
          isOpen={isResetConfirmOpen}
          onClose={() => setIsResetConfirmOpen(false)}
          onConfirm={handleReset}
          title="Reset Portal Database"
          message="This will overwrite current student records, modules, stages, and events with the initial specification seed data (49 students: 26 TPOPT + 23 TPRPT). Are you sure?"
          confirmLabel="Reset to Seed Data"
          isLoading={resetting}
        />
      )}
    </div>
  );
}
