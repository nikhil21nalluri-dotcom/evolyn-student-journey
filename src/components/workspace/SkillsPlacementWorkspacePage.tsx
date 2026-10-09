import React, { useState } from 'react';
import {
  Mic,
  Award,
  BookOpen,
  Briefcase,
  Layers,
  ArrowRight,
  Sparkles,
  ChevronRight,
  TrendingUp,
  UserCheck,
  Building2,
  GraduationCap,
} from 'lucide-react';
import { useSkillsPlacement } from '../../context/SkillsPlacementContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { FacultySkillGapPanel } from './FacultySkillGapPanel';
import { StudentSkillsPlacementView } from './StudentSkillsPlacementView';
import { AdministratorPlacementIntelligence } from './AdministratorPlacementIntelligence';

interface SkillsPlacementWorkspacePageProps {
  onBackToLanding: () => void;
  onNavigate: (view: any) => void;
}

export const SkillsPlacementWorkspacePage: React.FC<SkillsPlacementWorkspacePageProps> = ({
  onBackToLanding,
  onNavigate,
}) => {
  const { activeWorkspace, setActiveWorkspace, selectedStudentId, setSelectedStudentId } = useWorkspace();
  const [viewRole, setViewRole] = useState<'faculty' | 'student' | 'admin'>(activeWorkspace);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-8 md:px-12 max-w-7xl mx-auto space-y-8 animate-fadeIn text-[#f0f1ff]">
      {/* Top Banner & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8e96c8] mb-2">
            <button
              onClick={onBackToLanding}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-white/40" />
            <span className="text-[#5eead4]">Intelligence Layer</span>
            <ChevronRight className="w-3.5 h-3.5 text-white/40" />
            <span className="text-white font-bold">Skills & Placement Intelligence (Fluencis Integrated)</span>
          </div>
          <h1 className="font-baskerville text-2xl sm:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
            <span>Skills & Placement Intelligence</span>
            <span className="px-3 py-1 rounded-full bg-[#2dd4bf]/20 border border-[#2dd4bf]/40 text-[#5eead4] text-xs font-mono font-bold tracking-normal">
              Step 9 Complete Loop
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#cbd5e1] mt-2 max-w-3xl">
            Unified student growth framework connecting Fluencis oral communication practice, technical algorithmic benchmarks, and campus placement screening across Student, Faculty, and Admin perspectives.
          </p>
        </div>

        {/* Role Lens Switcher for this intelligence workspace */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#090b20] border border-[rgba(140,150,255,0.25)] shrink-0 self-start md:self-center shadow-lg">
          <button
            onClick={() => {
              setViewRole('student');
              setActiveWorkspace('student');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              viewRole === 'student'
                ? 'bg-[#2dd4bf] text-black font-bold shadow-md shadow-[#2dd4bf]/25'
                : 'text-[#a4a9d0] hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student View</span>
          </button>

          <button
            onClick={() => {
              setViewRole('faculty');
              setActiveWorkspace('faculty');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              viewRole === 'faculty'
                ? 'bg-[#ff6a2b] text-white font-bold shadow-md shadow-[#ff6a2b]/25'
                : 'text-[#a4a9d0] hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Faculty Lens</span>
          </button>

          <button
            onClick={() => {
              setViewRole('admin');
              setActiveWorkspace('admin');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              viewRole === 'admin'
                ? 'bg-[#a855f7] text-white font-bold shadow-md shadow-[#a855f7]/25'
                : 'text-[#a4a9d0] hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Institution Pipeline</span>
          </button>

          <button
            onClick={() => {
              setActiveWorkspace('student');
              onNavigate('communication-practice');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#2dd4bf]/20 to-[#38bdf8]/20 border border-[#2dd4bf]/40 text-[#5eead4] hover:bg-[#2dd4bf]/30 transition-all cursor-pointer"
            title="Open Fluencis Communication Practice & Growth Workspace"
          >
            <Mic className="w-3.5 h-3.5 text-emerald-400" />
            <span>Fluencis Practice</span>
          </button>
        </div>
      </div>

      {/* Render Perspective based on selected viewRole */}
      {viewRole === 'student' ? (
        <StudentSkillsPlacementView
          studentId={selectedStudentId}
          onNavigate={onNavigate}
        />
      ) : viewRole === 'faculty' ? (
        <FacultySkillGapPanel
          selectedStudentId={selectedStudentId}
          onSelectStudent={(stId) => setSelectedStudentId(stId)}
          onInitiateIntervention={(stId, type) => {
            setSelectedStudentId(stId);
            onNavigate('faculty-workspace');
          }}
        />
      ) : (
        <AdministratorPlacementIntelligence />
      )}
    </div>
  );
};
