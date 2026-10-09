import React, { useState } from 'react';
import {
  Building2,
  Sparkles,
  TrendingUp,
  Target,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Layers,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import {
  getInstitutionalDecisionIntelligence,
  InstitutionalDecisionIntelligence,
  InstitutionalSegmentInsight,
} from '../../data/studentDecisionEngine';
import { SEGMENT_DEFINITIONS } from '../../data/studentSegmentationEngine';

interface InstitutionalDecisionViewProps {
  onNavigateToSegments?: () => void;
  onFilterDepartment?: (dept: string) => void;
}

export const InstitutionalDecisionView: React.FC<InstitutionalDecisionViewProps> = ({
  onNavigateToSegments,
}) => {
  const intel: InstitutionalDecisionIntelligence = getInstitutionalDecisionIntelligence();
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>(
    intel.affectedSegments[0]?.segmentId || 'ACADEMIC_STRONG_PLACEMENT_NEEDS_SUPPORT'
  );

  const activeSegmentInsight =
    intel.affectedSegments.find((s) => s.segmentId === selectedSegmentId) ||
    intel.affectedSegments[0];

  return (
    <div className="space-y-6">
      {/* Top Cockpit Card */}
      <div className="rounded-3xl bg-[#0a0e2a] border border-[#222955] p-6 sm:p-8 shadow-2xl relative overflow-hidden text-[#f0f1ff]">
        {/* Glow */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#a855f7]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-[#3b82f6]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Title */}
        <div className="mb-6 relative z-10 border-b border-[#222955] pb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-[#d8b4fe] mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#a855f7]" />
            <span>AI DECISION INTELLIGENCE PLATFORM • INSTITUTIONAL COCKPIT</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-baskerville text-2xl sm:text-3xl font-bold text-white">
                Institutional Decision Intelligence
              </h2>
              <p className="text-xs text-[#a4a9d0] mt-1 max-w-2xl">
                Macro-level decision synthesis mapping academic foundation against career readiness across cohorts.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-[#0e1438] border border-[#2b356d] text-right">
                <span className="text-[11px] text-[#a4a9d0] block">Cohort Size</span>
                <span className="font-mono text-xl font-bold text-white">{intel.totalStudents}</span>
                <span className="text-[10px] text-[#34d399] block">Enrolled Students</span>
              </div>
            </div>
          </div>
        </div>

        {/* Current Macro Observation */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-[#17123b] via-[#101336] to-[#0c102c] border border-[#372d6e] mb-6 relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#d8b4fe] mb-1.5">
            <Target className="w-4 h-4 text-[#a855f7]" />
            <span>Current Macro Observation</span>
          </div>
          <h3 className="font-baskerville text-lg sm:text-xl font-bold text-white mb-2">
            &ldquo;{intel.headlineObservation}&rdquo;
          </h3>
          <p className="text-xs text-[#c2d1ff] leading-relaxed">{intel.executiveSummary}</p>
        </div>

        {/* Affected Segments Grid & Deep Dive */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 relative z-10 mb-6">
          {/* Left: Segments List */}
          <div className="lg:col-span-1 space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#a4a9d0] block mb-1">
              Cohort Segments Telemetry
            </span>
            {intel.affectedSegments.map((seg) => {
              const def = SEGMENT_DEFINITIONS[seg.segmentId];
              const isSelected = selectedSegmentId === seg.segmentId;

              return (
                <div
                  key={seg.segmentId}
                  onClick={() => setSelectedSegmentId(seg.segmentId)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#151a4a] border-[#a855f7] shadow-lg shadow-[#a855f7]/15'
                      : 'bg-[#0c1033] hover:bg-[#0f143d] border-[#222955]'
                  }`}
                >
                  <div className="truncate pr-2">
                    <span className="text-xs font-bold text-white block truncate">{seg.segmentName}</span>
                    <span className="text-[11px] text-[#8692c8]">
                      {seg.studentCount} Students ({seg.percentageOfCohort}%)
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-[#ffb27a]">
                      Score: {seg.avgSuccessScore}
                    </span>
                    <ChevronRight
                      className={`w-3.5 h-3.5 ml-auto mt-0.5 transition-transform ${
                        isSelected ? 'text-[#a855f7] translate-x-0.5' : 'text-[#8692c8]'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Selected Segment Decision Detail */}
          {activeSegmentInsight && (
            <div className="lg:col-span-2 rounded-2xl bg-[#0c1033] border border-[#222955] p-5 flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#222955] pb-3 mb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#a855f7] tracking-wider">
                      Selected Cohort Focus
                    </span>
                    <h4 className="font-bold text-base text-white">{activeSegmentInsight.segmentName}</h4>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[#8692c8] text-[10px] block">Avg Academic</span>
                      <span className="font-mono font-bold text-white">{activeSegmentInsight.avgAcademicScore}</span>
                    </div>
                    <div className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[#8692c8] text-[10px] block">Avg Placement</span>
                      <span className="font-mono font-bold text-[#ffb27a]">{activeSegmentInsight.avgPlacementScore}</span>
                    </div>
                  </div>
                </div>

                {/* Specific Observation */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 mb-3.5 text-xs">
                  <strong className="text-white block mb-0.5">Observed Pattern:</strong>
                  <p className="text-[#c2d1ff] leading-relaxed">{activeSegmentInsight.observation}</p>
                </div>

                {/* Possible Contributing Pattern */}
                <div className="p-3.5 rounded-xl bg-[#141238] border border-[#2c2669] mb-4 text-xs">
                  <strong className="text-[#d8b4fe] block mb-0.5">Possible Contributing Pattern:</strong>
                  <p className="text-[#d5d9fa] leading-relaxed">{activeSegmentInsight.contributingPattern}</p>
                </div>

                {/* Prescribed Actions for this segment */}
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#5eead4] block mb-2">
                    Recommended Segment Interventions:
                  </span>
                  <div className="space-y-2">
                    {activeSegmentInsight.institutionalActions.map((act, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-2.5 text-xs text-[#e2e8f0]"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2dd4bf] shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {onNavigateToSegments && (
                <div className="mt-5 pt-3 border-t border-[#222955] flex justify-end">
                  <button
                    onClick={onNavigateToSegments}
                    className="py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#a855f7] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>View All Students in Segment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recommended Institutional Focus (All Cohorts) */}
        <div className="p-5 rounded-2xl bg-[#090d29] border border-[#222955] relative z-10 mb-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#ffb27a] mb-3">
            <Building2 className="w-4 h-4 text-[#ff6a2b]" />
            <span>Recommended Institutional Focus</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {intel.recommendedInstitutionalFocus.map((rec, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-3 text-xs text-[#f0f1ff]"
              >
                <span className="w-5 h-5 rounded-md bg-[#ff6a2b]/20 text-[#ffb27a] font-mono text-xs font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Guidance */}
        <div className="p-4 rounded-2xl bg-[#0c1033] border border-[#222955] relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8692c8]">
          <span>
            Telemetry Evidence Base: <strong>{intel.evidenceTelemetryCount} Normalized Indicators</strong>
          </span>
          <span className="italic">{intel.monitoringGuidance}</span>
        </div>
      </div>
    </div>
  );
};
