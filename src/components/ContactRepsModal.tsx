'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import Badge from '@/components/Badge';
import { Student } from '@/lib/types';
import {
  Phone,
  PhoneCall,
  MessageSquare,
  Copy,
  Check,
  Award,
  Sparkles,
  Users,
  ShieldAlert,
  Loader2,
} from 'lucide-react';

interface ContactRepsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactRepsModal({ isOpen, onClose }: ContactRepsModalProps) {
  const [reps, setReps] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    async function loadRepresentatives() {
      try {
        setLoading(true);
        const res = await fetch('/api/students?representative=true');
        const data = await res.json();
        if (data.students) {
          setReps(data.students);
        }
      } catch (err) {
        console.error('Failed to load batch representatives:', err);
      } finally {
        setLoading(false);
      }
    }

    loadRepresentatives();
  }, [isOpen]);

  const copyPhoneNumber = (phone: string, id: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getCleanWhatsAppNumber = (phone: string) => {
    return phone.replace(/[^0-9]/g, '');
  };

  const tpoptReps = reps.filter((r) => r.course === 'TPOPT');
  const tprptReps = reps.filter((r) => r.course === 'TPRPT');

  const getInitials = (name: string) => {
    const clean = name.replace(/\(Demo\)/gi, '').trim();
    const parts = clean.split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const renderRepCard = (rep: Student, courseAccent: 'orange' | 'blue') => {
    const phone = rep.phoneNumber || '+94 77 123 4567';
    const waNumber = getCleanWhatsAppNumber(phone);

    return (
      <div
        key={rep.id}
        className={`p-4 rounded-2xl border transition-all ${
          courseAccent === 'orange'
            ? 'bg-orange-500/5 border-orange-500/25 hover:border-orange-500/40'
            : 'bg-sky-500/5 border-sky-500/25 hover:border-sky-500/40'
        }`}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            {rep.profileImageUrl ? (
              <img
                src={rep.profileImageUrl}
                alt={rep.fullName}
                className={`w-11 h-11 rounded-xl object-cover flex-shrink-0 border ${
                  courseAccent === 'orange'
                    ? 'border-orange-500/40'
                    : 'border-sky-500/40'
                }`}
              />
            ) : (
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 border ${
                  courseAccent === 'orange'
                    ? 'bg-orange-500/15 text-orange-400 border-orange-500/30'
                    : 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                }`}
              >
                {getInitials(rep.fullName)}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400">
                <Sparkles className="w-3 h-3" />
                <span>{rep.representativeRole || `${rep.gender || ''} Representative`}</span>
              </div>
              <h4 className="text-sm font-bold text-white truncate">{rep.fullName}</h4>
              <div className="text-[11px] font-mono text-text-muted">{rep.studentNumber}</div>
            </div>
          </div>

          <Badge variant={rep.course === 'TPOPT' ? 'tpopt' : 'tprpt'} size="sm">
            {rep.course}
          </Badge>
        </div>

        {/* Mobile Number & Direct Action Buttons */}
        <div className="pt-3 border-t border-white/5 space-y-2.5">
          <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-black/40 border border-white/5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-white">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>{phone}</span>
            </div>

            <button
              onClick={() => copyPhoneNumber(phone, rep.id)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-text-muted hover:text-white transition-colors"
              title="Copy mobile number"
            >
              {copiedId === rep.id ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href={`tel:${phone.replace(/\s+/g, '')}`}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-sm"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call Now</span>
            </a>

            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-[#25D366]/20 hover:bg-[#25D366] hover:text-black border border-[#25D366]/30 transition-all shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Contact Batch 11 Representatives"
      maxWidth="2xl"
    >
      <div className="space-y-6">
        <div className="space-y-1">
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            Direct mobile contact directory for appointed student batch representatives at the <strong>Division of Television Studies</strong>. Reach out for peer assistance, academic coordination, or division inquiries.
          </p>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-ucr-orange" />
            <span className="text-xs text-text-muted">Loading representative contacts...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* TPOPT Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-orange-500/20 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-400" />
                  TPOPT Representatives (Post Production)
                </span>
                <span className="text-[11px] text-text-muted font-medium">Batch 11 — 2026</span>
              </div>

              {tpoptReps.length === 0 ? (
                <div className="p-4 text-center rounded-xl bg-surface border border-dashed border-white/10 text-xs text-text-muted">
                  No representatives currently assigned for TPOPT.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {tpoptReps.map((r) => renderRepCard(r, 'orange'))}
                </div>
              )}
            </div>

            {/* TPRPT Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between border-b border-sky-500/20 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  TPRPT Representatives (Studio Production)
                </span>
                <span className="text-[11px] text-text-muted font-medium">Batch 11 — 2026</span>
              </div>

              {tprptReps.length === 0 ? (
                <div className="p-4 text-center rounded-xl bg-surface border border-dashed border-white/10 text-xs text-text-muted">
                  No representatives currently assigned for TPRPT.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {tprptReps.map((r) => renderRepCard(r, 'blue'))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
          <span>University College of Rathmalana • Intake 2026</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-surface-lighter hover:bg-surface-hover text-white font-semibold transition-colors w-full sm:w-auto"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
