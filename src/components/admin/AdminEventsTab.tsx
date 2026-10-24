'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { DivisionEvent } from '@/lib/types';
import Modal from '@/components/Modal';
import ConfirmModal from '@/components/ConfirmModal';
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Loader2,
  AlertCircle,
  Upload,
  Eye,
  EyeOff,
} from 'lucide-react';

interface AdminEventsTabProps {
  events: DivisionEvent[];
  onRefresh: () => void;
}

export default function AdminEventsTab({ events, onRefresh }: AdminEventsTabProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<DivisionEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<DivisionEvent | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: new Date().toISOString().split('T')[0],
    startTime: '09:30 AM',
    endTime: '04:30 PM',
    location: 'Main Auditorium, University College of Rathmalana',
    coverImageUrl: '',
    registrationUrl: '',
    published: true,
  });

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const openCreateModal = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      eventDate: new Date().toISOString().split('T')[0],
      startTime: '09:30 AM',
      endTime: '04:30 PM',
      location: 'Studio A, Division of Television Studies',
      coverImageUrl: '/images/gallery_field_shoot.jpg',
      registrationUrl: '',
      published: true,
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const openEditModal = (event: DivisionEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      eventDate: event.eventDate,
      startTime: event.startTime || '',
      endTime: event.endTime || '',
      location: event.location || '',
      coverImageUrl: event.coverImageUrl || '',
      registrationUrl: event.registrationUrl || '',
      published: event.published,
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setFormError('');

    try {
      const data = new FormData();
      data.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');

      setFormData((prev) => ({ ...prev, coverImageUrl: json.url }));
    } catch (err: any) {
      setFormError(err.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const url = editingEvent ? `/api/events/${editingEvent.id}` : '/api/events';
      const method = editingEvent ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Operation failed');

      setIsFormOpen(false);
      onRefresh();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save event');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (event: DivisionEvent) => {
    try {
      await fetch(`/api/events/${event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !event.published }),
      });
      onRefresh();
    } catch (err) {
      console.error('Failed to toggle published:', err);
    }
  };

  const handleDelete = async () => {
    if (!deletingEvent) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/events/${deletingEvent.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');
      setDeletingEvent(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white">Events & Showcase Management</h3>
          <p className="text-xs text-text-muted">
            Create and schedule screenings, workshops, ceremonies, and calendar milestones.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-ucr-orange hover:bg-ucr-orange-hover shadow-orange-glow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Event</span>
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#091728] text-text-muted uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4">Event Title</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Venue</th>
                <th className="py-3.5 px-4">Registration</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-muted">
                    No events scheduled. Click &quot;Add New Event&quot; to publish one.
                  </td>
                </tr>
              ) : (
                events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{evt.title}</div>
                      <div className="text-[11px] text-text-muted line-clamp-1 max-w-xs">{evt.description}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">{evt.eventDate}</div>
                      {evt.startTime && <div className="text-[10px] text-text-muted">{evt.startTime}</div>}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {evt.location || 'Online / TBA'}
                    </td>
                    <td className="py-3 px-4">
                      {evt.registrationUrl ? (
                        <span className="text-[11px] text-ucr-orange font-medium flex items-center gap-1">
                          Active URL
                          <ExternalLink className="w-3 h-3" />
                        </span>
                      ) : (
                        <span className="text-text-muted text-[11px]">None</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleTogglePublish(evt)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition-colors ${
                          evt.published
                            ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                            : 'bg-slate-500/15 text-slate-400 hover:bg-slate-500/25'
                        }`}
                      >
                        {evt.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {evt.published ? 'Live' : 'Hidden'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(evt)}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                          title="Edit Event"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingEvent(evt)}
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <Modal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          title={editingEvent ? 'Edit Event Details' : 'Create Division Event'}
          maxWidth="xl"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Event Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Broadcast Cinematography Workshop"
                className="w-full px-3 py-2 rounded-xl bg-[#071426] border border-white/10 text-white text-xs focus:border-ucr-orange outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-secondary">Event Date *</label>
                <input
                  type="date"
                  required
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#071426] border border-white/10 text-white text-xs focus:border-ucr-orange outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-secondary">Start Time</label>
                <input
                  type="text"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  placeholder="09:30 AM"
                  className="w-full px-3 py-2 rounded-xl bg-[#071426] border border-white/10 text-white text-xs focus:border-ucr-orange outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-secondary">End Time</label>
                <input
                  type="text"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  placeholder="04:30 PM"
                  className="w-full px-3 py-2 rounded-xl bg-[#071426] border border-white/10 text-white text-xs focus:border-ucr-orange outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Venue / Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Studio A, Division of Television Studies, UCR"
                className="w-full px-3 py-2 rounded-xl bg-[#071426] border border-white/10 text-white text-xs focus:border-ucr-orange outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Description *</label>
              <textarea
                rows={3}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Schedule summary, guest speakers, audience guidelines..."
                className="w-full px-3 py-2 rounded-xl bg-[#071426] border border-white/10 text-white text-xs focus:border-ucr-orange outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Cover Image</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.coverImageUrl}
                  onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                  placeholder="/images/... or upload"
                  className="flex-1 px-3 py-2 rounded-xl bg-[#071426] border border-white/10 text-white text-xs focus:border-ucr-orange outline-none"
                />
                <label className="px-3 py-2 rounded-xl bg-surface-lighter hover:bg-surface-hover border border-white/10 text-xs font-semibold text-white cursor-pointer flex items-center gap-1.5">
                  {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  <span>Upload</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Registration URL (Optional)</label>
              <input
                type="url"
                value={formData.registrationUrl}
                onChange={(e) => setFormData({ ...formData, registrationUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl bg-[#071426] border border-white/10 text-white text-xs focus:border-ucr-orange outline-none"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="w-4 h-4 rounded text-ucr-orange focus:ring-0"
                />
                <span className="text-xs font-medium text-white">Publish event on website immediately</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-ucr-orange hover:bg-ucr-orange-hover shadow-orange-glow disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {editingEvent ? 'Save Changes' : 'Create Event'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deletingEvent && (
        <ConfirmModal
          isOpen={Boolean(deletingEvent)}
          onClose={() => setDeletingEvent(null)}
          onConfirm={handleDelete}
          title="Delete Event Record"
          message={`Are you sure you want to delete "${deletingEvent.title}"?`}
          confirmLabel="Delete Event"
          isLoading={submitting}
        />
      )}
    </div>
  );
}
