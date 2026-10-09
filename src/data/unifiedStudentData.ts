/**
 * Unified Student Data Intelligence Foundation
 * 
 * Architecture Principle:
 * MULTIPLE DATA SOURCES -> ONE STUDENT -> UNIFIED STUDENT PROFILE -> COMBINED ANALYSIS -> ACTIONABLE INSIGHTS
 * 
 * Combines 7 Data Categories into 1 Unified Student Intelligence Record:
 * 1. Academic (CGPA, Marks, Backlogs, Subject Performance, Historical Term Records)
 * 2. Attendance (Overall %, Subject-wise Attendance, Monthly/Weekly Trends)
 * 3. LMS (Login Frequency, Assignment Completion, Activity Trend, Module Access)
 * 4. Engagement (Events, Clubs, Hackathons, Certifications, Participation, Collaboration, Trend)
 * 5. Placement (Aptitude Score, Coding Score, Mock Interviews, Prep Trend, Readiness Representation)
 * 6. Skills (Technical Assessments + Fluencis-Ready Soft Skills: Speaking, Presentation, Group Discussion, Debate, Interviewing)
 * 7. Feedback (Student Satisfaction, Qualitative Faculty Feedback, Mentor Observations)
 * 
 * Responsible Terminology:
 * Values represent current preparation and behavioral indicators.
 * No guarantees, no deterministic failure claims.
 */

import { toCanonicalStudentId, isSameStudent } from './canonicalStudentRegistry';
export { toCanonicalStudentId, isSameStudent, getCanonicalStudent } from './canonicalStudentRegistry';

export interface SubjectScore {
  code: string;
  name: string;
  score: number; // 0 - 100
  grade?: string;
  credits: number;
}

export interface TermAcademicHistory {
  term: string; // e.g. "Semester 1", "Semester 2"
  cgpa: number; // e.g. 8.5
  marksPercentage: number;
  creditsEarned: number;
  backlogs: number;
}

export interface AcademicIntelligence {
  cgpa: number; // e.g. 8.4
  overallMarks: number; // 0 - 100 percentage
  backlogs: number; // 0 for clean record
  subjectPerformance: SubjectScore[];
  history: TermAcademicHistory[];
  academicStanding: 'Distinction' | 'Good Standing' | 'Academic Monitoring';
}

export interface SubjectAttendance {
  subjectName: string;
  attendancePercentage: number;
  classesAttended: number;
  totalClasses: number;
}

export interface AttendanceHistoryPoint {
  period: string; // e.g. "Month 1", "Month 2" or "Week 1"
  percentage: number;
}

export interface AttendanceIntelligence {
  overallPercentage: number; // 0 - 100
  subjectWiseAttendance: SubjectAttendance[];
  history: AttendanceHistoryPoint[];
  attendanceTrend: 'improving' | 'stable' | 'declining';
  biometricSynced: boolean;
}

export interface LmsIntelligence {
  loginFrequencyPerWeek: number; // e.g. 4.2
  previousLoginFrequency: number; // for trend
  assignmentCompletionRate: number; // 0 - 100%
  activityTrend: 'improving' | 'stable' | 'declining';
  modulesAccessed: number;
  totalModules: number;
  lastActiveDaysAgo: number;
  averageSessionDurationMins: number;
  forumDiscussionPosts: number;
}

export interface EngagementIntelligence {
  eventsAttended: number;
  clubsActive: number;
  clubNames: string[];
  hackathonsCount: number;
  certificationsCount: number;
  participationScore: number; // 0 - 100
  behavioralScore: number; // 0 - 100
  peerCollaborationScore: number; // 0 - 100
  activityConsistencyScore: number; // 0 - 100
  engagementTrend: 'improving' | 'stable' | 'declining';
  keyMilestones: string[];
}

export interface PlacementIntelligence {
  aptitudeScore: number; // 0 - 100
  codingScore: number; // 0 - 100
  mockInterviewsCount: number;
  preparationTrend: 'improving' | 'stable' | 'declining';
  readinessCondition: string; // e.g. "Strong Technical Readiness · Communication Polish Recommended"
  verifiedSkillBadges: string[];
  eligibleRoles: string[];
}

export interface FluencisSoftSkills {
  communication: number; // 0 - 100
  speaking: number;
  presentation: number;
  groupDiscussion: number;
  debate: number;
  technicalDiscussion: number;
  interviewSkills: number;
}

export interface SkillsIntelligence {
  technicalSkillAssessments: Record<string, number>;
  softSkillAssessments: FluencisSoftSkills;
  fluencisIntegrationStatus: 'ready' | 'synced' | 'calibrated';
  primaryStrength: string;
  growthFocus: string;
}

export interface FeedbackIntelligence {
  studentSatisfactionScore: number; // 0 - 100
  facultyFeedback: string;
  facultyAuthor: string;
  facultyDepartment: string;
  mentorFeedback: string;
  feedbackDate: string;
}

export interface ConnectedSource {
  id: string;
  name: string;
  category: string;
  status: 'connected' | 'synced' | 'ready' | 'calibrated';
  lastSync: string;
  recordsCount: number;
}

export interface UnifiedStudentProfile {
  id: string; // e.g. "arjun-kumar"
  studentId: string; // e.g. "CS-2022-084"
  legacyId: string; // e.g. "std-1"
  name: string;
  avatarInitials: string;
  course: string;
  branch: string;
  year: string;
  currentSemester: string;
  
  // 7 Unified Intelligence Categories
  academic: AcademicIntelligence;
  attendance: AttendanceIntelligence;
  lms: LmsIntelligence;
  engagement: EngagementIntelligence;
  placement: PlacementIntelligence;
  skills: SkillsIntelligence;
  feedback: FeedbackIntelligence;

  // Cross-Source Intelligence Synthesis
  connectedDataSources: ConnectedSource[];
  crossSourceSynthesis: string[];
}

// =========================================================================
// UNIFIED MASTER DATA STORE (ALL 8 EXISTING FICTIONAL STUDENTS)
// =========================================================================

