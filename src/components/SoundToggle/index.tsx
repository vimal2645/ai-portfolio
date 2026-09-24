import { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { AudioEngine } from '../../lib/AudioEngine';
import styles from './SoundToggle.module.css';

export function SoundToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    AudioEngine.setEnabled(enabled);
  }, [enabled]);

  return (
    <button 
      className={`${styles.toggleBtn} ${enabled ? styles.active : ''}`}
      onClick={() => setEnabled(!enabled)}
      title={enabled ? "Mute Sounds" : "Enable Sounds"}
      aria-label="Toggle UI Sounds"
    >
      {enabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
    </button>
  );
}
