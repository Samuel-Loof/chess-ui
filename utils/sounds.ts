// utils/sounds.ts - Sound effects manager
// Handles all game sound effects with volume control

class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map(); // Dictionary to store all our sounds
  private enabled: boolean = true; // Master on/off switch for all sounds
  private volume: number = 0.5; // Master volume control (0 = silent, 1 = max)

  constructor() {
    // Load all sound files from the /public/sounds folder
    // The paths are relative to the public folder
    // Each sound is identified by a name (key) for easy access later

    this.loadSound("move", "/sounds/chessMove.mp3"); // Regular piece moves
    this.loadSound("capture", "/sounds/capture.mp3"); // Capturing a piece (reusing move sound)
    this.loadSound("check", "/sounds/check.wav"); // When king is in check
    this.loadSound("castle", "/sounds/chessMove.mp3"); // Castling move (reusing move sound)
    this.loadSound("ai-talk", "/sounds/notification.wav"); // When AI sends a comment
  }

  // Load a sound file and store it in our Map
  // This happens once when the app starts, then we reuse the same audio element
  private loadSound(name: string, url: string) {
    // Check if we're in a browser environment (not server-side rendering)
    if (typeof window !== "undefined") {
      const audio = new Audio(url); // Create HTML5 Audio element
      audio.volume = this.volume; // Set initial volume from master volume
      this.sounds.set(name, audio); // Store in Map with the name as key
    }
  }

  // Play a sound by its name
  // Example: soundManager.play('move') will play the move sound
  play(soundName: string) {
    if (!this.enabled) return; // If sounds are disabled globally, don't play

    const sound = this.sounds.get(soundName); // Look up the sound in our Map
    if (sound) {
      // Reset to beginning - this allows rapid repeated plays without waiting
      sound.currentTime = 0;

      // Play the sound and catch any errors (e.g., if user hasn't interacted with page yet)
      sound.play().catch((e) => console.log("Sound play failed:", e));
    } else {
      // If sound file not found, fall back to beep
      this.playBeep(soundName);
    }
  }

  // Fallback beep using Web Audio API
  // This creates a simple tone if MP3 files aren't available
  private playBeep(type: string) {
    if (typeof window === "undefined" || !this.enabled) return;

    try {
      // Create audio context (the system for generating sounds programmatically)
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      // Create oscillator (tone generator) and gain node (volume control)
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Connect: oscillator → volume → speakers
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different sounds get different frequencies (pitch)
      const frequencies: { [key: string]: number } = {
        move: 440, // A4 note - middle tone
        capture: 330, // E4 note - lower tone
        check: 880, // A5 note - high alert tone
        castle: 550, // C#5 note - medium-high tone
        "ai-talk": 660, // E5 note - friendly tone
      };

      oscillator.frequency.value = frequencies[type] || 440; // Set pitch
      oscillator.type = "sine"; // Smooth wave for pleasant tone

      // Fade out effect: start at volume, quickly fade to near-silent
      gainNode.gain.setValueAtTime(this.volume * 0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.1
      );

      // Play for 0.1 seconds (100ms)
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
      console.log("Audio not supported");
    }
  }

  // Enable or disable all sounds
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  // Set master volume for all sounds (0.0 to 1.0)
  // This updates all currently loaded sounds AND stores the value for future sounds
  setVolume(volume: number) {
    // Clamp between 0 and 1 (Math.max ensures >= 0, Math.min ensures <= 1)
    this.volume = Math.max(0, Math.min(1, volume));

    // Update volume on all already-loaded sounds
    this.sounds.forEach((sound) => {
      sound.volume = this.volume;
    });
  }

  // Check if sounds are currently enabled
  isEnabled() {
    return this.enabled;
  }
}

// Export a single shared instance
// Everyone uses the same soundManager so settings are consistent across the app
export const soundManager = new SoundManager();
