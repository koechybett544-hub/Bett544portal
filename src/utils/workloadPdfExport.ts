import jsPDF from 'jspdf';
import { UserProfile } from '../types';
import { SCHOOL_INFO, SUBJECTS } from '../data/initialData';
import { savePdfToDevice } from './pdfExport';

export interface TeacherWorkloadRow {
  teacher: UserProfile;
  g7Subjects: string[];
  g8Subjects: string[];
  g9Subjects: string[];
  weeklyLessons: number;
}

export interface UnallocatedSubjectsReport {
  grade7Unallocated: string[];
  grade8Unallocated: string[];
  grade9Unallocated: string[];
  totalUnallocated: number;
}

export function buildTeacherWorkloadPdfDoc(
  rows: TeacherWorkloadRow[],
  unallocated: UnallocatedSubjectsReport
): jsPDF {
  // A4 Landscape: 297mm x 210mm for clean horizontal register presentation
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidth = 297;
  const pageHeight = 210;
  const margin = 12;
  const contentWidth = pageWidth - margin * 2; // 273mm

  // Outer double border
  doc.setDrawColor(107, 20, 38); // #6b1426
  doc.setLineWidth(0.8);
  doc.rect(margin - 2, margin - 2, contentWidth + 4, pageHeight - margin * 2 + 4);

  doc.setDrawColor(217, 119, 6); // Amber #d97706
  doc.setLineWidth(0.3);
  doc.rect(margin - 0.8, margin - 0.8, contentWidth + 1.6, pageHeight - margin * 2 + 1.6);

  // Top Header Banner
  doc.setFillColor(107, 20, 38);
  doc.roundedRect(margin, margin, contentWidth, 22, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(SCHOOL_INFO.name, pageWidth / 2, margin + 6.5, { align: 'center' });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(254, 215, 170);
  doc.text(`"${SCHOOL_INFO.motto}" • ${SCHOOL_INFO.postalAddress}`, pageWidth / 2, margin + 11.5, {
    align: 'center',
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(
    'FACULTY SUBJECT ALLOCATION & WEEKLY LESSON WORKLOAD REGISTER (CBC JSS)',
    pageWidth / 2,
    margin + 17.5,
    { align: 'center' }
  );

  // Metadata Bar
  let currentY = margin + 25;
  doc.setFillColor(245, 245, 244);
  doc.setDrawColor(214, 211, 209);
  doc.setLineWidth(0.3);
  doc.rect(margin, currentY, contentWidth, 7, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(68, 64, 60);
  doc.text(`ACADEMIC YEAR: 2026 | TERM: Term 3`, margin + 4, currentY + 4.8);
  doc.text(
    `CURRICULUM: Kenyan CBC (9 Learning Areas per Grade: G7, G8, G9)`,
    pageWidth / 2,
    currentY + 4.8,
    { align: 'center' }
  );
  doc.text(`DATE ISSUED: ${new Date().toLocaleDateString('en-GB')}`, margin + contentWidth - 4, currentY + 4.8, {
    align: 'right',
  });

  // Unallocated Subjects Banner / Audit
  currentY += 9;
  if (unallocated.totalUnallocated > 0) {
    doc.setFillColor(254, 242, 242); // Red/Rose-50
    doc.setDrawColor(239, 68, 68);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, currentY, contentWidth, 10, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(185, 28, 28);
    doc.text(
      `ATTENTION: ${unallocated.totalUnallocated} SUBJECT(S) CURRENTLY WITHOUT AN ASSIGNED TEACHER!`,
      margin + 4,
      currentY + 4.2
    );

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(127, 29, 29);
    const g7Note = unallocated.grade7Unallocated.length > 0 ? `Grade 7: ${unallocated.grade7Unallocated.join(', ')}` : '';
    const g8Note = unallocated.grade8Unallocated.length > 0 ? `Grade 8: ${unallocated.grade8Unallocated.join(', ')}` : '';
    const g9Note = unallocated.grade9Unallocated.length > 0 ? `Grade 9: ${unallocated.grade9Unallocated.join(', ')}` : '';
    const notes = [g7Note, g8Note, g9Note].filter(Boolean).join(' | ');
    doc.text(notes, margin + 4, currentY + 8);
    currentY += 12;
  } else {
    doc.setFillColor(240, 253, 244); // Green-50
    doc.setDrawColor(34, 197, 94);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, currentY, contentWidth, 7, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(21, 128, 61);
    doc.text(
      '✓ ALL 9 CBC SUBJECTS FULLY ALLOCATED ACROSS GRADE 7, GRADE 8, AND GRADE 9 (Zero Vacancies)',
      margin + 4,
      currentY + 4.8
    );
    currentY += 9;
  }

  // Workload Table Header
  const colWidths = {
    index: 8,
    name: 48,
    tsc: 24,
    g7: 58,
    g8: 58,
    g9: 58,
    total: 19,
  };

  doc.setFillColor(107, 20, 38);
  doc.setDrawColor(107, 20, 38);
  doc.rect(margin, currentY, contentWidth, 7.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);

  let x = margin;
  doc.text('#', x + colWidths.index / 2, currentY + 5, { align: 'center' });
  x += colWidths.index;

  doc.text('TEACHER NAME & TITLE', x + 2, currentY + 5);
  x += colWidths.name;

  doc.text('TSC NO.', x + colWidths.tsc / 2, currentY + 5, { align: 'center' });
  x += colWidths.tsc;

  doc.text('GRADE 7 SUBJECTS', x + 2, currentY + 5);
  x += colWidths.g7;

  doc.text('GRADE 8 SUBJECTS', x + 2, currentY + 5);
  x += colWidths.g8;

  doc.text('GRADE 9 SUBJECTS', x + 2, currentY + 5);
  x += colWidths.g9;

  doc.text('LESSONS/WK', x + colWidths.total / 2, currentY + 5, { align: 'center' });

  currentY += 7.5;

  // Table Rows
  const rowHeight = 8.5;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const isAlt = i % 2 === 1;

    doc.setFillColor(isAlt ? 250 : 255, isAlt ? 250 : 255, isAlt ? 250 : 255);
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.2);
    doc.rect(margin, currentY, contentWidth, rowHeight, 'FD');

    x = margin;
    // Index
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 100, 100);
    doc.text(`${i + 1}`, x + colWidths.index / 2, currentY + 5.5, { align: 'center' });
    x += colWidths.index;

    // Teacher Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 30, 30);
    const nameText = r.teacher.name.length > 25 ? r.teacher.name.substring(0, 24) + '...' : r.teacher.name;
    doc.text(nameText, x + 2, currentY + 4.2);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(120, 120, 120);
    doc.text(r.teacher.designation || 'Faculty Member', x + 2, currentY + 7.2);
    x += colWidths.name;

    // TSC
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(70, 70, 70);
    doc.text(r.teacher.tscNumber || 'TSC/REG', x + colWidths.tsc / 2, currentY + 5.5, { align: 'center' });
    x += colWidths.tsc;

    // G7
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(40, 40, 40);
    const g7Text = r.g7Subjects.length > 0 ? r.g7Subjects.join(', ') : '—';
    const g7Trunc = g7Text.length > 38 ? g7Text.substring(0, 37) + '...' : g7Text;
    doc.text(g7Trunc, x + 2, currentY + 5.5);
    x += colWidths.g7;

    // G8
    const g8Text = r.g8Subjects.length > 0 ? r.g8Subjects.join(', ') : '—';
    const g8Trunc = g8Text.length > 38 ? g8Text.substring(0, 37) + '...' : g8Text;
    doc.text(g8Trunc, x + 2, currentY + 5.5);
    x += colWidths.g8;

    // G9
    const g9Text = r.g9Subjects.length > 0 ? r.g9Subjects.join(', ') : '—';
    const g9Trunc = g9Text.length > 38 ? g9Text.substring(0, 37) + '...' : g9Text;
    doc.text(g9Trunc, x + 2, currentY + 5.5);
    x += colWidths.g9;

    // Total Lessons
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    const loadColor = r.weeklyLessons > 28 ? [185, 28, 28] : r.weeklyLessons >= 18 ? [21, 128, 61] : [180, 83, 9];
    doc.setTextColor(loadColor[0], loadColor[1], loadColor[2]);
    doc.text(`${r.weeklyLessons}`, x + colWidths.total / 2, currentY + 5.5, { align: 'center' });

    currentY += rowHeight;
    if (currentY > pageHeight - 35) break; // Keep space for footer & signatures
  }

  // Signatures & Official Approvals Footer
  const sigY = pageHeight - margin - 15;
  doc.setDrawColor(214, 211, 209);
  doc.setLineWidth(0.4);
  doc.line(margin, sigY - 2, margin + contentWidth, sigY - 2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(60, 60, 60);

  // Head Teacher Signature Box
  doc.text('Prepared & Approved By:', margin + 4, sigY + 3);
  doc.setFont('helvetica', 'normal');
  doc.text('Head Teacher: MR Brian Bett (B.Ed, Dip. Mgt)', margin + 4, sigY + 7);
  doc.text('Signature: __________________________  Date: ____________', margin + 4, sigY + 11.5);

  // Senior Teacher / Timetable Master Signature Box
  doc.setFont('helvetica', 'bold');
  doc.text('Verified by Director of Studies / Timetable Master:', margin + 140, sigY + 3);
  doc.setFont('helvetica', 'normal');
  doc.text('Timetable Committee Chair: Mr Bore N. (TSC/683104)', margin + 140, sigY + 7);
  doc.text('Signature: __________________________  Date: ____________', margin + 140, sigY + 11.5);

  return doc;
}

export function getTeacherWorkloadPdfDataUri(
  rows: TeacherWorkloadRow[],
  unallocated: UnallocatedSubjectsReport
): string {
  const doc = buildTeacherWorkloadPdfDoc(rows, unallocated);
  return doc.output('datauristring');
}

export async function generateTeacherWorkloadPdf(
  rows: TeacherWorkloadRow[],
  unallocated: UnallocatedSubjectsReport,
  onFeedback?: (msg: string, isError?: boolean) => void
): Promise<{ success: boolean; message: string }> {
  try {
    const doc = buildTeacherWorkloadPdfDoc(rows, unallocated);
    const filename = `Reberwet_JSS_Teacher_Subject_Allocation_Register_2026.pdf`;
    return await savePdfToDevice(doc, filename, onFeedback);
  } catch (err: any) {
    console.error('Error generating Teacher Workload PDF:', err);
    const msg = `Failed to generate workload register PDF: ${err?.message || 'Unknown error'}`;
    onFeedback?.(msg, true);
    return { success: false, message: msg };
  }
}