export const UNIFIED_STUDENTS: UnifiedStudentProfile[] = [
  // 1. ARJUN KUMAR
  {
    id: 'arjun-kumar',
    studentId: 'CS-2022-084',
    legacyId: 'std-1',
    name: 'Arjun Kumar',
    avatarInitials: 'AK',
    course: 'B.Tech Computer Science',
    branch: 'CSE',
    year: '3rd Year',
    currentSemester: 'Semester 5',
    academic: {
      cgpa: 8.4,
      overallMarks: 84,
      backlogs: 0,
      academicStanding: 'Good Standing',
      subjectPerformance: [
        { code: 'CS301', name: 'Design & Analysis of Algorithms', score: 86, grade: 'A', credits: 4 },
        { code: 'CS302', name: 'Database Management Systems', score: 85, grade: 'A', credits: 4 },
        { code: 'CS303', name: 'Advanced Programming in Python', score: 89, grade: 'A+', credits: 3 },
        { code: 'MA301', name: 'Discrete Mathematics', score: 82, grade: 'A', credits: 3 },
        { code: 'CS304', name: 'Computer Networks', score: 79, grade: 'B+', credits: 3 },
      ],
      history: [
        { term: 'Semester 1', cgpa: 8.1, marksPercentage: 81, creditsEarned: 22, backlogs: 0 },
        { term: 'Semester 2', cgpa: 8.3, marksPercentage: 83, creditsEarned: 24, backlogs: 0 },
        { term: 'Semester 3', cgpa: 8.5, marksPercentage: 85, creditsEarned: 24, backlogs: 0 },
        { term: 'Semester 4', cgpa: 8.6, marksPercentage: 86, creditsEarned: 22, backlogs: 0 },
        { term: 'Semester 5 (Current)', cgpa: 8.4, marksPercentage: 84, creditsEarned: 17, backlogs: 0 },
      ],
    },
    attendance: {
      overallPercentage: 87,
      attendanceTrend: 'declining',
      biometricSynced: true,
      subjectWiseAttendance: [
        { subjectName: 'Advanced Programming in Python', attendancePercentage: 91, classesAttended: 31, totalClasses: 34 },
        { subjectName: 'Design & Analysis of Algorithms', attendancePercentage: 89, classesAttended: 32, totalClasses: 36 },
        { subjectName: 'Database Management Systems', attendancePercentage: 86, classesAttended: 31, totalClasses: 36 },
        { subjectName: 'Discrete Mathematics', attendancePercentage: 84, classesAttended: 27, totalClasses: 32 },
        { subjectName: 'Computer Networks', attendancePercentage: 83, classesAttended: 25, totalClasses: 30 },
      ],
      history: [
        { period: 'Month 1', percentage: 92 },
        { period: 'Month 2', percentage: 90 },
        { period: 'Month 3', percentage: 88 },
        { period: 'Month 4', percentage: 87 },
      ],
    },
    lms: {
      loginFrequencyPerWeek: 4.2,
      previousLoginFrequency: 7.1,
      assignmentCompletionRate: 91,
      activityTrend: 'declining',
      modulesAccessed: 18,
      totalModules: 20,
      lastActiveDaysAgo: 1,
      averageSessionDurationMins: 38,
      forumDiscussionPosts: 3,
    },
    engagement: {
      eventsAttended: 5,
      clubsActive: 2,
      clubNames: ['ACM Student Chapter', 'Open Source Dev Guild'],
      hackathonsCount: 1,
      certificationsCount: 2,
      participationScore: 72,
      behavioralScore: 72,
      peerCollaborationScore: 64,
      activityConsistencyScore: 70,
      engagementTrend: 'declining',
      keyMilestones: [
        'Organized Annual Code Sprint',
        'Contributed to Open Source Campus Repository',
        'Certified in AWS Cloud Practitioner',
      ],
    },
    placement: {
      aptitudeScore: 72,
      codingScore: 81,
      mockInterviewsCount: 2,
      preparationTrend: 'stable',
      readinessCondition: 'Solid algorithmic foundations; communication & mock interview polish suggested.',
      verifiedSkillBadges: ['Algorithms Mastery', 'Python Automation', 'SQL Proficient'],
      eligibleRoles: ['Software Development Engineer Intern', 'Backend Developer', 'Data Analyst Trainee'],
    },
    skills: {
      technicalSkillAssessments: {
        'Data Structures & Algorithms': 86,
        'Python & Backend Development': 88,
        'Database Architecture (SQL)': 85,
        'System Architecture Foundations': 74,
        'Web Frontend (React/TS)': 76,
      },
      softSkillAssessments: {
        communication: 61,
        speaking: 64,
        presentation: 60,
        groupDiscussion: 58,
        debate: 62,
        technicalDiscussion: 74,
        interviewSkills: 61,
      },
      fluencisIntegrationStatus: 'ready',
      primaryStrength: 'Algorithmic Problem Solving & System Coding',
      growthFocus: 'Group Discussion Voice & Spontaneous Articulation',
    },
    feedback: {
      studentSatisfactionScore: 78,
      facultyFeedback:
        'Consistently strong academic and programming acumen. However, peer participation in laboratory discussions and code review sprints has diminished over the past month. A supportive check-in is recommended.',
      facultyAuthor: 'Dr. V. Ramanathan',
      facultyDepartment: 'Department of Computer Science & Engineering',
      mentorFeedback:
        'Arjun responds well to technical encouragement. Connecting him with a collaborative peer circle will help restore his engagement rhythm without academic strain.',
      feedbackDate: 'October 2026',
    },
    connectedDataSources: [
      { id: 'sis', name: 'Campus SIS (Registrar ERP)', category: 'Academic', status: 'synced', lastSync: 'Today, 06:00', recordsCount: 42 },
      { id: 'biometric', name: 'Biometric RFID Turnstile', category: 'Attendance', status: 'synced', lastSync: 'Today, 08:30', recordsCount: 168 },
      { id: 'lms', name: 'Canvas LMS Telemetry', category: 'LMS', status: 'connected', lastSync: '10 mins ago', recordsCount: 312 },
      { id: 'campus_life', name: 'Campus Life & Club Portal', category: 'Engagement', status: 'connected', lastSync: 'Yesterday', recordsCount: 28 },
      { id: 'placement_hub', name: 'Career & Placement Hub', category: 'Placement', status: 'connected', lastSync: '3 days ago', recordsCount: 14 },
      { id: 'fluencis_matrix', name: 'Fluencis Speech & Skill Matrix', category: 'Skills', status: 'synced', lastSync: 'Oct 04', recordsCount: 35 },
      { id: 'faculty_portal', name: 'Faculty Mentorship Registry', category: 'Feedback', status: 'synced', lastSync: 'Oct 06', recordsCount: 8 },
    ],
    crossSourceSynthesis: [
      'High Academic Stability (84% / 8.4 CGPA) contrasts with sharp LMS login frequency decay (-41% over 4 weeks).',
      'Strong solo coding capability (81/100) alongside lower Group Discussion comfort (58/100) indicates an introverted retreat rather than knowledge deficit.',
      'Attendance remains above institutional threshold (87%) but displays a gentle downward slope, confirming early silent struggle telemetry.',
    ],
  },

  // 2. PRIYA SHARMA
  {
    id: 'priya-sharma',
    studentId: 'EC-2022-119',
    legacyId: 'std-2',
    name: 'Priya Sharma',
    avatarInitials: 'PS',
    course: 'B.Tech Electronics & Communication',
    branch: 'ECE',
    year: '3rd Year',
    currentSemester: 'Semester 5',
    academic: {
      cgpa: 9.1,
      overallMarks: 91,
      backlogs: 0,
      academicStanding: 'Distinction',
      subjectPerformance: [
        { code: 'EC301', name: 'Digital Signal Processing', score: 94, grade: 'A+', credits: 4 },
        { code: 'EC302', name: 'VLSI Circuit Design', score: 90, grade: 'A+', credits: 4 },
        { code: 'EC303', name: 'Embedded Systems & IoT', score: 92, grade: 'A+', credits: 3 },
        { code: 'EC304', name: 'Electromagnetic Field Theory', score: 88, grade: 'A', credits: 4 },
      ],
      history: [
        { term: 'Semester 1', cgpa: 8.8, marksPercentage: 88, creditsEarned: 22, backlogs: 0 },
        { term: 'Semester 2', cgpa: 9.0, marksPercentage: 90, creditsEarned: 24, backlogs: 0 },
        { term: 'Semester 3', cgpa: 9.1, marksPercentage: 91, creditsEarned: 24, backlogs: 0 },
        { term: 'Semester 4', cgpa: 9.2, marksPercentage: 92, creditsEarned: 22, backlogs: 0 },
        { term: 'Semester 5 (Current)', cgpa: 9.1, marksPercentage: 91, creditsEarned: 18, backlogs: 0 },
      ],
    },
    attendance: {
      overallPercentage: 94,
      attendanceTrend: 'improving',
      biometricSynced: true,
      subjectWiseAttendance: [
        { subjectName: 'Digital Signal Processing', attendancePercentage: 96, classesAttended: 34, totalClasses: 35 },
        { subjectName: 'VLSI Circuit Design', attendancePercentage: 94, classesAttended: 33, totalClasses: 35 },
        { subjectName: 'Embedded Systems & IoT', attendancePercentage: 95, classesAttended: 28, totalClasses: 29 },
        { subjectName: 'Electromagnetic Field Theory', attendancePercentage: 92, classesAttended: 31, totalClasses: 34 },
      ],
      history: [
        { period: 'Month 1', percentage: 91 },
        { period: 'Month 2', percentage: 93 },
        { period: 'Month 3', percentage: 94 },
        { period: 'Month 4', percentage: 94 },
      ],
    },
    lms: {
      loginFrequencyPerWeek: 8.4,
      previousLoginFrequency: 7.9,
      assignmentCompletionRate: 98,
      activityTrend: 'improving',
      modulesAccessed: 22,
      totalModules: 22,
      lastActiveDaysAgo: 0,
      averageSessionDurationMins: 52,
      forumDiscussionPosts: 14,
    },
    engagement: {
      eventsAttended: 8,
      clubsActive: 3,
      clubNames: ['Robotics & Automation Society', 'IEEE Student Branch', 'Women in Tech'],
      hackathonsCount: 3,
      certificationsCount: 4,
      participationScore: 92,
      behavioralScore: 90,
      peerCollaborationScore: 88,
      activityConsistencyScore: 94,
      engagementTrend: 'improving',
      keyMilestones: [
        'Lead Hardware Designer - National Robotics Challenge',
        'Published IEEE Student Paper on FPGA Optimization',
        'Mentored 12 First-Year ECE Students in Circuit Labs',
      ],
    },
    placement: {
      aptitudeScore: 89,
      codingScore: 86,
      mockInterviewsCount: 4,
      preparationTrend: 'improving',
      readinessCondition: 'Exceptional cross-disciplinary readiness across hardware, embedded C, and soft skills.',
      verifiedSkillBadges: ['Verilog HDL Expert', 'Embedded C', 'DSP Processing', 'System Modeling'],
      eligibleRoles: ['Hardware Design Engineer', 'Embedded Systems Architect', 'VLSI Modeling Engineer'],
    },
    skills: {
      technicalSkillAssessments: {
        'Digital Signal Processing': 94,
        'Verilog & VLSI Simulation': 92,
        'Embedded C / Microcontrollers': 90,
        'MATLAB & Circuit Simulation': 89,
        'Python for Signal Processing': 85,
      },
      softSkillAssessments: {
        communication: 88,
        speaking: 86,
        presentation: 91,
        groupDiscussion: 89,
        debate: 84,
        technicalDiscussion: 92,
        interviewSkills: 89,
      },
      fluencisIntegrationStatus: 'calibrated',
      primaryStrength: 'Articulate Technical Synthesis & Hardware Systems Leadership',
      growthFocus: 'Advanced Executive Pitching & Venture Showcase',
    },
    feedback: {
      studentSatisfactionScore: 92,
      facultyFeedback:
        'Priya demonstrates exemplary intellectual rigor and collaborative leadership. Her lab work in VLSI design sets a standard for the cohort.',
      facultyAuthor: 'Prof. K. Sundaram',
      facultyDepartment: 'Department of Electronics & Communication',
      mentorFeedback: 'A stellar candidate for premier core electronics research labs and product development fellowships.',
      feedbackDate: 'October 2026',
    },
    connectedDataSources: [
      { id: 'sis', name: 'Campus SIS', category: 'Academic', status: 'synced', lastSync: 'Today, 06:00', recordsCount: 45 },
      { id: 'biometric', name: 'Biometric RFID', category: 'Attendance', status: 'synced', lastSync: 'Today, 08:45', recordsCount: 182 },
      { id: 'lms', name: 'Canvas LMS', category: 'LMS', status: 'connected', lastSync: '5 mins ago', recordsCount: 489 },
      { id: 'campus_life', name: 'Club Portal', category: 'Engagement', status: 'connected', lastSync: 'Today', recordsCount: 44 },
      { id: 'placement_hub', name: 'Placement Hub', category: 'Placement', status: 'connected', lastSync: 'Yesterday', recordsCount: 26 },
      { id: 'fluencis_matrix', name: 'Fluencis Matrix', category: 'Skills', status: 'calibrated', lastSync: 'Oct 05', recordsCount: 48 },
      { id: 'faculty_portal', name: 'Faculty Feedback', category: 'Feedback', status: 'synced', lastSync: 'Oct 06', recordsCount: 12 },
    ],
    crossSourceSynthesis: [
      'Cohesive alignment between academic excellence (91%), attendance (94%), and vibrant campus engagement (8 events, 3 clubs).',
      'Balanced profile: High coding score (86/100) paired with top-tier presentation skills (91/100).',
      'Zero divergent risk signals; qualifies as an ideal cohort peer mentor.',
    ],
  },

  // 3. RAHUL VERMA
  {
    id: 'rahul-verma',
    studentId: 'CS-2023-042',
    legacyId: 'std-3',
    name: 'Rahul Verma',
    avatarInitials: 'RV',
    course: 'B.Tech Computer Science',
    branch: 'CSE',
    year: '2nd Year',
    currentSemester: 'Semester 3',
    academic: {
      cgpa: 7.6,
      overallMarks: 76,
      backlogs: 0,
      academicStanding: 'Good Standing',
      subjectPerformance: [
        { code: 'CS201', name: 'Data Structures using C++', score: 81, grade: 'A', credits: 4 },
        { code: 'CS202', name: 'Object Oriented Programming (Java)', score: 78, grade: 'B+', credits: 4 },
        { code: 'MA201', name: 'Linear Algebra & Statistics', score: 71, grade: 'B', credits: 3 },
        { code: 'CS203', name: 'Digital Logic & Computer Organization', score: 74, grade: 'B', credits: 4 },
      ],
      history: [
        { term: 'Semester 1', cgpa: 7.4, marksPercentage: 74, creditsEarned: 22, backlogs: 0 },
        { term: 'Semester 2', cgpa: 7.7, marksPercentage: 77, creditsEarned: 24, backlogs: 0 },
        { term: 'Semester 3 (Current)', cgpa: 7.6, marksPercentage: 76, creditsEarned: 15, backlogs: 0 },
      ],
    },
    attendance: {
      overallPercentage: 81,
      attendanceTrend: 'stable',
      biometricSynced: true,
      subjectWiseAttendance: [
        { subjectName: 'Data Structures using C++', attendancePercentage: 86, classesAttended: 29, totalClasses: 34 },
        { subjectName: 'Object Oriented Programming', attendancePercentage: 84, classesAttended: 28, totalClasses: 33 },
        { subjectName: 'Digital Logic', attendancePercentage: 79, classesAttended: 26, totalClasses: 33 },
        { subjectName: 'Linear Algebra', attendancePercentage: 75, classesAttended: 24, totalClasses: 32 },
      ],
      history: [
        { period: 'Month 1', percentage: 83 },
        { period: 'Month 2', percentage: 82 },
        { period: 'Month 3', percentage: 80 },
        { period: 'Month 4', percentage: 81 },
      ],
    },
    lms: {
      loginFrequencyPerWeek: 5.1,
      previousLoginFrequency: 4.8,
      assignmentCompletionRate: 85,
      activityTrend: 'improving',
      modulesAccessed: 15,
      totalModules: 18,
      lastActiveDaysAgo: 2,
      averageSessionDurationMins: 32,
      forumDiscussionPosts: 6,
    },
    engagement: {
      eventsAttended: 6,
      clubsActive: 2,
      clubNames: ['Hackers Club', 'Web Dev Collective'],
      hackathonsCount: 2,
      certificationsCount: 1,
      participationScore: 78,
      behavioralScore: 79,
      peerCollaborationScore: 82,
      activityConsistencyScore: 75,
      engagementTrend: 'improving',
      keyMilestones: [
        'Built full-stack campus event organizer application',
        'Top 10 Finalist in University Hackathon 2026',
      ],
    },
    placement: {
      aptitudeScore: 68,
      codingScore: 77,
      mockInterviewsCount: 1,
      preparationTrend: 'improving',
      readinessCondition: 'Rising coding stamina; focus on quantitative aptitude and theory fundamentals recommended.',
      verifiedSkillBadges: ['C++ Problem Solver', 'Git Collaboration'],
      eligibleRoles: ['Junior Full Stack Developer', 'Software Support Engineer'],
    },
    skills: {
      technicalSkillAssessments: {
        'C++ & Data Structures': 81,
        'Java Application Development': 78,
        'Frontend Web (HTML/CSS/JS)': 80,
        'SQL Basics': 73,
      },
      softSkillAssessments: {
        communication: 72,
        speaking: 70,
        presentation: 69,
        groupDiscussion: 75,
        debate: 67,
        technicalDiscussion: 76,
        interviewSkills: 68,
      },
      fluencisIntegrationStatus: 'ready',
      primaryStrength: 'Practical Project Building & Peer Collaboration',
      growthFocus: 'Theoretical Mathematics & Aptitude Benchmarking',
    },
    feedback: {
      studentSatisfactionScore: 81,
      facultyFeedback:
        'Rahul shows high enthusiasm in lab and project assignments. He benefits from structured practice in mathematics and theoretical foundations.',
      facultyAuthor: 'Prof. Anitha Roy',
      facultyDepartment: 'Department of Computer Science',
      mentorFeedback: 'Pragmatic and curious. He excels when learning is tied directly to real-world build sprints.',
      feedbackDate: 'October 2026',
    },
    connectedDataSources: [
      { id: 'sis', name: 'Campus SIS', category: 'Academic', status: 'synced', lastSync: 'Today, 06:00', recordsCount: 28 },
      { id: 'biometric', name: 'Biometric RFID', category: 'Attendance', status: 'synced', lastSync: 'Today, 08:35', recordsCount: 140 },
      { id: 'lms', name: 'Canvas LMS', category: 'LMS', status: 'connected', lastSync: '30 mins ago', recordsCount: 215 },
      { id: 'campus_life', name: 'Club Portal', category: 'Engagement', status: 'connected', lastSync: 'Oct 06', recordsCount: 18 },
      { id: 'placement_hub', name: 'Placement Hub', category: 'Placement', status: 'connected', lastSync: 'Oct 04', recordsCount: 9 },
      { id: 'fluencis_matrix', name: 'Fluencis Matrix', category: 'Skills', status: 'ready', lastSync: 'Oct 02', recordsCount: 24 },
      { id: 'faculty_portal', name: 'Faculty Feedback', category: 'Feedback', status: 'synced', lastSync: 'Oct 05', recordsCount: 6 },
    ],
    crossSourceSynthesis: [
      'Steady recovery in assignment completion (85%) matching rising hackathon and coding project output.',
      'Linear Algebra attendance (75%) is near the monitoring boundary, providing an actionable target for early advisor assistance.',
    ],
  },

  // 4. SNEHA REDDY
  {
    id: 'sneha-reddy',
    studentId: 'EE-2021-017',
    legacyId: 'std-4',
    name: 'Sneha Reddy',
    avatarInitials: 'SR',
    course: 'B.Tech Electrical & Electronics',
    branch: 'EEE',
    year: '4th Year',
    currentSemester: 'Semester 7',
    academic: {
      cgpa: 8.9,
      overallMarks: 89,
      backlogs: 0,
      academicStanding: 'Distinction',
      subjectPerformance: [
        { code: 'EE401', name: 'Power System Operation & Control', score: 92, grade: 'A+', credits: 4 },
        { code: 'EE402', name: 'Renewable Energy Integration', score: 90, grade: 'A+', credits: 4 },
        { code: 'EE403', name: 'Industrial Automation & PLC', score: 87, grade: 'A', credits: 3 },
        { code: 'EE404', name: 'Electric Drives & Traction', score: 88, grade: 'A', credits: 4 },
      ],
      history: [
        { term: 'Semester 1', cgpa: 8.5, marksPercentage: 85, creditsEarned: 22, backlogs: 0 },
        { term: 'Semester 2', cgpa: 8.7, marksPercentage: 87, creditsEarned: 24, backlogs: 0 },
        { term: 'Semester 3', cgpa: 8.8, marksPercentage: 88, creditsEarned: 24, backlogs: 0 },
        { term: 'Semester 4', cgpa: 8.9, marksPercentage: 89, creditsEarned: 22, backlogs: 0 },
        { term: 'Semester 5', cgpa: 9.0, marksPercentage: 90, creditsEarned: 24, backlogs: 0 },
        { term: 'Semester 6', cgpa: 9.1, marksPercentage: 91, creditsEarned: 22, backlogs: 0 },
        { term: 'Semester 7 (Current)', cgpa: 8.9, marksPercentage: 89, creditsEarned: 18, backlogs: 0 },
      ],
    },
    attendance: {
      overallPercentage: 92,
      attendanceTrend: 'stable',
      biometricSynced: true,
      subjectWiseAttendance: [
        { subjectName: 'Power System Operation', attendancePercentage: 94, classesAttended: 32, totalClasses: 34 },
        { subjectName: 'Renewable Energy Integration', attendancePercentage: 93, classesAttended: 31, totalClasses: 33 },
        { subjectName: 'Industrial Automation', attendancePercentage: 91, classesAttended: 28, totalClasses: 31 },
        { subjectName: 'Electric Drives', attendancePercentage: 90, classesAttended: 30, totalClasses: 33 },
      ],
      history: [
        { period: 'Month 1', percentage: 93 },
        { period: 'Month 2', percentage: 92 },
        { period: 'Month 3', percentage: 91 },
        { period: 'Month 4', percentage: 92 },
      ],
    },
    lms: {
      loginFrequencyPerWeek: 7.2,
      previousLoginFrequency: 7.5,
      assignmentCompletionRate: 96,
      activityTrend: 'stable',
      modulesAccessed: 20,
      totalModules: 20,
      lastActiveDaysAgo: 1,
      averageSessionDurationMins: 45,
      forumDiscussionPosts: 8,
    },
    engagement: {
      eventsAttended: 9,
      clubsActive: 3,
      clubNames: ['Energy & Power Systems Guild', 'IEEE EEE Chapter', 'Campus Sustainability Board'],
      hackathonsCount: 2,
      certificationsCount: 4,
      participationScore: 89,
      behavioralScore: 91,
      peerCollaborationScore: 90,
      activityConsistencyScore: 92,
      engagementTrend: 'stable',
      keyMilestones: [
        'Designed Campus Microgrid Simulation Model',
        'Head of Technical Events - Vidyut 2026',
        'Certified in MATLAB Power Electronics & Grid Simulation',
      ],
    },
    placement: {
      aptitudeScore: 92,
      codingScore: 84,
      mockInterviewsCount: 4,
      preparationTrend: 'improving',
      readinessCondition: 'Prime placement candidate for core grid analytics and industrial automation roles.',
      verifiedSkillBadges: ['Power Grid Simulation', 'PLC Automation', 'Aptitude Top Decile', 'Renewables Specialist'],
      eligibleRoles: ['Power Systems Engineer', 'Smart Grid Analyst', 'Control Systems Engineer'],
    },
    skills: {
      technicalSkillAssessments: {
        'Power Systems Analysis': 92,
        'MATLAB & Simulink': 90,
        'PLC & SCADA Basics': 87,
        'Python for Energy Data': 82,
      },
      softSkillAssessments: {
        communication: 86,
        speaking: 84,
        presentation: 89,
        groupDiscussion: 88,
        debate: 81,
        technicalDiscussion: 90,
        interviewSkills: 87,
      },
      fluencisIntegrationStatus: 'calibrated',
      primaryStrength: 'Complex Grid Modeling & Clear Technical Articulation',
      growthFocus: 'Advanced Embedded Control System Interfacing',
    },
    feedback: {
      studentSatisfactionScore: 90,
      facultyFeedback:
        'Sneha has demonstrated steady, top-tier diligence across all 4 years. Her capstone research in renewable grid stability is commendable.',
      facultyAuthor: 'Dr. M. Venkat',
      facultyDepartment: 'Department of Electrical & Electronics',
      mentorFeedback: 'Prepared for immediate transition to leading industry roles and graduate programs.',
      feedbackDate: 'October 2026',
    },
    connectedDataSources: [
      { id: 'sis', name: 'Campus SIS', category: 'Academic', status: 'synced', lastSync: 'Today, 06:00', recordsCount: 65 },
      { id: 'biometric', name: 'Biometric RFID', category: 'Attendance', status: 'synced', lastSync: 'Today, 08:30', recordsCount: 195 },
      { id: 'lms', name: 'Canvas LMS', category: 'LMS', status: 'connected', lastSync: '1 hour ago', recordsCount: 390 },
      { id: 'campus_life', name: 'Club Portal', category: 'Engagement', status: 'connected', lastSync: 'Oct 07', recordsCount: 38 },
      { id: 'placement_hub', name: 'Placement Hub', category: 'Placement', status: 'connected', lastSync: 'Yesterday', recordsCount: 32 },
      { id: 'fluencis_matrix', name: 'Fluencis Matrix', category: 'Skills', status: 'calibrated', lastSync: 'Oct 03', recordsCount: 42 },
      { id: 'faculty_portal', name: 'Faculty Feedback', category: 'Feedback', status: 'synced', lastSync: 'Oct 05', recordsCount: 14 },
    ],
    crossSourceSynthesis: [
      'High concordance across SIS transcripts (8.9 CGPA), high attendance (92%), and peak placement aptitude (92/100).',
      'Stable behavioral telemetry with zero negative anomalies across all four semesters.',
    ],
  },

  // 5. KIRAN KUMAR
  {
    id: 'kiran-kumar',
    studentId: 'CS-2022-198',
    legacyId: 'std-5',
    name: 'Kiran Kumar',
    avatarInitials: 'KK',
    course: 'B.Tech Computer Science',
    branch: 'CSE',
    year: '3rd Year',
    currentSemester: 'Semester 5',
    academic: {
      cgpa: 8.2,
      overallMarks: 82,
      backlogs: 0,
      academicStanding: 'Good Standing',
      subjectPerformance: [
        { code: 'CS301', name: 'Design & Analysis of Algorithms', score: 83, grade: 'A', credits: 4 },
        { code: 'CS302', name: 'Database Management Systems', score: 84, grade: 'A', credits: 4 },
        { code: 'CS303', name: 'Advanced Programming in Python', score: 85, grade: 'A', credits: 3 },
        { code: 'MA301', name: 'Discrete Mathematics', score: 79, grade: 'B+', credits: 3 },
      ],
      history: [
        { term: 'Semester 1', cgpa: 8.0, marksPercentage: 80, creditsEarned: 22, backlogs: 0 },
        { term: 'Semester 2', cgpa: 8.2, marksPercentage: 82, creditsEarned: 24, backlogs: 0 },
        { term: 'Semester 3', cgpa: 8.4, marksPercentage: 84, creditsEarned: 24, backlogs: 0 },
        { term: 'Semester 4', cgpa: 8.3, marksPercentage: 83, creditsEarned: 22, backlogs: 0 },
        { term: 'Semester 5 (Current)', cgpa: 8.2, marksPercentage: 82, creditsEarned: 16, backlogs: 0 },
      ],
    },
    attendance: {
      overallPercentage: 80,
      attendanceTrend: 'declining',
      biometricSynced: true,
      subjectWiseAttendance: [
        { subjectName: 'Advanced Programming in Python', attendancePercentage: 84, classesAttended: 28, totalClasses: 33 },
        { subjectName: 'Database Management Systems', attendancePercentage: 81, classesAttended: 28, totalClasses: 34 },
        { subjectName: 'Design & Analysis of Algorithms', attendancePercentage: 79, classesAttended: 27, totalClasses: 34 },
        { subjectName: 'Discrete Mathematics', attendancePercentage: 76, classesAttended: 24, totalClasses: 32 },
      ],
      history: [
        { period: 'Month 1', percentage: 89 },
        { period: 'Month 2', percentage: 84 },
        { period: 'Month 3', percentage: 81 },
        { period: 'Month 4', percentage: 80 },
      ],
    },
    lms: {
      loginFrequencyPerWeek: 3.5,
      previousLoginFrequency: 6.8,
      assignmentCompletionRate: 78,
      activityTrend: 'declining',
      modulesAccessed: 14,
      totalModules: 20,
      lastActiveDaysAgo: 3,
      averageSessionDurationMins: 28,
      forumDiscussionPosts: 1,
    },
    engagement: {
      eventsAttended: 3,
      clubsActive: 1,
      clubNames: ['Gaming & Animation Society'],
      hackathonsCount: 0,
      certificationsCount: 1,
      participationScore: 61,
      behavioralScore: 64,
      peerCollaborationScore: 57,
      activityConsistencyScore: 59,
      engagementTrend: 'declining',
      keyMilestones: ['Completed 2D Game Project in Godot (Year 2)'],
    },
    placement: {
      aptitudeScore: 66,
      codingScore: 74,
      mockInterviewsCount: 1,
      preparationTrend: 'declining',
      readinessCondition: 'Requires proactive re-engagement and mock interview practice before hiring drives.',
      verifiedSkillBadges: ['Python Intermediate'],
      eligibleRoles: ['Junior QA Engineer', 'Technical Support Specialist'],
    },
    skills: {
      technicalSkillAssessments: {
        'Python Programming': 82,
        'Relational Databases': 80,
        'Algorithms & DS': 76,
        'Web Scripting': 71,
      },
      softSkillAssessments: {
        communication: 54,
        speaking: 56,
        presentation: 52,
        groupDiscussion: 50,
        debate: 55,
        technicalDiscussion: 64,
        interviewSkills: 53,
      },
      fluencisIntegrationStatus: 'ready',
      primaryStrength: 'Individual Programming Tasks',
      growthFocus: 'Group Interaction, Mock Interviews & Consistent LMS Participation',
    },
    feedback: {
      studentSatisfactionScore: 68,
      facultyFeedback:
        'Kiran continues to score well on exams, but has withdrawn significantly from collaborative group work. He recently missed two tutorial discussions.',
      facultyAuthor: 'Dr. R. Sengupta',
      facultyDepartment: 'Department of Computer Science',
      mentorFeedback: 'Kiran would benefit from a compassionate mentor sync to understand external stressors or disengagement factors.',
      feedbackDate: 'October 2026',
    },
    connectedDataSources: [
      { id: 'sis', name: 'Campus SIS', category: 'Academic', status: 'synced', lastSync: 'Today, 06:00', recordsCount: 40 },
      { id: 'biometric', name: 'Biometric RFID', category: 'Attendance', status: 'synced', lastSync: 'Today, 08:30', recordsCount: 155 },
      { id: 'lms', name: 'Canvas LMS', category: 'LMS', status: 'connected', lastSync: '2 hours ago', recordsCount: 180 },
      { id: 'campus_life', name: 'Club Portal', category: 'Engagement', status: 'connected', lastSync: 'Oct 05', recordsCount: 12 },
      { id: 'placement_hub', name: 'Placement Hub', category: 'Placement', status: 'connected', lastSync: 'Oct 01', recordsCount: 7 },
      { id: 'fluencis_matrix', name: 'Fluencis Matrix', category: 'Skills', status: 'ready', lastSync: 'Sep 29', recordsCount: 22 },
      { id: 'faculty_portal', name: 'Faculty Feedback', category: 'Feedback', status: 'synced', lastSync: 'Oct 04', recordsCount: 9 },
    ],
    crossSourceSynthesis: [
      'Multi-source divergence detected: Exams show 82% mastery while LMS frequency fell from 6.8 to 3.5/week.',
      'Soft skills telemetry highlights low Group Discussion comfort (50/100), echoing faculty feedback regarding tutorial silence.',
    ],
  },

  // 6. ANANYA RAO
  {
    id: 'ananya-rao',
    studentId: 'EC-2023-088',
    legacyId: 'std-6',
    name: 'Ananya Rao',
    avatarInitials: 'AR',
    course: 'B.Tech Electronics & Communication',
    branch: 'ECE',
    year: '2nd Year',
    currentSemester: 'Semester 3',
    academic: {
      cgpa: 8.5,
      overallMarks: 85,
      backlogs: 0,
      academicStanding: 'Good Standing',
      subjectPerformance: [
        { code: 'EC201', name: 'Electronic Devices & Circuits', score: 88, grade: 'A', credits: 4 },
        { code: 'EC202', name: 'Signals & Systems', score: 84, grade: 'A', credits: 4 },
        { code: 'MA201', name: 'Transform Techniques & Complex Analysis', score: 86, grade: 'A', credits: 3 },
        { code: 'EC203', name: 'Analog Circuit Laboratory', score: 89, grade: 'A+', credits: 2 },
      ],
      history: [
        { term: 'Semester 1', cgpa: 8.3, marksPercentage: 83, creditsEarned: 22, backlogs: 0 },
        { term: 'Semester 2', cgpa: 8.6, marksPercentage: 86, creditsEarned: 24, backlogs: 0 },
        { term: 'Semester 3 (Current)', cgpa: 8.5, marksPercentage: 85, creditsEarned: 16, backlogs: 0 },
      ],
    },
    attendance: {
      overallPercentage: 90,
      attendanceTrend: 'stable',
      biometricSynced: true,
      subjectWiseAttendance: [
        { subjectName: 'Analog Circuit Laboratory', attendancePercentage: 94, classesAttended: 16, totalClasses: 17 },
        { subjectName: 'Electronic Devices & Circuits', attendancePercentage: 91, classesAttended: 30, totalClasses: 33 },
        { subjectName: 'Signals & Systems', attendancePercentage: 89, classesAttended: 29, totalClasses: 33 },
        { subjectName: 'Transform Techniques', attendancePercentage: 88, classesAttended: 28, totalClasses: 32 },
      ],
      history: [
        { period: 'Month 1', percentage: 91 },
        { period: 'Month 2', percentage: 90 },
        { period: 'Month 3', percentage: 89 },
        { period: 'Month 4', percentage: 90 },
      ],
    },
    lms: {
      loginFrequencyPerWeek: 6.8,
      previousLoginFrequency: 6.4,
      assignmentCompletionRate: 94,
      activityTrend: 'improving',
      modulesAccessed: 18,
      totalModules: 19,
      lastActiveDaysAgo: 0,
      averageSessionDurationMins: 46,
      forumDiscussionPosts: 9,
    },
    engagement: {
      eventsAttended: 6,
      clubsActive: 2,
      clubNames: ['Circuits & Sensors Society', 'Cultural Music Ensemble'],
      hackathonsCount: 1,
      certificationsCount: 2,
      participationScore: 84,
      behavioralScore: 86,
      peerCollaborationScore: 85,
      activityConsistencyScore: 88,
      engagementTrend: 'improving',
      keyMilestones: [
        'Built Bio-impedance Sensor Prototype',
        'Co-organized ECE Department Freshers Welcome',
      ],
    },
    placement: {
      aptitudeScore: 80,
      codingScore: 78,
      mockInterviewsCount: 2,
      preparationTrend: 'improving',
      readinessCondition: 'Promising dual competency in hardware circuitry and computational signal analysis.',
      verifiedSkillBadges: ['Spice Circuit Simulator', 'Python Data Processing'],
      eligibleRoles: ['Analog Design Trainee', 'Circuit Testing Engineer'],
    },
    skills: {
      technicalSkillAssessments: {
        'Circuit Analysis & SPICE': 88,
        'Signals & Transforms': 84,
        'Hardware Lab Rigor': 89,
        'Python Programming': 78,
      },
      softSkillAssessments: {
        communication: 82,
        speaking: 80,
        presentation: 85,
        groupDiscussion: 83,
        debate: 78,
        technicalDiscussion: 84,
        interviewSkills: 81,
      },
      fluencisIntegrationStatus: 'calibrated',
      primaryStrength: 'Laboratory Precision & Structured Technical Documentation',
      growthFocus: 'Advanced Digital System Design & Verilog',
    },
    feedback: {
      studentSatisfactionScore: 88,
      facultyFeedback:
        'Ananya is methodical and dependable in both classroom discussions and lab simulations. Shows great potential in analog engineering.',
      facultyAuthor: 'Prof. T. Gopal',
      facultyDepartment: 'Department of Electronics',
      mentorFeedback: 'Very positive learning attitude with steady, reliable habits across all semesters.',
      feedbackDate: 'October 2026',
    },
    connectedDataSources: [
      { id: 'sis', name: 'Campus SIS', category: 'Academic', status: 'synced', lastSync: 'Today, 06:00', recordsCount: 30 },
      { id: 'biometric', name: 'Biometric RFID', category: 'Attendance', status: 'synced', lastSync: 'Today, 08:35', recordsCount: 148 },
      { id: 'lms', name: 'Canvas LMS', category: 'LMS', status: 'connected', lastSync: '15 mins ago', recordsCount: 290 },
      { id: 'campus_life', name: 'Club Portal', category: 'Engagement', status: 'connected', lastSync: 'Today', recordsCount: 22 },
      { id: 'placement_hub', name: 'Placement Hub', category: 'Placement', status: 'connected', lastSync: 'Oct 05', recordsCount: 15 },
      { id: 'fluencis_matrix', name: 'Fluencis Matrix', category: 'Skills', status: 'calibrated', lastSync: 'Oct 04', recordsCount: 36 },
      { id: 'faculty_portal', name: 'Faculty Feedback', category: 'Feedback', status: 'synced', lastSync: 'Oct 06', recordsCount: 8 },
    ],
    crossSourceSynthesis: [
      'Symmetric harmony across all 7 data vectors with steady 85% academic index and 90% attendance.',
      'Active LMS rhythm (6.8 logins/week) indicates healthy study routine.',
    ],
  },

  // 7. VIVEK SHARMA
  {
    id: 'vivek-sharma',
    studentId: 'EE-2022-054',
    legacyId: 'std-7',
    name: 'Vivek Sharma',
    avatarInitials: 'VS',
    course: 'B.Tech Electrical & Electronics',
    branch: 'EEE',
    year: '3rd Year',
    currentSemester: 'Semester 5',
    academic: {
      cgpa: 8.0,
      overallMarks: 80,
      backlogs: 0,
      academicStanding: 'Good Standing',
      subjectPerformance: [
        { code: 'EE301', name: 'Control Systems Engineering', score: 82, grade: 'A', credits: 4 },
        { code: 'EE302', name: 'Power Electronics', score: 79, grade: 'B+', credits: 4 },
        { code: 'EE303', name: 'Microprocessor Architecture (8086/ARM)', score: 84, grade: 'A', credits: 4 },
        { code: 'EE304', name: 'Sensors & Signal Conditioning', score: 81, grade: 'A', credits: 3 },
      ],
      history: [
        { term: 'Semester 1', cgpa: 7.7, marksPercentage: 77, creditsEarned: 22, backlogs: 0 },
        { term: 'Semester 2', cgpa: 7.9, marksPercentage: 79, creditsEarned: 24, backlogs: 0 },
        { term: 'Semester 3', cgpa: 8.1, marksPercentage: 81, creditsEarned: 24, backlogs: 0 },
        { term: 'Semester 4', cgpa: 8.0, marksPercentage: 80, creditsEarned: 22, backlogs: 0 },
        { term: 'Semester 5 (Current)', cgpa: 8.0, marksPercentage: 80, creditsEarned: 17, backlogs: 0 },
      ],
    },
    attendance: {
      overallPercentage: 86,
      attendanceTrend: 'stable',
      biometricSynced: true,
      subjectWiseAttendance: [
        { subjectName: 'Microprocessor Architecture', attendancePercentage: 89, classesAttended: 30, totalClasses: 34 },
        { subjectName: 'Control Systems', attendancePercentage: 86, classesAttended: 29, totalClasses: 34 },
        { subjectName: 'Sensors & Signal Conditioning', attendancePercentage: 85, classesAttended: 28, totalClasses: 33 },
        { subjectName: 'Power Electronics', attendancePercentage: 83, classesAttended: 27, totalClasses: 33 },
      ],
      history: [
        { period: 'Month 1', percentage: 88 },
        { period: 'Month 2', percentage: 86 },
        { period: 'Month 3', percentage: 85 },
        { period: 'Month 4', percentage: 86 },
      ],
    },
    lms: {
      loginFrequencyPerWeek: 5.4,
      previousLoginFrequency: 5.6,
      assignmentCompletionRate: 88,
      activityTrend: 'stable',
      modulesAccessed: 16,
      totalModules: 19,
      lastActiveDaysAgo: 1,
      averageSessionDurationMins: 36,
      forumDiscussionPosts: 5,
    },
    engagement: {
      eventsAttended: 5,
      clubsActive: 2,
      clubNames: ['Embedded Tech Club', 'Sports Council (Badminton)'],
      hackathonsCount: 1,
      certificationsCount: 2,
      participationScore: 79,
      behavioralScore: 81,
      peerCollaborationScore: 80,
      activityConsistencyScore: 82,
      engagementTrend: 'stable',
      keyMilestones: [
        'Built Automated Solar Tracker using Microcontroller',
        'Inter-Department Badminton Team Captain',
      ],
    },
    placement: {
      aptitudeScore: 76,
      codingScore: 75,
      mockInterviewsCount: 2,
      preparationTrend: 'stable',
      readinessCondition: 'Solid foundational competencies; ready for core hardware and automation screening rounds.',
      verifiedSkillBadges: ['ARM Assembly Basics', 'Control Systems Lab'],
      eligibleRoles: ['Industrial Automation Trainee', 'Field Application Engineer'],
    },
    skills: {
      technicalSkillAssessments: {
        'Control Systems Design': 82,
        'Embedded Hardware (ARM)': 84,
        'Power Electronics Bench': 79,
        'C Programming': 78,
      },
      softSkillAssessments: {
        communication: 74,
        speaking: 73,
        presentation: 75,
        groupDiscussion: 76,
        debate: 70,
        technicalDiscussion: 78,
        interviewSkills: 72,
      },
      fluencisIntegrationStatus: 'ready',
      primaryStrength: 'Hardware Interfacing & Practical Debugging',
      growthFocus: 'Advanced Power Electronics Algorithms',
    },
    feedback: {
      studentSatisfactionScore: 83,
      facultyFeedback:
        'Vivek is an active participant in hardware lab sessions. His microprocessor interfacing assignments demonstrate strong hands-on intuition.',
      facultyAuthor: 'Dr. C. Madhavan',
      facultyDepartment: 'Department of Electrical & Electronics',
      mentorFeedback: 'Reliable and grounded. Maintains a healthy balance between sports and academics.',
      feedbackDate: 'October 2026',
    },
    connectedDataSources: [
      { id: 'sis', name: 'Campus SIS', category: 'Academic', status: 'synced', lastSync: 'Today, 06:00', recordsCount: 42 },
      { id: 'biometric', name: 'Biometric RFID', category: 'Attendance', status: 'synced', lastSync: 'Today, 08:30', recordsCount: 162 },
      { id: 'lms', name: 'Canvas LMS', category: 'LMS', status: 'connected', lastSync: '45 mins ago', recordsCount: 240 },
      { id: 'campus_life', name: 'Club Portal', category: 'Engagement', status: 'connected', lastSync: 'Oct 06', recordsCount: 20 },
      { id: 'placement_hub', name: 'Placement Hub', category: 'Placement', status: 'connected', lastSync: 'Oct 03', recordsCount: 12 },
      { id: 'fluencis_matrix', name: 'Fluencis Matrix', category: 'Skills', status: 'ready', lastSync: 'Oct 02', recordsCount: 30 },
      { id: 'faculty_portal', name: 'Faculty Feedback', category: 'Feedback', status: 'synced', lastSync: 'Oct 05', recordsCount: 7 },
    ],
    crossSourceSynthesis: [
      'Steady 8.0 CGPA baseline accompanied by reliable 86% attendance and consistent sports engagement.',
      'Data points indicate steady-state equilibrium across both hardware and soft skill evaluations.',
    ],
  },

  // 8. MEERA REDDY
  {
    id: 'meera-reddy',
    studentId: 'CS-2021-009',
    legacyId: 'std-8',
    name: 'Meera Reddy',
    avatarInitials: 'MR',
    course: 'B.Tech Computer Science',
    branch: 'CSE',
    year: '4th Year',
    currentSemester: 'Semester 7',
    academic: {
      cgpa: 9.3,
      overallMarks: 93,
      backlogs: 0,
      academicStanding: 'Distinction',
      subjectPerformance: [
        { code: 'CS401', name: 'Cloud Computing & Distributed Systems', score: 96, grade: 'A+', credits: 4 },
        { code: 'CS402', name: 'Machine Learning Foundations', score: 94, grade: 'A+', credits: 4 },
        { code: 'CS403', name: 'Information Security & Cryptography', score: 91, grade: 'A+', credits: 3 },
        { code: 'CS404', name: 'High Performance Computing', score: 92, grade: 'A+', credits: 4 },
      ],
      history: [
        { term: 'Semester 1', cgpa: 9.0, marksPercentage: 90, creditsEarned: 22, backlogs: 0 },
        { term: 'Semester 2', cgpa: 9.2, marksPercentage: 92, creditsEarned: 24, backlogs: 0 },
        { term: 'Semester 3', cgpa: 9.3, marksPercentage: 93, creditsEarned: 24, backlogs: 0 },
        { term: 'Semester 4', cgpa: 9.4, marksPercentage: 94, creditsEarned: 22, backlogs: 0 },
        { term: 'Semester 5', cgpa: 9.3, marksPercentage: 93, creditsEarned: 24, backlogs: 0 },
        { term: 'Semester 6', cgpa: 9.4, marksPercentage: 94, creditsEarned: 22, backlogs: 0 },
        { term: 'Semester 7 (Current)', cgpa: 9.3, marksPercentage: 93, creditsEarned: 18, backlogs: 0 },
      ],
    },
    attendance: {
      overallPercentage: 95,
      attendanceTrend: 'stable',
      biometricSynced: true,
      subjectWiseAttendance: [
        { subjectName: 'Cloud Computing', attendancePercentage: 97, classesAttended: 33, totalClasses: 34 },
        { subjectName: 'Machine Learning', attendancePercentage: 95, classesAttended: 32, totalClasses: 34 },
        { subjectName: 'Information Security', attendancePercentage: 94, classesAttended: 30, totalClasses: 32 },
        { subjectName: 'High Performance Computing', attendancePercentage: 94, classesAttended: 31, totalClasses: 33 },
      ],
      history: [
        { period: 'Month 1', percentage: 96 },
        { period: 'Month 2', percentage: 95 },
        { period: 'Month 3', percentage: 94 },
        { period: 'Month 4', percentage: 95 },
      ],
    },
    lms: {
      loginFrequencyPerWeek: 9.2,
      previousLoginFrequency: 8.9,
      assignmentCompletionRate: 99,
      activityTrend: 'improving',
      modulesAccessed: 24,
      totalModules: 24,
      lastActiveDaysAgo: 0,
      averageSessionDurationMins: 55,
      forumDiscussionPosts: 22,
    },
    engagement: {
      eventsAttended: 11,
      clubsActive: 3,
      clubNames: ['Developer Student Club (Lead)', 'AI Research Group', 'Competitive Programming Chapter'],
      hackathonsCount: 4,
      certificationsCount: 5,
      participationScore: 96,
      behavioralScore: 94,
      peerCollaborationScore: 95,
      activityConsistencyScore: 97,
      engagementTrend: 'improving',
      keyMilestones: [
        'Winner - National Smart India Hackathon',
        'Lead Author - Distributed Cloud Storage Paper',
        'AWS Certified Solutions Architect Associate',
      ],
    },
    placement: {
      aptitudeScore: 95,
      codingScore: 94,
      mockInterviewsCount: 5,
      preparationTrend: 'improving',
      readinessCondition: 'Premier candidate across competitive coding, systems design, and leadership portfolios.',
      verifiedSkillBadges: ['Distributed Systems', 'Cloud Architect', 'Algorithms Top 1%', 'Competitive Coding Master'],
      eligibleRoles: ['Cloud Systems Engineer', 'Software Development Engineer II Trainee', 'AI Systems Developer'],
    },
    skills: {
      technicalSkillAssessments: {
        'Distributed Systems & Cloud': 96,
        'Data Structures & Algorithms': 94,
        'Machine Learning Frameworks': 92,
        'Go / Rust / C++': 89,
        'Cybersecurity Foundations': 88,
      },
      softSkillAssessments: {
        communication: 92,
        speaking: 90,
        presentation: 94,
        groupDiscussion: 93,
        debate: 88,
        technicalDiscussion: 95,
        interviewSkills: 93,
      },
      fluencisIntegrationStatus: 'calibrated',
      primaryStrength: 'Complex Distributed Architecture & Articulate Thought Leadership',
      growthFocus: 'Enterprise Scale Strategy & Global Mentorship',
    },
    feedback: {
      studentSatisfactionScore: 96,
      facultyFeedback:
        'Meera is among the most accomplished students in our department. Her clarity in technical debates and community contributions are outstanding.',
      facultyAuthor: 'Dr. V. Ramanathan',
      facultyDepartment: 'Department of Computer Science & Engineering',
      mentorFeedback: 'Exceptional self-starter and inspirational cohort role model.',
      feedbackDate: 'October 2026',
    },
    connectedDataSources: [
      { id: 'sis', name: 'Campus SIS', category: 'Academic', status: 'synced', lastSync: 'Today, 06:00', recordsCount: 68 },
      { id: 'biometric', name: 'Biometric RFID', category: 'Attendance', status: 'synced', lastSync: 'Today, 08:30', recordsCount: 210 },
      { id: 'lms', name: 'Canvas LMS', category: 'LMS', status: 'connected', lastSync: 'Just now', recordsCount: 512 },
      { id: 'campus_life', name: 'Club Portal', category: 'Engagement', status: 'connected', lastSync: 'Today', recordsCount: 52 },
      { id: 'placement_hub', name: 'Placement Hub', category: 'Placement', status: 'connected', lastSync: 'Today', recordsCount: 40 },
      { id: 'fluencis_matrix', name: 'Fluencis Matrix', category: 'Skills', status: 'calibrated', lastSync: 'Oct 06', recordsCount: 55 },
      { id: 'faculty_portal', name: 'Faculty Feedback', category: 'Feedback', status: 'synced', lastSync: 'Oct 07', recordsCount: 16 },
    ],
    crossSourceSynthesis: [
      'Unanimous excellence across all 7 intelligence dimensions (93% Academic, 95% Attendance, 9.2 LMS logins/wk).',
      'Verified top decile performance across coding benchmarks (94/100) and Fluencis soft skills (92/100).',
    ],
  },
];

