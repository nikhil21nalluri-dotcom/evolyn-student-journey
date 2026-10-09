import { toCanonicalStudentId, isSameStudent } from './canonicalStudentRegistry';

export type SilentStruggleStatus =
  | 'NORMAL'
  | 'WATCH'
  | 'EARLY SIGNAL'
  | 'MULTIPLE SIGNALS';

export type AttentionLevel = 'Low' | 'Moderate' | 'High';

export type TimeWindowOption = '2weeks' | '4weeks' | '8weeks' | 'semester';
export type TimeWindow = TimeWindowOption;

export interface SignalMetric {
  id: string;
  name: string;
  currentValue: number;
  previousValue: number;
  change: number; // e.g. -18
  unit: string;
  trend: 'improving' | 'stable' | 'declining';
  status: 'stable' | 'watch' | 'concerning';
  note: string;
}

export interface TimelineDataPoint {
  period: string; // e.g. "Week 1", "Week 2"
  weekLabel?: string;
  academic: number;
  engagement: number;
  attendance: number;
  participation: number;
  assignments: number;
  communication: number;
  note?: string;
}

export interface SilentStruggleStudent {
  id: string;
  name: string;
  avatarInitials: string;
  branch: 'CSE' | 'ECE' | 'EEE';
  year: '1st Year' | '2nd Year' | '3rd Year' | '4th Year';
  studentId: string;
  status: SilentStruggleStatus;
  statusDescription: string;
  attentionLevel: AttentionLevel;
  attentionReason: string;
  
  // Current visible vs hidden summary metrics
  academicScore: number;
  attendanceScore: number;
  engagementScore: number;
  participationScore: number;
  assignmentScore: number;
  communicationScore: number;

  // Convenience direct access aliases
  attendance: number;
  engagement: number;
  participation: number;
  assignmentConsistency: number;
  communication: number;
  divergenceIndex: number;
  signals: SignalMetric[];
  timelineByWindow: Record<TimeWindowOption, TimelineDataPoint[]>;

  // Signals for different time windows
  timeWindowSignals: Record<TimeWindowOption, SignalMetric[]>;

  // Timeline points per time window
  timeWindowTimeline: Record<TimeWindowOption, TimelineDataPoint[]>;

  // Dynamic AI content
  aiDetectionSummary: Record<TimeWindowOption, string>;
  flagReasons: string[];
  suggestedNextStep: {
    title: string;
    description: string;
    actionType: 'Mentor Check-in' | 'Academic Conversation' | 'Peer Support' | 'Communication Practice' | 'Attendance Follow-up';
    strategyType?: string;
    urgency: 'Low friction' | 'Prompt' | 'Routine';
  };
}

export interface CohortStats {
  totalMonitored: number;
  earlySignals: number;
  multipleSignals: number;
  stable: number;
  stableGrowth: number;
  watchCount: number;
}

export const DEMO_COHORT_STATS: CohortStats = {
  totalMonitored: 120,
  earlySignals: 18,
  multipleSignals: 7,
  stable: 95,
  stableGrowth: 95,
  watchCount: 14,
};

