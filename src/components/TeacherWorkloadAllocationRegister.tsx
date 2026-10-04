import React, { useState, useMemo } from 'react';
import { UserProfile, TeacherAssignment } from '../types';
import { SUBJECTS } from '../data/initialData';
import { buildTimetable, saveTimetableToStorage, normalizeSubjectName } from '../utils/timetableService';
import { StorageService, TeacherAllocationRequest } from '../utils/storage';
import { downloadCsvToFile } from '../utils/fileDownloader';
import {
  generateTeacherWorkloadPdf,
  getTeacherWorkloadPdfDataUri,
  TeacherWorkloadRow,
  UnallocatedSubjectsReport,
} from '../utils/workloadPdfExport';
import { PdfViewerModal } from './PdfViewerModal';
import { dispatchPortalSms } from '../utils/smsService';
import {
  BookOpen,
  Calendar,
  Clock,
  Download,
  Edit2,
  FileSpreadsheet,
  FileText,
  Eye,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  UserCheck,
  Users,
  Plus,
  Trash2,
  Save,
  X,
  Send,
  Bell,
  Sparkles,
} from 'lucide-react';

interface TeacherWorkloadAllocationRegisterProps {
  teachers: UserProfile[];
  currentUser: UserProfile;
  onUpdateTeachers: (updated: UserProfile[]) => void;
  onShowSuccessToast: (msg: string) => void;
}

const GRADES = ['Grade 7', 'Grade 8', 'Grade 9'] as const;

// Standard periods per week per subject in CBC Junior Secondary School
const SUBJECT_PERIODS_MAP: Record<string, number> = {
  'Mathematics': 5,
  'English': 5,
  'Kiswahili': 5,
  'Integrated Science': 5,
  'Social Studies': 4,
  'Agriculture & Nutrition': 4,
  'Pre-Technical Studies': 4,
  'CRE (Religious Education)': 4,
  'Creative Arts & Sports': 4,
};

