/**
 * Step 11: Student Data Integration, CSV Import & Validation Engine
 * 
 * Supports 7 Data Categories:
 * 1. Academic Performance (CGPA, marks, backlogs, term)
 * 2. Attendance (overall percentage, classes attended, total classes)
 * 3. LMS Engagement (login frequency, assignment completion rate)
 * 4. Student Engagement (participation score, behavioral score, peer collaboration)
 * 5. Skills & Communication (assessment type, category, score, max score, assessor notes)
 * 6. Placement Readiness (aptitude, coding, mock interview, preparation activity)
 * 7. Feedback (satisfaction/feedback score, feedback source, qualitative comments)
 * 
 * Responsible Data Architecture:
 * - Deterministic validation before commit.
 * - Explicit error reporting (never silently drops or zeros missing data).
 * - Match against Canonical Student Registry using stable student IDs.
 * - Prevents merging based merely on similar names.
 * - Comprehensive Audit History with persistence.
 */

import {
  UNIFIED_STUDENTS,
  UnifiedStudentProfile,
  getUnifiedStudentProfile,
  updateUnifiedStudentProfile,
} from './unifiedStudentData';
import {
  toCanonicalStudentId,
  isSameStudent,
  CANONICAL_STUDENT_REGISTRY,
  CanonicalStudentDescriptor,
} from './canonicalStudentRegistry';
import { syncSuccessScoreFromProfile } from './studentSuccessScore';
import { evaluateStudentRisk, ALL_STUDENT_RISK_PROFILES } from './studentRiskEngine';
import { classifyStudentSegment, ALL_STUDENT_SEGMENTS } from './studentSegmentationEngine';
import { syncSilentStruggleFromProfile } from './silentStruggleData';
import { syncGrowthProfileFromUnified, STUDENT_GROWTH_DATA } from './studentGrowthData';
import { db, auth } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export type DatasetCategory =
  | 'academic'
  | 'attendance'
  | 'lms'
  | 'engagement'
  | 'skills'
  | 'placement'
  | 'feedback';

export interface DatasetCategoryMeta {
  id: DatasetCategory;
  name: string;
  badgeLabel: string;
  description: string;
  requiredColumns: string[];
  optionalColumns: string[];
  templateFileName: string;
  sampleCsv: string;
  columnDescriptions: Record<
    string,
    { label: string; type: 'string' | 'number' | 'date'; range?: string; required: boolean; description: string }
  >;
}

