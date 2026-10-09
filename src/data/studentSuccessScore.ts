/**
 * Student Success Score Data & Calculation Engine
 * 
 * Responsible Terminology Notice:
 * This is a composite 0-100 indicator representing current overall success/readiness condition.
 * It is NOT a probability of success or failure.
 * Deterministic, transparent, and explainable calculation across 7 dimensions.
 */

import { toCanonicalStudentId, isSameStudent } from './canonicalStudentRegistry';

export interface SuccessScoreWeight {
  key: string;
  label: string;
  weight: number; // Decimal (e.g., 0.25 for 25%)
  percentage: string; // e.g. "25%"
  description: string;
}

export const SUCCESS_SCORE_WEIGHTS: Record<string, SuccessScoreWeight> = {
  academic: {
    key: 'academic',
    label: 'Academic Performance',
    weight: 0.25,
    percentage: '25%',
    description: 'Foundational coursework mastery, summative assessments, and laboratory evaluations.',
  },
  attendance: {
    key: 'attendance',
    label: 'Attendance',
    weight: 0.10,
    percentage: '10%',
    description: 'Lecture, recitation, and laboratory physical & scheduled session presence.',
  },
  lmsEngagement: {
    key: 'lmsEngagement',
    label: 'LMS / Learning Engagement',
    weight: 0.10,
    percentage: '10%',
    description: 'Portal interaction depth, digital resource reading, practice exercise frequency.',
  },
  studentEngagement: {
    key: 'studentEngagement',
    label: 'Behavioral / Student Engagement',
    weight: 0.15,
    percentage: '15%',
    description: 'Seminar presence, peer discussion momentum, office hour touchpoints, and learning stamina.',
  },
  skillsCommunication: {
    key: 'skillsCommunication',
    label: 'Skills & Communication',
    weight: 0.15,
    percentage: '15%',
    description: 'Technical competencies, problem solving autonomy, and articulate project presentation.',
  },
  placementReadiness: {
    key: 'placementReadiness',
    label: 'Placement Readiness',
    weight: 0.15,
    percentage: '15%',
    description: 'Industry project alignment, resume portfolio depth, technical interview benchmarking.',
  },
  feedback: {
    key: 'feedback',
    label: 'Feedback / Participation',
    weight: 0.10,
    percentage: '10%',
    description: 'Constructive peer review exchange, instructor feedback integration, and classroom voice.',
  },
};

export interface SuccessDimensionDetail {
  id: string;
  name: string;
  weightLabel: string;
  weight: number;
  currentScore: number;
  previousScore: number;
  change: number;
  weightedContribution: number;
  category: 'strength' | 'stable' | 'attention';
  description: string;
  isAssessed: boolean;
  statusLabel?: string;
}

export interface StudentSuccessScoreData {
  studentId: string;
  studentName: string;
  currentScore: number;
  previousScore: number;
  change: number; // e.g. -4
  trend: 'improving' | 'stable' | 'declining';
  indicatorLabel: string;
  indicatorDescription: string;
  dimensions: SuccessDimensionDetail[];
  areasOfStrength: {
    dimensionName: string;
    score: number;
    highlight: string;
  }[];
  areasNeedingAttention: {
    dimensionName: string;
    score: number;
    concern: string;
    constructiveGuidance: string;
  }[];
  formulaExplanation: {
    formula: string;
    calculationText: string;
  };
}

export interface RawDimensionValue {
  current?: number;
  previous?: number;
  status?: 'assessed' | 'not-assessed';
}

export interface RawStudentSuccessRecord {
  id: string;
  name: string;
  dimensions: {
    academic: RawDimensionValue;
    attendance: RawDimensionValue;
    lmsEngagement: RawDimensionValue;
    studentEngagement: RawDimensionValue;
    skillsCommunication: RawDimensionValue;
    placementReadiness: RawDimensionValue;
    feedback: RawDimensionValue;
  };
  indicatorLabel: string;
  indicatorDescription: string;
  strengthHighlights: { dimensionName: string; highlight: string }[];
  attentionHighlights: { dimensionName: string; concern: string; constructiveGuidance: string }[];
}

