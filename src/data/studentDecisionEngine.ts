/**
 * AI DECISION INTELLIGENCE PLATFORM
 * 
 * Responsible Terminology & Ethics Notice:
 * Transforms multi-dimensional student telemetry into explainable, actionable decision intelligence:
 * 1. WHAT is happening? (WHAT WE OBSERVE)
 * 2. WHY might this be happening? (POSSIBLE CONTRIBUTING FACTORS - plausible patterns, never deterministic causation)
 * 3. WHAT should happen next? (RECOMMENDED NEXT STEPS - practical, low-friction actions)
 * 4. WHAT should be monitored? (WHAT TO MONITOR - target trajectory without deterministic guarantees)
 * 
 * Strictly consumes existing Evolyn data layers:
 * - Student Success Score (7 dimensions)
 * - Risk & Early Signal Intelligence
 * - Student Segmentation
 * - Silent Struggle telemetry
 * - Growth Track history
 */

import {
  UNIFIED_STUDENTS,
  UnifiedStudentProfile,
  getUnifiedStudentProfile,
  getAllUnifiedStudents,
} from './unifiedStudentData';
import { getStudentSuccessScore, StudentSuccessScoreData } from './studentSuccessScore';
import {
  getStudentRiskProfile,
  StudentRiskProfile,
  ExplainableSignal,
  RiskStatus,
} from './studentRiskEngine';
import {
  getStudentSegment,
  StudentSegmentProfile,
  StudentSegmentType,
  SEGMENT_DEFINITIONS,
  SegmentDefinition,
} from './studentSegmentationEngine';
import { SILENT_STRUGGLE_STUDENTS, SilentStruggleStudent, getStudentSilentStruggleData } from './silentStruggleData';
import { STUDENT_GROWTH_DATA, StudentGrowthProfile, getStudentGrowthProfile } from './studentGrowthData';

export interface DecisionSignalItem {
  id: string;
  name: string;
  category: string;
  currentValue: number;
  trend: 'improving' | 'stable' | 'declining';
  changeDisplay: string;
  statusLabel: string;
}

export interface PossibleContributingFactor {
  id: string;
  title: string;
  description: string;
  dimensionId: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH';
}

export interface RecommendedAction {
  priority: number;
  area: string;
  action: string;
  studentAction: string;
  rationale: string;
  expectedEffort: string;
  status: 'recommended' | 'in-progress' | 'scheduled';
}

export interface MonitorTarget {
  name: string;
  currentValue: number;
  targetDirection: 'Improving' | 'Stable';
  reviewTimeframe: string;
}

export interface StudentDecisionIntelligence {
  studentId: string;
  studentName: string;
  studentRoll: string;
  department: string;
  semester: string;
  successScore: number;
  status: RiskStatus;
  statusBadge: {
    label: string;
    bg: string;
    border: string;
    text: string;
  };
  primarySegment: SegmentDefinition;
  secondarySegments: SegmentDefinition[];

  // 1. WHAT IS HAPPENING?
  whatIsHappening: {
    summary: string;
    facultyDetail: string;
    studentFriendlySummary: string;
    importantSignals: DecisionSignalItem[];
  };

  // 2. WHY MIGHT THIS BE HAPPENING?
  whyMightThisBeHappening: {
    title: string;
    factors: PossibleContributingFactor[];
    synthesis: string;
    responsibleNotice: string;
  };

  // 3. WHAT SHOULD HAPPEN NEXT?
  whatShouldHappenNext: {
    title: string;
    recommendations: RecommendedAction[];
  };

  // 4. WHAT SHOULD BE MONITORED?
  whatShouldBeMonitored: {
    title: string;
    targets: MonitorTarget[];
    guidance: string;
  };

  // Evidence Transparency
  evidenceUsed: string[];

  // Student Persona View
  studentView: {
    insightTitle: string;
    headline: string;
    focusAreas: string[];
    whyThisMatters: string;
    nextSteps: Array<{
      stepNumber: number;
      title: string;
      detail: string;
    }>;
    trackNext: Array<{
      name: string;
      target: string;
    }>;
  };

  // Silent Struggle Correlation
  silentStruggleCorrelation?: {
    isDetected: boolean;
    patternDescription: string;
    recommendation: string;
  };
}

