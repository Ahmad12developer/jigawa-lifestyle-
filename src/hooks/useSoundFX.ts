'use client';

import { useCallback } from 'react';

// High-fidelity Web Audio API synthesizer for retro-simulation micro-interactions
export function useSoundFX() {
  const playTone = useCallback((freq: number, type: OscillatorType, duration: number, gainValue = 0.1) => {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(gainValue, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio autoplay policy catch
    }
  }, []);

  const playClick = useCallback(() => {
    playTone(600, 'sine', 0.06, 0.08);
  }, [playTone]);

  const playCash = useCallback(() => {
    // Happy coin chime
    playTone(523.25, 'triangle', 0.1, 0.12);
    setTimeout(() => playTone(659.25, 'triangle', 0.12, 0.12), 70);
    setTimeout(() => playTone(783.99, 'triangle', 0.18, 0.14), 140);
  }, [playTone]);

  const playRest = useCallback(() => {
    // Gentle lullaby chord
    playTone(392.00, 'sine', 0.25, 0.08);
    setTimeout(() => playTone(493.88, 'sine', 0.25, 0.08), 90);
    setTimeout(() => playTone(587.33, 'sine', 0.35, 0.1), 180);
  }, [playTone]);

  const playTravel = useCallback(() => {
    // Bus / engine motor hum
    playTone(220, 'sawtooth', 0.15, 0.05);
    setTimeout(() => playTone(330, 'triangle', 0.18, 0.08), 80);
  }, [playTone]);

  const playKekeHorn = useCallback(() => {
    // Authentic Nigerian Keke NAPEP dual-tone horn (Peep-Peep!)
    playTone(880, 'square', 0.09, 0.08);
    playTone(1100, 'square', 0.09, 0.06);
    setTimeout(() => {
      playTone(880, 'square', 0.12, 0.08);
      playTone(1100, 'square', 0.12, 0.06);
    }, 110);
  }, [playTone]);

  const playEventPopup = useCallback(() => {
    // Suspense / chronicle alert
    playTone(440, 'triangle', 0.12, 0.1);
    setTimeout(() => playTone(554.37, 'sine', 0.2, 0.12), 100);
  }, [playTone]);

  const playWarning = useCallback(() => {
    // Low alert
    playTone(200, 'sawtooth', 0.25, 0.12);
  }, [playTone]);

  const playSuccess = useCallback(() => {
    // Celebratory victory fanfare
    playTone(440, 'triangle', 0.12, 0.1);
    setTimeout(() => playTone(554.37, 'triangle', 0.12, 0.1), 80);
    setTimeout(() => playTone(659.25, 'triangle', 0.14, 0.12), 160);
    setTimeout(() => playTone(880.0, 'triangle', 0.25, 0.14), 240);
  }, [playTone]);

  const playMessageChime = useCallback(() => {
    // Crisp modern smartphone incoming message chime
    playTone(587.33, 'sine', 0.08, 0.1);
    setTimeout(() => playTone(880.0, 'sine', 0.15, 0.12), 70);
  }, [playTone]);

  const playPhoneDial = useCallback(() => {
    // Dual-tone USSD / dialpad tap beep
    playTone(697, 'sine', 0.06, 0.08);
    playTone(1209, 'sine', 0.06, 0.06);
  }, [playTone]);

  return {
    playClick,
    playCash,
    playRest,
    playTravel,
    playKekeHorn,
    playEventPopup,
    playWarning,
    playSuccess,
    playMessageChime,
    playPhoneDial,
  };
}
