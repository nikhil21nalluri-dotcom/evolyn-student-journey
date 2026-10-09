/**
 * INTERVENTION INTELLIGENCE ENGINE
 * 
 * Evolution Step 7: Moves from Detection -> Explanation -> Decision -> Action.
 * 
 * Strictly consumes existing Evolyn data layers:
 * - Unified Student Profiles (unifiedStudentData.ts)
 * - Student Success Score (studentSuccessScore.ts)
 * - Risk & Early Signal Intelligence (studentRiskEngine.ts)
 * - Student Segmentation (studentSegmentationEngine.ts)
 * - Silent Struggle telemetry (silentStruggleData.ts)
 * - AI Decision Intelligence (studentDecisionEngine.ts)
 * 
 * Responsible AI Notice:
 * All interventions are advisory recommendations, never automated punitive actions.
 * Faculty always remains in active pedagogical control.
 */

import {
  getUnifiedStudentProfile,
  getAllUnifiedStudents,
  UnifiedStudentProfile,
} from './unifiedStudentData';
import { getStudentSuccessScore } from './studentSuccessScore';
import { getStudentRiskProfile, RiskStatus } from './studentRiskEngine';
import { getStudentSegment } from './studentSegmentationEngine';
import { SILENT_STRUGGLE_STUDENTS } from './silentStruggleData';

export type InterventionPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type InterventionStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface BeforeMetrics {
  successScore: number;
  communication: number;
  engagement: number;
  placementReadiness: number;
  attendance: number;
}

export interface OutcomeReview {
  reviewDate: string;
  evaluatorName: string;
  evaluatorRole: string;
  afterMetrics: BeforeMetrics;
  metricsDelta: {
    successScoreChange: number;
    communicationChange: number;
    engagementChange: number;
    placementChange: number;
    attendanceChange: number;
  };
  outcomeRating: 'EXCEEDED_EXPECTATIONS' | 'PROGRESS_OBSERVED' | 'MAINTAINED' | 'ADDITIONAL_SUPPORT_NEEDED';
  qualitativeOutcomeNotes: string;
  recommendedNextStep: string;
}

export interface InterventionRecord {
  id: string;
  studentId: string;
  studentName: string;
  actionType: string; // e.g. 'Communication Practice', 'Mock Interview', 'Mentor Check-in', 'Coding Practice', 'Academic Support'
  reason: string;
  priority: InterventionPriority;
  facultyName: string;
  facultyRole: string;
  date: string; // Formatted date e.g. 'Oct 8, 2026' or 'Today'
  status: InterventionStatus;
  notes?: string;
  totalSessions?: number;
  completedSessions?: number;
  beforeMetrics: BeforeMetrics;
  outcomeReview?: OutcomeReview;
}

export interface SupportPlanActionItem {
  id: string;
  title: string;
  totalSessions: number;
  completedSessions: number;
  iconType: 'communication' | 'interview' | 'coding' | 'mentor' | 'academic';
  completedFlag: boolean;
}

export interface StudentSupportPlan {
  id: string;
  studentId: string;
  studentName: string;
  primaryFocus: string;
  goal: string;
  actionItems: SupportPlanActionItem[];
  reviewPeriod: string; // e.g. 'Next 2 weeks'
  notes: string;
  facultyAuthor: string;
  createdAt: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PLANNED';
}

export interface InterventionRecommendation {
  id: string;
  type: string;
  title: string;
  reason: string;
  suggestedAction: string;
  priority: InterventionPriority;
  actionButtonText: string;
  actionType: 'recommend-practice' | 'schedule-checkin' | 'assign-mentor' | 'coding-practice' | 'create-support-plan';
  defaultSessions?: number;
  area: string;
}

export interface StudentInterventionIntelligence {
  studentId: string;
  studentName: string;
  studentRoll: string;
  department: string;
  semester: string;
  successScore: number;
  status: RiskStatus;
  segmentName: string;
  segmentDescription: string;
  primaryFocus: string[];
  recommendedIntervention: string; // e.g. 'LOW-FRICTION SUPPORT'
  reason: string;
  recommendedActions: InterventionRecommendation[];
  silentStruggleGuidance?: string;
  beforeMetrics: BeforeMetrics;
}

