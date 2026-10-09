import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useLms } from '../../context/LmsContext';
import { STUDENT_GROWTH_DATA } from '../../data/studentGrowthData';
import { getAllUnifiedStudents } from '../../data/unifiedStudentData';
import { getStudentSuccessScore } from '../../data/studentSuccessScore';
import { StudentGrowthTrack } from '../growth-track/StudentGrowthTrack';
import { SilentStruggleDetection } from '../silent-struggle/SilentStruggleDetection';
import { StudentCard } from '../common/StudentCard';
import { FacultyDmModal } from './FacultyDmModal';
import { FacultyLmsAssignModal } from './FacultyLmsAssignModal';
import { StudentRiskDetailModal } from './StudentRiskDetailModal';
import { AiDecisionIntelligencePanel } from '../decision-intelligence/AiDecisionIntelligencePanel';
import { getStudentRiskProfile, RiskStatus } from '../../data/studentRiskEngine';
import {
  getStudentSegment,
  StudentSegmentType,
  SEGMENT_DEFINITIONS,
  getSegmentCohortStats,
} from '../../data/studentSegmentationEngine';
import {
  UserCheck,
  Users,
  TrendingUp,
  AlertTriangle,
  FileText,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
  Search,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Award,
  BookOpen,
  Send,
  Shield,
  Layers,
  Heart,
  PlusCircle,
  ExternalLink,
  Target,
  UploadCloud,
} from 'lucide-react';
import { InterventionIntelligencePanel } from '../intervention/InterventionIntelligencePanel';
import { FacultySkillGapPanel } from './FacultySkillGapPanel';

interface FacultyWorkspaceProps {
  onBackToLanding: () => void;
  onOpenAuth: () => void;
  onNavigate: (view: any) => void;
}

type FacultyTab =
  | 'roster'
  | 'skills-placement'
  | 'intervention-intelligence'
  | 'decision-intelligence'
  | 'personal-care-dms'
  | 'lms-assignments'
  | 'growth-track'
  | 'silent-struggle'
  | 'notes-interventions';

