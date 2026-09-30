import React from 'react';
import {
  X,
  Megaphone,
  FolderOpen,
  Printer,
  Calendar,
  ShieldCheck,
  User,
  GraduationCap,
  LogIn,
  Sun,
  Moon,
} from 'lucide-react';
import { UserProfile } from '../types';
import { useTheme } from '../hooks/useTheme';

interface MoreMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  currentUser: UserProfile;
  onOpenAuthModal?: () => void;
}

export const MoreMenuModal: React.FC<MoreMenuModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  currentUser,
  onOpenAuthModal,
}) => {
  const { isDark, toggleTheme, setTheme } = useTheme();

  if (!isOpen) return null;

  const handleSelect = (view: string) => {
    onNavigate(view);
    onClose();
  };

  return (
    <div
      id="more-menu-modal"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-sm rounded-t-3xl sm:rounded-2xl bg-white dark:bg-stone-900 p-5 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
          <h3 className="font-extrabold text-stone-900 dark:text-stone-100 text-sm">More Portal Modules &amp; Settings</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Theme Settings (Light / Dark Mode) */}
        <div className="bg-stone-50 dark:bg-stone-800/60 p-3 rounded-2xl border border-stone-200 dark:border-stone-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isDark ? (
              <Moon className="w-4 h-4 text-sky-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
            <div>
              <span className="text-xs font-black text-stone-800 dark:text-stone-200 block">Appearance</span>
              <span className="text-[10px] text-stone-500 dark:text-stone-400">Current: {isDark ? 'Dark Mode' : 'Light Mode'}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-stone-200 dark:bg-stone-700 p-1 rounded-xl">
            <button
              onClick={() => setTheme('light')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                !isDark
                  ? 'bg-white text-stone-900 shadow-2xs font-black'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <Sun className="w-3 h-3 text-amber-500" />
              <span>Light</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                isDark
                  ? 'bg-stone-900 text-white shadow-2xs font-black'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <Moon className="w-3 h-3 text-sky-300" />
              <span>Dark</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {onOpenAuthModal && (
            <button
              onClick={() => {
                onClose();
                onOpenAuthModal();
              }}
              className="col-span-2 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#6b1426] text-white font-bold transition hover:bg-[#520e1c] shadow-xs"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign Up / Log In (Create Account)</span>
            </button>
          )}

          <button
            onClick={() => handleSelect('timetable')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-stone-50 dark:bg-stone-800/80 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:text-[#6b1426] dark:hover:text-rose-400 font-bold transition"
          >
            <Calendar className="w-5 h-5 text-[#6b1426] dark:text-rose-400 mb-1" />
            <span>Timetable</span>
          </button>

          <button
            onClick={() => handleSelect('classes')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-stone-50 dark:bg-stone-800/80 hover:bg-orange-50 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:text-orange-950 dark:hover:text-stone-100 font-bold transition"
          >
            <GraduationCap className="w-5 h-5 text-orange-700 dark:text-orange-400 mb-1" />
            <span>My Classes</span>
          </button>

          <button
            onClick={() => handleSelect('reports')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-stone-50 dark:bg-stone-800/80 hover:bg-orange-50 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:text-orange-950 dark:hover:text-stone-100 font-bold transition"
          >
            <Printer className="w-5 h-5 text-orange-700 dark:text-orange-400 mb-1" />
            <span>Print Centre</span>
          </button>

          <button
            onClick={() => handleSelect('announcements')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-stone-50 dark:bg-stone-800/80 hover:bg-orange-50 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:text-orange-950 dark:hover:text-stone-100 font-bold transition"
          >
            <Megaphone className="w-5 h-5 text-orange-700 dark:text-orange-400 mb-1" />
            <span>Announcements</span>
          </button>

          <button
            onClick={() => handleSelect('calendar')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-stone-50 dark:bg-stone-800/80 hover:bg-orange-50 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:text-orange-950 dark:hover:text-stone-100 font-bold transition"
          >
            <Calendar className="w-5 h-5 text-orange-700 dark:text-orange-400 mb-1" />
            <span>School Calendar</span>
          </button>

          <button
            onClick={() => handleSelect('documents')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-stone-50 dark:bg-stone-800/80 hover:bg-orange-50 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:text-orange-950 dark:hover:text-stone-100 font-bold transition"
          >
            <FolderOpen className="w-5 h-5 text-orange-700 dark:text-orange-400 mb-1" />
            <span>Documents</span>
          </button>

          <button
            onClick={() => handleSelect('profile')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-stone-50 dark:bg-stone-800/80 hover:bg-orange-50 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:text-orange-950 dark:hover:text-stone-100 font-bold transition"
          >
            <User className="w-5 h-5 text-orange-700 dark:text-orange-400 mb-1" />
            <span>My Profile</span>
          </button>

          {currentUser.role !== 'teacher' && (
            <button
              onClick={() => handleSelect('admin')}
              className="col-span-2 flex items-center justify-center gap-2 p-3 rounded-xl bg-orange-100 dark:bg-stone-800 hover:bg-orange-200 dark:hover:bg-stone-700 border border-orange-300 dark:border-stone-600 text-orange-950 dark:text-orange-300 font-bold transition"
            >
              <ShieldCheck className="w-5 h-5 text-orange-800 dark:text-orange-400" />
              <span>Admin &amp; Audit Trail</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
