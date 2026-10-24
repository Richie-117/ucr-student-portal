'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Student } from '@/lib/types';
import StudentSelectionPanel from '@/components/tools/StudentSelectionPanel';
import DocumentOptionsPanel from '@/components/tools/DocumentOptionsPanel';
import LiveDocumentPreview from '@/components/tools/LiveDocumentPreview';
import {
  DocumentOptions,
  DEFAULT_DOCUMENT_OPTIONS,
  CourseMode,
  downloadPdfDocument,
} from '@/lib/pdfGenerator';
import {
  Wrench,
  FileText,
  Printer,
  Download,
  CheckCircle,
  Users,
  Settings,
  Eye,
  Sliders,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  Loader2,
} from 'lucide-react';

export default function ToolsPageClient() {
  const searchParams = useSearchParams();

  // Student Data State
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Selection & Mode State
  const initialMode = (searchParams.get('course') as CourseMode) || 'ALL';
  const [courseMode, setCourseMode] = useState<CourseMode>(
    initialMode === 'TPOPT' || initialMode === 'TPRPT' ? initialMode : 'ALL'
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Document Options State
  const [options, setOptions] = useState<DocumentOptions>(DEFAULT_DOCUMENT_OPTIONS);

  // Mobile Accordion Tabs State
  const [mobileActiveSection, setMobileActiveSection] = useState<'students' | 'options' | 'preview'>('preview');

  // PDF generation state for mobile quick bar
  const [mobileGenerating, setMobileGenerating] = useState(false);

  // Fetch students from official API
  useEffect(() => {
    async function fetchStudents() {
      try {
        setLoading(true);
        const res = await fetch('/api/students');
        const data = await res.json();
        if (data.students) {
          setStudents(data.students);
          // Pre-populate selection with all students for quick custom editing
          const allIdSet = new Set<string>(data.students.map((s: Student) => s.id));
          setSelectedIds(allIdSet);
        }
      } catch (err) {
        console.error('Failed to load students:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, []);

  // Compute effective student list to output
  const effectiveStudents = useMemo(() => {
    switch (courseMode) {
      case 'TPOPT':
        return students.filter((s) => s.course === 'TPOPT');
      case 'TPRPT':
        return students.filter((s) => s.course === 'TPRPT');
      case 'CUSTOM':
        return students.filter((s) => selectedIds.has(s.id));
      case 'ALL':
      default:
        return students;
    }
  }, [students, courseMode, selectedIds]);

  // Selection toggles
  const handleToggleStudent = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectMultiple = (ids: string[], select: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => {
        if (select) next.add(id);
        else next.delete(id);
      });
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleOptionChange = (updated: Partial<DocumentOptions>) => {
    setOptions((prev) => ({ ...prev, ...updated }));
  };

  const handleResetOptions = () => {
    setOptions(DEFAULT_DOCUMENT_OPTIONS);
  };

  // Mobile quick PDF generator
  const handleMobileGeneratePdf = async () => {
    try {
      setMobileGenerating(true);
      await downloadPdfDocument(effectiveStudents, options, courseMode);
    } catch (err) {
      console.error('PDF error:', err);
    } finally {
      setMobileGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06111F] text-[#F8FAFC] pb-24 md:pb-16">
      {/* 1. Header & Hero Section */}
      <section className="relative overflow-hidden border-b border-white/10 bg-[#071324] py-8 sm:py-12">
        {/* Subtle Background Production Image with dark overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-luminosity">
          <Image
            src="/images/hero_production.jpg"
            alt="Broadcast Studio"
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        {/* Gradient overlays for contrast and brand colors */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#06111F] via-[#06111F]/90 to-[#0B1B2D]/95 pointer-events-none" />
        <div className="absolute -top-24 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          {/* Eyebrow */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-[11px] font-bold text-ucr-orange uppercase tracking-widest shadow-sm">
              <Wrench className="w-3.5 h-3.5" />
              TOOLS
            </span>
            <span className="text-[11px] text-text-muted hidden sm:inline-block">
              Division of Television Studies • Academic Utilities
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Student List Generator
          </h1>

          {/* Description */}
          <p className="text-xs sm:text-sm text-text-secondary max-w-3xl leading-relaxed">
            Generate and download student lists for official use. Select a course, choose students,
            customise the document, and export a clean printable PDF.
          </p>

          {/* Quick Metrics Bar */}
          <div className="pt-2 flex items-center gap-3 flex-wrap text-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface/80 border border-white/10">
              <span className="text-text-muted">Total Learners:</span>
              <strong className="text-white font-mono">{students.length}</strong>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/25 text-orange-400">
              <span>TPOPT:</span>
              <strong className="font-mono">
                {students.filter((s) => s.course === 'TPOPT').length}
              </strong>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/25 text-sky-400">
              <span>TPRPT:</span>
              <strong className="font-mono">
                {students.filter((s) => s.course === 'TPRPT').length}
              </strong>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-medium">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Ready for Export: {effectiveStudents.length}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Two-Column Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Mobile Tab Navigation (< 1024px) */}
        <div className="lg:hidden mb-6 flex rounded-xl bg-[#091728] p-1 border border-white/10">
          <button
            type="button"
            onClick={() => setMobileActiveSection('students')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              mobileActiveSection === 'students'
                ? 'bg-ucr-orange text-white shadow-sm'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>1. Students ({effectiveStudents.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileActiveSection('options')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              mobileActiveSection === 'options'
                ? 'bg-ucr-orange text-white shadow-sm'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>2. Options</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileActiveSection('preview')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              mobileActiveSection === 'preview'
                ? 'bg-ucr-orange text-white shadow-sm'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>3. Preview</span>
          </button>
        </div>

        {/* Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Student Selection & Document Options (lg:col-span-5) */}
          <div
            className={`lg:col-span-5 space-y-6 ${
              mobileActiveSection === 'preview' ? 'hidden lg:block' : 'block'
            }`}
          >
            {/* Student Selection Section */}
            <div className={mobileActiveSection === 'options' ? 'hidden lg:block' : 'block'}>
              <StudentSelectionPanel
                students={students}
                loading={loading}
                courseMode={courseMode}
                onCourseModeChange={setCourseMode}
                selectedIds={selectedIds}
                onToggleStudent={handleToggleStudent}
                onSelectMultiple={handleSelectMultiple}
                onClearSelection={handleClearSelection}
                effectiveOutputCount={effectiveStudents.length}
              />
            </div>

            {/* Document Options Section */}
            <div className={mobileActiveSection === 'students' ? 'hidden lg:block' : 'block'}>
              <DocumentOptionsPanel
                options={options}
                onChange={handleOptionChange}
                onReset={handleResetOptions}
              />
            </div>
          </div>

          {/* Right Column: Live Document Preview (lg:col-span-7) */}
          <div
            className={`lg:col-span-7 lg:sticky lg:top-24 ${
              mobileActiveSection !== 'preview' ? 'hidden lg:block' : 'block'
            }`}
          >
            <LiveDocumentPreview
              students={effectiveStudents}
              options={options}
              courseMode={courseMode}
              effectiveOutputCount={effectiveStudents.length}
            />
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Action Bar (< 1024px) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#06111F]/95 backdrop-blur-md border-t border-white/10 px-4 py-3 shadow-2xl flex items-center justify-between gap-3">
        <div className="text-xs">
          <span className="text-text-muted block text-[10px]">Selected for Print:</span>
          <span className="font-bold text-white">
            {effectiveStudents.length} Students
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-surface-lighter border border-white/10 active:scale-95"
          >
            <Printer className="w-3.5 h-3.5 inline mr-1" />
            Print
          </button>

          <button
            type="button"
            onClick={handleMobileGeneratePdf}
            disabled={mobileGenerating || (effectiveStudents.length === 0 && options.blankRowsCount === 0)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-ucr-orange hover:bg-ucr-orange-hover border border-orange-500/40 shadow-orange-glow active:scale-95 disabled:opacity-40"
          >
            {mobileGenerating ? (
              <Loader2 className="w-3.5 h-3.5 inline animate-spin mr-1" />
            ) : (
              <Download className="w-3.5 h-3.5 inline mr-1" />
            )}
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
