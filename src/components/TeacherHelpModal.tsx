import React, { useState } from 'react';
import { X, HelpCircle, BookOpen, FileText, Award, Smartphone, ShieldCheck } from 'lucide-react';
import { ASSESSMENT_LEVELS } from '../utils/grading';

interface TeacherHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'marks' | 'reports' | 'levels';
}

export const TeacherHelpModal: React.FC<TeacherHelpModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'marks',
}) => {
  const [activeTab, setActiveTab] = useState<'marks' | 'reports' | 'levels'>(defaultTab);

  if (!isOpen) return null;

  return (
    <div
      id="teacher-help-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-stone-900 shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 bg-[#6b1426] px-5 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white border border-white/20">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Teacher Quick Help &amp; Guide</h2>
              <p className="text-xs text-rose-100">Simple instructions for your daily classroom tasks</p>
            </div>
          </div>
          <button
            id="close-help-modal-btn"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition"
            title="Close Help"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 px-3 pt-2 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('marks')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 ${
              activeTab === 'marks'
                ? 'border-[#6b1426] dark:border-rose-400 bg-white dark:bg-stone-900 text-[#6b1426] dark:text-rose-400 shadow-xs'
                : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>How to Enter Marks</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 ${
              activeTab === 'reports'
                ? 'border-[#6b1426] dark:border-rose-400 bg-white dark:bg-stone-900 text-[#6b1426] dark:text-rose-400 shadow-xs'
                : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Reports &amp; Profiles</span>
          </button>

          <button
            onClick={() => setActiveTab('levels')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 ${
              activeTab === 'levels'
                ? 'border-[#6b1426] dark:border-rose-400 bg-white dark:bg-stone-900 text-[#6b1426] dark:text-rose-400 shadow-xs'
                : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Assessment Levels (EE, ME...)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 text-sm text-stone-700 dark:text-stone-300 space-y-4">
          {activeTab === 'marks' && (
            <div className="space-y-4">
              <div className="rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 p-3.5 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#6b1426] dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="text-xs text-rose-950 dark:text-rose-200">
                  <strong className="block text-sm font-semibold text-[#6b1426] dark:text-rose-300 mb-0.5">5-Step Marks Workflow</strong>
                  The system automatically remembers your last selected class and subject. Marks are out of 72.
                </div>
              </div>

              <ol className="space-y-3">
                <li className="flex items-start gap-3 bg-stone-50 dark:bg-stone-800/60 p-3 rounded-xl border border-stone-100 dark:border-stone-800">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#6b1426] text-xs font-bold text-white">
                    1
                  </span>
                  <div>
                    <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">Select Class, Subject &amp; Term</h4>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                      Choose e.g. <strong>Grade 8 East</strong>, <strong>Mathematics</strong>, and <strong>Term 2</strong>.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3 bg-stone-50 dark:bg-stone-800/60 p-3 rounded-xl border border-stone-100 dark:border-stone-800">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#6b1426] text-xs font-bold text-white">
                    2
                  </span>
                  <div>
                    <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">Type Marks (0 to 72)</h4>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                      Type directly into the mark box. The system instantly calculates the <strong>Level</strong> (e.g. EE1, ME1) and <strong>Points</strong>.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3 bg-stone-50 dark:bg-stone-800/60 p-3 rounded-xl border border-stone-100 dark:border-stone-800">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#6b1426] text-xs font-bold text-white">
                    3
                  </span>
                  <div>
                    <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">Review Completion &amp; Missing Marks</h4>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                      Watch the progress bar (e.g. 15 / 17 learners completed). Click <strong>SHOW MISSING MARKS</strong> to see learners who haven&apos;t been marked yet.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3 bg-stone-50 dark:bg-stone-800/60 p-3 rounded-xl border border-stone-100 dark:border-stone-800">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#6b1426] text-xs font-bold text-white">
                    4
                  </span>
                  <div>
                    <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">Automatic Safety &amp; Save</h4>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                      Changes are auto-saved locally. Press the maroon <strong>SAVE MARKS</strong> button to lock and sync. You will see <strong>“Marks saved successfully.”</strong>
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-3">
              <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700">
                <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm mb-1">Learner Profile</h4>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  Click on any learner in <strong>MY LEARNERS</strong> to view their photo, admission number, current term performance, previous term performance, and previous year performance.
                </p>
              </div>

              <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700">
                <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm mb-1">Teacher Comments with Templates</h4>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  Class teachers can add <strong>General Comment</strong> and <strong>Class Teacher Comment</strong>. You can click on pre-made comment templates to save typing time, or type your own remarks.
                </p>
              </div>

              <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700">
                <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm mb-1">Print Centre</h4>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  From the Print Centre, preview and print official <strong>Report Cards</strong>, <strong>Class Mark Sheets</strong>, and <strong>Grade Broadsheets</strong> with the Reberwet JSS school badge.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'levels' && (
            <div className="space-y-3">
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Kenya CBC Junior Secondary assessments are scored out of <strong>72 Marks</strong>. The portal maps marks to standard CBC descriptors:
              </p>

              <div className="border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-b border-stone-200 dark:border-stone-700">
                    <tr>
                      <th className="p-2.5 font-bold">Code</th>
                      <th className="p-2.5 font-bold">Level Name</th>
                      <th className="p-2.5 font-bold">Mark / 72</th>
                      <th className="p-2.5 font-bold">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {ASSESSMENT_LEVELS.map((lvl) => (
                      <tr key={lvl.code} className="hover:bg-stone-50 dark:hover:bg-stone-800/50">
                        <td className="p-2.5 font-bold">
                          <span className={`px-2 py-0.5 rounded border text-[11px] font-bold ${lvl.colorClass}`}>
                            {lvl.code}
                          </span>
                        </td>
                        <td className="p-2.5 font-medium text-stone-800 dark:text-stone-200">{lvl.name}</td>
                        <td className="p-2.5 text-stone-700 dark:text-stone-300 font-mono font-semibold">
                          {lvl.minMark} – {lvl.maxMark}
                        </td>
                        <td className="p-2.5 font-bold text-stone-900 dark:text-stone-100">{lvl.points} pts</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200">
                <strong>Important:</strong> Marks above 72 or below 0 are rejected with:
                <div className="mt-1 font-mono text-xs text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 p-1.5 rounded border border-rose-200 dark:border-rose-800">
                  “Invalid mark. Enter a value between 0 and 72.”
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 p-3.5 flex justify-between items-center text-xs text-stone-500 dark:text-stone-400">
          <span className="flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-[#6b1426] dark:text-rose-400" />
            Works cleanly on both phone &amp; laptop
          </span>
          <button
            onClick={onClose}
            className="rounded-lg bg-[#6b1426] hover:bg-[#540d1e] px-4 py-2 text-xs font-semibold text-white transition"
          >
            Close Help
          </button>
        </div>
      </div>
    </div>
  );
};
