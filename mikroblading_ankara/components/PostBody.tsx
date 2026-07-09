// Renders CMS post HTML (body_tr) with the .prose styles from globals.css.
// Server-rendered so the full article is in the initial HTML for SEO/AI.
export function PostBody({ html }: { html: string }) {
  return <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />;
}
