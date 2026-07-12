import type { ReactNode } from "react";

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`mx-auto max-w-[1180px] px-5 ${className}`}>{children}</div>;
}

// A page section with an optional eyebrow + heading + intro.
// `as` sets the heading tag: default "h2" for in-page sections; pages that use a
// Section as their primary page heading pass as="h1" so every page has one H1.
export function Section({
  id,
  eyebrow,
  heading,
  intro,
  children,
  narrow = false,
  className = "",
  as: Heading = "h2",
}: {
  id?: string;
  eyebrow?: string;
  heading?: string;
  intro?: string;
  children?: ReactNode;
  narrow?: boolean;
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <section id={id} className={`py-14 sm:py-20 ${className}`}>
      <Container className={narrow ? "max-w-[820px]" : ""}>
        {eyebrow && (
          <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-accent">{eyebrow}</p>
        )}
        {heading && (
          <Heading className="max-w-[720px] text-[clamp(24px,3.4vw,36px)] leading-tight text-ink">
            {heading}
          </Heading>
        )}
        {intro && <p className="mt-4 max-w-[680px] text-[17px] leading-relaxed text-muted2">{intro}</p>}
        {children}
      </Container>
    </section>
  );
}
