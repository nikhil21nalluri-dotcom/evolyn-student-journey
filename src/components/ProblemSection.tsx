import React, { useState } from 'react';
import { Sparkles, Activity, Clock, FileText, Users, MessageSquare, Compass, TrendingUp } from 'lucide-react';

interface Signal {
  id: string;
  name: string;
  category: string;
  score: number;
  change: string;
  description: string;
  earlyWarningLeadTime: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  x: number; // percentage in spatial canvas
  y: number;
}

const SIGNALS: Signal[] = [
  {
    id: 'academic',
    name: 'Academic Performance',
    category: 'Lagging Metric',
    score: 84,
    change: '-2%',
    description: 'Summative exam grades and midterm outcomes. Reflects past retention, but often lags behavioural disengagement by 3-6 weeks.',
    earlyWarningLeadTime: 'Lags by ~4 weeks',
    icon: Activity,
    color: '#818cf8',
    x: 50,
    y: 18,
  },
  {
    id: 'attendance',
    name: 'Attendance & Presence',
    category: 'Leading Indicator',
    score: 68,
    change: '-16%',
    description: 'Physical & virtual lecture presence, punctuality, and lab attendance velocity. The first subtle indicator of friction.',
    earlyWarningLeadTime: 'Surfaces 2-3 weeks early',
    icon: Clock,
    color: '#f472b6',
    x: 22,
    y: 35,
  },
  {
    id: 'assignments',
    name: 'Assignment Cadence',
    category: 'Behavioral Drift',
    score: 72,
    change: '-12%',
    description: 'Submission timing distribution. Shifts from early submittal to last-hour uploads often herald conceptual overload.',
    earlyWarningLeadTime: 'Surfaces 10-14 days early',
    icon: FileText,
    color: '#c084fc',
    x: 78,
    y: 32,
  },
  {
    id: 'engagement',
    name: 'LMS & Resource Engagement',
    category: 'Depth Metric',
    score: 59,
    change: '-24%',
    description: 'Reading completion depth, repository commit cadence, and interactive lab exercise engagement frequency.',
    earlyWarningLeadTime: 'Surfaces 18-21 days early',
    icon: Sparkles,
    color: '#38bdf8',
    x: 15,
    y: 65,
  },
  {
    id: 'communication',
    name: 'Communication & Outreach',
    category: 'Affective Signal',
    score: 62,
    change: '-18%',
    description: 'Office hours participation, TA clarification queries, and academic advisor check-in frequency.',
    earlyWarningLeadTime: 'Surfaces 14 days early',
    icon: MessageSquare,
    color: '#ec4899',
    x: 82,
    y: 68,
  },
  {
    id: 'participation',
    name: 'Peer & Seminar Participation',
    category: 'Community Signal',
    score: 54,
    change: '-22%',
    description: 'Forum contributions, breakout room dialogue, and peer review interaction depth.',
    earlyWarningLeadTime: 'Surfaces 12-16 days early',
    icon: Users,
    color: '#fb7185',
    x: 34,
    y: 82,
  },
  {
    id: 'skills',
    name: 'Skill Mastery Velocity',
    category: 'Competency Signal',
    score: 76,
    change: '+3%',
    description: 'Formative micro-concept comprehension quizzes and code/proof verification checkpoints.',
    earlyWarningLeadTime: 'Micro-diagnostic cadence',
    icon: Compass,
    color: '#34d399',
    x: 66,
    y: 80,
  },
  {
    id: 'progress',
    name: 'Longitudinal Trajectory',
    category: 'Holistic Vector',
    score: 69,
    change: '-9%',
    description: 'Long-term momentum vector synthesis: tracks whether micro-fluctuations are transient or systemic.',
    earlyWarningLeadTime: 'Continuous synthesis',
    icon: TrendingUp,
    color: '#a78bfa',
    x: 50,
    y: 50,
  },
];

