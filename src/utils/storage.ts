import {
  Learner,
  MarkEntry,
  Announcement,
  CalendarEvent,
  SchoolDocument,
  AuditLog,
  TeacherActivity,
  UserProfile,
  TimetableData,
} from '../types';
import { getTimetableFromStorage, saveTimetableToStorage } from './timetableService';
import {
  INITIAL_LEARNERS,
  INITIAL_MARKS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_CALENDAR_EVENTS,
  INITIAL_DOCUMENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_TEACHER_ACTIVITIES,
  DEFAULT_USERS,
} from '../data/initialData';

const STORAGE_KEYS = {
  CURRENT_USER: 'reberwet_current_user_v3',
  TEACHERS: 'reberwet_teachers_v3',
  LEARNERS: 'reberwet_learners_v3',
  MARKS: 'reberwet_marks_v3',
  ANNOUNCEMENTS: 'reberwet_announcements_v3',
  CALENDAR: 'reberwet_calendar_v3',
  DOCUMENTS: 'reberwet_documents_v3',
  AUDIT_LOGS: 'reberwet_audit_logs_v3',
  TEACHER_ACTIVITIES: 'reberwet_teacher_activities_v3',
  LAST_SELECTION: 'reberwet_teacher_last_selection_v3',
  ONBOARDING_SEEN: 'reberwet_teacher_onboarding_seen_v3',
  FIRST_MARKS_HELP_SEEN: 'reberwet_first_marks_help_seen_v3',
  TIMETABLE: 'reberwet_timetable_v1',
};

export interface TeacherLastSelection {
  grade: string;
  stream?: string;
  subject: string;
  term: 'Term 1' | 'Term 2' | 'Term 3';
  academicYear: string;
}