export interface InstitutionalSegmentInsight {
  segmentId: StudentSegmentType;
  segmentName: string;
  studentCount: number;
  percentageOfCohort: number;
  avgSuccessScore: number;
  avgAcademicScore: number;
  avgPlacementScore: number;
  observation: string;
  contributingPattern: string;
  institutionalActions: string[];
}

export interface InstitutionalDecisionIntelligence {
  totalStudents: number;
  headlineObservation: string;
  executiveSummary: string;
  affectedSegments: InstitutionalSegmentInsight[];
  recommendedInstitutionalFocus: string[];
  monitoringGuidance: string;
  evidenceTelemetryCount: number;
}

export interface SegmentDecisionIntelligence {
  segmentId: StudentSegmentType;
  name: string;
  what: string;
  why: string;
  next: string[];
  monitor: string[];
}

/**
 * Computes explainable Decision Intelligence for a student
 */
export function getStudentDecisionIntelligence(studentIdOrName: string): StudentDecisionIntelligence {
  const unified = getUnifiedStudentProfile(studentIdOrName);
  const successScore = getStudentSuccessScore(studentIdOrName);
  const riskProfile = getStudentRiskProfile(studentIdOrName);
  const segmentProfile = getStudentSegment(studentIdOrName);
  const growthProfile = getStudentGrowthProfile(studentIdOrName);
  const silentData = getStudentSilentStruggleData(studentIdOrName);

  // 1. WHAT IS HAPPENING?
  const signals: DecisionSignalItem[] = riskProfile.signals.map((sig) => ({
    id: sig.id,
    name: sig.name,
    category: sig.category,
    currentValue: sig.currentValue,
    trend: sig.trend,
    changeDisplay: sig.changeDisplay,
    statusLabel: sig.statusLabel,
  }));

  // Academic vs Readiness / Behavioral divergence summary
  const academicSig = riskProfile.signals.find((s) => s.category === 'academic');
  const attendanceSig = riskProfile.signals.find((s) => s.category === 'attendance');
  const engagementSig = riskProfile.signals.find((s) => s.category === 'engagement');
  const placementSig = riskProfile.signals.find((s) => s.category === 'placement');
  const commSig = riskProfile.signals.find((s) => s.category === 'communication');

  const isAcademicStableOrStrong =
    (academicSig?.currentValue ?? 80) >= 75 && (academicSig?.trend !== 'declining');
  const decliningCount = riskProfile.decliningSignalsCount;

  let whatSummary = '';
  let whatFacultyDetail = '';
  let whatStudentSummary = '';

  if (isAcademicStableOrStrong && decliningCount > 0) {
    whatSummary = `${unified.name}'s overall academic performance remains strong, but several development indicators have weakened recently.`;
    whatFacultyDetail = `Academic indicators remain stable (${academicSig?.currentValue ?? 84}/100), while observable engagement (${engagementSig?.changeDisplay ?? '↓ 15%'}), communication (${commSig?.changeDisplay ?? '↓ 18%'}), and placement readiness (${placementSig?.changeDisplay ?? '↓ 19%'}) show downward momentum.`;
    whatStudentSummary = `Your coursework and academic foundation are in great shape. At the same time, your weekly participation and interview readiness have softened, providing a prime window for targeted practice.`;
  } else if (decliningCount === 0) {
    whatSummary = `${unified.name} demonstrates balanced momentum with steady progress across coursework, attendance, and technical activities.`;
    whatFacultyDetail = `All primary telemetry vectors remain in stable or improving trajectories with composite Success Score at ${successScore.currentScore}/100.`;
    whatStudentSummary = `You are maintaining solid consistency across coursework and labs. Keep up your active cadence!`;
  } else {
    whatSummary = `${unified.name} is experiencing multi-indicator fluctuations across coursework and learning activity.`;
    whatFacultyDetail = `Multiple indicators are declining simultaneously, with coursework down ${academicSig?.changeDisplay ?? 'moderately'} and attendance at ${attendanceSig?.currentValue ?? 75}%.`;
    whatStudentSummary = `Your learning indicators show a few areas where timely guidance and focused revision can quickly rebuild momentum.`;
  }

  // 2. WHY MIGHT THIS BE HAPPENING?
  const factors: PossibleContributingFactor[] = [];

  if (engagementSig && engagementSig.trend === 'declining') {
    factors.push({
      id: 'f-engagement',
      title: 'Reduced engagement',
      description: 'Engagement has declined over recent periods based on forum activity and portal sessions.',
      dimensionId: 'engagement',
      severity: engagementSig.severity,
    });
  }

  if (commSig && commSig.trend === 'declining') {
    factors.push({
      id: 'f-comm',
      title: 'Lower communication activity',
      description: 'Communication practice, seminar participation, and peer interaction have decreased.',
      dimensionId: 'skills',
      severity: commSig.severity,
    });
  }

  if (placementSig && placementSig.trend === 'declining') {
    factors.push({
      id: 'f-placement',
      title: 'Reduced placement preparation',
      description: 'Placement-related activity and mock interview preparation are below the student’s previous level.',
      dimensionId: 'placement',
      severity: placementSig.severity,
    });
  }

  if (attendanceSig && attendanceSig.trend === 'declining') {
    factors.push({
      id: 'f-attendance',
      title: 'Attendance variance',
      description: 'Recent lecture and lab check-in consistency has experienced an observable drop.',
      dimensionId: 'attendance',
      severity: attendanceSig.severity,
    });
  }

  if (academicSig && academicSig.trend === 'declining') {
    factors.push({
      id: 'f-academic',
      title: 'Coursework pressure',
      description: 'Recent assignment scores or mid-term checkpoints reflect increased technical difficulty.',
      dimensionId: 'academic',
      severity: academicSig.severity,
    });
  }

  // If no negative factors detected, provide positive growth factors
  if (factors.length === 0) {
    factors.push({
      id: 'f-positive',
      title: 'Consistent habit formation',
      description: 'Regular study rhythms and proactive assignment turn-ins sustain positive growth.',
      dimensionId: 'academic',
      severity: 'LOW',
    });
  }

  let synthesis = '';
  if (isAcademicStableOrStrong && factors.length > 0) {
    synthesis =
      'These indicators appear together with stable academic performance, suggesting that the current concern is more related to engagement and readiness than immediate academic difficulty.';
  } else if (decliningCount > 2) {
    synthesis =
      'Multiple concurrent signals suggest compounded workload or personal fatigue rather than an isolated subject difficulty.';
  } else {
    synthesis =
      'Current patterns indicate healthy academic resilience with standard milestone progression.';
  }

  // 3. WHAT SHOULD HAPPEN NEXT?
  const recommendations: RecommendedAction[] = [];
  let priorityCounter = 1;

  if (commSig && (commSig.trend === 'declining' || commSig.currentValue < 75)) {
    recommendations.push({
      priority: priorityCounter++,
      area: 'Communication',
      action: 'Recommend 2 communication practice sessions this week.',
      studentAction: 'Complete two communication practice sessions or speaking modules.',
      rationale: 'Rebuilds presentation confidence and group discussion agility.',
      expectedEffort: 'Low friction (15-20 min)',
      status: 'recommended',
    });
  }

  if (placementSig && (placementSig.trend === 'declining' || placementSig.currentValue < 75)) {
    recommendations.push({
      priority: priorityCounter++,
      area: 'Placement',
      action: 'Recommend one mock interview and targeted coding practice.',
      studentAction: 'Complete one mock technical interview and 3 targeted coding problems.',
      rationale: 'Closes the gap between theoretical knowledge and interview problem-solving.',
      expectedEffort: 'Moderate (45 min)',
      status: 'recommended',
    });
  }

  if (engagementSig && (engagementSig.trend === 'declining' || engagementSig.currentValue < 70)) {
    recommendations.push({
      priority: priorityCounter++,
      area: 'Engagement',
      action: 'Encourage participation in one relevant academic or peer activity.',
      studentAction: 'Join an upcoming peer study circle or lab collaboration group.',
      rationale: 'Restores collaborative rhythm and social academic connection.',
      expectedEffort: 'Low friction (30 min)',
      status: 'recommended',
    });
  }

  if (attendanceSig && (attendanceSig.trend === 'declining' || attendanceSig.currentValue < 80)) {
    recommendations.push({
      priority: priorityCounter++,
      area: 'Attendance',
      action: 'Recommend supportive attendance follow-up to address scheduling blockers.',
      studentAction: 'Review missed lecture recordings and verify upcoming lab schedules.',
      rationale: 'Prevents compounding syllabus gaps before major evaluations.',
      expectedEffort: 'Low friction (10 min)',
      status: 'recommended',
    });
  }

  if (academicSig && (academicSig.trend === 'declining' || academicSig.currentValue < 70)) {
    recommendations.push({
      priority: priorityCounter++,
      area: 'Academic Support',
      action: 'Recommend targeted academic support and concept revision hours.',
      studentAction: 'Schedule a 1-on-1 office hour with your course instructor for key concepts.',
      rationale: 'Clarifies conceptual bottlenecks in core foundational modules.',
      expectedEffort: 'Moderate (30 min)',
      status: 'recommended',
    });
  }

  // General mentor check-in recommendation
  recommendations.push({
    priority: priorityCounter++,
    area: 'Faculty Support',
    action: 'Consider a short mentor check-in (10-15 minutes).',
    studentAction: 'Connect with your faculty advisor for personalized guidance.',
    rationale: 'Establishes a constructive touchpoint and validates growth priorities.',
    expectedEffort: 'Low friction (15 min)',
    status: 'recommended',
  });

  // 4. WHAT SHOULD BE MONITORED?
  const targets: MonitorTarget[] = [
    {
      name: 'Communication',
      currentValue: commSig?.currentValue ?? 61,
      targetDirection: 'Improving',
      reviewTimeframe: 'Next 7-14 days',
    },
    {
      name: 'Engagement',
      currentValue: engagementSig?.currentValue ?? 54,
      targetDirection: 'Improving',
      reviewTimeframe: 'Next 7-14 days',
    },
    {
      name: 'Placement Readiness',
      currentValue: placementSig?.currentValue ?? 58,
      targetDirection: 'Improving',
      reviewTimeframe: 'Next 14-21 days',
    },
    {
      name: 'Academic Performance',
      currentValue: academicSig?.currentValue ?? 84,
      targetDirection: 'Stable',
      reviewTimeframe: 'Ongoing semester checkpoints',
    },
  ];

  const evidenceUsed = [
    'Success Score (Unified 7-dimension model)',
    '8-week engagement telemetry & portal logins',
    'Attendance tracking records',
    'Communication & peer interaction activity',
    'Placement readiness & mock test benchmarks',
    'Growth Track historical milestones',
    'Silent Struggle behavioral divergence detection',
  ];

  // Student Persona Data
  const studentFocusAreas: string[] = [];
  if (commSig && (commSig.trend === 'declining' || commSig.currentValue < 75)) studentFocusAreas.push('Communication');
  if (placementSig && (placementSig.trend === 'declining' || placementSig.currentValue < 75)) studentFocusAreas.push('Placement Readiness');
  if (engagementSig && (engagementSig.trend === 'declining' || engagementSig.currentValue < 75)) studentFocusAreas.push('Engagement');
  if (studentFocusAreas.length === 0) studentFocusAreas.push('Advanced Projects', 'Research Explorations');

  const studentNextSteps = recommendations.slice(0, 3).map((r, idx) => ({
    stepNumber: idx + 1,
    title: r.area,
    detail: r.studentAction,
  }));

  const studentTrackNext = targets.map((t) => ({
    name: t.name,
    target: t.targetDirection,
  }));

  // Silent Struggle Correlation
  let silentStruggleCorrelation: StudentDecisionIntelligence['silentStruggleCorrelation'];
  if (silentData || (isAcademicStableOrStrong && decliningCount >= 2)) {
    silentStruggleCorrelation = {
      isDetected: true,
      patternDescription:
        'Overall academic performance remains relatively strong, but several behavioral indicators are weakening. This pattern represents an early support opportunity before academic performance is affected.',
      recommendation:
        'Consider a low-friction check-in and monitor engagement, communication, and placement activity.',
    };
  }

  return {
    studentId: unified.id,
    studentName: unified.name,
    studentRoll: unified.studentId,
    department: growthProfile?.branch || 'Computer Science & Engineering',
    semester: growthProfile?.currentSemester || 'Semester VI',
    successScore: successScore.currentScore,
    status: riskProfile.status,
    statusBadge: riskProfile.statusBadge,
    primarySegment: segmentProfile.segmentDef,
    secondarySegments: [],
    whatIsHappening: {
      summary: whatSummary,
      facultyDetail: whatFacultyDetail,
      studentFriendlySummary: whatStudentSummary,
      importantSignals: signals,
    },
    whyMightThisBeHappening: {
      title: 'POSSIBLE CONTRIBUTING FACTORS',
      factors,
      synthesis,
      responsibleNotice:
        'This intelligence identifies plausible contributing patterns based on multi-dimensional telemetry. It does not assert certainty or single-cause determinism.',
    },
    whatShouldHappenNext: {
      title: 'RECOMMENDED NEXT ACTIONS',
      recommendations,
    },
    whatShouldBeMonitored: {
      title: 'WHAT TO MONITOR',
      targets,
      guidance:
        'Review these indicators again after the next intervention/check-in period. Deterministic predictions are avoided; observe directional change across successive review checkpoints.',
    },
    evidenceUsed,
    studentView: {
      insightTitle: 'YOUR DEVELOPMENT INSIGHT',
      headline: whatStudentSummary,
      focusAreas: studentFocusAreas,
      whyThisMatters:
        'Strengthening these areas now builds well-rounded capabilities and interview confidence alongside your strong academic foundation.',
      nextSteps: studentNextSteps,
      trackNext: studentTrackNext,
    },
    silentStruggleCorrelation,
  };
}

