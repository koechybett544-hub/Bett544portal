import jsPDF from 'jspdf';
import { WeeklyInspirationItem } from '../data/weeklyInspirationData';
import {
  DidYouKnowItem,
  getDidYouKnowFactForWeek,
} from '../data/didYouKnowData';
import { SCHOOL_INFO } from '../data/initialData';
import { savePdfToDevice } from './pdfExport';
import { DateService } from './dateService';

/**
 * Builds the official REBERWET JUNIOR SECONDARY SCHOOL Weekly Aspiration & Notice Board PDF.
 * Layout:
 * - Top: Official School Banner with Motto and Week Dates
 * - Left Side: 5 Core Weekly Inspiration Cards (Funny Thought, Motivation, Verse/Wisdom, Question, Challenge)
 * - Right Side Box: Dedicated "DID YOU KNOW?" surprising verified fact feature with category & dates
 * - Bottom: Official Notice Board Authorization Footer
 * Formatted strictly for A4 Portrait without overflow, clipping, or additional pages.
 */
export function buildWeeklyInspirationPosterDoc(
  inspiration: WeeklyInspirationItem,
  weekDatesFormatted: string,
  customDidYouKnowItem?: DidYouKnowItem
): jsPDF {
  // A4 Portrait: 210mm x 297mm
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 12;
  const contentWidth = pageWidth - margin * 2; // 186mm

  // Fetch the active Did You Know fact for this week & year
  const activeYear = Number(DateService.getCurrentYear());
  const activeDyk =
    customDidYouKnowItem ||
    getDidYouKnowFactForWeek(inspiration.weekNumber, activeYear).item;

  // 1. Double Outer Border (Official School Notice Board Style)
  doc.setDrawColor(107, 20, 38); // Primary Maroon #6b1426
  doc.setLineWidth(1.2);
  doc.rect(margin - 4, margin - 4, contentWidth + 8, pageHeight - margin * 2 + 8);

  doc.setDrawColor(217, 119, 6); // Gold / Amber Accent border
  doc.setLineWidth(0.4);
  doc.rect(margin - 2, margin - 2, contentWidth + 4, pageHeight - margin * 2 + 4);

  // 2. School Header Banner
  doc.setFillColor(107, 20, 38); // #6b1426
  doc.roundedRect(margin, margin, contentWidth, 32, 3, 3, 'F');

  // School Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15.5);
  doc.setTextColor(255, 255, 255);
  doc.text(SCHOOL_INFO.name, pageWidth / 2, margin + 7.5, { align: 'center' });

  // School Motto
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(254, 215, 170); // Warm gold/cream
  doc.text(`"${SCHOOL_INFO.motto}"`, pageWidth / 2, margin + 13, { align: 'center' });

  // Feature Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13.5);
  doc.setTextColor(255, 255, 255);
  doc.text('WEEKLY INSPIRATION & ASPIRATION', pageWidth / 2, margin + 20.5, { align: 'center' });

  // Sub-banner for Week Dates
  doc.setFillColor(254, 243, 199); // Soft amber pill
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin + 20, margin + 23.5, contentWidth - 40, 6, 2.5, 2.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(146, 64, 14); // Dark Amber
  doc.text(`OFFICIAL NOTICE BOARD • ${weekDatesFormatted}`, pageWidth / 2, margin + 27.8, {
    align: 'center',
  });

  // Layout Geometry: Two Columns
  const contentStartY = margin + 35; // 47mm
  const footerReserved = 16;
  const availableHeight = pageHeight - contentStartY - margin - footerReserved; // ~232mm

  // Left Column: Weekly Inspiration 5 cards
  const leftColX = margin;
  const leftColWidth = 116;

  // Right Column: "DID YOU KNOW?" Box
  const colGap = 4;
  const rightColX = leftColX + leftColWidth + colGap; // 132mm
  const rightColWidth = contentWidth - leftColWidth - colGap; // 66mm

  // --------------------------------------------------------------------------
  // LEFT COLUMN: 5 INSPIRATION CARDS
  // --------------------------------------------------------------------------
  interface SectionDef {
    title: string;
    body: string;
    reference?: string;
    headerBg: [number, number, number];
    cardBg: [number, number, number];
    borderColor: [number, number, number];
    textColor: [number, number, number];
    iconSymbol: string;
  }

  const sections: SectionDef[] = [
    {
      title: '1. FUNNY THOUGHT OF THE WEEK',
      body: inspiration.funnyThought,
      headerBg: [217, 119, 6], // Amber-600
      cardBg: [255, 251, 235], // Amber-50
      borderColor: [251, 191, 36], // Amber-300
      textColor: [69, 26, 3],
      iconSymbol: '★',
    },
    {
      title: '2. MOTIVATION OF THE WEEK',
      body: inspiration.motivation,
      headerBg: [13, 148, 136], // Teal-600
      cardBg: [240, 253, 250], // Teal-50
      borderColor: [94, 234, 212], // Teal-300
      textColor: [19, 78, 74],
      iconSymbol: '▲',
    },
    {
      title: '3. VERSE / WISDOM OF THE WEEK',
      body: inspiration.verseOrWisdom,
      reference: inspiration.verseReference,
      headerBg: [37, 99, 235], // Blue-600
      cardBg: [239, 246, 255], // Blue-50
      borderColor: [147, 197, 253], // Blue-300
      textColor: [30, 58, 138],
      iconSymbol: '◆',
    },
    {
      title: '4. QUESTION TO THINK ABOUT',
      body: inspiration.questionToThinkAbout,
      headerBg: [124, 58, 237], // Purple-600
      cardBg: [245, 243, 255], // Purple-50
      borderColor: [196, 181, 253], // Purple-300
      textColor: [76, 29, 149],
      iconSymbol: '?',
    },
    {
      title: '5. CHALLENGE OF THE WEEK',
      body: inspiration.challengeOfTheWeek,
      headerBg: [225, 29, 72], // Rose-600
      cardBg: [255, 241, 242], // Rose-50
      borderColor: [253, 164, 175], // Rose-300
      textColor: [136, 19, 55],
      iconSymbol: '✓',
    },
  ];

  const cardGap = 3.5;
  const cardHeight = (availableHeight - cardGap * 4) / 5; // ~43.5mm

  let currentY = contentStartY;
  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];

    // Outer Card Box
    doc.setFillColor(s.cardBg[0], s.cardBg[1], s.cardBg[2]);
    doc.setDrawColor(s.borderColor[0], s.borderColor[1], s.borderColor[2]);
    doc.setLineWidth(0.35);
    doc.roundedRect(leftColX, currentY, leftColWidth, cardHeight, 2.5, 2.5, 'FD');

    // Card Header Ribbon
    doc.setFillColor(s.headerBg[0], s.headerBg[1], s.headerBg[2]);
    doc.roundedRect(leftColX, currentY, leftColWidth, 7, 2.5, 2.5, 'F');
    doc.rect(leftColX, currentY + 3.5, leftColWidth, 3.5, 'F');

    // Header Text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(`${s.iconSymbol}  ${s.title}`, leftColX + 3.5, currentY + 4.9);

    // Card Body Content (Quote text)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(s.textColor[0], s.textColor[1], s.textColor[2]);

    const quoteText = s.body.startsWith('"') ? s.body : `"${s.body}"`;
    const maxTextWidth = leftColWidth - 8;
    const splitLines = doc.splitTextToSize(quoteText, maxTextWidth);

    // Vertically center text
    const textBlockHeight = splitLines.length * 4.2;
    let textStartY = currentY + 7.5 + Math.max(2, (cardHeight - 7.5 - textBlockHeight) / 2);
    if (s.reference) {
      textStartY -= 2;
    }

    doc.text(splitLines, leftColX + 4, textStartY);

    // Scripture / Quote Reference if present
    if (s.reference) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(s.headerBg[0], s.headerBg[1], s.headerBg[2]);
      doc.text(`— ${s.reference}`, leftColX + leftColWidth - 4, currentY + cardHeight - 2.5, {
        align: 'right',
      });
    }

    currentY += cardHeight + cardGap;
  }

  // --------------------------------------------------------------------------
  // RIGHT COLUMN: "DID YOU KNOW?" BOX
  // --------------------------------------------------------------------------
  const rightBoxHeight = availableHeight;
  const rightBoxY = contentStartY;

  // Outer Box Background & Double Frame
  doc.setFillColor(254, 252, 247); // Warm Ivory
  doc.setDrawColor(107, 20, 38); // Primary Maroon
  doc.setLineWidth(0.8);
  doc.roundedRect(rightColX, rightBoxY, rightColWidth, rightBoxHeight, 3, 3, 'FD');

  // Inner Accent Border
  doc.setDrawColor(217, 119, 6); // Amber
  doc.setLineWidth(0.3);
  doc.roundedRect(
    rightColX + 1.5,
    rightBoxY + 1.5,
    rightColWidth - 3,
    rightBoxHeight - 3,
    2.2,
    2.2,
    'D'
  );

  // Header Banner Ribbon
  const headerRibbonHeight = 22;
  doc.setFillColor(107, 20, 38);
  doc.roundedRect(rightColX, rightBoxY, rightColWidth, headerRibbonHeight, 3, 3, 'F');
  doc.rect(rightColX, rightBoxY + 14, rightColWidth, 8, 'F');

  // Header Title: DID YOU KNOW?
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text('DID YOU KNOW?', rightColX + rightColWidth / 2, rightBoxY + 7.5, {
    align: 'center',
  });

  // Week Dates Pill inside header
  doc.setFillColor(254, 243, 199);
  doc.roundedRect(rightColX + 4, rightBoxY + 11.5, rightColWidth - 8, 7, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(146, 64, 14);
  doc.text(`Week: ${weekDatesFormatted}`, rightColX + rightColWidth / 2, rightBoxY + 16.2, {
    align: 'center',
  });

  // Category Pill below header
  let dykY = rightBoxY + headerRibbonHeight + 4;
  doc.setFillColor(243, 232, 255); // Soft Violet
  doc.setDrawColor(192, 132, 252);
  doc.setLineWidth(0.2);
  doc.roundedRect(rightColX + 5, dykY, rightColWidth - 10, 5.5, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(107, 33, 168); // Purple-800
  doc.text(
    `★ ${activeDyk.category.toUpperCase()} ★`,
    rightColX + rightColWidth / 2,
    dykY + 3.8,
    { align: 'center' }
  );

  dykY += 9;

  // The Surprising Question Box
  const questionBoxWidth = rightColWidth - 8;
  const questionX = rightColX + 4;

  // Opening Quotation Mark Accent
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(217, 119, 6);
  doc.text('“', questionX + 2, dykY + 3);

  // The "Did you know that...?" question text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(24, 24, 27); // Dark zinc/black

  const questionLines = doc.splitTextToSize(activeDyk.question, questionBoxWidth - 4);
  const qLineHeight = 4.6;
  doc.text(questionLines, questionX + 2, dykY + 6.5);

  dykY += 8 + questionLines.length * qLineHeight;

  // Middle Curiosity Divider
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.3);
  doc.line(questionX + 4, dykY, questionX + questionBoxWidth - 4, dykY);

  doc.setFillColor(254, 243, 199);
  doc.circle(rightColX + rightColWidth / 2, dykY, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(146, 64, 14);
  doc.text('✦', rightColX + rightColWidth / 2, dykY + 1, { align: 'center' });

  dykY += 6;

  // Verified Science / Explanation Section
  doc.setFillColor(240, 253, 250); // Teal tint
  doc.setDrawColor(94, 234, 212);
  doc.setLineWidth(0.3);

  const scienceBoxHeight = Math.min(
    70,
    rightBoxHeight - (dykY - rightBoxY) - 28
  );
  doc.roundedRect(questionX, dykY, questionBoxWidth, scienceBoxHeight, 2, 2, 'FD');

  // Science Section Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 118, 110); // Teal-700
  doc.text('THE SURPRISING TRUTH & SCIENCE:', questionX + 3, dykY + 5);

  // Verified Fact Text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(19, 78, 74); // Teal-900

  const scienceLines = doc.splitTextToSize(activeDyk.verifiedFact, questionBoxWidth - 6);
  doc.text(scienceLines, questionX + 3, dykY + 10);

  // Bottom Curiosity Seal inside Right Box
  const sealY = rightBoxY + rightBoxHeight - 19;
  doc.setDrawColor(107, 20, 38);
  doc.setLineWidth(0.3);
  doc.line(rightColX + 5, sealY - 2, rightColX + rightColWidth - 5, sealY - 2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(107, 20, 38);
  doc.text('REBERWET JSS CURIOSITY DESK', rightColX + rightColWidth / 2, sealY + 2.5, {
    align: 'center',
  });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(120, 113, 108);
  doc.text('“Always stay curious and ask why!”', rightColX + rightColWidth / 2, sealY + 6.8, {
    align: 'center',
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(168, 162, 158);
  doc.text('Kericho County • CBC Integrated Learning', rightColX + rightColWidth / 2, sealY + 11, {
    align: 'center',
  });

  // --------------------------------------------------------------------------
  // 4. OFFICIAL NOTICE BOARD FOOTER
  // --------------------------------------------------------------------------
  const footerY = pageHeight - margin - 3;
  doc.setDrawColor(107, 20, 38);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY - 4.5, margin + contentWidth, footerY - 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(107, 20, 38);
  doc.text('OFFICIAL NOTICE BOARD DISPLAY — REBERWET JUNIOR SECONDARY SCHOOL', margin, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(120, 113, 108);
  doc.text('Authorized by Administration & Guidance Dept. • Kericho County', margin, footerY + 3.2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(107, 20, 38);
  doc.text('“Together we can make a difference.”', margin + contentWidth, footerY, {
    align: 'right',
  });

  return doc;
}

export function getWeeklyInspirationPosterBlob(
  inspiration: WeeklyInspirationItem,
  weekDatesFormatted: string,
  didYouKnowItem?: DidYouKnowItem
): Blob {
  const doc = buildWeeklyInspirationPosterDoc(inspiration, weekDatesFormatted, didYouKnowItem);
  return doc.output('blob');
}

export function getWeeklyInspirationPosterBlobUrl(
  inspiration: WeeklyInspirationItem,
  weekDatesFormatted: string,
  didYouKnowItem?: DidYouKnowItem
): string {
  const blob = getWeeklyInspirationPosterBlob(inspiration, weekDatesFormatted, didYouKnowItem);
  return URL.createObjectURL(blob);
}

export function getWeeklyInspirationPosterDataUri(
  inspiration: WeeklyInspirationItem,
  weekDatesFormatted: string,
  didYouKnowItem?: DidYouKnowItem
): string {
  const doc = buildWeeklyInspirationPosterDoc(inspiration, weekDatesFormatted, didYouKnowItem);
  return doc.output('datauristring');
}

export async function generateWeeklyInspirationPosterPdf(
  inspiration: WeeklyInspirationItem,
  weekDatesFormatted: string,
  onFeedback?: (msg: string, isError?: boolean) => void,
  didYouKnowItem?: DidYouKnowItem
): Promise<{ success: boolean; message: string }> {
  try {
    const doc = buildWeeklyInspirationPosterDoc(inspiration, weekDatesFormatted, didYouKnowItem);
    const filename = `Reberwet_JSS_Weekly_Inspiration_Week_${inspiration.weekNumber}_${weekDatesFormatted.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    return await savePdfToDevice(doc, filename, onFeedback);
  } catch (err: any) {
    console.error('Failed to generate Weekly Inspiration Poster PDF:', err);
    const msg = `Failed to generate poster: ${err?.message || 'Unknown error'}`;
    onFeedback?.(msg, true);
    return { success: false, message: msg };
  }
}
