import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SkillAssessmentRecord,
  PracticeActivityRecord,
  StudentSkillsPlacementOverview,
  INITIAL_ASSESSMENT_RECORDS,
  INITIAL_PRACTICE_ACTIVITIES,
  getStudentSkillsPlacementOverview,
  getInstitutionalPlacementSkillsAnalytics,
  CuratedPracticeChallenge,
  CURATED_PRACTICE_CHALLENGES,
} from '../data/skillsPlacementEngine';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { recordPracticeSessionEvidence } from '../data/studentSuccessScore';

interface SkillsPlacementContextType {
  assessments: SkillAssessmentRecord[];
  practices: PracticeActivityRecord[];
  challenges: CuratedPracticeChallenge[];
  recordAssessment: (params: {
    studentId: string;
    category: 'communication' | 'technical' | 'career-placement';
    assessmentType: string;
    score: number;
    maxScore?: number;
    assessor?: string;
    notes?: string;
    verified?: boolean;
  }) => SkillAssessmentRecord;
  recordPracticeCompletion: (params: {
    studentId: string;
    title: string;
    category: 'speaking' | 'presentation' | 'mock-interview' | 'group-discussion' | 'aptitude' | 'coding' | 'technical-revision';
    prompt: string;
    transcriptOrJournal: string;
    durationSeconds: number;
    reflectionMood?: 'confident' | 'progressing' | 'needs-review';
    reflectionNotes?: string;
  }) => PracticeActivityRecord;
  getStudentOverview: (studentId: string) => StudentSkillsPlacementOverview;
  getInstitutionalAnalytics: () => ReturnType<typeof getInstitutionalPlacementSkillsAnalytics>;
}

const SkillsPlacementContext = createContext<SkillsPlacementContextType | undefined>(undefined);

const ASSESSMENTS_STORAGE_KEY = 'evolyn_skill_assessments_v1';
const PRACTICES_STORAGE_KEY = 'evolyn_practice_activities_v1';

