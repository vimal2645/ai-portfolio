import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture, OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform sampler2D uTexture;
uniform float uHoverState;
uniform float uTime;
varying vec2 vUv;

void main() {
  vec2 p = vUv;
  
  // Liquid distortion effect
  float x = uHoverState;
  
  // Sine wave distortion based on time and hover state
  p.x += sin(p.y * 10.0 + uTime * 2.0) * 0.03 * x;
  p.y += cos(p.x * 10.0 + uTime * 2.0) * 0.03 * x;
  
  // Chromatic aberration
  float r = texture2D(uTexture, p + vec2(0.015 * x, 0.0)).r;
  float g = texture2D(uTexture, p).g;
  float b = texture2D(uTexture, p - vec2(0.015 * x, 0.0)).b;
  
  gl_FragColor = vec4(r, g, b, 1.0);
}
`;

function LiquidPlane({ imageUrl }: { imageUrl: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const texture = useTexture(imageUrl);
  
  const [hovered, setHovered] = useState(false);
  const targetHover = useRef(0);
  
  const uniforms = useMemo(() => ({
    uTexture: { value: texture },
    uHoverState: { value: 0 },
    uTime: { value: 0 }
  }), [texture]);

  useFrame((state) => {
    targetHover.current = THREE.MathUtils.lerp(
      targetHover.current,
      hovered ? 1 : 0,
      0.1
    );
    
    if (materialRef.current) {
      materialRef.current.uniforms.uHoverState.value = targetHover.current;
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh 
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <planeGeometry args={[2, 2, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

interface LiquidImageProps {
  imageUrl: string;
  alt: string;
  className?: string;
}

export function LiquidImage({ imageUrl, alt, className }: LiquidImageProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return <img src={imageUrl} alt={alt} className={className} style={{ width: '100%', height: 'auto', display: 'block' }} />;
  }

  return (
    <div className={className} style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
      <img src={imageUrl} alt={alt} style={{ opacity: 0, width: '100%', height: 'auto', display: 'block', pointerEvents: 'none' }} />
      <Canvas style={{ position: 'absolute', inset: 0, pointerEvents: 'auto' }}>
        <OrthographicCamera makeDefault left={-1} right={1} top={1} bottom={-1} position={[0, 0, 1]} />
        <LiquidPlane imageUrl={imageUrl} />
      </Canvas>
    </div>
  );
}