const RAW_STUDENT_SUCCESS_RECORDS: RawStudentSuccessRecord[] = [
  {
    id: 'arjun-kumar',
    name: 'Arjun Kumar',
    dimensions: {
      academic: { current: 88, previous: 84 },
      attendance: { current: 91, previous: 91 },
      lmsEngagement: { current: 74, previous: 82 },
      studentEngagement: { current: 72, previous: 82 },
      skillsCommunication: { current: 61, previous: 65 },
      placementReadiness: { current: 77, previous: 81 },
      feedback: { current: 80, previous: 86 },
    },
    indicatorLabel: 'Steady Foundational Health with Selective Deceleration',
    indicatorDescription: 'Overall success condition remains positive supported by strong academic marks (88%) and exemplary attendance (91%). Recent deceleration in communication and student engagement suggests timely support will sustain progress.',
    strengthHighlights: [
      {
        dimensionName: 'Academic Performance (88/100)',
        highlight: 'Continuous mastery on mid-module exams, quizzes, and algorithmic assignments.',
      },
      {
        dimensionName: 'Attendance (91/100)',
        highlight: 'Punctual, sustained lecture and laboratory presence over the past 8 weeks.',
      },
    ],
    attentionHighlights: [
      {
        dimensionName: 'Skills & Communication (61/100)',
        concern: 'Hesitation during technical presentations and peer code reviews.',
        constructiveGuidance: 'Encourage low-stakes pair programming and casual TA consultation sessions.',
      },
      {
        dimensionName: 'Behavioral & LMS Engagement (72 & 74/100)',
        concern: 'Digital study time dropped from 82% to 74% over the last four weeks.',
        constructiveGuidance: 'Check in on project pacing without punitive framing.',
      },
    ],
  },
  {
    id: 'priya-sharma',
    name: 'Priya Sharma',
    dimensions: {
      academic: { current: 92, previous: 88 },
      attendance: { current: 96, previous: 95 },
      lmsEngagement: { current: 89, previous: 84 },
      studentEngagement: { current: 91, previous: 86 },
      skillsCommunication: { current: 90, previous: 82 },
      placementReadiness: { current: 88, previous: 80 },
      feedback: { current: 92, previous: 85 },
    },
    indicatorLabel: 'High Holistic Readiness & Leadership Velocity',
    indicatorDescription: 'Demonstrates balanced excellence across curricular, practical, and leadership vectors. High velocity across problem solving and peer mentorship.',
    strengthHighlights: [
      {
        dimensionName: 'Attendance & Rigor (96/100)',
        highlight: 'Flawless attendance record combined with top decile hardware lab performance.',
      },
      {
        dimensionName: 'Skills & Communication (90/100)',
        highlight: 'High technical synthesis in circuit debugging and articulate peer mentorship.',
      },
    ],
    attentionHighlights: [
      {
        dimensionName: 'Sustainable Workload Pacing (88/100)',
        concern: 'Late-night project commits indicate potential cumulative fatigue.',
        constructiveGuidance: 'Guide on sprint pacing and balanced rest schedules.',
      },
    ],
  },
  {
    id: 'rahul-verma',
    name: 'Rahul Verma',
    dimensions: {
      academic: { current: 64, previous: 74 },
      attendance: { current: 71, previous: 86 },
      lmsEngagement: { current: 56, previous: 72 },
      studentEngagement: { current: 55, previous: 70 },
      skillsCommunication: { current: 68, previous: 66 },
      placementReadiness: { current: 60, previous: 68 },
      feedback: { current: 58, previous: 70 },
    },
    indicatorLabel: 'Focused Support Recommended across Foundational Vectors',
    indicatorDescription: 'Prerequisite mathematics challenges are impacting multiple engagement vectors. Hands-on workshop skills remain solid, indicating strong applied aptitude.',
    strengthHighlights: [
      {
        dimensionName: 'Applied Workshop Skills (68/100)',
        highlight: 'Solid hands-on machining, CNC operations, and CAD modeling proficiency.',
      },
    ],
    attentionHighlights: [
      {
        dimensionName: 'Student & LMS Engagement (55 & 56/100)',
        concern: 'Absenteeism concentrated around morning vector mechanics lectures.',
        constructiveGuidance: 'Pair with supportive peer tutoring clinic for foundational vector statics.',
      },
      {
        dimensionName: 'Academic Performance (64/100)',
        concern: 'Compounding prerequisite gap in algebraic mechanics.',
        constructiveGuidance: 'Schedule a supportive, non-punitive faculty check-in for supplemental materials.',
      },
    ],
  },
  {
    id: 'sneha-reddy',
    name: 'Sneha Reddy',
    dimensions: {
      academic: { current: 89, previous: 88 },
      attendance: { current: 88, previous: 90 },
      lmsEngagement: { current: 84, previous: 85 },
      studentEngagement: { current: 82, previous: 82 },
      skillsCommunication: { current: 94, previous: 88 },
      placementReadiness: { current: 92, previous: 84 },
      feedback: { current: 83, previous: 82 },
    },
    indicatorLabel: 'Accelerated Industry Specialization & Career Readiness',
    indicatorDescription: 'Exhibits outstanding independent software engineering depth with steady curricular baselines. High placement readiness and industry hackathon achievements.',
    strengthHighlights: [
      {
        dimensionName: 'Skills & Communication (94/100)',
        highlight: 'Autonomous machine learning container deployments and open-source contributions.',
      },
      {
        dimensionName: 'Placement Readiness (92/100)',
        highlight: 'Cleared Tier-1 technical screenings and earned national hackathon top recognition.',
      },
    ],
    attentionHighlights: [
      {
        dimensionName: 'Curricular Balance (88/100)',
        concern: 'Occasional missed lectures during hackathon sprint deliverables.',
        constructiveGuidance: 'Ensure core theoretical course milestones remain synchronized with project sprints.',
      },
    ],
  },
  {
    id: 'kiran-kumar',
    name: 'Kiran Kumar',
    dimensions: {
      academic: { current: 75, previous: 71 },
      attendance: { current: 89, previous: 78 },
      lmsEngagement: { current: 79, previous: 65 },
      studentEngagement: { current: 78, previous: 64 },
      skillsCommunication: { current: 72, previous: 68 },
      placementReadiness: { current: 68, previous: 62 },
      feedback: { current: 76, previous: 66 },
    },
    indicatorLabel: 'Positive Momentum Rebound across Behavioral Indicators',
    indicatorDescription: 'Surging recovery velocity following peer study circle integration. Leading behavioral indicators foreshadow expected upcoming academic gains.',
    strengthHighlights: [
      {
        dimensionName: 'Attendance Recovery (89/100)',
        highlight: 'Attendance increased by +11% over the last seven consecutive weeks.',
      },
      {
        dimensionName: 'LMS Engagement (79/100)',
        highlight: 'Active elective practice problem completions and reliable team repository contributions.',
      },
    ],
    attentionHighlights: [
      {
        dimensionName: 'Placement Readiness (68/100)',
        concern: 'Timed assessment scores lag un-timed practical performance.',
        constructiveGuidance: 'Recommend timed practice sessions and interview confidence workshops.',
      },
    ],
  },
  {
    id: 'ananya-rao',
    name: 'Ananya Rao',
    dimensions: {
      academic: { current: 87, previous: 86 },
      attendance: { current: 92, previous: 92 },
      lmsEngagement: { current: 66, previous: 76 },
      studentEngagement: { current: 65, previous: 78 },
      skillsCommunication: { current: 70, previous: 74 },
      placementReadiness: { current: 74, previous: 78 },
      feedback: { current: 68, previous: 75 },
    },
    indicatorLabel: 'Stable Gradebook with Latent Engagement Divergence',
    indicatorDescription: 'Standard grades remain high at 87% with 92% attendance, yet behavioral telemetry exhibits quiet withdrawal from collaborative spaces.',
    strengthHighlights: [
      {
        dimensionName: 'Curricular Exam Scores (87/100)',
        highlight: 'Strong individual quiz performance and consistent assignment completion.',
      },
      {
        dimensionName: 'Lecture Presence (92/100)',
        highlight: 'Reliable physical presence in lecture halls and laboratory recitations.',
      },
    ],
    attentionHighlights: [
      {
        dimensionName: 'Student & LMS Engagement (65 & 66/100)',
        concern: 'Drop-off in discussion board participation and voluntary study groups.',
        constructiveGuidance: 'Subtle check-in during office hours to re-engage collaborative learning.',
      },
    ],
  },
  {
    id: 'vivek-sharma',
    name: 'Vivek Sharma',
    dimensions: {
      academic: { current: 79, previous: 78 },
      attendance: { current: 84, previous: 86 },
      lmsEngagement: { current: 68, previous: 78 },
      studentEngagement: { current: 62, previous: 76 },
      skillsCommunication: { current: 75, previous: 74 },
      placementReadiness: { current: 72, previous: 73 },
      feedback: { current: 66, previous: 76 },
    },
    indicatorLabel: 'Single-Signal Engagement Drift Monitored',
    indicatorDescription: 'Academic scores and technical capabilities are stable, while engagement has eased over the past month. Early proactive guidance maintains balance.',
    strengthHighlights: [
      {
        dimensionName: 'Technical Competency (75/100)',
        highlight: 'Reliable engineering problem solving and laboratory execution.',
      },
    ],
    attentionHighlights: [
      {
        dimensionName: 'Behavioral Engagement (62/100)',
        concern: 'Noticeable reduction in seminar questions and collaborative team projects.',
        constructiveGuidance: 'Encourage elective group workshop participation to rebuild social momentum.',
      },
    ],
  },
  {
    id: 'meera-reddy',
    name: 'Meera Reddy',
    dimensions: {
      academic: { current: 86, previous: 85 },
      attendance: { current: 94, previous: 93 },
      lmsEngagement: { current: 86, previous: 85 },
      studentEngagement: { current: 85, previous: 84 },
      skillsCommunication: { current: 84, previous: 82 },
      placementReadiness: { current: 82, previous: 80 },
      feedback: { current: 88, previous: 87 },
    },
    indicatorLabel: 'Balanced Multi-Vector Stability & Collaborative Health',
    indicatorDescription: 'Exemplifies steady, self-directed academic rhythms across all monitored learning telemetry with zero adverse markers.',
    strengthHighlights: [
      {
        dimensionName: 'Attendance Consistency (94/100)',
        highlight: 'Near-perfect attendance and active participation across power systems laboratories.',
      },
      {
        dimensionName: 'Feedback & Collaboration (88/100)',
        highlight: 'Consistently provides high-quality constructive feedback in peer evaluations.',
      },
    ],
    attentionHighlights: [
      {
        dimensionName: 'Leadership Opportunity (84/100)',
        concern: 'Potential remains for leading cohort study circles.',
        constructiveGuidance: 'Invite Meera to coordinate junior peer tutoring sessions in circuit theory.',
      },
    ],
  },
];

