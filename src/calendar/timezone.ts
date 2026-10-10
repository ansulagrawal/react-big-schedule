import type { DateInput, LocaleDayjs } from '../types';

// "2024-03-01T10:00:00Z", "...+05:30" (a date-only string never matches: it needs a time part)
const HAS_OFFSET = /\d[T ]\d.*(?:[zZ]|[+-]\d{2}(?::?\d{2})?)$/;

/**
 * Bind a locale dayjs to a time zone. Instants (offset strings, Dates, timestamps, Dayjs) are converted to the zone;
 * offset-less strings are read as wall-clock time in it.
 */
export function withTimeZone(base: LocaleDayjs, zone: string | undefined): LocaleDayjs {
  if (!zone || zone === 'local') return base;
  const create = (date?: DateInput, format?: string, strict?: boolean) =>
    typeof date === 'string' && !format && !HAS_OFFSET.test(date)
      ? base.tz(date, zone)
      : base(date, format, strict).tz(zone);
  return Object.assign(create, { locale: base.locale, utc: base.utc, tz: base.tz }) as LocaleDayjs;
}
