// Server-rendered JSON-LD so crawlers and AI systems see structured data in the
// initial HTML (no JS execution required).
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
