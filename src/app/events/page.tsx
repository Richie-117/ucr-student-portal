'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Image from 'next/image';
import { DivisionEvent } from '@/lib/types';
import Modal from '@/components/Modal';
import {
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Search,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';

function EventsContent() {
  const [events, setEvents] = useState<DivisionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'ALL' | 'UPCOMING' | 'PAST'>('UPCOMING');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<DivisionEvent | null>(null);

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        const res = await fetch('/api/events?publishedOnly=true');
        const data = await res.json();
        if (data.events) {
          setEvents(data.events);
        }
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  const today = new Date().toISOString().split('T')[0];

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const isUpcoming = ev.eventDate >= today;
      if (tab === 'UPCOMING' && !isUpcoming) return false;
      if (tab === 'PAST' && isUpcoming) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = ev.title.toLowerCase().includes(q);
        const matchDesc = ev.description.toLowerCase().includes(q);
        const matchLoc = ev.location ? ev.location.toLowerCase().includes(q) : false;
        return matchTitle || matchDesc || matchLoc;
      }
      return true;
    });
  }, [events, tab, searchQuery, today]);

  // Helper to parse date
  const formatDateBadge = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
      const day = d.getDate();
      const year = d.getFullYear();
      return { month, day, year };
    } catch {
      return { month: 'EVT', day: '01', year: '2026' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-10">
      {/* Header Banner */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs font-semibold text-ucr-orange uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5" />
          Division Events & Screenings
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Events & Showcases
        </h1>

        <p className="text-sm sm:text-base text-text-secondary max-w-2xl leading-relaxed">
          Screening festivals, industry masterclasses, guest lecture series, and studio workshops organized by the Division of Television Studies.
        </p>
      </div>

      {/* Tabs and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="inline-flex p-1.5 rounded-2xl bg-surface border border-white/10 self-start">
          <button
            onClick={() => setTab('UPCOMING')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              tab === 'UPCOMING'
                ? 'bg-ucr-orange text-white shadow-orange-glow'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            Upcoming Events
          </button>
          <button
            onClick={() => setTab('PAST')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              tab === 'PAST'
                ? 'bg-white/15 text-white'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            Past Events
          </button>
          <button
            onClick={() => setTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              tab === 'ALL'
                ? 'bg-white/15 text-white'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            All ({events.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events by title or venue..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface border border-white/10 text-white placeholder-text-muted text-xs focus:border-ucr-orange outline-none"
          />
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-6 rounded-2xl bg-surface/50 border border-white/5 animate-pulse h-64" />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-surface/40 border border-dashed border-white/15 space-y-4">
          <Calendar className="w-10 h-10 text-text-muted mx-auto" />
          <h3 className="text-lg font-bold text-white">No {tab.toLowerCase()} events scheduled</h3>
          <p className="text-sm text-text-secondary max-w-sm mx-auto">
            {tab === 'UPCOMING'
              ? 'There are currently no upcoming events scheduled on the division calendar.'
              : 'No past event records match your current filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const { month, day, year } = formatDateBadge(event.eventDate);
            const isUpcoming = event.eventDate >= today;

            return (
              <div
                key={event.id}
                className="group rounded-3xl overflow-hidden border border-white/10 bg-surface flex flex-col justify-between hover:border-white/25 transition-all duration-300 hover:shadow-card hover:-translate-y-1"
              >
                {/* Cover photo & date badge */}
                <div className="relative h-48 w-full overflow-hidden bg-[#071426]">
                  {event.coverImageUrl ? (
                    <Image
                      src={event.coverImageUrl}
                      alt={event.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface to-[#071426] text-text-muted">
                      <Sparkles className="w-8 h-8 opacity-40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B2D] via-transparent to-transparent" />

                  {/* Calendar Date Badge */}
                  <div className="absolute top-4 left-4 rounded-xl overflow-hidden shadow-lg border border-white/15 text-center w-12 bg-black/75 backdrop-blur-md">
                    <div className="bg-ucr-orange text-[10px] font-bold text-white uppercase py-0.5 tracking-wider">
                      {month}
                    </div>
                    <div className="text-lg font-extrabold text-white py-0.5">
                      {day}
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        isUpcoming
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                      }`}
                    >
                      {isUpcoming ? 'Upcoming' : 'Past'}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-white group-hover:text-ucr-orange transition-colors leading-snug">
                      {event.title}
                    </h3>

                    {/* Time & Venue */}
                    <div className="space-y-1.5 text-xs text-text-muted">
                      {event.startTime && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-ucr-orange" />
                          <span>
                            {event.startTime} {event.endTime ? `– ${event.endTime}` : ''}
                          </span>
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-sky-400" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed line-clamp-3">
                      {event.description}
                    </p>
                  </div>

                  {/* Card actions */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="text-xs font-semibold text-white/80 hover:text-white inline-flex items-center gap-1"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>Event Details</span>
                    </button>

                    {event.registrationUrl && isUpcoming && (
                      <a
                        href={event.registrationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-ucr-orange hover:bg-ucr-orange-hover transition-colors"
                      >
                        <span>Register</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <Modal
          isOpen={Boolean(selectedEvent)}
          onClose={() => setSelectedEvent(null)}
          title={selectedEvent.title}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            {selectedEvent.coverImageUrl && (
              <div className="relative h-60 w-full rounded-2xl overflow-hidden border border-white/10">
                <Image
                  src={selectedEvent.coverImageUrl}
                  alt={selectedEvent.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-surface-lighter border border-white/5 text-xs text-text-secondary">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-ucr-orange" />
                <span>Date: <strong className="text-white">{selectedEvent.eventDate}</strong></span>
              </div>
              {selectedEvent.startTime && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-ucr-orange" />
                  <span>Time: <strong className="text-white">{selectedEvent.startTime} {selectedEvent.endTime ? `– ${selectedEvent.endTime}` : ''}</strong></span>
                </div>
              )}
              {selectedEvent.location && (
                <div className="flex items-center gap-2 sm:col-span-2">
                  <MapPin className="w-4 h-4 text-sky-400" />
                  <span>Venue: <strong className="text-white">{selectedEvent.location}</strong></span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                About this Event
              </h4>
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {selectedEvent.description}
              </p>
            </div>

            {selectedEvent.registrationUrl && (
              <div className="pt-4 border-t border-white/10 flex justify-end">
                <a
                  href={selectedEvent.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-ucr-orange hover:bg-ucr-orange-hover shadow-orange-glow transition-all"
                >
                  <span>Open Official Registration</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto p-12 text-center text-text-muted">Loading division events...</div>}>
      <EventsContent />
    </Suspense>
  );
}
