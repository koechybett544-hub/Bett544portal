import { TimetableDay } from '../types';

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
 * Every arrangement strictly satisfies:
 * 1. Maths, English, Kiswahili every single day (periods 1-4).
 * 2. Science double period once per week per grade in periods 5-6 (G7 Mon, G8 Tue, G9 Wed).
 * 3. ALL Creative Arts & Sports (CA/s) strictly scheduled after long break (periods 5-8).
 * 4. No back-to-back lessons of the same teacher in the same class (e.g. Nelly never teaches Kiswahili then Social Studies or CRE; Bett never Maths then Pre-Technical; Bore never Science then Agriculture).
 * 5. Zero teacher collision at any time slot.
 * 6. CRE taught by Madam Nelly Korir; CA/s taught by Mr John Koech.
 * 7. Exact period counts per grade (Maths 5, English 5, Kiswahili 5, Science 5, SS 4, CRE 4, Agri 4, PRT 4, CA/s 4 = 40 total).
 */
export const TIMETABLE_ARRANGEMENTS: SlotTemplate[][] = [
  [
    {
      "day": "Monday",
      "period": 1,
      "g7": "Mathematics",
      "g8": "English",
      "g9": "Kiswahili",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Monday",
      "period": 2,
      "g7": "English",
      "g8": "Kiswahili",
      "g9": "Mathematics",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Monday",
      "period": 3,
      "g7": "Kiswahili",
      "g8": "Mathematics",
      "g9": "English",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Monday",
      "period": 4,
      "g7": "Pre-Technical",
      "g8": "Social Studies",
      "g9": "Agriculture",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Monday",
      "period": 5,
      "g7": "Integrated Science",
      "g8": "Creative Arts and Sports",
      "g9": "Social Studies",
      "g7Double": true,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Monday",
      "period": 6,
      "g7": "Integrated Science",
      "g8": "CRE",
      "g9": "Creative Arts and Sports",
      "g7Double": true,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Monday",
      "period": 7,
      "g7": "CRE",
      "g8": "Agriculture",
      "g9": "Pre-Technical",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Monday",
      "period": 8,
      "g7": "Agriculture",
      "g8": "Pre-Technical",
      "g9": "CRE",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Tuesday",
      "period": 1,
      "g7": "Mathematics",
      "g8": "English",
      "g9": "Kiswahili",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Tuesday",
      "period": 2,
      "g7": "English",
      "g8": "Kiswahili",
      "g9": "Mathematics",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Tuesday",
      "period": 3,
      "g7": "Kiswahili",
      "g8": "Mathematics",
      "g9": "English",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Tuesday",
      "period": 4,
      "g7": "Pre-Technical",
      "g8": "Social Studies",
      "g9": "Integrated Science",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Tuesday",
      "period": 5,
      "g7": "Creative Arts and Sports",
      "g8": "Integrated Science",
      "g9": "Social Studies",
      "g7Double": false,
      "g8Double": true,
      "g9Double": false
    },
    {
      "day": "Tuesday",
      "period": 6,
      "g7": "Social Studies",
      "g8": "Integrated Science",
      "g9": "Creative Arts and Sports",
      "g7Double": false,
      "g8Double": true,
      "g9Double": false
    },
    {
      "day": "Tuesday",
      "period": 7,
      "g7": "Agriculture",
      "g8": "Pre-Technical",
      "g9": "CRE",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Tuesday",
      "period": 8,
      "g7": "CRE",
      "g8": "Agriculture",
      "g9": "Pre-Technical",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Wednesday",
      "period": 1,
      "g7": "Mathematics",
      "g8": "English",
      "g9": "Kiswahili",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Wednesday",
      "period": 2,
      "g7": "English",
      "g8": "Kiswahili",
      "g9": "Mathematics",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Wednesday",
      "period": 3,
      "g7": "Kiswahili",
      "g8": "Mathematics",
      "g9": "English",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Wednesday",
      "period": 4,
      "g7": "Integrated Science",
      "g8": "Social Studies",
      "g9": "Pre-Technical",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Wednesday",
      "period": 5,
      "g7": "Social Studies",
      "g8": "Creative Arts and Sports",
      "g9": "Integrated Science",
      "g7Double": false,
      "g8Double": false,
      "g9Double": true
    },
    {
      "day": "Wednesday",
      "period": 6,
      "g7": "Creative Arts and Sports",
      "g8": "CRE",
      "g9": "Integrated Science",
      "g7Double": false,
      "g8Double": false,
      "g9Double": true
    },
    {
      "day": "Wednesday",
      "period": 7,
      "g7": "Pre-Technical",
      "g8": "Integrated Science",
      "g9": "Social Studies",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Wednesday",
      "period": 8,
      "g7": "CRE",
      "g8": "Pre-Technical",
      "g9": "Agriculture",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Thursday",
      "period": 1,
      "g7": "Mathematics",
      "g8": "English",
      "g9": "Kiswahili",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Thursday",
      "period": 2,
      "g7": "English",
      "g8": "Kiswahili",
      "g9": "Mathematics",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Thursday",
      "period": 3,
      "g7": "Kiswahili",
      "g8": "Mathematics",
      "g9": "Integrated Science",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Thursday",
      "period": 4,
      "g7": "Integrated Science",
      "g8": "Social Studies",
      "g9": "English",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Thursday",
      "period": 5,
      "g7": "Creative Arts and Sports",
      "g8": "Integrated Science",
      "g9": "Social Studies",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Thursday",
      "period": 6,
      "g7": "Social Studies",
      "g8": "Creative Arts and Sports",
      "g9": "Agriculture",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Thursday",
      "period": 7,
      "g7": "Agriculture",
      "g8": "CRE",
      "g9": "Creative Arts and Sports",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Thursday",
      "period": 8,
      "g7": "Pre-Technical",
      "g8": "Agriculture",
      "g9": "CRE",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Friday",
      "period": 1,
      "g7": "Mathematics",
      "g8": "English",
      "g9": "Kiswahili",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Friday",
      "period": 2,
      "g7": "English",
      "g8": "Mathematics",
      "g9": "Integrated Science",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Friday",
      "period": 3,
      "g7": "Kiswahili",
      "g8": "Integrated Science",
      "g9": "Mathematics",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Friday",
      "period": 4,
      "g7": "Integrated Science",
      "g8": "Kiswahili",
      "g9": "English",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Friday",
      "period": 5,
      "g7": "Creative Arts and Sports",
      "g8": "Agriculture",
      "g9": "CRE",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Friday",
      "period": 6,
      "g7": "Social Studies",
      "g8": "Creative Arts and Sports",
      "g9": "Agriculture",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Friday",
      "period": 7,
      "g7": "Agriculture",
      "g8": "CRE",
      "g9": "Pre-Technical",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Friday",
      "period": 8,
      "g7": "CRE",
      "g8": "Pre-Technical",
      "g9": "Creative Arts and Sports",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    }
  ],
  [
    {
      "day": "Monday",
      "period": 1,
      "g7": "Mathematics",
      "g8": "English",
      "g9": "Kiswahili",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Monday",
      "period": 2,
      "g7": "English",
      "g8": "Kiswahili",
      "g9": "Mathematics",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Monday",
      "period": 3,
      "g7": "Kiswahili",
      "g8": "Mathematics",
      "g9": "English",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Monday",
      "period": 4,
      "g7": "Pre-Technical",
      "g8": "Social Studies",
      "g9": "Agriculture",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Monday",
      "period": 5,
      "g7": "Integrated Science",
      "g8": "Creative Arts and Sports",
      "g9": "Social Studies",
      "g7Double": true,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Monday",
      "period": 6,
      "g7": "Integrated Science",
      "g8": "CRE",
      "g9": "Pre-Technical",
      "g7Double": true,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Monday",
      "period": 7,
      "g7": "CRE",
      "g8": "Agriculture",
      "g9": "Creative Arts and Sports",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Monday",
      "period": 8,
      "g7": "Agriculture",
      "g8": "Pre-Technical",
      "g9": "CRE",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Tuesday",
      "period": 1,
      "g7": "Mathematics",
      "g8": "English",
      "g9": "Kiswahili",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Tuesday",
      "period": 2,
      "g7": "English",
      "g8": "Kiswahili",
      "g9": "Mathematics",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Tuesday",
      "period": 3,
      "g7": "Kiswahili",
      "g8": "Mathematics",
      "g9": "English",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Tuesday",
      "period": 4,
      "g7": "Pre-Technical",
      "g8": "Social Studies",
      "g9": "Integrated Science",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Tuesday",
      "period": 5,
      "g7": "Creative Arts and Sports",
      "g8": "Integrated Science",
      "g9": "Social Studies",
      "g7Double": false,
      "g8Double": true,
      "g9Double": false
    },
    {
      "day": "Tuesday",
      "period": 6,
      "g7": "Social Studies",
      "g8": "Integrated Science",
      "g9": "Pre-Technical",
      "g7Double": false,
      "g8Double": true,
      "g9Double": false
    },
    {
      "day": "Tuesday",
      "period": 7,
      "g7": "Agriculture",
      "g8": "Pre-Technical",
      "g9": "CRE",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Tuesday",
      "period": 8,
      "g7": "CRE",
      "g8": "Agriculture",
      "g9": "Creative Arts and Sports",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Wednesday",
      "period": 1,
      "g7": "Mathematics",
      "g8": "English",
      "g9": "Kiswahili",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Wednesday",
      "period": 2,
      "g7": "English",
      "g8": "Kiswahili",
      "g9": "Mathematics",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Wednesday",
      "period": 3,
      "g7": "Kiswahili",
      "g8": "Mathematics",
      "g9": "English",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Wednesday",
      "period": 4,
      "g7": "Integrated Science",
      "g8": "Social Studies",
      "g9": "Pre-Technical",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Wednesday",
      "period": 5,
      "g7": "Social Studies",
      "g8": "Creative Arts and Sports",
      "g9": "Integrated Science",
      "g7Double": false,
      "g8Double": false,
      "g9Double": true
    },
    {
      "day": "Wednesday",
      "period": 6,
      "g7": "Pre-Technical",
      "g8": "CRE",
      "g9": "Integrated Science",
      "g7Double": false,
      "g8Double": false,
      "g9Double": true
    },
    {
      "day": "Wednesday",
      "period": 7,
      "g7": "Creative Arts and Sports",
      "g8": "Integrated Science",
      "g9": "Social Studies",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Wednesday",
      "period": 8,
      "g7": "CRE",
      "g8": "Pre-Technical",
      "g9": "Agriculture",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Thursday",
      "period": 1,
      "g7": "Mathematics",
      "g8": "English",
      "g9": "Kiswahili",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Thursday",
      "period": 2,
      "g7": "English",
      "g8": "Kiswahili",
      "g9": "Mathematics",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Thursday",
      "period": 3,
      "g7": "Kiswahili",
      "g8": "Mathematics",
      "g9": "Integrated Science",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Thursday",
      "period": 4,
      "g7": "Integrated Science",
      "g8": "Social Studies",
      "g9": "English",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Thursday",
      "period": 5,
      "g7": "Creative Arts and Sports",
      "g8": "Integrated Science",
      "g9": "Social Studies",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Thursday",
      "period": 6,
      "g7": "Social Studies",
      "g8": "Creative Arts and Sports",
      "g9": "Agriculture",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Thursday",
      "period": 7,
      "g7": "Pre-Technical",
      "g8": "Agriculture",
      "g9": "CRE",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Thursday",
      "period": 8,
      "g7": "Agriculture",
      "g8": "CRE",
      "g9": "Creative Arts and Sports",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Friday",
      "period": 1,
      "g7": "Mathematics",
      "g8": "English",
      "g9": "Kiswahili",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Friday",
      "period": 2,
      "g7": "English",
      "g8": "Mathematics",
      "g9": "Integrated Science",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Friday",
      "period": 3,
      "g7": "Kiswahili",
      "g8": "Integrated Science",
      "g9": "Mathematics",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Friday",
      "period": 4,
      "g7": "Integrated Science",
      "g8": "Kiswahili",
      "g9": "English",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Friday",
      "period": 5,
      "g7": "Creative Arts and Sports",
      "g8": "Agriculture",
      "g9": "CRE",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Friday",
      "period": 6,
      "g7": "Social Studies",
      "g8": "Creative Arts and Sports",
      "g9": "Pre-Technical",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Friday",
      "period": 7,
      "g7": "Agriculture",
      "g8": "CRE",
      "g9": "Creative Arts and Sports",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Friday",
      "period": 8,
      "g7": "CRE",
      "g8": "Pre-Technical",
      "g9": "Agriculture",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    }
  ],
  [
    {
      "day": "Monday",
      "period": 1,
      "g7": "Mathematics",
      "g8": "English",
      "g9": "Kiswahili",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Monday",
      "period": 2,
      "g7": "English",
      "g8": "Kiswahili",
      "g9": "Mathematics",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Monday",
      "period": 3,
      "g7": "Kiswahili",
      "g8": "Mathematics",
      "g9": "English",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Monday",
      "period": 4,
      "g7": "Pre-Technical",
      "g8": "Social Studies",
      "g9": "Agriculture",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Monday",
      "period": 5,
      "g7": "Integrated Science",
      "g8": "Creative Arts and Sports",
      "g9": "CRE",
      "g7Double": true,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Monday",
      "period": 6,
      "g7": "Integrated Science",
      "g8": "CRE",
      "g9": "Creative Arts and Sports",
      "g7Double": true,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Monday",
      "period": 7,
      "g7": "CRE",
      "g8": "Agriculture",
      "g9": "Pre-Technical",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Monday",
      "period": 8,
      "g7": "Agriculture",
      "g8": "Pre-Technical",
      "g9": "Social Studies",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Tuesday",
      "period": 1,
      "g7": "Mathematics",
      "g8": "English",
      "g9": "Kiswahili",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Tuesday",
      "period": 2,
      "g7": "English",
      "g8": "Kiswahili",
      "g9": "Mathematics",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Tuesday",
      "period": 3,
      "g7": "Kiswahili",
      "g8": "Mathematics",
      "g9": "English",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Tuesday",
      "period": 4,
      "g7": "Pre-Technical",
      "g8": "Social Studies",
      "g9": "Integrated Science",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Tuesday",
      "period": 5,
      "g7": "Creative Arts and Sports",
      "g8": "Integrated Science",
      "g9": "Social Studies",
      "g7Double": false,
      "g8Double": true,
      "g9Double": false
    },
    {
      "day": "Tuesday",
      "period": 6,
      "g7": "CRE",
      "g8": "Integrated Science",
      "g9": "Creative Arts and Sports",
      "g7Double": false,
      "g8Double": true,
      "g9Double": false
    },
    {
      "day": "Tuesday",
      "period": 7,
      "g7": "Agriculture",
      "g8": "Pre-Technical",
      "g9": "CRE",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Tuesday",
      "period": 8,
      "g7": "Social Studies",
      "g8": "Agriculture",
      "g9": "Pre-Technical",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Wednesday",
      "period": 1,
      "g7": "Mathematics",
      "g8": "English",
      "g9": "Kiswahili",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Wednesday",
      "period": 2,
      "g7": "English",
      "g8": "Kiswahili",
      "g9": "Mathematics",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Wednesday",
      "period": 3,
      "g7": "Kiswahili",
      "g8": "Mathematics",
      "g9": "English",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Wednesday",
      "period": 4,
      "g7": "Integrated Science",
      "g8": "Social Studies",
      "g9": "Pre-Technical",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Wednesday",
      "period": 5,
      "g7": "Social Studies",
      "g8": "Pre-Technical",
      "g9": "Integrated Science",
      "g7Double": false,
      "g8Double": false,
      "g9Double": true
    },
    {
      "day": "Wednesday",
      "period": 6,
      "g7": "Creative Arts and Sports",
      "g8": "CRE",
      "g9": "Integrated Science",
      "g7Double": false,
      "g8Double": false,
      "g9Double": true
    },
    {
      "day": "Wednesday",
      "period": 7,
      "g7": "Pre-Technical",
      "g8": "Integrated Science",
      "g9": "Social Studies",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Wednesday",
      "period": 8,
      "g7": "CRE",
      "g8": "Creative Arts and Sports",
      "g9": "Agriculture",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Thursday",
      "period": 1,
      "g7": "Mathematics",
      "g8": "English",
      "g9": "Kiswahili",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Thursday",
      "period": 2,
      "g7": "English",
      "g8": "Kiswahili",
      "g9": "Mathematics",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Thursday",
      "period": 3,
      "g7": "Kiswahili",
      "g8": "Mathematics",
      "g9": "Integrated Science",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Thursday",
      "period": 4,
      "g7": "Integrated Science",
      "g8": "Social Studies",
      "g9": "English",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Thursday",
      "period": 5,
      "g7": "Creative Arts and Sports",
      "g8": "Integrated Science",
      "g9": "Social Studies",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Thursday",
      "period": 6,
      "g7": "Agriculture",
      "g8": "CRE",
      "g9": "Creative Arts and Sports",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Thursday",
      "period": 7,
      "g7": "Social Studies",
      "g8": "Creative Arts and Sports",
      "g9": "Agriculture",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Thursday",
      "period": 8,
      "g7": "Pre-Technical",
      "g8": "Agriculture",
      "g9": "CRE",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Friday",
      "period": 1,
      "g7": "Mathematics",
      "g8": "English",
      "g9": "Kiswahili",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Friday",
      "period": 2,
      "g7": "English",
      "g8": "Mathematics",
      "g9": "Integrated Science",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Friday",
      "period": 3,
      "g7": "Kiswahili",
      "g8": "Integrated Science",
      "g9": "Mathematics",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Friday",
      "period": 4,
      "g7": "Integrated Science",
      "g8": "Kiswahili",
      "g9": "English",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Friday",
      "period": 5,
      "g7": "Creative Arts and Sports",
      "g8": "Agriculture",
      "g9": "CRE",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Friday",
      "period": 6,
      "g7": "Social Studies",
      "g8": "Pre-Technical",
      "g9": "Creative Arts and Sports",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Friday",
      "period": 7,
      "g7": "Agriculture",
      "g8": "CRE",
      "g9": "Pre-Technical",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Friday",
      "period": 8,
      "g7": "CRE",
      "g8": "Creative Arts and Sports",
      "g9": "Agriculture",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    }
  ],
  [
    {
      "day": "Monday",
      "period": 1,
      "g7": "Mathematics",
      "g8": "English",
      "g9": "Kiswahili",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Monday",
      "period": 2,
      "g7": "English",
      "g8": "Kiswahili",
      "g9": "Mathematics",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Monday",
      "period": 3,
      "g7": "Kiswahili",
      "g8": "Mathematics",
      "g9": "English",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Monday",
      "period": 4,
      "g7": "Pre-Technical",
      "g8": "Social Studies",
      "g9": "Agriculture",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Monday",
      "period": 5,
      "g7": "Integrated Science",
      "g8": "Creative Arts and Sports",
      "g9": "CRE",
      "g7Double": true,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Monday",
      "period": 6,
      "g7": "Integrated Science",
      "g8": "CRE",
      "g9": "Pre-Technical",
      "g7Double": true,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Monday",
      "period": 7,
      "g7": "CRE",
      "g8": "Agriculture",
      "g9": "Creative Arts and Sports",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Monday",
      "period": 8,
      "g7": "Agriculture",
      "g8": "Pre-Technical",
      "g9": "Social Studies",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Tuesday",
      "period": 1,
      "g7": "Mathematics",
      "g8": "English",
      "g9": "Kiswahili",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Tuesday",
      "period": 2,
      "g7": "English",
      "g8": "Kiswahili",
      "g9": "Mathematics",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Tuesday",
      "period": 3,
      "g7": "Kiswahili",
      "g8": "Mathematics",
      "g9": "English",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Tuesday",
      "period": 4,
      "g7": "Pre-Technical",
      "g8": "Social Studies",
      "g9": "Integrated Science",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Tuesday",
      "period": 5,
      "g7": "Creative Arts and Sports",
      "g8": "Integrated Science",
      "g9": "Social Studies",
      "g7Double": false,
      "g8Double": true,
      "g9Double": false
    },
    {
      "day": "Tuesday",
      "period": 6,
      "g7": "CRE",
      "g8": "Integrated Science",
      "g9": "Pre-Technical",
      "g7Double": false,
      "g8Double": true,
      "g9Double": false
    },
    {
      "day": "Tuesday",
      "period": 7,
      "g7": "Agriculture",
      "g8": "Pre-Technical",
      "g9": "CRE",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Tuesday",
      "period": 8,
      "g7": "Social Studies",
      "g8": "Agriculture",
      "g9": "Creative Arts and Sports",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Wednesday",
      "period": 1,
      "g7": "Mathematics",
      "g8": "English",
      "g9": "Kiswahili",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Wednesday",
      "period": 2,
      "g7": "English",
      "g8": "Kiswahili",
      "g9": "Mathematics",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Wednesday",
      "period": 3,
      "g7": "Kiswahili",
      "g8": "Mathematics",
      "g9": "English",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Wednesday",
      "period": 4,
      "g7": "Integrated Science",
      "g8": "Social Studies",
      "g9": "Pre-Technical",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Wednesday",
      "period": 5,
      "g7": "Social Studies",
      "g8": "Pre-Technical",
      "g9": "Integrated Science",
      "g7Double": false,
      "g8Double": false,
      "g9Double": true
    },
    {
      "day": "Wednesday",
      "period": 6,
      "g7": "Pre-Technical",
      "g8": "CRE",
      "g9": "Integrated Science",
      "g7Double": false,
      "g8Double": false,
      "g9Double": true
    },
    {
      "day": "Wednesday",
      "period": 7,
      "g7": "Creative Arts and Sports",
      "g8": "Integrated Science",
      "g9": "Social Studies",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Wednesday",
      "period": 8,
      "g7": "CRE",
      "g8": "Creative Arts and Sports",
      "g9": "Agriculture",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Thursday",
      "period": 1,
      "g7": "Mathematics",
      "g8": "English",
      "g9": "Kiswahili",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Thursday",
      "period": 2,
      "g7": "English",
      "g8": "Kiswahili",
      "g9": "Mathematics",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Thursday",
      "period": 3,
      "g7": "Kiswahili",
      "g8": "Mathematics",
      "g9": "Integrated Science",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Thursday",
      "period": 4,
      "g7": "Integrated Science",
      "g8": "Social Studies",
      "g9": "English",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Thursday",
      "period": 5,
      "g7": "Creative Arts and Sports",
      "g8": "Integrated Science",
      "g9": "Social Studies",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Thursday",
      "period": 6,
      "g7": "Agriculture",
      "g8": "CRE",
      "g9": "Creative Arts and Sports",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Thursday",
      "period": 7,
      "g7": "Pre-Technical",
      "g8": "Agriculture",
      "g9": "CRE",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Thursday",
      "period": 8,
      "g7": "Social Studies",
      "g8": "Creative Arts and Sports",
      "g9": "Agriculture",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Friday",
      "period": 1,
      "g7": "Mathematics",
      "g8": "English",
      "g9": "Kiswahili",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Friday",
      "period": 2,
      "g7": "English",
      "g8": "Mathematics",
      "g9": "Integrated Science",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Friday",
      "period": 3,
      "g7": "Kiswahili",
      "g8": "Integrated Science",
      "g9": "Mathematics",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Friday",
      "period": 4,
      "g7": "Integrated Science",
      "g8": "Kiswahili",
      "g9": "English",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Friday",
      "period": 5,
      "g7": "Creative Arts and Sports",
      "g8": "Agriculture",
      "g9": "CRE",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Friday",
      "period": 6,
      "g7": "Social Studies",
      "g8": "Pre-Technical",
      "g9": "Agriculture",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Friday",
      "period": 7,
      "g7": "Agriculture",
      "g8": "CRE",
      "g9": "Creative Arts and Sports",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Friday",
      "period": 8,
      "g7": "CRE",
      "g8": "Creative Arts and Sports",
      "g9": "Pre-Technical",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    }
  ],
  [
    {
      "day": "Monday",
      "period": 1,
      "g7": "Mathematics",
      "g8": "English",
      "g9": "Kiswahili",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Monday",
      "period": 2,
      "g7": "English",
      "g8": "Kiswahili",
      "g9": "Mathematics",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Monday",
      "period": 3,
      "g7": "Kiswahili",
      "g8": "Mathematics",
      "g9": "English",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Monday",
      "period": 4,
      "g7": "Pre-Technical",
      "g8": "Social Studies",
      "g9": "Agriculture",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Monday",
      "period": 5,
      "g7": "Integrated Science",
      "g8": "Pre-Technical",
      "g9": "Social Studies",
      "g7Double": true,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Monday",
      "period": 6,
      "g7": "Integrated Science",
      "g8": "CRE",
      "g9": "Creative Arts and Sports",
      "g7Double": true,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Monday",
      "period": 7,
      "g7": "CRE",
      "g8": "Agriculture",
      "g9": "Pre-Technical",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Monday",
      "period": 8,
      "g7": "Agriculture",
      "g8": "Creative Arts and Sports",
      "g9": "CRE",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Tuesday",
      "period": 1,
      "g7": "Mathematics",
      "g8": "English",
      "g9": "Kiswahili",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Tuesday",
      "period": 2,
      "g7": "English",
      "g8": "Kiswahili",
      "g9": "Mathematics",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Tuesday",
      "period": 3,
      "g7": "Kiswahili",
      "g8": "Mathematics",
      "g9": "English",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Tuesday",
      "period": 4,
      "g7": "Pre-Technical",
      "g8": "Social Studies",
      "g9": "Integrated Science",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Tuesday",
      "period": 5,
      "g7": "Creative Arts and Sports",
      "g8": "Integrated Science",
      "g9": "CRE",
      "g7Double": false,
      "g8Double": true,
      "g9Double": false
    },
    {
      "day": "Tuesday",
      "period": 6,
      "g7": "Social Studies",
      "g8": "Integrated Science",
      "g9": "Creative Arts and Sports",
      "g7Double": false,
      "g8Double": true,
      "g9Double": false
    },
    {
      "day": "Tuesday",
      "period": 7,
      "g7": "Agriculture",
      "g8": "Pre-Technical",
      "g9": "Social Studies",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Tuesday",
      "period": 8,
      "g7": "CRE",
      "g8": "Agriculture",
      "g9": "Pre-Technical",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Wednesday",
      "period": 1,
      "g7": "Mathematics",
      "g8": "English",
      "g9": "Kiswahili",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Wednesday",
      "period": 2,
      "g7": "English",
      "g8": "Kiswahili",
      "g9": "Mathematics",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Wednesday",
      "period": 3,
      "g7": "Kiswahili",
      "g8": "Mathematics",
      "g9": "English",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Wednesday",
      "period": 4,
      "g7": "Integrated Science",
      "g8": "Social Studies",
      "g9": "Pre-Technical",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Wednesday",
      "period": 5,
      "g7": "CRE",
      "g8": "Creative Arts and Sports",
      "g9": "Integrated Science",
      "g7Double": false,
      "g8Double": false,
      "g9Double": true
    },
    {
      "day": "Wednesday",
      "period": 6,
      "g7": "Creative Arts and Sports",
      "g8": "CRE",
      "g9": "Integrated Science",
      "g7Double": false,
      "g8Double": false,
      "g9Double": true
    },
    {
      "day": "Wednesday",
      "period": 7,
      "g7": "Pre-Technical",
      "g8": "Integrated Science",
      "g9": "Social Studies",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Wednesday",
      "period": 8,
      "g7": "Social Studies",
      "g8": "Pre-Technical",
      "g9": "Agriculture",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Thursday",
      "period": 1,
      "g7": "Mathematics",
      "g8": "English",
      "g9": "Kiswahili",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Thursday",
      "period": 2,
      "g7": "English",
      "g8": "Kiswahili",
      "g9": "Mathematics",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Thursday",
      "period": 3,
      "g7": "Kiswahili",
      "g8": "Mathematics",
      "g9": "Integrated Science",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Thursday",
      "period": 4,
      "g7": "Integrated Science",
      "g8": "Social Studies",
      "g9": "English",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Thursday",
      "period": 5,
      "g7": "Creative Arts and Sports",
      "g8": "Integrated Science",
      "g9": "Social Studies",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Thursday",
      "period": 6,
      "g7": "Pre-Technical",
      "g8": "CRE",
      "g9": "Agriculture",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Thursday",
      "period": 7,
      "g7": "Social Studies",
      "g8": "Agriculture",
      "g9": "Creative Arts and Sports",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Thursday",
      "period": 8,
      "g7": "Agriculture",
      "g8": "Creative Arts and Sports",
      "g9": "CRE",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Friday",
      "period": 1,
      "g7": "Mathematics",
      "g8": "English",
      "g9": "Kiswahili",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Friday",
      "period": 2,
      "g7": "English",
      "g8": "Mathematics",
      "g9": "Integrated Science",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Friday",
      "period": 3,
      "g7": "Kiswahili",
      "g8": "Integrated Science",
      "g9": "Mathematics",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Friday",
      "period": 4,
      "g7": "Integrated Science",
      "g8": "Kiswahili",
      "g9": "English",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Friday",
      "period": 5,
      "g7": "Creative Arts and Sports",
      "g8": "Agriculture",
      "g9": "CRE",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Friday",
      "period": 6,
      "g7": "CRE",
      "g8": "Creative Arts and Sports",
      "g9": "Agriculture",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Friday",
      "period": 7,
      "g7": "Agriculture",
      "g8": "CRE",
      "g9": "Pre-Technical",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    },
    {
      "day": "Friday",
      "period": 8,
      "g7": "Social Studies",
      "g8": "Pre-Technical",
      "g9": "Creative Arts and Sports",
      "g7Double": false,
      "g8Double": false,
      "g9Double": false
    }
  ]
];