/**
 * Calculates deterministic composite score from dimensions and weights
 */
export function buildStudentSuccessScore(record: RawStudentSuccessRecord): StudentSuccessScoreData {
  let weightedCurrentSum = 0;
  let weightedPrevSum = 0;
  let assessedWeightSum = 0;

  const dimensionKeys = [
    'academic',
    'attendance',
    'lmsEngagement',
    'studentEngagement',
    'skillsCommunication',
    'placementReadiness',
    'feedback',
  ] as const;

  const details: SuccessDimensionDetail[] = dimensionKeys.map((key) => {
    const cfg = SUCCESS_SCORE_WEIGHTS[key];
    const raw = record.dimensions[key] || {};
    const isAssessed = raw.current !== undefined && raw.status !== 'not-assessed';
    const currentVal = isAssessed ? (raw.current as number) : 0;
    const prevVal = isAssessed ? (raw.previous !== undefined ? raw.previous : currentVal) : 0;
    const change = isAssessed ? currentVal - prevVal : 0;
    const weightedContribution = isAssessed ? Number((currentVal * cfg.weight).toFixed(2)) : 0;

    if (isAssessed) {
      weightedCurrentSum += currentVal * cfg.weight;
      weightedPrevSum += prevVal * cfg.weight;
      assessedWeightSum += cfg.weight;
    }

    let category: 'strength' | 'stable' | 'attention' = 'stable';
    if (!isAssessed) {
      category = 'stable';
    } else if (currentVal >= 85 || change >= 4) {
      category = 'strength';
    } else if (currentVal < 70 || change <= -6) {
      category = 'attention';
    }

    return {
      id: key,
      name: cfg.label,
      weightLabel: cfg.percentage,
      weight: cfg.weight,
      currentScore: isAssessed ? currentVal : -1,
      previousScore: isAssessed ? prevVal : -1,
      change,
      weightedContribution,
      category,
      description: cfg.description,
      isAssessed,
      statusLabel: isAssessed ? undefined : 'Not assessed yet',
    };
  });

  // Re-normalize score across assessed dimensions (so unassessed dimensions are never penalized as 0)
  const currentScore = assessedWeightSum > 0 ? Math.round(weightedCurrentSum / assessedWeightSum) : 75;
  const previousScore = assessedWeightSum > 0 ? Math.round(weightedPrevSum / assessedWeightSum) : 75;
  const change = currentScore - previousScore;
  const trend: 'improving' | 'stable' | 'declining' =
    change > 1 ? 'improving' : change < -1 ? 'declining' : 'stable';

  const areasOfStrength = record.strengthHighlights.map((s) => {
    const dimMatch = details.find((d) => aContainsB(s.dimensionName, d.name));
    return {
      dimensionName: s.dimensionName,
      score: dimMatch?.currentScore && dimMatch.currentScore >= 0 ? dimMatch.currentScore : currentScore,
      highlight: s.highlight,
    };
  });

  const areasNeedingAttention = record.attentionHighlights.map((a) => {
    const dimMatch = details.find((d) => aContainsB(a.dimensionName, d.name));
    return {
      dimensionName: a.dimensionName,
      score: dimMatch?.currentScore && dimMatch.currentScore >= 0 ? dimMatch.currentScore : currentScore,
      concern: a.concern,
      constructiveGuidance: a.constructiveGuidance,
    };
  });

  const formulaBase =
    'Score = (Academic × 25%) + (Attendance × 10%) + (LMS × 10%) + (Engagement × 15%) + (Skills × 15%) + (Placement × 15%) + (Feedback × 10%) = 100%';
  const unassessedCount = details.filter((d) => !d.isAssessed).length;
  const formulaWithNotes =
    unassessedCount > 0
      ? `${formulaBase} [Normalized across ${7 - unassessedCount}/7 assessed dimensions; missing dimensions are not penalized as zero]`
      : formulaBase;

  return {
    studentId: toCanonicalStudentId(record.id),
    studentName: record.name,
    currentScore,
    previousScore,
    change,
    trend,
    indicatorLabel: record.indicatorLabel,
    indicatorDescription: record.indicatorDescription,
    dimensions: details,
    areasOfStrength,
    areasNeedingAttention,
    formulaExplanation: {
      formula: formulaWithNotes,
      calculationText: `Current: ${currentScore} / 100 (Previous: ${previousScore}, Change: ${change >= 0 ? `+${change}` : change}) across 7 dimensions (Total Weights = 100%)`,
    },
  };
}

