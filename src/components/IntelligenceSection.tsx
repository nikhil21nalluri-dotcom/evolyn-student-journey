import React, { useState, useEffect } from 'react';
import { Play, Pause, ArrowRight, TrendingDown, Clock, CheckCircle2 } from 'lucide-react';

interface WeekData {
  week: number;
  label: string;
  milestone: string;
  summary: string;
  metrics: {
    name: string;
    value: number;
    delta: string;
    trend: 'stable' | 'down' | 'warning' | 'alert';
    unit: string;
  }[];
  insight: string;
  evolynFlag: string;
}

const WEEKS_DATA: WeekData[] = [
  {
    week: 1,
    label: 'Week 1',
    milestone: 'Semester Kickoff',
    summary: 'High initial momentum, enthusiastic orientation, all metrics within target baseline.',
    metrics: [
      { name: 'Attendance', value: 98, delta: '+2%', trend: 'stable', unit: '%' },
      { name: 'Engagement', value: 94, delta: '+4%', trend: 'stable', unit: 'pts' },
      { name: 'Academic Performance', value: 89, delta: '0%', trend: 'stable', unit: '%' },
      { name: 'Assignment Completion', value: 100, delta: '100%', trend: 'stable', unit: '%' },
      { name: 'Communication', value: 85, delta: 'Normal', trend: 'stable', unit: 'pts' },
      { name: 'Participation', value: 92, delta: 'Active', trend: 'stable', unit: 'pts' },
    ],
    insight: 'All signals aligned. Solid baseline confidence profile established.',
    evolynFlag: 'Trajectory Optimal',
  },
  {
    week: 2,
    label: 'Week 2',
    milestone: 'First Project Assignment',
    summary: 'Scores remain intact, but subtle reduction in peer review participation and forum visits.',
    metrics: [
      { name: 'Attendance', value: 92, delta: '-6%', trend: 'stable', unit: '%' },
      { name: 'Engagement', value: 83, delta: '-11%', trend: 'warning', unit: 'pts' },
      { name: 'Academic Performance', value: 88, delta: '-1%', trend: 'stable', unit: '%' },
      { name: 'Assignment Completion', value: 95, delta: '-5%', trend: 'stable', unit: '%' },
      { name: 'Communication', value: 78, delta: '-7%', trend: 'warning', unit: 'pts' },
      { name: 'Participation', value: 76, delta: '-16%', trend: 'warning', unit: 'pts' },
    ],
    insight: 'Engagement velocity shifts negative (-11pts). Legacy LMS reports 88% and remains dormant.',
    evolynFlag: 'Subtle Deceleration Detected',
  },
  {
    week: 3,
    label: 'Week 3',
    milestone: 'Mid-Module Concepts',
    summary: 'Submissions shift to 11:50 PM. Lab session questions cease. Gradebook still shows 85%.',
    metrics: [
      { name: 'Attendance', value: 79, delta: '-13%', trend: 'warning', unit: '%' },
      { name: 'Engagement', value: 68, delta: '-15%', trend: 'warning', unit: 'pts' },
      { name: 'Academic Performance', value: 85, delta: '-3%', trend: 'stable', unit: '%' },
      { name: 'Assignment Completion', value: 88, delta: '-7%', trend: 'warning', unit: '%' },
      { name: 'Communication', value: 62, delta: '-16%', trend: 'alert', unit: 'pts' },
      { name: 'Participation', value: 58, delta: '-18%', trend: 'alert', unit: 'pts' },
    ],
    insight: 'Multi-signal divergence confirmed: 3 non-grade indicators drop >15% concurrently.',
    evolynFlag: 'Early Warning Pattern Detected',
  },
  {
    week: 4,
    label: 'Week 4',
    milestone: 'Pre-Midterm Preparation',
    summary: 'Student misses consecutive office hour sessions and drops forum participation to 0.',
    metrics: [
      { name: 'Attendance', value: 67, delta: '-12%', trend: 'alert', unit: '%' },
      { name: 'Engagement', value: 54, delta: '-14%', trend: 'alert', unit: 'pts' },
      { name: 'Academic Performance', value: 82, delta: '-3%', trend: 'warning', unit: '%' },
      { name: 'Assignment Completion', value: 78, delta: '-10%', trend: 'alert', unit: '%' },
      { name: 'Communication', value: 48, delta: '-14%', trend: 'alert', unit: 'pts' },
      { name: 'Participation', value: 42, delta: '-16%', trend: 'alert', unit: 'pts' },
    ],
    insight: 'Traditional systems still show B-grade (82%). Evolyn recommends proactive advisor check-in.',
    evolynFlag: 'Actionable Support Recommended',
  },
];

