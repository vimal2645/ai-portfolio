import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import styles from './ScrollyArtifact.module.css';

function Icosahedron() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Read the scroll progress (0 to 5) set by useScrollAnimation
    const scrollProgress = (window as any).__morphProgress || 0;
    
    // Rotate based on scroll progress and elapsed time for continuous motion
    meshRef.current.rotation.y = scrollProgress * Math.PI + state.clock.elapsedTime * 0.1;
    meshRef.current.rotation.x = scrollProgress * (Math.PI * 0.5) + state.clock.elapsedTime * 0.05;
    
    // Pulse the emissive intensity rhythmically
    if (materialRef.current) {
      materialRef.current.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 1.5) * 0.5;
    }
    
    // Subtle float effect
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.15;
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[2, 0]} />
      <meshStandardMaterial 
        ref={materialRef}
        color="var(--accent)" 
        wireframe={true} 
        emissive="var(--accent-magenta)"
        emissiveIntensity={1}
        transparent={true}
        opacity={0.8}
      />
    </mesh>
  );
}

export function ScrollyArtifact() {
  return (
    <div className={styles.artifactContainer}>
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
        <Icosahedron />
      </Canvas>
    </div>
  );
}
