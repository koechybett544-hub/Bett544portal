import { TIMETABLE_ARRANGEMENTS } from '../src/utils/timetableVariants';
import { validateWeeklyTimetable, Slot } from './solveCleanTimetable';
import { TimetableDay } from '../src/types';
import * as fs from 'fs';

const days: TimetableDay[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

function permute(arr: number[]): number[][] {
  if (arr.length <= 1) return [arr];
  const result: number[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const cur = arr[i];
    const rem = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const p of permute(rem)) {
      result.push([cur, ...p]);
    }
  }
  return result;
}

const perms = permute([1, 2, 3, 4]);

function getValidDayPermutations(baseDaySlots: Slot[]): Slot[][] {
  const morning = baseDaySlots.filter((s) => s.period <= 4);
  const afternoon = baseDaySlots.filter((s) => s.period >= 5);
  const valid: Slot[][] = [];

  const teacherMap: Record<string, string> = {
    'Mathematics': 'Bett', 'Pre-Technical': 'Bett',
    'English': 'Faith',
    'Integrated Science': 'Bore', 'Agriculture': 'Bore',
    'Kiswahili': 'Nelly', 'Social Studies': 'Nelly', 'CRE': 'Nelly',
    'Creative Arts and Sports': 'Koech',
  };

  for (const p of perms) {
    const newMorning: Slot[] = p.map((origP, newIdx) => {
      const orig = morning.find((s) => s.period === origP)!;
      return {
        ...orig,
        period: newIdx + 1,
      };
    });

    const dayFull = [...newMorning, ...afternoon].sort((a, b) => a.period - b.period);
    let ok = true;

    // Check consecutive violations
    for (let i = 0; i < dayFull.length - 1; i++) {
      const c = dayFull[i];
      const n = dayFull[i + 1];
      if (n.period === c.period + 1) {
        for (const g of ['g7', 'g8', 'g9'] as const) {
          if (teacherMap[c[g]] === teacherMap[n[g]]) {
            if (c[g] === 'Integrated Science' && n[g] === 'Integrated Science' && c.period === 5) {
              // allowed double
            } else {
              ok = false;
              break;
            }
          }
        }
      }
      if (!ok) break;
    }

    if (ok) {
      valid.push(dayFull);
    }
  }
  return valid;
}

const base = TIMETABLE_ARRANGEMENTS[0];
const dayPerms: Record<TimetableDay, Slot[][]> = {
  Monday: getValidDayPermutations(base.filter((s) => s.day === 'Monday')),
  Tuesday: getValidDayPermutations(base.filter((s) => s.day === 'Tuesday')),
  Wednesday: getValidDayPermutations(base.filter((s) => s.day === 'Wednesday')),
  Thursday: getValidDayPermutations(base.filter((s) => s.day === 'Thursday')),
  Friday: getValidDayPermutations(base.filter((s) => s.day === 'Friday')),
};

const finalArrangements: Slot[][] = [];

for (const m of dayPerms.Monday) {
  const mP1 = m.find((s) => s.period === 1)!.g7;
  for (const t of dayPerms.Tuesday) {
    const tP1 = t.find((s) => s.period === 1)!.g7;
    if (tP1 === mP1) continue; // Tuesday G7 P1 must NOT be the same as Monday!

    for (const w of dayPerms.Wednesday) {
      const wP1 = w.find((s) => s.period === 1)!.g7;
      if (wP1 === mP1 || wP1 === tP1) continue; // Wednesday G7 P1 must be different!

      for (const th of dayPerms.Thursday) {
        const thP1 = th.find((s) => s.period === 1)!.g7;
        if (thP1 === mP1 || thP1 === tP1 || thP1 === wP1) continue; // Thursday different!

        for (const f of dayPerms.Friday) {
          const fP1 = f.find((s) => s.period === 1)!.g7;
          // All 5 weekdays G7 P1 can be distinct (or at least 4 distinct)!
          const g7Distinct = new Set([mP1, tP1, wP1, thP1, fP1]).size;
          if (g7Distinct >= 4) {
            const week = [...m, ...t, ...w, ...th, ...f];
            const val = validateWeeklyTimetable(week);
            if (val.valid) {
              const key = week.map((s) => `${s.day}${s.period}${s.g7}${s.g8}${s.g9}`).join('|');
              const exists = finalArrangements.some(
                (arr) => arr.map((s) => `${s.day}${s.period}${s.g7}${s.g8}${s.g9}`).join('|') === key
              );
              if (!exists) {
                finalArrangements.push(week);
                console.log(
                  `Arrangement ${finalArrangements.length}: G7 P1 = [Mon:${mP1}, Tue:${tP1}, Wed:${wP1}, Thu:${thP1}, Fri:${fP1}]`
                );
                if (finalArrangements.length === 5) break;
              }
            }
          }
        }
        if (finalArrangements.length === 5) break;
      }
      if (finalArrangements.length === 5) break;
    }
    if (finalArrangements.length === 5) break;
  }
  if (finalArrangements.length === 5) break;
}

console.log(`Generated ${finalArrangements.length} realistic rotating arrangements!`);

// Format for timetableVariants.ts
const fileContent = `import { TimetableDay } from '../types';

export interface SlotTemplate {
  day: TimetableDay;
  period: number;
  g7: string;
  g8: string;
  g9: string;
  g7Double?: boolean;
  g8Double?: boolean;
  g9Double?: boolean;
}

/**
 * 5 pre-validated distinct timetable arrangements.
 * REALISTIC LESSON DISTRIBUTION:
 * - Period 1 rotates naturally each day so a single subject (like Mathematics) is NOT the first lesson every day.
 * - Every arrangement strictly satisfies:
 *   1. Maths, English, Kiswahili every single day (periods 1-4).
 *   2. Science double period once per week per grade in periods 5-6 (G7 Mon, G8 Tue, G9 Wed).
 *   3. ALL Creative Arts & Sports (CA/s) strictly scheduled after long break (periods 5-8).
 *   4. No back-to-back lessons of the same teacher in the same class (e.g. Nelly never teaches Kiswahili then Social Studies or CRE; Bett never Maths then Pre-Technical; Bore never Science then Agriculture).
 *   5. Zero teacher collision at any time slot.
 *   6. CRE taught by Madam Nelly Korir; CA/s taught by Mr John Koech.
 *   7. Exact period counts per grade (Maths 5, English 5, Kiswahili 5, Science 5, SS 4, CRE 4, Agri 4, PRT 4, CA/s 4 = 40 total).
 */
export const TIMETABLE_ARRANGEMENTS: SlotTemplate[][] = ${JSON.stringify(finalArrangements, null, 2)};
`;

fs.writeFileSync('./src/utils/timetableVariants.ts', fileContent, 'utf-8');
console.log('Successfully updated src/utils/timetableVariants.ts with 5 realistic rotating arrangements!');