const RAW_SILENT_STRUGGLE_STUDENTS: Array<Omit<SilentStruggleStudent, 'attendance' | 'engagement' | 'participation' | 'assignmentConsistency' | 'communication' | 'divergenceIndex' | 'signals' | 'timelineByWindow'>> = [
  {
    id: 'arjun-kumar',
    name: 'Arjun Kumar',
    avatarInitials: 'AK',
    branch: 'CSE',
    year: '1st Year',
    studentId: 'EV-2026-CSE042',
    status: 'MULTIPLE SIGNALS',
    statusDescription: 'Multiple non-academic signals declining while academic performance appears stable',
    attentionLevel: 'Moderate',
    attentionReason: '4 non-academic behavioral metrics declining simultaneously over the last 4 weeks.',
    academicScore: 84,
    attendanceScore: 91,
    engagementScore: 64,
    participationScore: 59,
    assignmentScore: 67,
    communicationScore: 68,
    timeWindowSignals: {
      '2weeks': [
        { id: 'academic', name: 'Academic Performance', currentValue: 84, previousValue: 83, change: 1, unit: '%', trend: 'stable', status: 'stable', note: 'Quizzes and midterm exam scores remain high' },
        { id: 'attendance', name: 'Attendance', currentValue: 91, previousValue: 91, change: 0, unit: '%', trend: 'stable', status: 'stable', note: 'Physical lecture presence steady above 90%' },
        { id: 'engagement', name: 'LMS Engagement', currentValue: 64, previousValue: 71, change: -7, unit: '%', trend: 'declining', status: 'concerning', note: 'Interactive portal study time reduced' },
        { id: 'participation', name: 'Seminar Participation', currentValue: 59, previousValue: 65, change: -6, unit: '%', trend: 'declining', status: 'concerning', note: 'Fewer discussion board replies and questions' },
        { id: 'assignments', name: 'Assignment Consistency', currentValue: 67, previousValue: 73, change: -6, unit: '%', trend: 'declining', status: 'watch', note: 'Submissions delivered close to midnight deadline' },
        { id: 'communication', name: 'Faculty Outreach', currentValue: 68, previousValue: 72, change: -4, unit: '%', trend: 'declining', status: 'watch', note: 'TA office hour visits paused' },
      ],
      '4weeks': [
        { id: 'academic', name: 'Academic Performance', currentValue: 84, previousValue: 80, change: 4, unit: '%', trend: 'improving', status: 'stable', note: 'Exam marks consistently strong' },
        { id: 'attendance', name: 'Attendance', currentValue: 91, previousValue: 92, change: -1, unit: '%', trend: 'stable', status: 'stable', note: 'Consistent laboratory & lecture check-ins' },
        { id: 'engagement', name: 'LMS Engagement', currentValue: 64, previousValue: 82, change: -18, unit: '%', trend: 'declining', status: 'concerning', note: '18% drop in courseware and preparation hours' },
        { id: 'participation', name: 'Seminar Participation', currentValue: 59, previousValue: 80, change: -21, unit: '%', trend: 'declining', status: 'concerning', note: 'Quiet in seminar breakouts despite strong marks' },
        { id: 'assignments', name: 'Assignment Consistency', currentValue: 67, previousValue: 81, change: -14, unit: '%', trend: 'declining', status: 'concerning', note: '14% drop in formative pacing and pre-lab uploads' },
        { id: 'communication', name: 'Faculty Outreach', currentValue: 68, previousValue: 77, change: -9, unit: '%', trend: 'declining', status: 'watch', note: 'Reluctant to ask clarifying questions publicly' },
      ],
      '8weeks': [
        { id: 'academic', name: 'Academic Performance', currentValue: 84, previousValue: 76, change: 8, unit: '%', trend: 'improving', status: 'stable', note: 'Solid foundational mastery across modules' },
        { id: 'attendance', name: 'Attendance', currentValue: 91, previousValue: 94, change: -3, unit: '%', trend: 'stable', status: 'stable', note: 'Stable presence throughout semester' },
        { id: 'engagement', name: 'LMS Engagement', currentValue: 64, previousValue: 86, change: -22, unit: '%', trend: 'declining', status: 'concerning', note: 'Long-term digital study cadence decelerating' },
        { id: 'participation', name: 'Seminar Participation', currentValue: 59, previousValue: 84, change: -25, unit: '%', trend: 'declining', status: 'concerning', note: 'Gradual retreat from vocal collaborative sessions' },
        { id: 'assignments', name: 'Assignment Consistency', currentValue: 67, previousValue: 85, change: -18, unit: '%', trend: 'declining', status: 'concerning', note: 'Cadence compressed into last-minute bursts' },
        { id: 'communication', name: 'Faculty Outreach', currentValue: 68, previousValue: 79, change: -11, unit: '%', trend: 'declining', status: 'watch', note: 'Minimal TA touchpoints over the half-term' },
      ],
      'semester': [
        { id: 'academic', name: 'Academic Performance', currentValue: 84, previousValue: 75, change: 9, unit: '%', trend: 'improving', status: 'stable', note: 'Academic marks maintained at honor level' },
        { id: 'attendance', name: 'Attendance', currentValue: 91, previousValue: 95, change: -4, unit: '%', trend: 'stable', status: 'stable', note: 'Physical attendance within compliant threshold' },
        { id: 'engagement', name: 'LMS Engagement', currentValue: 64, previousValue: 88, change: -24, unit: '%', trend: 'declining', status: 'concerning', note: 'Broad downward slope in interactive learning' },
        { id: 'participation', name: 'Seminar Participation', currentValue: 59, previousValue: 86, change: -27, unit: '%', trend: 'declining', status: 'concerning', note: 'Marked shift toward passive observer posture' },
        { id: 'assignments', name: 'Assignment Consistency', currentValue: 67, previousValue: 86, change: -19, unit: '%', trend: 'declining', status: 'concerning', note: 'Cadence volatility in code assignment uploads' },
        { id: 'communication', name: 'Faculty Outreach', currentValue: 68, previousValue: 80, change: -12, unit: '%', trend: 'declining', status: 'watch', note: 'Less proactive help-seeking' },
      ],
    },
    timeWindowTimeline: {
      '2weeks': [
        { period: 'Day 1-4', academic: 83, engagement: 71, attendance: 91, participation: 65, assignments: 73, communication: 72 },
        { period: 'Day 5-8', academic: 83, engagement: 68, attendance: 91, participation: 62, assignments: 70, communication: 70 },
        { period: 'Day 9-11', academic: 84, engagement: 66, attendance: 91, participation: 60, assignments: 68, communication: 69 },
        { period: 'Day 12-14', academic: 84, engagement: 64, attendance: 91, participation: 59, assignments: 67, communication: 68 },
      ],
      '4weeks': [
        { period: 'Week 1', academic: 80, engagement: 82, attendance: 92, participation: 80, assignments: 81, communication: 77 },
        { period: 'Week 2', academic: 82, engagement: 79, attendance: 91, participation: 74, assignments: 77, communication: 75 },
        { period: 'Week 3', academic: 83, engagement: 71, attendance: 91, participation: 66, assignments: 72, communication: 71 },
        { period: 'Week 4', academic: 84, engagement: 64, attendance: 90, participation: 59, assignments: 67, communication: 68 },
      ],
      '8weeks': [
        { period: 'Weeks 1-2', academic: 76, engagement: 86, attendance: 94, participation: 84, assignments: 85, communication: 79 },
        { period: 'Weeks 3-4', academic: 80, engagement: 81, attendance: 92, participation: 78, assignments: 80, communication: 76 },
        { period: 'Weeks 5-6', academic: 82, engagement: 73, attendance: 91, participation: 68, assignments: 74, communication: 72 },
        { period: 'Weeks 7-8', academic: 84, engagement: 64, attendance: 91, participation: 59, assignments: 67, communication: 68 },
      ],
      'semester': [
        { period: 'Month 1', academic: 75, engagement: 88, attendance: 95, participation: 86, assignments: 86, communication: 80 },
        { period: 'Month 2', academic: 79, engagement: 84, attendance: 93, participation: 80, assignments: 82, communication: 77 },
        { period: 'Month 3', academic: 82, engagement: 74, attendance: 91, participation: 69, assignments: 74, communication: 72 },
        { period: 'Month 4', academic: 84, engagement: 64, attendance: 91, participation: 59, assignments: 67, communication: 68 },
      ],
    },
    aiDetectionSummary: {
      '2weeks': 'Over the last 2 weeks, Arjun’s academic performance is steady at 84%, but daily LMS activity and seminar questions continue to taper downward. This suggests an ongoing non-academic friction.',
      '4weeks': 'Academic performance remains stable at 84%, but engagement has declined by 18% over the last four weeks. Participation (-21%) and assignment consistency (-14%) have also decreased. The combination of these changes represents an early warning pattern that may require attention.',
      '8weeks': 'A two-month longitudinal divergence is evident: while course assessment scores grew from 76% to 84%, interactive learning signals fell by over 20%. The student presents as high-achieving on paper, yet behavioral insulation is compounding.',
      'semester': 'Semester telemetry demonstrates classic silent struggle: core grade resilience masking progressive withdrawal from peer dialogues, forum interactions, and early-cadence submission patterns.',
    },
    flagReasons: [
      'Engagement declined 18% over the 4-week observation window',
      'Seminar participation dropped 21% without unexcused physical absences',
      'Assignment submission cadence dropped 14%, shifting toward late-night bursts',
      'Changes occurred simultaneously across multiple consecutive weeks',
      'Academic performance has not yet declined significantly (84%), which conceals this pattern from standard grade alerts',
    ],
    suggestedNextStep: {
      title: 'Mentor Check-in',
      description: 'Consider a low-friction mentor check-in to understand whether the engagement decline is temporary (e.g., external project workload, personal adjustments) or requires additional support.',
      actionType: 'Mentor Check-in',
      urgency: 'Low friction',
    },
  },
  {
    id: 'priya-sharma',
    name: 'Priya Sharma',
    avatarInitials: 'PS',
    branch: 'CSE',
    year: '2nd Year',
    studentId: 'EV-2025-CSE109',
    status: 'NORMAL',
    statusDescription: 'Balanced multi-dimensional indicators across academic, participation, and study consistency',
    attentionLevel: 'Low',
    attentionReason: 'All telemetry vectors are positively reinforcing with no declining signals detected.',
    academicScore: 88,
    attendanceScore: 94,
    engagementScore: 91,
    participationScore: 89,
    assignmentScore: 93,
    communicationScore: 87,
    timeWindowSignals: {
      '2weeks': [
        { id: 'academic', name: 'Academic Performance', currentValue: 88, previousValue: 87, change: 1, unit: '%', trend: 'improving', status: 'stable', note: 'Algorithms and database design assignments top tier' },
        { id: 'attendance', name: 'Attendance', currentValue: 94, previousValue: 94, change: 0, unit: '%', trend: 'stable', status: 'stable', note: 'Perfect laboratory presence' },
        { id: 'engagement', name: 'LMS Engagement', currentValue: 91, previousValue: 90, change: 1, unit: '%', trend: 'improving', status: 'stable', note: 'High frequency interactive quiz attempts' },
        { id: 'participation', name: 'Seminar Participation', currentValue: 89, previousValue: 88, change: 1, unit: '%', trend: 'improving', status: 'stable', note: 'Active peer code reviewer in lab sessions' },
        { id: 'assignments', name: 'Assignment Consistency', currentValue: 93, previousValue: 92, change: 1, unit: '%', trend: 'improving', status: 'stable', note: 'Consistently submitted 48h prior to deadline' },
        { id: 'communication', name: 'Faculty Outreach', currentValue: 87, previousValue: 86, change: 1, unit: '%', trend: 'improving', status: 'stable', note: 'Constructive TA discussions' },
      ],
      '4weeks': [
        { id: 'academic', name: 'Academic Performance', currentValue: 88, previousValue: 86, change: 2, unit: '%', trend: 'improving', status: 'stable', note: 'Sustained mastery above 85%' },
        { id: 'attendance', name: 'Attendance', currentValue: 94, previousValue: 93, change: 1, unit: '%', trend: 'stable', status: 'stable', note: 'Exemplary punctuality' },
        { id: 'engagement', name: 'LMS Engagement', currentValue: 91, previousValue: 89, change: 2, unit: '%', trend: 'improving', status: 'stable', note: 'Deep reading of supplementary documentation' },
        { id: 'participation', name: 'Seminar Participation', currentValue: 89, previousValue: 87, change: 2, unit: '%', trend: 'improving', status: 'stable', note: 'Regular contributor in lecture Q&A' },
        { id: 'assignments', name: 'Assignment Consistency', currentValue: 93, previousValue: 91, change: 2, unit: '%', trend: 'improving', status: 'stable', note: 'Zero late submissions all semester' },
        { id: 'communication', name: 'Faculty Outreach', currentValue: 87, previousValue: 85, change: 2, unit: '%', trend: 'improving', status: 'stable', note: 'Professional collaborative voice' },
      ],
      '8weeks': [
        { id: 'academic', name: 'Academic Performance', currentValue: 88, previousValue: 83, change: 5, unit: '%', trend: 'improving', status: 'stable', note: 'Upward trend in algorithmic coding' },
        { id: 'attendance', name: 'Attendance', currentValue: 94, previousValue: 92, change: 2, unit: '%', trend: 'stable', status: 'stable', note: 'High classroom reliability' },
        { id: 'engagement', name: 'LMS Engagement', currentValue: 91, previousValue: 85, change: 6, unit: '%', trend: 'improving', status: 'stable', note: 'Expanding study habits' },
        { id: 'participation', name: 'Seminar Participation', currentValue: 89, previousValue: 84, change: 5, unit: '%', trend: 'improving', status: 'stable', note: 'Emerging peer study leader' },
        { id: 'assignments', name: 'Assignment Consistency', currentValue: 93, previousValue: 88, change: 5, unit: '%', trend: 'improving', status: 'stable', note: 'Top quartile pacing cadence' },
        { id: 'communication', name: 'Faculty Outreach', currentValue: 87, previousValue: 82, change: 5, unit: '%', trend: 'improving', status: 'stable', note: 'Strong articulation' },
      ],
      'semester': [
        { id: 'academic', name: 'Academic Performance', currentValue: 88, previousValue: 82, change: 6, unit: '%', trend: 'improving', status: 'stable', note: 'Exemplary full-term performance' },
        { id: 'attendance', name: 'Attendance', currentValue: 94, previousValue: 91, change: 3, unit: '%', trend: 'stable', status: 'stable', note: 'Consistent laboratory discipline' },
        { id: 'engagement', name: 'LMS Engagement', currentValue: 91, previousValue: 83, change: 8, unit: '%', trend: 'improving', status: 'stable', note: 'Sustained engagement throughout' },
        { id: 'participation', name: 'Seminar Participation', currentValue: 89, previousValue: 81, change: 8, unit: '%', trend: 'improving', status: 'stable', note: 'High collaborative presence' },
        { id: 'assignments', name: 'Assignment Consistency', currentValue: 93, previousValue: 86, change: 7, unit: '%', trend: 'improving', status: 'stable', note: 'Reliable homework cadence' },
        { id: 'communication', name: 'Faculty Outreach', currentValue: 87, previousValue: 80, change: 7, unit: '%', trend: 'improving', status: 'stable', note: 'Effective advisor rapport' },
      ],
    },
    timeWindowTimeline: {
      '2weeks': [
        { period: 'Day 1-4', academic: 87, engagement: 90, attendance: 94, participation: 88, assignments: 92, communication: 86 },
        { period: 'Day 5-8', academic: 88, engagement: 91, attendance: 94, participation: 88, assignments: 93, communication: 87 },
        { period: 'Day 9-11', academic: 88, engagement: 91, attendance: 94, participation: 89, assignments: 93, communication: 87 },
        { period: 'Day 12-14', academic: 88, engagement: 91, attendance: 94, participation: 89, assignments: 93, communication: 87 },
      ],
      '4weeks': [
        { period: 'Week 1', academic: 86, engagement: 89, attendance: 93, participation: 87, assignments: 91, communication: 85 },
        { period: 'Week 2', academic: 87, engagement: 90, attendance: 93, participation: 88, assignments: 92, communication: 86 },
        { period: 'Week 3', academic: 87, engagement: 91, attendance: 94, participation: 88, assignments: 92, communication: 86 },
        { period: 'Week 4', academic: 88, engagement: 91, attendance: 94, participation: 89, assignments: 93, communication: 87 },
      ],
      '8weeks': [
        { period: 'Weeks 1-2', academic: 83, engagement: 85, attendance: 92, participation: 84, assignments: 88, communication: 82 },
        { period: 'Weeks 3-4', academic: 85, engagement: 87, attendance: 93, participation: 86, assignments: 90, communication: 84 },
        { period: 'Weeks 5-6', academic: 87, engagement: 89, attendance: 93, participation: 87, assignments: 91, communication: 85 },
        { period: 'Weeks 7-8', academic: 88, engagement: 91, attendance: 94, participation: 89, assignments: 93, communication: 87 },
      ],
      'semester': [
        { period: 'Month 1', academic: 82, engagement: 83, attendance: 91, participation: 81, assignments: 86, communication: 80 },
        { period: 'Month 2', academic: 84, engagement: 86, attendance: 92, participation: 84, assignments: 89, communication: 82 },
        { period: 'Month 3', academic: 86, engagement: 89, attendance: 93, participation: 87, assignments: 91, communication: 85 },
        { period: 'Month 4', academic: 88, engagement: 91, attendance: 94, participation: 89, assignments: 93, communication: 87 },
      ],
    },
    aiDetectionSummary: {
      '2weeks': 'Priya demonstrates robust equilibrium across all signals. Engagement and assignments remain above the 90th percentile with no anomalies detected.',
      '4weeks': 'Priya demonstrates healthy, harmonious student growth. Both academic performance (88%) and non-academic vectors (engagement 91%, participation 89%) are in synchrony. No early warning signals are present.',
      '8weeks': 'Telemetry displays sustained, self-directed momentum over two months. Feedback loops between coursework and seminar contribution are stable.',
      'semester': 'Semester analysis indicates exemplary stability with progressive improvement across all six monitoring channels.',
    },
    flagReasons: [
      'Zero declining signals across the observation window',
      'High correlation between high academic outcomes and proactive engagement',
      'Consistent early assignment submissions demonstrate strong time autonomy',
    ],
    suggestedNextStep: {
      title: 'Recognition & Peer Leadership',
      description: 'Consider nominating Priya as a peer review lead or student study cluster mentor to leverage her consistent academic and collaborative rhythm.',
      actionType: 'Peer Support',
      urgency: 'Routine',
    },
  },
  {
    id: 'rahul-verma',
    name: 'Rahul Verma',
    avatarInitials: 'RV',
    branch: 'ECE',
    year: '3rd Year',
    studentId: 'EV-2024-ECE077',
    status: 'MULTIPLE SIGNALS',
    statusDescription: 'Multiple acute downward signals across attendance, assignment timing, and interactive portal depth',
    attentionLevel: 'High',
    attentionReason: 'Five distinct signals have declined simultaneously, signaling an escalating multi-dimensional challenge.',
    academicScore: 72,
    attendanceScore: 76,
    engagementScore: 58,
    participationScore: 51,
    assignmentScore: 55,
    communicationScore: 61,
    timeWindowSignals: {
      '2weeks': [
        { id: 'academic', name: 'Academic Performance', currentValue: 72, previousValue: 73, change: -1, unit: '%', trend: 'declining', status: 'watch', note: 'Borderline quiz marks in signal processing' },
        { id: 'attendance', name: 'Attendance', currentValue: 76, previousValue: 79, change: -3, unit: '%', trend: 'declining', status: 'concerning', note: 'Missed two morning recitation sessions' },
        { id: 'engagement', name: 'LMS Engagement', currentValue: 58, previousValue: 63, change: -5, unit: '%', trend: 'declining', status: 'concerning', note: 'Infrequent portal access over weekends' },
        { id: 'participation', name: 'Seminar Participation', currentValue: 51, previousValue: 55, change: -4, unit: '%', trend: 'declining', status: 'concerning', note: 'Minimal interaction during laboratory breakouts' },
        { id: 'assignments', name: 'Assignment Consistency', currentValue: 55, previousValue: 60, change: -5, unit: '%', trend: 'declining', status: 'concerning', note: 'One late submission recorded this week' },
        { id: 'communication', name: 'Faculty Outreach', currentValue: 61, previousValue: 64, change: -3, unit: '%', trend: 'declining', status: 'watch', note: 'Unanswered check-in message from lab TA' },
      ],
      '4weeks': [
        { id: 'academic', name: 'Academic Performance', currentValue: 72, previousValue: 76, change: -4, unit: '%', trend: 'declining', status: 'watch', note: 'Gradual softening from solid mid-70s' },
        { id: 'attendance', name: 'Attendance', currentValue: 76, previousValue: 88, change: -12, unit: '%', trend: 'declining', status: 'concerning', note: '12% decline in lecture attendance over the month' },
        { id: 'engagement', name: 'LMS Engagement', currentValue: 58, previousValue: 75, change: -17, unit: '%', trend: 'declining', status: 'concerning', note: '17% reduction in asynchronous course engagement' },
        { id: 'participation', name: 'Seminar Participation', currentValue: 51, previousValue: 72, change: -21, unit: '%', trend: 'declining', status: 'concerning', note: 'Participation dropped by 21%, minimal group voice' },
        { id: 'assignments', name: 'Assignment Consistency', currentValue: 55, previousValue: 74, change: -19, unit: '%', trend: 'declining', status: 'concerning', note: 'Submissions erratic, multiple grace period requests' },
        { id: 'communication', name: 'Faculty Outreach', currentValue: 61, previousValue: 70, change: -9, unit: '%', trend: 'declining', status: 'watch', note: 'Hesitancy in contacting instructors' },
      ],
      '8weeks': [
        { id: 'academic', name: 'Academic Performance', currentValue: 72, previousValue: 78, change: -6, unit: '%', trend: 'declining', status: 'concerning', note: 'Two consecutive test cycles showing lower returns' },
        { id: 'attendance', name: 'Attendance', currentValue: 76, previousValue: 91, change: -15, unit: '%', trend: 'declining', status: 'concerning', note: 'Attendance dropped from 91% baseline' },
        { id: 'engagement', name: 'LMS Engagement', currentValue: 58, previousValue: 79, change: -21, unit: '%', trend: 'declining', status: 'concerning', note: 'Steady reduction in pre-lecture preparation' },
        { id: 'participation', name: 'Seminar Participation', currentValue: 51, previousValue: 76, change: -25, unit: '%', trend: 'declining', status: 'concerning', note: 'Withdrawal from group projects noticed by peers' },
        { id: 'assignments', name: 'Assignment Consistency', currentValue: 55, previousValue: 78, change: -23, unit: '%', trend: 'declining', status: 'concerning', note: 'Cadence interrupted by multi-day lulls' },
        { id: 'communication', name: 'Faculty Outreach', currentValue: 61, previousValue: 73, change: -12, unit: '%', trend: 'declining', status: 'concerning', note: 'Isolation from departmental advising channels' },
      ],
      'semester': [
        { id: 'academic', name: 'Academic Performance', currentValue: 72, previousValue: 79, change: -7, unit: '%', trend: 'declining', status: 'concerning', note: 'Semester-long gentle drift downward' },
        { id: 'attendance', name: 'Attendance', currentValue: 76, previousValue: 92, change: -16, unit: '%', trend: 'declining', status: 'concerning', note: 'Significant attendance decline requiring prompt support' },
        { id: 'engagement', name: 'LMS Engagement', currentValue: 58, previousValue: 81, change: -23, unit: '%', trend: 'declining', status: 'concerning', note: 'Severe reduction in digital platform time' },
        { id: 'participation', name: 'Seminar Participation', currentValue: 51, previousValue: 78, change: -27, unit: '%', trend: 'declining', status: 'concerning', note: 'Passive behavior in almost all collaborative settings' },
        { id: 'assignments', name: 'Assignment Consistency', currentValue: 55, previousValue: 80, change: -25, unit: '%', trend: 'declining', status: 'concerning', note: 'Unfinished lab checkoffs accumulating' },
        { id: 'communication', name: 'Faculty Outreach', currentValue: 61, previousValue: 75, change: -14, unit: '%', trend: 'declining', status: 'concerning', note: 'Limited dialogue with faculty advisors' },
      ],
    },
    timeWindowTimeline: {
      '2weeks': [
        { period: 'Day 1-4', academic: 73, engagement: 63, attendance: 79, participation: 55, assignments: 60, communication: 64 },
        { period: 'Day 5-8', academic: 73, engagement: 61, attendance: 78, participation: 53, assignments: 58, communication: 63 },
        { period: 'Day 9-11', academic: 72, engagement: 59, attendance: 77, participation: 52, assignments: 56, communication: 62 },
        { period: 'Day 12-14', academic: 72, engagement: 58, attendance: 76, participation: 51, assignments: 55, communication: 61 },
      ],
      '4weeks': [
        { period: 'Week 1', academic: 76, engagement: 75, attendance: 88, participation: 72, assignments: 74, communication: 70 },
        { period: 'Week 2', academic: 75, engagement: 70, attendance: 84, participation: 66, assignments: 68, communication: 67 },
        { period: 'Week 3', academic: 73, engagement: 64, attendance: 80, participation: 58, assignments: 61, communication: 64 },
        { period: 'Week 4', academic: 72, engagement: 58, attendance: 76, participation: 51, assignments: 55, communication: 61 },
      ],
      '8weeks': [
        { period: 'Weeks 1-2', academic: 78, engagement: 79, attendance: 91, participation: 76, assignments: 78, communication: 73 },
        { period: 'Weeks 3-4', academic: 76, engagement: 74, attendance: 87, participation: 70, assignments: 72, communication: 69 },
        { period: 'Weeks 5-6', academic: 74, engagement: 66, attendance: 81, participation: 61, assignments: 63, communication: 65 },
        { period: 'Weeks 7-8', academic: 72, engagement: 58, attendance: 76, participation: 51, assignments: 55, communication: 61 },
      ],
      'semester': [
        { period: 'Month 1', academic: 79, engagement: 81, attendance: 92, participation: 78, assignments: 80, communication: 75 },
        { period: 'Month 2', academic: 77, engagement: 75, attendance: 87, participation: 71, assignments: 73, communication: 70 },
        { period: 'Month 3', academic: 74, engagement: 67, attendance: 82, participation: 62, assignments: 64, communication: 66 },
        { period: 'Month 4', academic: 72, engagement: 58, attendance: 76, participation: 51, assignments: 55, communication: 61 },
      ],
    },
    aiDetectionSummary: {
      '2weeks': 'Rahul has entered an accelerated deceleration across attendance (76%) and assignment consistency (55%). A direct academic conversation is recommended this week.',
      '4weeks': 'While Rahul’s academic baseline (72%) has not yet dropped to critical failure thresholds, multiple non-academic metrics are declining steeply: attendance (-12%), engagement (-17%), participation (-21%), and assignments (-19%). This multi-signal convergence represents an urgent opportunity for proactive support.',
      '8weeks': 'Telemetry displays compound friction across classroom attendance and lab consistency over the past 8 weeks. Early non-judgmental advisor intervention could prevent academic derailment.',
      'semester': 'Long-term telemetry confirms that non-academic disengagement preceded the recent decline in test marks by nearly 6 weeks. Timely supportive outreach is strongly indicated.',
    },
    flagReasons: [
      'Simultaneous decline in attendance (76%), engagement (58%), and assignments (55%)',
      'Participation dropped 21% over the past 4 weeks',
      'Signals of compound isolation: unanswered TA messages and late lab deliverables',
      'Academic score is softening from 76% to 72%, indicating behavioral factors are beginning to impact curricular mastery',
    ],
    suggestedNextStep: {
      title: 'Academic & Personal Well-being Conversation',
      description: 'Schedule an empathetic, high-priority conversation with both the academic advisor and a student success mentor to review course workload and explore personal or scheduling constraints.',
      actionType: 'Academic Conversation',
      urgency: 'Prompt',
    },
  },
  {
    id: 'sneha-reddy',
    name: 'Sneha Reddy',
    avatarInitials: 'SR',
    branch: 'EEE',
    year: '2nd Year',
    studentId: 'EV-2025-EEE054',
    status: 'NORMAL',
    statusDescription: 'Consistent positive growth pattern with solid attendance and steady assignment cadence',
    attentionLevel: 'Low',
    attentionReason: 'Steady telemetry with minor fluctuations well within expected baseline parameters.',
    academicScore: 79,
    attendanceScore: 89,
    engagementScore: 82,
    participationScore: 78,
    assignmentScore: 85,
    communicationScore: 75,
    timeWindowSignals: {
      '2weeks': [
        { id: 'academic', name: 'Academic Performance', currentValue: 79, previousValue: 78, change: 1, unit: '%', trend: 'improving', status: 'stable', note: 'Steady laboratory marks in electrical circuits' },
        { id: 'attendance', name: 'Attendance', currentValue: 89, previousValue: 88, change: 1, unit: '%', trend: 'improving', status: 'stable', note: 'Punctual arrivals' },
        { id: 'engagement', name: 'LMS Engagement', currentValue: 82, previousValue: 81, change: 1, unit: '%', trend: 'improving', status: 'stable', note: 'Regular weekly problem set practice' },
        { id: 'participation', name: 'Seminar Participation', currentValue: 78, previousValue: 77, change: 1, unit: '%', trend: 'improving', status: 'stable', note: 'Good engagement during lab checkoffs' },
        { id: 'assignments', name: 'Assignment Consistency', currentValue: 85, previousValue: 84, change: 1, unit: '%', trend: 'improving', status: 'stable', note: 'Consistent submission rhythm' },
        { id: 'communication', name: 'Faculty Outreach', currentValue: 75, previousValue: 74, change: 1, unit: '%', trend: 'improving', status: 'stable', note: 'Standard queries answered promptly' },
      ],
      '4weeks': [
        { id: 'academic', name: 'Academic Performance', currentValue: 79, previousValue: 76, change: 3, unit: '%', trend: 'improving', status: 'stable', note: 'Quiz scores rising consistently' },
        { id: 'attendance', name: 'Attendance', currentValue: 89, previousValue: 87, change: 2, unit: '%', trend: 'improving', status: 'stable', note: 'High attendance stability' },
        { id: 'engagement', name: 'LMS Engagement', currentValue: 82, previousValue: 78, change: 4, unit: '%', trend: 'improving', status: 'stable', note: 'Active prep in asynchronous modules' },
        { id: 'participation', name: 'Seminar Participation', currentValue: 78, previousValue: 75, change: 3, unit: '%', trend: 'improving', status: 'stable', note: 'Solid peer collaboration' },
        { id: 'assignments', name: 'Assignment Consistency', currentValue: 85, previousValue: 81, change: 4, unit: '%', trend: 'improving', status: 'stable', note: 'Consistently on-time circuit simulation reports' },
        { id: 'communication', name: 'Faculty Outreach', currentValue: 75, previousValue: 72, change: 3, unit: '%', trend: 'improving', status: 'stable', note: 'Proactive questions to course mentor' },
      ],
      '8weeks': [
        { id: 'academic', name: 'Academic Performance', currentValue: 79, previousValue: 74, change: 5, unit: '%', trend: 'improving', status: 'stable', note: 'Consistent semester trajectory' },
        { id: 'attendance', name: 'Attendance', currentValue: 89, previousValue: 85, change: 4, unit: '%', trend: 'improving', status: 'stable', note: 'Solid lecture presence' },
        { id: 'engagement', name: 'LMS Engagement', currentValue: 82, previousValue: 75, change: 7, unit: '%', trend: 'improving', status: 'stable', note: 'Progressive build-up of study time' },
        { id: 'participation', name: 'Seminar Participation', currentValue: 78, previousValue: 72, change: 6, unit: '%', trend: 'improving', status: 'stable', note: 'Expanding vocal presence in class' },
        { id: 'assignments', name: 'Assignment Consistency', currentValue: 85, previousValue: 78, change: 7, unit: '%', trend: 'improving', status: 'stable', note: 'Steady homework reliability' },
        { id: 'communication', name: 'Faculty Outreach', currentValue: 75, previousValue: 69, change: 6, unit: '%', trend: 'improving', status: 'stable', note: 'Growing rapport with lab instructors' },
      ],
      'semester': [
        { id: 'academic', name: 'Academic Performance', currentValue: 79, previousValue: 72, change: 7, unit: '%', trend: 'improving', status: 'stable', note: 'Longitudinal gains across semester' },
        { id: 'attendance', name: 'Attendance', currentValue: 89, previousValue: 84, change: 5, unit: '%', trend: 'improving', status: 'stable', note: 'Dependable lecture presence' },
        { id: 'engagement', name: 'LMS Engagement', currentValue: 82, previousValue: 73, change: 9, unit: '%', trend: 'improving', status: 'stable', note: 'Steady asynchronous engagement' },
        { id: 'participation', name: 'Seminar Participation', currentValue: 78, previousValue: 70, change: 8, unit: '%', trend: 'improving', status: 'stable', note: 'Positive peer collaboration' },
        { id: 'assignments', name: 'Assignment Consistency', currentValue: 85, previousValue: 76, change: 9, unit: '%', trend: 'improving', status: 'stable', note: 'Consistent pacing' },
        { id: 'communication', name: 'Faculty Outreach', currentValue: 75, previousValue: 67, change: 8, unit: '%', trend: 'improving', status: 'stable', note: 'Healthy mentor connection' },
      ],
    },
    timeWindowTimeline: {
      '2weeks': [
        { period: 'Day 1-4', academic: 78, engagement: 81, attendance: 88, participation: 77, assignments: 84, communication: 74 },
        { period: 'Day 5-8', academic: 78, engagement: 81, attendance: 89, participation: 77, assignments: 84, communication: 75 },
        { period: 'Day 9-11', academic: 79, engagement: 82, attendance: 89, participation: 78, assignments: 85, communication: 75 },
        { period: 'Day 12-14', academic: 79, engagement: 82, attendance: 89, participation: 78, assignments: 85, communication: 75 },
      ],
      '4weeks': [
        { period: 'Week 1', academic: 76, engagement: 78, attendance: 87, participation: 75, assignments: 81, communication: 72 },
        { period: 'Week 2', academic: 77, engagement: 79, attendance: 88, participation: 76, assignments: 82, communication: 73 },
        { period: 'Week 3', academic: 78, engagement: 81, attendance: 88, participation: 77, assignments: 84, communication: 74 },
        { period: 'Week 4', academic: 79, engagement: 82, attendance: 89, participation: 78, assignments: 85, communication: 75 },
      ],
      '8weeks': [
        { period: 'Weeks 1-2', academic: 74, engagement: 75, attendance: 85, participation: 72, assignments: 78, communication: 69 },
        { period: 'Weeks 3-4', academic: 76, engagement: 77, attendance: 86, participation: 74, assignments: 80, communication: 71 },
        { period: 'Weeks 5-6', academic: 77, engagement: 80, attendance: 88, participation: 76, assignments: 83, communication: 73 },
        { period: 'Weeks 7-8', academic: 79, engagement: 82, attendance: 89, participation: 78, assignments: 85, communication: 75 },
      ],
      'semester': [
        { period: 'Month 1', academic: 72, engagement: 73, attendance: 84, participation: 70, assignments: 76, communication: 67 },
        { period: 'Month 2', academic: 75, engagement: 76, attendance: 86, participation: 73, assignments: 79, communication: 70 },
        { period: 'Month 3', academic: 77, engagement: 79, attendance: 88, participation: 76, assignments: 82, communication: 73 },
        { period: 'Month 4', academic: 79, engagement: 82, attendance: 89, participation: 78, assignments: 85, communication: 75 },
      ],
    },
    aiDetectionSummary: {
      '2weeks': 'Sneha exhibits steady positive indicators across all five monitored dimensions. No friction signals observed.',
      '4weeks': 'Sneha’s indicators reflect consistent and balanced growth across all dimensions. Academic performance (79%) and assignment consistency (85%) remain harmonious with no signs of distress.',
      '8weeks': 'A clean upward slope in both technical assessments and voluntary practice problems demonstrates durable learning habits.',
      'semester': 'Sneha’s long-term profile represents exemplary continuous improvement across curriculum modules.',
    },
    flagReasons: [
      'Steady upward trajectory in assessment scores and lab checkoffs',
      'Dependable attendance and on-time assignment completions',
      'No anomalous behavioral deviations or participation drop-offs',
    ],
    suggestedNextStep: {
      title: 'Routine Academic Advisory',
      description: 'Maintain routine semester check-ins to support Sneha’s continued progress toward upcoming capstone prerequisites.',
      actionType: 'Academic Conversation',
      urgency: 'Routine',
    },
  },
  {
    id: 'kiran-kumar',
    name: 'Kiran Kumar',
    avatarInitials: 'KK',
    branch: 'CSE',
    year: '1st Year',
    studentId: 'EV-2026-CSE093',
    status: 'EARLY SIGNAL',
    statusDescription: 'Early localized decline in asynchronous prep hours while lecture grades remain solid',
    attentionLevel: 'Moderate',
    attentionReason: 'Engagement and participation show an early 2-week downward vector (-12% and -10%).',
    academicScore: 81,
    attendanceScore: 87,
    engagementScore: 69,
    participationScore: 66,
    assignmentScore: 72,
    communicationScore: 71,
    timeWindowSignals: {
      '2weeks': [
        { id: 'academic', name: 'Academic Performance', currentValue: 81, previousValue: 81, change: 0, unit: '%', trend: 'stable', status: 'stable', note: 'Exams and module quizzes stable at 81%' },
        { id: 'attendance', name: 'Attendance', currentValue: 87, previousValue: 88, change: -1, unit: '%', trend: 'stable', status: 'stable', note: 'Attendance remains within normal threshold' },
        { id: 'engagement', name: 'LMS Engagement', currentValue: 69, previousValue: 75, change: -6, unit: '%', trend: 'declining', status: 'watch', note: 'LMS session durations slightly shorter' },
        { id: 'participation', name: 'Seminar Participation', currentValue: 66, previousValue: 71, change: -5, unit: '%', trend: 'declining', status: 'watch', note: 'Less spontaneous breakout dialogue' },
        { id: 'assignments', name: 'Assignment Consistency', currentValue: 72, previousValue: 75, change: -3, unit: '%', trend: 'declining', status: 'watch', note: 'Deliverables submitted right before cutoff' },
        { id: 'communication', name: 'Faculty Outreach', currentValue: 71, previousValue: 73, change: -2, unit: '%', trend: 'stable', status: 'stable', note: 'Polite, standard TA check-in cadence' },
      ],
      '4weeks': [
        { id: 'academic', name: 'Academic Performance', currentValue: 81, previousValue: 80, change: 1, unit: '%', trend: 'stable', status: 'stable', note: 'Solid academic foundation' },
        { id: 'attendance', name: 'Attendance', currentValue: 87, previousValue: 90, change: -3, unit: '%', trend: 'stable', status: 'stable', note: 'Occasional morning recitation tardiness' },
        { id: 'engagement', name: 'LMS Engagement', currentValue: 69, previousValue: 81, change: -12, unit: '%', trend: 'declining', status: 'watch', note: '12% decline in LMS login frequency' },
        { id: 'participation', name: 'Seminar Participation', currentValue: 66, previousValue: 76, change: -10, unit: '%', trend: 'declining', status: 'watch', note: 'Participation softened by 10% in seminar groups' },
        { id: 'assignments', name: 'Assignment Consistency', currentValue: 72, previousValue: 79, change: -7, unit: '%', trend: 'declining', status: 'watch', note: 'Slight delay in coding lab uploads' },
        { id: 'communication', name: 'Faculty Outreach', currentValue: 71, previousValue: 75, change: -4, unit: '%', trend: 'stable', status: 'stable', note: 'Slightly fewer questions asked' },
      ],
      '8weeks': [
        { id: 'academic', name: 'Academic Performance', currentValue: 81, previousValue: 78, change: 3, unit: '%', trend: 'improving', status: 'stable', note: 'Consistent core exam scores' },
        { id: 'attendance', name: 'Attendance', currentValue: 87, previousValue: 91, change: -4, unit: '%', trend: 'stable', status: 'stable', note: 'Overall attendance steady' },
        { id: 'engagement', name: 'LMS Engagement', currentValue: 69, previousValue: 83, change: -14, unit: '%', trend: 'declining', status: 'watch', note: 'Lower time spent on supplementary coding challenges' },
        { id: 'participation', name: 'Seminar Participation', currentValue: 66, previousValue: 78, change: -12, unit: '%', trend: 'declining', status: 'watch', note: 'Fewer interactions in group problem sessions' },
        { id: 'assignments', name: 'Assignment Consistency', currentValue: 72, previousValue: 81, change: -9, unit: '%', trend: 'declining', status: 'watch', note: 'Variability in submission time' },
        { id: 'communication', name: 'Faculty Outreach', currentValue: 71, previousValue: 76, change: -5, unit: '%', trend: 'stable', status: 'stable', note: 'Neutral outreach frequency' },
      ],
      'semester': [
        { id: 'academic', name: 'Academic Performance', currentValue: 81, previousValue: 77, change: 4, unit: '%', trend: 'improving', status: 'stable', note: 'Satisfactory semester academic outcome' },
        { id: 'attendance', name: 'Attendance', currentValue: 87, previousValue: 92, change: -5, unit: '%', trend: 'stable', status: 'stable', note: 'Slight drop in Friday lectures' },
        { id: 'engagement', name: 'LMS Engagement', currentValue: 69, previousValue: 85, change: -16, unit: '%', trend: 'declining', status: 'watch', note: 'Gradual retreat from optional modules' },
        { id: 'participation', name: 'Seminar Participation', currentValue: 66, previousValue: 80, change: -14, unit: '%', trend: 'declining', status: 'watch', note: 'Reduced collaborative contributions' },
        { id: 'assignments', name: 'Assignment Consistency', currentValue: 72, previousValue: 82, change: -10, unit: '%', trend: 'declining', status: 'watch', note: 'Pacing compressed into late deadlines' },
        { id: 'communication', name: 'Faculty Outreach', currentValue: 71, previousValue: 77, change: -6, unit: '%', trend: 'stable', status: 'stable', note: 'Standard communication' },
      ],
    },
    timeWindowTimeline: {
      '2weeks': [
        { period: 'Day 1-4', academic: 81, engagement: 75, attendance: 88, participation: 71, assignments: 75, communication: 73 },
        { period: 'Day 5-8', academic: 81, engagement: 72, attendance: 87, participation: 69, assignments: 74, communication: 72 },
        { period: 'Day 9-11', academic: 81, engagement: 70, attendance: 87, participation: 67, assignments: 73, communication: 71 },
        { period: 'Day 12-14', academic: 81, engagement: 69, attendance: 87, participation: 66, assignments: 72, communication: 71 },
      ],
      '4weeks': [
        { period: 'Week 1', academic: 80, engagement: 81, attendance: 90, participation: 76, assignments: 79, communication: 75 },
        { period: 'Week 2', academic: 81, engagement: 77, attendance: 89, participation: 73, assignments: 77, communication: 74 },
        { period: 'Week 3', academic: 81, engagement: 73, attendance: 88, participation: 70, assignments: 74, communication: 72 },
        { period: 'Week 4', academic: 81, engagement: 69, attendance: 87, participation: 66, assignments: 72, communication: 71 },
      ],
      '8weeks': [
        { period: 'Weeks 1-2', academic: 78, engagement: 83, attendance: 91, participation: 78, assignments: 81, communication: 76 },
        { period: 'Weeks 3-4', academic: 80, engagement: 79, attendance: 89, participation: 75, assignments: 78, communication: 74 },
        { period: 'Weeks 5-6', academic: 81, engagement: 74, attendance: 88, participation: 71, assignments: 75, communication: 73 },
        { period: 'Weeks 7-8', academic: 81, engagement: 69, attendance: 87, participation: 66, assignments: 72, communication: 71 },
      ],
      'semester': [
        { period: 'Month 1', academic: 77, engagement: 85, attendance: 92, participation: 80, assignments: 82, communication: 77 },
        { period: 'Month 2', academic: 79, engagement: 81, attendance: 90, participation: 77, assignments: 79, communication: 75 },
        { period: 'Month 3', academic: 81, engagement: 75, attendance: 88, participation: 72, assignments: 76, communication: 73 },
        { period: 'Month 4', academic: 81, engagement: 69, attendance: 87, participation: 66, assignments: 72, communication: 71 },
      ],
    },
    aiDetectionSummary: {
      '2weeks': 'Kiran shows an emerging reduction in daily portal check-ins (-6%). Grades are untouched, making this a prime early-intervention moment.',
      '4weeks': 'Kiran maintains solid academic performance at 81%. However, engagement (-12%) and participation (-10%) have both begun softening over the last 4 weeks. This early warning signal may benefit from an informal check-in before it affects submission consistency.',
      '8weeks': 'Longitudinal signals show a slow, gentle decoupling of digital prep hours from test outcomes. Early outreach may help restore study cadence.',
      'semester': 'The semester timeline indicates an early signal pattern that developed gradually over months while remaining undetectable on conventional midterm reports.',
    },
    flagReasons: [
      'Engagement decreased by 12% over the last four weeks',
      'Participation in seminar breakouts softened by 10%',
      'Academic results remain solid at 81%, illustrating why early signals are easily overlooked',
    ],
    suggestedNextStep: {
      title: 'Informal Advisor Sync',
      description: 'Schedule a brief 10-minute check-in with Kiran to explore study cadence, lab group dynamics, and whether additional practice modules are needed.',
      actionType: 'Mentor Check-in',
      urgency: 'Low friction',
    },
  },
  {
    id: 'ananya-rao',
    name: 'Ananya Rao',
    avatarInitials: 'AR',
    branch: 'ECE',
    year: '1st Year',
    studentId: 'EV-2026-ECE031',
    status: 'WATCH',
    statusDescription: 'Slight localized participation dip following mid-term team transition',
    attentionLevel: 'Low',
    attentionReason: 'One non-academic metric (participation) shows a moderate dip; other signals are stable.',
    academicScore: 83,
    attendanceScore: 92,
    engagementScore: 78,
    participationScore: 68,
    assignmentScore: 82,
    communicationScore: 74,
    timeWindowSignals: {
      '2weeks': [
        { id: 'academic', name: 'Academic Performance', currentValue: 83, previousValue: 83, change: 0, unit: '%', trend: 'stable', status: 'stable', note: 'Exams steady' },
        { id: 'attendance', name: 'Attendance', currentValue: 92, previousValue: 92, change: 0, unit: '%', trend: 'stable', status: 'stable', note: 'Consistently present' },
        { id: 'engagement', name: 'LMS Engagement', currentValue: 78, previousValue: 79, change: -1, unit: '%', trend: 'stable', status: 'stable', note: 'Standard prep hours' },
        { id: 'participation', name: 'Seminar Participation', currentValue: 68, previousValue: 72, change: -4, unit: '%', trend: 'declining', status: 'watch', note: 'Quiet in new project group' },
        { id: 'assignments', name: 'Assignment Consistency', currentValue: 82, previousValue: 82, change: 0, unit: '%', trend: 'stable', status: 'stable', note: 'Punctual deliverables' },
        { id: 'communication', name: 'Faculty Outreach', currentValue: 74, previousValue: 75, change: -1, unit: '%', trend: 'stable', status: 'stable', note: 'Polite exchanges' },
      ],
      '4weeks': [
        { id: 'academic', name: 'Academic Performance', currentValue: 83, previousValue: 82, change: 1, unit: '%', trend: 'stable', status: 'stable', note: 'Academic stability' },
        { id: 'attendance', name: 'Attendance', currentValue: 92, previousValue: 93, change: -1, unit: '%', trend: 'stable', status: 'stable', note: 'Very reliable attendance' },
        { id: 'engagement', name: 'LMS Engagement', currentValue: 78, previousValue: 80, change: -2, unit: '%', trend: 'stable', status: 'stable', note: 'Consistent online rhythm' },
        { id: 'participation', name: 'Seminar Participation', currentValue: 68, previousValue: 77, change: -9, unit: '%', trend: 'declining', status: 'watch', note: '9% dip in collaborative seminar contributions' },
        { id: 'assignments', name: 'Assignment Consistency', currentValue: 82, previousValue: 83, change: -1, unit: '%', trend: 'stable', status: 'stable', note: 'On-time submissions' },
        { id: 'communication', name: 'Faculty Outreach', currentValue: 74, previousValue: 76, change: -2, unit: '%', trend: 'stable', status: 'stable', note: 'Good advisor connection' },
      ],
      '8weeks': [
        { id: 'academic', name: 'Academic Performance', currentValue: 83, previousValue: 81, change: 2, unit: '%', trend: 'improving', status: 'stable', note: 'Continuous progress' },
        { id: 'attendance', name: 'Attendance', currentValue: 92, previousValue: 93, change: -1, unit: '%', trend: 'stable', status: 'stable', note: 'High attendance baseline' },
        { id: 'engagement', name: 'LMS Engagement', currentValue: 78, previousValue: 81, change: -3, unit: '%', trend: 'stable', status: 'stable', note: 'Regular study hours' },
        { id: 'participation', name: 'Seminar Participation', currentValue: 68, previousValue: 79, change: -11, unit: '%', trend: 'declining', status: 'watch', note: 'Sustained quiet in team breakout sessions' },
        { id: 'assignments', name: 'Assignment Consistency', currentValue: 82, previousValue: 84, change: -2, unit: '%', trend: 'stable', status: 'stable', note: 'Dependable deliveries' },
        { id: 'communication', name: 'Faculty Outreach', currentValue: 74, previousValue: 77, change: -3, unit: '%', trend: 'stable', status: 'stable', note: 'Steady communication' },
      ],
      'semester': [
        { id: 'academic', name: 'Academic Performance', currentValue: 83, previousValue: 80, change: 3, unit: '%', trend: 'improving', status: 'stable', note: 'Strong course grasp' },
        { id: 'attendance', name: 'Attendance', currentValue: 92, previousValue: 94, change: -2, unit: '%', trend: 'stable', status: 'stable', note: 'Dependable presence' },
        { id: 'engagement', name: 'LMS Engagement', currentValue: 78, previousValue: 82, change: -4, unit: '%', trend: 'stable', status: 'stable', note: 'Normal LMS usage' },
        { id: 'participation', name: 'Seminar Participation', currentValue: 68, previousValue: 80, change: -12, unit: '%', trend: 'declining', status: 'watch', note: 'Shift toward observer stance' },
        { id: 'assignments', name: 'Assignment Consistency', currentValue: 82, previousValue: 85, change: -3, unit: '%', trend: 'stable', status: 'stable', note: 'Consistent cadence' },
        { id: 'communication', name: 'Faculty Outreach', currentValue: 74, previousValue: 78, change: -4, unit: '%', trend: 'stable', status: 'stable', note: 'Acceptable communication' },
      ],
    },
    timeWindowTimeline: {
      '2weeks': [
        { period: 'Day 1-4', academic: 83, engagement: 79, attendance: 92, participation: 72, assignments: 82, communication: 75 },
        { period: 'Day 5-8', academic: 83, engagement: 78, attendance: 92, participation: 70, assignments: 82, communication: 74 },
        { period: 'Day 9-11', academic: 83, engagement: 78, attendance: 92, participation: 69, assignments: 82, communication: 74 },
        { period: 'Day 12-14', academic: 83, engagement: 78, attendance: 92, participation: 68, assignments: 82, communication: 74 },
      ],
      '4weeks': [
        { period: 'Week 1', academic: 82, engagement: 80, attendance: 93, participation: 77, assignments: 83, communication: 76 },
        { period: 'Week 2', academic: 82, engagement: 79, attendance: 93, participation: 74, assignments: 83, communication: 75 },
        { period: 'Week 3', academic: 83, engagement: 78, attendance: 92, participation: 71, assignments: 82, communication: 75 },
        { period: 'Week 4', academic: 83, engagement: 78, attendance: 92, participation: 68, assignments: 82, communication: 74 },
      ],
      '8weeks': [
        { period: 'Weeks 1-2', academic: 81, engagement: 81, attendance: 93, participation: 79, assignments: 84, communication: 77 },
        { period: 'Weeks 3-4', academic: 82, engagement: 80, attendance: 93, participation: 76, assignments: 83, communication: 76 },
        { period: 'Weeks 5-6', academic: 83, engagement: 79, attendance: 92, participation: 72, assignments: 82, communication: 75 },
        { period: 'Weeks 7-8', academic: 83, engagement: 78, attendance: 92, participation: 68, assignments: 82, communication: 74 },
      ],
      'semester': [
        { period: 'Month 1', academic: 80, engagement: 82, attendance: 94, participation: 80, assignments: 85, communication: 78 },
        { period: 'Month 2', academic: 82, engagement: 80, attendance: 93, participation: 77, assignments: 84, communication: 76 },
        { period: 'Month 3', academic: 83, engagement: 79, attendance: 92, participation: 73, assignments: 83, communication: 75 },
        { period: 'Month 4', academic: 83, engagement: 78, attendance: 92, participation: 68, assignments: 82, communication: 74 },
      ],
    },
    aiDetectionSummary: {
      '2weeks': 'Ananya is under observation due to a minor participation plateau, though academic grades and attendance remain exemplary at 83% and 92%.',
      '4weeks': 'Ananya exhibits strong academic standing (83%) with high attendance (92%). A mild decline in seminar participation (-9%) was detected following a lab group reconfiguration. This is classified as a Watch status with low immediate risk.',
      '8weeks': 'Telemetry suggests Ananya is slightly less vocal in class discussions following module reassignment, while self-directed work remains consistent.',
      'semester': 'Overall profile is healthy with a localized collaborative vector that would benefit from gentle encouragement.',
    },
    flagReasons: [
      'Seminar participation decreased by 9% during team restructuring',
      'All other metrics (academics 83%, attendance 92%, assignments 82%) remain in healthy ranges',
      'Isolated pattern suggests team dynamics rather than academic difficulty',
    ],
    suggestedNextStep: {
      title: 'Lab Team Check-in',
      description: 'Check in with Ananya’s lab group facilitator to ensure collaborative responsibilities are equitably shared and her technical contributions are highlighted.',
      actionType: 'Peer Support',
      urgency: 'Low friction',
    },
  },
  {
    id: 'vivek-sharma',
    name: 'Vivek Sharma',
    avatarInitials: 'VS',
    branch: 'CSE',
    year: '4th Year',
    studentId: 'EV-2023-CSE012',
    status: 'EARLY SIGNAL',
    statusDescription: 'Senior capstone pacing volatility with recent assignment compression',
    attentionLevel: 'Moderate',
    attentionReason: 'Assignment consistency dropped -15% over the last 4 weeks while senior grades appear high.',
    academicScore: 86,
    attendanceScore: 88,
    engagementScore: 71,
    participationScore: 74,
    assignmentScore: 66,
    communicationScore: 77,
    timeWindowSignals: {
      '2weeks': [
        { id: 'academic', name: 'Academic Performance', currentValue: 86, previousValue: 86, change: 0, unit: '%', trend: 'stable', status: 'stable', note: 'Capstone code quality high' },
        { id: 'attendance', name: 'Attendance', currentValue: 88, previousValue: 88, change: 0, unit: '%', trend: 'stable', status: 'stable', note: 'Attending mandatory milestone reviews' },
        { id: 'engagement', name: 'LMS Engagement', currentValue: 71, previousValue: 74, change: -3, unit: '%', trend: 'declining', status: 'watch', note: 'Repository commits clustered near deadlines' },
        { id: 'participation', name: 'Seminar Participation', currentValue: 74, previousValue: 75, change: -1, unit: '%', trend: 'stable', status: 'stable', note: 'Active during sprint standups' },
        { id: 'assignments', name: 'Assignment Consistency', currentValue: 66, previousValue: 71, change: -5, unit: '%', trend: 'declining', status: 'concerning', note: 'Multiple late-night commit surges' },
        { id: 'communication', name: 'Faculty Outreach', currentValue: 77, previousValue: 78, change: -1, unit: '%', trend: 'stable', status: 'stable', note: 'Responsive on project Slack' },
      ],
      '4weeks': [
        { id: 'academic', name: 'Academic Performance', currentValue: 86, previousValue: 85, change: 1, unit: '%', trend: 'stable', status: 'stable', note: 'Top-tier code review evaluations' },
        { id: 'attendance', name: 'Attendance', currentValue: 88, previousValue: 90, change: -2, unit: '%', trend: 'stable', status: 'stable', note: 'Occasional absence at elective lectures' },
        { id: 'engagement', name: 'LMS Engagement', currentValue: 71, previousValue: 80, change: -9, unit: '%', trend: 'declining', status: 'watch', note: 'Fewer exploratory library queries' },
        { id: 'participation', name: 'Seminar Participation', currentValue: 74, previousValue: 78, change: -4, unit: '%', trend: 'stable', status: 'stable', note: 'Good presence in group sprint reviews' },
        { id: 'assignments', name: 'Assignment Consistency', currentValue: 66, previousValue: 81, change: -15, unit: '%', trend: 'declining', status: 'concerning', note: '15% drop in pacing consistency across sprint deliverables' },
        { id: 'communication', name: 'Faculty Outreach', currentValue: 77, previousValue: 80, change: -3, unit: '%', trend: 'stable', status: 'stable', note: 'High technical articulation' },
      ],
      '8weeks': [
        { id: 'academic', name: 'Academic Performance', currentValue: 86, previousValue: 83, change: 3, unit: '%', trend: 'improving', status: 'stable', note: 'Senior thesis defense preparation strong' },
        { id: 'attendance', name: 'Attendance', currentValue: 88, previousValue: 91, change: -3, unit: '%', trend: 'stable', status: 'stable', note: 'Consistent seminar arrivals' },
        { id: 'engagement', name: 'LMS Engagement', currentValue: 71, previousValue: 82, change: -11, unit: '%', trend: 'declining', status: 'watch', note: 'Slight reduction in auxiliary study hours' },
        { id: 'participation', name: 'Seminar Participation', currentValue: 74, previousValue: 80, change: -6, unit: '%', trend: 'stable', status: 'stable', note: 'Good collaborative voice' },
        { id: 'assignments', name: 'Assignment Consistency', currentValue: 66, previousValue: 83, change: -17, unit: '%', trend: 'declining', status: 'concerning', note: 'Pacing becoming more irregular over time' },
        { id: 'communication', name: 'Faculty Outreach', currentValue: 77, previousValue: 81, change: -4, unit: '%', trend: 'stable', status: 'stable', note: 'Good faculty advisor connection' },
      ],
      'semester': [
        { id: 'academic', name: 'Academic Performance', currentValue: 86, previousValue: 82, change: 4, unit: '%', trend: 'improving', status: 'stable', note: 'Strong academic track record' },
        { id: 'attendance', name: 'Attendance', currentValue: 88, previousValue: 92, change: -4, unit: '%', trend: 'stable', status: 'stable', note: 'Dependable' },
        { id: 'engagement', name: 'LMS Engagement', currentValue: 71, previousValue: 84, change: -13, unit: '%', trend: 'declining', status: 'watch', note: 'LMS access down slightly' },
        { id: 'participation', name: 'Seminar Participation', currentValue: 74, previousValue: 81, change: -7, unit: '%', trend: 'stable', status: 'stable', note: 'Solid peer collaboration' },
        { id: 'assignments', name: 'Assignment Consistency', currentValue: 66, previousValue: 85, change: -19, unit: '%', trend: 'declining', status: 'concerning', note: 'High volatility in sprint submission cadence' },
        { id: 'communication', name: 'Faculty Outreach', currentValue: 77, previousValue: 82, change: -5, unit: '%', trend: 'stable', status: 'stable', note: 'Reliable communication' },
      ],
    },
    timeWindowTimeline: {
      '2weeks': [
        { period: 'Day 1-4', academic: 86, engagement: 74, attendance: 88, participation: 75, assignments: 71, communication: 78 },
        { period: 'Day 5-8', academic: 86, engagement: 72, attendance: 88, participation: 74, assignments: 68, communication: 77 },
        { period: 'Day 9-11', academic: 86, engagement: 71, attendance: 88, participation: 74, assignments: 67, communication: 77 },
        { period: 'Day 12-14', academic: 86, engagement: 71, attendance: 88, participation: 74, assignments: 66, communication: 77 },
      ],
      '4weeks': [
        { period: 'Week 1', academic: 85, engagement: 80, attendance: 90, participation: 78, assignments: 81, communication: 80 },
        { period: 'Week 2', academic: 85, engagement: 76, attendance: 89, participation: 76, assignments: 76, communication: 79 },
        { period: 'Week 3', academic: 86, engagement: 73, attendance: 88, participation: 75, assignments: 70, communication: 78 },
        { period: 'Week 4', academic: 86, engagement: 71, attendance: 88, participation: 74, assignments: 66, communication: 77 },
      ],
      '8weeks': [
        { period: 'Weeks 1-2', academic: 83, engagement: 82, attendance: 91, participation: 80, assignments: 83, communication: 81 },
        { period: 'Weeks 3-4', academic: 84, engagement: 78, attendance: 90, participation: 77, assignments: 79, communication: 79 },
        { period: 'Weeks 5-6', academic: 85, engagement: 74, attendance: 89, participation: 75, assignments: 72, communication: 78 },
        { period: 'Weeks 7-8', academic: 86, engagement: 71, attendance: 88, participation: 74, assignments: 66, communication: 77 },
      ],
      'semester': [
        { period: 'Month 1', academic: 82, engagement: 84, attendance: 92, participation: 81, assignments: 85, communication: 82 },
        { period: 'Month 2', academic: 84, engagement: 79, attendance: 90, participation: 78, assignments: 80, communication: 80 },
        { period: 'Month 3', academic: 85, engagement: 75, attendance: 89, participation: 76, assignments: 73, communication: 78 },
        { period: 'Month 4', academic: 86, engagement: 71, attendance: 88, participation: 74, assignments: 66, communication: 77 },
      ],
    },
    aiDetectionSummary: {
      '2weeks': 'Vivek’s capstone codebase output is technically sound (86%), but submission cadence exhibits volatility that often indicates interview crunch or external commitments.',
      '4weeks': 'Vivek holds an 86% academic average, yet assignment consistency has dropped 15% over the past four weeks. This compression pattern is common in final-year students balancing recruitment and capstone deadlines.',
      '8weeks': 'Telemetry reflects strong technical competence alongside a gradual compression of submission timing into high-stress bursts.',
      'semester': 'Final-year student displaying academic mastery with a localized cadence signal that may benefit from deadline structuring.',
    },
    flagReasons: [
      'Assignment consistency declined 15% over the past 4 weeks',
      'Code uploads clustered into late-night single bursts prior to cutoffs',
      'Academic grade remains at 86%, masking burnout or career recruitment overload',
    ],
    suggestedNextStep: {
      title: 'Senior Capstone Pacing Sync',
      description: 'Discuss workload distribution between job placement interviews and remaining capstone milestones to alleviate end-of-term deadline bunching.',
      actionType: 'Mentor Check-in',
      urgency: 'Low friction',
    },
  },
  {
    id: 'meera-reddy',
    name: 'Meera Reddy',
    avatarInitials: 'MR',
    branch: 'EEE',
    year: '3rd Year',
    studentId: 'EV-2024-EEE118',
    status: 'NORMAL',
    statusDescription: 'Harmonious indicators across circuit analysis, attendance, and technical communication',
    attentionLevel: 'Low',
    attentionReason: 'Consistent performance with zero anomaly flags.',
    academicScore: 85,
    attendanceScore: 93,
    engagementScore: 86,
    participationScore: 84,
    assignmentScore: 89,
    communicationScore: 82,
    timeWindowSignals: {
      '2weeks': [
        { id: 'academic', name: 'Academic Performance', currentValue: 85, previousValue: 85, change: 0, unit: '%', trend: 'stable', status: 'stable', note: 'Steady laboratory outputs' },
        { id: 'attendance', name: 'Attendance', currentValue: 93, previousValue: 93, change: 0, unit: '%', trend: 'stable', status: 'stable', note: 'Punctual attendance' },
        { id: 'engagement', name: 'LMS Engagement', currentValue: 86, previousValue: 86, change: 0, unit: '%', trend: 'stable', status: 'stable', note: 'Consistent LMS time' },
        { id: 'participation', name: 'Seminar Participation', currentValue: 84, previousValue: 84, change: 0, unit: '%', trend: 'stable', status: 'stable', note: 'Active contributor' },
        { id: 'assignments', name: 'Assignment Consistency', currentValue: 89, previousValue: 88, change: 1, unit: '%', trend: 'improving', status: 'stable', note: 'On-time delivery' },
        { id: 'communication', name: 'Faculty Outreach', currentValue: 82, previousValue: 81, change: 1, unit: '%', trend: 'improving', status: 'stable', note: 'Reliable communication' },
      ],
      '4weeks': [
        { id: 'academic', name: 'Academic Performance', currentValue: 85, previousValue: 84, change: 1, unit: '%', trend: 'stable', status: 'stable', note: 'High academic mark' },
        { id: 'attendance', name: 'Attendance', currentValue: 93, previousValue: 92, change: 1, unit: '%', trend: 'stable', status: 'stable', note: 'Excellent attendance' },
        { id: 'engagement', name: 'LMS Engagement', currentValue: 86, previousValue: 84, change: 2, unit: '%', trend: 'improving', status: 'stable', note: 'Healthy platform habits' },
        { id: 'participation', name: 'Seminar Participation', currentValue: 84, previousValue: 82, change: 2, unit: '%', trend: 'improving', status: 'stable', note: 'Good collaboration' },
        { id: 'assignments', name: 'Assignment Consistency', currentValue: 89, previousValue: 87, change: 2, unit: '%', trend: 'improving', status: 'stable', note: 'Consistently early deliverables' },
        { id: 'communication', name: 'Faculty Outreach', currentValue: 82, previousValue: 80, change: 2, unit: '%', trend: 'improving', status: 'stable', note: 'Effective dialogue' },
      ],
      '8weeks': [
        { id: 'academic', name: 'Academic Performance', currentValue: 85, previousValue: 82, change: 3, unit: '%', trend: 'improving', status: 'stable', note: 'Consistent upward trajectory' },
        { id: 'attendance', name: 'Attendance', currentValue: 93, previousValue: 91, change: 2, unit: '%', trend: 'stable', status: 'stable', note: 'Dependable presence' },
        { id: 'engagement', name: 'LMS Engagement', currentValue: 86, previousValue: 82, change: 4, unit: '%', trend: 'improving', status: 'stable', note: 'Expanding study hours' },
        { id: 'participation', name: 'Seminar Participation', currentValue: 84, previousValue: 80, change: 4, unit: '%', trend: 'improving', status: 'stable', note: 'Strong collaborative voice' },
        { id: 'assignments', name: 'Assignment Consistency', currentValue: 89, previousValue: 85, change: 4, unit: '%', trend: 'improving', status: 'stable', note: 'Reliable pacing' },
        { id: 'communication', name: 'Faculty Outreach', currentValue: 82, previousValue: 78, change: 4, unit: '%', trend: 'improving', status: 'stable', note: 'Positive rapport' },
      ],
      'semester': [
        { id: 'academic', name: 'Academic Performance', currentValue: 85, previousValue: 80, change: 5, unit: '%', trend: 'improving', status: 'stable', note: 'Solid full-term gains' },
        { id: 'attendance', name: 'Attendance', currentValue: 93, previousValue: 90, change: 3, unit: '%', trend: 'stable', status: 'stable', note: 'Exemplary attendance record' },
        { id: 'engagement', name: 'LMS Engagement', currentValue: 86, previousValue: 80, change: 6, unit: '%', trend: 'improving', status: 'stable', note: 'Consistent study habits' },
        { id: 'participation', name: 'Seminar Participation', currentValue: 84, previousValue: 78, change: 6, unit: '%', trend: 'improving', status: 'stable', note: 'Consistent presence' },
        { id: 'assignments', name: 'Assignment Consistency', currentValue: 89, previousValue: 83, change: 6, unit: '%', trend: 'improving', status: 'stable', note: 'Dependable deliverables' },
        { id: 'communication', name: 'Faculty Outreach', currentValue: 82, previousValue: 76, change: 6, unit: '%', trend: 'improving', status: 'stable', note: 'Healthy advisor connection' },
      ],
    },
    timeWindowTimeline: {
      '2weeks': [
        { period: 'Day 1-4', academic: 85, engagement: 86, attendance: 93, participation: 84, assignments: 88, communication: 81 },
        { period: 'Day 5-8', academic: 85, engagement: 86, attendance: 93, participation: 84, assignments: 89, communication: 82 },
        { period: 'Day 9-11', academic: 85, engagement: 86, attendance: 93, participation: 84, assignments: 89, communication: 82 },
        { period: 'Day 12-14', academic: 85, engagement: 86, attendance: 93, participation: 84, assignments: 89, communication: 82 },
      ],
      '4weeks': [
        { period: 'Week 1', academic: 84, engagement: 84, attendance: 92, participation: 82, assignments: 87, communication: 80 },
        { period: 'Week 2', academic: 84, engagement: 85, attendance: 92, participation: 83, assignments: 88, communication: 81 },
        { period: 'Week 3', academic: 85, engagement: 85, attendance: 93, participation: 83, assignments: 88, communication: 81 },
        { period: 'Week 4', academic: 85, engagement: 86, attendance: 93, participation: 84, assignments: 89, communication: 82 },
      ],
      '8weeks': [
        { period: 'Weeks 1-2', academic: 82, engagement: 82, attendance: 91, participation: 80, assignments: 85, communication: 78 },
        { period: 'Weeks 3-4', academic: 83, engagement: 84, attendance: 92, participation: 82, assignments: 87, communication: 80 },
        { period: 'Weeks 5-6', academic: 84, engagement: 85, attendance: 92, participation: 83, assignments: 88, communication: 81 },
        { period: 'Weeks 7-8', academic: 85, engagement: 86, attendance: 93, participation: 84, assignments: 89, communication: 82 },
      ],
      'semester': [
        { period: 'Month 1', academic: 80, engagement: 80, attendance: 90, participation: 78, assignments: 83, communication: 76 },
        { period: 'Month 2', academic: 82, engagement: 82, attendance: 91, participation: 80, assignments: 85, communication: 78 },
        { period: 'Month 3', academic: 84, engagement: 84, attendance: 92, participation: 82, assignments: 87, communication: 80 },
        { period: 'Month 4', academic: 85, engagement: 86, attendance: 93, participation: 84, assignments: 89, communication: 82 },
      ],
    },
    aiDetectionSummary: {
      '2weeks': 'Meera exhibits positive, stable telemetry across all courses. No early warning flags detected.',
      '4weeks': 'Meera shows exemplary balance across all dimensions: academic performance (85%), attendance (93%), engagement (86%), and assignment consistency (89%). Multi-signal health is robust.',
      '8weeks': 'Long-term telemetry demonstrates stable and self-directed academic habits in electrical power systems coursework.',
      'semester': 'Consistent academic and collaborative engagement throughout the semester with zero adverse markers.',
    },
    flagReasons: [
      'All vectors are positive and well-coordinated',
      'Consistent physical attendance and digital study hours',
      'High assignment consistency and timely project check-ins',
    ],
    suggestedNextStep: {
      title: 'Peer Mentorship Opportunity',
      description: 'Encourage Meera to consider leading study sessions in circuit analysis to foster junior student engagement.',
      actionType: 'Peer Support',
      urgency: 'Routine',
    },
  },
];

