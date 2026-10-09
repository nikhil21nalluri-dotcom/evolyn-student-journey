import React, { useState } from 'react';

export const SimulatorSection: React.FC = () => {
  const [week, setWeek] = useState<number>(3);
  const [activeTab, setActiveTab] = useState<'drift' | 'simulation'>('drift');

  const recoveryFactor = Math.max(0.15, 1 - (week - 2) * 0.16);
  const supportedScore = Math.round(64 + recoveryFactor * 24);
  const unsupportedScore = 56;

  return (
    <section id="simulator" className="py-20 px-6 max-w-6xl mx-auto relative z-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="font-baskerville text-3xl sm:text-4xl md:text-5xl font-bold text-[#f0f1ff] mb-2 tracking-tight">
            Understand The Student. <span className="gradient-acc-text">Not Just The Score.</span>
          </h2>
          <p className="text-[#a4a9d0] text-base max-w-xl leading-relaxed">
            Grades tell us what happened. Evolyn deciphers why it happened and simulates early support.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 bg-[rgba(14,16,40,0.7)] border border-[rgba(140,150,255,0.18)] rounded-full self-start md:self-auto">
          <button
            onClick={() => setActiveTab('drift')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'drift'
                ? 'bg-[#ff6a2b] text-white shadow-md'
                : 'text-[#a4a9d0] hover:text-[#f0f1ff]'
            }`}
          >
            Silent Struggle
          </button>
          <button
            onClick={() => setActiveTab('simulation')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'simulation'
                ? 'bg-[#ff6a2b] text-white shadow-md'
                : 'text-[#a4a9d0] hover:text-[#f0f1ff]'
            }`}
          >
            Action Simulator
          </button>
        </div>
      </div>

      <div className="glass-card p-6 sm:p-10 border border-[rgba(140,150,255,0.18)]">
        {activeTab === 'drift' ? (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-[rgba(140,150,255,0.18)] gap-2">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#a4a9d0] font-mono">
                  Observed Case Study · Elena Vance (CS Sophomore)
                </span>
                <h3 className="font-baskerville text-xl sm:text-2xl font-bold text-[#f0f1ff] mt-0.5">
                  Summative Exam Grade: <span className="text-[#4d6bff]">82% (Looks Healthy)</span>
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#ff6a2b]/20 text-[#ff6a2b] border border-[#ff6a2b]/30">
                Early Risk Indicator Detected
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Traditional view */}
              <div className="p-5 rounded-xl bg-black/25 border border-[rgba(140,150,255,0.12)]">
                <span className="text-xs font-semibold text-[#a4a9d0] uppercase tracking-wider block mb-2">
                  Legacy LMS Perspective
                </span>
                <div className="text-3xl font-baskerville font-bold text-[#4d6bff] mb-1">Grade: B</div>
                <p className="text-xs text-[#a4a9d0] leading-relaxed mb-4">
                  Standard threshold alerts only fire below 70%. The institution remains completely unaware of silent disengagement.
                </p>
                <div className="text-xs text-[#f0f1ff]/80 p-2.5 rounded bg-white/5">
                  Status: No alert raised (Blindspot)
                </div>
              </div>

              {/* Evolyn Multi-Signal view */}
              <div className="p-5 rounded-xl bg-[rgba(255,106,43,0.06)] border border-[#ff6a2b]/30">
                <span className="text-xs font-semibold text-[#ff6a2b] uppercase tracking-wider block mb-2">
                  Evolyn Trajectory Synthesis
                </span>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-[#a4a9d0]">Attendance Cadence</span>
                    <span className="text-rose-400 font-mono font-bold">88% → 72% ↓</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-[#a4a9d0]">LMS Resource Depth</span>
                    <span className="text-rose-400 font-mono font-bold">-24 pts velocity ↓</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-[#a4a9d0]">Peer Collaboration</span>
                    <span className="text-rose-400 font-mono font-bold">Silent (11d zero contact) ↓</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#a4a9d0]">Assignment Timing</span>
                    <span className="text-amber-400 font-mono font-bold">Shifted to Last-Hour ↓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-[rgba(140,150,255,0.18)] gap-2">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#a4a9d0] font-mono">
                  Scenario Decision-Support Simulation
                </span>
                <h3 className="font-baskerville text-xl sm:text-2xl font-bold text-[#f0f1ff] mt-0.5">
                  Intervention Window: <span className="text-[#ff6a2b]">Week {week} Outreach</span>
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[#a4a9d0]">
                Illustrative trajectory model
              </span>
            </div>

            <div className="mt-6 mb-8">
              <label className="text-xs text-[#a4a9d0] flex justify-between mb-2">
                <span>Adjust outreach timing:</span>
                <span className="font-mono text-[#ff6a2b] font-bold">Week {week} of Semester</span>
              </label>
              <input
                type="range"
                min={2}
                max={7}
                step={1}
                value={week}
                onChange={(e) => setWeek(Number(e.target.value))}
                className="w-full accent-[#ff6a2b] cursor-pointer h-2 bg-black/40 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-[#a4a9d0] mt-1 font-mono">
                <span>Week 2 (Early Drift)</span>
                <span>Week 4 (Mid-Course)</span>
                <span>Week 7 (Late Midterm)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-center">
              <div className="p-5 rounded-xl bg-rose-950/20 border border-rose-500/30">
                <span className="text-xs text-rose-300 font-semibold block mb-1">Without Early Support</span>
                <div className="font-baskerville text-3xl font-bold text-rose-400">~{unsupportedScore}% Final Score</div>
                <p className="text-xs text-[#a4a9d0] mt-2">Disengagement deepens. Emergency recovery required.</p>
              </div>

              <div className="p-5 rounded-xl bg-[rgba(255,106,43,0.1)] border border-[#ff6a2b]/40">
                <span className="text-xs text-[#ffb27a] font-semibold block mb-1">With Week {week} Mentor Check-In</span>
                <div className="font-baskerville text-3xl font-bold text-emerald-400">~{supportedScore}% Mastery Recovery</div>
                <p className="text-xs text-[#a4a9d0] mt-2">Confidence re-established before foundational gap widens.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
