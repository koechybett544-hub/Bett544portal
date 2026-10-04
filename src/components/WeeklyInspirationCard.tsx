import React, { useState, useMemo } from 'react';
import {
  getCurrentWeekInspiration,
  getInspirationForWeek,
  getWeeklyDateRange,
  WeeklyInspirationItem,
} from '../data/weeklyInspirationData';
import {
  generateWeeklyInspirationPosterPdf,
  getWeeklyInspirationPosterDataUri,
  getWeeklyInspirationPosterBlobUrl,
} from '../utils/posterPdfGenerator';
import { getDidYouKnowFactForWeek } from '../data/didYouKnowData';
import { DateService } from '../utils/dateService';
import { SCHOOL_INFO } from '../data/initialData';
import { UserProfile } from '../types';
import { PdfViewerModal } from './PdfViewerModal';
import { AdminWeeklyInspirationManager } from './AdminWeeklyInspirationManager';
import {
  Sparkles,
  Download,
  Smile,
  Zap,
  BookOpen,
  HelpCircle,
  Award,
  Calendar,
  Eye,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Edit3,
  Lightbulb,
} from 'lucide-react';

interface WeeklyInspirationCardProps {
  currentUser?: UserProfile;
  onShowSuccessToast: (msg: string) => void;
}

// Term 3 is Weeks 35 to 47
const TERM_3_WEEKS = [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47];

