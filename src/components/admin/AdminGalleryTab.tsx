'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { GalleryItem } from '@/lib/types';
import Modal from '@/components/Modal';
import ConfirmModal from '@/components/ConfirmModal';
import { Plus, Edit2, Trash2, Upload, Loader2, AlertCircle, Eye, EyeOff, Calendar } from 'lucide-react';

interface AdminGalleryTabProps {
  gallery: GalleryItem[];
  onRefresh: () => void;
}

export default function AdminGalleryTab({ gallery, onRefresh }: AdminGalleryTabProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<GalleryItem | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    eventDate: '',
    showOnHome: true,
    sortOrder: 1,
  });

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      imageUrl: '',
      eventDate: new Date().toISOString().split('T')[0],
      showOnHome: true,
      sortOrder: gallery.length + 1,
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const openEditModal = (item: GalleryItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      imageUrl: item.imageUrl,
      eventDate: item.eventDate || '',
      showOnHome: item.showOnHome,
      sortOrder: item.sortOrder,
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

      setFormData((prev) => ({ ...prev, imageUrl: json.url }));
    } catch (err: any) {
      setFormError(err.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      setFormError('Please provide an image URL or upload a file.');
      return;
    }

    setFormError('');
    setSubmitting(true);

    try {
      const url = editingItem ? `/api/gallery/${editingItem.id}` : '/api/gallery';
      const method = editingItem ? 'PUT' : 'POST';

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
      setFormError(err.message || 'Failed to save gallery photo');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleHome = async (item: GalleryItem) => {
    try {
      await fetch(`/api/gallery/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showOnHome: !item.showOnHome }),
      });
      onRefresh();
    } catch (err) {
      console.error('Failed to toggle home visibility:', err);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/gallery/${deletingItem.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');
      setDeletingItem(null);
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
          <h3 className="text-base font-bold text-white">Media Production Gallery</h3>
          <p className="text-xs text-text-muted">
            Manage television studio photos, control room captures, and field shoot highlights.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-ucr-orange hover:bg-ucr-orange-hover shadow-orange-glow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New Photo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {gallery.map((item) => (
          <div
            key={item.id}
            className="group rounded-2xl overflow-hidden border border-white/10 bg-surface flex flex-col justify-between"
          >
            <div className="relative h-48 w-full overflow-hidden bg-[#071426]">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B2D] via-transparent to-transparent" />

              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                <button
                  onClick={() => handleToggleHome(item)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase backdrop-blur-md transition-colors ${
                    item.showOnHome
                      ? 'bg-emerald-500/80 text-white'
                      : 'bg-black/60 text-slate-300 hover:bg-black/80'
                  }`}
                  title="Toggle display on Home page"
                >
                  {item.showOnHome ? 'On Home' : 'Hidden'}
                </button>
              </div>
            </div>

            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white leading-snug line-clamp-2">
                  {item.title}
                </h4>
                {item.eventDate && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-text-muted">
                    <Calendar className="w-3 h-3 text-ucr-orange" />
                    <span>{item.eventDate}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(item)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                  title="Edit Caption"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeletingItem(item)}
                  className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                  title="Delete Photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isFormOpen && (
        <Modal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          title={editingItem ? 'Edit Photo Caption' : 'Add Photo to Gallery'}
          maxWidth="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Photo File / Image URL *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="/images/... or upload"
                  className="flex-1 px-3 py-2 rounded-xl bg-[#071426] border border-white/10 text-white text-xs focus:border-ucr-orange outline-none"
                />
                <label className="px-3 py-2 rounded-xl bg-surface-lighter hover:bg-surface-hover border border-white/10 text-xs font-semibold text-white cursor-pointer flex items-center gap-1.5">
                  {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  <span>Upload File</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Live Image Preview */}
            {formData.imageUrl && (
              <div className="relative h-44 w-full rounded-xl overflow-hidden border border-white/10 bg-[#071426]">
                <Image
                  src={formData.imageUrl}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Title / Caption *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Studio A Broadcast Stage"
                className="w-full px-3 py-2 rounded-xl bg-[#071426] border border-white/10 text-white text-xs focus:border-ucr-orange outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-secondary">Event / Session Date</label>
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#071426] border border-white/10 text-white text-xs focus:border-ucr-orange outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-secondary">Sort Order</label>
                <input
                  type="number"
                  min={1}
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-[#071426] border border-white/10 text-white text-xs focus:border-ucr-orange outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showOnHome}
                  onChange={(e) => setFormData({ ...formData, showOnHome: e.target.checked })}
                  className="w-4 h-4 rounded text-ucr-orange focus:ring-0"
                />
                <span className="text-xs font-medium text-white">Show in Home page gallery preview</span>
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
                {editingItem ? 'Save Changes' : 'Add Photo'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deletingItem && (
        <ConfirmModal
          isOpen={Boolean(deletingItem)}
          onClose={() => setDeletingItem(null)}
          onConfirm={handleDelete}
          title="Delete Gallery Photo"
          message={`Are you sure you want to remove "${deletingItem.title}" from the gallery?`}
          confirmLabel="Delete Photo"
          isLoading={submitting}
        />
      )}
    </div>
  );
}
