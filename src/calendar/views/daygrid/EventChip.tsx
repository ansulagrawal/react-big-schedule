import type { CSSProperties } from 'react';
import { memo } from 'react';
import type { CalendarOptions, CalendarViewName, EventContentArg } from '../../types';
import { tipText } from '../../utils';
import type { PEvent } from './layout';

export interface ChipProps extends Pick<CalendarOptions, 'eventContent' | 'eventClassNames' | 'eventTimeFormat'> {
  ev: PEvent;
  view: CalendarViewName;
  isStart: boolean;
  isEnd: boolean;
  /** Grid placement inside the week layer; omitted in the "+N more" popover. */
  col?: number;
  span?: number;
  lane?: number;
  canMove?: boolean;
  canResize?: boolean;
  dragging?: boolean;
  now: number;
}

function EventChip({
  ev,
  view,
  isStart,
  isEnd,
  col,
  span = 1,
  lane = 0,
  canMove,
  canResize,
  dragging,
  now,
  eventContent,
  eventClassNames,
  eventTimeFormat,
}: ChipProps) {
  const { ne } = ev;
  const src = ne.source;
  const block = src.display !== 'list-item' && (src.display === 'block' || ne.allDay || ev.sVal !== ev.eVal);
  const timeText = !ne.allDay && isStart ? ne.start.format(eventTimeFormat ?? 'HH:mm') : '';
  const arg: EventContentArg = {
    event: src,
    view,
    timeText,
    isStart,
    isEnd,
    isPast: ne.end.valueOf() <= now,
    isFuture: ne.start.valueOf() > now,
    isToday: ev.sVal <= now && now < ev.eVal + 86400000,
  };
  const extra = eventClassNames?.(arg) ?? [];
  const cls = [
    'rbs-dg-ev',
    block ? 'rbs-dg-ev--block' : 'rbs-dg-ev--dot',
    !isStart && 'rbs-dg-ev--cont-l',
    !isEnd && 'rbs-dg-ev--cont-r',
    dragging && 'rbs-dg-ev--dragging',
    canMove && 'rbs-dg-ev--movable',
    ...(src.classNames ?? []),
    ...(Array.isArray(extra) ? extra : [extra]),
  ]
    .filter(Boolean)
    .join(' ');
  const style: CSSProperties = {
    ...(col === undefined ? null : { gridColumn: `${col + 1} / span ${span}`, gridRow: lane + 1 }),
    ...(src.color ? { '--rbs-ev': src.color } : null),
    ...(src.textColor ? { '--rbs-ev-fg': src.textColor } : null),
  } as CSSProperties;
  const label = `${src.title}, ${ne.allDay ? 'all day' : ne.start.format(eventTimeFormat ?? 'HH:mm')}`;

  return (
    <button
      type="button"
      className={cls}
      style={style}
      data-eid={String(ne.id)}
      data-drag={col === undefined ? undefined : ''}
      aria-label={label}
      data-tip={tipText(ne)}
      data-tip-color={src.color}
    >
      {eventContent ? (
        eventContent(arg)
      ) : (
        <>
          {!block && <span className="rbs-dg-dot" />}
          {timeText && <span className="rbs-dg-time">{timeText}</span>}
          <span className="rbs-dg-title">{src.title}</span>
        </>
      )}
      {canResize && block && isEnd && <span className="rbs-dg-resizer" data-resize="" />}
    </button>
  );
}

export default memo(EventChip);