export const SILENT_STRUGGLE_STUDENTS: SilentStruggleStudent[] = RAW_SILENT_STRUGGLE_STUDENTS.map((s) => {
  const avgBehavioral = Math.round((s.engagementScore + s.participationScore + s.assignmentScore) / 3);
  const divergence = Math.max(0, s.academicScore - avgBehavioral);
  const defaultSignals = s.timeWindowSignals['4weeks'] || s.timeWindowSignals['2weeks'];

  const timelineByWindow: Record<TimeWindowOption, TimelineDataPoint[]> = {
    '2weeks': (s.timeWindowTimeline['2weeks'] || []).map((p) => ({ ...p, weekLabel: p.period })),
    '4weeks': (s.timeWindowTimeline['4weeks'] || []).map((p) => ({ ...p, weekLabel: p.period })),
    '8weeks': (s.timeWindowTimeline['8weeks'] || []).map((p) => ({ ...p, weekLabel: p.period })),
    'semester': (s.timeWindowTimeline['semester'] || []).map((p) => ({ ...p, weekLabel: p.period })),
  };

  return {
    ...s,
    attendance: s.attendanceScore,
    engagement: s.engagementScore,
    participation: s.participationScore,
    assignmentConsistency: s.assignmentScore,
    communication: s.communicationScore,
    divergenceIndex: divergence,
    signals: defaultSignals,
    timelineByWindow,
    suggestedNextStep: {
      ...s.suggestedNextStep,
      strategyType: s.suggestedNextStep.actionType,
    },
  };
});

