import React, { useState } from 'react';
import { UserProfile, TeacherActivity, Announcement } from '../types';
import { SCHOOL_INFO, SUBJECTS } from '../data/initialData';
import { TeachersDetailsModal } from './TeachersDetailsModal';
import { WeeklyInspirationCard } from './WeeklyInspirationCard';
import { getCurrentWeekInspiration } from '../data/weeklyInspirationData';
import { useRealtimeDate } from '../utils/dateService';
import { generateLearningResourcePdf } from '../utils/pdfExport';
import { INITIAL_LEARNING_RESOURCES, LearningResourceItem } from './DocumentCenter';
import {
  BookOpen,
  CheckSquare,
  Users,
  FileText,
  Megaphone,
  FolderOpen,
  User,
  GraduationCap,
  Clock,
  ChevronRight,
  Calendar,
  AlertCircle,
  Mail,
  ShieldCheck,
  LogIn,
  Upload,
  Download,
  FileDown,
  Layers,
  Search,
  X,
  Plus,
  Check,
  Award,
  Activity,
  History,
  Sparkles,
  Eye,
} from 'lucide-react';

interface TeacherDashboardProps {
  currentUser: UserProfile | null;
  teachers: UserProfile[];
  onNavigate: (view: string) => void;
  activities: TeacherActivity[];
  announcements: Announcement[];
  pendingMarksCount: number;
  onUpdateTeachers: (updated: UserProfile[]) => void;
  onOpenGmail: () => void;
  onOpenAuthModal: () => void;
  onShowSuccessToast: (msg: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  currentUser,
  teachers,
  onNavigate,
  activities,
  announcements,
  pendingMarksCount,
  onUpdateTeachers,
  onOpenGmail,
  onOpenAuthModal,
  onShowSuccessToast,
}) => {
  const { formattedDate } = useRealtimeDate();
  const [teachersModalOpen, setTeachersModalOpen] = useState(false);

  // New Modals for Academic Management Modules
  const [recentActivitiesModalOpen, setRecentActivitiesModalOpen] = useState(false);
  const [announcementsModalOpen, setAnnouncementsModalOpen] = useState(false);
  const [resourcesModalOpen, setResourcesModalOpen] = useState(false);
  const [uploadResourceModalOpen, setUploadResourceModalOpen] = useState(false);

  // Local Resources State on Home Screen
  const [homeResources, setHomeResources] = useState<LearningResourceItem[]>(() => INITIAL_LEARNING_RESOURCES);
  const [resourceFilterGrade, setResourceFilterGrade] = useState<'all' | 'Grade 7' | 'Grade 8' | 'Grade 9'>('all');
  const [resourceCategory, setResourceCategory] = useState<string>('all');
  const [resourceSearch, setResourceSearch] = useState('');

  // Resource Upload Form State
  const [newResTitle, setNewResTitle] = useState('');
  const [newResGrade, setNewResGrade] = useState<'Grade 7' | 'Grade 8' | 'Grade 9'>('Grade 8');
  const [newResSubject, setNewResSubject] = useState('Mathematics');
  const [newResCategory, setNewResCategory] = useState<'Schemes of Work' | 'Revision Notes' | 'Assessment Papers' | 'Lesson Plans'>('Revision Notes');
  const [newResContent, setNewResContent] = useState('');
  const [newResFile, setNewResFile] = useState<File | null>(null);

  // Search in Recent Activities modal
  const [activitySearch, setActivitySearch] = useState('');
  const [activityCategory, setActivityCategory] = useState<'all' | 'marks' | 'document' | 'circular' | 'system'>('all');

  // Search in Announcements modal
  const [announcementSearch, setAnnouncementSearch] = useState('');

  // Filtered Activities
  const filteredActivities = activities.filter((act) => {
    if (activityCategory !== 'all' && act.category !== activityCategory) return false;
    if (activitySearch.trim()) {
      const q = activitySearch.toLowerCase().trim();
      return act.action.toLowerCase().includes(q) || act.details?.toLowerCase().includes(q);
    }
    return true;
  });

  // Filtered Announcements
  const filteredAnnouncements = announcements.filter((ann) => {
    if (announcementSearch.trim()) {
      const q = announcementSearch.toLowerCase().trim();
      return ann.title.toLowerCase().includes(q) || ann.message.toLowerCase().includes(q) || ann.author.toLowerCase().includes(q);
    }
    return true;
  });

  // Filtered Home Resources
  const filteredHomeResources = homeResources.filter((res) => {
    if (resourceFilterGrade !== 'all' && res.grade !== resourceFilterGrade) return false;
    if (resourceCategory !== 'all' && res.category !== resourceCategory) return false;
    if (resourceSearch.trim()) {
      const q = resourceSearch.toLowerCase().trim();
      return (
        res.title.toLowerCase().includes(q) ||
        res.subject.toLowerCase().includes(q) ||
        res.content.toLowerCase().includes(q) ||
        res.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Handle Home Resource PDF Download
  const handleDownloadResourcePdf = async (res: LearningResourceItem) => {
    onShowSuccessToast(`Downloading "${res.title}"...`);
    const result = await generateLearningResourcePdf({
      title: res.title,
      grade: res.grade,
      subject: res.subject,
      category: res.category,
      term: res.term,
      author: res.author,
      date: res.date,
      content: res.content,
      keyOutcomes: res.keyOutcomes,
    }, (msg) => onShowSuccessToast(msg));

    if (result.success) {
      onShowSuccessToast('Saved to Documents');
    } else {
      onShowSuccessToast(`PDF download failed: ${result.message}`);
    }
  };

  // Handle Upload Resource Form
  const handleCreateResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResTitle.trim()) {
      alert('Please enter a resource title.');
      return;
    }

    const created: LearningResourceItem = {
      id: `res-${Date.now()}`,
      title: newResTitle.trim(),
      grade: newResGrade,
      subject: newResSubject,
      category: newResCategory,
      term: SCHOOL_INFO.currentTerm,
      fileType: 'PDF',
      fileSize: newResFile ? `${(newResFile.size / (1024 * 1024)).toFixed(1)} MB` : '1.2 MB',
      author: currentUser?.name || 'Teacher Staff',
      date: new Date().toISOString().slice(0, 10),
      content: newResContent.trim() || `CBC curriculum teaching notes for ${newResSubject} (${newResGrade}). Prepared by ${currentUser?.name || 'Teacher Staff'}.`,
      keyOutcomes: [
        `Understand core competency strands in ${newResSubject}.`,
        'Demonstrate practical learner problem-solving.',
        'Complete formative curriculum evaluations.',
      ],
    };

    setHomeResources((prev) => [created, ...prev]);
    setUploadResourceModalOpen(false);
    setNewResTitle('');
    setNewResContent('');
    setNewResFile(null);
    onShowSuccessToast(`Resource "${created.title}" uploaded successfully.`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner with Quick Auth on Top Screen */}
      <div className="rounded-3xl bg-gradient-to-br from-[#6b1426] via-[#540d1e] to-[#3b0a16] p-5 sm:p-7 text-white shadow-md border border-[#8c1632] relative overflow-hidden">
        {/* Subtle decorative crest watermark */}
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <GraduationCap className="w-64 h-64 text-sky-200" />
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-[#8c1632]/80 pb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Hello, {currentUser?.name || 'Teacher Staff'}
                </h1>
                <span className="bg-[#3b0a16] text-sky-200 border border-sky-300/40 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                  {currentUser?.role === 'super_admin' ? 'Head Teacher' : currentUser?.role === 'school_admin' ? 'School Admin' : 'Teacher Seat'}
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-sky-100">
                <span className="font-bold text-sky-200">Allocated Teaching:</span>
                {currentUser?.assignments && currentUser.assignments.length > 0 ? (
                  currentUser.assignments.map((asgn, i) => (
                    <span
                      key={i}
                      className="bg-[#3b0a16]/80 border border-sky-300/40 px-2 py-0.5 rounded-md font-semibold text-sky-100"
                    >
                      {asgn.grade} • {asgn.subject}
                    </span>
                  ))
                ) : (
                  <span className="text-sky-200">School Administration</span>
                )}
              </div>
            </div>

            {/* Academic Year, Term & Actions */}
            <div className="flex flex-wrap items-center gap-2 text-xs self-start md:self-auto font-medium">
              <div className="bg-[#3b0a16]/80 p-2 rounded-xl border border-[#8c1632] text-sky-100 flex items-center gap-2">
                <span>{SCHOOL_INFO.currentYear} • {SCHOOL_INFO.currentTerm}</span>
                <span className="text-rose-400">|</span>
                <span className="text-white font-semibold">{formattedDate}</span>
              </div>

              {/* Login / Switch Account Button */}
              <button
                onClick={onOpenAuthModal}
                id="top-screen-auth-btn"
                className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-black px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition active:scale-95 text-xs shadow-xs"
                title="Sign Up or Log In (Username, Password or Biometrics)"
              >
                <LogIn className="w-3.5 h-3.5 text-sky-300" />
                <span>Sign Up / Sign In</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Teachers Details Modal */}
      <TeachersDetailsModal
        isOpen={teachersModalOpen}
        onClose={() => setTeachersModalOpen(false)}
        teachers={teachers}
        currentUser={currentUser || teachers[0]}
        onUpdateTeachers={onUpdateTeachers}
        onShowSuccessToast={onShowSuccessToast}
      />

      {/* 🌟 WEEKLY INSPIRATION (ASPIRATION) HERO NOTICE BOARD BANNER */}
      {(() => {
        const currentInsp = getCurrentWeekInspiration();
        return (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-50 via-white to-rose-50 dark:from-stone-900 dark:via-stone-900 dark:to-rose-950/30 border-2 border-rose-200/90 dark:border-rose-900/60 p-4 sm:p-5 shadow-sm transition hover:shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#6b1426] text-amber-300 shadow-md">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#6b1426] text-white">
                      Notice Board • Weekly Inspiration
                    </span>
                    <span className="text-xs font-black text-[#6b1426] dark:text-rose-400">
                      {currentInsp.weekDatesFormatted}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-stone-900 dark:text-stone-100 mt-1 truncate">
                    "{currentInsp.inspiration.motivation}"
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-stone-400 italic line-clamp-1">
                    Wisdom: "{currentInsp.inspiration.verseOrWisdom}"
                    {currentInsp.inspiration.verseReference ? ` — ${currentInsp.inspiration.verseReference}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
                <button
                  type="button"
                  onClick={() => onNavigate('announcements')}
                  className="px-4 py-2.5 rounded-2xl bg-[#6b1426] hover:bg-[#520f1d] active:scale-95 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-amber-300" />
                  <span>View Weekly Inspiration &amp; Posters</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Academic Management Modules */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Academic Management Modules
          </h2>
          <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500">
            10 Active Modules
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {/* 1. MY CLASSES */}
          <button
            id="module-my-classes"
            onClick={() => onNavigate('classes')}
            className="flex flex-col p-3.5 sm:p-4 rounded-3xl bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-800 hover:border-[#6b1426] dark:hover:border-rose-700 shadow-xs hover:shadow-lg transition-all duration-200 text-left active:scale-[0.98] group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-[#6b1426]" />
            <div className="flex items-center justify-between mb-2.5">
              <div className="h-12 w-12 rounded-2xl overflow-hidden shadow-xs border border-stone-200 dark:border-stone-700 group-hover:scale-105 transition shrink-0 bg-stone-100 dark:bg-stone-800">
                <img
                  src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=160&q=80"
                  alt="My Classes"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-[#6b1426] dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                JSS
              </span>
            </div>
            <div className="text-xs sm:text-sm font-black text-stone-900 dark:text-stone-100 group-hover:text-[#6b1426] dark:group-hover:text-rose-400 tracking-tight">
              MY CLASSES
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 truncate">Grade 7, 8 &amp; 9</div>
          </button>

          {/* 2. ALL LEARNERS */}
          <button
            id="module-all-learners"
            onClick={() => onNavigate('learners')}
            className="flex flex-col p-3.5 sm:p-4 rounded-3xl bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-800 hover:border-[#6b1426] dark:hover:border-rose-700 shadow-xs hover:shadow-lg transition-all duration-200 text-left active:scale-[0.98] group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-indigo-600" />
            <div className="flex items-center justify-between mb-2.5">
              <div className="h-12 w-12 rounded-2xl overflow-hidden shadow-xs border border-stone-200 dark:border-stone-700 group-hover:scale-105 transition shrink-0 bg-stone-100 dark:bg-stone-800">
                <img
                  src="https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=160&q=80"
                  alt="All Learners"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-900">
                Roster
              </span>
            </div>
            <div className="text-xs sm:text-sm font-black text-stone-900 dark:text-stone-100 group-hover:text-[#6b1426] dark:group-hover:text-rose-400 tracking-tight">
              ALL LEARNERS
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 truncate">Directory &amp; Register</div>
          </button>

          {/* 3. TIMETABLE */}
          <button
            id="module-timetable"
            onClick={() => onNavigate('timetable')}
            className="flex flex-col p-3.5 sm:p-4 rounded-3xl bg-white dark:bg-stone-900 border-2 border-rose-300 dark:border-rose-900/60 hover:border-[#6b1426] dark:hover:border-rose-600 shadow-xs hover:shadow-lg transition-all duration-200 text-left active:scale-[0.98] group relative overflow-hidden ring-1 ring-rose-200/50 dark:ring-rose-900/20"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6b1426] to-rose-600" />
            <div className="flex items-center justify-between mb-2.5">
              <div className="h-12 w-12 rounded-2xl overflow-hidden shadow-xs border border-stone-200 dark:border-stone-700 group-hover:scale-105 transition shrink-0 bg-stone-100 dark:bg-stone-800">
                <img
                  src="https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=160&q=80"
                  alt="School Timetable"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-[#6b1426] dark:text-rose-200 border border-rose-300">
                Bell {SCHOOL_INFO.currentYear}
              </span>
            </div>
            <div className="text-xs sm:text-sm font-black text-stone-900 dark:text-stone-100 group-hover:text-[#6b1426] dark:group-hover:text-rose-400 tracking-tight">
              TIMETABLE
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 truncate">Academic Schedule</div>
          </button>

          {/* 4. REPORTS & BROADSHEET */}
          <button
            id="module-reports"
            onClick={() => onNavigate('reports')}
            className="flex flex-col p-3.5 sm:p-4 rounded-3xl bg-white dark:bg-stone-900 border-2 border-sky-300 dark:border-sky-900/60 hover:border-sky-600 dark:hover:border-sky-500 shadow-xs hover:shadow-lg transition-all duration-200 text-left active:scale-[0.98] group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 to-blue-600" />
            <div className="flex items-center justify-between mb-2.5">
              <div className="h-12 w-12 rounded-2xl overflow-hidden shadow-xs border border-stone-200 dark:border-stone-700 group-hover:scale-105 transition shrink-0 bg-stone-100 dark:bg-stone-800">
                <img
                  src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=160&q=80"
                  alt="Reports & Broadsheets"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-900 dark:text-sky-200 border border-sky-300">
                PDF
              </span>
            </div>
            <div className="text-xs sm:text-sm font-black text-stone-900 dark:text-stone-100 group-hover:text-sky-900 dark:group-hover:text-sky-300 tracking-tight">
              REPORTS
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 truncate">Cards &amp; Broadsheet</div>
          </button>

          {/* 5. RESOURCES */}
          <button
            id="module-resources"
            onClick={() => setResourcesModalOpen(true)}
            className="flex flex-col p-3.5 sm:p-4 rounded-3xl bg-white dark:bg-stone-900 border-2 border-emerald-300 dark:border-emerald-900/60 hover:border-emerald-600 dark:hover:border-emerald-500 shadow-xs hover:shadow-lg transition-all duration-200 text-left active:scale-[0.98] group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-600" />
            <div className="flex items-center justify-between mb-2.5">
              <div className="h-12 w-12 rounded-2xl overflow-hidden shadow-xs border border-stone-200 dark:border-stone-700 group-hover:scale-105 transition shrink-0 bg-stone-100 dark:bg-stone-800">
                <img
                  src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=160&q=80"
                  alt="Teaching Resources"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border border-emerald-300">
                CBC
              </span>
            </div>
            <div className="text-xs sm:text-sm font-black text-stone-900 dark:text-stone-100 group-hover:text-emerald-900 dark:group-hover:text-emerald-300 tracking-tight">
              RESOURCES
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 truncate">Curriculum Notes</div>
          </button>

          {/* 6. ENTER MARKS */}
          <button
            id="module-marks"
            onClick={() => onNavigate('marks')}
            className="flex flex-col p-3.5 sm:p-4 rounded-3xl bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-800 hover:border-[#6b1426] dark:hover:border-rose-700 shadow-xs hover:shadow-lg transition-all duration-200 text-left active:scale-[0.98] group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-amber-500" />
            <div className="flex items-center justify-between mb-2.5">
              <div className="h-12 w-12 rounded-2xl overflow-hidden shadow-xs border border-stone-200 dark:border-stone-700 group-hover:scale-105 transition shrink-0 bg-stone-100 dark:bg-stone-800">
                <img
                  src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=160&q=80"
                  alt="Enter Marks"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300">
                Rubrics
              </span>
            </div>
            <div className="text-xs sm:text-sm font-black text-stone-900 dark:text-stone-100 group-hover:text-[#6b1426] dark:group-hover:text-rose-400 tracking-tight">
              ENTER MARKS
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 truncate">Scores &amp; Assessment</div>
          </button>

          {/* 7. TEACHERS DETAILS */}
          <button
            id="module-teachers-details"
            onClick={() => setTeachersModalOpen(true)}
            className="flex flex-col p-3.5 sm:p-4 rounded-3xl bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-800 hover:border-[#6b1426] dark:hover:border-rose-700 shadow-xs hover:shadow-lg transition-all duration-200 text-left active:scale-[0.98] group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-600" />
            <div className="flex items-center justify-between mb-2.5">
              <div className="h-12 w-12 rounded-2xl overflow-hidden shadow-xs border border-stone-200 dark:border-stone-700 group-hover:scale-105 transition shrink-0 bg-stone-100 dark:bg-stone-800">
                <img
                  src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=160&q=80"
                  alt="Teachers Details"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-200 border border-purple-300">
                Staff
              </span>
            </div>
            <div className="text-xs sm:text-sm font-black text-stone-900 dark:text-stone-100 group-hover:text-[#6b1426] dark:group-hover:text-rose-400 tracking-tight">
              TEACHERS DETAILS
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 truncate">Faculty &amp; Allocations</div>
          </button>

          {/* 8. YOUR RECENT ACTIVITY */}
          <button
            id="module-recent-activity"
            onClick={() => setRecentActivitiesModalOpen(true)}
            className="flex flex-col p-3.5 sm:p-4 rounded-3xl bg-white dark:bg-stone-900 border-2 border-rose-200 dark:border-rose-900/60 hover:border-[#6b1426] dark:hover:border-rose-600 shadow-xs hover:shadow-lg transition-all duration-200 text-left active:scale-[0.98] group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-400 to-pink-600" />
            <div className="flex items-center justify-between mb-2.5">
              <div className="h-12 w-12 rounded-2xl overflow-hidden shadow-xs border border-stone-200 dark:border-stone-700 group-hover:scale-105 transition shrink-0 bg-stone-100 dark:bg-stone-800">
                <img
                  src="https://images.unsplash.com/photo-1506784365847-bbad939e9335?auto=format&fit=crop&w=160&q=80"
                  alt="Recent Activity"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-[#6b1426] dark:text-rose-200 border border-rose-300">
                Audit
              </span>
            </div>
            <div className="text-xs sm:text-sm font-black text-stone-900 dark:text-stone-100 group-hover:text-[#6b1426] dark:group-hover:text-rose-400 tracking-tight">
              RECENT ACTIVITY
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 truncate">Staff Action Logs</div>
          </button>

          {/* 9. SCHOOL ANNOUNCEMENTS & WEEKLY INSPIRATION */}
          <button
            id="module-announcements"
            onClick={() => onNavigate('announcements')}
            className="flex flex-col p-3.5 sm:p-4 rounded-3xl bg-white dark:bg-stone-900 border-2 border-rose-200 dark:border-rose-900/60 hover:border-[#6b1426] dark:hover:border-rose-600 shadow-xs hover:shadow-lg transition-all duration-200 text-left active:scale-[0.98] group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-rose-500 to-sky-500" />
            <div className="flex items-center justify-between mb-2.5">
              <div className="h-12 w-12 rounded-2xl overflow-hidden shadow-xs border border-stone-200 dark:border-stone-700 group-hover:scale-105 transition shrink-0 bg-stone-100 dark:bg-stone-800">
                <img
                  src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=160&q=80"
                  alt="School Announcements & Weekly Inspiration"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-[#6b1426] dark:text-rose-300 border border-rose-300 animate-pulse">
                Weekly Inspiration
              </span>
            </div>
            <div className="text-xs sm:text-sm font-black text-stone-900 dark:text-stone-100 group-hover:text-[#6b1426] dark:group-hover:text-rose-300 tracking-tight">
              ANNOUNCEMENTS
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 truncate">Weekly Inspiration &amp; Notices</div>
          </button>

          {/* 10. MY PROFILE */}
          <button
            id="module-my-profile"
            onClick={() => onNavigate('profile')}
            className="flex flex-col p-3.5 sm:p-4 rounded-3xl bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-800 hover:border-[#6b1426] dark:hover:border-rose-700 shadow-xs hover:shadow-lg transition-all duration-200 text-left active:scale-[0.98] group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
            <div className="flex items-center justify-between mb-2.5">
              <div className="h-12 w-12 rounded-2xl overflow-hidden shadow-xs border border-stone-200 dark:border-stone-700 group-hover:scale-105 transition shrink-0 bg-stone-100 dark:bg-stone-800">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80"
                  alt="My Profile"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300">
                TSC
              </span>
            </div>
            <div className="text-xs sm:text-sm font-black text-stone-900 dark:text-stone-100 group-hover:text-amber-900 dark:group-hover:text-amber-300 tracking-tight">
              MY PROFILE
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 truncate">Staff Credentials</div>
          </button>
        </div>
      </div>



      {/* ========================================================================= */}
      {/* 1. MODAL: YOUR RECENT ACTIVITY (Full List of Teacher Activities) */}
      {/* ========================================================================= */}
      {recentActivitiesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-stone-900 shadow-2xl border border-stone-200 dark:border-stone-800 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#6b1426] to-[#540d1e] text-white px-6 py-4 flex items-center justify-between border-b border-[#8c1632] shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-sky-200 border border-white/20">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Your Recent Activity Log</h3>
                  <p className="text-xs text-sky-100/90">
                    Audit log of actions performed by {currentUser?.name || 'Teacher Staff'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRecentActivitiesModalOpen(false)}
                className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 border-b border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/60 space-y-2.5 shrink-0 text-xs">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  value={activitySearch}
                  onChange={(e) => setActivitySearch(e.target.value)}
                  placeholder="Search your activities..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-medium text-stone-900 dark:text-stone-100 focus:border-[#6b1426] dark:focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase mr-1">Category:</span>
                {(['all', 'marks', 'document', 'circular'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActivityCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg font-bold capitalize transition ${
                      activityCategory === cat
                        ? 'bg-[#6b1426] text-white'
                        : 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Activities List */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1 bg-white dark:bg-stone-900">
              {filteredActivities.length > 0 ? (
                filteredActivities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3.5 rounded-2xl bg-white dark:bg-stone-800/80 border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 transition flex items-start justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/60 text-[#6b1426] dark:text-rose-300 font-bold mt-0.5">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-extrabold text-stone-900 dark:text-stone-100 text-xs sm:text-sm block">
                          {act.action}
                        </span>
                        {act.details && (
                          <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">{act.details}</p>
                        )}
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mt-1 inline-block">
                          Category: {act.category}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-semibold text-stone-500 dark:text-stone-400 shrink-0">
                      {act.time}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-stone-500 dark:text-stone-400 text-xs">
                  No matching activities found.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-stone-100 dark:bg-stone-950 px-6 py-3 border-t border-stone-200 dark:border-stone-800 flex justify-end shrink-0">
              <button
                onClick={() => setRecentActivitiesModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-800 text-white font-bold text-xs hover:bg-stone-800 dark:hover:bg-stone-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MODAL: SCHOOL ANNOUNCEMENTS (Full List of School Circulars) */}
      {/* ========================================================================= */}
      {announcementsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-stone-900 shadow-2xl border border-stone-200 dark:border-stone-800 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#6b1426] to-[#540d1e] text-white px-6 py-4 flex items-center justify-between border-b border-[#8c1632] shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-sky-200 border border-white/20">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">School Announcements &amp; Circulars</h3>
                  <p className="text-xs text-sky-100/90">
                    Official internal notices and communications for Reberwet JSS staff
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAnnouncementsModalOpen(false)}
                className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/60 shrink-0 text-xs">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  value={announcementSearch}
                  onChange={(e) => setAnnouncementSearch(e.target.value)}
                  placeholder="Search announcements by title or content..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-medium text-stone-900 dark:text-stone-100 focus:border-[#6b1426] dark:focus:border-rose-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Announcements List */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 bg-white dark:bg-stone-900">
              {/* Weekly Inspiration Section inside Modal */}
              <WeeklyInspirationCard
                currentUser={currentUser || undefined}
                onShowSuccessToast={onShowSuccessToast}
              />

              <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
                <span className="text-xs font-black uppercase text-stone-500 tracking-wider">
                  School Circulars &amp; Notices
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAnnouncementsModalOpen(false);
                    onNavigate('announcements');
                  }}
                  className="text-xs font-bold text-[#6b1426] dark:text-rose-400 hover:underline"
                >
                  View Full Notice Board Page →
                </button>
              </div>

              {filteredAnnouncements.length > 0 ? (
                filteredAnnouncements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-4 rounded-2xl bg-white dark:bg-stone-800/80 border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 transition space-y-2 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-black text-stone-900 dark:text-stone-100 text-sm">
                        {ann.title}
                      </h4>
                      <span className="text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-[#6b1426] dark:text-rose-300 px-2 py-0.5 rounded-md shrink-0">
                        {ann.category}
                      </span>
                    </div>

                    <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                      {ann.message}
                    </p>

                    <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                      <span>Author: <strong className="text-stone-700 dark:text-stone-200">{ann.author}</strong></span>
                      <span>{ann.date}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-stone-500 dark:text-stone-400 text-xs">
                  No announcements match your search.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-stone-100 dark:bg-stone-950 px-6 py-3 border-t border-stone-200 dark:border-stone-800 flex justify-end shrink-0">
              <button
                onClick={() => setAnnouncementsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-800 text-white font-bold text-xs hover:bg-stone-800 dark:hover:bg-stone-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MODAL: TEACHING & LEARNING RESOURCES HUB */}
      {/* ========================================================================= */}
      {resourcesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-4xl rounded-3xl bg-white dark:bg-stone-900 shadow-2xl border border-stone-200 dark:border-stone-800 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#6b1426] to-[#540d1e] text-white px-6 py-4 flex items-center justify-between border-b border-[#8c1632] shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-sky-200 border border-white/20">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Teaching &amp; Learning Resources Hub</h3>
                  <p className="text-xs text-sky-100/90">
                    Schemes of work, revision notes, assessment papers &amp; lesson plans
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setUploadResourceModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 text-[#6b1426] dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-stone-700 text-xs font-black shadow-xs transition active:scale-95 border border-transparent dark:border-stone-700"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Resource</span>
                </button>
                <button
                  onClick={() => setResourcesModalOpen(false)}
                  className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 border-b border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/60 space-y-2.5 shrink-0 text-xs">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  value={resourceSearch}
                  onChange={(e) => setResourceSearch(e.target.value)}
                  placeholder="Search resources by title, subject, or content..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-medium text-stone-900 dark:text-stone-100 focus:border-[#6b1426] dark:focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between flex-wrap gap-2">
                {/* Grade filters */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase mr-1">Grade:</span>
                  {(['all', 'Grade 7', 'Grade 8', 'Grade 9'] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => setResourceFilterGrade(g)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition text-xs ${
                        resourceFilterGrade === g
                          ? 'bg-[#6b1426] text-white'
                          : 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
                      }`}
                    >
                      {g === 'all' ? 'All Grades' : g}
                    </button>
                  ))}
                </div>

                {/* Category filters */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase mr-1">Category:</span>
                  {(['all', 'Revision Notes', 'Schemes of Work', 'Assessment Papers', 'Lesson Plans'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setResourceCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition text-xs ${
                        resourceCategory === cat
                          ? 'bg-sky-800 dark:bg-sky-700 text-white'
                          : 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Resources Grid */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1 bg-white dark:bg-stone-900">
              {filteredHomeResources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredHomeResources.map((res) => (
                    <div
                      key={res.id}
                      className="p-4 rounded-2xl bg-white dark:bg-stone-800/80 border border-stone-200 dark:border-stone-800 hover:border-[#6b1426] dark:hover:border-rose-600 transition flex flex-col justify-between space-y-3 shadow-2xs"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[10px] font-black uppercase bg-rose-100 dark:bg-rose-950 text-[#6b1426] dark:text-rose-300 px-2 py-0.5 rounded-md">
                            {res.category}
                          </span>
                          <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400">
                            {res.grade} • {res.subject}
                          </span>
                        </div>

                        <h4 className="font-extrabold text-stone-900 dark:text-stone-100 text-sm mt-2 line-clamp-2 leading-snug">
                          {res.title}
                        </h4>

                        <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                          {res.content}
                        </p>

                        {res.keyOutcomes && res.keyOutcomes.length > 0 && (
                          <div className="mt-2 text-[10.5px] text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-stone-800 p-2 rounded-xl border border-stone-100 dark:border-stone-700 space-y-0.5">
                            <span className="font-bold text-stone-700 dark:text-stone-300 block">Outcomes:</span>
                            {res.keyOutcomes.slice(0, 2).map((out, i) => (
                              <div key={i} className="truncate">• {out}</div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                          {res.author} • {res.date}
                        </span>

                        <button
                          onClick={() => handleDownloadResourcePdf(res)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 dark:bg-rose-900 hover:bg-[#6b1426] text-white font-bold text-xs shadow-xs transition active:scale-95"
                          title="Download resource directly as PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download PDF</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-stone-500 dark:text-stone-400 text-xs">
                  No teaching resources match your selected filters.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-stone-100 dark:bg-stone-950 px-6 py-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between shrink-0 text-xs">
              <button
                onClick={() => {
                  setResourcesModalOpen(false);
                  onNavigate('documents');
                }}
                className="font-bold text-[#6b1426] dark:text-rose-400 hover:underline flex items-center gap-1"
              >
                <span>Open Full Document Center</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setResourcesModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-800 text-white font-bold text-xs hover:bg-stone-800 dark:hover:bg-stone-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: UPLOAD TEACHING RESOURCE */}
      {/* ========================================================================= */}
      {uploadResourceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-stone-900 shadow-2xl border border-stone-200 dark:border-stone-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <h3 className="font-black text-stone-900 dark:text-stone-100 text-base flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#6b1426] dark:text-rose-400" />
                <span>Upload Teaching Resource</span>
              </h3>
              <button
                onClick={() => setUploadResourceModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateResource} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Resource Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grade 8 Mathematics - Linear Equations Summary Notes"
                  value={newResTitle}
                  onChange={(e) => setNewResTitle(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 p-2.5 text-stone-900 dark:text-stone-100 font-semibold focus:border-[#6b1426] dark:focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Grade *</label>
                  <select
                    value={newResGrade}
                    onChange={(e) => setNewResGrade(e.target.value as any)}
                    className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 p-2.5 text-stone-800 dark:text-stone-200 font-bold focus:border-[#6b1426]"
                  >
                    <option value="Grade 7">Grade 7</option>
                    <option value="Grade 8">Grade 8</option>
                    <option value="Grade 9">Grade 9</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Subject *</label>
                  <select
                    value={newResSubject}
                    onChange={(e) => setNewResSubject(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 p-2.5 text-stone-800 dark:text-stone-200 font-bold focus:border-[#6b1426]"
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Category *</label>
                <select
                  value={newResCategory}
                  onChange={(e) => setNewResCategory(e.target.value as any)}
                  className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 p-2.5 text-stone-800 dark:text-stone-200 font-bold focus:border-[#6b1426]"
                >
                  <option value="Revision Notes">Revision Notes</option>
                  <option value="Schemes of Work">Schemes of Work</option>
                  <option value="Assessment Papers">Assessment Papers</option>
                  <option value="Lesson Plans">Lesson Plans</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Summary Content / Key Notes</label>
                <textarea
                  rows={3}
                  placeholder="Outline key learning outcomes, strands, or exam notes..."
                  value={newResContent}
                  onChange={(e) => setNewResContent(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 p-2.5 text-stone-800 dark:text-stone-200 font-medium focus:border-[#6b1426]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Attach File (Optional PDF / DOCX)</label>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.xlsx,.csv"
                  onChange={(e) => setNewResFile(e.target.files?.[0] || null)}
                  className="w-full rounded-xl border border-stone-300 dark:border-stone-700 p-2 text-stone-700 dark:text-stone-300 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-rose-50 dark:file:bg-rose-950 file:text-[#6b1426] dark:file:text-rose-300"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUploadResourceModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#6b1426] hover:bg-[#520e1c] text-white font-black shadow-xs transition active:scale-95 flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Resource</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
