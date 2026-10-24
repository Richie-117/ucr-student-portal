'use client';

import React, { useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import { Student } from '@/lib/types';
import {
  DocumentOptions,
  CourseMode,
  getActiveColumns,
  sortStudentsList,
  downloadPdfDocument,
} from '@/lib/pdfGenerator';
import {
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Maximize2,
  Layers,
} from 'lucide-react';

interface LiveDocumentPreviewProps {
  students: Student[];
  options: DocumentOptions;
  courseMode: CourseMode;
  effectiveOutputCount: number;
}

export default function LiveDocumentPreview({
  students,
  options,
  courseMode,
  effectiveOutputCount,
}: LiveDocumentPreviewProps) {
  const [zoom, setZoom] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'paginated' | 'all'>('paginated');
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const previewSheetRef = useRef<HTMLDivElement>(null);

  // Active columns & sorted students
  const activeCols = useMemo(() => getActiveColumns(options), [options]);
  const sortedStudents = useMemo(
    () => sortStudentsList(students, options.sortAlpha),
    [students, options.sortAlpha]
  );

  // Combine real students + blank rows
  const allRows = useMemo(() => {
    const rows: { isBlank: boolean; student?: Student; rowNumber: number }[] = [];
    sortedStudents.forEach((student, i) => {
      rows.push({ isBlank: false, student, rowNumber: i + 1 });
    });
    for (let b = 0; b < options.blankRowsCount; b++) {
      rows.push({ isBlank: true, rowNumber: sortedStudents.length + b + 1 });
    }
    return rows;
  }, [sortedStudents, options.blankRowsCount]);

  // Pagination calculation
  // Portrait: ~20 rows on page 1 (header takes space), ~28 on subsequent pages
  // Landscape: ~12 rows on page 1, ~18 on subsequent pages
  const isLandscape = options.orientation === 'landscape';
  const page1Capacity = isLandscape ? 12 : 22;
  const subsequentCapacity = isLandscape ? 18 : 28;

  const pages = useMemo(() => {
    if (allRows.length === 0) return [[]];
    const result: typeof allRows[] = [];
    let remaining = [...allRows];

    // Page 1
    const firstChunk = remaining.splice(0, page1Capacity);
    result.push(firstChunk);

    // Remaining pages
    while (remaining.length > 0) {
      result.push(remaining.splice(0, subsequentCapacity));
    }
    return result;
  }, [allRows, page1Capacity, subsequentCapacity]);

  const totalPages = Math.max(1, pages.length);

  // Adjust current page if out of bounds
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Handle PDF generation
  const handleGeneratePdf = async () => {
    if (effectiveOutputCount === 0 && options.blankRowsCount === 0) {
      setToastMessage({
        type: 'error',
        text: 'Please select at least one student or add blank handwriting rows.',
      });
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }

    try {
      setGeneratingPdf(true);
      await downloadPdfDocument(students, options, courseMode);
      setToastMessage({
        type: 'success',
        text: 'PDF generated and downloaded successfully!',
      });
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      console.error('PDF Generation Error:', err);
      setToastMessage({
        type: 'error',
        text: err?.message || 'Failed to generate PDF document. Please try again.',
      });
      setTimeout(() => setToastMessage(null), 5000);
    } finally {
      setGeneratingPdf(false);
    }
  };

  // Handle Browser Print
  const handlePrint = () => {
    if (effectiveOutputCount === 0 && options.blankRowsCount === 0) {
      setToastMessage({
        type: 'error',
        text: 'Cannot print an empty document. Select students first.',
      });
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }
    window.print();
  };

  // Zoom helpers
  const handleZoomIn = () => setZoom((z) => Math.min(130, z + 15));
  const handleZoomOut = () => setZoom((z) => Math.max(65, z - 15));
  const handleZoomReset = () => setZoom(100);

  return (
    <div className="bg-[#091728] border border-white/10 rounded-2xl p-4 sm:p-6 space-y-4 shadow-xl flex flex-col h-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl text-xs font-medium animate-fadeIn ${
            toastMessage.type === 'success'
              ? 'bg-emerald-600 text-white border border-emerald-400'
              : 'bg-red-600 text-white border border-red-400'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-200" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-200" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-orange-500/10 text-ucr-orange">
              <FileText className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">Live Document Preview</h2>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Exact paper simulation of the export. Updates in real-time.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            disabled={effectiveOutputCount === 0 && options.blankRowsCount === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-surface-lighter hover:bg-white/15 border border-white/15 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shadow-sm"
            title="Open browser print dialogue"
          >
            <Printer className="w-3.5 h-3.5 text-text-secondary" />
            <span>Preview / Print</span>
          </button>

          {/* Download PDF Button */}
          <button
            type="button"
            onClick={handleGeneratePdf}
            disabled={generatingPdf || (effectiveOutputCount === 0 && options.blankRowsCount === 0)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-ucr-orange hover:bg-ucr-orange-hover border border-orange-400/40 shadow-orange-glow transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            title="Download formatted PDF file"
          >
            {generatingPdf ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{generatingPdf ? 'Generating...' : 'Generate PDF'}</span>
          </button>
        </div>
      </div>

      {/* Preview Toolbar (Zoom & Page Navigator) */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-[#06111F] rounded-xl border border-white/10 text-xs">
        {/* Pagination Navigator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg bg-surface/70 border border-white/10 p-0.5">
            <button
              type="button"
              disabled={viewMode === 'all' || currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded text-text-secondary hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2.5 text-[11px] font-medium text-slate-300">
              {viewMode === 'all' ? (
                `All ${totalPages} Pages`
              ) : (
                <>
                  Page <strong className="text-white">{currentPage}</strong> of{' '}
                  <strong className="text-white">{totalPages}</strong>
                </>
              )}
            </span>
            <button
              type="button"
              disabled={viewMode === 'all' || currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 rounded text-text-secondary hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Toggle Continuous View */}
          <button
            type="button"
            onClick={() => setViewMode((m) => (m === 'paginated' ? 'all' : 'paginated'))}
            className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] border transition-all ${
              viewMode === 'all'
                ? 'bg-white/15 border-white/30 text-white'
                : 'bg-surface/50 border-white/5 text-text-muted hover:text-slate-300'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>{viewMode === 'all' ? 'Single Page View' : 'Show All Pages'}</span>
          </button>
        </div>

        {/* Paper Info & Zoom controls */}
        <div className="flex items-center gap-2">
          <span className="hidden md:inline-block text-[11px] text-text-muted">
            {options.paperSize.toUpperCase()} {options.orientation}
          </span>

          <div className="flex items-center rounded-lg bg-surface/70 border border-white/10 p-0.5">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1 rounded text-text-secondary hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleZoomReset}
              className="px-2 text-[10px] font-mono text-slate-300 hover:text-white"
              title="Reset Zoom to 100%"
            >
              {zoom}%
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1 rounded text-text-secondary hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="flex-1 min-h-[460px] bg-[#030914] rounded-xl border border-white/10 overflow-auto p-4 sm:p-6 flex justify-center items-start">
        {effectiveOutputCount === 0 && options.blankRowsCount === 0 ? (
          /* Friendly Empty State */
          <div className="my-auto text-center space-y-3 py-16 px-4 max-w-sm">
            <div className="w-14 h-14 rounded-2xl bg-surface-lighter flex items-center justify-center mx-auto border border-white/10 text-text-muted">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white">No Students Selected</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Select a course mode (All, TPOPT, TPRPT) or check individual students in Custom mode to render the official printable sheet.
            </p>
          </div>
        ) : (
          /* Rendered Paper Sheet */
          <div
            id="printable-document"
            ref={previewSheetRef}
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
            }}
            className="space-y-8 select-none"
          >
            {/* Render pages */}
            {(viewMode === 'all' ? pages : [pages[currentPage - 1] || []]).map(
              (pageRows, pageIdx) => {
                const actualPageNumber = viewMode === 'all' ? pageIdx + 1 : currentPage;
                const isFirstPage = actualPageNumber === 1;

                return (
                  <div
                    key={actualPageNumber}
                    className={`bg-white text-slate-900 shadow-2xl rounded-sm p-6 sm:p-8 flex flex-col justify-between transition-all ${
                      isLandscape
                        ? 'w-[780px] min-h-[550px]'
                        : 'w-[595px] min-h-[820px]'
                    }`}
                    style={{
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      border: '1px solid #cbd5e1',
                    }}
                  >
                    {/* Top Content: Header & Table */}
                    <div>
                      {/* Institutional Header (Shown on page 1, or repeated if repeatHeader) */}
                      {(isFirstPage || options.repeatHeader) && (
                        <div className="pb-4 mb-4 border-b border-slate-300">
                          <div className="flex items-center justify-between gap-4">
                            {/* Left Logo: UCR */}
                            <div className="w-24 h-10 relative flex items-center shrink-0">
                              {options.showLogos && (
                                <Image
                                  src="/images/ucr.png"
                                  alt="UCR Logo"
                                  width={100}
                                  height={36}
                                  className="object-contain h-9 w-auto"
                                  priority
                                />
                              )}
                            </div>

                            {/* Center Heading */}
                            <div className="text-center flex-1">
                              <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-tight uppercase">
                                {options.headline.trim() || 'Student List'}
                              </h1>
                              <p className="text-xs font-bold text-slate-800 leading-tight mt-0.5">
                                {options.divisionName}
                              </p>
                              <p className="text-[11px] text-slate-600 leading-tight">
                                {options.institutionName}
                              </p>
                              {options.subtitle && (
                                <p className="text-[10px] italic text-slate-500 mt-1">
                                  {options.subtitle}
                                </p>
                              )}
                            </div>

                            {/* Right Logo: UoVT */}
                            <div className="w-24 h-10 relative flex items-center justify-end shrink-0">
                              {options.showLogos && (
                                <Image
                                  src="/images/uovt.png"
                                  alt="UoVT Logo"
                                  width={85}
                                  height={32}
                                  className="object-contain h-8 w-auto"
                                  priority
                                />
                              )}
                            </div>
                          </div>

                          {/* Date and scope bar */}
                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-200 mt-2">
                            <span>
                              {courseMode === 'TPOPT'
                                ? 'Course: TPOPT (Post Production)'
                                : courseMode === 'TPRPT'
                                ? 'Course: TPRPT (Production Technology)'
                                : courseMode === 'CUSTOM'
                                ? `Custom Selection (${students.length} students)`
                                : 'All Courses (TPOPT & TPRPT)'}
                            </span>
                            {options.includeDate && options.dateText && (
                              <span>Date: {options.dateText}</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Printable Table */}
                      <div className="w-full overflow-hidden border border-slate-700">
                        <table className="w-full text-[10.5px] border-collapse">
                          {/* Table Header */}
                          <thead>
                            <tr className="bg-slate-100 border-b border-slate-700">
                              {activeCols.map((col) => {
                                const isCenter = col.align === 'center';
                                const isRight = col.align === 'right';
                                return (
                                  <th
                                    key={col.id}
                                    style={col.width ? { width: `${col.width * 2.8}px` } : undefined}
                                    className={`py-1.5 px-2 font-bold text-slate-900 border-r border-slate-700 last:border-r-0 ${
                                      isCenter
                                        ? 'text-center'
                                        : isRight
                                        ? 'text-right'
                                        : 'text-left'
                                    }`}
                                  >
                                    {col.header}
                                  </th>
                                );
                              })}
                            </tr>
                          </thead>

                          {/* Table Body */}
                          <tbody>
                            {pageRows.map((rowItem, rIdx) => {
                              const isEven = rIdx % 2 === 1;

                              if (rowItem.isBlank) {
                                // Appended blank handwriting row
                                return (
                                  <tr
                                    key={`blank-${rowItem.rowNumber}`}
                                    className={`border-b border-slate-400 h-7 ${
                                      isEven ? 'bg-slate-50/50' : 'bg-white'
                                    }`}
                                  >
                                    {activeCols.map((col) => {
                                      if (col.id === 'no') {
                                        return (
                                          <td
                                            key={col.id}
                                            className="py-1 px-2 text-center text-slate-500 font-mono text-[9.5px] border-r border-slate-400"
                                          >
                                            {rowItem.rowNumber}
                                          </td>
                                        );
                                      }
                                      return (
                                        <td
                                          key={col.id}
                                          className="py-1 px-2 border-r border-slate-400 last:border-r-0"
                                        >
                                          &nbsp;
                                        </td>
                                      );
                                    })}
                                  </tr>
                                );
                              }

                              const student = rowItem.student!;
                              return (
                                <tr
                                  key={student.id}
                                  className={`border-b border-slate-400 ${
                                    isEven ? 'bg-slate-50/60' : 'bg-white'
                                  }`}
                                >
                                  {activeCols.map((col) => {
                                    const value = col.getValue(student, rowItem.rowNumber - 1);
                                    const isCenter = col.align === 'center';
                                    const isRight = col.align === 'right';

                                    return (
                                      <td
                                        key={col.id}
                                        className={`py-1.5 px-2 border-r border-slate-400 last:border-r-0 leading-tight ${
                                          isCenter
                                            ? 'text-center'
                                            : isRight
                                            ? 'text-right'
                                            : 'text-left'
                                        }`}
                                      >
                                        {col.id === 'no' ? (
                                          <span className="font-mono text-slate-700 text-[10px]">
                                            {value}
                                          </span>
                                        ) : col.id === 'studentNumber' ? (
                                          <span className="font-mono text-slate-700 text-[10px]">
                                            {value}
                                          </span>
                                        ) : col.id === 'name' ? (
                                          <span className="font-medium text-slate-900">
                                            {value}
                                          </span>
                                        ) : col.id === 'course' ? (
                                          <span className="font-semibold text-slate-800">
                                            {value}
                                          </span>
                                        ) : col.id === 'phone' ? (
                                          <span className="font-mono text-slate-700 text-[10px]">
                                            {value || ''}
                                          </span>
                                        ) : (
                                          value
                                        )}
                                      </td>
                                    );
                                  })}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Page Footer */}
                    <div className="pt-4 mt-6 border-t border-slate-300 flex items-center justify-between text-[9px] text-slate-500">
                      <span>
                        Division of Television Studies — University College of Rathmalana | Affiliated with UoVT
                      </span>
                      <span>
                        Page {actualPageNumber} of {totalPages}
                      </span>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>

      {/* Media Print Style Tag for Clean Browser Printing */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-document,
          #printable-document * {
            visibility: visible !important;
          }
          #printable-document {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            transform: none !important;
          }
          @page {
            margin: 10mm;
            size: ${options.paperSize} ${options.orientation};
          }
        }
      `}</style>
    </div>
  );
}
