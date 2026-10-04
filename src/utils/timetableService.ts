import jsPDF from 'jspdf';
import {
  TimetableDay,
  TimetableLesson,
  TimetablePeriodDef,
  TimetableData,
  UserProfile,
} from '../types';
import { savePdfToDevice } from './pdfExport';
import { SCHOOL_INFO, CLASS_TEACHERS } from '../data/initialData';

export const TIMETABLE_DAYS: TimetableDay[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
];

export const TIMETABLE_GRADES = ['Grade 7', 'Grade 8', 'Grade 9'] as const;

export const CBC_SUBJECTS = [
  'Mathematics',
  'English',
  'Kiswahili',
  'Integrated Science',
  'Social Studies',
  'CRE',
  'Agriculture',
  'Pre-Technical',
  'Creative Arts and Sports',
] as const;

export const PERIODS_CONFIG: TimetablePeriodDef[] = [
  {
    periodNumber: 1,
    label: 'Period 1',
    startTime: '8:00',
    endTime: '8:40',
    timeRange: '8:00 to 8:40',
  },
  {
    periodNumber: 2,
    label: 'Period 2',
    startTime: '8:40',
    endTime: '9:20',
    timeRange: '8:40 to 9:20',
  },
  {
    periodNumber: 3,
    label: 'Period 3',
    startTime: '9:30',
    endTime: '10:10',
    timeRange: '9:30 to 10:10',
  },
  {
    periodNumber: 4,
    label: 'Period 4',
    startTime: '10:10',
    endTime: '10:50',
    timeRange: '10:10 to 10:50',
  },
  {
    periodNumber: 5,
    label: 'Period 5',
    startTime: '11:20',
    endTime: '12:00',
    timeRange: '11:20 to 12:00',
  },
  {
    periodNumber: 6,
    label: 'Period 6',
    startTime: '12:00',
    endTime: '12:40',
    timeRange: '12:00 to 12:40',
  },
  {
    periodNumber: 7,
    label: 'Period 7',
    startTime: '2:00',
    endTime: '2:40',
    timeRange: '2:00 to 2:40',
  },
  {
    periodNumber: 8,
    label: 'Period 8',
    startTime: '2:40',
    endTime: '3:20',
    timeRange: '2:40 to 3:20',
  },
];

export const BREAK_INTERVALS = [
  {
    type: 'short_break',
    label: 'Morning Break',
    timeRange: '9:20 to 9:30',
    afterPeriod: 2,
  },
  {
    type: 'tea_break',
    label: 'Tea Break',
    timeRange: '10:50 to 11:20',
    afterPeriod: 4,
  },
  {
    type: 'lunch',
    label: 'Lunch Break (No Lessons)',
    timeRange: '12:40 to 2:00',
    afterPeriod: 6,
  },
];

const STORAGE_KEY_TIMETABLE = 'reberwet_timetable_v6';

/**
 * Normalizes subject names for matching across user profile assignments and standard CBC subjects.
 * CRITICAL: Creative Arts and Sports MUST be evaluated first so that "creative" is not matched as "cre"!
 * CRE (Christian Religious Education) must only match the standalone acronym or explicit Christian/Religious terms.
 */
export function normalizeSubjectName(rawSubject: string): string {
  if (!rawSubject) return '';
  const s = rawSubject.toLowerCase().trim();

  // 1. Creative Arts and Sports (CA/s) - MUST come before CRE!
  if (
    s.includes('creative') ||
    s.includes('ca/s') ||
    s === 'ca/s' ||
    s.includes('sport') ||
    (s.includes('art') && !s.includes('smart') && !s.includes('part'))
  ) {
    return 'Creative Arts and Sports';
  }

  // 2. Core CBC Subjects
  if (s.includes('math')) return 'Mathematics';
  if (s.includes('eng')) return 'English';
  if (s.includes('kisw')) return 'Kiswahili';
  if (s.includes('sci')) return 'Integrated Science';
  if (s.includes('soci') || s.includes('sst')) return 'Social Studies';

  // 3. CRE (Christian Religious Education) - NEVER match "creative"
  if (
    /\bcre\b/i.test(s) ||
    s === 'cre' ||
    s.includes('christian') ||
    s.includes('religious')
  ) {
    return 'CRE';
  }

  if (s.includes('agri')) return 'Agriculture';
  if (s.includes('tech') || s.includes('pre-tech')) return 'Pre-Technical';
  return rawSubject;
}

/**
 * Extracts and formats the teacher's first name without titles like 'Madam' or 'Mr', and not a username.
 * e.g., 'Madam Faith Chepkirui' -> 'Faith'
 * e.g., 'Madam Nelly Korir' -> 'Nelly'
 * e.g., 'Brian Bett' -> 'Brian'
 * e.g., 'Mr Bore N.' -> 'Bore'
 * e.g., 'Mr. Patrick Ronoh' -> 'Patrick'
 * e.g., 'Mr John Koech' -> 'John'
 */
