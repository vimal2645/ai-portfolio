export class AudioEngine {
  private static ctx: AudioContext | null = null;
  private static isEnabled = false;

  public static init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public static setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (enabled) this.init();
  }
  
  public static getEnabled() {
    return this.isEnabled;
  }

  public static playHoverTick() {
    if (!this.isEnabled || !this.ctx) return;
    
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.05);
    
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.05, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(t);
    osc.stop(t + 0.05);
  }

  public static playSwoosh() {
    if (!this.isEnabled || !this.ctx) return;
    
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(100, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.5);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, t);
    filter.frequency.exponentialRampToValueAtTime(100, t + 0.5);
    
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.1, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(t);
    osc.stop(t + 0.5);
  }
}
