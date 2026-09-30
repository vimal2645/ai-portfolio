import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Tesla-style wireframe grid floor
function WireframeGrid() {
  const gridRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!gridRef.current) return;
    // Slowly move grid forward to create "driving" illusion
    gridRef.current.position.z = (state.clock.elapsedTime * 0.8) % 5;
  });

  const lines: React.ReactNode[] = [];
  const size = 40;
  const divisions = 20;
  const step = size / divisions;
  const color = '#1a0a4a';
  const brightColor = '#6d28d9';

  // Horizontal lines
  for (let i = 0; i <= divisions; i++) {
    const z = -size / 2 + i * step;
    const isBright = i % 4 === 0;
    const points = [
      new THREE.Vector3(-size / 2, 0, z),
      new THREE.Vector3(size / 2, 0, z),
    ];
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    lines.push(
      // @ts-ignore
      <line key={`h${i}`} geometry={geo}>
        <lineBasicMaterial color={isBright ? brightColor : color} transparent opacity={isBright ? 0.6 : 0.3} />
      </line>
    );
  }

  // Vertical lines
  for (let i = 0; i <= divisions; i++) {
    const x = -size / 2 + i * step;
    const isBright = i % 4 === 0;
    const points = [
      new THREE.Vector3(x, 0, -size / 2),
      new THREE.Vector3(x, 0, size / 2),
    ];
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    lines.push(
      // @ts-ignore
      <line key={`v${i}`} geometry={geo}>
        <lineBasicMaterial color={isBright ? brightColor : color} transparent opacity={isBright ? 0.6 : 0.3} />
      </line>
    );
  }

  return (
    <group ref={gridRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]}>
      {lines}
    </group>
  );
}

// Floating orbs like Tesla ambient lights
function FloatingOrb({ position, color, speed }: { position: [number, number, number]; color: string; speed: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.5;
    meshRef.current.position.x = position[0] + Math.cos(state.clock.elapsedTime * speed * 0.7) * 0.3;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshBasicMaterial color={color} />
      <pointLight color={color} intensity={2} distance={4} decay={2} />
    </mesh>
  );
}

// Animated ring effect like Tesla scanner
function ScanRing() {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ringRef.current) return;
    const t = state.clock.elapsedTime * 0.4;
    const scale = 1 + (t % 3) * 2;
    ringRef.current.scale.setScalar(scale);
    (ringRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.4 - (t % 3) * 0.15);
  });

  return (
    <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.5, 0]}>
      <ringGeometry args={[0.8, 1.0, 64]} />
      <meshBasicMaterial color="#8b5cf6" transparent opacity={0.4} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Scene({ scrollY }: { scrollY: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    // Subtle parallax on scroll
    groupRef.current.rotation.y = scrollY * 0.0002;
    // Mouse parallax
    groupRef.current.rotation.x = state.pointer.y * 0.03;
  });

  return (
    <>
      <ambientLight intensity={0.1} color="#0d0030" />
      <pointLight position={[0, 10, 0]} intensity={1} color="#3b1f8c" />

      <group ref={groupRef}>
        <WireframeGrid />
        <ScanRing />
        <FloatingOrb position={[-5, 1, -3]} color="#8b5cf6" speed={0.6} />
        <FloatingOrb position={[5, 2, -4]} color="#ec4899" speed={0.9} />
        <FloatingOrb position={[0, 3, -6]} color="#06b6d4" speed={0.5} />
        <FloatingOrb position={[-3, 0.5, -2]} color="#8b5cf6" speed={0.7} />
        <FloatingOrb position={[4, 1.5, -2]} color="#a78bfa" speed={1.1} />
      </group>
    </>
  );
}

export function AnimatedBackground() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0,
      width: '100vw', height: '100vh',
      zIndex: -1,
      background: 'radial-gradient(ellipse at 50% 80%, #0d0030 0%, #060010 50%, #000000 100%)',
    }}>
      <Canvas camera={{ position: [0, 2, 8], fov: 60 }}>
        <React.Suspense fallback={null}>
          <Scene scrollY={scrollY} />
        </React.Suspense>
      </Canvas>
    </div>
  );
}
