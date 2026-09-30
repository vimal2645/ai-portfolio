import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { profile } from '../config/profile';
import './AboutMe.css';

gsap.registerPlugin(ScrollTrigger);

export function AboutMe() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;



    // Title simple fade and slide up (clean, no cut-offs)
    gsap.fromTo(titleRef.current,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.5,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 70%',
          toggleActions: "play none none reverse"
        }
      }
    );

    // Quick and clean word-by-word stagger fade up for intro text (no scrubs)
    const words = contentRef.current?.querySelectorAll('.about-word');
    if (words) {
      gsap.fromTo(words,
        { y: 30, opacity: 0, rotationX: -20 },
        {
          y: 0,
          opacity: 1,
          rotationX: 0,
          duration: 0.8,
          stagger: 0.03,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 60%',
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    // Timeline items fade up with stagger
    const timelineItems = timelineRef.current?.children;
    if (timelineItems) {
      gsap.fromTo(timelineItems,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.2,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: timelineRef.current,
            start: 'top 75%',
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach(t => {
        if (t.vars.trigger === section) t.kill();
      });
    };
  }, []);

  const introText = "I SPECIALIZE IN BUILDING INTELLIGENT APPLICATIONS BY COMBINING FULL-STACK ENGINEERING WITH GENERATIVE AI AND DATA ENGINEERING.";

  return (
    <section ref={sectionRef} id="about" className="about-me-section">
      {/* Animated Filler Background */}
      <div className="about-filler-1">
        <svg className="about-filler-svg" viewBox="0 0 100 100" fill="none" stroke="#2f5bff" strokeWidth="3"><circle cx="50" cy="50" r="40" /><path d="M10,50 Q50,10 90,50 T10,50" /></svg>
      </div>
      <div className="about-filler-2">
        <svg className="about-filler-svg" viewBox="0 0 100 100" fill="none" stroke="#ff5fa8" strokeWidth="3"><rect x="20" y="20" width="60" height="60" rx="10" transform="rotate(45 50 50)" /><circle cx="50" cy="50" r="10" /></svg>
      </div>
      <div className="about-filler-3">
        <svg className="about-filler-svg" viewBox="0 0 100 100" fill="none" stroke="#ff9a4d" strokeWidth="3"><polygon points="50,10 90,90 10,90" /><circle cx="50" cy="65" r="10" /></svg>
      </div>

      <div className="about-me-header">
        <h2 ref={titleRef} className="about-me-title">ABOUT ME</h2>
      </div>

      <div className="about-me-content-wrapper">
        <p ref={contentRef} className="about-me-intro">
          {introText.split(' ').map((word, i) => (
            <span key={i} className="about-word" style={{ display: 'inline-block', marginRight: '0.25em' }}>
              {word}
            </span>
          ))}
          <span className="about-word italic-text vibe-text" style={{ display: 'inline-block' }}>I also build vibe-coded apps and landing pages.</span>
        </p>

        <div ref={timelineRef} className="about-me-timeline">
          {profile.timeline.map((t, i) => (
            <div key={i} className="about-me-timeline-item">
              <div className="about-me-timeline-period">{t.period}</div>
              <div className="about-me-timeline-details">
                <div className="about-me-timeline-role">{t.role}</div>
                <div className="about-me-timeline-company">{t.company}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
