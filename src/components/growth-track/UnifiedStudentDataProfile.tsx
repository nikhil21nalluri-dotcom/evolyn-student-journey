import React, { useState } from 'react';
import {
  UnifiedStudentProfile,
  getUnifiedStudentProfile,
} from '../../data/unifiedStudentData';
import { useIntervention } from '../../context/InterventionContext';
import {
  GraduationCap,
  Calendar,
  Laptop,
  Users,
  Briefcase,
  Mic,
  MessageSquare,
  Database,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Layers,
  Activity,
  FileText,
  ChevronDown,
  ChevronUp,
  Award,
  BookOpen,
  Clock,
  Radio,
} from 'lucide-react';

interface UnifiedStudentDataProfileProps {
  studentIdOrName: string;
  onNavigateToSilentStruggle?: () => void;
}

type CategoryTab = 'all' | 'academic' | 'attendance' | 'lms' | 'engagement' | 'placement' | 'skills' | 'feedback';

export const UnifiedStudentDataProfile: React.FC<UnifiedStudentDataProfileProps> = ({
  studentIdOrName,
  onNavigateToSilentStruggle,
}) => {
  const profile: UnifiedStudentProfile = getUnifiedStudentProfile(studentIdOrName);
  const { getStudentInterventions } = useIntervention();
  const studentInterventions = getStudentInterventions(profile.id);
  const [activeTab, setActiveTab] = useState<CategoryTab>('all');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    academic: true,
    attendance: true,
    lms: true,
    engagement: true,
    placement: true,
    skills: true,
    feedback: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const expandAll = () => {
    setExpandedSections({
      academic: true,
      attendance: true,
      lms: true,
      engagement: true,
      placement: true,
      skills: true,
      feedback: true,
    });
  };

  const collapseAll = () => {
    setExpandedSections({
      academic: false,
      attendance: false,
      lms: false,
      engagement: false,
      placement: false,
      skills: false,
      feedback: false,
    });
  };

  // Helper for trend badge
  const renderTrendBadge = (trend: 'improving' | 'stable' | 'declining') => {
    if (trend === 'improving') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
          <TrendingUp className="w-3 h-3 text-emerald-400" />
          <span>Improving</span>
        </span>
      );
    }
    if (trend === 'declining') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-rose-950/60 text-rose-300 border border-rose-500/30">
          <TrendingDown className="w-3 h-3 text-rose-400" />
          <span>Declining</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-blue-950/60 text-blue-300 border border-blue-500/30">
        <Minus className="w-3 h-3 text-blue-400" />
        <span>Stable</span>
      </span>
    );
  };

  return (
    <div id="unified-student-data-profile" className="mb-14 p-6 sm:p-10 rounded-3xl glass-card border border-[rgba(140,150,255,0.22)] shadow-2xl relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle,rgba(111,141,255,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[radial-gradient(circle,rgba(255,106,43,0.10)_0%,transparent_70%)] pointer-events-none" />

      {/* 1. Header Bar with Unified Intelligence Badge */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[rgba(140,150,255,0.18)]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold tracking-widest uppercase text-[#a3b8ff] rounded-full bg-[rgba(111,141,255,0.15)] border border-[#6f8dff]/30 mb-2 font-mono">
            <Database className="w-3.5 h-3.5 text-[#6f8dff]" />
            <span>Unified Student Data Intelligence Foundation</span>
          </div>

          <h2 className="font-baskerville text-3xl sm:text-4xl font-bold text-[#f0f1ff] tracking-tight">
            Unified Student Profile
          </h2>

          <p className="text-xs sm:text-sm text-[#a4a9d0] mt-1 max-w-2xl leading-relaxed">
            Synthesizing 7 heterogeneous institutional data sources for <span className="text-white font-medium">{profile.name}</span> into a single, cohesive intelligence record.
          </p>
        </div>

        {/* Data Architecture Pipeline Mini-Badge */}
        <div className="p-3.5 rounded-2xl bg-[rgba(14,16,40,0.75)] border border-white/10 flex flex-col gap-1.5 shrink-0 text-left">
          <div className="flex items-center gap-2 text-xs font-mono text-[#ffb27a]">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <strong className="text-white font-bold">7 Sources Synchronized</strong>
          </div>
          <div className="text-[11px] text-[#a4a9d0] font-mono">
            SIS · Biometrics · LMS · Clubs · Placement · Skills · Faculty
          </div>
        </div>
      </div>

      {/* 2. Architecture Principle Banner: MULTIPLE SOURCES -> ONE STUDENT -> UNIFIED PROFILE */}
      <div className="my-6 p-4 rounded-2xl bg-gradient-to-r from-[#0d102e] via-[#121644] to-[#0a0d24] border border-[#6f8dff]/25 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-2 text-[#c2d1ff]">
          <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-white font-bold">Multiple Data Sources</span>
          <span className="text-[#ff8a50]">➔</span>
          <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-white font-bold">1 Student ({profile.name})</span>
          <span className="text-[#ff8a50]">➔</span>
          <span className="px-2.5 py-1 rounded-lg bg-[#6f8dff]/20 border border-[#6f8dff]/40 text-[#a3b8ff] font-bold">Unified Profile</span>
          <span className="text-[#ff8a50]">➔</span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-bold">Combined Analysis</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={expandAll}
            className="text-[11px] text-[#a4a9d0] hover:text-white px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="text-[11px] text-[#a4a9d0] hover:text-white px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* 3. Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6 scrollbar-none text-xs font-mono">
        {[
          { id: 'all', label: 'All 7 Categories', count: '7' },
          { id: 'academic', label: '1. Academic', count: `${profile.academic.cgpa} CGPA` },
          { id: 'attendance', label: '2. Attendance', count: `${profile.attendance.overallPercentage}%` },
          { id: 'lms', label: '3. LMS', count: `${profile.lms.loginFrequencyPerWeek}/wk` },
          { id: 'engagement', label: '4. Engagement', count: `${profile.engagement.participationScore}%` },
          { id: 'placement', label: '5. Placement', count: `${profile.placement.aptitudeScore} Apt` },
          { id: 'skills', label: '6. Skills (Fluencis)', count: 'Soft + Tech' },
          { id: 'feedback', label: '7. Feedback', count: `${profile.feedback.studentSatisfactionScore}%` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as CategoryTab)}
            className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-[#ff6a2b] to-[#ff8a50] text-white font-bold shadow-md shadow-[#ff6a2b]/25'
                : 'bg-[#090c28] border border-white/10 text-[#a4a9d0] hover:text-white hover:bg-[#12163f]'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${activeTab === tab.id ? 'bg-black/25 text-white' : 'bg-white/5 text-[#8e96c8]'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* =========================================================================
          THE 7 UNIFIED CATEGORIES DATA CARDS
      ========================================================================= */}
      <div className="space-y-6">

        {/* =====================================================================
            CATEGORY 1: ACADEMIC
        ===================================================================== */}
        {(activeTab === 'all' || activeTab === 'academic') && (
          <div className="p-6 rounded-2xl bg-[#090d26]/85 border border-[#6f8dff]/25 hover:border-[#6f8dff]/45 transition-all shadow-xl">
            <div
              onClick={() => toggleSection('academic')}
              className="flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#6f8dff]/20 text-[#a3b8ff] border border-[#6f8dff]/30 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-[#6f8dff]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-baskerville text-lg sm:text-xl font-bold text-white">
                      1. Academic Performance
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                      {profile.academic.academicStanding}
                    </span>
                  </div>
                  <p className="text-xs text-[#a4a9d0] mt-0.5">
                    Coursework transcript, subject-level grades, and term-level progression.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block font-mono">
                  <span className="text-base font-bold text-white">{profile.academic.cgpa} CGPA</span>
                  <span className="text-[11px] text-[#8e96c8] block">{profile.academic.overallMarks}% Aggregate</span>
                </div>
                {expandedSections.academic ? (
                  <ChevronUp className="w-5 h-5 text-[#8e96c8]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#8e96c8]" />
                )}
              </div>
            </div>

            {expandedSections.academic && (
              <div className="mt-6 pt-5 border-t border-white/10 space-y-5 animate-fadeIn">
                {/* Metric Summary Strips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-black/35 border border-white/5">
                    <span className="text-[11px] text-[#a4a9d0] font-mono uppercase block">Cumulative GPA</span>
                    <span className="font-baskerville text-2xl font-black text-white">{profile.academic.cgpa}</span>
                    <span className="text-[10px] text-[#8e96c8] font-mono block">Scale 0–10.0</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/35 border border-white/5">
                    <span className="text-[11px] text-[#a4a9d0] font-mono uppercase block">Overall Marks</span>
                    <span className="font-baskerville text-2xl font-black text-white">{profile.academic.overallMarks}%</span>
                    <span className="text-[10px] text-emerald-400 font-mono block">Curricular Average</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/35 border border-white/5">
                    <span className="text-[11px] text-[#a4a9d0] font-mono uppercase block">Backlogs</span>
                    <span className={`font-baskerville text-2xl font-black ${profile.academic.backlogs === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {profile.academic.backlogs}
                    </span>
                    <span className="text-[10px] text-[#8e96c8] font-mono block">
                      {profile.academic.backlogs === 0 ? 'Clean Record' : 'Requires Clearance'}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/35 border border-white/5">
                    <span className="text-[11px] text-[#a4a9d0] font-mono uppercase block">Current Term</span>
                    <span className="font-baskerville text-2xl font-black text-[#ffb27a]">{profile.currentSemester}</span>
                    <span className="text-[10px] text-[#8e96c8] font-mono block">{profile.year}</span>
                  </div>
                </div>

                {/* Subject-Wise Performance Table */}
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#a3b8ff] mb-2.5 font-semibold">
                    Current Semester Subject Performance
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {profile.academic.subjectPerformance.map((subj) => (
                      <div key={subj.code} className="p-3 rounded-xl bg-black/25 border border-white/5 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">{subj.code}</span>
                            <span className="text-xs font-semibold text-white">{subj.name}</span>
                          </div>
                          <span className="text-[11px] text-[#8e96c8] font-mono block mt-0.5">
                            Credits: {subj.credits} {subj.grade && `· Grade ${subj.grade}`}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-baskerville font-bold text-sm text-white">{subj.score}%</span>
                          <div className="w-16 h-1.5 rounded-full bg-white/10 mt-1 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#6f8dff] to-emerald-400 rounded-full" style={{ width: `${subj.score}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Historical Term Progression */}
                <div className="p-4 rounded-xl bg-black/30 border border-white/5">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#a4a9d0] mb-2 block font-semibold">
                    Historical Term-Level Progression
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-mono">
                    {profile.academic.history.map((hist, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                        <span className="text-[10px] text-[#8e96c8] block">{hist.term}</span>
                        <span className="text-sm font-bold text-white block mt-0.5">{hist.cgpa} CGPA</span>
                        <span className="text-[10px] text-[#ffb27a] block">{hist.marksPercentage}% · {hist.creditsEarned} Cr</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            CATEGORY 2: ATTENDANCE
        ===================================================================== */}
        {(activeTab === 'all' || activeTab === 'attendance') && (
          <div className="p-6 rounded-2xl bg-[#090d26]/85 border border-[#6f8dff]/25 hover:border-[#6f8dff]/45 transition-all shadow-xl">
            <div
              onClick={() => toggleSection('attendance')}
              className="flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ff6a2b]/20 text-[#ffb27a] border border-[#ff6a2b]/30 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#ff6a2b]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-baskerville text-lg sm:text-xl font-bold text-white">
                      2. Attendance Telemetry
                    </span>
                    {renderTrendBadge(profile.attendance.attendanceTrend)}
                  </div>
                  <p className="text-xs text-[#a4a9d0] mt-0.5">
                    Overall percentage, subject attendance breakdown, and RFID biometric trend.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block font-mono">
                  <span className="text-base font-bold text-white">{profile.attendance.overallPercentage}%</span>
                  <span className="text-[11px] text-emerald-400 block">Biometric Synced</span>
                </div>
                {expandedSections.attendance ? (
                  <ChevronUp className="w-5 h-5 text-[#8e96c8]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#8e96c8]" />
                )}
              </div>
            </div>

            {expandedSections.attendance && (
              <div className="mt-6 pt-5 border-t border-white/10 space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {profile.attendance.subjectWiseAttendance.map((sub, i) => (
                    <div key={i} className="p-3 rounded-xl bg-black/25 border border-white/5 flex items-center justify-between">
                      <div className="flex-1 pr-3">
                        <span className="text-xs font-semibold text-white block">{sub.subjectName}</span>
                        <span className="text-[11px] text-[#8e96c8] font-mono">
                          {sub.classesAttended} / {sub.totalClasses} lectures attended
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`font-mono font-bold text-xs ${sub.attendancePercentage >= 85 ? 'text-emerald-300' : 'text-[#ffb27a]'}`}>
                          {sub.attendancePercentage}%
                        </span>
                        <div className="w-16 h-1.5 rounded-full bg-white/10 mt-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${sub.attendancePercentage >= 85 ? 'bg-emerald-400' : 'bg-[#ff6a2b]'}`}
                            style={{ width: `${sub.attendancePercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Monthly Trend Points */}
                <div className="p-4 rounded-xl bg-black/30 border border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                  <span className="text-[#a4a9d0]">Monthly Biometric Trend:</span>
                  <div className="flex items-center gap-3">
                    {profile.attendance.history.map((pt, i) => (
                      <span key={i} className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-white">
                        {pt.period}: <strong className="text-[#ffb27a]">{pt.percentage}%</strong>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            CATEGORY 3: LMS ENGAGEMENT
        ===================================================================== */}
        {(activeTab === 'all' || activeTab === 'lms') && (
          <div className="p-6 rounded-2xl bg-[#090d26]/85 border border-[#6f8dff]/25 hover:border-[#6f8dff]/45 transition-all shadow-xl">
            <div
              onClick={() => toggleSection('lms')}
              className="flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center">
                  <Laptop className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-baskerville text-lg sm:text-xl font-bold text-white">
                      3. LMS / Learning Engagement
                    </span>
                    {renderTrendBadge(profile.lms.activityTrend)}
                  </div>
                  <p className="text-xs text-[#a4a9d0] mt-0.5">
                    Canvas/Moodle login frequency, assignment completion rate, and digital stamina.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block font-mono">
                  <span className="text-base font-bold text-white">{profile.lms.loginFrequencyPerWeek} / wk</span>
                  <span className="text-[11px] text-[#8e96c8] block">{profile.lms.assignmentCompletionRate}% Submissions</span>
                </div>
                {expandedSections.lms ? (
                  <ChevronUp className="w-5 h-5 text-[#8e96c8]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#8e96c8]" />
                )}
              </div>
            </div>

            {expandedSections.lms && (
              <div className="mt-6 pt-5 border-t border-white/10 space-y-4 animate-fadeIn">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-black/35 border border-white/5">
                    <span className="text-[11px] text-[#a4a9d0] font-mono uppercase block">Login Frequency</span>
                    <span className="font-baskerville text-2xl font-black text-white">{profile.lms.loginFrequencyPerWeek}</span>
                    <span className="text-[10px] text-[#8e96c8] font-mono block">logins per week</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/35 border border-white/5">
                    <span className="text-[11px] text-[#a4a9d0] font-mono uppercase block">Assignment Completion</span>
                    <span className="font-baskerville text-2xl font-black text-white">{profile.lms.assignmentCompletionRate}%</span>
                    <span className="text-[10px] text-emerald-400 font-mono block">Submission Pacing</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/35 border border-white/5">
                    <span className="text-[11px] text-[#a4a9d0] font-mono uppercase block">Modules Explored</span>
                    <span className="font-baskerville text-2xl font-black text-white">
                      {profile.lms.modulesAccessed} <span className="text-xs text-[#8e96c8]">/ {profile.lms.totalModules}</span>
                    </span>
                    <span className="text-[10px] text-[#8e96c8] font-mono block">Portal Curricula</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/35 border border-white/5">
                    <span className="text-[11px] text-[#a4a9d0] font-mono uppercase block">Avg Session Time</span>
                    <span className="font-baskerville text-2xl font-black text-[#ffb27a]">{profile.lms.averageSessionDurationMins}m</span>
                    <span className="text-[10px] text-[#8e96c8] font-mono block">Active Reading Depth</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-black/25 border border-white/5 flex items-center justify-between text-xs font-mono text-[#a4a9d0]">
                  <span>Last active: <strong className="text-white">{profile.lms.lastActiveDaysAgo === 0 ? 'Today' : `${profile.lms.lastActiveDaysAgo} day(s) ago`}</strong></span>
                  <span>Forum Discussions: <strong className="text-white">{profile.lms.forumDiscussionPosts} contributions</strong></span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            CATEGORY 4: ENGAGEMENT
        ===================================================================== */}
        {(activeTab === 'all' || activeTab === 'engagement') && (
          <div className="p-6 rounded-2xl bg-[#090d26]/85 border border-[#6f8dff]/25 hover:border-[#6f8dff]/45 transition-all shadow-xl">
            <div
              onClick={() => toggleSection('engagement')}
              className="flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center">
                  <Users className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-baskerville text-lg sm:text-xl font-bold text-white">
                      4. Behavioral &amp; Student Engagement
                    </span>
                    {renderTrendBadge(profile.engagement.engagementTrend)}
                  </div>
                  <p className="text-xs text-[#a4a9d0] mt-0.5">
                    Events, clubs, hackathons, certifications, and peer collaboration dynamics.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block font-mono">
                  <span className="text-base font-bold text-white">{profile.engagement.eventsAttended} Events · {profile.engagement.clubsActive} Clubs</span>
                  <span className="text-[11px] text-[#ffb27a] block">{profile.engagement.certificationsCount} Certifications</span>
                </div>
                {expandedSections.engagement ? (
                  <ChevronUp className="w-5 h-5 text-[#8e96c8]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#8e96c8]" />
                )}
              </div>
            </div>

            {expandedSections.engagement && (
              <div className="mt-6 pt-5 border-t border-white/10 space-y-4 animate-fadeIn">
                {/* 4 Core Pillars */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                    <span className="text-[11px] text-[#a4a9d0] font-mono uppercase block">Events</span>
                    <span className="font-baskerville text-xl font-bold text-white">{profile.engagement.eventsAttended}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                    <span className="text-[11px] text-[#a4a9d0] font-mono uppercase block">Clubs Active</span>
                    <span className="font-baskerville text-xl font-bold text-white">{profile.engagement.clubsActive}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                    <span className="text-[11px] text-[#a4a9d0] font-mono uppercase block">Hackathons</span>
                    <span className="font-baskerville text-xl font-bold text-white">{profile.engagement.hackathonsCount}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                    <span className="text-[11px] text-[#a4a9d0] font-mono uppercase block">Certifications</span>
                    <span className="font-baskerville text-xl font-bold text-white">{profile.engagement.certificationsCount}</span>
                  </div>
                </div>

                {/* Engagement Breakdown Bars */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-black/25 border border-white/5">
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-[#a4a9d0]">Participation</span>
                      <span className="text-white font-bold">{profile.engagement.participationScore}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${profile.engagement.participationScore}%` }} />
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-black/25 border border-white/5">
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-[#a4a9d0]">Peer Collaboration</span>
                      <span className="text-white font-bold">{profile.engagement.peerCollaborationScore}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-[#ff6a2b] rounded-full" style={{ width: `${profile.engagement.peerCollaborationScore}%` }} />
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-black/25 border border-white/5">
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-[#a4a9d0]">Activity Consistency</span>
                      <span className="text-white font-bold">{profile.engagement.activityConsistencyScore}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-[#6f8dff] rounded-full" style={{ width: `${profile.engagement.activityConsistencyScore}%` }} />
                    </div>
                  </div>
                </div>

                {/* Active Clubs & Milestones */}
                <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 text-xs text-[#d0d6fa]">
                  <strong className="text-white block font-mono text-[11px] uppercase mb-1">Affiliated Campus Circles:</strong>
                  <span>{profile.engagement.clubNames.join(' · ')}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            CATEGORY 5: PLACEMENT READINESS
        ===================================================================== */}
        {(activeTab === 'all' || activeTab === 'placement') && (
          <div className="p-6 rounded-2xl bg-[#090d26]/85 border border-[#6f8dff]/25 hover:border-[#6f8dff]/45 transition-all shadow-xl">
            <div
              onClick={() => toggleSection('placement')}
              className="flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-baskerville text-lg sm:text-xl font-bold text-white">
                      5. Placement Readiness
                    </span>
                    {renderTrendBadge(profile.placement.preparationTrend)}
                  </div>
                  <p className="text-xs text-[#a4a9d0] mt-0.5">
                    Aptitude benchmarking, coding evaluations, and mock interview preparations.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block font-mono">
                  <span className="text-base font-bold text-white">{profile.placement.codingScore} Coding · {profile.placement.aptitudeScore} Apt</span>
                  <span className="text-[11px] text-[#8e96c8] block">{profile.placement.mockInterviewsCount} Mocks Completed</span>
                </div>
                {expandedSections.placement ? (
                  <ChevronUp className="w-5 h-5 text-[#8e96c8]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#8e96c8]" />
                )}
              </div>
            </div>

            {expandedSections.placement && (
              <div className="mt-6 pt-5 border-t border-white/10 space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-black/35 border border-white/5">
                    <span className="text-[11px] text-[#a4a9d0] font-mono uppercase block">Aptitude Score</span>
                    <span className="font-baskerville text-2xl font-black text-white">{profile.placement.aptitudeScore}</span>
                    <span className="text-[10px] text-[#8e96c8] font-mono block">Quantitative &amp; Logical / 100</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/35 border border-white/5">
                    <span className="text-[11px] text-[#a4a9d0] font-mono uppercase block">Coding Evaluation</span>
                    <span className="font-baskerville text-2xl font-black text-white">{profile.placement.codingScore}</span>
                    <span className="text-[10px] text-emerald-400 font-mono block">Algorithmic Benchmarking / 100</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/35 border border-white/5">
                    <span className="text-[11px] text-[#a4a9d0] font-mono uppercase block">Mock Interviews</span>
                    <span className="font-baskerville text-2xl font-black text-[#ffb27a]">{profile.placement.mockInterviewsCount}</span>
                    <span className="text-[10px] text-[#8e96c8] font-mono block">Industry Mentored Rounds</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-black/30 border border-amber-500/20 text-xs">
                  <span className="text-[11px] font-mono uppercase text-[#ff8a50] block font-semibold mb-1">
                    Current Readiness Condition:
                  </span>
                  <p className="text-[#e2e6fa] leading-relaxed italic">
                    &ldquo;{profile.placement.readinessCondition}&rdquo;
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono">
                  <span className="text-[#8e96c8]">Verified Skill Badges:</span>
                  {profile.placement.verifiedSkillBadges.map((badge, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-[#6f8dff]/15 border border-[#6f8dff]/30 text-[#c2d1ff]">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            CATEGORY 6: SKILLS (PREPARED FOR FLUENCIS)
        ===================================================================== */}
        {(activeTab === 'all' || activeTab === 'skills') && (
          <div className="p-6 rounded-2xl bg-[#090d26]/85 border border-[#6f8dff]/25 hover:border-[#6f8dff]/45 transition-all shadow-xl">
            <div
              onClick={() => toggleSection('skills')}
              className="flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center">
                  <Mic className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-baskerville text-lg sm:text-xl font-bold text-white">
                      6. Skills &amp; Communication (Fluencis Architecture)
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                      Fluencis Ready
                    </span>
                  </div>
                  <p className="text-xs text-[#a4a9d0] mt-0.5">
                    Technical skill proficiencies + voice, presentation, and debate signals prepared for Fluencis.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block font-mono">
                  <span className="text-base font-bold text-white">
                    {profile.skills.softSkillAssessments.communication}/100 Comm
                  </span>
                  <span className="text-[11px] text-purple-300 block">7 Soft Vectors Ready</span>
                </div>
                {expandedSections.skills ? (
                  <ChevronUp className="w-5 h-5 text-[#8e96c8]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#8e96c8]" />
                )}
              </div>
            </div>

            {expandedSections.skills && (
              <div className="mt-6 pt-5 border-t border-white/10 space-y-5 animate-fadeIn">
                {/* Technical Assessments */}
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#a3b8ff] mb-2.5 font-semibold">
                    Technical Skill Matrix
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {Object.entries(profile.skills.technicalSkillAssessments).map(([skill, score]) => (
                      <div key={skill} className="p-3 rounded-xl bg-black/25 border border-white/5">
                        <div className="flex justify-between text-xs font-mono mb-1">
                          <span className="text-white font-semibold truncate">{skill}</span>
                          <span className="text-emerald-400 font-bold">{score}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#6f8dff] to-emerald-400 rounded-full" style={{ width: `${score}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Soft Skills Telemetry (Fluencis Integration Schema) */}
                <div className="p-4 rounded-xl bg-black/35 border border-purple-500/25">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Mic className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-mono uppercase font-bold text-white">
                        Fluencis Soft Skill Telemetry Vectors
                      </span>
                    </div>
                    <span className="text-[10px] text-purple-300 font-mono">
                      Prepared for Fluencis Voice Ingestion
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-center text-xs font-mono">
                    {[
                      { label: 'Speaking', val: profile.skills.softSkillAssessments.speaking },
                      { label: 'Presentation', val: profile.skills.softSkillAssessments.presentation },
                      { label: 'Group Disc.', val: profile.skills.softSkillAssessments.groupDiscussion },
                      { label: 'Debate', val: profile.skills.softSkillAssessments.debate },
                      { label: 'Tech Disc.', val: profile.skills.softSkillAssessments.technicalDiscussion },
                      { label: 'Interview', val: profile.skills.softSkillAssessments.interviewSkills },
                      { label: 'Overall Comm', val: profile.skills.softSkillAssessments.communication },
                    ].map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                        <span className="text-[10px] text-[#8e96c8] block truncate">{item.label}</span>
                        <span className="text-base font-bold text-white block mt-0.5">{item.val}</span>
                        <div className="w-full h-1 rounded-full bg-white/10 mt-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${item.val >= 75 ? 'bg-emerald-400' : item.val >= 60 ? 'bg-[#6f8dff]' : 'bg-[#ff6a2b]'}`}
                            style={{ width: `${item.val}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            CATEGORY 7: FEEDBACK
        ===================================================================== */}
        {(activeTab === 'all' || activeTab === 'feedback') && (
          <div className="p-6 rounded-2xl bg-[#090d26]/85 border border-[#6f8dff]/25 hover:border-[#6f8dff]/45 transition-all shadow-xl">
            <div
              onClick={() => toggleSection('feedback')}
              className="flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-baskerville text-lg sm:text-xl font-bold text-white">
                      7. Qualitative Feedback &amp; Sentiment
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-[#d4daf5]">
                      {profile.feedback.feedbackDate}
                    </span>
                  </div>
                  <p className="text-xs text-[#a4a9d0] mt-0.5">
                    Student self-reflection satisfaction, faculty qualitative evaluations, and mentor logs.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block font-mono">
                  <span className="text-base font-bold text-white">{profile.feedback.studentSatisfactionScore}% Satisfaction</span>
                  <span className="text-[11px] text-[#8e96c8] block">{profile.feedback.facultyAuthor}</span>
                </div>
                {expandedSections.feedback ? (
                  <ChevronUp className="w-5 h-5 text-[#8e96c8]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#8e96c8]" />
                )}
              </div>
            </div>

            {expandedSections.feedback && (
              <div className="mt-6 pt-5 border-t border-white/10 space-y-4 animate-fadeIn">
                {/* Faculty Feedback Quote */}
                <div className="p-4 rounded-xl bg-black/35 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono uppercase text-[#ff8a50] font-semibold">
                      Faculty Evaluation ({profile.feedback.facultyDepartment})
                    </span>
                    <span className="text-xs text-white font-serif">{profile.feedback.facultyAuthor}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#e2e6fa] leading-relaxed font-serif italic">
                    &ldquo;{profile.feedback.facultyFeedback}&rdquo;
                  </p>
                </div>

                {/* Mentor Feedback Quote */}
                <div className="p-3.5 rounded-xl bg-black/25 border border-white/5 text-xs text-[#a4a9d0]">
                  <strong className="text-white block font-mono text-[11px] uppercase mb-1">Mentor Observation:</strong>
                  <p className="leading-relaxed">{profile.feedback.mentorFeedback}</p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* 4. Combined Cross-Source Synthesis Card */}
      <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-[#12163f] to-[#0a0d26] border border-[#6f8dff]/30 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-[#ff6a2b]" />
          <h3 className="font-baskerville text-base sm:text-lg font-bold text-white">
            Combined Cross-Source Intelligence Synthesis
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#6f8dff]/20 text-[#c2d1ff]">
            Data Quality Checked
          </span>
        </div>

        <p className="text-xs text-[#a4a9d0] mb-3">
          Key insights derived from synthesizing all 7 data streams simultaneously for {profile.name}:
        </p>

        <ul className="space-y-2 text-xs text-[#d4daf5]">
          {profile.crossSourceSynthesis.map((synth, idx) => (
            <li key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-black/30 border border-white/5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff6a2b] mt-1.5 shrink-0" />
              <span className="leading-relaxed">{synth}</span>
            </li>
          ))}
        </ul>

        {/* Deep link into Silent Struggle or Growth Track */}
        {onNavigateToSilentStruggle && (
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#a4a9d0]">
            <span>See how these 7 unified data points manifest in temporal trend charts:</span>
            <button
              onClick={onNavigateToSilentStruggle}
              className="text-[#c2d1ff] hover:text-white font-mono font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Explore Silent Struggle Divergence →</span>
            </button>
          </div>
        )}
      </div>

      {/* 5. INTERVENTION HISTORY: Timeline of Support (Step 7) */}
      <div className="mt-8 p-6 rounded-2xl bg-[#0b0f2d] border border-[#222955] shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#ffb27a]" />
            <h3 className="font-baskerville text-base sm:text-lg font-bold text-white">
              INTERVENTION HISTORY & TIMELINE OF SUPPORT
            </h3>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[#8692c8]">
            {studentInterventions.length} Recorded Actions
          </span>
        </div>

        <p className="text-xs text-[#a4a9d0] mb-4">
          Chronological record of pedagogical interventions, mock interviews, and advisory support touchpoints for {profile.name}:
        </p>

        {studentInterventions.length === 0 ? (
          <div className="p-4 rounded-xl bg-black/20 border border-white/5 text-xs text-[#a4a9d0] text-center">
            No previous interventions recorded for this student profile yet.
          </div>
        ) : (
          <div className="space-y-3">
            {studentInterventions.map((rec) => (
              <div
                key={rec.id}
                className="p-4 rounded-xl bg-black/30 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-[#ffb27a] text-[11px]">{rec.date}</span>
                    <strong className="text-white text-sm">{rec.actionType}</strong>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        rec.status === 'ACTIVE'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : rec.status === 'COMPLETED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {rec.status}
                    </span>
                  </div>
                  <p className="text-[#a4a9d0]">{rec.reason}</p>
                  {rec.notes && (
                    <p className="text-white/80 italic mt-1 font-mono text-[11px]">
                      Faculty Note: "{rec.notes}"
                    </p>
                  )}
                </div>
                <div className="text-left sm:text-right font-mono text-[11px] text-[#8692c8] shrink-0">
                  <span>Priority: <strong className="text-white">{rec.priority}</strong></span>
                  <span className="block text-[10px] text-[#a4a9d0]">{rec.facultyName}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
