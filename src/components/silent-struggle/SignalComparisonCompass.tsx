import React from 'react';
import { SilentStruggleStudent } from '../../data/silentStruggleData';

interface SignalComparisonCompassProps {
  student: SilentStruggleStudent;
}

export const SignalComparisonCompass: React.FC<SignalComparisonCompassProps> = ({ student }) => {
  const width = 440;
  const height = 440;
  const center = width / 2;
  const maxRadius = 145;

  // 6 Radial axes for multidimensional student journey
  const axes = [
    { label: 'Academic', value: student.academicScore, angle: -Math.PI / 2, color: '#6f8dff', isAcademic: true },
    { label: 'Engagement', value: student.engagement, angle: -Math.PI / 6, color: '#ff6a2b' },
    { label: 'Assignments', value: student.assignmentConsistency, angle: Math.PI / 6, color: '#ff8a50' },
    { label: 'Attendance', value: student.attendance, angle: Math.PI / 2, color: '#a855f7' },
    { label: 'Participation', value: student.participation, angle: (5 * Math.PI) / 6, color: '#ec4899' },
    { label: 'Communication', value: student.communication, angle: (-5 * Math.PI) / 6, color: '#10b981' },
  ];

  // Calculate polygon points
  const points = axes.map((axis) => {
    const r = (axis.value / 100) * maxRadius;
    const x = center + r * Math.cos(axis.angle);
    const y = center + r * Math.sin(axis.angle);
    return `${x},${y}`;
  });

  const polygonPath = points.join(' ');

  // Ideal baseline polygon (85%)
  const baselinePoints = axes
    .map((axis) => {
      const r = 0.85 * maxRadius;
      const x = center + r * Math.cos(axis.angle);
      const y = center + r * Math.sin(axis.angle);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="relative w-full flex flex-col items-center justify-center p-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[400px] h-auto select-none">
        <defs>
          {/* Gradients */}
          <radialGradient id="compass-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff6a2b" stopOpacity="0.3" />
            <stop offset="70%" stopColor="#6f8dff" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#040615" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="polygon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6f8dff" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#a855f7" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ff6a2b" stopOpacity="0.45" />
          </linearGradient>

          <filter id="compass-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ambient center radial glow */}
        <circle cx={center} cy={center} r={maxRadius + 20} fill="url(#compass-core)" />

        {/* Concentric Reference Rings */}
        {[0.25, 0.5, 0.75, 1.0].map((ratio, i) => (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={maxRadius * ratio}
            fill="none"
            stroke="rgba(140, 150, 255, 0.12)"
            strokeDasharray={ratio === 1 ? undefined : '3 3'}
            strokeWidth="1"
          />
        ))}

        {/* Expected Healthy Reference Polygon */}
        <polygon
          points={baselinePoints}
          fill="none"
          stroke="rgba(140, 150, 255, 0.2)"
          strokeDasharray="4 4"
          strokeWidth="1.2"
        />

        {/* Axis Cross Lines */}
        {axes.map((axis, i) => {
          const x2 = center + maxRadius * Math.cos(axis.angle);
          const y2 = center + maxRadius * Math.sin(axis.angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x2}
              y2={y2}
              stroke="rgba(140, 150, 255, 0.2)"
              strokeWidth="1"
            />
          );
        })}

        {/* Student Multidimensional Polygon Area */}
        <polygon
          points={polygonPath}
          fill="url(#polygon-grad)"
          stroke="#ff6a2b"
          strokeWidth="2"
          filter="url(#compass-glow)"
          className="transition-all duration-700 ease-out"
        />

        {/* Student Node Points & Metric Markers */}
        {axes.map((axis, i) => {
          const r = (axis.value / 100) * maxRadius;
          const x = center + r * Math.cos(axis.angle);
          const y = center + r * Math.sin(axis.angle);

          // Outer label coordinates
          const labelDist = maxRadius + 32;
          const lx = center + labelDist * Math.cos(axis.angle);
          const ly = center + labelDist * Math.sin(axis.angle);

          const isDeclining = axis.value < 70 && !axis.isAcademic;

          return (
            <g key={i}>
              {/* Vertex Circle */}
              <circle
                cx={x}
                cy={y}
                r={axis.isAcademic ? 6.5 : 5}
                fill={axis.isAcademic ? '#6f8dff' : isDeclining ? '#ff6a2b' : '#34d399'}
                stroke="#ffffff"
                strokeWidth="1.5"
                filter="url(#compass-glow)"
              />

              {/* Label & Score Badge */}
              <g transform={`translate(${lx}, ${ly})`}>
                <text
                  textAnchor="middle"
                  dy="-4"
                  fill={axis.isAcademic ? '#c2d1ff' : isDeclining ? '#ffb27a' : '#d2d6f5'}
                  fontSize="11"
                  fontFamily="'Baskerville Old Face', 'Baskerville', serif"
                  fontWeight="bold"
                >
                  {axis.label}
                </text>
                <text
                  textAnchor="middle"
                  dy="10"
                  fill="#ffffff"
                  fontSize="11"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {axis.value}%
                </text>
              </g>
            </g>
          );
        })}

        {/* Center Student Beacon Core */}
        <circle cx={center} cy={center} r="18" fill="#080a22" stroke="rgba(255,106,43,0.5)" strokeWidth="1.5" />
        <text
          x={center}
          y={center + 4}
          textAnchor="middle"
          fill="#ffb27a"
          fontSize="10"
          fontFamily="monospace"
          fontWeight="bold"
        >
          {student.avatarInitials}
        </text>
      </svg>

      {/* Visual Subtitle & Compass Reading */}
      <div className="mt-3 text-center">
        <div className="text-xs text-[#a4a9d0]">
          <span className="font-semibold text-white">Visual Contrast Insight:</span> Academic mastery stands tall at{' '}
          <strong className="text-[#6f8dff] font-mono">{student.academicScore}%</strong>, while behavioral vectors
          contract to <strong className="text-[#ff6a2b] font-mono">{student.engagement}%</strong>.
        </div>
      </div>
    </div>
  );
};
