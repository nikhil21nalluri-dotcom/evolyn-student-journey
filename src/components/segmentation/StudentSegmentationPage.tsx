import React, { useState } from 'react';
import {
  Layers,
  Users,
  TrendingUp,
  Award,
  AlertTriangle,
  Briefcase,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  ShieldCheck,
  Building2,
  MessageSquare,
  BookOpen,
} from 'lucide-react';
import {
  StudentSegmentType,
  SEGMENT_DEFINITIONS,
  getSegmentCohortStats,
  ALL_STUDENT_SEGMENTS,
  StudentSegmentProfile,
} from '../../data/studentSegmentationEngine';
import { StudentCard } from '../common/StudentCard';
import { STUDENT_GROWTH_DATA } from '../../data/studentGrowthData';
import { getSegmentDecisionIntelligence } from '../../data/studentDecisionEngine';

interface StudentSegmentationPageProps {
  onNavigate?: (view: any) => void;
  onSelectStudent?: (studentId: string) => void;
  onOpenDm?: (studentId: string) => void;
  onOpenLms?: (studentId: string) => void;
}

export const StudentSegmentationPage: React.FC<StudentSegmentationPageProps> = ({
  onNavigate,
  onSelectStudent,
  onOpenDm,
  onOpenLms,
}) => {
  const [selectedSegmentId, setSelectedSegmentId] = useState<StudentSegmentType>(
    'ACADEMIC_STRONG_PLACEMENT_NEEDS_SUPPORT'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBranch, setFilterBranch] = useState('all');

  const segmentStats = getSegmentCohortStats();
  const currentSegmentData = segmentStats.find(
    (s) => s.segmentDef.id === selectedSegmentId
  ) || segmentStats[0];

  // Students in selected segment filtered by search and branch
  const activeSegmentStudents = ALL_STUDENT_SEGMENTS.filter((s) => {
    const matchesSegment = s.primarySegment === selectedSegmentId;
    const matchesSearch =
      s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.branch.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBranch = filterBranch === 'all' || s.branch === filterBranch;
    return matchesSegment && matchesSearch && matchesBranch;
  });

  // Fallback to all matching or related if search is empty to ensure rich list
  const displayStudents = activeSegmentStudents.length > 0 
    ? activeSegmentStudents 
    : ALL_STUDENT_SEGMENTS.filter((s) => s.primarySegment === selectedSegmentId);

  return (
    <div className="relative min-h-screen w-full pt-20 pb-24 px-4 sm:px-8 max-w-7xl mx-auto text-[#f0f1ff]">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-[rgba(140,150,255,0.15)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-white shadow-md shadow-[#6366f1]/25">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-baskerville text-xl sm:text-2xl font-bold text-white">
                Intelligent Student Segmentation
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#6366f1]/20 border border-[#6366f1]/35 font-mono text-[10px] font-bold text-[#c7d2fe]">
                7 COHORT PATTERNS
              </span>
            </div>
            <p className="text-xs text-[#a4a9d0]">
              Derives student cohorts from unified indicators (Academic, Attendance, LMS, Engagement, Placement, Skills, Feedback).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-[#8e96c8] hidden sm:inline">Total Monitored:</span>
          <span className="px-3 py-1 rounded-full bg-[#0b0f2a] border border-[#222955] text-white font-bold">
            1,240 Enrolled Students
          </span>
        </div>
      </div>

      {/* Segment Cards Grid (Clickable) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {segmentStats.map((stat) => {
          const isSelected = selectedSegmentId === stat.segmentDef.id;
          const def = stat.segmentDef;

          return (
            <div
              key={def.id}
              onClick={() => setSelectedSegmentId(def.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between group ${
                isSelected
                  ? `bg-[#0e1335] ${def.borderColor} shadow-xl ring-1 ring-inset ring-white/20`
                  : 'bg-[#0b0f2a] border-[#222955] hover:border-[#6f8dff]/60 hover:bg-[#10153d]'
              }`}
            >
              {/* Subtle ambient accent glow */}
              <div
                className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-40 transition-all group-hover:opacity-75"
                style={{ backgroundColor: def.glowColor }}
              />

              <div className="relative z-10 space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${def.badgeColor}`}
                  >
                    {stat.generalTrend}
                  </span>
                  <span className="text-[10px] font-mono text-[#8e96c8]">
                    Avg Score: <strong className="text-white">{stat.avgSuccessScore}</strong>
                  </span>
                </div>

                <h3 className="font-baskerville text-base font-bold text-white leading-snug group-hover:text-[#c7d2fe] transition-colors">
                  {def.name}
                </h3>

                <p className="text-[11px] text-[#8e96c8] line-clamp-2 leading-relaxed">
                  {def.description}
                </p>
              </div>

              <div className="relative z-10 mt-4 pt-3 border-t border-[#1d2350] flex items-baseline justify-between">
                <div>
                  <span className="font-mono text-2xl font-black text-white">
                    {stat.institutionalScaledCount}
                  </span>
                  <span className="text-[11px] text-[#8e96c8] ml-1 font-mono">students</span>
                </div>

                <span className="text-xs font-mono text-[#8e96c8] group-hover:text-white flex items-center">
                  <span>Inspect</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Segment Deep Dive Banner & Characteristics */}
      <div className="p-6 rounded-2xl bg-[#0c1033] border border-[#222955] shadow-xl mb-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#1c224a]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${currentSegmentData.segmentDef.badgeColor}`}
              >
                SELECTED COHORT
              </span>
              <h2 className="font-baskerville text-xl sm:text-2xl font-bold text-white">
                {currentSegmentData.segmentDef.name}
              </h2>
            </div>
            <p className="text-xs text-[#c2d1ff]">
              {currentSegmentData.segmentDef.description}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#06081c] p-3 rounded-xl border border-[#1f2552] font-mono text-xs">
            <div>
              <div className="text-[10px] text-[#8e96c8] uppercase">Segment Size</div>
              <div className="text-base font-bold text-white">
                {currentSegmentData.institutionalScaledCount} Students
              </div>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div>
              <div className="text-[10px] text-[#8e96c8] uppercase">Average Score</div>
              <div className="text-base font-bold text-[#ff8a50]">
                {currentSegmentData.avgSuccessScore} / 100
              </div>
            </div>
          </div>
        </div>

        {/* Characteristics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-[#06081c] border border-white/5 space-y-2">
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#ff8a50] font-bold">
              Cohort Diagnostic Characteristics
            </span>
            <ul className="space-y-1.5 text-xs text-[#a4a9d0]">
              {currentSegmentData.segmentDef.characteristics.map((c, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#ff6a2b] font-bold">•</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-[#06081c] border border-white/5 space-y-2">
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#2dd4bf] font-bold">
              Recommended Faculty & Growth Focus
            </span>
            <ul className="space-y-1.5 text-xs text-[#a4a9d0]">
              {currentSegmentData.segmentDef.developmentFocus.map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2dd4bf] shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* AI DECISION INTELLIGENCE FOR SEGMENT */}
        {(() => {
          const segDecision = getSegmentDecisionIntelligence(currentSegmentData.segmentDef.id);
          return (
            <div className="pt-4 border-t border-[#1c224a] space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#ff6a2b]" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#ffb27a]">
                  AI Decision Intelligence for Segment • Action Blueprint
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {/* WHAT */}
                <div className="p-3.5 rounded-xl bg-[#090d29] border border-[#1d2454]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#93c5fd] block mb-1">
                    WHAT (Observation)
                  </span>
                  <p className="text-[#c2d1ff] leading-relaxed">{segDecision.what}</p>
                </div>

                {/* WHY */}
                <div className="p-3.5 rounded-xl bg-[#090d29] border border-[#1d2454]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#c084fc] block mb-1">
                    WHY (Possible Pattern)
                  </span>
                  <p className="text-[#d8b4fe] leading-relaxed">{segDecision.why}</p>
                </div>

                {/* NEXT */}
                <div className="p-3.5 rounded-xl bg-[#090d29] border border-[#1d2454]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#5eead4] block mb-1">
                    NEXT (Recommended Actions)
                  </span>
                  <ul className="space-y-1 text-[#e2e8f0]">
                    {segDecision.next.map((n, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#2dd4bf] font-bold">•</span>
                        <span>{n}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* MONITOR */}
                <div className="p-3.5 rounded-xl bg-[#090d29] border border-[#1d2454]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#ffb27a] block mb-1">
                    MONITOR (Review Indicators)
                  </span>
                  <ul className="space-y-1 text-[#fde047]">
                    {segDecision.monitor.map((m, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#ffb27a] font-bold">•</span>
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Filter and Students in Selected Segment */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#0b0f2a] border border-[#222955] shadow-lg">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#a4a9d0]" />
            <input
              type="text"
              placeholder="Search students in this segment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#06081c] border border-[#1f2552] text-xs text-white placeholder-[#a4a9d0]/60 focus:outline-none focus:border-[#ff6a2b]"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto font-mono text-xs">
            <span className="text-[#8e96c8]">Filter Branch:</span>
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#06081c] border border-[#1f2552] text-xs text-white focus:outline-none focus:border-[#ff6a2b] cursor-pointer"
            >
              <option value="all">All Branches (CSE, ECE, EEE)</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
            </select>
          </div>
        </div>

        {/* Student Cards Roster for Selected Segment */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayStudents.map((st) => {
            const growthStudent =
              STUDENT_GROWTH_DATA.find((g) => g.id === st.studentId) || STUDENT_GROWTH_DATA[0];

            return (
              <div key={st.studentId} className="relative group">
                <StudentCard
                  student={growthStudent}
                  onSelect={() => onSelectStudent && onSelectStudent(st.studentId)}
                  onOpenDm={() => onOpenDm && onOpenDm(st.studentId)}
                  onOpenLms={() => onOpenLms && onOpenLms(st.studentId)}
                  onViewGrowthTrack={() => onNavigate && onNavigate('growth-track')}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Responsible AI Notice */}
      <div className="mt-10 p-4 rounded-xl bg-[#070b24] border border-[#1d2350] flex items-start space-x-3 text-xs text-[#8e96c8]">
        <ShieldCheck className="w-5 h-5 shrink-0 text-[#2dd4bf] mt-0.5" />
        <div>
          <strong className="text-white">Responsible AI & Dynamic Patterns: </strong>
          Segmentation represents a student's current pattern of indicators, not a permanent label or fixed judgment. Students seamlessly transition between segments as their indicators and learning rhythms change.
        </div>
      </div>
    </div>
  );
};
