export interface DirectMessageReply {
  id: string;
  sender: 'student' | 'faculty';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface DirectMessage {
  id: string;
  studentId: string;
  studentName: string;
  facultyName: string;
  facultyRole: string;
  timestamp: string;
  subject: string;
  message: string;
  careCategory: 'Academic Support' | 'Wellness Check-in' | 'Placement Mentoring' | 'Project Guidance' | 'Encouragement';
  status: 'sent' | 'delivered' | 'read' | 'replied';
  replies: DirectMessageReply[];
}

export interface LmsAssignment {
  id: string;
  studentId: string; // specific student ID or 'all'
  studentName: string;
  title: string;
  course: string;
  category: 'Personalized Practice' | 'Coursework Assignment' | 'Remedial Concept Module' | 'Placement Mock Prep' | 'Reflective Milestone';
  description: string;
  personalCareNote: string;
  dueDate: string;
  points: number;
  status: 'Assigned' | 'In Progress' | 'Submitted' | 'Reviewed';
  submission?: {
    text: string;
    attachmentName?: string;
    submittedAt: string;
    feedback?: string;
    grade?: string;
  };
}

export const INITIAL_DIRECT_MESSAGES: DirectMessage[] = [
  {
    id: 'dm-0',
    studentId: 'arjun-kumar',
    studentName: 'Arjun Kumar',
    facultyName: 'Prof. Elena Vance',
    facultyRole: 'Faculty Advisor & Associate Professor, CSE',
    timestamp: 'Yesterday at 11:15 AM',
    subject: 'Supportive Check-in: Seminar Presentation & Office Hours',
    message: 'Hi Arjun, I noticed your algorithms quiz score (86%) was terrific as usual, but during Monday\'s group presentation you seemed a bit hesitant when taking questions. There is zero pressure — technical communication is a skill that develops with supportive practice. If you would like to run through the dynamic programming slide deck together informally, my office is open Wednesday at 3 PM.',
    careCategory: 'Academic Support',
    status: 'replied',
    replies: [
      {
        id: 'rep-ak1',
        sender: 'student',
        senderName: 'Arjun Kumar',
        text: 'Thank you Professor Vance. I felt nervous presenting in front of the full auditorium. I would really appreciate meeting on Wednesday to review speaking strategies!',
        timestamp: 'Yesterday at 01:20 PM',
      },
      {
        id: 'rep-ak2',
        sender: 'faculty',
        senderName: 'Prof. Elena Vance',
        text: 'That sounds like a wonderful plan Arjun. See you Wednesday at 3 PM in Room 412. You have great technical depth, we will just polish the delivery!',
        timestamp: 'Yesterday at 02:00 PM',
      },
    ],
  },
  {
    id: 'dm-0b',
    studentId: 'arjun-kumar',
    studentName: 'Arjun Kumar',
    facultyName: 'Dr. Aris Thorne',
    facultyRole: 'Placement Coordinator & Senior Mentor',
    timestamp: '2 days ago at 03:45 PM',
    subject: 'Placement Preparation: Technical Interview Benchmark',
    message: 'Arjun, your coding benchmark score (82/100) on graph algorithms and tree traversals puts you in strong contention for Tier-1 engineering rounds. Your next growth opportunity is interview communication: articulating trade-offs while writing code. Try the 2-minute Fluencis speaking exercise on the portal!',
    careCategory: 'Placement Mentoring',
    status: 'read',
    replies: [],
  },
  {
    id: 'dm-1',
    studentId: 'st-001',
    studentName: 'Priya Sharma',
    facultyName: 'Prof. Elena Vance',
    facultyRole: 'Faculty Advisor & Associate Professor, CSE',
    timestamp: 'Today at 09:30 AM',
    subject: 'Checking in on your Distributed Systems module',
    message: 'Hi Priya, I noticed your assignment submission for Week 6 had a slight delay and your LMS activity was slightly below your usual rhythm. I know balancing advanced algorithms with project work can be intense. Please know my office door is open if you want to walk through the consensus algorithms together this Thursday!',
    careCategory: 'Wellness Check-in',
    status: 'replied',
    replies: [
      {
        id: 'rep-1',
        sender: 'student',
        senderName: 'Priya Sharma',
        text: 'Thank you so much Prof. Vance! I had caught a mild fever over the weekend, but I am back on track now. I would love to drop by Thursday at 2 PM to clarify Raft consensus questions.',
        timestamp: 'Today at 10:15 AM'
      },
      {
        id: 'rep-2',
        sender: 'faculty',
        senderName: 'Prof. Elena Vance',
        text: 'Glad you are feeling better Priya! See you Thursday at 2 PM in Room 412.',
        timestamp: 'Today at 10:45 AM'
      }
    ]
  },
  {
    id: 'dm-2',
    studentId: 'st-001',
    studentName: 'Priya Sharma',
    facultyName: 'Dr. Aris Thorne',
    facultyRole: 'Placement Coordinator & Senior Mentor',
    timestamp: 'Yesterday at 04:15 PM',
    subject: 'Great progress on technical interview benchmarks',
    message: 'Priya, your placement readiness score has climbed to 85. Your system design simulation results were among the top 5% in our cohort. Keep up the consistent pace; top cloud engineering teams visit campus in 6 weeks.',
    careCategory: 'Placement Mentoring',
    status: 'read',
    replies: []
  },
  {
    id: 'dm-3',
    studentId: 'st-002',
    studentName: 'Marcus Vance',
    facultyName: 'Prof. Elena Vance',
    facultyRole: 'Faculty Advisor, CSE',
    timestamp: '2 days ago at 11:00 AM',
    subject: 'Academic Support: Discrete Mathematics review packet',
    message: 'Marcus, I saw you were putting in extra hours on graph theory. I uploaded a tailored review packet to your LMS dashboard to help bridge the proof techniques. Take your time with it.',
    careCategory: 'Academic Support',
    status: 'delivered',
    replies: [
      {
        id: 'rep-m1',
        sender: 'student',
        senderName: 'Marcus Vance',
        text: 'Thank you Professor. The visualization on topological sorting really helped things click.',
        timestamp: 'Yesterday at 02:20 PM'
      }
    ]
  },
  {
    id: 'dm-4',
    studentId: 'st-003',
    studentName: 'Sofia Chen',
    facultyName: 'Prof. Elena Vance',
    facultyRole: 'Faculty Advisor, CSE',
    timestamp: '3 days ago at 01:45 PM',
    subject: 'Personal Caring: Research Project Collaboration',
    message: 'Sofia, your performance in the AI & Natural Language Processing lab was exceptional. Would you be interested in joining the summer student research symposium?',
    careCategory: 'Encouragement',
    status: 'replied',
    replies: [
      {
        id: 'rep-s1',
        sender: 'student',
        senderName: 'Sofia Chen',
        text: 'I would be honored! I will review the symposium topics tonight.',
        timestamp: '3 days ago at 03:00 PM'
      }
    ]
  },
  {
    id: 'dm-5',
    studentId: 'st-005',
    studentName: 'Aisha Patel',
    facultyName: 'Prof. Elena Vance',
    facultyRole: 'Faculty Advisor, CSE',
    timestamp: '4 days ago at 10:00 AM',
    subject: 'Check-in: Encouragement and Mid-term Rhythm',
    message: 'Aisha, just wanted to send a warm note of encouragement. You have been steady in attendance and participation. Let us know if you need any study group connections.',
    careCategory: 'Wellness Check-in',
    status: 'read',
    replies: []
  }
];

export const INITIAL_LMS_ASSIGNMENTS: LmsAssignment[] = [
  {
    id: 'lms-ak1',
    studentId: 'arjun-kumar',
    studentName: 'Arjun Kumar',
    title: 'Personalized Practice: 2-Minute Spontaneous Speaking Exercise',
    course: 'CS-COMM Professional Technical Communication',
    category: 'Personalized Practice',
    description: 'Explain the difference between Dijkstra\'s shortest path algorithm and the A* heuristic search algorithm clearly in two minutes without pausing.',
    personalCareNote: 'Arjun, focus on conceptual clarity and calm pacing rather than speed. Complete using the Fluencis voice or text practice interface.',
    dueDate: 'This Friday, 11:59 PM',
    points: 25,
    status: 'In Progress',
  },
  {
    id: 'lms-ak2',
    studentId: 'arjun-kumar',
    studentName: 'Arjun Kumar',
    title: 'Coursework Assignment 5: Dynamic Programming Memoization Benchmark',
    course: 'CS301 Design & Analysis of Algorithms',
    category: 'Coursework Assignment',
    description: 'Implement bottom-up dynamic programming solutions for the 0/1 Knapsack and Longest Common Subsequence problems. Measure execution time across arrays of size N=10,000.',
    personalCareNote: 'Solid progress on the recursion tree analysis. Make sure to document memory footprint alongside Big-O runtime.',
    dueDate: 'Completed 2 days ago',
    points: 100,
    status: 'Reviewed',
    submission: {
      text: 'Submitted algorithm benchmark repository and analysis report. Solved both problems with full memory efficiency optimizations.',
      attachmentName: 'arjun_kumar_dp_benchmark_assignment5.zip',
      submittedAt: '2 days ago, 06:15 PM',
      feedback: 'Excellent empirical benchmarks and asymptotic proofs. Clean C++ implementation. 89/100.',
      grade: '89 / 100 (A)',
    },
  },
  {
    id: 'lms-ak3',
    studentId: 'arjun-kumar',
    studentName: 'Arjun Kumar',
    title: 'Placement Mock Prep: System Design Trade-offs & Communication',
    course: 'CS-CAREER Placement Accelerator',
    category: 'Placement Mock Prep',
    description: 'Outline the architecture of a high-throughput URL shortener. Structure your explanation into API design, data storage, and cache eviction strategies.',
    personalCareNote: 'Arjun, practice verbalizing your thought process aloud while diagramming.',
    dueDate: 'Next Tuesday, 05:00 PM',
    points: 50,
    status: 'Assigned',
  },
  {
    id: 'lms-1',
    studentId: 'st-001',
    studentName: 'Priya Sharma',
    title: 'Personalized Practice: Raft Consensus State Machine',
    course: 'CS402 Distributed Systems',
    category: 'Personalized Practice',
    description: 'Implement a 3-node mock state machine in Python/C++ handling heartbeat timeouts and leader elections. Focus on clean log replication handling.',
    personalCareNote: 'Priya, remember to break this down into the candidate state and leader state first. No rush on the network partition edge case.',
    dueDate: 'Next Monday, 11:59 PM',
    points: 50,
    status: 'In Progress'
  },
  {
    id: 'lms-2',
    studentId: 'st-001',
    studentName: 'Priya Sharma',
    title: 'Assignment 4: Dynamic Programming & Matrix Chain Multiplication',
    course: 'CS201 Data Structures & Algorithms',
    category: 'Coursework Assignment',
    description: 'Solve the standard matrix multiplication parenthesization problem with O(n^3) complexity. Include memoization cache proof and test runner.',
    personalCareNote: 'Well organized work on the previous assignment. Looking forward to your memoization breakdown.',
    dueDate: 'Completed 3 days ago',
    points: 100,
    status: 'Reviewed',
    submission: {
      text: 'Submitted GitHub repository link and PDF writeup. Code passed all 12 edge cases including single element and large matrices.',
      attachmentName: 'priya_sharma_dp_assignment4.py',
      submittedAt: '3 days ago, 04:30 PM',
      feedback: 'Outstanding memoization proof and runtime analysis. 100/100.',
      grade: '100 / 100 (A+)'
    }
  },
  {
    id: 'lms-3',
    studentId: 'st-001',
    studentName: 'Priya Sharma',
    title: 'Placement Mock Prep: Top 25 Tech Interview Coding Patterns',
    course: 'CS-CAREER Career & Placement Accelerator',
    category: 'Placement Mock Prep',
    description: 'Complete 5 two-pointer and sliding window questions on the campus placement portal. Submit your reflection on space-time trade-offs.',
    personalCareNote: 'This builds directly on your mock interview strengths. Great job on the LeetCode Mediums.',
    dueDate: 'This Friday, 06:00 PM',
    points: 40,
    status: 'Submitted',
    submission: {
      text: 'Completed all 5 sliding window problems. Attached reflection on monotonic queue optimizations.',
      attachmentName: 'priya_sliding_window_reflection.pdf',
      submittedAt: 'Yesterday, 07:15 PM',
      feedback: 'Reviewed. Insightful breakdown on monotonic queues! Full points.',
      grade: '40 / 40'
    }
  },
  {
    id: 'lms-4',
    studentId: 'st-002',
    studentName: 'Marcus Vance',
    title: 'Remedial Concept Module: Asymptotic Notations & Master Theorem',
    course: 'CS201 Data Structures & Algorithms',
    category: 'Remedial Concept Module',
    description: 'Step-by-step interactive exercises breaking down Big-O, Big-Omega, and Big-Theta cases with step-by-step visual proofs.',
    personalCareNote: 'Marcus, take your time through sections 2 and 3. Feel free to message me anytime if a formula feels unclear.',
    dueDate: 'This Thursday, 11:59 PM',
    points: 35,
    status: 'In Progress'
  },
  {
    id: 'lms-5',
    studentId: 'st-003',
    studentName: 'Sofia Chen',
    title: 'Research Milestone: Transformer Attention Head Visualization',
    course: 'CS410 Machine Learning & NLP',
    category: 'Reflective Milestone',
    description: 'Build a lightweight Streamlit/React interactive visualizer showing multi-head attention weights across sample sentence inputs.',
    personalCareNote: 'Sofia, feel free to use Bert-base for the weights to keep compute requirements lightweight.',
    dueDate: 'In 2 Weeks',
    points: 80,
    status: 'Assigned'
  },
  {
    id: 'lms-6',
    studentId: 'st-004',
    studentName: 'David Kim',
    title: 'Personalized Practice: Linux Kernel Syscall Tracer',
    course: 'CS304 Operating Systems',
    category: 'Personalized Practice',
    description: 'Write an eBPF or ptrace utility to intercept read/write system calls and compute latency histograms.',
    personalCareNote: 'David, make sure to test on a 64-bit Linux VM with headers enabled.',
    dueDate: 'Next Wednesday, 05:00 PM',
    points: 50,
    status: 'In Progress'
  },
  {
    id: 'lms-7',
    studentId: 'st-005',
    studentName: 'Aisha Patel',
    title: 'Coursework Assignment: Relational Schema Normalization (3NF & BCNF)',
    course: 'CS205 Database Systems',
    category: 'Coursework Assignment',
    description: 'Perform functional dependency decomposition on an e-commerce inventory database. Verify lossless-join and dependency preservation.',
    personalCareNote: 'Aisha, remember that every determinant in BCNF must be a candidate key.',
    dueDate: 'Tomorrow, 11:59 PM',
    points: 60,
    status: 'Assigned'
  }
];
