import type { ReactNode } from "react";
import { ArrowRight, BookOpen, CalendarDays, Check, Search, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function Eyebrow({ children, tone = "gold" }: { children: ReactNode; tone?: "gold" | "green" | "light" }) {
  return <div className={`tm3-eyebrow tm3-eyebrow--${tone}`}>{children}</div>;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={`tm3-section-heading tm3-section-heading--${align}`}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "green" | "gold" | "dark" | "live" | "blue" }) {
  return <span className={`tm3-badge tm3-badge--${tone}`}>{children}</span>;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
  icon = "book",
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
  icon?: "book" | "calendar" | "search" | "spark";
}) {
  const Icon = icon === "calendar" ? CalendarDays : icon === "search" ? Search : icon === "spark" ? Sparkles : BookOpen;
  return (
    <div className="tm3-empty-state">
      <div className="tm3-empty-state__icon"><Icon size={26} /></div>
      <h3>{title}</h3>
      <p>{description}</p>
      {actionLabel && actionTo && (
        <Link className="tm3-button tm3-button--dark" to={actionTo}>
          {actionLabel}<ArrowRight size={17} />
        </Link>
      )}
      {actionLabel && !actionTo && onAction && (
        <button className="tm3-button tm3-button--dark" type="button" onClick={onAction}>
          {actionLabel}<ArrowRight size={17} />
        </button>
      )}
    </div>
  );
}

export function Metric({ value, label, helper }: { value: string | number; label: string; helper?: string }) {
  return (
    <div className="tm3-metric">
      <strong>{value}</strong>
      <span>{label}</span>
      {helper && <small>{helper}</small>}
    </div>
  );
}

export function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="tm3-feature-list">
      {items.map((item) => (
        <li key={item}><span><Check size={15} /></span>{item}</li>
      ))}
    </ul>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
  aside,
}: {
  eyebrow: string;
  title: string;
  description: string;
  aside?: ReactNode;
}) {
  return (
    <section className="tm3-page-intro">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {aside && <div className="tm3-page-intro__aside">{aside}</div>}
    </section>
  );
}