/**
 * Computes institution-level decision intelligence from aggregate student records
 */
export function getInstitutionalDecisionIntelligence(): InstitutionalDecisionIntelligence {
  const unified = getAllUnifiedStudents();
  const totalStudents = unified.length;

  // Segment cohorts
  const segmentStats: Record<
    StudentSegmentType,
    {
      count: number;
      academicSum: number;
      placementSum: number;
      successSum: number;
    }
  > = {
    HIGH_PERFORMER: { count: 0, academicSum: 0, placementSum: 0, successSum: 0 },
    CONSISTENT_GROWTH: { count: 0, academicSum: 0, placementSum: 0, successSum: 0 },
    ACADEMIC_STRONG_PLACEMENT_NEEDS_SUPPORT: { count: 0, academicSum: 0, placementSum: 0, successSum: 0 },
    HIGH_POTENTIAL_LOW_ENGAGEMENT: { count: 0, academicSum: 0, placementSum: 0, successSum: 0 },
    EARLY_SUPPORT_NEEDED: { count: 0, academicSum: 0, placementSum: 0, successSum: 0 },
    MULTIPLE_SIGNALS: { count: 0, academicSum: 0, placementSum: 0, successSum: 0 },
    PLACEMENT_READY: { count: 0, academicSum: 0, placementSum: 0, successSum: 0 },
  };

  unified.forEach((student) => {
    const analysis = getStudentSegment(student.id);
    const score = getStudentSuccessScore(student.id);
    const segId = analysis.primarySegment as StudentSegmentType;

    const academicVal = score.dimensions.find((d) => d.id === 'academic')?.currentScore || 80;
    const placementVal = score.dimensions.find((d) => d.id === 'placement')?.currentScore || 70;

    if (segmentStats[segId]) {
      segmentStats[segId].count += 1;
      segmentStats[segId].academicSum += academicVal;
      segmentStats[segId].placementSum += placementVal;
      segmentStats[segId].successSum += score.currentScore;
    }
  });

  const affectedSegments: InstitutionalSegmentInsight[] = (
    Object.keys(segmentStats) as StudentSegmentType[]
  )
    .filter((id) => segmentStats[id].count > 0)
    .map((id) => {
      const stat = segmentStats[id];
      const def = SEGMENT_DEFINITIONS[id];
      const avgAcademic = Math.round(stat.academicSum / stat.count);
      const avgPlacement = Math.round(stat.placementSum / stat.count);
      const avgSuccess = Math.round(stat.successSum / stat.count);

      let observation = '';
      let contributingPattern = '';
      let actions: string[] = [];

      switch (id) {
        case 'ACADEMIC_STRONG_PLACEMENT_NEEDS_SUPPORT':
          observation =
            'Placement readiness is weaker than academic performance across this segment.';
          contributingPattern =
            'Strong academic performance is not consistently translating into placement readiness due to lower interview practice frequency and communication hesitation.';
          actions = [
            'Increase departmental mock interview opportunities',
            'Expand hands-on coding and algorithmic design workshops',
            'Increase communication practice labs in curriculum slots',
            'Monitor placement readiness by department and semester cohort',
          ];
          break;
        case 'HIGH_POTENTIAL_LOW_ENGAGEMENT':
          observation =
            'Students with strong capability are participating less in LMS and collaborative milestones.';
          contributingPattern =
            'High cognitive capability coexists with reduced LMS activity, indicating possible disengagement or lack of challenging material.';
          actions = [
            'Deploy advanced elective challenges and research fellowships',
            'Introduce peer study circle mentorship pairings',
            'Conduct advisor touchpoints focused on career alignment',
          ];
          break;
        case 'EARLY_SUPPORT_NEEDED':
          observation =
            'Students exhibit early single-dimension soft spots while broader metrics remain intact.';
          contributingPattern =
            'Early signals emerge predominantly in attendance or communication before impacting coursework.',
          actions = [
            'Trigger low-friction advisor wellness messages',
            'Provide flexible assignment submission buffer periods',
            'Track 2-week trajectory post initial advisor ping',
          ];
          break;
        case 'MULTIPLE_SIGNALS':
          observation =
            'Coincident drops detected across coursework, attendance, and portal sessions.',
          contributingPattern =
            'Compound academic and personal blockers indicate risk of cascading semester distress.',
          actions = [
            'Prioritize dean-level multi-disciplinary intervention meetings',
            'Coordinate remedial coaching across core modules',
            'Engage student support counselors for holistic backing',
          ];
          break;
        case 'HIGH_PERFORMER':
          observation =
            'Outstanding academic, attendance, and leadership telemetry across all courses.';
          contributingPattern =
            'Disciplined learning rhythms and high self-efficacy support balanced excellence.',
          actions = [
            'Offer undergraduate research and teaching assistantships',
            'Encourage national hackathons and symposium presentations',
          ];
          break;
        case 'CONSISTENT_GROWTH':
          observation =
            'Progressive week-over-week improvements across learning telemetry.',
          contributingPattern =
            'Interventions and guided practice are actively bearing fruit across subjects.',
          actions = [
            'Recognize upward milestone achievements',
            'Encourage continuation of current peer study cadences',
          ];
          break;
        case 'PLACEMENT_READY':
          observation =
            'Technical problem solving, communication, and interview metrics are in peak alignment.',
          contributingPattern =
            'Consistent mock interview scores (> 85%) paired with solid technical problem solving.',
          actions = [
            'Fast-track for Tier-1 enterprise campus recruitment drives',
            'Appoint as peer interview mentors for junior batches',
          ];
          break;
      }

      return {
        segmentId: id,
        segmentName: def.name,
        studentCount: stat.count,
        percentageOfCohort: Math.round((stat.count / totalStudents) * 100),
        avgSuccessScore: avgSuccess,
        avgAcademicScore: avgAcademic,
        avgPlacementScore: avgPlacement,
        observation,
        contributingPattern,
        institutionalActions: actions,
      };
    });

  return {
    totalStudents,
    headlineObservation:
      'Placement readiness is weaker than academic performance across several student segments.',
    executiveSummary:
      'Aggregated cohort telemetry demonstrates high academic competence across engineering branches, but reveals a systemic gap in mock interview readiness and communication confidence. Targeted non-punitive practice initiatives can rapidly elevate placement conversion rates.',
    affectedSegments,
    recommendedInstitutionalFocus: [
      'Increase mock interview opportunities and industry-led resume audits',
      'Expand competitive coding and algorithmic system design preparation',
      'Increase communication practice opportunities and professional presentation labs',
      'Monitor placement readiness trajectory weekly by department and graduation year',
    ],
    monitoringGuidance:
      'Review cohort movement every 14 days following the rollout of departmental practice clinics. Evaluate segment migration from Academic Strong / Placement Support to Placement Ready.',
    evidenceTelemetryCount: totalStudents * 7,
  };
}

