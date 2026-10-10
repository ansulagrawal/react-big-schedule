import type { Dayjs } from 'dayjs';
import type { LocaleDayjs } from '../types';
import type { CalendarEvent, CalendarViewName, DateLike, DateRange } from './types';

/** An event with parsed dates. `end` is exclusive (an all-day event on Mar 3 ends Mar 4 00:00). */
export interface NormalizedEvent {
  source: CalendarEvent;
  id: CalendarEvent['id'];
  start: Dayjs;
  end: Dayjs;
  allDay: boolean;
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export const toDayjs = (dayjs: LocaleDayjs, value: DateLike): Dayjs => dayjs(value as string | number | Date);

export function normalizeEvent(dayjs: LocaleDayjs, event: CalendarEvent): NormalizedEvent {
  const allDay = event.allDay ?? (typeof event.start === 'string' && DATE_ONLY.test(event.start));
  let start = toDayjs(dayjs, event.start);
  let end = event.end === undefined ? undefined : toDayjs(dayjs, event.end);
  if (allDay) {
    start = start.startOf('day');
    // all-day end is exclusive; a missing end means a single day
    end = end ? end.startOf('day') : start.add(1, 'day');
    if (!end.isAfter(start)) end = start.add(1, 'day');
  } else if (!end || !end.isAfter(start)) {
    end = start.add(end ? 0 : 1, 'hour');
  }
  return { source: event, id: event.id, start, end, allDay };
}

/** Events that overlap [range.start, range.end). */
export function eventsInRange(events: NormalizedEvent[], range: DateRange): NormalizedEvent[] {
  return events.filter(e => e.start.isBefore(range.end) && e.end.isAfter(range.start));
}

export function getViewRange(view: CalendarViewName, date: Dayjs, firstDay = 0): DateRange {
  const weekStart = (d: Dayjs) => d.subtract((d.day() - firstDay + 7) % 7, 'day').startOf('day');
  switch (view) {
    case 'dayGridMonth': {
      const first = weekStart(date.startOf('month'));
      const last = weekStart(date.endOf('month')).add(7, 'day');
      return { start: first, end: last };
    }
    case 'dayGridWeek':
    case 'timeGridWeek':
    case 'listWeek':
      return { start: weekStart(date), end: weekStart(date).add(7, 'day') };
    case 'dayGridDay':
    case 'timeGridDay':
    case 'listDay':
      return { start: date.startOf('day'), end: date.startOf('day').add(1, 'day') };
    case 'listMonth':
      return { start: date.startOf('month'), end: date.startOf('month').add(1, 'month') };
    case 'listYear':
    case 'multiMonthYear':
    case 'multiMonthStack':
      return { start: date.startOf('year'), end: date.startOf('year').add(1, 'year') };
    case 'multiMonthContinuous':
      return { start: weekStart(date.startOf('year')), end: weekStart(date.endOf('year')).add(7, 'day') };
  }
}

/** Step used by prev/next for a given view. */
export function stepDate(view: CalendarViewName, date: Dayjs, dir: 1 | -1): Dayjs {
  if (view.endsWith('Month') || view === 'dayGridMonth') return date.add(dir, 'month');
  if (view.endsWith('Week')) return date.add(dir, 'week');
  if (view.endsWith('Day')) return date.add(dir, 'day');
  return date.add(dir, 'year');
}

export function getViewTitle(view: CalendarViewName, date: Dayjs, range: DateRange): string {
  switch (view) {
    case 'dayGridMonth':
    case 'listMonth':
      return date.format('MMMM YYYY');
    case 'dayGridWeek':
    case 'timeGridWeek':
    case 'listWeek': {
      const s = range.start;
      const e = range.end.subtract(1, 'day');
      if (s.year() !== e.year()) return `${s.format('MMM D, YYYY')} – ${e.format('MMM D, YYYY')}`;
      if (s.month() !== e.month()) return `${s.format('MMM D')} – ${e.format('MMM D, YYYY')}`;
      return `${s.format('MMM D')} – ${e.format('D, YYYY')}`;
    }
    case 'dayGridDay':
    case 'timeGridDay':
    case 'listDay':
      return date.format('dddd, MMMM D, YYYY');
    default:
      return date.format('YYYY');
  }
}

/** Parse 'HH:mm' (or 'HH:mm:ss') into minutes since midnight. */
export function parseTime(value: string): number {
  const [h = '0', m = '0'] = value.split(':');
  return Number(h) * 60 + Number(m);
}

export const isSameDay = (a: Dayjs, b: Dayjs) => a.isSame(b, 'day');

/** Days of a range, optionally dropping weekends. */
export function listDays(range: DateRange, weekends = true): Dayjs[] {
  const days: Dayjs[] = [];
  for (let d = range.start; d.isBefore(range.end); d = d.add(1, 'day')) {
    if (weekends || (d.day() !== 0 && d.day() !== 6)) days.push(d);
  }
  return days;
}

/**
 * Stack events into columns so overlapping ones sit side by side (time grid) or on separate rows (day grid).
 * Returns, for each event, its lane index and the number of lanes in its overlap cluster.
 */
export function layoutLanes<T extends { start: Dayjs; end: Dayjs }>(items: T[]) {
  const sorted = [...items].sort((a, b) => a.start.valueOf() - b.start.valueOf() || b.end.valueOf() - a.end.valueOf());
  const result: { item: T; lane: number; lanes: number }[] = [];
  let cluster: { item: T; lane: number; lanes: number }[] = [];
  let laneEnds: number[] = [];
  let clusterEnd = -Infinity;
  const flush = () => {
    for (const r of cluster) r.lanes = laneEnds.length;
    result.push(...cluster);
    cluster = [];
    laneEnds = [];
  };
  for (const item of sorted) {
    if (item.start.valueOf() >= clusterEnd) flush();
    let lane = laneEnds.findIndex(end => end <= item.start.valueOf());
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(0);
    }
    laneEnds[lane] = item.end.valueOf();
    clusterEnd = Math.max(clusterEnd, item.end.valueOf());
    cluster.push({ item, lane, lanes: 0 });
  }
  flush();
  return result;
}
