import React, { useState, useEffect } from 'react';
import {
  STUDENT_GROWTH_DATA,
  StudentGrowthProfile,
  GrowthDimension,
  getStudentGrowthProfile,
} from '../../data/studentGrowthData';
import { GrowthMapForceGraph } from './GrowthMapForceGraph';
import { StudentSuccessScoreCard } from './StudentSuccessScoreCard';
import { UnifiedStudentDataProfile } from './UnifiedStudentDataProfile';
import { useAuth } from '../../context/AuthContext';
import { useSkillsPlacement } from '../../context/SkillsPlacementContext';
import { useIntervention } from '../../context/InterventionContext';
import {
  db,
  handleFirestoreError,
  OperationType,
} from '../../lib/firebase';
import {
  collection,
  doc,
  setDoc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
  ChevronDown,
  User,
  GraduationCap,
  Activity,
  ArrowRight,
  Info,
  ShieldCheck,
  Send,
  Lock,
  MessageSquare,
} from 'lucide-react';

interface StudentGrowthTrackProps {
  onBackToLanding?: () => void;
  onOpenAuth?: () => void;
  onNavigate?: (view: 'landing' | 'growth-track' | 'silent-struggle') => void;
}

interface SavedIntervention {
  id: string;
  studentId: string;
  authorEmail: string;
  authorName: string;
  title: string;
  content: string;
  strategy: string;
  createdAt: string;
}

