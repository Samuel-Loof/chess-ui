// utils/sounds.ts - Sound effects manager
// Handles all game sound effects with volume control

class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private enabled: boolean = true;
  private volume: number = 0.5;

  constructor() {
    // Pre-load sounds (we'll use simple beeps for now, you can replace with real sounds)
    this.loadSound("move", this.createBeep(440, 0.1));
    this.loadSound("capture", this.createBeep(330, 0.15));
    this.loadSound("check", this.createBeep(880, 0.2));
    this.loadSound("castle", this.createBeep(550, 0.15));
    this.loadSound("ai-talk", this.createBeep(660, 0.1));
  }

  // NEW: Create simple beep sound (placeholder until you add real sounds)
  private createBeep(frequency: number, duration: number): string {
    // Create a data URL for a simple beep
    // This is a placeholder - you'll replace with real MP3s later
    const audioContext =
      typeof window !== "undefined"
        ? new (window.AudioContext || (window as any).webkitAudioContext)()
        : null;
    return ""; // We'll use a simpler approach
  }

  // NEW: Load a sound file
  private loadSound(name: string, url: string) {
    if (typeof window !== "undefined") {
      const audio = new Audio(url);
      audio.volume = this.volume;
      this.sounds.set(name, audio);
    }
  }

  // NEW: Play a sound
  play(soundName: string) {
    if (!this.enabled) return;

    const sound = this.sounds.get(soundName);
    if (sound) {
      sound.currentTime = 0; // Reset to start
      sound.play().catch((e) => console.log("Sound play failed:", e));
    } else {
      // Fallback: simple beep using Web Audio API
      this.playBeep(soundName);
    }
  }

  // NEW: Simple beep fallback (works everywhere)
  private playBeep(type: string) {
    if (typeof window === "undefined" || !this.enabled) return;

    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different frequencies for different sounds
      const frequencies: { [key: string]: number } = {
        move: 440,
        capture: 330,
        check: 880,
        castle: 550,
        "ai-talk": 660,
      };

      oscillator.frequency.value = frequencies[type] || 440;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(this.volume * 0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.1
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
      console.log("Audio not supported");
    }
  }

  // NEW: Enable/disable sounds
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  // NEW: Set volume (0-1)
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.sounds.forEach((sound) => {
      sound.volume = this.volume;
    });
  }

  // NEW: Check if enabled
  isEnabled() {
    return this.enabled;
  }
}

// Export singleton instance
export const soundManager = new SoundManager();
