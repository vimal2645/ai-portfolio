import { useEffect, useState } from 'react';
import styles from './ThemeSwitcher.module.css';

type Theme = 'cyberpunk' | 'neobrutalism' | 'minimalist';

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>('cyberpunk');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className={styles.switcherWrapper} aria-label="Theme Switcher">
      <button 
        className={`${styles.themeBtn} ${styles.themeCyberpunk} ${theme === 'cyberpunk' ? styles.active : ''}`}
        onClick={() => setTheme('cyberpunk')}
        title="Cyberpunk"
      />
      <button 
        className={`${styles.themeBtn} ${styles.themeNeobrutalism} ${theme === 'neobrutalism' ? styles.active : ''}`}
        onClick={() => setTheme('neobrutalism')}
        title="Neo-Brutalism"
      />
      <button 
        className={`${styles.themeBtn} ${styles.themeMinimalist} ${theme === 'minimalist' ? styles.active : ''}`}
        onClick={() => setTheme('minimalist')}
        title="Minimalist"
      />
    </div>
  );
}
