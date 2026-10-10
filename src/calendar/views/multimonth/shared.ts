import type { Dayjs } from 'dayjs';
import type { KeyboardEvent } from 'react';
import type { CalendarViewName, CalendarViewProps } from '../../types';
import type { NormalizedEvent } from '../../utils';

export interface MonthShared
  extends Pick<
    CalendarViewProps,
    'eventClassNames' | 'eventContent' | 'onDateClick' | 'onEventClick' | 'goTo' | 'dayCellClassNames'
  > {
  buckets: Map<string, NormalizedEvent[]>;
  today: Dayjs;
  firstDay: number;
  weekends: boolean;
  weekNumbers: boolean;
  /** year grid: dot instead of chips */
  compact: boolean;
  view: CalendarViewName;
}

export const MAX_CHIPS = 3;

/** ISO-8601 number of the week containing `d`, judged by that week's Thursday (weeks start on `firstDay`). */
export function weekNumber(d: Dayjs, firstDay: number): number {
  const thu = d
    .startOf('day')
    .subtract((d.day() - firstDay + 7) % 7, 'day')
    .add((4 - firstDay + 7) % 7, 'day');
  return Math.floor(thu.diff(thu.startOf('year'), 'day') / 7) + 1;
}

export const dayTitle = (d: Dayjs, list: NormalizedEvent[] | undefined) =>
  list?.length ? `${d.format('ddd, MMM D')}: ${list.map(e => e.source.title).join(', ')}` : d.format('ddd, MMM D');

/** Arrow-key navigation among `[data-day]` cells of a grid. */
export function onGridKey(e: KeyboardEvent<HTMLElement>, cols: number) {
  const delta = ({ ArrowLeft: -1, ArrowRight: 1, ArrowUp: -cols, ArrowDown: cols } as Record<string, number>)[e.key];
  if (!delta) return;
  const cells = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[data-day]'));
  const i = cells.indexOf((e.target as HTMLElement).closest<HTMLElement>('[data-day]') as HTMLElement);
  const next = cells[i + delta];
  if (i >= 0 && next) {
    e.preventDefault();
    next.focus();
  }
}
