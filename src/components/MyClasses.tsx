import React from 'react';
import { Learner, UserProfile } from '../types';
import { GRADES, CLASS_TEACHERS } from '../data/initialData';
import {
  GraduationCap,
  Users,
  BookOpen,
  FileSpreadsheet,
} from 'lucide-react';

interface MyClassesProps {
  learners: Learner[];
  currentUser?: UserProfile | null;
  onNavigateToMarksWithClass: (grade: string, stream: string) => void;
  onViewLearnersWithFilter: (grade: string, stream: string) => void;
  onNavigateToPrintSheet: (grade: string, stream: string) => void;
}

export const MyClasses: React.FC<MyClassesProps> = ({
  learners,
  currentUser,
  onNavigateToMarksWithClass,
  onViewLearnersWithFilter,
  onNavigateToPrintSheet,
}) => {
  // 3 official JSS Classes: Grade 7, Grade 8, Grade 9
  const classesList = [
    { grade: 'Grade 7', classTeacher: CLASS_TEACHERS['Grade 7'] || 'Madam Nelly Korir', isUserClass: false },
    { grade: 'Grade 8', classTeacher: CLASS_TEACHERS['Grade 8'] || 'Madam Faith Chepkirui', isUserClass: true },
    { grade: 'Grade 9', classTeacher: CLASS_TEACHERS['Grade 9'] || 'Mr Bore N.', isUserClass: false },
  ];

  return (
    <div className="space-y-5 pb-16">
      {/* Title */}
      <div className="border-b border-stone-200 dark:border-stone-800 pb-3">
        <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-[#6b1426] dark:text-rose-400" />
          <span>My Classes</span>
        </h1>
        <p className="text-xs text-stone-600 dark:text-stone-400">
          All 3 Junior Secondary School classes. Easily enter marks or view broadsheets and rosters.
        </p>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {classesList.map((cls, idx) => {
          const classLearners = learners.filter(
            (l) => l.grade === cls.grade && l.status === 'Active'
          );
          const boysCount = classLearners.filter((l) => l.gender === 'M').length;
          const girlsCount = classLearners.filter((l) => l.gender === 'F').length;

          return (
            <div
              key={idx}
              className={`rounded-2xl border p-5 shadow-xs transition space-y-4 ${
                cls.isUserClass
                  ? 'bg-white dark:bg-stone-900 border-rose-300 dark:border-rose-900 ring-1 ring-rose-200 dark:ring-rose-950'
                  : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-[#6b1426] dark:text-rose-300 font-extrabold text-base border border-rose-200 dark:border-rose-900">
                    {cls.grade.replace('Grade ', 'G')}
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-stone-900 dark:text-stone-100">
                      {cls.grade}
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Class Teacher: <strong className="text-[#6b1426] dark:text-rose-400">{cls.classTeacher}</strong>
                    </p>
                  </div>
                </div>

                {cls.isUserClass && (
                  <span className="text-[10px] font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-900 dark:text-sky-300 border border-sky-200 dark:border-sky-800 px-2 py-0.5 rounded-full">
                    Your Assigned Class
                  </span>
                )}
              </div>

              {/* Roster counts */}
              <div className="grid grid-cols-3 gap-2 bg-stone-50 dark:bg-stone-800/60 p-3 rounded-xl border border-stone-100 dark:border-stone-800 text-xs text-center">
                <div>
                  <span className="text-stone-400 dark:text-stone-500 block text-[10px] uppercase font-bold">Total</span>
                  <span className="font-extrabold text-stone-900 dark:text-stone-100 text-sm">{classLearners.length}</span>
                </div>
                <div>
                  <span className="text-stone-400 dark:text-stone-500 block text-[10px] uppercase font-bold">Boys</span>
                  <span className="font-bold text-stone-700 dark:text-stone-300">{boysCount}</span>
                </div>
                <div>
                  <span className="text-stone-400 dark:text-stone-500 block text-[10px] uppercase font-bold">Girls</span>
                  <span className="font-bold text-stone-700 dark:text-stone-300">{girlsCount}</span>
                </div>
              </div>

              {/* Action Buttons for this class */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-1">
                <button
                  onClick={() => onNavigateToMarksWithClass(cls.grade, '')}
                  className="py-2 px-2.5 rounded-xl bg-[#6b1426] hover:bg-[#540d1e] text-white font-bold text-xs flex items-center justify-center gap-1 transition shadow-xs"
                  title="Enter Marks for this Class"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Enter Marks</span>
                </button>

                <button
                  onClick={() => onViewLearnersWithFilter(cls.grade, '')}
                  className="py-2 px-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs flex items-center justify-center gap-1 transition"
                  title="View Learner List"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Learners</span>
                </button>

                <button
                  onClick={() => onNavigateToPrintSheet(cls.grade, '')}
                  className="py-2 px-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs flex items-center justify-center gap-1 transition"
                  title="Print Broadsheet"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Broadsheet</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
