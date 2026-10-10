import type { Dayjs } from 'dayjs';
import {
  type CSSProperties,
  memo,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { CalendarEvent, CalendarViewName, EventContentArg } from '../../types';
import { layoutLanes, type NormalizedEvent } from '../../utils';
import type { DayData, Seg } from './model';

export interface Geometry {
  minMin: number;
  maxMin: number;
  slotDur: number;
  slotH: number;
  ppm: number;
}

export interface EventRender {
  view: CalendarViewName;
  timeFormat: string;
  eventContent?: (arg: EventContentArg) => ReactNode;
  eventClassNames?: (arg: EventContentArg) => string | string[];
  now: Dayjs;
}

export interface Ghost {
  ev: NormalizedEvent;
  sMin: number;
  eMin: number;
}

export interface DayColumnProps {
  data: DayData;
  dayIdx: number;
  isToday: boolean;
  geo: Geometry;
  render: EventRender;
  /** Minutes since midnight, only on today's column. */
  nowMin: number | null;
  selStart: number | null;
  selEnd: number | null;
  ghost: Ghost | null;
  /** Editability resolved by the view: [startEditable, durationEditable]. */
  canEdit: (e: CalendarEvent) => [boolean, boolean];
  onSlotDown: (e: ReactPointerEvent, dayIdx: number) => void;
  onEventDown: (e: ReactPointerEvent, ev: NormalizedEvent, dayIdx: number) => void;
  onResizeDown: (e: ReactPointerEvent, ev: NormalizedEvent, dayIdx: number) => void;
  onEventActivate: (e: MouseEvent, ev: NormalizedEvent) => void;
  onSlotActivate: (date: Dayjs) => void;
}

export function eventArg(r: EventRender, ev: NormalizedEvent, isStart: boolean, isEnd: boolean): EventContentArg {
  const fmt = (d: Dayjs) => d.format(r.timeFormat);
  return {
    event: ev.source,
    view: r.view,
    timeText: ev.allDay ? '' : `${fmt(ev.start)} - ${fmt(ev.end)}`,
    isStart,
    isEnd,
    isPast: ev.end.isBefore(r.now),
    isFuture: ev.start.isAfter(r.now),
    isToday: ev.start.isSame(r.now, 'day'),
  };
}

export const joinClasses = (...parts: (string | string[] | undefined | false)[]) =>
  parts.flat().filter(Boolean).join(' ');

export const eventStyle = (ev: NormalizedEvent): CSSProperties => ({
  background: ev.source.color ?? 'var(--rbs-accent)',
  color: ev.source.textColor ?? 'var(--rbs-event-fg)',
});

function EventBody({ arg, render }: { arg: EventContentArg; render: EventRender }) {
  if (render.eventContent) return <>{render.eventContent(arg)}</>;
  return (
    <>
      {arg.timeText && <div className="rbs-tg-ev-time">{arg.timeText}</div>}
      <div className="rbs-tg-ev-title">{arg.event.title}</div>
    </>
  );
}

function DayColumn({
  data,
  dayIdx,
  isToday,
  geo,
  render,
  nowMin,
  selStart,
  selEnd,
  ghost,
  canEdit,
  onSlotDown,
  onEventDown,
  onResizeDown,
  onEventActivate,
  onSlotActivate,
}: DayColumnProps) {
  const { minMin, maxMin, slotDur, slotH, ppm } = geo;
  const y = (min: number) => (min - minMin) * ppm;
  const [kb, setKb] = useState<number | null>(null);
  const kbRef = useRef<HTMLDivElement>(null);

  const laid = useMemo(() => layoutLanes(data.segs), [data.segs]);
  const hourPx = (60 / slotDur) * slotH;
  const gridStyle: CSSProperties = {
    height: (maxMin - minMin) * ppm,
    backgroundImage:
      'linear-gradient(var(--rbs-border) 1px, transparent 1px), linear-gradient(color-mix(in srgb, var(--rbs-border) 45%, transparent) 1px, transparent 1px)',
    backgroundSize: `100% ${hourPx}px, 100% ${slotH}px`,
    backgroundPosition: `0 ${((60 - (minMin % 60)) % 60) * ppm}px, 0 0`,
  };

  useEffect(() => {
    if (kb !== null) kbRef.current?.scrollIntoView({ block: 'nearest' });
  }, [kb]);

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget || kb === null) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const next = kb + (e.key === 'ArrowDown' ? slotDur : -slotDur);
      setKb(Math.max(minMin, Math.min(maxMin - slotDur, next)));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSlotActivate(data.day.startOf('day').add(kb, 'minute'));
    }
  };

  const label = data.day.format('dddd, MMMM D');
  const kbText = kb === null ? '' : `, ${data.day.startOf('day').add(kb, 'minute').format(render.timeFormat)}`;

  return (
    // biome-ignore lint/a11y/useSemanticElements: ARIA grid cell inside a div-based time grid
    <div
      role="gridcell"
      tabIndex={0}
      aria-label={label + kbText}
      className={joinClasses('rbs-tg-col', isToday && 'rbs-tg-today')}
      style={gridStyle}
      onPointerDown={e => onSlotDown(e, dayIdx)}
      onKeyDown={onKeyDown}
      onFocus={e => {
        if (e.target === e.currentTarget && e.currentTarget.matches(':focus-visible')) {
          setKb(k => k ?? Math.max(minMin, Math.min(maxMin - slotDur, 8 * 60)));
        }
      }}
      onBlur={() => setKb(null)}
    >
      {data.nonBiz.map(([s, e]) => (
        <div key={s} className="rbs-tg-nonbiz" style={{ top: y(s), height: (e - s) * ppm }} />
      ))}
      {data.bgs.map(b => (
        <div
          key={b.id}
          className="rbs-tg-bg"
          style={{ top: y(b.sMin), height: (b.eMin - b.sMin) * ppm, background: b.color ?? 'var(--rbs-accent)' }}
        />
      ))}
      {selStart !== null && selEnd !== null && (
        <div className="rbs-tg-select" style={{ top: y(selStart), height: (selEnd - selStart) * ppm }} />
      )}
      {kb !== null && <div ref={kbRef} className="rbs-tg-kb" style={{ top: y(kb), height: slotH }} />}
      {laid.map(({ item, lane, lanes }) => (
        <EventSeg
          key={`${item.ev.id}-${item.sMin}`}
          seg={item}
          lane={lane}
          lanes={lanes}
          dayIdx={dayIdx}
          geo={geo}
          render={render}
          canEdit={canEdit}
          isToday={isToday}
          onEventDown={onEventDown}
          onResizeDown={onResizeDown}
          onEventActivate={onEventActivate}
        />
      ))}
      {ghost && (
        <div
          className="rbs-tg-ev rbs-tg-ghost"
          style={{
            ...eventStyle(ghost.ev),
            top: y(ghost.sMin),
            height: Math.max((ghost.eMin - ghost.sMin) * ppm, 20),
            left: 0,
            right: 2,
          }}
        >
          <div className="rbs-tg-ev-title">{ghost.ev.source.title}</div>
        </div>
      )}
      {nowMin !== null && nowMin >= minMin && nowMin <= maxMin && (
        <div className="rbs-tg-now" style={{ top: y(nowMin) }} />
      )}
    </div>
  );
}

