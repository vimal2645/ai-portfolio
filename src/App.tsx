import React, { useEffect, useRef, useCallback } from 'react';
import { profile } from './config/profile';
import { CustomCursor } from './components/CustomCursor';
import { AIChatbot } from './components/AIChatbot';
import { AnimatedBackground } from './components/AnimatedBackground';
import { Hero } from './components/Hero';
import { AboutMe } from './components/AboutMe';
import Lenis from '@studio-freight/lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './App3D.module.css';

gsap.registerPlugin(ScrollTrigger);

// ── 3D Tilt Card (MYHOUSE effect) ──────────────────────────────────────────
function Card3D({
  children,
  className = '',
  glowColor = '#8b5cf6',
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    const rx = ((y / height) - 0.5) * -20;
    const ry = ((x / width) - 0.5) * 20;
    el.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.03,1.03,1.03)`;
    if (glowRef.current) {
      glowRef.current.style.background = `radial-gradient(circle at ${x}px ${y}px, ${glowColor}55 0%, transparent 70%)`;
    }
  }, [glowColor]);

  const onLeave = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    if (glowRef.current) glowRef.current.style.background = 'transparent';
  }, []);

  return (
    <div
      ref={cardRef}
      className={`${styles.card3d} ${className}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div ref={glowRef} className={styles.cardGlow} />
      {children}
    </div>
  );
}



// ── Tech Chip ───────────────────────────────────────────────────────────────
function TechChip({ label }: { label: string }) {
  return <span className={styles.techChip} style={{ background: 'rgba(0,0,0,0.05)', color: '#111', border: '1px solid rgba(0,0,0,0.1)' }}>{label}</span>;
}

// ── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.4, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    const raf = (time: number) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);

    const ctx = gsap.context(() => {
      // Hero entrance — text lines slide up + skew
      gsap.fromTo('.gsap-hero-title',
        { y: 120, opacity: 0, skewY: 8 },
        { y: 0, opacity: 1, skewY: 0, duration: 1.4, ease: 'expo.out', stagger: 0.15, delay: 0.3 }
      );
      gsap.fromTo('.gsap-hero-sub',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'expo.out', delay: 0.8 }
      );
      // Hero avatar image — slide in from right
      gsap.fromTo('.gsap-hero-avatar',
        { x: 80, opacity: 0, scale: 0.9 },
        { x: 0, opacity: 1, scale: 1, duration: 1.6, ease: 'expo.out', delay: 0.4 }
      );

      // Reveal everything on scroll
      gsap.utils.toArray('.gsap-reveal').forEach((el: any) => {
        gsap.fromTo(el,
          { y: 80, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 1.1, ease: 'expo.out',
            scrollTrigger: { trigger: el, start: 'top 85%' }
          }
        );
      });

      // Project cards: MYHOUSE 3D float-in effect
      gsap.utils.toArray('.gsap-project-card').forEach((el: any, i: number) => {
        gsap.fromTo(el,
          { y: 120, opacity: 0, rotateX: 25, transformPerspective: 1000 },
          {
            y: 0, opacity: 1, rotateX: 0, duration: 1.3, ease: 'expo.out', delay: i * 0.15,
            scrollTrigger: { trigger: el, start: 'top 80%' }
          }
        );
      });

      // Parallax on project images
      gsap.utils.toArray('.gsap-parallax').forEach((img: any) => {
        gsap.fromTo(img,
          { y: -40 },
          { y: 40, ease: 'none', scrollTrigger: { trigger: img.parentElement, scrub: true } }
        );
      });

      // Horizontal scroll for projects using matchMedia
      const mm = gsap.matchMedia();
      mm.add("(min-width: 901px)", () => {
        const spacer = document.querySelector('.gsap-projects-spacer');
        const container = document.querySelector('.gsap-projects-container');
        if (spacer && container) {
          gsap.fromTo(container, 
            { x: 0 },
            { 
              x: () => -(container.scrollWidth - window.innerWidth + 100), 
              ease: 'none',
              scrollTrigger: {
                trigger: spacer,
                start: 'top top',
                end: () => `+=${(spacer as HTMLElement).offsetHeight - window.innerHeight * 2}`,
                scrub: true
              }
            }
          );
        }
      });
    }, containerRef);

    return () => { lenis.destroy(); ctx.revert(); };
  }, []);

  return (
    <div ref={containerRef} className={styles.root}>
      {/* Tesla wireframe + orb background */}
      <AnimatedBackground />
      <CustomCursor />

      {/* ── STACKED PARALLAX WRAPPER ── */}
      <div style={{ position: 'relative' }}>
        
        {/* 1. HERO */}
        <div style={{ position: 'sticky', top: 0, zIndex: 1, height: '100vh', overflow: 'hidden' }}>
          <Hero />
        </div>

        {/* 2. ABOUT ME */}
        <div className={styles.aboutWrapper}>
          <AboutMe />
        </div>

        {/* 3. PROJECTS */}
        <div className={`gsap-projects-spacer ${styles.projectsSpacer}`}>
          <div className={styles.projectsSticky}>
            
            {/* ── SKILLS MARQUEE ── */}
            <div className={styles.marqueeBar}>
              <div className={styles.marqueeTrack}>
                {[...profile.skillsMarquee, ...profile.skillsMarquee].map((s, i) => (
                  <span key={i} className={styles.marqueeItem}>
                    {s} <span className={styles.marqueeDot}>◆</span>
                  </span>
                ))}
              </div>
            </div>

            {/* ── SELECTED WORK (MYHOUSE 3D cards) ── */}
            <section id="projects" className={styles.workSection} style={{ flex: 1, padding: '0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="gsap-reveal" style={{ marginLeft: '5vw', marginBottom: '2rem' }}>
                <p className={styles.eyebrow}>Selected Work</p>
                <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>What I've Built</h2>
              </div>

              <div className={`gsap-projects-container ${styles.projectsGrid}`}>
                {profile.featuredProjects.map((project, i) => (
              <div key={project.slug} className={`gsap-project-card ${styles.projectRow}`}>

                {/* Info panel on the left */}
                <div className={styles.projectInfo}>
                  <div className={styles.projectMeta}>
                    <span className={styles.projectIndex}>0{i + 1}</span>
                    <span className={styles.projectCategory}>{project.stack[0].toUpperCase()}</span>
                  </div>
                  <h3 className={styles.projectTitle}>{project.title.toUpperCase()}</h3>
                  <p className={styles.projectProblem}>{project.problem}</p>
                  <div className={styles.projectLinks}>
                    {project.live && project.live !== '#' && (
                      <a href={project.live} target="_blank" rel="noreferrer" className={styles.btnGhost}>
                        CLICK FOR LIVE APP
                      </a>
                    )}
                  </div>
                </div>

                {/* 3D Image Card on the right */}
                <Card3D className={styles.projectCardWrap} glowColor={i % 2 === 0 ? '#8b5cf6' : '#ec4899'}>
                  <div className={styles.projectImgOnlyWrap}>
                    {project.screenshots.desktop ? (
                      <img
                        className={styles.projectImg}
                        src={project.screenshots.desktop}
                        alt={project.title}
                        loading="lazy"
                      />
                    ) : (
                      <div className={styles.projectImgPlaceholder}>
                        <span className={styles.placeholderIcon}>⚡</span>
                        <span>{project.title}</span>
                      </div>
                    )}
                  </div>
                </Card3D>
              </div>
            ))}
              </div>
            </section>
          </div>
        </div>

        {/* 4. CAPABILITIES */}
        <div className={styles.capsWrapper}>
          <div className="about-filler-1" style={{ top: '10%', right: '10%', opacity: 0.2 }}>
            <svg className="about-filler-svg" viewBox="0 0 100 100" fill="none" stroke="#8b5cf6" strokeWidth="2"><circle cx="50" cy="50" r="40" /><path d="M10,50 Q50,10 90,50 T10,50" /></svg>
          </div>
          <div className="about-filler-3" style={{ bottom: '15%', left: '5%', opacity: 0.15 }}>
            <svg className="about-filler-svg" viewBox="0 0 100 100" fill="none" stroke="#ec4899" strokeWidth="3"><polygon points="50,10 90,90 10,90" /><circle cx="50" cy="65" r="10" /></svg>
          </div>
          <section id="skills" className={styles.capsSection} style={{ padding: '0 5vw', width: '100%', position: 'relative', zIndex: 2 }}>
            <div className={styles.container}>
              <div className="gsap-reveal" style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <p className={styles.eyebrow} style={{ color: '#555' }}>What I Do</p>
                <h2 className={styles.sectionTitle} style={{ color: '#111', textShadow: '2px 2px 0px rgba(0,0,0,0.05)' }}>Capabilities</h2>
              </div>
              <div className={styles.capsGrid}>
                {profile.capabilities.map((cap, i) => (
                  <Card3D key={cap.title} className={`gsap-project-card ${styles.capCard}`} glowColor="#8b5cf6">
                    <div className={styles.capInner} style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.05)', color: '#111' }}>
                      <div className={styles.capIndex} style={{ color: '#8b5cf6' }}>0{i + 1}</div>
                      <h3 className={styles.capTitle}>{cap.title}</h3>
                      <p className={styles.capDesc} style={{ color: '#444' }}>{cap.description}</p>
                      <div className={styles.capChips}>
                        {cap.chips.map((c) => <TechChip key={c} label={c} />)}
                      </div>
                    </div>
                  </Card3D>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* 5. CONTACT */}
        <div className={styles.contactWrapper}>
          <div className="about-filler-2" style={{ top: '20%', left: '10%', opacity: 0.15 }}>
             <svg className="about-filler-svg" viewBox="0 0 100 100" fill="none" stroke="#2f5bff" strokeWidth="2"><rect x="20" y="20" width="60" height="60" rx="10" transform="rotate(45 50 50)" /><circle cx="50" cy="50" r="10" /></svg>
          </div>
          <section id="contact" className={styles.contactSection} style={{ padding: '0 5vw', background: 'transparent', width: '100%', position: 'relative', zIndex: 2 }}>
            <div className={styles.container}>
              <div className={styles.contactInner} style={{ background: '#fff', borderRadius: '24px', padding: '4rem 2rem', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 20px 40px rgba(0,0,0,0.03)' }}>
                <p className={`${styles.eyebrow} gsap-reveal`} style={{ color: '#555' }}>Let's Build Together</p>
                <h2 className={`${styles.contactTitle} gsap-reveal`} style={{ color: '#111' }}>
                  GOT AN IDEA?<br />
                  <span className={styles.heroStroke} style={{ WebkitTextStroke: '2px #8b5cf6', filter: 'none' }}>LET'S TALK.</span>
                </h2>
                <div className={`${styles.contactCards} gsap-reveal`}>
                <a href={`mailto:${profile.email}`} className={styles.contactCard} style={{ background: '#f5f5f7', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <span className={styles.contactCardIcon} style={{ color: '#111' }}>✉</span>
                  <span className={styles.contactCardLabel} style={{ color: '#555' }}>Email</span>
                  <span className={styles.contactCardValue} style={{ color: '#111' }}>{profile.email}</span>
                </a>
                <a href={profile.socialLinks.linkedin} target="_blank" rel="noreferrer" className={styles.contactCard} style={{ background: '#f5f5f7', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <span className={styles.contactCardIcon} style={{ color: '#111' }}>in</span>
                  <span className={styles.contactCardLabel} style={{ color: '#555' }}>LinkedIn</span>
                  <span className={styles.contactCardValue} style={{ color: '#111' }}>vimalprakash26</span>
                </a>
                <a href={profile.socialLinks.github} target="_blank" rel="noreferrer" className={styles.contactCard} style={{ background: '#f5f5f7', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <span className={styles.contactCardIcon} style={{ color: '#111' }}>⌥</span>
                  <span className={styles.contactCardLabel} style={{ color: '#555' }}>GitHub</span>
                  <span className={styles.contactCardValue} style={{ color: '#111' }}>{profile.githubRepoCount} repos</span>
                </a>
                <a href={profile.socialLinks.instagram} target="_blank" rel="noreferrer" className={styles.contactCard} style={{ background: '#f5f5f7', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <span className={styles.contactCardIcon} style={{ color: '#111' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </span>
                  <span className={styles.contactCardLabel} style={{ color: '#555' }}>Instagram</span>
                  <span className={styles.contactCardValue} style={{ color: '#111' }}>@vpixcel</span>
                </a>
              </div>
              </div>
            </div>
          </section>
        </div>
      </div> {/* END PARALLAX WRAPPER */}

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerInner}>
            <span className={styles.footerBrand}>{profile.title}</span>
            <span className={styles.footerCopy}>© 2026 — Built with React + Three.js</span>
            <div className={styles.footerLinks}>
              {Object.entries(profile.socialLinks).map(([key, url]) => (
                <a key={key} href={url} target="_blank" rel="noreferrer" className={styles.footerLink}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <AIChatbot />
    </div>
  );
}