export const SkillsPlacementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, user } = useAuth();

  const [assessments, setAssessments] = useState<SkillAssessmentRecord[]>(() => {
    try {
      const saved = localStorage.getItem(ASSESSMENTS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed reading skill assessments from localStorage', e);
    }
    return INITIAL_ASSESSMENT_RECORDS;
  });

  const [practices, setPractices] = useState<PracticeActivityRecord[]>(() => {
    try {
      const saved = localStorage.getItem(PRACTICES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed reading practice activities from localStorage', e);
    }
    return INITIAL_PRACTICE_ACTIVITIES;
  });

  // Listen for externally imported assessments (e.g. from CSV Data Integration)
  useEffect(() => {
    const handleExternalUpdate = () => {
      try {
        const saved = localStorage.getItem(ASSESSMENTS_STORAGE_KEY);
        if (saved) {
          setAssessments(JSON.parse(saved));
        }
      } catch (e) {
        console.warn('Failed synchronizing external assessments', e);
      }
    };

    window.addEventListener('evolyn-skills-updated', handleExternalUpdate);
    window.addEventListener('storage', handleExternalUpdate);
    return () => {
      window.removeEventListener('evolyn-skills-updated', handleExternalUpdate);
      window.removeEventListener('storage', handleExternalUpdate);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(ASSESSMENTS_STORAGE_KEY, JSON.stringify(assessments));
    } catch (e) {
      console.warn('Failed saving assessments to localStorage', e);
    }
  }, [assessments]);

  useEffect(() => {
    try {
      localStorage.setItem(PRACTICES_STORAGE_KEY, JSON.stringify(practices));
    } catch (e) {
      console.warn('Failed saving practices to localStorage', e);
    }
  }, [practices]);

  const recordAssessment = ({
    studentId,
    category,
    assessmentType,
    score,
    maxScore = 100,
    assessor = userProfile?.displayName || user?.displayName || 'Faculty Assessor',
    notes = '',
    verified = true,
  }: {
    studentId: string;
    category: 'communication' | 'technical' | 'career-placement';
    assessmentType: string;
    score: number;
    maxScore?: number;
    assessor?: string;
    notes?: string;
    verified?: boolean;
  }): SkillAssessmentRecord => {
    const today = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedDate = `${months[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;

    // Duplicate suppression (prevent repeated rapid clicks)
    const recentDuplicate = assessments.find(
      (a) =>
        a.studentId === studentId &&
        a.assessmentType === assessmentType &&
        a.score === score &&
        a.date === formattedDate
    );
    if (recentDuplicate) {
      return recentDuplicate;
    }

    const newRec: SkillAssessmentRecord = {
      id: `as-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      studentId,
      category,
      assessmentType,
      score,
      maxScore,
      date: formattedDate,
      assessor,
      notes,
      verified,
    };

    setAssessments((prev) => [newRec, ...prev]);

    // Firestore sync if connected
    if (user && db) {
      try {
        setDoc(doc(db, 'skillAssessments', newRec.id), {
          ...newRec,
          recordedByUid: user.uid,
          recordedAt: new Date().toISOString(),
        }).catch((err) => {
          console.warn('Non-blocking Firestore skill assessment sync deferred', err);
        });
      } catch (err) {
        console.warn('Caught firestore setDoc', err);
      }
    }

    return newRec;
  };

  const recordPracticeCompletion = ({
    studentId,
    title,
    category,
    prompt,
    transcriptOrJournal,
    durationSeconds,
    reflectionMood,
    reflectionNotes,
  }: {
    studentId: string;
    title: string;
    category: 'speaking' | 'presentation' | 'mock-interview' | 'group-discussion' | 'aptitude' | 'coding' | 'technical-revision';
    prompt: string;
    transcriptOrJournal: string;
    durationSeconds: number;
    reflectionMood?: 'confident' | 'progressing' | 'needs-review';
    reflectionNotes?: string;
  }): PracticeActivityRecord => {
    const today = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedDate = `${months[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;

    // Duplicate suppression (prevent repeated rapid clicks)
    const recentDuplicate = practices.find(
      (p) =>
        p.studentId === studentId &&
        p.title === title &&
        p.completedAt === formattedDate &&
        Math.abs(p.durationSeconds - durationSeconds) <= 2
    );
    if (recentDuplicate) {
      return recentDuplicate;
    }

    const newPrac: PracticeActivityRecord = {
      id: `prac-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      studentId,
      title,
      category,
      prompt,
      transcriptOrJournal,
      durationSeconds,
      completedAt: formattedDate,
      reflectionMood,
      reflectionNotes,
      isSelfAssessment: true,
    };

    setPractices((prev) => [newPrac, ...prev]);

    // Connect to Explainable Success Score (Skills & Communication 15%, Student Engagement 15%)
    try {
      recordPracticeSessionEvidence(studentId, 1, reflectionMood === 'confident' ? 90 : 78);
    } catch (e) {
      console.warn('Success score practice sync note:', e);
    }

    // Firestore sync if connected
    if (user && db) {
      try {
        setDoc(doc(db, 'practice_records', newPrac.id), {
          ...newPrac,
          studentId: user.uid,
          createdAt: new Date().toISOString(),
        }).catch((err) => {
          console.warn('Non-blocking Firestore practice sync deferred', err);
        });
      } catch (err) {
        console.warn('Caught firestore setDoc', err);
      }
    }

    return newPrac;
  };

  const getStudentOverview = (studentId: string) => {
    return getStudentSkillsPlacementOverview(studentId, assessments, practices);
  };

  const getInstitutionalAnalytics = () => {
    return getInstitutionalPlacementSkillsAnalytics(assessments, practices);
  };

  return (
    <SkillsPlacementContext.Provider
      value={{
        assessments,
        practices,
        challenges: CURATED_PRACTICE_CHALLENGES,
        recordAssessment,
        recordPracticeCompletion,
        getStudentOverview,
        getInstitutionalAnalytics,
      }}
    >
      {children}
    </SkillsPlacementContext.Provider>
  );
};

export const useSkillsPlacement = () => {
  const ctx = useContext(SkillsPlacementContext);
  if (!ctx) {
    throw new Error('useSkillsPlacement must be used within a SkillsPlacementProvider');
  }
  return ctx;
};
