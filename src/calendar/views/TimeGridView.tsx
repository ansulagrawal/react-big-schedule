import type { Dayjs } from 'dayjs';
import { type PointerEvent as ReactPointerEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CalendarEvent, CalendarViewProps, EventChangeInfo } from '../types';
import { getViewRange, listDays, type NormalizedEvent, normalizeEvent, parseTime } from '../utils';
import DayColumn, { type EventRender, eventArg, eventStyle, joinClasses } from './timegrid/DayColumn';
import { buildAllDayBars, buildDays, isoWeek, spanOf } from './timegrid/model';

const DRAG_THRESHOLD = 4;
const ALLDAY_LANE_H = 20;

interface Hit {
  dayIdx: number;
  allDay: boolean;
  /** Minutes since midnight under the pointer (grid) clamped to the slot window. */
  minute: number;
}

interface Preview {
  ev: NormalizedEvent;
  start: Dayjs;
  end: Dayjs;
  allDay: boolean;
}

type Gesture =
  | { kind: 'slot'; x: number; y: number; moved: boolean; dayIdx: number; allDay: boolean; min0: number }
  | { kind: 'move'; x: number; y: number; moved: boolean; ev: NormalizedEvent; downDay: Dayjs; grab: number }
  | { kind: 'resize'; x: number; y: number; moved: boolean; ev: NormalizedEvent; dayIdx: number };

/** One shared minute timer for the now indicator. */
function useNow(enabled: boolean) {
  const [tick, setTick] = useState(() => Date.now());
  useEffect(() => {
    if (!enabled) return undefined;
    setTick(Date.now());
    const id = setInterval(() => setTick(Date.now()), 60_000);
    return () => clearInterval(id);
  }, [enabled]);
  return tick;
}

const fmtDate = (d: Dayjs) => d.format('YYYY-MM-DD');

