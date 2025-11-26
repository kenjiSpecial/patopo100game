import { useCallback } from 'react';

export const useSound = () => {
  const playSound = useCallback((type: 'count' | 'stop' | 'perfect' | 'great' | 'bad' | 'gameover') => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;

      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'count') {
        // Soft tick
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'stop') {
        // Sharp stop sound
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'perfect') {
        // Fanfare
        osc.type = 'sine';
        // C5 - E5 - G5 - C6
        const notes = [523.25, 659.25, 783.99, 1046.50];
        const duration = 0.1;

        const playNote = (freq: number, startTime: number) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.type = 'sine';
          o.frequency.value = freq;
          g.gain.setValueAtTime(0.1, startTime);
          g.gain.linearRampToValueAtTime(0.01, startTime + duration);
          o.start(startTime);
          o.stop(startTime + duration);
        };

        notes.forEach((freq, i) => playNote(freq, now + i * 0.08));
      } else if (type === 'great') {
        // Positive chord
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);

        // Add a second note for harmony
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(659.25, now); // E5
        gain2.gain.setValueAtTime(0.1, now);
        gain2.gain.linearRampToValueAtTime(0.01, now + 0.3);
        osc2.start(now);
        osc2.stop(now + 0.3);

      } else if (type === 'bad') {
        // Warning beep
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(150, now + 0.2);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'gameover') {
        // Low buzzer
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.linearRampToValueAtTime(50, now + 0.5);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      }
    } catch (e) {
      console.error('Audio playback failed', e);
    }
  }, []);

  return { playSound };
};