/**
 * Segment-specific decision intelligence helper
 */
export function getSegmentDecisionIntelligence(
  segmentType: StudentSegmentType
): SegmentDecisionIntelligence {
  const def = SEGMENT_DEFINITIONS[segmentType];

  switch (segmentType) {
    case 'ACADEMIC_STRONG_PLACEMENT_NEEDS_SUPPORT':
      return {
        segmentId: segmentType,
        name: def.name,
        what: 'Students show strong academic indicators but comparatively weaker placement readiness.',
        why: 'Placement preparation, communication, and interview-readiness indicators are lower than academic indicators.',
        next: [
          'Prioritize mock interview simulations',
          'Deploy communication and group discussion practice',
          'Assign targeted coding interview problems',
          'Schedule resume and behavioral interview preparation clinics',
        ],
        monitor: [
          'Placement Readiness score',
          'Skills & Communication index',
          'Placement portal activity and mock completion rate',
        ],
      };
    case 'HIGH_POTENTIAL_LOW_ENGAGEMENT':
      return {
        segmentId: segmentType,
        name: def.name,
        what: 'Students with demonstrated high capability exhibit low or declining portal participation.',
        why: 'High cognitive aptitude coexists with diminished LMS activity, pointing toward disengagement or unchallenging material.',
        next: [
          'Offer advanced technical challenges or research electives',
          'Introduce collaborative peer problem-solving circles',
          'Schedule an exploratory advisor coffee check-in',
        ],
        monitor: [
          'Weekly LMS access frequency',
          'Discussion forum participation',
          'Elective project submission timestamps',
        ],
      };
    case 'EARLY_SUPPORT_NEEDED':
      return {
        segmentId: segmentType,
        name: def.name,
        what: 'Students exhibit meaningful early warning signals across one or two operational vectors.',
        why: 'Isolated dips in attendance, communication, or feedback precede academic impact.',
        next: [
          'Dispatch a low-friction advisor care message',
          'Clarify upcoming assessment milestones and deadlines',
          'Provide self-guided revision resources',
        ],
        monitor: [
          'Attendance trajectory over next 14 days',
          'LMS coursework engagement',
          'Advisor message read and reply latency',
        ],
      };
    case 'MULTIPLE_SIGNALS':
      return {
        segmentId: segmentType,
        name: def.name,
        what: 'Multiple indicators are declining simultaneously across academic, behavioral, and readiness areas.',
        why: 'Compounded stressors or multi-subject difficulty indicate elevated risk of semester disengagement.',
        next: [
          'Schedule a structured advisor-student support conference',
          'Coordinate individualized remedial study plans',
          'Involve departmental student wellness coordinators',
        ],
        monitor: [
          'Coursework quiz and midterm scores',
          'Attendance continuity',
          'Student self-reflection sentiment',
        ],
      };
    case 'HIGH_PERFORMER':
      return {
        segmentId: segmentType,
        name: def.name,
        what: 'Students exhibit high mastery across academics, attendance, and technical projects with zero negative signals.',
        why: 'Strong internal motivation and rigorous study discipline maintain balanced excellence.',
        next: [
          'Invite to undergraduate research symposiums and patent mentorship',
          'Engage as peer mentors for junior cohorts',
        ],
        monitor: [
          'Balanced workload to prevent burnout',
          'Advanced technical challenge completions',
        ],
      };
    case 'CONSISTENT_GROWTH':
      return {
        segmentId: segmentType,
        name: def.name,
        what: 'Indicators show positive upward trajectory across multiple learning checkpoints over time.',
        why: 'Constructive feedback and sustained study cadences are driving measurable progress.',
        next: [
          'Celebrate upward milestone gains',
          'Set incremental next-level technical goals',
        ],
        monitor: [
          'Success Score trajectory slope',
          'Milestone completion punctuality',
        ],
      };
    case 'PLACEMENT_READY':
      return {
        segmentId: segmentType,
        name: def.name,
        what: 'Students demonstrate high placement scores, strong communication, and robust coding capabilities.',
        why: 'Extensive interview practice and high aptitude test performance match industry hiring standards.',
        next: [
          'Connect with top-tier campus recruitment drives',
          'Facilitate mock interview leadership roles',
        ],
        monitor: [
          'Company-specific interview conversion rates',
          'Offer acceptances and onboarding timeline',
        ],
      };
  }
}
