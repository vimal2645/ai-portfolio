import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { profile } from '../../config/profile';
import { Brain, Code2, Palette, Database } from 'lucide-react';
import styles from './SpiralGallery.module.css';

gsap.registerPlugin(ScrollTrigger);

export function SpiralGallery() {
  const pinWrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pinWrapper = pinWrapperRef.current;
    const track = trackRef.current;
    if (!pinWrapper || !track) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let mm = gsap.matchMedia();
    mm.add({
      isDesktop: "(min-width: 900px)",
    }, (context) => {
      let { isDesktop } = context.conditions as any;
      
      if (isDesktop && !prefersReducedMotion) {
        const scrollAmount = track.scrollWidth - window.innerWidth;
        ScrollTrigger.create({
          trigger: pinWrapper,
          pin: true,
          scrub: 1,
          start: 'top top',
          end: () => `+=${scrollAmount}`,
          invalidateOnRefresh: true,
          animation: gsap.to(track, {
            x: -scrollAmount,
            ease: 'none',
          })
        });
      }
    });

    const handleResize = () => ScrollTrigger.refresh();
    window.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('resize', handleResize);

    return () => {
      mm.revert();
      window.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className={styles.pinWrapper} ref={pinWrapperRef}>
      <div className={styles.horizontalTrack} ref={trackRef}>
        {profile.capabilities.map((cap, i) => (
          <div key={i} className={styles.projectFrame}>
            <div className={styles.capabilityCard}>
              <div className={styles.capabilityIcon}>
                {cap.icon === 'Brain' && <Brain size={32} />}
                {cap.icon === 'Code2' && <Code2 size={32} />}
                {cap.icon === 'Palette' && <Palette size={32} />}
                {cap.icon === 'Database' && <Database size={32} />}
              </div>
              <h3 className={styles.capabilityTitle}>{cap.title}</h3>
              <p className={styles.capabilityDesc}>{cap.description}</p>
              <div className={styles.chipsRow}>
                {cap.chips.map(chip => <span key={chip} className={styles.chip}>{chip}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
