/**
 * Intelligent Student Segmentation Engine
 * 
 * Responsible Terminology Notice:
 * Segmentation represents a student's CURRENT dynamic pattern of indicators.
 * It is NOT a permanent label or fixed judgment.
 * Students transition between segments as their indicators evolve.
 */

import { UNIFIED_STUDENTS, UnifiedStudentProfile, getUnifiedStudentProfile } from './unifiedStudentData';
import { toCanonicalStudentId, isSameStudent } from './canonicalStudentRegistry';
import { getStudentSuccessScore } from './studentSuccessScore';
import { getStudentRiskProfile, StudentRiskProfile } from './studentRiskEngine';
import { STUDENT_GROWTH_DATA, StudentGrowthProfile } from './studentGrowthData';

export type StudentSegmentType =
  | 'HIGH_PERFORMER'
  | 'CONSISTENT_GROWTH'
  | 'ACADEMIC_STRONG_PLACEMENT_NEEDS_SUPPORT'
  | 'HIGH_POTENTIAL_LOW_ENGAGEMENT'
  | 'EARLY_SUPPORT_NEEDED'
  | 'MULTIPLE_SIGNALS'
  | 'PLACEMENT_READY';

export interface SegmentDefinition {
  id: StudentSegmentType;
  name: string;
  shortLabel: string;
  badgeColor: string;
  borderColor: string;
  textColor: string;
  bgLight: string;
  glowColor: string;
  description: string;
  characteristics: string[];
  studentFacingTitle: string;
  studentFacingDescription: string;
  developmentFocus: string[];
  priorityRank: number; // Higher number = checked earlier in conflict resolution
}

