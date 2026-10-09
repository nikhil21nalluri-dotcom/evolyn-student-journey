import React from 'react';
import { useWorkspace, WorkspaceRole } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  UserCheck,
  Building2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  X,
  Compass,
  Lock,
} from 'lucide-react';

interface RoleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuthForRole?: (role: 'advisor' | 'student' | 'admin') => void;
  onNavigateToWorkspace?: (role: WorkspaceRole) => void;
}

export const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({
  isOpen,
  onClose,
  onOpenAuthForRole,
  onNavigateToWorkspace,
}) => {
  const { selectRoleAndWorkspace, activeWorkspace } = useWorkspace();
  const { user } = useAuth();

  if (!isOpen) return null;

  const handleSelectRole = (role: WorkspaceRole, openAuth: boolean = false) => {
    selectRoleAndWorkspace(role);
    const authRole = role === 'faculty' ? 'advisor' : role === 'student' ? 'student' : 'admin';

    if (!user || openAuth) {
      if (onOpenAuthForRole) {
        onOpenAuthForRole(authRole);
      }
      if (onNavigateToWorkspace) {
        onNavigateToWorkspace(role);
      }
      onClose();
      return;
    }

    if (onNavigateToWorkspace) {
      onNavigateToWorkspace(role);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-4xl my-auto rounded-3xl bg-[#090b20] border border-[rgba(140,150,255,0.25)] p-6 sm:p-10 shadow-2xl text-[#f0f1ff]">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#ff6a2b]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-[#6f8dff]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-[#a4a9d0] hover:text-white transition-colors cursor-pointer"
          aria-label="Dismiss role selector"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-[#ffb27a] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#ff6a2b]" />
            <span>Role-Based Workspace Architecture</span>
          </div>
          <h2 className="font-baskerville text-2xl sm:text-4xl font-bold tracking-tight text-white mb-2">
            Choose Your Login Process
          </h2>
          <p className="text-sm text-[#a4a9d0] max-w-xl mx-auto">
            Evolyn provides specialized workspaces for every stakeholder. Choose your persona to access
            tailored analytics, intelligence, and workflows powered by a unified student model.
          </p>
        </div>

        {/* Role Cards Grid (1: Faculty, 2: Student, 3: Administrators) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10 mb-8">
          {/* 1: Faculty */}
          <div
            className={`group rounded-2xl p-6 transition-all border flex flex-col justify-between cursor-pointer ${
              activeWorkspace === 'faculty'
                ? 'bg-gradient-to-b from-[#181a3d] to-[#0c0e29] border-[#ff6a2b] shadow-xl shadow-[#ff6a2b]/10'
                : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/10 hover:border-white/20'
            }`}
            onClick={() => handleSelectRole('faculty')}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#ff6a2b] to-[#ff8c5a] flex items-center justify-center text-white shadow-md shadow-[#ff6a2b]/20">
                  <UserCheck className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#ff6a2b]/20 border border-[#ff6a2b]/30 font-mono text-xs font-bold text-[#ffb27a]">
                  1: FACULTY
                </span>
              </div>

              <h3 className="font-baskerville text-lg sm:text-xl font-bold text-white mb-1.5">
                Faculty Workspace
              </h3>
              <p className="text-xs text-[#a4a9d0] mb-4 leading-relaxed">
                For course professors, academic mentors, and departmental advisors guiding student cohorts.
              </p>

              <div className="space-y-2 text-[11px] text-[#c2d1ff] mb-6 pt-3 border-t border-white/10">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#ff6a2b] shrink-0" />
                  <span>Student Roster & Success Scores</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#ff6a2b] shrink-0" />
                  <span>Silent Struggle Early Detection</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#ff6a2b] shrink-0" />
                  <span>Growth Maps & Unified Intelligence</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#ff6a2b] shrink-0" />
                  <span>Faculty Notes & Intervention Dispatch</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectRole('faculty');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#ff6a2b] to-[#ff8c5a] hover:from-[#ff7b42] hover:to-[#ffa073] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#ff6a2b]/20 cursor-pointer"
              >
                <span>Enter Faculty Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectRole('faculty', true);
                }}
                className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-[#ffb27a] font-medium transition-colors cursor-pointer"
              >
                Sign In as Faculty
              </button>
            </div>
          </div>

          {/* 2: Student */}
          <div
            className={`group rounded-2xl p-6 transition-all border flex flex-col justify-between cursor-pointer ${
              activeWorkspace === 'student'
                ? 'bg-gradient-to-b from-[#12283a] to-[#0a1622] border-[#2dd4bf] shadow-xl shadow-[#2dd4bf]/10'
                : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/10 hover:border-white/20'
            }`}
            onClick={() => handleSelectRole('student')}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#0ea5e9] to-[#2dd4bf] flex items-center justify-center text-white shadow-md shadow-[#2dd4bf]/20">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#2dd4bf]/20 border border-[#2dd4bf]/30 font-mono text-xs font-bold text-[#5eead4]">
                  2: STUDENT
                </span>
              </div>

              <h3 className="font-baskerville text-lg sm:text-xl font-bold text-white mb-1.5">
                Student Workspace
              </h3>
              <p className="text-xs text-[#a4a9d0] mb-4 leading-relaxed">
                A supportive, personal developmental space built exclusively for individual student self-growth.
              </p>

              <div className="space-y-2 text-[11px] text-[#c2d1ff] mb-6 pt-3 border-t border-white/10">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2dd4bf] shrink-0" />
                  <span>My Journey & Current Success Score</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2dd4bf] shrink-0" />
                  <span>My Strengths & Areas to Develop</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2dd4bf] shrink-0" />
                  <span>Recommended Next Steps & Goals</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2dd4bf] shrink-0" />
                  <span>Skill Practice & Reflection Check-in</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectRole('student');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#0d9488] hover:from-[#0369a1] hover:to-[#0f766e] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#0d9488]/20 cursor-pointer"
              >
                <span>Enter Student Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectRole('student', true);
                }}
                className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-[#5eead4] font-medium transition-colors cursor-pointer"
              >
                Sign In as Student
              </button>
            </div>
          </div>

          {/* 3: Administrator */}
          <div
            className={`group rounded-2xl p-6 transition-all border flex flex-col justify-between cursor-pointer ${
              activeWorkspace === 'admin'
                ? 'bg-gradient-to-b from-[#22153d] to-[#120a26] border-[#a855f7] shadow-xl shadow-[#a855f7]/10'
                : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/10 hover:border-white/20'
            }`}
            onClick={() => handleSelectRole('admin')}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#8b5cf6] to-[#d946ef] flex items-center justify-center text-white shadow-md shadow-[#a855f7]/20">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#a855f7]/20 border border-[#a855f7]/30 font-mono text-xs font-bold text-[#d8b4fe]">
                  3: ADMINISTRATOR
                </span>
              </div>

              <h3 className="font-baskerville text-lg sm:text-xl font-bold text-white mb-1.5">
                Administrator Workspace
              </h3>
              <p className="text-xs text-[#a4a9d0] mb-4 leading-relaxed">
                Institution-wide executive cockpit for deans, department heads, and academic leadership.
              </p>

              <div className="space-y-2 text-[11px] text-[#c2d1ff] mb-6 pt-3 border-t border-white/10">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#a855f7] shrink-0" />
                  <span>Institutional Cohort Telemetry</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#a855f7] shrink-0" />
                  <span>Cross-Department Health Benchmarks</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#a855f7] shrink-0" />
                  <span>Faculty Caseload & Response Rates</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#a855f7] shrink-0" />
                  <span>Early Signal Governance & Policies</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectRole('admin');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#c026d3] hover:from-[#6d28d9] hover:to-[#a21caf] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#7c3aed]/20 cursor-pointer"
              >
                <span>Enter Admin Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectRole('admin', true);
                }}
                className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-[#d8b4fe] font-medium transition-colors cursor-pointer"
              >
                Sign In as Administrator
              </button>
            </div>
          </div>
        </div>

        {/* Footer Navigation Note */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-[#a4a9d0] gap-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#ff6a2b]" />
            <span>
              All three workspaces operate on the <strong>same unified student intelligence foundation</strong>.
            </span>
          </div>
          <button
            onClick={onClose}
            className="hover:text-white transition-colors underline decoration-white/30 hover:decoration-white cursor-pointer"
          >
            Explore Public Landing Page First
          </button>
        </div>
      </div>
    </div>
  );
};
