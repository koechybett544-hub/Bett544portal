import React, { useState } from 'react';
import { UserProfile, TeacherAssignment } from '../types';
import { GRADES, SUBJECTS } from '../data/initialData';
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  ShieldCheck,
  Phone,
  Mail,
  Award,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  X,
  Save,
  Lock,
  Search,
  ChevronRight,
  GraduationCap,
  Briefcase,
  Layers,
  Sparkles,
  PhoneCall,
  User,
  MessageSquare,
} from 'lucide-react';

interface TeachersDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  teachers: UserProfile[];
  currentUser: UserProfile;
  onUpdateTeachers: (updated: UserProfile[]) => void;
  onShowSuccessToast: (msg: string) => void;
}

const MAX_TEACHERS = 50;

export const TeachersDetailsModal: React.FC<TeachersDetailsModalProps> = ({
  isOpen,
  onClose,
  teachers,
  currentUser,
  onUpdateTeachers,
  onShowSuccessToast,
}) => {
  const isAdmin = currentUser.role === 'school_admin' || currentUser.role === 'super_admin';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [inspectedTeacher, setInspectedTeacher] = useState<UserProfile | null>(null);

  // Form state for Add/Edit
  const [editingTeacher, setEditingTeacher] = useState<UserProfile | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPrimarySubject, setFormPrimarySubject] = useState('Mathematics');
  const [formDepartment, setFormDepartment] = useState('Pure & Applied Sciences');
  const [formAssignedClass, setFormAssignedClass] = useState('Grade 8');
  const [formDesignation, setFormDesignation] = useState('');
  const [formTsc, setFormTsc] = useState('');
  const [formNationalId, setFormNationalId] = useState('');
  const [formAssignments, setFormAssignments] = useState<TeacherAssignment[]>([]);

  if (!isOpen) return null;

  // Filter registered faculty: Admin accounts shouldn't reflect in teacher's phone!
  const roleFilteredTeachers = teachers.filter((t) => {
    if (!isAdmin) {
      return t.role !== 'school_admin' && t.role !== 'super_admin';
    }
    return true;
  });

  const teacherCount = roleFilteredTeachers.length;
  const isAtCapacity = teacherCount >= MAX_TEACHERS;

  // Filter teachers by query
  const filteredTeachers = roleFilteredTeachers.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      t.name.toLowerCase().includes(q) ||
      (t.primarySubject && t.primarySubject.toLowerCase().includes(q)) ||
      (t.department && t.department.toLowerCase().includes(q)) ||
      (t.assignedClass && t.assignedClass.toLowerCase().includes(q)) ||
      (t.phone && t.phone.includes(q)) ||
      (t.assignments &&
        t.assignments.some(
          (a) => a.subject.toLowerCase().includes(q) || a.grade.toLowerCase().includes(q)
        ))
    );
  });

  const activeTeacher = selectedTeacherId
    ? teachers.find((t) => t.id === selectedTeacherId) || teachers[0]
    : teachers[0];

  const handleOpenAdd = () => {
    if (isAtCapacity) {
      alert(`Capacity reached: A maximum of ${MAX_TEACHERS} teachers are permitted in the school portal.`);
      return;
    }
    setIsAddingNew(true);
    setEditingTeacher(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('+254 ');
    setFormPrimarySubject('Mathematics');
    setFormDepartment('Pure & Applied Sciences');
    setFormAssignedClass('Grade 8');
    setFormDesignation('Teacher of Junior Secondary');
    setFormTsc('TSC/');
    setFormNationalId('');
    setFormAssignments([
      { grade: 'Grade 8', subject: 'Mathematics' },
    ]);
  };

  const handleOpenEdit = (teacher: UserProfile) => {
    // Permission check: Any teacher can edit their own profile; Admin can edit anyone
    const canEdit = isAdmin || teacher.id === currentUser.id;
    if (!canEdit) {
      alert('Only Administrators can edit other teachers. You can edit your own details.');
      return;
    }

    setEditingTeacher(teacher);
    setIsAddingNew(false);
    setFormName(teacher.name);
    setFormEmail(teacher.email);
    setFormPhone(teacher.phone || '+254 ');
    setFormPrimarySubject(teacher.primarySubject || (teacher.assignments?.[0]?.subject || 'Mathematics'));
    setFormDepartment(teacher.department || 'Pure & Applied Sciences');
    setFormAssignedClass(teacher.assignedClass || (teacher.assignments?.[0]?.grade || 'Grade 8'));
    setFormDesignation(teacher.designation || 'Teacher of Junior Secondary');
    setFormTsc(teacher.tscNumber || '');
    setFormNationalId(teacher.nationalId || '');
    setFormAssignments(teacher.assignments ? [...teacher.assignments] : []);
  };

  const handleAddAssignment = () => {
    setFormAssignments((prev) => [...prev, { grade: 'Grade 8', subject: 'Mathematics' }]);
  };

  const handleRemoveAssignment = (idx: number) => {
    setFormAssignments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAssignmentChange = (
    index: number,
    field: 'grade' | 'subject',
    val: string
  ) => {
    setFormAssignments((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Please enter teacher full name.');
      return;
    }

    if (isAddingNew) {
      if (isAtCapacity) {
        alert(`Cannot add: Portal is capped at ${MAX_TEACHERS} teacher accounts.`);
        return;
      }
      const newTeacher: UserProfile = {
        id: `teacher-${Date.now()}`,
        name: formName.trim(),
        email: formEmail.trim().toLowerCase() || `teacher${teachers.length + 1}@reberwet.ac.ke`,
        role: 'teacher',
        phone: formPhone.trim(),
        primarySubject: formPrimarySubject.trim(),
        department: formDepartment,
        assignedClass: formAssignedClass,
        designation: formDesignation.trim(),
        tscNumber: formTsc.trim(),
        nationalId: formNationalId.trim(),
        assignments: formAssignments,
        teachingExperienceYears: 4,
        joiningDate: new Date().toISOString().slice(0, 10),
      };
      const updated = [...teachers, newTeacher];
      onUpdateTeachers(updated);
      setSelectedTeacherId(newTeacher.id);
      setIsAddingNew(false);
      onShowSuccessToast(`Successfully enrolled ${newTeacher.name} to faculty directory.`);
    } else if (editingTeacher) {
      const updated = teachers.map((t) => {
        if (t.id === editingTeacher.id) {
          return {
            ...t,
            name: formName.trim(),
            email: formEmail.trim().toLowerCase(),
            phone: formPhone.trim(),
            primarySubject: formPrimarySubject.trim(),
            department: formDepartment,
            assignedClass: formAssignedClass,
            designation: formDesignation.trim(),
            // Only admins or the owner can update confidential info
            tscNumber: isAdmin ? formTsc.trim() : (t.tscNumber || formTsc.trim()),
            nationalId: isAdmin ? formNationalId.trim() : (t.nationalId || formNationalId.trim()),
            assignments: formAssignments,
          };
        }
        return t;
      });
      onUpdateTeachers(updated);
      setEditingTeacher(null);
      onShowSuccessToast(`Updated faculty details for ${formName}.`);
    }
  };

  const handleDeleteTeacher = (teacher: UserProfile) => {
    if (!isAdmin) {
      alert('Only School Administrators can remove teachers.');
      return;
    }
    if (teachers.length <= 1) {
      alert('Cannot delete the last registered teacher account.');
      return;
    }
    if (confirm(`Are you sure you want to remove ${teacher.name} from the portal? This will free up 1 faculty login seat.`)) {
      const updated = teachers.filter((t) => t.id !== teacher.id);
      onUpdateTeachers(updated);
      if (selectedTeacherId === teacher.id) {
        setSelectedTeacherId(updated[0]?.id || null);
      }
      onShowSuccessToast(`Removed ${teacher.name}. Available seats: ${MAX_TEACHERS - updated.length}`);
    }
  };

  return (
    <div
      id="teachers-details-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5 animate-in fade-in"
    >
      <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#6b1426] via-[#540d1e] to-[#3b0a16] text-white px-6 py-4 flex items-center justify-between border-b border-[#8c1632] shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 border border-white/20 text-sky-200">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Faculty Roster &amp; Teacher Allocations
                </h2>
                <span className="text-[10px] font-extrabold bg-[#3b0a16] text-sky-200 border border-sky-300/40 px-2 py-0.5 rounded-full">
                  {teacherCount}/{MAX_TEACHERS} Staff Seats
                </span>
              </div>
              <p className="text-xs text-sky-100/90">
                Public faculty directory: Name, primary subject, teaching areas, mobile contacts, department &amp; class.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && !isAddingNew && !editingTeacher && (
              <button
                onClick={handleOpenAdd}
                disabled={isAtCapacity}
                className="hidden sm:flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-extrabold px-3 py-1.5 rounded-xl text-xs transition active:scale-95 shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Teacher</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-50/50 dark:bg-stone-950/50">
          {/* Form View: Add or Edit */}
          {(isAddingNew || editingTeacher) ? (
            <form onSubmit={handleSaveTeacher} className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs space-y-4 max-w-3xl mx-auto">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                <h3 className="text-base font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-[#6b1426] dark:text-rose-400" />
                  <span>
                    {isAddingNew
                      ? 'Add New Teacher to Faculty'
                      : editingTeacher?.id === currentUser.id
                      ? 'Edit Your Teacher Profile & Contact'
                      : `Admin Edit: ${editingTeacher?.name}`}
                  </span>
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingTeacher(null);
                  }}
                  className="text-xs font-semibold text-stone-500 hover:text-stone-900 dark:hover:text-stone-200"
                >
                  Cancel
                </button>
              </div>

              {/* Public Editable Fields: Name, Primary Subject, Mobile, Department, Class */}
              <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/60 rounded-2xl p-4 space-y-3">
                <span className="text-[11px] font-black uppercase text-[#6b1426] dark:text-rose-400 tracking-wider block">
                  Public Faculty Information (Visible to Everyone &amp; Editable)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Teacher Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Madam Faith Chepkirui"
                      className="w-full rounded-xl border border-stone-300 dark:border-stone-700 dark:bg-stone-800 p-2.5 text-stone-900 dark:text-stone-100 font-bold focus:border-[#6b1426]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Mobile Number (SMS &amp; Calls) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="+254 721 556 789"
                      className="w-full rounded-xl border border-stone-300 dark:border-stone-700 dark:bg-stone-800 p-2.5 text-stone-900 dark:text-stone-100 font-mono font-bold focus:border-[#6b1426]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Primary Subject *
                    </label>
                    <select
                      value={formPrimarySubject}
                      onChange={(e) => setFormPrimarySubject(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 dark:border-stone-700 dark:bg-stone-800 p-2.5 text-stone-900 dark:text-stone-100 font-bold focus:border-[#6b1426]"
                    >
                      {SUBJECTS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Assigned Class (Grade) *
                    </label>
                    <select
                      value={formAssignedClass}
                      onChange={(e) => setFormAssignedClass(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 dark:border-stone-700 dark:bg-stone-800 p-2.5 text-stone-900 dark:text-stone-100 font-bold focus:border-[#6b1426]"
                    >
                      <option value="Grade 7">Grade 7</option>
                      <option value="Grade 8">Grade 8</option>
                      <option value="Grade 9">Grade 9</option>
                      <option value="All Grades">All Grades (Specialist / Admin)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Assigned Department *
                    </label>
                    <select
                      value={formDepartment}
                      onChange={(e) => setFormDepartment(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 dark:border-stone-700 dark:bg-stone-800 p-2.5 text-stone-900 dark:text-stone-100 font-bold focus:border-[#6b1426]"
                    >
                      <option value="Pure & Applied Sciences">Pure &amp; Applied Sciences</option>
                      <option value="Mathematics & Technical Studies">Mathematics &amp; Technical Studies</option>
                      <option value="Languages & Humanities">Languages &amp; Humanities</option>
                      <option value="Languages & Social Sciences">Languages &amp; Social Sciences</option>
                      <option value="Creative Arts & Sports">Creative Arts &amp; Sports</option>
                      <option value="Administration & Humanities">Administration &amp; Humanities</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Teaching Subjects Allocation */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block font-bold text-stone-800 dark:text-stone-200 text-xs">
                    Assigned Teaching Subjects by Class:
                  </label>
                  <button
                    type="button"
                    onClick={handleAddAssignment}
                    className="text-xs font-bold text-[#6b1426] dark:text-rose-400 hover:underline flex items-center gap-1"
                  >
                    + Add Class Allocation
                  </button>
                </div>

                <div className="space-y-2">
                  {formAssignments.map((asgn, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-stone-50 dark:bg-stone-800/80 p-2 rounded-xl border border-stone-200 dark:border-stone-700">
                      <select
                        value={asgn.grade}
                        onChange={(e) => handleAssignmentChange(idx, 'grade', e.target.value)}
                        className="rounded-lg border border-stone-300 dark:border-stone-700 p-1.5 text-xs font-bold text-stone-800 dark:text-stone-200 bg-white dark:bg-stone-900"
                      >
                        {GRADES.map((g) => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                      </select>

                      <select
                        value={asgn.subject}
                        onChange={(e) => handleAssignmentChange(idx, 'subject', e.target.value)}
                        className="flex-1 rounded-lg border border-stone-300 dark:border-stone-700 p-1.5 text-xs font-semibold text-stone-800 dark:text-stone-200 bg-white dark:bg-stone-900"
                      >
                        {SUBJECTS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => handleRemoveAssignment(idx)}
                        className="p-1 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 rounded"
                        title="Remove allocation"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confidential Staff Fields: Only editable by Admin or by teacher for their own */}
              {(isAdmin || editingTeacher?.id === currentUser.id) && (
                <div className="bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
                    <Lock className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                    <span className="text-[11px] font-black uppercase tracking-wider">
                      Confidential Administrative Record
                    </span>
                    <span className="text-[10px] text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-1.5 py-0.2 rounded font-bold ml-auto">
                      {isAdmin ? 'Admin Access' : 'Your Personal Record'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                        TSC Registration Number
                      </label>
                      <input
                        type="text"
                        value={formTsc}
                        onChange={(e) => setFormTsc(e.target.value)}
                        placeholder="e.g. TSC/812034"
                        className="w-full rounded-xl border border-stone-300 dark:border-stone-700 dark:bg-stone-800 p-2.5 text-stone-900 dark:text-stone-100 font-mono font-bold focus:border-[#6b1426]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                        National ID Number
                      </label>
                      <input
                        type="text"
                        value={formNationalId}
                        onChange={(e) => setFormNationalId(e.target.value)}
                        placeholder="e.g. 30129485"
                        className="w-full rounded-xl border border-stone-300 dark:border-stone-700 dark:bg-stone-800 p-2.5 text-stone-900 dark:text-stone-100 font-mono font-bold focus:border-[#6b1426]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                        Official Designation / Title
                      </label>
                      <input
                        type="text"
                        value={formDesignation}
                        onChange={(e) => setFormDesignation(e.target.value)}
                        placeholder="e.g. Class Teacher (Grade 8) & Senior Languages Mistress"
                        className="w-full rounded-xl border border-stone-300 dark:border-stone-700 dark:bg-stone-800 p-2.5 text-stone-900 dark:text-stone-100 font-semibold focus:border-[#6b1426]"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingTeacher(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#6b1426] hover:bg-[#540d1e] text-white text-xs font-black flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Teacher Information</span>
                </button>
              </div>
            </form>
          ) : (
            /* Main Public Faculty Directory View (Visible to Everyone & Editable) */
            <div className="space-y-4">
              {/* Notice Banner */}
              <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900 rounded-2xl p-3.5 text-xs text-sky-950 dark:text-sky-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-sky-700 dark:text-sky-400 shrink-0" />
                  <div>
                    <span className="font-black text-sky-950 dark:text-sky-100 block">Public Staff Directory:</span>
                    <p className="text-[11px] text-sky-900 dark:text-sky-300">
                      Teachers' names, primary subjects, teaching subjects, mobile contacts, department &amp; assigned classes are visible to all staff and editable. Full administrative details (TSC, National ID) are strictly restricted to administrators or your own profile.
                    </p>
                  </div>
                </div>
                {isAdmin ? (
                  <span className="text-[11px] font-black bg-rose-100 dark:bg-rose-950 text-[#6b1426] dark:text-rose-300 px-2.5 py-1 rounded-xl shrink-0 border border-rose-300 dark:border-rose-800">
                    Administrator Full Access
                  </span>
                ) : (
                  <span className="text-[11px] font-bold bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 px-2.5 py-1 rounded-xl shrink-0 border border-stone-300 dark:border-stone-700">
                    Viewing as: {currentUser.name}
                  </span>
                )}
              </div>

              {/* Search & Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400 dark:text-stone-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by teacher name, subject, class, or phone..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-300 dark:border-stone-700 text-xs font-semibold text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-900 focus:border-[#6b1426] focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <button
                      onClick={handleOpenAdd}
                      disabled={isAtCapacity}
                      className="flex items-center gap-1.5 bg-[#6b1426] hover:bg-[#520e1c] text-white font-extrabold px-3.5 py-2.5 rounded-2xl text-xs shadow-xs transition active:scale-95 disabled:opacity-50"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Add New Teacher</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Teacher Details View (When a teacher is tapped) */}
              {inspectedTeacher ? (
                <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 shadow-sm space-y-5 animate-in fade-in">
                  <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
                    <button
                      type="button"
                      onClick={() => setInspectedTeacher(null)}
                      className="inline-flex items-center gap-1.5 text-xs font-black text-[#6b1426] dark:text-rose-400 hover:underline"
                    >
                      <span>← Back to Faculty List</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {(isAdmin || inspectedTeacher.id === currentUser.id) && (
                        <button
                          type="button"
                          onClick={() => {
                            handleOpenEdit(inspectedTeacher);
                            setInspectedTeacher(null);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-rose-50 dark:hover:bg-rose-950 hover:text-[#6b1426] dark:hover:text-rose-400 text-stone-800 dark:text-stone-200 text-xs font-bold border border-stone-200 dark:border-stone-700 flex items-center gap-1.5 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit Teacher</span>
                        </button>
                      )}
                      {isAdmin && inspectedTeacher.role !== 'super_admin' && (
                        <button
                          type="button"
                          onClick={() => {
                            handleDeleteTeacher(inspectedTeacher);
                            setInspectedTeacher(null);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800 flex items-center gap-1.5 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Profile Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#6b1426] text-white font-black text-xl shadow-xs">
                        {inspectedTeacher.name.charAt(0) || 'T'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-black text-stone-900 dark:text-stone-100">{inspectedTeacher.name}</h3>
                          {inspectedTeacher.role === 'super_admin' && (
                            <span className="text-[10px] font-black bg-[#6b1426] text-white px-2 py-0.5 rounded-md">Head Teacher</span>
                          )}
                          {inspectedTeacher.role === 'school_admin' && (
                            <span className="text-[10px] font-black bg-stone-800 dark:bg-stone-700 text-white px-2 py-0.5 rounded-md">Administrator</span>
                          )}
                          {inspectedTeacher.id === currentUser.id && (
                            <span className="text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded-md">Your Profile</span>
                          )}
                        </div>
                        <p className="text-xs text-stone-600 dark:text-stone-400 font-medium mt-0.5">
                          {inspectedTeacher.designation || 'Teacher of Junior Secondary'} • {inspectedTeacher.department || 'Languages & Humanities'}
                        </p>
                      </div>
                    </div>

                    {/* Quick Contacts */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={`tel:${inspectedTeacher.phone}`}
                        className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </a>
                      <a
                        href={`sms:${inspectedTeacher.phone.replace(/[^\d+]/g, '')}`}
                        className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>SMS</span>
                      </a>
                      {inspectedTeacher.email && (
                        <a
                          href={`mailto:${inspectedTeacher.email}`}
                          className="px-3 py-2 rounded-xl bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200 font-bold text-xs flex items-center gap-1.5 transition"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Email</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Detailed Information Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-rose-50/70 dark:bg-rose-950/30 rounded-2xl border border-rose-100 dark:border-rose-900/60">
                      <span className="text-[10px] font-black text-[#6b1426] dark:text-rose-400 uppercase tracking-wider block">Primary Subject</span>
                      <span className="text-xs font-black text-stone-900 dark:text-stone-100 block mt-1">{inspectedTeacher.primarySubject || 'General'}</span>
                    </div>

                    <div className="p-3 bg-sky-50/70 dark:bg-sky-950/30 rounded-2xl border border-sky-100 dark:border-sky-900/60">
                      <span className="text-[10px] font-black text-sky-900 dark:text-sky-300 uppercase tracking-wider block">Assigned Class</span>
                      <span className="text-xs font-black text-stone-900 dark:text-stone-100 block mt-1">{inspectedTeacher.assignedClass || 'Grade 8'}</span>
                    </div>

                    <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700">
                      <span className="text-[10px] font-black text-stone-500 dark:text-stone-400 uppercase tracking-wider block">Official Mobile</span>
                      <span className="text-xs font-mono font-bold text-stone-900 dark:text-stone-100 block mt-1">{inspectedTeacher.phone || 'N/A'}</span>
                    </div>

                    <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700">
                      <span className="text-[10px] font-black text-stone-500 dark:text-stone-400 uppercase tracking-wider block">Staff Email</span>
                      <span className="text-xs font-mono font-medium text-stone-900 dark:text-stone-100 block mt-1 truncate">{inspectedTeacher.email || 'N/A'}</span>
                    </div>

                    <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700">
                      <span className="text-[10px] font-black text-stone-500 dark:text-stone-400 uppercase tracking-wider block">Department</span>
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block mt-1">{inspectedTeacher.department || 'Junior Secondary'}</span>
                    </div>

                    <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700">
                      <span className="text-[10px] font-black text-stone-500 dark:text-stone-400 uppercase tracking-wider block">Experience &amp; Joining</span>
                      <span className="text-xs font-medium text-stone-900 dark:text-stone-100 block mt-1">
                        {inspectedTeacher.teachingExperienceYears || 5} Years exp • Joined {inspectedTeacher.joiningDate || '2022'}
                      </span>
                    </div>
                  </div>

                  {/* Teaching Allocations Table */}
                  <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2 text-xs">
                    <span className="font-black text-stone-900 dark:text-stone-100 text-xs block">Subject &amp; Grade Allocations:</span>
                    {inspectedTeacher.assignments && inspectedTeacher.assignments.length > 0 ? (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {inspectedTeacher.assignments.map((a, i) => (
                          <div key={i} className="px-3 py-1.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-2xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                            <span className="bg-[#6b1426] text-white text-[10px] px-1.5 py-0.2 rounded font-black">{a.grade}</span>
                            <span>{a.subject}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-stone-500 dark:text-stone-400 text-xs">No explicit subject assignments recorded.</p>
                    )}
                  </div>

                  {/* Confidential Records */}
                  {(isAdmin || inspectedTeacher.id === currentUser.id) && (
                    <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl space-y-1.5 text-xs">
                      <div className="flex items-center gap-1.5 font-black text-amber-900 dark:text-amber-300">
                        <Lock className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                        <span>Confidential Administrative Records</span>
                        <span className="text-[9px] bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 px-1.5 py-0.2 rounded font-mono ml-auto">
                          {isAdmin ? 'Admin View' : 'Personal Record'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-1 text-stone-800 dark:text-stone-200 font-mono">
                        <div>TSC Number: <strong>{inspectedTeacher.tscNumber || 'TSC/REG'}</strong></div>
                        <div>National ID: <strong>{inspectedTeacher.nationalId || 'ID/RECORD'}</strong></div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Compact Interactive List View (No Large Boxes) */
                <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
                  <div className="p-3 sm:p-4 bg-stone-100/70 dark:bg-stone-800/80 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between text-xs font-black text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                    <span>Faculty Member &amp; Subject</span>
                    <span className="hidden sm:inline">Class &amp; Contact</span>
                    <span>Action</span>
                  </div>

                  <div className="divide-y divide-stone-100 dark:divide-stone-800">
                    {filteredTeachers.map((teacher) => {
                      const isCurrent = teacher.id === currentUser.id;
                      const primarySubj = teacher.primarySubject || (teacher.assignments?.[0]?.subject || 'General');
                      const assignedClass = teacher.assignedClass || (teacher.assignments?.[0]?.grade || 'Grade 8');

                      return (
                        <div
                          key={teacher.id}
                          onClick={() => setInspectedTeacher(teacher)}
                          className={`p-3 sm:p-4 flex items-center justify-between gap-3 hover:bg-rose-50/40 dark:hover:bg-rose-950/20 cursor-pointer transition active:bg-rose-50 dark:active:bg-rose-950/40 ${
                            isCurrent ? 'bg-rose-50/30 dark:bg-rose-950/30' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950 text-[#6b1426] dark:text-rose-300 font-black text-sm border border-rose-200 dark:border-rose-900">
                              {teacher.name.charAt(0) || 'T'}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-black text-stone-900 dark:text-stone-100 text-xs sm:text-sm truncate">
                                  {teacher.name}
                                </span>
                                {teacher.role === 'super_admin' && (
                                  <span className="text-[9px] font-black bg-[#6b1426] text-white px-1.5 py-0.2 rounded">
                                    Head Teacher
                                  </span>
                                )}
                                {teacher.role === 'school_admin' && (
                                  <span className="text-[9px] font-black bg-stone-800 dark:bg-stone-700 text-white px-1.5 py-0.2 rounded">
                                    Admin
                                  </span>
                                )}
                                {isCurrent && (
                                  <span className="text-[9px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 px-1.5 py-0.2 rounded">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 flex-wrap">
                                <span className="font-semibold text-[#6b1426] dark:text-rose-400">{primarySubj}</span>
                                <span>•</span>
                                <span className="text-stone-600 dark:text-stone-300 truncate">{teacher.designation || 'Subject Teacher'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="hidden sm:flex items-center gap-3 text-xs shrink-0">
                            <span className="px-2 py-0.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-900 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-bold text-[11px]">
                              {assignedClass}
                            </span>
                            <span className="font-mono text-stone-600 dark:text-stone-400 font-medium text-[11px]">
                              {teacher.phone}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setInspectedTeacher(teacher);
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-[#6b1426] dark:hover:bg-rose-700 hover:text-white text-stone-700 dark:text-stone-300 text-xs font-bold flex items-center gap-1 transition shadow-2xs"
                            >
                              <span>View Details</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-100 dark:bg-stone-900 px-6 py-3.5 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
            <GraduationCap className="w-4 h-4 text-[#6b1426] dark:text-rose-400" />
            <span className="font-bold text-stone-800 dark:text-stone-200">Reberwet Junior Secondary School Official Faculty Register</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-extrabold hover:bg-stone-800 dark:hover:bg-white transition active:scale-95 text-xs shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
