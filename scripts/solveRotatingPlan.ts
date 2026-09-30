import { TimetableDay } from '../src/types';
import { solveFullDay, Slot } from './fastRealisticSolver';
import { validateWeeklyTimetable } from './solveCleanTimetable';

const days: TimetableDay[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

interface DayConfig {
  morn7: string[]; morn8: string[]; morn9: string[];
  aft7: string[]; aft8: string[]; aft9: string[];
}

function solveSchedule(config: Record<TimetableDay, DayConfig>): Slot[] | null {
  const full: Slot[] = [];
  for (const day of days) {
    const c = config[day];
    const daySlots = solveFullDay(day, c.morn7, c.morn8, c.morn9, c.aft7, c.aft8, c.aft9);
    if (!daySlots) {
      console.error(`Failed to solve day: ${day}`);
      return null;
    }
    full.push(...daySlots);
  }
  return full;
}

const config1: Record<TimetableDay, DayConfig> = {
  Monday: {
    morn7: ['Mathematics', 'English', 'Kiswahili', 'Social Studies'],
    morn8: ['English', 'Kiswahili', 'Mathematics', 'Agriculture'],
    morn9: ['Kiswahili', 'Mathematics', 'English', 'Pre-Technical'],
    aft7: ['Integrated Science', 'Integrated Science', 'CRE', 'Creative Arts and Sports'],
    aft8: ['Integrated Science', 'Pre-Technical', 'CRE', 'Creative Arts and Sports'],
    aft9: ['Integrated Science', 'Social Studies', 'Agriculture', 'Creative Arts and Sports'],
  },
  Tuesday: {
    morn7: ['English', 'Kiswahili', 'Mathematics', 'Agriculture'],
    morn8: ['Kiswahili', 'Mathematics', 'English', 'Social Studies'],
    morn9: ['Mathematics', 'English', 'Kiswahili', 'Agriculture'],
    aft7: ['Pre-Technical', 'CRE', 'Social Studies', 'Creative Arts and Sports'],
    aft8: ['Integrated Science', 'Integrated Science', 'Pre-Technical', 'Creative Arts and Sports'],
    aft9: ['Integrated Science', 'Pre-Technical', 'CRE', 'Creative Arts and Sports'],
  },
  Wednesday: {
    morn7: ['Kiswahili', 'Mathematics', 'English', 'Pre-Technical'],
    morn8: ['Mathematics', 'English', 'Kiswahili', 'Pre-Technical'],
    morn9: ['English', 'Kiswahili', 'Mathematics', 'Social Studies'],
    aft7: ['Integrated Science', 'Agriculture', 'Social Studies', 'Creative Arts and Sports'],
    aft8: ['Integrated Science', 'Agriculture', 'Social Studies', 'Creative Arts and Sports'],
    aft9: ['Integrated Science', 'Integrated Science', 'CRE', 'Creative Arts and Sports'],
  },
  Thursday: {
    morn7: ['Integrated Science', 'English', 'Kiswahili', 'Pre-Technical'],
    morn8: ['Agriculture', 'Kiswahili', 'Mathematics', 'English'],
    morn9: ['Pre-Technical', 'Mathematics', 'English', 'Kiswahili'],
    aft7: ['Mathematics', 'Agriculture', 'CRE', 'Social Studies'],
    aft8: ['Pre-Technical', 'Social Studies', 'CRE', 'Creative Arts and Sports'],
    aft9: ['Integrated Science', 'Agriculture', 'Social Studies', 'CRE'],
  },
  Friday: {
    morn7: ['Agriculture', 'Mathematics', 'English', 'Kiswahili'],
    morn8: ['Pre-Technical', 'English', 'Kiswahili', 'Mathematics'],
    morn9: ['Social Studies', 'Kiswahili', 'Mathematics', 'English'],
    aft7: ['Pre-Technical', 'CRE', 'Creative Arts and Sports', 'Social Studies'],
    aft8: ['Integrated Science', 'Agriculture', 'CRE', 'Social Studies'],
    aft9: ['Pre-Technical', 'Agriculture', 'CRE', 'Creative Arts and Sports'],
  },
};

const solved = solveSchedule(config1);
if (!solved) {
  console.error('Plan failed');
  process.exit(1);
}

const validation = validateWeeklyTimetable(solved);
console.log('Validation result:', validation);
if (validation.valid) {
  console.log('SUCCESS! Rotating P1 for all days:');
  days.forEach(day => {
    const p1 = solved.find(s => s.day === day && s.period === 1);
    console.log(`  ${day} P1: G7=${p1?.g7}, G8=${p1?.g8}, G9=${p1?.g9}`);
  });
}
