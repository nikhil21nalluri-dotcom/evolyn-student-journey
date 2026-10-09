import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useLms } from '../../context/LmsContext';
import { STUDENT_GROWTH_DATA, getStudentGrowthProfile } from '../../data/studentGrowthData';
import { getUnifiedStudentProfile } from '../../data/unifiedStudentData';
import { getStudentSuccessScore } from '../../data/studentSuccessScore';
import { getStudentRiskProfile } from '../../data/studentRiskEngine';
import { getStudentSegment } from '../../data/studentSegmentationEngine';
import { useIntervention } from '../../context/InterventionContext';
import { AiDecisionIntelligencePanel } from '../decision-intelligence/AiDecisionIntelligencePanel';
import { StudentSkillsPlacementView } from './StudentSkillsPlacementView';
import { CommunicationPracticeGrowth } from './CommunicationPracticeGrowth';
import {
  GraduationCap,
  Sparkles,
  Award,
  CheckCircle2,
  TrendingUp,
  Compass,
  BookOpen,
  Calendar,
  Clock,
  Laptop,
  Users,
  Mic,
  Briefcase,
  Layers,
  ArrowRight,
  Smile,
  Target,
  Plus,
  Check,
  Play,
  Heart,
  ChevronRight,
  MessageSquare,
  Send,
  FileText,
  Upload,
  ShieldCheck,
} from 'lucide-react';

interface StudentWorkspaceProps {
  onBackToLanding: () => void;
  onOpenAuth: () => void;
  onNavigate: (view: any) => void;
  initialTab?:
    | 'overview'
    | 'communication-growth'
    | 'skills-career'
    | 'decision-intelligence'
    | 'dms-care'
    | 'lms-coursework'
    | 'goals-practice';
  initialFluencisSubView?: 'coach' | 'rooms' | 'activities' | 'progress';
}

