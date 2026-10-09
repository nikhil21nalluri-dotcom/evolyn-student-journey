import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { STUDENT_GROWTH_DATA } from '../../data/studentGrowthData';
import { getAllUnifiedStudents } from '../../data/unifiedStudentData';
import { getStudentSuccessScore } from '../../data/studentSuccessScore';
import { getStudentRiskProfile, getInstitutionalRiskStats } from '../../data/studentRiskEngine';
import {
  getSegmentCohortStats,
  ALL_STUDENT_SEGMENTS,
  StudentSegmentType,
  SEGMENT_DEFINITIONS,
} from '../../data/studentSegmentationEngine';
import { InstitutionalDecisionView } from '../decision-intelligence/InstitutionalDecisionView';
import { useIntervention } from '../../context/InterventionContext';
import { AdministratorPlacementIntelligence } from './AdministratorPlacementIntelligence';
import { KnowledgeLibraryModal } from '../knowledge/KnowledgeLibraryModal';
import { KnowledgeTestModal } from '../knowledge/KnowledgeTestModal';
import {
  Building2,
  Users,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Briefcase,
  Layers,
  Sparkles,
  BarChart3,
  PieChart,
  CheckCircle2,
  Clock,
  Database,
  ArrowUpRight,
  Filter,
  Search,
  BookOpen,
  UserCheck,
  Target,
  UploadCloud,
  FileCheck2,
} from 'lucide-react';

interface AdministratorWorkspaceProps {
  onBackToLanding: () => void;
  onOpenAuth: () => void;
  onNavigate: (view: any) => void;
}

type AdminTab =
  | 'cohort-telemetry'
  | 'interventions'
  | 'decision-intelligence'
  | 'advisor-caseload'
  | 'early-signals'
  | 'student-segments'
  | 'placement-pipeline'
  | 'integrations';

