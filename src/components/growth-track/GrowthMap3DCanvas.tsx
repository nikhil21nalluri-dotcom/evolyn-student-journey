import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import * as d3 from 'd3';
import {
  StudentGrowthProfile,
  GrowthDimension,
} from '../../data/studentGrowthData';

export interface D3SimulationNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  shortLabel: string;
  category: string;
  cluster: 'academic' | 'skill' | 'engagement' | 'presence';
  value: number;
  change: number;
  trend: 'improving' | 'stable' | 'declining';
  radius: number;
  isRoot?: boolean;
  x?: number;
  y?: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;
}

export interface D3SimulationLink extends d3.SimulationLinkDatum<D3SimulationNode> {
  id: string;
  source: string | D3SimulationNode;
  target: string | D3SimulationNode;
  label: string;
  relationship: string;
  strength: number;
}

interface GrowthMap3DCanvasProps {
  student: StudentGrowthProfile;
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
  clusterFilter: 'all' | 'academic' | 'skill' | 'engagement' | 'presence';
  autoRotate: boolean;
  pulseSpeed: number;
  edgesData: Array<{
    id: string;
    source: string;
    target: string;
    label: string;
    relationship: string;
    strength: number;
  }>;
}

interface ProjectedLabel {
  id: string;
  name: string;
  value: number;
  trend: 'improving' | 'stable' | 'declining';
  screenX: number;
  screenY: number;
  visible: boolean;
  isRoot: boolean;
  color: string;
}

