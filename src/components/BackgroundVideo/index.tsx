import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './BackgroundVideo.module.css';

gsap.registerPlugin(ScrollTrigger);

export function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!videoRef.current || !wrapperRef.current) return;

    // Fade in on mount
    gsap.fromTo(videoRef.current,
      { opacity: 0 },
      { opacity: 0.3, duration: 2, ease: "power2.inOut" }
    );

    let mm = gsap.matchMedia();
    mm.add({
      isDesktop: "(min-width: 900px)",
      isMobile: "(max-width: 899px)"
    }, (context) => {
      let { isDesktop } = context.conditions as any;
      if (isDesktop) {
        ScrollTrigger.create({
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          animation: gsap.to(videoRef.current, {
            y: 100, // Slight parallax movement
            filter: "blur(8px)", // Blurs out as you scroll down to keep text legible
            ease: "none"
          })
        });
      } else {
        // Mobile: Fully static background video (no parallax, no blur scrubbing)
        gsap.set(videoRef.current, { y: 0, filter: "blur(0px)" });
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
    <div ref={wrapperRef} className={styles.videoWrapper}>
      <video
        ref={videoRef}
        className={styles.videoElement}
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/background-video.mp4" type="video/mp4" />
      </video>
      <div className={styles.videoOverlay} />
    </div>
  );
}
