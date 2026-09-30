import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { LogoMark } from './LogoMark';
import { profile } from '../config/profile';
import './Hero.css';

export function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const hero = containerRef.current;
    const cv = canvasRef.current;
    const meEl = hero?.querySelector('.me') as HTMLElement;
    if (!hero || !cv) return;

    let r: THREE.WebGLRenderer;
    try {
      r = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true });
    } catch (e) {
      return;
    }

    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    const sc = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    cam.position.z = 10;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
    sc.add(ambientLight);

    const l1 = new THREE.PointLight(0x4f7bff, 2.4, 40);
    l1.position.set(-6, 4, 6);
    sc.add(l1);

    const l2 = new THREE.PointLight(0xff5fa8, 2.4, 40);
    l2.position.set(6, -3, 6);
    sc.add(l2);

    function orb(col: number, em: number, sx: number, rad: number) {
      const geom = new THREE.SphereGeometry(rad, 48, 48);
      const mat = new THREE.MeshPhysicalMaterial({
        color: col, emissive: em, emissiveIntensity: 0.35, roughness: 0.25, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.15
      });
      const m = new THREE.Mesh(geom, mat);
      m.userData.sx = sx;
      sc.add(m);
      return m;
    }

    const pill = orb(0x2f5bff, 0x1a3cff, 2.2, 0.3);
    const pink = orb(0xff6fa0, 0xff5a3d, 1, 0.5);
    const blue = orb(0x5b8cff, 0x2f5bff, 1, 0.2);

    const icoGeom = new THREE.IcosahedronGeometry(0.5, 1);
    const icoMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.35 });
    const ico = new THREE.Mesh(icoGeom, icoMat);
    sc.add(ico);

    const ring = new THREE.Group();
    const r1Geom = new THREE.TorusGeometry(2.6, 0.012, 8, 220);
    const r1Mat = new THREE.MeshBasicMaterial({ color: 0x4f7bff, transparent: true, opacity: 0.75 });
    const r1 = new THREE.Mesh(r1Geom, r1Mat);

    const r2Geom = new THREE.TorusGeometry(3.15, 0.008, 8, 220);
    const r2Mat = new THREE.MeshBasicMaterial({ color: 0xff5fa8, transparent: true, opacity: 0.55 });
    const r2 = new THREE.Mesh(r2Geom, r2Mat);

    r1.rotation.x = 1.15;
    r2.rotation.x = 1.15;
    r2.rotation.y = 0.5;
    ring.add(r1, r2);
    sc.add(ring);

    const dots: THREE.Mesh[] = [];
    const dotGeoms: THREE.SphereGeometry[] = [];
    const dotMats: THREE.MeshBasicMaterial[] = [];
    [0x7fb2ff, 0xff9a4d, 0xffffff].forEach(function (c, i) {
      const dGeom = new THREE.SphereGeometry(0.07, 16, 16);
      const dMat = new THREE.MeshBasicMaterial({ color: c });
      const d = new THREE.Mesh(dGeom, dMat);
      d.userData.a = i * 2.1;
      r1.add(d);
      dots.push(d);
      dotGeoms.push(dGeom);
      dotMats.push(dMat);
    });

    const N = window.innerWidth < 700 ? 350 : 900;
    const g = new THREE.BufferGeometry();
    const P = new Float32Array(N * 3);
    const C = new Float32Array(N * 3);
    const cb = new THREE.Color(0x4f7bff);
    const cp = new THREE.Color(0xff5fa8);
    for (let i = 0; i < N; i++) {
      P[i * 3] = (Math.random() - 0.5) * 26;
      P[i * 3 + 1] = (Math.random() - 0.5) * 16;
      P[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
      const c = Math.random() < 0.72 ? cb : cp;
      C[i * 3] = c.r;
      C[i * 3 + 1] = c.g;
      C[i * 3 + 2] = c.b;
    }
    g.setAttribute('position', new THREE.BufferAttribute(P, 3));
    g.setAttribute('color', new THREE.BufferAttribute(C, 3));
    const ptsMat = new THREE.PointsMaterial({ size: 0.055, vertexColors: true, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending });
    const pts = new THREE.Points(g, ptsMat);
    sc.add(pts);

    let vw: number, vh: number, s = 1;
    let base: any = {};

    function pos(x: number, y: number, z?: number) {
      return new THREE.Vector3((x - 0.5) * vw, (0.5 - y) * vh, z || 0);
    }

    function size() {
      const W = hero!.clientWidth;
      const H = hero!.clientHeight;
      r.setSize(W, H, false);
      cam.aspect = W / H;
      cam.updateProjectionMatrix();

      vh = 2 * 10 * Math.tan(20 * Math.PI / 180);
      vw = vh * cam.aspect;
      s = Math.min(1, W / 1000 + 0.4);

      const m = W < 640;
      base.pill = pos(m ? 0.8 : 0.83, 0.14);
      base.pink = pos(m ? 0.9 : 0.9, m ? 0.55 : 0.6, 0.5);
      base.blue = pos(m ? 0.1 : 0.09, 0.9, 0.5);
      base.ico = pos(m ? 0.12 : 0.2, 0.4, -1);

      ring.position.copy(pos(m ? 0.56 : 0.49, 0.42, -1));
      ring.scale.setScalar(s * (m ? 0.7 : 1));

      [pill, pink, blue].forEach(function (o) {
        o.scale.set(o.userData.sx * s, s, s);
      });
      ico.scale.setScalar(s);
    }
    size();
    window.addEventListener('resize', size);

    let mx = 0, my = 0, tx = 0, ty = 0;
    function onPointerMove(e: PointerEvent) {
      const b = hero!.getBoundingClientRect();
      tx = (e.clientX - b.left) / b.width * 2 - 1;
      ty = (e.clientY - b.top) / b.height * 2 - 1;
    }
    hero.addEventListener('pointermove', onPointerMove as EventListener);

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rafId: number;

    function frame(t: number) {
      t *= 0.001;
      mx += (tx - mx) * 0.06;
      my += (ty - my) * 0.06;

      cam.position.x = mx * 0.6;
      cam.position.y = -my * 0.35;
      cam.lookAt(0, 0, 0);

      pill.position.copy(base.pill);
      pill.position.y += Math.sin(t * 1.2) * 0.12;
      pill.rotation.z = -0.14 + Math.sin(t) * 0.05;

      pink.position.copy(base.pink);
      pink.position.y += Math.sin(t * 1.0 + 1) * 0.15;

      blue.position.copy(base.blue);
      blue.position.y += Math.sin(t * 1.4 + 2) * 0.1;

      ico.position.copy(base.ico);
      ico.position.y += Math.sin(t * 0.9) * 0.12;
      ico.rotation.x = t * 0.4;
      ico.rotation.y = t * 0.55;

      r1.rotation.z = t * 0.25;
      r2.rotation.z = -t * 0.18;

      dots.forEach(function (d) {
        const a = d.userData.a + t * 0.7;
        d.position.set(Math.cos(a) * 2.6, Math.sin(a) * 2.6, 0);
      });

      pts.rotation.y = t * 0.02 + mx * 0.05;
      pts.position.y = Math.sin(t * 0.3) * 0.15;

      if (meEl) {
        meEl.style.transform = `translateX(calc(-46% + ${(mx * 14).toFixed(1)}px)) translateY(${(my * 6).toFixed(1)}px)`;
      }

      r.render(sc, cam);
      if (!still) rafId = requestAnimationFrame(frame);
    }

    if (!still) {
      rafId = requestAnimationFrame(frame);
    } else {
      requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', size);
      hero.removeEventListener('pointermove', onPointerMove as EventListener);

      pill.geometry.dispose(); (pill.material as THREE.Material).dispose();
      pink.geometry.dispose(); (pink.material as THREE.Material).dispose();
      blue.geometry.dispose(); (blue.material as THREE.Material).dispose();
      icoGeom.dispose(); icoMat.dispose();
      r1Geom.dispose(); r1Mat.dispose();
      r2Geom.dispose(); r2Mat.dispose();
      dotGeoms.forEach(dg => dg.dispose());
      dotMats.forEach(dm => dm.dispose());
      g.dispose(); ptsMat.dispose();
      r.dispose();
    };
  }, []);

  return (
    <main className="hero" ref={containerRef}>
      <nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <LogoMark size={28} />
          <span>Vimal Prakash</span>
          <a href={profile.socialLinks.instagram} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', opacity: 0.9, textDecoration: 'none', background: 'rgba(255, 255, 255, 0.05)', padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            Connect
          </a>
        </div>
        <ul>
          <li><a className="on" href="#about">ABOUT</a></li>
          <li><a href="#projects">PROJECTS</a></li>
          <li><a href="#skills">SKILLS</a></li>
        </ul>
      </nav>
      <canvas id="gl" aria-hidden="true" ref={canvasRef}></canvas>
      <h1 className="split-title">
        <span className="left">VIMAL</span>
        <span className="right">PRAKASH</span>
      </h1>
      <img className="me" alt="Animated portrait of Vimal Prakash with headphones" src="/avatar_transparent.png" />
      <p className="tag tag-left">Data &amp; AI builder passionate about crafting bold and memorable projects</p>
      <p className="tag tag-right">Building multiple SaaS applications until one gets success</p>
    </main>
  );
}
