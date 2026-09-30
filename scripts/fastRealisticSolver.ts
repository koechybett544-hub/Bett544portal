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

// Solve 4 periods (morning or afternoon)
function solveQuad(
  day: TimetableDay,
  startP: number,
  g7List: string[],
  g8List: string[],
  g9List: string[],
  prevSlot?: Slot
): Slot[] | null {
  const result: Slot[] = [];

  function backtrack(idx: number, rem7: string[], rem8: string[], rem9: string[]): boolean {
    if (idx === 4) {
      return rem7.length === 0 && rem8.length === 0 && rem9.length === 0;
    }

    const curPeriod = startP + idx;
    const last = result.length > 0 ? result[result.length - 1] : prevSlot;

    let c7 = Array.from(new Set(rem7));
    let c8 = Array.from(new Set(rem8));
    let c9 = Array.from(new Set(rem9));

    // Double science in P5-P6
    if (day === 'Monday' && (curPeriod === 5 || curPeriod === 6)) {
      c7 = ['Integrated Science'];
    }
    if (day === 'Tuesday' && (curPeriod === 5 || curPeriod === 6)) {
      c8 = ['Integrated Science'];
    }
    if (day === 'Wednesday' && (curPeriod === 5 || curPeriod === 6)) {
      c9 = ['Integrated Science'];
    }

    for (const s7 of c7) {
      const t7 = teacherMap[s7];
      if (last) {
        const pt7 = teacherMap[last.g7];
        if (t7 === pt7) {
          if (s7 === 'Integrated Science' && last.g7 === 'Integrated Science' && curPeriod === 6) {
            // allowed double
          } else {
            continue;
          }
        }
      }

      for (const s8 of c8) {
        const t8 = teacherMap[s8];
        if (t8 === t7) continue;

        if (last) {
          const pt8 = teacherMap[last.g8];
          if (t8 === pt8) {
            if (s8 === 'Integrated Science' && last.g8 === 'Integrated Science' && curPeriod === 6) {
              // allowed double
            } else {
              continue;
            }
          }
        }

        for (const s9 of c9) {
          const t9 = teacherMap[s9];
          if (t9 === t7 || t9 === t8) continue;

          if (last) {
            const pt9 = teacherMap[last.g9];
            if (t9 === pt9) {
              if (s9 === 'Integrated Science' && last.g9 === 'Integrated Science' && curPeriod === 6) {
                // allowed double
              } else {
                continue;
              }
            }
          }

          const slot: Slot = {
            day,
            period: curPeriod,
            g7: s7,
            g8: s8,
            g9: s9,
            g7Double: s7 === 'Integrated Science' && (curPeriod === 5 || curPeriod === 6) && day === 'Monday',
            g8Double: s8 === 'Integrated Science' && (curPeriod === 5 || curPeriod === 6) && day === 'Tuesday',
            g9Double: s9 === 'Integrated Science' && (curPeriod === 5 || curPeriod === 6) && day === 'Wednesday',
          };

          result.push(slot);

          const nextRem7 = [...rem7];
          nextRem7.splice(nextRem7.indexOf(s7), 1);
          const nextRem8 = [...rem8];
          nextRem8.splice(nextRem8.indexOf(s8), 1);
          const nextRem9 = [...rem9];
          nextRem9.splice(nextRem9.indexOf(s9), 1);

          if (backtrack(idx + 1, nextRem7, nextRem8, nextRem9)) {
            return true;
          }

          result.pop();
        }
      }
    }

    return false;
  }

  const ok = backtrack(0, g7List, g8List, g9List);
  return ok ? result : null;
}

export function solveFullDay(
  day: TimetableDay,
  morn7: string[], morn8: string[], morn9: string[],
  aft7: string[], aft8: string[], aft9: string[]
): Slot[] | null {
  const morning = solveQuad(day, 1, morn7, morn8, morn9);
  if (!morning) return null;
  const p4 = morning[3];
  const afternoon = solveQuad(day, 5, aft7, aft8, aft9, p4);
  if (!afternoon) return null;
  return [...morning, ...afternoon];
}
