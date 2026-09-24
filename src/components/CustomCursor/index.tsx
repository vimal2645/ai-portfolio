import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { AudioEngine } from '../../lib/AudioEngine';
import styles from './CustomCursor.module.css';

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const text = textRef.current;
    if (!cursor || !text) return;
    
    // Check if device supports hover
    if (window.matchMedia('(hover: none)').matches) return;

    const ctx = gsap.context(() => {
      let mouseX = window.innerWidth / 2;
      let mouseY = window.innerHeight / 2;
      
      // We use quickTo for high performance following
      const xTo = gsap.quickTo(cursor, "x", { duration: 0.4, ease: "power3" });
      const yTo = gsap.quickTo(cursor, "y", { duration: 0.4, ease: "power3" });

      const onMouseMove = (e: MouseEvent) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        xTo(mouseX - cursor.offsetWidth / 2);
        yTo(mouseY - cursor.offsetHeight / 2);
      };

      window.addEventListener('mousemove', onMouseMove);

      // Handle magnetic snapping and hovering over interactive elements
      const interactiveElements = document.querySelectorAll('a, button, input, [role="button"], .project-frame');
      
      interactiveElements.forEach((el) => {
        el.addEventListener('mouseenter', () => {
          AudioEngine.playHoverTick();
          gsap.to(cursor, { 
            width: 60,  
            height: 60, 
            duration: 0.3, 
            ease: "back.out(2)" 
          });
          
          if (el.classList.contains('project-frame')) {
            text.innerText = "View";
            gsap.to(text, { opacity: 1, duration: 0.2 });
          }
        });

        el.addEventListener('mouseleave', () => {
          gsap.to(cursor, { 
            width: 20, 
            height: 20, 
            duration: 0.3, 
            ease: "power2.out" 
          });
          gsap.to(text, { opacity: 0, duration: 0.2 });
        });
      });

      return () => {
        window.removeEventListener('mousemove', onMouseMove);
      };
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={cursorRef} className={styles.cursor}>
      <span ref={textRef} className={styles.cursorText}></span>
    </div>
  );
}
