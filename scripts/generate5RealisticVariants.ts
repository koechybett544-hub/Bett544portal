import { TimetableDay } from '../src/types';
import { solveFullDay, Slot } from './fastRealisticSolver';

const days: TimetableDay[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Let's create 5 distinct variants where P1 rotates every day!
// For example:
// Mon P1: G7=Mathematics, G8=English, G9=Kiswahili
// Tue P1: G7=English, G8=Kiswahili, G9=Mathematics
// Wed P1: G7=Kiswahili, G8=Mathematics, G9=English
// Thu P1: G7=Integrated Science, G8=Pre-Technical, G9=Social Studies
// Fri P1: G7=Pre-Technical, G8=Agriculture, G9=Integrated Science

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

// Config 0:
const config0: Record<TimetableDay, DayConfig> = {
  Monday: {
    morn7: ['Mathematics', 'English', 'Kiswahili', 'Social Studies'],
    morn8: ['English', 'Kiswahili', 'Mathematics', 'Pre-Technical'],
    morn9: ['Kiswahili', 'Mathematics', 'English', 'Agriculture'],
    aft7: ['Integrated Science', 'Integrated Science', 'CRE', 'Creative Arts and Sports'],
    aft8: ['Integrated Science', 'CRE', 'Agriculture', 'Creative Arts and Sports'],
    aft9: ['Integrated Science', 'Social Studies', 'CRE', 'Creative Arts and Sports'],
  },
  Tuesday: {
    morn7: ['English', 'Kiswahili', 'Mathematics', 'Integrated Science'],
    morn8: ['Kiswahili', 'Mathematics', 'English', 'Social Studies'],
    morn9: ['Mathematics', 'English', 'Kiswahili', 'Integrated Science'],
    aft7: ['Pre-Technical', 'CRE', 'Social Studies', 'Creative Arts and Sports'],
    aft8: ['Integrated Science', 'Integrated Science', 'Pre-Technical', 'Creative Arts and Sports'],
    aft9: ['Agriculture', 'Pre-Technical', 'CRE', 'Creative Arts and Sports'],
  },
  Wednesday: {
    morn7: ['Kiswahili', 'Mathematics', 'English', 'Agriculture'],
    morn8: ['Mathematics', 'English', 'Kiswahili', 'Agriculture'],
    morn9: ['English', 'Kiswahili', 'Mathematics', 'Pre-Technical'],
    aft7: ['Integrated Science', 'Pre-Technical', 'Social Studies', 'Creative Arts and Sports'],
    aft8: ['Integrated Science', 'Social Studies', 'CRE', 'Creative Arts and Sports'],
    aft9: ['Integrated Science', 'Integrated Science', 'Social Studies', 'Creative Arts and Sports'],
  },
  Thursday: {
    morn7: ['Pre-Technical', 'Integrated Science', 'English', 'Kiswahili'],
    morn8: ['Social Studies', 'Mathematics', 'English', 'Kiswahili'],
    morn9: ['Integrated Science', 'Pre-Technical', 'Mathematics', 'English'],
    aft7: ['Mathematics', 'CRE', 'Agriculture', 'Social Studies'],
    aft8: ['Pre-Technical', 'Agriculture', 'CRE', 'Creative Arts and Sports'],
    aft9: ['Kiswahili', 'Agriculture', 'Social Studies', 'CRE'],
  },
  Friday: {
    morn7: ['Agriculture', 'Mathematics', 'English', 'Kiswahili'],
    morn8: ['Pre-Technical', 'English', 'Kiswahili', 'Mathematics'],
    morn9: ['Social Studies', 'Kiswahili', 'Mathematics', 'English'],
    aft7: ['Pre-Technical', 'CRE', 'Agriculture', 'Creative Arts and Sports'],
    aft8: ['Integrated Science', 'CRE', 'Social Studies', 'Agriculture'],
    aft9: ['Pre-Technical', 'Agriculture', 'CRE', 'Creative Arts and Sports'],
  },
};

const solved0 = solveSchedule(config0);
if (!solved0) {
  console.error('Config 0 failed');
  process.exit(1);
}

console.log('Successfully generated Config 0!');
days.forEach(day => {
  const p1 = solved0.find(s => s.day === day && s.period === 1);
  console.log(`  ${day} P1: G7=${p1?.g7}, G8=${p1?.g8}, G9=${p1?.g9}`);
});