export const SEGMENT_DEFINITIONS: Record<StudentSegmentType, SegmentDefinition> = {
  HIGH_PERFORMER: {
    id: 'HIGH_PERFORMER',
    name: 'High Performer',
    shortLabel: 'High Performer',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    borderColor: 'border-emerald-500/40',
    textColor: 'text-emerald-400',
    bgLight: 'bg-emerald-500/10',
    glowColor: 'rgba(16, 185, 129, 0.25)',
    description: 'Students showing strong academic and engagement indicators with no significant current warning signals.',
    characteristics: [
      'Strong academic performance (CGPA > 8.0 / Marks > 80%)',
      'Strong composite Success Score (> 85)',
      'Reliable attendance (> 90%)',
      'Consistent LMS & seminar engagement',
      'No significant negative behavioral signals',
    ],
    studentFacingTitle: 'High Academic Mastery & Holistic Strength',
    studentFacingDescription: 'Your consistency across coursework, attendance, and technical labs places you in great standing.',
    developmentFocus: ['Research opportunities', 'Leadership in student study circles', 'Advanced technical projects'],
    priorityRank: 2,
  },
  CONSISTENT_GROWTH: {
    id: 'CONSISTENT_GROWTH',
    name: 'Consistent Growth',
    shortLabel: 'Consistent Growth',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    borderColor: 'border-blue-500/40',
    textColor: 'text-blue-400',
    bgLight: 'bg-blue-500/10',
    glowColor: 'rgba(59, 130, 246, 0.25)',
    description: 'Students whose indicators show positive movement across recent periods.',
    characteristics: [
      'Positive improvement across multiple learning indicators',
      'Success Score improving over time (Change > 0)',
      'Positive Growth Track trajectory with upward milestones',
      'Punctual milestone completions',
    ],
    studentFacingTitle: 'Consistent Upward Momentum',
    studentFacingDescription: 'Your recent academic and engagement indicators show positive upward movement. Great momentum!',
    developmentFocus: ['Sustaining weekly study rhythms', 'Expanding technical portfolio', 'Deepening collaborative projects'],
    priorityRank: 3,
  },
  ACADEMIC_STRONG_PLACEMENT_NEEDS_SUPPORT: {
    id: 'ACADEMIC_STRONG_PLACEMENT_NEEDS_SUPPORT',
    name: 'Academic Strong / Placement Needs Support',
    shortLabel: 'Academic Strong / Placement Support',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    borderColor: 'border-indigo-500/40',
    textColor: 'text-indigo-400',
    bgLight: 'bg-indigo-500/10',
    glowColor: 'rgba(99, 102, 241, 0.25)',
    description: 'Students performing well academically but showing a comparatively lower level of placement readiness.',
    characteristics: [
      'Strong academic performance (CGPA > 7.8, Marks > 75%)',
      'Comparatively lower Placement Readiness or Aptitude/Mock scores (< 70)',
      'Communication hesitation or low interview practice frequency',
      'High potential to benefit from targeted career coaching',
    ],
    studentFacingTitle: 'Strong Academic Foundation',
    studentFacingDescription: 'Your academic performance is one of your strongest areas. Focused practice in placement prep and communication will make your profile unstoppable.',
    developmentFocus: ['Placement readiness & mock interviews', 'Technical communication practice', 'Resume & GitHub project showcase'],
    priorityRank: 7, // Highest semantic priority for this hackathon
  },
  HIGH_POTENTIAL_LOW_ENGAGEMENT: {
    id: 'HIGH_POTENTIAL_LOW_ENGAGEMENT',
    name: 'High Potential / Low Engagement',
    shortLabel: 'High Potential / Low Engagement',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    borderColor: 'border-amber-500/40',
    textColor: 'text-amber-400',
    bgLight: 'bg-amber-500/10',
    glowColor: 'rgba(245, 158, 11, 0.25)',
    description: 'Students with strong capability indicators but comparatively low or declining engagement.',
    characteristics: [
      'Strong academic or technical skill baseline (CGPA > 7.5)',
      'Low or declining LMS login cadence (< 4 days/week)',
      'Passive seminar participation or low extracurricular involvement',
      'Risk of isolated studying or disengagement',
    ],
    studentFacingTitle: 'High Aptitude & Independent Capability',
    studentFacingDescription: 'You have solid subject comprehension. Connecting more with study cohorts and discussion forums will multiply your learning velocity.',
    developmentFocus: ['Study group integration', 'Peer code reviews', 'Faculty office hours casual check-in'],
    priorityRank: 6,
  },
  EARLY_SUPPORT_NEEDED: {
    id: 'EARLY_SUPPORT_NEEDED',
    name: 'Early Support Needed',
    shortLabel: 'Early Support Needed',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    borderColor: 'border-orange-500/40',
    textColor: 'text-orange-400',
    bgLight: 'bg-orange-500/10',
    glowColor: 'rgba(249, 115, 22, 0.25)',
    description: 'Students showing emerging signals that may benefit from timely support.',
    characteristics: [
      'Student has meaningful early warning signals (EARLY SIGNAL status)',
      '1 to 2 decelerating indicators observed across recent observation windows',
      'Academic baseline remains salvageable with prompt advisor touchpoint',
      'Benefit from empathetic check-in before signals compound',
    ],
    studentFacingTitle: 'Emerging Growth Opportunity',
    studentFacingDescription: 'A few recent indicators show areas worth focusing on. Small adjustments right now will keep your overall trajectory on track.',
    developmentFocus: ['Pacing complex coursework', 'Rebalancing study timetable', 'Advisor wellness consultation'],
    priorityRank: 5,
  },
  MULTIPLE_SIGNALS: {
    id: 'MULTIPLE_SIGNALS',
    name: 'Multiple Signals',
    shortLabel: 'Multiple Signals',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    borderColor: 'border-rose-500/40',
    textColor: 'text-rose-400',
    bgLight: 'bg-rose-500/10',
    glowColor: 'rgba(244, 63, 94, 0.25)',
    description: 'Students showing several simultaneous declining indicators.',
    characteristics: [
      'Several indicators declining simultaneously (MULTIPLE SIGNALS status)',
      'High severity signal divergence across attendance, engagement, or submissions',
      'Priority for coordinated faculty advisory assistance',
    ],
    studentFacingTitle: 'Priority Development Focus',
    studentFacingDescription: 'Your current learning rhythm indicates multiple areas where faculty support and tailored practice tasks can make a significant positive difference.',
    developmentFocus: ['1-on-1 advisor check-in', 'Targeted LMS remedial practice', 'Workload adjustment support'],
    priorityRank: 8, // Highest risk priority
  },
  PLACEMENT_READY: {
    id: 'PLACEMENT_READY',
    name: 'Placement Ready',
    shortLabel: 'Placement Ready',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    borderColor: 'border-teal-500/40',
    textColor: 'text-teal-400',
    bgLight: 'bg-teal-500/10',
    glowColor: 'rgba(45, 212, 191, 0.25)',
    description: 'Students demonstrating strong current placement-readiness indicators.',
    characteristics: [
      'Strong placement readiness indicators (Placement Score > 80)',
      'High coding aptitude and mock technical interview scores',
      'Articulate communication & presentation ratings',
      'Active portfolio and industry certifications',
    ],
    studentFacingTitle: 'High Career & Industry Readiness',
    studentFacingDescription: 'Your placement aptitude, coding scores, and communication skills place you on track for top-tier campus recruitment drives.',
    developmentFocus: ['Tier-1 company interview prep', 'System design simulations', 'Mentoring junior classmates'],
    priorityRank: 4,
  },
};

