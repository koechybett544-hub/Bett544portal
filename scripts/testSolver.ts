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

// Let's test a clean day solver where P1 can be different subjects on different days!
console.log('Script loaded successfully');