export const FacultyWorkspace: React.FC<FacultyWorkspaceProps> = ({
  onBackToLanding,
  onOpenAuth,
  onNavigate,
}) => {
  const { user, userProfile } = useAuth();
  const { selectedStudentId, setSelectedStudentId, openRoleModal } = useWorkspace();
  const {
    messages,
    assignments,
    sendMessage,
    sendReply,
    assignWork,
    reviewAssignment,
    getStudentMessages,
    getStudentAssignments,
  } = useLms();

  const [activeTab, setActiveTab] = useState<FacultyTab>('roster');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCohort, setFilterCohort] = useState<string>('all');
  const [filterRiskStatus, setFilterRiskStatus] = useState<string>('ALL');
  const [filterSegment, setFilterSegment] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'highest-score' | 'lowest-score' | 'most-signals' | 'recently-declining'>('most-signals');
  const [, setRefreshTick] = useState(0);

  // Sync state when fresh CSV datasets are imported
  useEffect(() => {
    const handleDataRefreshed = () => {
      setRefreshTick((t) => t + 1);
    };
    window.addEventListener('evolyn-data-refreshed', handleDataRefreshed);
    return () => window.removeEventListener('evolyn-data-refreshed', handleDataRefreshed);
  }, []);

  // Explainable Risk Details Modal State
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
  const [riskModalStudentId, setRiskModalStudentId] = useState<string>(selectedStudentId);

  // Modals state
  const [isDmModalOpen, setIsDmModalOpen] = useState(false);
  const [dmTargetStudentId, setDmTargetStudentId] = useState<string>(selectedStudentId);

  const [isLmsModalOpen, setIsLmsModalOpen] = useState(false);
  const [lmsTargetStudentId, setLmsTargetStudentId] = useState<string>(selectedStudentId);

  // Direct DM View State (within dedicated tab)
  const [tabDmStudentId, setTabDmStudentId] = useState<string>(selectedStudentId || STUDENT_GROWTH_DATA[0].id);
  const [tabDmSubject, setTabDmSubject] = useState('');
  const [tabDmMessage, setTabDmMessage] = useState('');
  const [tabDmCategory, setTabDmCategory] = useState<
    'Academic Support' | 'Wellness Check-in' | 'Placement Mentoring' | 'Project Guidance' | 'Encouragement'
  >('Wellness Check-in');
  const [tabDmReplyText, setTabDmReplyText] = useState<{ [msgId: string]: string }>({});
  const [tabDmSuccessBanner, setTabDmSuccessBanner] = useState<string | null>(null);

  // LMS View State (within dedicated tab)
  const [tabLmsStudentFilter, setTabLmsStudentFilter] = useState<string>('all');
  const [tabLmsStatusFilter, setTabLmsStatusFilter] = useState<string>('all');
  const [reviewModalAssignmentId, setReviewModalAssignmentId] = useState<string | null>(null);
  const [reviewGradeInput, setReviewGradeInput] = useState('95 / 100 (A)');
  const [reviewFeedbackInput, setReviewFeedbackInput] = useState('Great attention to edge cases and clear explanatory comments!');

  // Interactive Faculty Notes state
  const [facultyNotes, setFacultyNotes] = useState<
    Array<{
      id: string;
      studentId: string;
      studentName: string;
      author: string;
      date: string;
      category: 'Academic' | 'Behavioral' | 'Career / Placement' | 'Wellbeing';
      content: string;
      status: 'Action Required' | 'Followed Up' | 'Resolved';
    }>
  >([
    {
      id: 'note-1',
      studentId: 'st-001',
      studentName: 'Priya Sharma',
      author: userProfile?.displayName || 'Prof. Elena Vance (Advisor)',
      date: 'Today at 9:45 AM',
      category: 'Academic',
      content:
        'Sent a personal wellness check-in regarding the Raft consensus module. Priya has an outstanding Success Score of 84. Offered 1-on-1 office hours this Thursday.',
      status: 'Followed Up',
    },
    {
      id: 'note-2',
      studentId: 'st-002',
      studentName: 'Marcus Vance',
      author: userProfile?.displayName || 'Prof. Elena Vance (Advisor)',
      date: 'Yesterday at 3:15 PM',
      category: 'Academic',
      content:
        'Assigned remedial module on asymptotic notation. Marcus was diligent during lab hours and topological sorting visualizations helped resolve earlier confusion.',
      status: 'Followed Up',
    },
    {
      id: 'note-3',
      studentId: 'st-003',
      studentName: 'Sofia Chen',
      author: userProfile?.displayName || 'Dr. Sunita Rao',
      date: 'Oct 5, 2026',
      category: 'Career / Placement',
      content:
        'Sofia maintained exceptional scores across ML & NLP labs. Recommended her for the Undergraduate Research Symposium and faculty research grant.',
      status: 'Resolved',
    },
  ]);

  const [newNoteStudent, setNewNoteStudent] = useState<string>(selectedStudentId);
  const [newNoteCategory, setNewNoteCategory] = useState<'Academic' | 'Behavioral' | 'Career / Placement' | 'Wellbeing'>('Academic');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [noteSuccessBanner, setNoteSuccessBanner] = useState<string | null>(null);

  // Filter & Sort students
  const filteredStudents = STUDENT_GROWTH_DATA.filter((s) => {
    const risk = getStudentRiskProfile(s.id);
    const segment = getStudentSegment(s.id);
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.branch.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCohort =
      filterCohort === 'all' ||
      s.year.toLowerCase().includes(filterCohort.toLowerCase()) ||
      s.branch.toLowerCase() === filterCohort.toLowerCase();
    const matchesRisk =
      filterRiskStatus === 'ALL' ||
      risk.status === filterRiskStatus;
    const matchesSegment =
      filterSegment === 'ALL' ||
      segment.primarySegment === filterSegment;

    return matchesSearch && matchesCohort && matchesRisk && matchesSegment;
  }).sort((a, b) => {
    const riskA = getStudentRiskProfile(a.id);
    const riskB = getStudentRiskProfile(b.id);
    const scoreA = getStudentSuccessScore(a.id).currentScore;
    const scoreB = getStudentSuccessScore(b.id).currentScore;

    if (sortBy === 'highest-score') return scoreB - scoreA;
    if (sortBy === 'lowest-score') return scoreA - scoreB;
    if (sortBy === 'most-signals') return riskB.decliningSignalsCount - riskA.decliningSignalsCount;
    if (sortBy === 'recently-declining') {
      const decA = riskA.signals.filter((s) => s.trend === 'declining').length;
      const decB = riskB.signals.filter((s) => s.trend === 'declining').length;
      return decB - decA;
    }
    return 0;
  });

  const handleOpenRiskModal = (studentId: string) => {
    setRiskModalStudentId(studentId);
    setIsRiskModalOpen(true);
  };

  const handleSelectAndInspect = (studentId: string, tabToOpen: FacultyTab = 'growth-track') => {
    setSelectedStudentId(studentId);
    setActiveTab(tabToOpen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDmForStudent = (studentId: string) => {
    setDmTargetStudentId(studentId);
    setIsDmModalOpen(true);
  };

  const handleOpenLmsForStudent = (studentId: string) => {
    setLmsTargetStudentId(studentId);
    setIsLmsModalOpen(true);
  };

  const handleSendTabDm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tabDmMessage.trim() || !tabDmSubject.trim()) return;

    const targetStudent =
      STUDENT_GROWTH_DATA.find((s) => s.id === tabDmStudentId) || STUDENT_GROWTH_DATA[0];

    sendMessage(
      targetStudent.id,
      targetStudent.name,
      tabDmSubject.trim(),
      tabDmMessage.trim(),
      tabDmCategory
    );

    setTabDmSubject('');
    setTabDmMessage('');
    setTabDmSuccessBanner(`Direct care note sent to ${targetStudent.name}!`);
    setTimeout(() => setTabDmSuccessBanner(null), 3500);
  };

  const handleSendReplyInTab = (messageId: string) => {
    const text = tabDmReplyText[messageId];
    if (!text || !text.trim()) return;

    sendReply(messageId, text.trim(), 'faculty', userProfile?.displayName || 'Prof. Elena Vance');
    setTabDmReplyText((prev) => ({ ...prev, [messageId]: '' }));
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    const targetStudent = STUDENT_GROWTH_DATA.find((s) => s.id === newNoteStudent) || STUDENT_GROWTH_DATA[0];
    const newNote = {
      id: `note-${Date.now()}`,
      studentId: targetStudent.id,
      studentName: targetStudent.name,
      author: userProfile?.displayName || user?.displayName || 'Faculty Advisor',
      date: 'Just now',
      category: newNoteCategory,
      content: newNoteContent.trim(),
      status: 'Action Required' as const,
    };

    setFacultyNotes([newNote, ...facultyNotes]);
    setNewNoteContent('');
    setNoteSuccessBanner(`Faculty advisory note recorded for ${targetStudent.name}.`);
    setTimeout(() => setNoteSuccessBanner(null), 4000);
  };

  const handleGradeSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalAssignmentId) return;

    reviewAssignment(reviewModalAssignmentId, reviewGradeInput, reviewFeedbackInput);
    setReviewModalAssignmentId(null);
  };

  const currentTabDmStudent =
    STUDENT_GROWTH_DATA.find((s) => s.id === tabDmStudentId) || STUDENT_GROWTH_DATA[0];
  const activeStudentMessages = getStudentMessages(currentTabDmStudent.id);

  // Filtered LMS assignments in LMS tab
  const filteredLmsAssignments = assignments.filter((a) => {
    const matchStudent =
      tabLmsStudentFilter === 'all' ||
      a.studentId === tabLmsStudentFilter ||
      a.studentName.toLowerCase().includes(tabLmsStudentFilter.toLowerCase());
    const matchStatus = tabLmsStatusFilter === 'all' || a.status === tabLmsStatusFilter;
    return matchStudent && matchStatus;
  });

  return (
    <div className="relative min-h-screen w-full pt-20 pb-24 px-4 sm:px-8 max-w-7xl mx-auto text-[#f0f1ff]">
      {/* Top Breadcrumb & Persona Context */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-[rgba(140,150,255,0.15)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ff6a2b] to-[#ff8c5a] flex items-center justify-center text-white shadow-md shadow-[#ff6a2b]/20">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-baskerville text-xl sm:text-2xl font-bold text-white">
                Faculty Workspace
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-[#ff6a2b]/20 border border-[#ff6a2b]/30 font-mono text-[10px] font-bold text-[#ffb27a]">
                ROLE: ADVISOR & INSTRUCTOR
              </span>
            </div>
            <p className="text-xs text-[#a4a9d0]">
              Empowering faculty with real-time student telemetry, personal caring direct messages, and personalized LMS assignments.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('data-integration')}
            className="px-3.5 py-1.5 rounded-full bg-[#38bdf8]/15 hover:bg-[#38bdf8] border border-[#38bdf8]/30 text-xs text-[#7dd3fc] hover:text-slate-950 font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm group"
            title="Import student CSV datasets with validation"
          >
            <UploadCloud className="w-3.5 h-3.5 text-[#38bdf8] group-hover:text-slate-950" />
            <span>Data Integration</span>
          </button>
          <button
            onClick={() => handleOpenDmForStudent(selectedStudentId)}
            className="px-3.5 py-1.5 rounded-full bg-[#ff6a2b]/15 hover:bg-[#ff6a2b] border border-[#ff6a2b]/30 text-xs text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#ff8a50] group-hover:text-white" />
            <span>Send DM</span>
          </button>
          <button
            onClick={() => handleOpenLmsForStudent(selectedStudentId)}
            className="px-3.5 py-1.5 rounded-full bg-[#6f8dff]/15 hover:bg-[#6f8dff] border border-[#6f8dff]/30 text-xs text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#6f8dff]" />
            <span>Assign Work</span>
          </button>
          <button
            onClick={openRoleModal}
            className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#c2d1ff] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-[#ff6a2b]" />
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

      {/* Workspace Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0b0f2a] backdrop-blur-md border border-[rgba(140,150,255,0.2)] mb-8 overflow-x-auto shadow-lg">
        <button
          onClick={() => setActiveTab('roster')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'roster'
              ? 'bg-[#ff6a2b] text-white shadow-md shadow-[#ff6a2b]/25'
              : 'text-[#a4a9d0] hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>My Students & Roster</span>
          <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px] ml-1">
            {STUDENT_GROWTH_DATA.length}
          </span>
        </button>

        <button
          onClick={() => onNavigate && onNavigate('data-integration')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap text-[#7dd3fc] bg-[#38bdf8]/10 hover:bg-[#38bdf8]/20 border border-[#38bdf8]/30"
          title="Import CSV datasets for Academic, Attendance, LMS, Skills, Placement & Feedback"
        >
          <UploadCloud className="w-4 h-4 text-[#38bdf8]" />
          <span>Data Integration &amp; CSV Import</span>
        </button>

        <button
          onClick={() => setActiveTab('skills-placement')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'skills-placement'
              ? 'bg-[#2dd4bf] text-black shadow-md shadow-[#2dd4bf]/25 font-bold'
              : 'text-[#a4a9d0] hover:text-white hover:bg-white/5'
          }`}
        >
          <Award className="w-4 h-4 text-[#5eead4]" />
          <span>Skills & Placement Intelligence</span>
        </button>

        <button
          onClick={() => setActiveTab('intervention-intelligence')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'intervention-intelligence'
              ? 'bg-gradient-to-r from-[#ff6a2b] via-[#ec4899] to-[#6366f1] text-white shadow-md shadow-[#ff6a2b]/25 font-bold'
              : 'text-[#a4a9d0] hover:text-white hover:bg-white/5'
          }`}
        >
          <Target className="w-4 h-4 text-[#ffb27a]" />
          <span>Intervention Intelligence</span>
        </button>

        <button
          onClick={() => setActiveTab('decision-intelligence')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'decision-intelligence'
              ? 'bg-gradient-to-r from-[#ff6a2b] via-[#e11d48] to-[#6366f1] text-white shadow-md shadow-[#ff6a2b]/25'
              : 'text-[#a4a9d0] hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#ffb27a]" />
          <span>AI Decision Intelligence Platform</span>
        </button>

        <button
          onClick={() => setActiveTab('personal-care-dms')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'personal-care-dms'
              ? 'bg-[#ff6a2b] text-white shadow-md shadow-[#ff6a2b]/25'
              : 'text-[#a4a9d0] hover:text-white hover:bg-white/5'
          }`}
        >
          <Heart className="w-4 h-4 text-rose-400" />
          <span>Personal Care & DMs</span>
          <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px] ml-1">
            {messages.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('lms-assignments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'lms-assignments'
              ? 'bg-[#ff6a2b] text-white shadow-md shadow-[#ff6a2b]/25'
              : 'text-[#a4a9d0] hover:text-white hover:bg-white/5'
          }`}
        >
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span>Personalized LMS & Coursework</span>
          <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px] ml-1">
            {assignments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('growth-track')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'growth-track'
              ? 'bg-[#ff6a2b] text-white shadow-md shadow-[#ff6a2b]/25'
              : 'text-[#a4a9d0] hover:text-white hover:bg-white/5'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Growth Track & Scores</span>
        </button>

        <button
          onClick={() => setActiveTab('silent-struggle')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'silent-struggle'
              ? 'bg-gradient-to-r from-[#ff6a2b] to-[#6f8dff] text-white shadow-md shadow-[#ff6a2b]/25'
              : 'text-[#a4a9d0] hover:text-white hover:bg-white/5'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Silent Struggle Signals</span>
        </button>

        <button
          onClick={() => setActiveTab('notes-interventions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'notes-interventions'
              ? 'bg-[#ff6a2b] text-white shadow-md shadow-[#ff6a2b]/25'
              : 'text-[#a4a9d0] hover:text-white hover:bg-white/5'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Faculty Notes & Logs</span>
          <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px] ml-1">
            {facultyNotes.length}
          </span>
        </button>
      </div>

      {/* =========================================================
          TAB 1: MY STUDENTS ROSTER (DESIGNED LIKE PRIYA SHARMA'S CARD)
      ========================================================= */}
      {activeTab === 'roster' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar for Faculty (Polished solid cosmic cards) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#0b0f2a] border border-[#222955] shadow-lg">
              <div className="text-[11px] font-medium text-[#a4a9d0] uppercase tracking-wider mb-1 font-mono">
                Active Advisees
              </div>
              <div className="text-2xl font-bold text-white font-mono">
                {STUDENT_GROWTH_DATA.length} Students
              </div>
              <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3 h-3" /> 100% Unified Intelligence
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0b0f2a] border border-[#222955] shadow-lg">
              <div className="text-[11px] font-medium text-[#a4a9d0] uppercase tracking-wider mb-1 font-mono">
                Avg Success Score
              </div>
              <div className="text-2xl font-bold text-[#ffb27a] font-mono">
                81.4 <span className="text-xs text-[#a4a9d0]">/100</span>
              </div>
              <div className="text-[11px] text-[#a4a9d0] mt-1 font-mono">
                Across 7 Challenge Pillars
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0b0f2a] border border-[#222955] shadow-lg">
              <div className="text-[11px] font-medium text-[#a4a9d0] uppercase tracking-wider mb-1 font-mono">
                Personal DMs & Care
              </div>
              <div className="text-2xl font-bold text-rose-400 font-mono">
                {messages.length} Active Notes
              </div>
              <div className="text-[11px] text-rose-300 mt-1 flex items-center gap-1 font-mono">
                <Heart className="w-3 h-3" /> Empathetic touchpoints
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0b0f2a] border border-[#222955] shadow-lg">
              <div className="text-[11px] font-medium text-[#a4a9d0] uppercase tracking-wider mb-1 font-mono">
                LMS Coursework
              </div>
              <div className="text-2xl font-bold text-cyan-400 font-mono">
                {assignments.length} Tailored Works
              </div>
              <div className="text-[11px] text-cyan-300 mt-1 font-mono">
                Targeted practice modules
              </div>
            </div>
          </div>

          {/* Interactive Risk Signal Filter Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {[
              { id: 'ALL', label: 'All Students', count: STUDENT_GROWTH_DATA.length, color: 'border-[#222955] text-white' },
              { id: 'MULTIPLE SIGNALS', label: 'Multiple Signals', count: STUDENT_GROWTH_DATA.filter((s) => getStudentRiskProfile(s.id).status === 'MULTIPLE SIGNALS').length, color: 'border-rose-500/40 text-rose-300 bg-rose-500/10' },
              { id: 'EARLY SIGNAL', label: 'Early Signal', count: STUDENT_GROWTH_DATA.filter((s) => getStudentRiskProfile(s.id).status === 'EARLY SIGNAL').length, color: 'border-amber-500/40 text-amber-300 bg-amber-500/10' },
              { id: 'WATCH', label: 'Watch', count: STUDENT_GROWTH_DATA.filter((s) => getStudentRiskProfile(s.id).status === 'WATCH').length, color: 'border-orange-500/40 text-orange-300 bg-orange-500/10' },
              { id: 'NORMAL', label: 'Normal', count: STUDENT_GROWTH_DATA.filter((s) => getStudentRiskProfile(s.id).status === 'NORMAL').length, color: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10' },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setFilterRiskStatus(btn.id)}
                className={`p-3 rounded-xl border font-mono text-xs transition-all text-left flex items-center justify-between cursor-pointer ${
                  filterRiskStatus === btn.id
                    ? 'border-[#ff6a2b] bg-[#ff6a2b]/20 shadow-md shadow-[#ff6a2b]/20 ring-1 ring-[#ff6a2b]'
                    : `${btn.color} hover:border-[#6f8dff]/60`
                }`}
              >
                <div>
                  <div className="text-[10px] uppercase tracking-wider opacity-80">{btn.label}</div>
                  <div className="font-bold text-sm text-white mt-0.5">{btn.count} Students</div>
                </div>
                {filterRiskStatus === btn.id && (
                  <span className="w-2 h-2 rounded-full bg-[#ff6a2b] animate-ping" />
                )}
              </button>
            ))}
          </div>

          {/* Search, Cohort & Sorting Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#0b0f2a] border border-[#222955] shadow-lg">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#a4a9d0]" />
              <input
                type="text"
                placeholder="Search students by name, ID, branch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#06081c] border border-[#1f2552] text-xs text-white placeholder-[#a4a9d0]/60 focus:outline-none focus:border-[#ff6a2b]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-[#a4a9d0]">
                <Filter className="w-3.5 h-3.5" />
                <span>Cohort:</span>
              </div>
              <select
                value={filterCohort}
                onChange={(e) => setFilterCohort(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[#06081c] border border-[#1f2552] text-xs text-white focus:outline-none focus:border-[#ff6a2b] cursor-pointer"
              >
                <option value="all">All Cohorts (1st & 2nd Year)</option>
                <option value="CSE">Computer Science (CSE)</option>
                <option value="ECE">Electronics (ECE)</option>
                <option value="1st Year">1st Year Only</option>
                <option value="2nd Year">2nd Year Only</option>
              </select>

              <div className="flex items-center gap-1.5 text-xs text-[#a4a9d0] ml-1">
                <Layers className="w-3.5 h-3.5 text-[#a5b4fc]" />
                <span>Segment:</span>
              </div>
              <select
                value={filterSegment}
                onChange={(e) => setFilterSegment(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[#06081c] border border-[#1f2552] text-xs text-white focus:outline-none focus:border-[#ff6a2b] cursor-pointer font-mono"
              >
                <option value="ALL">All Segments</option>
                <option value="HIGH_PERFORMER">High Performer</option>
                <option value="CONSISTENT_GROWTH">Consistent Growth</option>
                <option value="ACADEMIC_STRONG_PLACEMENT_NEEDS_SUPPORT">Academic Strong / Placement Support</option>
                <option value="HIGH_POTENTIAL_LOW_ENGAGEMENT">High Potential / Low Engagement</option>
                <option value="EARLY_SUPPORT_NEEDED">Early Support Needed</option>
                <option value="MULTIPLE_SIGNALS">Multiple Signals</option>
                <option value="PLACEMENT_READY">Placement Ready</option>
              </select>

              <div className="flex items-center gap-1.5 text-xs text-[#a4a9d0] ml-2">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Sort by:</span>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl bg-[#06081c] border border-[#1f2552] text-xs text-white focus:outline-none focus:border-[#ff6a2b] cursor-pointer font-mono"
              >
                <option value="most-signals">Most Signals Detected</option>
                <option value="recently-declining">Recently Declining</option>
                <option value="highest-score">Highest Success Score</option>
                <option value="lowest-score">Lowest Success Score</option>
              </select>
            </div>
          </div>

          {/* Student Cards Roster - All styled like Priya Sharma's card! */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredStudents.map((st) => (
              <div key={st.id} className="relative group/wrapper">
                <StudentCard
                  student={st}
                  isSelected={selectedStudentId === st.id}
                  onSelect={() => handleOpenRiskModal(st.id)}
                  onOpenDm={() => handleOpenDmForStudent(st.id)}
                  onOpenLms={() => handleOpenLmsForStudent(st.id)}
                  onViewGrowthTrack={() => handleSelectAndInspect(st.id, 'decision-intelligence')}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB: SKILLS & PLACEMENT INTELLIGENCE (STEP 9)
      ========================================================= */}
      {activeTab === 'skills-placement' && (
        <FacultySkillGapPanel
          selectedStudentId={selectedStudentId}
          onSelectStudent={(stId) => setSelectedStudentId(stId)}
          onInitiateIntervention={(stId, type) => {
            setSelectedStudentId(stId);
            setActiveTab('intervention-intelligence');
          }}
        />
      )}

      {/* =========================================================
          TAB: INTERVENTION INTELLIGENCE (FACULTY COMMAND CENTER)
      ========================================================= */}
      {activeTab === 'intervention-intelligence' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#0c1033] border border-[#222955]">
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#a4a9d0]">Active Advisee:</span>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="py-1.5 px-3 rounded-xl bg-[#0e1438] border border-[#2b356d] text-xs font-semibold text-white focus:outline-none focus:border-[#ff6a2b] cursor-pointer"
              >
                {STUDENT_GROWTH_DATA.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.studentId})
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setActiveTab('roster')}
              className="text-xs text-[#ffb27a] hover:underline cursor-pointer font-semibold"
            >
              Back to Roster
            </button>
          </div>

          <InterventionIntelligencePanel
            studentId={selectedStudentId}
            onOpenDmModal={(stId) => handleOpenDmForStudent(stId)}
            onOpenLmsModal={(stId) => handleOpenLmsForStudent(stId)}
          />
        </div>
      )}

      {/* =========================================================
          TAB: AI DECISION INTELLIGENCE PLATFORM (FACULTY COCKPIT)
      ========================================================= */}
      {activeTab === 'decision-intelligence' && (
        <AiDecisionIntelligencePanel
          initialStudentId={selectedStudentId}
          mode="faculty"
          onOpenDmModal={(stId) => handleOpenDmForStudent(stId)}
          onOpenLmsModal={(stId) => handleOpenLmsForStudent(stId)}
          onSelectStudent={(stId) => setSelectedStudentId(stId)}
          onDispatchSupportPlan={(stId, planTitle) => {
            const st = STUDENT_GROWTH_DATA.find((s) => s.id === stId) || STUDENT_GROWTH_DATA[0];
            setFacultyNotes((prev) => [
              {
                id: `note-${Date.now()}`,
                studentId: st.id,
                studentName: st.name,
                author: userProfile?.displayName || 'Authorized Faculty Advisor',
                date: 'Just now',
                category: 'Career / Placement',
                content: `AI Decision Intelligence Support Plan created: ${planTitle}. Scheduled 14-day telemetry check on communication and placement readiness.`,
                status: 'Action Required',
              },
              ...prev,
            ]);
            setTabDmSuccessBanner(`Support Plan logged in Faculty Notes for ${st.name}!`);
          }}
        />
      )}

      {/* =========================================================
          TAB 2: PERSONAL CARE & DIRECT MESSAGES (FACULTY ↔ STUDENT)
      ========================================================= */}
      {activeTab === 'personal-care-dms' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Select Student & Compose DM */}
          <div className="lg:col-span-5 space-y-5">
            <div className="p-5 rounded-2xl bg-[#0b0f2a] border border-[#222955] shadow-xl space-y-4">
              <div className="flex items-center space-x-3 pb-3 border-b border-[#1c224a]">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ff6a2b] to-[#ff8a50] flex items-center justify-center text-white shadow-md">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-baskerville text-lg font-bold text-white">
                    Send Direct Care Message
                  </h3>
                  <p className="text-xs text-[#9aa2d4]">
                    Provide personal encouragement, wellness check-in, or 1-on-1 advice.
                  </p>
                </div>
              </div>

              {tabDmSuccessBanner && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs text-emerald-300 font-mono flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{tabDmSuccessBanner}</span>
                </div>
              )}

              {/* Student Target Picker */}
              <div>
                <label className="block text-[11px] font-mono text-[#8e96c8] uppercase mb-1">
                  Select Particular Student from Class
                </label>
                <select
                  value={tabDmStudentId}
                  onChange={(e) => setTabDmStudentId(e.target.value)}
                  className="w-full bg-[#06081c] border border-[#1f2552] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff6a2b]"
                >
                  {STUDENT_GROWTH_DATA.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.branch} - {s.studentId})
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Student Snapshot */}
              <div className="p-3.5 rounded-xl bg-[#06081c] border border-[#1f2552] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#182054] to-[#0c1033] border border-[#303a7d] flex items-center justify-center font-bold text-xs text-[#6f8dff] font-mono">
                    {currentTabDmStudent.avatarInitials}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white font-serif">{currentTabDmStudent.name}</div>
                    <div className="text-[11px] text-[#8e96c8] font-mono">
                      {currentTabDmStudent.studentId} • {currentTabDmStudent.branch}
                    </div>
                  </div>
                </div>

                {(() => {
                  const score = getStudentSuccessScore(currentTabDmStudent.id);
                  return (
                    <div className="text-right">
                      <div className="font-mono text-sm font-bold text-[#ff8a50]">{score.currentScore}/100</div>
                      <div className="text-[9px] text-[#8e96c8] uppercase font-mono">Success Score</div>
                    </div>
                  );
                })()}
              </div>

              {/* Message Composer Form */}
              <form onSubmit={handleSendTabDm} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-mono text-[#8e96c8] uppercase mb-1">
                    Caring Dimension
                  </label>
                  <select
                    value={tabDmCategory}
                    onChange={(e) => setTabDmCategory(e.target.value as any)}
                    className="w-full bg-[#06081c] border border-[#1f2552] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff6a2b]"
                  >
                    <option value="Wellness Check-in">🌿 Wellness Check-in</option>
                    <option value="Academic Support">📚 Academic Support</option>
                    <option value="Placement Mentoring">💼 Placement Mentoring</option>
                    <option value="Project Guidance">🚀 Project Guidance</option>
                    <option value="Encouragement">⭐ Encouragement & Recognition</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#8e96c8] uppercase mb-1">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={tabDmSubject}
                    onChange={(e) => setTabDmSubject(e.target.value)}
                    placeholder="e.g. Checking in on your distributed systems lab"
                    className="w-full bg-[#06081c] border border-[#1f2552] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff6a2b]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#8e96c8] uppercase mb-1">
                    Direct Note
                  </label>
                  <textarea
                    value={tabDmMessage}
                    onChange={(e) => setTabDmMessage(e.target.value)}
                    rows={4}
                    placeholder={`Write your personal note to ${currentTabDmStudent.name}...`}
                    className="w-full bg-[#06081c] border border-[#1f2552] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#ff6a2b]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#ff6a2b] to-[#ff8a50] hover:opacity-95 text-white text-xs font-semibold shadow-lg shadow-[#ff6a2b]/25 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Personal Note to {currentTabDmStudent.name}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Chat History & Thread for Selected Student */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 rounded-2xl bg-[#0b0f2a] border border-[#222955] shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1c224a]">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-[#6f8dff]" />
                  <h3 className="font-baskerville text-lg font-bold text-white">
                    Direct Message Thread with {currentTabDmStudent.name}
                  </h3>
                </div>
                <span className="text-xs font-mono text-[#8e96c8]">
                  {activeStudentMessages.length} Messages
                </span>
              </div>

              {activeStudentMessages.length === 0 ? (
                <div className="text-center py-12 text-xs text-[#767ea8] bg-[#06081c]/60 rounded-xl border border-[#181d45] space-y-2">
                  <p>No direct messages yet between faculty and {currentTabDmStudent.name}.</p>
                  <p className="text-[11px] text-[#5a6296]">
                    Use the composer on the left to send an encouraging check-in!
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[640px] overflow-y-auto pr-2">
                  {activeStudentMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className="p-4 rounded-xl bg-[#0c1033] border border-[#222955] space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded-full bg-[#ff6a2b]/20 border border-[#ff6a2b]/30 text-[9px] font-mono text-[#ffb27a]">
                              {msg.careCategory}
                            </span>
                            <span className="font-bold text-white text-sm">{msg.subject}</span>
                          </div>
                          <div className="text-[10px] text-[#8e96c8] font-mono mt-1">
                            From: {msg.facultyName} ({msg.facultyRole})
                          </div>
                        </div>
                        <span className="text-[10px] text-[#8e96c8] font-mono">{msg.timestamp}</span>
                      </div>

                      <div className="p-3 rounded-lg bg-[#06081c] border border-white/5 text-xs text-[#d1d5f5] leading-relaxed">
                        {msg.message}
                      </div>

                      {/* Replies Thread */}
                      {msg.replies && msg.replies.length > 0 && (
                        <div className="space-y-2 pl-3 border-l-2 border-[#6f8dff]/40">
                          {msg.replies.map((rep) => (
                            <div key={rep.id} className="p-2.5 rounded-lg bg-[#06081c]/70 border border-white/5 text-xs">
                              <div className="flex items-center justify-between text-[11px] text-[#8e96c8] font-mono">
                                <span className={rep.sender === 'student' ? 'text-emerald-400 font-bold' : 'text-[#6f8dff] font-bold'}>
                                  {rep.senderName} ({rep.sender === 'student' ? 'Student' : 'Faculty'})
                                </span>
                                <span>{rep.timestamp}</span>
                              </div>
                              <p className="text-white mt-1 text-xs">{rep.text}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Faculty Quick Reply Input */}
                      <div className="pt-2 flex items-center space-x-2">
                        <input
                          type="text"
                          value={tabDmReplyText[msg.id] || ''}
                          onChange={(e) =>
                            setTabDmReplyText((prev) => ({ ...prev, [msg.id]: e.target.value }))
                          }
                          placeholder={`Reply to ${currentTabDmStudent.name}...`}
                          className="flex-1 bg-[#06081c] border border-[#1f2552] rounded-xl px-3 py-1.5 text-xs text-white placeholder-[#5a6296] focus:outline-none focus:border-[#ff6a2b]"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSendReplyInTab(msg.id);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleSendReplyInTab(msg.id)}
                          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-[#ff6a2b] text-white text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 3: PERSONALIZED LMS & COURSEWORK ASSIGNMENTS
      ========================================================= */}
      {activeTab === 'lms-assignments' && (
        <div className="space-y-6">
          {/* Header & Quick Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0b0f2a] border border-[#222955] shadow-xl">
            <div>
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <h3 className="font-baskerville text-xl font-bold text-white">
                  Personalized Learning Management & Assignments
                </h3>
              </div>
              <p className="text-xs text-[#9aa2d4] mt-1">
                Assign tailored practice tasks, remedial modules, and challenge works with personal caring notes to each student.
              </p>
            </div>

            <button
              onClick={() => handleOpenLmsForStudent(selectedStudentId)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#6f8dff] to-[#3b82f6] hover:opacity-95 text-white text-xs font-semibold shadow-lg shadow-[#6f8dff]/25 flex items-center space-x-2 cursor-pointer self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Assignment</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#0b0f2a] border border-[#222955]">
            <div className="flex items-center space-x-3 text-xs text-[#a4a9d0]">
              <span>Filter by Student:</span>
              <select
                value={tabLmsStudentFilter}
                onChange={(e) => setTabLmsStudentFilter(e.target.value)}
                className="bg-[#06081c] border border-[#1f2552] text-xs text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#6f8dff]"
              >
                <option value="all">All Students</option>
                {STUDENT_GROWTH_DATA.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.branch})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-3 text-xs text-[#a4a9d0]">
              <span>Status:</span>
              <select
                value={tabLmsStatusFilter}
                onChange={(e) => setTabLmsStatusFilter(e.target.value)}
                className="bg-[#06081c] border border-[#1f2552] text-xs text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#6f8dff]"
              >
                <option value="all">All Statuses</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Submitted">Submitted (Needs Review)</option>
                <option value="Reviewed">Reviewed & Graded</option>
              </select>
            </div>
          </div>

          {/* Assignments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredLmsAssignments.map((assign) => (
              <div
                key={assign.id}
                className="p-5 rounded-2xl bg-[#0c1033] border border-[#222955] hover:border-[#6f8dff]/60 transition-all shadow-lg flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Category & Status */}
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#6f8dff]/20 border border-[#6f8dff]/30 text-[10px] font-mono text-[#a4b8ff]">
                      {assign.category}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                        assign.status === 'Submitted'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                          : assign.status === 'Reviewed'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}
                    >
                      {assign.status}
                    </span>
                  </div>

                  <h4 className="font-baskerville text-base font-bold text-white mb-1">
                    {assign.title}
                  </h4>
                  <div className="text-[11px] text-[#8e96c8] font-mono mb-2">
                    {assign.course} • {assign.points} pts
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#06081c] border border-white/5 mb-3">
                    <div className="text-[10px] text-[#8e96c8] font-mono uppercase">Assigned Student</div>
                    <div className="text-xs font-bold text-white font-serif">{assign.studentName}</div>
                  </div>

                  <p className="text-xs text-[#c2c8f0] leading-relaxed mb-3 line-clamp-3">
                    {assign.description}
                  </p>

                  {/* Personal Care Note Callout */}
                  {assign.personalCareNote && (
                    <div className="p-2.5 rounded-xl bg-[#ff6a2b]/10 border border-[#ff6a2b]/25 text-[11px] text-[#ffb27a] mb-3 flex items-start space-x-2">
                      <Heart className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#ff8a50]" />
                      <div>
                        <span className="font-semibold block">Faculty Care Note:</span>
                        <span>"{assign.personalCareNote}"</span>
                      </div>
                    </div>
                  )}

                  {/* Submission details if any */}
                  {assign.submission && (
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300 mb-3 space-y-1">
                      <div className="font-bold flex items-center justify-between">
                        <span>Student Submission:</span>
                        <span className="text-[10px] text-[#8e96c8] font-mono">{assign.submission.submittedAt}</span>
                      </div>
                      <p className="text-[11px] text-white line-clamp-2">{assign.submission.text}</p>
                      {assign.submission.grade && (
                        <div className="text-[11px] text-emerald-400 font-mono font-bold mt-1">
                          Grade: {assign.submission.grade}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#1f2552] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[#8e96c8] font-mono">Due: {assign.dueDate}</span>
                  {assign.status === 'Submitted' ? (
                    <button
                      onClick={() => setReviewModalAssignmentId(assign.id)}
                      className="px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500 border border-amber-500/40 text-amber-200 hover:text-black font-semibold transition-all cursor-pointer"
                    >
                      Review & Grade
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenLmsForStudent(assign.studentId)}
                      className="text-[#6f8dff] hover:underline cursor-pointer"
                    >
                      Assign Related →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Submission Modal */}
      {reviewModalAssignmentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-[#0b0f2a] border border-[#2b3368] rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="font-baskerville text-lg font-bold text-white">
              Grade & Feedback for Student Submission
            </h3>
            <form onSubmit={handleGradeSubmission} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-[#8e96c8] uppercase mb-1">
                  Grade / Points Awarded
                </label>
                <input
                  type="text"
                  value={reviewGradeInput}
                  onChange={(e) => setReviewGradeInput(e.target.value)}
                  className="w-full bg-[#06081c] border border-[#1f2552] rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-[#8e96c8] uppercase mb-1">
                  Personalized Pedagogical Feedback
                </label>
                <textarea
                  value={reviewFeedbackInput}
                  onChange={(e) => setReviewFeedbackInput(e.target.value)}
                  rows={3}
                  className="w-full bg-[#06081c] border border-[#1f2552] rounded-xl p-3 text-xs text-white"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalAssignmentId(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-xs text-[#a4a9d0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#2dd4bf] text-black font-bold text-xs"
                >
                  Save Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 4: EMBEDDED STUDENT GROWTH TRACK
      ========================================================= */}
      {activeTab === 'growth-track' && (
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-[#ff6a2b]/10 border border-[#ff6a2b]/30 flex items-center justify-between text-xs text-[#ffb27a]">
            <span>
              Currently viewing in <strong>Faculty Advisory Context</strong>: 6-Axis Trajectories, Growth Maps, Student Success Scores, and Unified Data Sources.
            </span>
            <button
              onClick={() => setActiveTab('roster')}
              className="text-white hover:underline cursor-pointer font-semibold"
            >
              Back to Roster
            </button>
          </div>

          <StudentGrowthTrack
            onBackToLanding={() => setActiveTab('roster')}
            onOpenAuth={onOpenAuth}
            onNavigate={onNavigate}
          />
        </div>
      )}

      {/* =========================================================
          TAB 5: EMBEDDED SILENT STRUGGLE DETECTION
      ========================================================= */}
      {activeTab === 'silent-struggle' && (
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-gradient-to-r from-[#ff6a2b]/15 to-[#6f8dff]/15 border border-[rgba(140,150,255,0.3)] flex items-center justify-between text-xs text-[#c2d1ff]">
            <span>
              Faculty Early Signal Detection: Polar Divergence Compass, Signals Detected Grid, and Low-Friction Check-in dispatch.
            </span>
            <button
              onClick={() => setActiveTab('roster')}
              className="text-white hover:underline cursor-pointer font-semibold"
            >
              Back to Roster
            </button>
          </div>

          <SilentStruggleDetection
            onNavigate={onNavigate}
            onOpenAuth={onOpenAuth}
          />
        </div>
      )}

      {/* =========================================================
          TAB 6: FACULTY NOTES & INTERVENTION LOG
      ========================================================= */}
      {activeTab === 'notes-interventions' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Note Composer */}
          <div className="lg:col-span-1 rounded-2xl bg-[#0b0f2a] border border-[#222955] p-5 shadow-xl">
            <h3 className="font-baskerville text-lg font-bold text-white mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#ff6a2b]" />
              <span>Record Advisory Note</span>
            </h3>
            <p className="text-xs text-[#a4a9d0] mb-4">
              Log qualitative faculty observations, 1-on-1 discussion summaries, or follow-up intervention requests.
            </p>

            {noteSuccessBanner && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 font-mono flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{noteSuccessBanner}</span>
              </div>
            )}

            <form onSubmit={handleCreateNote} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-mono text-[#a4a9d0] uppercase mb-1">
                  Advisee / Student
                </label>
                <select
                  value={newNoteStudent}
                  onChange={(e) => setNewNoteStudent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#06081c] border border-[#1f2552] text-xs text-white focus:outline-none focus:border-[#ff6a2b]"
                >
                  {STUDENT_GROWTH_DATA.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.branch})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#a4a9d0] uppercase mb-1">
                  Observation Category
                </label>
                <select
                  value={newNoteCategory}
                  onChange={(e) => setNewNoteCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#06081c] border border-[#1f2552] text-xs text-white focus:outline-none focus:border-[#ff6a2b]"
                >
                  <option value="Academic">Academic Momentum</option>
                  <option value="Behavioral">Behavioral / Engagement Drift</option>
                  <option value="Career / Placement">Career & Placement Readiness</option>
                  <option value="Wellbeing">Wellbeing / Check-in Response</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#a4a9d0] uppercase mb-1">
                  Faculty Observation & Action
                </label>
                <textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Record summary of discussion, guidance provided, or next steps..."
                  rows={4}
                  className="w-full p-3 rounded-xl bg-[#06081c] border border-[#1f2552] text-xs text-white placeholder-[#a4a9d0]/60 focus:outline-none focus:border-[#ff6a2b]"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#ff6a2b] to-[#ff8c5a] hover:opacity-95 text-white text-xs font-semibold shadow-md shadow-[#ff6a2b]/25 transition-all cursor-pointer"
              >
                Log Faculty Note
              </button>
            </form>
          </div>

          {/* Notes Log List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-baskerville text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#ffb27a]" />
                <span>Recent Advisory Observations ({facultyNotes.length})</span>
              </h3>
            </div>

            <div className="space-y-3">
              {facultyNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 rounded-2xl bg-[#0b0f2a] border border-[#222955] hover:border-[#6f8dff]/40 transition-all space-y-2 shadow-lg"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-baskerville text-sm font-bold text-white">
                        {note.studentName}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-[#ffb27a]">
                        {note.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="text-[#a4a9d0]">{note.date}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold ${
                          note.status === 'Action Required'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : note.status === 'Followed Up'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {note.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#c2d1ff] leading-relaxed">
                    {note.content}
                  </p>

                  <div className="text-[10px] text-[#a4a9d0] font-mono pt-1">
                    Logged by: <span className="text-white">{note.author}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Action DM Modal */}
      <FacultyDmModal
        isOpen={isDmModalOpen}
        onClose={() => setIsDmModalOpen(false)}
        targetStudentId={dmTargetStudentId}
      />

      {/* Quick Action LMS Assign Modal */}
      <FacultyLmsAssignModal
        isOpen={isLmsModalOpen}
        onClose={() => setIsLmsModalOpen(false)}
        targetStudentId={lmsTargetStudentId}
      />

      {/* Explainable Risk & Early Signal Detail Modal */}
      <StudentRiskDetailModal
        isOpen={isRiskModalOpen}
        onClose={() => setIsRiskModalOpen(false)}
        riskProfile={getStudentRiskProfile(riskModalStudentId)}
        onOpenDm={() => handleOpenDmForStudent(riskModalStudentId)}
        onOpenLms={() => handleOpenLmsForStudent(riskModalStudentId)}
      />
    </div>
  );
};
