"use client";

import { createContext, useContext } from "react";
import { SETTINGS_FALLBACK, type Settings } from "@/lib/content";

const SettingsContext = createContext<Settings>(SETTINGS_FALLBACK);

export function SettingsProvider({
  settings,
  children,
}: {
  settings: Settings | null;
  children: React.ReactNode;
}) {
  return (
    <SettingsContext.Provider value={settings ?? SETTINGS_FALLBACK}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): Settings {
  return useContext(SettingsContext);
}