/**
 * Returns silent struggle telemetry for a student by ID, roll number, or canonical alias.
 */
export function getStudentSilentStruggleData(identifier?: string): SilentStruggleStudent {
  if (!identifier) return SILENT_STRUGGLE_STUDENTS[0];
  const canonical = toCanonicalStudentId(identifier);
  const match = SILENT_STRUGGLE_STUDENTS.find(
    (s) =>
      s.id === canonical ||
      isSameStudent(s.id, canonical) ||
      isSameStudent(s.studentId, canonical) ||
      isSameStudent(s.name, canonical)
  );
  return match || SILENT_STRUGGLE_STUDENTS[0];
}

/**
 * Synchronizes silent struggle telemetry when student data is updated via CSV integration.
 */
export function syncSilentStruggleFromProfile(studentId: string, updatedProfile: any) {
  const canonical = toCanonicalStudentId(studentId);
  const match = SILENT_STRUGGLE_STUDENTS.find(
    (s) => s.id === canonical || isSameStudent(s.id, canonical)
  );
  if (match) {
    if (updatedProfile.academic?.overallMarks !== undefined) {
      match.academicScore = updatedProfile.academic.overallMarks;
    }
    if (updatedProfile.attendance?.overallPercentage !== undefined) {
      match.attendanceScore = updatedProfile.attendance.overallPercentage;
      match.attendance = match.attendanceScore;
    }
    if (updatedProfile.engagement?.participationScore !== undefined) {
      match.participationScore = updatedProfile.engagement.participationScore;
      match.participation = match.participationScore;
    }
    if (updatedProfile.engagement?.behavioralScore !== undefined) {
      match.engagementScore = updatedProfile.engagement.behavioralScore;
      match.engagement = match.engagementScore;
    }
    if (updatedProfile.lms?.assignmentCompletionRate !== undefined) {
      match.assignmentScore = updatedProfile.lms.assignmentCompletionRate;
      match.assignmentConsistency = match.assignmentScore;
    }
    const avgBehavioral = Math.round((match.engagementScore + match.participationScore + match.assignmentScore) / 3);
    match.divergenceIndex = Math.max(0, match.academicScore - avgBehavioral);
    if (match.divergenceIndex >= 20) {
      match.status = 'MULTIPLE SIGNALS';
      match.attentionLevel = 'High';
      match.statusDescription = 'Significant behavioral divergence detected between academic marks and daily presence.';
    } else if (match.divergenceIndex >= 12) {
      match.status = 'EARLY SIGNAL';
      match.attentionLevel = 'Moderate';
      match.statusDescription = 'Early signals of declining behavioral engagement despite passing coursework.';
    } else if (match.divergenceIndex >= 6) {
      match.status = 'WATCH';
      match.attentionLevel = 'Low';
      match.statusDescription = 'Subtle divergence requiring observational monitoring.';
    } else {
      match.status = 'NORMAL';
      match.attentionLevel = 'Low';
      match.statusDescription = 'Balanced indicators across academic and behavioral metrics.';
    }
  }
}

