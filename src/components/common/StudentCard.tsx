import React from 'react';
import { MessageSquare, BookOpen, ChevronRight, AlertTriangle, TrendingUp, Sparkles } from 'lucide-react';
import { getStudentSuccessScore } from '../../data/studentSuccessScore';
import { getStudentSilentStruggleData } from '../../data/silentStruggleData';
import { getStudentRiskProfile } from '../../data/studentRiskEngine';
import { getStudentSegment } from '../../data/studentSegmentationEngine';

export interface StudentCardProps {
  student: {
    id: string;
    studentId?: string;
    name: string;
    branch: string;
    year?: string;
    avatarInitials: string;
    course?: string;
  };
  isSelected?: boolean;
  onSelect?: () => void;
  onOpenDm?: () => void;
  onOpenLms?: () => void;
  onViewGrowthTrack?: () => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  isSelected = false,
  onSelect,
  onOpenDm,
  onOpenLms,
  onViewGrowthTrack,
}) => {
  // Retrieve Success Score
  const successScore = getStudentSuccessScore(student.id);

  // Retrieve Silent Struggle telemetry
  const silentData = getStudentSilentStruggleData(student.id);

  // Retrieve Explainable Risk Profile
  const riskProfile = getStudentRiskProfile(student.id);
  const segmentProfile = getStudentSegment(student.id);

  const academicScore =
    successScore.dimensions.find((d) => d.id === 'academic')?.currentScore ??
    silentData?.academicScore ??
    82;
  const attendanceScore =
    successScore.dimensions.find((d) => d.id === 'attendance')?.currentScore ??
    silentData?.attendance ??
    88;
  const engagementScore =
    successScore.dimensions.find((d) => d.id === 'studentEngagement')?.currentScore ??
    silentData?.engagement ??
    74;
  const assignmentScore =
    successScore.dimensions.find((d) => d.id === 'lmsEngagement')?.currentScore ??
    silentData?.assignmentConsistency ??
    80;

  const badge = riskProfile.statusBadge;
  const divergenceGap = academicScore - engagementScore;

  return (
    <div
      onClick={onSelect}
      className={`rounded-2xl p-5 border transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer group ${
        isSelected
          ? 'bg-[#151c4a] border-[#ff6a2b] shadow-2xl shadow-[#ff6a2b]/20 ring-1 ring-[#ff6a2b]'
          : 'bg-[#0c1033] border-[#222955] hover:bg-[#111745] hover:border-[#6f8dff]/60 shadow-lg shadow-black/40'
      }`}
    >
      {/* Top subtle ambient highlight */}
      <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#6f8dff]/10 rounded-full blur-xl pointer-events-none group-hover:bg-[#ff6a2b]/15 transition-all" />

      <div>
        {/* Header: Avatar, Name, Branch, Status, Success Score */}
        <div className="flex items-start justify-between gap-3 mb-3 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#182054] to-[#0c1033] border border-[#303a7d] flex items-center justify-center font-bold text-sm text-[#6f8dff] font-mono shadow-md group-hover:border-[#ff6a2b]/70 transition-colors">
              {student.avatarInitials}
            </div>
            <div>
              <div className="text-base font-bold text-white font-serif group-hover:text-[#ffb27a] transition-colors">
                {student.name}
              </div>
              <div className="text-[11px] text-[#8e96c8] font-mono flex items-center gap-1.5 mt-0.5">
                <span>{student.studentId || student.id}</span>
                <span>•</span>
                <span>{student.branch}</span>
                <span>•</span>
                <span>{student.year || '2nd Year'}</span>
              </div>
            </div>
          </div>

          {/* Success Score Badge */}
          <div className="text-right shrink-0">
            <div className="inline-flex flex-col items-end px-2.5 py-1 rounded-xl bg-[#ff6a2b]/15 border border-[#ff6a2b]/35 shadow-inner">
              <div className="flex items-baseline space-x-0.5 font-mono">
                <span className="text-sm sm:text-base font-black text-[#ff8a50]">{successScore.currentScore}</span>
                <span className="text-[10px] text-[#a4a9d0]">/100</span>
              </div>
              <span className="text-[8px] uppercase tracking-wider font-semibold text-[#c2c8f0] font-mono">
                Success Score
              </span>
            </div>
          </div>
        </div>

        {/* Status Pill Badge & Primary Segment Tag */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 mb-3 relative z-10">
          <div className="flex items-center gap-1.5">
            <div
              className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold font-mono ${badge.bg} ${badge.border} ${badge.text}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot} animate-pulse`} />
              <span>{badge.label}</span>
            </div>

            <div
              className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-mono font-medium ${segmentProfile.segmentDef.badgeColor}`}
              title={segmentProfile.segmentDef.description}
            >
              <span>{segmentProfile.segmentDef.shortLabel}</span>
            </div>
          </div>

          <div className="text-[10px] font-mono text-[#9aa2d4] truncate max-w-[140px]">
            {successScore.indicatorLabel}
          </div>
        </div>

        {/* Metric Micro-Bar comparison 4-grid */}
        <div className="grid grid-cols-4 gap-1.5 pt-2.5 pb-2 border-t border-[#1f2552]/80 text-center font-mono relative z-10">
          <div className="bg-[#080b20]/90 border border-[#1b214d] rounded-lg p-1.5">
            <div className="text-[9px] text-[#767ea8] uppercase tracking-wider">Academic</div>
            <div className="text-xs font-bold text-[#6f8dff] mt-0.5">{academicScore}%</div>
          </div>
          <div className="bg-[#080b20]/90 border border-[#1b214d] rounded-lg p-1.5">
            <div className="text-[9px] text-[#767ea8] uppercase tracking-wider">Attend</div>
            <div className="text-xs font-bold text-[#a855f7] mt-0.5">{attendanceScore}%</div>
          </div>
          <div className="bg-[#080b20]/90 border border-[#1b214d] rounded-lg p-1.5">
            <div className="text-[9px] text-[#767ea8] uppercase tracking-wider">LMS/Engage</div>
            <div className={`text-xs font-bold mt-0.5 ${engagementScore < 70 ? 'text-[#ff6a2b]' : 'text-emerald-400'}`}>
              {engagementScore}%
            </div>
          </div>
          <div className="bg-[#080b20]/90 border border-[#1b214d] rounded-lg p-1.5">
            <div className="text-[9px] text-[#767ea8] uppercase tracking-wider">Work/Prep</div>
            <div className={`text-xs font-bold mt-0.5 ${assignmentScore < 70 ? 'text-amber-400' : 'text-cyan-300'}`}>
              {assignmentScore}%
            </div>
          </div>
        </div>

        {/* Divergence alert banner if present */}
        {divergenceGap > 10 && (
          <div className="mt-2 text-[10px] text-[#ff8a50] bg-[#ff6a2b]/10 border border-[#ff6a2b]/25 rounded-lg px-2.5 py-1.5 flex items-center space-x-1.5 font-mono">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-[#ff6a2b]" />
            <span>
              Divergence alert: +{divergenceGap}% gap between Academic and Engagement momentum
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons: Personal Caring DM, LMS Assign Work, and View Profile */}
      <div className="mt-4 pt-3 border-t border-[#1f2552]/80 flex items-center gap-2 relative z-10" onClick={(e) => e.stopPropagation()}>
        {onOpenDm && (
          <button
            onClick={onOpenDm}
            className="flex-1 py-1.5 px-2.5 rounded-xl bg-[#ff6a2b]/15 hover:bg-[#ff6a2b] border border-[#ff6a2b]/30 hover:border-[#ff6a2b] text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm group/dm"
            title="Send personal direct message or check-in note"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#ff8a50] group-hover/dm:text-white" />
            <span>Send DM</span>
          </button>
        )}

        {onOpenLms && (
          <button
            onClick={onOpenLms}
            className="flex-1 py-1.5 px-2.5 rounded-xl bg-[#6f8dff]/15 hover:bg-[#6f8dff] border border-[#6f8dff]/30 hover:border-[#6f8dff] text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm group/lms"
            title="Assign personalized coursework or practice task"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#6f8dff] group-hover/lms:text-white" />
            <span>Assign LMS</span>
          </button>
        )}

        {onViewGrowthTrack && (
          <button
            onClick={onViewGrowthTrack}
            className="p-1.5 rounded-xl bg-[#12163b] hover:bg-[#1c2254] border border-[#232854] text-[#a4a9d0] hover:text-white transition-colors cursor-pointer"
            title="View 6-axis Student Growth Track"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
