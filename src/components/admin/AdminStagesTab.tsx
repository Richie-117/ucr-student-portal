'use client';

import React, { useState } from 'react';
import { LearningStage } from '@/lib/types';
import Modal from '@/components/Modal';
import ConfirmModal from '@/components/ConfirmModal';
import { Plus, Edit2, Trash2, Layers, Loader2, AlertCircle } from 'lucide-react';

interface AdminStagesTabProps {
  stages: LearningStage[];
  onRefresh: () => void;
}

export default function AdminStagesTab({ stages, onRefresh }: AdminStagesTabProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<LearningStage | null>(null);
  const [deletingStage, setDeletingStage] = useState<LearningStage | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sortOrder: 1,
    published: true,
  });

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const openCreateModal = () => {
    setEditingStage(null);
    setFormData({
      title: '',
      description: '',
      sortOrder: stages.length + 1,
      published: true,
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const openEditModal = (st: LearningStage) => {
    setEditingStage(st);
    setFormData({
      title: st.title,
      description: st.description || '',
      sortOrder: st.sortOrder,
      published: st.published,
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const url = editingStage ? `/api/stages/${editingStage.id}` : '/api/stages';
      const method = editingStage ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          sortOrder: Number(formData.sortOrder),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Operation failed');

      setIsFormOpen(false);
      onRefresh();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save stage');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingStage) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/stages/${deletingStage.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete stage');
      setDeletingStage(null);
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
          <h3 className="text-base font-bold text-white">Academic Learning Stages</h3>
          <p className="text-xs text-text-muted">
            Configure the editable learning progression timeline displayed on the Home page and module categorizer.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-ucr-orange hover:bg-ucr-orange-hover shadow-orange-glow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Stage</span>
        </button>
      </div>

      <div className="space-y-3">
        {stages.map((st, index) => (
          <div
            key={st.id}
            className="p-4 rounded-2xl bg-surface border border-white/10 flex items-center justify-between gap-4 hover:border-white/20 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/15 flex items-center justify-center font-bold text-xs text-white">
                {st.sortOrder}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{st.title}</h4>
                {st.description && <p className="text-xs text-text-secondary mt-0.5">{st.description}</p>}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openEditModal(st)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Edit Stage"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDeletingStage(st)}
                className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                title="Delete Stage"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isFormOpen && (
        <Modal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          title={editingStage ? 'Edit Learning Stage' : 'Add New Progression Stage'}
          maxWidth="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Stage Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. NVQ Level 5 — Semester 1"
                className="w-full px-3 py-2 rounded-xl bg-[#071426] border border-white/10 text-white text-xs focus:border-ucr-orange outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description of skills and training in this stage..."
                className="w-full px-3 py-2 rounded-xl bg-[#071426] border border-white/10 text-white text-xs focus:border-ucr-orange outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Sort Order Number</label>
              <input
                type="number"
                min={1}
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-[#071426] border border-white/10 text-white text-xs focus:border-ucr-orange outline-none"
              />
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
                {editingStage ? 'Save Changes' : 'Create Stage'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deletingStage && (
        <ConfirmModal
          isOpen={Boolean(deletingStage)}
          onClose={() => setDeletingStage(null)}
          onConfirm={handleDelete}
          title="Delete Learning Stage"
          message={`Are you sure you want to remove "${deletingStage.title}"? Modules linked to this stage may need to be updated.`}
          confirmLabel="Delete Stage"
          isLoading={submitting}
        />
      )}
    </div>
  );
}
