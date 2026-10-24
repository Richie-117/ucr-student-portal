'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Student, CourseType } from '@/lib/types';
import Badge from '@/components/Badge';
import {
  Search,
  Filter,
  Users,
  Award,
  Sparkles,
  GraduationCap,
  X,
  UserCheck,
  RotateCcw,
  LayoutGrid,
  List,
} from 'lucide-react';

function StudentsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // Initialize filter from URL query param
  const initialCourse = searchParams.get('course') as CourseType | null;
  const [courseFilter, setCourseFilter] = useState<'ALL' | 'TPOPT' | 'TPRPT'>(
    initialCourse === 'TPOPT' || initialCourse === 'TPRPT' ? initialCourse : 'ALL'
  );

  const [roleFilter, setRoleFilter] = useState<'ALL' | 'REPRESENTATIVES'>('ALL');

  // Fetch students from API
  useEffect(() => {
    async function fetchStudents() {
      try {
        setLoading(true);
        const res = await fetch('/api/students');
        const data = await res.json();
        if (data.students) {
          setStudents(data.students);
        }
      } catch (err) {
        console.error('Error fetching students:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, []);

  // Sync courseFilter with URL query param if URL changes
  useEffect(() => {
    const courseParam = searchParams.get('course') as CourseType | null;
    if (courseParam === 'TPOPT' || courseParam === 'TPRPT') {
      setCourseFilter(courseParam);
    }
  }, [searchParams]);

  // Update URL when course filter changes
  const handleCourseFilterChange = (course: 'ALL' | 'TPOPT' | 'TPRPT') => {
    setCourseFilter(course);
    if (course === 'ALL') {
      router.push('/students', { scroll: false });
    } else {
      router.push(`/students?course=${course}`, { scroll: false });
    }
  };

  // Representatives grouped by course
  const tpoptReps = useMemo(
    () => students.filter((s) => s.course === 'TPOPT' && s.isRepresentative),
    [students]
  );

  const tprptReps = useMemo(
    () => students.filter((s) => s.course === 'TPRPT' && s.isRepresentative),
    [students]
  );

  // Filtered student list
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // Course filter
      if (courseFilter !== 'ALL' && student.course !== courseFilter) {
        return false;
      }
      // Role filter
      if (roleFilter === 'REPRESENTATIVES' && !student.isRepresentative) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = student.fullName.toLowerCase().includes(q);
        const matchId = student.studentNumber.toLowerCase().includes(q);
        const matchBatch = student.batch.toLowerCase().includes(q);
        return matchName || matchId || matchBatch;
      }
      return true;
    });
  }, [students, courseFilter, roleFilter, searchQuery]);

  // Counts
  const tpoptTotal = students.filter((s) => s.course === 'TPOPT').length;
  const tprptTotal = students.filter((s) => s.course === 'TPRPT').length;

  // Initials generator
  const getInitials = (name: string) => {
    const clean = name.replace(/\(Demo\)/gi, '').trim();
    const parts = clean.split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-12">
      {/* Header Banner */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs font-semibold text-ucr-orange uppercase tracking-wider">
          <Users className="w-3.5 h-3.5" />
          Division Community Directory
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Student Directory
        </h1>

        <p className="text-sm sm:text-base text-text-secondary max-w-2xl leading-relaxed">
          Registered learners for the 2026 intake across Television and Digital Media Post Production Technology (TPOPT) and Production Technology (TPRPT).
        </p>

        {/* Course totals breakdown */}
        <div className="flex items-center gap-3 pt-2 text-xs flex-wrap">
          <span className="px-3 py-1 rounded-lg bg-surface border border-white/10 text-white font-medium">
            Total Students: <strong className="text-white ml-1">{students.length}</strong>
          </span>
          <span className="px-3 py-1 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 font-medium">
            TPOPT: <strong className="ml-1">{tpoptTotal}</strong>
          </span>
          <span className="px-3 py-1 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 font-medium">
            TPRPT: <strong className="ml-1">{tprptTotal}</strong>
          </span>
        </div>
      </div>

      {/* ========================================================
          BATCH REPRESENTATIVES SECTION
          ======================================================== */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface/90 border border-white/10 space-y-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Batch Representatives — Intake 2026
              </h2>
              <p className="text-xs text-text-muted">
                Student leadership appointments for academic coordination and division liaison.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* TPOPT Representatives (2 spots: Male & Female) */}
          <div className="p-5 rounded-2xl bg-[#091728] border border-orange-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-400" />
                TPOPT Representatives (Post Production)
              </span>
              <Badge variant="tpopt">2 Spots</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[0, 1].map((index) => {
                const rep = tpoptReps[index];
                return (
                  <div
                    key={`tpopt-rep-${index}`}
                    className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                      rep
                        ? 'bg-orange-500/5 border-orange-500/30'
                        : 'bg-white/5 border-dashed border-white/15'
                    }`}
                  >
                    {rep ? (
                      <>
                        {rep.profileImageUrl ? (
                          <img
                            src={rep.profileImageUrl}
                            alt={rep.fullName}
                            className="w-10 h-10 rounded-full object-cover border border-orange-500/40 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/40 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {getInitials(rep.fullName)}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1 text-[11px] font-bold text-orange-400">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            <span>{rep.representativeRole || 'Representative'}</span>
                          </div>
                          <div className="text-xs font-bold text-white truncate">{rep.fullName}</div>
                          <div className="text-[10px] text-text-muted font-mono">{rep.studentNumber}</div>
                        </div>
                      </>
                    ) : (
                      <div className="py-2 text-center w-full">
                        <span className="text-xs text-text-muted italic">Representative not assigned</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* TPRPT Representatives (2 spots: Male & Female) */}
          <div className="p-5 rounded-2xl bg-[#091728] border border-sky-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                TPRPT Representatives (Studio Production)
              </span>
              <Badge variant="tprpt">2 Spots</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[0, 1].map((index) => {
                const rep = tprptReps[index];
                return (
                  <div
                    key={`tprpt-rep-${index}`}
                    className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                      rep
                        ? 'bg-sky-500/5 border-sky-500/30'
                        : 'bg-white/5 border-dashed border-white/15'
                    }`}
                  >
                    {rep ? (
                      <>
                        {rep.profileImageUrl ? (
                          <img
                            src={rep.profileImageUrl}
                            alt={rep.fullName}
                            className="w-10 h-10 rounded-full object-cover border border-sky-500/40 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {getInitials(rep.fullName)}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1 text-[11px] font-bold text-sky-400">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            <span>{rep.representativeRole || 'Representative'}</span>
                          </div>
                          <div className="text-xs font-bold text-white truncate">{rep.fullName}</div>
                          <div className="text-[10px] text-text-muted font-mono">{rep.studentNumber}</div>
                        </div>
                      </>
                    ) : (
                      <div className="py-2 text-center w-full">
                        <span className="text-xs text-text-muted italic">Representative not assigned</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          SEARCH AND FILTER CONTROLS
          ======================================================== */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name or ID..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-surface border border-white/10 text-white placeholder-text-muted text-sm focus:border-ucr-orange focus:ring-1 focus:ring-ucr-orange transition-all outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Course Filters */}
            <div className="inline-flex p-1 rounded-xl bg-surface border border-white/10">
              <button
                onClick={() => handleCourseFilterChange('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  courseFilter === 'ALL'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-text-secondary hover:text-white'
                }`}
              >
                All Courses ({students.length})
              </button>
              <button
                onClick={() => handleCourseFilterChange('TPOPT')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  courseFilter === 'TPOPT'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-orange-400 hover:text-orange-300'
                }`}
              >
                TPOPT ({tpoptTotal})
              </button>
              <button
                onClick={() => handleCourseFilterChange('TPRPT')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  courseFilter === 'TPRPT'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-sky-400 hover:text-sky-300'
                }`}
              >
                TPRPT ({tprptTotal})
              </button>
            </div>

            {/* Role Filter */}
            <div className="inline-flex p-1 rounded-xl bg-surface border border-white/10">
              <button
                onClick={() => setRoleFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  roleFilter === 'ALL'
                    ? 'bg-white/15 text-white'
                    : 'text-text-secondary hover:text-white'
                }`}
              >
                All Roles
              </button>
              <button
                onClick={() => setRoleFilter('REPRESENTATIVES')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                  roleFilter === 'REPRESENTATIVES'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-amber-400/80 hover:text-amber-300'
                }`}
              >
                <Award className="w-3 h-3" />
                Reps Only
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Indicators, Result Count & View Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-text-muted pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span>
              Showing <strong className="text-white">{filteredStudents.length}</strong> {filteredStudents.length === 1 ? 'student' : 'students'}
              {courseFilter !== 'ALL' && (
                <span> in <strong className={courseFilter === 'TPOPT' ? 'text-orange-400' : 'text-sky-400'}>{courseFilter}</strong></span>
              )}
              {roleFilter === 'REPRESENTATIVES' && <span> (Representatives only)</span>}
              {searchQuery && <span> matching &quot;{searchQuery}&quot;</span>}
            </span>

            {(courseFilter !== 'ALL' || roleFilter !== 'ALL' || searchQuery) && (
              <button
                onClick={() => {
                  setCourseFilter('ALL');
                  setRoleFilter('ALL');
                  setSearchQuery('');
                  router.push('/students', { scroll: false });
                }}
                className="inline-flex items-center gap-1 text-ucr-orange hover:underline text-xs ml-2"
              >
                <RotateCcw className="w-3 h-3" />
                Reset filters
              </button>
            )}
          </div>

          {/* Desktop View Switcher (Cards Grid vs Dense Table) */}
          <div className="hidden sm:inline-flex p-1 rounded-xl bg-surface border border-white/10 self-end sm:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-text-muted hover:text-white'
              }`}
              title="Cards Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-text-muted hover:text-white'
              }`}
              title="Dense Directory Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          STUDENT DIRECTORY DISPLAY (Cards Grid or Table View)
          ======================================================== */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-5 rounded-2xl bg-surface/50 border border-white/5 animate-pulse h-44" />
          ))}
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-surface/40 border border-dashed border-white/15 space-y-4">
          <div className="w-12 h-12 rounded-full bg-white/5 mx-auto flex items-center justify-center text-text-muted">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">No students found</h3>
          <p className="text-sm text-text-secondary max-w-sm mx-auto">
            No student records matched your selected course filter or search keywords.
          </p>
          <button
            onClick={() => {
              setCourseFilter('ALL');
              setRoleFilter('ALL');
              setSearchQuery('');
              router.push('/students', { scroll: false });
            }}
            className="px-4 py-2 rounded-xl bg-surface-lighter text-xs font-semibold text-white hover:bg-surface-hover border border-white/10"
          >
            Clear filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* Dense Table View for Desktop / Tablets */
        <div className="rounded-3xl border border-white/10 bg-surface/90 overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#091728] text-text-muted uppercase tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Student Name</th>
                  <th className="py-3.5 px-4 font-semibold">Student ID</th>
                  <th className="py-3.5 px-4 font-semibold">Course Pathway</th>
                  <th className="py-3.5 px-4 font-semibold">Batch / Intake</th>
                  <th className="py-3.5 px-4 font-semibold">Academic Role</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Gender</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredStudents.map((student) => {
                  const isTPOPT = student.course === 'TPOPT';
                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-white/[0.03] transition-colors ${
                        student.isRepresentative
                          ? isTPOPT
                            ? 'bg-orange-500/[0.03]'
                            : 'bg-sky-500/[0.03]'
                          : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {student.profileImageUrl ? (
                            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20 flex-shrink-0">
                              <Image
                                src={student.profileImageUrl}
                                alt={student.fullName}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[11px] flex-shrink-0 border ${
                                isTPOPT
                                  ? 'bg-orange-500/15 text-orange-400 border-orange-500/30'
                                  : 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                              }`}
                            >
                              {getInitials(student.fullName)}
                            </div>
                          )}
                          <div>
                            <span className="font-semibold text-white block">{student.fullName}</span>
                            {student.isRepresentative && (
                              <span className="text-[10px] text-amber-400 font-medium sm:hidden">
                                {student.representativeRole || 'Representative'}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">{student.studentNumber}</td>
                      <td className="py-3 px-4">
                        <Badge variant={isTPOPT ? 'tpopt' : 'tprpt'}>
                          {student.course}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-text-secondary">{student.batch}</td>
                      <td className="py-3 px-4">
                        {student.isRepresentative ? (
                          <Badge variant="rep" size="sm">
                            <Sparkles className="w-2.5 h-2.5" />
                            {student.representativeRole || 'Representative'}
                          </Badge>
                        ) : (
                          <span className="text-text-muted">Student</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-text-muted font-mono uppercase text-[11px]">
                        {student.gender || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredStudents.map((student) => {
            const isTPOPT = student.course === 'TPOPT';
            return (
              <div
                key={student.id}
                className={`group relative p-5 rounded-2xl bg-surface border transition-all duration-300 hover:shadow-card flex flex-col justify-between ${
                  student.isRepresentative
                    ? isTPOPT
                      ? 'border-orange-500/40 bg-gradient-to-b from-orange-500/5 to-surface'
                      : 'border-sky-500/40 bg-gradient-to-b from-sky-500/5 to-surface'
                    : 'border-white/10 hover:border-white/25'
                }`}
              >
                <div>
                  {/* Top row: Avatar & Course Badge */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    {/* Avatar */}
                    {student.profileImageUrl ? (
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/20">
                        <Image
                          src={student.profileImageUrl}
                          alt={student.fullName}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm tracking-wide border ${
                          isTPOPT
                            ? 'bg-orange-500/15 text-orange-400 border-orange-500/30'
                            : 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                        }`}
                      >
                        {getInitials(student.fullName)}
                      </div>
                    )}

                    {/* Course Badge */}
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={isTPOPT ? 'tpopt' : 'tprpt'}>
                        {student.course}
                      </Badge>
                      {student.isRepresentative && (
                        <Badge variant="rep" size="sm">
                          <Sparkles className="w-2.5 h-2.5" />
                          Rep
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Student Details */}
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-white transition-colors leading-snug">
                      {student.fullName}
                    </h3>
                    <div className="text-xs font-mono text-text-muted">
                      {student.studentNumber}
                    </div>
                  </div>
                </div>

                {/* Bottom Card Footer */}
                <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-text-muted">
                  <span>{student.batch}</span>
                  {student.gender && (
                    <span className="text-[10px] uppercase font-semibold text-slate-400">
                      {student.gender}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function StudentsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto p-12 text-center text-text-muted">Loading student directory...</div>}>
      <StudentsContent />
    </Suspense>
  );
}
