import { useSyncExternalStore } from 'react';
import type { Appointment } from './types';

// Yaklaşan randevu sayısını tab rozetiyle paylaşan modül-seviyesi store.
let count = 0;
const listeners = new Set<() => void>();

export function setUpcomingCount(next: number) {
  if (next === count) return;
  count = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return count;
}

export function useUpcomingCount() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function countUpcoming(appointments: Appointment[]): number {
  const now = Date.now();
  return appointments.filter(
    (appointment) =>
      (appointment.status === 'requested' || appointment.status === 'confirmed') &&
      new Date(appointment.starts_at).getTime() > now,
  ).length;
}
