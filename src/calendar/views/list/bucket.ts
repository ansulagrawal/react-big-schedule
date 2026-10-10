import type { Dayjs } from 'dayjs';
import type { DateRange } from '../../types';
import type { NormalizedEvent } from '../../utils';

export const dayKey = (d: Dayjs) => d.format('YYYY-MM-DD');

const visible = (e: NormalizedEvent) => e.source.display !== 'background' && e.source.display !== 'none';

/** Bucket events by every day they cover inside `range` (all-day first, then by start). O(events x days covered). */
export function bucketByDay(events: NormalizedEvent[], range: DateRange): Map<string, NormalizedEvent[]> {
  const map = new Map<string, NormalizedEvent[]>();
  for (const e of events) {
    if (!visible(e) || !e.start.isBefore(range.end) || !e.end.isAfter(range.start)) continue;
    let d = e.start.isAfter(range.start) ? e.start.startOf('day') : range.start;
    for (; d.isBefore(e.end) && d.isBefore(range.end); d = d.add(1, 'day')) {
      const key = dayKey(d);
      const list = map.get(key);
      if (list) list.push(e);
      else map.set(key, [e]);
    }
  }
  for (const list of map.values()) {
    list.sort((a, b) => Number(b.allDay) - Number(a.allDay) || a.start.valueOf() - b.start.valueOf());
  }
  return map;
}

/** "9:00 AM – 10:00 AM", "all-day" or a clipped range for the given day of a multi-day event. */
export function timeText(e: NormalizedEvent, day: Dayjs, fmt = 'h:mm A'): string {
  if (e.allDay) return 'all-day';
  const startsToday = e.start.isSame(day, 'day');
  const endsToday = !e.end.isAfter(day.add(1, 'day').startOf('day'));
  if (startsToday && endsToday) return `${e.start.format(fmt)} – ${e.end.format(fmt)}`;
  if (startsToday) return `${e.start.format(fmt)} –`;
  if (endsToday) return `– ${e.end.format(fmt)}`;
  return 'all-day';
}
