import React from 'react';
import { Sparkles, UserCheck, GraduationCap, Building2, Layers } from 'lucide-react';
import { WorkspaceRole } from '../context/WorkspaceContext';

interface HeroSectionProps {
  onOpenDemo: () => void;
  onOpenGrowthTrack?: () => void;
  onOpenSilentStruggle?: () => void;
  onOpenWorkspace?: (role: WorkspaceRole) => void;
  onOpenRoleModal?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenDemo,
  onOpenGrowthTrack,
  onOpenSilentStruggle,
  onOpenWorkspace,
  onOpenRoleModal,
}) => {
  return (
    <header className="min-h-screen flex items-center justify-center text-center px-6 pt-24 pb-16 relative z-10">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        {/* Tag matching template */}
        <span className="inline-block border border-[rgba(140,150,255,0.18)] rounded-full px-4 py-1.5 text-xs tracking-[0.2em] uppercase text-[#a4a9d0] bg-[rgba(14,16,40,0.55)] backdrop-blur-md mb-6">
          AI-Powered Student Success & Decision Intelligence Platform
        </span>

        {/* Headline in Baskerville Old Face */}
        <h1 className="font-baskerville text-4xl sm:text-5xl md:text-6xl lg:text-[4.2rem] font-bold tracking-tight leading-[1.08] my-5 text-[#f0f1ff] drop-shadow-[0_0_40px_rgba(111,141,255,0.35)] text-balance">
          Students Evolve. <br />
          <span className="gradient-acc-text">Evolyn Understands How.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-[#a4a9d0] text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mt-4 mb-8">
          An AI-powered Student Success & Decision Intelligence Platform transforming multi-dimensional student telemetry into explainable observations, plausible patterns, and actionable decisions.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mt-2 mb-8">
          {onOpenGrowthTrack && (
            <button
              onClick={onOpenGrowthTrack}
              className="btn-primary px-6 py-3 rounded-full font-semibold text-xs sm:text-sm text-white tracking-wide cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Student Growth Track</span>
            </button>
          )}

          {onOpenSilentStruggle && (
            <button
              onClick={onOpenSilentStruggle}
              className="px-6 py-3 rounded-full font-semibold text-xs sm:text-sm text-white tracking-wide cursor-pointer flex items-center gap-2 bg-gradient-to-r from-[#ff6a2b] to-[#6f8dff] hover:opacity-95 shadow-md shadow-[#ff6a2b]/25 transition-all"
            >
              <span>Silent Struggle Detection</span>
            </button>
          )}

          {onOpenRoleModal && (
            <button
              onClick={onOpenRoleModal}
              className="btn-secondary px-6 py-3 rounded-full font-semibold text-xs sm:text-sm text-[#f0f1ff] tracking-wide cursor-pointer flex items-center gap-2"
            >
              <Layers className="w-4 h-4 text-[#ff6a2b]" />
              <span>Choose Workspace Role</span>
            </button>
          )}
        </div>

        {/* Role-Based Workspace Quick Launch Bar */}
        {onOpenWorkspace && (
          <div className="p-3 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md max-w-2xl w-full">
            <div className="text-[11px] font-semibold text-[#a4a9d0] uppercase tracking-wider mb-2.5 flex items-center justify-center gap-2">
              <span>Enter Dedicated Persona Workspace:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                onClick={() => onOpenWorkspace('faculty')}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/5 hover:bg-[#ff6a2b]/20 hover:border-[#ff6a2b]/50 border border-white/10 text-xs font-semibold text-white transition-all cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-[#ff6a2b]" />
                <span>1: Faculty</span>
              </button>
              <button
                onClick={() => onOpenWorkspace('student')}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/5 hover:bg-[#2dd4bf]/20 hover:border-[#2dd4bf]/50 border border-white/10 text-xs font-semibold text-white transition-all cursor-pointer"
              >
                <GraduationCap className="w-4 h-4 text-[#2dd4bf]" />
                <span>2: Student</span>
              </button>
              <button
                onClick={() => onOpenWorkspace('admin')}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/5 hover:bg-[#a855f7]/20 hover:border-[#a855f7]/50 border border-white/10 text-xs font-semibold text-white transition-all cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-[#a855f7]" />
                <span>3: Administrator</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
