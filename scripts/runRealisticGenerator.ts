import { TimetableDay } from '../src/types';
import { generateArrangement, Slot } from './buildRealisticTimetables';
import * as fs from 'fs';

// Weekly quotas:
// Maths: 5, English: 5, Kiswahili: 5
// Science: 5 (2 on double day, 1 on 3 other days, 0 on 1 day)
// G7 Science: Mon(2), Tue(1), Wed(1), Thu(1), Fri(0)
// G8 Science: Mon(1), Tue(2), Wed(1), Thu(0), Fri(1)
// G9 Science: Mon(1), Tue(1), Wed(2), Thu(1), Fri(0)
//
// Social Studies: 4 (G7: Mon, Tue, Wed, Thu)
// CRE: 4 (G7: Mon, Tue, Thu, Fri)
// Agriculture: 4 (G7: Mon, Wed, Thu, Fri)
// Pre-Technical: 4 (G7: Tue, Wed, Thu, Fri)
// CA/s: 4 (G7: Mon, Tue, Wed, Fri) -> All in P5-P8

// Variant 1: Rotating P1:
// Mon P1: G7=Mathematics, G8=English, G9=Kiswahili
// Tue P1: G7=English, G8=Kiswahili, G9=Mathematics
// Wed P1: G7=Kiswahili, G8=Mathematics, G9=English
// Thu P1: G7=Pre-Technical, G8=Social Studies, G9=Integrated Science
// Fri P1: G7=Agriculture, G8=Pre-Technical, G9=Mathematics

const plan1: Record<TimetableDay, { g7: string[]; g8: string[]; g9: string[]; p1Pref?: any }> = {
  Monday: {
    g7: ['Mathematics', 'English', 'Kiswahili', 'Integrated Science', 'Integrated Science', 'CRE', 'Social Studies', 'Creative Arts and Sports'],
    g8: ['English', 'Kiswahili', 'Mathematics', 'Integrated Science', 'Social Studies', 'CRE', 'Agriculture', 'Creative Arts and Sports'],
    g9: ['Kiswahili', 'Mathematics', 'English', 'Integrated Science', 'Agriculture', 'Pre-Technical', 'CRE', 'Creative Arts and Sports'],
    p1Pref: { g7: 'Mathematics', g8: 'English', g9: 'Kiswahili' },
  },
  Tuesday: {
    g7: ['English', 'Kiswahili', 'Mathematics', 'Integrated Science', 'Social Studies', 'Pre-Technical', 'CRE', 'Creative Arts and Sports'],
    g8: ['Kiswahili', 'Mathematics', 'English', 'Integrated Science', 'Integrated Science', 'Pre-Technical', 'Social Studies', 'Creative Arts and Sports'],
    g9: ['Mathematics', 'English', 'Kiswahili', 'Integrated Science', 'Social Studies', 'Agriculture', 'Pre-Technical', 'Creative Arts and Sports'],
    p1Pref: { g7: 'English', g8: 'Kiswahili', g9: 'Mathematics' },
  },
  Wednesday: {
    g7: ['Kiswahili', 'Mathematics', 'English', 'Integrated Science', 'Social Studies', 'Pre-Technical', 'Agriculture', 'Creative Arts and Sports'],
    g8: ['Mathematics', 'English', 'Kiswahili', 'Integrated Science', 'Agriculture', 'Pre-Technical', 'CRE', 'Creative Arts and Sports'],
    g9: ['English', 'Kiswahili', 'Mathematics', 'Integrated Science', 'Integrated Science', 'CRE', 'Social Studies', 'Creative Arts and Sports'],
    p1Pref: { g7: 'Kiswahili', g8: 'Mathematics', g9: 'English' },
  },
  Thursday: {
    g7: ['Pre-Technical', 'English', 'Kiswahili', 'Mathematics', 'Integrated Science', 'Social Studies', 'CRE', 'Agriculture'],
    g8: ['English', 'Kiswahili', 'Mathematics', 'Social Studies', 'Agriculture', 'Pre-Technical', 'CRE', 'Creative Arts and Sports'],
    g9: ['Social Studies', 'Mathematics', 'English', 'Kiswahili', 'Integrated Science', 'Agriculture', 'Pre-Technical', 'CRE'],
    p1Pref: { g7: 'Pre-Technical', g8: 'English', g9: 'Social Studies' },
  },
  Friday: {
    g7: ['Agriculture', 'Mathematics', 'English', 'Kiswahili', 'Pre-Technical', 'CRE', 'Creative Arts and Sports', 'Social Studies'],
    g8: ['Pre-Technical', 'Mathematics', 'English', 'Kiswahili', 'Integrated Science', 'Agriculture', 'CRE', 'Social Studies'],
    g9: ['Mathematics', 'English', 'Kiswahili', 'Agriculture', 'Pre-Technical', 'CRE', 'Creative Arts and Sports', 'Social Studies'],
    p1Pref: { g7: 'Agriculture', g8: 'Pre-Technical', g9: 'Mathematics' },
  },
};

// Let's test generating Variant 1!
const solved1 = generateArrangement(plan1);
if (!solved1) {
  console.error('Failed to solve plan 1');
  process.exit(1);
}

console.log('Successfully generated Variant 1 with rotating P1!');
['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach(day => {
  const p1 = solved1.find(s => s.day === day && s.period === 1);
  console.log(`  ${day} P1: G7=${p1?.g7}, G8=${p1?.g8}, G9=${p1?.g9}`);
});
