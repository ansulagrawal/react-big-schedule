import type { NormalizedEvent } from '../../utils';

export const DAY = 86400000;
export const HEAD_H = 26;
export const LANE_H = 22;

/** An event with its first/last visible day (local midnight values). */
export interface PEvent {
  ne: NormalizedEvent;
  sVal: number;
  eVal: number;
}

export interface Seg {
  ev: PEvent;
  colStart: number;
  colEnd: number;
  isStart: boolean;
  isEnd: boolean;
  lane: number;
}

export interface RowLayout {
  shown: Seg[];
  /** Hidden-event count per column ("+N more"). */
  more: number[];
  /** Lane rows to reserve (shown lanes + the "more" row). */
  rows: number;
}

export function prepare(ne: NormalizedEvent): PEvent {
  const sVal = ne.start.startOf('day').valueOf();
  const eVal = Math.max(sVal, ne.end.subtract(1, 'millisecond').startOf('day').valueOf());
  return { ne, sVal, eVal };
}

/** Cut events into one week row and pack them into lanes. `limitFor(lanes)` -> max visible lanes (Infinity = all). */
export function layoutRow(
  vals: number[],
  active: boolean[],
  events: PEvent[],
  limitFor: (lanes: number) => number,
): RowLayout {
  const segs: Seg[] = [];
  for (const ev of events) {
    let a = -1;
    let b = -1;
    for (let i = 0; i < vals.length; i++) {
      if (active[i] && vals[i] >= ev.sVal && vals[i] <= ev.eVal) {
        if (a < 0) a = i;
        b = i;
      }
    }
    if (a < 0) continue;
    segs.push({ ev, colStart: a, colEnd: b, isStart: vals[a] === ev.sVal, isEnd: vals[b] === ev.eVal, lane: 0 });
  }
  segs.sort(
    (x, y) =>
      x.colStart - y.colStart ||
      y.colEnd - y.colStart - (x.colEnd - x.colStart) ||
      Number(y.ev.ne.allDay) - Number(x.ev.ne.allDay) ||
      x.ev.ne.start.valueOf() - y.ev.ne.start.valueOf(),
  );
  const ends: number[] = [];
  for (const s of segs) {
    let lane = ends.findIndex(e => e < s.colStart);
    if (lane < 0) {
      lane = ends.length;
      ends.push(0);
    }
    ends[lane] = s.colEnd;
    s.lane = lane;
  }
  const limit = limitFor(ends.length);
  const more = vals.map(() => 0);
  if (limit >= ends.length) return { shown: segs, more, rows: ends.length };
  const shown: Seg[] = [];
  for (const s of segs) {
    if (s.lane < limit) shown.push(s);
    else for (let i = s.colStart; i <= s.colEnd; i++) if (active[i]) more[i]++;
  }
  return { shown, more, rows: limit + 1 };
}

/** ISO week number of the Thursday in a row. */
export function isoWeek(ms: number): number {
  const d = new Date(ms);
  const t = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const day = new Date(t).getUTCDay() || 7;
  const thu = t + (4 - day) * DAY;
  const yearStart = Date.UTC(new Date(thu).getUTCFullYear(), 0, 1);
  return Math.ceil(((thu - yearStart) / DAY + 1) / 7);
}