function aContainsB(a: string, b: string): boolean {
  return a.toLowerCase().includes(b.toLowerCase()) || b.toLowerCase().includes(a.toLowerCase());
}

/**
 * Registry of all processed student success scores
 */
export const ALL_STUDENT_SUCCESS_SCORES: Record<string, StudentSuccessScoreData> = {};

RAW_STUDENT_SUCCESS_RECORDS.forEach((rec) => {
  const scoreData = buildStudentSuccessScore(rec);
  const canonical = toCanonicalStudentId(rec.id);
  ALL_STUDENT_SUCCESS_SCORES[canonical] = scoreData;
  ALL_STUDENT_SUCCESS_SCORES[rec.id] = scoreData;

  // Also register canonical aliases
  if (canonical === 'arjun-kumar') {
    ALL_STUDENT_SUCCESS_SCORES['std-1'] = scoreData;
    ALL_STUDENT_SUCCESS_SCORES['cs-2022-084'] = scoreData;
    ALL_STUDENT_SUCCESS_SCORES['ev-2026-cse042'] = scoreData;
  }
  if (canonical === 'priya-sharma') {
    ALL_STUDENT_SUCCESS_SCORES['std-2'] = scoreData;
    ALL_STUDENT_SUCCESS_SCORES['st-001'] = scoreData;
    ALL_STUDENT_SUCCESS_SCORES['cs-2022-109'] = scoreData;
    ALL_STUDENT_SUCCESS_SCORES['ev-2025-cse109'] = scoreData;
  }
  if (canonical === 'rahul-verma') {
    ALL_STUDENT_SUCCESS_SCORES['std-3'] = scoreData;
    ALL_STUDENT_SUCCESS_SCORES['st-006'] = scoreData;
    ALL_STUDENT_SUCCESS_SCORES['ev-2026-eee031'] = scoreData;
  }
  if (canonical === 'sneha-reddy') {
    ALL_STUDENT_SUCCESS_SCORES['std-4'] = scoreData;
    ALL_STUDENT_SUCCESS_SCORES['st-007'] = scoreData;
    ALL_STUDENT_SUCCESS_SCORES['ev-2026-cse088'] = scoreData;
  }
  if (canonical === 'kiran-kumar') {
    ALL_STUDENT_SUCCESS_SCORES['std-5'] = scoreData;
    ALL_STUDENT_SUCCESS_SCORES['ev-2026-cse055'] = scoreData;
  }
  if (canonical === 'ananya-rao') {
    ALL_STUDENT_SUCCESS_SCORES['std-6'] = scoreData;
    ALL_STUDENT_SUCCESS_SCORES['ev-2026-ai014'] = scoreData;
  }
  if (canonical === 'vivek-sharma') {
    ALL_STUDENT_SUCCESS_SCORES['std-7'] = scoreData;
    ALL_STUDENT_SUCCESS_SCORES['ev-2026-mech032'] = scoreData;
  }
  if (canonical === 'meera-reddy') {
    ALL_STUDENT_SUCCESS_SCORES['std-8'] = scoreData;
    ALL_STUDENT_SUCCESS_SCORES['ev-2026-eee077'] = scoreData;
  }
});

