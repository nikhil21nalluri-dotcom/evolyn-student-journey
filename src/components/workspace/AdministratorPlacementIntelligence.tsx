import React, { useState } from 'react';
import {
  Briefcase,
  Mic,
  BookOpen,
  Award,
  AlertTriangle,
  TrendingUp,
  Layers,
  Search,
  Filter,
  CheckCircle2,
  Building2,
  ExternalLink,
  Target,
  Sparkles,
  Clock,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useSkillsPlacement } from '../../context/SkillsPlacementContext';
import { useWorkspace } from '../../context/WorkspaceContext';

export const AdministratorPlacementIntelligence: React.FC = () => {
  const { getInstitutionalAnalytics } = useSkillsPlacement();
  const { setSelectedStudentId, setActiveWorkspace } = useWorkspace();

  const [selectedBranchFilter, setSelectedBranchFilter] = useState('all');
  const [selectedYearFilter, setSelectedYearFilter] = useState('all');
  const [selectedTierFilter, setSelectedTierFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const analytics = getInstitutionalAnalytics();

  const filteredStudents = analytics.overviews.filter((st) => {
    const matchBranch = selectedBranchFilter === 'all' || st.branch === selectedBranchFilter;
    const matchYear = selectedYearFilter === 'all' || st.year === selectedYearFilter;
    const matchTier = selectedTierFilter === 'all' || st.placementReadinessIndicator.statusLabel === selectedTierFilter;
    const matchSearch =
      searchQuery.trim() === '' ||
      st.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchBranch && matchYear && matchTier && matchSearch;
  });

  return (
    <div className="p-6 rounded-2xl bg-[#0c1033] border border-[#222955] shadow-xl space-y-6 animate-fadeIn text-[#f0f1ff]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#a855f7]/15 text-[#d8b4fe] border border-[#a855f7]/30 text-[10px] font-mono font-bold mb-1">
            <Building2 className="w-3.5 h-3.5 text-[#a855f7]" />
            <span>INSTITUTIONAL PLACEMENT & SKILLS INTELLIGENCE</span>
          </div>
          <h3 className="font-baskerville text-xl font-bold text-white">
            Campus Placement Readiness & Skill Gap Pipeline
          </h3>
          <p className="text-xs text-[#a4a9d0] mt-0.5">
            Aggregated institutional telemetry synthesising communication, algorithmic coding, and placement screening across all cohorts.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {/* Search */}
          <div className="flex items-center gap-1.5 bg-[#06081c] border border-[#1f2552] px-2.5 py-1.5 rounded-xl">
            <Search className="w-3 h-3 text-[#8e96c8]" />
            <input
              type="text"
              placeholder="Search student..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-white text-xs focus:outline-none w-28 sm:w-36 font-sans"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-[#06081c] border border-[#1f2552] px-2.5 py-1.5 rounded-xl">
            <span className="text-[#8e96c8]">Branch:</span>
            <select
              value={selectedBranchFilter}
              onChange={(e) => setSelectedBranchFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#090b20]">All Branches</option>
              <option value="CSE" className="bg-[#090b20]">CSE</option>
              <option value="ECE" className="bg-[#090b20]">ECE</option>
              <option value="AI/DS" className="bg-[#090b20]">AI/DS</option>
              <option value="MECH" className="bg-[#090b20]">MECH</option>
              <option value="EEE" className="bg-[#090b20]">EEE</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-[#06081c] border border-[#1f2552] px-2.5 py-1.5 rounded-xl">
            <span className="text-[#8e96c8]">Year:</span>
            <select
              value={selectedYearFilter}
              onChange={(e) => setSelectedYearFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#090b20]">All Years</option>
              <option value="1st Year" className="bg-[#090b20]">1st Year</option>
              <option value="2nd Year" className="bg-[#090b20]">2nd Year</option>
              <option value="3rd Year" className="bg-[#090b20]">3rd Year</option>
              <option value="4th Year" className="bg-[#090b20]">4th Year</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-[#06081c] border border-[#1f2552] px-2.5 py-1.5 rounded-xl">
            <span className="text-[#8e96c8]">Tier:</span>
            <select
              value={selectedTierFilter}
              onChange={(e) => setSelectedTierFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#090b20]">All Tiers</option>
              <option value="Placement Ready" className="bg-[#090b20]">Placement Ready</option>
              <option value="Technical Strong · Communication Polish Needed" className="bg-[#090b20]">Tech Strong · Comm Polish</option>
              <option value="Moderate Readiness" className="bg-[#090b20]">Moderate Readiness</option>
              <option value="Foundation Building" className="bg-[#090b20]">Foundation Building</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cohort Metric Summary Cards (Section 7 Overview) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-[#06081c] border border-[#1f2552]">
          <span className="text-[10px] font-mono uppercase text-[#8e96c8] block">Assessed Comm Skills</span>
          <div className="text-xl font-black text-white font-mono mt-1">
            {analytics.studentsWithAssessedCommunication} / {analytics.totalStudents}
          </div>
          <p className="text-[10px] text-[#a4a9d0] mt-0.5">Students with verified oral data</p>
        </div>

        <div className="p-4 rounded-xl bg-[#06081c] border border-[#1f2552]">
          <span className="text-[10px] font-mono uppercase text-[#8e96c8] block">Assessed Tech Skills</span>
          <div className="text-xl font-black text-white font-mono mt-1">
            {analytics.studentsWithAssessedTechnical} / {analytics.totalStudents}
          </div>
          <p className="text-[10px] text-[#a4a9d0] mt-0.5">DSA & practical benchmarks</p>
        </div>

        <div className="p-4 rounded-xl bg-[#06081c] border border-[#1f2552]">
          <span className="text-[10px] font-mono uppercase text-[#8e96c8] block">Assessment Coverage</span>
          <div className="text-xl font-black text-[#5eead4] font-mono mt-1">
            {analytics.placementReadinessCoverage}%
          </div>
          <p className="text-[10px] text-[#a4a9d0] mt-0.5">Readiness model calibrated</p>
        </div>

        <div className="p-4 rounded-xl bg-[#06081c] border border-[#1f2552]">
          <span className="text-[10px] font-mono uppercase text-[#8e96c8] block">Prep Participation</span>
          <div className="text-xl font-black text-[#c084fc] font-mono mt-1">
            {analytics.totalPracticeSessions} sessions
          </div>
          <p className="text-[10px] text-[#a4a9d0] mt-0.5">Fluencis practice logged</p>
        </div>

        <div className="p-4 rounded-xl bg-[#06081c] border border-[#1f2552]">
          <span className="text-[10px] font-mono uppercase text-[#8e96c8] block">Tier-1 Ready</span>
          <div className="text-xl font-black text-emerald-400 font-mono mt-1">
            {analytics.tierCounts.tier1Ready} students
          </div>
          <p className="text-[10px] text-[#a4a9d0] mt-0.5">Coding & comm &gt; 80%</p>
        </div>

        <div className="p-4 rounded-xl bg-[#06081c] border border-[#1f2552]">
          <span className="text-[10px] font-mono uppercase text-[#8e96c8] block">Support Priority</span>
          <div className="text-xl font-black text-amber-400 font-mono mt-1">
            {analytics.studentsNeedingSupport.length} students
          </div>
          <p className="text-[10px] text-[#a4a9d0] mt-0.5">Needs career coaching</p>
        </div>
      </div>

      {/* Aggregate Assessment Trends & Top Institutional Skill Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Aggregate Assessment Trends */}
        <div className="p-5 rounded-xl bg-[#06081c] border border-[#1f2552] space-y-3">
          <h4 className="font-baskerville text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#2dd4bf]" />
            <span>Aggregate Assessment Trends (Longitudinal Cohorts)</span>
          </h4>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-[#090d29] border border-white/5 flex items-center justify-between">
              <span className="text-[#cbd5e1]">Verbal & Interview Communication</span>
              <span className="font-mono text-emerald-400 font-bold">{analytics.aggregateTrends.communication}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#090d29] border border-white/5 flex items-center justify-between">
              <span className="text-[#cbd5e1]">Algorithmic Coding Benchmarks</span>
              <span className="font-mono text-emerald-400 font-bold">{analytics.aggregateTrends.technical}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#090d29] border border-white/5 flex items-center justify-between">
              <span className="text-[#cbd5e1]">Placement Aptitude Speed</span>
              <span className="font-mono text-cyan-400 font-bold">{analytics.aggregateTrends.aptitude}</span>
            </div>
          </div>
        </div>

        {/* Common Skill Gaps Across Student Cohort */}
        <div className="p-5 rounded-xl bg-[#06081c] border border-[#1f2552] space-y-3">
          <h4 className="font-baskerville text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#ff6a2b]" />
            <span>Common Skill Gaps Across Student Cohorts</span>
          </h4>
          <div className="space-y-2">
            {Object.entries(analytics.gapCounts).map(([skill, count]) => (
              <div key={skill} className="p-2.5 rounded-lg bg-[#090d29] border border-white/5 flex items-center justify-between text-xs">
                <span className="text-[#cbd5e1] font-medium truncate" title={skill}>{skill}</span>
                <span className="font-mono font-bold text-rose-400 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 shrink-0">
                  {count} students affected
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Student Readiness Table (Clearly distinguishing missing data from poor performance) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-baskerville text-sm font-bold text-white">
            Cohort Student-Level Assessment & Placement Status ({filteredStudents.length})
          </h4>
          <span className="text-[11px] font-mono text-[#a4a9d0]">
            Missing metrics marked as "Not assessed yet"
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#06081c]">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[#a4a9d0] font-semibold font-mono bg-[#090d29]">
                <th className="p-3">Student Name</th>
                <th className="p-3">Branch & Year</th>
                <th className="p-3 text-center">Communication</th>
                <th className="p-3 text-center">Coding Score</th>
                <th className="p-3 text-center">Aptitude Score</th>
                <th className="p-3 text-center">Data Completeness</th>
                <th className="p-3">Placement Readiness Tier</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredStudents.map((st) => (
                <tr key={st.studentId} className="hover:bg-white/[0.03] transition-colors">
                  <td className="p-3 font-medium text-white">
                    <div>{st.studentName}</div>
                    <div className="text-[10px] text-[#8e96c8] font-mono">{st.studentId}</div>
                  </td>
                  <td className="p-3 text-[#a4a9d0] font-mono text-[11px]">
                    {st.branch} • {st.year}
                  </td>
                  <td className="p-3 text-center font-mono">
                    {st.communication.compositeCommunicationScore !== undefined ? (
                      <span className="font-bold text-[#5eead4]">
                        {st.communication.compositeCommunicationScore}/100
                      </span>
                    ) : (
                      <span className="text-[#64748b] text-[10px] italic">Not assessed yet</span>
                    )}
                  </td>
                  <td className="p-3 text-center font-mono">
                    {st.technical.codingAssessmentScore !== undefined ? (
                      <span className="font-bold text-[#93c5fd]">
                        {st.technical.codingAssessmentScore}/100
                      </span>
                    ) : (
                      <span className="text-[#64748b] text-[10px] italic">Not assessed yet</span>
                    )}
                  </td>
                  <td className="p-3 text-center font-mono">
                    {st.careerReadiness.aptitudeScore !== undefined ? (
                      <span className="font-bold text-[#c084fc]">
                        {st.careerReadiness.aptitudeScore}/100
                      </span>
                    ) : (
                      <span className="text-[#64748b] text-[10px] italic">Not assessed yet</span>
                    )}
                  </td>
                  <td className="p-3 text-center font-mono">
                    <span className="px-2 py-0.5 rounded bg-white/5 text-[11px] font-bold text-[#cbd5e1]">
                      {st.placementReadinessIndicator.dataCompleteness.percentage}%
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                        st.placementReadinessIndicator.statusLabel === 'Placement Ready'
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                          : st.placementReadinessIndicator.statusLabel === 'Technical Strong · Communication Polish Needed'
                          ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                          : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                      }`}
                    >
                      {st.placementReadinessIndicator.statusLabel}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedStudentId(st.studentId);
                        setActiveWorkspace('faculty');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#a855f7]/20 hover:bg-[#a855f7] border border-[#a855f7]/40 text-white transition-colors cursor-pointer text-[11px] font-mono"
                    >
                      Open Skill Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
