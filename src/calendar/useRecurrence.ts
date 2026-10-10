import { useEffect, useMemo, useState } from 'react';
import type { LocaleDayjs } from '../types';
import type { CalendarEvent, DateRange } from './types';

type Engine = typeof import('./recurrence');

/** Expand recurring events for `range`. The (rrule-sized) engine loads on first use; until then recurring events are held back. */
export function useRecurrence(events: CalendarEvent[], range: DateRange, dayjs: LocaleDayjs): CalendarEvent[] {
  const needed = useMemo(() => events.some(e => e.rrule || e.recurrence), [events]);
  const [engine, setEngine] = useState<Engine>();
  useEffect(() => {
    if (needed && !engine) import('./recurrence').then(setEngine);
  }, [needed, engine]);
  return useMemo(() => {
    if (!needed) return events;
    return engine ? engine.expandRecurring(events, range, dayjs) : events.filter(e => !e.rrule && !e.recurrence);
  }, [events, needed, engine, range.start.valueOf(), range.end.valueOf(), dayjs]);
}
