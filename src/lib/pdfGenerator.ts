import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Student } from './types';

export type CourseMode = 'ALL' | 'TPOPT' | 'TPRPT' | 'CUSTOM';
export type DocumentFormatType = 'simple' | 'with_id' | 'with_course' | 'custom';
export type PaperSize = 'a4' | 'letter';
export type Orientation = 'portrait' | 'landscape';

export interface DocumentOptions {
  format: DocumentFormatType;
  headline: string;
  divisionName: string;
  institutionName: string;
  subtitle: string;
  includeDate: boolean;
  dateText: string;
  showLogos: boolean;

  // Column toggles
  includeSerialNo: boolean;
  includeStudentId: boolean;
  includePhone: boolean;
  includeCourse: boolean;
  includeBatch: boolean;
  emptyColumnTitle: string;
  emptyColumnWidth: 'normal' | 'wide' | 'extra';

  // Table options
  sortAlpha: boolean;
  blankRowsCount: number;
  repeatHeader: boolean;
  paperSize: PaperSize;
  orientation: Orientation;
}

export const DEFAULT_DOCUMENT_OPTIONS: DocumentOptions = {
  format: 'simple',
  headline: 'Sample headline 1',
  divisionName: 'Division of Television Studies',
  institutionName: 'University College of Rathmalana',
  subtitle: '',
  includeDate: true,
  dateText: new Date().toISOString().split('T')[0],
  showLogos: true,

  includeSerialNo: true,
  includeStudentId: false,
  includePhone: true,
  includeCourse: false,
  includeBatch: false,
  emptyColumnTitle: '',
  emptyColumnWidth: 'normal',

  sortAlpha: true,
  blankRowsCount: 5,
  repeatHeader: true,
  paperSize: 'a4',
  orientation: 'portrait',
};

/**
 * Loads an image from URL and converts to base64 Data URL
 */
export async function loadImageAsBase64(url: string): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn(`Could not load image as base64 from ${url}:`, err);
    return null;
  }
}

export interface PreparedColumn {
  id: string;
  header: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  getValue: (s: Student, index: number) => string;
}

export function getActiveColumns(options: DocumentOptions): PreparedColumn[] {
  const cols: PreparedColumn[] = [];

  // 1. Serial No
  if (options.includeSerialNo) {
    cols.push({
      id: 'no',
      header: 'No.',
      width: 14,
      align: 'center',
      getValue: (_, index) => (index + 1).toString(),
    });
  }

  // 2. Student ID (based on format or custom toggle)
  const shouldIncludeId =
    options.format === 'with_id' ||
    (options.format === 'custom' && options.includeStudentId);

  if (shouldIncludeId) {
    cols.push({
      id: 'studentNumber',
      header: 'Student ID',
      width: 38,
      align: 'left',
      getValue: (s) => s.studentNumber || '',
    });
  }

  // 3. Name (Always included)
  cols.push({
    id: 'name',
    header: 'Name',
    align: 'left',
    getValue: (s) => s.fullName || '',
  });

  // 4. Course (based on format or custom toggle)
  const shouldIncludeCourse =
    options.format === 'with_course' ||
    (options.format === 'custom' && options.includeCourse);

  if (shouldIncludeCourse) {
    cols.push({
      id: 'course',
      header: 'Course',
      width: 24,
      align: 'center',
      getValue: (s) => s.course || '',
    });
  }

  // 5. Batch / Semester (based on format or custom toggle)
  const shouldIncludeBatch =
    options.format === 'with_course' ||
    (options.format === 'custom' && options.includeBatch);

  if (shouldIncludeBatch) {
    cols.push({
      id: 'batch',
      header: 'Batch',
      width: 32,
      align: 'left',
      getValue: (s) => s.batch || '',
    });
  }

  // 6. Telephone No
  const shouldIncludePhone =
    options.format === 'simple' ||
    options.format === 'with_id' ||
    options.format === 'with_course' ||
    (options.format === 'custom' && options.includePhone);

  if (shouldIncludePhone) {
    cols.push({
      id: 'phone',
      header: 'Tel. No',
      width: 34,
      align: 'left',
      getValue: (s) => s.phoneNumber || '',
    });
  }

  // 7. Configurable Empty Handwriting Column (Always present as per spec)
  const emptyWidth =
    options.emptyColumnWidth === 'extra'
      ? 46
      : options.emptyColumnWidth === 'wide'
      ? 36
      : 26;

  cols.push({
    id: 'empty',
    header: options.emptyColumnTitle || ' ',
    width: emptyWidth,
    align: 'center',
    getValue: () => '',
  });

  return cols;
}

export function sortStudentsList(students: Student[], sortAlpha: boolean): Student[] {
  const copy = [...students];
  if (sortAlpha) {
    return copy.sort((a, b) => a.fullName.localeCompare(b.fullName));
  }
  return copy.sort((a, b) => (a.studentNumber || '').localeCompare(b.studentNumber || ''));
}

export function getDocumentFilename(mode: CourseMode, dateStr: string): string {
  const cleanDate = dateStr.replace(/[^0-9-]/g, '') || new Date().toISOString().split('T')[0];
  switch (mode) {
    case 'TPOPT':
      return `TPOPT_student_list_${cleanDate}.pdf`;
    case 'TPRPT':
      return `TPRPT_student_list_${cleanDate}.pdf`;
    case 'CUSTOM':
      return `custom_student_list_${cleanDate}.pdf`;
    case 'ALL':
    default:
      return `television_studies_student_list_${cleanDate}.pdf`;
  }
}

