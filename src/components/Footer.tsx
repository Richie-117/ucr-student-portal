'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Sparkles, Film, GraduationCap } from 'lucide-react';
import ContactRepsModal from '@/components/ContactRepsModal';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [contactModalOpen, setContactModalOpen] = useState(false);

  return (
    <footer className="bg-[#040B15] border-t border-white/10 text-text-secondary pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">

          {/* Institutional Info & Logos */}
          <div className="md:col-span-5 space-y-5">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative h-12 w-auto flex items-center">
                <Image
                  src="/images/ucr.png"
                  alt="University College of Rathmalana"
                  width={150}
                  height={50}
                  className="h-10 sm:h-12 w-auto object-contain"
                />
              </div>
              <div className="h-8 w-[1px] bg-white/15" />
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase text-text-muted">Powered by</span>
                <Image
                  src="/images/uovt.png"
                  alt="University of Vocational Technology"
                  width={110}
                  height={40}
                  className="h-8 sm:h-9 w-auto object-contain"
                />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-white font-bold text-lg tracking-tight">
                Division of Television Studies
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed max-w-md">
                Empowering the next generation of broadcast directors, digital cinematographers, vision switchers, and post-production specialists at University College of Rathmalana.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-text-muted">
              <GraduationCap className="w-4 h-4 text-ucr-orange" />
              <span>Higher National Diploma Pathways (NVQ Level 5 & 6)</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home Overview
                </Link>
              </li>
              <li>
                <Link href="/students" className="hover:text-white transition-colors">
                  Students Directory
                </Link>
              </li>
              <li>
                <Link href="/modules" className="hover:text-white transition-colors">
                  Academic Modules
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-white transition-colors">
                  Events & Showcase
                </Link>
              </li>
              <li>
                <Link href="/tools" className="hover:text-white transition-colors">
                  Student Tools
                </Link>
              </li>
              <li>
                <button
                  onClick={() => setContactModalOpen(true)}
                  className="hover:text-ucr-orange flex items-center gap-1.5 transition-colors text-left"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Contact Representatives</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Academic Programmes */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">
              Diplomas
            </h4>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-surface/60 border border-white/5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-orange-400">TPOPT</span>
                  <span className="text-[11px] text-text-muted">Batch 11 — 2026</span>
                </div>
                <p className="text-xs text-slate-300">
                  Television & Digital Media Post Production Technology
                </p>
              </div>

              <div className="p-3 rounded-lg bg-surface/60 border border-white/5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-sky-400">TPRPT</span>
                  <span className="text-[11px] text-text-muted">Batch 11 — 2026</span>
                </div>
                <p className="text-xs text-slate-300">
                  Television & Digital Media Production Technology
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <p>
            © {currentYear} Division of Television Studies, University College of Ratmalana. All rights reserved.
          </p>
          <p className="text-center sm:text-right">
            Affiliated with University of Vocational Technology (UoVT), Sri Lanka.
          </p>
        </div>
      </div>

      <ContactRepsModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
      />
    </footer>
  );
}
