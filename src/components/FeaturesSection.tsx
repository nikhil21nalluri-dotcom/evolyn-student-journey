import React, { useState } from 'react';

interface FeatureCard {
  icon: string;
  title: string;
  description: string;
  detail: string;
  metric: string;
}

const FEATURES: FeatureCard[] = [
  {
    icon: '◉',
    title: 'Early-risk detection',
    description: 'Models flag falling attendance, grades, and engagement weeks ahead of summative exams.',
    detail: 'Surfaces subtle behavioral drift 14-21 days before traditional gradebooks show distress.',
    metric: '14-Day Lead Window',
  },
  {
    icon: '↗',
    title: 'Performance trends',
    description: 'Clean dashboards show multidimensional progress by subject, cohort, and semester.',
    detail: 'Correlates attendance velocity, assignment timing, and forum discussions into a single health vector.',
    metric: '8 Living Signals',
  },
  {
    icon: '✦',
    title: 'Personalised plans',
    description: 'AI recommends targeted study paths, learning resources, and mentors for each learner.',
    detail: 'Distinguishes prerequisite conceptual blockers from motivation drift to prescribe precision actions.',
    metric: 'Root-Cause Synthesis',
  },
  {
    icon: '☰',
    title: 'Advisor workspace',
    description: 'One unified view to prioritise outreach, track intervention outcomes, and support students.',
    detail: 'Provides advisors with conversation starter notes and non-punitive intervention blueprints.',
    metric: '98% Advisor Utility',
  },
];

interface FeaturesSectionProps {
  onNavigate?: (view: 'landing' | 'growth-track' | 'silent-struggle') => void;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ onNavigate }) => {
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);

  return (
    <section id="features" className="py-24 px-6 max-w-6xl mx-auto relative z-10">
      <h2 className="font-baskerville text-3xl sm:text-4xl md:text-5xl font-bold text-[#f0f1ff] mb-3 tracking-tight">
        Navigate every student's journey
      </h2>
      <p className="text-[#a4a9d0] text-base sm:text-lg max-w-xl mb-12 leading-relaxed">
        From raw academic data to clear, actionable guidance for students and advisors.
      </p>

      {/* Grid matching template */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {FEATURES.map((item, idx) => {
          const isExpanded = activeCardIndex === idx;

          return (
            <div
              key={item.title}
              onClick={() => setActiveCardIndex(isExpanded ? null : idx)}
              className="glass-card p-7 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[rgba(255,106,43,0.14)] text-[#ff6a2b] text-xl font-bold mb-4">
                  {item.icon}
                </div>
                <h3 className="font-baskerville text-lg sm:text-xl font-bold text-[#f0f1ff] mb-2">
                  {item.title}
                </h3>
                <p className="text-[#a4a9d0] text-sm leading-relaxed">
                  {item.description}
                </p>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-[rgba(140,150,255,0.18)] text-xs text-[#f0f1ff]/90 leading-relaxed bg-black/20 p-2.5 rounded-lg">
                    {item.detail}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-3 border-t border-[rgba(140,150,255,0.12)] flex items-center justify-between text-xs text-[#a4a9d0]">
                <span className="font-mono text-[#ff6a2b] font-semibold">{item.metric}</span>
                <span className="text-[11px] opacity-75">{isExpanded ? 'Less' : 'Learn more'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Flagship Intelligence Capabilities Callout */}
      {onNavigate && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[rgba(14,16,40,0.65)] border border-[rgba(140,150,255,0.22)] backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#ff6a2b] block mb-1">
              Core Platform Engines
            </span>
            <h4 className="font-baskerville text-xl sm:text-2xl font-bold text-white">
              Explore Live Intelligence Capabilities
            </h4>
            <p className="text-xs sm:text-sm text-[#a4a9d0] mt-1 max-w-xl">
              Experience the dual pillars of Evolyn: Multidimensional longitudinal growth tracking and
              non-obvious silent struggle detection.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('growth-track')}
              className="px-5 py-2.5 rounded-full text-xs font-baskerville font-bold text-white bg-black/40 border border-white/20 hover:border-[#ff6a2b] transition-all cursor-pointer"
            >
              Student Growth Track →
            </button>
            <button
              onClick={() => onNavigate('silent-struggle')}
              className="px-5 py-2.5 rounded-full text-xs font-baskerville font-bold text-white bg-gradient-to-r from-[#ff6a2b] to-[#6f8dff] hover:opacity-95 shadow-md shadow-[#ff6a2b]/25 transition-all cursor-pointer"
            >
              Silent Struggle Detection →
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
