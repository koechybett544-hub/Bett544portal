import React from 'react';
import { Announcement } from '../types';
import { X, Bell, AlertCircle, ArrowRight } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcements: Announcement[];
  onNavigateToAnnouncements: () => void;
  pendingMarksCount?: number;
  onNavigateToMarks?: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  announcements,
  onNavigateToAnnouncements,
  pendingMarksCount = 2,
  onNavigateToMarks,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="notifications-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-stone-900 shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 bg-stone-900 dark:bg-stone-950 p-4 text-white">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-base text-white">Notifications &amp; Alerts</h3>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-xl transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
          {/* Urgent Assessment Marks Notification */}
          {pendingMarksCount > 0 && (
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700/60 rounded-2xl flex items-start gap-3 shadow-xs">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white font-bold">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-amber-950 dark:text-amber-200 text-xs">Assessment Alert</span>
                  <span className="text-[10px] bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 font-bold px-1.5 py-0.5 rounded">Action Required</span>
                </div>
                <p className="text-xs text-amber-900 dark:text-amber-300 mt-0.5">
                  <strong>{pendingMarksCount} learners</strong> in your assigned classes require assessment marks.
                </p>
                {onNavigateToMarks && (
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToMarks();
                    }}
                    className="mt-2 text-xs font-black text-amber-900 dark:text-amber-200 hover:underline flex items-center gap-1"
                  >
                    <span>Enter marks now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="p-3 bg-stone-50 dark:bg-stone-800/60 hover:bg-orange-50/50 dark:hover:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 text-xs space-y-1 transition"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900 dark:text-white">{ann.title}</span>
                <span className="text-[10px] bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 px-1.5 py-0.5 rounded font-mono">
                  {ann.date}
                </span>
              </div>
              <p className="text-stone-600 dark:text-stone-300 line-clamp-2">{ann.message}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-stone-100 dark:border-stone-800 p-3 bg-stone-50 dark:bg-stone-950 flex justify-between items-center text-xs">
          <button
            onClick={() => {
              onClose();
              onNavigateToAnnouncements();
            }}
            className="text-[#6b1426] dark:text-rose-400 font-bold hover:underline"
          >
            View All in Announcements →
          </button>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-800 font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700 transition"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