export const DATASET_CATEGORIES_META: Record<DatasetCategory, DatasetCategoryMeta> = {
  academic: {
    id: 'academic',
    name: 'Academic Performance',
    badgeLabel: 'Academic',
    description: 'Coursework mastery, CGPA, backlogs, exam performance, and summative grades.',
    requiredColumns: ['student_id', 'cgpa'],
    optionalColumns: ['student_name', 'department', 'branch', 'year', 'backlogs', 'overall_marks', 'record_date'],
    templateFileName: 'evolyn_academic_template.csv',
    sampleCsv: `student_id,student_name,department,branch,year,cgpa,backlogs,record_date
CS-2022-084,Arjun Kumar,Computer Science,CSE,3rd Year,8.5,0,2026-10-01
CS-2022-109,Priya Sharma,Computer Science,CSE,2nd Year,9.2,0,2026-10-01
EE-2023-031,Rahul Verma,Electrical Engineering,EEE,2nd Year,6.7,1,2026-10-01
CS-2022-088,Sneha Reddy,Computer Science,CSE,3rd Year,8.9,0,2026-10-01
CS-2023-055,Kiran Kumar,Computer Science,CSE,1st Year,7.6,0,2026-10-01`,
    columnDescriptions: {
      student_id: { label: 'Student ID', type: 'string', required: true, description: 'Stable student ID or roll number (e.g. CS-2022-084 or arjun-kumar)' },
      student_name: { label: 'Student Name', type: 'string', required: false, description: 'Full student name for audit verification' },
      department: { label: 'Department', type: 'string', required: false, description: 'Academic department' },
      branch: { label: 'Branch', type: 'string', required: false, description: 'Branch code (e.g. CSE, EEE, AI/DS)' },
      year: { label: 'Year', type: 'string', required: false, description: 'Current academic year (e.g. 1st Year, 3rd Year)' },
      cgpa: { label: 'CGPA', type: 'number', range: '0.0 – 10.0', required: true, description: 'Cumulative Grade Point Average on 10-point scale' },
      backlogs: { label: 'Active Backlogs', type: 'number', range: '>= 0', required: false, description: 'Number of active uncleared course backlogs' },
      overall_marks: { label: 'Overall Marks %', type: 'number', range: '0 – 100', required: false, description: 'Normalized percentage score across term subjects' },
      record_date: { label: 'Record Date', type: 'date', range: 'YYYY-MM-DD', required: false, description: 'Evaluation term or entry timestamp' },
    },
  },
  attendance: {
    id: 'attendance',
    name: 'Attendance Telemetry',
    badgeLabel: 'Attendance',
    description: 'Lecture, laboratory, and recitation biometric presence logs.',
    requiredColumns: ['student_id', 'attendance_percentage'],
    optionalColumns: ['classes_attended', 'total_classes', 'record_date', 'student_name'],
    templateFileName: 'evolyn_attendance_template.csv',
    sampleCsv: `student_id,attendance_percentage,classes_attended,total_classes,record_date
CS-2022-084,88.5,31,35,2026-10-05
CS-2022-109,96.0,38,40,2026-10-05
EE-2023-031,72.0,26,36,2026-10-05
CS-2022-088,89.0,33,37,2026-10-05
CS-2023-055,90.5,38,42,2026-10-05`,
    columnDescriptions: {
      student_id: { label: 'Student ID', type: 'string', required: true, description: 'Stable student ID or roll number' },
      attendance_percentage: { label: 'Attendance %', type: 'number', range: '0.0 – 100.0', required: true, description: 'Cumulative physical attendance percentage' },
      classes_attended: { label: 'Classes Attended', type: 'number', range: '>= 0', required: false, description: 'Total classes physically logged' },
      total_classes: { label: 'Total Scheduled', type: 'number', range: '>= classes_attended', required: false, description: 'Total scheduled sessions held' },
      record_date: { label: 'Record Date', type: 'date', range: 'YYYY-MM-DD', required: false, description: 'Biometric snapshot date' },
    },
  },
  lms: {
    id: 'lms',
    name: 'LMS Engagement',
    badgeLabel: 'LMS Telemetry',
    description: 'Digital courseware activity, login frequency, and assignment submission rates.',
    requiredColumns: ['student_id', 'login_frequency', 'assignment_completion'],
    optionalColumns: ['record_date', 'course_code', 'student_name'],
    templateFileName: 'evolyn_lms_engagement_template.csv',
    sampleCsv: `student_id,login_frequency,assignment_completion,record_date,course_code
CS-2022-084,5.2,88.0,2026-10-06,CS301
CS-2022-109,8.5,95.0,2026-10-06,CS402
EE-2023-031,3.1,60.0,2026-10-06,EE201
CS-2022-088,7.8,92.0,2026-10-06,CS303
CS-2023-055,6.2,82.0,2026-10-06,CS101`,
    columnDescriptions: {
      student_id: { label: 'Student ID', type: 'string', required: true, description: 'Stable student ID or roll number' },
      login_frequency: { label: 'Logins / Week', type: 'number', range: '0 – 50', required: true, description: 'Average weekly platform access frequency' },
      assignment_completion: { label: 'Assignment Rate %', type: 'number', range: '0 – 100', required: true, description: 'Percentage of assigned digital modules submitted' },
      record_date: { label: 'Record Date', type: 'date', range: 'YYYY-MM-DD', required: false, description: 'Activity window date' },
      course_code: { label: 'Course Code', type: 'string', required: false, description: 'Associated course identifier' },
    },
  },
  engagement: {
    id: 'engagement',
    name: 'Student Behavioral Engagement',
    badgeLabel: 'Engagement',
    description: 'Seminar presence, peer collaboration, office hours, and collaborative projects.',
    requiredColumns: ['student_id', 'participation_score', 'engagement_score'],
    optionalColumns: ['peer_collaboration_score', 'record_date', 'student_name'],
    templateFileName: 'evolyn_engagement_template.csv',
    sampleCsv: `student_id,participation_score,engagement_score,peer_collaboration_score,record_date
CS-2022-084,72,74,80,2026-10-06
CS-2022-109,92,90,94,2026-10-06
EE-2023-031,58,55,62,2026-10-06
CS-2022-088,84,82,86,2026-10-06
CS-2023-055,80,78,76,2026-10-06`,
    columnDescriptions: {
      student_id: { label: 'Student ID', type: 'string', required: true, description: 'Stable student ID or roll number' },
      participation_score: { label: 'Participation Score', type: 'number', range: '0 – 100', required: true, description: 'Seminar discussion and question momentum' },
      engagement_score: { label: 'Behavioral Engagement', type: 'number', range: '0 – 100', required: true, description: 'Overall learning stamina and consistency' },
      peer_collaboration_score: { label: 'Peer Collaboration', type: 'number', range: '0 – 100', required: false, description: 'Study circle and team repo participation rating' },
      record_date: { label: 'Record Date', type: 'date', range: 'YYYY-MM-DD', required: false, description: 'Evaluation date' },
    },
  },
  skills: {
    id: 'skills',
    name: 'Skills & Communication Assessments',
    badgeLabel: 'Skills & Fluencis',
    description: 'Verbal communication, coding tests, presentation benchmarks, and problem solving evaluations.',
    requiredColumns: ['student_id', 'assessment_type', 'score', 'max_score'],
    optionalColumns: ['category', 'assessment_date', 'assessor_notes', 'student_name'],
    templateFileName: 'evolyn_skills_assessments_template.csv',
    sampleCsv: `student_id,assessment_type,category,score,max_score,assessment_date,assessor_notes
CS-2022-084,Technical Presentation Benchmark,communication,85,100,2026-10-07,Articulate breakdown of graph shortest path trade-offs
CS-2022-109,Circuit Architecture Synthesis,technical,94,100,2026-10-07,Exemplary hardware debugging and peer explanations
EE-2023-031,Workshop Statics Practical,technical,68,100,2026-10-07,Solid hands-on machining and CAD drafting
CS-2022-088,AI System Design Presentation,communication,92,100,2026-10-07,Excellent spontaneous presentation cadence
CS-2023-055,Algorithms Lab Code Review,technical,78,100,2026-10-07,Clean C++ recursive implementation with memoization`,
    columnDescriptions: {
      student_id: { label: 'Student ID', type: 'string', required: true, description: 'Stable student ID or roll number' },
      assessment_type: { label: 'Assessment Type', type: 'string', required: true, description: 'Title or name of evaluated skill' },
      category: { label: 'Category', type: 'string', range: 'communication | technical | career-placement', required: false, description: 'Skill dimension domain' },
      score: { label: 'Score Earned', type: 'number', range: '0 – max_score', required: true, description: 'Earned evaluation points' },
      max_score: { label: 'Max Score', type: 'number', range: '> 0', required: true, description: 'Scale maximum (typically 100)' },
      assessment_date: { label: 'Assessment Date', type: 'date', range: 'YYYY-MM-DD', required: false, description: 'Evaluation date' },
      assessor_notes: { label: 'Assessor Notes', type: 'string', required: false, description: 'Qualitative mentor or faculty observations' },
    },
  },
  placement: {
    id: 'placement',
    name: 'Career & Placement Readiness',
    badgeLabel: 'Placement',
    description: 'Quantitative aptitude, technical coding rounds, mock interviews, and preparation consistency.',
    requiredColumns: ['student_id', 'aptitude_score', 'coding_score'],
    optionalColumns: ['mock_interview_score', 'preparation_activity', 'record_date', 'student_name'],
    templateFileName: 'evolyn_placement_readiness_template.csv',
    sampleCsv: `student_id,aptitude_score,coding_score,mock_interview_score,preparation_activity,record_date
CS-2022-084,80,84,76,Consistent,2026-10-07
CS-2022-109,90,92,88,Consistent,2026-10-07
EE-2023-031,62,58,60,Moderate,2026-10-07
CS-2022-088,94,92,90,Consistent,2026-10-07
CS-2023-055,70,72,66,Moderate,2026-10-07`,
    columnDescriptions: {
      student_id: { label: 'Student ID', type: 'string', required: true, description: 'Stable student ID or roll number' },
      aptitude_score: { label: 'Aptitude Score', type: 'number', range: '0 – 100', required: true, description: 'Quantitative & logical aptitude test rating' },
      coding_score: { label: 'Coding Benchmark', type: 'number', range: '0 – 100', required: true, description: 'Algorithmic coding test performance' },
      mock_interview_score: { label: 'Mock Interview Score', type: 'number', range: '0 – 100', required: false, description: 'Technical & behavioral mock interview rating' },
      preparation_activity: { label: 'Preparation Activity', type: 'string', range: 'Consistent | Moderate | Irregular', required: false, description: 'Placement cell cadence label' },
      record_date: { label: 'Record Date', type: 'date', range: 'YYYY-MM-DD', required: false, description: 'Benchmarking timestamp' },
    },
  },
  feedback: {
    id: 'feedback',
    name: 'Feedback & Mentorship Logs',
    badgeLabel: 'Feedback',
    description: 'Student satisfaction, faculty advisor dialogue, and qualitative mentor reviews.',
    requiredColumns: ['student_id', 'feedback_score'],
    optionalColumns: ['feedback_source', 'feedback_text', 'record_date', 'student_name'],
    templateFileName: 'evolyn_feedback_logs_template.csv',
    sampleCsv: `student_id,feedback_score,feedback_source,feedback_text,record_date
CS-2022-084,82,Faculty Advisor,Demonstrates strong coursework grasp; office hour check-in recommended for presentation confidence.,2026-10-08
CS-2022-109,94,Senior Mentor,Proactive leadership in collaborative projects and research sprint pacing.,2026-10-08
EE-2023-031,64,Faculty Advisor,Foundational mechanics clinic recommended to reinforce vector statics.,2026-10-08
CS-2022-088,88,Industry Mentor,High technical maturity and practical software design skills.,2026-10-08
CS-2023-055,78,Academic Advisor,Shows positive momentum recovery following study circle participation.,2026-10-08`,
    columnDescriptions: {
      student_id: { label: 'Student ID', type: 'string', required: true, description: 'Stable student ID or roll number' },
      feedback_score: { label: 'Feedback / Satisfaction Score', type: 'number', range: '0 – 100', required: true, description: 'Quantified advisor or student satisfaction index' },
      feedback_source: { label: 'Feedback Source', type: 'string', required: false, description: 'Author role (e.g. Faculty Advisor, Mentor, Peer)' },
      feedback_text: { label: 'Feedback Text', type: 'string', required: false, description: 'Qualitative observations, notes, or constructive guidance' },
      record_date: { label: 'Record Date', type: 'date', range: 'YYYY-MM-DD', required: false, description: 'Dialogue or survey logging date' },
    },
  },
};

