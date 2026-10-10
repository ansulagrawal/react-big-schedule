import type { SVGProps } from 'react';

const base: SVGProps<SVGSVGElement> = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  role: 'img',
};

export const MenuIcon = () => (
  <svg {...base} aria-label="Menu">
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export const GithubIcon = () => (
  <svg {...base} aria-label="GitHub" fill="currentColor" stroke="none">
    <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.4c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.82 1.19 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
  </svg>
);

export const NpmIcon = () => (
  <svg {...base} aria-label="npm" fill="currentColor" stroke="none">
    <path d="M0 7.5h24v8.2H12.3V18H6.2v-2.3H0Zm1.4 6.8h3.4V9.9h1.4v4.4h1.4V9H1.4Zm7.6-5.3v6.8h2.7v-1.4h2.8V9Zm2.7 1.4h1.4v2.6h-1.4Zm4.2-1.4v5.3h2.8V10.4h1.4v3.9h1.4v-3.9h1.4v3.9h1.4V9Z" />
  </svg>
);
