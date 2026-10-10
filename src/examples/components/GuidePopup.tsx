import { useEffect, useState } from 'react';

interface GuidePopupProps {
  title: string;
  heading: string;
  text: string;
  features: string[];
  cta: string;
  /** Milliseconds before the popup appears. */
  delay?: number;
}

const VISIBLE_MS = 10000;

/** A dismissible welcome card that shows after a short delay and closes itself after 10 seconds. */
export default function GuidePopup({ title, heading, text, features, cta, delay = 1000 }: GuidePopupProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setOpen(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!open) return undefined;
    const timer = setTimeout(() => setOpen(false), VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [open]);

  if (!open) return null;

  return (
    <aside className="ex-guide" aria-label={title}>
      <div className="ex-guide-head">
        <strong>{title}</strong>
        <button type="button" className="ex-btn ex-btn-ghost" aria-label="Close" onClick={() => setOpen(false)}>
          &times;
        </button>
      </div>
      <h3>{heading}</h3>
      <p>{text}</p>
      <ul>
        {features.map(f => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      <div className="ex-guide-bar" style={{ animationDuration: `${VISIBLE_MS}ms` }} />
      <button type="button" className="ex-btn ex-btn-primary ex-guide-cta" onClick={() => setOpen(false)}>
        {cta}
      </button>
    </aside>
  );
}
