'use client';

import { useCallback } from 'react';
import { useGameStore } from '@/store/useGameStore';
import randomEventsRaw from '@/data/randomEvents.json';
import type { RandomEvent } from '@/types/game';

const randomEvents = randomEventsRaw as RandomEvent[];

export function useRandomEvents() {
  const { currentLocation, activeEvent, triggerRandomEvent } = useGameStore();

  const checkForEvent = useCallback((probability = 0.15) => {
    if (activeEvent) return false;

    if (Math.random() <= probability) {
      const locationSpecific = randomEvents.filter(
        (e) => !e.contextLocation || e.contextLocation === currentLocation
      );
      const pool = locationSpecific.length > 0 ? locationSpecific : randomEvents;
      const chosen = pool[Math.floor(Math.random() * pool.length)];

      triggerRandomEvent(chosen);
      return true;
    }
    return false;
  }, [activeEvent, currentLocation, triggerRandomEvent]);

  return {
    checkForEvent,
    hasActiveEvent: !!activeEvent,
  };
}
