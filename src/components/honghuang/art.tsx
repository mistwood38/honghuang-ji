import type { ComponentProps } from "react";
import { ART, type ArtKey, type SceneMood } from "@/lib/honghuang/visuals";

export function Artwork({
  art,
  className = "",
  eager = false,
  decorative = false,
}: {
  art: (typeof ART)[ArtKey];
  className?: string;
  eager?: boolean;
  decorative?: boolean;
}) {
  return (
    <picture className={`artwork ${className}`}>
      <source media="(max-width: 640px)" srcSet={art.small} />
      <img
        src={art.src}
        alt={decorative ? "" : art.alt}
        width={1440}
        height={810}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        decoding="async"
      />
    </picture>
  );
}
export function Atmosphere({ mood = "mist" }: { mood?: SceneMood }) {
  return (
    <div className={`atmosphere atmosphere-${mood}`} aria-hidden="true">
      <span className="mist-bank mist-bank-one" />
      <span className="mist-bank mist-bank-two" />
      <span className="celestial-light" />
      <span className="rune-drift">玄&#12288;始&#12288;道&#12288;生</span>
      <span className="spirit-mote mote-one" />
      <span className="spirit-mote mote-two" />
      <span className="spirit-mote mote-three" />
    </div>
  );
}
export function PageHeading({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="page-heading">
      <p className="eyebrow">{label}</p>
      <h1 className="page-title">{title}</h1>
      {children ? <div className="page-intro">{children}</div> : null}
    </header>
  );
}
export function SectionHeading({ children, ...props }: ComponentProps<"h2">) {
  return (
    <h2 className="ornament-heading" {...props}>
      <span aria-hidden="true">◇</span>
      {children}
      <span className="heading-rule" />
    </h2>
  );
}