export interface SuccessScoreResult extends StudentSuccessScoreData {}

/**
 * Shared utility function that consumes the unified student data model
 * (Academic, Attendance, LMS, Engagement, Placement, Skills, Feedback)
 * and returns a normalized 0-100 score along with the individual dimension breakdowns.
 * Serves as the single source of truth for the Success Score across all workspaces.
 */
export function calculateSuccessScore(profile: {
  id?: string;
  name?: string;
  academic?: { overallMarks?: number; cgpa?: number; history?: Array<{ marksPercentage: number }> };
  attendance?: { overallPercentage?: number; history?: Array<{ percentage: number }> };
  lms?: { assignmentCompletionRate?: number; loginFrequencyPerWeek?: number; previousLoginFrequency?: number };
  engagement?: { behavioralScore?: number; participationScore?: number; activityConsistencyScore?: number };
  placement?: { aptitudeScore?: number; codingScore?: number };
  skills?: any;
  feedback?: { studentSatisfactionScore?: number };
  forceRecalculate?: boolean;
}): SuccessScoreResult {
  if (!profile) {
    return getStudentSuccessScore('arjun-kumar');
  }

  const canonicalId = profile.id ? toCanonicalStudentId(profile.id) : undefined;

  // If a student ID is present and exists in the calibrated registry, AND recalculate is not forced,
  // return the calibrated record
  if (canonicalId && ALL_STUDENT_SUCCESS_SCORES[canonicalId] && !profile.forceRecalculate) {
    return ALL_STUDENT_SUCCESS_SCORES[canonicalId];
  }

  // Otherwise, calculate directly from the unified dimensions
  // 1. Academic Performance (0-100)
  const academicCurrent =
    profile.academic?.overallMarks ??
    (profile.academic?.cgpa ? Math.round(profile.academic.cgpa * 10) : undefined);
  const academicPrev =
    profile.academic?.history && profile.academic.history.length >= 2
      ? profile.academic.history[profile.academic.history.length - 2].marksPercentage
      : academicCurrent;

  // 2. Attendance (0-100)
  const attendanceCurrent = profile.attendance?.overallPercentage;
  const attendancePrev =
    profile.attendance?.history && profile.attendance.history.length >= 2
      ? profile.attendance.history[profile.attendance.history.length - 2].percentage
      : attendanceCurrent;

  // 3. LMS Engagement (0-100)
  const lmsCurrent = profile.lms?.assignmentCompletionRate;
  const lmsPrev =
    profile.lms?.previousLoginFrequency && profile.lms?.loginFrequencyPerWeek && lmsCurrent !== undefined
      ? Math.round(Math.min(100, Math.max(0, lmsCurrent * (profile.lms.previousLoginFrequency / profile.lms.loginFrequencyPerWeek))))
      : lmsCurrent;

  // 4. Student Engagement (0-100)
  const engagementCurrent = profile.engagement?.behavioralScore ?? profile.engagement?.participationScore;
  const engagementPrev = profile.engagement?.activityConsistencyScore ?? engagementCurrent;

  // 5. Skills & Communication (0-100)
  let skillsCurrent: number | undefined = undefined;
  if (profile.skills) {
    const soft = profile.skills.softSkillAssessments?.communication ?? profile.skills.softSkillsRating;
    const tech = profile.skills.technicalSkillAssessments
      ? Object.values(profile.skills.technicalSkillAssessments as Record<string, number>).reduce((a, b) => a + b, 0) /
        Object.values(profile.skills.technicalSkillAssessments).length
      : profile.skills.technicalSkillsRating;
    if (soft !== undefined && tech !== undefined) {
      skillsCurrent = Math.round((Number(soft) + Number(tech)) / 2);
    } else if (soft !== undefined) {
      skillsCurrent = Math.round(Number(soft));
    } else if (tech !== undefined) {
      skillsCurrent = Math.round(Number(tech));
    }
  }
  const skillsPrev = skillsCurrent;

  // 6. Placement Readiness (0-100)
  let placementCurrent: number | undefined = undefined;
  if (profile.placement) {
    const apt = profile.placement.aptitudeScore;
    const code = profile.placement.codingScore;
    if (apt !== undefined && code !== undefined) {
      placementCurrent = Math.round((apt + code) / 2);
    } else if (apt !== undefined) {
      placementCurrent = apt;
    } else if (code !== undefined) {
      placementCurrent = code;
    }
  }
  const placementPrev = placementCurrent;

  // 7. Feedback (0-100)
  const feedbackCurrent = profile.feedback?.studentSatisfactionScore;
  const feedbackPrev = feedbackCurrent;

  const rawRecord: RawStudentSuccessRecord = {
    id: canonicalId || 'custom-student',
    name: profile.name || 'Student',
    dimensions: {
      academic: {
        current: academicCurrent,
        previous: academicPrev,
        status: academicCurrent !== undefined ? 'assessed' : 'not-assessed',
      },
      attendance: {
        current: attendanceCurrent,
        previous: attendancePrev,
        status: attendanceCurrent !== undefined ? 'assessed' : 'not-assessed',
      },
      lmsEngagement: {
        current: lmsCurrent,
        previous: lmsPrev,
        status: lmsCurrent !== undefined ? 'assessed' : 'not-assessed',
      },
      studentEngagement: {
        current: engagementCurrent,
        previous: engagementPrev,
        status: engagementCurrent !== undefined ? 'assessed' : 'not-assessed',
      },
      skillsCommunication: {
        current: skillsCurrent,
        previous: skillsPrev,
        status: skillsCurrent !== undefined ? 'assessed' : 'not-assessed',
      },
      placementReadiness: {
        current: placementCurrent,
        previous: placementPrev,
        status: placementCurrent !== undefined ? 'assessed' : 'not-assessed',
      },
      feedback: {
        current: feedbackCurrent,
        previous: feedbackPrev,
        status: feedbackCurrent !== undefined ? 'assessed' : 'not-assessed',
      },
    },
    indicatorLabel: 'Unified Intelligence Calculated Profile',
    indicatorDescription: 'Holistic condition calculated deterministically from unified dimensions.',
    strengthHighlights: [
      { dimensionName: 'Academic Mastery', highlight: 'Sustained coursework and foundational mastery.' },
      { dimensionName: 'Attendance Consistency', highlight: 'Reliable presence in designated lecture cohorts.' },
    ],
    attentionHighlights: [
      {
        dimensionName: 'Holistic Equilibrium',
        concern: 'Monitor ongoing engagement rhythms and placement milestones.',
        constructiveGuidance: 'Connect with faculty advisor for proactive career and project guidance.',
      },
    ],
  };

  return buildStudentSuccessScore(rawRecord);
}

