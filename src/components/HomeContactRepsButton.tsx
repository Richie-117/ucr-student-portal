'use client';

import React, { useState } from 'react';
import { Phone, Users } from 'lucide-react';
import ContactRepsModal from '@/components/ContactRepsModal';

export default function HomeContactRepsButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-200 hover:text-white bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm"
        title="View Mobile Numbers of Batch Representatives"
      >
        <Phone className="w-4 h-4 text-ucr-orange" />
        <span>Contact</span>
      </button>

      <ContactRepsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