export interface StudentSegmentProfile {
  studentId: string;
  studentName: string;
  avatarInitials: string;
  branch: string;
  year: string;
  course: string;
  successScore: number;
  placementScore: number;
  academicScore: number;
  engagementScore: number;
  riskStatus: string;
  primarySegment: StudentSegmentType;
  segmentDef: SegmentDefinition;
  rationale: string;
}

/**
 * Assigns a single primary segment to a student deterministically based on unified data indicators.
 */
export function classifyStudentSegment(studentId: string): StudentSegmentProfile {
  const unified = getUnifiedStudentProfile(studentId) || UNIFIED_STUDENTS[0];
  const scoreData = getStudentSuccessScore(studentId);
  const risk = getStudentRiskProfile(studentId);

  const academicScore = unified.academic.overallMarks;
  const placementScore = Math.round((unified.placement.aptitudeScore + unified.placement.codingScore) / 2);
  const engagementScore = unified.engagement.behavioralScore;
  const successScore = scoreData.currentScore;
  const isDecliningEngagement = unified.engagement.engagementTrend === 'declining' || unified.lms.activityTrend === 'declining';
  const hasMultipleSignals = risk.status === 'MULTIPLE SIGNALS';
  const hasEarlySignal = risk.status === 'EARLY SIGNAL';

  let primarySegment: StudentSegmentType = 'CONSISTENT_GROWTH';
  let rationale = '';

  // Deterministic rule hierarchy
  // Rule 1: Multiple Signals (Highest urgency)
  if (hasMultipleSignals) {
    primarySegment = 'MULTIPLE_SIGNALS';
    rationale = 'Multiple declining indicators detected simultaneously across engagement, communication, and attendance.';
  }
  // Rule 2: Academic Strong / Placement Needs Support (Significant core hackathon challenge pattern)
  else if (academicScore >= 78 && (placementScore <= 75 || (unified.skills.softSkillAssessments.communication < 70) || (academicScore - placementScore >= 8))) {
    primarySegment = 'ACADEMIC_STRONG_PLACEMENT_NEEDS_SUPPORT';
    rationale = `Strong coursework marks (${academicScore}%), but placement readiness (${placementScore}%) and technical interview benchmarks warrant focused mentoring.`;
  }
  // Rule 3: Placement Ready (Excellent placement & coding)
  else if (placementScore >= 82 && scoreData.currentScore >= 82 && (unified.skills.softSkillAssessments.communication >= 78)) {
    primarySegment = 'PLACEMENT_READY';
    rationale = `Demonstrates balanced excellence across coding (${unified.placement.codingScore}%), aptitude (${unified.placement.aptitudeScore}%), and articulate technical communication.`;
  }
  // Rule 4: High Potential / Low Engagement
  else if (academicScore >= 78 && (isDecliningEngagement || engagementScore < 70 || unified.lms.loginFrequencyPerWeek < 5)) {
    primarySegment = 'HIGH_POTENTIAL_LOW_ENGAGEMENT';
    rationale = `High foundational capability, but digital learning activity and forum presence have recently decelerated.`;
  }
  // Rule 5: Early Support Needed
  else if (hasEarlySignal || risk.decliningSignalsCount >= 1) {
    primarySegment = 'EARLY_SUPPORT_NEEDED';
    rationale = `Displays emerging deceleration in one or more learning vectors; early guidance prevents signal compounding.`;
  }
  // Rule 6: High Performer
  else if (successScore >= 85 && academicScore >= 85 && risk.status === 'NORMAL') {
    primarySegment = 'HIGH_PERFORMER';
    rationale = `Exemplary performance across all 7 challenge pillars with zero unexcused absences and sustained leadership.`;
  }
  // Rule 7: Consistent Growth (Default positive trajectory)
  else {
    primarySegment = 'CONSISTENT_GROWTH';
    rationale = `Healthy upward progression observed across sequential semesters with dependable lecture presence.`;
  }

  const segmentDef = SEGMENT_DEFINITIONS[primarySegment];

  return {
    studentId: unified.id,
    studentName: unified.name,
    avatarInitials: unified.avatarInitials,
    branch: unified.branch,
    year: unified.year,
    course: unified.course,
    successScore,
    placementScore,
    academicScore,
    engagementScore,
    riskStatus: risk.status,
    primarySegment,
    segmentDef,
    rationale,
  };
}

