import React, { useState } from 'react';
import { Layers, Compass, Code, Award, Briefcase, GraduationCap } from 'lucide-react';

interface JourneyStage {
  id: string;
  step: string;
  title: string;
  subtitle: string;
  description: string;
  milestone: string;
  signalsObserved: string[];
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const STAGES: JourneyStage[] = [
  {
    id: 'foundation',
    step: '01',
    title: 'Foundation',
    subtitle: 'Core Concept Grounding',
    description: 'Initial academic grounding, onboarding into campus culture, establishing study habits, and mastering prerequisite core modules.',
    milestone: 'Prerequisite verification & baseline literacy',
    signalsObserved: ['Punctual attendance', 'LMS portal setup', 'Introductory lab participation'],
    icon: Layers,
    color: '#818cf8',
  },
  {
    id: 'engagement',
    step: '02',
    title: 'Engagement',
    subtitle: 'Active Collaborative Discovery',
    description: 'Transitioning from passive lecture listening to active participation in group projects, seminar debates, and TA discussions.',
    milestone: 'Consistent active peer collaboration',
    signalsObserved: ['Discussion forum threads', 'Study cohort formation', 'Early draft reviews'],
    icon: Compass,
    color: '#a855f7',
  },
  {
    id: 'skills',
    step: '03',
    title: 'Skill Development',
    subtitle: 'Applied Hands-On Mastery',
    description: 'Deepening subject comprehension through complex problem sets, software coding repos, laboratory experiments, and case research.',
    milestone: 'Independent problem-solving autonomy',
    signalsObserved: ['GitHub code frequency', 'Complex problem rubric scores', 'Lab experiment accuracy'],
    icon: Code,
    color: '#c084fc',
  },
  {
    id: 'confidence',
    step: '04',
    title: 'Confidence',
    subtitle: 'Self-Directed Intellectual Autonomy',
    description: 'Overcoming mid-program hurdles, leading project deliverables, helping junior peers, and demonstrating academic resilience.',
    milestone: 'Demonstrated resilience during setbacks',
    signalsObserved: ['Help-seeking balance', 'Self-regulated study hours', 'Project leadership'],
    icon: Award,
    color: '#ec4899',
  },
  {
    id: 'internship',
    step: '05',
    title: 'Internship Readiness',
    subtitle: 'Real-World Professional Translation',
    description: 'Translating academic theory into industry problem-solving, building capstone portfolios, and executing technical assessments.',
    milestone: 'Verified industry competency rubric',
    signalsObserved: ['Resume & portfolio drafts', 'Technical interview prep', 'Applied mock trials'],
    icon: Briefcase,
    color: '#f472b6',
  },
  {
    id: 'placement',
    step: '06',
    title: 'Placement Readiness',
    subtitle: 'Graduation & Career Launch',
    description: 'Culmination of the university journey: senior design showcase, career interviews, competitive job offers, or graduate research.',
    milestone: 'Full transition readiness to professional career',
    signalsObserved: ['Industry interviews', 'Final capstone thesis', 'Career placement offer'],
    icon: GraduationCap,
    color: '#38bdf8',
  },
];

export const StudentJourneySection: React.FC = () => {
  const [activeStageId, setActiveStageId] = useState<string>('foundation');
  const activeStage = STAGES.find((s) => s.id === activeStageId) || STAGES[0];

  return (
    <section id="journey" className="relative w-full py-28 px-6 md:px-12 z-20">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold tracking-widest uppercase text-purple-300 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4">
            <span>Longitudinal Arc</span>
          </div>
          <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white">
            <span className="block text-gradient-ethereal">Every Student</span>
            <span className="block text-white">Has a Journey.</span>
          </h2>
          <p className="mt-5 text-lg md:text-xl text-purple-200/80 font-normal leading-relaxed text-balance">
            Education is not a snapshot score. It is an evolving progression from freshman foundation
            to confident career launch.
          </p>
        </div>

        {/* Interactive Evolutionary Stepper Flow */}
        <div className="glass-panel rounded-3xl p-6 md:p-10 border border-purple-500/20 shadow-2xl">
          {/* Stepper Navigation Track */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pb-8 border-b border-white/10">
            {STAGES.map((stage) => {
              const isCurrent = stage.id === activeStageId;
              const IconComp = stage.icon;

              return (
                <button
                  key={stage.id}
                  onClick={() => setActiveStageId(stage.id)}
                  className={`group p-3.5 rounded-2xl flex flex-col items-start justify-between text-left transition-all duration-300 border cursor-pointer ${
                    isCurrent
                      ? 'bg-purple-900/60 border-pink-400/50 shadow-lg shadow-pink-500/20'
                      : 'bg-[#15092a]/60 border-white/5 hover:border-purple-400/30'
                  }`}
                >
                  <div className="w-full flex items-center justify-between text-xs mb-3">
                    <span className="font-mono text-purple-400 font-semibold">{stage.step}</span>
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${stage.color}22`, color: stage.color }}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <span className={`text-xs md:text-sm font-bold font-display ${isCurrent ? 'text-white' : 'text-purple-200/70 group-hover:text-white'}`}>
                    {stage.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Stage Deep-Dive */}
          <div className="py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-pink-300 mb-2">
                <span>Phase {activeStage.step} of 06</span>
                <span>·</span>
                <span>{activeStage.subtitle}</span>
              </div>
              <h3 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
                {activeStage.title}
              </h3>
              <p className="text-base sm:text-lg text-purple-100/90 leading-relaxed max-w-2xl">
                {activeStage.description}
              </p>

              {/* Verified Milestone Box */}
              <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-xs uppercase tracking-widest text-purple-300 font-medium block mb-1">
                  Target Progression Milestone
                </span>
                <span className="text-sm font-semibold text-white">
                  {activeStage.milestone}
                </span>
              </div>
            </div>

            {/* Observed Behavioral Signals in this Phase */}
            <div className="lg:col-span-5 bg-[#170a2f]/80 p-6 rounded-2xl border border-purple-500/20">
              <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider block mb-4">
                Telemetry & Behavioral Signals Tracked
              </span>
              <div className="space-y-3">
                {activeStage.signalsObserved.map((sig, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl bg-purple-950/40 border border-purple-500/15 text-xs sm:text-sm text-purple-100"
                  >
                    <span className="w-2 h-2 rounded-full bg-pink-400" />
                    <span>{sig}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
