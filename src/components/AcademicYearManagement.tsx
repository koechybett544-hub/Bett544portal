import React, { useState, useMemo } from 'react';
import {
  Learner,
  MarkEntry,
  UserProfile,
  TimetableData,
  AnnualPromotionRecord,
} from '../types';
import { DateService } from '../utils/dateService';
import { StorageService } from '../utils/storage';
import { saveLearnersToFirestore, saveAcademicYearConfigToFirestore } from '../lib/firebase';
import {
  Calendar,
  GraduationCap,
  Archive,
  History,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  FileText,
  Users,
  Award,
  Sparkles,
  BookOpen,
  Filter,
  Check,
  RotateCcw,
} from 'lucide-react';
import { GRADES, SUBJECTS, SCHOOL_INFO } from '../data/initialData';

interface AcademicYearManagementProps {
  currentUser: UserProfile;
  learners: Learner[];
  marks: MarkEntry[];
  teachers: UserProfile[];
  timetable?: TimetableData;
  onUpdateLearners: (updated: Learner[]) => void;
  onShowSuccessToast: (msg: string) => void;
  onNavigateTo?: (view: string) => void;
  onClose?: () => void;
}

export const AcademicYearManagement: React.FC<AcademicYearManagementProps> = ({
  currentUser,
  learners,
  marks,
  teachers,
  timetable,
  onUpdateLearners,
  onShowSuccessToast,
  onNavigateTo,
  onClose,
}) => {
  const currentActiveYear = DateService.getCurrentYear();
  const currentActiveTerm = DateService.getCurrentTerm();
  const previousYear = String(Number(currentActiveYear) - 1);

  // Tabs
  const [activeTab, setActiveTab] = useState<'promotions' | 'archive' | 'history' | 'simulator'>(
    'promotions'
  );

  // Promotion review selection
  const [promotionStage, setPromotionStage] = useState<'G7_to_G8' | 'G8_to_G9' | 'G9_to_Graduated'>(
    'G7_to_G8'
  );
  const [selectedLearnerIds, setSelectedLearnerIds] = useState<string[]>([]);
  const [promotionNotes, setPromotionNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Archive viewer state
  const allKnownYears = useMemo(() => {
    const yearsSet = new Set<string>();
    learners.forEach((l) => {
      if (l.academicYear) yearsSet.add(l.academicYear);
    });
    marks.forEach((m) => {
      if (m.academicYear) yearsSet.add(m.academicYear);
    });
    return DateService.getAvailableAcademicYears(Array.from(yearsSet));
  }, [learners, marks]);

  const [selectedArchiveYear, setSelectedArchiveYear] = useState<string>(
    previousYear && allKnownYears.includes(previousYear) ? previousYear : allKnownYears[allKnownYears.length - 1] || '2026'
  );
  const [archiveSubTab, setArchiveSubTab] = useState<'learners' | 'marks' | 'analysis' | 'timetable' | 'teachers'>('learners');
  const [archiveGradeFilter, setArchiveGradeFilter] = useState('all');

  // Promotion records from storage
  const [promotionLogs, setPromotionLogs] = useState<AnnualPromotionRecord[]>(() =>
    StorageService.getPromotionRecords()
  );

  // Source learners for promotion review:
  // Learners enrolled in the previous academic year who have not yet been promoted for currentActiveYear
  const eligibleLearnersByStage = useMemo(() => {
    // Learners that already have an active record in currentActiveYear
    const activeCurrentYearAdmNos = new Set(
      learners
        .filter((l) => l.academicYear === currentActiveYear)
        .map((l) => l.admNo)
    );

    // Candidates are from previous academic year
    const prevYearLearners = learners.filter(
      (l) => l.academicYear === previousYear || (!l.academicYear && previousYear === '2026')
    );

    const g7 = prevYearLearners.filter(
      (l) => l.grade === 'Grade 7' && !activeCurrentYearAdmNos.has(l.admNo)
    );
    const g8 = prevYearLearners.filter(
      (l) => l.grade === 'Grade 8' && !activeCurrentYearAdmNos.has(l.admNo)
    );
    const g9 = prevYearLearners.filter(
      (l) => l.grade === 'Grade 9' && !activeCurrentYearAdmNos.has(l.admNo)
    );

    return {
      G7_to_G8: g7,
      G8_to_G9: g8,
      G9_to_Graduated: g9,
    };
  }, [learners, currentActiveYear, previousYear]);

  const currentStageCandidates = eligibleLearnersByStage[promotionStage];

  // Helper: calculate average score for a learner in previous year
  const getLearnerPrevYearAverage = (learnerId: string, admNo: string) => {
    const learnerMarks = marks.filter(
      (m) =>
        (m.learnerId === learnerId || m.admNo === admNo) &&
        (m.academicYear === previousYear || (!m.academicYear && previousYear === '2026')) &&
        m.scoreOutOf100 !== undefined &&
        m.scoreOutOf100 !== null
    );
    if (learnerMarks.length === 0) return null;
    const sum = learnerMarks.reduce((acc, m) => acc + (m.scoreOutOf100 || 0), 0);
    return Math.round(sum / learnerMarks.length);
  };

  // Toggle selection
  const handleToggleLearner = (id: string) => {
    setSelectedLearnerIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllCandidates = () => {
    if (selectedLearnerIds.length === currentStageCandidates.length) {
      setSelectedLearnerIds([]);
    } else {
      setSelectedLearnerIds(currentStageCandidates.map((c) => c.id));
    }
  };

  // Approve Promotion Handler
  const handleApprovePromotion = async () => {
    if (selectedLearnerIds.length === 0) {
      alert('Please select at least one learner to approve promotion.');
      return;
    }

    setIsProcessing(true);

    try {
      const targetGrade =
        promotionStage === 'G7_to_G8'
          ? 'Grade 8'
          : promotionStage === 'G8_to_G9'
          ? 'Grade 9'
          : 'Graduated';

      const sourceGrade =
        promotionStage === 'G7_to_G8'
          ? 'Grade 7'
          : promotionStage === 'G8_to_G9'
          ? 'Grade 8'
          : 'Grade 9';

      const newLearnersList = [...learners];
      const newlyCreatedLearners: Learner[] = [];

      selectedLearnerIds.forEach((id) => {
        const sourceLearner = learners.find((l) => l.id === id);
        if (!sourceLearner) return;

        // 1. Mark previous year record as 'Archived' (keeping its academicYear intact)
        const srcIdx = newLearnersList.findIndex((l) => l.id === id);
        if (srcIdx >= 0) {
          newLearnersList[srcIdx] = {
            ...sourceLearner,
            status: 'Archived',
          };
        }

        // 2. Create the learner's new-year active record while preserving history
        const newYearRecord: Learner = {
          ...sourceLearner,
          id: `lrn-${sourceLearner.admNo}-${currentActiveYear}`,
          grade: targetGrade === 'Graduated' ? 'Grade 9' : targetGrade,
          academicYear: currentActiveYear,
          status: targetGrade === 'Graduated' ? 'Graduated' : 'Active',
          comments: {
            generalComment: `Promoted from ${sourceGrade} (${previousYear}) to ${targetGrade} (${currentActiveYear}).`,
            classTeacherComment: 'Ready for new academic year challenges.',
            updatedAt: new Date().toISOString().split('T')[0],
            updatedBy: currentUser.name,
          },
          promotionHistory: [
            ...(sourceLearner.promotionHistory || []),
            {
              fromYear: sourceLearner.academicYear || previousYear,
              fromGrade: sourceGrade,
              toYear: currentActiveYear,
              toGrade: targetGrade,
              promotedAt: new Date().toISOString(),
              promotedBy: currentUser.name,
            },
          ],
        };

        newlyCreatedLearners.push(newYearRecord);
      });

      const updatedAllLearners = [...newLearnersList, ...newlyCreatedLearners];

      // Record in Promotion Logs
      const promotionRecord: AnnualPromotionRecord = {
        id: `prom-${Date.now()}`,
        sourceYear: previousYear,
        targetYear: currentActiveYear,
        sourceGrade,
        targetGrade,
        promotedLearnerIds: selectedLearnerIds,
        promotedCount: selectedLearnerIds.length,
        approvedBy: currentUser.name,
        approvedByRole: currentUser.role,
        approvedAt: new Date().toISOString(),
        notes: promotionNotes.trim() || undefined,
      };

      const updatedLogs = StorageService.addPromotionRecord(promotionRecord);
      setPromotionLogs(updatedLogs);

      // Save to StorageService and parent
      StorageService.saveLearners(updatedAllLearners);
      onUpdateLearners(updatedAllLearners);

      // Async sync with Firestore backend
      saveLearnersToFirestore(updatedAllLearners).catch((e) =>
        console.warn('Firestore learners sync notice:', e)
      );
      saveAcademicYearConfigToFirestore(currentActiveYear, {
        activeYear: currentActiveYear,
        activeTerm: currentActiveTerm,
        promotions: updatedLogs,
      }).catch((e) => console.warn('Firestore year config sync notice:', e));

      onShowSuccessToast(
        `Approved promotion for ${selectedLearnerIds.length} learners to ${targetGrade} for Academic Year ${currentActiveYear}!`
      );

      setSelectedLearnerIds([]);
      setPromotionNotes('');
    } catch (err: any) {
      console.error('Promotion error:', err);
      alert(`Promotion error: ${err?.message || 'Could not complete promotion'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Archive data calculation
  const archiveLearners = useMemo(() => {
    return learners.filter((l) => (l.academicYear || '2026') === selectedArchiveYear);
  }, [learners, selectedArchiveYear]);

  const filteredArchiveLearners = useMemo(() => {
    if (archiveGradeFilter === 'all') return archiveLearners;
    return archiveLearners.filter((l) => l.grade === archiveGradeFilter);
  }, [archiveLearners, archiveGradeFilter]);

  const archiveMarks = useMemo(() => {
    return marks.filter((m) => (m.academicYear || '2026') === selectedArchiveYear);
  }, [marks, selectedArchiveYear]);

  // Total eligible awaiting promotion across all 3 grades
  const totalAwaitingPromotion =
    eligibleLearnersByStage.G7_to_G8.length +
    eligibleLearnersByStage.G8_to_G9.length +
    eligibleLearnersByStage.G9_to_Graduated.length;

  return (
    <div className="space-y-6">
      {/* Top Banner: Academic Year & Calendar Detection */}
      <div className="rounded-3xl bg-gradient-to-br from-[#6b1426] via-[#831843] to-amber-900 text-white p-5 sm:p-7 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 rounded-full bg-white/5 blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-400 text-amber-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                <Calendar className="w-3.5 h-3.5" />
                Automatic Academic Calendar System
              </span>
              <span className="text-xs text-amber-200 font-bold">
                {DateService.isSimulated() ? '⚡ Simulator Clock Mode' : '✓ Live Clock Synced'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Academic Year Management
            </h1>
            <p className="text-xs sm:text-sm text-stone-200 max-w-2xl">
              Automatic January 1 rollover with seamless previous-year archiving and administrator-approved learner promotion across Junior Secondary grades.
            </p>
          </div>

          {/* Current Year & Term Badges */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/20">
            <div className="text-center px-3 border-r border-white/20">
              <span className="text-[10px] text-amber-200 uppercase font-black tracking-wider block">
                Active Year
              </span>
              <span className="text-2xl font-black text-white">{currentActiveYear}</span>
            </div>
            <div className="text-center px-3">
              <span className="text-[10px] text-amber-200 uppercase font-black tracking-wider block">
                Active Term
              </span>
              <span className="text-2xl font-black text-amber-300">{currentActiveTerm}</span>
            </div>
          </div>
        </div>

        {/* Rollover Alert Banner */}
        {totalAwaitingPromotion > 0 && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-500/20 border border-amber-400/40 backdrop-blur-xs flex items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-300 shrink-0" />
              <span>
                <strong>Academic Year {currentActiveYear} has begun!</strong> {totalAwaitingPromotion} learners from {previousYear} are ready for Annual Promotion review.
              </span>
            </div>
            <button
              onClick={() => setActiveTab('promotions')}
              className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs shrink-0 transition"
            >
              Review Now
            </button>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2">
        <button
          onClick={() => setActiveTab('promotions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'promotions'
              ? 'bg-[#6b1426] text-white shadow-xs'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Annual Promotion</span>
          {totalAwaitingPromotion > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black">
              {totalAwaitingPromotion}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('archive')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'archive'
              ? 'bg-[#6b1426] text-white shadow-xs'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
          }`}
        >
          <Archive className="w-4 h-4" />
          <span>Academic Archive</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'history'
              ? 'bg-[#6b1426] text-white shadow-xs'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Academic-Year History</span>
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'simulator'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Testing &amp; Rollover Simulator</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ANNUAL PROMOTION                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'promotions' && (
        <div className="space-y-5">
          {/* Promotion Stage Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => {
                setPromotionStage('G7_to_G8');
                setSelectedLearnerIds([]);
              }}
              className={`p-4 rounded-2xl border text-left transition flex items-center justify-between ${
                promotionStage === 'G7_to_G8'
                  ? 'border-[#6b1426] dark:border-rose-400 bg-rose-50/70 dark:bg-rose-950/20 shadow-xs'
                  : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:bg-stone-50'
              }`}
            >
              <div>
                <span className="text-[10px] font-black uppercase text-stone-500 tracking-wider block">
                  Step 1
                </span>
                <span className="font-extrabold text-sm text-stone-900 dark:text-stone-100">
                  Grade 7 → Grade 8
                </span>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Promote to Junior Secondary Year 2
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200">
                {eligibleLearnersByStage.G7_to_G8.length} Candidates
              </span>
            </button>

            <button
              onClick={() => {
                setPromotionStage('G8_to_G9');
                setSelectedLearnerIds([]);
              }}
              className={`p-4 rounded-2xl border text-left transition flex items-center justify-between ${
                promotionStage === 'G8_to_G9'
                  ? 'border-[#6b1426] dark:border-rose-400 bg-rose-50/70 dark:bg-rose-950/20 shadow-xs'
                  : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:bg-stone-50'
              }`}
            >
              <div>
                <span className="text-[10px] font-black uppercase text-stone-500 tracking-wider block">
                  Step 2
                </span>
                <span className="font-extrabold text-sm text-stone-900 dark:text-stone-100">
                  Grade 8 → Grade 9
                </span>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Promote to Final JSS Class
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200">
                {eligibleLearnersByStage.G8_to_G9.length} Candidates
              </span>
            </button>

            <button
              onClick={() => {
                setPromotionStage('G9_to_Graduated');
                setSelectedLearnerIds([]);
              }}
              className={`p-4 rounded-2xl border text-left transition flex items-center justify-between ${
                promotionStage === 'G9_to_Graduated'
                  ? 'border-[#6b1426] dark:border-rose-400 bg-rose-50/70 dark:bg-rose-950/20 shadow-xs'
                  : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:bg-stone-50'
              }`}
            >
              <div>
                <span className="text-[10px] font-black uppercase text-stone-500 tracking-wider block">
                  Step 3
                </span>
                <span className="font-extrabold text-sm text-stone-900 dark:text-stone-100">
                  Grade 9 → Completed / Graduated
                </span>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  CBC JSS Completion &amp; Transition
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200">
                {eligibleLearnersByStage.G9_to_Graduated.length} Candidates
              </span>
            </button>
          </div>

          {/* Action Bar */}
          <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={handleSelectAllCandidates}
                className="px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-bold text-stone-800 dark:text-stone-200 hover:bg-stone-100 transition"
              >
                {selectedLearnerIds.length === currentStageCandidates.length && currentStageCandidates.length > 0
                  ? 'Deselect All'
                  : 'Select All Candidates'}
              </button>
              <span className="text-xs text-stone-500">
                Selected: <strong>{selectedLearnerIds.length}</strong> of {currentStageCandidates.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Optional promotion approval notes..."
                value={promotionNotes}
                onChange={(e) => setPromotionNotes(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 text-xs bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 w-48 sm:w-64"
              />
              <button
                onClick={handleApprovePromotion}
                disabled={selectedLearnerIds.length === 0 || isProcessing}
                className="px-4 py-2 rounded-xl bg-[#6b1426] hover:bg-[#831843] text-white text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>
                  {isProcessing
                    ? 'Processing...'
                    : `Approve Promotion (${selectedLearnerIds.length})`}
                </span>
              </button>
            </div>
          </div>

          {/* Candidates Table */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
            {currentStageCandidates.length === 0 ? (
              <div className="p-12 text-center text-stone-500 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h3 className="font-bold text-stone-800 dark:text-stone-200">
                  All Candidates Promoted!
                </h3>
                <p className="text-xs max-w-md mx-auto">
                  There are no unpromoted learners for {promotionStage.replace(/_/g, ' ')}.
                  Previous records remain archived in {previousYear}, and active records are established in {currentActiveYear}.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-extrabold border-b border-stone-200 dark:border-stone-700">
                    <tr>
                      <th className="p-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={
                            selectedLearnerIds.length === currentStageCandidates.length &&
                            currentStageCandidates.length > 0
                          }
                          onChange={handleSelectAllCandidates}
                          className="rounded text-[#6b1426]"
                        />
                      </th>
                      <th className="p-3">ADM No</th>
                      <th className="p-3">Learner Full Name</th>
                      <th className="p-3">Current Class</th>
                      <th className="p-3">Target Class ({currentActiveYear})</th>
                      <th className="p-3">{previousYear} Mean Score</th>
                      <th className="p-3">Guardian Contact</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {currentStageCandidates.map((learner) => {
                      const isSelected = selectedLearnerIds.includes(learner.id);
                      const prevScore = getLearnerPrevYearAverage(learner.id, learner.admNo);

                      return (
                        <tr
                          key={learner.id}
                          onClick={() => handleToggleLearner(learner.id)}
                          className={`cursor-pointer transition ${
                            isSelected
                              ? 'bg-rose-50/70 dark:bg-rose-950/30 font-medium'
                              : 'hover:bg-stone-50 dark:hover:bg-stone-800/50'
                          }`}
                        >
                          <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleLearner(learner.id)}
                              className="rounded text-[#6b1426]"
                            />
                          </td>
                          <td className="p-3 font-mono font-bold text-stone-900 dark:text-stone-100">
                            {learner.admNo}
                          </td>
                          <td className="p-3 font-bold text-stone-900 dark:text-stone-100">
                            {learner.fullName}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 font-bold">
                              {learner.grade} ({learner.academicYear || previousYear})
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-200 font-black flex items-center gap-1 w-fit">
                              <ArrowRight className="w-3 h-3" />
                              {promotionStage === 'G7_to_G8'
                                ? 'Grade 8'
                                : promotionStage === 'G8_to_G9'
                                ? 'Grade 9'
                                : 'Graduated'}{' '}
                              ({currentActiveYear})
                            </span>
                          </td>
                          <td className="p-3">
                            {prevScore !== null ? (
                              <span
                                className={`font-black ${
                                  prevScore >= 70
                                    ? 'text-emerald-600'
                                    : prevScore >= 50
                                    ? 'text-blue-600'
                                    : 'text-amber-600'
                                }`}
                              >
                                {prevScore}%
                              </span>
                            ) : (
                              <span className="text-stone-400 italic">No previous marks</span>
                            )}
                          </td>
                          <td className="p-3 text-stone-600 dark:text-stone-400">
                            {learner.guardianPhone || '—'}
                          </td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                              Awaiting Approval
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ACADEMIC ARCHIVE (Select previous year and browse records)         */}
      {/* ========================================================================= */}
      {activeTab === 'archive' && (
        <div className="space-y-5">
          {/* Year Selector Bar */}
          <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="text-xs font-black text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                <Archive className="w-4 h-4 text-[#6b1426]" />
                Select Archived Academic Year:
              </span>
              <select
                value={selectedArchiveYear}
                onChange={(e) => setSelectedArchiveYear(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 font-black text-sm bg-white dark:bg-stone-800 text-[#6b1426] dark:text-rose-400 focus:outline-none"
              >
                {allKnownYears.map((yr) => (
                  <option key={yr} value={yr}>
                    Academic Year {yr} {yr === currentActiveYear ? '(Active)' : '(Archive)'}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-200 border border-amber-300">
                🔒 Permanent Read-Only Archive Record
              </span>
            </div>
          </div>

          {/* Sub-tabs for the selected archive year */}
          <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2 text-xs">
            <button
              onClick={() => setArchiveSubTab('learners')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                archiveSubTab === 'learners'
                  ? 'bg-[#6b1426] text-white'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Learners ({archiveLearners.length})</span>
            </button>

            <button
              onClick={() => setArchiveSubTab('marks')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                archiveSubTab === 'marks'
                  ? 'bg-[#6b1426] text-white'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Assessment Marks ({archiveMarks.length})</span>
            </button>

            <button
              onClick={() => setArchiveSubTab('analysis')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                archiveSubTab === 'analysis'
                  ? 'bg-[#6b1426] text-white'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Academic Analysis &amp; Report Cards</span>
            </button>

            <button
              onClick={() => setArchiveSubTab('timetable')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                archiveSubTab === 'timetable'
                  ? 'bg-[#6b1426] text-white'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Timetables</span>
            </button>

            <button
              onClick={() => setArchiveSubTab('teachers')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                archiveSubTab === 'teachers'
                  ? 'bg-[#6b1426] text-white'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Teacher Records &amp; Allocations</span>
            </button>
          </div>

          {/* Sub-tab 1: Archive Learners */}
          {archiveSubTab === 'learners' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500">Filter Grade:</span>
                  <select
                    value={archiveGradeFilter}
                    onChange={(e) => setArchiveGradeFilter(e.target.value)}
                    className="px-2.5 py-1 rounded-lg border border-stone-300 dark:border-stone-700 text-xs bg-white dark:bg-stone-800 font-bold"
                  >
                    <option value="all">All Grades</option>
                    <option value="Grade 7">Grade 7</option>
                    <option value="Grade 8">Grade 8</option>
                    <option value="Grade 9">Grade 9</option>
                  </select>
                </div>
                <span className="text-xs text-stone-500">
                  Showing <strong>{filteredArchiveLearners.length}</strong> learners in {selectedArchiveYear}
                </span>
              </div>

              <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-extrabold border-b">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">ADM No</th>
                      <th className="p-3">Full Name</th>
                      <th className="p-3">Grade in {selectedArchiveYear}</th>
                      <th className="p-3">Gender</th>
                      <th className="p-3">Guardian</th>
                      <th className="p-3">Status in {selectedArchiveYear}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {filteredArchiveLearners.map((learner, idx) => (
                      <tr key={learner.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50">
                        <td className="p-3 text-stone-400 font-mono">{idx + 1}</td>
                        <td className="p-3 font-mono font-bold">{learner.admNo}</td>
                        <td className="p-3 font-bold text-stone-900 dark:text-stone-100">
                          {learner.fullName}
                        </td>
                        <td className="p-3 font-medium">{learner.grade}</td>
                        <td className="p-3 font-bold">{learner.gender === 'M' ? 'Male' : 'Female'}</td>
                        <td className="p-3 text-stone-500">{learner.guardianName} ({learner.guardianPhone})</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                            {learner.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub-tab 2: Archive Marks */}
          {archiveSubTab === 'marks' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
                <h3 className="font-extrabold text-sm text-stone-900 dark:text-stone-100 mb-2">
                  Academic Assessment Archive — {selectedArchiveYear}
                </h3>
                <p className="text-xs text-stone-500">
                  Total of {archiveMarks.length} subject assessment records logged across Term 1, Term 2, and Term 3 for Academic Year {selectedArchiveYear}.
                </p>
              </div>

              <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-extrabold border-b">
                    <tr>
                      <th className="p-3">ADM No</th>
                      <th className="p-3">Grade</th>
                      <th className="p-3">Subject</th>
                      <th className="p-3">Term</th>
                      <th className="p-3 text-center">Score %</th>
                      <th className="p-3 text-center">CBC Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {archiveMarks.slice(0, 50).map((m) => (
                      <tr key={m.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50">
                        <td className="p-3 font-mono font-bold">{m.admNo}</td>
                        <td className="p-3">{m.grade}</td>
                        <td className="p-3 font-bold">{m.subject}</td>
                        <td className="p-3">{m.term}</td>
                        <td className="p-3 text-center font-black text-stone-900 dark:text-stone-100">
                          {m.scoreOutOf100 ?? '—'}%
                        </td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded font-black text-[10px] bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200">
                            {m.assessmentLevel || '—'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub-tab 3: Academic Analysis & Report Cards */}
          {archiveSubTab === 'analysis' && (
            <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4">
              <h3 className="font-extrabold text-base text-stone-900 dark:text-stone-100">
                Academic Performance Analysis — Year {selectedArchiveYear}
              </h3>
              <p className="text-xs text-stone-500">
                Historical broadsheets, performance summaries, and official term report cards for Academic Year {selectedArchiveYear}.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
                <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 text-center">
                  <span className="text-2xl font-black text-[#6b1426] dark:text-rose-400">
                    {archiveLearners.length}
                  </span>
                  <p className="text-xs font-bold text-stone-600 dark:text-stone-300 mt-1">
                    Enrolled Learners
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 text-center">
                  <span className="text-2xl font-black text-emerald-600">
                    {archiveMarks.length}
                  </span>
                  <p className="text-xs font-bold text-stone-600 dark:text-stone-300 mt-1">
                    Marks Evaluated
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 text-center">
                  <span className="text-2xl font-black text-blue-600">
                    3
                  </span>
                  <p className="text-xs font-bold text-stone-600 dark:text-stone-300 mt-1">
                    Terms Completed
                  </p>
                </div>
              </div>

              {onNavigateTo && (
                <div className="pt-4 flex flex-wrap gap-3">
                  <button
                    onClick={() => onNavigateTo('print')}
                    className="px-4 py-2 rounded-xl bg-[#6b1426] text-white font-bold text-xs hover:bg-[#831843] transition flex items-center gap-1.5"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Open Print &amp; Report Card Center</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Sub-tab 4: Timetable Archive */}
          {archiveSubTab === 'timetable' && (
            <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3">
              <h3 className="font-extrabold text-base text-stone-900 dark:text-stone-100">
                School Master Timetable Archive — {selectedArchiveYear}
              </h3>
              <p className="text-xs text-stone-500">
                Official CBC 45-period master timetable archived for Academic Year {selectedArchiveYear}.
              </p>
              {onNavigateTo && (
                <button
                  onClick={() => onNavigateTo('timetable')}
                  className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-bold hover:bg-stone-200 transition flex items-center gap-1.5"
                >
                  <Calendar className="w-4 h-4 text-[#6b1426]" />
                  <span>View Timetable Schedule in Timetable Manager</span>
                </button>
              )}
            </div>
          )}

          {/* Sub-tab 5: Teacher Allocations */}
          {archiveSubTab === 'teachers' && (
            <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3">
              <h3 className="font-extrabold text-base text-stone-900 dark:text-stone-100">
                Faculty Subject Allocations — {selectedArchiveYear}
              </h3>
              <div className="divide-y divide-stone-100 dark:divide-stone-800 text-xs">
                {teachers.map((t) => (
                  <div key={t.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-stone-900 dark:text-stone-100">{t.name}</span>
                      <p className="text-stone-500 text-[11px]">{t.designation} • TSC: {t.tscNumber || 'TSC/REG'}</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {t.assignments?.map((a, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-[10px]">
                          {a.grade} {a.subject}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ACADEMIC-YEAR HISTORY                                             */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
            <h3 className="font-extrabold text-base text-stone-900 dark:text-stone-100 mb-1">
              Historical Academic Years Timeline
            </h3>
            <p className="text-xs text-stone-500">
              Audit log of academic year lifecycles, enrollment milestones, and official promotion approvals.
            </p>

            <div className="space-y-4 mt-4">
              {allKnownYears.map((yr) => {
                const isCurrent = yr === currentActiveYear;
                const yearLearnersCount = learners.filter((l) => (l.academicYear || '2026') === yr).length;
                const yearMarksCount = marks.filter((m) => (m.academicYear || '2026') === yr).length;

                return (
                  <div
                    key={yr}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isCurrent
                        ? 'border-[#6b1426] bg-rose-50/50 dark:bg-rose-950/20'
                        : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                          isCurrent
                            ? 'bg-[#6b1426] text-white'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        {yr.slice(-2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-stone-900 dark:text-stone-100 text-sm">
                            Academic Year {yr}
                          </span>
                          {isCurrent ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-950">
                              CURRENT ACTIVE
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-stone-100 text-stone-700">
                              ARCHIVED
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">
                          Enrolled: {yearLearnersCount} learners • Assessment Marks: {yearMarksCount}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedArchiveYear(yr);
                        setActiveTab('archive');
                      }}
                      className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-xs font-bold hover:bg-stone-100 transition"
                    >
                      Browse {yr} Archive
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Annual Promotion Approval Logs */}
          <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
            <h3 className="font-extrabold text-sm text-stone-900 dark:text-stone-100 mb-2">
              Official Promotion Approval Register
            </h3>

            {promotionLogs.length === 0 ? (
              <p className="text-xs text-stone-500 italic">
                No promotions logged yet. When learners are approved under the Annual Promotion tab, records will appear here with administrator timestamps.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100 dark:bg-stone-800 font-extrabold text-stone-700 dark:text-stone-300 border-b">
                    <tr>
                      <th className="p-2.5">Date &amp; Time</th>
                      <th className="p-2.5">Source Transition</th>
                      <th className="p-2.5">Target Transition</th>
                      <th className="p-2.5 text-center">Learners Promoted</th>
                      <th className="p-2.5">Approved By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {promotionLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-stone-50">
                        <td className="p-2.5 font-mono text-stone-500">
                          {new Date(log.approvedAt).toLocaleDateString()}
                        </td>
                        <td className="p-2.5 font-bold">
                          {log.sourceGrade} ({log.sourceYear})
                        </td>
                        <td className="p-2.5 font-bold text-emerald-600">
                          {log.targetGrade} ({log.targetYear})
                        </td>
                        <td className="p-2.5 text-center font-black">
                          {log.promotedCount}
                        </td>
                        <td className="p-2.5 text-stone-600">{log.approvedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: TESTING & ROLLOVER SIMULATOR                                      */}
      {/* ========================================================================= */}
      {activeTab === 'simulator' && (
        <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border-2 border-amber-300 dark:border-amber-800 space-y-5 shadow-sm">
          <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-300">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="font-black text-lg">
              Calendar Rollover Verification &amp; Future-Proof Testing
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
            The portal is engineered to automatically detect <strong>January 1</strong> and roll over to the new academic year and Term 1 without hardcoding any specific year (e.g. 2026, 2027, 2028, 2029, 2030...).
            You can simulate testing dates below to verify that the active year, current term, mark entry, broadsheets, and learner promotion automatically adapt.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              onClick={() => {
                DateService.setSimulatedDate('2026-12-31T23:59:00');
                onShowSuccessToast('Simulating: Dec 31, 2026 (Active: 2026, Term 3)');
              }}
              className="p-3.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 text-left transition"
            >
              <span className="text-[10px] font-black uppercase text-stone-500 block">
                Scenario A
              </span>
              <span className="font-extrabold text-xs text-stone-900 dark:text-stone-100 block">
                December 31, 2026
              </span>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Active Year: 2026 • Term 3
              </p>
            </button>

            <button
              onClick={() => {
                DateService.setSimulatedDate('2027-01-01T08:00:00');
                onShowSuccessToast('Simulating: Jan 1, 2027 (Active: 2027, Term 1)');
              }}
              className="p-3.5 rounded-xl border-2 border-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/20 text-left transition"
            >
              <span className="text-[10px] font-black uppercase text-emerald-800 dark:text-emerald-300 block">
                Scenario B (New Year Rollover)
              </span>
              <span className="font-extrabold text-xs text-emerald-950 dark:text-emerald-100 block">
                January 1, 2027
              </span>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-0.5">
                Automatically activates 2027 &amp; Term 1!
              </p>
            </button>

            <button
              onClick={() => {
                DateService.setSimulatedDate('2028-01-01T08:00:00');
                onShowSuccessToast('Simulating: Jan 1, 2028 (Active: 2028, Term 1)');
              }}
              className="p-3.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 text-left transition"
            >
              <span className="text-[10px] font-black uppercase text-stone-500 block">
                Scenario C (Future Year)
              </span>
              <span className="font-extrabold text-xs text-stone-900 dark:text-stone-100 block">
                January 1, 2028
              </span>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Automatically activates 2028 &amp; Term 1
              </p>
            </button>
          </div>

          <div className="pt-3 flex items-center justify-between border-t border-stone-200 dark:border-stone-800 text-xs">
            <span className="text-stone-500">
              Current Simulation Status:{' '}
              <strong>{DateService.isSimulated() ? 'Custom Date Simulated' : 'Live Real-Time Clock Active'}</strong>
            </span>
            {DateService.isSimulated() && (
              <button
                onClick={() => {
                  DateService.setSimulatedDate(null);
                  onShowSuccessToast('Returned to Live Real-Time Clock.');
                }}
                className="px-3 py-1.5 rounded-lg bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold hover:bg-stone-300 transition flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Live Real-Time Clock</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
