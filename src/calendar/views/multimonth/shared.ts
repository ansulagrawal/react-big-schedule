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
  /** background events by day: tint busy days */
  bgBuckets: Map<string, NormalizedEvent[]>;
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

/** Hover-card text for a day: its date, then one line per event. */
export const dayTip = (d: Dayjs, list: NormalizedEvent[] | undefined) =>
  [
    d.format('dddd, MMM D'),
    ...(list ?? []).map(e => `${e.allDay ? 'All day' : e.start.format('HH:mm')}  ${e.source.title}`),
  ].join('\n');

const shiftDay = (key: string, n: number) => {
  const [y = 0, m = 1, d = 1] = key.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
};

/**
 * Arrow-key navigation by date: left/right = +-1 day, up/down = +-1 week. Looks the target day up in the whole
 * multi-month root, so focus crosses from one month's grid to the next; hidden weekend days are skipped.
 */
export function onGridKey(e: KeyboardEvent<HTMLElement>) {
  const step = ({ ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 } as Record<string, number>)[e.key];
  const key = (e.target as HTMLElement).closest<HTMLElement>('[data-day]')?.dataset.day;
  if (!step || !key) return;
  e.preventDefault();
  const root = e.currentTarget.closest('.rbs-mm') ?? e.currentTarget;
  let target = key;
  for (let i = 0; i < 3; i++) {
    target = shiftDay(target, step);
    const el = root.querySelector<HTMLElement>(`[data-day="${target}"]`);
    if (el) return el.focus();
    if (Math.abs(step) > 1) return;
  }
}
