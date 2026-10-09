import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, Sparkles, Send } from 'lucide-react';

interface LiveDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DemoStudent {
  id: string;
  name: string;
  yearMajor: string;
  gpa: string;
  healthScore: number;
  status: 'Critical Attention' | 'Early Drift' | 'Mastery Trajectory';
  statusColor: string;
  signals: { name: string; score: number; trend: string }[];
  diagnosis: string;
  recommendedAction: string;
}

const STUDENTS: DemoStudent[] = [
  {
    id: 'elena',
    name: 'Elena Vance',
    yearMajor: 'Sophomore · Computer Science',
    gpa: '3.42 (Appears Strong)',
    healthScore: 61,
    status: 'Early Drift',
    statusColor: 'text-amber-400 border-amber-500/30 bg-amber-950/20',
    signals: [
      { name: 'Summative Grades', score: 82, trend: 'Flat' },
      { name: 'Lecture Attendance', score: 68, trend: '-16%' },
      { name: 'Assignment Cadence', score: 71, trend: 'Late' },
      { name: 'LMS Engagement', score: 54, trend: '-28%' },
      { name: 'Peer Forum Activity', score: 40, trend: 'Silent' },
    ],
    diagnosis: 'Quiet disengagement pattern detected. Student maintains exam cramming habits but has completely severed peer collaborative touchpoints.',
    recommendedAction: 'Schedule a casual 1-on-1 advisor coffee chat to discuss study group pairing and sophomore workload balance before Midterm 2.',
  },
  {
    id: 'marcus',
    name: 'Marcus Chen',
    yearMajor: 'Freshman · Electrical Engineering',
    gpa: '3.15 (Borderline)',
    healthScore: 48,
    status: 'Critical Attention',
    statusColor: 'text-rose-400 border-rose-500/30 bg-rose-950/20',
    signals: [
      { name: 'Summative Grades', score: 74, trend: '-8%' },
      { name: 'Lecture Attendance', score: 95, trend: '100%' },
      { name: 'Assignment Cadence', score: 58, trend: '-35%' },
      { name: 'LMS Engagement', score: 88, trend: 'High' },
      { name: 'Peer Forum Activity', score: 70, trend: 'Seeking Help' },
    ],
    diagnosis: 'Prerequisite wall in Circuit Analysis & Vector Calculus. High effort and attendance juxtaposed against sudden homework failure.',
    recommendedAction: 'Connect with Lead Course TA for dedicated differential equation review sessions; provide targeted micro-remedial modules.',
  },
  {
    id: 'sofia',
    name: 'Sofia Patel',
    yearMajor: 'Junior · Data Science & AI',
    gpa: '3.88 (Dean’s Honor)',
    healthScore: 92,
    status: 'Mastery Trajectory',
    statusColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20',
    signals: [
      { name: 'Summative Grades', score: 96, trend: '+4%' },
      { name: 'Lecture Attendance', score: 98, trend: 'Optimal' },
      { name: 'Assignment Cadence', score: 100, trend: 'Early' },
      { name: 'LMS Engagement', score: 94, trend: 'Active' },
      { name: 'Peer Forum Activity', score: 92, trend: 'Mentor' },
    ],
    diagnosis: 'Exceptional mastery across all dimensions. Ready for advanced research lab candidacy or peer mentorship fellowship.',
    recommendedAction: 'Nominate for Faculty Undergraduate Research Assistantship and invite to lead peer mentoring circles for freshman cohorts.',
  },
];