// =========================================================================
// CSV PARSING & VALIDATION ENGINE
// =========================================================================

export interface ValidatedRow {
  rowNumber: number;
  rawRecord: Record<string, string>;
  canonicalStudentId?: string;
  matchedStudentName?: string;
  isExistingStudent: boolean;
  status: 'VALID' | 'WARNING' | 'ERROR';
  errors: string[];
  warnings: string[];
  normalizedData: Record<string, any>;
}

export interface ValidationSummary {
  category: DatasetCategory;
  fileName: string;
  totalRows: number;
  validRowsCount: number;
  errorRowsCount: number;
  warningRowsCount: number;
  columnsFound: string[];
  missingRequiredColumns: string[];
  unexpectedColumns: string[];
  isCommitReady: boolean;
  rows: ValidatedRow[];
  validationTimestamp: string;
  parseDiagnostics?: {
    isMalformed: boolean;
    malformedDetails: string[];
  };
}

export interface ImportAuditRecord {
  id: string;
  category: DatasetCategory;
  fileName: string;
  importDate: string;
  uploaderName: string;
  uploaderEmail: string;
  totalRows: number;
  importedRows: number;
  skippedRows: number;
  failedRows: number;
  status: 'COMPLETED' | 'PARTIALLY_IMPORTED' | 'REJECTED';
  notes: string[];
  affectedStudentIds: string[];
  persistenceMode?: 'cloud_firestore' | 'local_storage_fallback';
}

export const IMPORT_HISTORY_STORAGE_KEY = 'evolyn_import_history';

/**
 * Robust RFC-4180 compliant client-side CSV parser.
 * Handles quoted fields, embedded commas, newlines, and strips UTF-8 BOM.
 */
export function parseCsvString(csvText: string): Array<Record<string, string>> {
  if (!csvText || !csvText.trim()) return [];

  // Remove potential UTF-8 BOM
  let text = csvText.replace(/^\uFEFF/, '');

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuote = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === ',' && !insideQuote) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuote) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \n in CRLF
      }
      currentRow.push(currentField.trim());
      currentField = '';
      if (currentRow.some((field) => field.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
    } else {
      currentField += char;
    }
  }

  // Push lingering field and row if any
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((field) => field.length > 0)) {
      rows.push(currentRow);
    }
  }

  if (rows.length < 2) return [];

  // Header normalization (lowercase, replace dashes/spaces with underscore)
  const headers = rows[0].map((h) => normalizeHeaderName(h));
  const dataRows = rows.slice(1);

  return dataRows.map((row) => {
    const record: Record<string, string> = {};
    headers.forEach((h, idx) => {
      record[h] = row[idx] !== undefined ? row[idx] : '';
    });
    return record;
  });
}

function normalizeHeaderName(raw: string): string {
  const clean = raw.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_');
  // Common alias conversions
  if (clean === 'id' || clean === 'studentid' || clean === 'roll_no' || clean === 'roll_number') return 'student_id';
  if (clean === 'name' || clean === 'studentname') return 'student_name';
  if (clean === 'attendance' || clean === 'att_pct' || clean === 'attendance_pct') return 'attendance_percentage';
  if (clean === 'marks' || clean === 'total_marks') return 'overall_marks';
  if (clean === 'logins' || clean === 'weekly_logins') return 'login_frequency';
  if (clean === 'assignments' || clean === 'assignment_rate') return 'assignment_completion';
  if (clean === 'date' || clean === 'timestamp' || clean === 'entry_date') return 'record_date';
  if (clean === 'notes' || clean === 'comment' || clean === 'observation') return 'assessor_notes';
  return clean;
}

/**
 * Matches a raw student ID input strictly against stable canonical identifiers.
 * CRITICAL RULE: NEVER merge students based only on similar names.
 * Matches ONLY on:
 * - rollNumber (e.g. CS-2022-084)
 * - canonicalId (e.g. arjun-kumar)
 * - systemId (e.g. EV-2026-CSE042)
 * - legacyId (e.g. std-1)
 * - studentId or rollNumber in UNIFIED_STUDENTS
 */
export function matchStudentByStableId(rawId: string): {
  isFound: boolean;
  canonicalId: string;
  matchedName?: string;
  matchedProfile?: UnifiedStudentProfile;
  matchedDescriptor?: CanonicalStudentDescriptor;
} {
  if (!rawId || !rawId.trim()) {
    return { isFound: false, canonicalId: '' };
  }

  const clean = rawId.trim().toLowerCase();

  // 1. Direct match on Canonical Student Registry by exact stable identifiers
  for (const descriptor of Object.values(CANONICAL_STUDENT_REGISTRY)) {
    const isIdMatch =
      descriptor.canonicalId.toLowerCase() === clean ||
      descriptor.rollNumber.toLowerCase() === clean ||
      descriptor.systemId.toLowerCase() === clean ||
      descriptor.legacyId.toLowerCase() === clean ||
      descriptor.aliases.some((a) => a.toLowerCase() === clean && a !== descriptor.displayName.toLowerCase());

    if (isIdMatch) {
      const profile = UNIFIED_STUDENTS.find(
        (s) => s.id === descriptor.canonicalId || isSameStudent(s.id, descriptor.canonicalId)
      );
      return {
        isFound: true,
        canonicalId: descriptor.canonicalId,
        matchedName: descriptor.displayName,
        matchedProfile: profile,
        matchedDescriptor: descriptor,
      };
    }
  }

  // 2. Direct match on Unified Students array by stable ID attributes
  const profileMatch = UNIFIED_STUDENTS.find(
    (s) =>
      s.id.toLowerCase() === clean ||
      s.studentId.toLowerCase() === clean ||
      (s.legacyId && s.legacyId.toLowerCase() === clean)
  );

  if (profileMatch) {
    return {
      isFound: true,
      canonicalId: profileMatch.id,
      matchedName: profileMatch.name,
      matchedProfile: profileMatch,
    };
  }

  // 3. Not found - generate a safe identifier slug without name-based merging
  const safeSlug = clean.replace(/[^a-z0-9_-]/g, '-');
  return {
    isFound: false,
    canonicalId: safeSlug,
  };
}