export function getTeacherFirstName(fullName?: string | null): string {
  if (!fullName) return '';
  const cleaned = fullName
    .replace(/\b(madam|madame|mr|mrs|ms|miss|tr|dr|teacher)\.?\s+/gi, '')
    .trim();

  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  const first = parts[0];
  // Capitalize properly as a first name (e.g. 'Faith', 'Nelly', 'Brian', 'John'), never a lowercase username
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

// Backward compatible alias
export const getTeacherSecondName = getTeacherFirstName;

/**
 * Returns clean standard abbreviations matching the official Kenya timetable layout
 * - For CRE use 'CRE'
 * - For Creative Arts and Sports use 'CA/s'
 */
export function getSubjectAbbreviation(rawSubject: string): string {
  const norm = normalizeSubjectName(rawSubject);
  switch (norm) {
    case 'Mathematics':
      return 'MATH';
    case 'English':
      return 'ENG';
    case 'Kiswahili':
      return 'KIS';
    case 'Integrated Science':
      return 'INTS';
    case 'Social Studies':
      return 'SS';
    case 'CRE':
      return 'CRE';
    case 'Agriculture':
      return 'AGRI';
    case 'Pre-Technical':
      return 'PRT';
    case 'Creative Arts and Sports':
      return 'CA/s';
    default:
      if (
        rawSubject.toLowerCase().includes('creative') ||
        rawSubject.toLowerCase().includes('ca/s') ||
        rawSubject.toLowerCase().includes('art') ||
        rawSubject.toLowerCase().includes('sport')
      ) {
        return 'CA/s';
      }
      if (
        /\bcre\b/i.test(rawSubject) ||
        rawSubject.toLowerCase().includes('christian') ||
        rawSubject.toLowerCase().includes('religious')
      ) {
        return 'CRE';
      }
      return rawSubject.slice(0, 5).toUpperCase();
  }
}

/**
 * Dynamically resolves the teacher responsible for a subject and grade.
 * - Creative Arts & Sports (CA/s) is taught by Mr John Koech.
 * - CRE (Christian Religious Education) is taught by Madam Nelly Korir.
 */
export function getTeacherForSubject(
  teachers: UserProfile[],
  subject: string,
  grade: string
): { id: string; name: string } {
  const normSubj = normalizeSubjectName(subject);

  // Dedicated rule: Creative Arts & Sports is ALWAYS taught by Mr John Koech
  if (normSubj === 'Creative Arts and Sports') {
    const koech = teachers.find(
      (t) =>
        t.name.toLowerCase().includes('koech') ||
        t.id === 'user-super-1' ||
        (t.assignments &&
          t.assignments.some(
            (a) => normalizeSubjectName(a.subject) === 'Creative Arts and Sports'
          ))
    );
    if (koech) return { id: koech.id, name: koech.name };
    return { id: 'user-super-1', name: 'Mr John Koech' };
  }

  // Dedicated rule: CRE (Christian Religious Education) is ALWAYS taught by Madam Nelly Korir
  if (normSubj === 'CRE') {
    const nelly = teachers.find(
      (t) =>
        (t.name.toLowerCase().includes('nelly') || t.name.toLowerCase().includes('korir')) &&
        !t.name.toLowerCase().includes('chepkirui')
    );
    if (nelly) return { id: nelly.id, name: nelly.name };
    return { id: 'user-teacher-7', name: 'Madam Nelly Korir' };
  }

  // 1. Look for explicit teacher assignment matching both Grade & Subject
  for (const t of teachers) {
    if (t.assignments && Array.isArray(t.assignments)) {
      const match = t.assignments.some(
        (a) =>
          a.grade.toLowerCase() === grade.toLowerCase() &&
          normalizeSubjectName(a.subject) === normSubj
      );
      if (match) {
        return { id: t.id, name: t.name };
      }
    }
  }

  // 2. Look for teacher assigned to this Subject for any grade
  for (const t of teachers) {
    if (t.assignments && Array.isArray(t.assignments)) {
      const match = t.assignments.some(
        (a) => normalizeSubjectName(a.subject) === normSubj
      );
      if (match) {
        return { id: t.id, name: t.name };
      }
    }
  }

  // 3. Fallback to primarySubject match
  for (const t of teachers) {
    if (t.primarySubject && normalizeSubjectName(t.primarySubject) === normSubj) {
      return { id: t.id, name: t.name };
    }
  }

  // 4. Default faculty fallback
  const defaults: Record<string, string> = {
    'Mathematics': 'Brian Bett',
    'English': 'Madam Faith Chepkirui',
    'Kiswahili': 'Madam Nelly Korir',
    'Integrated Science': 'Mr Bore N.',
    'Social Studies': 'Madam Nelly Korir',
    'CRE': 'Madam Nelly Korir',
    'Agriculture': 'Mr Bore N.',
    'Pre-Technical': 'Brian Bett',
    'Creative Arts and Sports': 'Mr John Koech',
  };

  const name = defaults[normSubj] || 'Teacher Staff';
  const found = teachers.find(
    (t) => t.name.toLowerCase() === name.toLowerCase()
  );
  return { id: found?.id || `t-${normSubj}`, name };
}

/**
 * Pre-defined master lesson distribution template
 * Adheres strictly to:
 * - Maths, English, Kiswahili every single day (Mon-Fri) in morning periods 1-4.
 * - Integrated Science has 1 double lesson (Periods 5 & 6) per week per grade on different days (G7 Mon, G8 Tue, G9 Wed).
 * - Integrated Science has 3 other single lessons = 5 total.
 * - ALL Creative Arts and Sports (CA/s) lessons take place AFTER the long break (Periods 5-8).
 * - Two different subjects taught by the same teacher NEVER follow immediately after each other in the same class
 *   (e.g., Madam Nelly/Debora never teaches Kiswahili then Social Studies or CRE; Bett never teaches Maths then PRT).
 * - Total per grade: 40 lessons (8 periods * 5 days).
 * - Conflict-free: No teacher teaching two classes at the same (day, period).
 */
import { TIMETABLE_ARRANGEMENTS, SlotTemplate } from './timetableVariants';

export { TIMETABLE_ARRANGEMENTS };
export type { SlotTemplate };

export const MASTER_SLOT_TEMPLATES: SlotTemplate[] = TIMETABLE_ARRANGEMENTS[0];

export const STORAGE_KEY_ARRANGEMENT_INDEX = 'reberwet_timetable_arrangement_idx';

/**
 * Gets the current active timetable arrangement index (0-based)
 */
export function getCurrentArrangementIndex(): number {
  try {
    const cur = parseInt(localStorage.getItem(STORAGE_KEY_ARRANGEMENT_INDEX) || '0', 10);
    return isNaN(cur) ? 0 : Math.abs(cur) % TIMETABLE_ARRANGEMENTS.length;
  } catch {
    return 0;
  }
}

/**
 * Cycles to the next valid timetable arrangement index (e.g., 1 -> 2 -> 3 -> 4 -> 5 -> 1...)
 * Every variant is pre-validated to strictly satisfy:
 * 1. Maths, English, Kiswahili daily (periods 1-4).
 * 2. Science double period once per week per grade in periods 5-6.
 * 3. ALL Creative Arts & Sports (CA/s) strictly scheduled after long break (periods 5-8).
 * 4. No back-to-back lessons of the same teacher in the same class (e.g. Nelly/Debora never teaches Kiswahili then SS or CRE).
 * 5. Zero teacher collisions across classes.
 * 6. CRE taught by Madam Nelly Korir; CA/s taught by Mr John Koech.
 */
export function cycleNextArrangementIndex(): number {
  try {
    const cur = getCurrentArrangementIndex();
    const next = (cur + 1) % TIMETABLE_ARRANGEMENTS.length;
    localStorage.setItem(STORAGE_KEY_ARRANGEMENT_INDEX, next.toString());
    return next;
  } catch {
    return 0;
  }
}

/**
 * Builds the complete TimetableData by applying active teacher assignments to a selected arrangement variant.
 */
export function buildTimetable(teachers: UserProfile[], variantIndex?: number): TimetableData {
  const chosenIdx =
    variantIndex !== undefined
      ? Math.abs(variantIndex) % TIMETABLE_ARRANGEMENTS.length
      : getCurrentArrangementIndex();

  const template = TIMETABLE_ARRANGEMENTS[chosenIdx] || TIMETABLE_ARRANGEMENTS[0];
  const lessons: TimetableLesson[] = [];

  for (const slot of template) {
    // Grade 7
    const g7Teacher = getTeacherForSubject(teachers, slot.g7, 'Grade 7');
    lessons.push({
      id: `lesson-g7-${slot.day}-${slot.period}`,
      day: slot.day,
      periodNumber: slot.period,
      grade: 'Grade 7',
      subject: slot.g7,
      teacherId: g7Teacher.id,
      teacherName: g7Teacher.name,
      isDouble: slot.g7Double || false,
    });

    // Grade 8
    const g8Teacher = getTeacherForSubject(teachers, slot.g8, 'Grade 8');
    lessons.push({
      id: `lesson-g8-${slot.day}-${slot.period}`,
      day: slot.day,
      periodNumber: slot.period,
      grade: 'Grade 8',
      subject: slot.g8,
      teacherId: g8Teacher.id,
      teacherName: g8Teacher.name,
      isDouble: slot.g8Double || false,
    });

    // Grade 9
    const g9Teacher = getTeacherForSubject(teachers, slot.g9, 'Grade 9');
    lessons.push({
      id: `lesson-g9-${slot.day}-${slot.period}`,
      day: slot.day,
      periodNumber: slot.period,
      grade: 'Grade 9',
      subject: slot.g9,
      teacherId: g9Teacher.id,
      teacherName: g9Teacher.name,
      isDouble: slot.g9Double || false,
    });
  }

  return {
    academicYear: '2026',
    term: 'Term 3',
    lessons,
    updatedAt: new Date().toISOString(),
    generatedBy: `System Auto-Optimizer (Arrangement Option ${chosenIdx + 1} of ${TIMETABLE_ARRANGEMENTS.length})`,
  };
}

/**
 * Persists the timetable to device localStorage
 */
export function saveTimetableToStorage(data: TimetableData): void {
  try {
    localStorage.setItem(STORAGE_KEY_TIMETABLE, JSON.stringify(data));
  } catch {
    // ignore
  }
}

/**
 * Retrieves the timetable from device localStorage, or generates it on first run
 * Always updates teacher names dynamically based on the current teachers array.
 */
export function getTimetableFromStorage(teachers: UserProfile[]): TimetableData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_TIMETABLE);
    if (saved) {
      const parsed: TimetableData = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.lessons) && parsed.lessons.length > 0) {
        // Re-link teacher names dynamically so any teacher assignment change is immediately reflected
        const updatedLessons = parsed.lessons.map((lesson) => {
          const t = getTeacherForSubject(teachers, lesson.subject, lesson.grade);
          return {
            ...lesson,
            teacherId: t.id,
            teacherName: t.name,
          };
        });

        // Ensure Creative Arts and Sports (CA/s) has Mr John Koech
        const koechLessons = updatedLessons.filter(
          (l) =>
            normalizeSubjectName(l.subject) === 'Creative Arts and Sports' &&
            (l.teacherName.toLowerCase().includes('koech') || l.teacherName === 'Mr John Koech')
        );

        // Ensure CRE (Christian Religious Education) is taught by Madam Nelly Korir
        const nellyCreLessons = updatedLessons.filter(
          (l) =>
            normalizeSubjectName(l.subject) === 'CRE' &&
            (l.teacherName.toLowerCase().includes('nelly') || l.teacherName.toLowerCase().includes('korir'))
        );

        // If corrupted or missing either CA/s by Koech or CRE by Nelly, rebuild freshly
        if (koechLessons.length < 5 || nellyCreLessons.length < 5) {
          const fresh = buildTimetable(teachers);
          saveTimetableToStorage(fresh);
          return fresh;
        }

        const updatedData: TimetableData = {
          ...parsed,
          lessons: updatedLessons,
        };
        saveTimetableToStorage(updatedData);
        return updatedData;
      }
    }
  } catch {
    // ignore
  }

  const generated = buildTimetable(teachers);
  saveTimetableToStorage(generated);
  return generated;
}

