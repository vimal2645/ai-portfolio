import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './Divider.module.css';

gsap.registerPlugin(ScrollTrigger);

export function Divider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const leftLineRef = useRef<HTMLDivElement>(null);
  const rightLineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current || !logoRef.current || !leftLineRef.current || !rightLineRef.current) return;

    const ctx = gsap.context(() => {
      // Lines draw from the logo outward
      gsap.fromTo([leftLineRef.current, rightLineRef.current],
        { scaleX: 0 },
        { 
          scaleX: 1, 
          duration: 1, 
          ease: 'power2.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Logo rotates and scales scrubbed with scroll
      gsap.fromTo(logoRef.current,
        { rotation: 0 },
        {
          rotation: 360,
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        }
      );

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
      tl.to(logoRef.current, { scale: 1.1, duration: 0.5 })
        .to(logoRef.current, { scale: 0.85, duration: 0.5 });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className={styles.dividerContainer} ref={containerRef}>
      <div className={styles.lineLeft} ref={leftLineRef}></div>
      <img src="/logo.png" alt="Divider Logo" className={styles.logo} ref={logoRef} />
      <div className={styles.lineRight} ref={rightLineRef}></div>
    </div>
  );
}
