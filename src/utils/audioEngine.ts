/**
 * Procedural Cinematic Ambient Soundscape Engine
 * Generates an ethereal, high-fidelity ambient pad that dynamically modulates
 * pitch, harmonic overtone brilliance, and filter resonance based on scroll depth.
 */

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private masterGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private shimmerFilter: BiquadFilterNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private baseFrequencies = [65.41, 98.00, 130.81, 164.81, 196.00]; // C2, G2, C3, E3, G3 (dreamy lush ambient chord)
  private gainNodes: GainNode[] = [];

  public init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass();

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Dynamic Lowpass Filter (Modulated by scroll depth)
    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.setValueAtTime(380, this.ctx.currentTime);
    this.filterNode.Q.setValueAtTime(2.5, this.ctx.currentTime);
    this.filterNode.connect(this.masterGain);

    // Dynamic Shimmer Bandpass Filter for high air
    this.shimmerFilter = this.ctx.createBiquadFilter();
    this.shimmerFilter.type = 'bandpass';
    this.shimmerFilter.frequency.setValueAtTime(1200, this.ctx.currentTime);
    this.shimmerFilter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    const shimmerGain = this.ctx.createGain();
    shimmerGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    this.shimmerFilter.connect(shimmerGain);
    shimmerGain.connect(this.masterGain);

    // Warm multi-oscillator chord pad
    this.baseFrequencies.forEach((freq, idx) => {
      if (!this.ctx || !this.filterNode) return;

      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      // Sine and triangle waves for ultra-smooth velvet texture
      osc.type = idx === 0 ? 'sine' : idx % 2 === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Subtle detuning for analog lush chorus feel
      const detune = (idx - 2) * 6; // -12 to +12 cents
      osc.detune.setValueAtTime(detune, this.ctx.currentTime);

      const amp = idx === 0 ? 0.35 : 0.18 / Math.sqrt(idx);
      oscGain.gain.setValueAtTime(amp, this.ctx.currentTime);

      osc.connect(oscGain);
      oscGain.connect(this.filterNode);
      if (idx >= 2 && this.shimmerFilter) {
        oscGain.connect(this.shimmerFilter);
      }

      osc.start();
      this.oscillators.push(osc);
      this.gainNodes.push(oscGain);
    });
  }

  public async start(): Promise<boolean> {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    if (this.masterGain && this.ctx) {
      // Smooth 1.8s fade in to prevent clicking
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(0.24, this.ctx.currentTime + 1.8);
      this.isPlaying = true;
      return true;
    }
    return false;
  }

  public stop() {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.0);
      setTimeout(() => {
        this.isPlaying = false;
      }, 1000);
    }
  }

  /**
   * Update audio parameters based on scrollProgress (0 to 1)
   */
  public updateScrollProgress(progress: number) {
    if (!this.ctx || !this.isPlaying || !this.filterNode) return;

    const clampedProgress = Math.max(0, Math.min(1, progress));
    const now = this.ctx.currentTime;

    // 1. Dynamic Filter Frequency: 320Hz at top (deep warm dusk) -> 950Hz at bottom (bright crystalline ether)
    const targetFilterFreq = 320 + clampedProgress * 680;
    this.filterNode.frequency.setTargetAtTime(targetFilterFreq, now, 0.15);

    // 2. Subtle pitch micro-glide (±35 cents) based on scroll depth
    this.oscillators.forEach((osc, idx) => {
      const baseDetune = (idx - 2) * 6;
      const scrollDetune = baseDetune + Math.sin(clampedProgress * Math.PI) * 28;
      osc.detune.setTargetAtTime(scrollDetune, now, 0.2);
    });

    // 3. Shimmer overtone filter glides upward
    if (this.shimmerFilter) {
      const shimmerFreq = 1000 + clampedProgress * 1400;
      this.shimmerFilter.frequency.setTargetAtTime(shimmerFreq, now, 0.2);
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const soundEngine = new AmbientSoundEngine();