export const AdministratorWorkspace: React.FC<AdministratorWorkspaceProps> = ({
  onBackToLanding,
  onOpenAuth,
  onNavigate,
}) => {
  const { userProfile } = useAuth();
  const { setSelectedStudentId, setActiveWorkspace, openRoleModal } = useWorkspace();
  const { interventions, getInterventionStats } = useIntervention();
  const [activeTab, setActiveTab] = useState<AdminTab>('cohort-telemetry');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedRiskCategory, setSelectedRiskCategory] = useState<string>('all');
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [, setRefreshTick] = useState(0);

  // Sync state when fresh CSV datasets are imported
  useEffect(() => {
    const handleDataRefreshed = () => {
      setRefreshTick((t) => t + 1);
    };
    window.addEventListener('evolyn-data-refreshed', handleDataRefreshed);
    return () => window.removeEventListener('evolyn-data-refreshed', handleDataRefreshed);
  }, []);

  const riskStats = getInstitutionalRiskStats();
  const interventionStats = getInterventionStats();
  const unifiedStudents = getAllUnifiedStudents();

  // Compute aggregate stats across the unified student records
  const totalStudents = unifiedStudents.length;
  const avgSuccessScore = Math.round(
    unifiedStudents.reduce((acc, s) => {
      const scoreData = getStudentSuccessScore(s.id);
      return acc + scoreData.currentScore;
    }, 0) / (totalStudents || 1)
  );

  const avgCgpa = (
    unifiedStudents.reduce((acc, s) => acc + s.academic.cgpa, 0) / (totalStudents || 1)
  ).toFixed(2);

  const avgAttendance = Math.round(
    unifiedStudents.reduce((acc, s) => acc + s.attendance.overallPercentage, 0) / (totalStudents || 1)
  );

  // Departmental aggregations
  const departments = [
    {
      id: 'cse',
      name: 'Computer Science & Engineering',
      code: 'CSE',
      studentsCount: 180,
      avgSuccessScore: 81.2,
      avgAttendance: 90.4,
      retentionRate: '96.2%',
      earlySignalRate: '7.8%',
      head: 'Dr. V. Ramanathan',
    },
    {
      id: 'ai-ds',
      name: 'Artificial Intelligence & Data Science',
      code: 'AI/DS',
      studentsCount: 120,
      avgSuccessScore: 79.5,
      avgAttendance: 88.6,
      retentionRate: '95.1%',
      earlySignalRate: '8.3%',
      head: 'Dr. Sunita Rao',
    },
    {
      id: 'ece',
      name: 'Electronics & Communication',
      code: 'ECE',
      studentsCount: 140,
      avgSuccessScore: 76.8,
      avgAttendance: 87.1,
      retentionRate: '94.0%',
      earlySignalRate: '11.4%',
      head: 'Prof. K. Sundaram',
    },
    {
      id: 'mech',
      name: 'Mechanical & Mechatronics Systems',
      code: 'MECH',
      studentsCount: 90,
      avgSuccessScore: 75.3,
      avgAttendance: 86.2,
      retentionRate: '93.5%',
      earlySignalRate: '12.1%',
      head: 'Dr. A. Verma',
    },
  ];

  // Faculty Advisors Caseloads
  const facultyAdvisors = [
    {
      name: 'Dr. Sunita Rao',
      department: 'CSE / AI',
      advisees: 24,
      avgAdviseeScore: 82,
      activeInterventions: 3,
      avgResponseHours: 18,
      status: 'Optimal Load',
    },
    {
      name: 'Prof. V. Ramanathan',
      department: 'Computer Science',
      advisees: 26,
      avgAdviseeScore: 79,
      activeInterventions: 5,
      avgResponseHours: 24,
      status: 'Optimal Load',
    },
    {
      name: 'Sarah Jenkins',
      department: 'Foundational Engineering',
      advisees: 22,
      avgAdviseeScore: 77,
      activeInterventions: 4,
      avgResponseHours: 14,
      status: 'Optimal Load',
    },
    {
      name: 'Prof. K. Sundaram',
      department: 'ECE',
      advisees: 28,
      avgAdviseeScore: 76,
      activeInterventions: 6,
      avgResponseHours: 32,
      status: 'High Load',
    },
  ];

  // System Data Sources
  const dataSources = [
    { name: 'Student Information System (SIS)', type: 'Academic Records & CGPA', status: 'Healthy', latency: '24ms', records: '1,420 synced' },
    { name: 'Canvas & Moodle LMS Telemetry', type: 'Assignment Cadence & Logins', status: 'Healthy', latency: '48ms', records: 'Real-time event stream' },
    { name: 'Campus Biometric Terminals', type: 'Lecture & Lab Attendance', status: 'Healthy', latency: '12ms', records: 'Daily batch + real-time taps' },
    { name: 'Fluencis Speech & Soft Skills', type: 'Speech Analysis Engine', status: 'Healthy', latency: '110ms', records: 'Pipeline Ready' },
    { name: 'Placement Cell Assessment Hub', type: 'Coding & Mock Aptitude', status: 'Healthy', latency: '65ms', records: 'Weekly cohort evaluations' },
    { name: 'Campus Activities & Club Registry', type: 'Hackathons & Certifications', status: 'Healthy', latency: '82ms', records: 'Synced' },
    { name: 'Faculty & Student Feedback Engine', type: 'Qualitative Advisor Logs', status: 'Healthy', latency: '15ms', records: 'Encrypted Firestore' },
  ];

  return (
    <div className="relative min-h-screen w-full pt-20 pb-24 px-4 sm:px-8 max-w-7xl mx-auto text-[#f0f1ff]">
      {/* Top Header & Persona Badge */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-[rgba(140,150,255,0.15)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8b5cf6] to-[#d946ef] flex items-center justify-center text-white shadow-md shadow-[#a855f7]/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-baskerville text-xl sm:text-2xl font-bold text-white">
                Administrator Workspace
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-[#a855f7]/20 border border-[#a855f7]/30 font-mono text-[10px] font-bold text-[#d8b4fe]">
                ROLE: DEAN & ACADEMIC GOVERNANCE
              </span>
            </div>
            <p className="text-xs text-[#a4a9d0]">
              Institution-wide telemetry: cross-departmental benchmarks, advisor caseloads, early warning governance, and retention health.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsKnowledgeModalOpen(true)}
            className="px-3 py-1.5 rounded-full bg-[#2dd4bf]/15 hover:bg-[#2dd4bf] border border-[#2dd4bf]/30 text-xs text-[#5eead4] hover:text-slate-950 font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm group"
            title="Open Educational Knowledge Repository (RAG)"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#2dd4bf] group-hover:text-slate-950" />
            <span>Knowledge RAG</span>
          </button>
          <button
            onClick={() => setIsTestModalOpen(true)}
            className="px-3 py-1.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500 border border-emerald-500/30 text-xs text-emerald-300 hover:text-slate-950 font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm group"
            title="Run Automated Knowledge Verification Tests"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-emerald-400 group-hover:text-slate-950" />
            <span>Run Tests</span>
          </button>
          <button
            onClick={() => onNavigate('data-integration')}
            className="px-3 py-1.5 rounded-full bg-[#38bdf8]/15 hover:bg-[#38bdf8] border border-[#38bdf8]/30 text-xs text-[#7dd3fc] hover:text-slate-950 font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm group"
            title="Import student CSV datasets with validation"
          >
            <UploadCloud className="w-3.5 h-3.5 text-[#38bdf8] group-hover:text-slate-950" />
            <span>Data Integration</span>
          </button>
          <button
            onClick={openRoleModal}
            className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#c2d1ff] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-[#a855f7]" />
            <span>Switch Role</span>
          </button>
          <button
            onClick={onBackToLanding}
            className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#a4a9d0] hover:text-white transition-colors cursor-pointer"
          >
            Platform Overview
          </button>
        </div>
      </div>

      {/* Institutional Top KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        <div className="p-4 rounded-2xl bg-[#0b0f2a] border border-[#222955] shadow-lg">
          <div className="text-[11px] font-medium text-[#a4a9d0] uppercase tracking-wider mb-1 font-mono">
            Institutional Success
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#d8b4fe] font-mono">
            {avgSuccessScore} <span className="text-xs text-[#a4a9d0]">/ 100</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
            <TrendingUp className="w-3 h-3" /> +2.4 pts vs previous term
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b0f2a] border border-[#222955] shadow-lg">
          <div className="text-[11px] font-medium text-[#a4a9d0] uppercase tracking-wider mb-1 font-mono">
            Monitored Students
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white font-mono">
            {riskStats.totalMonitored.toLocaleString()} Students
          </div>
          <div className="text-[11px] text-[#a4a9d0] mt-1 font-mono">
            {totalStudents} core student profiles tracked
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b0f2a] border border-[#222955] shadow-lg">
          <div className="text-[11px] font-medium text-[#a4a9d0] uppercase tracking-wider mb-1 font-mono">
            Retention Stability
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono">
            95.4%
          </div>
          <div className="text-[11px] text-emerald-300 mt-1 flex items-center gap-1 font-mono">
            <CheckCircle2 className="w-3 h-3" /> Exceeds 92% benchmark
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b0f2a] border border-[#222955] shadow-lg">
          <div className="text-[11px] font-medium text-[#a4a9d0] uppercase tracking-wider mb-1 font-mono">
            Avg Intervention Velocity
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-cyan-400 font-mono">
            1.6 Days
          </div>
          <div className="text-[11px] text-[#a4a9d0] mt-1 font-mono">
            Signal to advisor action
          </div>
        </div>
      </div>

      {/* Compact Interactive Risk Overview */}
      <div className="p-4 rounded-2xl bg-[#0b0f2a] border border-[#222955] shadow-lg mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Institution-Level Risk Intelligence Overview
            </span>
          </div>
          <span className="text-[11px] text-[#8e96c8] font-mono">
            Monitored Cohort: {riskStats.totalMonitored.toLocaleString()} Enrolled Students
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
          <button
            onClick={() => {
              setSelectedRiskCategory(selectedRiskCategory === 'NORMAL' ? 'all' : 'NORMAL');
              setActiveTab('early-signals');
            }}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              selectedRiskCategory === 'NORMAL'
                ? 'bg-emerald-500/20 border-emerald-500 shadow-lg ring-1 ring-emerald-500'
                : 'bg-[#06081c] border-emerald-500/30 hover:border-emerald-500/60'
            }`}
          >
            <div className="text-[10px] text-emerald-400 uppercase font-semibold">Normal Status</div>
            <div className="text-2xl font-black text-white mt-0.5">{riskStats.normal}</div>
            <div className="text-[10px] text-[#8e96c8] mt-0.5">Healthy learning rhythms</div>
          </button>

          <button
            onClick={() => {
              setSelectedRiskCategory(selectedRiskCategory === 'WATCH' ? 'all' : 'WATCH');
              setActiveTab('early-signals');
            }}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              selectedRiskCategory === 'WATCH'
                ? 'bg-orange-500/20 border-orange-500 shadow-lg ring-1 ring-orange-500'
                : 'bg-[#06081c] border-orange-500/30 hover:border-orange-500/60'
            }`}
          >
            <div className="text-[10px] text-orange-400 uppercase font-semibold">Watch List</div>
            <div className="text-2xl font-black text-white mt-0.5">{riskStats.watch}</div>
            <div className="text-[10px] text-[#8e96c8] mt-0.5">1 localized deceleration</div>
          </button>

          <button
            onClick={() => {
              setSelectedRiskCategory(selectedRiskCategory === 'EARLY SIGNAL' ? 'all' : 'EARLY SIGNAL');
              setActiveTab('early-signals');
            }}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              selectedRiskCategory === 'EARLY SIGNAL'
                ? 'bg-amber-500/20 border-amber-500 shadow-lg ring-1 ring-amber-500'
                : 'bg-[#06081c] border-amber-500/30 hover:border-amber-500/60'
            }`}
          >
            <div className="text-[10px] text-amber-400 uppercase font-semibold">Early Signal</div>
            <div className="text-2xl font-black text-white mt-0.5">{riskStats.earlySignal}</div>
            <div className="text-[10px] text-[#8e96c8] mt-0.5">Divergence detected</div>
          </button>

          <button
            onClick={() => {
              setSelectedRiskCategory(selectedRiskCategory === 'MULTIPLE SIGNALS' ? 'all' : 'MULTIPLE SIGNALS');
              setActiveTab('early-signals');
            }}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              selectedRiskCategory === 'MULTIPLE SIGNALS'
                ? 'bg-rose-500/20 border-rose-500 shadow-lg ring-1 ring-rose-500'
                : 'bg-[#06081c] border-rose-500/30 hover:border-rose-500/60'
            }`}
          >
            <div className="text-[10px] text-rose-400 uppercase font-semibold">Multiple Signals</div>
            <div className="text-2xl font-black text-white mt-0.5">{riskStats.multipleSignals}</div>
            <div className="text-[10px] text-[#8e96c8] mt-0.5">Priority care & review</div>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#090b20]/80 backdrop-blur-md border border-[rgba(140,150,255,0.2)] mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('cohort-telemetry')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'cohort-telemetry'
              ? 'bg-gradient-to-r from-[#7c3aed] to-[#c026d3] text-white shadow-md shadow-[#7c3aed]/25'
              : 'text-[#a4a9d0] hover:text-white hover:bg-white/5'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Cross-Department Benchmarks</span>
        </button>

        <button
          onClick={() => setActiveTab('interventions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'interventions'
              ? 'bg-gradient-to-r from-[#ff6a2b] via-[#ec4899] to-[#7c3aed] text-white shadow-md shadow-[#ff6a2b]/25 font-bold'
              : 'text-[#a4a9d0] hover:text-white hover:bg-white/5'
          }`}
        >
          <Target className="w-4 h-4 text-[#ffb27a]" />
          <span>Intervention Intelligence</span>
          <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px] ml-1 font-mono text-[#ffb27a]">
            {interventionStats.active} Active
          </span>
        </button>

        <button
          onClick={() => setActiveTab('decision-intelligence')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'decision-intelligence'
              ? 'bg-gradient-to-r from-[#a855f7] via-[#ec4899] to-[#3b82f6] text-white shadow-md shadow-[#a855f7]/25'
              : 'text-[#a4a9d0] hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#d8b4fe]" />
          <span>Institutional Decision Intelligence</span>
        </button>

        <button
          onClick={() => setActiveTab('advisor-caseload')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'advisor-caseload'
              ? 'bg-gradient-to-r from-[#7c3aed] to-[#c026d3] text-white shadow-md shadow-[#7c3aed]/25'
              : 'text-[#a4a9d0] hover:text-white hover:bg-white/5'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Faculty Advisor Caseloads</span>
        </button>

        <button
          onClick={() => setActiveTab('early-signals')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'early-signals'
              ? 'bg-gradient-to-r from-[#7c3aed] to-[#c026d3] text-white shadow-md shadow-[#7c3aed]/25'
              : 'text-[#a4a9d0] hover:text-white hover:bg-white/5'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Early Warning Governance</span>
        </button>

        <button
          onClick={() => setActiveTab('student-segments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'student-segments'
              ? 'bg-gradient-to-r from-[#7c3aed] to-[#c026d3] text-white shadow-md shadow-[#7c3aed]/25'
              : 'text-[#a4a9d0] hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Student Segments (7 Cohorts)</span>
        </button>

        <button
          onClick={() => setActiveTab('placement-pipeline')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'placement-pipeline'
              ? 'bg-gradient-to-r from-[#7c3aed] to-[#c026d3] text-white shadow-md shadow-[#7c3aed]/25'
              : 'text-[#a4a9d0] hover:text-white hover:bg-white/5'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Placement Pipeline</span>
        </button>

        <button
          onClick={() => setActiveTab('integrations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'integrations'
              ? 'bg-gradient-to-r from-[#7c3aed] to-[#c026d3] text-white shadow-md shadow-[#7c3aed]/25'
              : 'text-[#a4a9d0] hover:text-white hover:bg-white/5'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>7-Source Data Health</span>
        </button>
      </div>

      {/* =========================================================
          TAB 1: CROSS-DEPARTMENT BENCHMARKS
      ========================================================= */}
      {activeTab === 'cohort-telemetry' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="p-6 rounded-2xl bg-[#0c1033] border border-[#222955] hover:border-[#a855f7]/60 transition-all space-y-4 shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded-full bg-[#a855f7]/20 border border-[#a855f7]/30 font-mono text-[10px] font-bold text-[#d8b4fe]">
                      DEPARTMENT: {dept.code}
                    </span>
                    <h3 className="font-baskerville text-lg font-bold text-white mt-1">
                      {dept.name}
                    </h3>
                    <p className="text-xs text-[#a4a9d0]">Chair: {dept.head}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xl font-bold text-[#d8b4fe]">
                      {dept.avgSuccessScore}
                    </div>
                    <div className="text-[10px] text-[#a4a9d0] uppercase">Avg Success</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-[#06081c] border border-white/5 text-center">
                  <div>
                    <div className="text-[10px] text-[#a4a9d0]">Enrolled</div>
                    <div className="font-mono text-sm font-bold text-white mt-0.5">
                      {dept.studentsCount}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#a4a9d0]">Attendance</div>
                    <div className="font-mono text-sm font-bold text-emerald-400 mt-0.5">
                      {dept.avgAttendance}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#a4a9d0]">Retention</div>
                    <div className="font-mono text-sm font-bold text-cyan-400 mt-0.5">
                      {dept.retentionRate}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[#a4a9d0]">Early Signal Prevalence:</span>
                  <span className="font-mono text-amber-300 font-semibold">
                    {dept.earlySignalRate} of cohort
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Institutional Student Roster Quick View */}
          <div className="p-6 rounded-2xl bg-[#0c1033] border border-[#222955] shadow-xl">
            <h3 className="font-baskerville text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#a855f7]" />
              <span>Unified Student Cohort Sample</span>
            </h3>
            <p className="text-xs text-[#a4a9d0] mb-4">
              Real-time synchronization across institutional data sources for active cohorts:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[#a4a9d0] font-semibold">
                    <th className="pb-3">Student Name</th>
                    <th className="pb-3">ID & Branch</th>
                    <th className="pb-3 text-center">CGPA</th>
                    <th className="pb-3 text-center">Attendance</th>
                    <th className="pb-3 text-center">Success Score</th>
                    <th className="pb-3 text-center">Early Signal</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {STUDENT_GROWTH_DATA.map((st) => {
                    const score = getStudentSuccessScore(st.id);
                    return (
                      <tr key={st.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 font-medium text-white flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#a855f7]/20 text-[#d8b4fe] flex items-center justify-center text-[10px] font-bold">
                            {st.avatarInitials}
                          </span>
                          <span>{st.name}</span>
                        </td>
                        <td className="py-3 text-[#a4a9d0] font-mono text-[11px]">
                          {st.studentId} • {st.branch}
                        </td>
                        <td className="py-3 text-center font-mono font-bold text-white">
                          {(
                            (score.dimensions.find((d) => d.id === 'academic')?.currentScore || 80) /
                            10
                          ).toFixed(1)}
                        </td>
                        <td className="py-3 text-center font-mono text-emerald-400">
                          {score.dimensions.find((d) => d.id === 'attendance')?.currentScore || 90}%
                        </td>
                        <td className="py-3 text-center font-mono font-bold text-[#d8b4fe]">
                          {score.currentScore} / 100
                        </td>
                        <td className="py-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              st.growthStatus.includes('Attention')
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-emerald-500/20 text-emerald-300'
                            }`}
                          >
                            {st.growthStatus.includes('Attention') ? 'Watch' : 'Normal'}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedStudentId(st.id);
                              setActiveWorkspace('faculty');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#a855f7] hover:text-white text-[#d8b4fe] transition-colors cursor-pointer text-[11px]"
                          >
                            Inspect Advisor View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          SECTION 10: ADMINISTRATOR INTERVENTION INTELLIGENCE
      ========================================================= */}
      {activeTab === 'interventions' && (
        <div className="space-y-6">
          {/* Executive Overview Header */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#110d2e] via-[#0d143a] to-[#080d26] border border-[#ff6a2b]/30 shadow-2xl relative overflow-hidden text-[#f0f1ff]">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff6a2b]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 relative z-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono font-bold text-[#ffb27a] mb-2">
                  <Target className="w-3.5 h-3.5 text-[#ff6a2b]" />
                  <span>INSTITUTIONAL INTERVENTION GOVERNANCE</span>
                </div>
                <h2 className="font-baskerville text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Cohort Intervention Intelligence
                </h2>
                <p className="text-xs text-[#a4a9d0] mt-1 max-w-2xl">
                  High-level oversight of proactive pedagogical interventions, early signal support actions, and student engagement initiatives across departments.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 font-mono text-xs text-[#c2d1ff]">
                  Total Actions: <strong className="text-white">{interventionStats.total}</strong>
                </span>
              </div>
            </div>

            {/* High Level 3 Status Cards (ACTIVE, COMPLETED, PLANNED) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10 mb-2">
              <div className="p-4 rounded-2xl bg-[#0b1033] border border-blue-500/30">
                <span className="text-[11px] font-mono uppercase text-[#93c5fd] block font-bold">
                  ACTIVE INTERVENTIONS
                </span>
                <div className="text-3xl font-black font-mono text-white mt-1">
                  {interventionStats.active}
                </div>
                <span className="text-[11px] text-[#8692c8] mt-1 block">
                  Ongoing sessions & practice
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0b1033] border border-emerald-500/30">
                <span className="text-[11px] font-mono uppercase text-[#6ee7b7] block font-bold">
                  COMPLETED INTERVENTIONS
                </span>
                <div className="text-3xl font-black font-mono text-emerald-400 mt-1">
                  {interventionStats.completed}
                </div>
                <span className="text-[11px] text-emerald-300/80 mt-1 block">
                  Successfully concluded touchpoints
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0b1033] border border-amber-500/30">
                <span className="text-[11px] font-mono uppercase text-[#fde68a] block font-bold">
                  PLANNED INTERVENTIONS
                </span>
                <div className="text-3xl font-black font-mono text-amber-400 mt-1">
                  {interventionStats.planned}
                </div>
                <span className="text-[11px] text-amber-300/80 mt-1 block">
                  Scheduled for upcoming sprints
                </span>
              </div>
            </div>
          </div>

          {/* Most Common Intervention Types & Cohort Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Most Common Types (Calculated from actual intervention records!) */}
            <div className="lg:col-span-1 p-6 rounded-2xl bg-[#0c1033] border border-[#222955] shadow-xl">
              <h3 className="font-baskerville text-base font-bold text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#ffb27a]" />
                <span>Most Common Intervention Types</span>
              </h3>
              <p className="text-xs text-[#a4a9d0] mb-5">
                Aggregated distribution derived strictly from active student intervention records:
              </p>

              <div className="space-y-4">
                {Object.entries(interventionStats.typeCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => {
                    const percentage = Math.round((count / (interventionStats.total || 1)) * 100);
                    return (
                      <div key={type} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-white font-medium">{type}</span>
                          <span className="text-[#ffb27a] font-bold">{count}</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#ff6a2b] to-[#6f8dff]"
                            style={{ width: `${Math.max(10, percentage)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Right: Institutional Intervention History & Action Log */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0c1033] border border-[#222955] shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-baskerville text-base font-bold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#6f8dff]" />
                    <span>Recent Cohort Support Actions</span>
                  </h3>
                  <p className="text-xs text-[#a4a9d0] mt-0.5">
                    Live chronological timeline of pedagogical advisor actions across all departments.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-white/10 text-[#a4a9d0] font-semibold font-mono">
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Student</th>
                      <th className="pb-3">Intervention Type</th>
                      <th className="pb-3">Priority</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Faculty Advisor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {interventions.slice(0, 10).map((record) => (
                      <tr key={record.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 font-mono text-[11px] text-[#ffb27a] whitespace-nowrap">
                          {record.date}
                        </td>
                        <td className="py-3 font-medium text-white whitespace-nowrap">
                          {record.studentName}
                        </td>
                        <td className="py-3 text-[#cbd5e1] font-medium whitespace-nowrap">
                          {record.actionType}
                        </td>
                        <td className="py-3 font-mono text-[11px] whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              record.priority === 'HIGH'
                                ? 'bg-rose-500/15 text-rose-300'
                                : 'bg-amber-500/15 text-amber-300'
                            }`}
                          >
                            {record.priority}
                          </span>
                        </td>
                        <td className="py-3 font-mono text-[11px] whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              record.status === 'ACTIVE'
                                ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                                : record.status === 'COMPLETED'
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td className="py-3 text-[#a4a9d0] text-[11px] whitespace-nowrap">
                          {record.facultyName}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Responsible AI Notice */}
          <div className="p-4 rounded-2xl bg-[#070b24] border border-[#1d2350] flex items-start gap-3 text-xs text-[#8e96c8]">
            <ShieldCheck className="w-5 h-5 shrink-0 text-[#2dd4bf] mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5">Responsible AI Governance Notice:</strong>
              Intervention Intelligence is supportive, non-punitive, and developmental. Faculty advisors maintain authoritative pedagogical control over all prescribed activities and timelines.
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB: AI DECISION INTELLIGENCE PLATFORM (INSTITUTION VIEW)
      ========================================================= */}
      {activeTab === 'decision-intelligence' && (
        <InstitutionalDecisionView
          onNavigateToSegments={() => setActiveTab('student-segments')}
        />
      )}

      {/* =========================================================
          TAB 2: FACULTY ADVISOR CASELOADS
      ========================================================= */}
      {activeTab === 'advisor-caseload' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0c1033] border border-[#222955] shadow-xl">
            <h3 className="font-baskerville text-lg font-bold text-white mb-2 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#a855f7]" />
              <span>Departmental Advisor Allocation & Caseload Distribution</span>
            </h3>
            <p className="text-xs text-[#a4a9d0] mb-6">
              Monitoring advisor workloads, active intervention backlogs, and mean turnaround velocity:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {facultyAdvisors.map((adv, i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-[#06081c] border border-white/10 space-y-3 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-baskerville text-base font-bold text-white">
                        {adv.name}
                      </h4>
                      <p className="text-xs text-[#a4a9d0]">{adv.department}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold">
                      {adv.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#0a0d2a] border border-white/5 text-center text-xs">
                    <div>
                      <div className="text-[10px] text-[#a4a9d0]">Advisees</div>
                      <div className="font-mono font-bold text-white mt-0.5">
                        {adv.advisees} students
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#a4a9d0]">Avg Success</div>
                      <div className="font-mono font-bold text-[#d8b4fe] mt-0.5">
                        {adv.avgAdviseeScore}/100
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#a4a9d0]">Turnaround</div>
                      <div className="font-mono font-bold text-cyan-400 mt-0.5">
                        {adv.avgResponseHours}h avg
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#a4a9d0]">
                    <span>Active Scheduled Interventions:</span>
                    <span className="font-mono font-bold text-white">
                      {adv.activeInterventions} sessions
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 3: EARLY SIGNALS GOVERNANCE
      ========================================================= */}
      {activeTab === 'early-signals' && (
        <div className="p-6 rounded-2xl bg-[#0c1033] border border-[#222955] shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-baskerville text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span>Institution-Wide Early Warning Governance & Signal Intelligence</span>
              </h3>
              <p className="text-xs text-[#a4a9d0] mt-1">
                Evolyn automatically tracks multi-dimensional divergence between high academic stability and early behavioral deceleration.
              </p>
            </div>

            {/* Department, Branch, Year Controls */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <div className="flex items-center gap-1.5 bg-[#06081c] border border-[#1f2552] px-2.5 py-1.5 rounded-xl">
                <span className="text-[#8e96c8]">Dept:</span>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="bg-transparent text-white focus:outline-none cursor-pointer"
                >
                  <option value="all" className="bg-[#090b20]">All Departments</option>
                  <option value="cse" className="bg-[#090b20]">Computer Science</option>
                  <option value="ece" className="bg-[#090b20]">Electronics & Comm</option>
                  <option value="mech" className="bg-[#090b20]">Mechanical Eng</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-[#06081c] border border-[#1f2552] px-2.5 py-1.5 rounded-xl">
                <span className="text-[#8e96c8]">Branch:</span>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="bg-transparent text-white focus:outline-none cursor-pointer"
                >
                  <option value="all" className="bg-[#090b20]">All Branches</option>
                  <option value="CSE" className="bg-[#090b20]">CSE</option>
                  <option value="ECE" className="bg-[#090b20]">ECE</option>
                  <option value="EEE" className="bg-[#090b20]">EEE</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-[#06081c] border border-[#1f2552] px-2.5 py-1.5 rounded-xl">
                <span className="text-[#8e96c8]">Year:</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-transparent text-white focus:outline-none cursor-pointer"
                >
                  <option value="all" className="bg-[#090b20]">All Years</option>
                  <option value="1st Year" className="bg-[#090b20]">1st Year</option>
                  <option value="2nd Year" className="bg-[#090b20]">2nd Year</option>
                  <option value="3rd Year" className="bg-[#090b20]">3rd Year</option>
                  <option value="4th Year" className="bg-[#090b20]">4th Year</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
              <div className="text-[11px] text-emerald-400 font-bold uppercase font-mono">Normal Status</div>
              <div className="text-2xl font-bold text-white font-mono mt-1">{riskStats.normal} Students</div>
              <div className="text-[11px] text-[#a4a9d0] mt-1">71.9% of cohort in equilibrium</div>
            </div>

            <div className="p-4 rounded-xl bg-orange-950/40 border border-orange-500/30">
              <div className="text-[11px] text-orange-400 font-bold uppercase font-mono">Watch List</div>
              <div className="text-2xl font-bold text-white font-mono mt-1">{riskStats.watch} Students</div>
              <div className="text-[11px] text-[#a4a9d0] mt-1">17.3% single localized metric</div>
            </div>

            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30">
              <div className="text-[11px] text-amber-400 font-bold uppercase font-mono">Early Signal</div>
              <div className="text-2xl font-bold text-white font-mono mt-1">{riskStats.earlySignal} Students</div>
              <div className="text-[11px] text-[#a4a9d0] mt-1">8.3% divergence detected</div>
            </div>

            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30">
              <div className="text-[11px] text-rose-400 font-bold uppercase font-mono">Multiple Signals</div>
              <div className="text-2xl font-bold text-white font-mono mt-1">{riskStats.multipleSignals} Students</div>
              <div className="text-[11px] text-[#a4a9d0] mt-1">2.5% multi-vector decline</div>
            </div>
          </div>

          {/* Filtered Student Signal Table */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="font-baskerville text-sm font-bold text-white flex items-center gap-2">
                <span>Active Signal Cohort Table ({selectedRiskCategory === 'all' ? 'All Monitored' : selectedRiskCategory})</span>
              </h4>
              <span className="text-[11px] text-[#8e96c8] font-mono">
                Click any student to inspect in Faculty Advisor View
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#1f2552] bg-[#06081c]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[#a4a9d0] font-semibold font-mono bg-[#090d29]">
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Branch & Year</th>
                    <th className="p-3 text-center">Success Score</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3">Top Declining Signals</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {STUDENT_GROWTH_DATA.filter((st) => {
                    const risk = getStudentRiskProfile(st.id);
                    const matchCategory = selectedRiskCategory === 'all' || risk.status === selectedRiskCategory;
                    const matchBranch = selectedBranch === 'all' || st.branch === selectedBranch;
                    const matchYear = selectedYear === 'all' || st.year === selectedYear;
                    return matchCategory && matchBranch && matchYear;
                  }).map((st) => {
                    const risk = getStudentRiskProfile(st.id);
                    const score = getStudentSuccessScore(st.id);
                    return (
                      <tr key={st.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="p-3 font-medium text-white flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-[#182054] text-[#6f8dff] border border-[#303a7d] flex items-center justify-center text-[10px] font-bold font-mono">
                            {st.avatarInitials}
                          </span>
                          <div>
                            <div>{st.name}</div>
                            <div className="text-[10px] text-[#8e96c8] font-mono">{st.studentId}</div>
                          </div>
                        </td>
                        <td className="p-3 text-[#a4a9d0] font-mono text-[11px]">
                          {st.branch} • {st.year}
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-[#ff8a50]">
                          {score.currentScore}/100
                        </td>
                        <td className="p-3 text-center">
                          <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${risk.statusBadge.bg} ${risk.statusBadge.border} ${risk.statusBadge.text} border`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${risk.statusBadge.dot}`} />
                            <span>{risk.statusBadge.label}</span>
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                            {risk.signals.filter((s) => s.trend === 'declining').length > 0 ? (
                              risk.signals
                                .filter((s) => s.trend === 'declining')
                                .map((s) => (
                                  <span key={s.id} className="px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/25 text-rose-300">
                                    {s.name} {s.changeDisplay}
                                  </span>
                                ))
                            ) : (
                              <span className="text-emerald-400 font-mono text-[10px]">
                                All dimensions stable or improving
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedStudentId(st.id);
                              setActiveWorkspace('faculty');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#ff6a2b]/20 hover:bg-[#ff6a2b] border border-[#ff6a2b]/35 text-white transition-colors cursor-pointer text-[11px] font-mono"
                          >
                            Inspect Advisor
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB: STUDENT SEGMENTS (7 COHORTS ANALYTICS)
      ========================================================= */}
      {activeTab === 'student-segments' && (
        <div className="p-6 rounded-2xl bg-[#0c1033] border border-[#222955] shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-baskerville text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#818cf8]" />
                <span>Institution-Level Student Segmentation Analytics (7 Cohorts)</span>
              </h3>
              <p className="text-xs text-[#a4a9d0] mt-1">
                Data-driven grouping derived from Academic, Attendance, LMS, Engagement, Placement, Skills, and Feedback vectors.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <div className="flex items-center gap-1.5 bg-[#06081c] border border-[#1f2552] px-2.5 py-1.5 rounded-xl">
                <span className="text-[#8e96c8]">Dept:</span>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="bg-transparent text-white focus:outline-none cursor-pointer"
                >
                  <option value="all" className="bg-[#090b20]">All Departments</option>
                  <option value="cse" className="bg-[#090b20]">Computer Science</option>
                  <option value="ece" className="bg-[#090b20]">Electronics & Comm</option>
                  <option value="mech" className="bg-[#090b20]">Mechanical Eng</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-[#06081c] border border-[#1f2552] px-2.5 py-1.5 rounded-xl">
                <span className="text-[#8e96c8]">Branch:</span>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="bg-transparent text-white focus:outline-none cursor-pointer"
                >
                  <option value="all" className="bg-[#090b20]">All Branches</option>
                  <option value="CSE" className="bg-[#090b20]">CSE</option>
                  <option value="ECE" className="bg-[#090b20]">ECE</option>
                  <option value="EEE" className="bg-[#090b20]">EEE</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-[#06081c] border border-[#1f2552] px-2.5 py-1.5 rounded-xl">
                <span className="text-[#8e96c8]">Year:</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-transparent text-white focus:outline-none cursor-pointer"
                >
                  <option value="all" className="bg-[#090b20]">All Years</option>
                  <option value="1st Year" className="bg-[#090b20]">1st Year</option>
                  <option value="2nd Year" className="bg-[#090b20]">2nd Year</option>
                  <option value="3rd Year" className="bg-[#090b20]">3rd Year</option>
                  <option value="4th Year" className="bg-[#090b20]">4th Year</option>
                </select>
              </div>
            </div>
          </div>

          {/* Institutional Segments Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 font-mono">
            {getSegmentCohortStats().map((stat) => (
              <div
                key={stat.segmentDef.id}
                className="p-3 rounded-xl bg-[#06081c] border border-[#1f2552] flex flex-col justify-between"
              >
                <div>
                  <div className="text-[10px] text-[#8e96c8] uppercase truncate" title={stat.segmentDef.name}>
                    {stat.segmentDef.shortLabel}
                  </div>
                  <div className="text-xl font-black text-white mt-1">
                    {stat.institutionalScaledCount}
                  </div>
                </div>
                <div className="text-[10px] text-[#a4a9d0] mt-2 pt-1.5 border-t border-white/5">
                  Avg: <strong className="text-[#ffb27a]">{stat.avgSuccessScore}</strong>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Breakdown Table */}
          <div className="space-y-3 pt-2">
            <h4 className="font-baskerville text-sm font-bold text-white">
              Student Segment Allocation & Key Indicators
            </h4>

            <div className="overflow-x-auto rounded-xl border border-[#1f2552] bg-[#06081c]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[#a4a9d0] font-semibold font-mono bg-[#090d29]">
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Branch & Year</th>
                    <th className="p-3 text-center">Success Score</th>
                    <th className="p-3">Primary Segment</th>
                    <th className="p-3">Diagnostic Rationale</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {ALL_STUDENT_SEGMENTS.filter((s) => {
                    const matchBranch = selectedBranch === 'all' || s.branch === selectedBranch;
                    const matchYear = selectedYear === 'all' || s.year === selectedYear;
                    return matchBranch && matchYear;
                  }).map((st) => (
                    <tr key={st.studentId} className="hover:bg-white/[0.03] transition-colors">
                      <td className="p-3 font-medium text-white flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-[#182054] text-[#6f8dff] border border-[#303a7d] flex items-center justify-center text-[10px] font-bold font-mono">
                          {st.avatarInitials}
                        </span>
                        <div>
                          <div>{st.studentName}</div>
                          <div className="text-[10px] text-[#8e96c8] font-mono">{st.studentId}</div>
                        </div>
                      </td>
                      <td className="p-3 text-[#a4a9d0] font-mono text-[11px]">
                        {st.branch} • {st.year}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-[#ff8a50]">
                        {st.successScore}/100
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-mono font-medium ${st.segmentDef.badgeColor}`}
                        >
                          {st.segmentDef.name}
                        </span>
                      </td>
                      <td className="p-3 text-[#a4a9d0] text-[11px] leading-tight max-w-xs">
                        {st.rationale}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedStudentId(st.studentId);
                            setActiveWorkspace('faculty');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#ff6a2b]/20 hover:bg-[#ff6a2b] border border-[#ff6a2b]/35 text-white transition-colors cursor-pointer text-[11px] font-mono"
                        >
                          Inspect Roster
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 4: PLACEMENT PIPELINE & SKILLS INTELLIGENCE (STEP 9)
      ========================================================= */}
      {activeTab === 'placement-pipeline' && (
        <AdministratorPlacementIntelligence />
      )}

      {/* =========================================================
          TAB 5: 7 DATA SOURCES HEALTH
      ========================================================= */}
      {activeTab === 'integrations' && (
        <div className="p-6 rounded-2xl bg-[#0c1033] border border-[#222955] shadow-xl space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-baskerville text-lg font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-[#d8b4fe]" />
                <span>Unified 7-Source Data Pipelines</span>
              </h3>
              <p className="text-xs text-[#a4a9d0]">
                Institutional sync health across student intelligence feeds
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('data-integration')}
                className="px-3.5 py-1.5 rounded-xl bg-[#38bdf8] hover:bg-[#7dd3fc] text-slate-950 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#38bdf8]/20"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Launch CSV Import & Validation</span>
              </button>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-semibold">
                7 / 7 Connected
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {dataSources.map((src, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-black/30 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="text-xs font-bold text-white">{src.name}</div>
                  <div className="text-[11px] text-[#a4a9d0]">{src.type}</div>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-[#a4a9d0] hidden md:inline">{src.records}</span>
                  <span className="text-cyan-400 hidden sm:inline">{src.latency}</span>
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {src.status}
                  </span>
                  <button
                    onClick={() => onNavigate('data-integration')}
                    className="px-2.5 py-1 rounded-lg bg-[#38bdf8]/15 hover:bg-[#38bdf8] border border-[#38bdf8]/30 text-[#7dd3fc] hover:text-slate-950 font-semibold text-[11px] transition-all cursor-pointer flex items-center gap-1"
                    title={`Import CSV for ${src.name}`}
                  >
                    <UploadCloud className="w-3 h-3" />
                    <span>Import CSV</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Educational AI Knowledge System Integration (Part B) */}
          <div className="mt-6 pt-5 border-t border-white/10 p-4 rounded-xl bg-gradient-to-r from-[#0c1a36] to-[#09152b] border border-[#2dd4bf]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-4 h-4 text-[#2dd4bf]" />
                <h4 className="font-semibold text-sm text-white">Educational Knowledge Repository &amp; RAG System</h4>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                  7 Subject Domains Active
                </span>
              </div>
              <p className="text-xs text-[#a4a9d0]">
                Governance for verified textbooks (OpenStax, MIT OCW, Python Docs) powering Evolyn AI Coach with verifiable citations.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsKnowledgeModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#2dd4bf] hover:bg-[#5eead4] text-slate-950 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#2dd4bf]/20"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Manage Sources</span>
              </button>
              <button
                onClick={() => setIsTestModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Run Audit Tests</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals for Educational Knowledge System */}
      <KnowledgeLibraryModal
        isOpen={isKnowledgeModalOpen}
        onClose={() => setIsKnowledgeModalOpen(false)}
      />

      <KnowledgeTestModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
      />
    </div>
  );
};