/**
 * Extracts baseline "Before Metrics" from the current student profile
 * (Prepares for upcoming feature without calculating effectiveness yet)
 */
export function extractBeforeMetrics(studentIdOrName: string): BeforeMetrics {
  const unified = getUnifiedStudentProfile(studentIdOrName);
  const scoreData = getStudentSuccessScore(studentIdOrName);
  const commScore = unified.skills?.softSkillAssessments?.communication ?? 65;
  const engScore = unified.engagement?.participationScore ?? 70;
  const placementScore = unified.placement?.aptitudeScore ?? 68;
  const attendanceScore = unified.attendance?.overallPercentage ?? 85;

  return {
    successScore: scoreData.currentScore,
    communication: commScore,
    engagement: engScore,
    placementReadiness: placementScore,
    attendance: attendanceScore,
  };
}

/**
 * Computes Intervention Intelligence for an individual student.
 * Synthesizes Success Score, Risk Profile, Segmentation, and Silent Struggle.
 */
export function getStudentInterventionIntelligence(
  studentIdOrName: string
): StudentInterventionIntelligence {
  const unified = getUnifiedStudentProfile(studentIdOrName);
  const scoreData = getStudentSuccessScore(studentIdOrName);
  const riskProfile = getStudentRiskProfile(studentIdOrName);
  const segment = getStudentSegment(studentIdOrName);
  const beforeMetrics = extractBeforeMetrics(studentIdOrName);

  const silentMatch = SILENT_STRUGGLE_STUDENTS.find(
    (s) => s.id === unified.id || s.studentId === unified.studentId
  );

  const commSignal = riskProfile.signals.find((s) => s.category === 'communication');
  const placementSignal = riskProfile.signals.find((s) => s.category === 'placement');
  const engagementSignal = riskProfile.signals.find((s) => s.category === 'engagement');
  const academicSignal = riskProfile.signals.find((s) => s.category === 'academic');
  const attendanceSignal = riskProfile.signals.find((s) => s.category === 'attendance');

  const isAcademicStable =
    (academicSignal?.currentValue ?? 80) >= 75 && academicSignal?.trend !== 'declining';

  // Primary Focus Areas based on declining/sub-optimal indicators
  const focusAreas: string[] = [];
  if (commSignal && (commSignal.trend === 'declining' || commSignal.currentValue < 75)) {
    focusAreas.push('Communication');
  }
  if (placementSignal && (placementSignal.trend === 'declining' || placementSignal.currentValue < 75)) {
    focusAreas.push('Placement Readiness');
  }
  if (engagementSignal && (engagementSignal.trend === 'declining' || engagementSignal.currentValue < 75)) {
    focusAreas.push('Engagement');
  }
  if (attendanceSignal && (attendanceSignal.trend === 'declining' || attendanceSignal.currentValue < 80)) {
    focusAreas.push('Attendance');
  }
  if (academicSignal && (academicSignal.trend === 'declining' || academicSignal.currentValue < 70)) {
    focusAreas.push('Academic Momentum');
  }
  if (focusAreas.length === 0) {
    focusAreas.push('Placement Readiness', 'Advanced Technical Mentoring');
  }

  // Recommended Intervention Headline & Rationale
  let recommendedIntervention = 'LOW-FRICTION SUPPORT';
  let interventionReason = '';

  if (isAcademicStable && (focusAreas.includes('Communication') || focusAreas.includes('Placement Readiness'))) {
    recommendedIntervention = 'LOW-FRICTION SUPPORT';
    interventionReason =
      'Academic performance remains stable, while communication, engagement and placement-readiness indicators are declining.';
  } else if (riskProfile.status === 'MULTIPLE SIGNALS') {
    recommendedIntervention = 'COLLABORATIVE ADVISORY CARE';
    interventionReason =
      'Multiple concurrent behavioral and coursework indicators indicate compounded workload or fatigue.';
  } else if (riskProfile.status === 'EARLY SIGNAL') {
    recommendedIntervention = 'LOW-FRICTION SUPPORT';
    interventionReason =
      'Early divergence observed in practical readiness and participation while core coursework remains intact.';
  } else {
    recommendedIntervention = 'GROWTH ENHANCEMENT';
    interventionReason =
      'Student exhibits positive stability; recommended support centers on competitive placement elevation and honors projects.';
  }

  // Specific Actionable Recommendations based strictly on existing indicators
  const recommendations: InterventionRecommendation[] = [];

  // 1. Communication Practice
  if (commSignal && (commSignal.trend === 'declining' || commSignal.currentValue < 75)) {
    const isPriorityHigh = commSignal.severity === 'HIGH' || commSignal.trend === 'declining';
    recommendations.push({
      id: 'rec-comm',
      type: 'Communication Practice',
      title: 'Communication Practice',
      reason: 'Communication indicators are below the student\'s stronger academic indicators.',
      suggestedAction: 'Recommend 2 communication practice sessions.',
      priority: isPriorityHigh ? 'HIGH' : 'MEDIUM',
      actionButtonText: 'Recommend Practice',
      actionType: 'recommend-practice',
      defaultSessions: 2,
      area: 'Communication',
    });
  }

  // 2. Mock Interview
  if (placementSignal && (placementSignal.trend === 'declining' || placementSignal.currentValue < 75)) {
    const isPriorityHigh = placementSignal.severity === 'HIGH' || placementSignal.trend === 'declining';
    recommendations.push({
      id: 'rec-mock',
      type: 'Mock Interview',
      title: 'Mock Interview',
      reason: 'Placement readiness is below the student\'s academic performance.',
      suggestedAction: 'Schedule one mock interview.',
      priority: isPriorityHigh ? 'HIGH' : 'MEDIUM',
      actionButtonText: 'Schedule Check-in',
      actionType: 'schedule-checkin',
      defaultSessions: 1,
      area: 'Placement Readiness',
    });
  }

  // 3. Mentor Check-in
  if (
    (engagementSignal && (engagementSignal.trend === 'declining' || engagementSignal.currentValue < 75)) ||
    riskProfile.decliningSignalsCount >= 2 ||
    silentMatch
  ) {
    recommendations.push({
      id: 'rec-mentor',
      type: 'Mentor Check-in',
      title: 'Mentor Check-in',
      reason: 'Multiple behavioral indicators are declining.',
      suggestedAction: 'Schedule a short supportive mentor conversation.',
      priority: riskProfile.status === 'MULTIPLE SIGNALS' ? 'HIGH' : 'MEDIUM',
      actionButtonText: 'Assign Mentor',
      actionType: 'assign-mentor',
      defaultSessions: 1,
      area: 'Behavioral & Wellbeing',
    });
  }

  // 4. Coding Practice
  if (
    (placementSignal && placementSignal.currentValue < 80) ||
    (unified.placement?.codingScore && unified.placement.codingScore < 75) ||
    recommendations.length < 3
  ) {
    recommendations.push({
      id: 'rec-coding',
      type: 'Coding Practice',
      title: 'Coding Practice',
      reason: 'Technical/placement readiness indicators need improvement.',
      suggestedAction: 'Recommend targeted coding practice.',
      priority: 'MEDIUM',
      actionButtonText: 'Recommend Practice',
      actionType: 'coding-practice',
      defaultSessions: 3,
      area: 'Technical Readiness',
    });
  }

  // 5. Academic Support (if academic indicators require it)
  if (academicSignal && (academicSignal.trend === 'declining' || academicSignal.currentValue < 75)) {
    recommendations.push({
      id: 'rec-academic',
      type: 'Academic Support',
      title: 'Academic Support',
      reason: 'Coursework mastery indicators indicate conceptual difficulty in recent modules.',
      suggestedAction: 'Schedule recitation review with peer tutor or faculty office hours.',
      priority: academicSignal.severity === 'HIGH' ? 'HIGH' : 'MEDIUM',
      actionButtonText: 'Schedule Check-in',
      actionType: 'schedule-checkin',
      defaultSessions: 2,
      area: 'Academic Coursework',
    });
  }

  // Silent struggle connection (Requirement 14)
  let silentStruggleGuidance: string | undefined = undefined;
  if (silentMatch || (scoreData.currentScore >= 75 && riskProfile.status === 'EARLY SIGNAL')) {
    silentStruggleGuidance =
      'Consider a short mentor check-in before the pattern becomes more pronounced. Telemetry reflects quiet effort with subtle behavioral softening.';
  }

  return {
    studentId: unified.id,
    studentName: unified.name,
    studentRoll: unified.studentId,
    department: unified.branch,
    semester: unified.currentSemester,
    successScore: scoreData.currentScore,
    status: riskProfile.status,
    segmentName: segment.segmentDef.name,
    segmentDescription: segment.segmentDef.description,
    primaryFocus: focusAreas,
    recommendedIntervention,
    reason: interventionReason,
    recommendedActions: recommendations,
    silentStruggleGuidance,
    beforeMetrics,
  };
}

