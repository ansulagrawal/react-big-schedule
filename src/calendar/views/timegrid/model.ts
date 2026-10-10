import type { Dayjs } from 'dayjs';
import type { BusinessHours, CalendarEvent } from '../../types';
import { type NormalizedEvent, parseTime } from '../../utils';

/** The slice of a timed event that falls inside one day column. */
export interface Seg {
  ev: NormalizedEvent;
  start: Dayjs;
  end: Dayjs;
  /** Minutes since the start of the day. */
  sMin: number;
  eMin: number;
  isStart: boolean;
  isEnd: boolean;
}

export interface BgSeg {
  id: CalendarEvent['id'];
  color?: string;
  sMin: number;
  eMin: number;
}

export interface DayData {
  day: Dayjs;
  segs: Seg[];
  bgs: BgSeg[];
  /** Minute ranges shaded as non-business time. */
  nonBiz: [number, number][];
}

export interface AllDayBar {
  ev: NormalizedEvent;
  /** Visible column indexes, inclusive. */
  si: number;
  ei: number;
  lane: number;
  isStart: boolean;
  isEnd: boolean;
}

export const DEFAULT_BUSINESS: Required<BusinessHours> = {
  daysOfWeek: [1, 2, 3, 4, 5],
  startTime: '09:00',
  endTime: '17:00',
};

export const isHidden = (e: NormalizedEvent) => e.source.display === 'none';
export const isBackground = (e: NormalizedEvent) => e.source.display === 'background';

export function buildDays(
  days: Dayjs[],
  events: NormalizedEvent[],
  minMin: number,
  maxMin: number,
  businessHours: boolean | BusinessHours | undefined,
): DayData[] {
  const bh = businessHours ? { ...DEFAULT_BUSINESS, ...(businessHours === true ? {} : businessHours) } : null;
  return days.map(day => {
    const base = day.startOf('day');
    const wStart = base.add(minMin, 'minute');
    const wEnd = base.add(maxMin, 'minute');
    const dayEnd = base.add(1, 'day');
    const segs: Seg[] = [];
    const bgs: BgSeg[] = [];
    for (const ev of events) {
      if (isHidden(ev) || !ev.start.isBefore(wEnd) || !ev.end.isAfter(wStart)) continue;
      const start = ev.start.isAfter(wStart) ? ev.start : wStart;
      const end = ev.end.isBefore(wEnd) ? ev.end : wEnd;
      const sMin = start.diff(base, 'minute');
      const eMin = end.diff(base, 'minute');
      if (isBackground(ev)) {
        bgs.push({
          id: ev.id,
          color: ev.source.color,
          sMin: ev.allDay ? minMin : sMin,
          eMin: ev.allDay ? maxMin : eMin,
        });
      } else if (!ev.allDay) {
        segs.push({ ev, start, end, sMin, eMin, isStart: !ev.start.isBefore(base), isEnd: !ev.end.isAfter(dayEnd) });
      }
    }
    const nonBiz: [number, number][] = [];
    if (bh) {
      const bs = parseTime(bh.startTime);
      const be = parseTime(bh.endTime);
      if (!bh.daysOfWeek.includes(day.day())) nonBiz.push([minMin, maxMin]);
      else {
        if (bs > minMin) nonBiz.push([minMin, Math.min(bs, maxMin)]);
        if (be < maxMin) nonBiz.push([Math.max(be, minMin), maxMin]);
      }
    }
    return { day, segs, bgs, nonBiz };
  });
}

/** Clip all-day events to the visible columns and stack them into lanes. */
export function buildAllDayBars(days: Dayjs[], events: NormalizedEvent[]): { bars: AllDayBar[]; lanes: number } {
  const bars: AllDayBar[] = [];
  for (const ev of events) if (ev.allDay && !isHidden(ev) && !isBackground(ev)) addBar(bars, days, ev);
  bars.sort((a, b) => a.si - b.si || b.ei - b.si - (a.ei - a.si));
  const laneEnds: number[] = [];
  for (const b of bars) {
    let lane = laneEnds.findIndex(end => end < b.si);
    if (lane === -1) lane = laneEnds.length;
    laneEnds[lane] = b.ei;
    b.lane = lane;
  }
  return { bars, lanes: laneEnds.length };
}

/** Column span of an event over the visible days, or null when it is outside them. */
export function spanOf(days: Dayjs[], ev: { start: Dayjs; end: Dayjs }): { si: number; ei: number } | null {
  let si = -1;
  let ei = -1;
  days.forEach((d, i) => {
    if (d.startOf('day').isBefore(ev.end) && d.startOf('day').add(1, 'day').isAfter(ev.start)) {
      if (si === -1) si = i;
      ei = i;
    }
  });
  return si === -1 ? null : { si, ei };
}

function addBar(bars: AllDayBar[], days: Dayjs[], ev: NormalizedEvent) {
  const span = spanOf(days, ev);
  if (!span) return;
  bars.push({
    ev,
    ...span,
    lane: 0,
    isStart: !ev.start.isBefore(days[span.si].startOf('day')),
    isEnd: !ev.end.isAfter(days[span.ei].startOf('day').add(1, 'day')),
  });
}

/** ISO 8601 week number. */
export function isoWeek(d: Dayjs): number {
  const date = new Date(Date.UTC(d.year(), d.month(), d.date()));
  const dow = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dow);
  const yearStart = Date.UTC(date.getUTCFullYear(), 0, 1);
  return Math.ceil(((date.getTime() - yearStart) / 86400000 + 1) / 7);
}
