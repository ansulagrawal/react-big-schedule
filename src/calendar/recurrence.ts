import type { Dayjs } from 'dayjs';
import { rrulestr } from 'rrule';
import type { LocaleDayjs } from '../types';
import type { CalendarEvent, DateRange } from './types';
import { normalizeEvent, parseTime, toDayjs } from './utils';

const MAX_PER_EVENT = 2000;
const DAY = 86400000;

export const isRecurring = (e: CalendarEvent) => Boolean(e.rrule || e.recurrence);

// rrule computes in UTC fields; feed it wall-clock fields as if they were UTC ("floating" time) so DST and zones stay right
const toFloating = (d: Dayjs) => new Date(Date.UTC(d.year(), d.month(), d.date(), d.hour(), d.minute(), d.second()));
const fromFloating = (dayjs: LocaleDayjs, d: Date) => dayjs(d.toISOString().slice(0, 19));

function occurrence(ev: CalendarEvent, start: Dayjs, end: Dayjs, allDay: boolean): CalendarEvent {
  const { rrule: _r, recurrence: _c, exceptions: _x, ...rest } = ev;
  const fmt = (d: Dayjs) => (allDay ? d.format('YYYY-MM-DD') : d.format());
  return {
    ...rest,
    id: `${ev.id}:${start.format()}`,
    start: fmt(start),
    end: fmt(end),
    allDay,
    extendedProps: { ...ev.extendedProps, recurringId: ev.id },
  };
}

function rruleStarts(dayjs: LocaleDayjs, ev: CalendarEvent, start: Dayjs, from: Dayjs, to: Dayjs): Dayjs[] {
  // bare "FREQ=..." lines need their RRULE: prefix for set parsing
  const text = (ev.rrule as string)
    .split(/\r?\n/)
    .map(l => (/^(RRULE|EXRULE|DTSTART|EXDATE|RDATE)/i.test(l.trim()) ? l.trim() : `RRULE:${l.trim()}`))
    .join('\n');
  const dtstart = `DTSTART:${toFloating(start)
    .toISOString()
    .replace(/[-:]|\.\d{3}/g, '')}`;
  const set = rrulestr(/^DTSTART/im.test(text) ? text : `${dtstart}\n${text}`, { forceset: true });
  return set
    .between(toFloating(from), toFloating(to), true)
    .slice(0, MAX_PER_EVENT)
    .map(d => fromFloating(dayjs, d));
}

function simpleStarts(
  dayjs: LocaleDayjs,
  ev: CalendarEvent,
  from: Dayjs,
  to: Dayjs,
): { start: Dayjs; end?: Dayjs; allDay: boolean }[] {
  const r = ev.recurrence;
  if (!r) return [];
  const days = new Set(r.daysOfWeek);
  const lo = r.startRecur === undefined ? undefined : toDayjs(dayjs, r.startRecur).startOf('day');
  const hi = r.endRecur === undefined ? undefined : toDayjs(dayjs, r.endRecur).startOf('day');
  const out: { start: Dayjs; end?: Dayjs; allDay: boolean }[] = [];
  for (let d = from.startOf('day'); d.isBefore(to) && out.length < MAX_PER_EVENT; d = d.add(1, 'day')) {
    if (!days.has(d.day()) || (lo && d.isBefore(lo)) || (hi && !d.isBefore(hi))) continue;
    if (r.startTime === undefined) {
      out.push({ start: d, allDay: true });
      continue;
    }
    const at = (t: string) => d.add(parseTime(t), 'minute');
    out.push({ start: at(r.startTime), end: r.endTime === undefined ? undefined : at(r.endTime), allDay: false });
  }
  return out;
}

/**
 * Replace recurring events by their occurrences inside `range`; other events pass through untouched.
 * Cost is proportional to the visible range, never to the length of the recurrence.
 */
export function expandRecurring(events: CalendarEvent[], range: DateRange, dayjs: LocaleDayjs): CalendarEvent[] {
  const out: CalendarEvent[] = [];
  for (const ev of events) {
    if (!isRecurring(ev)) {
      out.push(ev);
      continue;
    }
    const base = normalizeEvent(dayjs, ev);
    const dur = base.end.diff(base.start);
    const skip = new Set(
      (ev.exceptions ?? []).map(x => {
        const d = toDayjs(dayjs, x);
        return base.allDay ? d.format('YYYY-MM-DD') : String(d.valueOf());
      }),
    );
    const isSkipped = (s: Dayjs) => skip.has(base.allDay ? s.format('YYYY-MM-DD') : String(s.valueOf()));
    const span = (s: Dayjs) =>
      base.allDay ? s.add(Math.max(1, Math.round(dur / DAY)), 'day') : s.add(dur, 'millisecond');
    const from = range.start.subtract(dur, 'millisecond');
    if (ev.rrule) {
      for (const s of rruleStarts(dayjs, ev, base.start, from, range.end)) {
        if (!isSkipped(s)) out.push(occurrence(ev, s, span(s), base.allDay));
      }
    }
    for (const o of simpleStarts(dayjs, ev, from, range.end)) {
      const s = o.start;
      const e = o.end?.isAfter(s) ? o.end : o.allDay ? s.add(Math.max(1, Math.round(dur / DAY)), 'day') : span(s);
      if (!isSkipped(s) && e.isAfter(range.start)) out.push(occurrence(ev, s, e, o.allDay));
    }
  }
  return out;
}
