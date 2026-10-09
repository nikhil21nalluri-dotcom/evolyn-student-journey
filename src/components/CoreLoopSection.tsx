import React, { useState } from 'react';
import { Search, Brain, HandHeart, Sparkles, ArrowRight } from 'lucide-react';

interface LoopPhase {
  id: string;
  name: string;
  verb: string;
  description: string;
  actionableOutput: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PHASES: LoopPhase[] = [
  {
    id: 'detect',
    name: 'DETECT',
    verb: 'Multi-Signal Drift Discovery',
    description: 'Continuously monitors longitudinal velocity across 8 academic and engagement dimensions, identifying subtle deceleration weeks before summative exams.',
    actionableOutput: 'Surfaces early risk indicators without waiting for midterm grade drops.',
    color: '#818cf8',
    icon: Search,
  },
  {
    id: 'understand',
    name: 'UNDERSTAND',
    verb: 'Causal Reasoning Synthesis',
    description: 'Synthesizes qualitative context behind the numbers. Differentiates conceptual prerequisite blockers from motivation drift or acute burnout.',
    actionableOutput: 'Transforms "What changed" into "Why it happened" and historical cohort context.',
    color: '#c084fc',
    icon: Brain,
  },
  {
    id: 'intervene',
    name: 'INTERVENE',
    verb: 'Precision Human Outreach',
    description: 'Equips academic mentors, teaching assistants, and advisors with high-leverage guidance protocols tailored specifically to the diagnosed root cause.',
    actionableOutput: 'Delivers non-punitive, empathetic support directly to assigned staff.',
    color: '#ec4899',
    icon: HandHeart,
  },
  {
    id: 'evolve',
    name: 'EVOLVE',
    verb: 'Sustained Growth & Mastery',
    description: 'Validates recovery velocity and continuously adjusts the student trajectory model, cementing academic autonomy and placement readiness.',
    actionableOutput: 'Guides students from recovery to lifelong intellectual resilience.',
    color: '#38bdf8',
    icon: Sparkles,
  },
];

export const CoreLoopSection: React.FC = () => {
  const [selectedPhase, setSelectedPhase] = useState<LoopPhase>(PHASES[0]);

  return (
    <section id="insights" className="relative w-full py-28 px-6 md:px-12 z-20">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold tracking-widest uppercase text-pink-300 rounded-full bg-pink-500/10 border border-pink-500/20 mb-4">
            <span>The Continuous Closed Loop</span>
          </div>
          <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white">
            The Evolyn Intelligence Loop
          </h2>
          <p className="mt-5 text-lg md:text-xl text-purple-200/80 font-normal leading-relaxed text-balance">
            A continuous cycle designed not to judge, but to understand and elevate.
          </p>
        </div>

        {/* Spatial Stage Portals (Not conventional rectangular cards) */}
        <div className="relative">
          {/* Spatial Conduit Line connecting all 4 portals */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500/30 via-pink-500/40 to-cyan-500/30 -translate-y-12 z-0 pointer-events-none" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {PHASES.map((phase, index) => {
              const isSelected = selectedPhase.id === phase.id;
              const IconComp = phase.icon;

              return (
                <div
                  key={phase.id}
                  onClick={() => setSelectedPhase(phase)}
                  className={`group relative p-6 rounded-3xl transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-b from-purple-900/60 to-[#1b0a36]/90 border-2 shadow-2xl scale-[1.02]'
                      : 'bg-[#140828]/70 border border-white/10 hover:border-purple-400/30 hover:bg-[#1a0c33]/80'
                  }`}
                  style={{
                    borderColor: isSelected ? phase.color : undefined,
                    boxShadow: isSelected ? `0 0 35px -5px ${phase.color}33` : undefined,
                  }}
                >
                  <div>
                    {/* Ring Portal Icon */}
                    <div className="flex items-center justify-between mb-6">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                        style={{
                          backgroundColor: `${phase.color}22`,
                          color: phase.color,
                          border: `1px solid ${phase.color}44`,
                        }}
                      >
                        <IconComp className="w-7 h-7" />
                      </div>
                      <span className="font-mono text-xs font-bold text-purple-300/60">
                        0{index + 1}
                      </span>
                    </div>

                    <h3
                      className="font-display text-2xl font-black tracking-wider transition-colors mb-1"
                      style={{ color: isSelected ? '#ffffff' : '#e2d9f3' }}
                    >
                      {phase.name}
                    </h3>

                    <span className="text-xs font-medium text-pink-300 block mb-3">
                      {phase.verb}
                    </span>

                    <p className="text-xs sm:text-sm text-purple-200/80 leading-relaxed">
                      {phase.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-purple-300">
                    <span className="font-medium text-white/90">Click to focus</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Focused Phase Detail Bar */}
          <div className="mt-8 p-6 rounded-2xl glass-panel-glow border border-pink-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full animate-ping" style={{ backgroundColor: selectedPhase.color }} />
              <div>
                <span className="text-xs uppercase font-bold text-purple-200 tracking-wider">
                  Active Focus: {selectedPhase.name}
                </span>
                <p className="text-sm text-white/90 font-medium">
                  {selectedPhase.actionableOutput}
                </p>
              </div>
            </div>

            <span className="text-xs font-mono text-purple-300 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 shrink-0">
              Deterministic Privacy · Institutional Governed
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