// =========================================================================
// HELPER LOOKUP & DATA INTEGRATION FUNCTIONS
// =========================================================================

/**
 * Returns a UnifiedStudentProfile by student id, name, or studentId code.
 * Safe fallback guarantees non-null result.
 */
export function getUnifiedStudentProfile(identifier: string): UnifiedStudentProfile {
  if (!identifier) return UNIFIED_STUDENTS[0];

  const canonical = toCanonicalStudentId(identifier);
  const canonicalMatch = UNIFIED_STUDENTS.find(
    (s) => s.id === canonical || isSameStudent(s.id, canonical)
  );
  if (canonicalMatch) return canonicalMatch;

  const normalized = identifier.toLowerCase().trim();

  const match = UNIFIED_STUDENTS.find(
    (s) =>
      s.id.toLowerCase() === normalized ||
      s.name.toLowerCase() === normalized ||
      s.studentId.toLowerCase() === normalized ||
      s.legacyId.toLowerCase() === normalized ||
      s.name.toLowerCase().includes(normalized) ||
      normalized.includes(s.name.toLowerCase())
  );

  return match || UNIFIED_STUDENTS[0];
}

/**
 * Returns all unified student profiles.
 */
export function getAllUnifiedStudents(): UnifiedStudentProfile[] {
  return UNIFIED_STUDENTS;
}

