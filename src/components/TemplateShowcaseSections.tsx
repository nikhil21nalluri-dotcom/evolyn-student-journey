import React from 'react';
import { Star, Diamond, Zap, Compass, Sparkles, Activity } from 'lucide-react';

export const TemplateShowcaseSections: React.FC = () => {
  return (
    <div className="relative w-full z-20 pointer-events-auto">
      {/* 1. EDITORIAL STATEMENT SECTION (Frame 00:02 - 00:03 of reference template) */}
      <section className="relative w-full py-28 px-6 md:px-12 flex flex-col items-center justify-center text-center">
        <div className="max-w-4xl mx-auto">
          <p className="font-display font-medium text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem] leading-[1.35] text-purple-100/90 text-balance tracking-tight">
            We present intelligent paradigms that merge <span className="text-white font-bold">remarkable signal depth</span>, real-time context, and <span className="text-pink-300 font-semibold">human-centered mentorship</span>. Each insight is surfaced for the <span className="text-gradient-ethereal font-bold">trajectory it protects</span>, not merely the score it records.
          </p>
        </div>

        {/* Brand / Dimension Ticker Strip (Frame 00:03 of reference template) */}
        <div className="w-full max-w-5xl mx-auto mt-16 overflow-hidden">
          {/* Row 1 */}
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 text-xs md:text-sm font-semibold tracking-widest uppercase text-purple-200/60 pb-6 border-b border-white/5">
            <span className="flex items-center gap-2 hover:text-white transition-colors">
              <Star className="w-3.5 h-3.5 text-pink-400" /> Pinnacle Accuracy
            </span>
            <span className="flex items-center gap-2 hover:text-white transition-colors">
              <Diamond className="w-3.5 h-3.5 text-purple-400" /> Prism Signals
            </span>
            <span className="flex items-center gap-2 hover:text-white transition-colors">
              <Activity className="w-3.5 h-3.5 text-pink-300" /> Cascade Velocity
            </span>
            <span className="flex items-center gap-2 hover:text-white transition-colors">
              <Star className="w-3.5 h-3.5 text-pink-400" /> Longitudinal Drift
            </span>
            <span className="flex items-center gap-2 hover:text-white transition-colors">
              <Diamond className="w-3.5 h-3.5 text-purple-400" /> Prerequisite Mastery
            </span>
          </div>

          {/* Row 2 */}
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 text-xs md:text-sm font-semibold tracking-widest uppercase text-purple-200/50 pt-6">
            <span className="flex items-center gap-2 hover:text-white transition-colors">
              Nexus Vector
            </span>
            <span className="flex items-center gap-2 hover:text-white transition-colors">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" /> Radiant Insights
            </span>
            <span className="flex items-center gap-2 hover:text-white transition-colors">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Impulse Detection
            </span>
            <span className="flex items-center gap-2 hover:text-white transition-colors">
              Nexus Vector
            </span>
            <span className="flex items-center gap-2 hover:text-white transition-colors">
              <Compass className="w-3.5 h-3.5 text-cyan-400" /> Trajectory Guidance
            </span>
          </div>
        </div>
      </section>

      {/* 2. STATS SECTION: "Only the proven results here" (Frame 00:04 of reference template) */}
      <section className="relative w-full py-20 px-6 md:px-12 bg-[#120724]/70 backdrop-blur-md border-y border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight mb-14">
            Only the proven results here
          </h3>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 divide-y md:divide-y-0 md:divide-x divide-white/10 text-center">
            {/* Stat 1 */}
            <div className="pt-6 md:pt-0 md:px-4">
              <div className="font-display font-black text-4xl sm:text-5xl md:text-6xl text-white font-mono tabular-nums tracking-tight">
                3.4x
              </div>
              <div className="mt-2 text-xs sm:text-sm font-medium uppercase tracking-wider text-purple-200/70">
                Earlier Risk Detection
              </div>
            </div>

            {/* Stat 2 */}
            <div className="pt-6 md:pt-0 md:px-4">
              <div className="font-display font-black text-4xl sm:text-5xl md:text-6xl text-white font-mono tabular-nums tracking-tight">
                89%
              </div>
              <div className="mt-2 text-xs sm:text-sm font-medium uppercase tracking-wider text-purple-200/70">
                Retention Rebound Rate
              </div>
            </div>

            {/* Stat 3 */}
            <div className="pt-6 md:pt-0 md:px-4">
              <div className="font-display font-black text-4xl sm:text-5xl md:text-6xl text-white font-mono tabular-nums tracking-tight">
                14d
              </div>
              <div className="mt-2 text-xs sm:text-sm font-medium uppercase tracking-wider text-purple-200/70">
                Leading Signal Window
              </div>
            </div>

            {/* Stat 4 */}
            <div className="pt-6 md:pt-0 md:px-4">
              <div className="font-display font-black text-4xl sm:text-5xl md:text-6xl text-white font-mono tabular-nums tracking-tight">
                98%
              </div>
              <div className="mt-2 text-xs sm:text-sm font-medium uppercase tracking-wider text-purple-200/70">
                Advisor Alignment
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