export const StorageService = {
  // Teachers
  getTeachers(): UserProfile[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TEACHERS);
      if (saved) {
        const parsed: UserProfile[] = JSON.parse(saved);
        // Ensure Mr John Koech is assigned Creative Arts and Sports
        const koech = parsed.find(
          (t) => t.name.toLowerCase().includes('koech') || t.id === 'user-super-1'
        );
        if (
          koech &&
          (!koech.assignments ||
            koech.assignments.length === 0 ||
            !koech.assignments.some((a) =>
              a.subject.toLowerCase().includes('creative') ||
              a.subject.toLowerCase().includes('art') ||
              a.subject.toLowerCase().includes('sport')
            ))
        ) {
          koech.primarySubject = 'Creative Arts and Sports';
          koech.assignments = [
            { grade: 'Grade 7', subject: 'Creative Arts and Sports' },
            { grade: 'Grade 8', subject: 'Creative Arts and Sports' },
            { grade: 'Grade 9', subject: 'Creative Arts and Sports' },
          ];
          this.saveTeachers(parsed);
        }

        // Ensure Madam Nelly Korir is assigned CRE (Christian Religious Education)
        const nelly = parsed.find(
          (t) => t.name.toLowerCase().includes('nelly') || t.id === 'user-teacher-7'
        );
        if (nelly) {
          const hasCre = nelly.assignments?.some(
            (a) => a.subject.toLowerCase() === 'cre' || a.subject.toLowerCase().includes('religious')
          );
          if (!hasCre) {
            nelly.assignments = [
              ...(nelly.assignments || []),
              { grade: 'Grade 7', subject: 'CRE' },
              { grade: 'Grade 8', subject: 'CRE' },
              { grade: 'Grade 9', subject: 'CRE' },
            ];
            this.saveTeachers(parsed);
          }
        }

        // Ensure Madam Faith Chepkirui does NOT teach CRE
        const faith = parsed.find(
          (t) => t.name.toLowerCase().includes('faith') || t.id === 'user-teacher-8'
        );
        if (faith && faith.assignments) {
          const filtered = faith.assignments.filter(
            (a) => !a.subject.toLowerCase().includes('cre') && !a.subject.toLowerCase().includes('religious')
          );
          if (filtered.length !== faith.assignments.length) {
            faith.assignments = filtered;
            this.saveTeachers(parsed);
          }
        }

        return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_USERS;
  },

  saveTeachers(teachers: UserProfile[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
    } catch {
      // ignore
    }
  },

  // Current user - Returns null if not logged in on this device (prompts for registration / sign in)
  getCurrentUser(): UserProfile | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  },

  setCurrentUser(user: UserProfile | null) {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
    } catch {
      // ignore
    }
  },

  saveCurrentUser(user: UserProfile | null) {
    this.setCurrentUser(user);
  },

  clearCurrentUser() {
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } catch {
      // ignore
    }
  },

  // Last selection for marks
  getLastSelection(): TeacherLastSelection {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LAST_SELECTION);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      grade: 'Grade 8',
      stream: '',
      subject: 'Mathematics',
      term: 'Term 3',
      academicYear: '2026',
    };
  },

  saveLastSelection(selection: TeacherLastSelection) {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_SELECTION, JSON.stringify(selection));
    } catch {
      // ignore
    }
  },

  // Learners
  getLearners(): Learner[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LEARNERS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_LEARNERS;
  },

  saveLearners(learners: Learner[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.LEARNERS, JSON.stringify(learners));
    } catch {
      // ignore
    }
  },

  // Marks
  getMarks(): MarkEntry[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MARKS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_MARKS;
  },

  saveMarks(marks: MarkEntry[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.MARKS, JSON.stringify(marks));
    } catch {
      // ignore
    }
  },

  // Announcements
  getAnnouncements(): Announcement[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_ANNOUNCEMENTS;
  },

  saveAnnouncements(announcements: Announcement[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
    } catch {
      // ignore
    }
  },

  // Calendar
  getCalendar(): CalendarEvent[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CALENDAR);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_CALENDAR_EVENTS;
  },

  saveCalendar(events: CalendarEvent[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.CALENDAR, JSON.stringify(events));
    } catch {
      // ignore
    }
  },

  // Documents
  getDocuments(): SchoolDocument[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_DOCUMENTS;
  },

  saveDocuments(docs: SchoolDocument[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
    } catch {
      // ignore
    }
  },

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_AUDIT_LOGS;
  },

  addAuditLog(entry: Omit<AuditLog, 'id' | 'date' | 'time'>): AuditLog[] {
    const current = this.getAuditLogs();
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newLog: AuditLog = {
      id: `audit-${Date.now()}`,
      date,
      time,
      ...entry,
    };
    const updated = [newLog, ...current];
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return updated;
  },

  // Teacher activities
  getTeacherActivities(): TeacherActivity[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TEACHER_ACTIVITIES);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_TEACHER_ACTIVITIES;
  },

  addTeacherActivity(action: string, category: TeacherActivity['category']) {
    const current = this.getTeacherActivities();
    const newAct: TeacherActivity = {
      id: `act-${Date.now()}`,
      action,
      time: 'Just now',
      category,
    };
    const updated = [newAct, ...current.slice(0, 7)];
    try {
      localStorage.setItem(STORAGE_KEYS.TEACHER_ACTIVITIES, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return updated;
  },

  // Onboarding status
  hasSeenOnboarding(): boolean {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDING_SEEN) === 'true';
  },

  setOnboardingSeen() {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_SEEN, 'true');
  },

  // First marks help banner status
  hasSeenFirstMarksHelp(): boolean {
    return localStorage.getItem(STORAGE_KEYS.FIRST_MARKS_HELP_SEEN) === 'true';
  },

  setFirstMarksHelpSeen() {
    localStorage.setItem(STORAGE_KEYS.FIRST_MARKS_HELP_SEEN, 'true');
  },

  // Convenience Aliases & Helpers
  getEvents(): CalendarEvent[] {
    return this.getCalendar();
  },

  getActivities(): TeacherActivity[] {
    return this.getTeacherActivities();
  },

  addActivity(activity: TeacherActivity) {
    const current = this.getTeacherActivities();
    const updated = [activity, ...current.slice(0, 9)];
    try {
      localStorage.setItem(STORAGE_KEYS.TEACHER_ACTIVITIES, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return updated;
  },

  saveLearner(learner: Learner) {
    const current = this.getLearners();
    const index = current.findIndex((l) => l.id === learner.id);
    let updated: Learner[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = learner;
    } else {
      updated = [...current, learner];
    }
    this.saveLearners(updated);
  },

  updateLearner(learner: Learner) {
    this.saveLearner(learner);
  },

  updateLearnerComments(learnerId: string, generalComment: string, classTeacherComment: string) {
    const current = this.getLearners();
    const updated = current.map((l) => {
      if (l.id === learnerId) {
        return {
          ...l,
          comments: {
            generalComment,
            classTeacherComment,
            updatedAt: new Date().toISOString(),
          },
        };
      }
      return l;
    });
    this.saveLearners(updated);
  },

  addAnnouncement(ann: Announcement) {
    const current = this.getAnnouncements();
    const updated = [ann, ...current];
    this.saveAnnouncements(updated);
  },

  addDocument(doc: SchoolDocument) {
    const current = this.getDocuments();
    const updated = [doc, ...current];
    this.saveDocuments(updated);
  },

  // Timetable
  getTimetable(teachers: UserProfile[]): TimetableData {
    return getTimetableFromStorage(teachers);
  },

  saveTimetable(data: TimetableData) {
    saveTimetableToStorage(data);
  },

  // 100% Offline Pre-population: Ensures all data is cached locally in device memory so app works in airplane mode
  primeAllDataForOffline(teachers: UserProfile[]) {
    try {
      if (!localStorage.getItem(STORAGE_KEYS.TEACHERS)) {
        this.saveTeachers(teachers && teachers.length > 0 ? teachers : DEFAULT_USERS);
      }
      if (!localStorage.getItem(STORAGE_KEYS.LEARNERS)) {
        this.saveLearners(INITIAL_LEARNERS);
      }
      if (!localStorage.getItem(STORAGE_KEYS.MARKS)) {
        this.saveMarks(INITIAL_MARKS);
      }
      if (!localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)) {
        this.saveAnnouncements(INITIAL_ANNOUNCEMENTS);
      }
      if (!localStorage.getItem(STORAGE_KEYS.CALENDAR)) {
        localStorage.setItem(STORAGE_KEYS.CALENDAR, JSON.stringify(INITIAL_CALENDAR_EVENTS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.DOCUMENTS)) {
        this.saveDocuments(INITIAL_DOCUMENTS);
      }
      if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
        localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.TEACHER_ACTIVITIES)) {
        localStorage.setItem(STORAGE_KEYS.TEACHER_ACTIVITIES, JSON.stringify(INITIAL_TEACHER_ACTIVITIES));
      }
      // Ensure timetable is pre-calculated and cached
      this.getTimetable(teachers);
    } catch {
      // ignore
    }
  },

  // Reset to default data
  resetAll() {
    localStorage.clear();
  },
};
