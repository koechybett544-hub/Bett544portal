import React, { useState, useMemo } from 'react';
import { UserProfile } from '../types';
import {
  TIMETABLE_DAYS,
  TIMETABLE_GRADES,
  PERIODS_CONFIG,
  BREAK_INTERVALS,
  buildTimetable,
  TIMETABLE_ARRANGEMENTS,
  getCurrentArrangementIndex,
  cycleNextArrangementIndex,
  downloadTeacherTimetablePdf,
  downloadClassTimetablePdf,
  downloadMasterSchoolTimetablePdf,
  normalizeSubjectName,
  getSubjectAbbreviation,
  getTeacherFirstName,
} from '../utils/timetableService';
import { StorageService } from '../utils/storage';
import { CLASS_TEACHERS } from '../data/initialData';
import {
  Calendar,
  Clock,
  Download,
  Sparkles,
  BookOpen,
  GraduationCap,
  Users,
  ShieldCheck,
  CheckCircle2,
  FileText,
  AlertCircle,
  Eye,
  RefreshCw,
  FolderDown,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface TimetableManagerProps {
  currentUser: UserProfile | null;
  teachers: UserProfile[];
  onShowSuccessToast: (msg: string) => void;
  onNavigate?: (view: string) => void;
  isSimulatedOffline?: boolean;
}

export const TimetableManager: React.FC<TimetableManagerProps> = ({
  currentUser,
  teachers,
  onShowSuccessToast,
  onNavigate,
  isSimulatedOffline = false,
}) => {
  // Load Timetable from persistent storage
  const [timetable, setTimetable] = useState(() => StorageService.getTimetable(teachers));

  // Active View Tab: 'my_timetable' | 'class_g7' | 'class_g8' | 'class_g9' | 'master'
  const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'school_admin';
  const [activeTab, setActiveTab] = useState<string>(() => (isAdmin ? 'master' : 'my_timetable'));

  // Active timetable arrangement option index (0 to 4)
  const [arrangementIndex, setArrangementIndex] = useState(() => getCurrentArrangementIndex());

  // Admin filter to inspect any specific teacher's timetable
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(() => currentUser?.id || teachers[0]?.id || '');

  // Is downloading state
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Active teacher for "My Timetable" preview
  const inspectedTeacher = useMemo(() => {
    if (isAdmin && selectedTeacherId) {
      return teachers.find((t) => t.id === selectedTeacherId) || currentUser || teachers[0];
    }
    return currentUser || teachers[0];
  }, [isAdmin, selectedTeacherId, teachers, currentUser]);

  // Lessons for the active teacher across all 3 classes (Grade 7, Grade 8, Grade 9)
  const teacherLessons = useMemo(() => {
    if (!inspectedTeacher) return [];
    return timetable.lessons.filter(
      (l) =>
        l.teacherId === inspectedTeacher.id ||
        (l.teacherName &&
          (l.teacherName.toLowerCase() === inspectedTeacher.name.toLowerCase() ||
           (inspectedTeacher.name.toLowerCase().includes('koech') && l.teacherName.toLowerCase().includes('koech')) ||
           (inspectedTeacher.name.toLowerCase().includes('nelly') && (l.teacherName.toLowerCase().includes('nelly') || l.teacherName.toLowerCase().includes('korir'))) ||
           (inspectedTeacher.name.toLowerCase().includes('korir') && (l.teacherName.toLowerCase().includes('nelly') || l.teacherName.toLowerCase().includes('korir')))))
    );
  }, [timetable, inspectedTeacher]);

  // Subjects taught by the active teacher
  const teacherSubjectsList = useMemo(() => {
    const fromAssignments = (inspectedTeacher?.assignments || []).map((a) => normalizeSubjectName(a.subject));
    const fromLessons = teacherLessons.map((l) => l.subject);
    const combined = Array.from(new Set([...fromAssignments, ...fromLessons]));
    return combined.length > 0 ? combined : [inspectedTeacher?.primarySubject || 'Mathematics'];
  }, [inspectedTeacher, teacherLessons]);

  // Classes taught by the active teacher
  const teacherClassesList = useMemo(() => {
    const grades = Array.from(new Set(teacherLessons.map((l) => l.grade)));
    return grades.length > 0 ? grades : ['Grade 7', 'Grade 8', 'Grade 9'];
  }, [teacherLessons]);

  // ----------------------------------------------------
  // ACTION: Refresh / Cycle Timetable Arrangement (Admin Only)
  // Whenever refreshed, all rules are strictly observed:
  // - CA/s after long break (Periods 5-8)
  // - No back-to-back same teacher in the same class
  // - Science double practical
  // - Zero teacher collisions
  // ----------------------------------------------------
  const handleRefreshArrangement = (specificIndex?: number) => {
    if (!isAdmin) return;
    setIsGenerating(true);
    setTimeout(() => {
      const nextIdx = specificIndex !== undefined ? specificIndex : cycleNextArrangementIndex();
      setArrangementIndex(nextIdx);
      const generated = buildTimetable(teachers, nextIdx);
      StorageService.saveTimetable(generated);
      setTimetable(generated);
      setIsGenerating(false);
      onShowSuccessToast(
        `Timetable Arrangement ${nextIdx + 1} of ${TIMETABLE_ARRANGEMENTS.length} applied! All rules (CA/s after break, no back-to-back same teacher) observed.`
      );
    }, 350);
  };

  // ----------------------------------------------------
  // ACTION: Auto Generate Timetable
  // ----------------------------------------------------
  const handleAutoGenerate = () => {
    handleRefreshArrangement();
  };

  // ----------------------------------------------------
  // ACTION: Download My Timetable PDF
  // ----------------------------------------------------
  const handleDownloadTeacherPdf = async () => {
    if (!inspectedTeacher) return;
    setIsDownloading(true);
    try {
      await downloadTeacherTimetablePdf(
        inspectedTeacher,
        timetable,
        teachers,
        (msg) => onShowSuccessToast(msg)
      );
    } finally {
      setIsDownloading(false);
    }
  };

  // ----------------------------------------------------
  // ACTION: Download Class Timetable PDF
  // ----------------------------------------------------
  const handleDownloadClassPdf = async (grade: 'Grade 7' | 'Grade 8' | 'Grade 9') => {
    setIsDownloading(true);
    try {
      await downloadClassTimetablePdf(
        grade,
        timetable,
        teachers,
        (msg) => onShowSuccessToast(msg)
      );
    } finally {
      setIsDownloading(false);
    }
  };

  // ----------------------------------------------------
  // ACTION: Download Full School Master Timetable PDF
  // ----------------------------------------------------
  const handleDownloadMasterPdf = async () => {
    setIsDownloading(true);
    try {
      await downloadMasterSchoolTimetablePdf(
        timetable,
        teachers,
        (msg) => onShowSuccessToast(msg)
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner & Header */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-7 border border-stone-200 dark:border-stone-800 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-rose-100 dark:bg-rose-950 text-[#6b1426] dark:text-rose-300 text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 border border-rose-200 dark:border-rose-900">
                <Clock className="w-3.5 h-3.5" />
                <span>CBC Bell Schedule &amp; Timetable</span>
              </span>
              <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>100% Offline Ready</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100 tracking-tight flex items-center gap-2.5">
              <Calendar className="w-7 h-7 text-[#6b1426] dark:text-rose-400" />
              <span>School Timetable Centre</span>
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-2xl leading-relaxed">
              Official Reberwet JSS weekly academic schedule. Periods 1–6 morning before lunch (Maths, English, Kiswahili daily &amp; 80-min double Science practical).
            </p>
          </div>

          {/* Top Corner Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {/* Option to Refresh / Switch Timetable Arrangement (Admin Only) */}
            {isAdmin && (
              <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-1 rounded-2xl shadow-xs">
                <button
                  onClick={() => handleRefreshArrangement()}
                  disabled={isGenerating}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-xs transition flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                  title="Refresh timetable to an alternative arrangement observing all CBC rules (Admin only)"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>{isGenerating ? 'Refreshing...' : 'Refresh Arrangement'}</span>
                  <span className="bg-amber-600/60 text-white px-1.5 py-0.5 rounded text-[10px] font-mono">
                    Opt {arrangementIndex + 1}/{TIMETABLE_ARRANGEMENTS.length}
                  </span>
                </button>
                <select
                  value={arrangementIndex}
                  onChange={(e) => handleRefreshArrangement(parseInt(e.target.value, 10))}
                  disabled={isGenerating}
                  className="text-xs font-bold bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-amber-300 dark:border-amber-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                  title="Switch to specific arrangement (Admin only)"
                >
                  {TIMETABLE_ARRANGEMENTS.map((_, i) => (
                    <option key={i} value={i}>
                      Arrangement {i + 1}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] font-black text-amber-800 dark:text-amber-300 bg-amber-200/60 dark:bg-amber-900/60 px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline">
                  Admin Only
                </span>
              </div>
            )}

            {activeTab === 'my_timetable' && (
              <button
                onClick={handleDownloadTeacherPdf}
                disabled={isDownloading}
                className="px-4 py-2.5 rounded-xl bg-[#6b1426] hover:bg-[#52101e] text-white font-extrabold text-xs shadow-xs transition flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                <FolderDown className="w-4 h-4" />
                <span>Download My Timetable PDF</span>
              </button>
            )}

            {activeTab.startsWith('class_') && (
              <button
                onClick={() => {
                  const g = activeTab === 'class_g7' ? 'Grade 7' : activeTab === 'class_g8' ? 'Grade 8' : 'Grade 9';
                  handleDownloadClassPdf(g);
                }}
                disabled={isDownloading}
                className="px-4 py-2.5 rounded-xl bg-[#6b1426] hover:bg-[#52101e] text-white font-extrabold text-xs shadow-xs transition flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                <FolderDown className="w-4 h-4" />
                <span>
                  Download {activeTab === 'class_g7' ? 'Grade 7' : activeTab === 'class_g8' ? 'Grade 8' : 'Grade 9'} Timetable PDF
                </span>
              </button>
            )}

            {activeTab === 'master' && (
              <button
                onClick={handleDownloadMasterPdf}
                disabled={isDownloading}
                className="px-4 py-2.5 rounded-xl bg-[#6b1426] hover:bg-[#52101e] text-white font-extrabold text-xs shadow-xs transition flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                <FolderDown className="w-4 h-4" />
                <span>Download School Timetable PDF</span>
              </button>
            )}
          </div>
        </div>

        {/* Bell Schedule Summary Chips */}
        <div className="mt-5 pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center gap-2 overflow-x-auto text-[11px] pb-1">
          <span className="font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider shrink-0 text-[10px]">Bell Schedule:</span>
          <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-mono font-medium shrink-0">
            P1: 8:00–8:40
          </span>
          <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-mono font-medium shrink-0">
            P2: 8:40–9:20
          </span>
          <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold shrink-0">
            Break: 9:20–9:30
          </span>
          <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-mono font-medium shrink-0">
            P3: 9:30–10:10
          </span>
          <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-mono font-medium shrink-0">
            P4: 10:10–10:50
          </span>
          <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold shrink-0">
            Tea Break: 10:50–11:20
          </span>
          <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-mono font-medium shrink-0">
            P5: 11:20–12:00
          </span>
          <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-mono font-medium shrink-0">
            P6: 12:00–12:40
          </span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold shrink-0">
            Lunch: 12:40–2:00
          </span>
          <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-mono font-medium shrink-0">
            P7: 2:00–2:40
          </span>
          <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-mono font-medium shrink-0">
            P8: 2:40–3:20
          </span>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-200/70 dark:bg-stone-800/80 p-1.5 rounded-2xl">
        <div className="flex items-center gap-1 overflow-x-auto">
          {/* My Timetable Tab */}
          <button
            onClick={() => setActiveTab('my_timetable')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'my_timetable'
                ? 'bg-white dark:bg-stone-900 text-[#6b1426] dark:text-rose-400 shadow-xs'
                : 'text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-white/50 dark:hover:bg-stone-700/50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>My Timetable Preview</span>
          </button>

          {/* Grade 7 */}
          <button
            onClick={() => setActiveTab('class_g7')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'class_g7'
                ? 'bg-white dark:bg-stone-900 text-sky-800 dark:text-sky-400 shadow-xs'
                : 'text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-white/50 dark:hover:bg-stone-700/50'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Grade 7 Class</span>
          </button>

          {/* Grade 8 */}
          <button
            onClick={() => setActiveTab('class_g8')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'class_g8'
                ? 'bg-white dark:bg-stone-900 text-rose-800 dark:text-rose-400 shadow-xs'
                : 'text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-white/50 dark:hover:bg-stone-700/50'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Grade 8 Class</span>
          </button>

          {/* Grade 9 */}
          <button
            onClick={() => setActiveTab('class_g9')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'class_g9'
                ? 'bg-white dark:bg-stone-900 text-purple-800 dark:text-purple-400 shadow-xs'
                : 'text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-white/50 dark:hover:bg-stone-700/50'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Grade 9 Class</span>
          </button>

          {/* Master Timetable */}
          <button
            onClick={() => setActiveTab('master')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'master'
                ? 'bg-white dark:bg-stone-900 text-emerald-900 dark:text-emerald-400 shadow-xs'
                : 'text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-white/50 dark:hover:bg-stone-700/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Full School Master</span>
          </button>
        </div>

        {/* If Admin or Switch Teacher View */}
        {isAdmin && activeTab === 'my_timetable' && (
          <div className="flex items-center gap-2 px-2 shrink-0">
            <span className="text-[11px] font-bold text-stone-600 dark:text-stone-300">Inspect Teacher:</span>
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="text-xs font-bold bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#6b1426]"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.primarySubject || 'Teacher'})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* VIEW 1: MY PERSONAL TEACHING TIMETABLE PREVIEW */}
      {/* ======================================================== */}
      {activeTab === 'my_timetable' && (
        <div className="space-y-4">
          {/* Teacher Summary Header Card */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950 text-[#6b1426] dark:text-rose-300 border border-rose-200 dark:border-rose-900 flex items-center justify-center font-black text-lg">
                {inspectedTeacher?.name?.charAt(0) || 'T'}
              </div>
              <div>
                <h3 className="text-base font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <span>{inspectedTeacher?.name}</span>
                  <span className="text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-[#6b1426] dark:text-rose-300 px-2 py-0.5 rounded-full">
                    {inspectedTeacher?.designation || 'Subject Teacher'}
                  </span>
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Teaching Subjects: <strong className="text-stone-800 dark:text-stone-200">{teacherSubjectsList.join(', ')}</strong> | Classes: <strong className="text-stone-800 dark:text-stone-200">{teacherClassesList.join(', ')}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3.5 py-2 rounded-2xl text-center">
                <span className="text-[10px] text-stone-500 dark:text-stone-400 uppercase font-bold block">Weekly Load</span>
                <span className="text-lg font-black text-[#6b1426] dark:text-rose-400">{teacherLessons.length}</span>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 ml-1">Periods</span>
              </div>
              <button
                onClick={handleDownloadTeacherPdf}
                disabled={isDownloading}
                className="px-4 py-2.5 rounded-2xl bg-[#6b1426] hover:bg-[#52101e] text-white font-extrabold text-xs shadow-xs transition flex items-center gap-2 active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Save to Documents PDF</span>
              </button>
            </div>
          </div>

          {/* Interactive Responsive Grid Table matching uploaded user layout */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-300 dark:border-stone-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-100 dark:bg-stone-800 border-b-2 border-stone-900 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-black">
                    <th className="p-3 w-20 border-r-2 border-stone-900 dark:border-stone-700 uppercase tracking-wider text-xs">
                      DAY
                    </th>
                    {/* P1 */}
                    <th className="p-2 border-r border-stone-300 dark:border-stone-700 min-w-[95px]">
                      <div className="text-[11px] font-black">8:00-8:40</div>
                      <div className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">Period 1</div>
                    </th>
                    {/* P2 */}
                    <th className="p-2 border-r-2 border-stone-900 dark:border-stone-700 min-w-[95px]">
                      <div className="text-[11px] font-black">8:40-9:20</div>
                      <div className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">Period 2</div>
                    </th>
                    {/* SHORT BREAK */}
                    <th className="p-1 border-r-2 border-stone-900 dark:border-stone-700 bg-rose-50/70 dark:bg-rose-950/40 w-16 text-[10px] font-black text-rose-950 dark:text-rose-300">
                      <div>9:20-9:30</div>
                    </th>
                    {/* P3 */}
                    <th className="p-2 border-r border-stone-300 dark:border-stone-700 min-w-[95px]">
                      <div className="text-[11px] font-black">9:30-10:10</div>
                      <div className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">Period 3</div>
                    </th>
                    {/* P4 */}
                    <th className="p-2 border-r-2 border-stone-900 dark:border-stone-700 min-w-[95px]">
                      <div className="text-[11px] font-black">10:10-10:50</div>
                      <div className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">Period 4</div>
                    </th>
                    {/* LONG BREAK */}
                    <th className="p-1 border-r-2 border-stone-900 dark:border-stone-700 bg-amber-50/70 dark:bg-amber-950/40 w-16 text-[10px] font-black text-amber-950 dark:text-amber-300">
                      <div>10:50-11:20</div>
                    </th>
                    {/* P5 */}
                    <th className="p-2 border-r border-stone-300 dark:border-stone-700 min-w-[95px]">
                      <div className="text-[11px] font-black">11:20-12:00</div>
                      <div className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">Period 5</div>
                    </th>
                    {/* P6 */}
                    <th className="p-2 border-r-2 border-stone-900 dark:border-stone-700 min-w-[95px]">
                      <div className="text-[11px] font-black">12:00-12:40</div>
                      <div className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">Period 6</div>
                    </th>
                    {/* LUNCH BREAK */}
                    <th className="p-1 border-r-2 border-stone-900 dark:border-stone-700 bg-emerald-50/70 dark:bg-emerald-950/40 w-16 text-[10px] font-black text-emerald-950 dark:text-emerald-300">
                      <div>12:40-2:00</div>
                    </th>
                    {/* P7 */}
                    <th className="p-2 border-r border-stone-300 dark:border-stone-700 min-w-[95px]">
                      <div className="text-[11px] font-black">2:00-2:40</div>
                      <div className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">Period 7</div>
                    </th>
                    {/* P8 */}
                    <th className="p-2 min-w-[95px]">
                      <div className="text-[11px] font-black">2:40-3:20</div>
                      <div className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">Period 8</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-stone-300 dark:divide-stone-700">
                  {TIMETABLE_DAYS.map((day, dayIndex) => {
                    const dayShort =
                      day === 'Monday'
                        ? 'MON'
                        : day === 'Tuesday'
                        ? 'TUE'
                        : day === 'Wednesday'
                        ? 'WED'
                        : day === 'Thursday'
                        ? 'THUR'
                        : 'FRI';

                    const renderCell = (periodNumber: number) => {
                      const lesson = teacherLessons.find(
                        (l) => l.day === day && l.periodNumber === periodNumber
                      );
                      if (!lesson) {
                        return <span className="text-stone-300 dark:text-stone-600 font-mono text-sm">—</span>;
                      }
                      return (
                        <div className="space-y-0.5">
                          <div className="font-black text-stone-900 dark:text-stone-100 text-xs">
                            {getSubjectAbbreviation(lesson.subject)}
                          </div>
                          <div className="text-[10px] font-bold text-[#6b1426] dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 rounded px-1.5 py-0.5 inline-block">
                            {lesson.grade.replace('Grade ', 'G')}
                          </div>
                          {lesson.isDouble && (
                            <div className="text-[9px] font-extrabold text-blue-600 dark:text-blue-400 block">
                              (Dbl)
                            </div>
                          )}
                        </div>
                      );
                    };

                    return (
                      <tr key={day} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/50 transition h-20">
                        {/* Day label vertically on left */}
                        <td className="p-3 font-black text-stone-900 dark:text-stone-100 border-r-2 border-stone-900 dark:border-stone-700 bg-stone-100/70 dark:bg-stone-800/70 text-sm tracking-wide">
                          {dayShort}
                        </td>
                        {/* Period 1 */}
                        <td className="p-2 border-r border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900">
                          {renderCell(1)}
                        </td>
                        {/* Period 2 */}
                        <td className="p-2 border-r-2 border-stone-900 dark:border-stone-700 bg-white dark:bg-stone-900">
                          {renderCell(2)}
                        </td>
                        {/* Short Break Column */}
                        {dayIndex === 0 && (
                          <td
                            rowSpan={5}
                            className="bg-rose-50 dark:bg-rose-950/40 border-r-2 border-stone-900 dark:border-stone-700 p-1 font-black text-rose-950 dark:text-rose-300 uppercase tracking-widest text-center select-none align-middle"
                          >
                            <div className="flex flex-col items-center justify-center font-black tracking-widest text-[11px] sm:text-xs py-2">
                              {'SHORT BREAK'.split('').map((c, i) =>
                                c === ' ' ? <span key={i} className="h-3 block" /> : <span key={i} className="leading-none my-0.5">{c}</span>
                              )}
                            </div>
                          </td>
                        )}
                        {/* Period 3 */}
                        <td className="p-2 border-r border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900">
                          {renderCell(3)}
                        </td>
                        {/* Period 4 */}
                        <td className="p-2 border-r-2 border-stone-900 dark:border-stone-700 bg-white dark:bg-stone-900">
                          {renderCell(4)}
                        </td>
                        {/* Long Break Column */}
                        {dayIndex === 0 && (
                          <td
                            rowSpan={5}
                            className="bg-amber-50 dark:bg-amber-950/40 border-r-2 border-stone-900 dark:border-stone-700 p-1 font-black text-amber-950 dark:text-amber-300 uppercase tracking-widest text-center select-none align-middle"
                          >
                            <div className="flex flex-col items-center justify-center font-black tracking-widest text-[11px] sm:text-xs py-2">
                              {'LONG BREAK'.split('').map((c, i) =>
                                c === ' ' ? <span key={i} className="h-3 block" /> : <span key={i} className="leading-none my-0.5">{c}</span>
                              )}
                            </div>
                          </td>
                        )}
                        {/* Period 5 */}
                        <td className="p-2 border-r border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900">
                          {renderCell(5)}
                        </td>
                        {/* Period 6 */}
                        <td className="p-2 border-r-2 border-stone-900 dark:border-stone-700 bg-white dark:bg-stone-900">
                          {renderCell(6)}
                        </td>
                        {/* Lunch Break Column */}
                        {dayIndex === 0 && (
                          <td
                            rowSpan={5}
                            className="bg-emerald-50 dark:bg-emerald-950/40 border-r-2 border-stone-900 dark:border-stone-700 p-1 font-black text-emerald-950 dark:text-emerald-300 uppercase tracking-widest text-center select-none align-middle"
                          >
                            <div className="flex flex-col items-center justify-center font-black tracking-widest text-[11px] sm:text-xs py-2">
                              {'LUNCH BREAK'.split('').map((c, i) =>
                                c === ' ' ? <span key={i} className="h-3 block" /> : <span key={i} className="leading-none my-0.5">{c}</span>
                              )}
                            </div>
                          </td>
                        )}
                        {/* Period 7 */}
                        <td className="p-2 border-r border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900">
                          {renderCell(7)}
                        </td>
                        {/* Period 8 */}
                        <td className="p-2 bg-white dark:bg-stone-900">
                          {renderCell(8)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Reference Signatures bar */}
            <div className="bg-stone-50 dark:bg-stone-800 border-t-2 border-stone-900 dark:border-stone-700 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold text-stone-700 dark:text-stone-300">
              <div>PREPARED BY: ..............................................................</div>
              <div>SCHOOL STAMP: ..............................................................</div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 2: CLASS TIMETABLE (GRADE 7, 8, OR 9) */}
      {/* ======================================================== */}
      {activeTab.startsWith('class_') && (
        <div className="space-y-4">
          {(() => {
            const currentGrade =
              activeTab === 'class_g7'
                ? 'Grade 7'
                : activeTab === 'class_g8'
                ? 'Grade 8'
                : 'Grade 9';
            const classLessons = timetable.lessons.filter((l) => l.grade === currentGrade);

            return (
              <>
                {/* Header Card */}
                <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950 text-sky-900 dark:text-sky-300 border border-sky-200 dark:border-sky-800 flex items-center justify-center font-black text-lg">
                      {currentGrade.replace('Grade ', 'G')}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
                        <span>{currentGrade} Official Class Timetable</span>
                      </h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                        Class Teacher: <strong className="text-stone-800 dark:text-stone-200">{getTeacherFirstName(CLASS_TEACHERS[currentGrade]) || 'Faculty'}</strong> | Total: <strong className="text-stone-800 dark:text-stone-200">40 Periods/Week</strong>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownloadClassPdf(currentGrade)}
                    disabled={isDownloading}
                    className="px-4 py-2.5 rounded-2xl bg-[#6b1426] hover:bg-[#52101e] text-white font-extrabold text-xs shadow-xs transition flex items-center gap-2 active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download {currentGrade} Timetable PDF</span>
                  </button>
                </div>

                {/* Table matching user photo format */}
                <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-300 dark:border-stone-700 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-center text-xs border-collapse">
                      <thead>
                        <tr className="bg-stone-100 dark:bg-stone-800 border-b-2 border-stone-900 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-black">
                          <th className="p-3 w-20 border-r-2 border-stone-900 dark:border-stone-700 uppercase tracking-wider text-xs">
                            DAY
                          </th>
                          {/* P1 */}
                          <th className="p-2 border-r border-stone-300 dark:border-stone-700 min-w-[95px]">
                            <div className="text-[11px] font-black">8:00-8:40</div>
                            <div className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">Period 1</div>
                          </th>
                          {/* P2 */}
                          <th className="p-2 border-r-2 border-stone-900 dark:border-stone-700 min-w-[95px]">
                            <div className="text-[11px] font-black">8:40-9:20</div>
                            <div className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">Period 2</div>
                          </th>
                          {/* SHORT BREAK */}
                          <th className="p-1 border-r-2 border-stone-900 dark:border-stone-700 bg-rose-50/70 dark:bg-rose-950/40 w-16 text-[10px] font-black text-rose-950 dark:text-rose-300">
                            <div>9:20-9:30</div>
                          </th>
                          {/* P3 */}
                          <th className="p-2 border-r border-stone-300 dark:border-stone-700 min-w-[95px]">
                            <div className="text-[11px] font-black">9:30-10:10</div>
                            <div className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">Period 3</div>
                          </th>
                          {/* P4 */}
                          <th className="p-2 border-r-2 border-stone-900 dark:border-stone-700 min-w-[95px]">
                            <div className="text-[11px] font-black">10:10-10:50</div>
                            <div className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">Period 4</div>
                          </th>
                          {/* LONG BREAK */}
                          <th className="p-1 border-r-2 border-stone-900 dark:border-stone-700 bg-amber-50/70 dark:bg-amber-950/40 w-16 text-[10px] font-black text-amber-950 dark:text-amber-300">
                            <div>10:50-11:20</div>
                          </th>
                          {/* P5 */}
                          <th className="p-2 border-r border-stone-300 dark:border-stone-700 min-w-[95px]">
                            <div className="text-[11px] font-black">11:20-12:00</div>
                            <div className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">Period 5</div>
                          </th>
                          {/* P6 */}
                          <th className="p-2 border-r-2 border-stone-900 dark:border-stone-700 min-w-[95px]">
                            <div className="text-[11px] font-black">12:00-12:40</div>
                            <div className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">Period 6</div>
                          </th>
                          {/* LUNCH BREAK */}
                          <th className="p-1 border-r-2 border-stone-900 dark:border-stone-700 bg-emerald-50/70 dark:bg-emerald-950/40 w-16 text-[10px] font-black text-emerald-950 dark:text-emerald-300">
                            <div>12:40-2:00</div>
                          </th>
                          {/* P7 */}
                          <th className="p-2 border-r border-stone-300 dark:border-stone-700 min-w-[95px]">
                            <div className="text-[11px] font-black">2:00-2:40</div>
                            <div className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">Period 7</div>
                          </th>
                          {/* P8 */}
                          <th className="p-2 min-w-[95px]">
                            <div className="text-[11px] font-black">2:40-3:20</div>
                            <div className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">Period 8</div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-stone-300 dark:divide-stone-700">
                        {TIMETABLE_DAYS.map((day, dayIndex) => {
                          const dayShort =
                            day === 'Monday'
                              ? 'MON'
                              : day === 'Tuesday'
                              ? 'TUE'
                              : day === 'Wednesday'
                              ? 'WED'
                              : day === 'Thursday'
                              ? 'THUR'
                              : 'FRI';

                          const renderCell = (periodNumber: number) => {
                            const lesson = classLessons.find(
                              (l) => l.day === day && l.periodNumber === periodNumber
                            );
                            if (!lesson) {
                              return <span className="text-stone-300 dark:text-stone-600 font-mono text-sm">—</span>;
                            }
                            return (
                              <div className="space-y-0.5">
                                <div className="font-black text-stone-900 dark:text-stone-100 text-xs">
                                  {getSubjectAbbreviation(lesson.subject)}
                                </div>
                                <div className="text-[10px] font-semibold text-[#6b1426] dark:text-rose-400 truncate max-w-[85px] mx-auto">
                                  {lesson.teacherName ? getTeacherFirstName(lesson.teacherName) : 'Tr'}
                                </div>
                                {lesson.isDouble && (
                                  <div className="text-[9px] font-extrabold text-blue-600 dark:text-blue-400 block">
                                    (Dbl)
                                  </div>
                                )}
                              </div>
                            );
                          };

                          return (
                            <tr key={day} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/50 transition h-20">
                              <td className="p-3 font-black text-stone-900 dark:text-stone-100 border-r-2 border-stone-900 dark:border-stone-700 bg-stone-100/70 dark:bg-stone-800/70 text-sm tracking-wide">
                                {dayShort}
                              </td>
                              <td className="p-2 border-r border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900">
                                {renderCell(1)}
                              </td>
                              <td className="p-2 border-r-2 border-stone-900 dark:border-stone-700 bg-white dark:bg-stone-900">
                                {renderCell(2)}
                              </td>
                              {dayIndex === 0 && (
                                <td
                                  rowSpan={5}
                                  className="bg-rose-50 dark:bg-rose-950/40 border-r-2 border-stone-900 dark:border-stone-700 p-1 font-black text-rose-950 dark:text-rose-300 uppercase tracking-widest text-center select-none align-middle"
                                >
                                  <div className="flex flex-col items-center justify-center font-black tracking-widest text-[11px] sm:text-xs py-2">
                                    {'SHORT BREAK'.split('').map((c, i) =>
                                      c === ' ' ? <span key={i} className="h-3 block" /> : <span key={i} className="leading-none my-0.5">{c}</span>
                                    )}
                                  </div>
                                </td>
                              )}
                              <td className="p-2 border-r border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900">
                                {renderCell(3)}
                              </td>
                              <td className="p-2 border-r-2 border-stone-900 dark:border-stone-700 bg-white dark:bg-stone-900">
                                {renderCell(4)}
                              </td>
                              {dayIndex === 0 && (
                                <td
                                  rowSpan={5}
                                  className="bg-amber-50 dark:bg-amber-950/40 border-r-2 border-stone-900 dark:border-stone-700 p-1 font-black text-amber-950 dark:text-amber-300 uppercase tracking-widest text-center select-none align-middle"
                                >
                                  <div className="flex flex-col items-center justify-center font-black tracking-widest text-[11px] sm:text-xs py-2">
                                    {'LONG BREAK'.split('').map((c, i) =>
                                      c === ' ' ? <span key={i} className="h-3 block" /> : <span key={i} className="leading-none my-0.5">{c}</span>
                                    )}
                                  </div>
                                </td>
                              )}
                              <td className="p-2 border-r border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900">
                                {renderCell(5)}
                              </td>
                              <td className="p-2 border-r-2 border-stone-900 dark:border-stone-700 bg-white dark:bg-stone-900">
                                {renderCell(6)}
                              </td>
                              {dayIndex === 0 && (
                                <td
                                  rowSpan={5}
                                  className="bg-emerald-50 dark:bg-emerald-950/40 border-r-2 border-stone-900 dark:border-stone-700 p-1 font-black text-emerald-950 dark:text-emerald-300 uppercase tracking-widest text-center select-none align-middle"
                                >
                                  <div className="flex flex-col items-center justify-center font-black tracking-widest text-[11px] sm:text-xs py-2">
                                    {'LUNCH BREAK'.split('').map((c, i) =>
                                      c === ' ' ? <span key={i} className="h-3 block" /> : <span key={i} className="leading-none my-0.5">{c}</span>
                                    )}
                                  </div>
                                </td>
                              )}
                              <td className="p-2 border-r border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900">
                                {renderCell(7)}
                              </td>
                              <td className="p-2 bg-white dark:bg-stone-900">
                                {renderCell(8)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-stone-50 dark:bg-stone-800 border-t-2 border-stone-900 dark:border-stone-700 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold text-stone-700 dark:text-stone-300">
                    <div>PREPARED BY: ..............................................................</div>
                    <div>SCHOOL STAMP: ..............................................................</div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 3: FULL SCHOOL MASTER TIMETABLE (ADMIN & HEAD) */}
      {/* ======================================================== */}
      {activeTab === 'master' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center font-black text-lg">
                <Layers className="w-6 h-6 text-emerald-800 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <span>Full School Master Timetable</span>
                  <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                    Grade 7, 8 &amp; 9 Consolidated
                  </span>
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Conflict-free matrix across all classes. Verified against CBC rules and room allocations.
                </p>
              </div>
            </div>

            <button
              onClick={handleDownloadMasterPdf}
              disabled={isDownloading}
              className="px-4 py-2.5 rounded-2xl bg-[#6b1426] hover:bg-[#52101e] text-white font-extrabold text-xs shadow-xs transition flex items-center gap-2 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download Master Timetable PDF</span>
            </button>
          </div>

          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-300 dark:border-stone-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-100 dark:bg-stone-800 border-b-2 border-stone-900 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-black">
                    <th className="p-3 w-20 border-r-2 border-stone-900 dark:border-stone-700 uppercase tracking-wider text-xs">
                      DAY
                    </th>
                    {/* P1 */}
                    <th className="p-2 border-r border-stone-300 dark:border-stone-700 min-w-[125px]">
                      <div className="text-[11px] font-black">8:00-8:40</div>
                      <div className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">Period 1</div>
                    </th>
                    {/* P2 */}
                    <th className="p-2 border-r-2 border-stone-900 dark:border-stone-700 min-w-[125px]">
                      <div className="text-[11px] font-black">8:40-9:20</div>
                      <div className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">Period 2</div>
                    </th>
                    {/* SHORT BREAK */}
                    <th className="p-1 border-r-2 border-stone-900 dark:border-stone-700 bg-rose-50/70 dark:bg-rose-950/40 w-16 text-[10px] font-black text-rose-950 dark:text-rose-300">
                      <div>9:20-9:30</div>
                      <div className="text-[9px] text-rose-800 dark:text-rose-400 font-bold">Break</div>
                    </th>
                    {/* P3 */}
                    <th className="p-2 border-r border-stone-300 dark:border-stone-700 min-w-[125px]">
                      <div className="text-[11px] font-black">9:30-10:10</div>
                      <div className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">Period 3</div>
                    </th>
                    {/* P4 */}
                    <th className="p-2 border-r-2 border-stone-900 dark:border-stone-700 min-w-[125px]">
                      <div className="text-[11px] font-black">10:10-10:50</div>
                      <div className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">Period 4</div>
                    </th>
                    {/* LONG BREAK */}
                    <th className="p-1 border-r-2 border-stone-900 dark:border-stone-700 bg-amber-50/70 dark:bg-amber-950/40 w-16 text-[10px] font-black text-amber-950 dark:text-amber-300">
                      <div>10:50-11:20</div>
                      <div className="text-[9px] text-amber-800 dark:text-amber-400 font-bold">Tea Break</div>
                    </th>
                    {/* P5 */}
                    <th className="p-2 border-r border-stone-300 dark:border-stone-700 min-w-[125px]">
                      <div className="text-[11px] font-black">11:20-12:00</div>
                      <div className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">Period 5</div>
                    </th>
                    {/* P6 */}
                    <th className="p-2 border-r-2 border-stone-900 dark:border-stone-700 min-w-[125px]">
                      <div className="text-[11px] font-black">12:00-12:40</div>
                      <div className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">Period 6</div>
                    </th>
                    {/* LUNCH BREAK */}
                    <th className="p-1 border-r-2 border-stone-900 dark:border-stone-700 bg-emerald-50/70 dark:bg-emerald-950/40 w-16 text-[10px] font-black text-emerald-950 dark:text-emerald-300">
                      <div>12:40-2:00</div>
                      <div className="text-[9px] text-emerald-800 dark:text-emerald-400 font-bold">Lunch Break</div>
                    </th>
                    {/* P7 */}
                    <th className="p-2 border-r border-stone-300 dark:border-stone-700 min-w-[125px]">
                      <div className="text-[11px] font-black">2:00-2:40</div>
                      <div className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">Period 7</div>
                    </th>
                    {/* P8 */}
                    <th className="p-2 min-w-[125px]">
                      <div className="text-[11px] font-black">2:40-3:20</div>
                      <div className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">Period 8</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-stone-300 dark:divide-stone-700">
                  {TIMETABLE_DAYS.map((day, dayIndex) => {
                    const dayShort =
                      day === 'Monday'
                        ? 'MON'
                        : day === 'Tuesday'
                        ? 'TUE'
                        : day === 'Wednesday'
                        ? 'WED'
                        : day === 'Thursday'
                        ? 'THUR'
                        : 'FRI';

                    const renderMasterPeriodCell = (periodNum: number) => {
                      const g7 = timetable.lessons.find(
                        (l) => l.grade === 'Grade 7' && l.day === day && l.periodNumber === periodNum
                      );
                      const g8 = timetable.lessons.find(
                        (l) => l.grade === 'Grade 8' && l.day === day && l.periodNumber === periodNum
                      );
                      const g9 = timetable.lessons.find(
                        (l) => l.grade === 'Grade 9' && l.day === day && l.periodNumber === periodNum
                      );

                      return (
                        <div className="space-y-1 py-1">
                          {/* Grade 7 */}
                          <div className="bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 px-1.5 py-1 rounded-lg text-left">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-extrabold text-sky-950 dark:text-sky-200 text-[11px] truncate">
                                <span className="text-sky-700 dark:text-sky-400 font-bold mr-1">G7:</span>
                                {g7 ? getSubjectAbbreviation(g7.subject) : '—'}
                              </span>
                              {g7?.isDouble && (
                                <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 bg-blue-100/70 dark:bg-blue-900/50 px-1 rounded">
                                  Dbl
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-sky-800 dark:text-sky-300 font-medium truncate">
                              {g7?.teacherName ? getTeacherFirstName(g7.teacherName) : '—'}
                            </div>
                          </div>

                          {/* Grade 8 */}
                          <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 px-1.5 py-1 rounded-lg text-left">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-extrabold text-rose-950 dark:text-rose-200 text-[11px] truncate">
                                <span className="text-rose-700 dark:text-rose-400 font-bold mr-1">G8:</span>
                                {g8 ? getSubjectAbbreviation(g8.subject) : '—'}
                              </span>
                              {g8?.isDouble && (
                                <span className="text-[9px] font-black text-rose-600 dark:text-rose-400 bg-rose-100/70 dark:bg-rose-900/50 px-1 rounded">
                                  Dbl
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-rose-800 dark:text-rose-300 font-medium truncate">
                              {g8?.teacherName ? getTeacherFirstName(g8.teacherName) : '—'}
                            </div>
                          </div>

                          {/* Grade 9 */}
                          <div className="bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 px-1.5 py-1 rounded-lg text-left">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-extrabold text-purple-950 dark:text-purple-200 text-[11px] truncate">
                                <span className="text-purple-700 dark:text-purple-400 font-bold mr-1">G9:</span>
                                {g9 ? getSubjectAbbreviation(g9.subject) : '—'}
                              </span>
                              {g9?.isDouble && (
                                <span className="text-[9px] font-black text-purple-600 dark:text-purple-400 bg-purple-100/70 dark:bg-purple-900/50 px-1 rounded">
                                  Dbl
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-purple-800 dark:text-purple-300 font-medium truncate">
                              {g9?.teacherName ? getTeacherFirstName(g9.teacherName) : '—'}
                            </div>
                          </div>
                        </div>
                      );
                    };

                    return (
                      <tr key={day} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/50 transition">
                        <td className="p-3 font-black text-stone-900 dark:text-stone-100 border-r-2 border-stone-900 dark:border-stone-700 bg-stone-100/70 dark:bg-stone-800/70 text-sm tracking-wide">
                          {dayShort}
                        </td>
                        <td className="p-2 border-r border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900">
                          {renderMasterPeriodCell(1)}
                        </td>
                        <td className="p-2 border-r-2 border-stone-900 dark:border-stone-700 bg-white dark:bg-stone-900">
                          {renderMasterPeriodCell(2)}
                        </td>
                        {dayIndex === 0 && (
                          <td
                            rowSpan={5}
                            className="bg-rose-50 dark:bg-rose-950/40 border-r-2 border-stone-900 dark:border-stone-700 p-1 font-black text-rose-950 dark:text-rose-300 uppercase tracking-widest text-center select-none align-middle"
                          >
                            <div className="flex flex-col items-center justify-center font-black tracking-widest text-[11px] sm:text-xs py-3 select-none">
                              {'SHORT BREAK'.split('').map((char, i) =>
                                char === ' ' ? (
                                  <span key={i} className="h-3.5 block" />
                                ) : (
                                  <span key={i} className="leading-none my-0.5">
                                    {char}
                                  </span>
                                )
                              )}
                            </div>
                          </td>
                        )}
                        <td className="p-2 border-r border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900">
                          {renderMasterPeriodCell(3)}
                        </td>
                        <td className="p-2 border-r-2 border-stone-900 dark:border-stone-700 bg-white dark:bg-stone-900">
                          {renderMasterPeriodCell(4)}
                        </td>
                        {dayIndex === 0 && (
                          <td
                            rowSpan={5}
                            className="bg-amber-50 dark:bg-amber-950/40 border-r-2 border-stone-900 dark:border-stone-700 p-1 font-black text-amber-950 dark:text-amber-300 uppercase tracking-widest text-center select-none align-middle"
                          >
                            <div className="flex flex-col items-center justify-center font-black tracking-widest text-[11px] sm:text-xs py-3 select-none">
                              {'LONG BREAK'.split('').map((char, i) =>
                                char === ' ' ? (
                                  <span key={i} className="h-3.5 block" />
                                ) : (
                                  <span key={i} className="leading-none my-0.5">
                                    {char}
                                  </span>
                                )
                              )}
                            </div>
                          </td>
                        )}
                        <td className="p-2 border-r border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900">
                          {renderMasterPeriodCell(5)}
                        </td>
                        <td className="p-2 border-r-2 border-stone-900 dark:border-stone-700 bg-white dark:bg-stone-900">
                          {renderMasterPeriodCell(6)}
                        </td>
                        {dayIndex === 0 && (
                          <td
                            rowSpan={5}
                            className="bg-emerald-50 dark:bg-emerald-950/40 border-r-2 border-stone-900 dark:border-stone-700 p-1 font-black text-emerald-950 dark:text-emerald-300 uppercase tracking-widest text-center select-none align-middle"
                          >
                            <div className="flex flex-col items-center justify-center font-black tracking-widest text-[11px] sm:text-xs py-3 select-none">
                              {'LUNCH BREAK'.split('').map((char, i) =>
                                char === ' ' ? (
                                  <span key={i} className="h-3.5 block" />
                                ) : (
                                  <span key={i} className="leading-none my-0.5">
                                    {char}
                                  </span>
                                )
                              )}
                            </div>
                          </td>
                        )}
                        <td className="p-2 border-r border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900">
                          {renderMasterPeriodCell(7)}
                        </td>
                        <td className="p-2 bg-white dark:bg-stone-900">
                          {renderMasterPeriodCell(8)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Reference Signatures bar */}
            <div className="bg-stone-50 dark:bg-stone-800 border-t-2 border-stone-900 dark:border-stone-700 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold text-stone-700 dark:text-stone-300">
              <div>PREPARED BY: ..............................................................</div>
              <div>SCHOOL STAMP: ..............................................................</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