export const LiveDemoModal: React.FC<LiveDemoModalProps> = ({ isOpen, onClose }) => {
  const [selectedStudent, setSelectedStudent] = useState<DemoStudent>(STUDENTS[0]);
  const [actionDispatched, setActionDispatched] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl">
      <div className="relative w-full max-w-4xl rounded-2xl bg-[#090b20] border border-[rgba(140,150,255,0.25)] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(140,150,255,0.18)] bg-[#050616]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#ff6a2b] flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-baskerville font-bold text-lg text-[#f0f1ff]">Evolyn Intelligence Console</h3>
              <p className="text-xs text-[#a4a9d0]">Interactive Cohort Trajectory Demo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#a4a9d0] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Student Selector */}
          <div className="md:col-span-5 space-y-3">
            <span className="text-xs font-semibold text-[#a4a9d0] uppercase tracking-wider block">
              Active Student Trajectories
            </span>

            {STUDENTS.map((s) => {
              const isSelected = selectedStudent.id === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedStudent(s);
                    setActionDispatched(false);
                  }}
                  className={`w-full text-left p-4 rounded-xl transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-[rgba(255,106,43,0.15)] border-[#ff6a2b] shadow-md'
                      : 'bg-[#0e1028]/80 border-[rgba(140,150,255,0.14)] hover:border-[#ff6a2b]/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-baskerville text-base font-bold text-[#f0f1ff]">{s.name}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${s.statusColor}`}>
                      {s.status}
                    </span>
                  </div>
                  <div className="text-xs text-[#a4a9d0]">{s.yearMajor}</div>
                  <div className="flex items-center justify-between text-xs text-[#a4a9d0] mt-2 font-mono">
                    <span>GPA: {s.gpa.split(' ')[0]}</span>
                    <span className="text-[#ff6a2b] font-bold">Health: {s.healthScore}/100</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Details */}
          <div className="md:col-span-7 flex flex-col justify-between bg-[#0e1028]/90 p-5 rounded-xl border border-[rgba(140,150,255,0.16)]">
            <div>
              <div className="flex justify-between items-start pb-3 border-b border-[rgba(140,150,255,0.14)]">
                <div>
                  <h4 className="font-baskerville text-xl font-bold text-[#f0f1ff]">{selectedStudent.name}</h4>
                  <p className="text-xs text-[#a4a9d0]">{selectedStudent.yearMajor}</p>
                </div>
                <span className="text-xs text-[#4d6bff] font-mono font-bold bg-[#4d6bff]/10 px-2.5 py-1 rounded">
                  Summative: {selectedStudent.gpa.split(' ')[0]}
                </span>
              </div>

              {/* Signals */}
              <div className="py-3 space-y-2">
                <span className="text-[11px] font-semibold text-[#a4a9d0] uppercase tracking-wider block">
                  Multi-Signal Trajectory Breakdown
                </span>
                {selectedStudent.signals.map((sig) => (
                  <div key={sig.name} className="flex items-center justify-between text-xs p-2 rounded bg-black/20">
                    <span className="text-[#f0f1ff]">{sig.name}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#4d6bff] to-[#ff6a2b] rounded-full"
                          style={{ width: `${sig.score}%` }}
                        />
                      </div>
                      <span className="font-mono text-[#ffb27a] font-bold w-10 text-right">{sig.trend}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Diagnosis */}
              <div className="p-3 rounded-lg bg-[rgba(255,106,43,0.08)] border border-[#ff6a2b]/20 my-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#ff6a2b] mb-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Pattern Diagnosis</span>
                </div>
                <p className="text-xs text-[#f0f1ff]/90 leading-relaxed">
                  {selectedStudent.diagnosis}
                </p>
              </div>

              {/* Action */}
              <div className="p-3 rounded-lg bg-[#4d6bff]/10 border border-[#4d6bff]/20">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#6f8dff] mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Recommended Action</span>
                </div>
                <p className="text-xs text-[#f0f1ff]/90 leading-relaxed">
                  {selectedStudent.recommendedAction}
                </p>
              </div>
            </div>

            {/* CTA in modal */}
            <div className="mt-4 pt-3 border-t border-[rgba(140,150,255,0.14)] flex items-center justify-between">
              <span className="text-xs text-[#a4a9d0]">
                {actionDispatched ? '✓ Advisor outreach protocol initiated.' : 'Dispatch personalized outreach'}
              </span>
              <button
                onClick={() => setActionDispatched(true)}
                disabled={actionDispatched}
                className={`btn-primary px-5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                  actionDispatched ? 'bg-emerald-600 text-white shadow-none' : ''
                }`}
              >
                {actionDispatched ? <CheckCircle className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                <span>{actionDispatched ? 'Dispatched' : 'Initiate Support'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