export const GrowthMap3DCanvas: React.FC<GrowthMap3DCanvasProps> = ({
  student,
  selectedNodeId,
  onSelectNode,
  clusterFilter,
  autoRotate,
  edgesData,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [projectedLabels, setProjectedLabels] = useState<ProjectedLabel[]>([]);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // References to keep Three.js and D3 objects across renders
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const nodeMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const linkLinesRef = useRef<Map<string, THREE.Line>>(new Map());
  const pulseParticlesRef = useRef<Array<{ mesh: THREE.Mesh; edgeId: string; progress: number; speed: number }>>([]);
  const simulationRef = useRef<d3.Simulation<D3SimulationNode, D3SimulationLink> | null>(null);
  const nodesDataRef = useRef<D3SimulationNode[]>([]);
  const isDraggingOrbitRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const sphericalCoordRef = useRef<{ radius: number; theta: number; phi: number }>({
    radius: 28,
    theta: Math.PI / 4,
    phi: Math.PI / 3,
  });

  // Cluster color mappings
  const getClusterColor = useCallback((cluster: string, trend: string) => {
    if (trend === 'declining') return 0xff6a2b; // Fiery warning amber/coral
    switch (cluster) {
      case 'academic':
        return 0x6f8dff; // Cosmic royal indigo
      case 'skill':
        return 0x10b981; // Emerald mint
      case 'engagement':
        return 0xec4899; // Radiant pink
      case 'presence':
        return 0xa855f7; // Electric purple
      default:
        return 0x38bdf8;
    }
  }, []);

  // Prepare D3 simulation nodes from student data
  const buildNodes = useCallback((): D3SimulationNode[] => {
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

    return [
      {
        id: 'academic',
        name: 'Academic Performance',
        shortLabel: 'ACADEMICS',
        category: 'Foundational Mastery',
        cluster: 'academic',
        value: academicDim ? academicDim.currentValue : student.growthHealth,
        change: academicDim ? academicDim.change : 6,
        trend: academicDim ? academicDim.trend : 'improving',
        radius: 2.4,
        isRoot: true,
        x: 0,
        y: 0,
        z: 0,
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
        radius: 1.8,
        x: 10,
        y: 4,
        z: -3,
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
        radius: 1.8,
        x: 8,
        y: -6,
        z: 4,
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
        radius: 1.7,
        x: 2,
        y: -10,
        z: 3,
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
        radius: 1.9,
        x: -9,
        y: 5,
        z: 5,
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
        radius: 1.7,
        x: -8,
        y: -5,
        z: -4,
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
        radius: 1.75,
        x: -3,
        y: 9,
        z: -4,
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
        radius: 1.8,
        x: 5,
        y: 8,
        z: 5,
      },
    ];
  }, [student]);

  // Set up Three.js Scene and D3.js Force Simulation
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = container.clientWidth || 800;
    const height = 520;

    // 1. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    rendererRef.current = renderer;

    // 2. Scene setup with depth fog
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06081a, 0.015);
    sceneRef.current = scene;

    // 3. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;

    const updateCameraPos = () => {
      const { radius, theta, phi } = sphericalCoordRef.current;
      camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0, 0, 0);
    };
    updateCameraPos();

    // 4. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffb27a, 1.4);
    dirLight1.position.set(20, 30, 20);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x6f8dff, 1.2);
    dirLight2.position.set(-20, -10, -20);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xff6a2b, 2.0, 50);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    // 5. Ambient Coordinate Grid Rings (Evolyn Spatial Astrolabe)
    const astrolabeGroup = new THREE.Group();
    for (let r = 7; r <= 16; r += 4) {
      const ringGeo = new THREE.RingGeometry(r - 0.03, r, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x8c96ff,
        transparent: true,
        opacity: 0.08,
        side: THREE.DoubleSide,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      astrolabeGroup.add(ringMesh);
    }
    scene.add(astrolabeGroup);

    // 6. Build D3 Nodes & Links
    const currentNodes = buildNodes();
    nodesDataRef.current = currentNodes;

    const linksData: D3SimulationLink[] = edgesData.map((e) => ({
      ...e,
      source: e.source,
      target: e.target,
    }));

    // 7. Initialize D3 Force Simulation
    const simulation = d3
      .forceSimulation<D3SimulationNode>(currentNodes)
      .force(
        'link',
        d3
          .forceLink<D3SimulationNode, D3SimulationLink>(linksData)
          .id((d) => d.id)
          .distance((d) => 10 / (d.strength || 0.8))
          .strength((d) => d.strength * 0.45)
      )
      .force('charge', d3.forceManyBody().strength(-65))
      .force('center', d3.forceCenter(0, 0).strength(0.08))
      .force('collide', d3.forceCollide<D3SimulationNode>().radius((d) => d.radius * 2.5));

    simulationRef.current = simulation;

    // 8. Create 3D Node Meshes in Three.js
    const nodeMeshes = new Map<string, THREE.Group>();
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);

    currentNodes.forEach((node) => {
      const group = new THREE.Group();
      const colorHex = getClusterColor(node.cluster, node.trend);

      // Core Sphere
      const sphereMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: node.isRoot ? 0.6 : 0.35,
        roughness: 0.25,
        metalness: 0.15,
      });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMat);
      sphere.scale.setScalar(node.radius);
      sphere.userData = { nodeId: node.id };
      group.add(sphere);

      // Orbital Glowing Torus Ring
      const torusGeo = new THREE.TorusGeometry(node.radius * 1.45, 0.05, 16, 48);
      const torusMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: node.isRoot ? 0.75 : 0.45,
      });
      const torus = new THREE.Mesh(torusGeo, torusMat);
      torus.rotation.x = Math.PI / 3;
      torus.userData = { isRing: true };
      group.add(torus);

      // Secondary Ring for root academics node
      if (node.isRoot) {
        const torus2Geo = new THREE.TorusGeometry(node.radius * 1.8, 0.04, 16, 48);
        const torus2Mat = new THREE.MeshBasicMaterial({
          color: 0xff6a2b,
          transparent: true,
          opacity: 0.6,
        });
        const torus2 = new THREE.Mesh(torus2Geo, torus2Mat);
        torus2.rotation.y = Math.PI / 3;
        group.add(torus2);
      }

      scene.add(group);
      nodeMeshes.set(node.id, group);
    });
    nodeMeshesRef.current = nodeMeshes;

    // 9. Create 3D Link Lines in Three.js
    const linkLines = new Map<string, THREE.Line>();
    const pulseParticles: Array<{ mesh: THREE.Mesh; edgeId: string; progress: number; speed: number }> = [];
    const particleGeometry = new THREE.SphereGeometry(0.22, 16, 16);

    edgesData.forEach((edge) => {
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 0),
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x8c96ff,
        transparent: true,
        opacity: 0.35,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      scene.add(line);
      linkLines.set(edge.id, line);

      // Dynamic Energy Pulse Particle traveling along the link
      const particleMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
      });
      const particleMesh = new THREE.Mesh(particleGeometry, particleMat);
      scene.add(particleMesh);
      pulseParticles.push({
        mesh: particleMesh,
        edgeId: edge.id,
        progress: Math.random(),
        speed: 0.005 + (edge.strength || 0.8) * 0.006,
      });
    });
    linkLinesRef.current = linkLines;
    pulseParticlesRef.current = pulseParticles;

    // 10. Animation & Render Loop
    let animationId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Slow auto-rotation around Y axis if enabled and not dragging
      if (autoRotate && !isDraggingOrbitRef.current) {
        sphericalCoordRef.current.theta += 0.003;
        updateCameraPos();
      }

      // Rotate orbital rings around nodes
      nodeMeshesRef.current.forEach((group) => {
        group.children.forEach((child) => {
          if (child.userData.isRing) {
            child.rotation.z += 0.015;
          }
        });
      });

      // Update 3D node positions from D3 simulation
      const nodePosMap = new Map<string, THREE.Vector3>();

      nodesDataRef.current.forEach((d) => {
        const meshGroup = nodeMeshesRef.current.get(d.id);
        if (meshGroup) {
          // Map D3 2D coordinates into 3D space with slight vertical wave
          const zDepth = d.z ?? Math.sin((d.x || 0) * 0.2 + elapsedTime) * 2;
          meshGroup.position.set(d.x || 0, d.y || 0, zDepth);
          nodePosMap.set(d.id, meshGroup.position.clone());
        }
      });

      // Update 3D Link line geometries
      edgesData.forEach((edge) => {
        const sourcePos = nodePosMap.get(edge.source);
        const targetPos = nodePosMap.get(edge.target);
        const line = linkLinesRef.current.get(edge.id);

        if (sourcePos && targetPos && line) {
          line.geometry.setFromPoints([sourcePos, targetPos]);
          line.geometry.computeBoundingSphere();
        }
      });

      // Update 3D Pulse particles along lines
      pulseParticlesRef.current.forEach((p) => {
        const edge = edgesData.find((e) => e.id === p.edgeId);
        if (!edge) return;
        const sourcePos = nodePosMap.get(edge.source);
        const targetPos = nodePosMap.get(edge.target);

        if (sourcePos && targetPos) {
          p.progress = (p.progress + p.speed) % 1;
          p.mesh.position.lerpVectors(sourcePos, targetPos, p.progress);
        }
      });

      // Calculate Projected Screen Coordinates for DOM labels
      const projected: ProjectedLabel[] = [];
      nodesDataRef.current.forEach((d) => {
        const meshGroup = nodeMeshesRef.current.get(d.id);
        if (!meshGroup) return;

        const worldPos = meshGroup.position.clone();
        worldPos.y += d.radius + 0.6; // Slightly above sphere
        worldPos.project(camera);

        const isBehindCamera = worldPos.z > 1;
        const screenX = ((worldPos.x + 1) * width) / 2;
        const screenY = ((-worldPos.y + 1) * height) / 2;

        const isFilteredOut = clusterFilter !== 'all' && d.cluster !== clusterFilter;

        projected.push({
          id: d.id,
          name: d.shortLabel,
          value: d.value,
          trend: d.trend,
          screenX,
          screenY,
          visible: !isBehindCamera && !isFilteredOut,
          isRoot: !!d.isRoot,
          color: d.trend === 'declining' ? '#ff6a2b' : d.cluster === 'skill' ? '#10b981' : '#6f8dff',
        });
      });
      setProjectedLabels(projected);

      // Render Three.js Scene
      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newWidth = container.clientWidth;
      camera.aspect = newWidth / height;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      simulation.stop();
      renderer.dispose();
    };
  }, [buildNodes, edgesData, getClusterColor, clusterFilter, autoRotate]);

  // Update Visual Highlights when selectedNodeId or clusterFilter changes
  useEffect(() => {
    nodeMeshesRef.current.forEach((group, id) => {
      const isSelected = id === selectedNodeId;
      const isHovered = id === hoveredNodeId;
      const node = nodesDataRef.current.find((n) => n.id === id);
      const isFilteredOut = clusterFilter !== 'all' && node?.cluster !== clusterFilter;

      // Scale pulse
      const targetScale = isSelected ? 1.25 : isHovered ? 1.15 : 1.0;
      group.scale.setScalar(targetScale);

      // Materials highlight
      group.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.opacity = isFilteredOut ? 0.18 : 1.0;
            child.material.transparent = isFilteredOut;
            child.material.emissiveIntensity = isSelected ? 0.9 : 0.35;
          }
        }
      });
    });

    // Highlight links connected to selected node
    linkLinesRef.current.forEach((line, edgeId) => {
      const edge = edgesData.find((e) => e.id === edgeId);
      if (!edge) return;
      const isConnected = edge.source === selectedNodeId || edge.target === selectedNodeId;

      if (line.material instanceof THREE.LineBasicMaterial) {
        line.material.opacity = isConnected ? 0.85 : 0.22;
        line.material.color.setHex(isConnected ? 0xff6a2b : 0x6f8dff);
      }
    });
  }, [selectedNodeId, hoveredNodeId, clusterFilter, edgesData]);

  // Orbit Mouse Drag Controls
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingOrbitRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const container = containerRef.current;
    const camera = cameraRef.current;
    if (!container || !camera) return;

    // 1. Orbit Camera Dragging
    if (isDraggingOrbitRef.current) {
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      sphericalCoordRef.current.theta -= deltaX * 0.008;
      sphericalCoordRef.current.phi = Math.max(
        0.1,
        Math.min(Math.PI - 0.1, sphericalCoordRef.current.phi - deltaY * 0.008)
      );

      const { radius, theta, phi } = sphericalCoordRef.current;
      camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0, 0, 0);

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    // 2. Raycaster Hover Detection
    const rect = container.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

    const hitObjects: THREE.Object3D[] = [];
    nodeMeshesRef.current.forEach((group) => {
      group.children.forEach((c) => {
        if (c.userData.nodeId) hitObjects.push(c);
      });
    });

    const intersects = raycaster.intersectObjects(hitObjects);
    if (intersects.length > 0) {
      const hitId = intersects[0].object.userData.nodeId as string;
      setHoveredNodeId(hitId);
      container.style.cursor = 'pointer';
    } else {
      setHoveredNodeId(null);
      container.style.cursor = 'grab';
    }
  };

  const handleMouseUp = () => {
    isDraggingOrbitRef.current = false;
  };

  // Zoom with Mouse Wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const camera = cameraRef.current;
    if (!camera) return;

    sphericalCoordRef.current.radius = Math.max(
      14,
      Math.min(50, sphericalCoordRef.current.radius + e.deltaY * 0.02)
    );

    const { radius, theta, phi } = sphericalCoordRef.current;
    camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
    camera.position.y = radius * Math.cos(phi);
    camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
    camera.lookAt(0, 0, 0);
  };

  // Click on 3D node
  const handleClick = (e: React.MouseEvent) => {
    const container = containerRef.current;
    const camera = cameraRef.current;
    if (!container || !camera) return;

    const rect = container.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

    const hitObjects: THREE.Object3D[] = [];
    nodeMeshesRef.current.forEach((group) => {
      group.children.forEach((c) => {
        if (c.userData.nodeId) hitObjects.push(c);
      });
    });

    const intersects = raycaster.intersectObjects(hitObjects);
    if (intersects.length > 0) {
      const hitId = intersects[0].object.userData.nodeId as string;
      onSelectNode(hitId);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[520px] rounded-2xl bg-[#040615] overflow-hidden select-none border border-[rgba(140,150,255,0.22)] shadow-2xl"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onClick={handleClick}
    >
      {/* Three.js WebGL Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Semantic Crisp DOM Labels Projected Directly Above 3D Nodes */}
      <div className="absolute inset-0 pointer-events-none">
        {projectedLabels.map((lbl) => {
          if (!lbl.visible) return null;
          const isSelected = lbl.id === selectedNodeId;
          const isHovered = lbl.id === hoveredNodeId;

          return (
            <div
              key={lbl.id}
              className={`absolute transform -translate-x-1/2 -translate-y-full transition-transform duration-75 pointer-events-auto cursor-pointer ${
                isSelected ? 'scale-110 z-30' : isHovered ? 'scale-105 z-20' : 'z-10'
              }`}
              style={{
                left: `${lbl.screenX}px`,
                top: `${lbl.screenY}px`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectNode(lbl.id);
              }}
            >
              <div
                className={`px-2.5 py-1 rounded-lg backdrop-blur-md border text-center transition-all ${
                  isSelected
                    ? 'bg-[#0f143a]/95 border-[#ff6a2b] shadow-lg shadow-[#ff6a2b]/30'
                    : isHovered
                    ? 'bg-[#0c0f2f]/90 border-[#6f8dff] shadow-md shadow-blue-500/20'
                    : 'bg-[#06081b]/75 border-white/10'
                }`}
              >
                <div className="flex items-center gap-1.5 justify-center">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: lbl.color }}
                  />
                  <span
                    className={`font-baskerville font-bold text-[11px] whitespace-nowrap ${
                      isSelected ? 'text-white' : 'text-[#e2e6ff]'
                    }`}
                  >
                    {lbl.name}
                  </span>
                </div>
                <div className="text-[10px] font-mono font-bold text-[#ffb27a]">
                  {lbl.value}%{' '}
                  <span
                    className={
                      lbl.trend === 'improving'
                        ? 'text-emerald-400'
                        : lbl.trend === 'declining'
                        ? 'text-[#ff6a2b]'
                        : 'text-amber-400'
                    }
                  >
                    {lbl.trend === 'improving' ? '↑' : lbl.trend === 'declining' ? '↓' : '→'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating 3D Navigation Guide HUD */}
      <div className="absolute bottom-3 left-3 z-30 flex items-center gap-3 px-3 py-1.5 rounded-full bg-black/60 border border-white/10 text-[10px] font-mono text-[#a4a9d0] backdrop-blur-md">
        <span>🖱️ Drag to Orbit 3D</span>
        <span>•</span>
        <span>📜 Scroll to Zoom</span>
        <span>•</span>
        <span>🎯 Click Node to Inspect</span>
      </div>

      {/* 3D Engine Badge */}
      <div className="absolute bottom-3 right-3 z-30 flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/60 border border-white/10 text-[10px] font-mono text-[#6f8dff] backdrop-blur-md">
        <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-pulse" />
        <span>Three.js + D3 Force Engine</span>
      </div>
    </div>
  );
};
