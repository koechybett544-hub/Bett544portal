import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Printer,
  Maximize2,
  Minimize2,
  FileText,
  ExternalLink,
  Eye,
  Layout,
} from 'lucide-react';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  pdfDataUri?: string;
  pdfBlob?: Blob;
  pdfBlobUrl?: string;
  onDownload?: () => void;
  visualPreview?: React.ReactNode;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  isOpen,
  onClose,
  title,
  pdfDataUri,
  pdfBlob,
  pdfBlobUrl: initialBlobUrl,
  onDownload,
  visualPreview,
}) => {
  // Always default to 'pdf' view mode so user sees the authentic PDF
  const [viewMode, setViewMode] = useState<'pdf' | 'visual'>('pdf');
  const [isMaximized, setIsMaximized] = useState(false);
  const [activeBlobUrl, setActiveBlobUrl] = useState<string | null>(initialBlobUrl || null);

  useEffect(() => {
    if (initialBlobUrl) {
      setActiveBlobUrl(initialBlobUrl);
      return;
    }
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      setActiveBlobUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [initialBlobUrl, pdfBlob]);

  if (!isOpen) return null;

  const currentPdfSrc = activeBlobUrl || pdfDataUri;

  const handleOpenInNewTab = () => {
    if (currentPdfSrc) {
      window.open(currentPdfSrc, '_blank');
    }
  };

  const handlePrint = () => {
    if (currentPdfSrc) {
      const printWindow = window.open(currentPdfSrc, '_blank');
      if (printWindow) {
        printWindow.focus();
        setTimeout(() => {
          try {
            printWindow.print();
          } catch {
            // ignore
          }
        }, 800);
        return;
      }
    }
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-2 sm:p-4 overflow-hidden animate-in fade-in duration-200"
    >
      <div
        className={`bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
          isMaximized ? 'w-full h-full rounded-none' : 'w-full max-w-5xl h-[94vh]'
        }`}
      >
        {/* Top Toolbar */}
        <div className="bg-[#6b1426] text-white px-4 py-3 sm:px-6 sm:py-3.5 flex items-center justify-between gap-3 shrink-0 shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white border border-white/20">
              <FileText className="w-4 h-4 text-amber-300" />
            </span>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-black truncate">{title}</h2>
              <p className="text-[10px] text-rose-200 truncate">
                Official Reberwet JSS Printable A4 PDF Document
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* View Mode Switcher */}
            {visualPreview && currentPdfSrc && (
              <div className="hidden sm:flex rounded-xl bg-black/20 p-0.5 border border-white/20 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setViewMode('pdf')}
                  className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
                    viewMode === 'pdf'
                      ? 'bg-white text-[#6b1426] shadow-xs'
                      : 'text-rose-100 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>PDF Document</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('visual')}
                  className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
                    viewMode === 'visual'
                      ? 'bg-white text-[#6b1426] shadow-xs'
                      : 'text-rose-100 hover:text-white'
                  }`}
                >
                  <Layout className="w-3.5 h-3.5" />
                  <span>Notice Board Card</span>
                </button>
              </div>
            )}

            {/* Open in New Window / Browser Native PDF Viewer */}
            {currentPdfSrc && (
              <button
                type="button"
                onClick={handleOpenInNewTab}
                title="Open PDF in full browser window"
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition active:scale-95 flex items-center gap-1 text-xs font-bold cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden lg:inline">Full Tab</span>
              </button>
            )}

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              title="Print PDF"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition active:scale-95 flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden md:inline">Print</span>
            </button>

            {/* Download Button */}
            {onDownload && (
              <button
                type="button"
                onClick={onDownload}
                title="Download PDF to Device"
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save PDF</span>
              </button>
            )}

            {/* Toggle Fullscreen / Maximize */}
            <button
              type="button"
              onClick={() => setIsMaximized(!isMaximized)}
              title={isMaximized ? 'Restore View' : 'Maximize View'}
              className="hidden sm:flex p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              title="Close Preview"
              className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Mode Switcher for Mobile */}
        {visualPreview && currentPdfSrc && (
          <div className="sm:hidden flex border-b border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-800/80 p-1 text-xs font-bold justify-around">
            <button
              type="button"
              onClick={() => setViewMode('pdf')}
              className={`flex-1 py-1.5 rounded-lg text-center flex items-center justify-center gap-1 ${
                viewMode === 'pdf'
                  ? 'bg-white dark:bg-stone-900 text-[#6b1426] dark:text-rose-400 shadow-xs'
                  : 'text-stone-500'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('visual')}
              className={`flex-1 py-1.5 rounded-lg text-center flex items-center justify-center gap-1 ${
                viewMode === 'visual'
                  ? 'bg-white dark:bg-stone-900 text-[#6b1426] dark:text-rose-400 shadow-xs'
                  : 'text-stone-500'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Card View</span>
            </button>
          </div>
        )}

        {/* Document Body Area */}
        <div className="flex-1 bg-stone-100 dark:bg-stone-950 p-2 sm:p-4 overflow-y-auto flex items-center justify-center">
          {viewMode === 'pdf' && currentPdfSrc ? (
            <div className="w-full h-full bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col border border-stone-300 dark:border-stone-800">
              <iframe
                src={`${currentPdfSrc}#toolbar=1&view=FitH`}
                className="w-full h-full flex-1 border-0 rounded-2xl min-h-[480px]"
                title={title}
              />
              {/* In case iframe cannot render on specific mobile browsers */}
              <div className="p-2 bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs sm:hidden">
                <span className="text-[11px] text-stone-500">PDF not showing in phone view?</span>
                <button
                  type="button"
                  onClick={handleOpenInNewTab}
                  className="px-2.5 py-1 rounded-lg bg-[#6b1426] text-white font-bold text-[11px] flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Open Full PDF</span>
                </button>
              </div>
            </div>
          ) : viewMode === 'visual' && visualPreview ? (
            <div className="w-full max-w-3xl my-auto animate-in zoom-in-95 duration-200 shadow-xl rounded-2xl overflow-hidden">
              {visualPreview}
            </div>
          ) : (
            <div className="p-8 text-center text-stone-500 dark:text-stone-400 text-xs">
              Generating PDF document stream...
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="bg-stone-100 dark:bg-stone-900 px-4 py-2.5 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Reberwet Junior Secondary School • Official Document PDF Viewer</span>
          </div>
          <span className="font-semibold text-[#6b1426] dark:text-rose-400 hidden sm:inline">
            A4 Standard • Print &amp; Post on Notice Board
          </span>
        </div>
      </div>
    </div>
  );
};
