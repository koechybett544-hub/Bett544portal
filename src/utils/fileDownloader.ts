/**
 * Direct file downloader utility for Report Cards, Broadsheets, Schemes of Work, and CBC Documents.
 * Exports formatted documents directly as PDF files to device storage,
 * and downloads structured CSV data directly to user storage.
 * 
 * Works reliably on:
 * - Standalone Android APK (via AndroidBridge / MediaStore)
 * - Android WebViews (with blob & data URI converters and system share)
 * - PWA & Mobile Chrome / Safari
 * - Desktop browsers
 */
import { exportElementToSinglePagePdf, PdfDownloadResult } from './pdfExport';

export interface ReportCardExportOptions {
  learnerName: string;
  admNo: string;
  grade: string;
  term: string;
  year?: string;
  documentHtml?: string;
}

export interface UniversalDownloadOptions {
  filename: string;
  blob?: Blob;
  base64Data?: string;
  dataUrl?: string;
  mimeType?: string;
  title?: string;
  onFeedback?: (msg: string, isError?: boolean) => void;
}

/**
 * Detects if the current client is running inside an Android WebView or standalone APK
 */
export function isAndroidAppOrWebView(): boolean {
  if (typeof window === 'undefined') return false;
  if ((window as any).AndroidBridge || (window as any).Android) return true;
  const ua = navigator.userAgent || '';
  const isAndroid = /android/i.test(ua);
  const isWv = /wv|Version\/[0-9.]+/i.test(ua) || !(window as any).chrome;
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true;
  return isAndroid && (isWv || isStandalone);
}

/**
 * Converts a Blob to a base64 string
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const res = reader.result as string;
      // Strip data URL prefix if present
      const base64 = res.includes(',') ? res.split(',')[1] : res;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Universal file downloader that works seamlessly on Desktop, Mobile, and Android APK WebViews.
 * Solves the "(permission not granted. download failed)" error in Android WebViews by:
 * 1. Prioritizing native AndroidBridge when available (which uses MediaStore.Downloads - 0 permissions required)
 * 2. Using Web Share API with File when in Android WebView (system file saving)
 * 3. Falling back to data URI & Blob downloads for standard browsers
 */
export async function downloadFileUniversally(
  options: UniversalDownloadOptions
): Promise<PdfDownloadResult> {
  const { filename, onFeedback, title } = options;
  const cleanName = filename.replace(/[/\\?%*:|"<>]/g, '_');
  const mimeType = options.mimeType || (cleanName.endsWith('.csv') ? 'text/csv' : 'application/pdf');

  try {
    let base64 = options.base64Data;
    let blob = options.blob;

    // Resolve base64 if we only have dataUrl or blob
    if (!base64) {
      if (options.dataUrl) {
        base64 = options.dataUrl.includes(',') ? options.dataUrl.split(',')[1] : options.dataUrl;
      } else if (blob) {
        base64 = await blobToBase64(blob);
      }
    }

    // Resolve blob if we only have base64 or dataUrl
    if (!blob && base64) {
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      blob = new Blob([bytes], { type: mimeType });
    }

    // 1. Android Native Bridge Check (Embedded in Reberwet JSS APK)
    const bridge = typeof window !== 'undefined' ? ((window as any).AndroidBridge || (window as any).Android) : null;
    if (bridge) {
      try {
        if (typeof bridge.saveBase64File === 'function' && base64) {
          const success = bridge.saveBase64File(base64, cleanName, mimeType);
          if (success !== false) {
            const msg = `Saved "${cleanName}" to Downloads folder`;
            onFeedback?.(msg, false);
            return { success: true, message: msg };
          }
        } else if (typeof bridge.savePdfToDownloads === 'function' && base64) {
          const success = bridge.savePdfToDownloads(base64, cleanName);
          if (success !== false) {
            const msg = `Saved "${cleanName}" to Downloads folder`;
            onFeedback?.(msg, false);
            return { success: true, message: msg };
          }
        }
      } catch (bridgeErr) {
        console.warn('Native AndroidBridge call had error, falling back:', bridgeErr);
      }
    }

    // 2. Web Share API with File (Native file saving on Android APK / PWA / iOS)
    // On Android WebView, navigator.share with a File triggers Android's system share sheet,
    // allowing the teacher to tap "Save to device", "Downloads", "Google Drive", or open directly in PDF viewer.
    // This bypasses Android DownloadManager completely and NEVER triggers permission errors!
    if (isAndroidAppOrWebView() && blob && typeof navigator !== 'undefined' && navigator.canShare) {
      try {
        const file = new File([blob], cleanName, { type: mimeType });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: title || cleanName,
            text: `Reberwet JSS Document: ${cleanName}`,
          });
          const successMsg = `Document ready — saved/shared via device files`;
          onFeedback?.(successMsg, false);
          return { success: true, message: successMsg };
        }
      } catch (shareErr: any) {
        // If user cancelled the share dialog (AbortError), that's fine; otherwise log and fall through
        if (shareErr?.name !== 'AbortError') {
          console.warn('Web Share failed, falling back to direct download link:', shareErr);
        }
      }
    }

    // 3. Browser / PWA direct download via Blob URL & Data URI fallback
    if (blob) {
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = blobUrl;
      link.download = cleanName;
      link.setAttribute('download', cleanName);
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        URL.revokeObjectURL(blobUrl);
      }, 3000);

      const msg = `Saved "${cleanName}" to Downloads`;
      onFeedback?.(msg, false);
      return { success: true, message: msg };
    } else if (options.dataUrl || base64) {
      const dataUri = options.dataUrl || `data:${mimeType};base64,${base64}`;
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = dataUri;
      link.download = cleanName;
      link.setAttribute('download', cleanName);
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      }, 3000);

      const msg = `Saved "${cleanName}" to Downloads`;
      onFeedback?.(msg, false);
      return { success: true, message: msg };
    }

    throw new Error('No valid file content available to download.');
  } catch (err: any) {
    const errorMsg = `Download failed: ${err?.message || 'Unable to save document'}`;
    console.error('Universal download failed:', err);
    onFeedback?.(errorMsg, true);
    return { success: false, message: errorMsg };
  }
}

/**
 * Downloads a complete, formatted PDF report card straight into the user's Downloads/Files
 * folder on Android or PC, with proper feedback and error handling.
 */
export async function downloadReportCardToFile(
  elementId: string,
  filename: string,
  options: {
    title: string;
    learnerName?: string;
    admNo?: string;
    grade?: string;
    onFeedback?: (msg: string, isError?: boolean) => void;
  }
): Promise<PdfDownloadResult> {
  const cleanFilename = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;
  return await exportElementToSinglePagePdf(elementId, cleanFilename, {
    title: options.title,
    onFeedback: options.onFeedback,
  });
}

/**
 * Downloads a structured assessment summary (.csv) directly into the user's files.
 */
export async function downloadCsvToFile(
  content: string,
  filename: string,
  onFeedback?: (msg: string, isError?: boolean) => void
): Promise<PdfDownloadResult> {
  const cleanFilename = filename.toLowerCase().endsWith('.csv') ? filename : `${filename}.csv`;
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  return await downloadFileUniversally({
    filename: cleanFilename,
    blob,
    mimeType: 'text/csv;charset=utf-8;',
    title: cleanFilename,
    onFeedback,
  });
}
