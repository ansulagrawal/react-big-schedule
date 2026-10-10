import type { ReactNode, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const svg = (d: ReactNode, props: IconProps) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    {d}
  </svg>
);

export const ChevronLeft = (props: IconProps) => svg(<path d="M10 3 5 8l5 5" />, props);
export const ChevronRight = (props: IconProps) => svg(<path d="m6 3 5 5-5 5" />, props);
export const Close = (props: IconProps) => svg(<path d="m4 4 8 8M12 4l-8 8" />, props);
export const PlusSquare = (props: IconProps) =>
  svg(
    <>
      <rect x="2" y="2" width="12" height="12" rx="2" />
      <path d="M8 5v6M5 8h6" />
    </>,
    props,
  );
export const MinusSquare = (props: IconProps) =>
  svg(
    <>
      <rect x="2" y="2" width="12" height="12" rx="2" />
      <path d="M5 8h6" />
    </>,
    props,
  );
