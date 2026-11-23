import type { CSSProperties } from 'react';
import { memo } from 'react';
import type { CalendarOptions, CalendarViewName, EventContentArg } from '../../types';
import { readableText, tipText } from '../../utils';
import type { PEvent } from './layout';

const KEY_HINT = 'Alt plus arrow keys moves the event, Shift plus left or right arrow changes its length';

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
  /** Keyboard move / resize by whole days (Alt+arrows / Shift+arrows). */
  onNudge?: (ev: PEvent, kind: 'move' | 'resize', days: number) => void;
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
  onNudge,
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
    ...(src.textColor || readableText(src.color) ? { '--rbs-ev-fg': src.textColor ?? readableText(src.color) } : null),
  } as CSSProperties;
  // the accessible name starts with the visible text (WCAG 2.5.3), then adds what the chip leaves implicit
  const label = eventContent
    ? undefined
    : `${timeText ? `${timeText} ` : ''}${src.title}${ne.allDay ? ', all day' : ''}`;

  return (
    <button
      type="button"
      className={cls}
      style={style}
      data-eid={String(ne.id)}
      data-drag={col === undefined ? undefined : ''}
      aria-label={label}
      aria-description={canMove || canResize ? KEY_HINT : undefined}
      onKeyDown={e => {
        if (!onNudge) return;
        const days = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
        if (!days) return;
        if (e.altKey && canMove) {
          e.preventDefault();
          onNudge(ev, 'move', days);
        } else if (e.shiftKey && canResize && Math.abs(days) === 1) {
          e.preventDefault();
          onNudge(ev, 'resize', days);
        }
      }}
      data-tip={tipText(ne)}
      data-tip-color={src.color}
    >
      {eventContent ? (
        eventContent(arg)
      ) : (
        <>
          {!block && <span className="rbs-dg-dot" />}
          {timeText && (
            <>
              <span className="rbs-dg-time">{timeText}</span>{' '}
            </>
          )}
          <span className="rbs-dg-title">{src.title}</span>
        </>
      )}
      {canResize && block && isEnd && <span className="rbs-dg-resizer" data-resize="" />}
    </button>
  );
}

export default memo(EventChip);
