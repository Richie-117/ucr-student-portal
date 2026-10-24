'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { CourseModule, LearningStage, CourseType, ModuleStatus } from '@/lib/types';
import Badge from '@/components/Badge';
import Modal from '@/components/Modal';
import {
  Search,
  BookOpen,
  Filter,
  CheckCircle2,
  Clock,
  Calendar,
  FileText,
  ExternalLink,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

function ModulesContent() {
  const searchParams = useSearchParams();

  const [modules, setModules] = useState<CourseModule[]>([]);
  const [stages, setStages] = useState<LearningStage[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const initialSearch = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [courseFilter, setCourseFilter] = useState<'ALL' | 'TPOPT' | 'TPRPT'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [stageFilter, setStageFilter] = useState<string>('ALL');

  // Selected module for detail modal
  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [modRes, stageRes] = await Promise.all([
          fetch('/api/modules?publishedOnly=true'),
          fetch('/api/stages'),
        ]);
        const modData = await modRes.json();
        const stageData = await stageRes.json();

        if (modData.modules) setModules(modData.modules);
        if (stageData.stages) setStages(stageData.stages);
      } catch (err) {
        console.error('Failed to load modules:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredModules = useMemo(() => {
    return modules.filter((m) => {
      if (courseFilter !== 'ALL' && !m.courseCodes.includes(courseFilter)) {
        return false;
      }
      if (statusFilter !== 'ALL' && m.status !== statusFilter) {
        return false;
      }
      if (stageFilter !== 'ALL' && m.learningStageId !== stageFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = m.title.toLowerCase().includes(q);
        const matchCode = m.code ? m.code.toLowerCase().includes(q) : false;
        const matchDesc = m.description.toLowerCase().includes(q);
        return matchTitle || matchCode || matchDesc;
      }
      return true;
    });
  }, [modules, courseFilter, statusFilter, stageFilter, searchQuery]);

  const getStageTitle = (stageId: string) => {
    const s = stages.find((st) => st.id === stageId);
    return s ? s.title : 'Curriculum Stage';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-10">
      {/* Header Banner */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs font-semibold text-ucr-orange uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5" />
          Academic Syllabus Units
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Academic Modules
        </h1>

        <p className="text-sm sm:text-base text-text-secondary max-w-2xl leading-relaxed">
          Comprehensive curriculum modules spanning studio directing, digital camera operations, lighting setups, non-linear video editing, and sound design.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-6 rounded-3xl bg-surface/80 border border-white/10 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search module title, code, or syllabus topics..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#091728] border border-white/10 text-white placeholder-text-muted text-sm focus:border-ucr-orange focus:ring-1 focus:ring-ucr-orange outline-none"
            />
          </div>

          {/* Course filter select */}
          <div className="md:col-span-2">
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value as any)}
              className="w-full py-2.5 px-3 rounded-xl bg-[#091728] border border-white/10 text-white text-sm focus:border-ucr-orange outline-none"
            >
              <option value="ALL">All Courses</option>
              <option value="TPOPT">TPOPT (Post-Prod)</option>
              <option value="TPRPT">TPRPT (Production)</option>
            </select>
          </div>

          {/* Status filter select */}
          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl bg-[#091728] border border-white/10 text-white text-sm focus:border-ucr-orange outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ongoing">Ongoing</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Learning Stage filter select */}
          <div className="md:col-span-3">
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl bg-[#091728] border border-white/10 text-white text-sm focus:border-ucr-orange outline-none"
            >
              <option value="ALL">All Progression Stages</option>
              {stages.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Counter and clear */}
        <div className="flex items-center justify-between text-xs text-text-muted pt-2 border-t border-white/5">
          <div>
            Showing <strong className="text-white">{filteredModules.length}</strong> modules
          </div>
          {(courseFilter !== 'ALL' || statusFilter !== 'ALL' || stageFilter !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setCourseFilter('ALL');
                setStatusFilter('ALL');
                setStageFilter('ALL');
                setSearchQuery('');
              }}
              className="text-ucr-orange hover:underline"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Modules Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-6 rounded-2xl bg-surface/50 border border-white/5 animate-pulse h-64" />
          ))}
        </div>
      ) : filteredModules.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-surface/40 border border-dashed border-white/15 space-y-4">
          <BookOpen className="w-10 h-10 text-text-muted mx-auto" />
          <h3 className="text-lg font-bold text-white">No modules match your criteria</h3>
          <p className="text-sm text-text-secondary max-w-sm mx-auto">
            Try adjusting your course, stage, or status filters above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((module) => {
            const stageTitle = getStageTitle(module.learningStageId);
            return (
              <div
                key={module.id}
                className="group rounded-2xl overflow-hidden border border-white/10 bg-surface flex flex-col justify-between hover:border-white/25 transition-all duration-300 hover:shadow-card hover:-translate-y-1"
              >
                {/* Thumbnail if provided */}
                {module.thumbnailUrl && (
                  <div className="relative h-44 w-full overflow-hidden">
                    <Image
                      src={module.thumbnailUrl}
                      alt={module.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B2D] via-transparent to-transparent" />
                  </div>
                )}

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Course badges & Status */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {module.courseCodes.map((c) => (
                          <Badge key={c} variant={c === 'TPOPT' ? 'tpopt' : 'tprpt'}>
                            {c}
                          </Badge>
                        ))}
                      </div>
                      <Badge variant={module.status as any}>{module.status}</Badge>
                    </div>

                    <div>
                      {module.code && (
                        <div className="text-[11px] font-mono text-text-muted">{module.code}</div>
                      )}
                      <h3 className="text-lg font-bold text-white group-hover:text-ucr-orange transition-colors">
                        {module.title}
                      </h3>
                    </div>

                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed line-clamp-3">
                      {module.description}
                    </p>
                  </div>

                  {/* Stage and Read Details trigger */}
                  <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs text-text-muted truncate max-w-[170px]" title={stageTitle}>
                      {stageTitle}
                    </span>
                    <button
                      onClick={() => setSelectedModule(module)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-ucr-orange hover:text-white transition-colors"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>Syllabus Details</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Module Details Modal */}
      {selectedModule && (
        <Modal
          isOpen={Boolean(selectedModule)}
          onClose={() => setSelectedModule(null)}
          title={selectedModule.title}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            {selectedModule.thumbnailUrl && (
              <div className="relative h-56 w-full rounded-xl overflow-hidden border border-white/10">
                <Image
                  src={selectedModule.thumbnailUrl}
                  alt={selectedModule.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                {selectedModule.courseCodes.map((c) => (
                  <Badge key={c} variant={c === 'TPOPT' ? 'tpopt' : 'tprpt'} size="md">
                    {c} Pathway
                  </Badge>
                ))}
              </div>
              <Badge variant={selectedModule.status as any} size="md">
                Status: {selectedModule.status}
              </Badge>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Academic Progression Stage
              </h4>
              <p className="text-sm font-medium text-white">
                {getStageTitle(selectedModule.learningStageId)}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Description & Course Content
              </h4>
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {selectedModule.description}
              </p>
            </div>

            {selectedModule.resources && selectedModule.resources.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-white/10">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Attached Learning Resources
                </h4>
                <div className="space-y-2">
                  {selectedModule.resources.map((res, i) => (
                    <a
                      key={i}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl bg-surface-lighter hover:bg-surface-hover border border-white/5 transition-colors text-xs text-slate-200"
                    >
                      <span className="flex items-center gap-2 font-medium">
                        <FileText className="w-4 h-4 text-ucr-orange" />
                        {res.title}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-text-muted" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function ModulesPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto p-12 text-center text-text-muted">Loading academic modules...</div>}>
      <ModulesContent />
    </Suspense>
  );
}