/**
 * Initial seed intervention records representing historical and active support across the cohort.
 * Follows exact prompt specifications (Arjun Kumar history, accurate cohort statistics).
 */
export const INITIAL_INTERVENTION_RECORDS: InterventionRecord[] = [
  // Arjun Kumar records (matches prompt timeline exactly)
  {
    id: 'int-ak-1',
    studentId: 'arjun-kumar',
    studentName: 'Arjun Kumar',
    actionType: 'Communication Practice',
    reason: 'Communication indicators declining',
    priority: 'HIGH',
    facultyName: 'Prof. Elena Vance',
    facultyRole: 'Faculty Advisor, CSE',
    date: 'Oct 8, 2026',
    status: 'ACTIVE',
    notes: 'Discussed placement preparation with student. Student agreed to complete two mock interviews and speaking sessions.',
    totalSessions: 2,
    completedSessions: 1,
    beforeMetrics: {
      successScore: 78,
      communication: 62,
      engagement: 68,
      placementReadiness: 64,
      attendance: 88,
    },
  },
  {
    id: 'int-ak-2',
    studentId: 'arjun-kumar',
    studentName: 'Arjun Kumar',
    actionType: 'Mentor Check-in',
    reason: 'Multiple behavioral indicators are declining',
    priority: 'MEDIUM',
    facultyName: 'Dr. Sunita Rao',
    facultyRole: 'Associate Professor & Mentor',
    date: 'Oct 6, 2026',
    status: 'COMPLETED',
    notes: 'Check-in on semester workload. Student reported feeling comfortable with algorithms but hesitant during seminar presentations.',
    totalSessions: 1,
    completedSessions: 1,
    beforeMetrics: {
      successScore: 79,
      communication: 60,
      engagement: 67,
      placementReadiness: 63,
      attendance: 88,
    },
  },
  {
    id: 'int-ak-3',
    studentId: 'arjun-kumar',
    studentName: 'Arjun Kumar',
    actionType: 'Mock Interview',
    reason: 'Placement readiness is below student academic performance',
    priority: 'HIGH',
    facultyName: 'Prof. V. Ramanathan',
    facultyRole: 'Placement Coordinator',
    date: 'Oct 2, 2026',
    status: 'COMPLETED',
    notes: 'Completed technical coding round with strong logic; recommended verbal practice for system design.',
    totalSessions: 1,
    completedSessions: 1,
    beforeMetrics: {
      successScore: 80,
      communication: 58,
      engagement: 70,
      placementReadiness: 62,
      attendance: 90,
    },
  },
  {
    id: 'int-ak-4',
    studentId: 'arjun-kumar',
    studentName: 'Arjun Kumar',
    actionType: 'Coding Practice',
    reason: 'Technical/placement readiness indicators need improvement',
    priority: 'MEDIUM',
    facultyName: 'Prof. Elena Vance',
    facultyRole: 'Faculty Advisor, CSE',
    date: 'Oct 8, 2026',
    status: 'PLANNED',
    notes: 'Assigned 3 targeted dynamic programming and graph practice sets in LMS.',
    totalSessions: 3,
    completedSessions: 0,
    beforeMetrics: {
      successScore: 78,
      communication: 62,
      engagement: 68,
      placementReadiness: 64,
      attendance: 88,
    },
  },

  // Cohort Seed Records (Supporting realistic Administrator aggregations)
  // Priya Sharma
  {
    id: 'int-ps-1',
    studentId: 'st-001',
    studentName: 'Priya Sharma',
    actionType: 'Communication Practice',
    reason: 'Honors seminar symposium preparation',
    priority: 'LOW',
    facultyName: 'Prof. Elena Vance',
    facultyRole: 'Faculty Advisor',
    date: 'Oct 7, 2026',
    status: 'ACTIVE',
    notes: 'Practicing keynote delivery for undergrad research showcase.',
    totalSessions: 2,
    completedSessions: 2,
    beforeMetrics: {
      successScore: 84,
      communication: 82,
      engagement: 86,
      placementReadiness: 88,
      attendance: 95,
    },
  },
  {
    id: 'int-ps-2',
    studentId: 'st-001',
    studentName: 'Priya Sharma',
    actionType: 'Mentor Check-in',
    reason: 'Advisory check-in on research fellowships',
    priority: 'LOW',
    facultyName: 'Dr. Sunita Rao',
    facultyRole: 'Research Mentor',
    date: 'Oct 4, 2026',
    status: 'COMPLETED',
    notes: 'Reviewed ACM student paper draft.',
    totalSessions: 1,
    completedSessions: 1,
    beforeMetrics: {
      successScore: 83,
      communication: 80,
      engagement: 85,
      placementReadiness: 87,
      attendance: 95,
    },
  },

  // Marcus Vance
  {
    id: 'int-mv-1',
    studentId: 'st-002',
    studentName: 'Marcus Vance',
    actionType: 'Academic Support',
    reason: 'Coursework mastery in asymptotic analysis',
    priority: 'HIGH',
    facultyName: 'Prof. Elena Vance',
    facultyRole: 'Instructor',
    date: 'Oct 5, 2026',
    status: 'ACTIVE',
    notes: 'Assigned remedial visualization lab on topological graph sorts.',
    totalSessions: 2,
    completedSessions: 1,
    beforeMetrics: {
      successScore: 68,
      communication: 74,
      engagement: 65,
      placementReadiness: 60,
      attendance: 82,
    },
  },
  {
    id: 'int-mv-2',
    studentId: 'st-002',
    studentName: 'Marcus Vance',
    actionType: 'Mentor Check-in',
    reason: 'Multiple behavioral indicators are declining',
    priority: 'MEDIUM',
    facultyName: 'Sarah Jenkins',
    facultyRole: 'Advisory Mentor',
    date: 'Oct 3, 2026',
    status: 'COMPLETED',
    notes: 'Encouraging check-in on exam confidence.',
    totalSessions: 1,
    completedSessions: 1,
    beforeMetrics: {
      successScore: 69,
      communication: 72,
      engagement: 66,
      placementReadiness: 61,
      attendance: 84,
    },
  },

  // Sofia Chen
  {
    id: 'int-sc-1',
    studentId: 'st-003',
    studentName: 'Sofia Chen',
    actionType: 'Mock Interview',
    reason: 'Tier-1 tech company recruitment preparation',
    priority: 'MEDIUM',
    facultyName: 'Prof. V. Ramanathan',
    facultyRole: 'Placement Coordinator',
    date: 'Oct 6, 2026',
    status: 'COMPLETED',
    notes: 'Exceptional system architecture presentation.',
    totalSessions: 1,
    completedSessions: 1,
    beforeMetrics: {
      successScore: 88,
      communication: 86,
      engagement: 89,
      placementReadiness: 90,
      attendance: 96,
    },
  },
  {
    id: 'int-sc-2',
    studentId: 'st-003',
    studentName: 'Sofia Chen',
    actionType: 'Communication Practice',
    reason: 'Executive tech lead communication polish',
    priority: 'LOW',
    facultyName: 'Dr. Sunita Rao',
    facultyRole: 'Department Chair',
    date: 'Oct 1, 2026',
    status: 'COMPLETED',
    notes: 'Completed industry panel simulation.',
    totalSessions: 2,
    completedSessions: 2,
    beforeMetrics: {
      successScore: 87,
      communication: 85,
      engagement: 88,
      placementReadiness: 89,
      attendance: 96,
    },
  },

  // Devon Price
  {
    id: 'int-dp-1',
    studentId: 'st-004',
    studentName: 'Devon Price',
    actionType: 'Mentor Check-in',
    reason: 'Multiple behavioral indicators are declining',
    priority: 'HIGH',
    facultyName: 'Prof. Elena Vance',
    facultyRole: 'Faculty Advisor',
    date: 'Oct 7, 2026',
    status: 'ACTIVE',
    notes: 'Discussed studio project pacing and peer review anxiety.',
    totalSessions: 1,
    completedSessions: 0,
    beforeMetrics: {
      successScore: 71,
      communication: 65,
      engagement: 62,
      placementReadiness: 66,
      attendance: 80,
    },
  },
  {
    id: 'int-dp-2',
    studentId: 'st-004',
    studentName: 'Devon Price',
    actionType: 'Communication Practice',
    reason: 'Presentation readiness in team design sprint',
    priority: 'MEDIUM',
    facultyName: 'Sarah Jenkins',
    facultyRole: 'Project Mentor',
    date: 'Oct 3, 2026',
    status: 'COMPLETED',
    notes: 'Reviewed project slide deck and practiced cadence.',
    totalSessions: 2,
    completedSessions: 2,
    beforeMetrics: {
      successScore: 72,
      communication: 64,
      engagement: 63,
      placementReadiness: 65,
      attendance: 82,
    },
  },

  // Aaliyah Patel
  {
    id: 'int-ap-1',
    studentId: 'st-005',
    studentName: 'Aaliyah Patel',
    actionType: 'Mock Interview',
    reason: 'Placement readiness is below student academic performance',
    priority: 'HIGH',
    facultyName: 'Prof. V. Ramanathan',
    facultyRole: 'Placement Coordinator',
    date: 'Oct 8, 2026',
    status: 'PLANNED',
    notes: 'Scheduled mock technical round focused on cloud database indexing.',
    totalSessions: 1,
    completedSessions: 0,
    beforeMetrics: {
      successScore: 76,
      communication: 70,
      engagement: 74,
      placementReadiness: 68,
      attendance: 89,
    },
  },
  {
    id: 'int-ap-2',
    studentId: 'st-005',
    studentName: 'Aaliyah Patel',
    actionType: 'Coding Practice',
    reason: 'Technical/placement readiness indicators need improvement',
    priority: 'MEDIUM',
    facultyName: 'Dr. Sunita Rao',
    facultyRole: 'Faculty Advisor',
    date: 'Oct 5, 2026',
    status: 'ACTIVE',
    notes: 'Assigned 4 backend concurrency problems in LMS repository.',
    totalSessions: 4,
    completedSessions: 2,
    beforeMetrics: {
      successScore: 76,
      communication: 70,
      engagement: 74,
      placementReadiness: 68,
      attendance: 89,
    },
  },
];