/**
 * Generates an official printable PDF of a teacher's personal timetable
 * Uses exact Kenya layout format:
 * - DAY column on the left vertical
 * - Times across the top (8:00-8:40, 8:40-9:20, 9:20-9:30, 9:30-10:10, 10:10-10:50, 10:50-11:20, 11:20-12:00, 12:00-12:40, 12:40-2:00, 2:00-2:40, 2:40-3:20)
 * - Vertical break columns: SHORT BREAK, LONG BREAK, LUNCH BREAK spanning all 5 day rows
 */
export async function downloadTeacherTimetablePdf(
  teacher: UserProfile,
  timetable: TimetableData,
  teachers: UserProfile[],
  onFeedback?: (msg: string, isError?: boolean) => void
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 297;
  const pageHeight = 210;
  const margin = 10;

  // Header Box
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('REBERWET JUNIOR SECONDARY SCHOOL', pageWidth / 2, margin + 5, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(
    `TEACHER'S TIMETABLE: ${teacher.name.toUpperCase()} (TSC: ${teacher.tscNumber || 'TSC/REG'} | ${timetable.academicYear} ${timetable.term.toUpperCase()})`,
    pageWidth / 2,
    margin + 10.5,
    { align: 'center' }
  );

  // Time slots across top
  // Columns:
  // 0: DAY (width 16)
  // 1: P1 8:00-8:40 (width 24)
  // 2: P2 8:40-9:20 (width 24)
  // 3: SHORT BREAK 9:20-9:30 (width 16)
  // 4: P3 9:30-10:10 (width 24)
  // 5: P4 10:10-10:50 (width 24)
  // 6: LONG BREAK 10:50-11:20 (width 18)
  // 7: P5 11:20-12:00 (width 24)
  // 8: P6 12:00-12:40 (width 24)
  // 9: LUNCH BREAK 12:40-2:00 (width 19)
  // 10: P7 2:00-2:40 (width 24)
  // 11: P8 2:40-3:20 (width 24)
  // Total width: 16 + 24*8 (192) + 16 + 18 + 19 = 277mm (pageWidth 297 - 20 margin = 277mm exactly!)

  const colWidths = {
    day: 18,
    p1: 24,
    p2: 24,
    shortBreak: 15,
    p3: 24,
    p4: 24,
    longBreak: 17,
    p5: 24,
    p6: 24,
    lunchBreak: 19,
    p7: 24,
    p8: 24,
  };

  const startY = margin + 14;
  const headerHeight = 11;
  const dayRowHeight = 22; // 5 days * 22 = 110mm
  const gridHeight = headerHeight + dayRowHeight * 5;

  const colX: number[] = [];
  let currX = margin;
  colX.push(currX); // 0: DAY
  currX += colWidths.day;
  colX.push(currX); // 1: P1
  currX += colWidths.p1;
  colX.push(currX); // 2: P2
  currX += colWidths.p2;
  colX.push(currX); // 3: Short Break
  currX += colWidths.shortBreak;
  colX.push(currX); // 4: P3
  currX += colWidths.p3;
  colX.push(currX); // 5: P4
  currX += colWidths.p4;
  colX.push(currX); // 6: Long Break
  currX += colWidths.longBreak;
  colX.push(currX); // 7: P5
  currX += colWidths.p5;
  colX.push(currX); // 8: P6
  currX += colWidths.p6;
  colX.push(currX); // 9: Lunch Break
  currX += colWidths.lunchBreak;
  colX.push(currX); // 10: P7
  currX += colWidths.p7;
  colX.push(currX); // 11: P8
  currX += colWidths.p8;
  const tableEndX = currX;

  // Outer border & Grid header
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.8);
  doc.rect(margin, startY, tableEndX - margin, gridHeight);

  // Top Header Fill & Text
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, startY, tableEndX - margin, headerHeight, 'F');
  doc.line(margin, startY + headerHeight, tableEndX, startY + headerHeight);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 0, 0);

  // DAY header
  doc.text('DAY', margin + colWidths.day / 2, startY + 7, { align: 'center' });

  // Period / Break headers
  const headers = [
    { x: colX[1], w: colWidths.p1, t1: '8:00-', t2: '8:40', p: 'P1' },
    { x: colX[2], w: colWidths.p2, t1: '8:40-', t2: '9:20', p: 'P2' },
    { x: colX[3], w: colWidths.shortBreak, t1: '9:20-', t2: '9:30', p: '' },
    { x: colX[4], w: colWidths.p3, t1: '9:30-', t2: '10:10', p: 'P3' },
    { x: colX[5], w: colWidths.p4, t1: '10:10-', t2: '10:50', p: 'P4' },
    { x: colX[6], w: colWidths.longBreak, t1: '10:50-', t2: '11:20', p: '' },
    { x: colX[7], w: colWidths.p5, t1: '11:20-', t2: '12:00', p: 'P5' },
    { x: colX[8], w: colWidths.p6, t1: '12:00-', t2: '12:40', p: 'P6' },
    { x: colX[9], w: colWidths.lunchBreak, t1: '12:40-', t2: '2:00', p: '' },
    { x: colX[10], w: colWidths.p7, t1: '2:00-', t2: '2:40', p: 'P7' },
    { x: colX[11], w: colWidths.p8, t1: '2:40-', t2: '3:20', p: 'P8' },
  ];

  headers.forEach((h) => {
    doc.line(h.x, startY, h.x, startY + headerHeight);
    doc.setFontSize(7.5);
    doc.text(h.t1, h.x + h.w / 2, startY + 4, { align: 'center' });
    doc.text(h.t2, h.x + h.w / 2, startY + 8, { align: 'center' });
  });

  // Vertical lines for breaks across all rows
  // Break 1: Short Break
  doc.setLineWidth(0.6);
  doc.line(colX[3], startY, colX[3], startY + gridHeight);
  doc.line(colX[4], startY, colX[4], startY + gridHeight);

  // Break 2: Long Break
  doc.line(colX[6], startY, colX[6], startY + gridHeight);
  doc.line(colX[7], startY, colX[7], startY + gridHeight);

  // Break 3: Lunch Break
  doc.line(colX[9], startY, colX[9], startY + gridHeight);
  doc.line(colX[10], startY, colX[10], startY + gridHeight);

  // Helper for vertical text
  const drawVerticalText = (text: string, xCenter: number, yStart: number, totalHeight: number) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(20, 20, 20);
    const chars = text.split('');
    const step = totalHeight / (chars.length + 1);
    chars.forEach((c, idx) => {
      doc.text(c, xCenter, yStart + (idx + 1) * step, { align: 'center' });
    });
  };

  const breaksBodyY = startY + headerHeight;
  const breaksBodyHeight = dayRowHeight * 5;

  // Background tint for break columns
  doc.setFillColor(250, 250, 250);
  doc.rect(colX[3], breaksBodyY, colWidths.shortBreak, breaksBodyHeight, 'F');
  doc.rect(colX[6], breaksBodyY, colWidths.longBreak, breaksBodyHeight, 'F');
  doc.rect(colX[9], breaksBodyY, colWidths.lunchBreak, breaksBodyHeight, 'F');

  // Re-draw break column boundaries
  doc.setLineWidth(0.8);
  doc.rect(colX[3], breaksBodyY, colWidths.shortBreak, breaksBodyHeight);
  doc.rect(colX[6], breaksBodyY, colWidths.longBreak, breaksBodyHeight);
  doc.rect(colX[9], breaksBodyY, colWidths.lunchBreak, breaksBodyHeight);

  drawVerticalText('SHORT BREAK', colX[3] + colWidths.shortBreak / 2, breaksBodyY, breaksBodyHeight);
  drawVerticalText('LONG BREAK', colX[6] + colWidths.longBreak / 2, breaksBodyY, breaksBodyHeight);
  drawVerticalText('LUNCH BREAK', colX[9] + colWidths.lunchBreak / 2, breaksBodyY, breaksBodyHeight);

  // Filter lessons for this teacher
  const teacherLessons = timetable.lessons.filter(
    (l) =>
      l.teacherId === teacher.id ||
      l.teacherName?.toLowerCase() === teacher.name.toLowerCase()
  );

  const dayAbbreviations: Record<TimetableDay, string> = {
    Monday: 'MON',
    Tuesday: 'TUE',
    Wednesday: 'WED',
    Thursday: 'THUR',
    Friday: 'FRI',
  };

  const periodColMap: Record<number, { x: number; w: number }> = {
    1: { x: colX[1], w: colWidths.p1 },
    2: { x: colX[2], w: colWidths.p2 },
    3: { x: colX[4], w: colWidths.p3 },
    4: { x: colX[5], w: colWidths.p4 },
    5: { x: colX[7], w: colWidths.p5 },
    6: { x: colX[8], w: colWidths.p6 },
    7: { x: colX[10], w: colWidths.p7 },
    8: { x: colX[11], w: colWidths.p8 },
  };

  // Draw 5 Day Rows
  TIMETABLE_DAYS.forEach((day, dayIndex) => {
    const rowY = startY + headerHeight + dayIndex * dayRowHeight;

    // Horizontal divider
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    doc.line(margin, rowY, tableEndX, rowY);

    // DAY Column Vertical line
    doc.line(colX[1], rowY, colX[1], rowY + dayRowHeight);

    // DAY Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(0, 0, 0);
    doc.text(dayAbbreviations[day], margin + colWidths.day / 2, rowY + dayRowHeight / 2 + 1.5, { align: 'center' });

    // Draw Period Cells
    [1, 2, 3, 4, 5, 6, 7, 8].forEach((pNum) => {
      const pInfo = periodColMap[pNum];
      // Vertical cell divider
      doc.setLineWidth(0.4);
      doc.line(pInfo.x + pInfo.w, rowY, pInfo.x + pInfo.w, rowY + dayRowHeight);

      const lesson = teacherLessons.find(
        (l) => l.day === day && l.periodNumber === pNum
      );

      if (lesson) {
        // Teacher has lesson
        const abbr = getSubjectAbbreviation(lesson.subject);
        const gradeShort = lesson.grade.replace('Grade ', 'G');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(0, 0, 0);
        doc.text(abbr, pInfo.x + pInfo.w / 2, rowY + 9, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(60, 60, 60);
        doc.text(gradeShort, pInfo.x + pInfo.w / 2, rowY + 16, { align: 'center' });

        if (lesson.isDouble) {
          doc.setFontSize(6.5);
          doc.setTextColor(180, 0, 0);
          doc.text('(Dbl)', pInfo.x + pInfo.w - 5, rowY + 7);
        }
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(190, 190, 190);
        doc.text('—', pInfo.x + pInfo.w / 2, rowY + 12, { align: 'center' });
      }
    });
  });

  // Footer: Prepared By & School Stamp as shown on user reference sheet
  const footerY = startY + gridHeight + 16;
  const currentDateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 0, 0);

  doc.text(`PREPARED BY: ................................................ DATE: ${currentDateStr}`, margin + 5, footerY);
  doc.text(`APPROVED / STAMP: ....................................... DATE: ${currentDateStr}`, margin + 145, footerY);

  const cleanFilename = `Reberwet_Timetable_${teacher.name.replace(/\s+/g, '_')}_${timetable.term.replace(/\s+/g, '_')}`;
  return await savePdfToDevice(doc, cleanFilename, onFeedback);
}

