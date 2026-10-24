'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone, User } from 'lucide-react';
import ContactRepsModal from '@/components/ContactRepsModal';

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Students', href: '/students' },
    { name: 'Modules', href: '/modules' },
    { name: 'Events', href: '/events' },
    { name: 'Tools', href: '/tools' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 border-b ${scrolled
            ? 'bg-[#06111F]/90 backdrop-blur-md border-white/10 shadow-lg shadow-black/40 py-2.5'
            : 'bg-[#06111F]/70 backdrop-blur-sm border-white/5 py-3.5'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">

            {/* Institutional Branding: UCR & UoVT Logos */}
            <div className="flex items-center gap-3 sm:gap-5">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="relative h-10 sm:h-12 w-auto flex items-center justify-center">
                  <Image
                    src="/images/ucr.png"
                    alt="University College of Rathmalana (UCR)"
                    width={140}
                    height={48}
                    className="h-9 sm:h-11 w-auto object-contain transition-transform group-hover:scale-105"
                    priority
                  />
                </div>
                <div className="hidden min-[480px]:flex flex-col">
                  <span className="text-sm font-bold tracking-tight text-white group-hover:text-ucr-orange transition-colors">
                    Television Studies
                  </span>
                  <span className="text-[11px] text-text-secondary leading-tight">
                    University College of Ratmalana
                  </span>
                </div>
              </Link>

              {/* Divider */}
              <div className="h-6 sm:h-8 w-[1px] bg-white/15" />

              {/* UoVT Partner Brand */}
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-[9px] uppercase tracking-wider text-text-muted font-medium">Powered by</span>
                  <span className="text-[11px] font-semibold text-slate-300">UoVT</span>
                </div>
                <div className="relative h-8 sm:h-10 w-auto flex items-center">
                  <Image
                    src="/images/uovt.png"
                    alt="University of Vocational Technology (UoVT)"
                    width={110}
                    height={40}
                    className="h-7 sm:h-9 w-auto object-contain"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Desktop Navigation - Strictly Home, Students, Modules, Events */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 relative ${active
                        ? 'text-white bg-white/10 shadow-sm'
                        : 'text-text-secondary hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {link.name}
                    {active && (
                      <span className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-ucr-orange rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action: Contact Representatives Button (Replaced Admin) */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setContactModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 transition-all hover:border-orange-500/60 hover:shadow-orange-glow/40 active:scale-95"
                title="Contact Course Batch Representatives"
              >
                <Phone className="w-3.5 h-3.5 text-ucr-orange" />
                <span>Contact</span>
              </button>

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/10 transition-colors"
                aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#071426] border-b border-white/10 px-4 pt-3 pb-5 space-y-2 animate-fadeIn shadow-2xl">
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2.5 rounded-lg text-base font-medium flex items-center justify-between ${active
                        ? 'bg-ucr-orange/15 text-ucr-orange font-semibold border-l-4 border-ucr-orange'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                  >
                    <span>{link.name}</span>
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-ucr-orange" />}
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between px-2">
              <span className="text-xs text-text-muted">Student Coordination</span>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setContactModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-ucr-orange text-white hover:bg-ucr-orange-hover shadow-orange-glow"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Contact</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Course Representatives Contact Modal */}
      <ContactRepsModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
      />
    </>
  );
}
