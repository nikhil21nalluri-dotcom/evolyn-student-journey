/**
 * Canonical Student Identity Registry & Cross-Source Resolution
 * 
 * STEP 10: UNIFIED DATA INTEGRATION & SYSTEM VALIDATION
 * 
 * Architecture Principle:
 * ONE STABLE IDENTIFIER per student across all datasets:
 * - Academic Performance
 * - Attendance Telemetry
 * - LMS Telemetry & Direct Messaging
 * - Student Behavioral Engagement
 * - Skills & Communication (Fluencis) Assessments
 * - Placement Readiness & Career Assessments
 * - Qualitative Feedback & Mentorship Logs
 * - Success Score & Explainable Dimensions
 * - Risk & Early Signal Telemetry
 * - Silent Struggle Compass
 * - Student Segmentation
 * - Growth Track & Multidimensional Force Graph
 * - Intervention Records, Support Plans & Outcome Reviews
 */

export interface CanonicalStudentDescriptor {
  canonicalId: string; // The primary stable key, e.g. 'arjun-kumar'
  displayName: string;
  avatarInitials: string;
  rollNumber: string; // Institutional ID, e.g. 'CS-2022-084'
  systemId: string; // Telemetry ID, e.g. 'EV-2026-CSE042'
  legacyId: string; // 'std-1'
  branch: string;
  year: string;
  semester: string;
  aliases: string[]; // Set of lowercase normalized identifiers matching this exact student
}

export const CANONICAL_STUDENT_REGISTRY: Record<string, CanonicalStudentDescriptor> = {
  'arjun-kumar': {
    canonicalId: 'arjun-kumar',
    displayName: 'Arjun Kumar',
    avatarInitials: 'AK',
    rollNumber: 'CS-2022-084',
    systemId: 'EV-2026-CSE042',
    legacyId: 'std-1',
    branch: 'CSE',
    year: '3rd Year',
    semester: 'Semester 5',
    aliases: [
      'arjun-kumar',
      'arjunkumar',
      'arjun',
      'cs-2022-084',
      'ev-2026-cse042',
      'std-1',
      'st-000',
    ],
  },
  'priya-sharma': {
    canonicalId: 'priya-sharma',
    displayName: 'Priya Sharma',
    avatarInitials: 'PS',
    rollNumber: 'CS-2022-109',
    systemId: 'EV-2025-CSE109',
    legacyId: 'std-2',
    branch: 'CSE',
    year: '2nd Year',
    semester: 'Semester 4',
    aliases: [
      'priya-sharma',
      'priyasharma',
      'priya',
      'cs-2022-109',
      'ev-2025-cse109',
      'ev-2026-ece019',
      'std-2',
      'st-001',
    ],
  },
  'rahul-verma': {
    canonicalId: 'rahul-verma',
    displayName: 'Rahul Verma',
    avatarInitials: 'RV',
    rollNumber: 'EE-2023-031',
    systemId: 'EV-2026-EEE031',
    legacyId: 'std-3',
    branch: 'EEE',
    year: '2nd Year',
    semester: 'Semester 3',
    aliases: [
      'rahul-verma',
      'rahulverma',
      'rahul',
      'ee-2023-031',
      'ev-2026-eee031',
      'std-3',
      'st-006',
    ],
  },
  'sneha-reddy': {
    canonicalId: 'sneha-reddy',
    displayName: 'Sneha Reddy',
    avatarInitials: 'SR',
    rollNumber: 'CS-2022-088',
    systemId: 'EV-2026-CSE088',
    legacyId: 'std-4',
    branch: 'CSE',
    year: '3rd Year',
    semester: 'Semester 6',
    aliases: [
      'sneha-reddy',
      'snehareddy',
      'sneha',
      'cs-2022-088',
      'ev-2026-cse088',
      'std-4',
      'st-007',
    ],
  },
  'kiran-kumar': {
    canonicalId: 'kiran-kumar',
    displayName: 'Kiran Kumar',
    avatarInitials: 'KK',
    rollNumber: 'CS-2023-055',
    systemId: 'EV-2026-CSE055',
    legacyId: 'std-5',
    branch: 'CSE',
    year: '1st Year',
    semester: 'Semester 2',
    aliases: [
      'kiran-kumar',
      'kirankumar',
      'kiran',
      'cs-2023-055',
      'ev-2026-cse055',
      'std-5',
    ],
  },
  'ananya-rao': {
    canonicalId: 'ananya-rao',
    displayName: 'Ananya Rao',
    avatarInitials: 'AR',
    rollNumber: 'AI-2023-014',
    systemId: 'EV-2026-AI014',
    legacyId: 'std-6',
    branch: 'AI/DS',
    year: '2nd Year',
    semester: 'Semester 4',
    aliases: [
      'ananya-rao',
      'ananyarao',
      'ananya',
      'ai-2023-014',
      'ev-2026-ai014',
      'std-6',
    ],
  },
  'vivek-sharma': {
    canonicalId: 'vivek-sharma',
    displayName: 'Vivek Sharma',
    avatarInitials: 'VS',
    rollNumber: 'ME-2022-032',
    systemId: 'EV-2026-MECH032',
    legacyId: 'std-7',
    branch: 'MECH',
    year: '4th Year',
    semester: 'Semester 7',
    aliases: [
      'vivek-sharma',
      'viveksharma',
      'vivek',
      'me-2022-032',
      'ev-2026-mech032',
      'std-7',
    ],
  },
  'meera-reddy': {
    canonicalId: 'meera-reddy',
    displayName: 'Meera Reddy',
    avatarInitials: 'MR',
    rollNumber: 'EE-2022-077',
    systemId: 'EV-2026-EEE077',
    legacyId: 'std-8',
    branch: 'EEE',
    year: '4th Year',
    semester: 'Semester 8',
    aliases: [
      'meera-reddy',
      'meerareddy',
      'meera',
      'ee-2022-077',
      'ev-2026-eee077',
      'std-8',
    ],
  },
  // Supporting cohort records from LMS / Advisory
  'marcus-vance': {
    canonicalId: 'marcus-vance',
    displayName: 'Marcus Vance',
    avatarInitials: 'MV',
    rollNumber: 'CS-2023-091',
    systemId: 'EV-2026-CSE091',
    legacyId: 'std-mv',
    branch: 'CSE',
    year: '2nd Year',
    semester: 'Semester 3',
    aliases: ['marcus-vance', 'marcusvance', 'marcus', 'st-002', 'ev-2026-cse091'],
  },
  'sofia-chen': {
    canonicalId: 'sofia-chen',
    displayName: 'Sofia Chen',
    avatarInitials: 'SC',
    rollNumber: 'DS-2022-033',
    systemId: 'EV-2026-DS033',
    legacyId: 'std-sc',
    branch: 'AI/DS',
    year: '3rd Year',
    semester: 'Semester 5',
    aliases: ['sofia-chen', 'sofiachen', 'sofia', 'st-003', 'ev-2026-ds033'],
  },
  'devon-price': {
    canonicalId: 'devon-price',
    displayName: 'Devon Price',
    avatarInitials: 'DP',
    rollNumber: 'AI-2024-012',
    systemId: 'EV-2026-AIML012',
    legacyId: 'std-dp',
    branch: 'AI/DS',
    year: '1st Year',
    semester: 'Semester 1',
    aliases: ['devon-price', 'devonprice', 'devon', 'st-004', 'ev-2026-aiml012'],
  },
  'aaliyah-patel': {
    canonicalId: 'aaliyah-patel',
    displayName: 'Aaliyah Patel',
    avatarInitials: 'AP',
    rollNumber: 'IT-2023-077',
    systemId: 'EV-2026-IT077',
    legacyId: 'std-ap',
    branch: 'CSE',
    year: '2nd Year',
    semester: 'Semester 4',
    aliases: ['aaliyah-patel', 'aaliyahpatel', 'aaliyah', 'aisha-patel', 'aishapatel', 'aisha', 'st-005', 'ev-2026-it077'],
  },
};

