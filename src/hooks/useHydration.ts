import { useSyncExternalStore } from 'react';

function subscribe() {
  return () => {};
}

/**
 * Hook to safely verify client hydration without cascading set-state renders
 */
export function useHydration() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