export const StudentGrowthTrack: React.FC<StudentGrowthTrackProps> = ({
  onBackToLanding,
  onOpenAuth,
  onNavigate,
}) => {
  const { user, userProfile } = useAuth();
  const [selectedStudentId, setSelectedStudentId] = useState<string>('arjun-kumar');
  const [hoveredDimension, setHoveredDimension] = useState<GrowthDimension | null>(null);

  // Firestore Saved Interventions State
  const [interventions, setInterventions] = useState<SavedIntervention[]>([]);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [strategy, setStrategy] = useState('Mentor Check-in');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const student: StudentGrowthProfile = getStudentGrowthProfile(selectedStudentId);

  const { getStudentOverview } = useSkillsPlacement();
  const skillsOverview = getStudentOverview(student.id);

  const { getStudentInterventions } = useIntervention();
  const studentInterventionRecords = getStudentInterventions(student.id);
  const reviewedInterventions = studentInterventionRecords.filter((i) => i.outcomeReview !== undefined);

  // Listen to Firestore real-time interventions for current student
  useEffect(() => {
    if (!user) {
      setInterventions([]);
      return;
    }

    const q = query(
      collection(db, 'interventions'),
      where('studentId', '==', student.id)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: SavedIntervention[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as SavedIntervention);
        });
        setInterventions(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'interventions');
      }
    );

    return () => unsubscribe();
  }, [user, student.id]);

  const handleSaveIntervention = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !noteContent.trim()) return;

    setIsSaving(true);
    const interventionId = `note-${Date.now()}`;
    const payload: SavedIntervention = {
      id: interventionId,
      studentId: student.id,
      authorEmail: user.email || 'advisor@evolyn.internal',
      authorName: userProfile?.displayName || user.displayName || 'Authorized Advisor',
      title: noteTitle.trim() || `${strategy} Log`,
      content: noteContent.trim(),
      strategy,
      createdAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };

    try {
      await setDoc(doc(db, 'interventions', interventionId), {
        ...payload,
        authorId: user.uid,
      });
      setNoteTitle('');
      setNoteContent('');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `interventions/${interventionId}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full pt-28 pb-24 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto z-10 text-[#f0f1ff]">
      {/* ====================================================
          1. PAGE HEADER
      ==================================================== */}
      <div className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[rgba(140,150,255,0.18)]">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 text-xs font-semibold tracking-widest uppercase text-[#ffb27a] rounded-full bg-[rgba(255,106,43,0.12)] border border-[#ff6a2b]/30 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#ff6a2b]" />
            <span>Official Feature · Student Growth Track</span>
          </div>

          <h1 className="font-baskerville text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#f0f1ff]">
            Student Growth Track
          </h1>

          <p className="font-baskerville italic text-lg sm:text-xl text-[#a4a9d0] mt-2">
            Understand how every student is evolving over time.
          </p>

          <p className="text-xs sm:text-sm text-[#a4a9d0]/80 max-w-2xl mt-2 leading-relaxed">
            Evolyn connects academic, engagement, attendance, participation, and skill signals to
            reveal the complete student journey.
          </p>
        </div>

        {/* Motto Callout */}
        <div className="hidden lg:block max-w-xs p-4 rounded-2xl bg-[rgba(14,16,40,0.65)] border border-[rgba(140,150,255,0.18)] backdrop-blur-md text-xs text-[#a4a9d0] leading-relaxed">
          <strong className="text-[#ff6a2b] font-semibold block mb-1">Evolyn Core Principle:</strong>
          "Don't just see where the student is. See how the student got there — and where they are heading."
        </div>
      </div>

      {/* ====================================================
          2. STUDENT SELECTOR BAR
      ==================================================== */}
      <div className="mb-10 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[rgba(14,16,40,0.7)] border border-[rgba(140,150,255,0.2)] backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ff6a2b] to-[#6f8dff] flex items-center justify-center font-bold font-baskerville text-white shadow-md">
            {student.avatarInitials}
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#a4a9d0] font-mono block">
              Active Student Profile
            </span>
            <div className="relative inline-block">
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="appearance-none bg-black/40 text-base sm:text-lg font-baskerville font-bold text-[#f0f1ff] pl-3 pr-9 py-1 rounded-lg border border-[rgba(140,150,255,0.25)] hover:border-[#ff6a2b] focus:outline-none focus:border-[#ff6a2b] cursor-pointer transition-colors"
              >
                {STUDENT_GROWTH_DATA.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#0c0e28] text-white">
                    {s.name} ({s.branch})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#a4a9d0] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Quick Fictional Disclaimer & Navigation Link */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-[#a4a9d0]">
          <span className="font-mono text-[11px] text-[#a4a9d0]/70">
            Fictional Student ID: <span className="text-[#f0f1ff]">{student.studentId}</span>
          </span>

          <button
            onClick={() => {
              document.getElementById('unified-student-data-profile')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-3 py-1 rounded-full border border-[#6f8dff]/40 text-[11px] font-mono text-[#c2d1ff] bg-[#6f8dff]/10 hover:bg-[#6f8dff]/25 hover:border-[#6f8dff] transition-all cursor-pointer flex items-center gap-1"
          >
            <span>7 Sources Profile ↓</span>
          </button>

          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="px-3.5 py-1.5 rounded-full border border-[rgba(140,150,255,0.2)] hover:border-white text-xs text-[#f0f1ff] bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              ← Back to Landing
            </button>
          )}
        </div>
      </div>

      {/* ====================================================
          3. STUDENT OVERVIEW & GROWTH HEALTH GAUGE
      ==================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
        {/* Student Meta Details */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl glass-card flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[rgba(140,150,255,0.14)]">
              <div>
                <h2 className="font-baskerville text-2xl sm:text-3xl font-bold text-[#f0f1ff]">
                  {student.name}
                </h2>
                <p className="text-xs sm:text-sm text-[#a4a9d0] mt-0.5">
                  {student.course} · {student.branch}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#f0f1ff]">
                  {student.year} · {student.currentSemester}
                </span>
              </div>
            </div>

            {/* Quick Metadata Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6">
              <div className="p-3 rounded-xl bg-black/20 border border-white/5">
                <span className="text-[11px] uppercase tracking-wider text-[#a4a9d0] block">Course</span>
                <span className="text-xs sm:text-sm font-semibold text-[#f0f1ff]">{student.course}</span>
              </div>
              <div className="p-3 rounded-xl bg-black/20 border border-white/5">
                <span className="text-[11px] uppercase tracking-wider text-[#a4a9d0] block">Branch</span>
                <span className="text-xs sm:text-sm font-semibold text-[#f0f1ff]">{student.branch}</span>
              </div>
              <div className="p-3 rounded-xl bg-black/20 border border-white/5">
                <span className="text-[11px] uppercase tracking-wider text-[#a4a9d0] block">Standing</span>
                <span className="text-xs sm:text-sm font-semibold text-[#f0f1ff]">{student.year}</span>
              </div>
              <div className="p-3 rounded-xl bg-black/20 border border-white/5">
                <span className="text-[11px] uppercase tracking-wider text-[#a4a9d0] block">Term</span>
                <span className="text-xs sm:text-sm font-semibold text-[#f0f1ff]">{student.currentSemester}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[rgba(140,150,255,0.12)] flex items-center justify-between text-xs text-[#a4a9d0]">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#ff6a2b]" />
              Continuous longitudinal data integration across 8 dimensions
            </span>
            <span className="font-mono text-[#ffb27a] font-semibold">{student.growthStatus}</span>
          </div>
        </div>

        {/* Circular / Radial Growth Health Gauge (Strictly NOT a generic progress bar) */}
        <div className="lg:col-span-4 p-6 sm:p-8 rounded-3xl glass-card flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="text-xs uppercase tracking-widest text-[#a4a9d0] font-mono mb-4">
            GROWTH HEALTH
          </div>

          {/* Glowing Radial Indicator */}
          <div className="relative w-44 h-44 flex items-center justify-center my-2">
            {/* Outer ambient glow */}
            <div
              className="absolute inset-0 rounded-full blur-xl opacity-40"
              style={{
                background:
                  student.growthHealth >= 80
                    ? 'radial-gradient(circle, #4d6bff 0%, #ff6a2b 100%)'
                    : student.growthHealth >= 65
                    ? 'radial-gradient(circle, #ff6a2b 0%, #ffb27a 100%)'
                    : 'radial-gradient(circle, #f43f5e 0%, #ff6a2b 100%)',
              }}
            />

            {/* SVG Circular Ring */}
            <svg className="w-full h-full transform -rotate-90 relative z-10" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="48"
                stroke="rgba(140, 150, 255, 0.15)"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="60"
                cy="60"
                r="48"
                stroke={student.growthHealth >= 75 ? '#ff6a2b' : student.growthHealth >= 60 ? '#ffb27a' : '#f43f5e'}
                strokeWidth="8"
                strokeDasharray={301.6}
                strokeDashoffset={301.6 - (301.6 * student.growthHealth) / 100}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
              <span className="font-baskerville text-4xl font-black text-[#f0f1ff] leading-none">
                {student.growthHealth}
              </span>
              <span className="text-[11px] font-mono text-[#a4a9d0] mt-1">/ 100</span>
            </div>
          </div>

          <div className="mt-3">
            <span
              className={`inline-block px-3.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                student.growthHealth >= 80
                  ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                  : student.growthHealth >= 65
                  ? 'bg-[#ff6a2b]/20 text-[#ffb27a] border border-[#ff6a2b]/30'
                  : 'bg-rose-950/40 text-rose-400 border border-rose-500/30'
              }`}
            >
              {student.growthHealthLabel}
            </span>
            <p className="text-[11px] text-[#a4a9d0] mt-2 max-w-xs leading-relaxed">
              {student.growthHealthSubtext}
            </p>
          </div>
        </div>
      </div>

      {/* ====================================================
          3B. STUDENT SUCCESS SCORE (COMPOSITE INDICATOR)
      ==================================================== */}
      <StudentSuccessScoreCard
        studentIdOrName={student.id}
        onNavigateToSilentStruggle={onNavigate ? () => onNavigate('silent-struggle') : undefined}
        onScrollToGrowthMap={() => {
          document.getElementById('growth-map-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* ====================================================
          3C. UNIFIED STUDENT DATA INTELLIGENCE (7 DATA CATEGORIES)
      ==================================================== */}
      <UnifiedStudentDataProfile
        studentIdOrName={student.id}
        onNavigateToSilentStruggle={onNavigate ? () => onNavigate('silent-struggle') : undefined}
      />

      {/* ====================================================
          4. AI GROWTH INSIGHT (PROMINENT SECTION)
      ==================================================== */}
      <div className="mb-12 p-6 sm:p-8 rounded-3xl glass-card border border-[#ff6a2b]/30 relative overflow-hidden shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#ff6a2b] mb-2">
          <Sparkles className="w-4 h-4" />
          <span>AI Growth Insight</span>
        </div>

        <p className="font-baskerville text-lg sm:text-2xl text-[#f0f1ff] leading-relaxed max-w-4xl">
          "{student.aiGrowthInsight}"
        </p>

        <div className="mt-6 pt-5 border-t border-[rgba(140,150,255,0.18)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-wider text-[#a4a9d0]">Key Observation:</span>
            <span className="text-sm font-semibold text-[#ffb27a]">{student.keyObservation}</span>
          </div>

          <span className="text-[11px] font-mono text-[#a4a9d0]/70">
            Dynamically synthesized from longitudinal signal cadence
          </span>
        </div>
      </div>

      {/* ====================================================
          5. GROWTH DIMENSIONS (8 DETAILED CHARTS)
      ==================================================== */}
      <div className="mb-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
          <div>
            <h2 className="font-baskerville text-2xl sm:text-3xl font-bold text-[#f0f1ff] tracking-tight">
              Major Growth Dimensions
            </h2>
            <p className="text-xs sm:text-sm text-[#a4a9d0]">
              Hover any dimension to inspect historical delta and contextual time period.
            </p>
          </div>
          <span className="text-xs font-mono text-[#ffb27a]">8 Active Living Signals</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {student.dimensions.map((dim) => {
            const isImproving = dim.trend === 'improving';
            const isDeclining = dim.trend === 'declining';

            return (
              <div
                key={dim.id}
                onMouseEnter={() => setHoveredDimension(dim)}
                onMouseLeave={() => setHoveredDimension(null)}
                className="glass-card p-5 cursor-pointer relative group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-[#a4a9d0] mb-3">
                    <span className="font-medium text-[11px] uppercase tracking-wider text-[#a4a9d0]">
                      {dim.category}
                    </span>

                    {/* Trend Badge */}
                    <span
                      className={`inline-flex items-center gap-1 font-mono font-bold text-xs px-2 py-0.5 rounded-full ${
                        isImproving
                          ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20'
                          : isDeclining
                          ? 'bg-rose-950/40 text-rose-400 border border-rose-500/20'
                          : 'bg-blue-950/40 text-[#6f8dff] border border-blue-500/20'
                      }`}
                    >
                      {isImproving ? (
                        <>
                          <TrendingUp className="w-3 h-3" /> ↑ {dim.change}%
                        </>
                      ) : isDeclining ? (
                        <>
                          <TrendingDown className="w-3 h-3" /> ↓ {Math.abs(dim.change)}%
                        </>
                      ) : (
                        <>
                          <Minus className="w-3 h-3" /> Stable
                        </>
                      )}
                    </span>
                  </div>

                  <h3 className="font-baskerville text-lg font-bold text-[#f0f1ff] mb-2">
                    {dim.name}
                  </h3>

                  {/* Large Value Display */}
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="font-baskerville text-3xl font-bold text-[#f0f1ff]">
                      {dim.currentValue}{dim.unit}
                    </span>
                    <span className="text-xs text-[#a4a9d0] font-mono">
                      (prev: {dim.previousValue}{dim.unit})
                    </span>
                  </div>

                  {/* Dimension Bar */}
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isImproving
                          ? 'bg-gradient-to-r from-[#6f8dff] to-emerald-400'
                          : isDeclining
                          ? 'bg-gradient-to-r from-[#ff6a2b] to-rose-500'
                          : 'bg-gradient-to-r from-[#6f8dff] to-[#ffb27a]'
                      }`}
                      style={{ width: `${dim.currentValue}%` }}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-[rgba(140,150,255,0.1)] flex items-center justify-between text-[11px] text-[#a4a9d0]">
                  <span>{dim.timePeriod}</span>
                  <span className="text-[10px] text-[#ffb27a] opacity-0 group-hover:opacity-100 transition-opacity">
                    Inspect details →
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Hover Inspector Tooltip Callout */}
        {hoveredDimension && (
          <div className="mt-4 p-4 rounded-2xl bg-[#0e1028] border border-[#ff6a2b]/30 flex items-center justify-between gap-4 text-xs text-[#f0f1ff] animate-fadeIn">
            <div>
              <strong className="text-[#ff6a2b] block font-baskerville text-sm">
                {hoveredDimension.name} Detailed Context:
              </strong>
              <span className="text-[#a4a9d0]">{hoveredDimension.description}</span>
            </div>
            <div className="text-right shrink-0 font-mono text-[11px]">
              <div>Baseline: {hoveredDimension.previousValue}%</div>
              <div className="text-[#ffb27a] font-bold">
                Current: {hoveredDimension.currentValue}% ({hoveredDimension.timePeriod})
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ====================================================
          6. GROWTH TIMELINE ("GROWTH JOURNEY")
      ==================================================== */}
      <div className="mb-14 p-6 sm:p-10 rounded-3xl glass-card">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 text-xs uppercase font-mono tracking-widest text-[#ff6a2b] mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Longitudinal Arc</span>
          </div>
          <h2 className="font-baskerville text-2xl sm:text-3xl md:text-4xl font-bold text-[#f0f1ff]">
            Growth Journey
          </h2>
          <p className="text-xs sm:text-sm text-[#a4a9d0] mt-1">
            Tracking velocity and critical inflection points across months.
          </p>
        </div>

        {/* Timeline Horizontal / Stacked Stepper */}
        <div className="relative">
          <div className="hidden lg:block absolute top-6 left-6 right-6 h-0.5 bg-gradient-to-r from-[#6f8dff] via-[#ff6a2b] to-emerald-400 opacity-40 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5 relative z-10">
            {student.timeline.map((step) => {
              const isWarning = step.trendType === 'warning';
              const isRecovery = step.trendType === 'recovery';

              return (
                <div
                  key={step.month}
                  className="p-4 rounded-2xl bg-[#090b20]/90 border border-[rgba(140,150,255,0.16)] hover:border-[#ff6a2b]/40 transition-colors flex flex-col justify-between"
                >
                  <div>
                    {/* Node Pin */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs font-bold text-[#ffb27a]">
                        {step.month}
                      </span>
                      <span
                        className={`w-3 h-3 rounded-full ${
                          isWarning
                            ? 'bg-rose-500 animate-pulse'
                            : isRecovery
                            ? 'bg-emerald-400'
                            : 'bg-[#6f8dff]'
                        }`}
                      />
                    </div>

                    <span className="text-[10px] text-[#a4a9d0] font-mono block mb-1">
                      {step.period}
                    </span>

                    <h4 className="font-baskerville text-sm font-bold text-[#f0f1ff] mb-2 leading-snug">
                      {step.headline}
                    </h4>

                    <p className="text-[11px] text-[#a4a9d0] leading-relaxed mb-3">
                      {step.description}
                    </p>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-white/5">
                    {step.signals.map((sig, sIdx) => (
                      <div key={sIdx} className="text-[10px] text-[#a4a9d0]/80 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-[#ff6a2b]" />
                        <span>{sig}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Skills, Communication & Placement Assessment Milestones (Step 9 Integration) */}
        {skillsOverview && (
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2dd4bf] animate-pulse" />
                <h3 className="font-baskerville text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span>Skills, Fluencis & Placement Milestones</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#2dd4bf]/15 text-[#5eead4] border border-[#2dd4bf]/30">
                    Step 9 Integrated
                  </span>
                </h3>
              </div>
              <div className="text-[11px] font-mono text-[#a4a9d0]">
                Placement Readiness Status:{' '}
                <strong className="text-[#5eead4]">
                  {skillsOverview.placementReadinessIndicator.statusLabel}
                </strong>
                {skillsOverview.placementReadinessIndicator.score !== undefined && (
                  <span> ({skillsOverview.placementReadinessIndicator.score}/100)</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                ...skillsOverview.communication.assessmentHistory,
                ...skillsOverview.technical.assessmentHistory,
              ].slice(0, 3).map((asmt) => (
                <div
                  key={asmt.id}
                  className="p-3.5 rounded-xl bg-[#06081c]/80 border border-white/10 flex flex-col justify-between text-xs space-y-2 hover:border-[#2dd4bf]/40 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-[#2dd4bf] uppercase font-bold">
                        {asmt.category}
                      </span>
                      <span className="text-[10px] font-mono text-[#8e96c8]">{asmt.date}</span>
                    </div>
                    <div className="font-semibold text-white mt-1">{asmt.assessmentType}</div>
                    {asmt.notes && (
                      <p className="text-[11px] text-[#cbd5e1] mt-1 line-clamp-2 italic">
                        "{asmt.notes}"
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/5 font-mono">
                    <span className="text-[10px] text-[#8e96c8]">By {asmt.assessor}</span>
                    <span className="font-bold text-[#5eead4]">
                      {asmt.score}/{asmt.maxScore}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verified Intervention Outcomes & Inflection Tracking (Step 10 Integration) */}
        {reviewedInterventions.length > 0 && (
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="font-baskerville text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span>Verified Intervention Outcomes & Growth Inflections</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    Impact Verified
                  </span>
                </h3>
              </div>
              <span className="text-xs font-mono text-[#a4a9d0]">
                {reviewedInterventions.length} Documented Review{reviewedInterventions.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {reviewedInterventions.map((inv) => {
                const review = inv.outcomeReview!;
                return (
                  <div
                    key={inv.id}
                    className="p-4 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/25 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white font-baskerville text-sm">{inv.actionType}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        {review.outcomeRating.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#8e96c8] font-mono">
                      Reviewed by {review.evaluatorName} on {review.reviewDate}
                    </div>

                    {/* Before vs After Deltas */}
                    <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                      <div className="p-1.5 rounded-lg bg-black/30 border border-white/5">
                        <span className="text-[#8e96c8] block text-[9px]">Score Gain</span>
                        <span className="font-bold text-emerald-400">
                          {review.metricsDelta.successScoreChange >= 0
                            ? `+${review.metricsDelta.successScoreChange}`
                            : review.metricsDelta.successScoreChange} pts
                        </span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-black/30 border border-white/5">
                        <span className="text-[#8e96c8] block text-[9px]">Comm Gain</span>
                        <span className="font-bold text-[#5eead4]">
                          {review.metricsDelta.communicationChange >= 0
                            ? `+${review.metricsDelta.communicationChange}`
                            : review.metricsDelta.communicationChange} pts
                        </span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-black/30 border border-white/5">
                        <span className="text-[#8e96c8] block text-[9px]">Engagement</span>
                        <span className="font-bold text-[#93c5fd]">
                          {review.metricsDelta.engagementChange >= 0
                            ? `+${review.metricsDelta.engagementChange}`
                            : review.metricsDelta.engagementChange} pts
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-[#cbd5e1] italic pt-1 leading-relaxed">
                      "{review.qualitativeOutcomeNotes}"
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ====================================================
          7. STRENGTHS & AREAS NEEDING ATTENTION
      ==================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-14">
        {/* Where This Student Is Growing */}
        <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl glass-card border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-2 mb-6">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-baskerville text-xl sm:text-2xl font-bold text-[#f0f1ff]">
              Where This Student Is Growing
            </h3>
          </div>

          <div className="space-y-4">
            {student.strengths.map((st, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-black/25 border border-emerald-500/15 hover:border-emerald-500/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-baskerville font-bold text-sm text-[#f0f1ff]">
                    ✓ {st.title}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {st.metric}
                  </span>
                </div>
                <p className="text-xs text-[#a4a9d0] leading-relaxed">
                  {st.evidence}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Areas Needing Attention */}
        <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl glass-card border-l-4 border-l-[#ff6a2b]">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5 text-[#ff6a2b]" />
            <h3 className="font-baskerville text-xl sm:text-2xl font-bold text-[#f0f1ff]">
              Areas Needing Attention
            </h3>
          </div>

          <div className="space-y-4">
            {student.attentionAreas.map((att, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-black/25 border border-[#ff6a2b]/20 hover:border-[#ff6a2b]/40 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-baskerville font-bold text-sm text-[#f0f1ff]">
                    ⚠ {att.title}
                  </span>
                  <span className="text-xs font-mono font-bold text-rose-400">
                    {att.change}
                  </span>
                </div>
                <p className="text-xs text-[#a4a9d0] leading-relaxed mb-2">
                  {att.whatChanged}
                </p>
                <div className="p-2.5 rounded-lg bg-[rgba(255,106,43,0.08)] text-[11px] text-[#ffb27a] leading-relaxed">
                  <strong>Responsible Note:</strong> {att.responsibleNote}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ====================================================
          8. GROWTH MAP (INTERCONNECTED MULTIDIMENSIONAL FORCE GRAPH)
      ==================================================== */}
      <div id="growth-map-section" className="mb-14 p-6 sm:p-10 rounded-3xl glass-card border border-[rgba(140,150,255,0.22)] shadow-2xl">
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6f8dff]/15 border border-[#6f8dff]/30 text-[#c2d1ff] text-xs font-mono mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#6f8dff]" />
              <span>Interactive Force-Directed Node-Link Topology</span>
            </div>
            <h3 className="font-baskerville text-2xl sm:text-3xl font-bold text-[#f0f1ff]">
              Growth Map: Multidimensional Interconnections
            </h3>
            <p className="text-xs sm:text-sm text-[#a4a9d0] mt-1 max-w-3xl leading-relaxed">
              Student development is fundamentally multidimensional. Evolyn maps real-time causal
              relationships, showing how foundational academics, technical skills, problem solving,
              communication, and digital engagement continually influence and reinforce one another.
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[11px] font-mono text-[#a4a9d0] block">
              Active Subject
            </span>
            <span className="font-baskerville font-bold text-sm text-[#ffb27a]">
              {student.name} ({student.studentId})
            </span>
          </div>
        </div>

        {/* Force-directed Interactive Physics Node-Link Graph */}
        <GrowthMapForceGraph student={student} />

        {/* Legend / Pedagogical Insights */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-black/30 border border-white/5 flex items-start gap-2.5">
            <span className="w-3 h-3 rounded-full bg-[#6f8dff] shadow-sm shadow-blue-500/50 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-baskerville">Academics & Curricular Core</strong>
              <span className="text-[#a4a9d0] text-[11px] leading-tight">
                Root anchor stabilizing coursework, quizzes, and summative assessments.
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-black/30 border border-white/5 flex items-start gap-2.5">
            <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm shadow-emerald-500/50 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-baskerville">Technical & Problem Solving</strong>
              <span className="text-[#a4a9d0] text-[11px] leading-tight">
                Hands-on execution vectors; algorithmic synthesis directly reinforces theory.
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-black/30 border border-white/5 flex items-start gap-2.5">
            <span className="w-3 h-3 rounded-full bg-[#ff6a2b] shadow-sm shadow-orange-500/50 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-baskerville">Engagement & Participation</strong>
              <span className="text-[#a4a9d0] text-[11px] leading-tight">
                High-sensitivity early warning vector; leads academic shifts by 3–4 weeks.
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-black/30 border border-white/5 flex items-start gap-2.5">
            <span className="w-3 h-3 rounded-full bg-purple-400 shadow-sm shadow-purple-500/50 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-baskerville">Communication & Presence</strong>
              <span className="text-[#a4a9d0] text-[11px] leading-tight">
                Affective and relational baseline; TA interactions and collaborative voice.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================
          9. GROWTH MILESTONES
      ==================================================== */}
      <div className="mb-14 p-6 sm:p-8 rounded-3xl glass-card">
        <div className="flex items-center gap-2 mb-6">
          <Award className="w-5 h-5 text-[#ffb27a]" />
          <h3 className="font-baskerville text-xl sm:text-2xl font-bold text-[#f0f1ff]">
            Growth Milestones
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {student.milestones.map((ms, mIdx) => (
            <div
              key={mIdx}
              className="p-4 rounded-xl bg-black/25 border border-white/10 flex items-start gap-3"
            >
              <CheckCircle2 className="w-4 h-4 text-[#ff6a2b] shrink-0 mt-0.5" />
              <span className="text-xs sm:text-sm text-[#f0f1ff] leading-relaxed">
                {ms}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ====================================================
          10. ADVISOR INTERVENTION LOGGING (REAL-TIME FIRESTORE PERSISTENCE)
      ==================================================== */}
      <div className="mb-14 p-6 sm:p-8 rounded-3xl glass-card border border-[rgba(140,150,255,0.22)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-baskerville text-xl sm:text-2xl font-bold text-white">
                Advisor Guidance & Intervention Log
              </h3>
              <p className="text-xs text-[#a4a9d0]">
                Encrypted real-time Firestore persistence for authorized mentors
              </p>
            </div>
          </div>

          <span className="text-[11px] font-mono text-[#a4a9d0] bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
            Target: {student.name} ({student.studentId})
          </span>
        </div>

        {userProfile?.role === 'student' ? (
          <div className="p-8 rounded-2xl bg-[#080d24] border border-[#1b2650] text-center space-y-2">
            <Lock className="w-7 h-7 text-[#a4a9d0] mx-auto mb-1" />
            <h4 className="text-sm font-bold text-white">Confidential Mentorship View Protected</h4>
            <p className="text-xs text-[#a4a9d0] max-w-md mx-auto">
              Internal faculty deliberation notes and private advisor casework logs are restricted by academic governance policies. Students can review their growth timeline, support plans, and recommended practice activities in the Student Workspace.
            </p>
          </div>
        ) : user ? (
          <div>
            {/* New Intervention Input Form */}
            <form onSubmit={handleSaveIntervention} className="space-y-4 mb-8 p-5 rounded-2xl bg-black/30 border border-white/10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#a4a9d0] mb-1 block">Intervention Strategy</label>
                  <select
                    value={strategy}
                    onChange={(e) => setStrategy(e.target.value)}
                    className="w-full bg-[#0c0e28] border border-white/15 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ff6a2b]"
                  >
                    <option value="Mentor Check-in">1-on-1 Mentor Check-in</option>
                    <option value="Prerequisite Calculus Support">Targeted Prerequisite Support</option>
                    <option value="Peer Circle Pairing">Peer Collaborative Circle Pairing</option>
                    <option value="Workload Pacing Consultation">Workload Pacing & Wellness Consultation</option>
                    <option value="Research Fellowship Sponsorship">Research Fellowship Sponsorship</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-[#a4a9d0] mb-1 block">Log Title</label>
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder={`e.g. Week 4 Check-in with ${student.name.split(' ')[0]}`}
                    className="w-full bg-[#0c0e28] border border-white/15 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-[#a4a9d0]/50 focus:outline-none focus:border-[#ff6a2b]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#a4a9d0] mb-1 block">Confidential Action Plan & Observations</label>
                <textarea
                  required
                  rows={3}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Record intervention dialogue, milestones discussed, or support resources shared..."
                  className="w-full bg-[#0c0e28] border border-white/15 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-[#a4a9d0]/50 focus:outline-none focus:border-[#ff6a2b]"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <span className="text-[11px] text-[#a4a9d0] font-mono">
                  Author: <strong className="text-white">{user.email}</strong>
                </span>

                <div className="flex items-center gap-3">
                  {saveSuccess && (
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Saved to Firestore!
                    </span>
                  )}
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="btn-primary px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#ff6a2b]/30"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Logging Note...' : 'Log Advisor Intervention'}</span>
                  </button>
                </div>
              </div>
            </form>

            {/* List of Real-Time Firestore Saved Interventions */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-[#a4a9d0] uppercase tracking-wider block">
                Recorded Advisor Actions ({interventions.length})
              </span>

              {interventions.length > 0 ? (
                interventions.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-4 rounded-xl bg-black/20 border border-[rgba(140,150,255,0.12)] flex flex-col justify-between"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-baskerville font-bold text-sm text-[#f0f1ff]">
                          {inv.title}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ff6a2b]/20 text-[#ffb27a] border border-[#ff6a2b]/30">
                          {inv.strategy}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-[#a4a9d0]">
                        {inv.createdAt} · {inv.authorEmail}
                      </span>
                    </div>
                    <p className="text-xs text-[#a4a9d0] leading-relaxed">
                      {inv.content}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center rounded-xl bg-black/15 border border-white/5 text-xs text-[#a4a9d0]">
                  No custom interventions logged yet for {student.name}. Use the form above to record guidance notes.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl bg-black/25 border border-white/10 flex flex-col items-center justify-center">
            <Lock className="w-8 h-8 text-[#ff6a2b] mb-3 opacity-80" />
            <h4 className="font-baskerville text-lg font-bold text-white mb-1">
              Authorized Advisor Access Required
            </h4>
            <p className="text-xs text-[#a4a9d0] max-w-md mb-4">
              Sign in with your institutional Google account or email credentials to record and manage confidential student interventions.
            </p>
            {onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="btn-primary px-6 py-2.5 rounded-full text-xs font-semibold text-white tracking-wide cursor-pointer shadow-lg shadow-[#ff6a2b]/25"
              >
                Sign In to Log Interventions
              </button>
            )}
          </div>
        )}
      </div>

      {/* ====================================================
          11. AI SUMMARY & GROWTH STATUS
      ==================================================== */}
      <div className="mb-16 p-6 sm:p-8 rounded-3xl bg-[rgba(14,16,40,0.85)] border border-[rgba(140,150,255,0.25)] backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#ff6a2b] block">
              Synthesis Protocol
            </span>
            <h3 className="font-baskerville text-2xl font-bold text-white">AI Summary</h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#a4a9d0]">Growth Status:</span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#ff6a2b]/20 text-[#ffb27a] border border-[#ff6a2b]/30">
              {student.growthStatus}
            </span>
          </div>
        </div>

        <p className="mt-4 font-baskerville text-base sm:text-lg text-[#f0f1ff] leading-relaxed">
          {student.aiSummary}
        </p>
      </div>

      {/* ====================================================
          11B. SILENT STRUGGLE DETECTION BRIDGE
      ==================================================== */}
      {onNavigate && (
        <div className="mb-14 p-6 sm:p-8 rounded-3xl bg-[rgba(14,16,40,0.7)] border border-[#ff6a2b]/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#ff6a2b] font-bold block mb-1">
              Complementary Intelligence
            </span>
            <h4 className="font-baskerville text-xl sm:text-2xl font-bold text-white">
              Silent Struggle Detection
            </h4>
            <p className="text-xs sm:text-sm text-[#a4a9d0] mt-1 max-w-xl">
              "Not Every Struggle Looks Like Failure." Discover how Evolyn analyzes behavioral telemetry
              to surface early warning patterns before academic marks change.
            </p>
          </div>
          <button
            onClick={() => onNavigate('silent-struggle')}
            className="px-6 py-3 rounded-full text-xs sm:text-sm font-baskerville font-bold text-white bg-gradient-to-r from-[#ff6a2b] to-[#6f8dff] hover:opacity-95 shadow-md shadow-[#ff6a2b]/25 transition-all cursor-pointer whitespace-nowrap"
          >
            Open Silent Struggle Detection →
          </button>
        </div>
      )}

      {/* ====================================================
          12. FINAL EXPERIENTIAL STATEMENT
      ==================================================== */}
      <div className="text-center py-12 border-t border-[rgba(140,150,255,0.18)]">
        <h2 className="font-baskerville text-3xl sm:text-4xl md:text-5xl font-bold text-[#f0f1ff] tracking-tight">
          Every Student Evolves. <br />
          <span className="gradient-acc-text">Evolyn Helps You See How.</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#a4a9d0] mt-3 max-w-lg mx-auto">
          Comprehensive, responsible student journey intelligence designed to support educators and empower potential.
        </p>
      </div>
    </div>
  );
};
