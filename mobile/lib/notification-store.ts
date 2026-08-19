import { useSyncExternalStore } from 'react';

// Okunmamış bildirim sayısını üst çubuktaki zil rozetiyle paylaşan
// modül-seviyesi store; upcoming-store ile aynı desen.
let unread = 0;
const listeners = new Set<() => void>();

export function setUnreadNotifications(next: number) {
  const safe = Number.isFinite(next) && next > 0 ? Math.trunc(next) : 0;
  if (safe === unread) return;
  unread = safe;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return unread;
}

export function useUnreadNotifications() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
