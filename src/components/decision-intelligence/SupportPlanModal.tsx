import React from 'react';
import {
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  UserCheck,
  Target,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { StudentDecisionIntelligence } from '../../data/studentDecisionEngine';

interface SupportPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  decisionData: StudentDecisionIntelligence;
  onDispatchIntervention?: (studentId: string, title: string) => void;
}

export const SupportPlanModal: React.FC<SupportPlanModalProps> = ({
  isOpen,
  onClose,
  decisionData,
  onDispatchIntervention,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-3xl my-auto rounded-3xl bg-[#090c25] border border-[rgba(140,150,255,0.25)] p-6 sm:p-8 shadow-2xl text-[#f0f1ff]">
        {/* Ambient glow */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#ff6a2b]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-[#6366f1]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-[#a4a9d0] hover:text-white transition-colors cursor-pointer"
          aria-label="Close support plan"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-[#ffb27a] mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#ff6a2b]" />
            <span>AI Decision Intelligence • Support Plan Blueprint</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-baskerville text-2xl sm:text-3xl font-bold text-white">
                Student Support Plan: {decisionData.studentName}
              </h2>
              <p className="text-xs text-[#a4a9d0] mt-0.5">
                Roll No: {decisionData.studentRoll} • {decisionData.department} • {decisionData.semester}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full border text-xs font-bold ${decisionData.statusBadge.bg} ${decisionData.statusBadge.border} ${decisionData.statusBadge.text}`}>
                {decisionData.status}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono font-bold text-[#ffb27a]">
                Score: {decisionData.successScore}/100
              </span>
            </div>
          </div>
        </div>

        {/* Segment Context */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 mb-6 flex items-start gap-3">
          <Target className="w-4 h-4 text-[#ff6a2b] shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-white">Primary Segment: </span>
            <span className="text-[#c7d2fe] font-semibold">{decisionData.primarySegment.name}</span>
            <p className="text-[#a4a9d0] mt-1">{decisionData.primarySegment.description}</p>
          </div>
        </div>

        {/* Core Strategy Dossier */}
        <div className="space-y-5 relative z-10 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {/* Strategy Summary */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#ffb27a] mb-2 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-[#ff6a2b]" />
              Tailored Strategy Rationale
            </h3>
            <div className="p-4 rounded-2xl bg-[#0c1033] border border-[#222955] text-xs text-[#d5d9fa] leading-relaxed">
              {decisionData.whatIsHappening.facultyDetail}
              <div className="mt-2.5 pt-2.5 border-t border-white/10 text-[#a4a9d0]">
                <strong className="text-white">Contributing Pattern: </strong>
                {decisionData.whyMightThisBeHappening.synthesis}
              </div>
            </div>
          </div>

          {/* Actionable Support Steps */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#a5b4fc] mb-2.5 flex items-center gap-2">
              <UserCheck className="w-3.5 h-3.5 text-[#818cf8]" />
              Prescribed Next Support Actions
            </h3>
            <div className="space-y-2.5">
              {decisionData.whatShouldHappenNext.recommendations.map((rec) => (
                <div
                  key={rec.priority}
                  className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-[#ff6a2b]/15 border border-[#ff6a2b]/30 text-[#ffb27a] font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      {rec.priority}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">{rec.area}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#93c5fd]">
                          {rec.expectedEffort}
                        </span>
                      </div>
                      <p className="text-xs text-[#c2d1ff] mt-1 font-medium">{rec.action}</p>
                      <p className="text-[11px] text-[#8692c8] mt-0.5">{rec.rationale}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Telemetry Monitoring Protocol */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#5eead4] mb-2.5 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#2dd4bf]" />
              Telemetry Review Protocol
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {decisionData.whatShouldBeMonitored.targets.map((tgt) => (
                <div
                  key={tgt.name}
                  className="p-3 rounded-xl bg-[#0b0e2b] border border-[#222955] flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-medium text-[#d5d9fa]">{tgt.name}</span>
                    <p className="text-[11px] text-[#8692c8]">Review: {tgt.reviewTimeframe}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-white">{tgt.currentValue}</span>
                    <span className="block text-[10px] text-[#5eead4]">Target: {tgt.targetDirection}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Telemetry Evidence Basis */}
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 text-[11px] text-[#8692c8]">
            <span className="font-bold text-white block mb-1">Telemetry Sources Verified:</span>
            <div className="flex flex-wrap gap-2">
              {decisionData.evidenceUsed.map((ev, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 text-[#a4a9d0]"
                >
                  <CheckCircle2 className="w-3 h-3 text-[#2dd4bf]" />
                  {ev}
                </span>
              ))}
            </div>
          </div>

          {/* Ethics Note */}
          <div className="flex items-center gap-2 text-[11px] text-[#a4a9d0] italic">
            <AlertCircle className="w-3.5 h-3.5 text-[#ff6a2b] shrink-0" />
            <span>
              This support plan is preparatory intelligence. Final intervention execution remains at faculty discretion.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-[#a4a9d0]">
            Review Period: <strong>Next 7–14 Days</strong>
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              Close Blueprint
            </button>
            <button
              onClick={() => {
                if (onDispatchIntervention) {
                  onDispatchIntervention(decisionData.studentId, `Support Plan for ${decisionData.studentName}`);
                }
                onClose();
              }}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff6a2b] to-[#ff8c5a] hover:from-[#ff7b42] hover:to-[#ffa073] text-white text-xs font-bold shadow-lg shadow-[#ff6a2b]/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Save & Log Support Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
