import React, { useState } from 'react';
import { Sliders, ArrowUpRight, ArrowDownRight, Compass, CheckCircle2, RotateCcw } from 'lucide-react';

export const InterventionSimulator: React.FC = () => {
  const [interventionWeek, setInterventionWeek] = useState<number>(3); // Slider: Week 2 to 8
  const [activeSupportType, setActiveSupportType] = useState<'mentor' | 'tutoring' | 'wellness'>('mentor');

  // Trajectory calculation based on intervention week
  // If intervened early (Week 2-3): high rebound (+24% engagement, 88% final score)
  // If intervened late (Week 6-8): partial recovery (72% final score)
  // If no intervention: negative slope down to 54%
  const recoveryFactor = Math.max(0.1, 1 - (interventionWeek - 2) * 0.14);
  const supportedScore = Math.round(62 + recoveryFactor * 26);
  const supportedEngagement = Math.round(48 + recoveryFactor * 42);
  const unsupportedScore = 58;
  const unsupportedEngagement = 36;

  return (
    <section id="simulator" className="relative w-full py-28 px-6 md:px-12 z-20">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold tracking-widest uppercase text-pink-300 rounded-full bg-pink-500/10 border border-pink-500/20 mb-4">
            <span>Decision Support Modeling</span>
          </div>
          <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white">
            What If We Acted Earlier?
          </h2>
          <p className="mt-5 text-lg md:text-xl text-purple-200/80 font-normal leading-relaxed text-balance">
            Explore how timely, human-centered outreach reshapes student trajectories before
            struggles become academic crises.
          </p>
        </div>

        {/* Simulator Dashboard Container */}
        <div className="glass-panel rounded-3xl p-6 md:p-10 border border-purple-500/20 shadow-2xl relative">
          {/* Simulation Protocol Disclaimer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-white/10 text-xs">
            <div className="flex items-center gap-2 text-purple-300">
              <Compass className="w-4 h-4 text-pink-400" />
              <span className="font-medium text-white">Institutional Simulation Sandbox</span>
              <span>·</span>
              <span className="text-purple-400">Illustrative outcome based on multi-cohort historical models</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-purple-400">
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">Scenario simulation</span>
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">Potential trajectory</span>
            </div>
          </div>

          {/* Interactive Controls Bar */}
          <div className="py-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Slider: Intervention Timing */}
            <div className="md:col-span-7 bg-[#170a2f]/80 p-5 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between text-xs text-purple-200 mb-2">
                <span className="font-semibold text-white flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-pink-400" />
                  Intervention Timing Milestone
                </span>
                <span className="font-mono text-pink-300 font-bold bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">
                  Week {interventionWeek} Outreach
                </span>
              </div>

              <input
                type="range"
                min={2}
                max={7}
                step={1}
                value={interventionWeek}
                onChange={(e) => setInterventionWeek(Number(e.target.value))}
                className="w-full accent-pink-500 cursor-pointer h-2 bg-purple-950/60 rounded-lg"
              />

              <div className="flex justify-between items-center text-[11px] text-purple-400 mt-2 font-mono">
                <span>Week 2 (Early Drift)</span>
                <span>Week 4 (Pre-Midterm)</span>
                <span>Week 7 (Late Midterm)</span>
              </div>
            </div>

            {/* Support Strategy Selector */}
            <div className="md:col-span-5 bg-[#170a2f]/80 p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
              <span className="text-xs font-semibold text-white mb-2">Support Archetype Strategy</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setActiveSupportType('mentor')}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    activeSupportType === 'mentor'
                      ? 'bg-purple-600 text-white font-semibold shadow-md shadow-purple-600/30'
                      : 'bg-white/5 text-purple-300/80 hover:text-white'
                  }`}
                >
                  Mentor 1-on-1
                </button>
                <button
                  onClick={() => setActiveSupportType('tutoring')}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    activeSupportType === 'tutoring'
                      ? 'bg-purple-600 text-white font-semibold shadow-md shadow-purple-600/30'
                      : 'bg-white/5 text-purple-300/80 hover:text-white'
                  }`}
                >
                  TA Lab Focus
                </button>
                <button
                  onClick={() => setActiveSupportType('wellness')}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    activeSupportType === 'wellness'
                      ? 'bg-purple-600 text-white font-semibold shadow-md shadow-purple-600/30'
                      : 'bg-white/5 text-purple-300/80 hover:text-white'
                  }`}
                >
                  Pacing Adjust
                </button>
              </div>
            </div>
          </div>

          {/* Cinematic Split Visualization: Current Path vs Supported Path */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {/* 1. CURRENT PATH (Without Intervention) */}
            <div className="rounded-2xl p-6 bg-rose-950/20 border border-rose-500/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-rose-500/20">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="font-display font-bold text-base text-white">Current Path</span>
                  </div>
                  <span className="text-[11px] font-mono text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-500/20">
                    Without Intervention
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-purple-200">Engagement Trajectory</span>
                    <span className="font-mono text-rose-400 flex items-center gap-1 font-bold">
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      {unsupportedEngagement} pts (Declining)
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-purple-200">Attendance Velocity</span>
                    <span className="font-mono text-rose-400 flex items-center gap-1 font-bold">
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      56% Lecture Presence
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-purple-200">Estimated Final Performance</span>
                    <span className="font-mono text-rose-400 flex items-center gap-1 font-bold">
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      ~{unsupportedScore}% (At-Risk / C- or D)
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-3.5 rounded-xl bg-black/30 border border-rose-500/20 text-xs text-rose-200/80 leading-relaxed">
                <strong>Projected Outcome:</strong> Isolation deepens. Student fails Midterm 2,
                necessitating emergency remedial tutoring or withdrawal.
              </div>
            </div>

            {/* 2. SUPPORTED PATH (With Early Support) */}
            <div className="rounded-2xl p-6 bg-gradient-to-br from-purple-950/30 to-pink-950/20 border border-pink-400/40 flex flex-col justify-between shadow-lg shadow-pink-950/30">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-pink-500/20">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-400 animate-pulse" />
                    <span className="font-display font-bold text-base text-white">Supported Path</span>
                  </div>
                  <span className="text-[11px] font-mono text-pink-300 bg-pink-950/40 px-2 py-0.5 rounded border border-pink-500/20">
                    Week {interventionWeek} Early Action
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-purple-200">Engagement Recovery</span>
                    <span className="font-mono text-emerald-400 flex items-center gap-1 font-bold">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      {supportedEngagement} pts (+{supportedEngagement - unsupportedEngagement})
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-purple-200">Attendance Velocity</span>
                    <span className="font-mono text-emerald-400 flex items-center gap-1 font-bold">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      {Math.round(70 + recoveryFactor * 22)}% Sustained Presence
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-purple-200">Estimated Final Performance</span>
                    <span className="font-mono text-emerald-400 flex items-center gap-1 font-bold">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      ~{supportedScore}% (Mastery Re-established)
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-100/90 leading-relaxed">
                <strong>Modeled Trajectory:</strong> Early outreach re-engages student confidence.
                Cadence stabilizes before foundational knowledge deficits cascade.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