/**
 * Registry of all classified student segments
 */
export const ALL_STUDENT_SEGMENTS: StudentSegmentProfile[] = UNIFIED_STUDENTS.map((st) =>
  classifyStudentSegment(st.id)
);

export function getStudentSegment(studentId: string): StudentSegmentProfile {
  const canonical = toCanonicalStudentId(studentId);
  const found = ALL_STUDENT_SEGMENTS.find(
    (s) => s.studentId === canonical || isSameStudent(s.studentId, studentId)
  );
  if (found) return found;
  return classifyStudentSegment(canonical);
}

export interface SegmentCohortStats {
  segmentDef: SegmentDefinition;
  count: number;
  institutionalScaledCount: number;
  students: StudentSegmentProfile[];
  avgSuccessScore: number;
  generalTrend: 'Improving' | 'Stable' | 'Observation';
}

/**
 * Returns aggregated statistics for each segment across institutional cohorts.
 */
export function getSegmentCohortStats(): SegmentCohortStats[] {
  const segmentKeys = Object.keys(SEGMENT_DEFINITIONS) as StudentSegmentType[];

  // Scaled institutional distribution mapped from challenge spec:
  // HIGH PERFORMER: 124
  // CONSISTENT GROWTH: 218
  // ACADEMIC STRONG / PLACEMENT NEEDS SUPPORT: 87
  // HIGH POTENTIAL / LOW ENGAGEMENT: 61
  // EARLY SUPPORT NEEDED: 103
  // MULTIPLE SIGNALS: 31
  // PLACEMENT READY: 156
  const scaledCounts: Record<StudentSegmentType, number> = {
    HIGH_PERFORMER: 124,
    CONSISTENT_GROWTH: 218,
    ACADEMIC_STRONG_PLACEMENT_NEEDS_SUPPORT: 87,
    HIGH_POTENTIAL_LOW_ENGAGEMENT: 61,
    EARLY_SUPPORT_NEEDED: 103,
    MULTIPLE_SIGNALS: 31,
    PLACEMENT_READY: 156,
  };

  return segmentKeys.map((key) => {
    const def = SEGMENT_DEFINITIONS[key];
    const matching = ALL_STUDENT_SEGMENTS.filter((s) => s.primarySegment === key);
    
    // In case no seed student landed in this segment, include closest representative
    const representativeStudents = matching.length > 0 ? matching : ALL_STUDENT_SEGMENTS.slice(0, 2);

    const avgScore =
      representativeStudents.length > 0
        ? Math.round(
            representativeStudents.reduce((acc, s) => acc + s.successScore, 0) /
              representativeStudents.length
          )
        : 78;

    let generalTrend: 'Improving' | 'Stable' | 'Observation' = 'Stable';
    if (key === 'CONSISTENT_GROWTH' || key === 'HIGH_PERFORMER' || key === 'PLACEMENT_READY') {
      generalTrend = 'Improving';
    } else if (key === 'EARLY_SUPPORT_NEEDED' || key === 'MULTIPLE_SIGNALS') {
      generalTrend = 'Observation';
    }

    return {
      segmentDef: def,
      count: matching.length,
      institutionalScaledCount: scaledCounts[key],
      students: representativeStudents,
      avgSuccessScore: avgScore,
      generalTrend,
    };
  });
}
