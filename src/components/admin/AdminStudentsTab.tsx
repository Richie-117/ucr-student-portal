'use client';

import React, { useState } from 'react';
import { Student, CourseType } from '@/lib/types';
import Badge from '@/components/Badge';
import Modal from '@/components/Modal';
import ConfirmModal from '@/components/ConfirmModal';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Award,
  Sparkles,
  Loader2,
  AlertCircle,
  Upload,
} from 'lucide-react';

interface AdminStudentsTabProps {
  students: Student[];
  onRefresh: () => void;
}

export default function AdminStudentsTab({ students, onRefresh }: AdminStudentsTabProps) {
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState<'ALL' | 'TPOPT' | 'TPRPT'>('ALL');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  // Form fields
  const [formData, setFormData] = useState({
    fullName: '',
    studentNumber: '',
    course: 'TPOPT' as CourseType,
    batch: 'Batch 11 — 2026',
    gender: 'Male' as 'Male' | 'Female',
    phoneNumber: '',
    isRepresentative: false,
    representativeRole: '',
    profileImageUrl: '',
    notes: '',
  });

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const openCreateModal = () => {
    setEditingStudent(null);
    setFormData({
      fullName: '',
      studentNumber: '',
      course: 'TPOPT',
      batch: 'Batch 11 — 2026',
      gender: 'Male',
      phoneNumber: '',
      isRepresentative: false,
      representativeRole: 'Male Representative',
      profileImageUrl: '',
      notes: '',
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    const studentGender = student.gender || 'Male';
    setFormData({
      fullName: student.fullName,
      studentNumber: student.studentNumber,
      course: student.course,
      batch: student.batch,
      gender: studentGender,
      phoneNumber: student.phoneNumber || '',
      isRepresentative: student.isRepresentative,
      representativeRole: student.representativeRole || (studentGender === 'Female' ? 'Female Representative' : 'Male Representative'),
      profileImageUrl: student.profileImageUrl || '',
      notes: student.notes || '',
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

      setFormData((prev) => ({ ...prev, profileImageUrl: json.url }));
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
      const url = editingStudent ? `/api/students/${editingStudent.id}` : '/api/students';
      const method = editingStudent ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Operation failed');
      }

      setIsFormOpen(false);
      onRefresh();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save student record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingStudent) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/students/${deletingStudent.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Delete failed');
      }
      setDeletingStudent(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete student');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Assign / Unassign Representative functions
  const [repActionLoading, setRepActionLoading] = useState<string | null>(null);
  const [repActionError, setRepActionError] = useState<string>('');
  const [selectedRepSlot, setSelectedRepSlot] = useState<{ [key: string]: string }>({});

  const handleAssignRepDirect = async (slotKey: string, roleTitle: string, course: CourseType) => {
    const studentId = selectedRepSlot[slotKey];
    if (!studentId) return;

    setRepActionLoading(slotKey);
    setRepActionError('');
    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isRepresentative: true,
          representativeRole: roleTitle,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to assign representative');
      }

      setSelectedRepSlot((prev) => ({ ...prev, [slotKey]: '' }));
      onRefresh();
    } catch (err: any) {
      setRepActionError(err.message || 'Failed to assign representative');
    } finally {
      setRepActionLoading(null);
    }
  };

  const handleUnassignRepDirect = async (studentId: string, slotKey: string) => {
    setRepActionLoading(slotKey);
    setRepActionError('');
    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isRepresentative: false,
          representativeRole: undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to unassign representative');
      }

      onRefresh();
    } catch (err: any) {
      setRepActionError(err.message || 'Failed to unassign representative');
    } finally {
      setRepActionLoading(null);
    }
  };

  const getInitials = (name: string) => {
    const clean = name.replace(/\(Demo\)/gi, '').trim();
    const parts = clean.split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Find assigned representatives
  const tpoptReps = students.filter((s) => s.course === 'TPOPT' && s.isRepresentative);
  const tprptReps = students.filter((s) => s.course === 'TPRPT' && s.isRepresentative);

  // Helper to safely identify male vs female representative without substring collisions
  // (In JS, 'female'.includes('male') is true, which previously caused female reps to match male slots)
  const isMaleRep = (s: Student) => {
    const role = (s.representativeRole || '').toLowerCase();
    if (role.includes('female') || s.gender === 'Female') return false;
    if (s.gender === 'Male' || (role.includes('male') && !role.includes('female'))) return true;
    return false;
  };

  const isFemaleRep = (s: Student) => {
    const role = (s.representativeRole || '').toLowerCase();
    if (role.includes('male') && !role.includes('female')) return false;
    if (s.gender === 'Male') return false;
    if (s.gender === 'Female' || role.includes('female')) return true;
    return false;
  };

  const tpoptMaleRep = tpoptReps.find(isMaleRep);
  const tpoptFemaleRep = tpoptReps.find((s) => s.id !== tpoptMaleRep?.id && isFemaleRep(s));

  const tprptMaleRep = tprptReps.find(isMaleRep);
  const tprptFemaleRep = tprptReps.find((s) => s.id !== tprptMaleRep?.id && isFemaleRep(s));

  const appointedPositionsCount = [tpoptMaleRep, tpoptFemaleRep, tprptMaleRep, tprptFemaleRep].filter(Boolean).length;

  // Eligible candidate lists (unassigned students for each category)
  const tpoptMaleCandidates = students.filter((s) => s.course === 'TPOPT' && !s.isRepresentative && s.gender === 'Male');
  const tpoptFemaleCandidates = students.filter((s) => s.course === 'TPOPT' && !s.isRepresentative && s.gender === 'Female');
  const tprptMaleCandidates = students.filter((s) => s.course === 'TPRPT' && !s.isRepresentative && s.gender === 'Male');
  const tprptFemaleCandidates = students.filter((s) => s.course === 'TPRPT' && !s.isRepresentative && s.gender === 'Female');

  // Filter students
  const filtered = students.filter((s) => {
    if (courseFilter !== 'ALL' && s.course !== courseFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      return (
        s.fullName.toLowerCase().includes(q) ||
        s.studentNumber.toLowerCase().includes(q) ||
        s.batch.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* ========================================================
          BATCH REPRESENTATIVES DIRECT MANAGER
          ======================================================== */}
      <div className="p-5 sm:p-6 rounded-3xl bg-surface border border-white/10 space-y-4 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Batch Representatives Direct Manager
              </h3>
              <p className="text-[11px] text-text-muted">
                Assign and manage the 4 batch representative appointments (2 for TPOPT and 2 for TPRPT).
              </p>
            </div>
          </div>
          <span className="text-[11px] font-medium text-text-muted">
            {appointedPositionsCount} of 4 Positions Appointed
          </span>
        </div>

        {repActionError && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{repActionError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* TPOPT Representative Slots */}
          <div className="p-4 rounded-2xl bg-[#071426] border border-orange-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-400" />
                TPOPT Representatives
              </span>
              <Badge variant="tpopt" size="sm">Post-Prod</Badge>
            </div>

            {/* Male Slot */}
            <div className="p-3 rounded-xl bg-surface border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-text-muted font-medium">Male Representative</span>
                {tpoptMaleRep ? (
                  <Badge variant="rep" size="sm">Appointed</Badge>
                ) : (
                  <span className="text-amber-400 font-medium">Unassigned</span>
                )}
              </div>

              {tpoptMaleRep ? (
                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {tpoptMaleRep.profileImageUrl ? (
                      <img
                        src={tpoptMaleRep.profileImageUrl}
                        alt={tpoptMaleRep.fullName}
                        className="w-9 h-9 rounded-full object-cover border border-orange-500/40 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/40 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                        {getInitials(tpoptMaleRep.fullName)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{tpoptMaleRep.fullName}</div>
                      <div className="text-[10px] text-text-muted font-mono">{tpoptMaleRep.studentNumber}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnassignRepDirect(tpoptMaleRep.id, 'tpopt-male')}
                    disabled={repActionLoading === 'tpopt-male'}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-rose-300 hover:text-white bg-rose-500/15 hover:bg-rose-600 transition-colors flex-shrink-0"
                  >
                    {repActionLoading === 'tpopt-male' ? 'Updating...' : 'Unassign'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 pt-1">
                  <select
                    value={selectedRepSlot['tpopt-male'] || ''}
                    onChange={(e) => setSelectedRepSlot({ ...selectedRepSlot, 'tpopt-male': e.target.value })}
                    className="flex-1 py-1 px-2 rounded-lg bg-[#091728] border border-white/10 text-white text-xs outline-none focus:border-ucr-orange"
                  >
                    <option value="">Select male candidate...</option>
                    {tpoptMaleCandidates.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName} ({c.studentNumber})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleAssignRepDirect('tpopt-male', 'Male Representative', 'TPOPT')}
                    disabled={!selectedRepSlot['tpopt-male'] || repActionLoading === 'tpopt-male'}
                    className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-40 transition-colors"
                  >
                    {repActionLoading === 'tpopt-male' ? '...' : 'Assign'}
                  </button>
                </div>
              )}
            </div>

            {/* Female Slot */}
            <div className="p-3 rounded-xl bg-surface border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-text-muted font-medium">Female Representative</span>
                {tpoptFemaleRep ? (
                  <Badge variant="rep" size="sm">Appointed</Badge>
                ) : (
                  <span className="text-amber-400 font-medium">Unassigned</span>
                )}
              </div>

              {tpoptFemaleRep ? (
                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {tpoptFemaleRep.profileImageUrl ? (
                      <img
                        src={tpoptFemaleRep.profileImageUrl}
                        alt={tpoptFemaleRep.fullName}
                        className="w-9 h-9 rounded-full object-cover border border-orange-500/40 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/40 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                        {getInitials(tpoptFemaleRep.fullName)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{tpoptFemaleRep.fullName}</div>
                      <div className="text-[10px] text-text-muted font-mono">{tpoptFemaleRep.studentNumber}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnassignRepDirect(tpoptFemaleRep.id, 'tpopt-female')}
                    disabled={repActionLoading === 'tpopt-female'}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-rose-300 hover:text-white bg-rose-500/15 hover:bg-rose-600 transition-colors flex-shrink-0"
                  >
                    {repActionLoading === 'tpopt-female' ? 'Updating...' : 'Unassign'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 pt-1">
                  <select
                    value={selectedRepSlot['tpopt-female'] || ''}
                    onChange={(e) => setSelectedRepSlot({ ...selectedRepSlot, 'tpopt-female': e.target.value })}
                    className="flex-1 py-1 px-2 rounded-lg bg-[#091728] border border-white/10 text-white text-xs outline-none focus:border-ucr-orange"
                  >
                    <option value="">Select female candidate...</option>
                    {tpoptFemaleCandidates.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName} ({c.studentNumber})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleAssignRepDirect('tpopt-female', 'Female Representative', 'TPOPT')}
                    disabled={!selectedRepSlot['tpopt-female'] || repActionLoading === 'tpopt-female'}
                    className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-40 transition-colors"
                  >
                    {repActionLoading === 'tpopt-female' ? '...' : 'Assign'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* TPRPT Representative Slots */}
          <div className="p-4 rounded-2xl bg-[#071426] border border-sky-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                TPRPT Representatives
              </span>
              <Badge variant="tprpt" size="sm">Studio Prod</Badge>
            </div>

            {/* Male Slot */}
            <div className="p-3 rounded-xl bg-surface border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-text-muted font-medium">Male Representative</span>
                {tprptMaleRep ? (
                  <Badge variant="rep" size="sm">Appointed</Badge>
                ) : (
                  <span className="text-amber-400 font-medium">Unassigned</span>
                )}
              </div>

              {tprptMaleRep ? (
                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {tprptMaleRep.profileImageUrl ? (
                      <img
                        src={tprptMaleRep.profileImageUrl}
                        alt={tprptMaleRep.fullName}
                        className="w-9 h-9 rounded-full object-cover border border-sky-500/40 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                        {getInitials(tprptMaleRep.fullName)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{tprptMaleRep.fullName}</div>
                      <div className="text-[10px] text-text-muted font-mono">{tprptMaleRep.studentNumber}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnassignRepDirect(tprptMaleRep.id, 'tprpt-male')}
                    disabled={repActionLoading === 'tprpt-male'}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-rose-300 hover:text-white bg-rose-500/15 hover:bg-rose-600 transition-colors flex-shrink-0"
                  >
                    {repActionLoading === 'tprpt-male' ? 'Updating...' : 'Unassign'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 pt-1">
                  <select
                    value={selectedRepSlot['tprpt-male'] || ''}
                    onChange={(e) => setSelectedRepSlot({ ...selectedRepSlot, 'tprpt-male': e.target.value })}
                    className="flex-1 py-1 px-2 rounded-lg bg-[#091728] border border-white/10 text-white text-xs outline-none focus:border-ucr-orange"
                  >
                    <option value="">Select male candidate...</option>
                    {tprptMaleCandidates.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName} ({c.studentNumber})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleAssignRepDirect('tprpt-male', 'Male Representative', 'TPRPT')}
                    disabled={!selectedRepSlot['tprpt-male'] || repActionLoading === 'tprpt-male'}
                    className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-sky-500 hover:bg-sky-600 disabled:opacity-40 transition-colors"
                  >
                    {repActionLoading === 'tprpt-male' ? '...' : 'Assign'}
                  </button>
                </div>
              )}
            </div>

            {/* Female Slot */}
            <div className="p-3 rounded-xl bg-surface border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-text-muted font-medium">Female Representative</span>
                {tprptFemaleRep ? (
                  <Badge variant="rep" size="sm">Appointed</Badge>
                ) : (
                  <span className="text-amber-400 font-medium">Unassigned</span>
                )}
              </div>

              {tprptFemaleRep ? (
                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {tprptFemaleRep.profileImageUrl ? (
                      <img
                        src={tprptFemaleRep.profileImageUrl}
                        alt={tprptFemaleRep.fullName}
                        className="w-9 h-9 rounded-full object-cover border border-sky-500/40 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                        {getInitials(tprptFemaleRep.fullName)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{tprptFemaleRep.fullName}</div>
                      <div className="text-[10px] text-text-muted font-mono">{tprptFemaleRep.studentNumber}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnassignRepDirect(tprptFemaleRep.id, 'tprpt-female')}
                    disabled={repActionLoading === 'tprpt-female'}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-rose-300 hover:text-white bg-rose-500/15 hover:bg-rose-600 transition-colors flex-shrink-0"
                  >
                    {repActionLoading === 'tprpt-female' ? 'Updating...' : 'Unassign'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 pt-1">
                  <select
                    value={selectedRepSlot['tprpt-female'] || ''}
                    onChange={(e) => setSelectedRepSlot({ ...selectedRepSlot, 'tprpt-female': e.target.value })}
                    className="flex-1 py-1 px-2 rounded-lg bg-[#091728] border border-white/10 text-white text-xs outline-none focus:border-ucr-orange"
                  >
                    <option value="">Select female candidate...</option>
                    {tprptFemaleCandidates.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName} ({c.studentNumber})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleAssignRepDirect('tprpt-female', 'Female Representative', 'TPRPT')}
                    disabled={!selectedRepSlot['tprpt-female'] || repActionLoading === 'tprpt-female'}
                    className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-sky-500 hover:bg-sky-600 disabled:opacity-40 transition-colors"
                  >
                    {repActionLoading === 'tprpt-female' ? '...' : 'Assign'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students by name, ID, or batch..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#091728] border border-white/10 text-white text-xs focus:border-ucr-orange outline-none"
            />
          </div>

          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value as any)}
            className="py-2 px-3 rounded-xl bg-[#091728] border border-white/10 text-white text-xs focus:border-ucr-orange outline-none"
          >
            <option value="ALL">All Courses ({students.length})</option>
            <option value="TPOPT">TPOPT Only</option>
            <option value="TPRPT">TPRPT Only</option>
          </select>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-ucr-orange hover:bg-ucr-orange-hover shadow-orange-glow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Table view */}
      <div className="rounded-2xl border border-white/10 bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#091728] text-text-muted uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Student ID</th>
                <th className="py-3.5 px-4">Course</th>
                <th className="py-3.5 px-4">Batch</th>
                <th className="py-3.5 px-4">Role / Rep</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-muted">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        {s.profileImageUrl ? (
                          <img
                            src={s.profileImageUrl}
                            alt={s.fullName}
                            className="w-7 h-7 rounded-full object-cover border border-white/20 flex-shrink-0"
                          />
                        ) : (
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] flex-shrink-0 border ${
                              s.course === 'TPOPT'
                                ? 'bg-orange-500/15 text-orange-400 border-orange-500/30'
                                : 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                            }`}
                          >
                            {getInitials(s.fullName)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-semibold text-white truncate">{s.fullName}</div>
                          {s.gender && <div className="text-[10px] text-text-muted">{s.gender}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">{s.studentNumber}</td>
                    <td className="py-3 px-4">
                      <Badge variant={s.course === 'TPOPT' ? 'tpopt' : 'tprpt'}>
                        {s.course}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{s.batch}</td>
                    <td className="py-3 px-4">
                      {s.isRepresentative ? (
                        <Badge variant="rep">
                          <Sparkles className="w-2.5 h-2.5" />
                          {s.representativeRole || 'Representative'}
                        </Badge>
                      ) : (
                        <span className="text-text-muted">Student</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(s)}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                          title="Edit Student"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingStudent(s)}
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                          title="Delete Student"
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

      {/* Add / Edit Student Modal */}
      {isFormOpen && (
        <Modal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          title={editingStudent ? 'Edit Student Details' : 'Add New Student Record'}
          maxWidth="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Full Name *</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Kasun Silva"
                className="w-full px-3 py-2 rounded-xl bg-[#071426] border border-white/10 text-white text-xs focus:border-ucr-orange outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-secondary">Student ID / Index No.</label>
                <input
                  type="text"
                  value={formData.studentNumber}
                  onChange={(e) => setFormData({ ...formData, studentNumber: e.target.value })}
                  placeholder="e.g. UCR/TPOPT/2026/027"
                  className="w-full px-3 py-2 rounded-xl bg-[#071426] border border-white/10 text-white text-xs font-mono focus:border-ucr-orange outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-secondary">Course Pathway *</label>
                <select
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value as CourseType })}
                  className="w-full px-3 py-2 rounded-xl bg-[#071426] border border-white/10 text-white text-xs focus:border-ucr-orange outline-none"
                >
                  <option value="TPOPT">TPOPT (Post Production)</option>
                  <option value="TPRPT">TPRPT (Studio Production)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-secondary">Batch / Intake</label>
                <input
                  type="text"
                  value={formData.batch}
                  onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                  placeholder="Batch 11 — 2026"
                  className="w-full px-3 py-2 rounded-xl bg-[#071426] border border-white/10 text-white text-xs focus:border-ucr-orange outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-secondary">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => {
                    const newGender = e.target.value as 'Male' | 'Female';
                    setFormData({
                      ...formData,
                      gender: newGender,
                      representativeRole: formData.isRepresentative
                        ? (newGender === 'Female' ? 'Female Representative' : 'Male Representative')
                        : formData.representativeRole,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[#071426] border border-white/10 text-white text-xs focus:border-ucr-orange outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Contact Mobile / Phone Number</label>
              <input
                type="text"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="e.g. +94 77 123 4567"
                className="w-full px-3 py-2 rounded-xl bg-[#071426] border border-white/10 text-white text-xs font-mono focus:border-ucr-orange outline-none"
              />
            </div>

            {/* Batch Representative Assignment */}
            <div className="p-4 rounded-xl bg-[#071426] border border-white/10 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isRepresentative}
                  onChange={(e) => {
                    const isRep = e.target.checked;
                    setFormData({
                      ...formData,
                      isRepresentative: isRep,
                      representativeRole: isRep
                        ? (formData.representativeRole || (formData.gender === 'Female' ? 'Female Representative' : 'Male Representative'))
                        : '',
                    });
                  }}
                  className="w-4 h-4 rounded text-ucr-orange focus:ring-0 bg-surface border-white/20"
                />
                <span className="text-xs font-semibold text-white">
                  Assign as Batch Representative for {formData.course}
                </span>
              </label>

              {formData.isRepresentative && (
                <div className="space-y-1 pt-1">
                  <label className="text-[11px] text-text-muted">Representative Role Title</label>
                  <select
                    value={formData.representativeRole}
                    onChange={(e) => setFormData({ ...formData, representativeRole: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-surface border border-white/10 text-white text-xs focus:border-ucr-orange outline-none"
                  >
                    <option value="Male Representative">Male Representative</option>
                    <option value="Female Representative">Female Representative</option>
                    <option value="Course Representative">Course Representative</option>
                  </select>
                  <p className="text-[10px] text-text-muted">
                    Note: Maximum 2 representatives (1 male and 1 female) per course.
                  </p>
                </div>
              )}
            </div>

            {/* Profile image URL / Upload */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Profile Photo (Optional)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.profileImageUrl}
                  onChange={(e) => setFormData({ ...formData, profileImageUrl: e.target.value })}
                  placeholder="/images/... or https://..."
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
              <label className="text-xs font-semibold text-text-secondary">Internal Notes</label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Optional administrative notes..."
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
                {editingStudent ? 'Save Changes' : 'Create Student'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingStudent && (
        <ConfirmModal
          isOpen={Boolean(deletingStudent)}
          onClose={() => setDeletingStudent(null)}
          onConfirm={handleDelete}
          title="Delete Student Record"
          message={`Are you sure you want to permanently delete the student record for "${deletingStudent.fullName}" (${deletingStudent.studentNumber})? This action cannot be undone.`}
          confirmLabel="Delete Student"
          isLoading={submitting}
        />
      )}
    </div>
  );
}