export const StudentWorkspace: React.FC<StudentWorkspaceProps> = ({
  onBackToLanding,
  onOpenAuth,
  onNavigate,
  initialTab,
  initialFluencisSubView,
}) => {
  const { user, userProfile } = useAuth();
  const { selectedStudentId, setSelectedStudentId, openRoleModal } = useWorkspace();
  const {
    getStudentMessages,
    getStudentAssignments,
    sendReply,
    submitAssignment,
  } = useLms();

  const {
    getStudentSupportPlan,
    updateStudentPlanProgress,
    getStudentInterventions,
  } = useIntervention();

  // Active student profile from unified dataset
  const currentStudentData = getStudentGrowthProfile(selectedStudentId);
  const unifiedProfile = getUnifiedStudentProfile(currentStudentData.id);
  const successScore = getStudentSuccessScore(currentStudentData.id);

  // Student active sub-tab
  const [activeStudentTab, setActiveStudentTab] = useState<
    'overview' | 'communication-growth' | 'skills-career' | 'decision-intelligence' | 'dms-care' | 'lms-coursework' | 'goals-practice'
  >(initialTab || 'overview');

  // Sub-view for Fluencis Communication Practice & Growth ('coach' | 'rooms' | 'activities' | 'progress')
  const [fluencisSubView, setFluencisSubView] = useState<'coach' | 'rooms' | 'activities' | 'progress'>(
    initialFluencisSubView || 'coach'
  );

  React.useEffect(() => {
    if (initialTab) {
      setActiveStudentTab(initialTab);
    }
  }, [initialTab]);

  React.useEffect(() => {
    if (initialFluencisSubView) {
      setFluencisSubView(initialFluencisSubView);
    }
  }, [initialFluencisSubView]);

  // LMS direct messages and assignments for current student
  const studentMessages = getStudentMessages(currentStudentData.id);
  const studentAssignments = getStudentAssignments(currentStudentData.id);

  // DM Reply state
  const [dmReplyInputs, setDmReplyInputs] = useState<{ [msgId: string]: string }>({});

  // LMS Submission modal/state
  const [activeSubmittingAssignmentId, setActiveSubmittingAssignmentId] = useState<string | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionSuccessToast, setSubmissionSuccessToast] = useState<string | null>(null);

  // Student Goals State (Interactive for the student)
  const [goals, setGoals] = useState<
    Array<{ id: string; title: string; category: string; completed: boolean; dueDate: string }>
  >([
    {
      id: 'g-1',
      title: 'Complete Graph Algorithms assignment with bonus test cases',
      category: 'Academic',
      completed: true,
      dueDate: 'This Week',
    },
    {
      id: 'g-2',
      title: 'Practice 15-minute impromptu technical presentation',
      category: 'Communication',
      completed: false,
      dueDate: 'Friday',
    },
    {
      id: 'g-3',
      title: 'Participate in the Campus Innovation Hackathon sprint',
      category: 'Engagement',
      completed: false,
      dueDate: 'Next Weekend',
    },
    {
      id: 'g-4',
      title: 'Review System Design fundamentals in the LMS repository',
      category: 'Technical',
      completed: false,
      dueDate: 'In 2 Weeks',
    },
  ]);

  const [newGoalText, setNewGoalText] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState('Academic');

  // Interactive Skill Practice State
  const [completedPractices, setCompletedPractices] = useState<Record<string, boolean>>({});
  const [activePracticeModal, setActivePracticeModal] = useState<string | null>(null);

  // Student Self-Reflection State
  const [studentMood, setStudentMood] = useState<'energized' | 'balanced' | 'seeking-guidance' | null>(null);
  const [reflectionFeedback, setReflectionFeedback] = useState<string | null>(null);

  const toggleGoal = (id: string) => {
    setGoals(
      goals.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g))
    );
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    const newG = {
      id: `g-${Date.now()}`,
      title: newGoalText.trim(),
      category: newGoalCategory,
      completed: false,
      dueDate: 'Next 7 Days',
    };
    setGoals([newG, ...goals]);
    setNewGoalText('');
  };

  const handleCompletePractice = (practiceId: string) => {
    setCompletedPractices((prev) => ({
      ...prev,
      [practiceId]: true,
    }));
    setActivePracticeModal(null);
  };

  const handlePulseReflection = (mood: 'energized' | 'balanced' | 'seeking-guidance') => {
    setStudentMood(mood);
    if (mood === 'energized') {
      setReflectionFeedback(
        'Fantastic energy! Channel this momentum into your placement prep and peer collaborations.'
      );
    } else if (mood === 'balanced') {
      setReflectionFeedback(
        'Consistent and steady wins the race. Your rhythm is well-paced for the semester.'
      );
    } else {
      setReflectionFeedback(
        'Thank you for sharing. We have highlighted supportive resources and your mentor is always just one click away.'
      );
    }
  };

  const handleSendReply = (msgId: string) => {
    const text = dmReplyInputs[msgId];
    if (!text || !text.trim()) return;

    const senderName = userProfile?.displayName || user?.displayName || currentStudentData.name;
    sendReply(msgId, text.trim(), 'student', senderName);
    setDmReplyInputs((prev) => ({ ...prev, [msgId]: '' }));
    setSubmissionSuccessToast('Reply sent to your faculty advisor!');
    setTimeout(() => setSubmissionSuccessToast(null), 3000);
  };

  const handleSubmitLmsWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubmittingAssignmentId || !submissionText.trim()) return;

    submitAssignment(activeSubmittingAssignmentId, submissionText.trim());
    setSubmissionSuccessToast('Assignment submitted successfully for faculty review!');
    setSubmissionText('');
    setActiveSubmittingAssignmentId(null);
    setTimeout(() => setSubmissionSuccessToast(null), 3500);
  };

  return (
    <div className="relative min-h-screen w-full pt-20 pb-24 px-4 sm:px-8 max-w-7xl mx-auto text-[#f0f1ff]">
      {/* Top Header & Persona Badge */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-[rgba(140,150,255,0.15)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0ea5e9] to-[#2dd4bf] flex items-center justify-center text-white shadow-md shadow-[#2dd4bf]/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-baskerville text-xl sm:text-2xl font-bold text-white">
                Student Workspace
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-[#2dd4bf]/20 border border-[#2dd4bf]/30 font-mono text-[10px] font-bold text-[#5eead4]">
                ROLE: LEARNER & DEVELOPER
              </span>
            </div>
            <p className="text-xs text-[#a4a9d0]">
              Your personal development cockpit: celebrate strengths, submit personalized coursework, and converse with your faculty advisor.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Student Profile Switcher (For demo/exploration) */}
          <div className="flex items-center gap-2 bg-[#0c1033] border border-[#222955] px-3 py-1.5 rounded-full text-xs shadow-md">
            <span className="text-[#a4a9d0] hidden sm:inline">Viewing Student:</span>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              {STUDENT_GROWTH_DATA.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#090b20] text-white">
                  {s.name} ({s.branch})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={openRoleModal}
            className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#c2d1ff] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-[#2dd4bf]" />
            <span>Switch Role</span>
          </button>
        </div>
      </div>

      {/* Clear Distinction between Demo Records and Authenticated Identity */}
      {!user ? (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#2dd4bf]/15 via-[#0ea5e9]/10 to-transparent border border-[#2dd4bf]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#2dd4bf] animate-pulse" />
            <span className="text-[#e2e8f0]">
              <strong>Demo Scenario Mode:</strong> Inspecting fictional student record <strong>{currentStudentData.name}</strong>. Fictional sample records are isolated from real live rooms.
            </span>
          </div>
          <button
            onClick={onOpenAuth}
            className="px-3.5 py-1.5 rounded-xl bg-[#2dd4bf] text-black font-bold hover:bg-[#5eead4] transition-colors cursor-pointer shrink-0 text-xs shadow-md shadow-[#2dd4bf]/20"
          >
            Sign In with Google / Email
          </button>
        </div>
      ) : (
        <div className="mb-6 p-3.5 rounded-2xl bg-[#090f28] border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Authenticated Student:</strong> {user.displayName || user.email} (ID: <code className="font-mono text-emerald-200">{user.uid.slice(0, 8)}...</code>). Live room presence and practice milestones are bound to your verified identity.
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
            Verified Session
          </span>
        </div>
      )}

      {/* Hero Welcome Card (Supportive & Developmental Tone) */}
      <div className="relative rounded-3xl p-6 sm:p-8 mb-6 overflow-hidden bg-gradient-to-r from-[#0c2438] via-[#09182b] to-[#071322] border border-[#2dd4bf]/30 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#2dd4bf]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2dd4bf]/15 border border-[#2dd4bf]/30 text-xs font-semibold text-[#5eead4]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personal Journey • {currentStudentData.course}</span>
            </div>
            <h2 className="font-baskerville text-2xl sm:text-3xl font-bold text-white">
              Welcome back, {currentStudentData.name}
            </h2>
            <p className="text-xs sm:text-sm text-[#c2d1ff] leading-relaxed">
              Every milestone counts. You are currently in <strong>{currentStudentData.currentSemester}</strong> in the {currentStudentData.branch} program.
              Your commitment to academic consistency is creating powerful foundational skills for your future.
            </p>
          </div>

          {/* Student Success Score Display */}
          <div className="flex items-center gap-5 p-4 sm:p-5 rounded-2xl bg-[#06081c]/90 border border-[#2dd4bf]/30 backdrop-blur-md shadow-xl">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/10"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#2dd4bf]"
                  strokeDasharray={`${successScore.currentScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="font-mono text-xl font-bold text-white leading-none">
                  {successScore.currentScore}
                </span>
                <span className="block text-[9px] text-[#a4a9d0] font-mono">/ 100</span>
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wider text-[#a4a9d0] font-semibold">
                Student Success Score
              </div>
              <div className="font-bold text-white text-base">
                {successScore.indicatorLabel}
              </div>
              <div className="text-[11px] text-emerald-400 mt-0.5 flex items-center gap-1 font-mono">
                <TrendingUp className="w-3 h-3" />
                <span>Steady Positive Momentum</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs for Student */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0b0f2a] backdrop-blur-md border border-[rgba(140,150,255,0.2)] mb-8 overflow-x-auto shadow-lg">
        <button
          onClick={() => setActiveStudentTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeStudentTab === 'overview'
              ? 'bg-[#2dd4bf] text-black shadow-md shadow-[#2dd4bf]/25 font-bold'
              : 'text-[#a4a9d0] hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>My Development & Strengths</span>
        </button>

        {/* Dedicated Communication Practice & Growth Navigation Tab (Fluencis Native Integration) */}
        <button
          onClick={() => {
            setActiveStudentTab('communication-growth');
            setFluencisSubView('coach');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeStudentTab === 'communication-growth'
              ? 'bg-gradient-to-r from-[#2dd4bf] to-[#38bdf8] text-slate-950 shadow-md shadow-[#2dd4bf]/25 font-bold'
              : 'text-[#a4a9d0] hover:text-white hover:bg-white/5 border border-transparent hover:border-[#2dd4bf]/30'
          }`}
        >
          <Mic className="w-4 h-4 text-emerald-400" />
          <span>Communication Practice &amp; Growth</span>
          <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px] text-emerald-300 font-mono">
            Fluencis
          </span>
        </button>

        <button
          onClick={() => setActiveStudentTab('skills-career')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeStudentTab === 'skills-career'
              ? 'bg-[#2dd4bf] text-black shadow-md shadow-[#2dd4bf]/25 font-bold'
              : 'text-[#a4a9d0] hover:text-white hover:bg-white/5'
          }`}
        >
          <Briefcase className="w-4 h-4 text-[#2dd4bf]" />
          <span>My Skills & Career Growth</span>
        </button>

        <button
          onClick={() => setActiveStudentTab('decision-intelligence')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeStudentTab === 'decision-intelligence'
              ? 'bg-gradient-to-r from-[#2dd4bf] to-[#0ea5e9] text-black shadow-md shadow-[#2dd4bf]/25 font-bold'
              : 'text-[#a4a9d0] hover:text-white hover:bg-white/5'
          }`}
        >
          <Compass className="w-4 h-4 text-[#5eead4]" />
          <span>AI Decision Intelligence Platform</span>
        </button>

        <button
          onClick={() => setActiveStudentTab('dms-care')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeStudentTab === 'dms-care'
              ? 'bg-[#2dd4bf] text-black shadow-md shadow-[#2dd4bf]/25 font-bold'
              : 'text-[#a4a9d0] hover:text-white hover:bg-white/5'
          }`}
        >
          <Heart className="w-4 h-4 text-rose-400" />
          <span>Advisor Messages & Care ({studentMessages.length})</span>
        </button>

        <button
          onClick={() => setActiveStudentTab('lms-coursework')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeStudentTab === 'lms-coursework'
              ? 'bg-[#2dd4bf] text-black shadow-md shadow-[#2dd4bf]/25 font-bold'
              : 'text-[#a4a9d0] hover:text-white hover:bg-white/5'
          }`}
        >
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span>My LMS Tasks & Coursework ({studentAssignments.length})</span>
        </button>

        <button
          onClick={() => setActiveStudentTab('goals-practice')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeStudentTab === 'goals-practice'
              ? 'bg-[#2dd4bf] text-black shadow-md shadow-[#2dd4bf]/25 font-bold'
              : 'text-[#a4a9d0] hover:text-white hover:bg-white/5'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Semester Goals & Practice</span>
        </button>
      </div>

      {submissionSuccessToast && (
        <div className="mb-6 p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs text-emerald-300 font-mono flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{submissionSuccessToast}</span>
        </div>
      )}

      {/* =========================================================
          TAB A: OVERVIEW & DEVELOPMENT
      ========================================================= */}
      {activeStudentTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* =========================================================
                PROMINENT FLUENCIS INTEGRATION HERO CARD: COMMUNICATION PRACTICE & GROWTH
            ========================================================= */}
            <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#0c1a36] via-[#09152b] to-[#070e1e] border-2 border-[#2dd4bf]/60 shadow-2xl relative overflow-hidden text-[#f0f1ff]">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#2dd4bf]/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0d9488] to-[#2dd4bf] flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-[#2dd4bf]/30">
                      <Mic className="w-5 h-5 text-slate-950" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#2dd4bf]/15 text-[#5eead4] font-mono text-[10px] font-bold border border-[#2dd4bf]/30 mb-0.5">
                        <Sparkles className="w-3 h-3 text-[#2dd4bf]" />
                        <span>FLUENCIS INTEGRATED WORKSPACE</span>
                      </div>
                      <h3 className="font-baskerville text-lg sm:text-xl font-bold text-white tracking-tight">
                        Communication Practice &amp; Career Growth
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveStudentTab('communication-growth');
                      setFluencisSubView('coach');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#2dd4bf] hover:bg-[#14b8a6] text-black font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#2dd4bf]/20 w-fit"
                  >
                    <span>Open Full Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-[#cbd5e1] leading-relaxed">
                  Practice oral technical presentations, simulate campus placement interview rounds, join live peer speaking rooms, and receive structured pedagogical feedback from the Evolyn AI Coach.
                </p>

                {/* 4 Direct Access Feature Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <button
                    onClick={() => {
                      setActiveStudentTab('communication-growth');
                      setFluencisSubView('coach');
                    }}
                    className="p-3.5 rounded-2xl bg-[#0b122c]/90 border border-[#2dd4bf]/30 hover:border-[#2dd4bf] hover:bg-[#131d45] transition-all text-left cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#2dd4bf]/15 flex items-center justify-center text-[#5eead4] mb-2 group-hover:scale-110 transition-transform">
                      <Sparkles className="w-4 h-4 text-[#2dd4bf]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Evolyn AI Coach</div>
                      <div className="text-[10px] text-[#9aa2d4] mt-0.5">Interactive Chat &amp; STAR Prep</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveStudentTab('communication-growth');
                      setFluencisSubView('rooms');
                    }}
                    className="p-3.5 rounded-2xl bg-[#0b122c]/90 border border-[#2dd4bf]/30 hover:border-[#2dd4bf] hover:bg-[#131d45] transition-all text-left cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#2dd4bf]/15 flex items-center justify-center text-[#5eead4] mb-2 group-hover:scale-110 transition-transform">
                      <Users className="w-4 h-4 text-[#2dd4bf]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Live Practice Rooms</div>
                      <div className="text-[10px] text-[#9aa2d4] mt-0.5">Peer Voice &amp; Video Pods</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveStudentTab('communication-growth');
                      setFluencisSubView('activities');
                    }}
                    className="p-3.5 rounded-2xl bg-[#0b122c]/90 border border-[#2dd4bf]/30 hover:border-[#2dd4bf] hover:bg-[#131d45] transition-all text-left cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#2dd4bf]/15 flex items-center justify-center text-[#5eead4] mb-2 group-hover:scale-110 transition-transform">
                      <Play className="w-4 h-4 text-[#2dd4bf]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">6 Practice Categories</div>
                      <div className="text-[10px] text-[#9aa2d4] mt-0.5">Speaking, Debates &amp; Panels</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveStudentTab('communication-growth');
                      setFluencisSubView('progress');
                    }}
                    className="p-3.5 rounded-2xl bg-[#0b122c]/90 border border-[#2dd4bf]/30 hover:border-[#2dd4bf] hover:bg-[#131d45] transition-all text-left cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#2dd4bf]/15 flex items-center justify-center text-[#5eead4] mb-2 group-hover:scale-110 transition-transform">
                      <Award className="w-4 h-4 text-[#2dd4bf]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">My Practice Progress</div>
                      <div className="text-[10px] text-[#9aa2d4] mt-0.5">Milestones &amp; Reflections</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* =========================================================
                SECTION 9: YOUR CURRENT SUPPORT PLAN (DEVELOPMENTAL & ENCOURAGING)
            ========================================================= */}
            {(() => {
              const studentPlan = getStudentSupportPlan(currentStudentData.id);
              const defaultFocus = 'Placement Readiness';
              const focusName = studentPlan?.primaryFocus || defaultFocus;

              // Fallback default actions if no custom plan exists yet
              const displayActions = studentPlan?.actionItems || [
                {
                  id: 'default-comm',
                  title: 'Communication Practice',
                  totalSessions: 2,
                  completedSessions: 1,
                  iconType: 'communication' as const,
                  completedFlag: false,
                },
                {
                  id: 'default-mock',
                  title: 'Mock Interview',
                  totalSessions: 1,
                  completedSessions: 0,
                  iconType: 'interview' as const,
                  completedFlag: false,
                },
                {
                  id: 'default-code',
                  title: 'Coding Practice',
                  totalSessions: 3,
                  completedSessions: 1,
                  iconType: 'coding' as const,
                  completedFlag: false,
                },
              ];

              return (
                <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#0c1a36] via-[#09152b] to-[#070e1e] border border-[#2dd4bf]/40 shadow-2xl relative overflow-hidden text-[#f0f1ff]">
                  <div className="absolute top-0 right-0 w-72 h-72 bg-[#2dd4bf]/10 rounded-full blur-3xl pointer-events-none" />

                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-white/10 relative z-10">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2dd4bf]/15 border border-[#2dd4bf]/30 text-xs font-mono font-bold text-[#5eead4] mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-[#2dd4bf]" />
                        <span>PERSONAL DEVELOPMENT BLUEPRINT</span>
                      </div>
                      <h3 className="font-baskerville text-xl sm:text-2xl font-bold text-white tracking-tight">
                        YOUR CURRENT SUPPORT PLAN
                      </h3>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[11px] font-mono uppercase text-[#a4a9d0] block">
                        Focus:
                      </span>
                      <span className="text-sm font-bold text-[#5eead4] font-mono">
                        {focusName}
                      </span>
                    </div>
                  </div>

                  {/* Encouraging Language Notice */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 mb-5 relative z-10">
                    <p className="text-xs sm:text-sm text-[#cbd5e1] leading-relaxed">
                      "Your faculty has recommended these activities to support your current development goals."
                    </p>
                  </div>

                  {/* This Week Prescribed Activities & Status */}
                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase font-bold tracking-wider text-[#93c5fd]">
                        This week's recommended activities:
                      </span>
                      <span className="text-[11px] font-mono text-[#a4a9d0]">
                        Track & practice at your own pace
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {displayActions.map((act) => {
                        const iconEmoji =
                          act.iconType === 'communication'
                            ? '🎤'
                            : act.iconType === 'interview'
                            ? '💼'
                            : act.iconType === 'coding'
                            ? '📚'
                            : '🤝';

                        const isDone = act.completedSessions >= act.totalSessions;

                        return (
                          <div
                            key={act.id}
                            className="p-4 rounded-2xl bg-[#070e24] border border-[#1b2552] hover:border-[#2dd4bf]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
                          >
                            <div className="flex items-center gap-3.5">
                              <span className="text-2xl shrink-0">{iconEmoji}</span>
                              <div>
                                <h4 className="font-bold text-sm text-white">{act.title}</h4>
                                <span className="text-xs text-[#a4a9d0]">
                                  {act.totalSessions} {act.totalSessions === 1 ? 'session' : 'sessions'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3 font-mono text-xs">
                              {/* Status Display: e.g. 1 / 2 completed */}
                              <div className="text-left sm:text-right">
                                <span className="text-[10px] text-[#8692c8] uppercase block">
                                  Status:
                                </span>
                                <span
                                  className={`font-bold ${
                                    isDone ? 'text-[#34d399]' : 'text-[#5eead4]'
                                  }`}
                                >
                                  {act.completedSessions} / {act.totalSessions} completed
                                </span>
                              </div>

                              <button
                                onClick={() => {
                                  if (studentPlan) {
                                    updateStudentPlanProgress(studentPlan.id, act.id);
                                    setSubmissionSuccessToast(
                                      `Session recorded for ${act.title}! Excellent progress.`
                                    );
                                    setTimeout(() => setSubmissionSuccessToast(null), 3500);
                                  } else {
                                    setSubmissionSuccessToast(
                                      `Session completed for ${act.title}!`
                                    );
                                    setTimeout(() => setSubmissionSuccessToast(null), 3500);
                                  }
                                }}
                                disabled={isDone}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                                  isDone
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                                    : 'bg-[#2dd4bf] hover:bg-[#38e8d0] text-black shadow-md shadow-[#2dd4bf]/20'
                                }`}
                              >
                                {isDone ? '✓ Completed' : 'Log Practice'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Positive Student Development Profile (Segmentation) Card */}
            {(() => {
              const seg = getStudentSegment(currentStudentData.id);
              return (
                <div className="p-6 rounded-2xl bg-[#0c1033] border border-[#222955] shadow-xl relative overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#6366f1]/20 border border-[#6366f1]/40 font-mono text-[10px] font-bold text-[#c7d2fe]">
                        YOUR CURRENT PROFILE
                      </span>
                      <h3 className="font-baskerville text-lg font-bold text-white">
                        {seg.segmentDef.studentFacingTitle}
                      </h3>
                    </div>

                    <div className="text-[11px] font-mono text-[#5eead4] flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{seg.segmentDef.shortLabel}</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#c2d1ff] leading-relaxed mb-4">
                    {seg.segmentDef.studentFacingDescription}
                  </p>

                  <div className="p-4 rounded-xl bg-[#06081c] border border-white/5">
                    <div className="text-[10px] uppercase font-mono tracking-wider text-[#ffb27a] font-bold mb-2">
                      Your Current Development Focus:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {seg.segmentDef.developmentFocus.map((f, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-lg bg-[#0c1033] border border-[#1f2552] text-xs text-[#f0f1ff] flex items-start gap-1.5 font-sans"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2dd4bf] shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Supportive Explainable Signals & Growth Guidance Card */}
            {(() => {
              const risk = getStudentRiskProfile(currentStudentData.id);
              return (
                <div className="p-5 rounded-2xl bg-[#0c1033] border border-[#222955] shadow-xl">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#2dd4bf]/20 text-[#5eead4] flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-baskerville text-base font-bold text-white">
                          Your Current Signals & Learning Rhythms
                        </h3>
                        <p className="text-[11px] text-[#8e96c8]">
                          Supportive guidance to keep your development trajectory strong
                        </p>
                      </div>
                    </div>

                    <div className="text-[11px] font-mono text-[#a4a9d0]">
                      Focus Guidance: <span className="text-white font-semibold">Self-Guided Progress</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#c2d1ff] mb-4 bg-[#06081c] p-3 rounded-xl border border-white/5 leading-relaxed">
                    "{risk.whyExplanation.supportiveStudentSummary}"
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {risk.signals.slice(0, 4).map((sig) => {
                      const isAttention = sig.trend === 'declining' || sig.severity !== 'LOW';
                      const isImproving = sig.trend === 'improving';
                      return (
                        <div
                          key={sig.id}
                          className="p-3 rounded-xl bg-[#06081c] border border-white/5 flex flex-col justify-between"
                        >
                          <div className="text-[11px] font-semibold text-white truncate">
                            {sig.name}
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <span
                              className={`text-[11px] font-mono font-bold ${
                                isAttention
                                  ? 'text-amber-400'
                                  : isImproving
                                  ? 'text-emerald-400'
                                  : 'text-[#8e96c8]'
                              }`}
                            >
                              {isAttention ? 'Needs attention' : isImproving ? 'Improving' : 'Stable'}
                            </span>
                            <span className="text-[10px] text-[#8e96c8] font-mono">
                              {sig.changeDisplay}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#1a2046] flex items-center justify-between text-[11px] text-[#8e96c8] font-mono">
                    <span>Small improvements in communication and placement activity strengthen overall progress.</span>
                    <button
                      onClick={() => setActiveStudentTab('dms-care')}
                      className="text-[#2dd4bf] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Connect with Faculty</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* 1. Strengths & Areas to Develop Cards (Solid cosmic styling like Priya Sharma's card) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* My Strengths Card */}
              <div className="p-5 rounded-2xl bg-[#0c1033] border border-emerald-500/40 shadow-xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-baskerville text-base font-bold text-white">
                      Your Strengths
                    </h3>
                    <div className="text-[10px] text-emerald-300">
                      Recognized achievements
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {currentStudentData.strengths.slice(0, 3).map((st, i) => (
                    <div key={i} className="p-3 rounded-xl bg-[#06081c] border border-white/5">
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <span>{st.title}</span>
                        <span className="font-mono text-[11px] text-emerald-400">{st.metric}</span>
                      </div>
                      <p className="text-[11px] text-[#a4a9d0] mt-1 leading-normal">
                        {st.evidence}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Areas to Develop Card */}
              <div className="p-5 rounded-2xl bg-[#0c1033] border border-cyan-500/40 shadow-xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-baskerville text-base font-bold text-white">
                      Areas to Develop
                    </h3>
                    <div className="text-[10px] text-cyan-300">
                      Growth opportunities
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {currentStudentData.attentionAreas.slice(0, 2).map((area, i) => (
                    <div key={i} className="p-3 rounded-xl bg-[#06081c] border border-white/5">
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <span>{area.title}</span>
                        <span className="text-[10px] text-cyan-300 font-medium">Growth Focus</span>
                      </div>
                      <p className="text-[11px] text-[#a4a9d0] mt-1 leading-normal">
                        {area.responsibleNote}
                      </p>
                    </div>
                  ))}

                  <div className="p-3 rounded-xl bg-[#06081c] border border-white/5">
                    <div className="flex items-center justify-between text-xs font-bold text-white">
                      <span>Collaborative Hackathons</span>
                      <span className="text-[10px] text-cyan-300 font-medium">Next Milestone</span>
                    </div>
                    <p className="text-[11px] text-[#a4a9d0] mt-1 leading-normal">
                      Joining a student hackathon sprint builds both technical confidence and peer network.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Seven Developmental Dimensions Overview */}
            <div className="p-6 rounded-2xl bg-[#0c1033] border border-[#222955] shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-baskerville text-lg font-bold text-white">
                    Your Progress Across 7 Dimensions
                  </h3>
                  <p className="text-xs text-[#a4a9d0]">
                    Balanced view of your academic, behavioral, and professional growth
                  </p>
                </div>
                <span className="text-xs font-mono text-[#5eead4] font-semibold">
                  Transparent Weights
                </span>
              </div>

              <div className="space-y-3.5">
                {successScore.dimensions.map((dim) => (
                  <div key={dim.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{dim.name}</span>
                        <span className="text-[10px] text-[#a4a9d0] font-mono">
                          ({dim.weightLabel})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#5eead4]">{dim.currentScore}</span>
                        <span className="text-[10px] text-[#a4a9d0]">/ 100</span>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#0ea5e9] to-[#2dd4bf] transition-all duration-500"
                        style={{ width: `${dim.currentScore}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Academic & Attendance Snapshot */}
            <div className="p-6 rounded-2xl bg-[#0c1033] border border-[#222955] shadow-xl">
              <h3 className="font-baskerville text-lg font-bold text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#2dd4bf]" />
                <span>Academic & Attendance Progress</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="p-3 rounded-xl bg-[#06081c] border border-white/5 text-center">
                  <div className="text-[10px] text-[#a4a9d0] uppercase font-semibold">Current CGPA</div>
                  <div className="font-mono text-xl font-bold text-white mt-1">
                    {unifiedProfile.academic.cgpa}
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">Distinction Track</div>
                </div>

                <div className="p-3 rounded-xl bg-[#06081c] border border-white/5 text-center">
                  <div className="text-[10px] text-[#a4a9d0] uppercase font-semibold">Marks Percentage</div>
                  <div className="font-mono text-xl font-bold text-white mt-1">
                    {unifiedProfile.academic.overallMarks}%
                  </div>
                  <div className="text-[10px] text-[#a4a9d0] mt-0.5">Evaluations avg</div>
                </div>

                <div className="p-3 rounded-xl bg-[#06081c] border border-white/5 text-center">
                  <div className="text-[10px] text-[#a4a9d0] uppercase font-semibold">Overall Attendance</div>
                  <div className="font-mono text-xl font-bold text-white mt-1">
                    {unifiedProfile.attendance.overallPercentage}%
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">Exceeds 75% policy</div>
                </div>

                <div className="p-3 rounded-xl bg-[#06081c] border border-white/5 text-center">
                  <div className="text-[10px] text-[#a4a9d0] uppercase font-semibold">Attendance Trend</div>
                  <div className="font-mono text-xl font-bold text-cyan-300 mt-1 capitalize">
                    {unifiedProfile.attendance.attendanceTrend}
                  </div>
                  <div className="text-[10px] text-cyan-300 mt-0.5">Consistent Rhythms</div>
                </div>
              </div>

              {/* Subject Breakdown */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-[#a4a9d0] uppercase tracking-wider mb-2">
                  Subject Mastery
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {unifiedProfile.academic.subjectPerformance.map((subj, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-[#06081c] border border-white/5 flex items-center justify-between"
                    >
                      <span className="text-xs text-white">{subj.name}</span>
                      <span className="font-mono text-xs font-bold text-[#5eead4]">{subj.score}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Quick Pulse & Advisor Snapshot */}
          <div className="space-y-6">
            {/* Daily Rhythm Self-Reflection */}
            <div className="p-5 rounded-2xl bg-[#0c1033] border border-[#222955] shadow-xl">
              <h4 className="font-baskerville text-base font-bold text-white mb-2 flex items-center gap-2">
                <Smile className="w-4 h-4 text-[#5eead4]" />
                <span>How are you feeling this week?</span>
              </h4>
              <p className="text-xs text-[#a4a9d0] mb-3">
                Checking in with yourself is a superpower. Select your current academic energy:
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handlePulseReflection('energized')}
                  className={`p-2 rounded-xl text-xs font-medium text-center transition-all cursor-pointer ${
                    studentMood === 'energized'
                      ? 'bg-emerald-500 text-black font-bold'
                      : 'bg-[#06081c] hover:bg-white/10 text-white border border-white/10'
                  }`}
                >
                  ⚡ Energized
                </button>
                <button
                  onClick={() => handlePulseReflection('balanced')}
                  className={`p-2 rounded-xl text-xs font-medium text-center transition-all cursor-pointer ${
                    studentMood === 'balanced'
                      ? 'bg-cyan-500 text-black font-bold'
                      : 'bg-[#06081c] hover:bg-white/10 text-white border border-white/10'
                  }`}
                >
                  🌿 Balanced
                </button>
                <button
                  onClick={() => handlePulseReflection('seeking-guidance')}
                  className={`p-2 rounded-xl text-xs font-medium text-center transition-all cursor-pointer ${
                    studentMood === 'seeking-guidance'
                      ? 'bg-[#ff6a2b] text-white font-bold'
                      : 'bg-[#06081c] hover:bg-white/10 text-white border border-white/10'
                  }`}
                >
                  💬 Seeking Help
                </button>
              </div>
              {reflectionFeedback && (
                <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-[#5eead4] animate-fadeIn">
                  {reflectionFeedback}
                </div>
              )}
            </div>

            {/* Recent Messages from Advisor Card */}
            <div className="p-5 rounded-2xl bg-[#0c1033] border border-[#222955] shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-rose-400" />
                  <h4 className="font-baskerville text-base font-bold text-white">
                    Faculty Advisor Care
                  </h4>
                </div>
                <button
                  onClick={() => setActiveStudentTab('dms-care')}
                  className="text-xs text-[#2dd4bf] hover:underline cursor-pointer"
                >
                  View All ({studentMessages.length}) →
                </button>
              </div>

              {studentMessages.length === 0 ? (
                <p className="text-xs text-[#8e96c8]">No active messages from advisor.</p>
              ) : (
                <div className="p-3.5 rounded-xl bg-[#06081c] border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{studentMessages[0].subject}</span>
                    <span className="text-[10px] text-[#8e96c8] font-mono">{studentMessages[0].timestamp}</span>
                  </div>
                  <p className="text-[11px] text-[#c2c8f0] line-clamp-2">
                    {studentMessages[0].message}
                  </p>
                  <button
                    onClick={() => setActiveStudentTab('dms-care')}
                    className="text-[11px] text-[#5eead4] hover:underline font-semibold"
                  >
                    Reply to {studentMessages[0].facultyName}
                  </button>
                </div>
              )}
            </div>

            {/* Pending LMS Tasks Card */}
            <div className="p-5 rounded-2xl bg-[#0c1033] border border-[#222955] shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <h4 className="font-baskerville text-base font-bold text-white">
                    Assigned LMS Work
                  </h4>
                </div>
                <button
                  onClick={() => setActiveStudentTab('lms-coursework')}
                  className="text-xs text-[#2dd4bf] hover:underline cursor-pointer"
                >
                  View Tasks ({studentAssignments.length}) →
                </button>
              </div>

              {studentAssignments.slice(0, 2).map((a) => (
                <div key={a.id} className="p-3 rounded-xl bg-[#06081c] border border-white/5 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{a.title}</span>
                    <span className="text-[10px] font-mono text-[#a4b8ff]">{a.points} pts</span>
                  </div>
                  <div className="text-[10px] text-[#8e96c8]">{a.course} • Due: {a.dueDate}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB: COMMUNICATION PRACTICE & GROWTH (FLUENCIS NATIVE INTEGRATION)
      ========================================================= */}
      {activeStudentTab === 'communication-growth' && (
        <CommunicationPracticeGrowth
          studentId={currentStudentData.id}
          studentName={currentStudentData.name}
          onNavigate={onNavigate}
          defaultSubView={fluencisSubView}
        />
      )}

      {/* =========================================================
          TAB: MY SKILLS & CAREER GROWTH (STEP 9)
      ========================================================= */}
      {activeStudentTab === 'skills-career' && (
        <StudentSkillsPlacementView
          studentId={currentStudentData.id}
          onNavigate={onNavigate}
        />
      )}

      {/* =========================================================
          TAB: AI DECISION INTELLIGENCE PLATFORM (STUDENT VIEW)
      ========================================================= */}
      {activeStudentTab === 'decision-intelligence' && (
        <AiDecisionIntelligencePanel
          initialStudentId={currentStudentData.id}
          mode="student"
        />
      )}

      {/* =========================================================
          TAB B: ADVISOR MESSAGES & PERSONAL CARE (STUDENT VIEW)
      ========================================================= */}
      {activeStudentTab === 'dms-care' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="p-5 rounded-2xl bg-[#0b0f2a] border border-[#222955] shadow-xl flex items-center justify-between">
            <div>
              <h3 className="font-baskerville text-xl font-bold text-white flex items-center space-x-2">
                <Heart className="w-5 h-5 text-rose-400" />
                <span>Direct Notes & Personal Care from Faculty</span>
              </h3>
              <p className="text-xs text-[#9aa2d4] mt-1">
                Your faculty advisors and mentors send tailored check-ins, study tips, and encouragement here.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs border border-emerald-500/30">
              {studentMessages.length} Messages in Thread
            </span>
          </div>

          {studentMessages.length === 0 ? (
            <div className="p-12 rounded-2xl bg-[#0c1033] border border-[#222955] text-center space-y-2">
              <p className="text-white text-base">You are all caught up!</p>
              <p className="text-xs text-[#8e96c8]">No active direct messages right now.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {studentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-5 rounded-2xl bg-[#0c1033] border border-[#222955] space-y-3 shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#ff6a2b]/20 border border-[#ff6a2b]/30 text-[10px] font-mono text-[#ffb27a]">
                          {msg.careCategory}
                        </span>
                        <h4 className="font-bold text-white text-base">{msg.subject}</h4>
                      </div>
                      <div className="text-xs text-[#8e96c8] font-mono mt-1">
                        From: <strong className="text-white">{msg.facultyName}</strong> ({msg.facultyRole})
                      </div>
                    </div>
                    <span className="text-[11px] text-[#8e96c8] font-mono">{msg.timestamp}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#06081c] border border-white/5 text-xs text-[#d1d5f5] leading-relaxed">
                    {msg.message}
                  </div>

                  {/* Replies Thread */}
                  {msg.replies && msg.replies.length > 0 && (
                    <div className="space-y-2 pl-4 border-l-2 border-[#2dd4bf]/50 mt-3">
                      {msg.replies.map((rep) => (
                        <div key={rep.id} className="p-3 rounded-xl bg-[#06081c]/70 border border-white/5 text-xs">
                          <div className="flex items-center justify-between text-[11px] text-[#8e96c8] font-mono">
                            <span className={rep.sender === 'student' ? 'text-[#2dd4bf] font-bold' : 'text-[#ffb27a] font-bold'}>
                              {rep.senderName} ({rep.sender === 'student' ? 'You' : 'Faculty Advisor'})
                            </span>
                            <span>{rep.timestamp}</span>
                          </div>
                          <p className="text-white mt-1 text-xs">{rep.text}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Student Reply Form */}
                  <div className="pt-2 flex items-center space-x-2">
                    <input
                      type="text"
                      value={dmReplyInputs[msg.id] || ''}
                      onChange={(e) =>
                        setDmReplyInputs((prev) => ({ ...prev, [msg.id]: e.target.value }))
                      }
                      placeholder={`Reply to ${msg.facultyName}...`}
                      className="flex-1 bg-[#06081c] border border-[#1f2552] rounded-xl px-3 py-2 text-xs text-white placeholder-[#5a6296] focus:outline-none focus:border-[#2dd4bf]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSendReply(msg.id);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleSendReply(msg.id)}
                      className="px-4 py-2 rounded-xl bg-[#2dd4bf] hover:bg-[#14b8a6] text-black font-bold text-xs transition-colors cursor-pointer flex items-center space-x-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Reply</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          TAB C: PERSONALIZED LMS TASKS & COURSEWORK (STUDENT VIEW)
      ========================================================= */}
      {activeStudentTab === 'lms-coursework' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-[#0b0f2a] border border-[#222955] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-baskerville text-xl font-bold text-white flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <span>Personalized Coursework & Learning Modules</span>
              </h3>
              <p className="text-xs text-[#9aa2d4] mt-1">
                Tasks assigned specifically to you by your instructors with individualized guidance notes.
              </p>
            </div>
            <div className="font-mono text-xs text-[#5eead4]">
              {studentAssignments.filter((a) => a.status === 'Reviewed').length} of {studentAssignments.length} Completed
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {studentAssignments.map((assign) => (
              <div
                key={assign.id}
                className="p-5 rounded-2xl bg-[#0c1033] border border-[#222955] shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#6f8dff]/20 border border-[#6f8dff]/30 text-[10px] font-mono text-[#a4b8ff]">
                      {assign.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                        assign.status === 'Reviewed'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : assign.status === 'Submitted'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
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

                  <p className="text-xs text-[#c2c8f0] leading-relaxed mb-3 line-clamp-3">
                    {assign.description}
                  </p>

                  {/* Faculty Personal Care Note */}
                  {assign.personalCareNote && (
                    <div className="p-3 rounded-xl bg-[#ff6a2b]/10 border border-[#ff6a2b]/30 text-xs text-[#ffb27a] mb-3 flex items-start space-x-2">
                      <Heart className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#ff8a50]" />
                      <div>
                        <span className="font-semibold block text-[11px]">Instructor Caring Note:</span>
                        <span className="text-[11px]">"{assign.personalCareNote}"</span>
                      </div>
                    </div>
                  )}

                  {/* Submission and Grade */}
                  {assign.submission && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 mb-3 space-y-1">
                      <div className="font-bold">Your Submission:</div>
                      <p className="text-[11px] text-white">{assign.submission.text}</p>
                      {assign.submission.grade && (
                        <div className="text-[11px] text-emerald-400 font-mono font-bold mt-1">
                          Grade: {assign.submission.grade}
                        </div>
                      )}
                      {assign.submission.feedback && (
                        <div className="text-[11px] text-[#9aa2d4] mt-0.5">
                          Feedback: "{assign.submission.feedback}"
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#1f2552] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[#8e96c8] font-mono">Due: {assign.dueDate}</span>
                  {assign.status === 'Assigned' || assign.status === 'In Progress' ? (
                    <button
                      onClick={() => setActiveSubmittingAssignmentId(assign.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#2dd4bf] hover:bg-[#14b8a6] text-black font-bold text-xs transition-colors cursor-pointer flex items-center space-x-1"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Submit Solution</span>
                    </button>
                  ) : (
                    <span className="text-emerald-400 font-mono text-[11px]">Submitted</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submission Modal */}
      {activeSubmittingAssignmentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-[#0b0f2a] border border-[#2b3368] rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="font-baskerville text-lg font-bold text-white">
              Submit Coursework Solution
            </h3>
            <p className="text-xs text-[#9aa2d4]">
              Provide your explanation, code repository link, or submission notes below.
            </p>
            <form onSubmit={handleSubmitLmsWork} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-[#8e96c8] uppercase mb-1">
                  Submission Summary & Solution
                </label>
                <textarea
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  rows={4}
                  placeholder="e.g. Completed all test cases. Code available on campus git: repo/priya_assign4.py"
                  className="w-full bg-[#06081c] border border-[#1f2552] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#2dd4bf]"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveSubmittingAssignmentId(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-xs text-[#a4a9d0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#2dd4bf] text-black font-bold text-xs cursor-pointer"
                >
                  Confirm Submission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB D: GOALS & PRACTICE
      ========================================================= */}
      {activeStudentTab === 'goals-practice' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Goals */}
          <div className="p-6 rounded-2xl bg-[#0c1033] border border-[#222955] shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-baskerville text-lg font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-[#5eead4]" />
                <span>My Active Semester Goals</span>
              </h3>
              <span className="text-xs font-mono text-[#a4a9d0]">
                {goals.filter((g) => g.completed).length}/{goals.length} Completed
              </span>
            </div>

            <div className="space-y-2.5">
              {goals.map((goal) => (
                <div
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                    goal.completed
                      ? 'bg-[#06081c]/60 border-emerald-500/30 text-[#8e96c8]'
                      : 'bg-[#06081c] border-white/10 hover:border-[#2dd4bf]/50 text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        goal.completed
                          ? 'bg-emerald-500 border-emerald-500 text-black'
                          : 'border-white/20'
                      }`}
                    >
                      {goal.completed && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className={`text-xs ${goal.completed ? 'line-through text-[#6b73a6]' : ''}`}>
                      {goal.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#a4a9d0]">{goal.dueDate}</span>
                </div>
              ))}
            </div>

            {/* Add Goal Form */}
            <form onSubmit={handleAddGoal} className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Add a new milestone or developmental goal..."
                value={newGoalText}
                onChange={(e) => setNewGoalText(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-[#06081c] border border-white/10 text-xs text-white focus:outline-none focus:border-[#2dd4bf]"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#2dd4bf] hover:bg-[#14b8a6] text-black font-bold text-xs transition-colors cursor-pointer"
              >
                Add Goal
              </button>
            </form>
          </div>

          {/* Interactive Skill Practice */}
          <div className="p-6 rounded-2xl bg-[#0c1033] border border-[#222955] shadow-xl space-y-4">
            <h3 className="font-baskerville text-lg font-bold text-white flex items-center gap-2">
              <Mic className="w-5 h-5 text-[#2dd4bf]" />
              <span>Skill & Communication Practice Labs</span>
            </h3>
            <p className="text-xs text-[#a4a9d0]">
              Low-friction micro-challenges designed to strengthen your placement readiness and technical dialogue.
            </p>

            <div className="space-y-3">
              {[
                {
                  id: 'p-1',
                  title: '60-Second Elevator Pitch: Technical Project',
                  category: 'Oral Communication',
                  duration: '5 Mins',
                },
                {
                  id: 'p-2',
                  title: 'Explaining Recursion vs Iteration to a Junior',
                  category: 'Conceptual Clarity',
                  duration: '8 Mins',
                },
                {
                  id: 'p-3',
                  title: 'Mock Behavioral Question: Handling Project Conflicts',
                  category: 'Interpersonal',
                  duration: '6 Mins',
                },
              ].map((prac) => {
                const isDone = completedPractices[prac.id];
                return (
                  <div
                    key={prac.id}
                    className="p-3.5 rounded-xl bg-[#06081c] border border-white/5 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{prac.title}</div>
                      <div className="text-[10px] text-[#8e96c8] font-mono">
                        {prac.category} • {prac.duration}
                      </div>
                    </div>
                    {isDone ? (
                      <span className="text-emerald-400 text-xs font-mono flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Done
                      </span>
                    ) : (
                      <button
                        onClick={() => handleCompletePractice(prac.id)}
                        className="px-3 py-1 rounded-xl bg-white/10 hover:bg-[#2dd4bf] hover:text-black text-xs font-semibold text-white transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Play className="w-3 h-3" />
                        <span>Practice</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
