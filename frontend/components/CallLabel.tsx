"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";

// Swaps the call CTA text between the label ("Hemen Ara") and the phone number.
export function CallLabel({ label }: { label: string }) {
  const [showPhone, setShowPhone] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setShowPhone((s) => !s), 2400);
    return () => clearInterval(id);
  }, []);

  const text = showPhone ? site.phoneLocal : label;

  return (
    // key remounts the span so callFade replays on every swap;
    // min-width keeps the button from resizing between the two texts.
    <span
      key={text}
      className="inline-block min-w-[7.5em] text-center"
      style={{ animation: "callFade 0.45s ease" }}
    >
      {text}
    </span>
  );
}
