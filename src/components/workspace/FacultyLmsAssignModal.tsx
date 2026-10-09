import React, { useState } from 'react';
import { X, BookOpen, PlusCircle, CheckCircle2, Calendar, Award, FileText, Sparkles } from 'lucide-react';
import { useLms } from '../../context/LmsContext';
import { STUDENT_GROWTH_DATA } from '../../data/studentGrowthData';
import { LmsAssignment } from '../../data/lmsMessagingData';

interface FacultyLmsAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetStudentId?: string;
}

export const FacultyLmsAssignModal: React.FC<FacultyLmsAssignModalProps> = ({
  isOpen,
  onClose,
  targetStudentId,
}) => {
  const { assignWork } = useLms();

  const [selectedStudentId, setSelectedStudentId] = useState(
    targetStudentId || STUDENT_GROWTH_DATA[0].id
  );
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('CS201 Data Structures & Algorithms');
  const [category, setCategory] = useState<LmsAssignment['category']>('Personalized Practice');
  const [description, setDescription] = useState('');
  const [personalCareNote, setPersonalCareNote] = useState('');
  const [dueDate, setDueDate] = useState('Next Monday, 11:59 PM');
  const [points, setPoints] = useState<number>(50);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (targetStudentId) {
      setSelectedStudentId(targetStudentId);
    }
  }, [targetStudentId]);

  if (!isOpen) return null;

  const currentStudent =
    STUDENT_GROWTH_DATA.find((s) => s.id === selectedStudentId) || STUDENT_GROWTH_DATA[0];

  const presets = [
    {
      title: 'Practice: Dynamic Programming State Transitions',
      course: 'CS201 Data Structures & Algorithms',
      category: 'Personalized Practice' as const,
      points: 40,
      dueDate: 'Friday at 06:00 PM',
      description: 'Implement memoized solutions for the 0/1 Knapsack and Subset Sum problems. Verify with test inputs.',
      careNote: `Hey ${currentStudent.name}, focus on drawing the 2D recurrence table first. Don't worry about space optimization until your subproblems are clear!`,
    },
    {
      title: 'Remedial Concept Module: Pointers & Memory Management in C++',
      course: 'CS102 Systems Programming',
      category: 'Remedial Concept Module' as const,
      points: 30,
      dueDate: 'This Sunday at 11:59 PM',
      description: 'Step-by-step memory visualization exercises on stack vs heap allocations and avoiding dangling pointers.',
      careNote: `${currentStudent.name}, remember that pointer arithmetic is just address addition. Take this at your own pace!`,
    },
    {
      title: 'Mock Placement Sprint: Top 15 Tree & Graph Interview Challenges',
      course: 'CS-CAREER Placement Accelerator',
      category: 'Placement Mock Prep' as const,
      points: 50,
      dueDate: 'Next Wednesday, 05:00 PM',
      description: 'Complete 3 BFS/DFS traversal problems with time and space complexity explanations on the campus LMS portal.',
      careNote: `Your technical foundations are solid, ${currentStudent.name}! This practice will help build your problem-solving speed for campus drives.`,
    },
    {
      title: 'Project Milestone: Microservice API Schema & Health Check',
      course: 'CS308 Cloud & Web Architectures',
      category: 'Coursework Assignment' as const,
      points: 60,
      dueDate: 'Next Friday, 11:59 PM',
      description: 'Build a Dockerized REST endpoint with OpenAPI/Swagger docs and basic unit tests.',
      careNote: `${currentStudent.name}, keep the payload schemas clean and concise. Feel free to use Express or FastAPI!`,
    },
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setTitle(p.title);
    setCourse(p.course);
    setCategory(p.category);
    setPoints(p.points);
    setDueDate(p.dueDate);
    setDescription(p.description);
    setPersonalCareNote(p.careNote);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    assignWork({
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      title: title.trim(),
      course: course.trim(),
      category,
      description: description.trim(),
      personalCareNote: personalCareNote.trim(),
      dueDate: dueDate.trim(),
      points,
    });

    setToastMessage(`Assigned "${title}" directly to ${currentStudent.name}!`);
    setTitle('');
    setDescription('');
    setPersonalCareNote('');

    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[#0b0f2a] border border-[#2b3368] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1c224a] bg-[#0e1335]/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6f8dff] to-[#3b82f6] flex items-center justify-center text-white shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-baskerville text-lg sm:text-xl font-bold text-white">
                  Assign Personalized Work & LMS Tasks
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#6f8dff]/20 border border-[#6f8dff]/30 text-[10px] font-mono text-[#a4b8ff]">
                  Faculty LMS Feature
                </span>
              </div>
              <p className="text-xs text-[#9aa2d4]">
                Deliver tailored assignments, remedial exercises, or placement practice with personal caring notes.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#9aa2d4] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/40 px-5 py-2.5 flex items-center space-x-2 text-xs text-emerald-300 font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Target Student Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#06081c] border border-[#1f2552]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#182054] to-[#0c1033] border border-[#303a7d] flex items-center justify-center font-bold text-xs text-[#6f8dff] font-mono">
                {currentStudent.avatarInitials}
              </div>
              <div>
                <div className="text-xs text-[#8e96c8] font-mono uppercase">Assigning To Student</div>
                <div className="text-sm font-bold text-white font-serif">{currentStudent.name}</div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-[#8e96c8]">Assign to:</span>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="bg-[#0e1335] border border-[#232854] text-xs text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#6f8dff]"
              >
                {STUDENT_GROWTH_DATA.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.branch} - {s.studentId})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#c2c8f0] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#6f8dff]" />
                <span>Quick Personalized Assignment Presets</span>
              </span>
              <span className="text-[10px] text-[#767ea8] font-mono">Click to autofill</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="text-left p-2.5 rounded-xl bg-[#0e1335]/70 hover:bg-[#151c4a] border border-[#1f2552] hover:border-[#6f8dff]/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-white group-hover:text-[#6f8dff]">
                    <span>{p.category}</span>
                    <span className="font-mono text-[10px] text-[#8e96c8]">{p.points} pts</span>
                  </div>
                  <div className="text-[11px] text-[#c2c8f0] line-clamp-1 mt-0.5">{p.title}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-[#8e96c8] uppercase mb-1">
                  Assignment Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Personalized Practice: Graph Cycle Detection"
                  className="w-full bg-[#06081c] border border-[#1f2552] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#6f8dff]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#8e96c8] uppercase mb-1">
                  Course
                </label>
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full bg-[#06081c] border border-[#1f2552] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#6f8dff]"
                >
                  <option value="CS201 Data Structures & Algorithms">CS201 Data Structures & Algorithms</option>
                  <option value="CS402 Distributed Systems">CS402 Distributed Systems</option>
                  <option value="CS304 Operating Systems">CS304 Operating Systems</option>
                  <option value="CS410 Machine Learning & NLP">CS410 Machine Learning & NLP</option>
                  <option value="CS205 Database Systems">CS205 Database Systems</option>
                  <option value="CS-CAREER Career & Placement Accelerator">CS-CAREER Placement Accelerator</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-[#8e96c8] uppercase mb-1">
                  Work Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-[#06081c] border border-[#1f2552] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#6f8dff]"
                >
                  <option value="Personalized Practice">Personalized Practice</option>
                  <option value="Coursework Assignment">Coursework Assignment</option>
                  <option value="Remedial Concept Module">Remedial Concept Module</option>
                  <option value="Placement Mock Prep">Placement Mock Prep</option>
                  <option value="Reflective Milestone">Reflective Milestone</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#8e96c8] uppercase mb-1">
                  Due Date
                </label>
                <input
                  type="text"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  placeholder="e.g. Next Monday, 11:59 PM"
                  className="w-full bg-[#06081c] border border-[#1f2552] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#6f8dff]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#8e96c8] uppercase mb-1">
                  Point Value
                </label>
                <input
                  type="number"
                  value={points}
                  onChange={(e) => setPoints(Number(e.target.value))}
                  min={5}
                  max={200}
                  className="w-full bg-[#06081c] border border-[#1f2552] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#6f8dff]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#8e96c8] uppercase mb-1">
                Description & Instructions
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Specific guidance, problem statements, or references..."
                className="w-full bg-[#06081c] border border-[#1f2552] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#6f8dff]"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#8e96c8] uppercase mb-1 flex items-center justify-between">
                <span>Personal Caring Note (Visible exclusively to {currentStudent.name})</span>
                <span className="text-[#ff8a50] lowercase">personal encouragement</span>
              </label>
              <input
                type="text"
                value={personalCareNote}
                onChange={(e) => setPersonalCareNote(e.target.value)}
                placeholder={`e.g. ${currentStudent.name}, take your time on this. Ask me if you need any hints!`}
                className="w-full bg-[#06081c] border border-[#ff6a2b]/30 rounded-xl px-3 py-2 text-xs text-white placeholder-[#5a6296] focus:outline-none focus:border-[#ff6a2b]"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-[#a4a9d0] transition-colors"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#6f8dff] to-[#3b82f6] hover:opacity-95 text-white text-xs font-semibold shadow-lg shadow-[#6f8dff]/25 flex items-center space-x-2 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Assign to {currentStudent.name}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
