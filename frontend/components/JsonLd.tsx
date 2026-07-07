// Server-rendered JSON-LD. Because this renders on the server, crawlers and
// AI systems see the structured data in the initial HTML (no JS needed).
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
