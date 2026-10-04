import React, { useState, useMemo, useEffect } from 'react';
import { UserProfile } from '../types';
import {
  WeeklyInspirationItem,
  getInspirationForWeek,
  saveWeeklyInspirationCustomization,
  resetWeeklyInspirationCustomization,
  getWeeklyDateRange,
} from '../data/weeklyInspirationData';
import {
  DidYouKnowItem,
  getDidYouKnowFactForWeek,
  saveDidYouKnowApproval,
  blacklistDidYouKnowFact,
  getFreshRandomFact,
  getDidYouKnowHistory,
  DisplayedFactRecord,
} from '../data/didYouKnowData';
import { DateService } from '../utils/dateService';
import {
  generateWeeklyInspirationPosterPdf,
  getWeeklyInspirationPosterDataUri,
  getWeeklyInspirationPosterBlobUrl,
} from '../utils/posterPdfGenerator';
import { PdfViewerModal } from './PdfViewerModal';
import {
  ShieldCheck,
  Edit3,
  Calendar,
  Eye,
  Download,
  RotateCcw,
  Save,
  X,
  Sparkles,
  Smile,
  Zap,
  BookOpen,
  HelpCircle,
  Award,
  CheckCircle2,
  Lock,
  ListFilter,
  Grid,
  Lightbulb,
  Shuffle,
  Ban,
  Check,
} from 'lucide-react';

interface AdminWeeklyInspirationManagerProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onShowSuccessToast: (msg: string) => void;
  onInspirationUpdated?: () => void;
}

interface TermDefinition {
  label: string;
  startWeek: number;
  endWeek: number;
}

const TERM_RANGES: Record<string, TermDefinition> = {
  'Term 3': { label: 'Term 3 (Current Term)', startWeek: 35, endWeek: 47 },
  'Term 1': { label: 'Term 1', startWeek: 1, endWeek: 14 },
  'Term 2': { label: 'Term 2', startWeek: 18, endWeek: 31 },
  'All': { label: 'Full Year (Weeks 1 – 52)', startWeek: 1, endWeek: 52 },
};

