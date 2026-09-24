import { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticlePortraitProps {
  imageUrl: string;
  secondaryImageUrl?: string;
}

const vertexShader = `
uniform float uTime;
uniform float uScroll;
uniform float uSize;
uniform float uCanvasX;
uniform float uClickScatter;
uniform float uImageBlend;
uniform float uCycleScatter;
uniform vec2 uResolution;
uniform float uViewportWidth;
uniform float uIsMobile;

attribute vec3 originalPosition;
attribute vec3 logoPosition;
attribute vec3 logoColor;
attribute vec3 globePosition;
attribute vec3 torusPosition;
attribute vec3 helixPosition; // reused for orbit
attribute vec3 cubePosition;
attribute vec3 shapeColor;
attribute vec2 displacement;

varying vec3 vColor;
varying float vOpacity;

// Helper: easeInOutExpo
float easeInOutExpo(float x) {
  if (x == 0.0) return 0.0;
  if (x == 1.0) return 1.0;
  if (x < 0.5) return pow(2.0, 20.0 * x - 10.0) / 2.0;
  return (2.0 - pow(2.0, -20.0 * x + 10.0)) / 2.0;
}

void main() {
  float isHero = step(uScroll, 0.15); // 1.0 when near top
  
  // The layout already restricts the canvas to the correct side, so no anchor shift is needed.
  float currentAnchorX = 0.0;
  
  // Scatter displacement based on scroll position AND initial load time
  // Initial load scatter: scatters heavily, then settles over 4.5 seconds
  float loadScatter = smoothstep(4.5, 0.0, uTime);
  
  // The further we scroll, the more the particles scatter across the screen
  float scrollScatter = smoothstep(0.05, 0.3, uScroll); 
  
  float scatterAmount = max(scrollScatter, loadScatter) + uCycleScatter;
  
  vec3 basePos = mix(originalPosition, logoPosition, uImageBlend);
  
  float scatterNoise = fract(sin(dot(basePos.xy, vec2(12.9898,78.233))) * 43758.5453) * 2.0 - 1.0;
  float scatterNoiseY = fract(sin(dot(basePos.xy, vec2(93.989,67.345))) * 43758.5453) * 2.0 - 1.0;
  float scatterNoiseZ = fract(sin(dot(basePos.xy, vec2(43.141,12.421))) * 43758.5453) * 2.0 - 1.0;
  
  vec3 scatterDir = normalize(vec3(scatterNoise, scatterNoiseY, scatterNoiseZ));
  
  // Spread widely to cover full page
  float maxRadius = 18.0; 
  vec3 scatterOffset = scatterDir * scatterAmount * maxRadius;
  
  // Add some continuous slow drifting
  scatterOffset.x += sin(uTime * 0.5 + basePos.y) * scatterAmount * 2.0;
  scatterOffset.y += cos(uTime * 0.4 + basePos.x) * scatterAmount * 2.0;
  
  vec3 finalPos = basePos + scatterOffset;
  finalPos.x += currentAnchorX;
  
  vColor = mix(color, logoColor, uImageBlend);
  
  // Opacity: Hero (settled): full opacity. 
  // Scrolled (scattered): keep it relatively visible in background (no ghosting)
  float targetOpacity = mix(0.5, 1.0, isHero);
  vOpacity = targetOpacity;
  if (uIsMobile > 0.5) vOpacity = mix(0.4, 1.0, isHero);
  
  // Click scatter
  finalPos += normalize(originalPosition) * uClickScatter * scatterNoise * 2.0;
  
  vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
  vec4 projected = projectionMatrix * mvPosition;
  
  projected.x += (displacement.x / uResolution.x) * 2.0 * projected.w;
  projected.y += (displacement.y / uResolution.y) * 2.0 * projected.w;
  
  gl_Position = projected;
  float baseSize = uSize * (10.0 / -mvPosition.z);
  gl_PointSize = clamp(baseSize, 0.0, 6.0);
}
`;

const fragmentShader = `
uniform sampler2D uTexture;
varying vec3 vColor;
varying float vOpacity;

void main() {
  vec4 texColor = texture2D(uTexture, gl_PointCoord);
  if (texColor.a < 0.1) discard;
  
  gl_FragColor = vec4(vColor, texColor.a * vOpacity);
}
`;

const TAU = Math.PI * 2;
function genOrbit(N: number, R: number, rand: () => number): Float32Array {
  const P = new Float32Array(N * 3);
  const rings = [
    { tx: 0, tz: 0, r: 1.0 },
    { tx: Math.PI / 3, tz: 0, r: 0.88 },
    { tx: -Math.PI / 3, tz: 0.6, r: 0.76 },
  ];
  for (let i = 0; i < N; i++) {
    let x = 0, y = 0, z = 0;
    if (i % 10 < 2) {                       // 20% glowing core
      const th = rand() * TAU, ph = Math.acos(2 * rand() - 1), r = R * 0.2 * Math.cbrt(rand());
      x = r * Math.sin(ph) * Math.cos(th); y = r * Math.cos(ph); z = r * Math.sin(ph) * Math.sin(th);
    } else {                                // 3 tilted rings
      const ring = rings[i % 3], a = rand() * TAU, rr = R * ring.r;
      const px = Math.cos(a) * rr + (rand() - 0.5) * R * 0.02;
      const py = (rand() - 0.5) * R * 0.03;
      const pz = Math.sin(a) * rr;
      const y1 = py * Math.cos(ring.tx) - pz * Math.sin(ring.tx);
      const z1 = py * Math.sin(ring.tx) + pz * Math.cos(ring.tx);
      x = px * Math.cos(ring.tz) - y1 * Math.sin(ring.tz);
      y = px * Math.sin(ring.tz) + y1 * Math.cos(ring.tz);
      z = z1;
    }
    P[i * 3] = x; P[i * 3 + 1] = y; P[i * 3 + 2] = z;
  }
  return P;
}

export function ParticlePortrait({ imageUrl, secondaryImageUrl }: ParticlePortraitProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { camera } = useThree();
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  const displacementsRef = useRef<Float32Array | null>(null);
  const velocitiesRef = useRef<Float32Array | null>(null);
  const pushStrength = useRef(0);
  const inCanvas = useRef(false);
  const isOverText = useRef(false);
  
  const [themeKey, setThemeKey] = useState(0);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setThemeKey(prev => prev + 1);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      inCanvas.current = true;
      const el = e.target as HTMLElement;
      if (el) {
        isOverText.current = !!el.closest('nav, button, a, h1, h2, h3, p, span, .hover-tilt, .experienceCard, .skillCard, .ctaPanel, .projectCard, .bentoCard, .stickyCard, .profileCard');
      }
    };
    const handleMouseLeave = () => {
      inCanvas.current = false;
    };
    window.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const circleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.arc(32, 32, 30, 0, 2 * Math.PI);
      ctx.fillStyle = 'white';
      ctx.fill();
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uCanvasX: { value: 0 },
    uSize: { value: 4.0 },
    uClickScatter: { value: 0 },
    uImageBlend: { value: 0 },
    uCycleScatter: { value: 0 },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    uViewportWidth: { value: 0 },
    uIsMobile: { value: 0 },
    uTexture: { value: circleTexture }
  }), [circleTexture]);

  useEffect(() => {
    const handleResize = () => {
      if (materialRef.current) {
        materialRef.current.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let active = true;
    const loadImg = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

    Promise.all([
      loadImg(imageUrl),
      loadImg(secondaryImageUrl || imageUrl)
    ]).then(([img1, img2]) => {
      if (!active) return;

      let maxParticles = 22000;
      if (window.innerWidth <= 1024) maxParticles = 14000;
      if (window.innerWidth <= 768) maxParticles = 9000;

      const extractPoints = (img: HTMLImageElement, isLogo: boolean) => {
        let targetWidth = window.innerWidth <= 768 ? 100 : (window.innerWidth <= 1024 ? 140 : 180);
        if (isLogo) targetWidth = 300;
        const targetHeight = Math.floor((targetWidth / img.width) * img.height);
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return { positions: [], colors: [] };

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
        const positions = [];
        const colors = [];
        const scaleFactor = isLogo ? 6.5 : 9.0;
        const centerX = targetWidth / 2;
        const centerY = targetHeight / 2;
        const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

        for (let y = 0; y < targetHeight; y++) {
          for (let x = 0; x < targetWidth; x++) {
            const distToCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
            const edgeFade = 1.0 - (distToCenter / maxDist);
            const isFace = y < targetHeight * 0.6;
            const density = isLogo ? 1.0 : (isFace ? (0.6 + edgeFade * 0.4) : (0.15 + edgeFade * 0.2));

            if (Math.random() > density) continue;

            const i = (y * targetWidth + x) * 4;
            let r = imgData.data[i] / 255;
            let g = imgData.data[i + 1] / 255;
            let b = imgData.data[i + 2] / 255;
            const a = imgData.data[i + 3] / 255;
            const isWhiteBackground = (r > 0.85 && g > 0.85 && b > 0.85);
            const isBlackBackground = (r < 0.1 && g < 0.1 && b < 0.1);

            if (a > 0.1 && !isWhiteBackground && (!isLogo || !isBlackBackground)) {
              r = Math.pow(r, 0.8);
              g = Math.pow(g, 0.8);
              b = Math.pow(b, 0.8);
              const px = (x / targetWidth - 0.5) * scaleFactor;
              const py = -(y / targetHeight - 0.5) * scaleFactor * (targetHeight / targetWidth);
              const pz = (Math.random() - 0.5) * 0.2;
              positions.push(px, py, pz);
              colors.push(r, g, b);
            }
          }
        }
        return { positions, colors };
      };

      const p1 = extractPoints(img1, false);
      const p2 = extractPoints(img2, true);

      const padPoints = (sourcePts: number[], sourceCols: number[], targetCount: number) => {
        const finalPts = [];
        const finalCols = [];
        const sourceCount = sourcePts.length / 3;
        if (sourceCount === 0) return { positions: new Array(targetCount * 3).fill(0), colors: new Array(targetCount * 3).fill(1) };
        for (let i = 0; i < targetCount; i++) {
          const srcIdx = Math.floor((i * sourceCount) / targetCount) * 3;
          const rx = (Math.random() - 0.5) * 0.05;
          const ry = (Math.random() - 0.5) * 0.05;
          const rz = (Math.random() - 0.5) * 0.05;
          finalPts.push(sourcePts[srcIdx] + rx, sourcePts[srcIdx+1] + ry, sourcePts[srcIdx+2] + rz);
          finalCols.push(sourceCols[srcIdx], sourceCols[srcIdx+1], sourceCols[srcIdx+2]);
        }
        return { positions: finalPts, colors: finalCols };
      };

      const targetParticleCount = Math.min(maxParticles, Math.max(Math.floor(p1.positions.length / 3), Math.floor(p2.positions.length / 3)));
      const finalP1 = padPoints(p1.positions, p1.colors, targetParticleCount);
      const finalP2 = padPoints(p2.positions, p2.colors, targetParticleCount);

      const numParticles = targetParticleCount;
      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.Float32BufferAttribute(finalP1.positions, 3));
      geom.setAttribute('color', new THREE.Float32BufferAttribute(finalP1.colors, 3));
      geom.setAttribute('originalPosition', new THREE.Float32BufferAttribute(finalP1.positions, 3));
      geom.setAttribute('logoPosition', new THREE.Float32BufferAttribute(finalP2.positions, 3));
      geom.setAttribute('logoColor', new THREE.Float32BufferAttribute(finalP2.colors, 3));

      const finalColors = finalP1.colors;

      displacementsRef.current = new Float32Array(numParticles * 2);
      velocitiesRef.current = new Float32Array(numParticles * 2);
      geom.setAttribute('displacement', new THREE.BufferAttribute(displacementsRef.current, 2));

      const globePos = new Float32Array(numParticles * 3);
      const torusPos = new Float32Array(numParticles * 3);
      const cubePos = new Float32Array(numParticles * 3);
      const shapeColors = new Float32Array(numParticles * 3);

      const origPos = geom.attributes.originalPosition.array as Float32Array;

      geom.computeBoundingBox();
      if (geom.boundingBox) {
        const center = new THREE.Vector3();
        geom.boundingBox.getCenter(center);
        for (let i = 0; i < origPos.length; i += 3) {
          origPos[i] -= center.x; origPos[i + 1] -= center.y; origPos[i + 2] -= center.z;
        }
      }

      const rootStyles = getComputedStyle(document.documentElement);
      const accentVar = rootStyles.getPropertyValue('--accent').trim() || '#8b5cf6';
      const accentColor = new THREE.Color(accentVar);

      const vhUnitsBase = 2 * Math.tan((75 / 2) * (Math.PI / 180)) * 5;
      const vwUnitsBase = vhUnitsBase * (window.innerWidth / window.innerHeight);
      // Scale down to fit inside grid column properly
      const maxShapeRadiusBase = Math.min(0.15 * vwUnitsBase, 0.25 * vhUnitsBase);
      const R_shape = maxShapeRadiusBase;

      const orbitPos = genOrbit(numParticles, R_shape, Math.random);

      for (let i = 0; i < numParticles; i++) {
        const idx = i * 3;
        const t = i / numParticles;

        const phi = Math.acos(1 - 2 * (i + 0.5) / numParticles);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        globePos[idx] = R_shape * Math.sin(phi) * Math.cos(theta);
        globePos[idx + 1] = R_shape * Math.sin(phi) * Math.sin(theta);
        globePos[idx + 2] = R_shape * Math.cos(phi);

        const p = 2;
        const q = 3;
        const torusT = t * Math.PI * 2 * 10;
        const rT = (R_shape * 0.6) + (R_shape * 0.25) * Math.cos(q * torusT);
        torusPos[idx] = rT * Math.cos(p * torusT);
        torusPos[idx + 1] = rT * Math.sin(p * torusT);
        torusPos[idx + 2] = (R_shape * 0.25) * Math.sin(q * torusT);

        const side = Math.ceil(Math.pow(numParticles, 1 / 3));
        const cx = i % side;
        const cy = Math.floor(i / side) % side;
        const cz = Math.floor(i / (side * side));
        const spacing = (R_shape * 1.5) / side;
        const offset = (side * spacing) / 2;
        cubePos[idx] = cx * spacing - offset;
        cubePos[idx + 1] = cy * spacing - offset;
        cubePos[idx + 2] = cz * spacing - offset;

        const origIntensity = (finalColors[idx] + finalColors[idx + 1] + finalColors[idx + 2]) / 3;
        shapeColors[idx] = accentColor.r * (0.5 + origIntensity * 0.8);
        shapeColors[idx + 1] = accentColor.g * (0.5 + origIntensity * 0.8);
        shapeColors[idx + 2] = accentColor.b * (0.5 + origIntensity * 0.8);
      }

      geom.setAttribute('globePosition', new THREE.Float32BufferAttribute(globePos, 3));
      geom.setAttribute('torusPosition', new THREE.Float32BufferAttribute(torusPos, 3));
      geom.setAttribute('helixPosition', new THREE.Float32BufferAttribute(orbitPos, 3));
      geom.setAttribute('cubePosition', new THREE.Float32BufferAttribute(cubePos, 3));
      geom.setAttribute('shapeColor', new THREE.Float32BufferAttribute(shapeColors, 3));

            setGeometry(geom);
    });
    return () => { active = false; };
  }, [imageUrl, secondaryImageUrl, themeKey]);

  const smoothProgress = useRef(0);
  const targetScatter = useRef(0);
  const isTabVisible = useRef(true);

  useEffect(() => {
    const handleVisibility = () => { isTabVisible.current = !document.hidden; };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  useFrame(({ clock, pointer }, delta) => {
    if (!pointsRef.current || !geometry || !isTabVisible.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Read the morph progress set by useScrollAnimation
    let rawProgress = (window as any).__morphProgress || 0;
    // Map the 0-5 section transition range to 0-1 for the shader which multiplies by 5 again.
    rawProgress = rawProgress / 5.0;

    smoothProgress.current = THREE.MathUtils.lerp(smoothProgress.current, rawProgress, 0.05);

    const targetRotY = prefersReducedMotion ? 0 : (smoothProgress.current * Math.PI * 2);
    const parallaxX = prefersReducedMotion ? 0 : (pointer.y * 0.2);
    const parallaxY = prefersReducedMotion ? 0 : (pointer.x * 0.2);

    pointsRef.current.rotation.set(
      THREE.MathUtils.lerp(pointsRef.current.rotation.x, parallaxX, 0.1),
      THREE.MathUtils.lerp(pointsRef.current.rotation.y, targetRotY + parallaxY, 0.1),
      0
    );

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.elapsedTime;
      materialRef.current.uniforms.uScroll.value = prefersReducedMotion ? 0 : smoothProgress.current;

      const isMobile = window.innerWidth <= 900;

      // Update camera projection values
      const vhUnits = 2 * Math.tan((75 / 2) * (Math.PI / 180)) * 5;
      const vwUnits = vhUnits * (window.innerWidth / window.innerHeight);

      materialRef.current.uniforms.uViewportWidth.value = vwUnits;
      materialRef.current.uniforms.uIsMobile.value = isMobile ? 1.0 : 0.0;

      targetScatter.current = THREE.MathUtils.lerp(targetScatter.current, 0, 0.03);
      materialRef.current.uniforms.uClickScatter.value = targetScatter.current;

      const cycleTime = clock.elapsedTime % 12.0;
      let imageBlend = 0.0;
      let cycleScatter = 0.0;
      
      if (cycleTime < 4.0) {
        imageBlend = 0.0;
        cycleScatter = 0.0;
      } else if (cycleTime < 5.0) {
        imageBlend = 0.0;
        cycleScatter = (cycleTime - 4.0) * 3.0;
      } else if (cycleTime < 6.0) {
        imageBlend = 1.0;
        cycleScatter = 3.0 - ((cycleTime - 5.0) * 3.0);
      } else if (cycleTime < 10.0) {
        imageBlend = 1.0;
        cycleScatter = 0.0;
      } else if (cycleTime < 11.0) {
        imageBlend = 1.0;
        cycleScatter = (cycleTime - 10.0) * 3.0;
      } else {
        imageBlend = 0.0;
        cycleScatter = 3.0 - ((cycleTime - 11.0) * 3.0);
      }
      
      materialRef.current.uniforms.uImageBlend.value = imageBlend;
      materialRef.current.uniforms.uCycleScatter.value = cycleScatter;
    }

    // CPU Physics Loop for 2D Ripple Push
    const disp = displacementsRef.current;
    const vel = velocitiesRef.current;
    if (disp && vel && !prefersReducedMotion) {
      const origPos = geometry.attributes.originalPosition.array as Float32Array;
      const globePos = geometry.attributes.globePosition.array as Float32Array;
      const torusPos = geometry.attributes.torusPosition.array as Float32Array;
      const orbitPos = geometry.attributes.helixPosition.array as Float32Array;
      const cubePos = geometry.attributes.cubePosition.array as Float32Array;

      const segment = smoothProgress.current * 5.0;
      const currentSegment = Math.floor(segment);
      const localT = segment - currentSegment;

      const matrix = new THREE.Matrix4();
      matrix.makeRotationFromEuler(pointsRef.current.rotation);
      matrix.setPosition(materialRef.current?.uniforms.uCanvasX.value || 0, 0, 0);
      const viewProj = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      const fullMatrix = new THREE.Matrix4().multiplyMatrices(viewProj, matrix);

      const e = fullMatrix.elements;
      const hw = window.innerWidth / 2;
      const hh = window.innerHeight / 2;
      const mouseX = pointer.x * hw;
      const mouseY = pointer.y * hh;

      const isMorphing = localT > 0.05 && localT < 0.95;
      const targetPush = (clock.elapsedTime > 1.5 && inCanvas.current && !isOverText.current && !isMorphing) ? 1.0 : 0.0;
      const fadeRate = delta / 0.2;
      if (pushStrength.current < targetPush) pushStrength.current = Math.min(targetPush, pushStrength.current + fadeRate);
      if (pushStrength.current > targetPush) pushStrength.current = Math.max(targetPush, pushStrength.current - fadeRate);

      const R = Math.min(70, Math.max(40, Math.min(window.innerWidth, window.innerHeight) * 0.08)); // max 70px
      const R_sq = R * R;
      const pushForce = 900 * pushStrength.current;
      const stiffness = 29;
      const damping = Math.exp(-6.4 * delta);
      const maxDisp = 40; // Max displacement 40px
      const maxDispSq = maxDisp * maxDisp;

      const N = origPos.length / 3;

      let startArr = origPos, endArr = globePos;
      if (currentSegment < 1.0) { startArr = origPos; endArr = globePos; }
      else if (currentSegment < 2.0) { startArr = globePos; endArr = torusPos; }
      else if (currentSegment < 3.0) { startArr = torusPos; endArr = orbitPos; }
      else if (currentSegment < 4.0) { startArr = orbitPos; endArr = cubePos; }
      else { startArr = cubePos; endArr = origPos; }

      const time = clock.elapsedTime;

      for (let i = 0; i < N; i++) {
        const idx3 = i * 3;
        const idx2 = i * 2;

        const origY = origPos[idx3 + 1];
        const normalizedY = (origY + 4.5) / 9.0;
        const morphStart = 0.35 - (normalizedY * 0.1);

        let morphProgress = 0;
        if (localT > morphStart) {
          if (localT >= morphStart + 0.5) morphProgress = 1;
          else {
            const t = (localT - morphStart) / 0.5;
            morphProgress = t * t * (3 - 2 * t);
          }
        }

        let tx = startArr[idx3] + (endArr[idx3] - startArr[idx3]) * morphProgress;
        let ty = startArr[idx3 + 1] + (endArr[idx3 + 1] - startArr[idx3 + 1]) * morphProgress;
        let tz = startArr[idx3 + 2] + (endArr[idx3 + 2] - startArr[idx3 + 2]) * morphProgress;

        const swirl = Math.sin(morphProgress * 3.14159) * 2.0;
        tx += Math.sin(origY * 2.0 + time) * swirl;
        tz += Math.cos(origPos[idx3] * 2.0 + time) * swirl;

        const w = tx * e[3] + ty * e[7] + tz * e[11] + e[15];
        const px = (tx * e[0] + ty * e[4] + tz * e[8] + e[12]) / w;
        const py = (tx * e[1] + ty * e[5] + tz * e[9] + e[13]) / w;

        const screenX = px * hw;
        const screenY = py * hh;

        const dx = screenX - mouseX;
        const dy = screenY - mouseY;
        const distSq = dx * dx + dy * dy;

        let fx = 0, fy = 0;
        if (distSq < R_sq && distSq > 0 && pushForce > 0) {
          const dist = Math.sqrt(distSq);
          const f = Math.pow(1.0 - dist / R, 2.0) * pushForce;
          fx = (dx / dist) * f;
          fy = (dy / dist) * f;
        }

        vel[idx2] += fx * delta;
        vel[idx2 + 1] += fy * delta;

        vel[idx2] -= disp[idx2] * stiffness * delta;
        vel[idx2 + 1] -= disp[idx2 + 1] * stiffness * delta;

        vel[idx2] *= damping;
        vel[idx2 + 1] *= damping;

        disp[idx2] += vel[idx2] * delta;
        disp[idx2 + 1] += vel[idx2 + 1] * delta;

        const dLenSq = disp[idx2] * disp[idx2] + disp[idx2 + 1] * disp[idx2 + 1];
        if (dLenSq > maxDispSq) {
          const dLen = Math.sqrt(dLenSq);
          disp[idx2] = (disp[idx2] / dLen) * maxDisp;
          disp[idx2 + 1] = (disp[idx2 + 1] / dLen) * maxDisp;
        }
      }
      geometry.attributes.displacement.needsUpdate = true;
    }
  });

  const handleClick = () => {
    targetScatter.current = 1.0;
  };

  if (!geometry) return null;

  return (
    <points ref={pointsRef} geometry={geometry} onClick={handleClick}>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent={true}
        depthWrite={false}
        vertexColors={true}
      />
    </points>
  );
}