/**
 * Generates an official printable PDF of a Class Timetable (Grade 7, Grade 8, or Grade 9)
 * Follows the user's requested layout:
 * - Time across the top
 * - Day vertically alongside (MON, TUE, WED, THUR, FRI)
 * - Vertical break columns (SHORT BREAK, LONG BREAK, LUNCH BREAK)
 */
export async function downloadClassTimetablePdf(
  grade: 'Grade 7' | 'Grade 8' | 'Grade 9',
  timetable: TimetableData,
  teachers: UserProfile[],
  onFeedback?: (msg: string, isError?: boolean) => void
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 297;
  const pageHeight = 210;
  const margin = 10;

  // Header Box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('REBERWET JUNIOR SECONDARY SCHOOL', pageWidth / 2, margin + 5, { align: 'center' });

  const rawClassTeacher = CLASS_TEACHERS[grade] || 'Class Teacher';
  const classTeacher = getTeacherSecondName(rawClassTeacher) || rawClassTeacher;
  doc.setFontSize(10);
  doc.text(
    `CLASS TIMETABLE: ${grade.toUpperCase()} (CLASS TEACHER: ${classTeacher.toUpperCase()} | ${timetable.academicYear} ${timetable.term.toUpperCase()})`,
    pageWidth / 2,
    margin + 10.5,
    { align: 'center' }
  );

  const colWidths = {
    day: 18,
    p1: 24,
    p2: 24,
    shortBreak: 15,
    p3: 24,
    p4: 24,
    longBreak: 17,
    p5: 24,
    p6: 24,
    lunchBreak: 19,
    p7: 24,
    p8: 24,
  };

  const startY = margin + 14;
  const headerHeight = 11;
  const dayRowHeight = 22;
  const gridHeight = headerHeight + dayRowHeight * 5;

  const colX: number[] = [];
  let currX = margin;
  colX.push(currX);
  currX += colWidths.day;
  colX.push(currX);
  currX += colWidths.p1;
  colX.push(currX);
  currX += colWidths.p2;
  colX.push(currX);
  currX += colWidths.shortBreak;
  colX.push(currX);
  currX += colWidths.p3;
  colX.push(currX);
  currX += colWidths.p4;
  colX.push(currX);
  currX += colWidths.longBreak;
  colX.push(currX);
  currX += colWidths.p5;
  colX.push(currX);
  currX += colWidths.p6;
  colX.push(currX);
  currX += colWidths.lunchBreak;
  colX.push(currX);
  currX += colWidths.p7;
  colX.push(currX);
  currX += colWidths.p8;
  const tableEndX = currX;

  // Border & Grid header
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.8);
  doc.rect(margin, startY, tableEndX - margin, gridHeight);

  doc.setFillColor(245, 245, 245);
  doc.rect(margin, startY, tableEndX - margin, headerHeight, 'F');
  doc.line(margin, startY + headerHeight, tableEndX, startY + headerHeight);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 0, 0);
  doc.text('DAY', margin + colWidths.day / 2, startY + 7, { align: 'center' });

  const headers = [
    { x: colX[1], w: colWidths.p1, t1: '8:00-', t2: '8:40', p: 'P1' },
    { x: colX[2], w: colWidths.p2, t1: '8:40-', t2: '9:20', p: 'P2' },
    { x: colX[3], w: colWidths.shortBreak, t1: '9:20-', t2: '9:30', p: '' },
    { x: colX[4], w: colWidths.p3, t1: '9:30-', t2: '10:10', p: 'P3' },
    { x: colX[5], w: colWidths.p4, t1: '10:10-', t2: '10:50', p: 'P4' },
    { x: colX[6], w: colWidths.longBreak, t1: '10:50-', t2: '11:20', p: '' },
    { x: colX[7], w: colWidths.p5, t1: '11:20-', t2: '12:00', p: 'P5' },
    { x: colX[8], w: colWidths.p6, t1: '12:00-', t2: '12:40', p: 'P6' },
    { x: colX[9], w: colWidths.lunchBreak, t1: '12:40-', t2: '2:00', p: '' },
    { x: colX[10], w: colWidths.p7, t1: '2:00-', t2: '2:40', p: 'P7' },
    { x: colX[11], w: colWidths.p8, t1: '2:40-', t2: '3:20', p: 'P8' },
  ];

  headers.forEach((h) => {
    doc.line(h.x, startY, h.x, startY + headerHeight);
    doc.setFontSize(7.5);
    doc.text(h.t1, h.x + h.w / 2, startY + 4, { align: 'center' });
    doc.text(h.t2, h.x + h.w / 2, startY + 8, { align: 'center' });
  });

  const breaksBodyY = startY + headerHeight;
  const breaksBodyHeight = dayRowHeight * 5;

  doc.setFillColor(250, 250, 250);
  doc.rect(colX[3], breaksBodyY, colWidths.shortBreak, breaksBodyHeight, 'F');
  doc.rect(colX[6], breaksBodyY, colWidths.longBreak, breaksBodyHeight, 'F');
  doc.rect(colX[9], breaksBodyY, colWidths.lunchBreak, breaksBodyHeight, 'F');

  doc.setLineWidth(0.8);
  doc.rect(colX[3], breaksBodyY, colWidths.shortBreak, breaksBodyHeight);
  doc.rect(colX[6], breaksBodyY, colWidths.longBreak, breaksBodyHeight);
  doc.rect(colX[9], breaksBodyY, colWidths.lunchBreak, breaksBodyHeight);

  const drawVerticalText = (text: string, xCenter: number, yStart: number, totalHeight: number) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(20, 20, 20);
    const chars = text.split('');
    const step = totalHeight / (chars.length + 1);
    chars.forEach((c, idx) => {
      doc.text(c, xCenter, yStart + (idx + 1) * step, { align: 'center' });
    });
  };

  drawVerticalText('SHORT BREAK', colX[3] + colWidths.shortBreak / 2, breaksBodyY, breaksBodyHeight);
  drawVerticalText('LONG BREAK', colX[6] + colWidths.longBreak / 2, breaksBodyY, breaksBodyHeight);
  drawVerticalText('LUNCH BREAK', colX[9] + colWidths.lunchBreak / 2, breaksBodyY, breaksBodyHeight);

  const classLessons = timetable.lessons.filter((l) => l.grade === grade);

  const dayAbbreviations: Record<TimetableDay, string> = {
    Monday: 'MON',
    Tuesday: 'TUE',
    Wednesday: 'WED',
    Thursday: 'THUR',
    Friday: 'FRI',
  };

  const periodColMap: Record<number, { x: number; w: number }> = {
    1: { x: colX[1], w: colWidths.p1 },
    2: { x: colX[2], w: colWidths.p2 },
    3: { x: colX[4], w: colWidths.p3 },
    4: { x: colX[5], w: colWidths.p4 },
    5: { x: colX[7], w: colWidths.p5 },
    6: { x: colX[8], w: colWidths.p6 },
    7: { x: colX[10], w: colWidths.p7 },
    8: { x: colX[11], w: colWidths.p8 },
  };

  TIMETABLE_DAYS.forEach((day, dayIndex) => {
    const rowY = startY + headerHeight + dayIndex * dayRowHeight;

    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    doc.line(margin, rowY, tableEndX, rowY);
    doc.line(colX[1], rowY, colX[1], rowY + dayRowHeight);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(0, 0, 0);
    doc.text(dayAbbreviations[day], margin + colWidths.day / 2, rowY + dayRowHeight / 2 + 1.5, { align: 'center' });

    [1, 2, 3, 4, 5, 6, 7, 8].forEach((pNum) => {
      const pInfo = periodColMap[pNum];
      doc.setLineWidth(0.4);
      doc.line(pInfo.x + pInfo.w, rowY, pInfo.x + pInfo.w, rowY + dayRowHeight);

      const lesson = classLessons.find(
        (l) => l.day === day && l.periodNumber === pNum
      );

      if (lesson) {
        const abbr = getSubjectAbbreviation(lesson.subject);
        const tSecondName = lesson.teacherName ? getTeacherSecondName(lesson.teacherName) : 'TR';

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(0, 0, 0);
        doc.text(abbr, pInfo.x + pInfo.w / 2, rowY + 9, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(60, 60, 60);
        doc.text(tSecondName, pInfo.x + pInfo.w / 2, rowY + 16, { align: 'center' });

        if (lesson.isDouble) {
          doc.setFontSize(6.5);
          doc.setTextColor(180, 0, 0);
          doc.text('(Dbl)', pInfo.x + pInfo.w - 5, rowY + 7);
        }
      }
    });
  });

  const footerY = startY + gridHeight + 16;
  const currentDateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 0, 0);

  doc.text(`PREPARED BY: ................................................ DATE: ${currentDateStr}`, margin + 5, footerY);
  doc.text(`APPROVED / STAMP: ....................................... DATE: ${currentDateStr}`, margin + 145, footerY);

  const cleanFilename = `Reberwet_Timetable_${grade.replace(/\s+/g, '_')}_${timetable.term.replace(/\s+/g, '_')}`;
  return await savePdfToDevice(doc, cleanFilename, onFeedback);
}