/**
 * Retrieve the Student Success Score data for a given student ID or name
 */
export function getStudentSuccessScore(studentIdOrName: string, customAssessments?: any[]): StudentSuccessScoreData {
  if (!studentIdOrName) {
    return ALL_STUDENT_SUCCESS_SCORES['arjun-kumar'];
  }

  const canonical = toCanonicalStudentId(studentIdOrName);
  const baseRecord = ALL_STUDENT_SUCCESS_SCORES[canonical] || ALL_STUDENT_SUCCESS_SCORES['arjun-kumar'];

  // Check if there are newly recorded assessments in localStorage or customAssessments
  let recordedAssessments: any[] = customAssessments || [];
  if (recordedAssessments.length === 0 && typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('evolyn_skill_assessments');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          recordedAssessments = parsed.filter((a: any) => isSameStudent(a.studentId, canonical));
        }
      }
    } catch (_) {}
  } else {
    recordedAssessments = recordedAssessments.filter((a: any) => isSameStudent(a.studentId, canonical));
  }

  // If there are recorded assessments for this student, recalculate skills & placement dimensions dynamically
  if (recordedAssessments.length > 0) {
    const commRecs = recordedAssessments.filter((a) => a.category === 'communication');
    const techRecs = recordedAssessments.filter((a) => a.category === 'technical');
    const placementRecs = recordedAssessments.filter((a) => a.category === 'career-placement');

    // Retrieve original raw dimension values
    const rawMatch = RAW_STUDENT_SUCCESS_RECORDS.find((r) => isSameStudent(r.id, canonical));
    if (rawMatch) {
      let updatedSkills = rawMatch.dimensions.skillsCommunication?.current;
      let updatedPlacement = rawMatch.dimensions.placementReadiness?.current;

      if (commRecs.length > 0 && techRecs.length > 0) {
        const avgComm = Math.round((commRecs[0].score / (commRecs[0].maxScore || 100)) * 100);
        const avgTech = Math.round((techRecs[0].score / (techRecs[0].maxScore || 100)) * 100);
        updatedSkills = Math.round((avgComm + avgTech) / 2);
      } else if (commRecs.length > 0) {
        updatedSkills = Math.round((commRecs[0].score / (commRecs[0].maxScore || 100)) * 100);
      } else if (techRecs.length > 0) {
        updatedSkills = Math.round((techRecs[0].score / (techRecs[0].maxScore || 100)) * 100);
      }

      if (placementRecs.length > 0) {
        updatedPlacement = Math.round((placementRecs[0].score / (placementRecs[0].maxScore || 100)) * 100);
      }

      const dynamicallyUpdatedRaw: RawStudentSuccessRecord = {
        ...rawMatch,
        dimensions: {
          ...rawMatch.dimensions,
          skillsCommunication: {
            ...rawMatch.dimensions.skillsCommunication,
            current: updatedSkills,
          },
          placementReadiness: {
            ...rawMatch.dimensions.placementReadiness,
            current: updatedPlacement,
          },
        },
      };

      return buildStudentSuccessScore(dynamicallyUpdatedRaw);
    }
  }

  // 1. Direct registry lookup
  if (ALL_STUDENT_SUCCESS_SCORES[studentIdOrName]) {
    return ALL_STUDENT_SUCCESS_SCORES[studentIdOrName];
  }

  // 2. Resolve via canonical registry
  if (ALL_STUDENT_SUCCESS_SCORES[canonical]) {
    return ALL_STUDENT_SUCCESS_SCORES[canonical];
  }

  // 3. Normalized slug search
  const normalized = studentIdOrName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const foundKey = Object.keys(ALL_STUDENT_SUCCESS_SCORES).find(
    (k) => k === normalized || k.includes(normalized) || normalized.includes(k)
  );

  if (foundKey) {
    return ALL_STUDENT_SUCCESS_SCORES[foundKey];
  }

  // Fallback to default Arjun Kumar
  return baseRecord;
}

