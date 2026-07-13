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

// A page section with an optional numeral index + eyebrow + heading + intro.
// `as` sets the heading tag: default "h2" for in-page sections; pages that use a
// Section as their primary page heading pass as="h1" so every page has one H1.
export function Section({
  id,
  index,
  eyebrow,
  heading,
  intro,
  children,
  narrow = false,
  className = "",
  as: Heading = "h2",
}: {
  id?: string;
  index?: string;
  eyebrow?: string;
  heading?: string;
  intro?: string;
  children?: ReactNode;
  narrow?: boolean;
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <section id={id} className={`py-16 sm:py-24 ${className}`}>
      <Container className={narrow ? "max-w-[820px]" : ""}>
        {eyebrow && <span className="eyebrow mb-5">{eyebrow}</span>}
        {heading && (
          <div className="flex items-baseline gap-4 sm:gap-6">
            {index && <span className="section-index shrink-0" aria-hidden="true">{index}</span>}
            <Heading className="max-w-[760px] text-[clamp(27px,3.8vw,46px)] leading-[1.06] text-ink">
              {heading}
            </Heading>
          </div>
        )}
        {intro && <p className="mt-5 max-w-[680px] text-[17px] leading-relaxed text-muted2">{intro}</p>}
        {children}
      </Container>
    </section>
  );
}
