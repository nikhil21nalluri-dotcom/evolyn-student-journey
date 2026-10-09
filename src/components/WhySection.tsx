import React, { useState } from 'react';
import { HelpCircle, AlertCircle, Sparkles, ArrowRight, UserCheck } from 'lucide-react';

interface IntelligenceCase {
  id: string;
  archetype: string;
  student: string;
  major: string;
  whatChanged: {
    title: string;
    description: string;
    delta: string;
  };
  whyItMatters: {
    title: string;
    description: string;
    context: string;
  };
  whatNext: {
    title: string;
    action: string;
    stakeholder: string;
  };
}

const CASES: IntelligenceCase[] = [
  {
    id: 'case-1',
    archetype: 'The Quiet Drifter',
    student: 'Elena Vance',
    major: 'Computer Science, Year 2',
    whatChanged: {
      title: 'Engagement decreased',
      description: 'LMS interaction dropped 38% while peer study group participation dropped to zero over the past 14 days.',
      delta: '-38% Activity Velocity',
    },
    whyItMatters: {
      title: 'Compounding Disengagement Vector',
      description: 'Reduced participation combined with declining attendance may indicate disengagement rather than simple scheduling conflict.',
      context: 'Historical cohort data shows students with this dual-drop vector experience a 64% likelihood of severe grade decline by Midterm 2 if unaddressed.',
    },
    whatNext: {
      title: 'Proactive Mentor Outreach',
      action: 'Initiate a non-punitive 15-minute advisor check-in focused on coursework pacing and peer study group reintegration.',
      stakeholder: 'Assigned Academic Mentor & Peer Lead',
    },
  },
  {
    id: 'case-2',
    archetype: 'The Prerequisite Concept Wall',
    student: 'Marcus Chen',
    major: 'Electrical Engineering, Year 1',
    whatChanged: {
      title: 'Lab assignment submission delay',
      description: 'First 4 assignments submitted 2 days early. Assignment 5 (Fourier Transforms) submitted at 11:58 PM with 4 failed compiler tests.',
      delta: '-48h Cadence Reversal',
    },
    whyItMatters: {
      title: 'Specific Prerequisite Deficit',
      description: 'The student remains highly motivated and attends all lectures, but encountered a mathematical prerequisite barrier in Module 3.',
      context: 'Not an attendance or motivation issue; targeted supplemental instruction on calculus integration restores momentum in 89% of similar cases.',
    },
    whatNext: {
      title: 'Targeted Lab TA Support',
      action: 'Flag concept module to Course TA; trigger automated micro-review module for Fourier Transform integrals before Friday lab.',
      stakeholder: 'Lead Teaching Assistant',
    },
  },
  {
    id: 'case-3',
    archetype: 'The Burnout Sprinter',
    student: 'Sofia Patel',
    major: 'Data Science, Year 3',
    whatChanged: {
      title: 'Erratic nocturnal commit bursts',
      description: 'LMS reading sessions occurring exclusively between 2:00 AM - 4:30 AM with sharp drops in daytime seminar presence.',
      delta: 'Circadian Pattern Inversion',
    },
    whyItMatters: {
      title: 'Acute Fatigue & Overload Risk',
      description: 'High academic capability masking unsustainable overload. Perfect quiz scores juxtaposed against physical lecture absences.',
      context: 'Predictor of sudden withdrawal or missed milestone deadlines during heavy exam weeks.',
    },
    whatNext: {
      title: 'Wellness & Workload Consultation',
      action: 'Send gentle advisor note regarding course load balancing and connect with campus academic wellness coordinators.',
      stakeholder: 'Department Counselor',
    },
  },
];