/**
 * Normalizes any string into a clean lowercase token
 */
export function normalizeToken(val?: string): string {
  return (val || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

/**
 * Resolves ANY student alias, roll number, or identifier to their Canonical Student ID.
 * Returns 'arjun-kumar' as guaranteed safe default if undefined or unrecognizable.
 */
export function toCanonicalStudentId(input?: string): string {
  if (!input) return 'arjun-kumar';

  const clean = input.trim().toLowerCase();
  const token = normalizeToken(clean);

  // 1. Direct registry key match
  if (CANONICAL_STUDENT_REGISTRY[clean]) {
    return clean;
  }

  // 2. Iterate through all descriptors to check registered aliases & identifiers
  for (const descriptor of Object.values(CANONICAL_STUDENT_REGISTRY)) {
    if (descriptor.canonicalId === clean) return descriptor.canonicalId;
    if (descriptor.legacyId === clean) return descriptor.canonicalId;
    if (descriptor.rollNumber.toLowerCase() === clean) return descriptor.canonicalId;
    if (descriptor.systemId.toLowerCase() === clean) return descriptor.canonicalId;
    if (normalizeToken(descriptor.displayName) === token) return descriptor.canonicalId;

    if (descriptor.aliases.some((a) => a === clean || normalizeToken(a) === token)) {
      return descriptor.canonicalId;
    }
  }

  // 3. Fallback: return the trimmed string if it matches a standard slug format
  return clean;
}

/**
 * Deterministically tests whether two identifiers (which could be roll numbers, legacy IDs, or names)
 * refer to the same student record.
 */
export function isSameStudent(idA?: string, idB?: string): boolean {
  if (!idA || !idB) return false;
  if (idA === idB) return true;

  const canonicalA = toCanonicalStudentId(idA);
  const canonicalB = toCanonicalStudentId(idB);

  return canonicalA === canonicalB;
}

/**
 * Retrieves the canonical descriptor for a student
 */
export function getCanonicalStudent(input?: string): CanonicalStudentDescriptor {
  const canonicalId = toCanonicalStudentId(input);
  return CANONICAL_STUDENT_REGISTRY[canonicalId] || CANONICAL_STUDENT_REGISTRY['arjun-kumar'];
}
