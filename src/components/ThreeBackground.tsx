import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeBackgroundProps {
  scrollProgress: number; // 0 to 1
}

export const ThreeBackground: React.FC<ThreeBackgroundProps> = ({ scrollProgress }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // References for animating objects
  const sanctuaryGroupRef = useRef<THREE.Group | null>(null);
  const beaconRef = useRef<THREE.Mesh | null>(null);
  const ringsRef = useRef<THREE.Group | null>(null);
  const cloudSpritesRef = useRef<THREE.Sprite[]>([]);
  const particlesRef = useRef<THREE.Points | null>(null);
  const signalNodesRef = useRef<THREE.Group | null>(null);

  // Mouse parallax
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Twilight fog matching the reference video palette
    const fogColor = new THREE.Color(0x170a30);
    scene.background = fogColor;
    scene.fog = new THREE.FogExp2(0x170a30, 0.015);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 4, 28);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting setup
    // Ambient soft twilight light
    const ambientLight = new THREE.AmbientLight(0x5b3582, 1.2);
    scene.add(ambientLight);

    // Warm key light from lower-right (sunrise/sunset glow like in reference)
    const keyLight = new THREE.DirectionalLight(0xf472b6, 2.4);
    keyLight.position.set(15, 12, 10);
    scene.add(keyLight);

    // Cool fill light from left
    const fillLight = new THREE.DirectionalLight(0x818cf8, 1.6);
    fillLight.position.set(-15, 10, -5);
    scene.add(fillLight);

    // Golden rim light from behind peak
    const rimLight = new THREE.DirectionalLight(0xfcd34d, 1.8);
    rimLight.position.set(0, 18, -15);
    scene.add(rimLight);

    // Point lights for warm glowing sanctuary windows
    const sanctuaryWarmLight = new THREE.PointLight(0xfbbf24, 2.5, 15);
    sanctuaryWarmLight.position.set(0, 3, 0);
    scene.add(sanctuaryWarmLight);

    const beaconCyanLight = new THREE.PointLight(0x38bdf8, 2.0, 12);
    beaconCyanLight.position.set(0, 7.5, 0);
    scene.add(beaconCyanLight);

    // 5. Central 3D Object Group: Mountain & Architectural Sanctuary
    const sanctuaryGroup = new THREE.Group();
    sanctuaryGroupRef.current = sanctuaryGroup;
    scene.add(sanctuaryGroup);

    // A. Mountain Spire Base
    // Multi-faceted rocky pinnacle geometry
    const mountainGeo = new THREE.ConeGeometry(7.5, 16, 9, 7);
    // Displace vertices to create craggy mountain ridges
    const pos = mountainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      if (y < 7) {
        const noise = (Math.sin(pos.getX(i) * 1.5) + Math.cos(pos.getZ(i) * 1.5)) * 0.45;
        pos.setX(i, pos.getX(i) + noise);
        pos.setZ(i, pos.getZ(i) + noise * 0.8);
      }
    }
    mountainGeo.computeVertexNormals();

    const mountainMat = new THREE.MeshStandardMaterial({
      color: 0x271946,
      roughness: 0.85,
      metalness: 0.15,
      flatShading: true,
    });
    const mountainMesh = new THREE.Mesh(mountainGeo, mountainMat);
    mountainMesh.position.y = -6.5;
    sanctuaryGroup.add(mountainMesh);

    // Mountain crags / rock shelves
    const shelfGeo = new THREE.DodecahedronGeometry(2.2, 0);
    const shelfMat = new THREE.MeshStandardMaterial({
      color: 0x3b2461,
      roughness: 0.9,
      flatShading: true,
    });
    for (let i = 0; i < 7; i++) {
      const shelf = new THREE.Mesh(shelfGeo, shelfMat);
      const angle = (i / 7) * Math.PI * 2;
      const radius = 3.6 + Math.sin(i) * 0.8;
      shelf.position.set(Math.cos(angle) * radius, -2 + Math.cos(i * 2) * 1.5, Math.sin(angle) * radius);
      shelf.scale.set(1.2, 0.7, 1.4);
      shelf.rotation.set(Math.sin(i), angle, 0.2);
      sanctuaryGroup.add(shelf);
    }

    // Stylized pine tree clusters along ridges
    const treeTrunkGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.8, 5);
    const treeTrunkMat = new THREE.MeshBasicMaterial({ color: 0x1b1129 });
    const treeFoliageGeo = new THREE.ConeGeometry(0.7, 1.4, 5);
    const treeFoliageMat = new THREE.MeshStandardMaterial({
      color: 0x1a332d,
      roughness: 0.9,
      flatShading: true,
    });

    const createTree = (x: number, y: number, z: number, scale = 1) => {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(treeTrunkGeo, treeTrunkMat);
      trunk.position.y = 0.4;
      tree.add(trunk);
      const foliage = new THREE.Mesh(treeFoliageGeo, treeFoliageMat);
      foliage.position.y = 1.2;
      tree.add(foliage);
      const foliageTop = new THREE.Mesh(treeFoliageGeo, treeFoliageMat);
      foliageTop.position.y = 1.7;
      foliageTop.scale.set(0.7, 0.7, 0.7);
      tree.add(foliageTop);
      tree.position.set(x, y, z);
      tree.scale.set(scale, scale, scale);
      tree.rotation.y = Math.random() * Math.PI;
      sanctuaryGroup.add(tree);
    };

    // Plant trees on mountain terraces
    createTree(-2.5, -0.8, 1.8, 1.1);
    createTree(2.2, -1.2, 1.9, 0.9);
    createTree(-1.8, -1.6, -2.2, 1.2);
    createTree(3.1, -2.4, -1.2, 1.0);
    createTree(-3.2, -3.1, 0.5, 1.3);
    createTree(1.5, -2.8, 2.8, 0.8);

    // B. Architectural Sanctuary perched at the peak (like reference video)
    // Tier 1: Base Platform
    const tier1BaseGeo = new THREE.BoxGeometry(3.6, 0.4, 3.6);
    const woodPlatformMat = new THREE.MeshStandardMaterial({
      color: 0x4a2a22,
      roughness: 0.7,
    });
    const tier1Base = new THREE.Mesh(tier1BaseGeo, woodPlatformMat);
    tier1Base.position.y = 1.5;
    sanctuaryGroup.add(tier1Base);

    // Tier 1: Main illuminated pavilion walls
    const tier1WallGeo = new THREE.BoxGeometry(3.0, 1.5, 3.0);
    const tier1WallMat = new THREE.MeshStandardMaterial({
      color: 0x221338,
      roughness: 0.6,
    });
    const tier1Wall = new THREE.Mesh(tier1WallGeo, tier1WallMat);
    tier1Wall.position.y = 2.45;
    sanctuaryGroup.add(tier1Wall);

    // Glowing warm windows (representing intelligence and life)
    const windowMat = new THREE.MeshBasicMaterial({
      color: 0xffd17a,
    });
    const windowGeo = new THREE.PlaneGeometry(0.5, 0.9);
    
    // Front windows
    for (let w = -1; w <= 1; w += 1) {
      const win = new THREE.Mesh(windowGeo, windowMat);
      win.position.set(w * 0.9, 2.5, 1.51);
      sanctuaryGroup.add(win);

      // Back windows
      const winBack = new THREE.Mesh(windowGeo, windowMat);
      winBack.position.set(w * 0.9, 2.5, -1.51);
      winBack.rotation.y = Math.PI;
      sanctuaryGroup.add(winBack);

      // Side windows
      const winLeft = new THREE.Mesh(windowGeo, windowMat);
      winLeft.position.set(-1.51, 2.5, w * 0.9);
      winLeft.rotation.y = -Math.PI / 2;
      sanctuaryGroup.add(winLeft);

      const winRight = new THREE.Mesh(windowGeo, windowMat);
      winRight.position.set(1.51, 2.5, w * 0.9);
      winRight.rotation.y = Math.PI / 2;
      sanctuaryGroup.add(winRight);
    }

    // Tier 1 Roof Eaves (flared pagoda style)
    const roof1Geo = new THREE.ConeGeometry(2.8, 0.7, 4);
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x3d2159,
      roughness: 0.5,
      metalness: 0.3,
    });
    const roof1 = new THREE.Mesh(roof1Geo, roofMat);
    roof1.position.y = 3.55;
    roof1.rotation.y = Math.PI / 4;
    roof1.scale.set(1.4, 0.6, 1.4);
    sanctuaryGroup.add(roof1);

    // Tier 2: Mid-level Pavilion
    const tier2WallGeo = new THREE.BoxGeometry(2.1, 1.2, 2.1);
    const tier2Wall = new THREE.Mesh(tier2WallGeo, tier1WallMat);
    tier2Wall.position.y = 4.3;
    sanctuaryGroup.add(tier2Wall);

    for (let w = -0.6; w <= 0.6; w += 1.2) {
      const win2 = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.7), windowMat);
      win2.position.set(w, 4.3, 1.06);
      sanctuaryGroup.add(win2);

      const win2Back = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.7), windowMat);
      win2Back.position.set(w, 4.3, -1.06);
      win2Back.rotation.y = Math.PI;
      sanctuaryGroup.add(win2Back);
    }

    // Tier 2 Roof
    const roof2 = new THREE.Mesh(roof1Geo, roofMat);
    roof2.position.y = 5.2;
    roof2.rotation.y = Math.PI / 4;
    roof2.scale.set(1.1, 0.5, 1.1);
    sanctuaryGroup.add(roof2);

    // Tier 3: Upper Observatory Pavilion
    const tier3WallGeo = new THREE.CylinderGeometry(0.8, 0.9, 1.0, 8);
    const tier3Wall = new THREE.Mesh(tier3WallGeo, tier1WallMat);
    tier3Wall.position.y = 6.0;
    sanctuaryGroup.add(tier3Wall);

    // Tier 3 Roof spire
    const roof3 = new THREE.Mesh(roof1Geo, roofMat);
    roof3.position.y = 6.8;
    roof3.rotation.y = Math.PI / 4;
    roof3.scale.set(0.7, 0.6, 0.7);
    sanctuaryGroup.add(roof3);

    // C. Floating Luminous Intelligence Beacon at Apex
    // Represents student evolution, potential, and guidance
    const beaconGeo = new THREE.OctahedronGeometry(0.55, 0);
    const beaconMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x22d3ee,
      emissiveIntensity: 0.9,
      roughness: 0.1,
      metalness: 0.9,
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.y = 7.7;
    sanctuaryGroup.add(beacon);
    beaconRef.current = beacon;

    // Glowing wireframe aura around beacon
    const beaconWireGeo = new THREE.IcosahedronGeometry(0.85, 1);
    const beaconWireMat = new THREE.MeshBasicMaterial({
      color: 0xc084fc,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const beaconWire = new THREE.Mesh(beaconWireGeo, beaconWireMat);
    beaconWire.position.y = 7.7;
    sanctuaryGroup.add(beaconWire);

    // D. Concentric Orbital Energy Rings around the sanctuary
    // Symbolizes the DETECT -> UNDERSTAND -> INTERVENE -> EVOLVE loop
    const ringsGroup = new THREE.Group();
    ringsGroup.position.y = 4.5;
    sanctuaryGroup.add(ringsGroup);
    ringsRef.current = ringsGroup;

    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0xf472b6,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
    });
    const ringGeo1 = new THREE.RingGeometry(4.5, 4.58, 64);
    const ringMesh1 = new THREE.Mesh(ringGeo1, ringMat1);
    ringMesh1.rotation.x = Math.PI / 2.2;
    ringMesh1.rotation.y = 0.2;
    ringsGroup.add(ringMesh1);

    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    });
    const ringGeo2 = new THREE.RingGeometry(5.4, 5.46, 64);
    const ringMesh2 = new THREE.Mesh(ringGeo2, ringMat2);
    ringMesh2.rotation.x = Math.PI / 1.9;
    ringMesh2.rotation.y = -0.3;
    ringsGroup.add(ringMesh2);

    const ringMat3 = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    const ringGeo3 = new THREE.RingGeometry(6.6, 6.65, 64);
    const ringMesh3 = new THREE.Mesh(ringGeo3, ringMat3);
    ringMesh3.rotation.x = Math.PI / 2.05;
    ringMesh3.rotation.y = 0.4;
    ringsGroup.add(ringMesh3);

    // E. Multidimensional Student Signals (Spatial Nodes)
    // Academic, Attendance, Engagement, Assignments, Communication, Skills, Progress
    const signalNodes = new THREE.Group();
    signalNodesRef.current = signalNodes;
    sanctuaryGroup.add(signalNodes);

    const signalColors = [0xec4899, 0xa855f7, 0x38bdf8, 0x34d399, 0xfbbf24, 0x818cf8, 0xf43f5e];
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const radius = 5.2 + Math.sin(i * 3) * 0.8;
      const height = 1 + (i % 3) * 1.8;
      
      const nodeGeo = new THREE.SphereGeometry(0.18, 16, 16);
      const nodeMat = new THREE.MeshBasicMaterial({
        color: signalColors[i],
      });
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      node.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
      signalNodes.add(node);

      // Delicate vertical signal trail
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(node.position.x, node.position.y - 1.2, node.position.z),
        new THREE.Vector3(node.position.x, node.position.y + 1.2, node.position.z),
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: signalColors[i],
        transparent: true,
        opacity: 0.3,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      signalNodes.add(line);
    }

    // 6. Volumetric Procedural Cloud Sprites (Pink, Violet, Twilight)
    // Generates soft radial puff texture dynamically using Canvas 2D
    const createCloudTexture = (colorHex: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        gradient.addColorStop(0, colorHex);
        gradient.addColorStop(0.4, colorHex.replace('1)', '0.5)'));
        gradient.addColorStop(0.8, colorHex.replace('1)', '0.15)'));
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 128, 128);
      }
      return new THREE.CanvasTexture(canvas);
    };

    const pinkCloudTex = createCloudTexture('rgba(244, 114, 182, 0.7)');
    const violetCloudTex = createCloudTexture('rgba(168, 85, 247, 0.65)');
    const twilightCloudTex = createCloudTexture('rgba(129, 140, 248, 0.6)');
    const deepPurpleCloudTex = createCloudTexture('rgba(76, 29, 149, 0.85)');

    const cloudSprites: THREE.Sprite[] = [];
    const cloudTextures = [pinkCloudTex, violetCloudTex, twilightCloudTex, deepPurpleCloudTex];

    // Create cloud bank surrounding the mountain base and horizon
    for (let i = 0; i < 48; i++) {
      const tex = cloudTextures[i % cloudTextures.length];
      const mat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        opacity: 0.55 + Math.random() * 0.35,
        blending: THREE.NormalBlending,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(mat);
      
      const angle = (i / 48) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const radius = 6 + Math.random() * 18;
      const y = -6.5 + (Math.random() - 0.3) * 6;

      sprite.position.set(
        Math.cos(angle) * radius,
        y,
        Math.sin(angle) * radius
      );
      
      const scale = 7 + Math.random() * 9;
      sprite.scale.set(scale, scale * 0.65, 1);
      
      scene.add(sprite);
      cloudSprites.push(sprite);
    }
    cloudSpritesRef.current = cloudSprites;

    // 7. Ambient Rising Spark Particles (Ascending Thoughts & Signals)
    const particleCount = 240;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const pColor1 = new THREE.Color(0xf472b6); // pink
    const pColor2 = new THREE.Color(0xc084fc); // purple
    const pColor3 = new THREE.Color(0x38bdf8); // cyan

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 36;
      particlePositions[i * 3 + 1] = -10 + Math.random() * 30;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 36;

      const choice = Math.random();
      const col = choice < 0.4 ? pColor1 : choice < 0.75 ? pColor2 : pColor3;
      particleColors[i * 3] = col.r;
      particleColors[i * 3 + 1] = col.g;
      particleColors[i * 3 + 2] = col.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particlesRef.current = particles;

    // 8. Event Listeners
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    // 9. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerping
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Rotate beacon
      if (beaconRef.current) {
        beaconRef.current.rotation.y = elapsedTime * 0.8;
        beaconRef.current.rotation.x = Math.sin(elapsedTime * 0.5) * 0.3;
        beaconRef.current.position.y = 7.7 + Math.sin(elapsedTime * 1.5) * 0.12;
      }

      // Rotate concentric energy rings
      if (ringsRef.current) {
        ringsRef.current.rotation.y = elapsedTime * 0.15;
      }

      // Rotate signal nodes
      if (signalNodesRef.current) {
        signalNodesRef.current.rotation.y = -elapsedTime * 0.1;
      }

      // Sanctuary subtle breathing sway
      if (sanctuaryGroupRef.current) {
        sanctuaryGroupRef.current.position.y = Math.sin(elapsedTime * 0.6) * 0.2;
      }

      // Slowly drift clouds
      cloudSprites.forEach((sprite, idx) => {
        const speed = 0.05 + (idx % 5) * 0.02;
        sprite.position.x += Math.sin(elapsedTime * 0.2 + idx) * 0.005;
        sprite.position.y += Math.cos(elapsedTime * 0.3 + idx) * 0.003;
      });

      // Animate rising particles
      if (particlesRef.current) {
        const pPositions = particlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          pPositions[i * 3 + 1] += 0.025; // drift upwards
          if (pPositions[i * 3 + 1] > 20) {
            pPositions[i * 3 + 1] = -10;
          }
        }
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Camera choreography based on scrollProgress
      // Scroll moves camera smoothly through the cinematic layers
      if (cameraRef.current) {
        const scrollP = Math.max(0, Math.min(1, scrollProgress));
        
        // Target camera trajectory:
        // Hero (0.0): looking at mountain peak from slightly below
        // Section 2 (0.15 - 0.3): sweeps forward into the cloud mist
        // Section 3-4 (0.3 - 0.6): shifts perspective to high-angle side view
        // Section 5-6 (0.6 - 0.8): rises to beacon level
        // Final (0.8 - 1.0): cinematic expansive perspective
        const targetCamX = Math.sin(scrollP * Math.PI * 1.2) * 9 + mouseRef.current.x * 1.5;
        const targetCamY = 3.5 + scrollP * 7 + mouseRef.current.y * 1.2;
        const targetCamZ = 28 - scrollP * 14;

        cameraRef.current.position.x += (targetCamX - cameraRef.current.position.x) * 0.06;
        cameraRef.current.position.y += (targetCamY - cameraRef.current.position.y) * 0.06;
        cameraRef.current.position.z += (targetCamZ - cameraRef.current.position.z) * 0.06;

        const targetLookAtY = 3.0 + scrollP * 3.5;
        cameraRef.current.lookAt(0, targetLookAtY, 0);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden w-full h-full"
      style={{
        background: 'radial-gradient(ellipse at 50% 35%, #2a114f 0%, #170932 45%, #0b0416 100%)',
      }}
    />
  );
};
