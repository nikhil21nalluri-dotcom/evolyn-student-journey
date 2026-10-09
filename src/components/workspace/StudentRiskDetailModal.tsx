import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Minus,
  Info,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Activity,
  UserCheck,
} from 'lucide-react';
import { StudentRiskProfile, ExplainableSignal } from '../../data/studentRiskEngine';
import { getStudentSuccessScore } from '../../data/studentSuccessScore';
import { getStudentSegment } from '../../data/studentSegmentationEngine';
import { InterventionIntelligencePanel } from '../intervention/InterventionIntelligencePanel';
import { Target } from 'lucide-react';

interface StudentRiskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  riskProfile: StudentRiskProfile;
  onOpenDm?: () => void;
  onOpenLms?: () => void;
}

export const StudentRiskDetailModal: React.FC<StudentRiskDetailModalProps> = ({
  isOpen,
  onClose,
  riskProfile,
  onOpenDm,
  onOpenLms,
}) => {
  const [modalView, setModalView] = useState<'signals' | 'intervention'>('signals');
  const [selectedSignalTab, setSelectedSignalTab] = useState<'all' | 'declining' | 'stable'>('all');

  if (!isOpen) return null;

  const scoreData = getStudentSuccessScore(riskProfile.studentId);
  const badge = riskProfile.statusBadge;

  const filteredSignals = riskProfile.signals.filter((s) => {
    if (selectedSignalTab === 'declining') return s.trend === 'declining' || s.severity !== 'LOW';
    if (selectedSignalTab === 'stable') return s.trend === 'stable' || s.trend === 'improving';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl rounded-3xl bg-[#090d29] border border-[#232b60] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff6a2b]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#6f8dff]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-6 border-b border-[#1c224a] flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#182054] to-[#0c1033] border border-[#303a7d] flex items-center justify-center font-bold text-base text-[#6f8dff] font-mono shadow-md">
              {riskProfile.studentName
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-baskerville text-xl font-bold text-white">
                  {riskProfile.studentName}
                </h2>
                <div
                  className={`inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full border text-xs font-semibold font-mono ${badge.bg} ${badge.border} ${badge.text}`}
                >
                  <span className={`w-2 h-2 rounded-full ${badge.dot} animate-pulse`} />
                  <span>{badge.label}</span>
                </div>
                {(() => {
                  const seg = getStudentSegment(riskProfile.studentId);
                  return (
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-md border text-[11px] font-mono font-medium ${seg.segmentDef.badgeColor}`}
                    >
                      {seg.segmentDef.name}
                    </span>
                  );
                })()}
              </div>
              <p className="text-xs text-[#8e96c8] font-mono mt-0.5">
                Explainable Risk & Early Signal Intelligence • ID: {riskProfile.studentId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-[#070b22] border border-[#222955] p-1 rounded-xl text-xs font-mono">
              <button
                onClick={() => setModalView('signals')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-semibold ${
                  modalView === 'signals' ? 'bg-[#ff6a2b] text-white shadow-md' : 'text-[#8e96c8] hover:text-white'
                }`}
              >
                Signals
              </button>
              <button
                onClick={() => setModalView('intervention')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-semibold flex items-center gap-1.5 ${
                  modalView === 'intervention'
                    ? 'bg-gradient-to-r from-[#ff6a2b] to-[#6f8dff] text-white shadow-md'
                    : 'text-[#8e96c8] hover:text-white'
                }`}
              >
                <Target className="w-3.5 h-3.5 text-[#5eead4]" />
                <span>Intervention Intelligence</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#a4a9d0] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 relative z-10 text-sm">
          {modalView === 'intervention' ? (
            <InterventionIntelligencePanel
              studentId={riskProfile.studentId}
              onOpenDmModal={onOpenDm}
              onOpenLmsModal={onOpenLms}
              embedded={true}
            />
          ) : (
            <>
              {/* Early Signal to Action Direct Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#ff6a2b]/15 to-[#6f8dff]/15 border border-[rgba(140,150,255,0.3)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-white block">
                    DETECTION → EXPLANATION → DECISION → ACTION
                  </span>
                  <span className="text-[#c2d1ff]">
                    Translate {riskProfile.studentName}'s observable signals into low-friction pedagogical support.
                  </span>
                </div>
                <button
                  onClick={() => setModalView('intervention')}
                  className="px-3.5 py-1.5 rounded-xl bg-[#ff6a2b] hover:bg-[#ff7b42] text-white font-bold text-xs shrink-0 cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Open Intervention Intelligence</span>
                </button>
              </div>
          {/* Top Score & Status Executive Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#0e1335] border border-[#222955] flex flex-col justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#8e96c8]">
                Success Score
              </span>
              <div className="flex items-baseline space-x-1 mt-1 font-mono">
                <span className="text-3xl font-black text-[#ff8a50]">{scoreData.currentScore}</span>
                <span className="text-sm text-[#8e96c8]">/ 100</span>
              </div>
              <span className="text-[11px] text-[#2dd4bf] font-mono mt-1">
                {scoreData.indicatorLabel}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0e1335] border border-[#222955] flex flex-col justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#8e96c8]">
                Risk Classification
              </span>
              <div className="mt-1">
                <span className="text-xl font-bold text-white font-mono">{riskProfile.status}</span>
              </div>
              <span className="text-[11px] text-[#a4a9d0] font-mono mt-1">
                {riskProfile.decliningSignalsCount > 0
                  ? `${riskProfile.decliningSignalsCount} declining indicators detected`
                  : 'All monitored dimensions in equilibrium'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0e1335] border border-[#222955] flex flex-col justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#8e96c8]">
                Signal Dynamic Vector
              </span>
              <div className="flex items-center gap-3 mt-1 font-mono text-xs">
                <span className="text-rose-400 font-bold">
                  {riskProfile.decliningSignalsCount} Declining
                </span>
                <span className="text-emerald-400 font-bold">
                  {riskProfile.stableSignalsCount} Stable
                </span>
                <span className="text-cyan-400 font-bold">
                  {riskProfile.improvingSignalsCount} Improving
                </span>
              </div>
              <span className="text-[11px] text-[#8e96c8] font-mono mt-1">
                Temporal Window: Last 8 weeks
              </span>
            </div>
          </div>

          {/* Section: WHY THIS STATUS EXISTS */}
          <div className="p-5 rounded-2xl bg-[#0c1033] border border-[#ff6a2b]/30 shadow-lg relative overflow-hidden">
            <div className="flex items-center space-x-2 text-xs font-mono uppercase text-[#ff8a50] tracking-wider mb-2 font-bold">
              <Sparkles className="w-4 h-4 text-[#ff6a2b]" />
              <span>Why This Status Exists?</span>
            </div>

            <div className="space-y-1.5 my-3">
              {riskProfile.whyExplanation.bulletPoints.map((bp, idx) => (
                <div key={idx} className="flex items-start space-x-2 text-xs font-mono text-white/90">
                  <span className="text-[#ff6a2b] font-bold">•</span>
                  <span>{bp}</span>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-[#06091e] border border-[#222955] text-xs text-[#c2c8f0] leading-relaxed font-sans">
              <strong className="text-white">Synthesis Summary: </strong>
              "{riskProfile.whyExplanation.summary}"
            </div>
          </div>

          {/* Section: Signal Breakdown Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-baskerville text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#6f8dff]" />
                <span>Signals Detected & Severity Breakdown</span>
              </h3>

              <div className="flex items-center space-x-1.5 bg-[#06091e] border border-[#222955] p-1 rounded-xl text-xs font-mono">
                <button
                  onClick={() => setSelectedSignalTab('all')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    selectedSignalTab === 'all' ? 'bg-[#ff6a2b] text-white' : 'text-[#8e96c8]'
                  }`}
                >
                  All ({riskProfile.signals.length})
                </button>
                <button
                  onClick={() => setSelectedSignalTab('declining')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    selectedSignalTab === 'declining' ? 'bg-[#ff6a2b] text-white' : 'text-[#8e96c8]'
                  }`}
                >
                  Signals ({riskProfile.decliningSignalsCount})
                </button>
                <button
                  onClick={() => setSelectedSignalTab('stable')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    selectedSignalTab === 'stable' ? 'bg-[#ff6a2b] text-white' : 'text-[#8e96c8]'
                  }`}
                >
                  Stable ({riskProfile.stableSignalsCount})
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              {filteredSignals.map((signal) => {
                const isDeclining = signal.trend === 'declining' || signal.severity !== 'LOW';
                return (
                  <div
                    key={signal.id}
                    className="p-3.5 rounded-xl bg-[#0b0f2a] border border-[#222955] hover:border-[#38437d] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-xs">{signal.name}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            signal.severity === 'HIGH'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : signal.severity === 'MODERATE'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {signal.statusLabel}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#8e96c8] leading-tight">
                        {signal.explanation}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 shrink-0 font-mono text-xs">
                      {/* Trend Historical progression */}
                      <div className="text-right">
                        <div className="text-[10px] text-[#8e96c8] uppercase">Historical Trend</div>
                        <div className="text-white font-semibold flex items-center space-x-1">
                          {signal.historicalValues.map((v, i) => (
                            <React.Fragment key={i}>
                              <span>{v}</span>
                              {i < signal.historicalValues.length - 1 && (
                                <span className="text-[#8e96c8] text-[10px]">→</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>

                      {/* Change Metric Pill */}
                      <div
                        className={`px-2.5 py-1 rounded-lg border font-bold text-xs flex items-center space-x-1 ${
                          signal.trend === 'declining'
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                            : signal.trend === 'improving'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-white/5 border-white/10 text-[#a4a9d0]'
                        }`}
                      >
                        {signal.trend === 'declining' ? (
                          <TrendingDown className="w-3.5 h-3.5" />
                        ) : signal.trend === 'improving' ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : (
                          <Minus className="w-3.5 h-3.5" />
                        )}
                        <span>{signal.changeDisplay}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Responsible AI Principle */}
          <div className="p-4 rounded-xl bg-[#070b24] border border-[#1d2350] flex items-start space-x-3 text-xs text-[#8e96c8]">
            <ShieldCheck className="w-5 h-5 shrink-0 text-[#2dd4bf] mt-0.5" />
            <div>
              <strong className="text-white">Responsible AI Notice: </strong>
              {riskProfile.responsibleAiNotice}
            </div>
          </div>
            </>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-[#1c224a] bg-[#06091e] flex flex-wrap items-center justify-between gap-3 relative z-10">
          <span className="text-xs text-[#8e96c8] font-mono">
            Evolyn Multi-Dimensional Observability Active
          </span>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setModalView(modalView === 'signals' ? 'intervention' : 'signals')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff6a2b] to-[#6f8dff] text-white font-bold text-xs transition-colors cursor-pointer flex items-center space-x-1.5 shadow-md shadow-[#ff6a2b]/25"
            >
              <Target className="w-3.5 h-3.5 text-white" />
              <span>{modalView === 'signals' ? 'Intervention Intelligence' : 'Root Signals'}</span>
            </button>
            {onOpenDm && (
              <button
                onClick={() => {
                  onClose();
                  onOpenDm();
                }}
                className="px-4 py-2 rounded-xl bg-[#ff6a2b] hover:bg-[#ff7a3d] text-white font-semibold text-xs transition-colors cursor-pointer flex items-center space-x-1.5 shadow-md shadow-[#ff6a2b]/30"
              >
                <span>Send Personal DM</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {onOpenLms && (
              <button
                onClick={() => {
                  onClose();
                  onOpenLms();
                }}
                className="px-4 py-2 rounded-xl bg-[#6f8dff]/20 hover:bg-[#6f8dff]/30 border border-[#6f8dff]/40 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Assign Work
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