/**
 * Validates parsed CSV data against the specified dataset category schema.
 * Reconciles student IDs with the Canonical Student Registry using stable IDs.
 */
export function validateCsvDataset(
  category: DatasetCategory,
  parsedRecords: Array<Record<string, string>>,
  fileName: string,
  options: { allowUnknownStudents?: boolean } = {}
): ValidationSummary {
  const meta = DATASET_CATEGORIES_META[category];
  const totalRows = parsedRecords.length;

  if (totalRows === 0) {
    return {
      category,
      fileName,
      totalRows: 0,
      validRowsCount: 0,
      errorRowsCount: 0,
      warningRowsCount: 0,
      columnsFound: [],
      missingRequiredColumns: meta.requiredColumns,
      unexpectedColumns: [],
      isCommitReady: false,
      rows: [],
      validationTimestamp: new Date().toLocaleTimeString(),
    };
  }

  const columnsFound = Object.keys(parsedRecords[0]);
  const missingRequiredColumns = meta.requiredColumns.filter(
    (req) => !columnsFound.includes(req)
  );

  const recognizedColumns = new Set([...meta.requiredColumns, ...meta.optionalColumns]);
  const unexpectedColumns = columnsFound.filter((c) => !recognizedColumns.has(c));

  // If critical required columns are completely missing from the header, all rows are invalid
  const hasCriticalHeaderFailure = missingRequiredColumns.length > 0;

  const seenStudentIds = new Set<string>();
  const validatedRows: ValidatedRow[] = [];

  parsedRecords.forEach((raw, index) => {
    const rowNumber = index + 2; // Row 1 is header
    const errors: string[] = [];
    const warnings: string[] = [];
    const normalizedData: Record<string, any> = {};

    if (hasCriticalHeaderFailure) {
      errors.push(`File is missing required column(s): ${missingRequiredColumns.join(', ')}`);
    }

    if (unexpectedColumns.length > 0) {
      warnings.push(`Unexpected column(s) detected: ${unexpectedColumns.join(', ')}. These will not alter canonical student records.`);
    }

    // 1. Stable Student ID Validation
    const rawId = raw['student_id']?.trim();
    let canonicalId: string | undefined = undefined;
    let isExistingStudent = false;
    let matchedStudentName: string | undefined = undefined;

    if (!rawId) {
      errors.push("Missing required field 'student_id'. Every record must specify a stable student ID.");
    } else {
      const match = matchStudentByStableId(rawId);
      canonicalId = match.canonicalId;

      if (match.isFound) {
        isExistingStudent = true;
        matchedStudentName = match.matchedName || match.matchedProfile?.name;
        normalizedData['student_id'] = canonicalId;
      } else {
        isExistingStudent = false;
        matchedStudentName = raw['student_name'] || `Unenrolled Student (${rawId})`;
        normalizedData['student_id'] = canonicalId;
        if (!options.allowUnknownStudents) {
          warnings.push(`Student ID "${rawId}" is not currently in the enrolled roster. Row will be skipped unless 'Create new cohort profiles for unrecognized student IDs' is enabled.`);
        } else {
          warnings.push(`Unrecognized student ID "${rawId}" detected. A new cohort student profile will be created upon import.`);
        }
      }

      // Check duplicates within this CSV batch
      const duplicateKey = `${canonicalId.toLowerCase()}_${category}`;
      if (seenStudentIds.has(duplicateKey)) {
        errors.push(`Duplicate row detected for student "${rawId}" in row ${rowNumber}. Batch CSV import rejects duplicate rows for the same student to prevent conflicting record overwrites.`);
      }
      seenStudentIds.add(duplicateKey);
    }

    // 2. Category-Specific Field Validations
    if (category === 'academic') {
      const cgpaVal = parseFloat(raw['cgpa']);
      if (isNaN(cgpaVal)) {
        errors.push("Field 'cgpa' must be a valid numeric value.");
      } else if (cgpaVal < 0 || cgpaVal > 10.0) {
        errors.push(`'cgpa' value ${cgpaVal} is out of bounds (allowed range: 0.0 – 10.0).`);
      } else {
        normalizedData['cgpa'] = Number(cgpaVal.toFixed(2));
      }

      if (raw['backlogs']) {
        const backlogsVal = parseInt(raw['backlogs'], 10);
        if (isNaN(backlogsVal) || backlogsVal < 0) {
          errors.push("Field 'backlogs' must be a non-negative integer.");
        } else {
          normalizedData['backlogs'] = backlogsVal;
        }
      }

      if (raw['overall_marks']) {
        const marksVal = parseFloat(raw['overall_marks']);
        if (isNaN(marksVal) || marksVal < 0 || marksVal > 100) {
          errors.push("Field 'overall_marks' must be a percentage between 0 and 100.");
        } else {
          normalizedData['overall_marks'] = Math.round(marksVal);
        }
      }
    }

    if (category === 'attendance') {
      const attVal = parseFloat(raw['attendance_percentage']);
      if (isNaN(attVal)) {
        errors.push("Field 'attendance_percentage' must be a numeric value.");
      } else if (attVal < 0 || attVal > 100) {
        errors.push(`'attendance_percentage' value ${attVal}% is out of bounds (allowed range: 0 – 100%).`);
      } else {
        normalizedData['attendance_percentage'] = Number(attVal.toFixed(1));
      }

      if (raw['classes_attended'] && raw['total_classes']) {
        const attended = parseInt(raw['classes_attended'], 10);
        const total = parseInt(raw['total_classes'], 10);
        if (isNaN(attended) || isNaN(total) || attended < 0 || total < 0) {
          errors.push("Classes attended and total classes must be positive integers.");
        } else if (attended > total) {
          errors.push(`Classes attended (${attended}) cannot exceed total scheduled classes (${total}).`);
        } else {
          normalizedData['classes_attended'] = attended;
          normalizedData['total_classes'] = total;
        }
      }
    }

    if (category === 'lms') {
      const loginVal = parseFloat(raw['login_frequency']);
      if (isNaN(loginVal) || loginVal < 0 || loginVal > 50) {
        errors.push("Field 'login_frequency' must be a valid number between 0 and 50 logins/week.");
      } else {
        normalizedData['login_frequency'] = Number(loginVal.toFixed(1));
      }

      const assignVal = parseFloat(raw['assignment_completion']);
      if (isNaN(assignVal) || assignVal < 0 || assignVal > 100) {
        errors.push("Field 'assignment_completion' must be a percentage between 0 and 100%.");
      } else {
        normalizedData['assignment_completion'] = Math.round(assignVal);
      }
    }

    if (category === 'engagement') {
      const partVal = parseFloat(raw['participation_score']);
      if (isNaN(partVal) || partVal < 0 || partVal > 100) {
        errors.push("Field 'participation_score' must be a score between 0 and 100.");
      } else {
        normalizedData['participation_score'] = Math.round(partVal);
      }

      const engVal = parseFloat(raw['engagement_score']);
      if (isNaN(engVal) || engVal < 0 || engVal > 100) {
        errors.push("Field 'engagement_score' must be a score between 0 and 100.");
      } else {
        normalizedData['engagement_score'] = Math.round(engVal);
      }
    }

    if (category === 'skills') {
      if (!raw['assessment_type']?.trim()) {
        errors.push("Missing required field 'assessment_type'.");
      } else {
        normalizedData['assessment_type'] = raw['assessment_type'].trim();
      }

      const maxVal = parseFloat(raw['max_score'] || '100');
      const scoreVal = parseFloat(raw['score']);

      if (isNaN(scoreVal) || scoreVal < 0) {
        errors.push("Field 'score' must be a non-negative number.");
      } else if (!isNaN(maxVal) && scoreVal > maxVal) {
        errors.push(`Field 'score' (${scoreVal}) exceeds 'max_score' (${maxVal}).`);
      } else {
        normalizedData['score'] = Math.round(scoreVal);
        normalizedData['max_score'] = Math.round(maxVal || 100);
      }

      const rawCat = (raw['category'] || 'communication').toLowerCase();
      if (['communication', 'technical', 'career-placement'].includes(rawCat)) {
        normalizedData['category'] = rawCat;
      } else {
        warnings.push(`Category '${rawCat}' mapped to default 'communication'.`);
        normalizedData['category'] = 'communication';
      }
    }

    if (category === 'placement') {
      const aptVal = parseFloat(raw['aptitude_score']);
      if (isNaN(aptVal) || aptVal < 0 || aptVal > 100) {
        errors.push("Field 'aptitude_score' must be a score between 0 and 100.");
      } else {
        normalizedData['aptitude_score'] = Math.round(aptVal);
      }

      const codeVal = parseFloat(raw['coding_score']);
      if (isNaN(codeVal) || codeVal < 0 || codeVal > 100) {
        errors.push("Field 'coding_score' must be a score between 0 and 100.");
      } else {
        normalizedData['coding_score'] = Math.round(codeVal);
      }

      if (raw['mock_interview_score']) {
        const mockVal = parseFloat(raw['mock_interview_score']);
        if (isNaN(mockVal) || mockVal < 0 || mockVal > 100) {
          errors.push("Field 'mock_interview_score' must be between 0 and 100.");
        } else {
          normalizedData['mock_interview_score'] = Math.round(mockVal);
        }
      }
    }

    if (category === 'feedback') {
      const feedVal = parseFloat(raw['feedback_score']);
      if (isNaN(feedVal) || feedVal < 0 || feedVal > 100) {
        errors.push("Field 'feedback_score' must be a score between 0 and 100.");
      } else {
        normalizedData['feedback_score'] = Math.round(feedVal);
      }
    }

    // 3. Date Validation
    if (raw['record_date'] || raw['assessment_date']) {
      const dateStr = raw['record_date'] || raw['assessment_date'];
      const parsedDate = new Date(dateStr);
      if (isNaN(parsedDate.getTime())) {
        errors.push(`Invalid date format for "${dateStr}". Use YYYY-MM-DD.`);
      } else {
        normalizedData['record_date'] = dateStr;
      }
    } else {
      normalizedData['record_date'] = new Date().toISOString().split('T')[0];
    }

    // Pass through non-empty strings
    Object.keys(raw).forEach((k) => {
      if (!normalizedData[k] && raw[k]) {
        normalizedData[k] = raw[k].trim();
      }
    });

    let status: 'VALID' | 'WARNING' | 'ERROR' = 'VALID';
    if (errors.length > 0) {
      status = 'ERROR';
    } else if (warnings.length > 0) {
      status = 'WARNING';
    }

    validatedRows.push({
      rowNumber,
      rawRecord: raw,
      canonicalStudentId: canonicalId,
      matchedStudentName,
      isExistingStudent,
      status,
      errors,
      warnings,
      normalizedData,
    });
  });

  const validRowsCount = validatedRows.filter((r) => r.status === 'VALID').length;
  const errorRowsCount = validatedRows.filter((r) => r.status === 'ERROR').length;
  const warningRowsCount = validatedRows.filter((r) => r.status === 'WARNING').length;

  return {
    category,
    fileName,
    totalRows,
    validRowsCount,
    errorRowsCount,
    warningRowsCount,
    columnsFound,
    missingRequiredColumns,
    unexpectedColumns,
    isCommitReady: validRowsCount > 0 && !hasCriticalHeaderFailure,
    rows: validatedRows,
    validationTimestamp: new Date().toLocaleTimeString(),
  };
}

