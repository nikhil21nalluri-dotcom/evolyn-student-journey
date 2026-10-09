import React from 'react';
import { AlertTriangle, Eye, ShieldCheck, ArrowDownRight, CheckCircle } from 'lucide-react';

export const SilentStruggleSection: React.FC = () => {
  return (
    <section id="silent-struggle" className="relative w-full py-28 px-6 md:px-12 z-20">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold tracking-widest uppercase text-pink-300 rounded-full bg-pink-500/10 border border-pink-500/20 mb-4">
            <span>Silent Disengagement Diagnostics</span>
          </div>
          <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white">
            Not Every Struggle Looks Like Failure.
          </h2>
          <p className="mt-5 text-lg md:text-xl text-purple-200/80 font-normal leading-relaxed text-balance">
            A student can appear academically successful while quietly disengaging.
          </p>
        </div>

        {/* Cinematic Dual-Perspective Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Legacy Dashboard View (The Institutional Blindspot) */}
          <div className="lg:col-span-5 rounded-3xl p-6 md:p-8 bg-[#120724]/80 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-purple-400" />
                  <span className="text-xs uppercase tracking-wider text-purple-300 font-semibold">
                    Legacy LMS Perspective
                  </span>
                </div>
                <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Status: Good Standing
                </span>
              </div>

              <div className="py-8 text-center">
                <span className="text-xs uppercase tracking-widest text-purple-300 block mb-1">
                  Summative Course Grade
                </span>
                <div className="text-6xl font-display font-black text-emerald-400 font-mono">
                  82%
                </div>
                <span className="text-xs text-purple-300/70 mt-2 block">
                  Grade: B · Class Percentile: 64th
                </span>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between text-xs py-2 border-b border-white/5 text-purple-200/70">
                  <span>Midterm Exam 1</span>
                  <span className="font-mono text-white font-medium">84 / 100</span>
                </div>
                <div className="flex justify-between text-xs py-2 border-b border-white/5 text-purple-200/70">
                  <span>Quiz Average</span>
                  <span className="font-mono text-white font-medium">81 / 100</span>
                </div>
                <div className="flex justify-between text-xs py-2 text-purple-200/70">
                  <span>Portal Alert Status</span>
                  <span className="text-purple-400 font-medium">No Alerts Triggered</span>
                </div>
              </div>
            </div>

            <div className="mt-8 p-3.5 rounded-xl bg-purple-900/20 border border-purple-500/10 text-xs text-purple-300/80 leading-relaxed">
              <strong>The Blind Spot:</strong> Traditional thresholds only flag students below 70%.
              By the time an 82% drops to an F, the student is already disengaged and weeks of critical
              intervention windows have elapsed.
            </div>
          </div>

          {/* Evolyn Journey Intelligence View (The True Multi-Vector Reality) */}
          <div className="lg:col-span-7 rounded-3xl p-6 md:p-8 glass-panel-glow border border-pink-500/30 flex flex-col justify-between relative overflow-hidden">
            {/* Ambient Corner Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-pink-400" />
                  <span className="text-xs uppercase tracking-wider text-pink-200 font-semibold">
                    Evolyn Journey Intelligence
                  </span>
                </div>

                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-400/30 text-pink-300 text-xs font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5 animate-pulse text-pink-400" />
                  <span>Early Change Detected</span>
                </div>
              </div>

              <div className="py-6">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-sm font-semibold text-white">Underlying Behavioral Drift</span>
                  <span className="text-xs text-pink-300 font-mono">Multi-Signal Deceleration</span>
                </div>

                {/* Behavioral Drift Breakdown List */}
                <div className="space-y-3 mt-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#1d0d38]/80 border border-pink-500/20">
                    <span className="text-xs sm:text-sm text-purple-100 font-medium">Academic Score</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-mono font-bold text-white">82%</span>
                      <span className="text-xs text-purple-300 font-mono">(Appears Stable)</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-rose-950/20 border border-rose-500/30">
                    <span className="text-xs sm:text-sm text-purple-100 font-medium">Attendance & Presence</span>
                    <div className="flex items-center gap-2">
                      <ArrowDownRight className="w-4 h-4 text-rose-400" />
                      <span className="text-xs sm:text-sm font-mono font-bold text-rose-400">Declining (88% → 72%)</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-rose-950/20 border border-rose-500/30">
                    <span className="text-xs sm:text-sm text-purple-100 font-medium">LMS Resource Engagement</span>
                    <div className="flex items-center gap-2">
                      <ArrowDownRight className="w-4 h-4 text-rose-400" />
                      <span className="text-xs sm:text-sm font-mono font-bold text-rose-400">Declining (-24pts)</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-rose-950/20 border border-rose-500/30">
                    <span className="text-xs sm:text-sm text-purple-100 font-medium">Peer & Forum Participation</span>
                    <div className="flex items-center gap-2">
                      <ArrowDownRight className="w-4 h-4 text-rose-400" />
                      <span className="text-xs sm:text-sm font-mono font-bold text-rose-400">Silent (Last active: 11d ago)</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-rose-950/20 border border-rose-500/30">
                    <span className="text-xs sm:text-sm text-purple-100 font-medium">Assignment Consistency</span>
                    <div className="flex items-center gap-2">
                      <ArrowDownRight className="w-4 h-4 text-rose-400" />
                      <span className="text-xs sm:text-sm font-mono font-bold text-rose-400">Shifting to Last-Hour</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Responsible AI Verification Footer */}
            <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-purple-200/80">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pink-400" />
                <span className="font-medium text-pink-300">Early warning pattern detected</span>
                <span>·</span>
                <span>Risk indicator surfaced</span>
              </div>
              <span className="text-[11px] text-purple-400/80">
                Non-deterministic guidance · Human advisor verified
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
