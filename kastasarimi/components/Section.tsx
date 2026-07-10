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
export function Section({
  id,
  eyebrow,
  heading,
  intro,
  children,
  narrow = false,
  className = "",
}: {
  id?: string;
  eyebrow?: string;
  heading?: string;
  intro?: string;
  children?: ReactNode;
  narrow?: boolean;
  className?: string;
}) {
  return (
    <section id={id} className={`py-14 sm:py-20 ${className}`}>
      <Container className={narrow ? "max-w-[820px]" : ""}>
        {eyebrow && <span className="eyebrow mb-4">{eyebrow}</span>}
        {heading && (
          <h2 className="max-w-[720px] text-[clamp(24px,3.4vw,36px)] leading-tight text-ink">
            {heading}
          </h2>
        )}
        {intro && <p className="mt-4 max-w-[680px] text-[17px] leading-relaxed text-muted2">{intro}</p>}
        {children}
      </Container>
    </section>
  );
}
