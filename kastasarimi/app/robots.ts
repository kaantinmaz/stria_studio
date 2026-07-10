import type { MetadataRoute } from "next";
import { absUrl } from "@/lib/seo";

// Allow standard crawlers AND AI answer-engine bots (so they can cite us).
// Block CCBot (training-only Common Crawl) — no citation benefit.
export default function robots(): MetadataRoute.Robots {
  const aiBots = [
    "GPTBot",
    "ChatGPT-User",
    "OAI-SearchBot",
    "PerplexityBot",
    "ClaudeBot",
    "anthropic-ai",
    "Claude-Web",
    "Google-Extended",
    "Applebot-Extended",
    "Bingbot",
  ];
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      ...aiBots.map((userAgent) => ({ userAgent, allow: "/" })),
      { userAgent: "CCBot", disallow: "/" },
    ],
    sitemap: absUrl("/sitemap.xml"),
    host: absUrl("/"),
  };
}
