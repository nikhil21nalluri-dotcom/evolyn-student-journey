import React, { useState, useEffect } from 'react';
import {
  Mic,
  Award,
  BookOpen,
  Briefcase,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  PlusCircle,
  CheckCircle2,
  Filter,
  Search,
  ExternalLink,
  Target,
  ArrowRight,
  UserCheck,
  ShieldAlert,
  Clock,
  AlertCircle,
  Info,
  Check,
} from 'lucide-react';
import { useSkillsPlacement } from '../../context/SkillsPlacementContext';
import { STUDENT_GROWTH_DATA } from '../../data/studentGrowthData';
import { FacultyAssessmentModal } from './FacultyAssessmentModal';
import { useIntervention } from '../../context/InterventionContext';
import { useAuth } from '../../context/AuthContext';

interface FacultySkillGapPanelProps {
  selectedStudentId: string;
  onSelectStudent?: (studentId: string) => void;
  onInitiateIntervention?: (studentId: string, type: string) => void;
}

export const FacultySkillGapPanel: React.FC<FacultySkillGapPanelProps> = ({
  selectedStudentId,
  onSelectStudent,
  onInitiateIntervention,
}) => {
  const { userProfile } = useAuth();
  const {
    getStudentOverview,
    getInstitutionalAnalytics,
    recordAssessment,
  } = useSkillsPlacement();
  const { createIntervention } = useIntervention();

  const [activeStudentId, setActiveStudentId] = useState<string>(selectedStudentId || STUDENT_GROWTH_DATA[0].id);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    if (selectedStudentId) {
      setActiveStudentId(selectedStudentId);
    }
  }, [selectedStudentId]);

  const overview = getStudentOverview(activeStudentId);
  const indicator = overview.placementReadinessIndicator;

  const handleRecordSubmit = (data: any) => {
    recordAssessment(data);
    setSuccessToast(`Successfully recorded ${data.assessmentType} for ${data.studentId}!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleLaunchIntervention = (rec: { title: string; suggestedInterventionType: string; recommendation: string }) => {
    const facultyAuthor = userProfile?.displayName || 'Prof. Elena Vance';
    createIntervention({
      studentId: overview.studentId,
      studentName: overview.studentName,
      actionType: rec.suggestedInterventionType,
      reason: rec.recommendation,
      priority: 'HIGH',
      facultyName: facultyAuthor,
      facultyRole: 'Faculty Advisor',
      notes: `Evidence-based recommendation triggered from Skills & Placement Intelligence: ${rec.title}`,
      totalSessions: 2,
      initialStatus: 'ACTIVE',
    });

    setSuccessToast(`Intervention "${rec.suggestedInterventionType}" activated for ${overview.studentName}!`);
    setTimeout(() => setSuccessToast(null), 4500);

    if (onInitiateIntervention) {
      onInitiateIntervention(activeStudentId, rec.suggestedInterventionType);
    }
  };

  return (
    <div className="space-y-6 text-[#f0f1ff]">
      {/* Success Notification */}
      {successToast && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs text-emerald-300 font-mono flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header with Student Selector & Record Assessment Action */}
      <div className="p-6 rounded-2xl bg-[#0c1033] border border-[#222955] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ff6a2b]/15 text-[#ffb27a] border border-[#ff6a2b]/30 text-[10px] font-mono font-bold mb-1">
            <UserCheck className="w-3.5 h-3.5 text-[#ff6a2b]" />
            <span>STEP 9: SKILL GAP & PLACEMENT DIAGNOSTICS</span>
          </div>
          <h3 className="font-baskerville text-xl font-bold text-white">
            Student Skill Gap & Placement Intelligence
          </h3>
          <p className="text-xs text-[#a4a9d0] mt-0.5">
            Cross-evaluate communication, coding proficiency, and aptitude readiness to recommend targeted, evidence-based support.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Student Selector */}
          <div className="flex items-center gap-2 bg-[#06081c] border border-[#1f2552] px-3 py-1.5 rounded-xl text-xs font-mono">
            <span className="text-[#8e96c8]">Student:</span>
            <select
              value={activeStudentId}
              onChange={(e) => {
                setActiveStudentId(e.target.value);
                if (onSelectStudent) onSelectStudent(e.target.value);
              }}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              {STUDENT_GROWTH_DATA.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#090b20]">
                  {s.name} ({s.branch})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsAssessmentModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#ff6a2b] hover:bg-[#ff8a50] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#ff6a2b]/30 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Record Assessment</span>
          </button>
        </div>
      </div>

      {/* Selected Student Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#06081c] border border-[#1f2552]">
          <span className="text-[10px] font-mono uppercase text-[#8e96c8] block">Assessed Communication</span>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {overview.communication.compositeCommunicationScore !== undefined
              ? `${overview.communication.compositeCommunicationScore}/100`
              : 'Not assessed yet'}
          </div>
          <div className="text-[10px] text-[#a4a9d0] mt-1">Fluencis benchmark score</div>
        </div>

        <div className="p-4 rounded-xl bg-[#06081c] border border-[#1f2552]">
          <span className="text-[10px] font-mono uppercase text-[#8e96c8] block">Coding Assessment</span>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {overview.technical.codingAssessmentScore !== undefined
              ? `${overview.technical.codingAssessmentScore}/100`
              : 'Not assessed yet'}
          </div>
          <div className="text-[10px] text-[#a4a9d0] mt-1">DSA & algorithms test</div>
        </div>

        <div className="p-4 rounded-xl bg-[#06081c] border border-[#1f2552]">
          <span className="text-[10px] font-mono uppercase text-[#8e96c8] block">Placement Aptitude</span>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {overview.careerReadiness.aptitudeScore !== undefined
              ? `${overview.careerReadiness.aptitudeScore}/100`
              : 'Not assessed yet'}
          </div>
          <div className="text-[10px] text-[#a4a9d0] mt-1">Quantitative screening</div>
        </div>

        <div className="p-4 rounded-xl bg-[#06081c] border border-[#1f2552]">
          <span className="text-[10px] font-mono uppercase text-[#8e96c8] block">Placement Readiness</span>
          <div className="text-sm font-bold text-emerald-400 font-mono mt-2 truncate" title={indicator.statusLabel}>
            {indicator.score !== undefined ? `${indicator.score}/100 • ` : ''}
            {indicator.statusLabel}
          </div>
          <div className="text-[10px] text-[#a4a9d0] mt-1">
            Completeness: {indicator.dataCompleteness.percentage}%
          </div>
        </div>
      </div>

      {/* Missing Assessments Alert (Section 4) */}
      {overview.developmentHistory.missingAssessments.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300">Pending / Missing Assessments for {overview.studentName}:</span>
              <p className="text-[#cbd5e1] mt-0.5">
                The following areas have no logged evaluation yet: <strong>{overview.developmentHistory.missingAssessments.join(', ')}</strong>.
                Evolyn avoids assuming 0 for unassessed modules; recording these results will complete data coverage.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAssessmentModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-[#ff6a2b] hover:bg-[#ff8a50] text-white font-bold text-[11px] shrink-0 cursor-pointer"
          >
            Log Result
          </button>
        </div>
      )}

      {/* Section 4 Evidence-Based Recommendations */}
      <div className="p-6 rounded-2xl bg-[#0c1033] border border-[#222955] space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-baskerville text-base font-bold text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-[#2dd4bf]" />
            <span>Evidence-Based Recommendations ({overview.developmentRecommendations.length})</span>
          </h4>
          <span className="text-[11px] font-mono text-[#a4a9d0]">
            Deterministic diagnostic triggers from verified assessments
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {overview.developmentRecommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-4 rounded-xl bg-[#06081c] border border-white/10 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{rec.title}</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#2dd4bf]/15 text-[#5eead4] text-[10px] font-mono font-bold">
                    {rec.ruleSource.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-[#cbd5e1] mt-2 leading-relaxed">
                  {rec.recommendation}
                </p>
                <div className="mt-2.5 pt-2 border-t border-white/5 text-[11px] text-[#8e96c8] font-mono">
                  <strong>Evidence:</strong> {rec.evidenceText}
                </div>
              </div>

              <button
                onClick={() => handleLaunchIntervention(rec)}
                className="w-full py-2 rounded-lg bg-[#ff6a2b]/20 hover:bg-[#ff6a2b] border border-[#ff6a2b]/40 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Target className="w-3.5 h-3.5" />
                <span>Dispatch Intervention: {rec.suggestedInterventionType}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Identified Skill Gaps for Selected Student */}
      <div className="p-6 rounded-2xl bg-[#0c1033] border border-[#222955] space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-baskerville text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#ff6a2b]" />
            <span>Identified Skill Gaps for {overview.studentName} ({overview.gaps.length})</span>
          </h4>
          <span className="text-[11px] font-mono text-[#a4a9d0]">
            Calibrated against placement thresholds
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
                  <strong>Recommended Action:</strong> {gap.recommendedAction}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Student Practice Participation (Fluencis Self-Paced Sessions) */}
      <div className="p-6 rounded-2xl bg-[#0c1033] border border-[#222955] space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-baskerville text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#2dd4bf]" />
            <span>Student Practice Participation ({overview.recentPractices.length} Sessions)</span>
          </h4>
          <span className="text-[11px] font-mono text-[#a4a9d0]">
            Fluencis oral & coding activity logs
          </span>
        </div>

        {overview.recentPractices.length > 0 ? (
          <div className="space-y-3">
            {overview.recentPractices.map((p) => (
              <div key={p.id} className="p-3.5 rounded-xl bg-[#06081c] border border-white/5 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{p.title}</span>
                  <span className="text-[10px] font-mono text-[#a4a9d0]">
                    {p.completedAt} • {Math.round(p.durationSeconds / 60)} min
                  </span>
                </div>
                {p.transcriptOrJournal && (
                  <p className="text-[11px] text-[#94a3b8] italic bg-white/[0.02] p-2 rounded-lg">
                    "{p.transcriptOrJournal.substring(0, 180)}..."
                  </p>
                )}
                {p.reflectionNotes && (
                  <div className="text-[10px] text-[#8e96c8] font-mono flex items-center gap-2">
                    <span>Self-assessment mood: <strong>{p.reflectionMood || 'progressing'}</strong></span>
                    <span>•</span>
                    <span>Note: {p.reflectionNotes}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center text-xs text-[#a4a9d0]">
            No student practice activities logged yet.
          </div>
        )}
      </div>

      {/* Complete Assessment History Table */}
      <div className="p-6 rounded-2xl bg-[#0c1033] border border-[#222955] space-y-4">
        <h4 className="font-baskerville text-base font-bold text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-[#818cf8]" />
          <span>Recorded Assessment History ({overview.communication.assessmentHistory.length + overview.technical.assessmentHistory.length} total)</span>
        </h4>

        <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#06081c]">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[#a4a9d0] font-semibold font-mono bg-[#090d29]">
                <th className="p-3">Assessment Name</th>
                <th className="p-3">Domain</th>
                <th className="p-3 text-center">Score / Max</th>
                <th className="p-3">Assessor</th>
                <th className="p-3">Evaluation Date</th>
                <th className="p-3">Faculty Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {[...overview.communication.assessmentHistory, ...overview.technical.assessmentHistory].map((rec) => (
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

      {/* Record Modal */}
      {isAssessmentModalOpen && (
        <FacultyAssessmentModal
          initialStudentId={activeStudentId}
          onClose={() => setIsAssessmentModalOpen(false)}
          onSubmit={handleRecordSubmit}
        />
      )}
    </div>
  );
};
