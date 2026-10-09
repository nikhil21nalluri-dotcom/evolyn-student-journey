import React, { useState } from 'react';
import {
  Mic,
  Award,
  BookOpen,
  Briefcase,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Play,
  FileText,
  AlertCircle,
  HelpCircle,
  Info,
  Target,
  ChevronRight,
  ShieldCheck,
  Code,
  Calendar,
  Layers,
  History,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useSkillsPlacement } from '../../context/SkillsPlacementContext';
import { FluencisPracticeModal } from './FluencisPracticeModal';
import { CuratedPracticeChallenge } from '../../data/skillsPlacementEngine';

interface StudentSkillsPlacementViewProps {
  studentId: string;
  onNavigate?: (view: any) => void;
}

export const StudentSkillsPlacementView: React.FC<StudentSkillsPlacementViewProps> = ({
  studentId,
  onNavigate,
}) => {
  const {
    getStudentOverview,
    challenges,
    recordPracticeCompletion,
  } = useSkillsPlacement();

  const overview = getStudentOverview(studentId);
  const [activePracticeChallenge, setActivePracticeChallenge] = useState<CuratedPracticeChallenge | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<
    'communication' | 'technical' | 'career-placement' | 'development-history' | 'practice-labs'
  >('communication');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handlePracticeFinished = (data: any) => {
    recordPracticeCompletion(data);
    setToastMessage(`Completed practice activity: "${data.title}"! Milestone saved.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const indicator = overview.placementReadinessIndicator;

  return (
    <div className="space-y-8 animate-fadeIn text-[#f0f1ff]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs text-emerald-300 font-mono flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner: Student-Facing Growth & Placement Readiness */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#0c1a36] via-[#09152b] to-[#070e1e] border border-[#2dd4bf]/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#2dd4bf]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2dd4bf]/15 border border-[#2dd4bf]/30 text-xs font-mono font-bold text-[#5eead4] mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#2dd4bf]" />
              <span>SKILLS & CAREER GROWTH INTELLIGENCE</span>
            </div>
            <h2 className="font-baskerville text-2xl sm:text-3xl font-bold text-white tracking-tight">
              My Skills & Career Growth
            </h2>
            <p className="text-xs sm:text-sm text-[#cbd5e1] mt-1 max-w-2xl">
              Track your assessed communication, technical proficiencies, and campus placement readiness. Practice at your own pace with Fluencis challenges.
            </p>
          </div>

          {/* Transparent Placement Readiness Summary */}
          <div className="flex flex-col items-start sm:items-end gap-1.5 font-mono">
            <span className="text-[10px] uppercase text-[#a4a9d0] tracking-wider">Placement Readiness Indicator</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-white font-mono">
                {indicator.score !== undefined ? `${indicator.score}/100` : 'Not assessed yet'}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-[#2dd4bf]/15 border border-[#2dd4bf]/35 text-[#5eead4] text-xs font-bold">
                {indicator.statusLabel}
              </span>
            </div>
            <div className="text-[10px] text-[#8e96c8] flex items-center gap-1.5">
              <span>Data Completeness:</span>
              <span className="text-[#5eead4] font-bold">{indicator.dataCompleteness.percentage}%</span>
              <span>({indicator.dataCompleteness.assessedCount}/{indicator.dataCompleteness.totalDimensions} dimensions)</span>
            </div>
          </div>
        </div>

        {/* Data Completeness Bar */}
        <div className="mt-4 relative z-10">
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#2dd4bf] to-[#0ea5e9] rounded-full transition-all duration-700"
              style={{ width: `${indicator.dataCompleteness.percentage}%` }}
            />
          </div>
        </div>

        {/* Supportive Next Opportunity Callout */}
        <div className="mt-5 p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2dd4bf]/20 border border-[#2dd4bf]/40 flex items-center justify-center text-[#2dd4bf] shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Your Next Recommended Growth Opportunity</div>
              <p className="text-xs text-[#cbd5e1] mt-0.5">
                {overview.developmentRecommendations[0]?.recommendation ||
                  'Your next growth opportunity is interview communication. Complete a short practice activity and review your progress.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              const targetChallenge =
                challenges.find((c) => c.category === 'mock-interview' || c.category === 'speaking') ||
                challenges[0];
              setActivePracticeChallenge(targetChallenge);
            }}
            className="px-4 py-2 rounded-xl bg-[#2dd4bf] hover:bg-[#14b8a6] text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-[#2dd4bf]/25 cursor-pointer shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Practice Lab</span>
          </button>
        </div>

        {/* Responsible Disclaimer */}
        <div className="mt-3 text-[10px] text-[#8e96c8] font-mono flex items-center gap-1.5 relative z-10">
          <Info className="w-3.5 h-3.5 text-[#5eead4] shrink-0" />
          <span>{indicator.disclaimer}</span>
        </div>
      </div>

      {/* Quick Launch Banner to Fluencis Communication Practice & Growth Workspace */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0c1a36] via-[#09152b] to-[#070e1e] border-2 border-[#2dd4bf]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2dd4bf]/20 border border-[#2dd4bf]/40 flex items-center justify-center text-[#2dd4bf] shrink-0">
            <Mic className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xs sm:text-sm">Fluencis Communication Practice &amp; Growth Workspace</span>
              <span className="px-2 py-0.5 rounded-full bg-[#2dd4bf]/20 text-[#5eead4] font-mono text-[9px] font-bold">
                NATIVE INTEGRATION
              </span>
            </div>
            <p className="text-xs text-[#a4a9d0] mt-0.5">
              Access real-time Evolyn AI Coach, participate in live practice rooms, and practice 6 communication categories.
            </p>
          </div>
        </div>

        {onNavigate && (
          <button
            onClick={() => onNavigate('communication-practice')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2dd4bf] to-[#38bdf8] text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-[#2dd4bf]/25 hover:brightness-110 cursor-pointer shrink-0"
          >
            <span>Open Practice Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Sub Navigation */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0b0f2a] border border-[rgba(140,150,255,0.2)] overflow-x-auto shadow-lg">
        <button
          onClick={() => setActiveSubTab('communication')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'communication'
              ? 'bg-[#2dd4bf] text-black shadow-md shadow-[#2dd4bf]/25 font-bold'
              : 'text-[#a4a9d0] hover:text-white hover:bg-white/5'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>A. Communication Skills (Fluencis)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('technical')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'technical'
              ? 'bg-[#2dd4bf] text-black shadow-md shadow-[#2dd4bf]/25 font-bold'
              : 'text-[#a4a9d0] hover:text-white hover:bg-white/5'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>B. Technical Skills</span>
        </button>

        <button
          onClick={() => setActiveSubTab('career-placement')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'career-placement'
              ? 'bg-[#2dd4bf] text-black shadow-md shadow-[#2dd4bf]/25 font-bold'
              : 'text-[#a4a9d0] hover:text-white hover:bg-white/5'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>C. Career Readiness</span>
        </button>

        <button
          onClick={() => setActiveSubTab('development-history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'development-history'
              ? 'bg-[#2dd4bf] text-black shadow-md shadow-[#2dd4bf]/25 font-bold'
              : 'text-[#a4a9d0] hover:text-white hover:bg-white/5'
          }`}
        >
          <History className="w-4 h-4" />
          <span>D. Development History & Skill Gaps</span>
        </button>

        <button
          onClick={() => setActiveSubTab('practice-labs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'practice-labs'
              ? 'bg-[#2dd4bf] text-black shadow-md shadow-[#2dd4bf]/25 font-bold'
              : 'text-[#a4a9d0] hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>E. Practice Labs & Challenges ({challenges.length})</span>
        </button>
      </div>

      {/* =========================================================
          AREA A: COMMUNICATION SKILLS
      ========================================================= */}
      {activeSubTab === 'communication' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 rounded-2xl bg-[#0c1033] border border-[#222955]">
              <span className="text-[10px] font-mono text-[#8e96c8] uppercase block">Speaking Confidence</span>
              <div className="text-xl font-black text-white font-mono mt-1">
                {overview.communication.speakingConfidence !== undefined
                  ? `${overview.communication.speakingConfidence}/100`
                  : 'Not assessed yet'}
              </div>
              <div className="text-[10px] text-[#a4a9d0] mt-1">Impromptu oral clarity</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0c1033] border border-[#222955]">
              <span className="text-[10px] font-mono text-[#8e96c8] uppercase block">Verbal Communication</span>
              <div className="text-xl font-black text-white font-mono mt-1">
                {overview.communication.verbalCommunication !== undefined
                  ? `${overview.communication.verbalCommunication}/100`
                  : 'Not assessed yet'}
              </div>
              <div className="text-[10px] text-[#a4a9d0] mt-1">Fluencis benchmark</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0c1033] border border-[#222955]">
              <span className="text-[10px] font-mono text-[#8e96c8] uppercase block">Presentation Skills</span>
              <div className="text-xl font-black text-white font-mono mt-1">
                {overview.communication.presentationSkills !== undefined
                  ? `${overview.communication.presentationSkills}/100`
                  : 'Not assessed yet'}
              </div>
              <div className="text-[10px] text-[#a4a9d0] mt-1">Keynote & slides</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0c1033] border border-[#222955]">
              <span className="text-[10px] font-mono text-[#8e96c8] uppercase block">Interview Communication</span>
              <div className="text-xl font-black text-white font-mono mt-1">
                {overview.communication.interviewCommunication !== undefined
                  ? `${overview.communication.interviewCommunication}/100`
                  : 'Not assessed yet'}
              </div>
              <div className="text-[10px] text-[#a4a9d0] mt-1">Mock behavioral response</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0c1033] border border-[#222955]">
              <span className="text-[10px] font-mono text-[#8e96c8] uppercase block">Discussion Participation</span>
              <div className="text-xl font-black text-white font-mono mt-1">
                {overview.communication.discussionParticipation !== undefined
                  ? `${overview.communication.discussionParticipation}/100`
                  : 'Not assessed yet'}
              </div>
              <div className="text-[10px] text-[#a4a9d0] mt-1">Cohort group dialogue</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0c1033] border border-[#222955]">
              <span className="text-[10px] font-mono text-[#8e96c8] uppercase block">Practice Frequency</span>
              <div className="text-xl font-black text-[#5eead4] font-mono mt-1">
                {overview.communication.practiceFrequencyPerMonth} / mo
              </div>
              <div className="text-[10px] text-[#a4a9d0] mt-1">Fluencis active rhythm</div>
            </div>
          </div>

          {/* Assessment History for Communication */}
          <div className="p-6 rounded-2xl bg-[#0c1033] border border-[#222955] space-y-4 shadow-xl">
            <h3 className="font-baskerville text-base font-bold text-white flex items-center gap-2">
              <Mic className="w-4 h-4 text-[#2dd4bf]" />
              <span>Assessed Communication Records ({overview.communication.assessmentHistory.length})</span>
            </h3>

            {overview.communication.assessmentHistory.length > 0 ? (
              <div className="space-y-3">
                {overview.communication.assessmentHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-[#06081c] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">{item.assessmentType}</div>
                      <div className="text-[11px] text-[#8e96c8] font-mono mt-0.5">
                        {item.date} • Evaluated by {item.assessor}
                      </div>
                      {item.notes && (
                        <p className="text-[11px] text-[#cbd5e1] mt-1 italic">"{item.notes}"</p>
                      )}
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <span className="font-mono text-base font-bold text-[#5eead4]">
                        {item.score}/{item.maxScore}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 block">Verified Record</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center text-xs text-[#a4a9d0]">
                No verified communication assessments logged yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          AREA B: TECHNICAL SKILLS
      ========================================================= */}
      {activeSubTab === 'technical' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#0c1033] border border-[#222955]">
              <span className="text-[10px] font-mono text-[#8e96c8] uppercase">Coding Assessment Benchmark</span>
              <div className="text-2xl font-black text-white font-mono mt-1">
                {overview.technical.codingAssessmentScore !== undefined
                  ? `${overview.technical.codingAssessmentScore}/100`
                  : 'Not assessed yet'}
              </div>
              <div className="text-[10px] text-[#a4a9d0] mt-1">Algorithms & Data Structures</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0c1033] border border-[#222955]">
              <span className="text-[10px] font-mono text-[#8e96c8] uppercase">Problem Solving Performance</span>
              <div className="text-2xl font-black text-white font-mono mt-1">
                {overview.technical.problemSolvingScore !== undefined
                  ? `${overview.technical.problemSolvingScore}/100`
                  : 'Not assessed yet'}
              </div>
              <div className="text-[10px] text-[#a4a9d0] mt-1">Practical coding problem solving</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0c1033] border border-[#222955]">
              <span className="text-[10px] font-mono text-[#8e96c8] uppercase">Primary Technical Core</span>
              <div className="text-sm font-bold text-[#5eead4] mt-2">
                {overview.technical.primaryTechnicalStrength}
              </div>
              <div className="text-[10px] text-[#a4a9d0] mt-1">Verified faculty endorsement</div>
            </div>
          </div>

          {/* Technical Knowledge Assessment Badges */}
          <div className="p-6 rounded-2xl bg-[#0c1033] border border-[#222955] space-y-4">
            <h3 className="font-baskerville text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#60a5fa]" />
              <span>Technical Knowledge Assessments</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(overview.technical.technicalKnowledgeAssessments).map(([subj, score]) => (
                <div
                  key={subj}
                  className="p-3.5 rounded-xl bg-[#06081c] border border-white/5 flex items-center justify-between"
                >
                  <span className="text-xs text-[#cbd5e1] font-medium">{subj}</span>
                  <span className="font-mono text-xs font-bold text-[#93c5fd]">{score}/100</span>
                </div>
              ))}
            </div>
          </div>

          {/* Relevant Project or Practical Assessment Results */}
          <div className="p-6 rounded-2xl bg-[#0c1033] border border-[#222955] space-y-4">
            <h3 className="font-baskerville text-base font-bold text-white flex items-center gap-2">
              <Code className="w-4 h-4 text-[#34d399]" />
              <span>Relevant Practical Project Assessments</span>
            </h3>

            <div className="space-y-3">
              {overview.technical.practicalProjects.map((p, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#06081c] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-white">{p.projectName}</div>
                    <div className="text-[11px] text-[#8e96c8] font-mono mt-0.5">
                      Evaluated {p.reviewDate} by {p.evaluator}
                    </div>
                    <p className="text-[11px] text-[#cbd5e1] mt-1">{p.notes}</p>
                  </div>
                  <div className="text-left sm:text-right shrink-0 font-mono">
                    <span className="text-base font-bold text-[#34d399]">{p.score}/100</span>
                    <span className="block text-[10px] text-[#a4a9d0]">Capstone / Lab</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Skill-Development Activities */}
          <div className="p-6 rounded-2xl bg-[#0c1033] border border-[#222955] space-y-3">
            <h3 className="font-baskerville text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#a855f7]" />
              <span>Technical Skill-Development Activities</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {overview.technical.technicalActivities.map((act, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#06081c] border border-white/5 text-xs space-y-1">
                  <div className="font-bold text-white">{act.name}</div>
                  <div className="text-[11px] text-[#8e96c8] font-mono">{act.platform} • {act.completedDate}</div>
                  <div className="text-[11px] text-emerald-400 font-mono">{act.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          AREA C: CAREER READINESS & TRANSPARENT PLACEMENT INDICATOR
      ========================================================= */}
      {activeSubTab === 'career-placement' && (
        <div className="space-y-6">
          {/* Main 4 Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#0c1033] border border-[#222955]">
              <span className="text-[10px] font-mono text-[#8e96c8] uppercase block">Aptitude Assessment</span>
              <div className="text-2xl font-black text-white font-mono mt-1">
                {overview.careerReadiness.aptitudeScore !== undefined
                  ? `${overview.careerReadiness.aptitudeScore}/100`
                  : 'Not assessed yet'}
              </div>
              <div className="text-[10px] text-[#a4a9d0] mt-1">Quantitative & Logical</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0c1033] border border-[#222955]">
              <span className="text-[10px] font-mono text-[#8e96c8] uppercase block">Coding Interview Readiness</span>
              <div className="text-2xl font-black text-white font-mono mt-1">
                {overview.careerReadiness.codingInterviewReadiness !== undefined
                  ? `${overview.careerReadiness.codingInterviewReadiness}/100`
                  : 'Not assessed yet'}
              </div>
              <div className="text-[10px] text-[#a4a9d0] mt-1">Live technical interview</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0c1033] border border-[#222955]">
              <span className="text-[10px] font-mono text-[#8e96c8] uppercase block">Mock Interview Performance</span>
              <div className="text-2xl font-black text-white font-mono mt-1">
                {overview.careerReadiness.mockInterviewPerformance !== undefined
                  ? `${overview.careerReadiness.mockInterviewPerformance}/100`
                  : 'Not assessed yet'}
              </div>
              <div className="text-[10px] text-[#a4a9d0] mt-1">Alumni/Faculty panel evaluation</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0c1033] border border-[#222955]">
              <span className="text-[10px] font-mono text-[#8e96c8] uppercase block">Placement Prep Consistency</span>
              <div className="text-base font-bold text-emerald-400 font-mono mt-2">
                {overview.careerReadiness.placementPrepConsistency}
              </div>
              <div className="text-[10px] text-[#a4a9d0] mt-1">Weekly practice frequency</div>
            </div>
          </div>

          {/* Transparent Placement Readiness Contributing Dimensions (Section 5) */}
          <div className="p-6 rounded-2xl bg-[#0c1033] border border-[#2dd4bf]/30 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div>
                <h3 className="font-baskerville text-base font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#2dd4bf]" />
                  <span>Placement Readiness Dimensions Breakdown</span>
                </h3>
                <p className="text-xs text-[#a4a9d0] mt-0.5">
                  Normalized to a 0–100 scale. Missing assessments are clearly identified and never treated as zero.
                </p>
              </div>
              <span className="text-xs font-mono text-[#5eead4] font-bold">
                Data Completeness: {indicator.dataCompleteness.percentage}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {indicator.contributingDimensions.map((dim, i) => (
                <div
                  key={i}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                    dim.status === 'assessed'
                      ? 'bg-[#06081c] border-white/10'
                      : 'bg-white/[0.01] border-dashed border-white/10 text-white/50'
                  }`}
                >
                  <div className="text-xs font-medium text-white mb-2">{dim.name}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#8e96c8] uppercase">{dim.category}</span>
                    {dim.status === 'assessed' ? (
                      <span className="font-mono text-sm font-bold text-[#5eead4]">
                        {dim.score}/{dim.maxScore}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-[#94a3b8]">
                        Not assessed yet
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Strongest Areas vs Areas Needing Development */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/10">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                <span className="text-xs font-mono font-bold text-emerald-400 block mb-1">
                  ✓ Strongest Assessed Areas
                </span>
                {indicator.strongestAssessedAreas.length > 0 ? (
                  <ul className="text-xs text-[#cbd5e1] space-y-1">
                    {indicator.strongestAssessedAreas.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-xs text-[#a4a9d0]">Continuing assessment calibration.</span>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25">
                <span className="text-xs font-mono font-bold text-amber-400 block mb-1">
                  ▲ Areas Needing Development
                </span>
                {indicator.areasNeedingDevelopment.length > 0 ? (
                  <ul className="text-xs text-[#cbd5e1] space-y-1">
                    {indicator.areasNeedingDevelopment.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-xs text-[#a4a9d0]">All assessed areas meet placement thresholds.</span>
                )}
              </div>
            </div>
          </div>

          {/* Resume & Career Prep Activities */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#0c1033] border border-[#222955] space-y-3">
              <span className="text-xs font-mono font-bold text-white uppercase block">
                Resume & Career Preparation Activity
              </span>
              <div className="space-y-2">
                {overview.careerReadiness.careerPrepActivities.map((act, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#06081c] border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{act.title}</div>
                      <div className="text-[11px] text-[#8e96c8] font-mono">{act.type} • {act.date}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#2dd4bf]/10 text-[#5eead4] font-mono text-[10px]">
                      {act.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c1033] border border-[#222955] space-y-3">
              <span className="text-xs font-mono font-bold text-white uppercase block">
                Target Campus Roles & Badges
              </span>
              <div className="flex flex-wrap gap-2 mb-3">
                {overview.careerReadiness.eligibleRoles.map((role, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-[#2dd4bf]/10 border border-[#2dd4bf]/25 text-[#5eead4] text-xs font-mono"
                  >
                    {role}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                {overview.careerReadiness.verifiedBadges.map((badge, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-[#60a5fa]/10 border border-[#60a5fa]/25 text-[#93c5fd] text-xs font-mono flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#60a5fa]" />
                    <span>{badge}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          AREA D: DEVELOPMENT HISTORY & SKILL GAPS
      ========================================================= */}
      {activeSubTab === 'development-history' && (
        <div className="space-y-6">
          {/* Identified Skill Gaps with Diagnostic Rationale */}
          <div className="p-6 rounded-2xl bg-[#0c1033] border border-[#222955] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-baskerville text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#ff6a2b]" />
                <span>Identified Skill Gaps ({overview.gaps.length})</span>
              </h3>
              <span className="text-[11px] font-mono text-[#a4a9d0]">
                Calibrated against campus placement benchmarks
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {overview.gaps.map((gap) => (
                <div
                  key={gap.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                    gap.gapSeverity === 'NOTABLE'
                      ? 'bg-rose-500/10 border-rose-500/30'
                      : gap.gapSeverity === 'MODERATE'
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-emerald-500/10 border-emerald-500/30'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{gap.skillName}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          gap.gapSeverity === 'NOTABLE'
                            ? 'bg-rose-500/20 text-rose-300'
                            : gap.gapSeverity === 'MODERATE'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {gap.gapSeverity} GAP ({gap.currentLevel}/{gap.benchmarkLevel})
                      </span>
                    </div>
                    <p className="text-xs text-[#cbd5e1] mt-2 leading-relaxed">
                      {gap.diagnosticRationale}
                    </p>
                    <div className="mt-2.5 pt-2 border-t border-white/5 text-[11px] text-[#93c5fd]">
                      <strong>Recommended Practice:</strong> {gap.recommendedAction}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Missing Assessments (Transparent Reporting) */}
          {overview.developmentHistory.missingAssessments.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300">Pending Assessment Telemetry:</span>
                <p className="text-[#cbd5e1] mt-0.5">
                  The following dimensions are marked as <strong>"Not assessed yet"</strong>: {overview.developmentHistory.missingAssessments.join(', ')}.
                  Evolyn does not penalize unassessed areas; scheduling these evaluations will calibrate your full placement readiness score.
                </p>
              </div>
            </div>
          )}

          {/* Assessment History Table */}
          <div className="p-6 rounded-2xl bg-[#0c1033] border border-[#222955] space-y-4">
            <h3 className="font-baskerville text-base font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-[#818cf8]" />
              <span>Assessment Progression & Evaluation History</span>
            </h3>

            <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#06081c]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[#a4a9d0] font-semibold font-mono bg-[#090d29]">
                    <th className="p-3">Assessment Module</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 text-center">Score / Max</th>
                    <th className="p-3">Evaluator / Source</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Faculty Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    ...overview.communication.assessmentHistory,
                    ...overview.technical.assessmentHistory,
                  ].map((rec) => (
                    <tr key={rec.id} className="hover:bg-white/[0.03]">
                      <td className="p-3 font-semibold text-white">{rec.assessmentType}</td>
                      <td className="p-3 font-mono text-[11px] text-[#8e96c8] uppercase">{rec.category}</td>
                      <td className="p-3 text-center font-mono font-bold text-[#5eead4]">
                        {rec.score}/{rec.maxScore}
                      </td>
                      <td className="p-3 text-[#cbd5e1]">{rec.assessor}</td>
                      <td className="p-3 font-mono text-[#a4a9d0] text-[11px]">{rec.date}</td>
                      <td className="p-3 text-[#94a3b8] text-[11px] max-w-xs truncate">{rec.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          AREA E: PRACTICE LABS & CHALLENGES (FLUENCIS INTEGRATION)
      ========================================================= */}
      {activeSubTab === 'practice-labs' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-[#a4a9d0] flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-[#2dd4bf] shrink-0 mt-0.5" />
            <p>
              These self-assessment practice exercises help you build communication ease, verbal rhythm, and coding problem-solving. Practice includes speech recording (or text journal), a countdown timer, and personal reflection. <em>Note: Practice completion is logged for your personal development and does not replace official faculty assessments.</em>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {challenges.map((ch) => (
              <div
                key={ch.id}
                className="p-5 rounded-2xl bg-[#0c1033] border border-[#222955] hover:border-[#2dd4bf]/40 transition-all flex flex-col justify-between space-y-4 shadow-xl"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#2dd4bf]/15 text-[#5eead4] border border-[#2dd4bf]/30 text-[10px] font-mono font-bold">
                      {ch.badge}
                    </span>
                    <span className="text-[11px] font-mono text-[#a4a9d0] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> ~{ch.targetDurationMinutes} min
                    </span>
                  </div>
                  <h4 className="font-baskerville text-base font-bold text-white">
                    {ch.title}
                  </h4>
                  <p className="text-xs text-[#cbd5e1] leading-relaxed italic line-clamp-2">
                    "{ch.prompt}"
                  </p>
                  <p className="text-[11px] text-[#8e96c8] pt-1 border-t border-white/5">
                    <strong>Focus:</strong> {ch.recommendedFor}
                  </p>
                </div>

                <button
                  onClick={() => setActivePracticeChallenge(ch)}
                  className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-[#2dd4bf] hover:text-black text-xs font-bold text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Fluencis Practice</span>
                </button>
              </div>
            ))}
          </div>

          {/* Recent Practice History */}
          <div className="p-6 rounded-2xl bg-[#0c1033] border border-[#222955] space-y-4">
            <h3 className="font-baskerville text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#2dd4bf]" />
              <span>My Practice History ({overview.recentPractices.length})</span>
            </h3>

            {overview.recentPractices.length > 0 ? (
              <div className="space-y-3">
                {overview.recentPractices.map((prac) => (
                  <div
                    key={prac.id}
                    className="p-3.5 rounded-xl bg-[#06081c] border border-white/5 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{prac.title}</span>
                      <span className="text-[10px] font-mono text-[#a4a9d0]">
                        {prac.completedAt} • {Math.round(prac.durationSeconds / 60)} min
                      </span>
                    </div>
                    {prac.transcriptOrJournal && (
                      <p className="text-[11px] text-[#94a3b8] italic bg-white/[0.02] p-2 rounded-lg">
                        "{prac.transcriptOrJournal.substring(0, 160)}..."
                      </p>
                    )}
                    {prac.reflectionNotes && (
                      <div className="text-[10px] text-[#8e96c8] font-mono flex items-center gap-2">
                        <span>Mood: <strong>{prac.reflectionMood || 'progressing'}</strong></span>
                        <span>•</span>
                        <span>Reflection: {prac.reflectionNotes}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center text-xs text-[#a4a9d0]">
                No practice logs recorded yet. Start your first session above!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Practice Modal */}
      {activePracticeChallenge && (
        <FluencisPracticeModal
          challenge={activePracticeChallenge}
          studentId={studentId}
          onClose={() => setActivePracticeChallenge(null)}
          onComplete={handlePracticeFinished}
        />
      )}
    </div>
  );
};
