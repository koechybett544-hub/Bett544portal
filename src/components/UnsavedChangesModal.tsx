import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onSaveAndLeave: () => void;
  onLeaveWithoutSaving: () => void;
  onCancel: () => void;
}

export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  isOpen,
  onSaveAndLeave,
  onLeaveWithoutSaving,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="unsaved-changes-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-stone-900 p-6 shadow-2xl border border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-3 text-amber-800 dark:text-amber-300 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/60">
            <AlertTriangle className="w-5 h-5 text-amber-800 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">Unsaved Changes</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">Marks entry in progress</p>
          </div>
        </div>

        <p className="text-sm text-stone-700 dark:text-stone-300 mb-6">
          You have unsaved changes. Leave this page?
        </p>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            id="unsaved-cancel-btn"
            onClick={onCancel}
            className="w-full sm:w-auto px-3.5 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            id="unsaved-leave-btn"
            onClick={onLeaveWithoutSaving}
            className="w-full sm:w-auto px-3.5 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-stone-200 dark:border-stone-700 rounded-lg transition"
          >
            Leave Without Saving
          </button>
          <button
            id="unsaved-save-leave-btn"
            onClick={onSaveAndLeave}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-white bg-[#6b1426] hover:bg-[#540d1e] rounded-lg shadow-sm transition"
          >
            Save and Leave
          </button>
        </div>
      </div>
    </div>
  );
};
