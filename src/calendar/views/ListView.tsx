import { type KeyboardEvent, memo, useCallback, useMemo } from 'react';
import type { CalendarViewProps, EventContentArg } from '../types';
import { getViewRange, normalizeEvent } from '../utils';
import { bucketByDay, dayKey, timeText } from './list/bucket';

function onListKey(e: KeyboardEvent<HTMLElement>) {
  const step = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;
  if (!step) return;
  const rows = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('.rbs-ls-row'));
  const i = rows.indexOf(document.activeElement as HTMLElement);
  const next = rows[Math.max(0, Math.min(rows.length - 1, i + step))];
  if (next) {
    e.preventDefault();
    next.focus();
  }
}

function ListView({
  view,
  date,
  events,
  dayjs,
  firstDay = 0,
  eventTimeFormat,
  eventContent,
  eventClassNames,
  noEventsContent,
  onEventClick,
  onNavLinkDayClick,
  goTo,
  className,
}: CalendarViewProps) {
  const range = useMemo(() => getViewRange(view, date, firstDay), [view, date, firstDay]);
  const normalized = useMemo(
    () => events.filter(e => e.display !== 'background' && e.display !== 'none').map(e => normalizeEvent(dayjs, e)),
    [events, dayjs],
  );
  const buckets = useMemo(() => bucketByDay(normalized, range), [normalized, range]);
  const days = useMemo(() => {
    const out = [];
    for (let d = range.start; d.isBefore(range.end); d = d.add(1, 'day')) if (buckets.has(dayKey(d))) out.push(d);
    return out;
  }, [range, buckets]);
  const now = useMemo(() => dayjs(), [dayjs]);
  const navTo = useCallback(
    (d: ReturnType<typeof dayjs>) => (onNavLinkDayClick ? onNavLinkDayClick(d) : goTo('timeGridDay', d)),
    [onNavLinkDayClick, goTo],
  );

  if (days.length === 0) {
    return <div className="rbs-ls rbs-ls-empty">{noEventsContent ?? 'No events to display'}</div>;
  }

  return (
    // biome-ignore lint/a11y/useSemanticElements: nested list of day groups
    <div className={`rbs-ls ${className ?? ''}`} role="list" aria-label="Events" onKeyDown={onListKey}>
      {days.map(day => {
        const isToday = day.isSame(now, 'day');
        return (
          // biome-ignore lint/a11y/useSemanticElements: nested list of day groups
          <div className="rbs-ls-day" role="listitem" key={dayKey(day)}>
            <h3 className={`rbs-ls-heading${isToday ? ' rbs-ls-today' : ''}`}>
              <button type="button" className="rbs-ls-nav" onClick={() => navTo(day)}>
                {day.format('dddd, MMM D')}
              </button>
            </h3>
            <ul className="rbs-ls-rows">
              {(buckets.get(dayKey(day)) ?? []).map(e => {
                const isStart = e.start.isSame(day, 'day');
                const isEnd = !e.end.isAfter(day.add(1, 'day'));
                const isPast = e.end.isBefore(now);
                const tt = timeText(e, day, eventTimeFormat);
                const arg: EventContentArg = {
                  event: e.source,
                  view,
                  timeText: tt,
                  isStart,
                  isEnd,
                  isPast,
                  isFuture: e.start.isAfter(now),
                  isToday,
                };
                const extra = eventClassNames?.(arg);
                const cls = [...(e.source.classNames ?? []), ...(Array.isArray(extra) ? extra : extra ? [extra] : [])];
                return (
                  <li key={`${e.id}-${dayKey(day)}`}>
                    <button
                      type="button"
                      className={`rbs-ls-row${isPast ? ' rbs-ls-past' : ''} ${cls.join(' ')}`}
                      onClick={ev => onEventClick?.({ event: e.source, jsEvent: ev })}
                    >
                      {eventContent ? (
                        eventContent(arg)
                      ) : (
                        <>
                          <span className="rbs-ls-time">{tt}</span>
                          <span className="rbs-ls-dot" style={{ background: e.source.color ?? 'var(--rbs-accent)' }} />
                          <span className="rbs-ls-title">
                            {e.source.title}
                            {!isStart && <span className="rbs-ls-cont"> (cont.)</span>}
                          </span>
                        </>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

export default memo(ListView);