/**
 * Initial seed Support Plan for Arjun Kumar (Requirement 7 & 9)
 */
export const INITIAL_SUPPORT_PLANS: StudentSupportPlan[] = [
  {
    id: 'plan-ak-1',
    studentId: 'arjun-kumar',
    studentName: 'Arjun Kumar',
    primaryFocus: 'Communication + Placement Readiness',
    goal: 'Improve communication and interview readiness.',
    actionItems: [
      {
        id: 'act-1',
        title: 'Communication Practice',
        totalSessions: 2,
        completedSessions: 1,
        iconType: 'communication',
        completedFlag: false,
      },
      {
        id: 'act-2',
        title: 'Mock Interview',
        totalSessions: 1,
        completedSessions: 0,
        iconType: 'interview',
        completedFlag: false,
      },
      {
        id: 'act-3',
        title: 'Mentor Check-in',
        totalSessions: 1,
        completedSessions: 1,
        iconType: 'mentor',
        completedFlag: true,
      },
      {
        id: 'act-4',
        title: 'Coding Practice',
        totalSessions: 3,
        completedSessions: 1,
        iconType: 'coding',
        completedFlag: false,
      },
    ],
    reviewPeriod: 'Next 2 weeks',
    notes: 'Focus on confidence, interview communication and consistent placement preparation.',
    facultyAuthor: 'Prof. Elena Vance (Advisor)',
    createdAt: 'Oct 8, 2026',
    status: 'ACTIVE',
  },
];
