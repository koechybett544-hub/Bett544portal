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

// Let's create a day plan generator and day solver
function solveDay(
  day: TimetableDay,
  g7List: string[],
  g8List: string[],
  g9List: string[],
  p1Preference?: { g7?: string; g8?: string; g9?: string }
): Slot[] | null {
  const result: Slot[] = [];

  function backtrack(pIndex: number, rem7: string[], rem8: string[], rem9: string[]): boolean {
    if (pIndex === 9) {
      return rem7.length === 0 && rem8.length === 0 && rem9.length === 0;
    }

    const prevSlot = result[result.length - 1];

    // Candidate subjects for period pIndex
    let c7 = Array.from(new Set(rem7));
    let c8 = Array.from(new Set(rem8));
    let c9 = Array.from(new Set(rem9));

    // Rule: CA/s ONLY in periods 5-8!
    if (pIndex < 5) {
      c7 = c7.filter((s) => s !== 'Creative Arts and Sports');
      c8 = c8.filter((s) => s !== 'Creative Arts and Sports');
      c9 = c9.filter((s) => s !== 'Creative Arts and Sports');
    }

    // Double science handling
    if (day === 'Monday') {
      if (pIndex === 5 || pIndex === 6) c7 = ['Integrated Science'];
      else c7 = c7.filter((s) => s !== 'Integrated Science');
    }
    if (day === 'Tuesday') {
      if (pIndex === 5 || pIndex === 6) c8 = ['Integrated Science'];
      else c8 = c8.filter((s) => s !== 'Integrated Science');
    }
    if (day === 'Wednesday') {
      if (pIndex === 5 || pIndex === 6) c9 = ['Integrated Science'];
      else c9 = c9.filter((s) => s !== 'Integrated Science');
    }

    // P1 preference if provided
    if (pIndex === 1 && p1Preference) {
      if (p1Preference.g7 && c7.includes(p1Preference.g7)) {
        c7 = [p1Preference.g7, ...c7.filter(s => s !== p1Preference.g7)];
      }
      if (p1Preference.g8 && c8.includes(p1Preference.g8)) {
        c8 = [p1Preference.g8, ...c8.filter(s => s !== p1Preference.g8)];
      }
      if (p1Preference.g9 && c9.includes(p1Preference.g9)) {
        c9 = [p1Preference.g9, ...c9.filter(s => s !== p1Preference.g9)];
      }
    }

    // Try combinations
    for (const s7 of c7) {
      const t7 = teacherMap[s7];
      if (prevSlot) {
        const pt7 = teacherMap[prevSlot.g7];
        if (t7 === pt7) {
          if (s7 === 'Integrated Science' && prevSlot.g7 === 'Integrated Science' && (pIndex === 6)) {
            // allowed double
          } else {
            continue; // same teacher consecutive violation
          }
        }
      }

      for (const s8 of c8) {
        const t8 = teacherMap[s8];
        if (t8 === t7) continue; // teacher collision across grades

        if (prevSlot) {
          const pt8 = teacherMap[prevSlot.g8];
          if (t8 === pt8) {
            if (s8 === 'Integrated Science' && prevSlot.g8 === 'Integrated Science' && (pIndex === 6)) {
              // allowed double
            } else {
              continue; // same teacher consecutive violation
            }
          }
        }

        for (const s9 of c9) {
          const t9 = teacherMap[s9];
          if (t9 === t7 || t9 === t8) continue; // teacher collision across grades

          if (prevSlot) {
            const pt9 = teacherMap[prevSlot.g9];
            if (t9 === pt9) {
              if (s9 === 'Integrated Science' && prevSlot.g9 === 'Integrated Science' && (pIndex === 6)) {
                // allowed double
              } else {
                continue; // same teacher consecutive violation
              }
            }
          }

          // Valid slot!
          const slot: Slot = {
            day,
            period: pIndex,
            g7: s7,
            g8: s8,
            g9: s9,
            g7Double: s7 === 'Integrated Science' && (pIndex === 5 || pIndex === 6) && day === 'Monday',
            g8Double: s8 === 'Integrated Science' && (pIndex === 5 || pIndex === 6) && day === 'Tuesday',
            g9Double: s9 === 'Integrated Science' && (pIndex === 5 || pIndex === 6) && day === 'Wednesday',
          };

          result.push(slot);

          // Remove one occurrence from each
          const nextRem7 = [...rem7];
          nextRem7.splice(nextRem7.indexOf(s7), 1);
          const nextRem8 = [...rem8];
          nextRem8.splice(nextRem8.indexOf(s8), 1);
          const nextRem9 = [...rem9];
          nextRem9.splice(nextRem9.indexOf(s9), 1);

          if (backtrack(pIndex + 1, nextRem7, nextRem8, nextRem9)) {
            return true;
          }

          result.pop();
        }
      }
    }

    return false;
  }

  const success = backtrack(1, g7List, g8List, g9List);
  return success ? result : null;
}

// Generate an arrangement given weekly day plans
export function generateArrangement(
  weeklyPlan: Record<TimetableDay, { g7: string[]; g8: string[]; g9: string[]; p1Pref?: any }>
): Slot[] | null {
  const full: Slot[] = [];
  for (const day of days) {
    const plan = weeklyPlan[day];
    const daySlots = solveDay(day, plan.g7, plan.g8, plan.g9, plan.p1Pref);
    if (!daySlots) {
      console.error(`Failed to solve day ${day}`);
      return null;
    }
    full.push(...daySlots);
  }
  return full;
}
