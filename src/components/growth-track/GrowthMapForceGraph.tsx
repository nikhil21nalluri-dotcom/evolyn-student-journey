import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  StudentGrowthProfile,
  GrowthDimension,
} from '../../data/studentGrowthData';
import { GrowthMap3DCanvas } from './GrowthMap3DCanvas';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Zap,
  Layers,
  Info,
  Maximize2,
  Crosshair,
  Compass,
  Box,
  RotateCcw,
} from 'lucide-react';

interface GrowthMapForceGraphProps {
  student: StudentGrowthProfile;
}

export interface GraphNode {
  id: string;
  name: string;
  shortLabel: string;
  category: string;
  cluster: 'academic' | 'skill' | 'engagement' | 'presence';
  value: number;
  change: number;
  trend: 'improving' | 'stable' | 'declining';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  isRoot?: boolean;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  relationship: string;
  strength: number; // 0 to 1
  flowDirection: 'bidirectional' | 'sourceToTarget';
}

const STATIC_EDGES: GraphEdge[] = [
  {
    id: 'e-acad-tech',
    source: 'academic',
    target: 'technical',
    label: 'Theory to Code',
    relationship: 'Curricular theory grounds practical programming execution',
    strength: 0.9,
    flowDirection: 'bidirectional',
  },
  {
    id: 'e-tech-prob',
    source: 'technical',
    target: 'problemSolving',
    label: 'Algorithmic Synthesis',
    relationship: 'Hands-on programming directly fuels analytical problem decomposition',
    strength: 0.85,
    flowDirection: 'bidirectional',
  },
  {
    id: 'e-prob-acad',
    source: 'problemSolving',
    target: 'academic',
    label: 'Rigor Reinforcement',
    relationship: 'Analytical mastery ensures higher retention on exams & lab evaluations',
    strength: 0.8,
    flowDirection: 'bidirectional',
  },
  {
    id: 'e-acad-assign',
    source: 'academic',
    target: 'assignments',
    label: 'Formative Cadence',
    relationship: 'Continuous assignment submission safeguards academic progress',
    strength: 0.85,
    flowDirection: 'bidirectional',
  },
  {
    id: 'e-eng-assign',
    source: 'engagement',
    target: 'assignments',
    label: 'Pacing Driver',
    relationship: 'Active LMS immersion drives timely homework completion',
    strength: 0.75,
    flowDirection: 'bidirectional',
  },
  {
    id: 'e-eng-part',
    source: 'engagement',
    target: 'participation',
    label: 'Voice Activation',
    relationship: 'Pre-class prep and portal activity empower active classroom voice',
    strength: 0.9,
    flowDirection: 'bidirectional',
  },
  {
    id: 'e-part-comm',
    source: 'participation',
    target: 'communication',
    label: 'Expression Loop',
    relationship: 'Discussion participation expands confidence in TA/faculty communication',
    strength: 0.85,
    flowDirection: 'bidirectional',
  },
  {
    id: 'e-comm-tech',
    source: 'communication',
    target: 'technical',
    label: 'Collaborative Review',
    relationship: 'Technical articulation strengthens peer code reviews and project syncs',
    strength: 0.7,
    flowDirection: 'bidirectional',
  },
  {
    id: 'e-att-acad',
    source: 'attendance',
    target: 'academic',
    label: 'Presence Baseline',
    relationship: 'Physical lecture presence provides foundational syllabus coverage',
    strength: 0.8,
    flowDirection: 'bidirectional',
  },
  {
    id: 'e-att-eng',
    source: 'attendance',
    target: 'engagement',
    label: 'Rhythm Continuity',
    relationship: 'Regular class attendance maintains momentum for digital study sessions',
    strength: 0.75,
    flowDirection: 'bidirectional',
  },
  {
    id: 'e-prob-assign',
    source: 'problemSolving',
    target: 'assignments',
    label: 'Execution Tenacity',
    relationship: 'Problem-solving persistence enables completion of difficult lab assignments',
    strength: 0.7,
    flowDirection: 'bidirectional',
  },
];

