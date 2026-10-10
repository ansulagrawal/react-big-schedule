import type { Dayjs } from 'dayjs';
import { type CSSProperties, memo } from 'react';
import { tipText } from '../../utils';
import { dayKey } from '../list/bucket';
import { dayTip, dayTitle, MAX_CHIPS, type MonthShared } from './shared';

interface CellProps {
  day: Dayjs;
  shared: MonthShared;
  tabbable: boolean;
  /** day belongs to another month (continuous mode tints, never hides) */
  alt?: boolean;
}

function Cell({ day, shared, tabbable, alt }: CellProps) {
  const {
    buckets,
    bgBuckets,
    today,
    compact,
    view,
    onDateClick,
    onEventClick,
    goTo,
    eventClassNames,
    eventContent,
    dayCellClassNames,
  } = shared;
  const list = buckets.get(dayKey(day));
  const bg = bgBuckets.get(dayKey(day))?.[0]?.source;
  const isToday = day.isSame(today, 'day');
  const extra = dayCellClassNames?.({ date: day, isToday, isOther: false });
  const extraCls = Array.isArray(extra) ? extra.join(' ') : (extra ?? '');
  const cls = `rbs-mm-cell${isToday ? ' rbs-mm-today' : ''}${list ? ' rbs-mm-busy' : ''}${alt ? ' rbs-mm-alt' : ''}${bg ? ' rbs-mm-bg' : ''} ${extraCls}`;
  const nowD = today;

  return (
    // biome-ignore lint/a11y/useSemanticElements: ARIA grid cell
    <div
      role="gridcell"
      className={cls}
      data-day={dayKey(day)}
      style={bg ? ({ '--rbs-bg': bg.color ?? 'var(--rbs-accent)' } as CSSProperties) : undefined}
      tabIndex={tabbable ? 0 : -1}
      data-tip={dayTip(day, list)}
      aria-label={dayTitle(day, list)}
      aria-current={isToday ? 'date' : undefined}
      onClick={ev => onDateClick?.({ date: day, allDay: true, jsEvent: ev })}
      onKeyDown={ev => {
        if (ev.key === 'Enter' && ev.target === ev.currentTarget) {
          onDateClick?.({ date: day, allDay: true, jsEvent: ev as unknown as MouseEvent });
        }
      }}
    >
      <span className="rbs-mm-num">{day.date()}</span>
      {list && compact && <span className="rbs-mm-dot" />}
      {list && !compact && (
        <span className="rbs-mm-chips">
          {list.slice(0, MAX_CHIPS).map(e => {
            const isStart = e.start.isSame(day, 'day');
            const arg = {
              event: e.source,
              view,
              timeText: e.allDay ? '' : e.start.format('h:mma'),
              isStart,
              isEnd: !e.end.isAfter(day.add(1, 'day')),
              isPast: e.end.isBefore(nowD),
              isFuture: e.start.isAfter(nowD),
              isToday,
            };
            const ec = eventClassNames?.(arg);
            return (
              <button
                type="button"
                key={e.id}
                tabIndex={-1}
                data-tip={tipText(e)}
                data-tip-color={e.source.color}
                className={`rbs-mm-chip ${(e.source.classNames ?? []).join(' ')} ${Array.isArray(ec) ? ec.join(' ') : (ec ?? '')}`}
                style={{
                  background: e.source.color ?? 'var(--rbs-accent)',
                  color: e.source.textColor ?? 'var(--rbs-event-fg)',
                }}
                onClick={ev => {
                  ev.stopPropagation();
                  onEventClick?.({ event: e.source, jsEvent: ev });
                }}
              >
                {eventContent ? eventContent(arg) : e.source.title}
              </button>
            );
          })}
          {list.length > MAX_CHIPS && (
            <button
              type="button"
              tabIndex={-1}
              className="rbs-mm-more"
              onClick={ev => {
                ev.stopPropagation();
                goTo('dayGridDay', day);
              }}
            >
              +{list.length - MAX_CHIPS} more
            </button>
          )}
        </span>
      )}
    </div>
  );
}

export default memo(Cell);
