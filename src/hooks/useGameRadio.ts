'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export interface RadioTrack {
  id: string;
  title: string;
  genre: string;
  mood: string;
  bpm: number;
}

export const RADIO_TRACKS: RadioTrack[] = [
  {
    id: 'dutse_breeze',
    title: 'Dutse Rock Breeze (Lofi Chill)',
    genre: 'Sahelian Lofi',
    mood: 'Peaceful · Inselberg Sunset',
    bpm: 78,
  },
  {
    id: 'kiyawa_cruise',
    title: 'Kiyawa Road Cruising (Afro-Fusion)',
    genre: 'Afro-Lofi Beat',
    mood: 'Uplifting · Commercial Transit',
    bpm: 96,
  },
  {
    id: 'garu_palace',
    title: 'Garu Palace Durbar (Royal Strings)',
    genre: 'Traditional Hausa Modern',
    mood: 'Regal · Ancient Citadel',
    bpm: 82,
  },
  {
    id: 'kasuwar_night',
    title: 'Kasuwar Midnight Hustle (Vinyl Groove)',
    genre: 'Midnight Groove',
    mood: 'Energetic · Trade Market',
    bpm: 88,
  },
];

// Pentatonic and modal frequencies inspired by traditional Sahelian instruments (Kora, Kalimba, Goje)
const SCALES = {
  // E Minor pentatonic / Sahelian desert scale
  desertPentatonic: [164.81, 196.0, 220.0, 246.94, 293.66, 329.63, 392.0, 440.0],
  // F# Doriano-Afro chord tones
  afroMajor7: [174.61, 220.0, 261.63, 329.63, 349.23, 440.0, 523.25],
  // Royal D minor Durbar
  durbarMinor: [146.83, 174.61, 220.0, 261.63, 293.66, 349.23, 440.0],
};

export function useGameRadio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.5);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const timerRef = useRef<number | null>(null);
  const stepRef = useRef(0);

  const currentTrack = RADIO_TRACKS[trackIndex];

  // Initialize or get persistent AudioContext
  const getAudioContext = useCallback(() => {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
        const masterGain = audioCtxRef.current.createGain();
        masterGain.gain.setValueAtTime(volume * 0.18, audioCtxRef.current.currentTime);
        masterGain.connect(audioCtxRef.current.destination);
        gainNodeRef.current = masterGain;
      }
    }
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, [volume]);

  // Play a synthesized musical voice (Kalimba / Rhodes / Pluck)
  const playNote = useCallback((freq: number, type: OscillatorType, duration: number, gainVal = 0.08) => {
    const ctx = getAudioContext();
    if (!ctx || !gainNodeRef.current) return;

    try {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      noteGain.gain.setValueAtTime(gainVal, ctx.currentTime);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(noteGain);
      noteGain.connect(gainNodeRef.current);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio safety catch
    }
  }, [getAudioContext]);

  // Soft vinyl noise / percussion tap (Kalangu / shaker)
  const playPercussion = useCallback((isSnare: boolean) => {
    const ctx = getAudioContext();
    if (!ctx || !gainNodeRef.current) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = isSnare ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(isSnare ? 180 : 80, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(isSnare ? 0.05 : 0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);

      osc.connect(gain);
      gain.connect(gainNodeRef.current);

      osc.start();
      osc.stop(ctx.currentTime + 0.14);
    } catch {
      // Audio safety
    }
  }, [getAudioContext]);

  // Step sequencer generator
  const runSequenceStep = useCallback(() => {
    const scale =
      trackIndex === 0
        ? SCALES.desertPentatonic
        : trackIndex === 1
        ? SCALES.afroMajor7
        : trackIndex === 2
        ? SCALES.durbarMinor
        : SCALES.desertPentatonic;

    const step = stepRef.current % 16;
    stepRef.current += 1;

    // 1. Kick on 0, 8 (or 0, 6, 10 for afro-groove)
    if (step === 0 || step === 8) {
      playPercussion(false);
    } else if (step === 4 || step === 12) {
      playPercussion(true); // Snare / shaker tap
    }

    // 2. Bass tone on downbeats
    if (step % 4 === 0) {
      const bassFreq = scale[step % 3] / 2;
      playNote(bassFreq, 'sine', 0.4, 0.09);
    }

    // 3. Melodic Kalimba / Pluck arpeggios
    if (step % 2 === 0 || step === 7 || step === 11) {
      const noteIdx = (step * 3 + trackIndex * 2) % scale.length;
      const freq = scale[noteIdx];
      const waveType: OscillatorType = trackIndex % 2 === 0 ? 'sine' : 'triangle';
      playNote(freq, waveType, 0.35, 0.06);
    }
  }, [trackIndex, playNote, playPercussion]);

  // Start / Stop Loop
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const intervalMs = (60 / currentTrack.bpm / 4) * 1000;
    timerRef.current = window.setInterval(runSequenceStep, intervalMs);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, currentTrack.bpm, runSequenceStep]);

  // Volume change sync
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume * 0.18, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const nextTrack = () => {
    setTrackIndex((prev) => (prev + 1) % RADIO_TRACKS.length);
    stepRef.current = 0;
  };

  const prevTrack = () => {
    setTrackIndex((prev) => (prev - 1 + RADIO_TRACKS.length) % RADIO_TRACKS.length);
    stepRef.current = 0;
  };

  return {
    isPlaying,
    currentTrack,
    trackIndex,
    volume,
    togglePlay,
    nextTrack,
    prevTrack,
    setVolume,
  };
}