/**
 * Generates a jsPDF instance configured with all headers, logos, and autoTable content
 */
export async function buildPdfDocument(
  students: Student[],
  options: DocumentOptions,
  mode: CourseMode = 'ALL'
): Promise<jsPDF> {
  const orientation = options.orientation;
  const format = options.paperSize === 'letter' ? 'letter' : 'a4';

  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // 1. Load Logos if enabled
  let ucrBase64: string | null = null;
  let uovtBase64: string | null = null;

  if (options.showLogos) {
    [ucrBase64, uovtBase64] = await Promise.all([
      loadImageAsBase64('/images/ucr.png'),
      loadImageAsBase64('/images/uovt.png'),
    ]);
  }

  // Draw header function
  let currentY = margin;

  // Draw logos
  const logoHeight = 12;
  if (options.showLogos) {
    if (ucrBase64) {
      try {
        doc.addImage(ucrBase64, 'PNG', margin, currentY, 32, logoHeight);
      } catch (e) {
        console.warn('Failed to embed UCR logo:', e);
      }
    }
    if (uovtBase64) {
      try {
        doc.addImage(uovtBase64, 'PNG', pageWidth - margin - 26, currentY, 26, logoHeight);
      } catch (e) {
        console.warn('Failed to embed UoVT logo:', e);
      }
    }
  }

  // Headline 1 (Centered, Bold, 13pt)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(20, 20, 20);
  const headline = options.headline.trim() || 'Student List';
  doc.text(headline, pageWidth / 2, currentY + 3, { align: 'center' });

  // Division of Television Studies (Centered, Bold, 11pt)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text(options.divisionName || 'Division of Television Studies', pageWidth / 2, currentY + 8, {
    align: 'center',
  });

  // University College of Rathmalana (Centered, Normal, 10pt)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text(options.institutionName || 'University College of Rathmalana', pageWidth / 2, currentY + 13, {
    align: 'center',
  });

  currentY += 16;

  // Subtitle if provided
  if (options.subtitle.trim()) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(options.subtitle.trim(), pageWidth / 2, currentY, { align: 'center' });
    currentY += 4.5;
  }

  // Date and meta bar
  if (options.includeDate && options.dateText.trim()) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Date: ${options.dateText.trim()}`, pageWidth - margin, currentY, { align: 'right' });
    
    // Left side: Course/filter summary
    const modeLabel =
      mode === 'TPOPT'
        ? 'Course: TPOPT (Post Production)'
        : mode === 'TPRPT'
        ? 'Course: TPRPT (Production Technology)'
        : mode === 'CUSTOM'
        ? `Custom Selection (${students.length} Students)`
        : 'All Students (TPOPT & TPRPT)';
    doc.text(modeLabel, margin, currentY, { align: 'left' });
    currentY += 3.5;
  }

  // Subtle separator line
  doc.setDrawColor(200, 210, 220);
  doc.setLineWidth(0.3);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 3;

  // 2. Prepare columns and data
  const sorted = sortStudentsList(students, options.sortAlpha);
  const activeCols = getActiveColumns(options);

  const head = [activeCols.map((c) => c.header)];
  const body: string[][] = [];

  // Actual student rows
  sorted.forEach((student, index) => {
    const row = activeCols.map((col) => col.getValue(student, index));
    body.push(row);
  });

  // Appended blank handwriting rows
  const blankRows = Math.max(0, Math.min(25, options.blankRowsCount || 0));
  for (let b = 0; b < blankRows; b++) {
    const rowNumber = (sorted.length + b + 1).toString();
    const blankRow = activeCols.map((col) => {
      if (col.id === 'no') return rowNumber;
      return '';
    });
    body.push(blankRow);
  }

  // Column styles mapping
  const columnStylesConfig: { [key: number]: any } = {};
  activeCols.forEach((col, idx) => {
    const cfg: any = { halign: col.align || 'left' };
    if (col.width) {
      cfg.cellWidth = col.width;
    }
    columnStylesConfig[idx] = cfg;
  });

  // 3. Render autoTable
  autoTable(doc, {
    head,
    body,
    startY: currentY,
    margin: { top: margin, bottom: margin + 6, left: margin, right: margin },
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 8.5,
      textColor: [15, 23, 42],
      lineColor: [80, 90, 100],
      lineWidth: 0.2,
      cellPadding: { top: 3.5, bottom: 3.5, left: 2.5, right: 2.5 },
      minCellHeight: 8,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      lineColor: [40, 50, 60],
      lineWidth: 0.35,
    },
    columnStyles: columnStylesConfig,
    showHead: options.repeatHeader ? 'everyPage' : 'firstPage',
    didDrawPage: (data) => {
      // Footer page numbering and official attribution
      const str = `Page ${data.pageNumber}`;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(140, 150, 160);
      doc.text(
        'Division of Television Studies — University College of Rathmalana | Affiliated with UoVT',
        margin,
        pageHeight - 8
      );
      doc.text(str, pageWidth - margin, pageHeight - 8, { align: 'right' });
    },
  });

  return doc;
}

/**
 * High-level trigger to download the PDF file
 */
export async function downloadPdfDocument(
  students: Student[],
  options: DocumentOptions,
  mode: CourseMode = 'ALL'
): Promise<void> {
  if (students.length === 0 && options.blankRowsCount === 0) {
    throw new Error('No students selected to generate document.');
  }

  const doc = await buildPdfDocument(students, options, mode);
  const filename = getDocumentFilename(mode, options.dateText);
  doc.save(filename);
}
