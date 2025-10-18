class AudioManager {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmGain: GainNode | null = null;
  private bgmTimer: number | null = null;
  private isBGMStarted: boolean = false;
  private bgmSource: AudioBufferSourceNode | null = null;
  private bgmBuffer: AudioBuffer | null = null;
  private useExternalBGM: boolean = false;
  private externalBGMPath: string | null = null;

  public init() {
    if (!this.audioCtx) {
      try {
        this.audioCtx = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      } catch (e) {
        console.error("Web Audio API is not supported in this browser");
      }
    }
  }

  public setExternalBGM(audioPath: string) {
    this.externalBGMPath = audioPath;
    this.useExternalBGM = true;
  }

  public useGeneratedBGM() {
    this.useExternalBGM = false;
    this.externalBGMPath = null;
  }

  private async loadAudioBuffer(url: string): Promise<AudioBuffer> {
    if (!this.audioCtx) throw new Error("AudioContext not initialized");

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      return await this.audioCtx.decodeAudioData(arrayBuffer);
    } catch (error) {
      console.error("Failed to load audio:", error);
      throw error;
    }
  }

  public async startBGM() {
    if (!this.audioCtx || this.isBGMStarted) return;
    this.isBGMStarted = true;

    this.bgmGain = this.audioCtx.createGain();
    this.bgmGain.connect(this.audioCtx.destination);

    const masterVolume = this.isMuted ? 0.0001 : 0.1;
    this.bgmGain.gain.setValueAtTime(0.001, this.audioCtx.currentTime);
    this.bgmGain.gain.exponentialRampToValueAtTime(
      masterVolume,
      this.audioCtx.currentTime + 2.0
    );

    if (this.useExternalBGM && this.externalBGMPath) {
      await this.startExternalBGM();
    } else {
      this.startGeneratedBGM();
    }
  }

  private async startExternalBGM() {
    if (!this.audioCtx || !this.bgmGain || !this.externalBGMPath) return;

    try {
      // Load the external audio file
      this.bgmBuffer = await this.loadAudioBuffer(this.externalBGMPath);

      // Create and start the audio source
      this.bgmSource = this.audioCtx.createBufferSource();
      this.bgmSource.buffer = this.bgmBuffer;
      this.bgmSource.loop = true; // Loop the background music
      this.bgmSource.connect(this.bgmGain);
      this.bgmSource.start();

      console.log("External BGM started successfully");
    } catch (error) {
      console.error(
        "Failed to start external BGM, falling back to generated music:",
        error
      );
      this.startGeneratedBGM();
    }
  }

  private startGeneratedBGM() {
    if (!this.audioCtx || !this.bgmGain) return;

    const audioCtx = this.audioCtx;

    // --- Vinyl Crackle ---
    const bufferSize = 2 * audioCtx.sampleRate;
    const noiseBuffer = audioCtx.createBuffer(
      1,
      bufferSize,
      audioCtx.sampleRate
    );
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const bandpass = audioCtx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = 1000;
    bandpass.Q.value = 0.5;

    const crackleGain = audioCtx.createGain();
    crackleGain.gain.value = 0.02; // very subtle

    whiteNoise.connect(bandpass).connect(crackleGain).connect(this.bgmGain);
    whiteNoise.start();

    // --- Energetic Music ---
    const bpm = 120; // Upbeat tempo for energy
    const quarterNoteTime = 60 / bpm;
    const barTime = quarterNoteTime * 4; // Standard 4/4 time

    // Bright, uplifting chord progressions
    const chords = [
      [261.63, 329.63, 392.0, 466.16], // C major 7th - bright and happy
      [293.66, 369.99, 440.0, 523.25], // D major 7th - uplifting
      [220.0, 277.18, 329.63, 392.0], // Am7 - emotional but positive
      [246.94, 311.13, 369.99, 440.0], // G major 7th - resolution
    ];
    let chordIndex = 0;

    const playEnergeticChord = (time: number) => {
      if (!this.bgmGain) return;
      const chord = chords[chordIndex % chords.length];
      chord.forEach((freq, index) => {
        const osc = audioCtx.createOscillator();
        const chordGain = audioCtx.createGain();
        osc.type = "triangle"; // Brighter than sine
        osc.frequency.setValueAtTime(freq, time);

        // More dynamic volume envelope
        chordGain.gain.setValueAtTime(0, time);
        chordGain.gain.linearRampToValueAtTime(0.12, time + 0.1); // Quick attack
        chordGain.gain.linearRampToValueAtTime(0.08, time + barTime * 0.6);
        chordGain.gain.exponentialRampToValueAtTime(
          0.0001,
          time + barTime - 0.1
        );

        // Staggered chord notes for richness
        const delay = index * 0.05;
        osc.connect(chordGain).connect(this.bgmGain);
        osc.start(time + delay);
        osc.stop(time + barTime);
      });
    };

    const playBassLine = (time: number) => {
      if (!this.bgmGain) return;
      const bassNotes = [82.41, 87.31, 92.5, 98.0]; // E2, F2, F#2, G2
      const note = bassNotes[chordIndex % bassNotes.length];

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      osc.type = "sawtooth"; // Rich bass sound
      osc.frequency.setValueAtTime(note, time);

      filter.type = "lowpass";
      filter.frequency.value = 200; // Deep bass
      filter.Q.value = 1;

      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.15, time + 0.05);
      gain.gain.linearRampToValueAtTime(0.1, time + barTime * 0.8);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + barTime - 0.1);

      osc.connect(filter).connect(gain).connect(this.bgmGain);
      osc.start(time);
      osc.stop(time + barTime);
    };

    const playUpbeatPercussion = (time: number) => {
      if (!this.bgmGain) return;
      // Energetic kick drum
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      osc.frequency.setValueAtTime(60, time);
      osc.frequency.exponentialRampToValueAtTime(30, time + 0.1);

      filter.type = "lowpass";
      filter.frequency.value = 100;

      gain.gain.setValueAtTime(0.2, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.2);

      osc.connect(filter).connect(gain).connect(this.bgmGain);
      osc.start(time);
      osc.stop(time + 0.2);
    };

    const playHiHat = (time: number) => {
      if (!this.bgmGain) return;
      // Bright hi-hat
      const noise = audioCtx.createBufferSource();
      const noiseBuffer = audioCtx.createBuffer(
        1,
        audioCtx.sampleRate * 0.1,
        audioCtx.sampleRate
      );
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < audioCtx.sampleRate * 0.1; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      noise.buffer = noiseBuffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = 8000; // Bright and crisp

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.05, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.1);

      noise.connect(filter).connect(gain).connect(this.bgmGain);
      noise.start(time);
      noise.stop(time + 0.1);
    };

    let nextNoteTime = audioCtx.currentTime;

    const scheduler = () => {
      while (nextNoteTime < audioCtx.currentTime + 0.1) {
        // Play energetic chord every bar
        playEnergeticChord(nextNoteTime);

        // Add bass line every bar for rhythm
        playBassLine(nextNoteTime);

        // Upbeat kick drum on beats 1 and 3
        if (chordIndex % 2 === 0) {
          playUpbeatPercussion(nextNoteTime);
        }

        // Hi-hat on beats 2 and 4 for groove
        if (chordIndex % 2 === 1) {
          playHiHat(nextNoteTime + quarterNoteTime);
        }

        chordIndex++;
        nextNoteTime += barTime;
      }
      this.bgmTimer = window.setTimeout(scheduler, 25.0);
    };
    scheduler();
  }

  public stopBGM() {
    if (this.bgmSource) {
      this.bgmSource.stop();
      this.bgmSource = null;
    }
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
    this.isBGMStarted = false;
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.bgmGain && this.audioCtx) {
      const targetVolume = this.isMuted ? 0.0001 : 0.1;
      this.bgmGain.gain.exponentialRampToValueAtTime(
        targetVolume,
        this.audioCtx.currentTime + 0.5
      );
    }
  }

  public play(
    sound:
      | "grab"
      | "drop"
      | "invalid"
      | "win"
      | "click"
      | "fragileMove"
      | "lock"
      | "linkedMove"
      | "lose"
  ) {
    if (!this.audioCtx || this.isMuted) return;

    const now = this.audioCtx.currentTime;
    let osc: OscillatorNode;
    let gain: GainNode;

    switch (sound) {
      case "grab":
        gain = this.audioCtx.createGain();
        gain.connect(this.audioCtx.destination);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

        osc = this.audioCtx.createOscillator();
        osc.connect(gain);
        osc.type = "square";
        osc.frequency.setValueAtTime(80, now);
        osc.start(now);
        osc.stop(now + 0.15);
        break;

      case "drop":
        gain = this.audioCtx.createGain();
        gain.connect(this.audioCtx.destination);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

        osc = this.audioCtx.createOscillator();
        osc.connect(gain);
        osc.type = "sine";
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(450, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.2);
        break;

      case "invalid":
        gain = this.audioCtx.createGain();
        gain.connect(this.audioCtx.destination);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

        osc = this.audioCtx.createOscillator();
        osc.connect(gain);
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.3);
        break;

      case "win":
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        notes.forEach((freq, i) => {
          gain = this.audioCtx!.createGain();
          gain.connect(this.audioCtx!.destination);
          gain.gain.setValueAtTime(0.2, now + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.1 + 0.2);

          osc = this.audioCtx!.createOscillator();
          osc.connect(gain);
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now + i * 0.1);
          osc.start(now + i * 0.1);
          osc.stop(now + i * 0.1 + 0.2);
        });
        break;

      case "lose":
        const loseNotes = [392.0, 311.13, 261.63]; // G4, Eb4, C4
        loseNotes.forEach((freq, i) => {
          gain = this.audioCtx!.createGain();
          gain.connect(this.audioCtx!.destination);
          gain.gain.setValueAtTime(0.25, now + i * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.15 + 0.3);

          osc = this.audioCtx!.createOscillator();
          osc.connect(gain);
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(freq, now + i * 0.15);
          osc.start(now + i * 0.15);
          osc.stop(now + i * 0.15 + 0.3);
        });
        break;

      case "click":
        gain = this.audioCtx.createGain();
        gain.connect(this.audioCtx.destination);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

        osc = this.audioCtx.createOscillator();
        osc.connect(gain);
        osc.type = "triangle";
        osc.frequency.setValueAtTime(880, now);
        osc.start(now);
        osc.stop(now + 0.1);
        break;

      case "fragileMove":
        gain = this.audioCtx.createGain();
        gain.connect(this.audioCtx.destination);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
        osc = this.audioCtx.createOscillator();
        osc.connect(gain);
        osc.type = "triangle";
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.3);
        break;

      case "lock":
        gain = this.audioCtx.createGain();
        gain.connect(this.audioCtx.destination);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
        osc = this.audioCtx.createOscillator();
        osc.connect(gain);
        osc.type = "square";
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.2);
        break;

      case "linkedMove":
        const linkNotes = [440, 554.37]; // A4, C#5
        linkNotes.forEach((freq, i) => {
          gain = this.audioCtx!.createGain();
          gain.connect(this.audioCtx!.destination);
          gain.gain.setValueAtTime(0.2, now + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.05 + 0.2);

          osc = this.audioCtx!.createOscillator();
          osc.connect(gain);
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + i * 0.05);
          osc.start(now + i * 0.05);
          osc.stop(now + i * 0.05 + 0.2);
        });
        break;
    }
  }
}

export const audioManager = new AudioManager();