/**
 * Synchronizes and updates the calculated Success Score for a given unified student profile.
 * Registers the newly calculated score across all canonical alias keys.
 */
export function syncSuccessScoreFromProfile(profile: any): StudentSuccessScoreData {
  const scoreData = calculateSuccessScore({ ...profile, forceRecalculate: true });
  const canonical = toCanonicalStudentId(profile.id);
  ALL_STUDENT_SUCCESS_SCORES[canonical] = scoreData;
  ALL_STUDENT_SUCCESS_SCORES[profile.id] = scoreData;
  if (profile.studentId) ALL_STUDENT_SUCCESS_SCORES[profile.studentId.toLowerCase()] = scoreData;
  if (profile.legacyId) ALL_STUDENT_SUCCESS_SCORES[profile.legacyId.toLowerCase()] = scoreData;

  // Also synchronize RAW_STUDENT_SUCCESS_RECORDS for persistent dimension breakdowns
  const rawIdx = RAW_STUDENT_SUCCESS_RECORDS.findIndex((r) => isSameStudent(r.id, canonical));
  if (rawIdx !== -1) {
    const raw = RAW_STUDENT_SUCCESS_RECORDS[rawIdx];
    if (profile.academic?.overallMarks !== undefined) {
      raw.dimensions.academic.current = profile.academic.overallMarks;
    } else if (profile.academic?.cgpa !== undefined) {
      raw.dimensions.academic.current = Math.round(profile.academic.cgpa * 10);
    }
    if (profile.attendance?.overallPercentage !== undefined) {
      raw.dimensions.attendance.current = profile.attendance.overallPercentage;
    }
    if (profile.lms?.assignmentCompletionRate !== undefined) {
      raw.dimensions.lmsEngagement.current = profile.lms.assignmentCompletionRate;
    }
    if (profile.engagement?.participationScore !== undefined) {
      raw.dimensions.studentEngagement.current = profile.engagement.participationScore;
    }
    if (profile.skills?.softSkillAssessments?.communication !== undefined) {
      raw.dimensions.skillsCommunication.current = profile.skills.softSkillAssessments.communication;
    } else if (profile.skills?.communication !== undefined) {
      raw.dimensions.skillsCommunication.current = profile.skills.communication;
    }
    if (profile.placement?.aptitudeScore !== undefined && profile.placement?.codingScore !== undefined) {
      raw.dimensions.placementReadiness.current = Math.round((profile.placement.aptitudeScore + profile.placement.codingScore) / 2);
    }
    if (profile.feedback?.studentSatisfactionScore !== undefined) {
      raw.dimensions.feedback.current = profile.feedback.studentSatisfactionScore;
    }
  }
  return scoreData;
}