function TimeGridView(props: CalendarViewProps) {
  const { view, date, events, dayjs, goTo, editable, firstDay = 0, weekNumbers } = props;
  const isDay = view === 'timeGridDay';
  const slotDur = props.slotDuration ?? 30;
  const slotH = props.slotHeight ?? 28;
  const minMin = parseTime(props.slotMinTime ?? '00:00');
  const maxMin = Math.max(parseTime(props.slotMaxTime ?? '24:00'), minMin + slotDur);
  const ppm = slotH / slotDur;
  const timeFormat = props.eventTimeFormat ?? 'h:mma';

  const propsRef = useRef(props);
  propsRef.current = props;

  const [overrides, setOverrides] = useState<Record<string, CalendarEvent>>({});
  // a new events array from the parent is the source of truth again
  useEffect(() => setOverrides({}), [events]);

  const days = useMemo(
    () => listDays(getViewRange(view, date, firstDay), isDay || (props.weekends ?? true)),
    [view, date, firstDay, isDay, props.weekends],
  );
  const range = useMemo(
    () => ({ start: days[0].startOf('day'), end: days[days.length - 1].add(1, 'day').startOf('day') }),
    [days],
  );

  const normalized = useMemo(
    () =>
      events
        .map(e => normalizeEvent(dayjs, overrides[String(e.id)] ?? e))
        .filter(e => e.start.isBefore(range.end) && e.end.isAfter(range.start)),
    [events, overrides, dayjs, range],
  );
  const dayData = useMemo(
    () => buildDays(days, normalized, minMin, maxMin, props.businessHours),
    [days, normalized, minMin, maxMin, props.businessHours],
  );
  const { bars, lanes } = useMemo(() => buildAllDayBars(days, normalized), [days, normalized]);

  const geo = useMemo(() => ({ minMin, maxMin, slotDur, slotH, ppm }), [minMin, maxMin, slotDur, slotH, ppm]);

  const nowTick = useNow(!!props.nowIndicator);
  const now = useMemo(() => dayjs(nowTick), [dayjs, nowTick]);
  const nowMin = now.hour() * 60 + now.minute();

  const render: EventRender = useMemo(
    () => ({ view, timeFormat, eventContent: props.eventContent, eventClassNames: props.eventClassNames, now }),
    [view, timeFormat, props.eventContent, props.eventClassNames, now],
  );

  const canEdit = useCallback(
    (e: CalendarEvent): [boolean, boolean] => {
      const base = e.editable ?? editable ?? false;
      return [e.startEditable ?? base, e.durationEditable ?? base];
    },
    [editable],
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const colsRef = useRef<HTMLDivElement>(null);
  const allDayRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = Math.max(0, (parseTime(props.scrollTime ?? '08:00') - minMin) * ppm);
  }, [minMin, ppm]);

  // ---- interaction state (only the touched column re-renders) ----
  const [sel, setSel] = useState<{ dayIdx: number; start: number; end: number } | null>(null);
  const [adSel, setAdSel] = useState<{ from: number; to: number } | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const gesture = useRef<Gesture | null>(null);
  const last = useRef<{
    sel?: { dayIdx: number; start: number; end: number };
    adSel?: { from: number; to: number };
    preview?: Preview;
  }>({});
  const cleanup = useRef<(() => void) | null>(null);
  useEffect(() => () => cleanup.current?.(), []);

  const snap = useCallback(
    (m: number, mode: 'floor' | 'ceil' | 'round') => Math[mode](m / slotDur) * slotDur,
    [slotDur],
  );

  const hit = useCallback(
    (x: number, y: number): Hit | null => {
      const cols = colsRef.current?.getBoundingClientRect();
      const ad = allDayRef.current?.getBoundingClientRect();
      if (!cols) return null;
      const dayIdx = Math.max(0, Math.min(days.length - 1, Math.floor(((x - cols.left) / cols.width) * days.length)));
      const allDay = !!ad && y >= ad.top && y <= ad.bottom;
      const minute = Math.max(minMin, Math.min(maxMin, minMin + (y - cols.top) / ppm));
      return { dayIdx, allDay, minute };
    },
    [days.length, minMin, maxMin, ppm],
  );

  const abort = useCallback(() => {
    cleanup.current?.();
    cleanup.current = null;
    gesture.current = null;
    last.current = {};
    for (const el of scrollRef.current?.querySelectorAll('.rbs-tg-dragging') ?? [])
      el.classList.remove('rbs-tg-dragging');
    setSel(null);
    setAdSel(null);
    setPreview(null);
  }, []);

  const emitChange = useCallback((kind: 'drop' | 'resize', p: Preview) => {
    const src = p.ev.source;
    const next: CalendarEvent = p.allDay
      ? { ...src, start: fmtDate(p.start), end: fmtDate(p.end), allDay: true }
      : { ...src, start: p.start.format(), end: p.end.format(), allDay: false };
    const key = String(src.id);
    setOverrides(o => ({ ...o, [key]: next }));
    const info: EventChangeInfo = {
      event: next,
      oldEvent: src,
      revert: () =>
        setOverrides(o => {
          const copy = { ...o };
          delete copy[key];
          return copy;
        }),
    };
    const cb = kind === 'drop' ? propsRef.current.onEventDrop : propsRef.current.onEventResize;
    cb?.(info);
  }, []);

  const onMove = useCallback(
    (e: PointerEvent) => {
      const g = gesture.current;
      if (!g) return;
      if (!g.moved) {
        if (Math.hypot(e.clientX - g.x, e.clientY - g.y) < DRAG_THRESHOLD) return;
        g.moved = true;
      }
      const h = hit(e.clientX, e.clientY);
      if (!h) return;
      if (g.kind === 'slot') {
        if (!propsRef.current.selectable) return;
        if (g.allDay) {
          const s = { from: Math.min(g.dayIdx, h.dayIdx), to: Math.max(g.dayIdx, h.dayIdx) };
          last.current.adSel = s;
          setAdSel(s);
        } else {
          const start = snap(Math.min(g.min0, h.minute), 'floor');
          const end = Math.max(snap(Math.max(g.min0, h.minute), 'ceil'), start + slotDur);
          const s = { dayIdx: g.dayIdx, start, end: Math.min(end, maxMin) };
          last.current.sel = s;
          setSel(s);
        }
      } else if (g.kind === 'move') {
        const [startEditable] = canEdit(g.ev.source);
        if (!startEditable) return;
        const day = days[h.dayIdx];
        const ev = g.ev;
        const ms = ev.end.diff(ev.start);
        let p: Preview;
        if (h.allDay) {
          const start = ev.allDay ? ev.start.add(day.diff(g.downDay, 'day'), 'day') : day.startOf('day');
          const end = ev.allDay ? ev.end.add(day.diff(g.downDay, 'day'), 'day') : start.add(1, 'day');
          p = { ev, start, end, allDay: true };
        } else if (ev.allDay) {
          const start = day.startOf('day').add(snap(h.minute, 'floor'), 'minute');
          p = { ev, start, end: start.add(1, 'hour'), allDay: false };
        } else {
          const raw = day.startOf('day').add(h.minute - g.grab, 'minute');
          const base = raw.startOf('day');
          const start = base.add(snap(raw.diff(base, 'minute'), 'round'), 'minute');
          p = { ev, start, end: start.add(ms, 'millisecond'), allDay: false };
        }
        last.current.preview = p;
        setPreview(p);
      } else {
        const [, durationEditable] = canEdit(g.ev.source);
        if (!durationEditable) return;
        const day = days[g.dayIdx];
        const ev = g.ev;
        const min = snap(h.minute, 'round');
        const minEnd = ev.start.add(slotDur, 'minute');
        let end = day.startOf('day').add(min, 'minute');
        if (end.isBefore(minEnd)) end = minEnd;
        const p = { ev, start: ev.start, end, allDay: false };
        last.current.preview = p;
        setPreview(p);
      }
    },
    [hit, snap, slotDur, maxMin, days, canEdit],
  );

  const begin = useCallback(
    (e: ReactPointerEvent, g: Gesture) => {
      if (e.button !== 0) return;
      cleanup.current?.();
      gesture.current = g;
      last.current = {};
      const onUp = (ev: PointerEvent) => {
        const cur = gesture.current;
        const l = last.current;
        abort();
        if (!cur) return;
        const p = propsRef.current;
        if (cur.kind === 'slot') {
          const day = days[cur.dayIdx];
          if (!cur.moved) {
            const date = cur.allDay ? day.startOf('day') : day.startOf('day').add(snap(cur.min0, 'floor'), 'minute');
            p.onDateClick?.({ date, allDay: cur.allDay, jsEvent: ev });
          } else if (l.adSel) {
            p.onSelect?.({
              start: days[l.adSel.from].startOf('day'),
              end: days[l.adSel.to].add(1, 'day').startOf('day'),
              allDay: true,
            });
          } else if (l.sel) {
            const base = days[l.sel.dayIdx].startOf('day');
            p.onSelect?.({ start: base.add(l.sel.start, 'minute'), end: base.add(l.sel.end, 'minute'), allDay: false });
          }
        } else if (!cur.moved) {
          if (cur.kind === 'move') p.onEventClick?.({ event: cur.ev.source, jsEvent: ev });
        } else if (
          l.preview &&
          !(
            l.preview.start.isSame(cur.ev.start) &&
            l.preview.end.isSame(cur.ev.end) &&
            l.preview.allDay === cur.ev.allDay
          )
        ) {
          emitChange(cur.kind === 'move' ? 'drop' : 'resize', l.preview);
        }
      };
      const onKey = (ev: KeyboardEvent) => ev.key === 'Escape' && abort();
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp, { once: true });
      window.addEventListener('pointercancel', abort, { once: true });
      window.addEventListener('keydown', onKey);
      cleanup.current = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', abort);
        window.removeEventListener('keydown', onKey);
      };
    },
    [abort, onMove, days, snap, emitChange],
  );

  const onSlotDown = useCallback(
    (e: ReactPointerEvent, dayIdx: number) => {
      const h = hit(e.clientX, e.clientY);
      if (h)
        begin(e, { kind: 'slot', x: e.clientX, y: e.clientY, moved: false, dayIdx, allDay: false, min0: h.minute });
    },
    [hit, begin],
  );
  const onAllDaySlotDown = (e: ReactPointerEvent) => {
    const h = hit(e.clientX, e.clientY);
    if (h)
      begin(e, { kind: 'slot', x: e.clientX, y: e.clientY, moved: false, dayIdx: h.dayIdx, allDay: true, min0: 0 });
  };
  const onEventDown = useCallback(
    (e: ReactPointerEvent, ev: NormalizedEvent, dayIdx: number) => {
      e.stopPropagation();
      const h = hit(e.clientX, e.clientY);
      if (!h) return;
      const downDay = days[dayIdx];
      const grab = ev.allDay ? 0 : downDay.startOf('day').add(h.minute, 'minute').diff(ev.start, 'minute');
      begin(e, { kind: 'move', x: e.clientX, y: e.clientY, moved: false, ev, downDay, grab });
      if (canEdit(ev.source)[0]) e.currentTarget.classList.add('rbs-tg-dragging');
    },
    [hit, begin, days, canEdit],
  );
  const onResizeDown = useCallback(
    (e: ReactPointerEvent, ev: NormalizedEvent, dayIdx: number) => {
      e.stopPropagation();
      begin(e, { kind: 'resize', x: e.clientX, y: e.clientY, moved: false, ev, dayIdx });
    },
    [begin],
  );

  const onEventActivate = useCallback((e: MouseEvent, ev: NormalizedEvent) => {
    // mouse clicks are handled on pointerup; this is the keyboard path (Enter/Space)
    if (e.detail === 0) propsRef.current.onEventClick?.({ event: ev.source, jsEvent: e });
  }, []);
  const onSlotActivate = useCallback((d: Dayjs) => {
    propsRef.current.onDateClick?.({ date: d, allDay: false, jsEvent: new MouseEvent('click') });
  }, []);

  // ---- all-day row ----
  const maxLanes = typeof props.dayMaxEvents === 'number' ? props.dayMaxEvents : 3;
  const overflow = lanes > maxLanes;
  const visLanes = overflow ? maxLanes - 1 : lanes;
  const rows = Math.max(1, visLanes + (overflow ? 1 : 0));
  const hiddenPerDay = useMemo(() => {
    const counts = days.map(() => 0);
    for (const b of bars) if (b.lane >= visLanes) for (let i = b.si; i <= b.ei; i++) counts[i] += 1;
    return counts;
  }, [bars, days, visLanes]);
  const adGhost = preview?.allDay ? spanOf(days, preview) : null;
  const n = days.length;

  const showWeek = weekNumbers && !isDay;
  const weekLabel = `W${isoWeek(days[0])}`;
  const scrollMax = props.height === undefined ? 700 : undefined;

  const hours: number[] = [];
  for (let h = Math.ceil(minMin / 60); h * 60 < maxMin; h++) hours.push(h);
  const today = dayjs();

  return (
    <div className="rbs-tg" data-view={view}>
      <div ref={scrollRef} className="rbs-tg-scroll" style={{ maxHeight: scrollMax }}>
        <div className="rbs-tg-sticky">
          <div className="rbs-tg-row rbs-tg-head">
            <div className="rbs-tg-corner">{showWeek ? weekLabel : ''}</div>
            {days.map(d => {
              const isToday = d.isSame(today, 'day');
              return (
                <div key={d.valueOf()} className={joinClasses('rbs-tg-hcell', isToday && 'rbs-tg-today')}>
                  <button
                    type="button"
                    className="rbs-tg-daylink"
                    onClick={() =>
                      props.onNavLinkDayClick ? props.onNavLinkDayClick(d) : !isDay && goTo('timeGridDay', d)
                    }
                  >
                    <span className="rbs-tg-dow">{d.format('ddd')}</span>
                    <span className="rbs-tg-dom">{d.format('D')}</span>
                  </button>
                </div>
              );
            })}
          </div>
          <div className="rbs-tg-row rbs-tg-allday">
            <div className="rbs-tg-corner rbs-tg-allday-label">all-day</div>
            <div
              ref={allDayRef}
              className="rbs-tg-allday-cols"
              style={{ height: rows * ALLDAY_LANE_H + 6 }}
              onPointerDown={onAllDaySlotDown}
            >
              {days.map((d, i) => (
                <div
                  key={d.valueOf()}
                  className={joinClasses('rbs-tg-allday-cell', d.isSame(today, 'day') && 'rbs-tg-today')}
                  style={{ left: `${(i / n) * 100}%`, width: `${100 / n}%` }}
                />
              ))}
              {adSel && (
                <div
                  className="rbs-tg-select"
                  style={{
                    left: `${(adSel.from / n) * 100}%`,
                    width: `${((adSel.to - adSel.from + 1) / n) * 100}%`,
                    top: 0,
                    bottom: 0,
                  }}
                />
              )}
              {bars
                .filter(b => b.lane < visLanes)
                .map(b => {
                  const arg = eventArg(render, b.ev, b.isStart, b.isEnd);
                  const [startEditable] = canEdit(b.ev.source);
                  return (
                    <button
                      type="button"
                      key={`${b.ev.id}-${b.si}`}
                      aria-label={`${b.ev.source.title}, all day`}
                      className={joinClasses(
                        'rbs-tg-bar',
                        !b.isStart && 'rbs-tg-bar-cont-start',
                        !b.isEnd && 'rbs-tg-bar-cont-end',
                        startEditable && 'rbs-tg-ev-editable',
                        b.ev.source.classNames,
                        render.eventClassNames?.(arg),
                      )}
                      style={{
                        ...eventStyle(b.ev),
                        left: `${(b.si / n) * 100}%`,
                        width: `calc(${((b.ei - b.si + 1) / n) * 100}% - 2px)`,
                        top: b.lane * ALLDAY_LANE_H + 2,
                        height: ALLDAY_LANE_H - 2,
                      }}
                      onPointerDown={e => {
                        const idx = Math.max(b.si, Math.min(b.ei, hit(e.clientX, e.clientY)?.dayIdx ?? b.si));
                        onEventDown(e, b.ev, idx);
                      }}
                      onClick={e => onEventActivate(e.nativeEvent, b.ev)}
                    >
                      {render.eventContent ? (
                        render.eventContent(arg)
                      ) : (
                        <span className="rbs-tg-ev-title">{b.ev.source.title}</span>
                      )}
                    </button>
                  );
                })}
              {overflow &&
                hiddenPerDay.map((count, i) =>
                  count > 0 ? (
                    <button
                      type="button"
                      key={days[i].valueOf()}
                      className="rbs-tg-more"
                      style={{ left: `${(i / n) * 100}%`, width: `${100 / n}%`, top: visLanes * ALLDAY_LANE_H + 2 }}
                      onPointerDown={e => e.stopPropagation()}
                      onClick={() => goTo('timeGridDay', days[i])}
                    >
                      +{count} more
                    </button>
                  ) : null,
                )}
              {adGhost && preview && (
                <div
                  className="rbs-tg-bar rbs-tg-ghost"
                  style={{
                    ...eventStyle(preview.ev),
                    left: `${(adGhost.si / n) * 100}%`,
                    width: `calc(${((adGhost.ei - adGhost.si + 1) / n) * 100}% - 2px)`,
                    top: 2,
                    height: ALLDAY_LANE_H - 2,
                  }}
                >
                  <span className="rbs-tg-ev-title">{preview.ev.source.title}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rbs-tg-row rbs-tg-body">
          <div className="rbs-tg-axis" style={{ height: (maxMin - minMin) * ppm }}>
            {hours.map(h => (
              <div key={h} className="rbs-tg-hour" style={{ top: (h * 60 - minMin) * ppm }}>
                {h * 60 > minMin ? today.startOf('day').add(h, 'hour').format('h A') : ''}
              </div>
            ))}
          </div>
          {/* biome-ignore lint/a11y/useSemanticElements: ARIA grid over div columns */}
          <div ref={colsRef} role="grid" aria-label="Time grid" className="rbs-tg-cols">
            {dayData.map((data, i) => {
              const base = data.day.startOf('day');
              const winStart = base.add(minMin, 'minute');
              const winEnd = base.add(maxMin, 'minute');
              const pv =
                preview && !preview.allDay && preview.start.isBefore(winEnd) && preview.end.isAfter(winStart)
                  ? preview
                  : null;
              const isToday = data.day.isSame(today, 'day');
              return (
                <DayColumn
                  key={data.day.valueOf()}
                  data={data}
                  dayIdx={i}
                  isToday={isToday}
                  geo={geo}
                  render={render}
                  nowMin={props.nowIndicator && isToday ? nowMin : null}
                  selStart={sel?.dayIdx === i ? sel.start : null}
                  selEnd={sel?.dayIdx === i ? sel.end : null}
                  ghost={
                    pv
                      ? {
                          ev: pv.ev,
                          sMin: Math.max(pv.start.diff(base, 'minute'), minMin),
                          eMin: Math.min(pv.end.diff(base, 'minute'), maxMin),
                        }
                      : null
                  }
                  canEdit={canEdit}
                  onSlotDown={onSlotDown}
                  onEventDown={onEventDown}
                  onResizeDown={onResizeDown}
                  onEventActivate={onEventActivate}
                  onSlotActivate={onSlotActivate}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TimeGridView;
