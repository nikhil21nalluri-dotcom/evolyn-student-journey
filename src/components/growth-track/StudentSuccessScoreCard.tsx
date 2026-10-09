import React, { useState } from 'react';
import {
  StudentSuccessScoreData,
  getStudentSuccessScore,
  SUCCESS_SCORE_WEIGHTS,
} from '../../data/studentSuccessScore';
import { useAuth } from '../../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Calculator,
  Bell,
  UserCheck,
  Calendar,
  CalendarPlus,
  Clock,
  MessageSquare,
  Send,
  Check,
  X,
  Mail,
  FileText,
  Users,
} from 'lucide-react';

interface StudentSuccessScoreCardProps {
  studentIdOrName: string;
  onNavigateToSilentStruggle?: () => void;
  onScrollToGrowthMap?: () => void;
  onNotifyAdvisor?: (studentName: string, score: number) => void;
  onScheduleCheckIn?: (studentName: string, score: number) => void;
}

interface ActionFeedback {
  type: 'advisor' | 'checkin';
  title: string;
  detail: string;
  timestamp: string;
}

export const StudentSuccessScoreCard: React.FC<StudentSuccessScoreCardProps> = ({
  studentIdOrName,
  onNavigateToSilentStruggle,
  onScrollToGrowthMap,
  onNotifyAdvisor,
  onScheduleCheckIn,
}) => {
  const { user, userProfile } = useAuth();
  const [showFormulaDetails, setShowFormulaDetails] = useState<boolean>(false);
  const [selectedDimensionId, setSelectedDimensionId] = useState<string | null>(null);

  // Modal states
  const [isNotifyAdvisorOpen, setIsNotifyAdvisorOpen] = useState<boolean>(false);
  const [isScheduleCheckInOpen, setIsScheduleCheckInOpen] = useState<boolean>(false);
  const [feedbackBanner, setFeedbackBanner] = useState<ActionFeedback | null>(null);

  // Form states for Notify Advisor
  const [advisorRole, setAdvisorRole] = useState<string>('Primary Academic Advisor');
  const [urgencyLevel, setUrgencyLevel] = useState<string>('Standard Review');
  const [advisorSubject, setAdvisorSubject] = useState<string>('');
  const [advisorNotes, setAdvisorNotes] = useState<string>('');
  const [isSubmittingAdvisor, setIsSubmittingAdvisor] = useState<boolean>(false);

  // Form states for Schedule Check-in
  const [checkInType, setCheckInType] = useState<string>('1-on-1 Mentorship Dialogue');
  const [timeframe, setTimeframe] = useState<string>('Within 48 Hours');
  const [preferredSlot, setPreferredSlot] = useState<string>('Afternoon (2:00 PM – 4:00 PM)');
  const [customAgenda, setCustomAgenda] = useState<string>('');
  const [isSubmittingCheckIn, setIsSubmittingCheckIn] = useState<boolean>(false);

  const scoreData: StudentSuccessScoreData = getStudentSuccessScore(studentIdOrName);

  const isImproving = scoreData.trend === 'improving';
  const isDeclining = scoreData.trend === 'declining';

  const selectedDim = scoreData.dimensions.find((d) => d.id === selectedDimensionId);

  // Lowest scoring dimension for targeted intervention
  const lowestDimension = [...scoreData.dimensions].sort((a, b) => a.currentScore - b.currentScore)[0];
  const attentionDimensions = scoreData.dimensions.filter((d) => d.category === 'attention');

  // Open Notify Advisor Modal with prefilled smart defaults
  const handleOpenNotifyAdvisor = () => {
    const focusNames = attentionDimensions.map((d) => `${d.name} (${d.currentScore}/100)`).join(', ');
    const autoSubject = `[Success Score Alert] ${scoreData.studentName} — Review Dossier (Score: ${scoreData.currentScore}/100)`;
    const autoNotes = `Student Success Score currently stands at ${scoreData.currentScore}/100 (${
      scoreData.change >= 0 ? `+${scoreData.change}` : scoreData.change
    } pts change).\n\nKey areas needing attention: ${
      focusNames || `${lowestDimension.name} (${lowestDimension.currentScore}/100)`
    }.\n\nAcademic grounding remains active. Constructive advisor outreach requested to reinforce momentum before upcoming semester evaluations.`;

    setAdvisorSubject(autoSubject);
    setAdvisorNotes(autoNotes);
    setUrgencyLevel(scoreData.currentScore < 70 || isDeclining ? 'Elevated Priority' : 'Standard Review');
    setIsNotifyAdvisorOpen(true);
  };

  // Open Schedule Check-in Modal with prefilled smart defaults
  const handleOpenScheduleCheckIn = () => {
    setCheckInType(
      lowestDimension.id === 'skills_communication'
        ? 'Skills & Peer Collaboration Mentorship'
        : lowestDimension.id === 'placement_readiness'
        ? 'Placement Readiness & Roadmap Touchpoint'
        : lowestDimension.id === 'lms_engagement'
        ? 'Learning Rhythm & Platform Sync'
        : '1-on-1 Mentorship Dialogue'
    );
    setTimeframe(isDeclining ? 'Within 24–48 Hours' : 'This Week');
    setCustomAgenda(
      `Supportive session to review ${lowestDimension.name} condition (${lowestDimension.currentScore}/100), acknowledge strengths in ${
        scoreData.areasOfStrength[0]?.dimensionName || 'Academics'
      }, and co-create low-pressure next steps.`
    );
    setIsScheduleCheckInOpen(true);
  };

  // Submit Notify Advisor
  const handleSubmitNotifyAdvisor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAdvisor(true);

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    // Save to Firestore if authenticated
    if (user) {
      try {
        const interventionId = `advisor-notify-${Date.now()}`;
        await setDoc(doc(db, 'interventions', interventionId), {
          id: interventionId,
          studentId: scoreData.studentId,
          authorId: user.uid,
          authorEmail: user.email || 'advisor@evolyn.internal',
          authorName: userProfile?.displayName || user.displayName || 'Authorized Advisor',
          title: advisorSubject || `Advisor Notification: ${scoreData.studentName}`,
          content: `${advisorNotes}\n\n[Assigned To: ${advisorRole} | Priority: ${urgencyLevel}]`,
          strategy: 'Advisor Alert Dispatch',
          createdAt: formattedDate,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'interventions/advisor-notify');
      }
    }

    if (onNotifyAdvisor) {
      onNotifyAdvisor(scoreData.studentName, scoreData.currentScore);
    }

    setIsSubmittingAdvisor(false);
    setIsNotifyAdvisorOpen(false);

    setFeedbackBanner({
      type: 'advisor',
      title: `Advisor Alert Dispatched to ${advisorRole}`,
      detail: `Notification and Success Score telemetry dossier (${scoreData.currentScore}/100) recorded for ${scoreData.studentName}.`,
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    // Clear feedback banner after 7 seconds
    setTimeout(() => {
      setFeedbackBanner(null);
    }, 7000);
  };

  // Submit Schedule Check-in
  const handleSubmitScheduleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingCheckIn(true);

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    // Save to Firestore if authenticated
    if (user) {
      try {
        const interventionId = `checkin-${Date.now()}`;
        await setDoc(doc(db, 'interventions', interventionId), {
          id: interventionId,
          studentId: scoreData.studentId,
          authorId: user.uid,
          authorEmail: user.email || 'advisor@evolyn.internal',
          authorName: userProfile?.displayName || user.displayName || 'Authorized Advisor',
          title: `Scheduled Check-in: ${checkInType}`,
          content: `Timeframe: ${timeframe} (${preferredSlot})\nAgenda: ${customAgenda}\nStudent Success Score Baseline: ${scoreData.currentScore}/100`,
          strategy: 'Direct Student Check-in',
          createdAt: formattedDate,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'interventions/checkin');
      }
    }

    if (onScheduleCheckIn) {
      onScheduleCheckIn(scoreData.studentName, scoreData.currentScore);
    }

    setIsSubmittingCheckIn(false);
    setIsScheduleCheckInOpen(false);

    setFeedbackBanner({
      type: 'checkin',
      title: `Check-in Scheduled (${timeframe})`,
      detail: `${checkInType} confirmed for ${scoreData.studentName}. Agenda aligned with ${lowestDimension.name} guidance.`,
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    // Clear feedback banner after 7 seconds
    setTimeout(() => {
      setFeedbackBanner(null);
    }, 7000);
  };

  return (
    <div className="mb-14 p-6 sm:p-10 rounded-3xl glass-card border border-[rgba(140,150,255,0.22)] shadow-2xl relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(circle,rgba(255,106,43,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[radial-gradient(circle,rgba(111,141,255,0.12)_0%,transparent_70%)] pointer-events-none" />

      {/* Real-time Feedback Banner after intervention action */}
      {feedbackBanner && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#141b4d] to-[#12163b] border border-[#6f8dff]/40 shadow-xl flex items-start justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                feedbackBanner.type === 'advisor'
                  ? 'bg-[#6f8dff]/20 text-[#a3b8ff] border border-[#6f8dff]/30'
                  : 'bg-[#ff6a2b]/20 text-[#ffb27a] border border-[#ff6a2b]/30'
              }`}
            >
              {feedbackBanner.type === 'advisor' ? (
                <UserCheck className="w-5 h-5 text-[#6f8dff]" />
              ) : (
                <CalendarPlus className="w-5 h-5 text-[#ff6a2b]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-baskerville font-bold text-white text-sm sm:text-base">
                  {feedbackBanner.title}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Logged at {feedbackBanner.timestamp}
                </span>
              </div>
              <p className="text-xs text-[#c4ccf5] mt-0.5 leading-relaxed">
                {feedbackBanner.detail}
              </p>
            </div>
          </div>
          <button
            onClick={() => setFeedbackBanner(null)}
            className="text-[#8e96c8] hover:text-white text-xs p-1 rounded hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Header Bar with Responsible Terminology Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(140,150,255,0.18)]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold tracking-widest uppercase text-[#ffb27a] rounded-full bg-[rgba(255,106,43,0.12)] border border-[#ff6a2b]/30 mb-2 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-[#ff6a2b]" />
            <span>Composite Indicator · Student Success Score</span>
          </div>

          <h2 className="font-baskerville text-3xl sm:text-4xl font-bold text-[#f0f1ff] tracking-tight">
            Student Success Score
          </h2>

          <p className="text-xs sm:text-sm text-[#a4a9d0] mt-1 max-w-2xl leading-relaxed">
            A transparent composite indicator representing <span className="text-white font-medium">{scoreData.studentName}&apos;s</span> overall success &amp; learning readiness condition.
          </p>
        </div>

        {/* Responsible AI Disclaimer Badge */}
        <div className="p-3 rounded-2xl bg-[rgba(14,16,40,0.7)] border border-white/10 flex items-center gap-3 shrink-0 text-left">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-[11px] leading-tight">
            <strong className="text-white block font-medium">Responsible Indicator</strong>
            <span className="text-[#a4a9d0]/80">Not a probability of success/failure</span>
          </div>
        </div>
      </div>

      {/* 2. Top Summary Display: Score, Trend, Synthesis & PRIMARY ACTION BUTTONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-8 items-stretch">
        {/* Main Score Hero Card (5 Cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-gradient-to-br from-[#101438] to-[#0a0d24] border border-[#6f8dff]/30 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono uppercase text-[#9bb0ff]">
              <span>Current Success Indicator</span>
              <span className="px-2 py-0.5 rounded bg-[#6f8dff]/20 text-[#c2d1ff] font-bold">
                Scale 0–100
              </span>
            </div>

            <div className="my-5 flex items-baseline gap-4">
              <div className="font-baskerville text-6xl sm:text-7xl font-black text-white tracking-tight">
                {scoreData.currentScore}
              </div>
              <div className="text-[#a4a9d0] font-mono text-xl sm:text-2xl font-medium">
                / 100
              </div>

              {/* Trend Indicator Pill */}
              <div className="ml-auto flex flex-col items-end">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold ${
                    isImproving
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                      : isDeclining
                      ? 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                      : 'bg-blue-950/60 text-blue-300 border border-blue-500/30'
                  }`}
                >
                  {isImproving ? (
                    <>
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      <span>+{scoreData.change} pts</span>
                    </>
                  ) : isDeclining ? (
                    <>
                      <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                      <span>{scoreData.change} pts</span>
                    </>
                  ) : (
                    <>
                      <Minus className="w-3.5 h-3.5 text-blue-400" />
                      <span>Stable</span>
                    </>
                  )}
                </span>
                <span className="text-[11px] text-[#a4a9d0] font-mono mt-1">
                  Previous: <strong className="text-white">{scoreData.previousScore}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[rgba(140,150,255,0.15)] flex items-center justify-between text-xs text-[#a4a9d0]">
            <span className="font-mono">Status Assessment:</span>
            <span className="font-baskerville font-bold text-white text-right">
              {scoreData.indicatorLabel}
            </span>
          </div>
        </div>

        {/* Synthesis & Primary Action Buttons (7 Cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#090b22]/80 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#ff8a50] font-semibold">
                Telemetry Synthesis
              </span>
              <button
                onClick={() => setShowFormulaDetails(!showFormulaDetails)}
                className="text-xs text-[#6f8dff] hover:text-white flex items-center gap-1.5 font-mono cursor-pointer transition-colors"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>{showFormulaDetails ? 'Hide Calculation' : 'View Formula Breakdown'}</span>
              </button>
            </div>

            <p className="text-xs sm:text-sm text-[#d4daf5] leading-relaxed font-serif italic">
              &ldquo;{scoreData.indicatorDescription}&rdquo;
            </p>

            {/* Interactive Formula Dropdown */}
            {showFormulaDetails && (
              <div className="mt-4 p-3.5 rounded-xl bg-black/40 border border-[#6f8dff]/30 text-xs font-mono text-[#a4a9d0] space-y-1.5 animate-fadeIn">
                <div className="text-white font-bold flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-[#ff6a2b]" />
                  <span>Deterministic Calculation Formula:</span>
                </div>
                <div className="text-[11px] text-[#ffb27a] font-mono overflow-x-auto py-1">
                  Score = (Academic × 25%) + (Attendance × 10%) + (LMS × 10%) + (Student Engagement × 15%) + (Skills &amp; Comm × 15%) + (Placement × 15%) + (Feedback × 10%)
                </div>
                <div className="text-[10px] text-[#8e96c8] pt-1 border-t border-white/5">
                  {scoreData.formulaExplanation.calculationText} · Sum of weights equals exactly 100%.
                </div>
              </div>
            )}
          </div>

          {/* IMMEDIATE INTERVENTION ACTION BUTTONS PANEL */}
          <div className="mt-6 pt-5 border-t border-[rgba(140,150,255,0.18)]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#a3b8ff] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#ff6a2b]" />
                <span>Immediate Intervention Actions</span>
              </span>
              <span className="text-[10px] text-[#8e96c8] font-mono">
                Triggered from Success Score data
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Button 1: Notify Advisor */}
              <button
                type="button"
                onClick={handleOpenNotifyAdvisor}
                className="group relative p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-[#171e54] to-[#12163f] hover:from-[#212b74] hover:to-[#171c4f] border border-[#6f8dff]/40 hover:border-[#6f8dff] text-white text-xs font-semibold shadow-lg shadow-[#6f8dff]/15 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#6f8dff]/20 text-[#a3b8ff] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <UserCheck className="w-4 h-4 text-[#a3b8ff]" />
                  </div>
                  <div className="text-left">
                    <span className="block font-baskerville font-bold text-white text-xs sm:text-sm">
                      Notify Advisor
                    </span>
                    <span className="text-[10px] text-[#8e96c8] font-mono block">
                      Dispatch score dossier &amp; alert
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#6f8dff] group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>

              {/* Button 2: Schedule Check-in */}
              <button
                type="button"
                onClick={handleOpenScheduleCheckIn}
                className="group relative p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-[#ff6a2b] to-[#ff8a50] hover:brightness-110 text-white text-xs font-semibold shadow-lg shadow-[#ff6a2b]/25 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-black/20 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <CalendarPlus className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <span className="block font-baskerville font-bold text-white text-xs sm:text-sm">
                      Schedule Check-in
                    </span>
                    <span className="text-[10px] text-white/80 font-mono block">
                      1-on-1 mentorship session
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. The Seven Scoring Dimensions Breakdown */}
      <div className="mb-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-4">
          <div>
            <h3 className="font-baskerville text-xl sm:text-2xl font-bold text-[#f0f1ff]">
              Scoring Dimensions Breakdown
            </h3>
            <p className="text-xs sm:text-sm text-[#a4a9d0]">
              Seven transparent dimensions powering the composite Student Success Score. Click any row for details.
            </p>
          </div>
          <span className="text-xs font-mono text-[#ff8a50]">7-Vector Architecture (100% Total Weight)</span>
        </div>

        <div className="space-y-2.5">
          {scoreData.dimensions.map((dim) => {
            const isDimImproving = dim.change > 0;
            const isDimDeclining = dim.change < 0;
            const isSelected = selectedDimensionId === dim.id;

            return (
              <div
                key={dim.id}
                onClick={() => setSelectedDimensionId(isSelected ? null : dim.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#141842] border-[#ff6a2b] shadow-lg shadow-[#ff6a2b]/10'
                    : 'bg-[#0a0d26]/80 border-white/10 hover:bg-[#101438] hover:border-white/20'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Dimension Name and Category Badge */}
                  <div className="flex items-center gap-3 md:w-1/3">
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        dim.category === 'strength'
                          ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                          : dim.category === 'attention'
                          ? 'bg-[#ff6a2b] shadow-sm shadow-[#ff6a2b]/50'
                          : 'bg-[#6f8dff]'
                      }`}
                    />
                    <div>
                      <div className="font-baskerville font-bold text-sm sm:text-base text-white">
                        {dim.name}
                      </div>
                      <div className="text-[11px] font-mono text-[#a4a9d0]">
                        Weight: <strong className="text-white">{dim.weightLabel}</strong> · Contribution: <strong className="text-[#ffb27a] font-mono">{dim.weightedContribution.toFixed(1)} pts</strong>
                      </div>
                    </div>
                  </div>

                  {/* Visual Score Bar in center */}
                  <div className="flex-1 max-w-md mx-auto w-full px-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#a4a9d0] mb-1">
                      <span>Score Depth</span>
                      <span className="font-bold text-white">
                        {dim.isAssessed ? `${dim.currentScore} / 100` : 'Not assessed yet'}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          !dim.isAssessed
                            ? 'bg-white/20'
                            : dim.category === 'strength'
                            ? 'bg-gradient-to-r from-[#6f8dff] to-emerald-400'
                            : dim.category === 'attention'
                            ? 'bg-gradient-to-r from-[#ff6a2b] to-rose-400'
                            : 'bg-gradient-to-r from-[#6f8dff] to-[#ffb27a]'
                        }`}
                        style={{ width: `${dim.isAssessed ? Math.max(0, dim.currentScore) : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Score & Historical Trend Values */}
                  <div className="flex items-center justify-between md:justify-end gap-4 md:w-1/4">
                    <div className="text-right font-mono">
                      <span className="font-baskerville text-xl sm:text-2xl font-bold text-white">
                        {dim.isAssessed ? dim.currentScore : '—'}
                      </span>
                      <span className="text-[11px] text-[#a4a9d0] block">
                        {dim.isAssessed ? `Prev: ${dim.previousScore}` : 'Not assessed yet'}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 font-mono text-xs px-2.5 py-1 rounded-full ${
                        !dim.isAssessed
                          ? 'bg-white/5 text-[#a4a9d0] border border-white/10'
                          : isDimImproving
                          ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/20'
                          : isDimDeclining
                          ? 'bg-rose-950/50 text-rose-300 border border-rose-500/20'
                          : 'bg-blue-950/50 text-blue-300 border border-blue-500/20'
                      }`}
                    >
                      {!dim.isAssessed ? (
                        <span>Pending</span>
                      ) : isDimImproving ? (
                        <>
                          <TrendingUp className="w-3 h-3 text-emerald-400" />
                          <span>+{dim.change}</span>
                        </>
                      ) : isDimDeclining ? (
                        <>
                          <TrendingDown className="w-3 h-3 text-rose-400" />
                          <span>{dim.change}</span>
                        </>
                      ) : (
                        <>
                          <Minus className="w-3 h-3 text-blue-400" />
                          <span>0</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Expanded Inspection Description */}
                {isSelected && (
                  <div className="mt-3 pt-3 border-t border-white/10 text-xs text-[#d0d6fa] flex items-start gap-2 animate-fadeIn">
                    <HelpCircle className="w-4 h-4 text-[#ff6a2b] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-medium">{dim.name} Context:</strong>
                      <span>{dim.description}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Areas of Strength & Areas Needing Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Areas of Strength (6 Cols) */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-[#090d26]/80 border-l-4 border-l-emerald-500 border-t border-r border-b border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h4 className="font-baskerville text-lg sm:text-xl font-bold text-white">
                Areas of Strength
              </h4>
            </div>

            <div className="space-y-3">
              {scoreData.areasOfStrength.map((st, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-black/30 border border-emerald-500/15 text-xs text-[#a4a9d0]"
                >
                  <div className="flex items-center justify-between mb-1 font-baskerville font-bold text-sm text-white">
                    <span>✓ {st.dimensionName}</span>
                    <span className="text-emerald-400 font-mono text-xs">{st.score}/100</span>
                  </div>
                  <p className="leading-relaxed">{st.highlight}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-emerald-300/80 font-mono flex items-center gap-1.5">
            <span>•</span>
            <span>Anchor assets providing stability across the student&apos;s learning journey</span>
          </div>
        </div>

        {/* Areas Needing Attention (6 Cols) */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-[#090d26]/80 border-l-4 border-l-[#ff6a2b] border-t border-r border-b border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#ff6a2b]" />
                <h4 className="font-baskerville text-lg sm:text-xl font-bold text-white">
                  Areas Needing Attention
                </h4>
              </div>
              <span className="text-[10px] font-mono uppercase bg-[#ff6a2b]/15 text-[#ff8a50] px-2 py-0.5 rounded border border-[#ff6a2b]/30">
                Action Recommended
              </span>
            </div>

            <div className="space-y-3">
              {scoreData.areasNeedingAttention.map((att, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-black/30 border border-[#ff6a2b]/20 text-xs text-[#a4a9d0]"
                >
                  <div className="flex items-center justify-between mb-1 font-baskerville font-bold text-sm text-white">
                    <span>⚠ {att.dimensionName}</span>
                    <span className="text-[#ff8a50] font-mono text-xs">{att.score}/100</span>
                  </div>
                  <p className="leading-relaxed mb-1.5 text-rose-200/80">{att.concern}</p>
                  <div className="p-2 rounded bg-[rgba(255,106,43,0.08)] text-[11px] text-[#ffb27a] leading-relaxed">
                    <strong>Constructive Guidance:</strong> {att.constructiveGuidance}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick-action buttons embedded directly in Areas Needing Attention */}
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <span className="text-[11px] text-[#ffb27a]/90 font-mono">
              Take action on these areas:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenNotifyAdvisor}
                className="px-3 py-1.5 rounded-lg text-xs font-mono bg-[#141a4a] hover:bg-[#1f2868] text-[#c2d1ff] border border-[#6f8dff]/40 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#6f8dff]" />
                <span>Notify Advisor</span>
              </button>
              <button
                type="button"
                onClick={handleOpenScheduleCheckIn}
                className="px-3 py-1.5 rounded-lg text-xs font-mono bg-[#ff6a2b]/20 hover:bg-[#ff6a2b]/30 text-[#ffb27a] border border-[#ff6a2b]/40 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <CalendarPlus className="w-3.5 h-3.5 text-[#ff6a2b]" />
                <span>Schedule Check-in</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Cross-Module Navigation Bridge */}
      <div className="p-5 rounded-2xl bg-[rgba(14,16,40,0.65)] border border-[rgba(140,150,255,0.18)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-[#a4a9d0]">
          <strong className="text-white block font-baskerville text-sm mb-0.5">
            Cross-Feature Deep Telemetry
          </strong>
          <span>
            Connect this Success Score to latent behavioral signals or topological growth maps.
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => {
              document.getElementById('unified-student-data-profile')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-4 py-2 rounded-full text-xs font-baskerville font-bold text-[#c2d1ff] bg-[#6f8dff]/15 border border-[#6f8dff]/40 hover:bg-[#6f8dff]/25 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>Unified Profile (7 Sources)</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#6f8dff]" />
          </button>

          {onScrollToGrowthMap && (
            <button
              onClick={onScrollToGrowthMap}
              className="px-4 py-2 rounded-full text-xs font-baskerville font-bold text-white bg-black/40 border border-white/20 hover:border-[#6f8dff] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Explore Growth Map</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#6f8dff]" />
            </button>
          )}

          {onNavigateToSilentStruggle && (
            <button
              onClick={onNavigateToSilentStruggle}
              className="px-4 py-2 rounded-full text-xs font-baskerville font-bold text-white bg-gradient-to-r from-[#ff6a2b] to-[#6f8dff] hover:opacity-95 shadow-md shadow-[#ff6a2b]/25 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Silent Struggle Analysis</span>
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* =================================================================
          MODAL 1: NOTIFY ADVISOR MODAL
      ================================================================= */}
      {isNotifyAdvisorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0b0f2e] border border-[#6f8dff]/40 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {/* Ambient Modal Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle,rgba(111,141,255,0.18)_0%,transparent_70%)] pointer-events-none" />

            <div className="flex items-center justify-between pb-4 border-b border-[#212756]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#6f8dff]/20 border border-[#6f8dff]/40 flex items-center justify-center text-white">
                  <UserCheck className="w-5 h-5 text-[#a3b8ff]" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white font-baskerville">
                    Notify Advisor
                  </h3>
                  <div className="text-xs text-[#8e96c8] font-mono">
                    Target Student: <span className="text-white font-semibold">{scoreData.studentName}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsNotifyAdvisorOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#8e96c8] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Score Dossier Strip */}
            <div className="my-5 p-3.5 rounded-2xl bg-[#10143a] border border-[#6f8dff]/25 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-3">
                <span className="font-baskerville text-2xl font-black text-white">
                  {scoreData.currentScore}
                  <span className="text-xs text-[#8e96c8] font-normal"> / 100</span>
                </span>
                <div>
                  <span className="text-white font-semibold block">{scoreData.indicatorLabel}</span>
                  <span className="text-[#8e96c8] text-[11px]">
                    Trend: {scoreData.change >= 0 ? `+${scoreData.change}` : scoreData.change} pts vs baseline
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-[#ff8a50] uppercase tracking-wider block">
                  Focus Dimensions
                </span>
                <span className="text-white text-[11px] font-sans">
                  {attentionDimensions.map((d) => d.name).join(', ') || lowestDimension.name}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmitNotifyAdvisor} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#a4addd] font-mono mb-1.5 uppercase tracking-wider text-[11px]">
                    Advisor / Recipient
                  </label>
                  <select
                    value={advisorRole}
                    onChange={(e) => setAdvisorRole(e.target.value)}
                    className="w-full bg-[#07091d] border border-[#242b5c] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#6f8dff]"
                  >
                    <option value="Primary Academic Advisor">Primary Academic Advisor</option>
                    <option value="Department Chair / HOD">Department Chair / HOD</option>
                    <option value="Placement &amp; Career Cell Lead">Placement &amp; Career Cell Lead</option>
                    <option value="Peer Tutoring &amp; Learning Support">Peer Tutoring &amp; Learning Support</option>
                    <option value="Student Well-being Counselor">Student Well-being Counselor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#a4addd] font-mono mb-1.5 uppercase tracking-wider text-[11px]">
                    Urgency Level
                  </label>
                  <select
                    value={urgencyLevel}
                    onChange={(e) => setUrgencyLevel(e.target.value)}
                    className="w-full bg-[#07091d] border border-[#242b5c] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#6f8dff]"
                  >
                    <option value="Standard Review">Standard Review (Within 5 Days)</option>
                    <option value="Elevated Priority">Elevated Priority (Within 48 Hours)</option>
                    <option value="Immediate Attention">Immediate Attention (Same Day)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#a4addd] font-mono mb-1.5 uppercase tracking-wider text-[11px]">
                  Alert Subject
                </label>
                <input
                  type="text"
                  value={advisorSubject}
                  onChange={(e) => setAdvisorSubject(e.target.value)}
                  className="w-full bg-[#07091d] border border-[#242b5c] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#6f8dff]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#a4addd] font-mono mb-1.5 uppercase tracking-wider text-[11px]">
                  Score Context &amp; Recommended Action
                </label>
                <textarea
                  value={advisorNotes}
                  onChange={(e) => setAdvisorNotes(e.target.value)}
                  rows={4}
                  className="w-full bg-[#07091d] border border-[#242b5c] rounded-xl p-3 text-white text-xs leading-relaxed focus:outline-none focus:border-[#6f8dff] resize-none"
                  required
                />
              </div>

              <div className="pt-3 border-t border-[#212756] flex items-center justify-between gap-3">
                <span className="text-[11px] text-[#8e96c8] font-mono">
                  {user ? 'Logs to Firestore Interventions' : 'Demo Session Mode'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNotifyAdvisorOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingAdvisor}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#6f8dff] to-[#4561ff] hover:brightness-110 text-white text-xs font-semibold shadow-lg shadow-[#6f8dff]/25 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmittingAdvisor ? 'Dispatching...' : 'Dispatch Alert'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================
          MODAL 2: SCHEDULE CHECK-IN MODAL
      ================================================================= */}
      {isScheduleCheckInOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0b0f2e] border border-[#ff6a2b]/40 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {/* Ambient Modal Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle,rgba(255,106,43,0.18)_0%,transparent_70%)] pointer-events-none" />

            <div className="flex items-center justify-between pb-4 border-b border-[#212756]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ff6a2b]/20 border border-[#ff6a2b]/40 flex items-center justify-center text-white">
                  <CalendarPlus className="w-5 h-5 text-[#ff6a2b]" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white font-baskerville">
                    Schedule Check-in
                  </h3>
                  <div className="text-xs text-[#8e96c8] font-mono">
                    Student: <span className="text-white font-semibold">{scoreData.studentName}</span> · Success Score: <span className="text-[#ffb27a] font-bold">{scoreData.currentScore}/100</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsScheduleCheckInOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#8e96c8] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Score Guided Talking Points Strip */}
            <div className="my-4 p-3.5 rounded-2xl bg-gradient-to-br from-[#12163b] to-[#0a0d24] border border-[#ff6a2b]/25 text-xs">
              <div className="text-[#ff8a50] font-mono text-[11px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#ff6a2b]" />
                <span>Score-Grounded Conversation Prompts</span>
              </div>
              <ul className="space-y-1 text-[#d4daf5] text-[11px] leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold shrink-0">1.</span>
                  <span><strong>Affirm Baseline:</strong> Celebrate solid strength in {scoreData.areasOfStrength[0]?.dimensionName || 'Academics'} ({scoreData.areasOfStrength[0]?.score || 88}/100).</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#ff8a50] font-bold shrink-0">2.</span>
                  <span><strong>Empathetic Exploration:</strong> Inquire gently about comfort in {lowestDimension.name} without introducing high stakes.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#6f8dff] font-bold shrink-0">3.</span>
                  <span><strong>Micro-Goal:</strong> Establish a low-friction 10-day touchpoint or connect with peer study circles.</span>
                </li>
              </ul>
            </div>

            <form onSubmit={handleSubmitScheduleCheckIn} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#a4addd] font-mono mb-1.5 uppercase tracking-wider text-[11px]">
                    Session Type
                  </label>
                  <select
                    value={checkInType}
                    onChange={(e) => setCheckInType(e.target.value)}
                    className="w-full bg-[#07091d] border border-[#242b5c] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#ff6a2b]"
                  >
                    <option value="1-on-1 Mentorship Dialogue">1-on-1 Mentorship Dialogue</option>
                    <option value="Skills &amp; Peer Collaboration Mentorship">Skills &amp; Collaboration Mentorship</option>
                    <option value="Placement Readiness &amp; Roadmap Touchpoint">Placement Readiness Touchpoint</option>
                    <option value="Learning Rhythm &amp; Platform Sync">Learning Rhythm &amp; Platform Sync</option>
                    <option value="Informal Coffee / Office Hours Chat">Informal Office Hours Chat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#a4addd] font-mono mb-1.5 uppercase tracking-wider text-[11px]">
                    Target Timeframe
                  </label>
                  <select
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    className="w-full bg-[#07091d] border border-[#242b5c] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#ff6a2b]"
                  >
                    <option value="Within 24–48 Hours">Within 24–48 Hours (High Priority)</option>
                    <option value="This Week">This Week (Recommended)</option>
                    <option value="Next Week">Next Week</option>
                    <option value="Post-Midterm Window">Post-Midterm Window</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#a4addd] font-mono mb-1.5 uppercase tracking-wider text-[11px]">
                  Preferred Time Slot
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    'Morning (10:00 AM)',
                    'Afternoon (2:30 PM)',
                    'Late (4:30 PM)',
                  ].map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setPreferredSlot(slot)}
                      className={`p-2 rounded-xl text-[11px] font-mono border text-center transition-all ${
                        preferredSlot === slot
                          ? 'bg-[#ff6a2b]/20 border-[#ff6a2b] text-white font-bold'
                          : 'bg-[#07091d] border-[#242b5c] text-[#8e96c8] hover:text-white'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[#a4addd] font-mono mb-1.5 uppercase tracking-wider text-[11px]">
                  Check-in Agenda &amp; Focus
                </label>
                <textarea
                  value={customAgenda}
                  onChange={(e) => setCustomAgenda(e.target.value)}
                  rows={3}
                  className="w-full bg-[#07091d] border border-[#242b5c] rounded-xl p-3 text-white text-xs leading-relaxed focus:outline-none focus:border-[#ff6a2b] resize-none"
                  required
                />
              </div>

              <div className="pt-3 border-t border-[#212756] flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-[11px] text-[#8e96c8] font-mono">
                  <Calendar className="w-3.5 h-3.5 text-[#ff6a2b]" />
                  <span>Syncs to Evolyn Student Journey Calendar</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsScheduleCheckInOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingCheckIn}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff6a2b] to-[#ff8a50] hover:brightness-110 text-white text-xs font-semibold shadow-lg shadow-[#ff6a2b]/25 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isSubmittingCheckIn ? 'Scheduling...' : 'Confirm Check-in'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