/**
 * Incorporates verified practice evidence from Fluencis into the student's Success Score.
 * Updates Skills & Communication (15%) and Student Engagement (15%) proportionally.
 */
export function recordPracticeSessionEvidence(
  studentId: string,
  sessionCount: number = 1,
  averagePracticeQuality: number = 75
): StudentSuccessScoreData {
  const canonical = toCanonicalStudentId(studentId);
  const rawIdx = RAW_STUDENT_SUCCESS_RECORDS.findIndex((r) => isSameStudent(r.id, canonical));

  if (rawIdx !== -1) {
    const raw = RAW_STUDENT_SUCCESS_RECORDS[rawIdx];
    // Uplift communication and engagement based on genuine practice attempts
    const commBonus = Math.min(15, Math.round(sessionCount * 2.5 * (averagePracticeQuality / 100)));
    const engBonus = Math.min(10, Math.round(sessionCount * 1.5));

    if (raw.dimensions.skillsCommunication.current !== undefined) {
      raw.dimensions.skillsCommunication.current = Math.min(98, raw.dimensions.skillsCommunication.current + commBonus);
    }
    if (raw.dimensions.studentEngagement.current !== undefined) {
      raw.dimensions.studentEngagement.current = Math.min(98, raw.dimensions.studentEngagement.current + engBonus);
    }

    const updatedScore = calculateSuccessScore({
      id: canonical,
      name: raw.name,
      academic: { overallMarks: raw.dimensions.academic.current },
      attendance: { overallPercentage: raw.dimensions.attendance.current },
      lms: { assignmentCompletionRate: raw.dimensions.lmsEngagement.current },
      engagement: { participationScore: raw.dimensions.studentEngagement.current },
      skills: { communication: raw.dimensions.skillsCommunication.current },
      placement: {
        aptitudeScore: raw.dimensions.placementReadiness.current,
        codingScore: raw.dimensions.placementReadiness.current,
      },
      feedback: { studentSatisfactionScore: raw.dimensions.feedback.current },
      forceRecalculate: true,
    });

    ALL_STUDENT_SUCCESS_SCORES[canonical] = updatedScore;
    ALL_STUDENT_SUCCESS_SCORES[studentId] = updatedScore;
    return updatedScore;
  }

  return getStudentSuccessScore(canonical);
}