export const WhySection: React.FC = () => {
  const [activeCase, setActiveCase] = useState<IntelligenceCase>(CASES[0]);

  return (
    <section id="why" className="relative w-full py-28 px-6 md:px-12 z-20">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold tracking-widest uppercase text-purple-300 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4">
            <span>Cognitive Intelligence Engine</span>
          </div>
          <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white">
            <span className="block text-purple-200/90">From What</span>
            <span className="block text-gradient-ethereal">To Why.</span>
          </h2>
          <p className="mt-5 text-lg md:text-xl text-purple-200/80 font-normal leading-relaxed text-balance">
            Surface the underlying systemic causes behind student behavior, enabling timely
            human empathy and precision support.
          </p>
        </div>

        {/* Archetype Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {CASES.map((c) => {
            const isActive = activeCase.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveCase(c)}
                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-pink-500/25 border border-pink-400/40'
                    : 'bg-[#180c33]/70 text-purple-200/70 hover:text-white border border-white/5 hover:border-purple-500/20'
                }`}
              >
                <span>{c.archetype}</span>
                <span className="text-[11px] opacity-75 font-normal">({c.student.split(' ')[0]})</span>
              </button>
            );
          })}
        </div>

        {/* The 3-Step Reasoning Triad (WHAT -> WHY -> WHAT NEXT) */}
        <div className="glass-panel rounded-3xl p-6 md:p-12 border border-purple-500/20 shadow-2xl relative overflow-hidden">
          {/* Header identifying the student context */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-white/10 gap-3">
            <div>
              <span className="text-xs font-mono text-purple-400 tracking-wider uppercase block">
                Investigating Pattern Archetype
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white mt-0.5">
                {activeCase.archetype} <span className="text-purple-300 font-normal">· {activeCase.student}</span>
              </h3>
            </div>
            <span className="text-xs text-purple-300/80 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 self-start sm:self-auto">
              {activeCase.major}
            </span>
          </div>

          {/* Triad Flow Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* 1. WHAT CHANGED? */}
            <div className="rounded-2xl p-6 bg-[#180a33]/90 border border-purple-500/30 flex flex-col justify-between relative group hover:border-purple-400/50 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-pink-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-pink-300">
                      1. What Changed?
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-purple-300 bg-purple-900/30 px-2 py-0.5 rounded">
                    Observation
                  </span>
                </div>

                <div className="text-lg font-bold text-white mb-2">
                  → {activeCase.whatChanged.title}
                </div>

                <p className="text-xs sm:text-sm text-purple-200/80 leading-relaxed">
                  {activeCase.whatChanged.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 text-xs font-mono text-pink-300">
                {activeCase.whatChanged.delta}
              </div>
            </div>

            {/* 2. WHY MIGHT IT MATTER? */}
            <div className="rounded-2xl p-6 bg-[#210c44]/90 border border-pink-500/30 flex flex-col justify-between relative group hover:border-pink-400/60 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-purple-300" />
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-200">
                      2. Why Might It Matter?
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-pink-300 bg-pink-900/30 px-2 py-0.5 rounded">
                    Analysis
                  </span>
                </div>

                <div className="text-lg font-bold text-white mb-2">
                  → {activeCase.whyItMatters.title}
                </div>

                <p className="text-xs sm:text-sm text-purple-200/80 leading-relaxed mb-3">
                  {activeCase.whyItMatters.description}
                </p>

                <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/20 text-xs text-purple-300 leading-relaxed">
                  {activeCase.whyItMatters.context}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 text-xs font-mono text-purple-300">
                Pattern Confidence: High
              </div>
            </div>

            {/* 3. WHAT NEXT? */}
            <div className="rounded-2xl p-6 bg-gradient-to-br from-[#1a0f3d] to-[#2b104a] border border-cyan-500/30 flex flex-col justify-between relative group hover:border-cyan-400/50 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-300" />
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-200">
                      3. What Next?
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-300 bg-cyan-900/30 px-2 py-0.5 rounded">
                    Action Plan
                  </span>
                </div>

                <div className="text-lg font-bold text-white mb-2">
                  → {activeCase.whatNext.title}
                </div>

                <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed">
                  {activeCase.whatNext.action}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-cyan-200">
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5" />
                  {activeCase.whatNext.stakeholder}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
