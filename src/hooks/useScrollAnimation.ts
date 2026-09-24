import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AudioEngine } from '../lib/AudioEngine';

gsap.registerPlugin(ScrollTrigger);

export const useScrollAnimation = (containerRef: React.RefObject<HTMLElement | null>) => {
  useEffect(() => {
    if (!containerRef.current) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let mm = gsap.matchMedia(containerRef);
    mm.add({
      isDesktop: "(min-width: 900px)",
      isMobile: "(max-width: 899px)"
    }, (context) => {
      let { isDesktop, isMobile } = context.conditions as any;

      if (isDesktop) {
        // Refresh ScrollTrigger after images/fonts load
        setTimeout(() => ScrollTrigger.refresh(), 500);
        setTimeout(() => ScrollTrigger.refresh(), 500);
        window.addEventListener('load', () => ScrollTrigger.refresh());


        // Removed old global section exit here

        // 1. ABOUT - Word Scrub & Stats
        const aboutWords = gsap.utils.toArray('#about .about-word');
        if (aboutWords.length > 0) {
          gsap.set(aboutWords, { opacity: 0.15 });
          gsap.to(aboutWords, {
            opacity: 1,
            stagger: 0.025,
            scrollTrigger: {
              trigger: '#about',
              start: 'top 65%',
              end: 'center 40%',
              scrub: 1
            }
          });
        }

        const counters = gsap.utils.toArray('.animate-counter');
        counters.forEach((counter: any) => {
          const target = parseInt(counter.getAttribute('data-target') || '0', 10);
          ScrollTrigger.create({
            trigger: counter,
            start: 'top 85%',
            once: true,
            onEnter: () => {
              gsap.to(counter, {
                innerHTML: target,
                duration: 1.2,
                snap: { innerHTML: 1 },
                ease: 'power2.out'
              });
            }
          });
        });

        const statTiles = gsap.utils.toArray('#about [class*="statItem"]');
        if (statTiles.length > 0) {
          gsap.fromTo(statTiles,
            { rotateX: -35, opacity: 0, y: 40 },
            {
              rotateX: 0,
              opacity: 1,
              y: 0,
              stagger: 0.1,
              duration: 0.8,
              ease: 'back.out(1.5)',
              scrollTrigger: {
                trigger: '#about [class*="statsGrid"]',
                start: 'top 85%',
              }
            }
          );
        }

        // Tags slide-scroll parallax
        const aboutTagRows = gsap.utils.toArray('.about-tag-row');
        aboutTagRows.forEach((row: any, i: number) => {
          const dir = i % 2 === 0 ? -1 : 1;
          gsap.to(row, {
            x: dir * 60,
            scrollTrigger: {
              trigger: '#about',
              start: 'top bottom',
              end: 'bottom top',
              scrub: true
            }
          });
        });

        // 2. SKILLS - Velocity Marquee & Bento Grid
        const marqueeText = gsap.utils.toArray('.marqueeText');
        if (marqueeText.length > 0 && !prefersReducedMotion) {
          // Continuous movement
          marqueeText.forEach((text: any) => {
            gsap.to(text, {
              xPercent: -50,
              repeat: -1,
              duration: 15,
              ease: 'none'
            });
            // Velocity modifier
            ScrollTrigger.create({
              trigger: document.body,
              start: 0,
              end: 'max',
              onUpdate: (self) => {
                const velocity = self.getVelocity();
                gsap.to(text, { timeScale: 1 + velocity / 1000, duration: 0.5, overwrite: true });
              }
            });
          });
        }

        const bentoCards = gsap.utils.toArray('.bento-card');
        if (bentoCards.length > 0 && !prefersReducedMotion) {
          bentoCards.forEach((card: any, i: number) => {
            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: '.bentoGrid',
                start: 'top 80%'
              }
            });

            tl.fromTo(card,
              { opacity: 0, x: i % 2 === 0 ? -80 : 80, rotation: i % 2 === 0 ? -2 : 2, scale: 0.95 },
              { opacity: 1, x: 0, rotation: 0, scale: 1, duration: 0.8, ease: 'power2.out' }
            );

            const cardChips = card.querySelectorAll('.chip');
            if (cardChips.length > 0) {
              tl.fromTo(cardChips,
                { opacity: 0, y: 10, scale: 0.9 },
                { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.025, ease: 'back.out(2)' },
                "-=0.5"
              );
            }

            card.addEventListener('mouseenter', () => {
              if (cardChips.length > 0) {
                gsap.to(cardChips, { y: -3, duration: 0.2, stagger: 0.02, yoyo: true, repeat: 1, ease: 'power1.inOut' });
              }
            });
          });
        }

        // 3. EXPERIENCE - Stacking Sticky Cards
        const stickyCards = gsap.utils.toArray('.sticky-card');
        const timelineLine = document.querySelector('.timelineLine');

        if (stickyCards.length > 0) {
          // Draw timeline
          if (timelineLine) {
            gsap.fromTo(timelineLine, { scaleY: 0 }, {
              scaleY: 1,
              scrollTrigger: {
                trigger: '.stickyStack',
                start: 'top 50%',
                end: 'bottom 70%',
                scrub: true
              }
            });
          }

          stickyCards.forEach((card: any, i: number) => {
            const dot = card.querySelector('.timelineDot');
            const pill = card.querySelector('.periodPill');
            const bullets = card.querySelectorAll('.bulletLine');

            if (!prefersReducedMotion) {
              gsap.fromTo(card,
                { rotateX: 12, opacity: 0, y: 50 },
                { rotateX: 0, opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', scrollTrigger: { trigger: card, start: 'top 80%' } }
              );

              if (pill) {
                gsap.fromTo(pill,
                  { clipPath: 'inset(0 100% 0 0)' },
                  { clipPath: 'inset(0 0% 0 0)', duration: 0.8, ease: 'steps(20)', scrollTrigger: { trigger: card, start: 'top 75%' } }
                );
              }

              if (bullets.length > 0) {
                gsap.fromTo(bullets,
                  { x: -20, opacity: 0 },
                  { x: 0, opacity: 1, stagger: 0.08, duration: 0.5, ease: 'power2.out', scrollTrigger: { trigger: card, start: 'top 75%' } }
                );
              }
            }

            let dotPulse: gsap.core.Tween | null = null;
            ScrollTrigger.create({
              trigger: card,
              start: 'top 50%',
              end: 'bottom 50%',
              onEnter: () => {
                gsap.to(dot, { backgroundColor: 'var(--accent)', duration: 0.3 });
                dotPulse = gsap.to(dot, { scale: 1.5, boxShadow: '0 0 10px var(--accent)', duration: 0.8, yoyo: true, repeat: -1, ease: 'sine.inOut' });
              },
              onLeave: () => {
                if (dotPulse) dotPulse.kill();
                gsap.to(dot, { scale: 1, boxShadow: 'none', backgroundColor: 'var(--border)', duration: 0.3 });
              },
              onEnterBack: () => {
                gsap.to(dot, { backgroundColor: 'var(--accent)', duration: 0.3 });
                dotPulse = gsap.to(dot, { scale: 1.5, boxShadow: '0 0 10px var(--accent)', duration: 0.8, yoyo: true, repeat: -1, ease: 'sine.inOut' });
              },
              onLeaveBack: () => {
                if (dotPulse) dotPulse.kill();
                gsap.to(dot, { scale: 1, boxShadow: 'none', backgroundColor: 'var(--border)', duration: 0.3 });
              }
            });

            if (i < stickyCards.length - 1 && !prefersReducedMotion) {
              const nextCard = stickyCards[i + 1] as HTMLElement;
              gsap.to(card, {
                scale: 0.94,
                opacity: 0.55,
                scrollTrigger: {
                  trigger: nextCard,
                  start: 'top 70%',
                  end: 'top 30%',
                  scrub: true
                }
              });
            }
          });
        }

        // 4. PROJECTS - Pinned Horizontal Scroll
        const pinWrapper = document.querySelector('.pinWrapper');
        const track = document.querySelector('.horizontalTrack');
        const projectIndicator = document.querySelector('.projectIndicator');
        const projectFrames = gsap.utils.toArray('.project-frame');

        if (pinWrapper && track && window.innerWidth > 768 && !prefersReducedMotion) {
          const visibleWidth = track.parentElement?.clientWidth || window.innerWidth;
          const scrollAmount = track.scrollWidth - visibleWidth;

          const pinTween = gsap.to(track, {
            x: -scrollAmount,
            ease: 'none',
            scrollTrigger: {
              trigger: pinWrapper,
              pin: true,
              scrub: 0.6,
              start: 'top top',
              end: () => `+=${scrollAmount}`,
              invalidateOnRefresh: true,
              onUpdate: (self) => {

                if (projectIndicator) {
                  const total = projectFrames.length;
                  const index = Math.min(total, Math.floor(self.progress * total) + 1);
                  projectIndicator.innerHTML = `0${index} / 0${total}`;
                }
              }
            }
          });

          // Container animation for dimming non-active cards
          projectFrames.forEach((frame: any) => {
            gsap.fromTo(frame,
              { scale: 0.92, opacity: 0.6 },
              {
                scale: 1, opacity: 1,
                scrollTrigger: {
                  trigger: frame,
                  containerAnimation: pinTween,
                  start: 'left center',
                  end: 'right center',
                  toggleActions: 'play reverse play reverse'
                }
              }
            );

            const img = frame.querySelector('.projectPreview img');
            if (img) {
              gsap.set(img, { scale: 1.25 });
              gsap.fromTo(img,
                { xPercent: 10 },
                {
                  xPercent: -10,
                  ease: 'none',
                  scrollTrigger: {
                    trigger: frame,
                    containerAnimation: pinTween,
                    start: 'left right',
                    end: 'right left',
                    scrub: true
                  }
                }
              );
            }
          });

          // 3D Tilt Hover
          projectFrames.forEach((card: any) => {
            card.addEventListener('mousemove', (e: MouseEvent) => {
              const rect = card.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              const cx = rect.width / 2;
              const cy = rect.height / 2;
              const rx = ((y - cy) / cy) * -6;
              const ry = ((x - cx) / cx) * 6;
              gsap.to(card, { rotateX: rx, rotateY: ry, duration: 0.4, ease: 'power2.out' });
            });
            card.addEventListener('mouseleave', () => {
              gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'power2.out' });
            });
          });
        }

        // Custom Cursor
        const projectCursor = document.getElementById('project-cursor');
        if (projectCursor && window.innerWidth > 768) {
          projectFrames.forEach((card: any) => {
            card.addEventListener('mouseenter', () => {
              projectCursor.style.opacity = '1';
              projectCursor.style.transform = 'translate(-50%, -50%) scale(1)';
            });
            card.addEventListener('mouseleave', () => {
              projectCursor.style.opacity = '0';
              projectCursor.style.transform = 'translate(-50%, -50%) scale(0.5)';
            });
          });
          window.addEventListener('mousemove', (e) => {
            gsap.to(projectCursor, { x: e.clientX, y: e.clientY, duration: 0.1 });
          });
        }

        // 5. CONTACT - Magnetic CTA & Word Reveal
        const contactWords = gsap.utils.toArray('.contact-headline span');
        if (contactWords.length > 0) {
          gsap.fromTo(contactWords,
            { opacity: 0, y: 20 },
            {
              opacity: 1, y: 0, stagger: 0.1, duration: 0.8, ease: 'expo.out',
              scrollTrigger: { trigger: '#contact', start: 'top 70%' }
            }
          );
        }

        const emailChars = gsap.utils.toArray('.email-char');
        if (emailChars.length > 0 && !prefersReducedMotion) {
          gsap.fromTo(emailChars,
            { opacity: 0, scale: 0 },
            { opacity: 1, scale: 1, stagger: 0.05, duration: 0.6, ease: 'back.out(2)', scrollTrigger: { trigger: '.contact-email', start: 'top 85%' } }
          );
        }

        const socialTiles = gsap.utils.toArray('.socialTile');
        if (socialTiles.length > 0 && !prefersReducedMotion) {
          socialTiles.forEach((tile: any) => {
            const parent = tile.parentElement;
            parent.addEventListener('mousemove', (e: MouseEvent) => {
              const rect = tile.getBoundingClientRect();
              const cx = rect.left + rect.width / 2;
              const cy = rect.top + rect.height / 2;
              const dx = e.clientX - cx;
              const dy = e.clientY - cy;
              gsap.to(tile, { x: dx * 0.2, y: dy * 0.2, duration: 0.4, ease: 'power2.out' });
            });
            parent.addEventListener('mouseleave', () => {
              gsap.to(tile, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' });
            });
          });
        }

        const cta = document.querySelector('.contact-cta') as HTMLElement;
        if (cta && !prefersReducedMotion) {
          const ctaParent = cta.parentElement;
          if (ctaParent) {
            ctaParent.addEventListener('mousemove', (e: MouseEvent) => {
              const rect = cta.getBoundingClientRect();
              const cx = rect.left + rect.width / 2;
              const cy = rect.top + rect.height / 2;
              const dx = e.clientX - cx;
              const dy = e.clientY - cy;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 150) {
                gsap.to(cta, { x: dx * 0.3, y: dy * 0.3, duration: 0.4, ease: 'power2.out' });
              } else {
                gsap.to(cta, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' });
              }
            });
            ctaParent.addEventListener('mouseleave', () => {
              gsap.to(cta, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' });
            });
          }
        }

        // 6. SYNC PARTICLE MORPH
        // We map the 5 transitions to exact integer intervals (0 to 5)
        // Home=0, About=1, Skills=2, Experience=3, Projects=4, Contact=5
        const allSections = gsap.utils.toArray('section');
        allSections.forEach((section: any, index: number) => {
          if (index === 0) {
            // Provide debug HUD for home when at top
            ScrollTrigger.create({
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              onUpdate: (self) => {
                const debugHUD = document.getElementById('debug-hud');
                if (debugHUD && self.progress < 0.5) {
                  debugHUD.innerHTML = `Section: home<br>Progress: 0.00<br>Text Side: left<br>Particle Side: right<br>Opacity: 1.00`;
                }
              }
            });
            return;
          }

          ScrollTrigger.create({
            trigger: section,
            start: 'top bottom', // When the top of this section enters the bottom of the screen
            end: 'center center', // Settled means the section is centered in the viewport
            scrub: true,
            onUpdate: (self) => {
              // self.progress goes from 0 to 1 during the transition
              (window as any).__morphProgress = (index - 1) + self.progress;

              const debugHUD = document.getElementById('debug-hud');
              if (debugHUD) {
                const p = self.progress.toFixed(2);
                const textSide = section.getAttribute('data-side') || 'left';
                const particleSide = textSide === 'left' ? 'right' : 'left';
                const morphIntensity = Math.sin(self.progress * Math.PI);
                const shapeOpacity = (1.0 * (1.0 - morphIntensity)) + (0.3 * morphIntensity);
                debugHUD.innerHTML = `Section: ${section.id}<br>Progress: ${p}<br>Text Side: ${textSide}<br>Particle Side: ${particleSide}<br>Opacity: ${shapeOpacity.toFixed(2)}`;
              }
            }
          });
        });

        // 7. SECTION ENTRANCES — clean fade-up for all non-hero sections
        allSections.forEach((section: any) => {
          if (section.id === 'home' || prefersReducedMotion) return;

          const frame = section.querySelector('[class*="sectionFrame"]');
          if (!frame) return;

          // Entrance: Page up and Blink transition
          gsap.fromTo(section,
            { y: 150, opacity: 0, filter: 'brightness(2)' },
            {
              y: 0, opacity: 1, filter: 'brightness(1)', duration: 1.2, ease: 'expo.out',
              scrollTrigger: {
                trigger: section,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
              }
            }
          );

          // Skill cards — staggered fly-in from bottom
          if (section.id === 'skills') {
            const cards = section.querySelectorAll('.skill-card');
            gsap.set(cards, { y: 60, opacity: 0, rotateX: -10, scale: 0.96 });
            gsap.to(cards, {
              y: 0, opacity: 1, rotateX: 0, scale: 1,
              stagger: 0.1, duration: 0.9, ease: 'expo.out',
              scrollTrigger: {
                trigger: section,
                start: 'top 65%',
                toggleActions: 'play none none reverse'
              }
            });
            // Chip cascade
            const chips = section.querySelectorAll('.skill-chip');
            gsap.set(chips, { y: 10, opacity: 0 });
            gsap.to(chips, {
              y: 0, opacity: 1,
              stagger: 0.02, duration: 0.5, ease: 'back.out(2)',
              scrollTrigger: {
                trigger: section,
                start: 'top 55%',
                toggleActions: 'play none none reverse'
              }
            });
          }

          // About stat tiles
          if (section.id === 'about') {
            const stats = section.querySelectorAll('.about-stat');
            if (stats.length > 0) {
              gsap.set(stats, { y: 30, opacity: 0, rotateX: -20 });
              gsap.to(stats, {
                y: 0, opacity: 1, rotateX: 0,
                stagger: 0.1, duration: 0.8, ease: 'back.out(1.5)',
                scrollTrigger: {
                  trigger: section,
                  start: 'top 60%',
                  toggleActions: 'play none none reverse'
                }
              });
            }
          }

          // Experience cards
          if (section.id === 'experience') {
            const cards = section.querySelectorAll('.sticky-card');
            gsap.set(cards, { x: -30, opacity: 0 });
            gsap.to(cards, {
              x: 0, opacity: 1,
              stagger: 0.15, duration: 0.8, ease: 'expo.out',
              scrollTrigger: {
                trigger: section,
                start: 'top 70%',
                toggleActions: 'play none none reverse'
              }
            });
          }

          // Contact panel
          if (section.id === 'contact') {
            const cta = section.querySelector('.cta-panel');
            if (cta) {
              gsap.set(cta, { y: 40, opacity: 0, scale: 0.97 });
              gsap.to(cta, {
                y: 0, opacity: 1, scale: 1,
                duration: 1.0, ease: 'expo.out',
                scrollTrigger: {
                  trigger: section,
                  start: 'top 65%',
                  toggleActions: 'play none none reverse'
                }
              });
            }
          }
        });

        // 8. TEXT SCRAMBLE REVEAL
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*0123456789";
        const scrambleElements = document.querySelectorAll('.scramble-text');

        scrambleElements.forEach((el) => {
          const element = el as HTMLElement;
          const originalText = element.getAttribute('data-original') || element.innerText;
          element.setAttribute('data-original', originalText);

          ScrollTrigger.create({
            trigger: element,
            start: 'top 85%',
            once: true,
            onEnter: () => {
              AudioEngine.playSwoosh();
              let iteration = 0;
              const interval = setInterval(() => {
                element.innerText = originalText
                  .split("")
                  .map((letter, index) => {
                    if (letter === " ") return " ";
                    if (index < iteration) {
                      return originalText[index];
                    }
                    return letters[Math.floor(Math.random() * letters.length)];
                  })
                  .join("");

                if (iteration >= originalText.length) {
                  clearInterval(interval);
                  element.innerText = originalText;
                }

                iteration += 1 / 3;
              }, 30);
            }
          });
        });

      }
      if (isMobile) {
        // Mobile intersection observer logic
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const el = entry.target as HTMLElement;
              el.style.opacity = '1';
              el.style.transform = 'translateY(0)';
              observer.unobserve(el);
            }
          });
        }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });

        const elements = document.querySelectorAll('.reveal-hero, .bento-card, .sticky-card, .processStep, .about-word, [class*="statItem"], .timelineItem, [class*="projectFrame"]');
        elements.forEach((el, index) => {
          const element = el as HTMLElement;
          element.style.opacity = '0';
          element.style.transform = 'translateY(20px)';
          element.style.transition = `opacity 0.7s ease ${index * 0.08}s, transform 0.7s ease ${index * 0.08}s`;
          observer.observe(element);

          setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
          }, 1200);
        });
      }
    });

    // Refresh after fonts and images load
    const refreshTrigger = () => ScrollTrigger.refresh();
    window.addEventListener('load', refreshTrigger);
    if ('fonts' in document) {
      (document as any).fonts.ready.then(refreshTrigger);
    }

    // Kill and rebuild triggers on resize (handled largely by ScrollTrigger but we can force it)
    let resizeTimer: any;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 200);
    };
    window.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('resize', handleResize);

    return () => {
      mm.revert();
      window.removeEventListener('load', refreshTrigger);
      window.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('resize', handleResize);
    };
  }, [containerRef]);
};

