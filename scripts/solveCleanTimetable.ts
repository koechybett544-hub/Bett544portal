import { TimetableDay } from '../src/types';

export interface Slot {
  day: TimetableDay;
  period: number;
  g7: string;
  g8: string;
  g9: string;
  g7Double?: boolean;
  g8Double?: boolean;
  g9Double?: boolean;
}

const teacherMap: Record<string, string> = {
  'Mathematics': 'Bett',
  'Pre-Technical': 'Bett',
  'English': 'Faith',
  'Integrated Science': 'Bore',
  'Agriculture': 'Bore',
  'Kiswahili': 'Nelly',
  'Social Studies': 'Nelly',
  'CRE': 'Nelly',
  'Creative Arts and Sports': 'Koech',
};

const days: TimetableDay[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Let's test a complete weekly validator
export function validateWeeklyTimetable(schedule: Slot[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 1. Exactly 40 slots
  if (schedule.length !== 40) {
    errors.push(`Expected 40 slots, got ${schedule.length}`);
  }

  // 2. Counts per grade
  const g7Counts: Record<string, number> = {};
  const g8Counts: Record<string, number> = {};
  const g9Counts: Record<string, number> = {};

  schedule.forEach((s) => {
    g7Counts[s.g7] = (g7Counts[s.g7] || 0) + 1;
    g8Counts[s.g8] = (g8Counts[s.g8] || 0) + 1;
    g9Counts[s.g9] = (g9Counts[s.g9] || 0) + 1;

    // Teacher collisions
    const t7 = teacherMap[s.g7];
    const t8 = teacherMap[s.g8];
    const t9 = teacherMap[s.g9];
    if (t7 === t8 || t7 === t9 || t8 === t9) {
      errors.push(`Teacher collision on ${s.day} P${s.period}: ${t7}, ${t8}, ${t9}`);
    }

    // CA/s after long break only (P5-8)
    if (s.period < 5) {
      if (s.g7 === 'Creative Arts and Sports') errors.push(`G7 CA/s before long break on ${s.day} P${s.period}`);
      if (s.g8 === 'Creative Arts and Sports') errors.push(`G8 CA/s before long break on ${s.day} P${s.period}`);
      if (s.g9 === 'Creative Arts and Sports') errors.push(`G9 CA/s before long break on ${s.day} P${s.period}`);
    }
  });

  // Consecutive same teacher check
  for (const day of days) {
    const daySlots = schedule.filter((s) => s.day === day).sort((a, b) => a.period - b.period);
    for (let i = 0; i < daySlots.length - 1; i++) {
      const cur = daySlots[i];
      const next = daySlots[i + 1];
      if (next.period === cur.period + 1) {
        // G7
        if (teacherMap[cur.g7] === teacherMap[next.g7]) {
          if (cur.g7 === 'Integrated Science' && next.g7 === 'Integrated Science' && cur.period === 5) {
            // allowed double
          } else {
            errors.push(`G7 consecutive ${teacherMap[cur.g7]} (${cur.g7} -> ${next.g7}) on ${day} P${cur.period}-${next.period}`);
          }
        }
        // G8
        if (teacherMap[cur.g8] === teacherMap[next.g8]) {
          if (cur.g8 === 'Integrated Science' && next.g8 === 'Integrated Science' && cur.period === 5) {
            // allowed double
          } else {
            errors.push(`G8 consecutive ${teacherMap[cur.g8]} (${cur.g8} -> ${next.g8}) on ${day} P${cur.period}-${next.period}`);
          }
        }
        // G9
        if (teacherMap[cur.g9] === teacherMap[next.g9]) {
          if (cur.g9 === 'Integrated Science' && next.g9 === 'Integrated Science' && cur.period === 5) {
            // allowed double
          } else {
            errors.push(`G9 consecutive ${teacherMap[cur.g9]} (${cur.g9} -> ${next.g9}) on ${day} P${cur.period}-${next.period}`);
          }
        }
      }
    }
  }

  // Quotas check: Maths 5, Eng 5, Kisw 5, Sci 5, SS 4, CRE 4, Agri 4, PRT 4, CA/s 4
  const expected: Record<string, number> = {
    'Mathematics': 5,
    'English': 5,
    'Kiswahili': 5,
    'Integrated Science': 5,
    'Social Studies': 4,
    'CRE': 4,
    'Agriculture': 4,
    'Pre-Technical': 4,
    'Creative Arts and Sports': 4,
  };

  for (const subj of Object.keys(expected)) {
    if (g7Counts[subj] !== expected[subj]) errors.push(`G7 ${subj} count: ${g7Counts[subj]} != ${expected[subj]}`);
    if (g8Counts[subj] !== expected[subj]) errors.push(`G8 ${subj} count: ${g8Counts[subj]} != ${expected[subj]}`);
    if (g9Counts[subj] !== expected[subj]) errors.push(`G9 ${subj} count: ${g9Counts[subj]} != ${expected[subj]}`);
  }

  return { valid: errors.length === 0, errors };
}
