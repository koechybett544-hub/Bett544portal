import { TIMETABLE_ARRANGEMENTS } from '../src/utils/timetableVariants';
import { validateWeeklyTimetable, Slot } from './solveCleanTimetable';
import { TimetableDay } from '../src/types';

const days: TimetableDay[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Generate permutations of [1, 2, 3, 4]
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

// For a base arrangement, find morning permutations for each day such that:
// 1. P1 for G7 is different across days
// 2. The whole week is valid according to validateWeeklyTimetable
function findRealisticVariants(): Slot[][] {
  const base = TIMETABLE_ARRANGEMENTS[0];
  const solutions: Slot[][] = [];

  // For each day, find all valid morning permutations
  const dayValidPerms: Record<TimetableDay, Slot[][]> = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
  };

  for (const day of days) {
    const dayBase = base.filter((s) => s.day === day);
    const morningSlots = dayBase.filter((s) => s.period <= 4);
    const afternoonSlots = dayBase.filter((s) => s.period >= 5);

    for (const p of perms) {
      // Create new morning slots with period 1..4 mapped from p[0]..p[3]
      const newMorning: Slot[] = p.map((origP, newIdx) => {
        const origSlot = morningSlots.find((s) => s.period === origP)!;
        return {
          ...origSlot,
          period: newIdx + 1,
        };
      });

      const dayFull = [...newMorning, ...afternoonSlots].sort((a, b) => a.period - b.period);
      // Validate this single day
      const val = validateWeeklyTimetable([
        ...dayFull,
        // dummy fill for other days to test day rules
      ]);

      // Check if dayFull has consecutive violations
      let dayOk = true;
      for (let i = 0; i < dayFull.length - 1; i++) {
        const c = dayFull[i];
        const n = dayFull[i + 1];
        if (n.period === c.period + 1) {
          // Check same teacher consecutive
          const teacherMap: Record<string, string> = {
            'Mathematics': 'Bett', 'Pre-Technical': 'Bett',
            'English': 'Faith',
            'Integrated Science': 'Bore', 'Agriculture': 'Bore',
            'Kiswahili': 'Nelly', 'Social Studies': 'Nelly', 'CRE': 'Nelly',
            'Creative Arts and Sports': 'Koech',
          };
          for (const g of ['g7', 'g8', 'g9'] as const) {
            if (teacherMap[c[g]] === teacherMap[n[g]]) {
              if (c[g] === 'Integrated Science' && n[g] === 'Integrated Science' && c.period === 5) {
                // allowed
              } else {
                dayOk = false;
                break;
              }
            }
          }
        }
        if (!dayOk) break;
      }

      if (dayOk) {
        dayValidPerms[day].push(dayFull);
      }
    }

    console.log(`Day ${day}: found ${dayValidPerms[day].length} valid arrangements`);
  }

  // Now combine days to find 5 distinct weekly schedules where P1 rotates
  // Target: G7 P1 is different on as many days as possible!
  for (const m of dayValidPerms.Monday) {
    const mP1 = m.find((s) => s.period === 1)!.g7;
    for (const t of dayValidPerms.Tuesday) {
      const tP1 = t.find((s) => s.period === 1)!.g7;
      if (tP1 === mP1) continue; // must be different from Monday!

      for (const w of dayValidPerms.Wednesday) {
        const wP1 = w.find((s) => s.period === 1)!.g7;
        if (wP1 === mP1 || wP1 === tP1) continue; // must be different from Mon and Tue!

        for (const th of dayValidPerms.Thursday) {
          const thP1 = th.find((s) => s.period === 1)!.g7;
          if (thP1 === mP1 || thP1 === tP1 || thP1 === wP1) continue; // must be different!

          for (const f of dayValidPerms.Friday) {
            const fP1 = f.find((s) => s.period === 1)!.g7;
            const fullWeek = [...m, ...t, ...w, ...th, ...f];
            const val = validateWeeklyTimetable(fullWeek);
            if (val.valid) {
              solutions.push(fullWeek);
              if (solutions.length >= 10) return solutions;
            }
          }
        }
      }
    }
  }

  return solutions;
}

const solutions = findRealisticVariants();
console.log(`Found ${solutions.length} completely valid weekly solutions with rotating P1!`);
if (solutions.length > 0) {
  const sol0 = solutions[0];
  console.log('Sample Solution 0 P1 rotation:');
  days.forEach((day) => {
    const p1 = sol0.find((s) => s.day === day && s.period === 1);
    console.log(`  ${day} P1: G7=${p1?.g7}, G8=${p1?.g8}, G9=${p1?.g9}`);
  });
}
