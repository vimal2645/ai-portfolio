import React, { useEffect, useState, useRef } from 'react';
import { profile } from './config/profile';
import { Canvas } from '@react-three/fiber';
import { ParticlePortrait } from './components/ParticlePortrait';
import { LogoMark } from './components/LogoMark';
import { CustomCursor } from './components/CustomCursor';
import { LiquidImage } from './components/LiquidImage';
import { ScrollyArtifact } from './components/ScrollyArtifact';
import { BackgroundVideo } from './components/BackgroundVideo';
import { SpiralGallery } from './components/SpiralGallery';
import { AIChatbot } from './components/AIChatbot';
import { AudioEngine } from './lib/AudioEngine';
import Lenis from '@studio-freight/lenis';
import { gsap } from 'gsap';

import styles from './App.module.css';

const navLinks = [
  { id: 'work', label: 'Work' },
  { id: 'labs', label: 'Labs' },
  { id: 'skills', label: 'Skills' },
  { id: 'process', label: 'Process' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
];

function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);

  // Navigation Pill state
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
    });
    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // Initialize audio engine on first user interaction
  useEffect(() => {
    const initAudio = () => {
      AudioEngine.setEnabled(true);
      window.removeEventListener('pointerdown', initAudio);
      window.removeEventListener('keydown', initAudio);
    };
    window.addEventListener('pointerdown', initAudio, { once: true });
    window.addEventListener('keydown', initAudio, { once: true });
    return () => {
      window.removeEventListener('pointerdown', initAudio);
      window.removeEventListener('keydown', initAudio);
    };
  }, []);

  // Update pill position when active section changes
  useEffect(() => {
    const activeEl = document.querySelector(`a[href="#${activeSection}"]`) as HTMLAnchorElement;
    if (activeEl) {
      setPillStyle({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
        opacity: 1
      });
    } else {
      setPillStyle(prev => ({ ...prev, opacity: 0 }));
    }
  }, [activeSection]);

  const handleNavClick = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setIsMenuOpen(false);
    setActiveSection(id);
    if (lenisRef.current) {
      lenisRef.current.scrollTo(`#${id}`, { offset: -100, duration: 1.2 });
    }
  };

  // Intro animation
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let mm = gsap.matchMedia();
    mm.add({
      isDesktop: "(min-width: 900px)"
    }, (context) => {
      let { isDesktop } = context.conditions as any;
      if (isDesktop && !prefersReducedMotion) {
        gsap.fromTo('.reveal-hero',
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: 'expo.out', stagger: 0.08, delay: 0.2 }
        );
      }
    });
    return () => mm.revert();
  }, []);

  return (
    <div className={styles.appContainer}>
      <BackgroundVideo />
      <ScrollyArtifact />
      <CustomCursor />

      {/* ================= NAV ================= */}
      <header className={styles.header}>
        <a href="#home" className={styles.logoBtn} onClick={(e) => handleNavClick('home', e)} aria-label="VPIXCEL home">
          <LogoMark size={36} />
          <span className={styles.navLogoText}>VPIXCEL</span>
        </a>

        <nav className={styles.desktopNav}>
          <div className={styles.navLinksWrapper}>
            <div className={styles.activePill} style={pillStyle} />
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={`${styles.navLink} ${activeSection === link.id ? styles.activeLink : ''}`}
                onClick={(e) => handleNavClick(link.id, e)}
              >
                {link.label}
              </a>
            ))}
          </div>
        </nav>

        <div className={styles.navActions}>
          <a href="#contact" className={styles.btnPrimary} onClick={(e) => handleNavClick('contact', e)}>Start a project</a>
          <button onClick={() => window.dispatchEvent(new CustomEvent('open-chatbot'))} className={styles.btnGhost}>Ask Whizz</button>

          <button className={styles.mobileMenuToggle} onClick={() => setIsMenuOpen(true)} aria-label="Open menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <div className={styles.mobileMenuOverlay}>
          <button className={styles.closeMenuButton} onClick={() => setIsMenuOpen(false)}>✕ CLOSE</button>
          <nav className={styles.mobileNav}>
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={styles.mobileNavLink}
                onClick={(e) => handleNavClick(link.id, e)}
              >
                {link.label}
              </a>
            ))}
            <a href="#contact" className={`${styles.mobileNavLink} text-gradient`} style={{ marginTop: '2rem' }} onClick={(e) => handleNavClick('contact', e)}>
              Start a project
            </a>
            <button onClick={() => { setIsMenuOpen(false); window.dispatchEvent(new CustomEvent('open-chatbot')); }} className={styles.mobileNavLink}>
              Ask Whizz
            </button>
          </nav>
        </div>
      )}

      {/* ================= HERO ================= */}
      <main>
        <section id="home" className={styles.heroSection}>
          <div className="container grid-12">
            <div className={styles.heroContent}>
              <div className={`${styles.availabilityPill} reveal-hero`}>
                <div className={styles.dot}></div>
                {profile.availability}
              </div>

              <div className={`eyebrow reveal-hero`}>{profile.label}</div>

              <h1 className={`${styles.heroH1} reveal-hero scramble-text`}>
                I build <span className="text-gradient">AI products</span> that ship.
              </h1>

              <p className={`${styles.heroSub} reveal-hero`}>
                {profile.heroSub}
              </p>

              <div className={`${styles.heroButtons} reveal-hero`}>
                <a href="#contact" className={styles.btnPrimary} onClick={(e) => handleNavClick('contact', e)}>Start a project</a>
                <a href="#work" className={styles.btnGhost} onClick={(e) => handleNavClick('work', e)}>View work</a>
              </div>

              <div className={`${styles.proofRow} reveal-hero`}>
                {profile.stats.map((stat, i) => (
                  <div key={i} className={styles.proofItem}>
                    <span className={styles.proofValue}>{stat.value}</span>
                    <span className={styles.proofLabel}>{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${styles.heroVisual} reveal-hero`}>
              <Canvas camera={{ position: [0, 0, 5], fov: 75 }} dpr={[1, 2]}>
                <ParticlePortrait imageUrl={profile.profileImage} secondaryImageUrl="/logo.png" />
              </Canvas>
            </div>
          </div>

          <div className={styles.scrollCue}>
            <div className={styles.scrollCueLine}></div>
          </div>
        </section>

        {/* ================= SKILLS MARQUEE ================= */}
        <section className={styles.marqueeSection}>
          <div className={styles.marqueeTrack}>
            <span>{profile.skillsMarquee.join(' • ')}</span>
            <span>{profile.skillsMarquee.join(' • ')}</span>
            <span>{profile.skillsMarquee.join(' • ')}</span>
            <span>{profile.skillsMarquee.join(' • ')}</span>
          </div>
        </section>

        {/* ================= WORK ================= */}
        <section id="work" className={styles.workSection}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className="eyebrow">SELECTED WORK</span>
              <h2 className={`${styles.sectionH2} scramble-text`}>Flagship projects</h2>
              <p className={styles.sectionSub}>Deployed products built from scratch.</p>
            </div>

            {profile.featuredProjects.map((project) => (
              <div key={project.slug} className={styles.projectRow}>
                <div className={styles.projectVisual}>
                  <div className={styles.browserFrame}>
                    <div className={styles.browserTop}>
                      <div className={styles.browserDot}></div>
                      <div className={styles.browserDot}></div>
                      <div className={styles.browserDot}></div>
                    </div>
                    {/* Fallback to placeholder if missing */}
                    <LiquidImage
                      imageUrl={project.screenshots.desktop}
                      alt={`${project.title} Desktop`}
                      className={styles.projectImage}
                    />
                  </div>
                  {project.screenshots.mobile && (
                    <img
                      src={project.screenshots.mobile}
                      alt={`${project.title} Mobile`}
                      className={styles.mobileMockup}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  )}
                </div>

                <div className={styles.projectInfo}>
                  <div>
                    <h3 className={styles.projectTitle}>{project.title}</h3>
                    <div className={styles.projectOutcome}>{project.outcome}</div>
                  </div>

                  <div className={styles.projectDetailLine}>
                    <strong>Problem:</strong> {project.problem}
                  </div>
                  <div className={styles.projectDetailLine}>
                    <strong>What I built:</strong> {project.built}
                  </div>
                  <div className={styles.projectDetailLine}>
                    <strong>Result:</strong> {project.result}
                  </div>

                  <div className={styles.chipsRow}>
                    {project.stack.map(tech => <span key={tech} className={styles.chip}>{tech}</span>)}
                  </div>

                  <div className={styles.projectLinks}>
                    <a href={project.live} target="_blank" rel="noopener noreferrer" className={styles.btnPrimary}>Live Demo</a>
                    <a href={project.github} target="_blank" rel="noopener noreferrer" className={styles.btnGhost}>GitHub</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= LABS ================= */}
        <section id="labs" className={styles.labsSection}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className="eyebrow">LABS & EXPERIMENTS</span>
              <h2 className={`${styles.sectionH2} scramble-text`}>Explorations</h2>
              <p className={styles.sectionSub}>Side projects proving specific capabilities.</p>
            </div>

            <div className={styles.bentoGrid} style={{ gridTemplateColumns: '1fr' }}>
              <div className={`${styles.bentoCard} ${styles.bento12}`} style={{ padding: '4rem', textAlign: 'center' }}>
                <div className={styles.dotGridBg}></div>
                <div className={styles.bento12Content} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                  <h3 className={styles.labTitle} style={{ fontSize: '2.5rem' }}>{profile.githubRepoCount} repositories on GitHub</h3>
                  <p className={styles.projectDetailLine} style={{ maxWidth: '600px', margin: '0 auto' }}>
                    Explore a wide range of experiments, open-source contributions, and boilerplate templates proving capabilities in AI, Data Pipelines, and Automations.
                  </p>
                  <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className={styles.btnPrimary} style={{ position: 'relative', zIndex: 1, marginTop: '1rem' }}>
                    Explore GitHub Repositories
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* ================= CAPABILITIES ================= */}
        <section id="skills" className={styles.capabilitiesSection}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className="eyebrow">WHAT I DO</span>
              <h2 className={`${styles.sectionH2} scramble-text`}>Capabilities</h2>
              <p className={styles.sectionSub}>Specialized engineering services for modern teams.</p>
            </div>

            <SpiralGallery />
          </div>
        </section>

        {/* ================= PROCESS ================= */}
        <section id="process" className={styles.processSection}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className="eyebrow">HOW I WORK</span>
              <h2 className={`${styles.sectionH2} scramble-text`}>The Process</h2>
              <p className={styles.sectionSub}>From concept to production-ready deployment.</p>
            </div>

            <div className={styles.processWrapper}>
              <div className={styles.processLine}>
                <div className={styles.processLineFill} id="process-line-fill"></div>
              </div>
              <div className={styles.processSteps}>
                {[
                  { step: "01", title: "Discover", desc: "Aligning on goals, scoping features, and defining architecture." },
                  { step: "02", title: "Design", desc: "Prototyping UX/UI and planning the technical stack." },
                  { step: "03", title: "Build", desc: "Iterative development with regular feedback loops." },
                  { step: "04", title: "Ship", desc: "Deployment, optimization, and handoff." }
                ].map((item, i) => (
                  <div key={i} className={styles.processStep}>
                    <div className={styles.stepDot}>{item.step}</div>
                    <div>
                      <h4 className={styles.stepTitle}>{item.title}</h4>
                      <p className={styles.stepDesc}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        {/* ================= ABOUT ================= */}
        <section id="about" className={styles.aboutSection}>
          <div className="container grid-12">
            <div className={styles.aboutVisual}>
              <Canvas camera={{ position: [0, 0, 5], fov: 75 }} dpr={[1, 2]}>
                <ParticlePortrait imageUrl={profile.profileImage} secondaryImageUrl="/logo.png" />
              </Canvas>
            </div>
            <div className={styles.aboutContent}>
              <div>
                <span className="eyebrow">ABOUT ME</span>
                <h2 className={`${styles.sectionH2} scramble-text`} style={{ textAlign: 'left', marginTop: '0.5rem' }}>Engineering & Aesthetics</h2>
              </div>
              <p className={styles.aboutStory}>{profile.aboutStory}</p>

              <div className={styles.timeline}>
                {profile.timeline.map((item, i) => (
                  <div key={i} className={styles.timelineItem}>
                    <div className={styles.timelinePeriod}>{item.period}</div>
                    <div>
                      <div className={styles.timelineRole}>{item.role}</div>
                      <div className={styles.timelineCompany}>{item.company}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================= CONTACT & FOOTER ================= */}
        <section id="contact" className={styles.contactSection}>
          <div className="container">
            <div className={styles.contactHeader}>
              <h2 className={`${styles.contactH2} scramble-text`}>Let's build something.</h2>
              <p className={styles.sectionSub}>Available for freelance opportunities.</p>
            </div>

            <div className={styles.contactCards}>
              <div className={styles.contactCard}>
                <h3 className={styles.contactCardTitle}>Hiring me for a project</h3>
                <p className={styles.sectionSub}>Let's discuss your requirements and build a technical roadmap.</p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <a href={`mailto:${profile.email}`} className={styles.btnPrimary}>Email me</a>
                  <a href={profile.calendlyUrl} target="_blank" rel="noopener noreferrer" className={styles.btnGhost}>Book a call</a>
                </div>
              </div>
              <div className={styles.contactCard}>
                <h3 className={styles.contactCardTitle}>Recruiting</h3>
                <p className={styles.sectionSub}>Looking for a forward-deployed engineer to join your team?</p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => window.dispatchEvent(new CustomEvent('open-chatbot'))} className={styles.btnPrimary}>Ask Whizz</button>
                  <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className={styles.btnGhost}>LinkedIn</a>
                </div>
              </div>
            </div>

            <div className={styles.socialGrid}>
              <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>GitHub ↗</a>
              <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>LinkedIn ↗</a>
              <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>Instagram @vpixcel ↗</a>
            </div>

            <footer className={styles.footer}>
              <LogoMark size={56} />
              <div className={styles.navLogoText}>VPIXCEL</div>
              <div className={styles.footerTagline}>DATA | CODE | IMPACT</div>
              <div className={styles.copyright}>© {new Date().getFullYear()} Vimal Prakash. All rights reserved.</div>
            </footer>
          </div>
        </section>
      </main>

      <AIChatbot />
    </div>
  );
}

export default App;