/**
 * Generates an official Full School Master Timetable PDF (Grade 7, 8, and 9 side-by-side)
 * Uses the exact format: Time across top, Day vertical on left, break columns
 */
export async function downloadMasterSchoolTimetablePdf(
  timetable: TimetableData,
  teachers: UserProfile[],
  onFeedback?: (msg: string, isError?: boolean) => void
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 297;
  const pageHeight = 210;
  const margin = 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('REBERWET JUNIOR SECONDARY SCHOOL', pageWidth / 2, margin + 5, { align: 'center' });

  doc.setFontSize(10);
  doc.text(
    `FULL SCHOOL MASTER TIMETABLE: GRADE 7, 8 & 9 (${timetable.academicYear} ${timetable.term.toUpperCase()})`,
    pageWidth / 2,
    margin + 10.5,
    { align: 'center' }
  );

  const colWidths = {
    day: 18,
    p1: 24,
    p2: 24,
    shortBreak: 15,
    p3: 24,
    p4: 24,
    longBreak: 17,
    p5: 24,
    p6: 24,
    lunchBreak: 19,
    p7: 24,
    p8: 24,
  };

  const startY = margin + 14;
  const headerHeight = 11;
  const dayRowHeight = 22;
  const gridHeight = headerHeight + dayRowHeight * 5;

  const colX: number[] = [];
  let currX = margin;
  colX.push(currX);
  currX += colWidths.day;
  colX.push(currX);
  currX += colWidths.p1;
  colX.push(currX);
  currX += colWidths.p2;
  colX.push(currX);
  currX += colWidths.shortBreak;
  colX.push(currX);
  currX += colWidths.p3;
  colX.push(currX);
  currX += colWidths.p4;
  colX.push(currX);
  currX += colWidths.longBreak;
  colX.push(currX);
  currX += colWidths.p5;
  colX.push(currX);
  currX += colWidths.p6;
  colX.push(currX);
  currX += colWidths.lunchBreak;
  colX.push(currX);
  currX += colWidths.p7;
  colX.push(currX);
  currX += colWidths.p8;
  const tableEndX = currX;

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.8);
  doc.rect(margin, startY, tableEndX - margin, gridHeight);

  doc.setFillColor(245, 245, 245);
  doc.rect(margin, startY, tableEndX - margin, headerHeight, 'F');
  doc.line(margin, startY + headerHeight, tableEndX, startY + headerHeight);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 0, 0);
  doc.text('DAY', margin + colWidths.day / 2, startY + 7, { align: 'center' });

  const headers = [
    { x: colX[1], w: colWidths.p1, t1: '8:00-', t2: '8:40', p: 'P1' },
    { x: colX[2], w: colWidths.p2, t1: '8:40-', t2: '9:20', p: 'P2' },
    { x: colX[3], w: colWidths.shortBreak, t1: '9:20-', t2: '9:30', p: '' },
    { x: colX[4], w: colWidths.p3, t1: '9:30-', t2: '10:10', p: 'P3' },
    { x: colX[5], w: colWidths.p4, t1: '10:10-', t2: '10:50', p: 'P4' },
    { x: colX[6], w: colWidths.longBreak, t1: '10:50-', t2: '11:20', p: '' },
    { x: colX[7], w: colWidths.p5, t1: '11:20-', t2: '12:00', p: 'P5' },
    { x: colX[8], w: colWidths.p6, t1: '12:00-', t2: '12:40', p: 'P6' },
    { x: colX[9], w: colWidths.lunchBreak, t1: '12:40-', t2: '2:00', p: '' },
    { x: colX[10], w: colWidths.p7, t1: '2:00-', t2: '2:40', p: 'P7' },
    { x: colX[11], w: colWidths.p8, t1: '2:40-', t2: '3:20', p: 'P8' },
  ];

  headers.forEach((h) => {
    doc.line(h.x, startY, h.x, startY + headerHeight);
    doc.setFontSize(7.5);
    doc.text(h.t1, h.x + h.w / 2, startY + 4, { align: 'center' });
    doc.text(h.t2, h.x + h.w / 2, startY + 8, { align: 'center' });
  });

  const breaksBodyY = startY + headerHeight;
  const breaksBodyHeight = dayRowHeight * 5;

  doc.setFillColor(250, 250, 250);
  doc.rect(colX[3], breaksBodyY, colWidths.shortBreak, breaksBodyHeight, 'F');
  doc.rect(colX[6], breaksBodyY, colWidths.longBreak, breaksBodyHeight, 'F');
  doc.rect(colX[9], breaksBodyY, colWidths.lunchBreak, breaksBodyHeight, 'F');

  doc.setLineWidth(0.8);
  doc.rect(colX[3], breaksBodyY, colWidths.shortBreak, breaksBodyHeight);
  doc.rect(colX[6], breaksBodyY, colWidths.longBreak, breaksBodyHeight);
  doc.rect(colX[9], breaksBodyY, colWidths.lunchBreak, breaksBodyHeight);

  const drawVerticalText = (text: string, xCenter: number, yStart: number, totalHeight: number) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(20, 20, 20);
    const chars = text.split('');
    const step = totalHeight / (chars.length + 1);
    chars.forEach((c, idx) => {
      doc.text(c, xCenter, yStart + (idx + 1) * step, { align: 'center' });
    });
  };

  drawVerticalText('SHORT BREAK', colX[3] + colWidths.shortBreak / 2, breaksBodyY, breaksBodyHeight);
  drawVerticalText('LONG BREAK', colX[6] + colWidths.longBreak / 2, breaksBodyY, breaksBodyHeight);
  drawVerticalText('LUNCH BREAK', colX[9] + colWidths.lunchBreak / 2, breaksBodyY, breaksBodyHeight);

  const dayAbbreviations: Record<TimetableDay, string> = {
    Monday: 'MON',
    Tuesday: 'TUE',
    Wednesday: 'WED',
    Thursday: 'THUR',
    Friday: 'FRI',
  };

  const periodColMap: Record<number, { x: number; w: number }> = {
    1: { x: colX[1], w: colWidths.p1 },
    2: { x: colX[2], w: colWidths.p2 },
    3: { x: colX[4], w: colWidths.p3 },
    4: { x: colX[5], w: colWidths.p4 },
    5: { x: colX[7], w: colWidths.p5 },
    6: { x: colX[8], w: colWidths.p6 },
    7: { x: colX[10], w: colWidths.p7 },
    8: { x: colX[11], w: colWidths.p8 },
  };

  TIMETABLE_DAYS.forEach((day, dayIndex) => {
    const rowY = startY + headerHeight + dayIndex * dayRowHeight;

    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    doc.line(margin, rowY, tableEndX, rowY);
    doc.line(colX[1], rowY, colX[1], rowY + dayRowHeight);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(0, 0, 0);
    doc.text(dayAbbreviations[day], margin + colWidths.day / 2, rowY + dayRowHeight / 2 + 1.5, { align: 'center' });

    [1, 2, 3, 4, 5, 6, 7, 8].forEach((pNum) => {
      const pInfo = periodColMap[pNum];
      doc.setLineWidth(0.4);
      doc.line(pInfo.x + pInfo.w, rowY, pInfo.x + pInfo.w, rowY + dayRowHeight);

      const g7 = timetable.lessons.find((l) => l.grade === 'Grade 7' && l.day === day && l.periodNumber === pNum);
      const g8 = timetable.lessons.find((l) => l.grade === 'Grade 8' && l.day === day && l.periodNumber === pNum);
      const g9 = timetable.lessons.find((l) => l.grade === 'Grade 9' && l.day === day && l.periodNumber === pNum);

      doc.setFontSize(6.5);

      // G7
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 102, 153);
      const g7Teacher = g7?.teacherName ? getTeacherSecondName(g7.teacherName) : '';
      doc.text(`7: ${getSubjectAbbreviation(g7?.subject || '')}${g7Teacher ? ` (${g7Teacher})` : ''}`, pInfo.x + 1.5, rowY + 6);

      // G8
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(170, 0, 50);
      const g8Teacher = g8?.teacherName ? getTeacherSecondName(g8.teacherName) : '';
      doc.text(`8: ${getSubjectAbbreviation(g8?.subject || '')}${g8Teacher ? ` (${g8Teacher})` : ''}`, pInfo.x + 1.5, rowY + 13);

      // G9
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(80, 0, 130);
      const g9Teacher = g9?.teacherName ? getTeacherSecondName(g9.teacherName) : '';
      doc.text(`9: ${getSubjectAbbreviation(g9?.subject || '')}${g9Teacher ? ` (${g9Teacher})` : ''}`, pInfo.x + 1.5, rowY + 20);
    });
  });

  const footerY = startY + gridHeight + 16;
  const currentDateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 0, 0);

  doc.text(`PREPARED BY: ................................................ DATE: ${currentDateStr}`, margin + 5, footerY);
  doc.text(`APPROVED / STAMP: ....................................... DATE: ${currentDateStr}`, margin + 145, footerY);

  const cleanFilename = `Reberwet_Master_Timetable_${timetable.academicYear}_${timetable.term.replace(/\s+/g, '_')}`;
  return await savePdfToDevice(doc, cleanFilename, onFeedback);
}
