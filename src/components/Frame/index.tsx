import React, { useRef, useEffect } from 'react';
import styles from './Frame.module.css';

interface FrameProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Frame: React.FC<FrameProps> = ({ children, className = '', style }) => {
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = frame.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      frame.style.setProperty('--mx', `${x}px`);
      frame.style.setProperty('--my', `${y}px`);
    };

    frame.addEventListener('mousemove', handleMouseMove);
    return () => frame.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div ref={frameRef} className={`${styles.frame} ${className}`} style={style} tabIndex={0}>
      <div className={styles.spotlight} />
      <div className={`${styles.corner} ${styles.cornerTL}`} />
      <div className={`${styles.corner} ${styles.cornerTR}`} />
      <div className={`${styles.corner} ${styles.cornerBL}`} />
      <div className={`${styles.corner} ${styles.cornerBR}`} />
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};
