'use client';

import React from 'react';
import {
  DocumentOptions,
  DocumentFormatType,
  PaperSize,
  Orientation,
} from '@/lib/pdfGenerator';
import {
  FileText,
  Settings2,
  Calendar,
  Image as ImageIcon,
  ArrowDownAZ,
  Columns,
  Grid,
  Maximize2,
  Check,
} from 'lucide-react';

interface DocumentOptionsPanelProps {
  options: DocumentOptions;
  onChange: (updated: Partial<DocumentOptions>) => void;
  onReset: () => void;
}

export default function DocumentOptionsPanel({
  options,
  onChange,
  onReset,
}: DocumentOptionsPanelProps) {
  const handleFormatChange = (fmt: DocumentFormatType) => {
    switch (fmt) {
      case 'simple':
        onChange({
          format: 'simple',
          includeSerialNo: true,
          includeStudentId: false,
          includePhone: true,
          includeCourse: false,
          includeBatch: false,
        });
        break;
      case 'with_id':
        onChange({
          format: 'with_id',
          includeSerialNo: true,
          includeStudentId: true,
          includePhone: true,
          includeCourse: false,
          includeBatch: false,
        });
        break;
      case 'with_course':
        onChange({
          format: 'with_course',
          includeSerialNo: true,
          includeStudentId: false,
          includePhone: true,
          includeCourse: true,
          includeBatch: true,
        });
        break;
      case 'custom':
        onChange({
          format: 'custom',
        });
        break;
    }
  };

  return (
    <div className="bg-[#091728] border border-white/10 rounded-2xl p-4 sm:p-6 space-y-6 shadow-xl">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-500/10 text-uovt-blue">
              <Settings2 className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">2. Document Options</h2>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Customise the printable sheet layout, headers, columns, and handwriting rows.
          </p>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="text-xs text-text-muted hover:text-white transition-colors"
        >
          Reset Defaults
        </button>
      </div>

      {/* 1. Document Format Presets */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center justify-between">
          <span>Preset Format</span>
          <span className="text-[11px] text-text-secondary font-normal lowercase">
            {options.format === 'simple' && 'No. | Name | Tel. No | Blank'}
            {options.format === 'with_id' && 'No. | ID | Name | Tel. No | Blank'}
            {options.format === 'with_course' && 'No. | Name | Course | Batch | Tel. No | Blank'}
            {options.format === 'custom' && 'Configured by column toggles'}
          </span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => handleFormatChange('simple')}
            className={`p-3 rounded-xl border text-left transition-all ${
              options.format === 'simple'
                ? 'bg-ucr-orange/15 border-ucr-orange text-white shadow-sm ring-1 ring-ucr-orange/30'
                : 'bg-surface/60 border-white/5 text-slate-300 hover:bg-white/5'
            }`}
          >
            <div className="text-xs font-bold">Simple List</div>
            <div className="text-[10px] text-text-muted mt-1 leading-tight">
              No. + Name + Tel + Blank
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleFormatChange('with_id')}
            className={`p-3 rounded-xl border text-left transition-all ${
              options.format === 'with_id'
                ? 'bg-ucr-orange/15 border-ucr-orange text-white shadow-sm ring-1 ring-ucr-orange/30'
                : 'bg-surface/60 border-white/5 text-slate-300 hover:bg-white/5'
            }`}
          >
            <div className="text-xs font-bold">With Student ID</div>
            <div className="text-[10px] text-text-muted mt-1 leading-tight">
              Adds Student Index Number
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleFormatChange('with_course')}
            className={`p-3 rounded-xl border text-left transition-all ${
              options.format === 'with_course'
                ? 'bg-ucr-orange/15 border-ucr-orange text-white shadow-sm ring-1 ring-ucr-orange/30'
                : 'bg-surface/60 border-white/5 text-slate-300 hover:bg-white/5'
            }`}
          >
            <div className="text-xs font-bold">Course & Batch</div>
            <div className="text-[10px] text-text-muted mt-1 leading-tight">
              Includes Course & Intake Batch
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleFormatChange('custom')}
            className={`p-3 rounded-xl border text-left transition-all ${
              options.format === 'custom'
                ? 'bg-ucr-orange/15 border-ucr-orange text-white shadow-sm ring-1 ring-ucr-orange/30'
                : 'bg-surface/60 border-white/5 text-slate-300 hover:bg-white/5'
            }`}
          >
            <div className="text-xs font-bold">Custom Format</div>
            <div className="text-[10px] text-text-muted mt-1 leading-tight">
              Select specific columns
            </div>
          </button>
        </div>
      </div>

      {/* Custom Column Toggles (Available in Custom format or as individual toggles) */}
      {options.format === 'custom' && (
        <div className="p-3.5 rounded-xl bg-[#06111F] border border-white/10 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">Custom Column Selection</span>
            <span className="text-[10px] text-text-muted">Empty handwriting column always included</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <label className="flex items-center gap-2 p-2 rounded-lg bg-surface/50 border border-white/5 cursor-pointer hover:bg-white/5">
              <input
                type="checkbox"
                checked={options.includeSerialNo}
                onChange={(e) => onChange({ includeSerialNo: e.target.checked })}
                className="rounded accent-ucr-orange"
              />
              <span className="text-slate-300">Serial No. (No.)</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-lg bg-surface/50 border border-white/5 cursor-pointer hover:bg-white/5">
              <input
                type="checkbox"
                checked={options.includeStudentId}
                onChange={(e) => onChange({ includeStudentId: e.target.checked })}
                className="rounded accent-ucr-orange"
              />
              <span className="text-slate-300">Student ID / Index</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-lg bg-surface/50 border border-white/5 cursor-pointer hover:bg-white/5">
              <input
                type="checkbox"
                checked={options.includeCourse}
                onChange={(e) => onChange({ includeCourse: e.target.checked })}
                className="rounded accent-ucr-orange"
              />
              <span className="text-slate-300">Course Code</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-lg bg-surface/50 border border-white/5 cursor-pointer hover:bg-white/5">
              <input
                type="checkbox"
                checked={options.includeBatch}
                onChange={(e) => onChange({ includeBatch: e.target.checked })}
                className="rounded accent-ucr-orange"
              />
              <span className="text-slate-300">Batch / Semester</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-lg bg-surface/50 border border-white/5 cursor-pointer hover:bg-white/5">
              <input
                type="checkbox"
                checked={options.includePhone}
                onChange={(e) => onChange({ includePhone: e.target.checked })}
                className="rounded accent-ucr-orange"
              />
              <span className="text-slate-300">Telephone No.</span>
            </label>
          </div>
        </div>
      )}

      {/* 2. Header Customization */}
      <div className="space-y-3 pt-2 border-t border-white/10">
        <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Document Header Text
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Headline 1 */}
          <div className="space-y-1">
            <span className="text-[11px] text-text-muted">Sample Headline 1 (Editable)</span>
            <input
              type="text"
              value={options.headline}
              onChange={(e) => onChange({ headline: e.target.value })}
              placeholder="e.g. Attendance Sheet"
              className="w-full bg-[#06111F] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-text-muted focus:border-ucr-orange"
            />
          </div>

          {/* Division Line */}
          <div className="space-y-1">
            <span className="text-[11px] text-text-muted">Division Title</span>
            <input
              type="text"
              value={options.divisionName}
              onChange={(e) => onChange({ divisionName: e.target.value })}
              className="w-full bg-[#06111F] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-ucr-orange"
            />
          </div>

          {/* Institution Line */}
          <div className="space-y-1">
            <span className="text-[11px] text-text-muted">Institution Title</span>
            <input
              type="text"
              value={options.institutionName}
              onChange={(e) => onChange({ institutionName: e.target.value })}
              className="w-full bg-[#06111F] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-ucr-orange"
            />
          </div>
        </div>

        {/* Subtitle & Date Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="space-y-1">
            <span className="text-[11px] text-text-muted">Optional Subtitle</span>
            <input
              type="text"
              value={options.subtitle}
              onChange={(e) => onChange({ subtitle: e.target.value })}
              placeholder="e.g. Batch 11 (2026) — Practical Exam"
              className="w-full bg-[#06111F] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-text-muted focus:border-ucr-orange"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-text-muted">Date Line</span>
              <label className="text-[10px] text-text-muted flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.includeDate}
                  onChange={(e) => onChange({ includeDate: e.target.checked })}
                  className="rounded accent-ucr-orange"
                />
                Show Date
              </label>
            </div>
            <input
              type="text"
              value={options.dateText}
              disabled={!options.includeDate}
              onChange={(e) => onChange({ dateText: e.target.value })}
              className="w-full bg-[#06111F] border border-white/10 rounded-xl px-3 py-2 text-xs text-white disabled:opacity-40 focus:border-ucr-orange"
            />
          </div>
        </div>

        {/* Toggle Logos */}
        <div className="pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
            <input
              type="checkbox"
              checked={options.showLogos}
              onChange={(e) => onChange({ showLogos: e.target.checked })}
              className="rounded accent-ucr-orange"
            />
            <span className="font-medium">Show Official Logos in Document (UCR & UoVT)</span>
          </label>
        </div>
      </div>

      {/* 3. Table & Handwriting Customization */}
      <div className="space-y-3 pt-2 border-t border-white/10">
        <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Print & Handwriting Settings
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Empty Column Header */}
          <div className="space-y-1">
            <span className="text-[11px] text-text-muted">
              Handwriting Column Header
            </span>
            <input
              type="text"
              value={options.emptyColumnTitle}
              onChange={(e) => onChange({ emptyColumnTitle: e.target.value })}
              placeholder="(Blank by default) e.g. Signature"
              className="w-full bg-[#06111F] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-text-muted focus:border-ucr-orange"
            />
          </div>

          {/* Empty Column Width */}
          <div className="space-y-1">
            <span className="text-[11px] text-text-muted">Empty Column Width</span>
            <select
              value={options.emptyColumnWidth}
              onChange={(e) =>
                onChange({
                  emptyColumnWidth: e.target.value as 'normal' | 'wide' | 'extra',
                })
              }
              className="w-full bg-[#06111F] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-ucr-orange"
            >
              <option value="normal">Normal (26mm)</option>
              <option value="wide">Wide (36mm)</option>
              <option value="extra">Extra Wide (46mm)</option>
            </select>
          </div>

          {/* Blank Rows Stepper */}
          <div className="space-y-1">
            <span className="text-[11px] text-text-muted">
              Appended Blank Rows ({options.blankRowsCount})
            </span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="15"
                step="1"
                value={options.blankRowsCount}
                onChange={(e) => onChange({ blankRowsCount: parseInt(e.target.value, 10) })}
                className="w-full accent-ucr-orange cursor-pointer"
              />
              <span className="text-xs font-mono font-bold text-white w-6 text-right">
                {options.blankRowsCount}
              </span>
            </div>
          </div>
        </div>

        {/* Layout & Paper Settings */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
          {/* Paper Size */}
          <div className="space-y-1">
            <span className="text-[11px] text-text-muted">Paper Size</span>
            <div className="flex rounded-lg bg-[#06111F] p-0.5 border border-white/10">
              <button
                type="button"
                onClick={() => onChange({ paperSize: 'a4' })}
                className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${
                  options.paperSize === 'a4' ? 'bg-white/20 text-white' : 'text-text-muted hover:text-white'
                }`}
              >
                A4
              </button>
              <button
                type="button"
                onClick={() => onChange({ paperSize: 'letter' })}
                className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${
                  options.paperSize === 'letter' ? 'bg-white/20 text-white' : 'text-text-muted hover:text-white'
                }`}
              >
                Letter
              </button>
            </div>
          </div>

          {/* Orientation */}
          <div className="space-y-1">
            <span className="text-[11px] text-text-muted">Orientation</span>
            <div className="flex rounded-lg bg-[#06111F] p-0.5 border border-white/10">
              <button
                type="button"
                onClick={() => onChange({ orientation: 'portrait' })}
                className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${
                  options.orientation === 'portrait' ? 'bg-white/20 text-white' : 'text-text-muted hover:text-white'
                }`}
              >
                Portrait
              </button>
              <button
                type="button"
                onClick={() => onChange({ orientation: 'landscape' })}
                className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${
                  options.orientation === 'landscape' ? 'bg-white/20 text-white' : 'text-text-muted hover:text-white'
                }`}
              >
                Landscape
              </button>
            </div>
          </div>

          {/* Sort Alpha */}
          <div className="col-span-2 space-y-1 sm:pt-0 pt-1">
            <span className="text-[11px] text-text-muted">Sorting & Header Repeat</span>
            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.sortAlpha}
                  onChange={(e) => onChange({ sortAlpha: e.target.checked })}
                  className="rounded accent-ucr-orange"
                />
                <span>Sort Name A–Z</span>
              </label>

              <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.repeatHeader}
                  onChange={(e) => onChange({ repeatHeader: e.target.checked })}
                  className="rounded accent-ucr-orange"
                />
                <span>Repeat Headers</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
