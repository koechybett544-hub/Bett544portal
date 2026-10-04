import { useState, useEffect } from 'react';

const SIMULATED_DATE_KEY = 'reberwet_simulated_date_v1';

/**
 * Real-time Date Service for Reberwet Junior Secondary School Portal
 * Automatically detects January 1 and activates the new academic year and Term 1.
 * Calculates academic years dynamically from actual system time without hardcoding.
 */
export const DateService = {
  /**
   * Returns simulated date if set by administrator in Academic Year Management,
   * otherwise returns true real-time Date.
   */
  getEffectiveDate(): Date {
    try {
      const simulated = localStorage.getItem(SIMULATED_DATE_KEY);
      if (simulated) {
        const parsed = new Date(simulated);
        if (!isNaN(parsed.getTime())) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return new Date();
  },

  /**
   * Sets simulated date for testing rollover (Admin tool)
   */
  setSimulatedDate(dateISO: string | null): void {
    try {
      if (dateISO) {
        localStorage.setItem(SIMULATED_DATE_KEY, dateISO);
      } else {
        localStorage.removeItem(SIMULATED_DATE_KEY);
      }
      window.dispatchEvent(new Event('reberwet_date_changed'));
    } catch {
      // ignore
    }
  },

  isSimulated(): boolean {
    try {
      return Boolean(localStorage.getItem(SIMULATED_DATE_KEY));
    } catch {
      return false;
    }
  },

  /**
   * Returns current Date in 'YYYY-MM-DD' format
   */
  getCurrentDateISO(): string {
    const now = this.getEffectiveDate();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * Returns formatted human-readable date, e.g. "Thursday, September 24, 2026"
   */
  getFormattedCurrentDate(): string {
    const now = this.getEffectiveDate();
    return now.toLocaleDateString('en-KE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  /**
   * Returns current academic term based on calendar-year system:
   * January - April: Term 1
   * May - August: Term 2
   * September - December: Term 3
   */
  getCurrentTerm(): 'Term 1' | 'Term 2' | 'Term 3' {
    const month = this.getEffectiveDate().getMonth() + 1; // 1-12
    if (month >= 1 && month <= 4) return 'Term 1';
    if (month >= 5 && month <= 8) return 'Term 2';
    return 'Term 3';
  },

  /**
   * Returns current academic year dynamically from actual calendar date
   * On January 1, automatically rolls over to the new year.
   */
  getCurrentYear(): string {
    return String(this.getEffectiveDate().getFullYear());
  },

  /**
   * Returns dynamic list of academic years based on historical data + current year + next year
   * Never hardcoded to specific bounds.
   */
  getAvailableAcademicYears(existingYears: string[] = []): string[] {
    const current = Number(this.getCurrentYear());
    const yearSet = new Set<number>();
    
    // Always include past anchor 2026, current year, and current + 1
    yearSet.add(2026);
    yearSet.add(current);
    yearSet.add(current + 1);

    existingYears.forEach((y) => {
      const num = parseInt(y, 10);
      if (!isNaN(num)) yearSet.add(num);
    });

    return Array.from(yearSet)
      .sort((a, b) => b - a) // descending order: 2028, 2027, 2026...
      .map(String);
  },

  /**
   * Calculates milliseconds remaining until the next midnight (00:00:00)
   */
  getMsUntilNextMidnight(): number {
    const now = new Date();
    const nextMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      0,
      100
    );
    return Math.max(1000, nextMidnight.getTime() - now.getTime());
  },
};

/**
 * Custom React hook that automatically updates the date when midnight strikes
 * or if administrator simulates date changes, keeping the portal live in real-time.
 */
export function useRealtimeDate() {
  const [currentDateISO, setCurrentDateISO] = useState<string>(() =>
    DateService.getCurrentDateISO()
  );
  const [formattedDate, setFormattedDate] = useState<string>(() =>
    DateService.getFormattedCurrentDate()
  );
  const [currentYear, setCurrentYear] = useState<string>(() =>
    DateService.getCurrentYear()
  );
  const [currentTerm, setCurrentTerm] = useState<'Term 1' | 'Term 2' | 'Term 3'>(() =>
    DateService.getCurrentTerm()
  );

  useEffect(() => {
    let midnightTimer: ReturnType<typeof setTimeout>;

    const updateAll = () => {
      setCurrentDateISO(DateService.getCurrentDateISO());
      setFormattedDate(DateService.getFormattedCurrentDate());
      setCurrentYear(DateService.getCurrentYear());
      setCurrentTerm(DateService.getCurrentTerm());
    };

    const scheduleMidnightUpdate = () => {
      const ms = DateService.getMsUntilNextMidnight();
      midnightTimer = setTimeout(() => {
        updateAll();
        scheduleMidnightUpdate();
      }, ms);
    };

    scheduleMidnightUpdate();

    const handleDateEvent = () => updateAll();
    window.addEventListener('reberwet_date_changed', handleDateEvent);

    const intervalTimer = setInterval(() => {
      const newISO = DateService.getCurrentDateISO();
      if (newISO !== currentDateISO) {
        updateAll();
      }
    }, 15000);

    return () => {
      clearTimeout(midnightTimer);
      clearInterval(intervalTimer);
      window.removeEventListener('reberwet_date_changed', handleDateEvent);
    };
  }, [currentDateISO]);

  return { currentDateISO, formattedDate, currentYear, currentTerm };
}
