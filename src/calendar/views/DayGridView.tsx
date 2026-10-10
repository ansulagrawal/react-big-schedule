// biome-ignore-all lint/a11y: ARIA grid pattern (div roles on purpose, a CSS-grid layout can't use <table>); one delegated handler, cells and event buttons own focus and keyboard
import type { Dayjs } from 'dayjs';
import type { KeyboardEvent, MouseEvent, PointerEvent } from 'react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Popover from '../../components/ui/Popover';
import type { CalendarEvent, CalendarViewProps, DateLike } from '../types';
import { eventsInRange, getViewRange, type NormalizedEvent, normalizeEvent } from '../utils';
import DayCell from './daygrid/DayCell';
import EventChip from './daygrid/EventChip';
import { DAY, HEAD_H, isoWeek, LANE_H, layoutRow, type PEvent, prepare } from './daygrid/layout';

const KEY = 'YYYY-MM-DD';
const EMPTY: string[] = [];

type Mark = { kind: 'sel' | 'drop'; a: number; b: number; id?: string } | null;
interface Drag {
  kind: 'move' | 'resize' | 'select';
  ev?: PEvent;
  anchor: string;
  hover: string;
  x: number;
  y: number;
  active: boolean;
}

const keyAt = (x: number, y: number): string | undefined => {
  for (const el of document.elementsFromPoint(x, y)) {
    if (el instanceof HTMLElement && el.dataset.date) return el.dataset.date;
  }
  return undefined;
};

/** Write a date back in the same representation the user supplied. */
function sameKind(orig: DateLike | undefined, d: Dayjs, allDay: boolean): DateLike {
  if (allDay) return d.format(KEY);
  if (orig instanceof Date) return d.toDate();
  if (typeof orig === 'number') return d.valueOf();
  if (typeof orig === 'string' || orig === undefined) return d.format();
  return d;
}