export const WeeklyInspirationCard: React.FC<WeeklyInspirationCardProps> = ({
  currentUser,
  onShowSuccessToast,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [pdfDataUri, setPdfDataUri] = useState<string | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isAdminManagerOpen, setIsAdminManagerOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const isAdmin = currentUser?.role === 'school_admin' || currentUser?.role === 'super_admin';
  const activeYear = Number(DateService.getCurrentYear());

  // System active week
  const systemWeekInfo = useMemo(() => {
    void refreshKey;
    return getCurrentWeekInspiration();
  }, [refreshKey]);

  // Selected week (defaults to system current week)
  const [viewedWeek, setViewedWeek] = useState<number>(systemWeekInfo.weekNumber);

  // Active displayed inspiration and formatted dates
  const { weekDatesFormatted, inspiration, isCustomized, isCurrentActiveWeek } = useMemo(() => {
    void refreshKey;
    if (viewedWeek === systemWeekInfo.weekNumber) {
      return {
        ...systemWeekInfo,
        isCurrentActiveWeek: true,
      };
    }
    const weekData = getInspirationForWeek(viewedWeek);
    return {
      weekDatesFormatted: weekData.weekDatesFormatted,
      inspiration: weekData.inspiration,
      isCustomized: weekData.isCustomized,
      isCurrentActiveWeek: false,
    };
  }, [viewedWeek, systemWeekInfo, refreshKey]);

  // Active DYK fact for viewed week
  const activeDyk = useMemo(() => {
    void refreshKey;
    return getDidYouKnowFactForWeek(viewedWeek, activeYear);
  }, [viewedWeek, activeYear, refreshKey]);

  const handleOpenPdfPreview = () => {
    try {
      const uri = getWeeklyInspirationPosterDataUri(
        inspiration,
        weekDatesFormatted,
        activeDyk.item
      );
      const bUrl = getWeeklyInspirationPosterBlobUrl(
        inspiration,
        weekDatesFormatted,
        activeDyk.item
      );
      setPdfDataUri(uri);
      setPdfBlobUrl(bUrl);
    } catch (e: any) {
      console.warn('Could not generate PDF directly, using visual preview:', e);
    }
    setIsPreviewOpen(true);
  };

  const handleDownloadPoster = async () => {
    setIsDownloading(true);
    try {
      const res = await generateWeeklyInspirationPosterPdf(
        inspiration,
        weekDatesFormatted,
        (msg, isErr) => {
          if (!isErr) {
            onShowSuccessToast(msg);
          }
        },
        activeDyk.item
      );

      if (res.success) {
        onShowSuccessToast(
          `Notice Board Poster downloaded for ${weekDatesFormatted}! Ready to print and post on the physical school notice board.`
        );
      }
    } catch (err: any) {
      console.error('Error downloading poster:', err);
      onShowSuccessToast(`Download issue: ${err?.message || 'Could not save PDF'}`);
    } finally {
      setIsDownloading(false);
    }
  };

  // High-fidelity A4 Poster Sheet for in-modal rendering on mobile & desktop
  const visualPosterPreview = (
    <div className="bg-white text-stone-900 p-5 sm:p-7 rounded-2xl shadow-xl border-4 border-[#6b1426] relative max-w-4xl mx-auto space-y-4">
      {/* Decorative inner gold border */}
      <div className="absolute inset-1.5 border border-amber-500/60 pointer-events-none rounded-xl" />

      {/* Header Banner */}
      <div className="bg-[#6b1426] text-white text-center py-4 px-3 rounded-xl shadow-xs space-y-1">
        <h1 className="text-base sm:text-xl font-black tracking-tight">{SCHOOL_INFO.name}</h1>
        <p className="text-xs italic text-amber-200">"{SCHOOL_INFO.motto}"</p>
        <div className="pt-1">
          <span className="text-sm sm:text-base font-black tracking-wider uppercase text-white block">
            WEEKLY INSPIRATION &amp; ASPIRATION
          </span>
          <span className="inline-block mt-1 px-3 py-0.5 rounded-full bg-amber-100 text-amber-950 font-black text-xs">
            {weekDatesFormatted}
          </span>
        </div>
      </div>

      {/* 2-Column Poster Body: Left 5 Cards + Right Did You Know Box */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-stretch">
        {/* Left Column: 5 Inspiration Cards (7 cols) */}
        <div className="md:col-span-7 space-y-2.5">
          {/* Card 1 */}
          <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-2.5 shadow-2xs">
            <div className="flex items-center gap-1.5 text-amber-900 font-black text-[11px] uppercase mb-1">
              <Smile className="w-3.5 h-3.5 text-amber-600" />
              <span>1. FUNNY THOUGHT OF THE WEEK</span>
            </div>
            <p className="text-stone-900 text-xs sm:text-sm font-bold italic">
              "{inspiration.funnyThought}"
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-xl border border-teal-300 bg-teal-50/70 p-2.5 shadow-2xs">
            <div className="flex items-center gap-1.5 text-teal-900 font-black text-[11px] uppercase mb-1">
              <Zap className="w-3.5 h-3.5 text-teal-600" />
              <span>2. MOTIVATION OF THE WEEK</span>
            </div>
            <p className="text-stone-900 text-xs sm:text-sm font-bold italic">
              "{inspiration.motivation}"
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-xl border border-blue-300 bg-blue-50/70 p-2.5 shadow-2xs">
            <div className="flex items-center gap-1.5 text-blue-900 font-black text-[11px] uppercase mb-1">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>3. VERSE/WISDOM OF THE WEEK</span>
            </div>
            <p className="text-stone-900 text-xs sm:text-sm font-bold italic">
              "{inspiration.verseOrWisdom}"
            </p>
            {inspiration.verseReference && (
              <p className="text-right text-[10px] font-black text-blue-700 mt-0.5">
                — {inspiration.verseReference}
              </p>
            )}
          </div>

          {/* Card 4 */}
          <div className="rounded-xl border border-purple-300 bg-purple-50/70 p-2.5 shadow-2xs">
            <div className="flex items-center gap-1.5 text-purple-900 font-black text-[11px] uppercase mb-1">
              <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
              <span>4. QUESTION TO THINK ABOUT</span>
            </div>
            <p className="text-stone-900 text-xs sm:text-sm font-bold italic">
              "{inspiration.questionToThinkAbout}"
            </p>
          </div>

          {/* Card 5 */}
          <div className="rounded-xl border border-rose-300 bg-rose-50/70 p-2.5 shadow-2xs">
            <div className="flex items-center gap-1.5 text-rose-900 font-black text-[11px] uppercase mb-1">
              <Award className="w-3.5 h-3.5 text-rose-600" />
              <span>5. CHALLENGE OF THE WEEK</span>
            </div>
            <p className="text-stone-900 text-xs sm:text-sm font-black leading-snug">
              "{inspiration.challengeOfTheWeek}"
            </p>
          </div>
        </div>

        {/* Right Column: "DID YOU KNOW?" Notice Board Box (5 cols) */}
        <div className="md:col-span-5 rounded-2xl border-2 border-[#6b1426] bg-[#fefcf7] p-3.5 flex flex-col justify-between shadow-xs space-y-3">
          <div className="bg-[#6b1426] text-white p-2.5 rounded-xl text-center space-y-1">
            <span className="text-xs font-black uppercase tracking-wider block">
              DID YOU KNOW?
            </span>
            <span className="inline-block px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-950 font-black text-[10px]">
              Week: {weekDatesFormatted}
            </span>
          </div>

          <div className="text-center">
            <span className="inline-block px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 font-extrabold text-[9px] uppercase">
              ★ {activeDyk.item.category} ★
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200">
            <p className="text-xs font-black text-stone-900 leading-snug">
              "{activeDyk.item.question}"
            </p>
          </div>

          <div className="bg-teal-50/90 p-2.5 rounded-xl border border-teal-200 space-y-1">
            <span className="text-[9px] font-black uppercase text-teal-800 block">
              The Surprising Truth &amp; Science:
            </span>
            <p className="text-[10px] text-teal-950 leading-relaxed font-medium">
              {activeDyk.item.verifiedFact}
            </p>
          </div>

          <div className="text-center pt-2 border-t border-[#6b1426]/20 text-[9px] text-stone-500 font-bold">
            REBERWET JSS CURIOSITY DESK
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-[#6b1426]/30 flex items-center justify-between text-[10px] text-stone-600 font-bold">
        <span>OFFICIAL NOTICE BOARD DISPLAY • REBERWET JSS</span>
        <span className="text-[#6b1426]">“Together we can make a difference.”</span>
      </div>
    </div>
  );

  return (
    <>
      <section
        id="weekly-inspiration"
        aria-label="Weekly Inspiration Section"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50/80 via-white to-rose-50/40 dark:from-stone-900 dark:via-stone-900 dark:to-rose-950/20 border-2 border-rose-200/80 dark:border-rose-900/60 shadow-md p-4 sm:p-6 transition-all"
      >
        {/* Decorative Background Stamp / Watermark */}
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-36 h-36 rounded-full bg-rose-500/5 dark:bg-rose-400/5 blur-2xl pointer-events-none" />

        {/* Main Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/80 text-[#6b1426] dark:text-rose-300 text-xs font-black tracking-wider uppercase border border-rose-200 dark:border-rose-900">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                WEEKLY INSPIRATION
              </span>
              <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400">
                Official School Notice Board
              </span>
              {isCustomized && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300">
                  Customized by Admin
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight mt-1.5">
              {SCHOOL_INFO.name}
            </h2>
            <p className="text-xs sm:text-sm italic font-medium text-[#6b1426] dark:text-rose-400">
              "{SCHOOL_INFO.motto}"
            </p>

            {/* Week Date Range Banner */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-100/90 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 font-extrabold text-xs sm:text-sm tracking-wide shadow-2xs">
                <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>{weekDatesFormatted}</span>
              </div>

              {!isCurrentActiveWeek && (
                <button
                  type="button"
                  onClick={() => setViewedWeek(systemWeekInfo.weekNumber)}
                  className="px-2.5 py-1 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                  title="Return to the active current week"
                >
                  <RotateCcw className="w-3 h-3 text-[#6b1426]" />
                  <span>Jump to Active Week {systemWeekInfo.weekNumber}</span>
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons: VIEW AS PDF & DOWNLOAD NOTICE BOARD POSTER & ADMIN MANAGE */}
          <div className="shrink-0 flex flex-wrap items-center gap-2">
            {/* VIEW AS PDF */}
            <button
              type="button"
              onClick={handleOpenPdfPreview}
              className="px-4 py-2.5 rounded-2xl bg-white dark:bg-stone-800 hover:bg-rose-50 dark:hover:bg-stone-700 text-[#6b1426] dark:text-rose-300 border-2 border-[#6b1426]/30 dark:border-rose-800 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-xs active:scale-95 cursor-pointer"
            >
              <Eye className="w-4 h-4 text-[#6b1426] dark:text-rose-400" />
              <span>VIEW AS PDF</span>
            </button>

            {/* DOWNLOAD NOTICE BOARD POSTER */}
            <button
              type="button"
              onClick={handleDownloadPoster}
              disabled={isDownloading}
              className="px-4 sm:px-5 py-2.5 rounded-2xl bg-[#6b1426] hover:bg-[#520f1d] active:scale-95 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer"
            >
              {isDownloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-amber-300" />
                  <span>DOWNLOAD NOTICE BOARD POSTER</span>
                </>
              )}
            </button>

            {/* ADMIN / SUPER ADMIN TERM MANAGER BUTTON */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => setIsAdminManagerOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md active:scale-95 cursor-pointer"
                title="View & Edit all other weeks for the term (Admin only)"
              >
                <ShieldCheck className="w-4 h-4 text-stone-950" />
                <span>MANAGE ALL TERM WEEKS</span>
              </button>
            )}
          </div>
        </div>

        {/* TERM 3 WEEKS NAVIGATOR BAR */}
        <div className="mt-4 pt-3 border-t border-stone-200/80 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-black uppercase text-stone-600 dark:text-stone-300 tracking-wider">
              Term 3 Weeks:
            </span>
            <span className="text-[10px] text-stone-500">
              (Click any week to preview/print)
            </span>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
            <button
              type="button"
              onClick={() => setViewedWeek((w) => Math.max(1, w - 1))}
              disabled={viewedWeek <= 1}
              className="p-1 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 disabled:opacity-30 cursor-pointer"
              title="Previous week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {TERM_3_WEEKS.map((wNum) => {
              const isSelected = wNum === viewedWeek;
              const isCurrent = wNum === systemWeekInfo.weekNumber;

              return (
                <button
                  key={wNum}
                  type="button"
                  onClick={() => setViewedWeek(wNum)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-black transition cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-[#6b1426] text-white shadow-xs'
                      : isCurrent
                      ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-950 dark:text-amber-200 border border-amber-300'
                      : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-rose-400'
                  }`}
                >
                  <span>W{wNum}</span>
                  {isCurrent && <span className="ml-1 text-[9px] text-emerald-600">●</span>}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setViewedWeek((w) => Math.min(52, w + 1))}
              disabled={viewedWeek >= 52}
              className="p-1 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 disabled:opacity-30 cursor-pointer"
              title="Next week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={() => setIsAdminManagerOpen(true)}
                className="ml-2 px-2.5 py-1 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-950 dark:text-amber-200 hover:bg-amber-200 border border-amber-300 text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit Weeks</span>
              </button>
            )}
          </div>
        </div>

        {/* 5 Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4">
          {/* 1. FUNNY THOUGHT OF THE WEEK */}
          <div className="rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 p-4 flex flex-col justify-between shadow-2xs hover:shadow-xs transition">
            <div>
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 text-xs font-black uppercase tracking-wider mb-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200">
                  <Smile className="w-3.5 h-3.5" />
                </span>
                <span>1. FUNNY THOUGHT OF THE WEEK</span>
              </div>
              <p className="text-stone-800 dark:text-stone-200 text-sm font-semibold italic leading-relaxed">
                "{inspiration.funnyThought}"
              </p>
            </div>
            <span className="text-[10px] text-amber-700/80 dark:text-amber-400 font-bold mt-3 uppercase tracking-wider">
              ★ Clean School Humor
            </span>
          </div>

          {/* 2. MOTIVATION OF THE WEEK */}
          <div className="rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 p-4 flex flex-col justify-between shadow-2xs hover:shadow-xs transition">
            <div>
              <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300 text-xs font-black uppercase tracking-wider mb-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-200 dark:bg-teal-900/80 text-teal-900 dark:text-teal-200">
                  <Zap className="w-3.5 h-3.5" />
                </span>
                <span>2. MOTIVATION OF THE WEEK</span>
              </div>
              <p className="text-stone-800 dark:text-stone-200 text-sm font-semibold italic leading-relaxed">
                "{inspiration.motivation}"
              </p>
            </div>
            <span className="text-[10px] text-teal-700/80 dark:text-teal-400 font-bold mt-3 uppercase tracking-wider">
              ▲ Character &amp; Perseverance
            </span>
          </div>

          {/* 3. VERSE/WISDOM OF THE WEEK */}
          <div className="rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 p-4 flex flex-col justify-between shadow-2xs hover:shadow-xs transition">
            <div>
              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 text-xs font-black uppercase tracking-wider mb-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-200 dark:bg-blue-900/80 text-blue-900 dark:text-blue-200">
                  <BookOpen className="w-3.5 h-3.5" />
                </span>
                <span>3. VERSE/WISDOM OF THE WEEK</span>
              </div>
              <p className="text-stone-800 dark:text-stone-200 text-sm font-semibold italic leading-relaxed">
                "{inspiration.verseOrWisdom}"
              </p>
            </div>
            {inspiration.verseReference && (
              <p className="text-right text-xs font-black text-blue-700 dark:text-blue-400 mt-2">
                — {inspiration.verseReference}
              </p>
            )}
          </div>

          {/* 4. QUESTION TO THINK ABOUT */}
          <div className="rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 p-4 flex flex-col justify-between shadow-2xs hover:shadow-xs transition md:col-span-1 lg:col-span-1">
            <div>
              <div className="flex items-center gap-2 text-purple-800 dark:text-purple-300 text-xs font-black uppercase tracking-wider mb-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-200 dark:bg-purple-900/80 text-purple-900 dark:text-purple-200">
                  <HelpCircle className="w-3.5 h-3.5" />
                </span>
                <span>4. QUESTION TO THINK ABOUT</span>
              </div>
              <p className="text-stone-800 dark:text-stone-200 text-sm font-semibold italic leading-relaxed">
                "{inspiration.questionToThinkAbout}"
              </p>
            </div>
            <span className="text-[10px] text-purple-700/80 dark:text-purple-400 font-bold mt-3 uppercase tracking-wider">
              ◆ Integrity &amp; Reflection
            </span>
          </div>

          {/* 5. CHALLENGE OF THE WEEK */}
          <div className="rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 p-4 flex flex-col justify-between shadow-2xs hover:shadow-xs transition md:col-span-2 lg:col-span-2">
            <div>
              <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 text-xs font-black uppercase tracking-wider mb-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-200 dark:bg-rose-900/80 text-rose-900 dark:text-rose-200">
                  <Award className="w-3.5 h-3.5" />
                </span>
                <span>5. CHALLENGE OF THE WEEK</span>
              </div>
              <p className="text-stone-900 dark:text-stone-100 text-sm font-bold leading-relaxed">
                "{inspiration.challengeOfTheWeek}"
              </p>
            </div>
            <div className="flex items-center justify-between mt-3 text-[11px] font-bold text-rose-700 dark:text-rose-400">
              <span>✓ Practical Action for All Learners &amp; Staff</span>
              <span className="italic">Encouraging Kindness &amp; Character</span>
            </div>
          </div>

          {/* 6. DID YOU KNOW? FEATURE */}
          <div className="rounded-2xl bg-gradient-to-br from-amber-50/90 to-purple-50/70 dark:from-stone-850 dark:to-purple-950/30 border-2 border-[#6b1426]/30 dark:border-rose-900/60 p-4 flex flex-col justify-between shadow-2xs hover:shadow-xs transition">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 text-purple-900 dark:text-purple-300 text-xs font-black uppercase tracking-wider">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-300 text-stone-950 font-black">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-900" />
                  </span>
                  <span>DID YOU KNOW?</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-200 border border-purple-300">
                  {activeDyk.item.category}
                </span>
              </div>

              <p className="text-stone-900 dark:text-stone-100 text-xs sm:text-sm font-black leading-snug">
                "{activeDyk.item.question}"
              </p>

              <div className="mt-2.5 p-2.5 rounded-xl bg-teal-50/80 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/50">
                <span className="text-[9.5px] font-black text-teal-800 dark:text-teal-300 block uppercase">
                  Verified Fact &amp; Science:
                </span>
                <p className="text-[11px] text-teal-950 dark:text-teal-100 font-medium leading-relaxed mt-0.5">
                  {activeDyk.item.verifiedFact}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 text-[10px] font-bold text-stone-500 pt-2 border-t border-stone-200 dark:border-stone-800">
              <span>Notice Board Right Box Feature</span>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setIsAdminManagerOpen(true)}
                  className="text-[#6b1426] dark:text-rose-400 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Curate Fact</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* PDF VIEWER MODAL */}
      <PdfViewerModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={`Weekly Inspiration Poster - ${weekDatesFormatted}`}
        pdfDataUri={pdfDataUri || undefined}
        pdfBlobUrl={pdfBlobUrl || undefined}
        onDownload={handleDownloadPoster}
        visualPreview={visualPosterPreview}
      />

      {/* ADMIN WEEKLY INSPIRATION MANAGER MODAL (Admin & Super Admin Only) */}
      {currentUser && (
        <AdminWeeklyInspirationManager
          isOpen={isAdminManagerOpen}
          onClose={() => setIsAdminManagerOpen(false)}
          currentUser={currentUser}
          onShowSuccessToast={onShowSuccessToast}
          onInspirationUpdated={() => setRefreshKey((k) => k + 1)}
        />
      )}
    </>
  );
};
