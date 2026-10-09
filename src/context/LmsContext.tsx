import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  DirectMessage,
  LmsAssignment,
  INITIAL_DIRECT_MESSAGES,
  INITIAL_LMS_ASSIGNMENTS,
} from '../data/lmsMessagingData';
import { db, auth } from '../lib/firebase';
import { collection, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { isSameStudent } from '../data/canonicalStudentRegistry';

interface LmsContextType {
  messages: DirectMessage[];
  assignments: LmsAssignment[];
  sendMessage: (
    studentId: string,
    studentName: string,
    subject: string,
    message: string,
    careCategory: DirectMessage['careCategory']
  ) => DirectMessage;
  sendReply: (messageId: string, text: string, sender: 'student' | 'faculty', senderName: string) => void;
  assignWork: (assignment: Omit<LmsAssignment, 'id' | 'status'>) => LmsAssignment;
  submitAssignment: (assignmentId: string, submissionText: string, attachmentName?: string) => void;
  reviewAssignment: (assignmentId: string, grade: string, feedback: string) => void;
  getStudentMessages: (studentId: string) => DirectMessage[];
  getStudentAssignments: (studentId: string) => LmsAssignment[];
}

const LmsContext = createContext<LmsContextType | undefined>(undefined);

const MESSAGES_STORAGE_KEY = 'evolyn_lms_messages_v1';
const ASSIGNMENTS_STORAGE_KEY = 'evolyn_lms_assignments_v1';

const normalize = (val?: string) => (val || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');

const STUDENT_ALIASES: Record<string, string[]> = {
  'arjun-kumar': ['arjun-kumar', 'arjunkumar', 'ev-2026-cse042', 'arjun'],
  'priya-sharma': ['priya-sharma', 'priyasharma', 'st-001', 'ev-2026-ece019', 'priya'],
  'marcus-vance': ['marcus-vance', 'marcusvance', 'st-002', 'ev-2026-cse091', 'marcus'],
  'sofia-chen': ['sofia-chen', 'sofiachen', 'st-003', 'ev-2026-ds033', 'sofia'],
  'devon-price': ['devon-price', 'devonprice', 'st-004', 'ev-2026-aiml012', 'devon'],
  'aaliyah-patel': ['aaliyah-patel', 'aaliyahpatel', 'st-005', 'ev-2026-it077', 'aaliyah'],
  'rahul-verma': ['rahul-verma', 'rahulverma', 'st-006', 'rahul'],
  'sneha-reddy': ['sneha-reddy', 'snehareddy', 'st-007', 'sneha'],
};

export const LmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<DirectMessage[]>(() => {
    try {
      const saved = localStorage.getItem(MESSAGES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed reading LMS messages from storage', e);
    }
    return INITIAL_DIRECT_MESSAGES;
  });

  const [assignments, setAssignments] = useState<LmsAssignment[]>(() => {
    try {
      const saved = localStorage.getItem(ASSIGNMENTS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed reading LMS assignments from storage', e);
    }
    return INITIAL_LMS_ASSIGNMENTS;
  });

  // Real-time Firestore Direct Messages listener
  useEffect(() => {
    try {
      const unsubscribe = onSnapshot(
        collection(db, 'direct_messages'),
        (snapshot) => {
          if (!snapshot.empty) {
            const firestoreMsgs: DirectMessage[] = snapshot.docs.map((d) => d.data() as DirectMessage);
            setMessages((prev) => {
              // Merge Firestore messages with local messages, preferring Firestore doc state
              const map = new Map<string, DirectMessage>();
              prev.forEach((m) => map.set(m.id, m));
              firestoreMsgs.forEach((m) => map.set(m.id, m));
              return Array.from(map.values());
            });
          }
        },
        (error) => {
          // Graceful fallback for unauthenticated or initializing users
          console.info('Direct messages Firestore sync operating with local cache:', error.message);
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.warn('Failed establishing Firestore listener for direct_messages:', err);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed saving LMS messages', e);
    }
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(assignments));
    } catch (e) {
      console.warn('Failed saving LMS assignments', e);
    }
  }, [assignments]);

  const sendMessage = (
    studentId: string,
    studentName: string,
    subject: string,
    messageText: string,
    careCategory: DirectMessage['careCategory']
  ): DirectMessage => {
    const facultyUser = auth.currentUser;
    const authorName = facultyUser?.displayName || 'Prof. Elena Vance';
    const authorRole = 'Faculty Advisor & Associate Professor, CSE';

    const newMsg: DirectMessage = {
      id: `dm-${Date.now()}`,
      studentId,
      studentName,
      facultyName: authorName,
      facultyRole: authorRole,
      timestamp: 'Just now',
      subject,
      message: messageText,
      careCategory,
      status: 'sent',
      replies: [],
    };

    setMessages((prev) => [newMsg, ...prev]);

    // Persist to Firestore if signed in
    if (facultyUser) {
      setDoc(doc(db, 'direct_messages', newMsg.id), newMsg).catch((err) => {
        console.warn('Firestore DM write error (cached locally):', err);
      });
    }

    return newMsg;
  };

  const sendReply = (messageId: string, text: string, sender: 'student' | 'faculty', senderName: string) => {
    const replyItem = {
      id: `rep-${Date.now()}`,
      sender,
      senderName,
      text,
      timestamp: 'Just now',
    };

    let updatedTargetMsg: DirectMessage | null = null;

    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          const updated = {
            ...msg,
            status: sender === 'student' ? ('replied' as const) : ('delivered' as const),
            replies: [...(msg.replies || []), replyItem],
          };
          updatedTargetMsg = updated;
          return updated;
        }
        return msg;
      })
    );

    // Sync updated message document with reply to Firestore
    if (auth.currentUser && updatedTargetMsg) {
      setDoc(doc(db, 'direct_messages', messageId), updatedTargetMsg).catch((err) => {
        console.warn('Firestore DM reply write error:', err);
      });
    }
  };

  const assignWork = (assignmentData: Omit<LmsAssignment, 'id' | 'status'>): LmsAssignment => {
    const newAssign: LmsAssignment = {
      ...assignmentData,
      id: `lms-${Date.now()}`,
      status: 'Assigned',
    };
    setAssignments((prev) => [newAssign, ...prev]);
    return newAssign;
  };

  const submitAssignment = (assignmentId: string, submissionText: string, attachmentName?: string) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id === assignmentId) {
          return {
            ...a,
            status: 'Submitted',
            submission: {
              text: submissionText,
              attachmentName: attachmentName || 'student_solution.zip',
              submittedAt: 'Just now',
              feedback: 'Pending faculty review',
            },
          };
        }
        return a;
      })
    );
  };

  const reviewAssignment = (assignmentId: string, grade: string, feedback: string) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id === assignmentId) {
          return {
            ...a,
            status: 'Reviewed',
            submission: {
              text: a.submission?.text || 'Completed submission',
              attachmentName: a.submission?.attachmentName,
              submittedAt: a.submission?.submittedAt || 'Earlier today',
              grade,
              feedback,
            },
          };
        }
        return a;
      })
    );
  };

  const getStudentMessages = (studentId: string): DirectMessage[] => {
    if (!studentId || studentId === 'all') return messages;

    const normTarget = normalize(studentId);

    // Find any alias list that contains the target ID or target name
    const matchedAliasGroup = Object.values(STUDENT_ALIASES).find((aliases) =>
      aliases.some((a) => normalize(a) === normTarget || normTarget.includes(normalize(a)))
    );

    return messages.filter((m) => {
      if (m.studentId === 'all') return true;
      if (m.studentId === studentId) return true;
      if (isSameStudent(m.studentId, studentId) || isSameStudent(m.studentName, studentId)) {
        return true;
      }

      const normMsgStudentId = normalize(m.studentId);
      const normMsgStudentName = normalize(m.studentName);

      if (normMsgStudentId === normTarget || normMsgStudentName === normTarget) {
        return true;
      }

      // Flexible substring tolerance if length >= 3
      if (
        normTarget.length >= 3 &&
        (normMsgStudentName.includes(normTarget) ||
          normTarget.includes(normMsgStudentName) ||
          normMsgStudentId.includes(normTarget) ||
          normTarget.includes(normMsgStudentId))
      ) {
        return true;
      }

      if (matchedAliasGroup) {
        if (
          matchedAliasGroup.some(
            (a) => normalize(a) === normMsgStudentId || normalize(a) === normMsgStudentName
          )
        ) {
          return true;
        }
      }

      return false;
    });
  };

  const getStudentAssignments = (studentId: string): LmsAssignment[] => {
    if (!studentId || studentId === 'all') return assignments;
    const normTarget = normalize(studentId);

    const matchedAliasGroup = Object.values(STUDENT_ALIASES).find((aliases) =>
      aliases.some((a) => normalize(a) === normTarget || normTarget.includes(normalize(a)))
    );

    return assignments.filter((a) => {
      if (a.studentId === 'all') return true;
      if (a.studentId === studentId) return true;
      if (isSameStudent(a.studentId, studentId) || isSameStudent(a.studentName, studentId)) {
        return true;
      }

      const normAssignId = normalize(a.studentId);
      const normAssignName = normalize(a.studentName);

      if (normAssignId === normTarget || normAssignName === normTarget) {
        return true;
      }

      if (matchedAliasGroup) {
        if (
          matchedAliasGroup.some(
            (al) => normalize(al) === normAssignId || normalize(al) === normAssignName
          )
        ) {
          return true;
        }
      }

      return false;
    });
  };

  return (
    <LmsContext.Provider
      value={{
        messages,
        assignments,
        sendMessage,
        sendReply,
        assignWork,
        submitAssignment,
        reviewAssignment,
        getStudentMessages,
        getStudentAssignments,
      }}
    >
      {children}
    </LmsContext.Provider>
  );
};

export const useLms = (): LmsContextType => {
  const context = useContext(LmsContext);
  if (!context) {
    throw new Error('useLms must be used within an LmsProvider');
  }
  return context;
};
