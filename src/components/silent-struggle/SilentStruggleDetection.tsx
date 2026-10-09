import React, { useState, useMemo } from 'react';
import {
  SILENT_STRUGGLE_STUDENTS,
  SilentStruggleStudent,
  SilentStruggleStatus,
  TimeWindowOption,
  DEMO_COHORT_STATS,
  getStudentSilentStruggleData,
} from '../../data/silentStruggleData';
import { getStudentSuccessScore } from '../../data/studentSuccessScore';
import { getStudentRiskProfile } from '../../data/studentRiskEngine';
import { getStudentDecisionIntelligence } from '../../data/studentDecisionEngine';
import { Sparkles } from 'lucide-react';
import { SignalComparisonCompass } from './SignalComparisonCompass';
import { TrendTimelineChart } from './TrendTimelineChart';

interface SilentStruggleDetectionProps {
  onNavigate?: (view: 'landing' | 'growth-track' | 'silent-struggle') => void;
  onBackToLanding?: () => void;
  onOpenAuth?: () => void;
}

export const SilentStruggleDetection: React.FC<SilentStruggleDetectionProps> = ({
  onNavigate,
  onBackToLanding,
  onOpenAuth,
}) => {
  // Selected student state
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    SILENT_STRUGGLE_STUDENTS[0]?.id || 'std-1'
  );

  // Time window state
  const [timeWindow, setTimeWindow] = useState<TimeWindowOption>('4weeks');

  // Filter state for student list
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Intervention modal state
  const [isInterventionModalOpen, setIsInterventionModalOpen] = useState<boolean>(false);
  const [interventionScheduled, setInterventionScheduled] = useState<boolean>(false);
  const [interventionNote, setInterventionNote] = useState<string>('');

  // Current selected student
  const selectedStudent: SilentStruggleStudent = useMemo(() => {
    return getStudentSilentStruggleData(selectedStudentId);
  }, [selectedStudentId]);

  // Filtered students list
  const filteredStudents = useMemo(() => {
    return SILENT_STRUGGLE_STUDENTS.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' || student.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  // Status badge styling helper
  const getStatusBadge = (status: SilentStruggleStatus) => {
    switch (status) {
      case 'MULTIPLE SIGNALS':
        return {
          bg: 'bg-rose-500/15',
          border: 'border-rose-500/40',
          text: 'text-rose-300',
          dot: 'bg-rose-400',
          label: 'Multiple Signals',
          tooltip: 'Multiple declining signals detected across several vectors',
        };
      case 'EARLY SIGNAL':
        return {
          bg: 'bg-amber-500/15',
          border: 'border-amber-500/40',
          text: 'text-amber-300',
          dot: 'bg-amber-400',
          label: 'Early Signal',
          tooltip: 'Early warning pattern detected in initial engagement decline',
        };
      case 'WATCH':
        return {
          bg: 'bg-orange-500/15',
          border: 'border-orange-500/40',
          text: 'text-orange-300',
          dot: 'bg-orange-400',
          label: 'Watch',
          tooltip: 'Potential concern noticed, monitoring trend persistence',
        };
      case 'NORMAL':
      default:
        return {
          bg: 'bg-emerald-500/15',
          border: 'border-emerald-500/40',
          text: 'text-emerald-300',
          dot: 'bg-emerald-400',
          label: 'Normal',
          tooltip: 'Signals aligned with healthy academic rhythms',
        };
    }
  };

  // Signals for the current time window
  const activeSignals = useMemo(() => {
    if (selectedStudent.timeWindowSignals?.[timeWindow]) {
      return selectedStudent.timeWindowSignals[timeWindow];
    }
    return selectedStudent.signals || [];
  }, [selectedStudent, timeWindow]);

  // AI Summary for current time window
  const currentAiSummary = useMemo(() => {
    if (selectedStudent.aiDetectionSummary?.[timeWindow]) {
      return selectedStudent.aiDetectionSummary[timeWindow];
    }
    return selectedStudent.statusDescription || 'Analysis in progress.';
  }, [selectedStudent, timeWindow]);

  const handleReturn = () => {
    if (onBackToLanding) {
      onBackToLanding();
    } else if (onNavigate) {
      onNavigate('landing');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050714] text-[#f0f1ff] pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative selection:bg-[#ff6a2b]/30 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-12 left-1/4 w-[500px] h-[500px] bg-[#6f8dff]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-48 right-1/4 w-[450px] h-[450px] bg-[#ff6a2b]/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Navigation Breadcrumbs / Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#232854]/60">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleReturn}
              className="group flex items-center space-x-2 text-xs font-medium text-[#9aa2d4] hover:text-white px-3 py-1.5 rounded-lg bg-[#111638]/70 border border-[#232854] hover:border-[#6f8dff]/50 transition-all"
            >
              <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Evolyn Core</span>
            </button>
            <span className="text-[#3b4379] font-mono">/</span>
            <span className="text-xs font-semibold text-[#ff8a50] tracking-wide uppercase font-mono">
              Intelligence Modules
            </span>
            <span className="text-[#3b4379] font-mono">/</span>
            <span className="text-xs text-white font-medium">Silent Struggle Detection</span>
          </div>

          <div className="flex items-center space-x-3">
            {onNavigate && (
              <button
                onClick={() => onNavigate('growth-track')}
                className="text-xs text-[#a0a8dd] hover:text-white px-3 py-1.5 rounded-lg bg-[#111638]/60 border border-[#232854] hover:border-[#6f8dff]/40 transition-all flex items-center space-x-1.5"
              >
                <span>Switch to Student Growth Track</span>
                <svg className="w-3.5 h-3.5 text-[#6f8dff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
            {onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="text-xs text-white px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#ff6a2b] to-[#ff8a50] hover:opacity-95 font-medium transition-all shadow-md shadow-[#ff6a2b]/20"
              >
                Faculty Sign In
              </button>
            )}
          </div>
        </div>

        {/* Feature Hero Header */}
        <div className="relative">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#ff6a2b]/15 border border-[#ff6a2b]/30 text-[#ff8a50] text-xs font-mono font-medium mb-3">
            <span className="w-2 h-2 rounded-full bg-[#ff6a2b] animate-ping" />
            <span>EVOLYN MULTI-SIGNAL INTELLIGENCE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif tracking-tight text-white leading-tight">
            Silent Struggle Detection
          </h1>
          <p className="mt-2 text-lg sm:text-xl text-[#c2c8f0] font-serif italic">
            &ldquo;Find the changes that traditional academic metrics can miss.&rdquo;
          </p>
          <p className="mt-2 text-sm sm:text-base text-[#9aa2d4] max-w-3xl leading-relaxed">
            Evolyn analyzes changes across multiple student signals to surface early warning patterns that may require attention.
            Because <strong className="text-white font-medium">not every struggle looks like failure</strong>, Evolyn helps institutions notice meaningful changes before they become obvious through academic results alone.
          </p>
        </div>

        {/* Cohort Intelligence Overview Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-[#0b0f2a]/80 border border-[#232854]/80 rounded-xl p-3.5 backdrop-blur-md">
            <div className="text-[11px] text-[#8e96c8] uppercase tracking-wider font-mono">Cohort Monitored</div>
            <div className="mt-1 text-2xl font-bold text-white font-mono">{DEMO_COHORT_STATS.totalMonitored}</div>
            <div className="text-[10px] text-[#6b73a6] mt-0.5">Active undergrads</div>
          </div>

          <div className="bg-[#0b0f2a]/80 border border-rose-500/30 rounded-xl p-3.5 backdrop-blur-md relative overflow-hidden">
            <div className="text-[11px] text-rose-300 uppercase tracking-wider font-mono">Multiple Signals</div>
            <div className="mt-1 text-2xl font-bold text-rose-400 font-mono">{DEMO_COHORT_STATS.multipleSignals}</div>
            <div className="text-[10px] text-rose-300/80 mt-0.5">Requires attention</div>
          </div>

          <div className="bg-[#0b0f2a]/80 border border-amber-500/30 rounded-xl p-3.5 backdrop-blur-md">
            <div className="text-[11px] text-amber-300 uppercase tracking-wider font-mono">Early Signals</div>
            <div className="mt-1 text-2xl font-bold text-amber-400 font-mono">{DEMO_COHORT_STATS.earlySignals}</div>
            <div className="text-[10px] text-amber-300/80 mt-0.5">Potential concern</div>
          </div>

          <div className="bg-[#0b0f2a]/80 border border-orange-500/30 rounded-xl p-3.5 backdrop-blur-md">
            <div className="text-[11px] text-orange-300 uppercase tracking-wider font-mono">Watch List</div>
            <div className="mt-1 text-2xl font-bold text-orange-400 font-mono">{DEMO_COHORT_STATS.watchCount}</div>
            <div className="text-[10px] text-orange-300/80 mt-0.5">Single-signal drift</div>
          </div>

          <div className="bg-[#0b0f2a]/80 border border-emerald-500/30 rounded-xl p-3.5 backdrop-blur-md">
            <div className="text-[11px] text-emerald-300 uppercase tracking-wider font-mono">Normal Rhythms</div>
            <div className="mt-1 text-2xl font-bold text-emerald-400 font-mono">{DEMO_COHORT_STATS.stableGrowth}</div>
            <div className="text-[10px] text-emerald-300/80 mt-0.5">Consistent signals</div>
          </div>

          <div className="bg-[#0b0f2a]/80 border border-[#6f8dff]/40 rounded-xl p-3.5 backdrop-blur-md">
            <div className="text-[11px] text-[#a6b8ff] uppercase tracking-wider font-mono">Avg Divergence Gap</div>
            <div className="mt-1 text-2xl font-bold text-[#6f8dff] font-mono">+16.4%</div>
            <div className="text-[10px] text-[#8e96c8] mt-0.5">Academic vs behavioral</div>
          </div>
        </div>

        {/* Responsible AI Disclaimer Banner */}
        <div className="bg-[#111738]/60 border border-[#2b3368] rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-[#a4addd]">
          <div className="flex items-center space-x-2.5">
            <span className="text-base text-amber-400">🛡️</span>
            <div>
              <strong className="text-white font-medium">Responsible Intelligence Framework:</strong> Evolyn does not predict failure or make deterministic claims. We surface early warning patterns in behavioral momentum so educators can provide caring, low-friction support.
            </div>
          </div>
          <div className="font-mono text-[11px] text-[#ff8a50] bg-[#ff6a2b]/10 border border-[#ff6a2b]/30 rounded px-2.5 py-1">
            Fictional Student Dataset
          </div>
        </div>

        {/* Main 2-Column Grid: Student Roster on Left, Deep Analysis on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Student Monitoring Roster (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#090d26]/90 border border-[#222955] rounded-2xl p-4 backdrop-blur-md shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#1c224a]">
                <h2 className="text-base font-semibold text-white font-serif flex items-center space-x-2">
                  <span>Student Monitoring Roster</span>
                  <span className="text-xs font-mono font-normal text-[#8e96c8]">({filteredStudents.length})</span>
                </h2>
                <div className="text-[11px] text-[#ff8a50] font-mono">Active Term</div>
              </div>

              {/* Search & Filter Bar */}
              <div className="mt-3 space-y-2.5">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search fictional students..."
                    className="w-full bg-[#050717] border border-[#232854] rounded-lg px-3 py-2 text-xs text-white placeholder-[#5a6296] focus:outline-none focus:border-[#ff6a2b]/60 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2 text-[#8e96c8] hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Status Filter Buttons */}
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {['ALL', 'MULTIPLE SIGNALS', 'EARLY SIGNAL', 'WATCH', 'NORMAL'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-2 py-1 rounded-md transition-all font-mono ${
                        statusFilter === st
                          ? 'bg-[#ff6a2b] text-white font-semibold shadow-sm'
                          : 'bg-[#12163b] text-[#8e96c8] hover:text-white border border-[#202752]'
                      }`}
                    >
                      {st === 'ALL' ? 'All' : st.replace(' ', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Student Cards List */}
              <div className="mt-4 space-y-2.5 max-h-[640px] overflow-y-auto pr-1 select-none">
                {filteredStudents.length === 0 ? (
                  <div className="text-center py-8 text-xs text-[#7b83b3]">
                    No students match the selected filter.
                  </div>
                ) : (
                  filteredStudents.map((student) => {
                    const isSelected = student.id === selectedStudentId;
                    const badge = getStatusBadge(student.status);

                    return (
                      <div
                        key={student.id}
                        onClick={() => setSelectedStudentId(student.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                          isSelected
                            ? 'bg-[#151c4a]/90 border-[#ff6a2b] shadow-lg shadow-[#ff6a2b]/10'
                            : 'bg-[#0e1335]/60 border-[#1d234d] hover:bg-[#131945]/70 hover:border-[#2f3875]'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-9 h-9 rounded-full bg-[#182054] border border-[#303a7d] flex items-center justify-center font-bold text-xs text-[#6f8dff] font-mono">
                              {student.avatarInitials}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-white font-serif">{student.name}</div>
                              <div className="text-[11px] text-[#8e96c8] font-mono">
                                {student.branch} • {student.year}
                              </div>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div
                            className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full border text-[10px] font-semibold font-mono ${badge.bg} ${badge.border} ${badge.text}`}
                            title={badge.tooltip}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                            <span>{badge.label}</span>
                          </div>
                        </div>

                        {/* Metric Micro-Bar comparison */}
                        <div className="mt-3 grid grid-cols-4 gap-1.5 pt-2.5 border-t border-[#1f2552]/60 text-center font-mono">
                          <div className="bg-[#080b20]/60 rounded p-1">
                            <div className="text-[9px] text-[#767ea8] uppercase">Academic</div>
                            <div className="text-xs font-bold text-[#6f8dff]">{student.academicScore}%</div>
                          </div>
                          <div className="bg-[#080b20]/60 rounded p-1">
                            <div className="text-[9px] text-[#767ea8] uppercase">Attend</div>
                            <div className="text-xs font-bold text-[#a855f7]">{student.attendance}%</div>
                          </div>
                          <div className="bg-[#080b20]/60 rounded p-1">
                            <div className="text-[9px] text-[#767ea8] uppercase">Engage</div>
                            <div className={`text-xs font-bold ${student.engagement < 70 ? 'text-[#ff6a2b]' : 'text-emerald-400'}`}>
                              {student.engagement}%
                            </div>
                          </div>
                          <div className="bg-[#080b20]/60 rounded p-1">
                            <div className="text-[9px] text-[#767ea8] uppercase">Assign</div>
                            <div className={`text-xs font-bold ${student.assignmentConsistency < 70 ? 'text-amber-400' : 'text-white'}`}>
                              {student.assignmentConsistency}%
                            </div>
                          </div>
                        </div>

                        {/* Divergence alert tag */}
                        {student.academicScore - student.engagement > 12 && (
                          <div className="mt-2 text-[10px] text-[#ff8a50] flex items-center space-x-1">
                            <span>⚠</span>
                            <span>
                              Divergence gap: +{student.academicScore - student.engagement}% (Academic vs Engagement)
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Active Student Deep Intelligence (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Student Profile & Time Window Selector Header */}
            <div className="bg-[#0b0f2d]/90 border border-[#242b5c] rounded-2xl p-5 backdrop-blur-md shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1b2359] to-[#0d1235] border-2 border-[#ff6a2b]/50 flex items-center justify-center font-bold text-lg text-white font-mono shadow-lg shadow-[#ff6a2b]/15">
                    {selectedStudent.avatarInitials}
                  </div>
                  <div>
                    <div className="flex items-center space-x-3">
                      <h2 className="text-xl sm:text-2xl font-bold text-white font-serif">
                        {selectedStudent.name}
                      </h2>
                      {(() => {
                        const badge = getStatusBadge(selectedStudent.status);
                        return (
                          <span
                            className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full border text-xs font-semibold font-mono ${badge.bg} ${badge.border} ${badge.text}`}
                          >
                            <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                            <span>{badge.label}</span>
                          </span>
                        );
                      })()}
                    </div>
                    <div className="mt-1 text-xs text-[#9aa2d4] font-mono flex items-center space-x-3">
                      <span>ID: {selectedStudent.studentId}</span>
                      <span>•</span>
                      <span>{selectedStudent.branch} Engineering</span>
                      <span>•</span>
                      <span>{selectedStudent.year}</span>
                    </div>
                  </div>
                </div>

                {/* TIME WINDOW SELECTOR */}
                <div className="flex flex-col items-end space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-[#8e96c8]">
                    Time Window:
                  </span>
                  <div className="flex items-center bg-[#07091d] border border-[#242b5c] rounded-xl p-1 space-x-1">
                    {[
                      { id: '2weeks', label: 'Last 2 Weeks' },
                      { id: '4weeks', label: 'Last 4 Weeks' },
                      { id: '8weeks', label: 'Last 8 Weeks' },
                      { id: 'semester', label: 'Last Semester' },
                    ].map((w) => (
                      <button
                        key={w.id}
                        onClick={() => setTimeWindow(w.id as TimeWindowOption)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                          timeWindow === w.id
                            ? 'bg-[#ff6a2b] text-white font-semibold shadow-md shadow-[#ff6a2b]/25'
                            : 'text-[#8e96c8] hover:text-white hover:bg-[#151a44]'
                        }`}
                      >
                        {w.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* STUDENT SUCCESS SCORE & EXPLAINABLE RISK INTEGRATION BANNER */}
            {(() => {
              const successScore = getStudentSuccessScore(selectedStudent.id);
              const riskProfile = getStudentRiskProfile(selectedStudent.id);
              const badge = riskProfile.statusBadge;
              return (
                <div className="bg-[#0b0f2d]/90 border border-[#6f8dff]/30 rounded-2xl p-5 backdrop-blur-md shadow-lg space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#121845] to-[#080b20] border border-[#6f8dff]/40 flex flex-col items-center justify-center font-mono shadow-md">
                        <span className="text-lg font-black text-white leading-none">{successScore.currentScore}</span>
                        <span className="text-[9px] text-[#8e96c8]">/ 100</span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-white font-serif">Student Success Score</span>
                          <span
                            className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold font-mono ${badge.bg} ${badge.border} ${badge.text}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                            <span>{badge.label}</span>
                          </span>
                        </div>
                        <div className="text-[11px] text-[#a4a9d0] mt-0.5">
                          Condition: <strong className="text-[#ffb27a] font-normal">{successScore.indicatorLabel}</strong>
                        </div>
                      </div>
                    </div>

                    {onNavigate && (
                      <button
                        onClick={() => onNavigate('growth-track')}
                        className="text-xs font-mono text-[#c2d1ff] hover:text-white px-3 py-1.5 rounded-lg bg-[#111638] border border-[#2b3368] hover:border-[#6f8dff] transition-all flex items-center space-x-1"
                      >
                        <span>Inspect 7 Dimensions in Growth Track →</span>
                      </button>
                    )}
                  </div>

                  {/* Explainable Why Summary Connection */}
                  <div className="p-3 rounded-xl bg-[#06081c] border border-[#1f2552] text-xs text-[#c2d1ff] flex items-start space-x-2 font-mono">
                    <span className="text-[#ff6a2b] font-bold shrink-0">WHY {riskProfile.status}:</span>
                    <span>"{riskProfile.whyExplanation.summary}"</span>
                  </div>

                  {/* AI Decision Intelligence Connection */}
                  {(() => {
                    const decision = getStudentDecisionIntelligence(selectedStudent.id);
                    return (
                      <div className="p-3.5 rounded-xl bg-[#0e163b] border border-[#202d6b] text-xs text-[#c7d2fe] space-y-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-[#ffb27a]">
                          <Sparkles className="w-3.5 h-3.5 text-[#ff6a2b]" />
                          <span>AI DECISION INTELLIGENCE PLATFORM:</span>
                        </div>
                        <p className="text-[#e2e8f0] leading-relaxed">
                          &ldquo;Overall performance remains relatively strong, but several behavioral indicators are weakening. This pattern may represent an early support opportunity before academic performance is affected.&rdquo;
                        </p>
                        <div className="text-[11px] text-[#5eead4] pt-1.5 border-t border-white/10 flex items-center justify-between">
                          <span>
                            <strong>Recommended next step: </strong>
                            Consider a low-friction check-in and monitor engagement, communication, and placement activity.
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
            })()}

            {/* MAIN VISUALIZATION: VISIBLE ACADEMIC vs HIDDEN BEHAVIORAL SIGNALS */}
            <div className="bg-[#0b0f2d]/90 border border-[#242b5c] rounded-2xl p-6 backdrop-blur-md shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#1c224a]">
                <div>
                  <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#ff8a50]">
                    Core Telemetry Contrast
                  </div>
                  <h3 className="text-lg font-bold text-white font-serif">
                    Visible Academic Performance vs. Hidden Behavioral Signals
                  </h3>
                </div>
                <div className="text-xs text-[#8e96c8] italic font-serif">
                  &ldquo;The student looks fine from one perspective, but the wider journey tells a different story.&rdquo;
                </div>
              </div>

              {/* High-Impact Contrast Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                {/* 1. VISIBLE ACADEMIC PERFORMANCE */}
                <div className="bg-gradient-to-br from-[#121845] to-[#0a0d2a] border border-[#6f8dff]/40 rounded-xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#6f8dff]/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#9bb0ff] font-semibold">
                      Visible Academic Metric
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#6f8dff]/20 text-[#c2d1ff] font-mono text-[11px] font-bold">
                      Gradebook Status
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline space-x-3">
                    <span className="text-5xl font-extrabold text-white font-mono">
                      {selectedStudent.academicScore}%
                    </span>
                    <span className="text-emerald-400 font-mono text-sm font-semibold flex items-center space-x-1">
                      <span>Stable ↑</span>
                    </span>
                  </div>

                  <div className="mt-3 text-xs text-[#b8c2f0] leading-relaxed">
                    Standard institutional exams, assignments, and quizzes currently reflect high scores. In conventional evaluation systems, this student would appear completely unflagged.
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#232959] flex items-center justify-between text-xs font-mono text-[#8e96c8]">
                    <span>Institutional Flag:</span>
                    <span className="text-emerald-400 font-semibold">Unflagged (Normal)</span>
                  </div>
                </div>

                {/* 2. HIDDEN / BEHAVIORAL SIGNALS */}
                <div className="bg-gradient-to-br from-[#1c122f] to-[#0c0922] border border-[#ff6a2b]/40 rounded-xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff6a2b]/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#ff8a50] font-semibold">
                      Hidden / Behavioral Signals
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#ff6a2b]/20 text-[#ffb27a] font-mono text-[11px] font-bold">
                      Telemetry Signals
                    </span>
                  </div>

                  {/* Micro Breakdown of Hidden Signals */}
                  <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-xs">
                    <div className="bg-[#090b20]/80 border border-[#2b1f3c] rounded-lg p-2.5">
                      <div className="text-[10px] text-[#9a9bb5] uppercase">Engagement</div>
                      <div className="mt-0.5 text-base font-bold text-white flex items-center justify-between">
                        <span>{selectedStudent.engagement}%</span>
                        <span className="text-[#ff6a2b] text-xs">↓ 18%</span>
                      </div>
                    </div>

                    <div className="bg-[#090b20]/80 border border-[#2b1f3c] rounded-lg p-2.5">
                      <div className="text-[10px] text-[#9a9bb5] uppercase">Participation</div>
                      <div className="mt-0.5 text-base font-bold text-white flex items-center justify-between">
                        <span>{selectedStudent.participation}%</span>
                        <span className="text-rose-400 text-xs">↓ 21%</span>
                      </div>
                    </div>

                    <div className="bg-[#090b20]/80 border border-[#2b1f3c] rounded-lg p-2.5">
                      <div className="text-[10px] text-[#9a9bb5] uppercase">Consistency</div>
                      <div className="mt-0.5 text-base font-bold text-white flex items-center justify-between">
                        <span>{selectedStudent.assignmentConsistency}%</span>
                        <span className="text-amber-400 text-xs">↓ 14%</span>
                      </div>
                    </div>

                    <div className="bg-[#090b20]/80 border border-[#2b1f3c] rounded-lg p-2.5">
                      <div className="text-[10px] text-[#9a9bb5] uppercase">Communication</div>
                      <div className="mt-0.5 text-base font-bold text-white flex items-center justify-between">
                        <span>{selectedStudent.communication}%</span>
                        <span className="text-orange-400 text-xs">↓ 9%</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-[#d2a392] leading-relaxed">
                    Evolyn surfaces hidden signal decay across interactive lab sessions, forum check-ins, and voluntary office hours.
                  </div>
                </div>
              </div>

              {/* Spider / Radial Multidimensional Compass */}
              <div className="mt-6 pt-5 border-t border-[#1c224a]">
                <div className="text-center mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#9aa2d4]">
                    Multidimensional Journey Topology
                  </span>
                  <h4 className="text-sm font-semibold text-white font-serif">
                    Polar Divergence Compass ({timeWindow.replace('weeks', ' Weeks')})
                  </h4>
                </div>
                <SignalComparisonCompass student={selectedStudent} />
              </div>
            </div>

            {/* SIGNAL DETECTION SECTION */}
            <div className="bg-[#0b0f2d]/90 border border-[#242b5c] rounded-2xl p-6 backdrop-blur-md shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-[#1c224a]">
                <div>
                  <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#ff8a50]">
                    Signal Telemetry
                  </div>
                  <h3 className="text-lg font-bold text-white font-serif">Signals Detected</h3>
                </div>
                <div className="text-xs font-mono text-[#8e96c8]">
                  Window: <span className="text-white font-bold">{timeWindow}</span>
                </div>
              </div>

              {/* Signal Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-5">
                {activeSignals.map((signal) => {
                  const isDeclining = signal.trend === 'declining';
                  const isStable = signal.trend === 'stable';

                  return (
                    <div
                      key={signal.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isDeclining
                          ? 'bg-[#18112e]/70 border-[#ff6a2b]/35 shadow-sm shadow-[#ff6a2b]/10'
                          : isStable
                          ? 'bg-[#0f1437]/70 border-[#2b3368]'
                          : 'bg-[#0d1d2b]/70 border-emerald-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          {isDeclining ? (
                            <span className="text-amber-400 text-sm">⚠</span>
                          ) : (
                            <span className="text-emerald-400 text-sm">✓</span>
                          )}
                          <span className="text-xs font-semibold text-white font-serif">
                            {signal.name}
                          </span>
                        </div>

                        <span
                          className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                            isDeclining
                              ? 'bg-[#ff6a2b]/20 text-[#ff8a50]'
                              : isStable
                              ? 'bg-[#293264]/50 text-[#8e96c8]'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {signal.trend}
                        </span>
                      </div>

                      {/* Values & Percentage Change */}
                      <div className="mt-3 grid grid-cols-3 gap-2 text-center font-mono text-xs pt-2 border-t border-[#232959]">
                        <div>
                          <div className="text-[9px] text-[#7880b0]">Current</div>
                          <div className="font-bold text-white">{signal.currentValue}{signal.unit}</div>
                        </div>
                        <div>
                          <div className="text-[9px] text-[#7880b0]">Previous</div>
                          <div className="text-[#a4addd]">{signal.previousValue}{signal.unit}</div>
                        </div>
                        <div>
                          <div className="text-[9px] text-[#7880b0]">Change</div>
                          <div
                            className={`font-bold ${
                              signal.change < 0
                                ? 'text-[#ff6a2b]'
                                : signal.change > 0
                                ? 'text-emerald-400'
                                : 'text-[#8e96c8]'
                            }`}
                          >
                            {signal.change > 0 ? `+${signal.change}%` : `${signal.change}%`}
                          </div>
                        </div>
                      </div>

                      {signal.note && (
                        <div className="mt-2.5 text-[11px] text-[#8e96c8] leading-tight">
                          {signal.note}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* TREND VISUALIZATION TIMELINE CHART */}
            <div className="bg-[#0b0f2d]/90 border border-[#242b5c] rounded-2xl p-6 backdrop-blur-md shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#1c224a]">
                <div>
                  <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#ff8a50]">
                    Temporal Telemetry
                  </div>
                  <h3 className="text-lg font-bold text-white font-serif">
                    Signal Progression Over Time
                  </h3>
                </div>
                <div className="text-xs font-mono text-[#8e96c8]">
                  Hover points to inspect exact weekly readings
                </div>
              </div>

              <div className="mt-4">
                <TrendTimelineChart student={selectedStudent} timeWindow={timeWindow} />
              </div>
            </div>

            {/* AI DETECTION SUMMARY & SUPPORTIVE INTERVENTION */}
            <div className="bg-gradient-to-br from-[#12163b] to-[#0a0d24] border border-[#ff6a2b]/30 rounded-2xl p-6 backdrop-blur-md shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-[#242b5c]">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff6a2b] shadow-sm shadow-[#ff6a2b]" />
                  <h3 className="text-base font-bold text-white font-serif">
                    AI Detection Summary
                  </h3>
                  <span className="text-[10px] font-mono uppercase bg-[#ff6a2b]/15 text-[#ff8a50] px-2 py-0.5 rounded border border-[#ff6a2b]/30">
                    Non-Deterministic Synthesis
                  </span>
                </div>
                <div className="text-xs text-[#8e96c8] font-mono">
                  Confidence Metric: High
                </div>
              </div>

              <div className="mt-4 text-sm text-[#d4daf5] leading-relaxed space-y-3">
                <p className="font-serif italic text-base text-white">
                  &ldquo;{currentAiSummary}&rdquo;
                </p>

                {selectedStudent.flagReasons && selectedStudent.flagReasons.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[#1f2655]">
                    <div className="text-xs font-semibold text-[#ff8a50] font-mono uppercase tracking-wider mb-2">
                      Key Corroborating Signals:
                    </div>
                    <ul className="space-y-1.5 text-xs text-[#a0a9d8]">
                      {selectedStudent.flagReasons.map((reason, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="text-[#ff6a2b] mt-0.5">•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Recommended Next Step & Action Button */}
              {selectedStudent.suggestedNextStep && (
                <div className="mt-6 pt-4 border-t border-[#232a5e] flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-mono uppercase tracking-wider text-[#a4addd]">
                      Suggested Next Step ({selectedStudent.suggestedNextStep.urgency})
                    </div>
                    <div className="text-sm font-semibold text-white font-serif mt-0.5">
                      {selectedStudent.suggestedNextStep.title}
                    </div>
                    <div className="text-xs text-[#8e96c8] mt-0.5 max-w-xl">
                      {selectedStudent.suggestedNextStep.description}
                    </div>
                  </div>

                  <button
                    onClick={() => setIsInterventionModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff6a2b] to-[#ff8a50] hover:brightness-110 text-white text-xs font-semibold shadow-lg shadow-[#ff6a2b]/25 transition-all flex items-center space-x-2"
                  >
                    <span>Initiate Low-Friction Check-in</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SUPPORTIVE INTERVENTION MODAL */}
      {isInterventionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="bg-[#0b0f2e] border border-[#ff6a2b]/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setIsInterventionModalOpen(false);
                setInterventionScheduled(false);
              }}
              className="absolute top-4 right-4 text-[#8e96c8] hover:text-white text-base"
            >
              ✕
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#ff6a2b]/20 border border-[#ff6a2b]/40 flex items-center justify-center text-lg">
                💬
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-serif">
                  Supportive Check-in: {selectedStudent.name}
                </h3>
                <div className="text-xs text-[#8e96c8] font-mono">
                  Action Type: {selectedStudent.suggestedNextStep?.actionType || 'Mentor Check-in'}
                </div>
              </div>
            </div>

            {interventionScheduled ? (
              <div className="mt-6 py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-xl font-bold">
                  ✓
                </div>
                <h4 className="text-base font-semibold text-white font-serif">
                  Supportive Touchpoint Queued
                </h4>
                <p className="text-xs text-[#9aa2d4] max-w-sm mx-auto">
                  A casual, low-friction check-in has been added to your educator schedule. The student will receive a caring note without deficit framing.
                </p>
                <button
                  onClick={() => {
                    setIsInterventionModalOpen(false);
                    setInterventionScheduled(false);
                  }}
                  className="mt-3 px-5 py-2 bg-[#1b214f] text-white rounded-lg text-xs font-semibold hover:bg-[#252d6a] transition-all"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <div className="bg-[#07091d] border border-[#222852] rounded-xl p-3 text-xs text-[#a0a8dd]">
                  <div className="font-semibold text-white mb-1">Recommended Talking Points:</div>
                  <ul className="list-disc list-inside space-y-1 text-[#8e96c8]">
                    <li>Praise recent academic performance ({selectedStudent.academicScore}%)</li>
                    <li>Ask casually about workload in {selectedStudent.branch} semester coursework</li>
                    <li>Inquire if timing of office hours or group work fits their current schedule</li>
                  </ul>
                </div>

                <div>
                  <label className="block text-xs font-medium text-white mb-1.5 font-mono">
                    Educator Note / Check-in Context:
                  </label>
                  <textarea
                    value={interventionNote}
                    onChange={(e) => setInterventionNote(e.target.value)}
                    placeholder="e.g. Catch up after Friday lab for 5 minutes over coffee..."
                    rows={3}
                    className="w-full bg-[#07091d] border border-[#222852] rounded-lg p-2.5 text-xs text-white placeholder-[#5a6296] focus:outline-none focus:border-[#ff6a2b]/60"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    onClick={() => setIsInterventionModalOpen(false)}
                    className="px-4 py-2 text-xs text-[#8e96c8] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setInterventionScheduled(true)}
                    className="px-5 py-2 bg-gradient-to-r from-[#ff6a2b] to-[#ff8a50] text-white rounded-lg text-xs font-semibold hover:brightness-110 shadow-md shadow-[#ff6a2b]/25 transition-all"
                  >
                    Confirm & Schedule Check-in
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