interface EventSegProps {
  seg: Seg;
  lane: number;
  lanes: number;
  dayIdx: number;
  geo: Geometry;
  render: EventRender;
  isToday: boolean;
  canEdit: DayColumnProps['canEdit'];
  onEventDown: DayColumnProps['onEventDown'];
  onResizeDown: DayColumnProps['onResizeDown'];
  onEventActivate: DayColumnProps['onEventActivate'];
}

function EventSeg({
  seg,
  lane,
  lanes,
  dayIdx,
  geo,
  render,
  canEdit,
  onEventDown,
  onResizeDown,
  onEventActivate,
}: EventSegProps) {
  const { ev } = seg;
  const [startEditable, durationEditable] = canEdit(ev.source);
  const height = Math.max((seg.eMin - seg.sMin) * geo.ppm - 1, 20);
  const arg = eventArg(render, ev, seg.isStart, seg.isEnd);
  const width = 100 / lanes;
  return (
    <button
      type="button"
      data-event-id={String(ev.id)}
      aria-label={`${ev.source.title}, ${arg.timeText}`}
      className={joinClasses(
        'rbs-tg-ev',
        height < 36 && 'rbs-tg-ev-sm',
        !seg.isStart && 'rbs-tg-ev-cont-top',
        !seg.isEnd && 'rbs-tg-ev-cont-bottom',
        startEditable && 'rbs-tg-ev-editable',
        ev.source.classNames,
        render.eventClassNames?.(arg),
      )}
      style={{
        ...eventStyle(ev),
        top: (seg.sMin - geo.minMin) * geo.ppm,
        height,
        left: `${lane * width}%`,
        width: `calc(${width}% - 2px)`,
        zIndex: lane + 1,
      }}
      onPointerDown={e => onEventDown(e, ev, dayIdx)}
      onClick={e => onEventActivate(e.nativeEvent, ev)}
    >
      <EventBody arg={arg} render={render} />
      {seg.isEnd && durationEditable && (
        <span className="rbs-tg-resize" onPointerDown={e => onResizeDown(e, ev, dayIdx)} />
      )}
    </button>
  );
}

export default memo(DayColumn);