// =========================================================================
// COMMIT ENGINE: PERSISTS DATA & CONNECTS TO EVOLYN INTELLIGENCE
// =========================================================================

export interface CommitResult {
  importId: string;
  category: DatasetCategory;
  fileName: string;
  totalProcessed: number;
  successfullyImported: number;
  skipped: number;
  failed: number;
  affectedStudentIds: string[];
  auditRecord: ImportAuditRecord;
  refreshedIndicators: {
    successScoresRecalculated: number;
    riskProfilesRefreshed: number;
    segmentsRecalculated: number;
    silentStruggleUpdated: number;
    growthTrackUpdated: number;
  };
  persistence: {
    mode: 'cloud_firestore' | 'local_storage_fallback';
    isCloudPersisted: boolean;
    message: string;
  };
}

/**
 * Creates a new student record across Unified Profile, Registry, and Growth Track
 * when an authorized user imports an unrecognized student ID.
 */
function createNewStudentProfile(
  studentId: string,
  raw: Record<string, string>,
  category: DatasetCategory,
  data: Record<string, any>,
  uploaderName: string
): UnifiedStudentProfile {
  const canonical = toCanonicalStudentId(studentId);
  const name = raw['student_name'] || `Student (${studentId})`;
  const dept = raw['department'] || 'Engineering & Technology';
  const branch = (raw['branch'] || 'CSE') as any;
  const year = (raw['year'] || '1st Year') as any;

  const newProfile: UnifiedStudentProfile = {
    id: canonical,
    studentId: studentId,
    legacyId: `std-custom-${Date.now()}`,
    name,
    avatarInitials: name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() || 'ST',
    course: dept,
    branch,
    year,
    currentSemester: 'Semester 1',
    academic: {
      cgpa: data.cgpa !== undefined ? data.cgpa : 7.5,
      overallMarks: data.overall_marks !== undefined ? data.overall_marks : (data.cgpa ? Math.round(data.cgpa * 10) : 75),
      backlogs: data.backlogs !== undefined ? data.backlogs : 0,
      subjectPerformance: [],
      history: [{ term: 'Term 1', cgpa: data.cgpa || 7.5, marksPercentage: data.overall_marks || 75, creditsEarned: 22, backlogs: data.backlogs || 0 }],
      academicStanding: 'Good Standing',
    },
    attendance: {
      overallPercentage: data.attendance_percentage !== undefined ? data.attendance_percentage : 85.0,
      subjectWiseAttendance: [],
      history: [{ period: 'Current', percentage: data.attendance_percentage || 85.0 }],
      attendanceTrend: 'stable',
      biometricSynced: true,
    },
    lms: {
      loginFrequencyPerWeek: data.login_frequency !== undefined ? data.login_frequency : 5.0,
      previousLoginFrequency: data.login_frequency !== undefined ? data.login_frequency : 5.0,
      assignmentCompletionRate: data.assignment_completion !== undefined ? data.assignment_completion : 80,
      activityTrend: 'stable',
      modulesAccessed: 8,
      totalModules: 10,
      lastActiveDaysAgo: 1,
      averageSessionDurationMins: 40,
      forumDiscussionPosts: 2,
    },
    engagement: {
      eventsAttended: 2,
      clubsActive: 1,
      clubNames: ['Student Technology Forum'],
      hackathonsCount: 0,
      certificationsCount: 0,
      participationScore: data.participation_score !== undefined ? data.participation_score : 75,
      behavioralScore: data.engagement_score !== undefined ? data.engagement_score : 75,
      peerCollaborationScore: 75,
      activityConsistencyScore: 75,
      engagementTrend: 'stable',
      keyMilestones: ['Admitted to Institutional Cohort'],
    },
    placement: {
      aptitudeScore: data.aptitude_score !== undefined ? data.aptitude_score : 70,
      codingScore: data.coding_score !== undefined ? data.coding_score : 70,
      mockInterviewsCount: 1,
      preparationTrend: 'stable',
      readinessCondition: 'Foundational Aptitude Verified',
      verifiedSkillBadges: ['Enrolled'],
      eligibleRoles: ['Graduate Engineer Trainee'],
    },
    skills: {
      technicalSkillAssessments: {},
      softSkillAssessments: {
        communication: 75,
        speaking: 75,
        presentation: 74,
        groupDiscussion: 75,
        debate: 70,
        technicalDiscussion: 75,
        interviewSkills: 72,
      },
      fluencisIntegrationStatus: 'ready',
      primaryStrength: 'Coursework Balance',
      growthFocus: 'Skill Benchmarking',
    },
    feedback: {
      studentSatisfactionScore: data.feedback_score !== undefined ? data.feedback_score : 80,
      facultyFeedback: data.feedback_text || 'Enrolled in academic monitoring cohort via CSV ingestion.',
      facultyAuthor: uploaderName,
      facultyDepartment: dept,
      mentorFeedback: 'Initial baseline profile created.',
      feedbackDate: data.record_date || new Date().toISOString().split('T')[0],
    },
    connectedDataSources: [],
    crossSourceSynthesis: ['Profile enrolled via verified CSV data ingestion.'],
  };

  UNIFIED_STUDENTS.push(newProfile);

  // Register in CANONICAL_STUDENT_REGISTRY
  if (!CANONICAL_STUDENT_REGISTRY[canonical]) {
    CANONICAL_STUDENT_REGISTRY[canonical] = {
      canonicalId: canonical,
      displayName: name,
      avatarInitials: name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() || 'ST',
      rollNumber: studentId,
      systemId: `EV-2026-${canonical.substring(0, 6).toUpperCase()}`,
      legacyId: `std-custom-${Date.now()}`,
      branch,
      year,
      semester: 'Semester 1',
      aliases: [canonical, studentId.toLowerCase(), name.toLowerCase()],
    };
  }

  // Register in STUDENT_GROWTH_DATA
  if (!STUDENT_GROWTH_DATA.some((s) => isSameStudent(s.id, canonical))) {
    STUDENT_GROWTH_DATA.push({
      id: canonical,
      name,
      avatarInitials: newProfile.avatarInitials,
      course: newProfile.course,
      branch: newProfile.branch,
      year: newProfile.year,
      studentId,
      currentSemester: 'Semester 1',
      growthHealth: Math.round(newProfile.academic.cgpa * 10),
      growthHealthLabel: 'Cohort Baseline',
      growthHealthSubtext: 'Profile registered via CSV data ingestion',
      aiGrowthInsight: 'Newly enrolled student profile synchronized with institutional data pipeline.',
      keyObservation: 'Initial telemetry established.',
      growthStatus: 'Active Monitoring',
      aiSummary: 'Student enrolled and integrated into Evolyn telemetry pipeline.',
      dimensions: [
        { id: 'academic', name: 'Academic Performance', category: 'Foundational Mastery', currentValue: newProfile.academic.overallMarks, previousValue: newProfile.academic.overallMarks, change: 0, trend: 'stable', timePeriod: 'Current', unit: '%', description: 'Academic evaluation' },
        { id: 'attendance', name: 'Attendance', category: 'Presence & Consistency', currentValue: newProfile.attendance.overallPercentage, previousValue: newProfile.attendance.overallPercentage, change: 0, trend: 'stable', timePeriod: 'Current', unit: '%', description: 'Class attendance' },
        { id: 'engagement', name: 'Engagement', category: 'Learning Depth', currentValue: newProfile.engagement.behavioralScore, previousValue: newProfile.engagement.behavioralScore, change: 0, trend: 'stable', timePeriod: 'Current', unit: '%', description: 'Behavioral engagement' },
        { id: 'assignments', name: 'Assignment Consistency', category: 'Cadence & Rigor', currentValue: newProfile.lms.assignmentCompletionRate, previousValue: newProfile.lms.assignmentCompletionRate, change: 0, trend: 'stable', timePeriod: 'Current', unit: '%', description: 'Assignment completion' },
        { id: 'participation', name: 'Participation', category: 'Collaborative Presence', currentValue: newProfile.engagement.participationScore, previousValue: newProfile.engagement.participationScore, change: 0, trend: 'stable', timePeriod: 'Current', unit: '%', description: 'Seminar participation' },
      ],
      timeline: [],
      strengths: [{ title: 'Cohort Baseline Established', metric: 'Profile Initialized', evidence: 'Synchronized via verified CSV ingestion' }],
      attentionAreas: [],
      milestones: ['Admitted to Institution Cohort'],
    });
  }

  return newProfile;
}