export const TeacherWorkloadAllocationRegister: React.FC<TeacherWorkloadAllocationRegisterProps> = ({
  teachers,
  currentUser,
  onUpdateTeachers,
  onShowSuccessToast,
}) => {
  const isAdmin = currentUser.role === 'school_admin' || currentUser.role === 'super_admin';

  // Modal State for Editing Allocation
  const [editingTeacher, setEditingTeacher] = useState<UserProfile | null>(null);
  const [editAssignments, setEditAssignments] = useState<TeacherAssignment[]>([]);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [pdfDataUri, setPdfDataUri] = useState<string | null>(null);

  // Pending Requests State
  const [pendingRequests, setPendingRequests] = useState<TeacherAllocationRequest[]>(() =>
    StorageService.getAllocationRequests().filter((r) => r.status === 'pending')
  );

  // Generate Current Timetable to compute exact weekly lesson loads
  const currentTimetable = useMemo(() => {
    return buildTimetable(teachers);
  }, [teachers]);

  // Build Teacher Workload Rows
  const workloadRows: TeacherWorkloadRow[] = useMemo(() => {
    return teachers.map((teacher) => {
      const assignments = teacher.assignments || [];

      // Subjects per grade
      const g7Subjects = assignments
        .filter((a) => a.grade === 'Grade 7')
        .map((a) => a.subject);
      const g8Subjects = assignments
        .filter((a) => a.grade === 'Grade 8')
        .map((a) => a.subject);
      const g9Subjects = assignments
        .filter((a) => a.grade === 'Grade 9')
        .map((a) => a.subject);

      // Weekly Lessons Count from timetable lessons
      const weeklyLessons = currentTimetable.lessons.filter(
        (l) =>
          l.teacherId === teacher.id ||
          (l.teacherName && l.teacherName.toLowerCase() === teacher.name.toLowerCase())
      ).length;

      return {
        teacher,
        g7Subjects,
        g8Subjects,
        g9Subjects,
        weeklyLessons,
      };
    });
  }, [teachers, currentTimetable]);

  // Unallocated Subjects Audit (Check out of 9 subjects of every grade)
  const unallocatedReport: UnallocatedSubjectsReport = useMemo(() => {
    const isSubjectAllocatedInGrade = (subject: string, grade: string) => {
      const norm = normalizeSubjectName(subject);
      return teachers.some((t) => {
        if (!t.assignments) return false;
        return t.assignments.some(
          (a) => a.grade === grade && normalizeSubjectName(a.subject) === norm
        );
      });
    };

    const g7Unallocated = SUBJECTS.filter((s) => !isSubjectAllocatedInGrade(s, 'Grade 7'));
    const g8Unallocated = SUBJECTS.filter((s) => !isSubjectAllocatedInGrade(s, 'Grade 8'));
    const g9Unallocated = SUBJECTS.filter((s) => !isSubjectAllocatedInGrade(s, 'Grade 9'));

    return {
      grade7Unallocated: g7Unallocated,
      grade8Unallocated: g8Unallocated,
      grade9Unallocated: g9Unallocated,
      totalUnallocated: g7Unallocated.length + g8Unallocated.length + g9Unallocated.length,
    };
  }, [teachers]);

  // Open Edit Modal for a Teacher
  const handleOpenEdit = (teacher: UserProfile) => {
    setEditingTeacher(teacher);
    setEditAssignments(teacher.assignments ? [...teacher.assignments] : []);
  };

  // Toggle Subject in Edit Form
  const handleToggleSubject = (grade: string, subject: string) => {
    const norm = normalizeSubjectName(subject);
    const exists = editAssignments.some(
      (a) => a.grade === grade && normalizeSubjectName(a.subject) === norm
    );

    if (exists) {
      setEditAssignments((prev) =>
        prev.filter(
          (a) => !(a.grade === grade && normalizeSubjectName(a.subject) === norm)
        )
      );
    } else {
      setEditAssignments((prev) => [...prev, { grade, subject }]);
    }
  };

  // Calculate live preview of lessons for editing teacher
  const previewLessons = useMemo(() => {
    return editAssignments.reduce((acc, curr) => {
      const periods = SUBJECT_PERIODS_MAP[curr.subject] || 4;
      return acc + periods;
    }, 0);
  }, [editAssignments]);

  // Save changes (Admin approves & applies immediately; Non-Admin creates approval request)
  const handleSaveAllocation = () => {
    if (!editingTeacher) return;

    if (isAdmin) {
      // Direct Admin Approval & Application
      applyTeacherAllocationChanges(
        editingTeacher.id,
        editAssignments,
        editingTeacher.assignments || []
      );
      setEditingTeacher(null);
    } else {
      // Create Pending Request for Admin Approval
      const newRequest: TeacherAllocationRequest = {
        id: `req-${Date.now()}`,
        teacherId: editingTeacher.id,
        teacherName: editingTeacher.name,
        proposedAssignments: editAssignments,
        previousAssignments: editingTeacher.assignments || [],
        requestedBy: currentUser.name,
        requestedByRole: currentUser.role,
        requestedAt: new Date().toISOString(),
        status: 'pending',
      };

      StorageService.addAllocationRequest(newRequest);
      setPendingRequests(
        StorageService.getAllocationRequests().filter((r) => r.status === 'pending')
      );

      // Dispatch alert to school administrator
      onShowSuccessToast(
        `Allocation changes submitted for Admin Approval! The timetable will update once approved by administration.`
      );
      setEditingTeacher(null);
    }
  };

  // Core function: Applies approved changes to teachers, rebuilds timetable, and notifies affected teachers
  const applyTeacherAllocationChanges = (
    teacherId: string,
    newAssignments: TeacherAssignment[],
    previousAssignments: TeacherAssignment[]
  ) => {
    const targetTeacher = teachers.find((t) => t.id === teacherId);
    if (!targetTeacher) return;

    // 1. Update Teachers array
    const updatedTeachers = teachers.map((t) => {
      if (t.id === teacherId) {
        return {
          ...t,
          assignments: newAssignments,
          primarySubject: newAssignments[0]?.subject || t.primarySubject,
          assignedClass: newAssignments[0]?.grade || t.assignedClass,
        };
      }
      return t;
    });

    onUpdateTeachers(updatedTeachers);
    StorageService.saveTeachers(updatedTeachers);

    // 2. Automatically Rebuild Timetable with new assignments
    const updatedTimetable = buildTimetable(updatedTeachers);
    saveTimetableToStorage(updatedTimetable);

    // 3. Automatically Notify Affected Teacher(s) via in-portal notification & simulated SMS
    const newSummary = newAssignments
      .map((a) => `${a.grade}: ${a.subject}`)
      .join('; ');

    // SMS dispatch to target teacher
    if (targetTeacher.phone) {
      const smsMessage = `Reberwet JSS Notice: Hello ${targetTeacher.name}, your teaching allocation and timetable have been officially updated by Admin. New load: ${newSummary || 'None assigned'}. Check your timetable portal.`;
      dispatchPortalSms(targetTeacher.name, targetTeacher.phone, smsMessage, 'general_announcement');
    }

    // Official circular / announcement in portal
    const announcementNotice = {
      id: `ann-alloc-${Date.now()}`,
      title: `Timetable & Workload Update: ${targetTeacher.name}`,
      message: `The school administration has approved and updated teaching subject allocations for ${targetTeacher.name}. All class and teacher timetables have been automatically synchronized.`,
      category: 'Administrative' as const,
      date: new Date().toISOString().split('T')[0],
      author: currentUser.name,
      priority: 'high' as const,
      isNew: true,
    };
    const currentAnnouncements = StorageService.getAnnouncements();
    StorageService.saveAnnouncements([announcementNotice, ...currentAnnouncements]);

    onShowSuccessToast(
      `Approved! Teaching allocations for ${targetTeacher.name} applied, timetable updated, and teacher notified via SMS.`
    );
  };

  // Admin approves a pending request
  const handleApproveRequest = (request: TeacherAllocationRequest) => {
    applyTeacherAllocationChanges(
      request.teacherId,
      request.proposedAssignments,
      request.previousAssignments
    );

    // Mark as approved in storage
    const allRequests = StorageService.getAllocationRequests().map((r) =>
      r.id === request.id
        ? {
            ...r,
            status: 'approved' as const,
            reviewedBy: currentUser.name,
            reviewedAt: new Date().toISOString(),
          }
        : r
    );
    StorageService.saveAllocationRequests(allRequests);
    setPendingRequests(allRequests.filter((r) => r.status === 'pending'));
  };

  // Admin rejects a pending request
  const handleRejectRequest = (request: TeacherAllocationRequest) => {
    const allRequests = StorageService.getAllocationRequests().map((r) =>
      r.id === request.id
        ? {
            ...r,
            status: 'rejected' as const,
            reviewedBy: currentUser.name,
            reviewedAt: new Date().toISOString(),
          }
        : r
    );
    StorageService.saveAllocationRequests(allRequests);
    setPendingRequests(allRequests.filter((r) => r.status === 'pending'));
    onShowSuccessToast(`Allocation change request for ${request.teacherName} was rejected.`);
  };

  // Open PDF Preview Modal
  const handleOpenPdfPreview = () => {
    try {
      const uri = getTeacherWorkloadPdfDataUri(workloadRows, unallocatedReport);
      setPdfDataUri(uri);
    } catch (e) {
      console.warn('Could not generate dataUri for workload:', e);
    }
    setIsPreviewOpen(true);
  };

  // Download PDF Register
  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const res = await generateTeacherWorkloadPdf(
        workloadRows,
        unallocatedReport,
        (msg, isErr) => {
          if (!isErr) onShowSuccessToast(msg);
        }
      );
      if (res.success) {
        onShowSuccessToast('Teacher Workload & Allocation Register downloaded successfully.');
      }
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Download CSV Register
  const handleDownloadCsv = () => {
    const headers = [
      '#',
      'Teacher Name',
      'Designation',
      'TSC Number',
      'Grade 7 Subjects',
      'Grade 8 Subjects',
      'Grade 9 Subjects',
      'Weekly Lessons',
    ];

    const rows = workloadRows.map((r, i) => [
      `${i + 1}`,
      `"${r.teacher.name}"`,
      `"${r.teacher.designation || 'Faculty Member'}"`,
      `"${r.teacher.tscNumber || 'TSC/REG'}"`,
      `"${r.g7Subjects.join('; ') || 'None'}"`,
      `"${r.g8Subjects.join('; ') || 'None'}"`,
      `"${r.g9Subjects.join('; ') || 'None'}"`,
      `${r.weeklyLessons}`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    downloadCsvToFile(
      csvContent,
      'Reberwet_JSS_Teacher_Subject_Allocation_Register_2026.csv',
      (msg) => onShowSuccessToast(msg)
    );
  };

  return (
    <div className="mt-8 space-y-6 border-t-2 border-stone-200 dark:border-stone-800 pt-6">
      {/* Header and Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#6b1426] text-white">
              <BookOpen className="w-4 h-4" />
            </span>
            <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100">
              Teacher Subject Allocation &amp; Weekly Lesson Workload
            </h3>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Overview of subjects taught in Grade 7, 8, 9, weekly lessons count, and unallocated subject audit.
          </p>
        </div>

        {/* Action Buttons: View as PDF, Download PDF, Download CSV */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleOpenPdfPreview}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-[#6b1426] dark:text-rose-300 border-2 border-[#6b1426]/30 dark:border-rose-800 text-xs font-bold flex items-center gap-2 transition active:scale-95 cursor-pointer shadow-xs"
          >
            <Eye className="w-3.5 h-3.5 text-[#6b1426] dark:text-rose-400" />
            <span>VIEW AS PDF</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="px-3.5 py-2 rounded-xl bg-[#6b1426] hover:bg-[#520f1d] text-white text-xs font-bold flex items-center gap-2 transition shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isDownloadingPdf ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FileText className="w-3.5 h-3.5" />
            )}
            <span>Download Register (PDF)</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadCsv}
            className="px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 text-xs font-bold flex items-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* UNALLOCATED SUBJECTS AUDIT BANNER (Out of 9 subjects of every grade) */}
      <div className="rounded-2xl border p-4 transition-all">
        {unallocatedReport.totalUnallocated > 0 ? (
          <div className="space-y-3 bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/80 -m-4 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-black text-xs sm:text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                Attention: {unallocatedReport.totalUnallocated} Subject(s) Without an Assigned Teacher (Out of 9 Subjects per Grade)
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {/* Grade 7 Unallocated */}
              <div className="bg-white/80 dark:bg-stone-900/80 rounded-xl p-3 border border-amber-200 dark:border-amber-900/60">
                <div className="font-extrabold text-stone-900 dark:text-stone-100 mb-1.5 flex items-center justify-between">
                  <span>Grade 7 (9 Subjects)</span>
                  <span className="text-[10px] font-black text-amber-700 dark:text-amber-400">
                    {unallocatedReport.grade7Unallocated.length > 0 ? `${unallocatedReport.grade7Unallocated.length} vacant` : '✓ 100% Staffed'}
                  </span>
                </div>
                {unallocatedReport.grade7Unallocated.length > 0 ? (
                  <ul className="space-y-1">
                    {unallocatedReport.grade7Unallocated.map((s) => (
                      <li key={s} className="flex items-center justify-between text-[11px] text-rose-700 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded">
                        <span>• {s}</span>
                        <span className="text-[9px] uppercase font-bold text-rose-600">No Teacher</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">All 9 subjects assigned to teachers.</p>
                )}
              </div>

              {/* Grade 8 Unallocated */}
              <div className="bg-white/80 dark:bg-stone-900/80 rounded-xl p-3 border border-amber-200 dark:border-amber-900/60">
                <div className="font-extrabold text-stone-900 dark:text-stone-100 mb-1.5 flex items-center justify-between">
                  <span>Grade 8 (9 Subjects)</span>
                  <span className="text-[10px] font-black text-amber-700 dark:text-amber-400">
                    {unallocatedReport.grade8Unallocated.length > 0 ? `${unallocatedReport.grade8Unallocated.length} vacant` : '✓ 100% Staffed'}
                  </span>
                </div>
                {unallocatedReport.grade8Unallocated.length > 0 ? (
                  <ul className="space-y-1">
                    {unallocatedReport.grade8Unallocated.map((s) => (
                      <li key={s} className="flex items-center justify-between text-[11px] text-rose-700 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded">
                        <span>• {s}</span>
                        <span className="text-[9px] uppercase font-bold text-rose-600">No Teacher</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">All 9 subjects assigned to teachers.</p>
                )}
              </div>

              {/* Grade 9 Unallocated */}
              <div className="bg-white/80 dark:bg-stone-900/80 rounded-xl p-3 border border-amber-200 dark:border-amber-900/60">
                <div className="font-extrabold text-stone-900 dark:text-stone-100 mb-1.5 flex items-center justify-between">
                  <span>Grade 9 (9 Subjects)</span>
                  <span className="text-[10px] font-black text-amber-700 dark:text-amber-400">
                    {unallocatedReport.grade9Unallocated.length > 0 ? `${unallocatedReport.grade9Unallocated.length} vacant` : '✓ 100% Staffed'}
                  </span>
                </div>
                {unallocatedReport.grade9Unallocated.length > 0 ? (
                  <ul className="space-y-1">
                    {unallocatedReport.grade9Unallocated.map((s) => (
                      <li key={s} className="flex items-center justify-between text-[11px] text-rose-700 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded">
                        <span>• {s}</span>
                        <span className="text-[9px] uppercase font-bold text-rose-600">No Teacher</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">All 9 subjects assigned to teachers.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 -m-4 p-4 rounded-2xl text-xs sm:text-sm">
            <div className="flex items-center gap-2.5 text-emerald-900 dark:text-emerald-200 font-black">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                Full Curriculum Coverage: All 9 CBC Subjects across Grade 7, Grade 8, and Grade 9 have assigned teachers (27 / 27 allocations active).
              </span>
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300">
              Zero Vacancies
            </span>
          </div>
        )}
      </div>

      {/* ADMIN PENDING APPROVALS QUEUE */}
      {isAdmin && pendingRequests.length > 0 && (
        <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-black text-xs sm:text-sm">
              <Bell className="w-4 h-4 text-amber-600 animate-bounce" />
              <span>Pending Teacher Allocation Requests Requiring Your Approval ({pendingRequests.length})</span>
            </div>
            <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300">
              Admin Approval Required to Update Timetable
            </span>
          </div>

          <div className="divide-y divide-amber-200 dark:divide-amber-800/60">
            {pendingRequests.map((req) => (
              <div key={req.id} className="pt-2.5 pb-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                <div>
                  <p className="font-extrabold text-stone-900 dark:text-stone-100">
                    {req.teacherName}{' '}
                    <span className="font-normal text-stone-500">
                      (Requested by {req.requestedBy} • {new Date(req.requestedAt).toLocaleDateString()})
                    </span>
                  </p>
                  <p className="text-[11px] text-stone-600 dark:text-stone-300 mt-0.5">
                    Proposed: {req.proposedAssignments.map((a) => `${a.grade}: ${a.subject}`).join(', ') || 'No subjects'}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleApproveRequest(req)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve &amp; Update Timetable</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRejectRequest(req)}
                    className="px-3 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-700 hover:bg-rose-100 hover:text-rose-700 text-stone-700 dark:text-stone-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WORKLOAD ALLOCATION TABLE */}
      <div className="overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-stone-100/80 dark:bg-stone-800/80 border-b border-stone-200 dark:border-stone-700 text-[11px] font-black text-stone-700 dark:text-stone-300 uppercase tracking-wider">
              <th className="py-3 px-3 w-10 text-center">#</th>
              <th className="py-3 px-3">Teacher Name &amp; Title</th>
              <th className="py-3 px-3">Grade 7 Subjects</th>
              <th className="py-3 px-3">Grade 8 Subjects</th>
              <th className="py-3 px-3">Grade 9 Subjects</th>
              <th className="py-3 px-3 text-center">Lessons / Wk</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
            {workloadRows.map((row, idx) => {
              const isCurrent = row.teacher.id === currentUser.id;
              return (
                <tr
                  key={row.teacher.id}
                  className={`hover:bg-rose-50/30 dark:hover:bg-rose-950/20 transition ${
                    isCurrent ? 'bg-rose-50/20 dark:bg-rose-950/20' : ''
                  }`}
                >
                  <td className="py-3 px-3 text-center font-mono text-stone-400 font-bold text-[11px]">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 flex-wrap">
                      <span>{row.teacher.name}</span>
                      {isCurrent && (
                        <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.2 rounded">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-stone-500 dark:text-stone-400 flex items-center gap-2">
                      <span>{row.teacher.designation || 'Subject Teacher'}</span>
                      <span>•</span>
                      <span className="font-mono">{row.teacher.tscNumber || 'TSC/REG'}</span>
                    </div>
                  </td>

                  {/* Grade 7 Subjects */}
                  <td className="py-3 px-3">
                    {row.g7Subjects.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {row.g7Subjects.map((s) => (
                          <span
                            key={s}
                            className="inline-block px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-semibold text-[11px] border border-stone-200 dark:border-stone-700"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-stone-400 text-[11px] italic">—</span>
                    )}
                  </td>

                  {/* Grade 8 Subjects */}
                  <td className="py-3 px-3">
                    {row.g8Subjects.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {row.g8Subjects.map((s) => (
                          <span
                            key={s}
                            className="inline-block px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-semibold text-[11px] border border-stone-200 dark:border-stone-700"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-stone-400 text-[11px] italic">—</span>
                    )}
                  </td>

                  {/* Grade 9 Subjects */}
                  <td className="py-3 px-3">
                    {row.g9Subjects.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {row.g9Subjects.map((s) => (
                          <span
                            key={s}
                            className="inline-block px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-semibold text-[11px] border border-stone-200 dark:border-stone-700"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-stone-400 text-[11px] italic">—</span>
                    )}
                  </td>

                  {/* Weekly Lessons */}
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-flex items-center justify-center font-mono font-black text-xs px-2.5 py-1 rounded-full ${
                        row.weeklyLessons > 28
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
                          : row.weeklyLessons >= 18
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                      }`}
                    >
                      {row.weeklyLessons}
                    </span>
                  </td>

                  {/* Edit Button */}
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(row.teacher)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-[#6b1426] hover:text-white text-stone-700 dark:text-stone-300 font-bold text-xs transition cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* EDIT ALLOCATION MODAL */}
      {editingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl max-w-2xl w-full overflow-hidden my-6">
            {/* Header */}
            <div className="bg-[#6b1426] text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-200">
                  Subject Allocation &amp; Workload Editor
                </span>
                <h3 className="text-base sm:text-lg font-black">{editingTeacher.name}</h3>
                <p className="text-xs text-rose-100">
                  {editingTeacher.designation || 'Subject Teacher'} • {editingTeacher.phone}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingTeacher(null)}
                className="p-1.5 rounded-full hover:bg-white/20 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content: 3 Grades with Subject Checkboxes */}
            <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-100 dark:bg-stone-800 text-xs">
                <div>
                  <span className="font-bold text-stone-700 dark:text-stone-300">
                    Live Workload Preview:
                  </span>
                  <span className="ml-2 font-mono font-black text-sm text-[#6b1426] dark:text-rose-400">
                    {previewLessons} lessons/week
                  </span>
                </div>
                <span className="text-[11px] text-stone-500">
                  CBC Recommended Max: 28 lessons/wk
                </span>
              </div>

              {GRADES.map((grade) => (
                <div key={grade} className="space-y-2">
                  <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-1">
                    <span className="font-extrabold text-stone-900 dark:text-stone-100 text-xs sm:text-sm">
                      {grade} Subject Coverage (9 Learning Areas)
                    </span>
                    <span className="text-[10px] font-bold text-stone-500">
                      Select subjects taught by {editingTeacher.name.split(' ')[0]}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {SUBJECTS.map((subject) => {
                      const isAssigned = editAssignments.some(
                        (a) => a.grade === grade && normalizeSubjectName(a.subject) === normalizeSubjectName(subject)
                      );
                      const periods = SUBJECT_PERIODS_MAP[subject] || 4;

                      return (
                        <button
                          key={subject}
                          type="button"
                          onClick={() => handleToggleSubject(grade, subject)}
                          className={`p-2.5 rounded-xl border text-left text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                            isAssigned
                              ? 'bg-rose-50 dark:bg-rose-950/50 border-[#6b1426] dark:border-rose-700 text-[#6b1426] dark:text-rose-300 shadow-xs'
                              : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-stone-400'
                          }`}
                        >
                          <span className="truncate pr-1">{subject}</span>
                          <span className="text-[10px] shrink-0 font-mono px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
                            {periods}L
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer with Approval Workflow */}
            <div className="p-4 bg-stone-50 dark:bg-stone-800/80 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#6b1426] dark:text-rose-400 shrink-0" />
                <span>
                  {isAdmin
                    ? 'As Administrator, saving will immediately update the timetable and notify the teacher.'
                    : 'Changes will be submitted for Administrator approval before updating the timetable.'}
                </span>
              </div>

              <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
                  className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveAllocation}
                  className="px-5 py-2.5 rounded-xl bg-[#6b1426] hover:bg-[#520f1d] text-white font-extrabold flex items-center gap-2 transition shadow-xs active:scale-95 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {isAdmin ? 'Approve & Apply to Timetable' : 'Submit for Admin Approval'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF VIEWER MODAL FOR WORKLOAD REGISTER */}
      <PdfViewerModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Teacher Subject Allocation & Workload Register - Term 3 2026"
        pdfDataUri={pdfDataUri || undefined}
        onDownload={handleDownloadPdf}
      />
    </div>
  );
};
