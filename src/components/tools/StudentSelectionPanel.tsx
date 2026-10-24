'use client';

import React, { useState, useMemo } from 'react';
import { Student, CourseType } from '@/lib/types';
import Badge from '@/components/Badge';
import { CourseMode } from '@/lib/pdfGenerator';
import {
  Search,
  Users,
  CheckSquare,
  Square,
  RotateCcw,
  SlidersHorizontal,
  Phone,
  GraduationCap,
  Sparkles,
  Award,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';

interface StudentSelectionPanelProps {
  students: Student[];
  loading: boolean;
  courseMode: CourseMode;
  onCourseModeChange: (mode: CourseMode) => void;
  selectedIds: Set<string>;
  onToggleStudent: (id: string) => void;
  onSelectMultiple: (ids: string[], select: boolean) => void;
  onClearSelection: () => void;
  effectiveOutputCount: number;
}

export default function StudentSelectionPanel({
  students,
  loading,
  courseMode,
  onCourseModeChange,
  selectedIds,
  onToggleStudent,
  onSelectMultiple,
  onClearSelection,
  effectiveOutputCount,
}: StudentSelectionPanelProps) {
  const [search, setSearch] = useState('');
  const [batchFilter, setBatchFilter] = useState('ALL');
  const [repFilter, setRepFilter] = useState<'ALL' | 'REPRESENTATIVES'>('ALL');
  const [subCourseFilter, setSubCourseFilter] = useState<'ALL' | 'TPOPT' | 'TPRPT'>('ALL');

  // Counts
  const totalCount = students.length;
  const tpoptCount = useMemo(() => students.filter((s) => s.course === 'TPOPT').length, [students]);
  const tprptCount = useMemo(() => students.filter((s) => s.course === 'TPRPT').length, [students]);
  const customCount = selectedIds.size;

  // Available batches
  const availableBatches = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.batch) set.add(s.batch);
    });
    return Array.from(set).sort();
  }, [students]);

  // Filtered student list for selection
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Course mode scoping (if in TPOPT or TPRPT mode, restrict the list view)
      if (courseMode === 'TPOPT' && s.course !== 'TPOPT') return false;
      if (courseMode === 'TPRPT' && s.course !== 'TPRPT') return false;

      // Sub-course filter (relevant when in ALL or CUSTOM mode)
      if ((courseMode === 'ALL' || courseMode === 'CUSTOM') && subCourseFilter !== 'ALL') {
        if (s.course !== subCourseFilter) return false;
      }

      // Batch filter
      if (batchFilter !== 'ALL' && s.batch !== batchFilter) return false;

      // Rep filter
      if (repFilter === 'REPRESENTATIVES' && !s.isRepresentative) return false;

      // Search
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchName = s.fullName.toLowerCase().includes(q);
        const matchId = (s.studentNumber || '').toLowerCase().includes(q);
        const matchBatch = (s.batch || '').toLowerCase().includes(q);
        return matchName || matchId || matchBatch;
      }

      return true;
    });
  }, [students, courseMode, subCourseFilter, batchFilter, repFilter, search]);

  // Visible IDs
  const visibleIds = useMemo(() => filteredStudents.map((s) => s.id), [filteredStudents]);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));
  const someVisibleSelected =
    visibleIds.some((id) => selectedIds.has(id)) && !allVisibleSelected;

  const handleSelectAllVisible = () => {
    if (allVisibleSelected) {
      onSelectMultiple(visibleIds, false);
    } else {
      onSelectMultiple(visibleIds, true);
    }
  };

  return (
    <div className="bg-[#091728] border border-white/10 rounded-2xl p-4 sm:p-6 space-y-6 shadow-xl">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-orange-500/10 text-ucr-orange">
              <Users className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">1. Student Selection</h2>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Choose which course or individual students to include in the document.
          </p>
        </div>

        {/* Live sync output badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-lighter/80 border border-white/10 text-xs self-start sm:self-auto">
          <span className="text-text-muted">Will Export:</span>
          <span className="font-bold text-white px-2 py-0.5 rounded-md bg-ucr-orange/20 text-orange-400 border border-orange-500/30">
            {effectiveOutputCount} {effectiveOutputCount === 1 ? 'Student' : 'Students'}
          </span>
        </div>
      </div>

      {/* Course Selection Modes */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Course Scope Mode
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Mode 1: All Students */}
          <button
            type="button"
            onClick={() => onCourseModeChange('ALL')}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
              courseMode === 'ALL'
                ? 'bg-white/15 border-white/40 text-white shadow-lg ring-1 ring-white/20'
                : 'bg-surface/60 border-white/5 text-slate-300 hover:bg-white/5 hover:border-white/20'
            }`}
          >
            <span className="text-xs font-bold">All Students</span>
            <span className="text-[11px] text-text-muted mt-0.5">{totalCount} total</span>
          </button>

          {/* Mode 2: TPOPT Only */}
          <button
            type="button"
            onClick={() => onCourseModeChange('TPOPT')}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
              courseMode === 'TPOPT'
                ? 'bg-orange-500/20 border-orange-500/60 text-white shadow-orange-glow ring-1 ring-orange-500/40'
                : 'bg-surface/60 border-white/5 text-slate-300 hover:bg-orange-500/10 hover:border-orange-500/30'
            }`}
          >
            <span className="text-xs font-bold text-orange-400">TPOPT Only</span>
            <span className="text-[11px] text-text-muted mt-0.5">{tpoptCount} records</span>
          </button>

          {/* Mode 3: TPRPT Only */}
          <button
            type="button"
            onClick={() => onCourseModeChange('TPRPT')}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
              courseMode === 'TPRPT'
                ? 'bg-sky-500/20 border-sky-500/60 text-white shadow-blue-glow ring-1 ring-sky-500/40'
                : 'bg-surface/60 border-white/5 text-slate-300 hover:bg-sky-500/10 hover:border-sky-500/30'
            }`}
          >
            <span className="text-xs font-bold text-sky-400">TPRPT Only</span>
            <span className="text-[11px] text-text-muted mt-0.5">{tprptCount} records</span>
          </button>

          {/* Mode 4: Custom Selected */}
          <button
            type="button"
            onClick={() => onCourseModeChange('CUSTOM')}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
              courseMode === 'CUSTOM'
                ? 'bg-purple-500/20 border-purple-500/60 text-white shadow-lg ring-1 ring-purple-500/40'
                : 'bg-surface/60 border-white/5 text-slate-300 hover:bg-purple-500/10 hover:border-purple-500/30'
            }`}
          >
            <span className="text-xs font-bold text-purple-300">Custom Pick</span>
            <span className="text-[11px] text-text-muted mt-0.5">{customCount} checked</span>
          </button>
        </div>
      </div>

      {/* Mode Explanation & Custom Empty Warning */}
      {courseMode === 'CUSTOM' && customCount === 0 && (
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block text-amber-300">No students currently checked</strong>
            In custom mode, check individual students below to construct your custom PDF list.
          </div>
        </div>
      )}

      {courseMode !== 'CUSTOM' && (
        <div className="text-[11px] text-text-muted flex items-center justify-between px-1">
          <span>
            Scope: <strong className="text-slate-300">{courseMode === 'ALL' ? 'Full Division (Both Courses)' : courseMode}</strong>
          </span>
          <span>Checkboxes allow fine-grained custom picking when switched to Custom mode.</span>
        </div>
      )}

      {/* Search & Secondary Filter Controls */}
      <div className="space-y-3 pt-2">
        <div className="relative">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student name, student ID, or batch..."
            className="w-full bg-[#06111F] border border-white/10 rounded-xl pl-10 pr-9 py-2.5 text-xs text-white placeholder-text-muted focus:border-ucr-orange focus:ring-1 focus:ring-ucr-orange transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Sub-course filter (when in ALL or CUSTOM) */}
          {(courseMode === 'ALL' || courseMode === 'CUSTOM') && (
            <div className="flex items-center gap-1 bg-[#06111F] p-1 rounded-lg border border-white/10">
              <span className="text-[10px] text-text-muted px-1.5 uppercase font-semibold">Course:</span>
              <button
                type="button"
                onClick={() => setSubCourseFilter('ALL')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  subCourseFilter === 'ALL' ? 'bg-white/20 text-white' : 'text-text-muted hover:text-slate-300'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setSubCourseFilter('TPOPT')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  subCourseFilter === 'TPOPT' ? 'bg-orange-500/30 text-orange-400 font-bold' : 'text-text-muted hover:text-orange-400'
                }`}
              >
                TPOPT
              </button>
              <button
                type="button"
                onClick={() => setSubCourseFilter('TPRPT')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  subCourseFilter === 'TPRPT' ? 'bg-sky-500/30 text-sky-400 font-bold' : 'text-text-muted hover:text-sky-400'
                }`}
              >
                TPRPT
              </button>
            </div>
          )}

          {/* Batch Filter dropdown */}
          {availableBatches.length > 1 && (
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="bg-[#06111F] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:border-ucr-orange"
            >
              <option value="ALL">All Batches</option>
              {availableBatches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          )}

          {/* Reps filter */}
          <button
            type="button"
            onClick={() => setRepFilter(repFilter === 'ALL' ? 'REPRESENTATIVES' : 'ALL')}
            className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-all flex items-center gap-1 ${
              repFilter === 'REPRESENTATIVES'
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-[#06111F] border-white/10 text-text-muted hover:text-slate-300'
            }`}
          >
            <Award className="w-3 h-3" />
            <span>Reps Only</span>
          </button>

          {(search || batchFilter !== 'ALL' || repFilter !== 'ALL' || subCourseFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setBatchFilter('ALL');
                setRepFilter('ALL');
                setSubCourseFilter('ALL');
              }}
              className="text-xs text-text-muted hover:text-white flex items-center gap-1 px-2 py-1 ml-auto"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Bulk Select / Deselect Bar */}
      <div className="flex items-center justify-between pt-2 pb-1 text-xs text-text-secondary border-t border-white/5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSelectAllVisible}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-lighter hover:bg-white/10 text-white font-medium transition-all"
            title="Toggle selection for visible records"
          >
            {allVisibleSelected ? (
              <CheckSquare className="w-3.5 h-3.5 text-ucr-orange" />
            ) : someVisibleSelected ? (
              <CheckSquare className="w-3.5 h-3.5 text-orange-300 opacity-60" />
            ) : (
              <Square className="w-3.5 h-3.5 text-text-muted" />
            )}
            <span>{allVisibleSelected ? 'Deselect Visible' : 'Select All Filtered'}</span>
          </button>

          <span className="text-[11px] text-text-muted">
            ({filteredStudents.length} showing)
          </span>
        </div>

        {selectedIds.size > 0 && (
          <button
            type="button"
            onClick={onClearSelection}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            Clear Selected ({selectedIds.size})
          </button>
        )}
      </div>

      {/* Student List Scrollable Container */}
      <div className="max-h-[380px] overflow-y-auto space-y-1.5 pr-1 border border-white/5 rounded-xl bg-[#06111F]/70 p-2">
        {loading ? (
          <div className="py-12 text-center text-xs text-text-muted">
            Loading student records...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <p className="text-xs text-text-muted">No students match current search or filter.</p>
            <button
              onClick={() => {
                setSearch('');
                setBatchFilter('ALL');
                setRepFilter('ALL');
                setSubCourseFilter('ALL');
              }}
              className="text-xs text-ucr-orange hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          filteredStudents.map((student, idx) => {
            const isChecked = selectedIds.has(student.id);
            const isTpopt = student.course === 'TPOPT';

            return (
              <div
                key={student.id}
                onClick={() => onToggleStudent(student.id)}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isChecked
                    ? 'bg-white/10 border-white/25 shadow-sm'
                    : 'bg-surface/40 border-white/5 hover:bg-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Accessible Checkbox */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStudent(student.id);
                    }}
                    aria-label={`Select ${student.fullName}`}
                    className="shrink-0 p-0.5 rounded text-white"
                  >
                    {isChecked ? (
                      <CheckCircle2 className="w-4 h-4 text-ucr-orange fill-ucr-orange/20" />
                    ) : (
                      <Square className="w-4 h-4 text-text-muted" />
                    )}
                  </button>

                  {/* Student details */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-white truncate max-w-[180px] sm:max-w-[240px]">
                        {student.fullName}
                      </span>
                      {student.isRepresentative && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40">
                          Rep
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-text-muted mt-0.5 flex-wrap">
                      <span className="font-mono text-slate-400">{student.studentNumber || '—'}</span>
                      {student.phoneNumber && (
                        <span className="flex items-center gap-1 text-[10px] text-slate-400">
                          <Phone className="w-2.5 h-2.5 text-text-muted" />
                          {student.phoneNumber}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Course badge */}
                <div className="shrink-0 ml-2">
                  <Badge variant={isTpopt ? 'tpopt' : 'tprpt'} size="sm">
                    {student.course}
                  </Badge>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