export const AdminWeeklyInspirationManager: React.FC<AdminWeeklyInspirationManagerProps> = ({
  currentUser,
  isOpen,
  onClose,
  onShowSuccessToast,
  onInspirationUpdated,
}) => {
  const isAdmin = currentUser.role === 'school_admin' || currentUser.role === 'super_admin';
  const currentWeekNumber = useMemo(() => getWeeklyDateRange().weekNumber, []);

  // Selected Term Tab
  const [selectedTerm, setSelectedTerm] = useState<string>('Term 3');
  const [selectedWeek, setSelectedWeek] = useState<number>(currentWeekNumber);
  const [viewLayout, setViewLayout] = useState<'detail' | 'all_weeks'>('all_weeks');

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<WeeklyInspirationItem | null>(null);
  const [editFunny, setEditFunny] = useState('');
  const [editMotivation, setEditMotivation] = useState('');
  const [editVerse, setEditVerse] = useState('');
  const [editRef, setEditRef] = useState('');
  const [editQuestion, setEditQuestion] = useState('');
  const [editChallenge, setEditChallenge] = useState('');

  // PDF Preview State
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [pdfDataUri, setPdfDataUri] = useState<string | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [previewWeekInfo, setPreviewWeekInfo] = useState<{
    inspiration: WeeklyInspirationItem;
    dates: string;
  } | null>(null);

  // Refresh counter to re-read storage after edit/reset
  const [refreshKey, setRefreshKey] = useState(0);

  // DYK Curator State
  const activeYear = Number(DateService.getCurrentYear());
  const [managerMode, setManagerMode] = useState<'schedule' | 'dyk'>('schedule');
  const [dykWeek, setDykWeek] = useState<number>(currentWeekNumber);
  const [dykHistory, setDykHistory] = useState<DisplayedFactRecord[]>(() => getDidYouKnowHistory());
  const [dykRefreshKey, setDykRefreshKey] = useState(0);

  const activeDykFact = useMemo(() => {
    void dykRefreshKey;
    return getDidYouKnowFactForWeek(dykWeek, activeYear);
  }, [dykWeek, activeYear, dykRefreshKey]);

  const [currentDykCandidate, setCurrentDykCandidate] = useState<DidYouKnowItem>(activeDykFact.item);

  useEffect(() => {
    setCurrentDykCandidate(activeDykFact.item);
  }, [activeDykFact.item]);

  const handleRegenerateDyk = () => {
    const nextFact = getFreshRandomFact(currentDykCandidate.id);
    setCurrentDykCandidate(nextFact);
    onShowSuccessToast(`Generated surprising fact from "${nextFact.category}" category.`);
  };

  const handleApproveDyk = () => {
    saveDidYouKnowApproval(currentDykCandidate, dykWeek, activeYear);
    setDykRefreshKey((k) => k + 1);
    setDykHistory(getDidYouKnowHistory());
    onShowSuccessToast(`Approved and locked fact for Week ${dykWeek} (${activeYear})!`);
  };

  const handleBlacklistDyk = () => {
    blacklistDidYouKnowFact(currentDykCandidate.id);
    const nextFact = getFreshRandomFact(currentDykCandidate.id);
    setCurrentDykCandidate(nextFact);
    setDykRefreshKey((k) => k + 1);
    onShowSuccessToast('Fact blacklisted. It will not appear again.');
  };

  // Term weeks list
  const activeRange = TERM_RANGES[selectedTerm] || TERM_RANGES['Term 3'];
  const termWeekNumbers = useMemo(() => {
    const list: number[] = [];
    for (let w = activeRange.startWeek; w <= activeRange.endWeek; w++) {
      list.push(w);
    }
    return list;
  }, [activeRange]);

  // Selected week data
  const selectedWeekData = useMemo(() => {
    void refreshKey;
    return getInspirationForWeek(selectedWeek);
  }, [selectedWeek, refreshKey]);

  if (!isOpen) return null;

  // Open Edit Form
  const handleOpenEdit = (item: WeeklyInspirationItem) => {
    if (!isAdmin) {
      onShowSuccessToast('Editing restricted: Only School Admin & Super Admin can modify weekly inspiration.');
      return;
    }
    setEditingItem(item);
    setEditFunny(item.funnyThought);
    setEditMotivation(item.motivation);
    setEditVerse(item.verseOrWisdom);
    setEditRef(item.verseReference || '');
    setEditQuestion(item.questionToThinkAbout);
    setEditChallenge(item.challengeOfTheWeek);
  };

  // Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !isAdmin) return;

    const updated: WeeklyInspirationItem = {
      weekNumber: editingItem.weekNumber,
      funnyThought: editFunny.trim() || editingItem.funnyThought,
      motivation: editMotivation.trim() || editingItem.motivation,
      verseOrWisdom: editVerse.trim() || editingItem.verseOrWisdom,
      verseReference: editRef.trim() || undefined,
      questionToThinkAbout: editQuestion.trim() || editingItem.questionToThinkAbout,
      challengeOfTheWeek: editChallenge.trim() || editingItem.challengeOfTheWeek,
    };

    saveWeeklyInspirationCustomization(updated);
    setRefreshKey((k) => k + 1);
    setEditingItem(null);
    onShowSuccessToast(`Week ${updated.weekNumber} Weekly Inspiration updated and saved!`);
    onInspirationUpdated?.();
  };

  // Reset to default
  const handleResetToDefault = (weekNumber: number) => {
    if (!isAdmin) return;
    resetWeeklyInspirationCustomization(weekNumber);
    setRefreshKey((k) => k + 1);
    onShowSuccessToast(`Week ${weekNumber} restored to default curated inspiration.`);
    onInspirationUpdated?.();
  };

  // Open PDF Preview for selected week
  const handlePreviewPdf = (
    item: WeeklyInspirationItem,
    dates: string,
    customDyk?: DidYouKnowItem
  ) => {
    try {
      const dyk = customDyk || getDidYouKnowFactForWeek(item.weekNumber, activeYear).item;
      const uri = getWeeklyInspirationPosterDataUri(item, dates, dyk);
      const bUrl = getWeeklyInspirationPosterBlobUrl(item, dates, dyk);
      setPdfDataUri(uri);
      setPdfBlobUrl(bUrl);
      setPreviewWeekInfo({ inspiration: item, dates });
      setPdfPreviewOpen(true);
    } catch (err) {
      console.error('Failed to generate PDF preview:', err);
    }
  };

  // Download PDF for selected week
  const handleDownloadPdf = async (
    item: WeeklyInspirationItem,
    dates: string,
    customDyk?: DidYouKnowItem
  ) => {
    const dyk = customDyk || getDidYouKnowFactForWeek(item.weekNumber, activeYear).item;
    await generateWeeklyInspirationPosterPdf(
      item,
      dates,
      (msg, isErr) => {
        if (!isErr) onShowSuccessToast(msg);
      },
      dyk
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Admin Weekly Inspiration Manager"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 overflow-hidden animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl flex flex-col w-full max-w-5xl h-[92vh] overflow-hidden">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#6b1426] via-[#7c1d32] to-[#540d1e] text-white px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white border border-white/20">
              {managerMode === 'dyk' ? (
                <Lightbulb className="w-5 h-5 text-amber-300" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-amber-300" />
              )}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  {managerMode === 'dyk'
                    ? '“DID YOU KNOW?” Notice Board Curator'
                    : 'Weekly Inspiration Term Schedule & Editor'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-black uppercase tracking-wider">
                  Admin &amp; Super Admin
                </span>
              </div>
              <p className="text-xs text-rose-100">
                {managerMode === 'dyk'
                  ? 'Preview, regenerate, approve, and prevent facts for the right-side box of the Weekly Aspiration notice board poster.'
                  : 'Browse all term weeks, edit inspiration content, preview posters as PDF, and download ahead of schedule.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Mode Switcher */}
            <div className="flex items-center gap-1 bg-black/25 p-1 rounded-xl text-xs font-bold border border-white/10">
              <button
                type="button"
                onClick={() => setManagerMode('schedule')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  managerMode === 'schedule'
                    ? 'bg-white text-[#6b1426] shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Inspiration Schedule
              </button>
              <button
                type="button"
                onClick={() => setManagerMode('dyk')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  managerMode === 'dyk'
                    ? 'bg-amber-400 text-amber-950 shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>“DID YOU KNOW?” Curator</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MODE: "DID YOU KNOW?" CURATOR                                            */}
        {/* ========================================================================= */}
        {managerMode === 'dyk' ? (
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-stone-50/50 dark:bg-stone-950 space-y-6">
            {/* Week Selector Bar */}
            <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-stone-500 tracking-wider">
                  Select Notice Board Week:
                </span>
                <select
                  value={dykWeek}
                  onChange={(e) => setDykWeek(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-bold text-xs"
                >
                  {Array.from({ length: 52 }, (_, i) => i + 1).map((w) => {
                    const range = getWeeklyDateRange(
                      new Date(Date.now() + (w - currentWeekNumber) * 7 * 86400000)
                    );
                    return (
                      <option key={w} value={w}>
                        Week {w} ({range.formattedRange}) {w === currentWeekNumber ? '★ ACTIVE' : ''}
                      </option>
                    );
                  })}
                </select>
                {dykWeek !== currentWeekNumber && (
                  <button
                    type="button"
                    onClick={() => setDykWeek(currentWeekNumber)}
                    className="px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold hover:bg-stone-200 transition"
                  >
                    Go to Active Week ({currentWeekNumber})
                  </button>
                )}
              </div>

              <div>
                {activeDykFact.isCustomApproved ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Admin Approved Custom Override</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Automatic Weekly Rotation Active</span>
                  </span>
                )}
              </div>
            </div>

            {/* Main Fact Card Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left: Interactive Curator Controls & Live View */}
              <div className="lg:col-span-8 bg-white dark:bg-stone-900 p-6 rounded-3xl border-2 border-stone-200 dark:border-stone-800 shadow-sm space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-200 border border-purple-300">
                      Category: {currentDykCandidate.category}
                    </span>
                    <span className="text-xs text-stone-400 font-mono">
                      ID: {currentDykCandidate.id}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-stone-500">
                    Week {dykWeek} • {activeYear}
                  </span>
                </div>

                {/* The Question */}
                <div className="space-y-2">
                  <span className="text-[11px] font-black uppercase text-amber-700 dark:text-amber-400 tracking-wider flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4" />
                    Notice Board “Did You Know?” Question:
                  </span>
                  <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60">
                    <p className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 leading-snug">
                      "{currentDykCandidate.question}"
                    </p>
                  </div>
                </div>

                {/* The Verified Science */}
                <div className="space-y-2">
                  <span className="text-[11px] font-black uppercase text-teal-700 dark:text-teal-400 tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4" />
                    Verified Science &amp; Historical Context:
                  </span>
                  <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/60">
                    <p className="text-xs sm:text-sm text-teal-950 dark:text-teal-100 leading-relaxed font-medium">
                      {currentDykCandidate.verifiedFact}
                    </p>
                  </div>
                </div>

                {/* Curator Actions */}
                <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleRegenerateDyk}
                      className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                      title="Generate a different surprising fact from a different category"
                    >
                      <Shuffle className="w-4 h-4 text-purple-600" />
                      <span>Regenerate Different Fact</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleBlacklistDyk}
                      className="px-3 py-2 rounded-xl border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 hover:bg-red-50 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      title="Permanently prevent this fact from appearing on the notice board"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Blacklist Fact</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const weekData = getInspirationForWeek(dykWeek);
                        handlePreviewPdf(
                          weekData.inspiration,
                          weekData.weekDatesFormatted,
                          currentDykCandidate
                        );
                      }}
                      className="px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 text-stone-800 dark:text-stone-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#6b1426]" />
                      <span>Preview Poster PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleApproveDyk}
                      className="px-4 py-2 rounded-xl bg-[#6b1426] hover:bg-[#520f1d] text-white font-black text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                    >
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Approve as Week {dykWeek} Fact</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: PDF Box Visual Preview */}
              <div className="lg:col-span-4 space-y-2">
                <span className="text-[11px] font-black uppercase text-stone-400 tracking-wider block">
                  How It Appears in Right-Side Box of PDF:
                </span>
                <div className="rounded-2xl border-4 border-[#6b1426] bg-[#fefcf7] p-4 shadow-md space-y-3">
                  <div className="bg-[#6b1426] text-white p-2.5 rounded-xl text-center space-y-1">
                    <span className="text-xs font-black tracking-wider uppercase block">
                      DID YOU KNOW?
                    </span>
                    <span className="inline-block px-2 py-0.5 rounded-md bg-amber-100 text-amber-950 font-black text-[10px]">
                      Week: {getWeeklyDateRange(new Date(Date.now() + (dykWeek - currentWeekNumber) * 7 * 86400000)).formattedRange}
                    </span>
                  </div>

                  <div className="text-center">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 font-extrabold text-[9px] uppercase">
                      ★ {currentDykCandidate.category} ★
                    </span>
                  </div>

                  <p className="text-xs font-black text-stone-900 leading-snug">
                    "{currentDykCandidate.question}"
                  </p>

                  <div className="border-t border-amber-300 pt-2 space-y-1 bg-teal-50/80 p-2.5 rounded-xl">
                    <span className="text-[9px] font-black uppercase text-teal-800 block">
                      The Surprising Truth &amp; Science:
                    </span>
                    <p className="text-[10px] text-teal-950 leading-relaxed font-medium">
                      {currentDykCandidate.verifiedFact}
                    </p>
                  </div>

                  <div className="text-center pt-1 border-t border-[#6b1426]/20 text-[9px] text-stone-500 font-bold">
                    REBERWET JSS CURIOSITY DESK
                  </div>
                </div>
              </div>
            </div>

            {/* History Table of Previously Used Facts */}
            <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-stone-900 dark:text-stone-100">
                    Previously Displayed Notice Board Facts
                  </h4>
                  <p className="text-xs text-stone-500">
                    History of questions shown across past weeks to guarantee variety and prevent repetition.
                  </p>
                </div>
                <span className="text-xs font-bold text-stone-500">
                  {dykHistory.length} Logged Entries
                </span>
              </div>

              {dykHistory.length === 0 ? (
                <p className="text-xs text-stone-400 italic py-4 text-center">
                  No previous facts logged yet.
                </p>
              ) : (
                <div className="overflow-x-auto max-h-64">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-extrabold sticky top-0">
                      <tr>
                        <th className="p-2.5">Week Key</th>
                        <th className="p-2.5">Category</th>
                        <th className="p-2.5">Did You Know Question</th>
                        <th className="p-2.5 text-center">Mode</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                      {dykHistory.map((h, i) => (
                        <tr key={i} className="hover:bg-stone-50">
                          <td className="p-2.5 font-mono font-bold text-[#6b1426] whitespace-nowrap">
                            {h.weekKey}
                          </td>
                          <td className="p-2.5 font-bold text-stone-600 dark:text-stone-300 whitespace-nowrap">
                            {h.category}
                          </td>
                          <td className="p-2.5 font-medium text-stone-900 dark:text-stone-100 max-w-md truncate">
                            {h.question}
                          </td>
                          <td className="p-2.5 text-center whitespace-nowrap">
                            {h.isCustomApproved ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900">
                                Approved
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900">
                                Auto
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* SCHEDULE VIEW */
          <>
            {/* Term Tabs & Controls Bar */}
        <div className="bg-stone-100 dark:bg-stone-800/80 px-4 py-2.5 border-b border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            {/* Term Switcher */}
            <div className="flex items-center gap-1 bg-white dark:bg-stone-900 p-1 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-bold">
              {(['Term 3', 'Term 1', 'Term 2', 'All'] as const).map((termKey) => (
                <button
                  key={termKey}
                  type="button"
                  onClick={() => {
                    setSelectedTerm(termKey);
                    const range = TERM_RANGES[termKey];
                    if (termKey === 'Term 3' && currentWeekNumber >= range.startWeek && currentWeekNumber <= range.endWeek) {
                      setSelectedWeek(currentWeekNumber);
                    } else {
                      setSelectedWeek(range.startWeek);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    selectedTerm === termKey
                      ? 'bg-[#6b1426] text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  {TERM_RANGES[termKey].label}
                </button>
              ))}
            </div>

            {/* Layout Switcher: All Weeks vs Focused Single Week */}
            <div className="flex items-center gap-1 bg-white dark:bg-stone-900 p-1 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-bold">
              <button
                type="button"
                onClick={() => setViewLayout('all_weeks')}
                className={`px-2.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  viewLayout === 'all_weeks'
                    ? 'bg-[#6b1426] text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
                title="View all term weeks together"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>All {selectedTerm} Weeks</span>
              </button>
              <button
                type="button"
                onClick={() => setViewLayout('detail')}
                className={`px-2.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  viewLayout === 'detail'
                    ? 'bg-[#6b1426] text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
                title="Focused single week editor"
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>Single Week Focus</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="font-semibold text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Current System Week: <strong>Week {currentWeekNumber}</strong></span>
            </div>
            {!isAdmin && (
              <span className="px-2 py-0.5 rounded-md bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 text-[10px] font-bold flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Read Only</span>
              </span>
            )}
          </div>
        </div>

        {/* VIEW MODE 1: ALL TERM WEEKS AT A GLANCE */}
        {viewLayout === 'all_weeks' ? (
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-stone-50/50 dark:bg-stone-950 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 dark:border-stone-800 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <span>{TERM_RANGES[selectedTerm]?.label || selectedTerm} Complete Weekly Schedule</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-[#6b1426] font-bold">
                    {termWeekNumbers.length} Weeks
                  </span>
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {isAdmin
                    ? 'Admins & Super Admins can preview PDF posters and edit any week’s content for the term.'
                    : 'Browse through all weekly inspirations for this term. Editing is reserved for Admin & Super Admin.'}
                </p>
              </div>

              {isAdmin && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Admin Edit Permissions Active</span>
                  </span>
                </div>
              )}
            </div>

            {/* Grid of all weeks in the term */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {termWeekNumbers.map((wNum) => {
                const weekInfo = getInspirationForWeek(wNum);
                const isCurrent = wNum === currentWeekNumber;

                return (
                  <div
                    key={wNum}
                    className={`rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                      isCurrent
                        ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 ring-2 ring-amber-400/40'
                        : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'
                    }`}
                  >
                    {/* Header */}
                    <div className="p-4 border-b border-stone-100 dark:border-stone-800">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-stone-900 dark:text-stone-100">
                            Week {wNum}
                          </span>
                          {isCurrent && (
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                              CURRENT ACTIVE
                            </span>
                          )}
                          {weekInfo.isCustomized && (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                              CUSTOMIZED
                            </span>
                          )}
                        </div>

                        {/* Top Action Pills */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              handlePreviewPdf(weekInfo.inspiration, weekInfo.weekDatesFormatted)
                            }
                            title="View week poster as PDF"
                            className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-rose-100 text-stone-700 dark:text-stone-300 hover:text-[#6b1426] transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleDownloadPdf(weekInfo.inspiration, weekInfo.weekDatesFormatted)
                            }
                            title="Download PDF Poster"
                            className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-[#6b1426] text-stone-700 dark:text-stone-300 hover:text-white transition cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="text-[11px] font-extrabold text-[#6b1426] dark:text-rose-400 mt-1">
                        {weekInfo.weekDatesFormatted}
                      </div>
                    </div>

                    {/* Content Snippets (All 5 Categories) */}
                    <div className="p-4 space-y-2.5 text-xs flex-1">
                      {/* 1. Funny */}
                      <div className="p-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40">
                        <span className="text-[10px] font-black uppercase text-amber-900 dark:text-amber-300 flex items-center gap-1 mb-0.5">
                          <Smile className="w-3 h-3" />
                          <span>Funny Thought</span>
                        </span>
                        <p className="text-stone-800 dark:text-stone-200 italic line-clamp-2">
                          "{weekInfo.inspiration.funnyThought}"
                        </p>
                      </div>

                      {/* 2. Motivation */}
                      <div className="p-2 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-900/40">
                        <span className="text-[10px] font-black uppercase text-teal-900 dark:text-teal-300 flex items-center gap-1 mb-0.5">
                          <Zap className="w-3 h-3" />
                          <span>Motivation</span>
                        </span>
                        <p className="text-stone-800 dark:text-stone-200 font-medium line-clamp-2">
                          "{weekInfo.inspiration.motivation}"
                        </p>
                      </div>

                      {/* 3. Verse */}
                      <div className="p-2 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40">
                        <span className="text-[10px] font-black uppercase text-blue-900 dark:text-blue-300 flex items-center gap-1 mb-0.5">
                          <BookOpen className="w-3 h-3" />
                          <span>Verse / Wisdom</span>
                        </span>
                        <p className="text-stone-800 dark:text-stone-200 italic line-clamp-2">
                          "{weekInfo.inspiration.verseOrWisdom}"
                        </p>
                        {weekInfo.inspiration.verseReference && (
                          <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 block text-right">
                            — {weekInfo.inspiration.verseReference}
                          </span>
                        )}
                      </div>

                      {/* 4. Question */}
                      <div className="p-2 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/40">
                        <span className="text-[10px] font-black uppercase text-purple-900 dark:text-purple-300 flex items-center gap-1 mb-0.5">
                          <HelpCircle className="w-3 h-3" />
                          <span>Question to Think About</span>
                        </span>
                        <p className="text-stone-800 dark:text-stone-200 line-clamp-2">
                          "{weekInfo.inspiration.questionToThinkAbout}"
                        </p>
                      </div>

                      {/* 5. Challenge */}
                      <div className="p-2 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40">
                        <span className="text-[10px] font-black uppercase text-rose-900 dark:text-rose-300 flex items-center gap-1 mb-0.5">
                          <Award className="w-3 h-3" />
                          <span>Challenge</span>
                        </span>
                        <p className="text-stone-800 dark:text-stone-200 font-bold line-clamp-2">
                          "{weekInfo.inspiration.challengeOfTheWeek}"
                        </p>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-3 bg-stone-50 dark:bg-stone-800/60 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedWeek(wNum);
                          setViewLayout('detail');
                        }}
                        className="text-[11px] font-bold text-[#6b1426] dark:text-rose-400 hover:underline cursor-pointer"
                      >
                        Open Detailed View →
                      </button>

                      <div className="flex items-center gap-1.5">
                        {isAdmin ? (
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(weekInfo.inspiration)}
                            className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs flex items-center gap-1 transition cursor-pointer shadow-2xs"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit Week</span>
                          </button>
                        ) : (
                          <span
                            className="px-2 py-1 rounded-lg bg-stone-200 text-stone-500 text-[10px] font-bold flex items-center gap-1"
                            title="Only Admin can edit"
                          >
                            <Lock className="w-3 h-3" />
                            <span>Admin Only</span>
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            handlePreviewPdf(weekInfo.inspiration, weekInfo.weekDatesFormatted)
                          }
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 hover:bg-stone-50 text-stone-800 dark:text-stone-100 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                        >
                          <Eye className="w-3 h-3 text-[#6b1426]" />
                          <span>PDF</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* VIEW MODE 2: FOCUSED SINGLE WEEK EDITOR & VIEWER */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left: Week List Column */}
            <div className="w-full md:w-72 bg-stone-50 dark:bg-stone-900/60 border-r border-stone-200 dark:border-stone-800 p-3 overflow-y-auto space-y-1.5 shrink-0">
              <span className="text-[11px] font-black text-stone-400 uppercase tracking-wider block px-2 mb-2">
                Select Week ({termWeekNumbers.length} Weeks)
              </span>

              {termWeekNumbers.map((wNum) => {
                const weekInfo = getInspirationForWeek(wNum);
                const isActive = wNum === currentWeekNumber;
                const isSelected = wNum === selectedWeek;

                return (
                  <button
                    key={wNum}
                    type="button"
                    onClick={() => setSelectedWeek(wNum)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-[#6b1426] text-white border-[#6b1426] shadow-xs'
                        : 'bg-white dark:bg-stone-800/80 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:border-rose-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span>Week {wNum}</span>
                        {isActive && (
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-black ${
                              isSelected ? 'bg-amber-300 text-stone-950' : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}
                          >
                            ACTIVE
                          </span>
                        )}
                        {weekInfo.isCustomized && (
                          <span
                            className={`text-[9px] px-1 rounded font-bold ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            EDITED
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] block font-mono font-normal mt-0.5 ${
                          isSelected ? 'text-rose-100' : 'text-stone-500 dark:text-stone-400'
                        }`}
                      >
                        {weekInfo.weekDatesFormatted.replace('WEEK: ', '')}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

          {/* Right: Selected Week Details & Actions */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5 bg-white dark:bg-stone-900">
            {/* Week Title & Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-xl font-black text-stone-900 dark:text-stone-100">
                    Week {selectedWeekData.weekNumber} Inspiration
                  </span>
                  {selectedWeekData.weekNumber === currentWeekNumber && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 font-black text-[10px]">
                      CURRENT ACTIVE WEEK
                    </span>
                  )}
                  {selectedWeekData.isCustomized && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 font-bold text-[10px]">
                      CUSTOMIZED BY ADMIN
                    </span>
                  )}
                </div>
                <p className="text-xs font-extrabold text-[#6b1426] dark:text-rose-400 mt-1">
                  {selectedWeekData.weekDatesFormatted}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(selectedWeekData.inspiration)}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit This Week</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handlePreviewPdf(
                      selectedWeekData.inspiration,
                      selectedWeekData.weekDatesFormatted
                    )
                  }
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-[#6b1426] dark:text-rose-300 border-2 border-[#6b1426]/30 dark:border-rose-800 text-xs font-black flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
                >
                  <Eye className="w-3.5 h-3.5 text-[#6b1426] dark:text-rose-400" />
                  <span>View as PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleDownloadPdf(
                      selectedWeekData.inspiration,
                      selectedWeekData.weekDatesFormatted
                    )
                  }
                  className="px-3.5 py-2 rounded-xl bg-[#6b1426] hover:bg-[#520f1d] text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Poster</span>
                </button>

                {selectedWeekData.isCustomized && (
                  <button
                    type="button"
                    onClick={() => handleResetToDefault(selectedWeekData.weekNumber)}
                    className="p-2 rounded-xl text-stone-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                    title="Reset this week to original curated default"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Display of the 5 Sections for Selected Week */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Funny Thought */}
              <div className="rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/30 p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-300 text-xs font-black uppercase">
                  <Smile className="w-3.5 h-3.5" />
                  <span>1. Funny Thought of the Week</span>
                </div>
                <p className="text-stone-900 dark:text-stone-100 text-sm font-semibold italic">
                  "{selectedWeekData.inspiration.funnyThought}"
                </p>
              </div>

              {/* 2. Motivation */}
              <div className="rounded-2xl border border-teal-200 dark:border-teal-800/60 bg-teal-50/70 dark:bg-teal-950/30 p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-teal-900 dark:text-teal-300 text-xs font-black uppercase">
                  <Zap className="w-3.5 h-3.5" />
                  <span>2. Motivation of the Week</span>
                </div>
                <p className="text-stone-900 dark:text-stone-100 text-sm font-semibold italic">
                  "{selectedWeekData.inspiration.motivation}"
                </p>
              </div>

              {/* 3. Verse/Wisdom */}
              <div className="rounded-2xl border border-blue-200 dark:border-blue-800/60 bg-blue-50/70 dark:bg-blue-950/30 p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-blue-900 dark:text-blue-300 text-xs font-black uppercase">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>3. Verse / Wisdom of the Week</span>
                </div>
                <p className="text-stone-900 dark:text-stone-100 text-sm font-semibold italic">
                  "{selectedWeekData.inspiration.verseOrWisdom}"
                </p>
                {selectedWeekData.inspiration.verseReference && (
                  <p className="text-right text-xs font-black text-blue-700 dark:text-blue-400">
                    — {selectedWeekData.inspiration.verseReference}
                  </p>
                )}
              </div>

              {/* 4. Question */}
              <div className="rounded-2xl border border-purple-200 dark:border-purple-800/60 bg-purple-50/70 dark:bg-purple-950/30 p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-purple-900 dark:text-purple-300 text-xs font-black uppercase">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>4. Question to Think About</span>
                </div>
                <p className="text-stone-900 dark:text-stone-100 text-sm font-semibold italic">
                  "{selectedWeekData.inspiration.questionToThinkAbout}"
                </p>
              </div>

              {/* 5. Challenge */}
              <div className="md:col-span-2 rounded-2xl border border-rose-200 dark:border-rose-800/60 bg-rose-50/70 dark:bg-rose-950/30 p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-rose-900 dark:text-rose-300 text-xs font-black uppercase">
                  <Award className="w-3.5 h-3.5" />
                  <span>5. Challenge of the Week</span>
                </div>
                <p className="text-stone-900 dark:text-stone-100 text-sm font-bold">
                  "{selectedWeekData.inspiration.challengeOfTheWeek}"
                </p>
              </div>
            </div>
          </div>
        </div>
        )}
        </>
        )}

        {/* Footer */}
        <div className="bg-stone-100 dark:bg-stone-950 px-5 py-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 shrink-0">
          <span>Reberwet Junior Secondary School • Notice Board Inspiration Management</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-bold hover:bg-stone-800 transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>

      {/* EDIT MODAL (ADMIN ONLY) */}
      {editingItem && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl max-w-2xl w-full overflow-hidden my-4">
            <div className="bg-[#6b1426] text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                  Admin Content Customization
                </span>
                <h3 className="text-base sm:text-lg font-black">
                  Edit Week {editingItem.weekNumber} Inspiration
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1.5 rounded-full hover:bg-white/20 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              {/* 1. Funny Thought */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-stone-800 dark:text-stone-200 block uppercase tracking-wider">
                  1. Funny Thought of the Week (Clean Humor)
                </label>
                <textarea
                  value={editFunny}
                  onChange={(e) => setEditFunny(e.target.value)}
                  rows={2}
                  required
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-medium focus:border-[#6b1426] focus:outline-none"
                />
              </div>

              {/* 2. Motivation */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-stone-800 dark:text-stone-200 block uppercase tracking-wider">
                  2. Motivation of the Week
                </label>
                <textarea
                  value={editMotivation}
                  onChange={(e) => setEditMotivation(e.target.value)}
                  rows={2}
                  required
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-medium focus:border-[#6b1426] focus:outline-none"
                />
              </div>

              {/* 3. Verse & Reference */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-stone-800 dark:text-stone-200 block uppercase tracking-wider">
                  3. Verse / Wisdom of the Week
                </label>
                <textarea
                  value={editVerse}
                  onChange={(e) => setEditVerse(e.target.value)}
                  rows={2}
                  required
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-medium focus:border-[#6b1426] focus:outline-none"
                />
                <div className="pt-1">
                  <label className="text-[11px] font-bold text-stone-500 block">
                    Scripture Reference / Citation (e.g. Proverbs 15:1)
                  </label>
                  <input
                    type="text"
                    value={editRef}
                    onChange={(e) => setEditRef(e.target.value)}
                    placeholder="e.g. Proverbs 15:1"
                    className="w-full p-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold focus:border-[#6b1426] focus:outline-none text-xs mt-1"
                  />
                </div>
              </div>

              {/* 4. Question */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-stone-800 dark:text-stone-200 block uppercase tracking-wider">
                  4. Question to Think About
                </label>
                <textarea
                  value={editQuestion}
                  onChange={(e) => setEditQuestion(e.target.value)}
                  rows={2}
                  required
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-medium focus:border-[#6b1426] focus:outline-none"
                />
              </div>

              {/* 5. Challenge */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-stone-800 dark:text-stone-200 block uppercase tracking-wider">
                  5. Challenge of the Week (Practical Action)
                </label>
                <textarea
                  value={editChallenge}
                  onChange={(e) => setEditChallenge(e.target.value)}
                  rows={2}
                  required
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-medium focus:border-[#6b1426] focus:outline-none"
                />
              </div>

              {/* Form Buttons */}
              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#6b1426] hover:bg-[#520f1d] text-white font-black flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Week {editingItem.weekNumber} Content</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF VIEWER MODAL */}
      {previewWeekInfo && (
        <PdfViewerModal
          isOpen={pdfPreviewOpen}
          onClose={() => setPdfPreviewOpen(false)}
          title={`Weekly Inspiration Poster - ${previewWeekInfo.dates}`}
          pdfDataUri={pdfDataUri || undefined}
          pdfBlobUrl={pdfBlobUrl || undefined}
          onDownload={() =>
            handleDownloadPdf(previewWeekInfo.inspiration, previewWeekInfo.dates)
          }
        />
      )}
    </div>
  );
};