export const GrowthMapForceGraph: React.FC<GrowthMapForceGraphProps> = ({ student }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('academic');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [clusterFilter, setClusterFilter] = useState<'all' | 'academic' | 'skill' | 'engagement' | 'presence'>('all');
  const [layoutMode, setLayoutMode] = useState<'physics' | 'radial' | 'layered'>('physics');
  const [physicsAlpha, setPhysicsAlpha] = useState<number>(1);
  const [pulsesActive, setPulsesActive] = useState<boolean>(true);

  // Graph dimensions
  const width = 860;
  const height = 520;
  const centerX = width / 2;
  const centerY = height / 2;

  // Build nodes based on active student dimensions
  const initialNodes = useMemo<GraphNode[]>(() => {
    const dimMap = new Map<string, GrowthDimension>();
    student.dimensions.forEach((d) => dimMap.set(d.id, d));

    const academicDim = dimMap.get('academic');
    const technicalDim = dimMap.get('technical');
    const problemDim = dimMap.get('problemSolving');
    const commDim = dimMap.get('communication');
    const engageDim = dimMap.get('engagement');
    const partDim = dimMap.get('participation');
    const assignDim = dimMap.get('assignments');
    const attDim = dimMap.get('attendance');

    const nodes: GraphNode[] = [
      {
        id: 'academic',
        name: 'Academic Performance',
        shortLabel: 'ACADEMICS',
        category: 'Foundational Mastery',
        cluster: 'academic',
        value: academicDim ? academicDim.currentValue : student.growthHealth,
        change: academicDim ? academicDim.change : 6,
        trend: academicDim ? academicDim.trend : 'improving',
        x: centerX,
        y: centerY,
        vx: 0,
        vy: 0,
        radius: 40,
        isRoot: true,
      },
      {
        id: 'technical',
        name: 'Technical Skills',
        shortLabel: 'TECH SKILLS',
        category: 'Domain Competency',
        cluster: 'skill',
        value: technicalDim ? technicalDim.currentValue : 81,
        change: technicalDim ? technicalDim.change : 11,
        trend: technicalDim ? technicalDim.trend : 'improving',
        x: centerX + 180,
        y: centerY - 90,
        vx: 0,
        vy: 0,
        radius: 32,
      },
      {
        id: 'problemSolving',
        name: 'Problem Solving',
        shortLabel: 'PROBLEM SOLVING',
        category: 'Analytical Rigor',
        cluster: 'skill',
        value: problemDim ? problemDim.currentValue : 79,
        change: problemDim ? problemDim.change : 7,
        trend: problemDim ? problemDim.trend : 'improving',
        x: centerX + 160,
        y: centerY + 110,
        vx: 0,
        vy: 0,
        radius: 32,
      },
      {
        id: 'communication',
        name: 'Communication',
        shortLabel: 'COMMUNICATION',
        category: 'Affective Outreach',
        cluster: 'skill',
        value: commDim ? commDim.currentValue : 76,
        change: commDim ? commDim.change : 14,
        trend: commDim ? commDim.trend : 'improving',
        x: centerX + 50,
        y: centerY + 190,
        vx: 0,
        vy: 0,
        radius: 30,
      },
      {
        id: 'engagement',
        name: 'Engagement',
        shortLabel: 'ENGAGEMENT',
        category: 'Learning Depth',
        cluster: 'engagement',
        value: engageDim ? engageDim.currentValue : 64,
        change: engageDim ? engageDim.change : -18,
        trend: engageDim ? engageDim.trend : 'declining',
        x: centerX - 180,
        y: centerY - 90,
        vx: 0,
        vy: 0,
        radius: 33,
      },
      {
        id: 'participation',
        name: 'Participation',
        shortLabel: 'PARTICIPATION',
        category: 'Collaborative Presence',
        cluster: 'engagement',
        value: partDim ? partDim.currentValue : 68,
        change: partDim ? partDim.change : -12,
        trend: partDim ? partDim.trend : 'declining',
        x: centerX - 130,
        y: centerY + 140,
        vx: 0,
        vy: 0,
        radius: 30,
      },
      {
        id: 'assignments',
        name: 'Assignment Consistency',
        shortLabel: 'ASSIGNMENTS',
        category: 'Cadence & Rigor',
        cluster: 'academic',
        value: assignDim ? assignDim.currentValue : 71,
        change: assignDim ? assignDim.change : 9,
        trend: assignDim ? assignDim.trend : 'improving',
        x: centerX - 60,
        y: centerY - 170,
        vx: 0,
        vy: 0,
        radius: 31,
      },
      {
        id: 'attendance',
        name: 'Attendance',
        shortLabel: 'ATTENDANCE',
        category: 'Presence & Consistency',
        cluster: 'presence',
        value: attDim ? attDim.currentValue : 91,
        change: attDim ? attDim.change : 0,
        trend: attDim ? attDim.trend : 'stable',
        x: centerX + 110,
        y: centerY - 165,
        vx: 0,
        vy: 0,
        radius: 32,
      },
    ];

    return nodes;
  }, [student, centerX, centerY]);

  const [nodes, setNodes] = useState<GraphNode[]>(initialNodes);
  const [edges] = useState<GraphEdge[]>(STATIC_EDGES);

  // Synchronize node metrics when selected student changes
  useEffect(() => {
    setNodes((prevNodes) =>
      initialNodes.map((initNode) => {
        const existing = prevNodes.find((n) => n.id === initNode.id);
        if (existing) {
          return {
            ...initNode,
            x: existing.x,
            y: existing.y,
            vx: existing.vx,
            vy: existing.vy,
          };
        }
        return initNode;
      })
    );
    setPhysicsAlpha(0.6); // Re-energize slightly on student swap
  }, [initialNodes]);

  // Dragging interaction state
  const draggedNodeRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);

  // Physics simulation loop
  useEffect(() => {
    let animationFrameId: number;

    const tick = () => {
      setNodes((currentNodes) => {
        if (layoutMode !== 'physics' && physicsAlpha <= 0.01) {
          return currentNodes;
        }

        const nextNodes = currentNodes.map((node) => ({ ...node }));
        const nodeMap = new Map<string, GraphNode>();
        nextNodes.forEach((n) => nodeMap.set(n.id, n));

        if (layoutMode === 'physics') {
          // 1. Repulsion between all node pairs (Coulomb force)
          const kRep = 9500;
          for (let i = 0; i < nextNodes.length; i++) {
            for (let j = i + 1; j < nextNodes.length; j++) {
              const na = nextNodes[i];
              const nb = nextNodes[j];
              const dx = nb.x - na.x;
              const dy = nb.y - na.y;
              const dist = Math.sqrt(dx * dx + dy * dy) || 1;

              if (dist < 340) {
                const force = (kRep / (dist * dist)) * physicsAlpha;
                const fx = (dx / dist) * force;
                const fy = (dy / dist) * force;

                if (!na.isRoot || draggedNodeRef.current?.id === na.id) {
                  na.vx -= fx;
                  na.vy -= fy;
                }
                if (!nb.isRoot || draggedNodeRef.current?.id === nb.id) {
                  nb.vx += fx;
                  nb.vy += fy;
                }
              }
            }
          }

          // 2. Spring attraction along edges (Hooke's Law)
          const restLength = 175;
          const kSpring = 0.045;
          edges.forEach((edge) => {
            const source = nodeMap.get(edge.source);
            const target = nodeMap.get(edge.target);
            if (!source || !target) return;

            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const delta = dist - restLength;
            const force = delta * kSpring * edge.strength * physicsAlpha;

            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            if (!source.isRoot) {
              source.vx += fx;
              source.vy += fy;
            }
            if (!target.isRoot) {
              target.vx -= fx;
              target.vy -= fy;
            }
          });

          // 3. Center gravity pull
          const kGravity = 0.018;
          nextNodes.forEach((node) => {
            const dx = centerX - node.x;
            const dy = centerY - node.y;
            node.vx += dx * kGravity * physicsAlpha;
            node.vy += dy * kGravity * physicsAlpha;
          });
        } else if (layoutMode === 'radial') {
          // Radial Orbit layout target
          const orbitRadius = 185;
          const nonRoot = nextNodes.filter((n) => !n.isRoot);
          nonRoot.forEach((node, idx) => {
            const angle = (idx / nonRoot.length) * 2 * Math.PI - Math.PI / 2;
            const targetX = centerX + Math.cos(angle) * orbitRadius;
            const targetY = centerY + Math.sin(angle) * orbitRadius;
            node.vx += (targetX - node.x) * 0.08;
            node.vy += (targetY - node.y) * 0.08;
          });
          const rootNode = nextNodes.find((n) => n.isRoot);
          if (rootNode) {
            rootNode.vx += (centerX - rootNode.x) * 0.1;
            rootNode.vy += (centerY - rootNode.y) * 0.1;
          }
        } else if (layoutMode === 'layered') {
          // Structured hierarchy layout target
          const rootNode = nextNodes.find((n) => n.isRoot);
          if (rootNode) {
            rootNode.vx += (centerX - rootNode.x) * 0.1;
            rootNode.vy += (centerY - 130 - rootNode.y) * 0.1;
          }
          const layer2 = ['technical', 'problemSolving', 'assignments'];
          layer2.forEach((id, idx) => {
            const n = nodeMap.get(id);
            if (n) {
              const targetX = centerX - 180 + idx * 180;
              const targetY = centerY + 10;
              n.vx += (targetX - n.x) * 0.08;
              n.vy += (targetY - n.y) * 0.08;
            }
          });
          const layer3 = ['engagement', 'participation', 'communication', 'attendance'];
          layer3.forEach((id, idx) => {
            const n = nodeMap.get(id);
            if (n) {
              const targetX = centerX - 270 + idx * 180;
              const targetY = centerY + 150;
              n.vx += (targetX - n.x) * 0.08;
              n.vy += (targetY - n.y) * 0.08;
            }
          });
        }

        // Apply velocities with damping & boundary containment
        const damping = 0.86;
        nextNodes.forEach((node) => {
          if (draggedNodeRef.current?.id === node.id) {
            // Dragged node stays under cursor
            node.vx = 0;
            node.vy = 0;
            return;
          }

          node.vx *= damping;
          node.vy *= damping;

          node.x += node.vx;
          node.y += node.vy;

          // Padding boundary
          const pad = node.radius + 18;
          if (node.x < pad) {
            node.x = pad;
            node.vx *= -0.5;
          }
          if (node.x > width - pad) {
            node.x = width - pad;
            node.vx *= -0.5;
          }
          if (node.y < pad) {
            node.y = pad;
            node.vy *= -0.5;
          }
          if (node.y > height - pad) {
            node.y = height - pad;
            node.vy *= -0.5;
          }
        });

        return nextNodes;
      });

      // Slowly cool simulation temperature
      setPhysicsAlpha((prev) => {
        if (draggedNodeRef.current) return 0.5;
        const next = prev * 0.992;
        return next < 0.005 ? 0.005 : next;
      });

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [edges, centerX, centerY, height, width, layoutMode]);

  // Pointer drag events for SVG nodes
  const handlePointerDown = (nodeId: string, e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    const node = nodes.find((n) => n.id === nodeId);
    if (!node || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    const pointerX = (e.clientX - rect.left) * scaleX;
    const pointerY = (e.clientY - rect.top) * scaleY;

    draggedNodeRef.current = {
      id: nodeId,
      offsetX: pointerX - node.x,
      offsetY: pointerY - node.y,
    };

    setSelectedNodeId(nodeId);
    setPhysicsAlpha(0.7); // Wake up physics
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggedNodeRef.current || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    const pointerX = (e.clientX - rect.left) * scaleX;
    const pointerY = (e.clientY - rect.top) * scaleY;

    const { id, offsetX, offsetY } = draggedNodeRef.current;

    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          return {
            ...n,
            x: Math.max(n.radius, Math.min(width - n.radius, pointerX - offsetX)),
            y: Math.max(n.radius, Math.min(height - n.radius, pointerY - offsetY)),
            vx: 0,
            vy: 0,
          };
        }
        return n;
      })
    );
  };

  const handlePointerUp = () => {
    draggedNodeRef.current = null;
    setPhysicsAlpha(0.3);
  };

  const jiggleNodes = () => {
    setNodes((prev) =>
      prev.map((node) => ({
        ...node,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.5) * 14,
      }))
    );
    setPhysicsAlpha(0.9);
  };

  const resetSimulation = () => {
    setNodes(initialNodes);
    setPhysicsAlpha(1);
    setSelectedNodeId('academic');
  };

  // Node Map for edge path calculation
  const nodePositionMap = useMemo(() => {
    const map = new Map<string, GraphNode>();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);

  // Active / Highlighted nodes & edges
  const activeFocusId = hoveredNodeId || selectedNodeId;

  const connectedNodeIds = useMemo(() => {
    if (!activeFocusId) return new Set<string>();
    const ids = new Set<string>([activeFocusId]);
    edges.forEach((e) => {
      if (e.source === activeFocusId) ids.add(e.target);
      if (e.target === activeFocusId) ids.add(e.source);
    });
    return ids;
  }, [activeFocusId, edges]);

  // Get selected node details
  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) || nodes[0];
  }, [nodes, selectedNodeId]);

  // Edges linked to selected node
  const selectedNodeEdges = useMemo(() => {
    return edges.filter(
      (e) => e.source === selectedNode.id || e.target === selectedNode.id
    );
  }, [edges, selectedNode.id]);

  // Color helper for clusters
  const getClusterStyle = (cluster: GraphNode['cluster'], trend: GraphNode['trend']) => {
    if (trend === 'declining') {
      return {
        fill: 'rgba(255, 106, 43, 0.25)',
        stroke: '#ff6a2b',
        glow: 'rgba(255, 106, 43, 0.7)',
        accent: '#ffb27a',
        badge: 'bg-[#ff6a2b]/20 text-[#ffb27a] border-[#ff6a2b]/40',
      };
    }
    switch (cluster) {
      case 'academic':
        return {
          fill: 'rgba(111, 141, 255, 0.22)',
          stroke: '#6f8dff',
          glow: 'rgba(111, 141, 255, 0.6)',
          accent: '#c2d1ff',
          badge: 'bg-[#6f8dff]/20 text-[#c2d1ff] border-[#6f8dff]/40',
        };
      case 'skill':
        return {
          fill: 'rgba(16, 185, 129, 0.2)',
          stroke: '#10b981',
          glow: 'rgba(16, 185, 129, 0.55)',
          accent: '#6ee7b7',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        };
      case 'engagement':
        return {
          fill: 'rgba(236, 72, 153, 0.22)',
          stroke: '#ec4899',
          glow: 'rgba(236, 72, 153, 0.6)',
          accent: '#fbcfe8',
          badge: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
        };
      case 'presence':
        return {
          fill: 'rgba(168, 85, 247, 0.22)',
          stroke: '#a855f7',
          glow: 'rgba(168, 85, 247, 0.6)',
          accent: '#e9d5ff',
          badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        };
      default:
        return {
          fill: 'rgba(111, 141, 255, 0.22)',
          stroke: '#6f8dff',
          glow: 'rgba(111, 141, 255, 0.6)',
          accent: '#c2d1ff',
          badge: 'bg-[#6f8dff]/20 text-[#c2d1ff] border-[#6f8dff]/40',
        };
    }
  };

  return (
    <div className="w-full">
      {/* Interactive Controls Bar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-[#090b22]/80 border border-[rgba(140,150,255,0.18)] backdrop-blur-md">
        {/* View Mode Switcher: 3D Spatial vs 2D Blueprint */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/50 border border-[rgba(140,150,255,0.25)]">
          <button
            onClick={() => setViewMode('3d')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-baskerville font-bold transition-all ${
              viewMode === '3d'
                ? 'bg-gradient-to-r from-[#ff6a2b] to-[#6f8dff] text-white shadow-md shadow-[#ff6a2b]/25'
                : 'text-[#a4a9d0] hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D Spatial Constellation (Three.js)</span>
          </button>
          <button
            onClick={() => setViewMode('2d')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-baskerville font-bold transition-all ${
              viewMode === '2d'
                ? 'bg-gradient-to-r from-[#ff6a2b] to-[#6f8dff] text-white shadow-md shadow-[#ff6a2b]/25'
                : 'text-[#a4a9d0] hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2D Blueprint Force (D3)</span>
          </button>
        </div>

        {/* Topology Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-[11px] uppercase font-mono tracking-wider text-[#a4a9d0] mr-1 hidden sm:inline">
            Cluster:
          </span>
          {(
            [
              { id: 'all', label: 'All Dimensions' },
              { id: 'academic', label: 'Academics' },
              { id: 'skill', label: 'Skills' },
              { id: 'engagement', label: 'Engagement' },
              { id: 'presence', label: 'Presence' },
            ] as const
          ).map((c) => (
            <button
              key={c.id}
              onClick={() => setClusterFilter(c.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                clusterFilter === c.id
                  ? 'bg-[#6f8dff]/25 text-[#c2d1ff] border border-[#6f8dff]/50 font-semibold'
                  : 'bg-black/30 text-[#a4a9d0] hover:text-white hover:bg-white/5 border border-white/5'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Layout & Physics Controls */}
        <div className="flex items-center gap-2">
          {viewMode === '3d' ? (
            <>
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`px-3 py-1 rounded-lg text-xs font-mono border transition-all ${
                  autoRotate
                    ? 'bg-[#ff6a2b]/15 text-[#ffb27a] border-[#ff6a2b]/40 font-bold'
                    : 'bg-black/30 text-[#a4a9d0] border-white/10'
                }`}
              >
                {autoRotate ? '🔄 Auto-Orbit Active' : '⏸ Orbit Paused'}
              </button>
            </>
          ) : (
            <>
              <div className="inline-flex p-0.5 rounded-lg bg-black/40 border border-white/10">
                <button
                  onClick={() => {
                    setLayoutMode('physics');
                    setPhysicsAlpha(0.8);
                  }}
                  className={`px-2.5 py-1 text-xs rounded-md font-mono transition-all ${
                    layoutMode === 'physics'
                      ? 'bg-[#6f8dff]/30 text-white font-bold'
                      : 'text-[#a4a9d0] hover:text-white'
                  }`}
                  title="Force-Directed Spring Physics Layout"
                >
                  Force Simulation
                </button>
                <button
                  onClick={() => {
                    setLayoutMode('radial');
                    setPhysicsAlpha(0.6);
                  }}
                  className={`px-2.5 py-1 text-xs rounded-md font-mono transition-all ${
                    layoutMode === 'radial'
                      ? 'bg-[#6f8dff]/30 text-white font-bold'
                      : 'text-[#a4a9d0] hover:text-white'
                  }`}
                  title="Radial Orbit Centered on Academics"
                >
                  Radial
                </button>
                <button
                  onClick={() => {
                    setLayoutMode('layered');
                    setPhysicsAlpha(0.6);
                  }}
                  className={`px-2.5 py-1 text-xs rounded-md font-mono transition-all ${
                    layoutMode === 'layered'
                      ? 'bg-[#6f8dff]/30 text-white font-bold'
                      : 'text-[#a4a9d0] hover:text-white'
                  }`}
                  title="Hierarchical Dimension Tiers"
                >
                  Hierarchy
                </button>
              </div>

              {/* Action buttons */}
              <button
                onClick={jiggleNodes}
                className="p-1.5 rounded-lg bg-black/30 border border-white/10 text-[#a4a9d0] hover:text-[#ffb27a] hover:border-[#ff6a2b]/40 transition-colors"
                title="Jiggle Nodes (Re-energize Physics)"
              >
                <Zap className="w-4 h-4" />
              </button>
              <button
                onClick={resetSimulation}
                className="p-1.5 rounded-lg bg-black/30 border border-white/10 text-[#a4a9d0] hover:text-white hover:border-white/30 transition-colors"
                title="Reset Graph Layout"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPulsesActive(!pulsesActive)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-all ${
                  pulsesActive
                    ? 'bg-[#ff6a2b]/15 text-[#ffb27a] border-[#ff6a2b]/30'
                    : 'bg-black/30 text-[#a4a9d0] border-white/10'
                }`}
                title="Toggle Animated Pulse Signals along Edges"
              >
                {pulsesActive ? '⚡ Signals On' : 'Signals Off'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Visual Arena: Interactive Canvas (3D or 2D) + Inspector Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Dynamic Canvas Container (3D Spatial or 2D Force Blueprint) */}
        <div className="lg:col-span-8">
          {viewMode === '3d' ? (
            <GrowthMap3DCanvas
              student={student}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
              clusterFilter={clusterFilter}
              autoRotate={autoRotate}
              pulseSpeed={1}
              edgesData={edges}
            />
          ) : (
            <div className="relative rounded-2xl bg-[#06081a]/95 border border-[rgba(140,150,255,0.22)] shadow-2xl shadow-indigo-950/40 overflow-hidden select-none">
              {/* Subtle background ambient mesh */}
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(111,141,255,0.08),transparent_70%)]" />

              {/* Instruction Tooltip Overlay */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-white/10 text-[11px] font-mono text-[#a4a9d0] backdrop-blur-md">
                <Crosshair className="w-3 h-3 text-[#ff6a2b]" />
                <span>Drag nodes to explore D3 physics · Click to inspect synergy</span>
              </div>

              {/* Current Graph Status */}
              <div className="absolute top-3 right-3 z-20 flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/60 border border-white/10 text-[10px] font-mono text-[#a4a9d0] backdrop-blur-md">
                <span
                  className={`w-2 h-2 rounded-full ${
                    physicsAlpha > 0.05 ? 'bg-emerald-400 animate-ping' : 'bg-[#6f8dff]'
                  }`}
                />
                <span>{physicsAlpha > 0.05 ? 'Live D3 Physics' : 'Equilibrium'}</span>
              </div>

              <svg
                ref={svgRef}
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-auto cursor-grab active:cursor-grabbing touch-none block"
                style={{ maxHeight: '560px' }}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              >
                <defs>
                  {/* Radial Blur Glow Filters */}
                  <filter id="glow-root" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="7" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="glow-node" x="-40%" y="-40%" width="180%" height="180%">
                    <feGaussianBlur stdDeviation="4.5" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  {/* Edge Gradient Definitions */}
                  <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6f8dff" stopOpacity="0.7" />
                    <stop offset="50%" stopColor="#c084fc" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#ff6a2b" stopOpacity="0.7" />
                  </linearGradient>

                  <linearGradient id="edge-gradient-warning" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff6a2b" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0.8" />
                  </linearGradient>

                  {/* Subtle Grid Pattern */}
                  <pattern id="graph-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(140, 150, 255, 0.04)" strokeWidth="1" />
                  </pattern>
                </defs>

                {/* Background Blueprint Grid */}
                <rect width={width} height={height} fill="url(#graph-grid)" />

                {/* Concentric subtle target rings around center */}
                <circle cx={centerX} cy={centerY} r="120" fill="none" stroke="rgba(140, 150, 255, 0.05)" strokeDasharray="3 4" />
                <circle cx={centerX} cy={centerY} r="210" fill="none" stroke="rgba(140, 150, 255, 0.04)" strokeDasharray="4 6" />

                {/* EDGES */}
                <g className="edges-layer">
                  {edges.map((edge) => {
                    const sourceNode = nodePositionMap.get(edge.source);
                    const targetNode = nodePositionMap.get(edge.target);
                    if (!sourceNode || !targetNode) return null;

                    const isConnectedToFocus =
                      activeFocusId &&
                      (edge.source === activeFocusId || edge.target === activeFocusId);

                    const isWarningEdge =
                      sourceNode.trend === 'declining' || targetNode.trend === 'declining';

                    const isFilteredOut =
                      clusterFilter !== 'all' &&
                      sourceNode.cluster !== clusterFilter &&
                      targetNode.cluster !== clusterFilter;

                    const opacity = isFilteredOut
                      ? 0.08
                      : activeFocusId
                      ? isConnectedToFocus
                        ? 0.95
                        : 0.18
                      : 0.55;

                    const strokeWidth = isConnectedToFocus ? 2.8 : 1.6;
                    const midX = (sourceNode.x + targetNode.x) / 2;
                    const midY = (sourceNode.y + targetNode.y) / 2;

                    return (
                      <g key={edge.id} className="transition-opacity duration-300">
                        {isConnectedToFocus && (
                          <line
                            x1={sourceNode.x}
                            y1={sourceNode.y}
                            x2={targetNode.x}
                            y2={targetNode.y}
                            stroke={isWarningEdge ? '#ff6a2b' : '#6f8dff'}
                            strokeWidth={strokeWidth + 4}
                            strokeOpacity={0.25}
                          />
                        )}

                        <line
                          x1={sourceNode.x}
                          y1={sourceNode.y}
                          x2={targetNode.x}
                          y2={targetNode.y}
                          stroke={isWarningEdge ? 'url(#edge-gradient-warning)' : 'url(#edge-gradient)'}
                          strokeWidth={strokeWidth}
                          strokeOpacity={opacity}
                          strokeDasharray={isWarningEdge ? '4 3' : undefined}
                        />

                        {isConnectedToFocus && !isFilteredOut && (
                          <g transform={`translate(${midX}, ${midY})`}>
                            <rect
                              x="-45"
                              y="-10"
                              width="90"
                              height="20"
                              rx="6"
                              fill="rgba(8, 10, 30, 0.88)"
                              stroke={isWarningEdge ? '#ff6a2b' : '#6f8dff'}
                              strokeWidth="1"
                            />
                            <text
                              textAnchor="middle"
                              y="3"
                              fill="#f0f1ff"
                              fontSize="9"
                              fontFamily="monospace"
                              fontWeight="600"
                            >
                              {edge.label}
                            </text>
                          </g>
                        )}

                        {pulsesActive && !isFilteredOut && (
                          <circle r={isConnectedToFocus ? 3.5 : 2.2} fill={isWarningEdge ? '#ff6a2b' : '#38bdf8'}>
                            <animateMotion
                              path={`M ${sourceNode.x} ${sourceNode.y} L ${targetNode.x} ${targetNode.y}`}
                              dur={`${2.2 / (edge.strength || 0.8)}s`}
                              repeatCount="indefinite"
                            />
                          </circle>
                        )}
                      </g>
                    );
                  })}
                </g>

                {/* NODES */}
                <g className="nodes-layer">
                  {nodes.map((node) => {
                    const isSelected = selectedNodeId === node.id;
                    const isHovered = hoveredNodeId === node.id;
                    const isFocused = activeFocusId === node.id;
                    const isConnected = connectedNodeIds.has(node.id);
                    const isFilteredOut = clusterFilter !== 'all' && node.cluster !== clusterFilter;

                    const style = getClusterStyle(node.cluster, node.trend);

                    const nodeOpacity = isFilteredOut
                      ? 0.15
                      : activeFocusId
                      ? isConnected || isFocused
                        ? 1
                        : 0.28
                      : 1;

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${node.x}, ${node.y})`}
                        style={{ opacity: nodeOpacity }}
                        className="transition-opacity duration-200 cursor-pointer"
                        onPointerDown={(e) => handlePointerDown(node.id, e)}
                        onMouseEnter={() => setHoveredNodeId(node.id)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        onClick={() => setSelectedNodeId(node.id)}
                      >
                        {(isSelected || node.trend === 'declining' || node.isRoot) && (
                          <circle
                            r={node.radius + (isSelected ? 10 : 6)}
                            fill="none"
                            stroke={style.stroke}
                            strokeWidth="1.5"
                            strokeDasharray="4 3"
                            className="animate-spin"
                            style={{
                              transformOrigin: '0 0',
                              animationDuration: node.trend === 'declining' ? '6s' : '14s',
                            }}
                          />
                        )}

                        <circle
                          r={node.radius + 3}
                          fill={style.fill}
                          stroke={style.stroke}
                          strokeWidth={isSelected ? 2.5 : 1.5}
                          filter={node.isRoot ? 'url(#glow-root)' : 'url(#glow-node)'}
                        />

                        <circle
                          r={node.radius}
                          fill="#0a0c24"
                          stroke={isSelected ? '#ffffff' : style.stroke}
                          strokeWidth={isSelected ? 2 : 1.2}
                        />

                        <circle
                          r={node.radius - 4}
                          fill="none"
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth="2.5"
                        />
                        <circle
                          r={node.radius - 4}
                          fill="none"
                          stroke={style.stroke}
                          strokeWidth="2.5"
                          strokeDasharray={`${(node.value / 100) * 2 * Math.PI * (node.radius - 4)} ${
                            2 * Math.PI * (node.radius - 4)
                          }`}
                          strokeLinecap="round"
                          transform="rotate(-90)"
                        />

                        <text
                          textAnchor="middle"
                          y={node.isRoot ? 4 : 2}
                          fill="#ffffff"
                          fontSize={node.isRoot ? '17' : '14'}
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {node.value}%
                        </text>

                        <text
                          textAnchor="middle"
                          y={node.isRoot ? 17 : 14}
                          fill={
                            node.trend === 'improving'
                              ? '#34d399'
                              : node.trend === 'declining'
                              ? '#ff6a2b'
                              : '#a4a9d0'
                          }
                          fontSize="9"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {node.trend === 'improving'
                            ? `↑ +${node.change}%`
                            : node.trend === 'declining'
                            ? `↓ ${node.change}%`
                            : '→ Stable'}
                        </text>

                        <g transform={`translate(0, ${node.radius + 16})`}>
                          <rect
                            x="-54"
                            y="-10"
                            width="108"
                            height="20"
                            rx="6"
                            fill="rgba(8, 10, 28, 0.9)"
                            stroke={isSelected ? style.stroke : 'rgba(140,150,255,0.25)'}
                            strokeWidth="1"
                          />
                          <text
                            textAnchor="middle"
                            y="3.5"
                            fill={isSelected ? '#ffffff' : '#d2d6f5'}
                            fontSize="9.5"
                            fontFamily="'Baskerville Old Face', 'Baskerville', serif"
                            fontWeight="bold"
                            letterSpacing="0.4"
                          >
                            {node.shortLabel}
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>
          )}
        </div>

        {/* Selected Dimension & Cross-Metric Synergy Inspector */}
        <div className="lg:col-span-4 p-5 sm:p-6 rounded-2xl bg-[#090b24]/90 border border-[rgba(140,150,255,0.22)] backdrop-blur-md shadow-xl flex flex-col justify-between">
          <div>
            {/* Header info */}
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10 mb-4">
              <span className="text-[11px] uppercase tracking-wider font-mono text-[#a4a9d0]">
                Dimension Synergy Inspector
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                  getClusterStyle(selectedNode.cluster, selectedNode.trend).badge
                }`}
              >
                {selectedNode.category}
              </span>
            </div>

            {/* Selected Metric Title & Value Banner */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h4 className="font-baskerville text-2xl font-bold text-white leading-tight">
                  {selectedNode.name}
                </h4>
                <span className="text-xs text-[#a4a9d0] mt-0.5 block">
                  Cluster: {selectedNode.cluster.toUpperCase()} · Role: {selectedNode.isRoot ? 'Foundational Anchor' : 'Active Vector'}
                </span>
              </div>

              <div className="text-right shrink-0">
                <div className="text-3xl font-mono font-bold text-white">
                  {selectedNode.value}%
                </div>
                <div
                  className={`text-xs font-mono font-semibold flex items-center justify-end gap-1 ${
                    selectedNode.trend === 'improving'
                      ? 'text-emerald-400'
                      : selectedNode.trend === 'declining'
                      ? 'text-[#ff6a2b]'
                      : 'text-amber-400'
                  }`}
                >
                  {selectedNode.trend === 'improving' && <TrendingUp className="w-3.5 h-3.5" />}
                  {selectedNode.trend === 'declining' && <TrendingDown className="w-3.5 h-3.5" />}
                  {selectedNode.trend === 'stable' && <Minus className="w-3.5 h-3.5" />}
                  <span>
                    {selectedNode.change > 0 ? `+${selectedNode.change}%` : `${selectedNode.change}%`}
                  </span>
                </div>
              </div>
            </div>

            {/* Trend & Health Status Box */}
            <div
              className={`p-3 rounded-xl mb-4 border ${
                selectedNode.trend === 'declining'
                  ? 'bg-[rgba(255,106,43,0.12)] border-[#ff6a2b]/35 text-[#ffb27a]'
                  : selectedNode.trend === 'improving'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                  : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-200'
              }`}
            >
              <div className="text-xs font-semibold flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {selectedNode.trend === 'declining'
                    ? 'Early Warning Vector'
                    : selectedNode.trend === 'improving'
                    ? 'Accelerating Trajectory'
                    : 'Consistent Metric'}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">
                {selectedNode.trend === 'declining'
                  ? `${student.name}'s ${selectedNode.name.toLowerCase()} dropped by ${Math.abs(
                      selectedNode.change
                    )}% over the observation window. While core academics remain stable, linked vectors are being monitored.`
                  : `${student.name}'s ${selectedNode.name.toLowerCase()} shows positive momentum (+${
                      selectedNode.change
                    }%), reinforcing connected competencies across the curriculum.`}
              </p>
            </div>

            {/* Interconnected Dimensions (Edges linked to this node) */}
            <div className="mb-4">
              <span className="text-[11px] uppercase tracking-wider font-mono text-[#a4a9d0] block mb-2">
                Active Connections ({selectedNodeEdges.length} Links)
              </span>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {selectedNodeEdges.map((edge) => {
                  const otherNodeId =
                    edge.source === selectedNode.id ? edge.target : edge.source;
                  const otherNode = nodes.find((n) => n.id === otherNodeId);
                  if (!otherNode) return null;

                  return (
                    <button
                      key={edge.id}
                      onClick={() => setSelectedNodeId(otherNode.id)}
                      className="w-full text-left p-2.5 rounded-xl bg-black/40 border border-white/10 hover:border-[#6f8dff]/50 transition-all group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-baskerville font-bold text-xs text-white group-hover:text-[#ffb27a] transition-colors">
                          ⇄ {otherNode.name}
                        </span>
                        <span className="text-[10px] font-mono text-[#a4a9d0]">
                          {otherNode.value}% ({otherNode.change >= 0 ? `+${otherNode.change}%` : `${otherNode.change}%`})
                        </span>
                      </div>
                      <p className="text-[10px] text-[#a4a9d0]/80 leading-normal">
                        {edge.relationship}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Educational Principle */}
          <div className="pt-3 border-t border-white/10 text-[11px] text-[#a4a9d0] flex items-center justify-between">
            <span>Graph Mode: Force-Directed</span>
            <span className="text-[#ff6a2b] font-mono">Multidimensional Map</span>
          </div>
        </div>
      </div>
    </div>
  );
};