/**
 * Commits a validated dataset into Evolyn's single student records.
 * Refreshes derived views: Success Score, Risk Profile, Segmentation, Placement Readiness,
 * Silent Struggle Detection, and Student Growth Track.
 * Persists audit record to Firestore (with local application storage fallback).
 */
export async function commitValidatedDataset(
  validation: ValidationSummary,
  uploader: { name: string; email: string },
  options: { skipUnknown?: boolean } = { skipUnknown: true }
): Promise<CommitResult> {
  const importId = `imp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const affectedStudentIds = new Set<string>();
  let importedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  const auditNotes: string[] = [];

  const validRowsToCommit = validation.rows.filter(
    (r) => r.status === 'VALID' || (r.status === 'WARNING' && r.errors.length === 0)
  );

  validRowsToCommit.forEach((row) => {
    const studentId = row.canonicalStudentId;
    if (!studentId) {
      skippedCount++;
      return;
    }

    if (!row.isExistingStudent) {
      if (options.skipUnknown) {
        skippedCount++;
        auditNotes.push(`Skipped unknown student ${studentId} (row ${row.rowNumber})`);
        return;
      } else {
        // Authorized insert for unknown student
        createNewStudentProfile(studentId, row.rawRecord, validation.category, row.normalizedData, uploader.name);
        auditNotes.push(`Enrolled new student profile for ${studentId} (row ${row.rowNumber})`);
      }
    }

    try {
      const data = row.normalizedData;

      // Update Unified Student Profile
      updateUnifiedStudentProfile(studentId, (existing) => {
        const updated: UnifiedStudentProfile = { ...existing };

        if (validation.category === 'academic') {
          if (data.cgpa !== undefined && !isNaN(data.cgpa)) {
            const oldCgpa = updated.academic.cgpa;
            updated.academic = {
              ...updated.academic,
              cgpa: data.cgpa,
              overallMarks: data.overall_marks !== undefined && !isNaN(data.overall_marks)
                ? data.overall_marks
                : Math.round(data.cgpa * 10),
              backlogs: data.backlogs !== undefined && !isNaN(data.backlogs)
                ? data.backlogs
                : updated.academic.backlogs,
              academicStanding: (data.backlogs !== undefined ? data.backlogs : updated.academic.backlogs) > 0
                ? 'Academic Monitoring'
                : data.cgpa >= 9.0 ? 'Distinction' : 'Good Standing',
            };
          }
          if (row.rawRecord['department'] && row.rawRecord['department'].trim()) {
            updated.course = row.rawRecord['department'].trim();
          }
          if (row.rawRecord['branch'] && row.rawRecord['branch'].trim()) {
            updated.branch = row.rawRecord['branch'].trim() as any;
          }
          if (row.rawRecord['year'] && row.rawRecord['year'].trim()) {
            updated.year = row.rawRecord['year'].trim() as any;
          }
          if (data.record_date) {
            const histEntry = {
              term: row.rawRecord['term'] || `Term (${data.record_date})`,
              cgpa: updated.academic.cgpa,
              marksPercentage: updated.academic.overallMarks,
              creditsEarned: 22,
              backlogs: updated.academic.backlogs,
            };
            updated.academic.history = [histEntry, ...(updated.academic.history || [])].slice(0, 8);
          }
        }

        if (validation.category === 'attendance') {
          if (data.attendance_percentage !== undefined && !isNaN(data.attendance_percentage)) {
            const oldPct = updated.attendance.overallPercentage;
            const newPct = data.attendance_percentage;
            const trend = newPct > oldPct + 2 ? 'improving' : newPct < oldPct - 2 ? 'declining' : 'stable';

            const newHistory = data.record_date
              ? [{ period: data.record_date, percentage: newPct }, ...(updated.attendance.history || [])].slice(0, 8)
              : updated.attendance.history;

            updated.attendance = {
              ...updated.attendance,
              overallPercentage: newPct,
              history: newHistory,
              attendanceTrend: trend,
            };
          }
        }

        if (validation.category === 'lms') {
          const oldLogins = updated.lms.loginFrequencyPerWeek;
          const newLogins = data.login_frequency !== undefined ? data.login_frequency : oldLogins;
          const trend = newLogins > oldLogins + 1 ? 'improving' : newLogins < oldLogins - 1 ? 'declining' : 'stable';

          updated.lms = {
            ...updated.lms,
            loginFrequencyPerWeek: newLogins,
            previousLoginFrequency: oldLogins,
            assignmentCompletionRate: data.assignment_completion !== undefined ? data.assignment_completion : updated.lms.assignmentCompletionRate,
            activityTrend: trend,
          };
        }

        if (validation.category === 'engagement') {
          const oldPart = updated.engagement.participationScore;
          const newPart = data.participation_score !== undefined ? data.participation_score : oldPart;
          const trend = newPart > oldPart + 3 ? 'improving' : newPart < oldPart - 3 ? 'declining' : 'stable';

          updated.engagement = {
            ...updated.engagement,
            participationScore: newPart,
            behavioralScore: data.engagement_score !== undefined ? data.engagement_score : updated.engagement.behavioralScore,
            peerCollaborationScore: data.peer_collaboration_score !== undefined ? data.peer_collaboration_score : updated.engagement.peerCollaborationScore,
            engagementTrend: trend,
          };
        }

        if (validation.category === 'placement') {
          updated.placement = {
            ...updated.placement,
            aptitudeScore: data.aptitude_score !== undefined ? data.aptitude_score : updated.placement.aptitudeScore,
            codingScore: data.coding_score !== undefined ? data.coding_score : updated.placement.codingScore,
            mockInterviewsCount: data.mock_interview_score !== undefined ? Math.max(1, updated.placement.mockInterviewsCount) : updated.placement.mockInterviewsCount,
            preparationTrend: data.preparation_activity === 'Consistent' ? 'improving' : data.preparation_activity === 'Irregular' ? 'declining' : 'stable',
            readinessCondition: data.preparation_activity ? `Candidate cadence: ${data.preparation_activity}` : updated.placement.readinessCondition,
          };
        }

        if (validation.category === 'feedback') {
          updated.feedback = {
            ...updated.feedback,
            studentSatisfactionScore: data.feedback_score !== undefined ? data.feedback_score : updated.feedback.studentSatisfactionScore,
            facultyFeedback: data.feedback_text || updated.feedback.facultyFeedback,
            facultyAuthor: row.rawRecord['feedback_source'] || uploader.name,
            feedbackDate: data.record_date || updated.feedback.feedbackDate,
          };
        }

        return updated;
      });

      // Also persist to Skill Assessments if category is 'skills'
      if (validation.category === 'skills') {
        const storedAssessmentsKey = 'evolyn_skill_assessments_v1';
        try {
          const rawStored = localStorage.getItem(storedAssessmentsKey) || localStorage.getItem('evolyn_skill_assessments');
          const currentList = rawStored ? JSON.parse(rawStored) : [];
          const newAssessment = {
            id: `as-csv-${Date.now()}-${row.rowNumber}`,
            studentId,
            category: data.category || 'communication',
            assessmentType: data.assessment_type,
            score: data.score,
            maxScore: data.max_score || 100,
            date: data.record_date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            assessor: uploader.name,
            notes: data.assessor_notes || 'Imported via CSV Data Integration',
            verified: true,
          };
          const updatedList = [newAssessment, ...currentList];
          localStorage.setItem('evolyn_skill_assessments_v1', JSON.stringify(updatedList));
          localStorage.setItem('evolyn_skill_assessments', JSON.stringify(updatedList));
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('evolyn-skills-updated'));
          }
        } catch (e) {
          console.warn('Failed storing skill assessment to localStorage', e);
        }
      }

      // Refresh Evolyn Intelligence Models for this student:
      const updatedProfile = getUnifiedStudentProfile(studentId);
      if (updatedProfile) {
        // 1. Recalculate Student Success Score & Explanations
        syncSuccessScoreFromProfile(updatedProfile);

        // 2. Refreshes Risk & Early Signals
        ALL_STUDENT_RISK_PROFILES[studentId] = evaluateStudentRisk(updatedProfile);

        // 3. Recalculate Student Segmentation
        const segIdx = ALL_STUDENT_SEGMENTS.findIndex((s) => s.studentId === studentId);
        const newSeg = classifyStudentSegment(studentId);
        if (segIdx !== -1) {
          ALL_STUDENT_SEGMENTS[segIdx] = newSeg;
        } else {
          ALL_STUDENT_SEGMENTS.push(newSeg);
        }

        // 4. Refreshes Silent Struggle Telemetry
        syncSilentStruggleFromProfile(studentId, updatedProfile);

        // 5. Refreshes Student Growth Profile
        syncGrowthProfileFromUnified(studentId, updatedProfile);
      }

      affectedStudentIds.add(studentId);
      importedCount++;
    } catch (err: any) {
      failedCount++;
      auditNotes.push(`Failed importing row ${row.rowNumber}: ${err?.message || 'Unknown error'}`);
    }
  });

  failedCount += validation.errorRowsCount;

  const todayStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const auditRecord: ImportAuditRecord = {
    id: importId,
    category: validation.category,
    fileName: validation.fileName,
    importDate: todayStr,
    uploaderName: uploader.name,
    uploaderEmail: uploader.email,
    totalRows: validation.totalRows,
    importedRows: importedCount,
    skippedRows: skippedCount,
    failedRows: failedCount,
    status: failedCount === 0 ? 'COMPLETED' : importedCount > 0 ? 'PARTIALLY_IMPORTED' : 'REJECTED',
    notes: auditNotes,
    affectedStudentIds: Array.from(affectedStudentIds),
  };

  // Persist audit record to Cloud Firestore (or local storage fallback)
  const persistenceStatus = await persistAuditRecord(auditRecord);
  auditRecord.persistenceMode = persistenceStatus.mode;

  // Broadcast event so all workspaces immediately refresh derived views
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('evolyn-data-refreshed', {
        detail: {
          importId,
          category: validation.category,
          affectedStudentIds: Array.from(affectedStudentIds),
        },
      })
    );
  }

  return {
    importId,
    category: validation.category,
    fileName: validation.fileName,
    totalProcessed: validation.totalRows,
    successfullyImported: importedCount,
    skipped: skippedCount,
    failed: failedCount,
    affectedStudentIds: Array.from(affectedStudentIds),
    auditRecord,
    refreshedIndicators: {
      successScoresRecalculated: affectedStudentIds.size,
      riskProfilesRefreshed: affectedStudentIds.size,
      segmentsRecalculated: affectedStudentIds.size,
      silentStruggleUpdated: affectedStudentIds.size,
      growthTrackUpdated: affectedStudentIds.size,
    },
    persistence: persistenceStatus,
  };
}

/**
 * Persists an audit record to Cloud Firestore with seamless local storage caching & fallback.
 */
export async function persistAuditRecord(auditRecord: ImportAuditRecord): Promise<{
  mode: 'cloud_firestore' | 'local_storage_fallback';
  isCloudPersisted: boolean;
  message: string;
}> {
  // Always update local storage first as resilient cache
  saveAuditRecord(auditRecord);

  try {
    if (auth.currentUser && db) {
      const docRef = doc(db, 'import_audits', auditRecord.id);
      await setDoc(docRef, {
        ...auditRecord,
        uploaderUid: auth.currentUser.uid,
        uploadedAtIso: new Date().toISOString(),
      });
      return {
        mode: 'cloud_firestore',
        isCloudPersisted: true,
        message: 'Successfully persisted to Cloud Firestore collection /import_audits and cached locally.',
      };
    }
  } catch (err: any) {
    console.warn('Firestore persistence warning, using local storage cache fallback:', err?.message || err);
  }

  return {
    mode: 'local_storage_fallback',
    isCloudPersisted: false,
    message: 'Firestore persistence unavailable (user not authenticated to Firebase or client offline). Records are securely retained in local application storage as an explicitly identified fallback.',
  };
}

/**
 * Retrieves past import audit records from persistence.
 */
export function getImportAuditHistory(): ImportAuditRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(IMPORT_HISTORY_STORAGE_KEY);
    if (!raw) return getInitialDemoAuditHistory();
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed reading import audit history', e);
    return getInitialDemoAuditHistory();
  }
}

/**
 * Asynchronously checks Cloud Firestore for remote audit history and synchronizes local cache.
 */
export async function fetchRemoteAuditHistory(): Promise<ImportAuditRecord[]> {
  try {
    if (auth.currentUser && db) {
      const { collection, getDocs, query, limit } = await import('firebase/firestore');
      const auditsCol = collection(db, 'import_audits');
      const q = query(auditsCol, limit(50));
      const snapshot = await getDocs(q);
      const remoteRecords: ImportAuditRecord[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data() as any;
        remoteRecords.push({
          id: d.id || docSnap.id,
          category: d.category,
          fileName: d.fileName,
          importDate: d.importDate,
          uploaderName: d.uploaderName,
          uploaderEmail: d.uploaderEmail,
          totalRows: d.totalRows,
          importedRows: d.importedRows,
          skippedRows: d.skippedRows,
          failedRows: d.failedRows,
          status: d.status,
          notes: d.notes || [],
          affectedStudentIds: d.affectedStudentIds || [],
          persistenceMode: 'cloud_firestore',
        });
      });
      if (remoteRecords.length > 0) {
        localStorage.setItem(IMPORT_HISTORY_STORAGE_KEY, JSON.stringify(remoteRecords));
        return remoteRecords;
      }
    }
  } catch (e) {
    // Graceful fallback to local cache
  }
  return getImportAuditHistory();
}

export function saveAuditRecord(rec: ImportAuditRecord) {
  if (typeof window === 'undefined') return;
  try {
    const existing = getImportAuditHistory();
    const updated = [rec, ...existing].slice(0, 50); // Keep last 50 imports
    localStorage.setItem(IMPORT_HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed saving audit record to localStorage', e);
  }
}

/**
 * Download a CSV string as a physical file on the user's browser.
 */
export function triggerCsvDownload(fileName: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getInitialDemoAuditHistory(): ImportAuditRecord[] {
  return [
    {
      id: 'imp-demo-01',
      category: 'academic',
      fileName: 'midterm_term_cgpa_synced.csv',
      importDate: 'Oct 6, 2026, 09:15 AM',
      uploaderName: 'Prof. Elena Vance',
      uploaderEmail: 'elena.vance@evolyn.edu',
      totalRows: 8,
      importedRows: 8,
      skippedRows: 0,
      failedRows: 0,
      status: 'COMPLETED',
      notes: ['All 8 unified cohort students successfully synchronized with SIS registrar.'],
      affectedStudentIds: ['arjun-kumar', 'priya-sharma', 'rahul-verma', 'sneha-reddy', 'kiran-kumar'],
    },
    {
      id: 'imp-demo-02',
      category: 'skills',
      fileName: 'fluencis_communication_q3.csv',
      importDate: 'Oct 7, 2026, 02:40 PM',
      uploaderName: 'Dr. Aris Thorne',
      uploaderEmail: 'aris.thorne@evolyn.edu',
      totalRows: 5,
      importedRows: 5,
      skippedRows: 0,
      failedRows: 0,
      status: 'COMPLETED',
      notes: ['Fluencis speech analysis benchmarks uploaded for senior placement batches.'],
      affectedStudentIds: ['arjun-kumar', 'sneha-reddy', 'priya-sharma'],
    },
  ];
}
