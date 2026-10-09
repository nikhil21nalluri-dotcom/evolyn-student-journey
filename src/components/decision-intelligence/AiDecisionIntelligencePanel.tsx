import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Target,
  UserCheck,
  Compass,
  FileText,
  MessageSquare,
  HelpCircle,
  Activity,
  Layers,
  ChevronDown,
} from 'lucide-react';
import {
  getStudentDecisionIntelligence,
  StudentDecisionIntelligence,
} from '../../data/studentDecisionEngine';
import { STUDENT_GROWTH_DATA } from '../../data/studentGrowthData';
import { SupportPlanModal } from './SupportPlanModal';
import { InterventionIntelligencePanel } from '../intervention/InterventionIntelligencePanel';

interface AiDecisionIntelligencePanelProps {
  initialStudentId?: string;
  mode?: 'faculty' | 'student' | 'embed';
  onOpenDmModal?: (studentId: string) => void;
  onOpenLmsModal?: (studentId: string) => void;
  onSelectStudent?: (studentId: string) => void;
  onDispatchSupportPlan?: (studentId: string, title: string) => void;
}

export const AiDecisionIntelligencePanel: React.FC<AiDecisionIntelligencePanelProps> = ({
  initialStudentId = 'arjun-kumar',
  mode = 'faculty',
  onOpenDmModal,
  onOpenLmsModal,
  onSelectStudent,
  onDispatchSupportPlan,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialStudentId);
  const [isSupportPlanOpen, setIsSupportPlanOpen] = useState(false);

  const decisionData: StudentDecisionIntelligence = getStudentDecisionIntelligence(selectedStudentId);

  const handleStudentChange = (id: string) => {
    setSelectedStudentId(id);
    if (onSelectStudent) {
      onSelectStudent(id);
    }
  };

  // Student Persona View
  if (mode === 'student') {
    return (
      <div className="space-y-6">
        {/* Student Development Insight Card */}
        <div className="rounded-3xl bg-gradient-to-br from-[#0c1330] via-[#090e25] to-[#060818] border border-[rgba(140,150,255,0.22)] p-6 sm:p-8 shadow-2xl relative overflow-hidden text-[#f0f1ff]">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#2dd4bf]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#6366f1]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10 border-b border-white/10 pb-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-[#5eead4] mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#2dd4bf]" />
                <span>AI Decision Intelligence Platform</span>
              </div>
              <h2 className="font-baskerville text-2xl sm:text-3xl font-bold text-white">
                {decisionData.studentView.insightTitle}
              </h2>
              <p className="text-xs text-[#a4a9d0] mt-1 max-w-xl">
                Encouraging personal telemetry synthesized to help you prioritize your next learning goals.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[11px] text-[#a4a9d0] block">Overall Readiness Score</span>
                <span className="font-mono text-2xl font-bold text-white">
                  {decisionData.successScore} <span className="text-xs text-[#a4a9d0]">/ 100</span>
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#2dd4bf]/15 border border-[#2dd4bf]/30 flex items-center justify-center text-[#5eead4] font-bold text-lg">
                ★
              </div>
            </div>
          </div>

          {/* Student Headline & Focus Areas */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 mb-6 relative z-10">
            <h3 className="text-sm sm:text-base font-bold text-white mb-2">
              {decisionData.studentView.headline}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-xs text-[#a4a9d0] font-medium mr-1">Your current focus areas:</span>
              {decisionData.studentView.focusAreas.map((area, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full bg-[#2dd4bf]/15 border border-[#2dd4bf]/35 text-xs font-bold text-[#5eead4]"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>

          {/* WHY THIS MATTERS */}
          <div className="p-5 rounded-2xl bg-[#09152a] border border-[#1b3152] mb-6 relative z-10">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#93c5fd] mb-2">
              <HelpCircle className="w-3.5 h-3.5 text-[#60a5fa]" />
              <span>Why This Matters</span>
            </div>
            <p className="text-xs sm:text-sm text-[#dbeafe] leading-relaxed">
              {decisionData.studentView.whyThisMatters}
            </p>
          </div>

          {/* YOUR NEXT STEPS */}
          <div className="mb-6 relative z-10">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5eead4] mb-3">
              <Compass className="w-3.5 h-3.5 text-[#2dd4bf]" />
              <span>Your Next Steps</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {decisionData.studentView.nextSteps.map((step) => (
                <div
                  key={step.stepNumber}
                  className="p-4 rounded-2xl bg-[#081326] border border-[#182947] flex flex-col justify-between hover:border-[#2dd4bf]/40 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-6 h-6 rounded-lg bg-[#2dd4bf]/20 text-[#5eead4] font-mono text-xs font-bold flex items-center justify-center">
                        {step.stepNumber}
                      </span>
                      <span className="text-[11px] font-bold text-[#93c5fd]">{step.title}</span>
                    </div>
                    <p className="text-xs text-[#cbd5e1] leading-relaxed">{step.detail}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center text-[11px] text-[#5eead4] font-semibold">
                    <span>Low friction recommended practice</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TRACK NEXT */}
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#c084fc] mb-3">
              <Clock className="w-3.5 h-3.5 text-[#a855f7]" />
              <span>Track Next</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {decisionData.studentView.trackNext.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs"
                >
                  <span className="text-[#e2e8f0] font-medium">{item.name}</span>
                  <span className="text-[11px] font-bold text-[#34d399]">{item.target}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Faculty / Detailed Decision Intelligence View
  return (
    <div className="space-y-6">
      {/* Top Banner & Student Selector */}
      <div className="rounded-3xl bg-[#0a0e2a] border border-[#222955] p-5 sm:p-7 shadow-2xl relative overflow-hidden text-[#f0f1ff]">
        {/* Glow */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#ff6a2b]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-[#6366f1]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Title & Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 relative z-10 border-b border-[#222955] pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-[#ffb27a] mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#ff6a2b]" />
              <span>AI DECISION INTELLIGENCE PLATFORM</span>
            </div>
            <h2 className="font-baskerville text-2xl sm:text-3xl font-bold text-white tracking-tight">
              AI Decision Intelligence: {decisionData.studentName}
            </h2>
            <p className="text-xs text-[#a4a9d0] mt-1">
              Multi-dimensional telemetry transformed into explainable observations, plausible patterns, and actionable next steps.
            </p>
          </div>

          {/* Student Selector & Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <label htmlFor="student-picker" className="sr-only">Select Student</label>
              <select
                id="student-picker"
                value={selectedStudentId}
                onChange={(e) => handleStudentChange(e.target.value)}
                className="py-2 pl-3 pr-8 rounded-xl bg-[#0e1438] border border-[#2b356d] text-xs font-semibold text-white focus:outline-none focus:border-[#ff6a2b] appearance-none cursor-pointer"
              >
                {STUDENT_GROWTH_DATA.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#0b0f2a] text-white">
                    {s.name} ({s.studentId})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#a4a9d0] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              onClick={() => setIsSupportPlanOpen(true)}
              className="py-2 px-4 rounded-xl bg-gradient-to-r from-[#ff6a2b] to-[#ff8c5a] hover:from-[#ff7b42] hover:to-[#ffa073] text-white text-xs font-bold shadow-lg shadow-[#ff6a2b]/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>VIEW SUPPORT PLAN</span>
            </button>
          </div>
        </div>

        {/* Overview Bar: Student, Success Score, Risk Status, Segment */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 relative z-10">
          {/* Student */}
          <div className="p-3.5 rounded-2xl bg-[#0c1033] border border-[#222955]">
            <span className="text-[11px] text-[#a4a9d0] block">Student</span>
            <span className="font-bold text-sm text-white block truncate">{decisionData.studentName}</span>
            <span className="text-[10px] text-[#8692c8] font-mono">{decisionData.studentRoll}</span>
          </div>

          {/* Success Score */}
          <div className="p-3.5 rounded-2xl bg-[#0c1033] border border-[#222955]">
            <span className="text-[11px] text-[#a4a9d0] block">Success Score</span>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-xl font-bold text-white">{decisionData.successScore}</span>
              <span className="text-xs text-[#a4a9d0]">/ 100</span>
            </div>
            <span className="text-[10px] text-[#34d399]">7 Normalized Dimensions</span>
          </div>

          {/* Status */}
          <div className="p-3.5 rounded-2xl bg-[#0c1033] border border-[#222955]">
            <span className="text-[11px] text-[#a4a9d0] block">Signal Status</span>
            <span
              className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${decisionData.statusBadge.bg} ${decisionData.statusBadge.border} ${decisionData.statusBadge.text}`}
            >
              {decisionData.status}
            </span>
            <span className="block text-[10px] text-[#8692c8] mt-1">Observable Signals</span>
          </div>

          {/* Segment */}
          <div className="p-3.5 rounded-2xl bg-[#0c1033] border border-[#222955]">
            <span className="text-[11px] text-[#a4a9d0] block">Primary Segment</span>
            <span
              className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold border truncate max-w-full ${decisionData.primarySegment.badgeColor}`}
            >
              {decisionData.primarySegment.name}
            </span>
            <span className="block text-[10px] text-[#8692c8] mt-1">Dynamic Persona</span>
          </div>
        </div>

        {/* 4 CORE SECTIONS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 relative z-10 mb-6">
          {/* SECTION 1: WHAT IS HAPPENING? (WHAT WE OBSERVE) */}
          <div className="rounded-2xl bg-[#0b0f2d] border border-[#222955] p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#ff6a2b]/15 border border-[#ff6a2b]/30 flex items-center justify-center text-[#ffb27a]">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs uppercase tracking-wider text-[#ffb27a]">
                      1. WHAT IS HAPPENING?
                    </h3>
                    <span className="text-[10px] text-[#a4a9d0]">WHAT WE OBSERVE</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-[#8692c8]">
                  Observed Data
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 mb-4 text-xs text-[#d5d9fa] leading-relaxed">
                <p className="font-semibold text-white mb-1">{decisionData.whatIsHappening.summary}</p>
                <p className="text-[#a4a9d0]">{decisionData.whatIsHappening.facultyDetail}</p>
              </div>

              {/* Important Signals List */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#c2d1ff] block">Important Signals:</span>
                <div className="grid grid-cols-2 gap-2">
                  {decisionData.whatIsHappening.importantSignals.slice(0, 6).map((sig) => (
                    <div
                      key={sig.id}
                      className="p-2.5 rounded-xl bg-[#080c24] border border-[#1d234a] flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="text-white font-medium block truncate max-w-[110px]">
                          {sig.name}
                        </span>
                        <span className="text-[10px] text-[#8692c8]">{sig.statusLabel}</span>
                      </div>
                      <div className="text-right">
                        <span
                          className={`font-mono text-xs font-bold ${
                            sig.trend === 'declining'
                              ? 'text-[#f87171]'
                              : sig.trend === 'improving'
                              ? 'text-[#34d399]'
                              : 'text-[#93c5fd]'
                          }`}
                        >
                          {sig.changeDisplay}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {decisionData.silentStruggleCorrelation && (
              <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-[#fbbf24] flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>
                  <strong>Silent Struggle Indicator: </strong>
                  {decisionData.silentStruggleCorrelation.patternDescription}
                </span>
              </div>
            )}
          </div>

          {/* SECTION 2: WHY MIGHT THIS BE HAPPENING? (POSSIBLE CONTRIBUTING FACTORS) */}
          <div className="rounded-2xl bg-[#0b0f2d] border border-[#222955] p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#818cf8]/15 border border-[#818cf8]/30 flex items-center justify-center text-[#a5b4fc]">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs uppercase tracking-wider text-[#a5b4fc]">
                      2. WHY MIGHT THIS BE HAPPENING?
                    </h3>
                    <span className="text-[10px] text-[#a4a9d0]">POSSIBLE CONTRIBUTING FACTORS</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-[#8692c8]">
                  Plausible Patterns
                </span>
              </div>

              {/* Factors List */}
              <div className="space-y-2.5 mb-4">
                {decisionData.whyMightThisBeHappening.factors.map((f, idx) => (
                  <div
                    key={f.id}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-3"
                  >
                    <span className="w-5 h-5 rounded-md bg-[#818cf8]/20 text-[#a5b4fc] text-xs font-mono font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="text-xs">
                      <span className="font-bold text-white block">{f.title}</span>
                      <p className="text-[#a4a9d0] mt-0.5">{f.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Synthesis */}
              <div className="p-3.5 rounded-xl bg-[#0e163b] border border-[#202d6b] text-xs text-[#c7d2fe] leading-relaxed">
                <strong className="text-white block mb-1">Synthesized Pattern:</strong>
                <p>{decisionData.whyMightThisBeHappening.synthesis}</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 text-[10px] text-[#8692c8] italic">
              {decisionData.whyMightThisBeHappening.responsibleNotice}
            </div>
          </div>

          {/* SECTION 3: WHAT SHOULD HAPPEN NEXT? (RECOMMENDED NEXT ACTIONS) */}
          <div className="rounded-2xl bg-[#0b0f2d] border border-[#222955] p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#2dd4bf]/15 border border-[#2dd4bf]/30 flex items-center justify-center text-[#5eead4]">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs uppercase tracking-wider text-[#5eead4]">
                      3. WHAT SHOULD HAPPEN NEXT?
                    </h3>
                    <span className="text-[10px] text-[#a4a9d0]">RECOMMENDED NEXT STEPS</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-[#8692c8]">
                  Low-Friction Actions
                </span>
              </div>

              {/* Recommended Actions List */}
              <div className="space-y-2.5">
                {decisionData.whatShouldHappenNext.recommendations.map((rec) => (
                  <div
                    key={rec.priority}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-md bg-[#2dd4bf]/15 text-[#5eead4] font-mono text-xs font-bold flex items-center justify-center shrink-0">
                        P{rec.priority}
                      </span>
                      <div className="text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{rec.area}</span>
                          <span className="text-[10px] text-[#93c5fd]">({rec.expectedEffort})</span>
                        </div>
                        <p className="text-[#c2d1ff] mt-0.5 font-medium">{rec.action}</p>
                        <p className="text-[11px] text-[#8692c8] mt-0.5">{rec.rationale}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action Triggers */}
            <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap gap-2">
              {onOpenDmModal && (
                <button
                  onClick={() => onOpenDmModal(decisionData.studentId)}
                  className="py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-[#ffb27a] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send Direct Care DM</span>
                </button>
              )}
              {onOpenLmsModal && (
                <button
                  onClick={() => onOpenLmsModal(decisionData.studentId)}
                  className="py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-[#5eead4] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Assign Practice Work</span>
                </button>
              )}
            </div>
          </div>

          {/* SECTION 4: WHAT SHOULD BE MONITORED? (WHAT TO MONITOR / MONITOR NEXT) */}
          <div className="rounded-2xl bg-[#0b0f2d] border border-[#222955] p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#c084fc]/15 border border-[#c084fc]/30 flex items-center justify-center text-[#d8b4fe]">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs uppercase tracking-wider text-[#d8b4fe]">
                      4. WHAT SHOULD BE MONITORED?
                    </h3>
                    <span className="text-[10px] text-[#a4a9d0]">WHAT TO MONITOR</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-[#8692c8]">
                  Trajectory Protocol
                </span>
              </div>

              {/* Monitor Targets Grid */}
              <div className="space-y-2.5 mb-4">
                {decisionData.whatShouldBeMonitored.targets.map((tgt) => (
                  <div
                    key={tgt.name}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-medium text-white">{tgt.name}</span>
                      <span className="block text-[11px] text-[#8692c8]">{tgt.reviewTimeframe}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-white text-sm">{tgt.currentValue}</span>
                      <span
                        className={`block text-[10px] font-semibold ${
                          tgt.targetDirection === 'Improving' ? 'text-[#34d399]' : 'text-[#93c5fd]'
                        }`}
                      >
                        Target: {tgt.targetDirection}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Review Guidance */}
              <div className="p-3.5 rounded-xl bg-[#140e2b] border border-[#3b236b] text-xs text-[#e9d5ff] leading-relaxed">
                <p>{decisionData.whatShouldBeMonitored.guidance}</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 text-[10px] text-[#8692c8]">
              Review Period: <strong>Next 7–14 review checkpoints</strong>
            </div>
          </div>
        </div>

        {/* EVIDENCE USED & RESPONSIBLE AI FOOTER */}
        <div className="p-4 rounded-2xl bg-[#0c1033] border border-[#222955] relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
          <div>
            <span className="font-bold text-white block mb-1">Evidence Used (Deterministic Telemetry):</span>
            <div className="flex flex-wrap gap-2">
              {decisionData.evidenceUsed.map((ev, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white/5 text-[#c2d1ff] text-[11px]"
                >
                  <CheckCircle2 className="w-3 h-3 text-[#2dd4bf]" />
                  {ev}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={() => setIsSupportPlanOpen(true)}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center gap-2 transition-colors shrink-0 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-[#ff6a2b]" />
            <span>Generate Support Blueprint</span>
          </button>
        </div>
      </div>

      {/* =========================================================
          EVOLYN LOOP: STEP 7 INTERVENTION INTELLIGENCE
          AI DECISION INTELLIGENCE
                  ↓
          INTERVENTION INTELLIGENCE
                  ↓
          RECOMMENDED ACTIONS
                  ↓
          FACULTY ACTION
                  ↓
          SUPPORT PLAN
                  ↓
          INTERVENTION HISTORY
      ========================================================= */}
      <InterventionIntelligencePanel
        studentId={selectedStudentId}
        onOpenDmModal={onOpenDmModal}
        onOpenLmsModal={onOpenLmsModal}
      />

      {/* Support Plan Modal */}
      <SupportPlanModal
        isOpen={isSupportPlanOpen}
        onClose={() => setIsSupportPlanOpen(false)}
        decisionData={decisionData}
        onDispatchIntervention={onDispatchSupportPlan}
      />
    </div>
  );
};
