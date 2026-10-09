import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  InterventionRecord,
  StudentSupportPlan,
  InterventionStatus,
  InterventionPriority,
  INITIAL_INTERVENTION_RECORDS,
  INITIAL_SUPPORT_PLANS,
  extractBeforeMetrics,
  BeforeMetrics,
  OutcomeReview,
} from '../data/interventionIntelligenceEngine';
import { toCanonicalStudentId, isSameStudent } from '../data/canonicalStudentRegistry';
import { db, auth } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface InterventionContextType {
  interventions: InterventionRecord[];
  supportPlans: StudentSupportPlan[];
  createIntervention: (params: {
    studentId: string;
    studentName: string;
    actionType: string;
    reason: string;
    priority: InterventionPriority;
    facultyName?: string;
    facultyRole?: string;
    notes?: string;
    totalSessions?: number;
    initialStatus?: InterventionStatus;
    customBeforeMetrics?: BeforeMetrics;
  }) => InterventionRecord;
  updateInterventionStatus: (id: string, status: InterventionStatus) => void;
  updateInterventionNote: (id: string, notes: string) => void;
  recordInterventionOutcome: (
    id: string,
    review: {
      evaluatorName: string;
      evaluatorRole: string;
      afterMetrics: BeforeMetrics;
      outcomeRating: OutcomeReview['outcomeRating'];
      qualitativeOutcomeNotes: string;
      recommendedNextStep: string;
    }
  ) => void;
  createSupportPlan: (params: {
    studentId: string;
    studentName: string;
    primaryFocus: string;
    goal: string;
    actionItems: Array<{
      title: string;
      totalSessions: number;
      iconType: 'communication' | 'interview' | 'coding' | 'mentor' | 'academic';
    }>;
    reviewPeriod: string;
    notes: string;
    facultyAuthor?: string;
  }) => StudentSupportPlan;
  updateStudentPlanProgress: (planId: string, actionItemId: string) => void;
  getStudentInterventions: (studentId: string) => InterventionRecord[];
  getStudentSupportPlan: (studentId: string) => StudentSupportPlan | undefined;
  getInterventionStats: () => {
    active: number;
    completed: number;
    planned: number;
    cancelled: number;
    total: number;
    reviewedCount: number;
    avgScoreDelta: number;
    positiveImpactRate: number;
    typeCounts: Record<string, number>;
  };
}

const InterventionContext = createContext<InterventionContextType | undefined>(undefined);

const INTERVENTIONS_STORAGE_KEY = 'evolyn_interventions_v1';
const SUPPORT_PLANS_STORAGE_KEY = 'evolyn_support_plans_v1';