/**
 * Normalizes any score safely to a 0-100 range.
 */
export function normalizeScore(val: number, min: number = 0, max: number = 100): number {
  if (isNaN(val)) return 0;
  const clamped = Math.max(min, Math.min(max, val));
  if (max === 10) {
    // e.g. CGPA to percentage
    return Math.round(clamped * 10);
  }
  return Math.round(clamped);
}

/**
 * Validates integrity of a unified student record
 */
export function validateUnifiedRecord(profile: UnifiedStudentProfile): {
  isValid: boolean;
  categoriesComplete: number;
  totalCategories: number;
} {
  let count = 0;
  if (profile.academic && profile.academic.cgpa > 0) count++;
  if (profile.attendance && profile.attendance.overallPercentage > 0) count++;
  if (profile.lms && profile.lms.loginFrequencyPerWeek >= 0) count++;
  if (profile.engagement && profile.engagement.participationScore >= 0) count++;
  if (profile.placement && profile.placement.aptitudeScore >= 0) count++;
  if (profile.skills && profile.skills.softSkillAssessments) count++;
  if (profile.feedback && profile.feedback.facultyFeedback) count++;

  return {
    isValid: count === 7,
    categoriesComplete: count,
    totalCategories: 7,
  };
}

/**
 * Safely updates an existing unified student record in memory and localStorage cache.
 */
export function updateUnifiedStudentProfile(
  studentIdentifier: string,
  updater: (existing: UnifiedStudentProfile) => UnifiedStudentProfile
): UnifiedStudentProfile | null {
  const canonical = toCanonicalStudentId(studentIdentifier);
  const idx = UNIFIED_STUDENTS.findIndex(
    (s) => s.id === canonical || isSameStudent(s.id, canonical)
  );

  if (idx === -1) return null;

  const updated = updater(UNIFIED_STUDENTS[idx]);
  UNIFIED_STUDENTS[idx] = updated;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('evolyn_custom_student_data', JSON.stringify(UNIFIED_STUDENTS));
    } catch (e) {
      console.warn('Failed saving updated unified student profiles', e);
    }
  }

  return updated;
}

// Hydrate cached updates from localStorage if available
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem('evolyn_custom_student_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        parsed.forEach((custom: UnifiedStudentProfile) => {
          const idx = UNIFIED_STUDENTS.findIndex((s) => s.id === custom.id);
          if (idx !== -1) {
            UNIFIED_STUDENTS[idx] = { ...UNIFIED_STUDENTS[idx], ...custom };
          }
        });
      }
    }
  } catch (e) {
    console.warn('Failed loading cached student data', e);
  }
}

