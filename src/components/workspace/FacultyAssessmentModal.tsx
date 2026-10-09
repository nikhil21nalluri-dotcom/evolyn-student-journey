import React, { useState } from 'react';
import {
  Sparkles,
  Award,
  BookOpen,
  CheckCircle2,
  X,
  Target,
  FileCheck,
  AlertCircle,
  Clock,
  User,
} from 'lucide-react';
import { UNIFIED_STUDENTS } from '../../data/unifiedStudentData';
import { STUDENT_GROWTH_DATA } from '../../data/studentGrowthData';

interface FacultyAssessmentModalProps {
  initialStudentId?: string;
  onClose: () => void;
  onSubmit: (params: {
    studentId: string;
    category: 'communication' | 'technical' | 'career-placement';
    assessmentType: string;
    score: number;
    maxScore: number;
    assessor: string;
    notes: string;
    verified: boolean;
  }) => void;
}

export const FacultyAssessmentModal: React.FC<FacultyAssessmentModalProps> = ({
  initialStudentId,
  onClose,
  onSubmit,
}) => {
  const today = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedToday = `${months[today.getMonth()]} ${today.getDate().toString().padStart(2, '0')}, ${today.getFullYear()}`;

  const [studentId, setStudentId] = useState(initialStudentId || STUDENT_GROWTH_DATA[0].id);
  const [category, setCategory] = useState<'communication' | 'technical' | 'career-placement'>('communication');
  const [assessmentType, setAssessmentType] = useState('Fluencis Speaking & Impromptu Articulation');
  const [score, setScore] = useState(78);
  const [maxScore, setMaxScore] = useState(100);
  const [assessmentDate, setAssessmentDate] = useState(formattedToday);
  const [assessor, setAssessor] = useState('Faculty Advisor');
  const [notes, setNotes] = useState('');
  const [verified, setVerified] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Suggested assessment titles per category
  const suggestedTypes: Record<string, string[]> = {
    communication: [
      'Fluencis Speaking & Impromptu Articulation',
      'Technical Presentation & Keynote Delivery',
      'Group Discussion & Collaborative Debate',
      'Mock Behavioral / HR Interview Communication',
    ],
    technical: [
      'Data Structures & Algorithmic Problem Solving',
      'System Architecture & Core CS Benchmarks',
      'Hands-on Lab Coding Assessment',
      'Full-Stack Project Implementation Review',
    ],
    'career-placement': [
      'Campus Mock Placement Panel Review',
      'Quantitative & Logical Aptitude Test',
      'Coding Interview Readiness Assessment',
      'Resume & Portfolio Evaluation',
    ],
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent duplicate rapid clicks
    setErrorMessage(null);

    if (!assessmentType.trim()) {
      setErrorMessage('Please specify an assessment name.');
      return;
    }

    if (Number(score) < 0 || Number(score) > Number(maxScore)) {
      setErrorMessage(`Score must be between 0 and maximum score (${maxScore}).`);
      return;
    }

    setIsSubmitting(true);
    onSubmit({
      studentId,
      category,
      assessmentType: assessmentType.trim(),
      score: Number(score),
      maxScore: Number(maxScore),
      assessor: assessor.trim() || 'Faculty Advisor',
      notes: notes.trim(),
      verified,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#090d29] border border-[#ff6a2b]/40 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#0c123b] border-b border-white/10 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ff6a2b]/20 border border-[#ff6a2b]/40 flex items-center justify-center text-[#ff6a2b]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ff6a2b]/15 text-[#ffb27a] border border-[#ff6a2b]/30 text-[10px] font-mono font-bold">
                <span>FACULTY RECORDING CONSOLE</span>
              </div>
              <h3 className="font-baskerville text-lg sm:text-xl font-bold text-white mt-1">
                Record Student Assessment Result
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#a4a9d0] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs text-[#cbd5e1] flex-1">
          {/* Student Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-white block">
              Target Student
            </label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#05071a] border border-white/15 text-white focus:outline-none focus:border-[#ff6a2b]"
            >
              {STUDENT_GROWTH_DATA.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#090d29]">
                  {s.name} ({s.studentId} • {s.branch})
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-white block">
              Assessment Domain
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setCategory('communication');
                  setAssessmentType(suggestedTypes['communication'][0]);
                }}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  category === 'communication'
                    ? 'bg-[#2dd4bf]/20 border-[#2dd4bf] text-white font-bold'
                    : 'bg-[#05071a] border-white/10 text-[#a4a9d0]'
                }`}
              >
                🎤 Communication
              </button>
              <button
                type="button"
                onClick={() => {
                  setCategory('technical');
                  setAssessmentType(suggestedTypes['technical'][0]);
                }}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  category === 'technical'
                    ? 'bg-[#60a5fa]/20 border-[#60a5fa] text-white font-bold'
                    : 'bg-[#05071a] border-white/10 text-[#a4a9d0]'
                }`}
              >
                💻 Technical Skills
              </button>
              <button
                type="button"
                onClick={() => {
                  setCategory('career-placement');
                  setAssessmentType(suggestedTypes['career-placement'][0]);
                }}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  category === 'career-placement'
                    ? 'bg-[#a855f7]/20 border-[#a855f7] text-white font-bold'
                    : 'bg-[#05071a] border-white/10 text-[#a4a9d0]'
                }`}
              >
                💼 Career / Placement
              </button>
            </div>
          </div>

          {/* Assessment Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-white block">
              Assessment Name / Module
            </label>
            <input
              type="text"
              value={assessmentType}
              onChange={(e) => setAssessmentType(e.target.value)}
              list="assessment-suggestions"
              className="w-full p-2.5 rounded-xl bg-[#05071a] border border-white/15 text-white focus:outline-none focus:border-[#ff6a2b]"
              placeholder="e.g. Fluencis Speaking & Impromptu Articulation"
            />
            <datalist id="assessment-suggestions">
              {(suggestedTypes[category] || []).map((t, i) => (
                <option key={i} value={t} />
              ))}
            </datalist>
          </div>

          {/* Score & Max Score */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-white block">
                Recorded Score
              </label>
              <input
                type="number"
                min="0"
                max={maxScore}
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-[#05071a] border border-white/15 text-white font-mono font-bold focus:outline-none focus:border-[#ff6a2b]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-white block">
                Maximum Score Benchmark
              </label>
              <input
                type="number"
                min="10"
                max="1000"
                value={maxScore}
                onChange={(e) => setMaxScore(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-[#05071a] border border-white/15 text-white font-mono focus:outline-none focus:border-[#ff6a2b]"
              />
            </div>
          </div>

          {/* Date & Assessor Name */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-white block">
                Assessment Date
              </label>
              <input
                type="text"
                value={assessmentDate}
                onChange={(e) => setAssessmentDate(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#05071a] border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-[#ff6a2b]"
                placeholder="Oct 08, 2026"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-white block">
                Assessor / Evaluator Name
              </label>
              <input
                type="text"
                value={assessor}
                onChange={(e) => setAssessor(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#05071a] border border-white/15 text-white focus:outline-none focus:border-[#ff6a2b]"
                placeholder="Prof. Elena Vance"
              />
            </div>
          </div>

          {/* Validation Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-300 font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Qualitative Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-white block">
              Qualitative Observations & Feedback (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Detailed feedback regarding vocal confidence, coding algorithmic efficiency, or placement readiness..."
              className="w-full p-2.5 rounded-xl bg-[#05071a] border border-white/15 text-white focus:outline-none focus:border-[#ff6a2b] resize-none"
            />
          </div>

          {/* Verified Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={verified}
              onChange={(e) => setVerified(e.target.checked)}
              className="rounded text-[#ff6a2b] focus:ring-0"
            />
            <span className="text-xs text-[#a4a9d0]">
              Mark as verified institutional assessment (Synchronized with student intelligence records)
            </span>
          </label>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-[#a4a9d0] hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#ff6a2b] hover:bg-[#ff8a50] text-white font-bold text-xs shadow-md shadow-[#ff6a2b]/30 transition-all cursor-pointer"
            >
              Record Assessment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