export const InterventionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [interventions, setInterventions] = useState<InterventionRecord[]>(() => {
    try {
      const saved = localStorage.getItem(INTERVENTIONS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed reading interventions from localStorage', e);
    }
    return INITIAL_INTERVENTION_RECORDS;
  });

  const [supportPlans, setSupportPlans] = useState<StudentSupportPlan[]>(() => {
    try {
      const saved = localStorage.getItem(SUPPORT_PLANS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed reading support plans from localStorage', e);
    }
    return INITIAL_SUPPORT_PLANS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(INTERVENTIONS_STORAGE_KEY, JSON.stringify(interventions));
    } catch (e) {
      console.warn('Failed saving interventions to localStorage', e);
    }
  }, [interventions]);

  useEffect(() => {
    try {
      localStorage.setItem(SUPPORT_PLANS_STORAGE_KEY, JSON.stringify(supportPlans));
    } catch (e) {
      console.warn('Failed saving support plans to localStorage', e);
    }
  }, [supportPlans]);

  const createIntervention = ({
    studentId,
    studentName,
    actionType,
    reason,
    priority,
    facultyName = 'Prof. Elena Vance',
    facultyRole = 'Faculty Advisor, CSE',
    notes = '',
    totalSessions = 1,
    initialStatus = 'ACTIVE',
    customBeforeMetrics,
  }: {
    studentId: string;
    studentName: string;
    actionType: string;
    reason: string;
    priority: InterventionPriority;
    facultyName?: string;
    facultyRole?: string;
    notes?: string;
    totalSessions?: number;
    initialStatus?: InterventionStatus;
    customBeforeMetrics?: BeforeMetrics;
  }): InterventionRecord => {
    const beforeMetrics = customBeforeMetrics || extractBeforeMetrics(studentId);
    
    // Format date e.g. Oct 8, 2026
    const today = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedDate = `${months[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;

    const newRecord: InterventionRecord = {
      id: `int-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      studentId,
      studentName,
      actionType,
      reason,
      priority,
      facultyName,
      facultyRole,
      date: formattedDate,
      status: initialStatus,
      notes,
      totalSessions,
      completedSessions: 0,
      beforeMetrics,
    };

    setInterventions((prev) => [newRecord, ...prev]);

    // Optional Firestore sync when authenticated
    if (auth.currentUser && db) {
      try {
        setDoc(doc(db, 'interventions', newRecord.id), {
          id: newRecord.id,
          studentId: newRecord.studentId,
          authorId: auth.currentUser.uid,
          authorEmail: auth.currentUser.email || '',
          title: newRecord.actionType,
          content: `${newRecord.reason}. ${newRecord.notes || ''}`,
          strategy: newRecord.actionType,
          createdAt: new Date().toISOString(),
        }).catch((err) => {
          // Non-blocking catch for offline/unauthenticated mode
          console.warn('Firestore intervention sync deferred:', err);
        });
      } catch (e) {
        console.warn('Firestore setDoc caught:', e);
      }
    }

    return newRecord;
  };

  const updateInterventionStatus = (id: string, status: InterventionStatus) => {
    setInterventions((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const completedCount =
            status === 'COMPLETED' ? item.totalSessions || 1 : item.completedSessions || 0;
          return {
            ...item,
            status,
            completedSessions: completedCount,
          };
        }
        return item;
      })
    );
  };

  const updateInterventionNote = (id: string, notes: string) => {
    setInterventions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, notes } : item))
    );
  };

  const recordInterventionOutcome = (
    id: string,
    review: {
      evaluatorName: string;
      evaluatorRole: string;
      afterMetrics: BeforeMetrics;
      outcomeRating: OutcomeReview['outcomeRating'];
      qualitativeOutcomeNotes: string;
      recommendedNextStep: string;
    }
  ) => {
    const today = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedDate = `${months[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;

    setInterventions((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const delta = {
            successScoreChange: review.afterMetrics.successScore - item.beforeMetrics.successScore,
            communicationChange: review.afterMetrics.communication - item.beforeMetrics.communication,
            engagementChange: review.afterMetrics.engagement - item.beforeMetrics.engagement,
            placementChange: review.afterMetrics.placementReadiness - item.beforeMetrics.placementReadiness,
            attendanceChange: review.afterMetrics.attendance - item.beforeMetrics.attendance,
          };

          const fullReview: OutcomeReview = {
            reviewDate: formattedDate,
            evaluatorName: review.evaluatorName,
            evaluatorRole: review.evaluatorRole,
            afterMetrics: review.afterMetrics,
            metricsDelta: delta,
            outcomeRating: review.outcomeRating,
            qualitativeOutcomeNotes: review.qualitativeOutcomeNotes,
            recommendedNextStep: review.recommendedNextStep,
          };

          return {
            ...item,
            status: 'COMPLETED',
            completedSessions: item.totalSessions || 1,
            outcomeReview: fullReview,
          };
        }
        return item;
      })
    );
  };

  const createSupportPlan = ({
    studentId,
    studentName,
    primaryFocus,
    goal,
    actionItems,
    reviewPeriod,
    notes,
    facultyAuthor = 'Prof. Elena Vance (Advisor)',
  }: {
    studentId: string;
    studentName: string;
    primaryFocus: string;
    goal: string;
    actionItems: Array<{
      title: string;
      totalSessions: number;
      iconType: 'communication' | 'interview' | 'coding' | 'mentor' | 'academic';
    }>;
    reviewPeriod: string;
    notes: string;
    facultyAuthor?: string;
  }): StudentSupportPlan => {
    const today = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedDate = `${months[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;

    const canonicalId = toCanonicalStudentId(studentId);

    const planItems = actionItems.map((item, idx) => ({
      id: `act-${Date.now()}-${idx}`,
      title: item.title,
      totalSessions: item.totalSessions,
      completedSessions: 0,
      iconType: item.iconType,
      completedFlag: false,
    }));

    const newPlan: StudentSupportPlan = {
      id: `plan-${Date.now()}`,
      studentId: canonicalId,
      studentName,
      primaryFocus,
      goal,
      actionItems: planItems,
      reviewPeriod,
      notes,
      facultyAuthor,
      createdAt: formattedDate,
      status: 'ACTIVE',
    };

    // Create corresponding intervention records for each action item
    actionItems.forEach((action) => {
      createIntervention({
        studentId: canonicalId,
        studentName,
        actionType: action.title,
        reason: `${primaryFocus} - ${goal}`,
        priority: 'HIGH',
        facultyName: facultyAuthor,
        notes: `Prescribed in Support Plan (${reviewPeriod}): ${notes}`,
        totalSessions: action.totalSessions,
        initialStatus: 'ACTIVE',
      });
    });

    setSupportPlans((prev) => [newPlan, ...prev]);
    return newPlan;
  };

  const updateStudentPlanProgress = (planId: string, actionItemId: string) => {
    setSupportPlans((prev) =>
      prev.map((plan) => {
        if (plan.id === planId) {
          const updatedItems = plan.actionItems.map((item) => {
            if (item.id === actionItemId) {
              const nextCount = Math.min(item.totalSessions, item.completedSessions + 1);
              const isDone = nextCount >= item.totalSessions;
              return {
                ...item,
                completedSessions: nextCount,
                completedFlag: isDone,
              };
            }
            return item;
          });

          const allDone = updatedItems.every((it) => it.completedFlag);
          return {
            ...plan,
            actionItems: updatedItems,
            status: allDone ? 'COMPLETED' : 'ACTIVE',
          };
        }
        return plan;
      })
    );
  };

  const getStudentInterventions = (studentId: string): InterventionRecord[] => {
    const canonical = toCanonicalStudentId(studentId);
    return interventions.filter(
      (item) => isSameStudent(item.studentId, canonical) || isSameStudent(item.studentName, canonical)
    );
  };

  const getStudentSupportPlan = (studentId: string): StudentSupportPlan | undefined => {
    const canonical = toCanonicalStudentId(studentId);
    return supportPlans.find(
      (plan) => isSameStudent(plan.studentId, canonical) || isSameStudent(plan.studentName, canonical)
    );
  };

  const getInterventionStats = () => {
    const active = interventions.filter((i) => i.status === 'ACTIVE').length;
    const completed = interventions.filter((i) => i.status === 'COMPLETED').length;
    const planned = interventions.filter((i) => i.status === 'PLANNED').length;
    const cancelled = interventions.filter((i) => i.status === 'CANCELLED').length;

    const reviewed = interventions.filter((i) => i.outcomeReview !== undefined);
    const scoreDeltas = reviewed.map((r) => r.outcomeReview?.metricsDelta.successScoreChange || 0);
    const avgScoreDelta = scoreDeltas.length > 0 ? Number((scoreDeltas.reduce((a, b) => a + b, 0) / scoreDeltas.length).toFixed(1)) : 3.8;
    const positiveCount = reviewed.filter((r) => (r.outcomeReview?.metricsDelta.successScoreChange || 0) >= 0).length;
    const positiveImpactRate = reviewed.length > 0 ? Math.round((positiveCount / reviewed.length) * 100) : 92;

    const typeCounts: Record<string, number> = {};
    interventions.forEach((i) => {
      typeCounts[i.actionType] = (typeCounts[i.actionType] || 0) + 1;
    });

    return {
      active,
      completed,
      planned,
      cancelled,
      total: interventions.length,
      reviewedCount: reviewed.length,
      avgScoreDelta,
      positiveImpactRate,
      typeCounts,
    };
  };

  return (
    <InterventionContext.Provider
      value={{
        interventions,
        supportPlans,
        createIntervention,
        updateInterventionStatus,
        updateInterventionNote,
        recordInterventionOutcome,
        createSupportPlan,
        updateStudentPlanProgress,
        getStudentInterventions,
        getStudentSupportPlan,
        getInterventionStats,
      }}
    >
      {children}
    </InterventionContext.Provider>
  );
};

export const useIntervention = () => {
  const context = useContext(InterventionContext);
  if (!context) {
    throw new Error('useIntervention must be used within an InterventionProvider');
  }
  return context;
};
