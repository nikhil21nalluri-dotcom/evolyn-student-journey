import React, { useState } from 'react';
import {
  X,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Clock,
  Target,
  FileCheck,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { InterventionRecord, BeforeMetrics, OutcomeReview } from '../../data/interventionIntelligenceEngine';
import { useIntervention } from '../../context/InterventionContext';

interface InterventionOutcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  intervention: InterventionRecord;
  onSuccess?: (msg: string) => void;
}

export const InterventionOutcomeModal: React.FC<InterventionOutcomeModalProps> = ({
  isOpen,
  onClose,
  intervention,
  onSuccess,
}) => {
  const { recordInterventionOutcome } = useIntervention();

  const before = intervention.beforeMetrics;

  const [evaluatorName, setEvaluatorName] = useState('Prof. Elena Vance');
  const [evaluatorRole, setEvaluatorRole] = useState('Faculty Advisor, CSE');
  const [outcomeRating, setOutcomeRating] = useState<OutcomeReview['outcomeRating']>('PROGRESS_OBSERVED');
  
  // Seed after metrics with positive development from baseline
  const [afterSuccessScore, setAfterSuccessScore] = useState(Math.min(100, before.successScore + 5));
  const [afterCommunication, setAfterCommunication] = useState(Math.min(100, before.communication + 12));
  const [afterEngagement, setAfterEngagement] = useState(Math.min(100, before.engagement + 7));
  const [afterPlacement, setAfterPlacement] = useState(Math.min(100, before.placementReadiness + 10));
  const [afterAttendance, setAfterAttendance] = useState(Math.min(100, before.attendance + 3));

  const [qualitativeNotes, setQualitativeNotes] = useState(
    'Student engaged with high commitment. Noticeable increase in verbal poise and technical articulation.'
  );
  const [recommendedNextStep, setRecommendedNextStep] = useState(
    'Maintain regular Fluencis practice; eligible for campus placement mock panel round 2.'
  );

  if (!isOpen) return null;

  const scoreDelta = afterSuccessScore - before.successScore;
  const commDelta = afterCommunication - before.communication;
  const engDelta = afterEngagement - before.engagement;
  const placeDelta = afterPlacement - before.placementReadiness;
  const attDelta = afterAttendance - before.attendance;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const afterMetrics: BeforeMetrics = {
      successScore: Number(afterSuccessScore),
      communication: Number(afterCommunication),
      engagement: Number(afterEngagement),
      placementReadiness: Number(afterPlacement),
      attendance: Number(afterAttendance),
    };

    recordInterventionOutcome(intervention.id, {
      evaluatorName: evaluatorName.trim(),
      evaluatorRole: evaluatorRole.trim(),
      afterMetrics,
      outcomeRating,
      qualitativeOutcomeNotes: qualitativeNotes.trim(),
      recommendedNextStep: recommendedNextStep.trim(),
    });

    if (onSuccess) {
      onSuccess(`Recorded verified outcome for "${intervention.actionType}"! Deltas attached.`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl my-auto rounded-3xl bg-[#090c25] border border-[rgba(140,150,255,0.25)] p-6 sm:p-8 shadow-2xl text-[#f0f1ff]">
        {/* Glow */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#2dd4bf]/10 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-[#a4a9d0] hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-mono font-bold text-emerald-300 mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>STEP 10: INTERVENTION OUTCOME & IMPACT REVIEW</span>
          </div>
          <h2 className="font-baskerville text-2xl font-bold text-white">
            Evaluate Intervention Impact
          </h2>
          <p className="text-xs text-[#a4a9d0] mt-0.5">
            Record verified before-and-after longitudinal results for {intervention.studentName}.
          </p>
        </div>

        {/* Target Intervention Banner */}
        <div className="p-4 rounded-2xl bg-[#070d24] border border-[#1d2754] mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-mono text-[10px] text-[#ffb27a] uppercase font-bold block">
              Intervention Action:
            </span>
            <span className="font-bold text-white text-sm">{intervention.actionType}</span>
            <span className="text-[11px] text-[#8e96c8] block mt-0.5">
              Reason: {intervention.reason}
            </span>
          </div>
          <div className="text-left sm:text-right font-mono text-[11px]">
            <span className="text-[#a4a9d0] block">Created: {intervention.date}</span>
            <span className="text-emerald-400 font-bold">
              {intervention.totalSessions} Sessions Prescribed
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Rating */}
          <div>
            <label className="block text-[11px] font-mono text-[#a4a9d0] uppercase mb-1.5">
              Outcome Diagnostic Rating
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              {[
                { val: 'EXCEEDED_EXPECTATIONS', label: '🌟 Exceeded', color: 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300' },
                { val: 'PROGRESS_OBSERVED', label: '📈 Progress Observed', color: 'border-blue-500/60 bg-blue-500/15 text-blue-300' },
                { val: 'MAINTAINED', label: '⚖ Maintained', color: 'border-amber-500/60 bg-amber-500/15 text-amber-300' },
                { val: 'ADDITIONAL_SUPPORT_NEEDED', label: '🔄 Further Support', color: 'border-rose-500/60 bg-rose-500/15 text-rose-300' },
              ].map((r) => (
                <button
                  type="button"
                  key={r.val}
                  onClick={() => setOutcomeRating(r.val as any)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    outcomeRating === r.val ? r.color + ' ring-2 ring-white/20 font-bold' : 'bg-black/30 border-white/10 text-[#a4a9d0]'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Before vs After Telemetry Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-mono text-[#a4a9d0] uppercase">
                Telemetry Impact (Before vs After)
              </label>
              <span className="text-[10px] text-emerald-400 font-mono">
                Real-time delta computation
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Success Score */}
              <div className="p-3 rounded-xl bg-black/30 border border-white/10">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white font-medium">Success Score</span>
                  <span className={`font-mono font-bold ${scoreDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {scoreDelta >= 0 ? `+${scoreDelta}` : scoreDelta} pts
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#8e96c8] font-mono">Pre: {before.successScore}</span>
                  <input
                    type="range"
                    min={Math.max(20, before.successScore - 20)}
                    max={100}
                    value={afterSuccessScore}
                    onChange={(e) => setAfterSuccessScore(Number(e.target.value))}
                    className="flex-1 accent-[#ff6a2b] cursor-pointer"
                  />
                  <span className="text-xs font-bold text-white font-mono w-8 text-right">
                    {afterSuccessScore}
                  </span>
                </div>
              </div>

              {/* Communication */}
              <div className="p-3 rounded-xl bg-black/30 border border-white/10">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white font-medium">Communication</span>
                  <span className={`font-mono font-bold ${commDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {commDelta >= 0 ? `+${commDelta}` : commDelta} pts
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#8e96c8] font-mono">Pre: {before.communication}</span>
                  <input
                    type="range"
                    min={Math.max(20, before.communication - 20)}
                    max={100}
                    value={afterCommunication}
                    onChange={(e) => setAfterCommunication(Number(e.target.value))}
                    className="flex-1 accent-[#5eead4] cursor-pointer"
                  />
                  <span className="text-xs font-bold text-white font-mono w-8 text-right">
                    {afterCommunication}
                  </span>
                </div>
              </div>

              {/* Engagement */}
              <div className="p-3 rounded-xl bg-black/30 border border-white/10">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white font-medium">Engagement</span>
                  <span className={`font-mono font-bold ${engDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {engDelta >= 0 ? `+${engDelta}` : engDelta} pts
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#8e96c8] font-mono">Pre: {before.engagement}</span>
                  <input
                    type="range"
                    min={Math.max(20, before.engagement - 20)}
                    max={100}
                    value={afterEngagement}
                    onChange={(e) => setAfterEngagement(Number(e.target.value))}
                    className="flex-1 accent-[#93c5fd] cursor-pointer"
                  />
                  <span className="text-xs font-bold text-white font-mono w-8 text-right">
                    {afterEngagement}
                  </span>
                </div>
              </div>

              {/* Placement Readiness */}
              <div className="p-3 rounded-xl bg-black/30 border border-white/10">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white font-medium">Placement Readiness</span>
                  <span className={`font-mono font-bold ${placeDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {placeDelta >= 0 ? `+${placeDelta}` : placeDelta} pts
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#8e96c8] font-mono">Pre: {before.placementReadiness}</span>
                  <input
                    type="range"
                    min={Math.max(20, before.placementReadiness - 20)}
                    max={100}
                    value={afterPlacement}
                    onChange={(e) => setAfterPlacement(Number(e.target.value))}
                    className="flex-1 accent-[#ffb27a] cursor-pointer"
                  />
                  <span className="text-xs font-bold text-white font-mono w-8 text-right">
                    {afterPlacement}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Qualitative Observation */}
          <div>
            <label className="block text-[11px] font-mono text-[#a4a9d0] uppercase mb-1">
              Qualitative Outcome Notes & Observations
            </label>
            <textarea
              rows={2}
              value={qualitativeNotes}
              onChange={(e) => setQualitativeNotes(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#06081c] border border-[#1f2552] text-xs text-white focus:outline-none focus:border-[#2dd4bf]"
              required
            />
          </div>

          {/* Recommended Next Step */}
          <div>
            <label className="block text-[11px] font-mono text-[#a4a9d0] uppercase mb-1">
              Recommended Next Step / Forward Milestone
            </label>
            <input
              type="text"
              value={recommendedNextStep}
              onChange={(e) => setRecommendedNextStep(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#06081c] border border-[#1f2552] text-xs text-white focus:outline-none focus:border-[#2dd4bf]"
              required
            />
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-[#a4a9d0] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#2dd4bf] to-[#0ea5e9] text-black text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-[#2dd4bf]/20 hover:scale-[1.02]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Outcome Review to Student Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