function DayGridView(props: CalendarViewProps) {
  const { view, date, events, dayjs, firstDay = 0, goTo, dayMaxEvents, weekNumbers, selectable, editable } = props;
  const isMonth = view === 'dayGridMonth';
  const weekends = props.weekends !== false || view === 'dayGridDay';
  const showOther = props.showNonCurrentDates !== false;

  // ---- date grid
  const range = useMemo(() => getViewRange(view, date, firstDay), [view, date.valueOf(), firstDay]);
  const grid = useMemo(() => {
    const rows: Dayjs[][] = [];
    let row: Dayjs[] = [];
    let n = 0;
    for (let d = range.start; d.isBefore(range.end); d = d.add(1, 'day')) {
      if (weekends || (d.day() !== 0 && d.day() !== 6)) row.push(d);
      if (++n % 7 === 0 || !d.add(1, 'day').isBefore(range.end)) {
        if (row.length) rows.push(row);
        row = [];
      }
    }
    const byKey = new Map<string, Dayjs>();
    const valByKey = new Map<string, number>();
    const flat: string[] = [];
    for (const r of rows) {
      for (const d of r) {
        const k = d.format(KEY);
        byKey.set(k, d);
        valByKey.set(k, d.valueOf());
        flat.push(k);
      }
    }
    return { rows, byKey, valByKey, flat };
  }, [range, weekends]);
  const cols = grid.rows[0]?.length ?? 7;
  const todayKey = useMemo(() => dayjs().format(KEY), [dayjs, range]);
  const now = useMemo(() => dayjs().valueOf(), [dayjs, events, range]);

  // ---- events (local overrides keep drops visible until the parent supplies new events)
  const [overrides, setOverrides] = useState<Record<string, CalendarEvent>>({});
  useEffect(() => setOverrides(o => (Object.keys(o).length ? {} : o)), [events]);
  const normalized = useMemo(
    () =>
      events
        .filter(e => e.display !== 'none' && e.display !== 'background')
        .map(e => normalizeEvent(dayjs, overrides[String(e.id)] ?? e)),
    [events, overrides, dayjs],
  );
  // background events tint the day cells they cover
  const bgByKey = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of events) {
      if (e.display !== 'background') continue;
      const n = normalizeEvent(dayjs, e);
      for (let d = n.start.startOf('day'); d.isBefore(n.end); d = d.add(1, 'day')) {
        const k = d.format(KEY);
        if (grid.byKey.has(k) && !map.has(k)) map.set(k, e.color ?? 'var(--rbs-accent)');
      }
    }
    return map;
  }, [events, dayjs, grid]);
  const byId = useMemo(() => new Map(normalized.map(n => [String(n.id), prepare(n)])), [normalized]);
  const visible = useMemo(() => {
    const inRange = new Set<NormalizedEvent>(eventsInRange(normalized, range));
    return normalized.filter(n => inRange.has(n)).map(n => byId.get(String(n.id)) as PEvent);
  }, [normalized, range, byId]);

  // ---- "fit to cell height" measurement
  const fit = dayMaxEvents === true && grid.rows.length > 1;
  const firstRow = useRef<HTMLDivElement>(null);
  const [rowH, setRowH] = useState(0);
  useLayoutEffect(() => {
    const el = firstRow.current;
    if (!fit || !el) return undefined;
    const ro = new ResizeObserver(() => setRowH(Math.round(el.getBoundingClientRect().height)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [fit]);
  const limitFor = useCallback(
    (lanes: number) => {
      if (fit) {
        if (!rowH) return Infinity;
        const cap = Math.floor((rowH - HEAD_H - 4) / LANE_H);
        return lanes <= cap ? Infinity : Math.max(0, cap - 1);
      }
      return typeof dayMaxEvents === 'number' && lanes > dayMaxEvents ? dayMaxEvents : Infinity;
    },
    [fit, rowH, dayMaxEvents],
  );

  const rowLayouts = useMemo(
    () =>
      grid.rows.map(row => {
        const vals = row.map(d => d.valueOf());
        const active = row.map(d => !isMonth || showOther || d.month() === date.month());
        return { vals, layout: layoutRow(vals, active, visible, limitFor) };
      }),
    [grid, visible, limitFor, isMonth, showOther, date],
  );

  // ---- interaction state
  const [focusKey, setFocusKey] = useState<string>();
  const focusable =
    focusKey && grid.byKey.has(focusKey)
      ? focusKey
      : grid.byKey.has(todayKey)
        ? todayKey
        : (grid.flat.find(k => !isMonth || grid.byKey.get(k)?.month() === date.month()) ?? grid.flat[0]);
  const [mark, setMark] = useState<Mark>(null);
  const [moreKey, setMoreKey] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const suppress = useRef(false);

  // Escape closes the "+N more" popover and hands focus back to its trigger
  useEffect(() => {
    if (!moreKey) return undefined;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setMoreKey(null);
      for (const el of rootRef.current?.querySelectorAll<HTMLElement>('[data-more]') ?? []) {
        if (el.dataset.more === moreKey) el.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [moreKey]);

  const canMove = (e: CalendarEvent) => e.startEditable ?? e.editable ?? editable ?? false;
  const canResize = (e: CalendarEvent) => e.durationEditable ?? e.editable ?? editable ?? false;

  // always-fresh handles for window-level listeners
  const latest = useRef({ props, grid, byId });
  latest.current = { props, grid, byId };

  const commit = useCallback((d: Drag) => {
    const { props: p, grid: g } = latest.current;
    const h = g.valByKey.get(d.hover);
    const a = g.valByKey.get(d.anchor);
    if (h === undefined || a === undefined) return;
    if (d.kind === 'select') {
      const [lo, hi] = h < a ? [h, a] : [a, h];
      p.onSelect?.({ start: p.dayjs(lo), end: p.dayjs(hi).add(1, 'day'), allDay: true });
      return;
    }
    const ev = d.ev;
    if (!ev) return;
    const src = ev.ne.source;
    const delta = Math.round((d.kind === 'move' ? h - a : Math.max(h, ev.sVal) - ev.eVal) / DAY);
    if (!delta) return;
    const oldEvent = src;
    let start = ev.ne.start;
    let end = ev.ne.end;
    if (d.kind === 'move') start = start.add(delta, 'day');
    end = end.add(delta, 'day');
    if (!end.isAfter(start)) return;
    const event: CalendarEvent = {
      ...src,
      start: sameKind(src.start, start, ev.ne.allDay),
      end: sameKind(src.end, end, ev.ne.allDay),
    };
    const id = String(src.id);
    setOverrides(o => ({ ...o, [id]: event }));
    const revert = () =>
      setOverrides(o => {
        const next = { ...o };
        delete next[id];
        return next;
      });
    (d.kind === 'move' ? p.onEventDrop : p.onEventResize)?.({ event, oldEvent, revert });
  }, []);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const t = e.target as HTMLElement;
    setMark(null);
    if (t.closest('[data-nav]')) return;
    let d: Drag | null = null;
    const chip = t.closest<HTMLElement>('[data-drag]');
    const start = keyAt(e.clientX, e.clientY);
    if (chip) {
      const ev = byId.get(chip.dataset.eid ?? '');
      const resize = !!t.closest('[data-resize]');
      if (ev && start && (resize ? canResize(ev.ne.source) : canMove(ev.ne.source))) {
        d = {
          kind: resize ? 'resize' : 'move',
          ev,
          anchor: start,
          hover: start,
          x: e.clientX,
          y: e.clientY,
          active: false,
        };
      }
    } else if (selectable && t.closest('[data-date]') && start) {
      d = { kind: 'select', anchor: start, hover: start, x: e.clientX, y: e.clientY, active: true };
      setMark({ kind: 'sel', a: grid.valByKey.get(start) ?? 0, b: grid.valByKey.get(start) ?? 0 });
    }
    if (!d) return;
    drag.current = d;

    const preview = (s: Drag) => {
      const g = latest.current.grid;
      const h = g.valByKey.get(s.hover) ?? 0;
      const a = g.valByKey.get(s.anchor) ?? 0;
      if (s.kind === 'select') return setMark({ kind: 'sel', a: Math.min(a, h), b: Math.max(a, h) });
      const ev = s.ev as PEvent;
      const shift = (v: number, n: number) => latest.current.props.dayjs(v).add(n, 'day').valueOf();
      if (s.kind === 'move') {
        const n = Math.round((h - a) / DAY);
        return setMark({ kind: 'drop', a: shift(ev.sVal, n), b: shift(ev.eVal, n), id: String(ev.ne.id) });
      }
      return setMark({ kind: 'drop', a: ev.sVal, b: Math.max(h, ev.sVal), id: String(ev.ne.id) });
    };
    const move = (m: globalThis.PointerEvent) => {
      const s = drag.current;
      if (!s) return;
      if (!s.active) {
        if (Math.hypot(m.clientX - s.x, m.clientY - s.y) < 4) return;
        s.active = true;
        document.body.style.userSelect = 'none';
      }
      const k = keyAt(m.clientX, m.clientY);
      if (k && k !== s.hover) {
        s.hover = k;
        preview(s);
      }
    };
    const end = (m?: globalThis.PointerEvent, cancelled = false) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', cancel);
      window.removeEventListener('keydown', esc);
      document.body.style.userSelect = '';
      const s = drag.current;
      drag.current = null;
      if (s?.active && !cancelled && m) {
        commit(s);
        if (s.kind !== 'select') {
          suppress.current = true;
          setTimeout(() => {
            suppress.current = false;
          }, 0);
        }
      }
      if (s?.kind !== 'select' || cancelled) setMark(null);
    };
    const up = (m: globalThis.PointerEvent) => end(m);
    const cancel = () => end(undefined, true);
    const esc = (k: globalThis.KeyboardEvent) => k.key === 'Escape' && end(undefined, true);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', cancel);
    window.addEventListener('keydown', esc);
  };

  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    const t = e.target as HTMLElement;
    if (suppress.current || t.closest('[data-more]')) return;
    const nav = t.closest<HTMLElement>('[data-nav]');
    if (nav) {
      const d = grid.byKey.get(nav.dataset.nav ?? '');
      if (d) {
        setMoreKey(null);
        if (props.onNavLinkDayClick) props.onNavLinkDayClick(d);
        else goTo('dayGridDay', d);
      }
      return;
    }
    const chip = t.closest<HTMLElement>('[data-eid]');
    if (chip) {
      const ev = byId.get(chip.dataset.eid ?? '');
      if (ev) props.onEventClick?.({ event: ev.ne.source, jsEvent: e });
      setMoreKey(null);
      return;
    }
    const cell = t.closest<HTMLElement>('[data-date]');
    const d = cell && grid.byKey.get(cell.dataset.date ?? '');
    if (d) props.onDateClick?.({ date: d, allDay: true, jsEvent: e });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const cell = e.target as HTMLElement;
    const k = cell.dataset.date;
    if (!k) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      cell.click();
      return;
    }
    const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols }[e.key];
    if (!step) return;
    e.preventDefault();
    const next = grid.flat[grid.flat.indexOf(k) + step];
    if (next) rootRef.current?.querySelector<HTMLElement>(`[data-date="${next}"]`)?.focus();
  };

  const onFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    const k = (e.target as HTMLElement).dataset.date;
    if (k) setFocusKey(k);
  };

  // ---- render
  const ctx = {
    eventContent: props.eventContent,
    eventClassNames: props.eventClassNames,
    eventTimeFormat: props.eventTimeFormat,
  };
  const colTpl = `repeat(${cols}, minmax(0, 1fr))`;
  const wrapStyle = {
    '--rbs-dg-head': `${HEAD_H}px`,
    '--rbs-dg-lane': `${LANE_H}px`,
    minHeight: fit ? grid.rows.length * 96 : undefined,
  } as React.CSSProperties;
  const headFmt = view === 'dayGridDay' ? 'dddd' : 'ddd';

  const dayEvents = (key: string): PEvent[] => {
    const v = grid.valByKey.get(key) ?? 0;
    return visible
      .filter(p => p.sVal <= v && v <= p.eVal)
      .sort((a, b) => Number(b.ne.allDay) - Number(a.ne.allDay) || a.ne.start.valueOf() - b.ne.start.valueOf());
  };

  return (
    <div
      ref={rootRef}
      className={`rbs-dg${fit ? ' rbs-dg--fit' : ''}`}
      style={wrapStyle}
      role="grid"
      aria-label={date.format('MMMM YYYY')}
      onPointerDown={onPointerDown}
      onClick={onClick}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
    >
      <div className="rbs-dg-head" role="row">
        {weekNumbers && <div className="rbs-dg-wk" />}
        <div className="rbs-dg-heads" style={{ gridTemplateColumns: colTpl }}>
          {(grid.rows[0] ?? []).map(d => (
            <div key={d.day()} className="rbs-dg-hd" role="columnheader">
              {isMonth ? (
                d.format(headFmt)
              ) : (
                <button type="button" className="rbs-dg-hlink" data-nav={d.format(KEY)} tabIndex={-1}>
                  {d.format(headFmt)}
                  {view === 'dayGridWeek' && <span className="rbs-dg-hnum"> {d.format('D')}</span>}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="rbs-dg-rows">
        {grid.rows.map((row, ri) => {
          const { vals, layout } = rowLayouts[ri];
          const minH = fit ? 64 : Math.max(96, HEAD_H + layout.rows * LANE_H + 8);
          return (
            <div
              key={vals[0]}
              ref={ri === 0 ? firstRow : undefined}
              className="rbs-dg-row"
              role="row"
              style={{ minHeight: minH }}
            >
              {weekNumbers && <div className="rbs-dg-wk">{isoWeek(vals[Math.min(vals.length - 1, 3)])}</div>}
              <div className="rbs-dg-body">
                <div className="rbs-dg-cells" style={{ gridTemplateColumns: colTpl }}>
                  {row.map((d, ci) => {
                    const k = d.format(KEY);
                    const v = vals[ci];
                    const isOther = isMonth && d.month() !== date.month();
                    const isToday = k === todayKey;
                    const x = props.dayCellClassNames?.({ date: d, isToday, isOther }) ?? EMPTY;
                    return (
                      <DayCell
                        key={k}
                        dayKey={k}
                        date={d}
                        label={isMonth && d.date() === 1 ? d.format('MMM D') : d.format('D')}
                        title={d.format('dddd, MMMM D, YYYY')}
                        isToday={isToday}
                        isOther={isOther}
                        hidden={isOther && !showOther}
                        focusable={k === focusable}
                        selected={mark?.kind === 'sel' && v >= mark.a && v <= mark.b}
                        dropping={mark?.kind === 'drop' && v >= mark.a && v <= mark.b}
                        bgColor={bgByKey.get(k)}
                        className={Array.isArray(x) ? x.join(' ') : x}
                      />
                    );
                  })}
                </div>
                <div className="rbs-dg-layer" style={{ gridTemplateColumns: colTpl }}>
                  {layout.shown.map(s => {
                    const id = String(s.ev.ne.id);
                    const src = s.ev.ne.source;
                    return (
                      <EventChip
                        key={`${id}:${s.colStart}`}
                        ev={s.ev}
                        view={view}
                        isStart={s.isStart}
                        isEnd={s.isEnd}
                        col={s.colStart}
                        span={s.colEnd - s.colStart + 1}
                        lane={s.lane}
                        canMove={canMove(src)}
                        canResize={canResize(src)}
                        dragging={mark?.kind === 'drop' && mark.id === id}
                        now={now}
                        {...ctx}
                      />
                    );
                  })}
                  {layout.more.map((count, ci) => {
                    if (!count) return null;
                    const k = row[ci].format(KEY);
                    return (
                      <Popover
                        // biome-ignore lint/suspicious/noArrayIndexKey: column position is the identity
                        key={ci}
                        trigger="click"
                        placement="bottom"
                        className="rbs-dg-pop"
                        open={moreKey === k}
                        onOpenChange={o => setMoreKey(o ? k : null)}
                        content={
                          moreKey === k ? (
                            <div className="rbs-dg-pop-in">
                              <button type="button" className="rbs-dg-pop-title" data-nav={k}>
                                {row[ci].format('dddd, MMM D')}
                              </button>
                              {dayEvents(k).map(p => (
                                <EventChip key={String(p.ne.id)} ev={p} view={view} isStart isEnd now={now} {...ctx} />
                              ))}
                            </div>
                          ) : null
                        }
                      >
                        <button
                          type="button"
                          className="rbs-dg-more"
                          data-more={k}
                          style={{ gridColumn: ci + 1, gridRow: layout.rows }}
                          aria-haspopup="dialog"
                          aria-expanded={moreKey === k}
                        >
                          +{count} more
                        </button>
                      </Popover>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DayGridView;
