import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface GalaxyCanvasProps {
  scrollProgress: number;
}

export const GalaxyCanvas: React.FC<GalaxyCanvasProps> = ({ scrollProgress }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef<number>(0);

  useEffect(() => {
    scrollRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // WebGL Renderer with performance configurations
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x02030d, 1);
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02030d, 0.022);

    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      300
    );
    camera.position.set(0, 5, 9);

    // ==========================================
    // 1. CUSTOM ATMOSPHERIC GALAXY SHADER
    // ==========================================
    const isMobile = window.innerWidth < 768;
    const galaxyCount = isMobile ? 35000 : 70000;
    const radius = 8.5;
    const branches = 3;
    const spin = 1.4;
    const randomness = 0.38;

    const positions = new Float32Array(galaxyCount * 3);
    const colors = new Float32Array(galaxyCount * 3);
    const scales = new Float32Array(galaxyCount);
    const randomFactors = new Float32Array(galaxyCount);

    const colorCoreHot = new THREE.Color(0xfff3e0); // Super-hot glowing center
    const colorCoreAmber = new THREE.Color(0xff6a2b); // Primary amber/orange
    const colorMidViolet = new THREE.Color(0x9d50bb); // Transitional twilight violet
    const colorArmBlue = new THREE.Color(0x4d6bff); // Electric cosmic blue
    const colorOuterAzure = new THREE.Color(0x2244aa); // Deep interstellar edge

    for (let i = 0; i < galaxyCount; i++) {
      const r = Math.pow(Math.random(), 1.6) * radius;
      const branchAngle = ((i % branches) / branches) * Math.PI * 2;
      const spinAngle = r * spin;

      const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * randomness * r;
      const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * randomness * r * 0.45;
      const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * randomness * r;

      positions[i * 3] = Math.cos(branchAngle + spinAngle) * r + randomX;
      positions[i * 3 + 1] = randomY;
      positions[i * 3 + 2] = Math.sin(branchAngle + spinAngle) * r + randomZ;

      const normRadius = r / radius;
      let particleColor: THREE.Color;

      if (normRadius < 0.15) {
        particleColor = colorCoreHot.clone().lerp(colorCoreAmber, normRadius / 0.15);
      } else if (normRadius < 0.5) {
        particleColor = colorCoreAmber.clone().lerp(colorMidViolet, (normRadius - 0.15) / 0.35);
      } else {
        particleColor = colorMidViolet.clone().lerp(colorArmBlue, (normRadius - 0.5) / 0.5);
        if (normRadius > 0.85) {
          particleColor.lerp(colorOuterAzure, 0.4);
        }
      }

      colors[i * 3] = particleColor.r;
      colors[i * 3 + 1] = particleColor.g;
      colors[i * 3 + 2] = particleColor.b;

      scales[i] = Math.random() * 0.8 + 0.4;
      randomFactors[i] = Math.random();
    }

    const galaxyGeometry = new THREE.BufferGeometry();
    galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    galaxyGeometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    galaxyGeometry.setAttribute('aRandomness', new THREE.BufferAttribute(randomFactors, 1));

    const galaxyMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        attribute float aScale;
        attribute float aRandomness;
        varying vec3 vColor;
        varying float vRandomness;
        uniform float uTime;
        uniform float uPixelRatio;

        void main() {
          vColor = color;
          vRandomness = aRandomness;

          vec4 modelPosition = modelMatrix * vec4(position, 1.0);

          float dist = length(modelPosition.xz);
          float angle = atan(modelPosition.z, modelPosition.x);
          float wave = sin(uTime * 0.8 + dist * 1.5 + angle * 2.0) * 0.08;
          modelPosition.y += wave * (1.0 - smoothstep(0.0, 7.0, dist));

          vec4 viewPosition = viewMatrix * modelPosition;
          vec4 projectedPosition = projectionMatrix * viewPosition;
          gl_Position = projectedPosition;

          float twinkle = sin(uTime * 2.0 + aRandomness * 6.28) * 0.25 + 0.75;
          gl_PointSize = aScale * 50.0 * uPixelRatio * twinkle;
          gl_PointSize *= (1.0 / -viewPosition.z);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vRandomness;

        void main() {
          vec2 coord = gl_PointCoord - vec2(0.5);
          float dist = length(coord);

          if (dist > 0.5) discard;

          float core = pow(clamp(1.0 - dist * 3.5, 0.0, 1.0), 3.0);
          float body = pow(clamp(1.0 - dist * 2.0, 0.0, 1.0), 1.8);
          float halo = pow(clamp(1.0 - dist * 2.0, 0.0, 1.0), 3.5);

          vec3 finalColor = vColor * body + vec3(1.0, 0.95, 0.9) * core * 1.4;
          float alpha = (core * 0.9 + body * 0.6 + halo * 0.3);

          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const galaxyPoints = new THREE.Points(galaxyGeometry, galaxyMaterial);
    scene.add(galaxyPoints);

    // ==========================================
    // 2. VOLUMETRIC CORE NEBULA GLOW
    // ==========================================
    const coreNebulaCount = isMobile ? 600 : 1400;
    const coreNebulaGeo = new THREE.BufferGeometry();
    const coreNebulaPos = new Float32Array(coreNebulaCount * 3);
    const coreNebulaCol = new Float32Array(coreNebulaCount * 3);
    const coreNebulaScale = new Float32Array(coreNebulaCount);

    const coreColorA = new THREE.Color(0xff6a2b);
    const coreColorB = new THREE.Color(0xff9e64);

    for (let c = 0; c < coreNebulaCount; c++) {
      const rad = Math.pow(Math.random(), 2.2) * 2.2;
      const th = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 0.6;

      coreNebulaPos[c * 3] = Math.cos(th) * rad;
      coreNebulaPos[c * 3 + 1] = y;
      coreNebulaPos[c * 3 + 2] = Math.sin(th) * rad;

      const col = coreColorA.clone().lerp(coreColorB, Math.random());
      coreNebulaCol[c * 3] = col.r;
      coreNebulaCol[c * 3 + 1] = col.g;
      coreNebulaCol[c * 3 + 2] = col.b;

      coreNebulaScale[c] = Math.random() * 2.0 + 1.2;
    }

    coreNebulaGeo.setAttribute('position', new THREE.BufferAttribute(coreNebulaPos, 3));
    coreNebulaGeo.setAttribute('color', new THREE.BufferAttribute(coreNebulaCol, 3));
    coreNebulaGeo.setAttribute('aScale', new THREE.BufferAttribute(coreNebulaScale, 1));
    coreNebulaGeo.setAttribute(
      'aRandomness',
      new THREE.BufferAttribute(new Float32Array(coreNebulaCount).map(() => Math.random()), 1)
    );

    const coreNebula = new THREE.Points(coreNebulaGeo, galaxyMaterial);
    scene.add(coreNebula);

    // ==========================================
    // 3. DEEP COSMIC STARFIELD
    // ==========================================
    const starCount = isMobile ? 1800 : 3200;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starScales = new Float32Array(starCount);

    const cyanStar = new THREE.Color(0x9bd4ff);
    const warmStar = new THREE.Color(0xffdfba);
    const whiteStar = new THREE.Color(0xffffff);

    for (let j = 0; j < starCount; j++) {
      const dist = 35 + Math.random() * 85;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      starPositions[j * 3] = dist * Math.sin(phi) * Math.cos(theta);
      starPositions[j * 3 + 1] = dist * Math.sin(phi) * Math.sin(theta);
      starPositions[j * 3 + 2] = dist * Math.cos(phi);

      const dice = Math.random();
      const col = dice < 0.4 ? cyanStar : dice < 0.75 ? whiteStar : warmStar;
      const intensity = 0.5 + Math.random() * 0.5;

      starColors[j * 3] = col.r * intensity;
      starColors[j * 3 + 1] = col.g * intensity;
      starColors[j * 3 + 2] = col.b * intensity;

      starScales[j] = Math.random() * 0.6 + 0.3;
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    starGeo.setAttribute('aScale', new THREE.BufferAttribute(starScales, 1));
    starGeo.setAttribute(
      'aRandomness',
      new THREE.BufferAttribute(new Float32Array(starCount).map(() => Math.random()), 1)
    );

    const stars = new THREE.Points(starGeo, galaxyMaterial);
    scene.add(stars);

    // ==========================================
    // 4. PERFORMANCE OPTIMIZED RENDER LOOP
    // ==========================================
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const onPointerMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      galaxyMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
    };

    // Context loss / restoration handlers
    const onContextLost = (e: Event) => {
      e.preventDefault();
      if (reqId) cancelAnimationFrame(reqId);
    };

    const onContextRestored = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      tick();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    canvas.addEventListener('webglcontextlost', onContextLost, false);
    canvas.addEventListener('webglcontextrestored', onContextRestored, false);

    // Precise 60fps frame rate throttling & delta clamping
    let reqId: number;
    let camX = 0;
    let camY = 5;
    let camZ = 9;
    const targetFpsInterval = 1000 / 60; // 16.66ms cap
    let lastFrameTime = performance.now();
    let accumulatedTime = 0;

    const tick = () => {
      reqId = requestAnimationFrame(tick);

      // Pause GPU usage when browser tab is inactive/hidden
      if (document.hidden) return;

      const now = performance.now();
      const elapsed = now - lastFrameTime;

      // Throttle if fired faster than 60fps
      if (elapsed < targetFpsInterval - 1) return;

      // Clamp delta to prevent erratic jump after tab switch
      const delta = Math.min(elapsed, 100) / 1000;
      lastFrameTime = now - (elapsed % targetFpsInterval);
      accumulatedTime += delta;

      // Pass time to shader
      galaxyMaterial.uniforms.uTime.value = accumulatedTime;

      // Smooth mouse interpolation
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Slow majestic galaxy orbit
      galaxyPoints.rotation.y = accumulatedTime * 0.045;
      coreNebula.rotation.y = accumulatedTime * 0.055;
      stars.rotation.y = accumulatedTime * 0.005;

      // Scroll-depth camera interpolation
      const sy = scrollRef.current;
      const targetZ = 9 - sy * 5.5;
      const targetY = 5 - sy * 3.8;

      camX += (mouseX * 1.8 - camX) * 0.045;
      camY += (targetY - mouseY * 1.2 - camY) * 0.045;
      camZ += (targetZ - camZ) * 0.045;

      camera.position.set(camX, camY, camZ);
      camera.lookAt(0, 0, 0);

      // Angle tilt with scroll for dramatic parallax perspective
      galaxyPoints.rotation.z = sy * 0.55;
      coreNebula.rotation.z = sy * 0.55;

      renderer.render(scene, camera);
    };

    tick();

    // Comprehensive Resource Disposal to prevent memory leaks
    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);

      // Traverse scene and dispose meshes
      scene.remove(galaxyPoints);
      scene.remove(coreNebula);
      scene.remove(stars);

      galaxyGeometry.dispose();
      coreNebulaGeo.dispose();
      starGeo.dispose();
      galaxyMaterial.dispose();

      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="c"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};
