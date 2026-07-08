"use client";

import { createContext, useContext } from "react";
import type { ServiceListItem } from "@/lib/content";

const ServicesContext = createContext<ServiceListItem[]>([]);

export function ServicesProvider({
  services,
  children,
}: {
  services: ServiceListItem[];
  children: React.ReactNode;
}) {
  return (
    <ServicesContext.Provider value={services}>
      {children}
    </ServicesContext.Provider>
  );
}

export function useServices(): ServiceListItem[] {
  return useContext(ServicesContext);
}
