// biome-ignore-all lint/a11y: ARIA grid cell on a div (CSS-grid layout)
import type { Dayjs } from 'dayjs';
import { type CSSProperties, memo } from 'react';

export interface DayCellProps {
  dayKey: string;
  date: Dayjs;
  label: string;
  title: string;
  isToday: boolean;
  isOther: boolean;
  hidden: boolean;
  focusable: boolean;
  selected: boolean;
  dropping: boolean;
  /** background-event colour tinting this cell */
  bgColor?: string;
  className: string;
}

function DayCell({
  dayKey,
  label,
  title,
  isToday,
  isOther,
  hidden,
  focusable,
  selected,
  dropping,
  bgColor,
  className,
}: DayCellProps) {
  const cls = [
    'rbs-dg-cell',
    isToday && 'rbs-dg-today',
    isOther && 'rbs-dg-other',
    selected && 'rbs-dg-selected',
    dropping && 'rbs-dg-drop',
    bgColor && 'rbs-dg-bg',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <div
      className={cls}
      role="gridcell"
      data-date={dayKey}
      tabIndex={focusable ? 0 : -1}
      aria-label={title}
      style={bgColor ? ({ '--rbs-bg': bgColor } as CSSProperties) : undefined}
    >
      {!hidden && (
        <button type="button" className="rbs-dg-num" data-nav={dayKey} tabIndex={-1} aria-hidden="true">
          {label}
        </button>
      )}
    </div>
  );
}

export default memo(DayCell);
