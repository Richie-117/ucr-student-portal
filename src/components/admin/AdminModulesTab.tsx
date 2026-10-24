'use client';

import React, { useState } from 'react';
import { CourseModule, LearningStage, CourseType, ModuleStatus } from '@/lib/types';
import Badge from '@/components/Badge';
import Modal from '@/components/Modal';
import ConfirmModal from '@/components/ConfirmModal';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  BookOpen,
  Loader2,
  AlertCircle,
  Upload,
  Eye,
  EyeOff,
  FileText,
  X,
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react';
import Image from 'next/image';

interface AdminModulesTabProps {
  modules: CourseModule[];
  stages: LearningStage[];
  onRefresh: () => void;
}

export default function AdminModulesTab({ modules, stages, onRefresh }: AdminModulesTabProps) {
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState<string>('ALL');

  // Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<CourseModule | null>(null);
  const [deletingModule, setDeletingModule] = useState<CourseModule | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    description: '',
    courseCodes: ['TPOPT'] as CourseType[],
    learningStageId: stages[0]?.id || 'stage-1',
    status: 'ongoing' as ModuleStatus,
    thumbnailUrl: '',
    resources: [] as { title: string; url: string }[],
    sortOrder: 1,
    published: true,
  });

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const openCreateModal = () => {
    setEditingModule(null);
    setShowPreview(false);
    setFormData({
      title: '',
      code: '',
      description: '',
      courseCodes: ['TPOPT'],
      learningStageId: stages[0]?.id || 'stage-1',
      status: 'ongoing',
      thumbnailUrl: '',
      resources: [],
      sortOrder: modules.length + 1,
      published: true,
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const openEditModal = (mod: CourseModule) => {
    setEditingModule(mod);
    setShowPreview(false);
    setFormData({
      title: mod.title,
      code: mod.code || '',
      description: mod.description,
      courseCodes: mod.courseCodes,
      learningStageId: mod.learningStageId,
      status: mod.status,
      thumbnailUrl: mod.thumbnailUrl || '',
      resources: mod.resources ? [...mod.resources] : [],
      sortOrder: mod.sortOrder,
      published: mod.published,
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleAddResource = () => {
    setFormData((prev) => ({
      ...prev,
      resources: [...prev.resources, { title: '', url: '' }],
    }));
  };

  const handleRemoveResource = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index),
    }));
  };

  const handleResourceChange = (index: number, field: 'title' | 'url', value: string) => {
    setFormData((prev) => {
      const updated = [...prev.resources];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, resources: updated };
    });
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

      setFormData((prev) => ({ ...prev, thumbnailUrl: json.url }));
    } catch (err: any) {
      setFormError(err.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleCourseCodeToggle = (course: CourseType) => {
    setFormData((prev) => {
      const exists = prev.courseCodes.includes(course);
      let updated: CourseType[];
      if (exists) {
        updated = prev.courseCodes.filter((c) => c !== course);
        if (updated.length === 0) updated = [course]; // ensure at least one
      } else {
        updated = [...prev.courseCodes, course];
      }
      return { ...prev, courseCodes: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const url = editingModule ? `/api/modules/${editingModule.id}` : '/api/modules';
      const method = editingModule ? 'PUT' : 'POST';

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
      setFormError(err.message || 'Failed to save module');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (mod: CourseModule) => {
    try {
      await fetch(`/api/modules/${mod.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !mod.published }),
      });
      onRefresh();
    } catch (err) {
      console.error('Failed to toggle published:', err);
    }
  };

  const handleDelete = async () => {
    if (!deletingModule) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/modules/${deletingModule.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete module');
      setDeletingModule(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = modules.filter((m) => {
    if (courseFilter !== 'ALL' && !m.courseCodes.includes(courseFilter as any)) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      return m.title.toLowerCase().includes(q) || (m.code && m.code.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search modules..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#091728] border border-white/10 text-white text-xs focus:border-ucr-orange outline-none"
            />
          </div>

          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="py-2 px-3 rounded-xl bg-[#091728] border border-white/10 text-white text-xs focus:border-ucr-orange outline-none"
          >
            <option value="ALL">All Modules ({modules.length})</option>
            <option value="TPOPT">TPOPT</option>
            <option value="TPRPT">TPRPT</option>
          </select>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-ucr-orange hover:bg-ucr-orange-hover shadow-orange-glow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Module</span>
        </button>
      </div>

      {/* Modules Table */}
      <div className="rounded-2xl border border-white/10 bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#091728] text-text-muted uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4">Module Title</th>
                <th className="py-3.5 px-4">Applicability</th>
                <th className="py-3.5 px-4">Stage</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Published</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-muted">
                    No academic modules found.
                  </td>
                </tr>
              ) : (
                filtered.map((mod) => {
                  const stage = stages.find((s) => s.id === mod.learningStageId);
                  return (
                    <tr key={mod.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{mod.title}</div>
                        {mod.code && <div className="text-[10px] font-mono text-text-muted">{mod.code}</div>}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          {mod.courseCodes.map((c) => (
                            <Badge key={c} variant={c === 'TPOPT' ? 'tpopt' : 'tprpt'}>
                              {c}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {stage ? stage.title : 'Stage'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={mod.status as any}>{mod.status}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleTogglePublish(mod)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition-colors ${
                            mod.published
                              ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                              : 'bg-slate-500/15 text-slate-400 hover:bg-slate-500/25'
                          }`}
                        >
                          {mod.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          {mod.published ? 'Live' : 'Hidden'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(mod)}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                            title="Edit Module"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingModule(mod)}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                            title="Delete Module"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Module Modal */}
      {isFormOpen && (
        <Modal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          title={editingModule ? 'Edit Course Module' : 'Add New Academic Module'}
          maxWidth="xl"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* View Mode Toggle: Edit Form vs Live Student Preview */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  !showPreview
                    ? 'bg-ucr-orange text-white shadow-orange-glow'
                    : 'text-text-muted hover:text-white bg-white/5'
                }`}
              >
                Edit Module Details
              </button>
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  showPreview
                    ? 'bg-ucr-orange text-white shadow-orange-glow'
                    : 'text-text-muted hover:text-white bg-white/5'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Student Card Preview</span>
              </button>
            </div>

            {showPreview ? (
              /* Live Preview Card */
              <div className="p-4 rounded-2xl bg-[#071426] border border-white/10 space-y-4">
                <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                  Live Student View Preview
                </div>

                <div className="p-6 rounded-2xl bg-surface border border-white/10 shadow-card space-y-4">
                  {formData.thumbnailUrl && (
                    <div className="relative h-44 w-full rounded-xl overflow-hidden border border-white/10">
                      <Image
                        src={formData.thumbnailUrl}
                        alt={formData.title || 'Preview'}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      {formData.courseCodes.map((c) => (
                        <Badge key={c} variant={c === 'TPOPT' ? 'tpopt' : 'tprpt'}>
                          {c}
                        </Badge>
                      ))}
                    </div>
                    <Badge variant={formData.status}>{formData.status}</Badge>
                  </div>

                  <div>
                    {formData.code && (
                      <div className="text-[11px] font-mono text-text-muted mb-1">{formData.code}</div>
                    )}
                    <h4 className="text-lg font-bold text-white">
                      {formData.title || 'Untitled Module'}
                    </h4>
                  </div>

                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    {formData.description || 'Module description syllabus text will appear here...'}
                  </p>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-text-muted">
                    <span>
                      {stages.find((s) => s.id === formData.learningStageId)?.title || 'Progression Stage'}
                    </span>
                    <span className="text-ucr-orange font-semibold">Syllabus Details</span>
                  </div>

                  {formData.resources.length > 0 && (
                    <div className="pt-2 border-t border-white/5 space-y-1.5">
                      <span className="text-[10px] uppercase font-semibold text-text-muted">
                        Attached Resources ({formData.resources.length})
                      </span>
                      <div className="space-y-1">
                        {formData.resources.map((res, i) => (
                          <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-surface-lighter text-slate-300">
                            <span className="flex items-center gap-1.5 truncate">
                              <FileText className="w-3.5 h-3.5 text-ucr-orange flex-shrink-0" />
                              {res.title || 'Untitled Resource'}
                            </span>
                            <ExternalLink className="w-3 h-3 text-text-muted flex-shrink-0" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Regular Edit Form */
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-text-secondary">Module Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Non-Linear Video Editing"
                      className="w-full px-3 py-2 rounded-xl bg-[#071426] border border-white/10 text-white text-xs focus:border-ucr-orange outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-secondary">Module Code</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="e.g. POST-5101"
                      className="w-full px-3 py-2 rounded-xl bg-[#071426] border border-white/10 text-white text-xs font-mono focus:border-ucr-orange outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-secondary">Description & Syllabus Summary *</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Key learning outcomes, practical tasks, software/hardware utilized..."
                    className="w-full px-3 py-2 rounded-xl bg-[#071426] border border-white/10 text-white text-xs focus:border-ucr-orange outline-none"
                  />
                </div>

                {/* Course Applicability (Checkboxes for TPOPT and TPRPT) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Course Applicability</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl bg-[#071426] border border-white/10 flex-1">
                      <input
                        type="checkbox"
                        checked={formData.courseCodes.includes('TPOPT')}
                        onChange={() => handleCourseCodeToggle('TPOPT')}
                        className="w-4 h-4 rounded text-orange-500 focus:ring-0"
                      />
                      <span className="text-xs font-bold text-orange-400">TPOPT (Post-Production)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl bg-[#071426] border border-white/10 flex-1">
                      <input
                        type="checkbox"
                        checked={formData.courseCodes.includes('TPRPT')}
                        onChange={() => handleCourseCodeToggle('TPRPT')}
                        className="w-4 h-4 rounded text-sky-500 focus:ring-0"
                      />
                      <span className="text-xs font-bold text-sky-400">TPRPT (Production)</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-secondary">Progression Stage *</label>
                    <select
                      value={formData.learningStageId}
                      onChange={(e) => setFormData({ ...formData, learningStageId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#071426] border border-white/10 text-white text-xs focus:border-ucr-orange outline-none"
                    >
                      {stages.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-secondary">Current Status *</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as ModuleStatus })}
                      className="w-full px-3 py-2 rounded-xl bg-[#071426] border border-white/10 text-white text-xs focus:border-ucr-orange outline-none"
                    >
                      <option value="ongoing">Ongoing (Featured on Home)</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                {/* Thumbnail URL / Upload */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Thumbnail Image (Optional)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.thumbnailUrl}
                      onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                      placeholder="/images/... or URL"
                      className="flex-1 px-3 py-2 rounded-xl bg-[#071426] border border-white/10 text-white text-xs focus:border-ucr-orange outline-none"
                    />
                    <label className="px-3 py-2 rounded-xl bg-surface-lighter hover:bg-surface-hover border border-white/10 text-xs font-semibold text-white cursor-pointer flex items-center gap-1.5">
                      {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      <span>Upload</span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Attached Learning Resources & Links Builder */}
                <div className="p-4 rounded-2xl bg-[#071426] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-ucr-orange" />
                        Attached Learning Resources &amp; Links
                      </h4>
                      <p className="text-[11px] text-text-muted">
                        Attach syllabus PDFs, lecture notes, or reference links for students.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddResource}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-ucr-orange hover:text-white bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Resource</span>
                    </button>
                  </div>

                  {formData.resources.length === 0 ? (
                    <p className="text-xs text-text-muted italic py-1">
                      No external resources currently attached to this module.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {formData.resources.map((res, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={res.title}
                            onChange={(e) => handleResourceChange(index, 'title', e.target.value)}
                            placeholder="Resource title (e.g. Editing Guide PDF)"
                            className="flex-1 px-2.5 py-1.5 rounded-lg bg-surface border border-white/10 text-white text-xs outline-none focus:border-ucr-orange"
                          />
                          <input
                            type="text"
                            value={res.url}
                            onChange={(e) => handleResourceChange(index, 'url', e.target.value)}
                            placeholder="URL or #"
                            className="flex-1 px-2.5 py-1.5 rounded-lg bg-surface border border-white/10 text-white text-xs font-mono outline-none focus:border-ucr-orange"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveResource(index)}
                            className="p-1.5 text-rose-400 hover:text-white hover:bg-rose-500/20 rounded-lg transition-colors"
                            title="Remove Resource"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.published}
                      onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                      className="w-4 h-4 rounded text-ucr-orange focus:ring-0"
                    />
                    <span className="text-xs font-medium text-white">Publish module immediately on portal</span>
                  </label>
                </div>
              </>
            )}

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
                {editingModule ? 'Save Changes' : 'Create Module'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingModule && (
        <ConfirmModal
          isOpen={Boolean(deletingModule)}
          onClose={() => setDeletingModule(null)}
          onConfirm={handleDelete}
          title="Delete Academic Module"
          message={`Are you sure you want to permanently delete "${deletingModule.title}"?`}
          confirmLabel="Delete Module"
          isLoading={submitting}
        />
      )}
    </div>
  );
}