export const ProblemSection: React.FC = () => {
  const [selectedSignal, setSelectedSignal] = useState<Signal>(SIGNALS[1]); // default to Attendance

  return (
    <section id="problem" className="relative w-full py-28 px-6 md:px-12 z-20">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold tracking-widest uppercase text-pink-300 rounded-full bg-pink-500/10 border border-pink-500/20 mb-4">
            <span>Beyond Static Transcripts</span>
          </div>
          <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white">
            Students Are More Than Numbers.
          </h2>
          <p className="mt-5 text-lg md:text-xl text-purple-200/80 font-normal leading-relaxed text-balance">
            Grades tell us what happened. <br className="hidden sm:inline" />
            <span className="text-pink-300 font-medium">They don't always tell us why.</span>
          </p>
        </div>

        {/* Spatial Constellation Canvas (Spatial data visualization, not cards!) */}
        <div className="relative w-full rounded-3xl glass-panel p-6 md:p-12 border border-purple-500/20 overflow-hidden shadow-2xl shadow-purple-950/40">
          {/* Subtle Ambient Radial Lighting */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Spatial Visualizer: Constellation / Orbiting Signals */}
            <div className="lg:col-span-7 relative h-[440px] md:h-[500px] w-full rounded-2xl bg-[#120826]/70 border border-white/5 p-4 overflow-hidden flex items-center justify-center">
              {/* Ethereal Central Core representing Student Nucleus */}
              <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
                <div className="relative w-28 h-28 rounded-full bg-gradient-to-tr from-purple-600/40 to-pink-500/40 border border-purple-300/30 backdrop-blur-md flex flex-col items-center justify-center shadow-lg shadow-purple-500/30">
                  <span className="text-[10px] uppercase tracking-widest text-purple-200 font-semibold">Student Core</span>
                  <span className="text-xl font-display font-bold text-white">Trajectory</span>
                  <span className="text-[10px] text-pink-300">8 Living Signals</span>
                  {/* Subtle pulsing ring */}
                  <div className="absolute inset-0 rounded-full border border-pink-400/30 animate-ping opacity-25" />
                </div>
              </div>

              {/* Orbital Ring Guide Lines */}
              <div className="absolute w-[220px] h-[220px] rounded-full border border-purple-500/15 pointer-events-none" />
              <div className="absolute w-[340px] h-[340px] rounded-full border border-purple-500/10 pointer-events-none" />
              <div className="absolute w-[440px] h-[440px] rounded-full border border-pink-500/10 pointer-events-none" />

              {/* Connecting thread lines from Core to Selected Signal */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {SIGNALS.map((sig) => (
                  <line
                    key={`line-${sig.id}`}
                    x1="50%"
                    y1="50%"
                    x2={`${sig.x}%`}
                    y2={`${sig.y}%`}
                    stroke={selectedSignal.id === sig.id ? sig.color : 'rgba(168, 85, 247, 0.18)'}
                    strokeWidth={selectedSignal.id === sig.id ? '2' : '1'}
                    strokeDasharray={selectedSignal.id === sig.id ? 'none' : '4 4'}
                    className="transition-all duration-300"
                  />
                ))}
              </svg>

              {/* Floating Signal Nodes */}
              {SIGNALS.map((signal) => {
                const isSelected = selectedSignal.id === signal.id;
                const IconComponent = signal.icon;

                return (
                  <button
                    key={signal.id}
                    onClick={() => setSelectedSignal(signal)}
                    className={`absolute z-20 group flex items-center gap-2 p-2 rounded-full transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? 'bg-purple-900/90 border-2 shadow-lg shadow-purple-500/40 scale-110'
                        : 'bg-[#1a0f33]/80 border border-white/10 hover:border-purple-400/50 hover:scale-105'
                    }`}
                    style={{
                      left: `${signal.x}%`,
                      top: `${signal.y}%`,
                      transform: 'translate(-50%, -50%)',
                      borderColor: isSelected ? signal.color : undefined,
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: `${signal.color}33`, color: signal.color }}
                    >
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                    <span
                      className={`text-xs font-medium pr-2 transition-colors ${
                        isSelected ? 'text-white' : 'text-purple-200/70 group-hover:text-white'
                      }`}
                    >
                      {signal.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right Signal Deep-Dive (Explaining why single grades fail) */}
            <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-wider uppercase text-purple-300">
                    {selectedSignal.category}
                  </span>
                  <span className="text-xs font-medium text-pink-300 bg-pink-500/10 px-2.5 py-0.5 rounded-full border border-pink-500/20">
                    {selectedSignal.earlyWarningLeadTime}
                  </span>
                </div>

                <h3 className="font-display text-2xl md:text-3xl font-bold text-white mt-2">
                  {selectedSignal.name}
                </h3>

                <p className="mt-3 text-sm md:text-base text-purple-200/80 leading-relaxed">
                  {selectedSignal.description}
                </p>
              </div>

              {/* Quantitative Signal Comparison Metric */}
              <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/20">
                <div className="flex items-center justify-between text-xs text-purple-300 mb-1.5">
                  <span>Current Observable Level</span>
                  <span className="font-mono tabular-nums text-pink-300 font-semibold">{selectedSignal.change} 30-Day Shift</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${selectedSignal.score}%`,
                      backgroundColor: selectedSignal.color,
                    }}
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] text-purple-300/60 mt-1.5 font-mono tabular-nums">
                  <span>Baseline: 100%</span>
                  <span>Recorded: {selectedSignal.score}%</span>
                </div>
              </div>

              {/* The Core Insight Callout */}
              <div className="p-4 rounded-xl border border-white/10 bg-gradient-to-r from-purple-900/30 to-pink-900/20 text-xs text-purple-100/90 leading-relaxed">
                <strong className="text-pink-300 font-semibold block mb-1">
                  Why traditional institutions miss this:
                </strong>
                Traditional portals only query the summative gradebook at midterms.
                Evolyn correlates velocity across all 8 dimensions in real-time, catching drift
                before the gradebook ever registers a drop.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