export const IntelligenceSection: React.FC = () => {
  const [activeWeekIndex, setActiveWeekIndex] = useState(2); // default week 3
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setActiveWeekIndex((prev) => (prev + 1) % WEEKS_DATA.length);
      }, 3200);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const currentData = WEEKS_DATA[activeWeekIndex];

  return (
    <section id="intelligence" className="relative w-full py-28 px-6 md:px-12 z-20">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold tracking-widest uppercase text-purple-300 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4">
            <span>Dynamic Longitudinal Analysis</span>
          </div>
          <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white">
            Understand The Change.
          </h2>
          <p className="mt-5 text-lg md:text-xl text-purple-200/80 font-normal leading-relaxed text-balance">
            Evolyn analyzes student journeys over time to discover meaningful patterns
            that traditional analytics can miss.
          </p>
        </div>

        {/* Timeline Orchestration Container */}
        <div className="glass-panel rounded-3xl p-6 md:p-10 border border-purple-500/20 shadow-2xl">
          {/* Week Selector Bar & Play/Pause Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-8 border-b border-white/10">
            {/* Interactive Timeline Tabs */}
            <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto w-full sm:w-auto p-1 bg-[#150a2b]/80 rounded-2xl border border-white/5">
              {WEEKS_DATA.map((item, index) => {
                const isActive = index === activeWeekIndex;
                return (
                  <button
                    key={item.week}
                    onClick={() => {
                      setActiveWeekIndex(index);
                      setIsPlaying(false);
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-pink-500/30'
                        : 'text-purple-300/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{item.label}</span>
                    {index < WEEKS_DATA.length - 1 && (
                      <ArrowRight className="w-3 h-3 text-purple-400/50 hidden md:inline" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Scrubber Playback Action */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-purple-200 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 text-pink-400" /> : <Play className="w-3.5 h-3.5 text-pink-400" />}
                <span>{isPlaying ? 'Pause Timeline' : 'Auto-Play Journey'}</span>
              </button>
            </div>
          </div>

          {/* Current Week Context Bar */}
          <div className="py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-purple-300">
                <Clock className="w-3.5 h-3.5 text-pink-400" />
                <span>{currentData.milestone}</span>
                <span>·</span>
                <span className="text-white font-medium">{currentData.label} Observation Period</span>
              </div>
              <p className="mt-1 text-sm md:text-base text-purple-100/90 max-w-2xl">
                {currentData.summary}
              </p>
            </div>

            {/* Evolyn Status Badge */}
            <div className="shrink-0 flex items-center gap-2.5 px-4 py-2 rounded-xl bg-purple-900/40 border border-purple-400/30">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-400 animate-pulse" />
              <div className="text-left">
                <span className="block text-[10px] uppercase tracking-wider text-purple-300 font-medium">Evolyn Status</span>
                <span className="text-xs md:text-sm font-semibold text-white">{currentData.evolynFlag}</span>
              </div>
            </div>
          </div>

          {/* Dynamic Metric Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
            {currentData.metrics.map((m) => {
              const isAlert = m.trend === 'alert';
              const isWarning = m.trend === 'warning';

              return (
                <div
                  key={m.name}
                  className={`p-4 rounded-2xl transition-all duration-300 border ${
                    isAlert
                      ? 'bg-rose-950/20 border-rose-500/30'
                      : isWarning
                      ? 'bg-amber-950/20 border-amber-500/30'
                      : 'bg-[#180d32]/60 border-white/5 hover:border-purple-500/20'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-purple-300">
                    <span className="font-medium text-white">{m.name}</span>
                    <span
                      className={`font-mono tabular-nums font-semibold ${
                        isAlert ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {m.delta}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1 bg-white/5 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isAlert
                            ? 'bg-gradient-to-r from-rose-500 to-pink-500'
                            : isWarning
                            ? 'bg-gradient-to-r from-amber-500 to-pink-500'
                            : 'bg-gradient-to-r from-purple-500 to-emerald-400'
                        }`}
                        style={{ width: `${m.value}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold font-mono tabular-nums text-white">
                      {m.value}{m.unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Longitudinal Intelligence Insight Callout */}
          <div className="mt-8 p-5 rounded-2xl bg-[#140827] border border-purple-500/30 flex items-start gap-3.5">
            <CheckCircle2 className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs uppercase tracking-widest font-semibold text-pink-300">
                Longitudinal Differential Insight
              </span>
              <p className="mt-1 text-sm text-purple-100/90 leading-relaxed">
                {currentData.insight}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
