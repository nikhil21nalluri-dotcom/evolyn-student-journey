import React, { useState } from 'react';
import { SilentStruggleStudent, TimeWindowOption, TimelineDataPoint } from '../../data/silentStruggleData';

interface TrendTimelineChartProps {
  student: SilentStruggleStudent;
  timeWindow: TimeWindowOption;
}

export const TrendTimelineChart: React.FC<TrendTimelineChartProps> = ({ student, timeWindow }) => {
  // Active metric series toggles
  const [activeMetrics, setActiveMetrics] = useState<Record<string, boolean>>({
    academic: true,
    engagement: true,
    attendance: true,
    assignments: true,
    participation: false,
    communication: false,
  });

  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Get data points for selected window
  const rawTimeline = student.timelineByWindow?.[timeWindow] ||
    student.timeWindowTimeline?.[timeWindow] || [];

  const points: TimelineDataPoint[] = rawTimeline.length > 0 ? rawTimeline : [
    { period: 'W1', academic: 82, engagement: 84, attendance: 92, participation: 85, assignments: 88, communication: 85 },
    { period: 'W2', academic: 83, engagement: 80, attendance: 90, participation: 81, assignments: 85, communication: 84 },
    { period: 'W3', academic: 84, engagement: 72, attendance: 91, participation: 74, assignments: 79, communication: 82 },
    { period: 'W4', academic: 84, engagement: 64, attendance: 90, participation: 68, assignments: 74, communication: 81 },
  ];

  const seriesConfig: Record<string, { label: string; color: string; strokeDash?: string; width: number; isAcademic?: boolean }> = {
    academic: { label: 'Academic Performance', color: '#6f8dff', width: 3.5, isAcademic: true },
    engagement: { label: 'Engagement', color: '#ff6a2b', width: 3 },
    attendance: { label: 'Attendance', color: '#a855f7', width: 2.2 },
    assignments: { label: 'Assignment Consistency', color: '#f59e0b', width: 2.2 },
    participation: { label: 'In-Class Participation', color: '#ec4899', width: 2 },
    communication: { label: 'Communication Cadence', color: '#10b981', width: 2 },
  };

  const toggleMetric = (key: string) => {
    setActiveMetrics((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // SVG dimensions
  const svgWidth = 640;
  const svgHeight = 280;
  const padding = { top: 28, right: 36, bottom: 42, left: 48 };

  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  // Scales
  const minY = 40;
  const maxY = 100;
  const numSteps = Math.max(1, points.length - 1);

  const getX = (index: number) => padding.left + (index / numSteps) * chartWidth;
  const getY = (val: number) => padding.top + chartHeight - ((val - minY) / (maxY - minY)) * chartHeight;

  // Build SVG paths for each metric series
  const buildPath = (metricKey: keyof TimelineDataPoint) => {
    return points
      .map((p, i) => {
        const val = typeof p[metricKey] === 'number' ? (p[metricKey] as number) : 70;
        const x = getX(i);
        const y = getY(val);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  const hoveredPoint = hoveredPointIndex !== null ? points[hoveredPointIndex] : null;

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* Metric filter switches */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-[11px] uppercase tracking-wider text-[#a0a5d2] font-semibold mr-1">Signals:</span>
        {Object.entries(seriesConfig).map(([key, cfg]) => {
          const isActive = activeMetrics[key];
          return (
            <button
              key={key}
              onClick={() => toggleMetric(key)}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs transition-all border ${
                isActive
                  ? 'bg-[#15193a]/80 text-white border-opacity-60 shadow-sm'
                  : 'bg-transparent text-[#7076a0] border-[#222852] hover:text-white'
              }`}
              style={{
                borderColor: isActive ? cfg.color : undefined,
              }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{
                  backgroundColor: isActive ? cfg.color : '#434a75',
                  boxShadow: isActive ? `0 0 8px ${cfg.color}80` : undefined,
                }}
              />
              <span className="font-medium text-[11px]">{cfg.label}</span>
            </button>
          );
        })}
      </div>

      {/* SVG Timeline Canvas */}
      <div className="relative bg-[#080b20]/70 border border-[#262c5e]/60 rounded-xl p-3 overflow-hidden backdrop-blur-md">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto select-none overflow-visible"
        >
          <defs>
            {/* Shading under Academic curve */}
            <linearGradient id="academic-glow-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6f8dff" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#6f8dff" stopOpacity="0.0" />
            </linearGradient>

            {/* Shading under Engagement curve */}
            <linearGradient id="engagement-glow-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff6a2b" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#ff6a2b" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines and Y axis labels */}
          {[40, 60, 80, 100].map((val) => {
            const y = getY(val);
            return (
              <g key={val}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={svgWidth - padding.right}
                  y2={y}
                  stroke="rgba(140, 155, 230, 0.08)"
                  strokeDasharray={val === 80 ? '3 3' : undefined}
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  fill="#787fa8"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {val}%
                </text>
              </g>
            );
          })}

          {/* Divergence Gap highlight area between Academic and Engagement if both active */}
          {activeMetrics.academic && activeMetrics.engagement && points.length > 1 && (
            <polygon
              points={`
                ${points.map((p, i) => `${getX(i)},${getY(p.academic)}`).join(' ')}
                ${points.slice().reverse().map((p, i) => `${getX(points.length - 1 - i)},${getY(p.engagement)}`).join(' ')}
              `}
              fill="rgba(255, 106, 43, 0.09)"
              stroke="none"
            />
          )}

          {/* Plotted Line series */}
          {Object.entries(seriesConfig).map(([key, cfg]) => {
            if (!activeMetrics[key]) return null;
            const pathData = buildPath(key as keyof TimelineDataPoint);
            return (
              <g key={key}>
                <path
                  d={pathData}
                  fill="none"
                  stroke={cfg.color}
                  strokeWidth={cfg.width}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={cfg.strokeDash}
                  className="transition-all duration-300"
                />
              </g>
            );
          })}

          {/* Period ticks & X Axis labels */}
          {points.map((p, i) => {
            const x = getX(i);
            const isHovered = hoveredPointIndex === i;

            return (
              <g key={i}>
                {/* Vertical hover guide */}
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={padding.top + chartHeight}
                  stroke={isHovered ? 'rgba(255, 106, 43, 0.4)' : 'rgba(140, 155, 230, 0.08)'}
                  strokeWidth={isHovered ? 1.5 : 1}
                  strokeDasharray={isHovered ? '2 2' : undefined}
                />

                {/* Period label */}
                <text
                  x={x}
                  y={padding.top + chartHeight + 20}
                  textAnchor="middle"
                  fill={isHovered ? '#ff8a50' : '#9aa0c8'}
                  fontSize="11"
                  fontWeight={isHovered ? 'bold' : 'normal'}
                  fontFamily="'Baskerville Old Face', 'Baskerville', serif"
                >
                  {p.weekLabel || p.period}
                </text>

                {/* Data point markers */}
                {Object.entries(seriesConfig).map(([key, cfg]) => {
                  if (!activeMetrics[key]) return null;
                  const val = typeof p[key as keyof TimelineDataPoint] === 'number'
                    ? (p[key as keyof TimelineDataPoint] as number)
                    : 70;
                  const y = getY(val);

                  return (
                    <circle
                      key={key}
                      cx={x}
                      cy={y}
                      r={isHovered ? 5.5 : cfg.isAcademic ? 4.5 : 3.5}
                      fill={cfg.color}
                      stroke="#080b20"
                      strokeWidth={1.5}
                      className="cursor-pointer transition-all duration-150"
                    />
                  );
                })}

                {/* Invisible hover hotspot */}
                <rect
                  x={x - 24}
                  y={padding.top}
                  width={48}
                  height={chartHeight + 25}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPointIndex(i)}
                  onMouseLeave={() => setHoveredPointIndex(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* Hover inspection tooltip */}
        {hoveredPoint && (
          <div className="absolute top-4 right-4 bg-[#0a0d24]/95 border border-[#ff6a2b]/40 rounded-lg p-2.5 shadow-xl backdrop-blur-md text-xs pointer-events-none">
            <div className="font-semibold text-white mb-1.5 flex items-center justify-between border-b border-[#252a55] pb-1">
              <span>{hoveredPoint.weekLabel || hoveredPoint.period}</span>
              <span className="text-[10px] text-[#ff8a50] uppercase tracking-wider font-mono">Telemetry</span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-[11px]">
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-[#6f8dff]" />
                <span className="text-[#a4a9d0]">Academic:</span>
                <span className="text-white font-bold">{hoveredPoint.academic}%</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-[#ff6a2b]" />
                <span className="text-[#a4a9d0]">Engagement:</span>
                <span className="text-white font-bold">{hoveredPoint.engagement}%</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-[#a855f7]" />
                <span className="text-[#a4a9d0]">Attendance:</span>
                <span className="text-white font-bold">{hoveredPoint.attendance}%</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                <span className="text-[#a4a9d0]">Assignments:</span>
                <span className="text-white font-bold">{hoveredPoint.assignments}%</span>
              </div>
            </div>
            {hoveredPoint.academic - hoveredPoint.engagement > 10 && (
              <div className="mt-2 text-[10px] text-[#ffb27a] bg-[#ff6a2b]/10 border border-[#ff6a2b]/30 rounded px-1.5 py-0.5">
                ⚠ Divergence: +{hoveredPoint.academic - hoveredPoint.engagement}% gap detected
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pattern Insight Caption */}
      <div className="bg-[#0e1230]/70 border border-[#2a3068]/60 rounded-lg px-3.5 py-2.5 flex items-start space-x-2.5">
        <span className="text-base text-[#ff6a2b] mt-0.5">⚡</span>
        <div className="text-xs text-[#b0b6e0] leading-relaxed">
          <strong className="text-white font-serif">The Silent Struggle Pattern:</strong> Notice how visible academic scores
          remain consistently flat or buoyant (at <span className="text-[#6f8dff] font-mono font-semibold">{student.academicScore}%</span>),
          while engagement and behavioral signals steadily decay over time. This divergence is the early signal standard gradebooks miss.
        </div>
      </div>
    </div>
  );
};
