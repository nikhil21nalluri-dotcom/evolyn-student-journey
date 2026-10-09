import React, { useState } from 'react';
import {
  Sparkles,
  Target,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  MessageSquare,
  BookOpen,
  UserCheck,
  Briefcase,
  Code,
  Calendar,
  Layers,
  FileText,
  Plus,
  ChevronDown,
  Info,
  Check,
  X,
  Send,
  TrendingUp,
  Award,
} from 'lucide-react';
import {
  getStudentInterventionIntelligence,
  StudentInterventionIntelligence,
  InterventionRecommendation,
  InterventionStatus,
  InterventionPriority,
  BeforeMetrics,
  InterventionRecord,
} from '../../data/interventionIntelligenceEngine';
import { useIntervention } from '../../context/InterventionContext';
import { useAuth } from '../../context/AuthContext';
import { InterventionOutcomeModal } from './InterventionOutcomeModal';

interface InterventionIntelligencePanelProps {
  studentId: string;
  onOpenDmModal?: (studentId: string) => void;
  onOpenLmsModal?: (studentId: string) => void;
  embedded?: boolean;
}

export const InterventionIntelligencePanel: React.FC<InterventionIntelligencePanelProps> = ({
  studentId,
  onOpenDmModal,
  onOpenLmsModal,
  embedded = false,
}) => {
  const { userProfile } = useAuth();
  const {
    createIntervention,
    updateInterventionStatus,
    updateInterventionNote,
    createSupportPlan,
    getStudentInterventions,
    getStudentSupportPlan,
  } = useIntervention();

  const intel: StudentInterventionIntelligence = getStudentInterventionIntelligence(studentId);
  const studentInterventions = getStudentInterventions(intel.studentId);
  const activeSupportPlan = getStudentSupportPlan(intel.studentId);

  // Success toast state
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Selected intervention for outcome evaluation
  const [selectedInterventionForOutcome, setSelectedInterventionForOutcome] = useState<InterventionRecord | null>(null);

  // Quick Faculty Note state
  const [facultyNoteInput, setFacultyNoteInput] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Support Plan Modal state
  const [isSupportPlanModalOpen, setIsSupportPlanModalOpen] = useState(false);
  const [planGoal, setPlanGoal] = useState('Improve communication and interview readiness.');
  const [planPrimaryFocus, setPlanPrimaryFocus] = useState(intel.primaryFocus.join(' + '));
  const [planReviewPeriod, setPlanReviewPeriod] = useState('Next 2 weeks');
  const [planNotes, setPlanNotes] = useState(
    'Focus on confidence, interview communication and consistent placement preparation.'
  );
  const [selectedPlanActions, setSelectedPlanActions] = useState<{
    comm: boolean;
    interview: boolean;
    mentor: boolean;
    coding: boolean;
  }>({
    comm: true,
    interview: true,
    mentor: true,
    coding: false,
  });

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  // Faculty action button click handler
  const handleTriggerAction = (rec: InterventionRecommendation) => {
    const authorName = userProfile?.displayName || 'Prof. Elena Vance';
    const authorRole = 'Faculty Advisor, CSE';

    createIntervention({
      studentId: intel.studentId,
      studentName: intel.studentName,
      actionType: rec.title,
      reason: rec.reason,
      priority: rec.priority,
      facultyName: authorName,
      facultyRole: authorRole,
      notes: `Suggested action: ${rec.suggestedAction}`,
      totalSessions: rec.defaultSessions || 1,
      initialStatus: 'ACTIVE',
      customBeforeMetrics: intel.beforeMetrics,
    });

    triggerToast(`Intervention created: ${rec.title} is now ACTIVE for ${intel.studentName}!`);
  };

  // Submit Support Plan
  const handleCreateSupportPlan = (e: React.FormEvent) => {
    e.preventDefault();

    const actionItems: Array<{
      title: string;
      totalSessions: number;
      iconType: 'communication' | 'interview' | 'coding' | 'mentor' | 'academic';
    }> = [];

    if (selectedPlanActions.comm) {
      actionItems.push({
        title: 'Communication Practice',
        totalSessions: 2,
        iconType: 'communication',
      });
    }
    if (selectedPlanActions.interview) {
      actionItems.push({
        title: 'Mock Interview',
        totalSessions: 1,
        iconType: 'interview',
      });
    }
    if (selectedPlanActions.mentor) {
      actionItems.push({
        title: 'Mentor Check-in',
        totalSessions: 1,
        iconType: 'mentor',
      });
    }
    if (selectedPlanActions.coding) {
      actionItems.push({
        title: 'Coding Practice',
        totalSessions: 3,
        iconType: 'coding',
      });
    }

    if (actionItems.length === 0) {
      actionItems.push({
        title: 'Targeted Advising Session',
        totalSessions: 1,
        iconType: 'academic',
      });
    }

    createSupportPlan({
      studentId: intel.studentId,
      studentName: intel.studentName,
      primaryFocus: planPrimaryFocus,
      goal: planGoal,
      actionItems,
      reviewPeriod: planReviewPeriod,
      notes: planNotes,
      facultyAuthor: userProfile?.displayName || 'Prof. Elena Vance (Advisor)',
    });

    setIsSupportPlanModalOpen(false);
    triggerToast(`Support Plan successfully created for ${intel.studentName}!`);
  };

  // Add Faculty Note
  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!facultyNoteInput.trim()) return;

    createIntervention({
      studentId: intel.studentId,
      studentName: intel.studentName,
      actionType: 'Advisor Guidance Note',
      reason: 'Qualitative advisory observation and agreement',
      priority: 'MEDIUM',
      facultyName: userProfile?.displayName || 'Prof. Elena Vance',
      facultyRole: 'Faculty Advisor',
      notes: facultyNoteInput.trim(),
      totalSessions: 1,
      initialStatus: 'COMPLETED',
      customBeforeMetrics: intel.beforeMetrics,
    });

    setFacultyNoteInput('');
    setIsAddingNote(false);
    triggerToast(`Advisory note recorded in Intervention History for ${intel.studentName}.`);
  };

  return (
    <div className={`space-y-6 ${embedded ? '' : 'pt-2'}`}>
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-[#0e1f3d] border border-[#2dd4bf]/50 text-white shadow-2xl flex items-center gap-3 animate-fadeIn">
          <div className="w-8 h-8 rounded-xl bg-[#2dd4bf]/20 text-[#5eead4] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#5eead4] uppercase tracking-wider block font-mono">
              Intervention Telemetry Updated
            </span>
            <p className="text-xs text-white mt-0.5">{successToast}</p>
          </div>
        </div>
      )}

      {/* Main Intervention Intelligence Command Center Card */}
      <div className="rounded-3xl bg-[#0a0e2a] border border-[#222955] p-6 sm:p-7 shadow-2xl relative overflow-hidden text-[#f0f1ff]">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#ff6a2b]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#6366f1]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header: INTERVENTION INTELLIGENCE */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 relative z-10 border-b border-[#222955] pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-[#ffb27a] mb-2 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-[#ff6a2b]" />
              <span>DETECTION → EXPLANATION → DECISION → ACTION</span>
            </div>
            <h2 className="font-baskerville text-2xl sm:text-3xl font-bold text-white tracking-tight">
              INTERVENTION INTELLIGENCE
            </h2>
            <p className="text-xs text-[#a4a9d0] mt-1">
              Pedagogical action recommendations synthesized from multi-dimensional telemetry, success scores, and early signals.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsSupportPlanModalOpen(true)}
              className="py-2 px-4 rounded-xl bg-gradient-to-r from-[#ff6a2b] to-[#ff8c5a] hover:from-[#ff7b42] hover:to-[#ffa073] text-white text-xs font-bold shadow-lg shadow-[#ff6a2b]/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Create Support Plan</span>
            </button>

            <button
              onClick={() => setIsAddingNote(!isAddingNote)}
              className="py-2 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#ffb27a]" />
              <span>{isAddingNote ? 'Cancel Note' : 'Add Faculty Note'}</span>
            </button>
          </div>
        </div>

        {/* Student Context Bar: ARJUN KUMAR, Success Score, Status, Segment */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 relative z-10">
          <div className="p-3.5 rounded-2xl bg-[#0c1033] border border-[#222955]">
            <span className="text-[11px] text-[#a4a9d0] block font-mono uppercase">Student</span>
            <span className="font-bold text-sm text-white block truncate uppercase tracking-wide">
              {intel.studentName}
            </span>
            <span className="text-[10px] text-[#8692c8] font-mono">{intel.studentRoll}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0c1033] border border-[#222955]">
            <span className="text-[11px] text-[#a4a9d0] block font-mono uppercase">Success Score</span>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-xl font-bold text-[#ffb27a]">{intel.successScore}</span>
              <span className="text-xs text-[#a4a9d0]">/ 100</span>
            </div>
            <span className="text-[10px] text-[#34d399] font-mono">7 Normalized Dimensions</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0c1033] border border-[#222955]">
            <span className="text-[11px] text-[#a4a9d0] block font-mono uppercase">Status</span>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono border bg-amber-500/15 border-amber-500/30 text-amber-300">
              {intel.status}
            </span>
            <span className="block text-[10px] text-[#8692c8] mt-1 font-mono">Early Divergence</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0c1033] border border-[#222955]">
            <span className="text-[11px] text-[#a4a9d0] block font-mono uppercase">Segment</span>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono border truncate max-w-full bg-[#1e1b4b] text-[#c7d2fe] border-[#4338ca]">
              {intel.segmentName}
            </span>
            <span className="block text-[10px] text-[#8692c8] mt-1 font-mono truncate">
              Behavioral Pattern
            </span>
          </div>
        </div>

        {/* Core Intervention Directive Box (Primary focus, Recommended intervention, Reason) */}
        <div className="p-5 rounded-2xl bg-[#0d143a] border border-[#23316e] mb-7 relative z-10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#93c5fd] block mb-1.5 font-bold">
                Primary Focus:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {intel.primaryFocus.map((focus, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-bold text-white shadow-sm"
                  >
                    {focus}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-left md:text-right">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#a4a9d0] block mb-1">
                Recommended Intervention:
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#ff6a2b]/20 border border-[#ff6a2b]/40 text-[#ffb27a] font-mono text-xs font-bold tracking-wide">
                <Target className="w-3.5 h-3.5 text-[#ff6a2b]" />
                {intel.recommendedIntervention}
              </span>
            </div>
          </div>

          {/* Reason Statement */}
          <div className="p-3.5 rounded-xl bg-[#080d28] border border-[#1b2554] text-xs sm:text-sm text-[#cbd5e1] leading-relaxed">
            <span className="font-bold text-white block mb-0.5 font-mono text-xs uppercase text-[#93c5fd]">
              Reason:
            </span>
            "{intel.reason}"
          </div>

          {/* Silent Struggle Alert (Requirement 14) */}
          {intel.silentStruggleGuidance && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300 font-mono text-[11px] uppercase block">
                  Silent Struggle Telemetry:
                </strong>
                <span>{intel.silentStruggleGuidance}</span>
              </div>
            </div>
          )}
        </div>

        {/* Inline Faculty Note Composer */}
        {isAddingNote && (
          <form
            onSubmit={handleSaveNote}
            className="mb-7 p-4 rounded-2xl bg-[#091129] border border-[#2b3a72] relative z-10 space-y-3 animate-fadeIn"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#ffb27a]" />
                <span>Add Qualitative Faculty Observation / Agreement</span>
              </span>
              <button
                type="button"
                onClick={() => setIsAddingNote(false)}
                className="text-xs text-[#a4a9d0] hover:text-white"
              >
                Close
              </button>
            </div>
            <textarea
              value={facultyNoteInput}
              onChange={(e) => setFacultyNoteInput(e.target.value)}
              placeholder="e.g. Discussed placement preparation with student. Student agreed to complete two mock interviews."
              rows={3}
              className="w-full p-3 rounded-xl bg-[#06081c] border border-[#1f2552] text-xs text-white placeholder-[#a4a9d0]/60 focus:outline-none focus:border-[#ff6a2b]"
              required
            />
            <div className="flex justify-end gap-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#ff6a2b] hover:bg-[#ff7b42] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Save to Student Intervention Record</span>
              </button>
            </div>
          </form>
        )}

        {/* SECTION 2 & 3: RECOMMENDED ACTIONS with PRIORITIES & ACTION BUTTONS */}
        <div className="mb-8 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-baskerville text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-[#ff6a2b]" />
                <span>RECOMMENDED ACTIONS</span>
              </h3>
              <p className="text-xs text-[#a4a9d0] mt-0.5">
                Targeted actions prioritized strictly on observable signals. Faculty maintains full discretion.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[#8692c8]">
              {intel.recommendedActions.length} Actionable Recommendations
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {intel.recommendedActions.map((rec, index) => {
              const isHigh = rec.priority === 'HIGH';
              const isMedium = rec.priority === 'MEDIUM';

              return (
                <div
                  key={rec.id}
                  className="p-5 rounded-2xl bg-[#0b1030] border border-[#222955] hover:border-[#ff6a2b]/50 transition-all flex flex-col justify-between shadow-lg relative group"
                >
                  <div>
                    {/* Header: Title & Priority Pill */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 font-mono text-xs font-bold text-[#c2d1ff] flex items-center justify-center">
                          {index + 1}
                        </span>
                        <h4 className="font-bold text-sm text-white">{rec.title}</h4>
                      </div>

                      {/* Priority: LOW | MEDIUM | HIGH */}
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold border tracking-wider ${
                          isHigh
                            ? 'bg-rose-500/15 border-rose-500/35 text-rose-300'
                            : isMedium
                            ? 'bg-amber-500/15 border-amber-500/35 text-amber-300'
                            : 'bg-emerald-500/15 border-emerald-500/35 text-emerald-300'
                        }`}
                      >
                        {rec.priority} PRIORITY
                      </span>
                    </div>

                    {/* Reason */}
                    <div className="mb-2">
                      <span className="text-[10px] font-mono uppercase text-[#a4a9d0] block">
                        Reason:
                      </span>
                      <p className="text-xs text-[#cbd5e1] leading-relaxed mt-0.5">{rec.reason}</p>
                    </div>

                    {/* Suggested Action */}
                    <div className="mb-4 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                      <span className="text-[10px] font-mono uppercase text-[#93c5fd] block">
                        Suggested Action:
                      </span>
                      <p className="text-xs text-white font-medium mt-0.5">{rec.suggestedAction}</p>
                    </div>
                  </div>

                  {/* Action Button: Clicking creates intervention record in application state */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-[#8692c8] font-mono">{rec.area}</span>
                    <button
                      onClick={() => handleTriggerAction(rec)}
                      className="py-1.5 px-3.5 rounded-xl bg-white/5 hover:bg-[#ff6a2b] border border-white/10 hover:border-[#ff6a2b] text-xs font-bold text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow-md hover:shadow-[#ff6a2b]/20"
                    >
                      <span>{rec.actionButtonText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION: ACTIVE SUPPORT PLAN SNAPSHOT (If created) */}
        {activeSupportPlan && (
          <div className="mb-8 p-5 rounded-2xl bg-[#0b1433] border border-[#233568] relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#2dd4bf]" />
                <h3 className="font-baskerville text-base font-bold text-white">
                  CURRENT SUPPORT PLAN BLUEPRINT
                </h3>
              </div>
              <span className="text-xs font-mono text-[#a4a9d0]">
                Review Period: <strong className="text-white">{activeSupportPlan.reviewPeriod}</strong>
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#070d24] border border-[#1b2650] mb-3 text-xs text-[#cbd5e1]">
              <strong className="text-[#93c5fd] font-mono block mb-0.5">Goal:</strong>
              {activeSupportPlan.goal}
              <div className="text-[11px] text-[#a4a9d0] mt-1.5 italic">
                Notes: "{activeSupportPlan.notes}"
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              {activeSupportPlan.actionItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-medium text-white block">{item.title}</span>
                    <span className="text-[11px] text-[#8692c8] font-mono">
                      {item.completedSessions} / {item.totalSessions} sessions
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      item.completedFlag
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {item.completedFlag ? 'DONE' : 'IN PROGRESS'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 11: INTERVENTION HISTORY (Timeline of Support) */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-baskerville text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#a5b4fc]" />
                <span>INTERVENTION HISTORY & TIMELINE</span>
              </h3>
              <p className="text-xs text-[#a4a9d0] mt-0.5">
                Timeline of pedagogical support actions, advisory notes, and recorded baseline telemetry.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[#8692c8]">
              {studentInterventions.length} Total Records
            </span>
          </div>

          {studentInterventions.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#080c24] border border-[#1b224c] text-center text-xs text-[#a4a9d0]">
              No prior interventions recorded yet. Click a recommended action above to begin support.
            </div>
          ) : (
            <div className="space-y-3">
              {studentInterventions.map((record) => {
                const isCompleted = record.status === 'COMPLETED';
                const isActive = record.status === 'ACTIVE';
                const isPlanned = record.status === 'PLANNED';

                return (
                  <div
                    key={record.id}
                    className="p-4 rounded-2xl bg-[#0b0f2a] border border-[#222955] hover:border-[#6f8dff]/40 transition-all space-y-3 shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="text-xs font-mono font-bold text-[#ffb27a] px-2 py-0.5 rounded bg-white/5 border border-white/10">
                          {record.date}
                        </span>
                        <h4 className="font-bold text-sm text-white">{record.actionType}</h4>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            record.priority === 'HIGH'
                              ? 'text-rose-300 bg-rose-500/15'
                              : 'text-amber-300 bg-amber-500/15'
                          }`}
                        >
                          {record.priority}
                        </span>
                      </div>

                      {/* Interactive Status Selector: PLANNED, ACTIVE, COMPLETED, CANCELLED */}
                      <div className="flex items-center gap-2">
                        <label htmlFor={`status-select-${record.id}`} className="text-[11px] text-[#8692c8] font-mono">
                          Status:
                        </label>
                        <select
                          id={`status-select-${record.id}`}
                          value={record.status}
                          onChange={(e) =>
                            updateInterventionStatus(record.id, e.target.value as InterventionStatus)
                          }
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border appearance-none cursor-pointer focus:outline-none ${
                            isActive
                              ? 'bg-blue-500/15 border-blue-500/40 text-blue-300'
                              : isCompleted
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                              : isPlanned
                              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                              : 'bg-white/5 border-white/10 text-[#a4a9d0]'
                          }`}
                        >
                          <option value="PLANNED" className="bg-[#0b0f2a] text-amber-300">
                            PLANNED
                          </option>
                          <option value="ACTIVE" className="bg-[#0b0f2a] text-blue-300">
                            ACTIVE
                          </option>
                          <option value="COMPLETED" className="bg-[#0b0f2a] text-emerald-300">
                            COMPLETED
                          </option>
                          <option value="CANCELLED" className="bg-[#0b0f2a] text-slate-400">
                            CANCELLED
                          </option>
                        </select>
                      </div>
                    </div>

                    {/* Reason */}
                    <div className="text-xs text-[#cbd5e1]">
                      <span className="text-[#8692c8] font-mono mr-1">Reason:</span>
                      {record.reason}
                    </div>

                    {/* Faculty Note if Available */}
                    {record.notes && (
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-[#e2e8f0]">
                        <span className="font-bold text-[#ffb27a] font-mono text-[11px] block mb-0.5">
                          Faculty Note ({record.facultyName}):
                        </span>
                        "{record.notes}"
                      </div>
                    )}

                    {/* Section 15: Baseline Before Metrics Preparation & Verified Outcome Review */}
                    <div className="pt-2 border-t border-white/5 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#8692c8]">
                        <span className="text-[#a4a9d0]">
                          Baseline Telemetry at Creation:
                        </span>
                        <div className="flex flex-wrap items-center gap-3">
                          <span>Score: <strong className="text-white">{record.beforeMetrics.successScore}</strong></span>
                          <span>Comm: <strong className="text-[#5eead4]">{record.beforeMetrics.communication}</strong></span>
                          <span>Eng: <strong className="text-[#93c5fd]">{record.beforeMetrics.engagement}</strong></span>
                          <span>Placement: <strong className="text-[#ffb27a]">{record.beforeMetrics.placementReadiness}</strong></span>
                          <span>Att: <strong className="text-[#34d399]">{record.beforeMetrics.attendance}%</strong></span>
                        </div>
                      </div>

                      {/* Outcome Review Card if Evaluated */}
                      {record.outcomeReview ? (
                        <div className="p-3.5 rounded-xl bg-emerald-500/[0.07] border border-emerald-500/30 space-y-2 text-xs">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40">
                                {record.outcomeReview.outcomeRating.replace('_', ' ')}
                              </span>
                              <span className="text-[11px] text-white font-medium">
                                Verified by {record.outcomeReview.evaluatorName} ({record.outcomeReview.reviewDate})
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => setSelectedInterventionForOutcome(record)}
                              className="text-[10px] text-emerald-400 hover:underline font-mono cursor-pointer"
                            >
                              Update Outcome Review →
                            </button>
                          </div>

                          {/* Deltas Display */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                            <div className="p-1.5 rounded-lg bg-black/30 border border-white/5">
                              <span className="text-[#8e96c8] block text-[10px]">Score Delta</span>
                              <span className="font-bold text-emerald-400">
                                {record.outcomeReview.metricsDelta.successScoreChange >= 0
                                  ? `+${record.outcomeReview.metricsDelta.successScoreChange}`
                                  : record.outcomeReview.metricsDelta.successScoreChange} pts
                              </span>
                            </div>
                            <div className="p-1.5 rounded-lg bg-black/30 border border-white/5">
                              <span className="text-[#8e96c8] block text-[10px]">Comm Delta</span>
                              <span className="font-bold text-[#5eead4]">
                                {record.outcomeReview.metricsDelta.communicationChange >= 0
                                  ? `+${record.outcomeReview.metricsDelta.communicationChange}`
                                  : record.outcomeReview.metricsDelta.communicationChange} pts
                              </span>
                            </div>
                            <div className="p-1.5 rounded-lg bg-black/30 border border-white/5">
                              <span className="text-[#8e96c8] block text-[10px]">Eng Delta</span>
                              <span className="font-bold text-[#93c5fd]">
                                {record.outcomeReview.metricsDelta.engagementChange >= 0
                                  ? `+${record.outcomeReview.metricsDelta.engagementChange}`
                                  : record.outcomeReview.metricsDelta.engagementChange} pts
                              </span>
                            </div>
                            <div className="p-1.5 rounded-lg bg-black/30 border border-white/5">
                              <span className="text-[#8e96c8] block text-[10px]">Placement Delta</span>
                              <span className="font-bold text-[#ffb27a]">
                                {record.outcomeReview.metricsDelta.placementChange >= 0
                                  ? `+${record.outcomeReview.metricsDelta.placementChange}`
                                  : record.outcomeReview.metricsDelta.placementChange} pts
                              </span>
                            </div>
                          </div>

                          <div className="text-[11px] text-[#cbd5e1] italic pt-1">
                            "{record.outcomeReview.qualitativeOutcomeNotes}"
                          </div>

                          <div className="text-[10px] text-[#5eead4] font-mono">
                            Next Step: {record.outcomeReview.recommendedNextStep}
                          </div>
                        </div>
                      ) : (
                        <div className="pt-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => setSelectedInterventionForOutcome(record)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>Record Outcome Review & Deltas</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Responsible AI Principles Footer (Section 16) */}
        <div className="mt-8 p-4 rounded-2xl bg-[#070b24] border border-[#1d2350] relative z-10 flex items-start gap-3 text-xs text-[#8e96c8]">
          <ShieldCheck className="w-5 h-5 shrink-0 text-[#2dd4bf] mt-0.5" />
          <div>
            <strong className="text-white block mb-0.5">Responsible AI Principle:</strong>
            Interventions are supportive pedagogical recommendations, not automatic decisions. Faculty maintains active pedagogical discretion. This student may benefit from additional support.
          </div>
        </div>
      </div>

      {/* CREATE SUPPORT PLAN MODAL (Section 7) */}
      {isSupportPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-2xl my-auto rounded-3xl bg-[#090c25] border border-[rgba(140,150,255,0.25)] p-6 sm:p-8 shadow-2xl text-[#f0f1ff]">
            {/* Glow */}
            <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#ff6a2b]/10 rounded-full blur-3xl pointer-events-none" />

            <button
              onClick={() => setIsSupportPlanModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-[#a4a9d0] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono font-medium text-[#ffb27a] mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#ff6a2b]" />
                <span>SUPPORT PLAN WORKFLOW</span>
              </div>
              <h3 className="font-baskerville text-2xl font-bold text-white">
                Create Student Support Plan
              </h3>
              <p className="text-xs text-[#a4a9d0] mt-0.5">
                Establish targeted, supportive development activities for {intel.studentName}.
              </p>
            </div>

            <form onSubmit={handleCreateSupportPlan} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-[#a4a9d0] uppercase mb-1">
                  Student
                </label>
                <div className="p-3 rounded-xl bg-[#06081c] border border-[#1f2552] text-xs font-bold text-white flex items-center justify-between">
                  <span>{intel.studentName} ({intel.studentRoll})</span>
                  <span className="text-[#ffb27a] font-mono">Score: {intel.successScore}/100</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#a4a9d0] uppercase mb-1">
                  Primary Focus
                </label>
                <input
                  type="text"
                  value={planPrimaryFocus}
                  onChange={(e) => setPlanPrimaryFocus(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#06081c] border border-[#1f2552] text-xs text-white focus:outline-none focus:border-[#ff6a2b]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#a4a9d0] uppercase mb-1">
                  Development Goal
                </label>
                <input
                  type="text"
                  value={planGoal}
                  onChange={(e) => setPlanGoal(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#06081c] border border-[#1f2552] text-xs text-white focus:outline-none focus:border-[#ff6a2b]"
                  required
                />
              </div>

              {/* Action Checkboxes */}
              <div>
                <label className="block text-[11px] font-mono text-[#a4a9d0] uppercase mb-2">
                  Prescribed Actions (Select All That Apply)
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPlanActions.comm}
                      onChange={(e) =>
                        setSelectedPlanActions({ ...selectedPlanActions, comm: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-[#ff6a2b] accent-[#ff6a2b]"
                    />
                    <span className="text-xs text-white font-medium">
                      🎤 2 communication practice sessions
                    </span>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPlanActions.interview}
                      onChange={(e) =>
                        setSelectedPlanActions({ ...selectedPlanActions, interview: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-[#ff6a2b] accent-[#ff6a2b]"
                    />
                    <span className="text-xs text-white font-medium">
                      💼 1 mock interview
                    </span>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPlanActions.mentor}
                      onChange={(e) =>
                        setSelectedPlanActions({ ...selectedPlanActions, mentor: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-[#ff6a2b] accent-[#ff6a2b]"
                    />
                    <span className="text-xs text-white font-medium">
                      🤝 Mentor check-in conversation
                    </span>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPlanActions.coding}
                      onChange={(e) =>
                        setSelectedPlanActions({ ...selectedPlanActions, coding: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-[#ff6a2b] accent-[#ff6a2b]"
                    />
                    <span className="text-xs text-white font-medium">
                      📚 Targeted coding practice (3 modules)
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#a4a9d0] uppercase mb-1">
                  Review Period
                </label>
                <select
                  value={planReviewPeriod}
                  onChange={(e) => setPlanReviewPeriod(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#06081c] border border-[#1f2552] text-xs text-white focus:outline-none focus:border-[#ff6a2b]"
                >
                  <option value="Next 1 week">Next 1 week</option>
                  <option value="Next 2 weeks">Next 2 weeks</option>
                  <option value="Next 3 weeks">Next 3 weeks</option>
                  <option value="Next 30 days">Next 30 days</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#a4a9d0] uppercase mb-1">
                  Notes
                </label>
                <textarea
                  value={planNotes}
                  onChange={(e) => setPlanNotes(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-xl bg-[#06081c] border border-[#1f2552] text-xs text-white focus:outline-none focus:border-[#ff6a2b]"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsSupportPlanModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-xs text-[#a4a9d0] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ff6a2b] to-[#ff8c5a] hover:from-[#ff7b42] hover:to-[#ffa073] text-white font-bold text-xs shadow-lg shadow-[#ff6a2b]/20 cursor-pointer"
                >
                  Create Support Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INTERVENTION OUTCOME EVALUATION MODAL (STEP 10) */}
      {selectedInterventionForOutcome && (
        <InterventionOutcomeModal
          isOpen={true}
          onClose={() => setSelectedInterventionForOutcome(null)}
          intervention={selectedInterventionForOutcome}
          onSuccess={(msg) => triggerToast(msg)}
        />
      )}
    </div>
  );
};
