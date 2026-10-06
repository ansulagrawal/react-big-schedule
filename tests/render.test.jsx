// @vitest-environment jsdom
// Render-level reproduction for issue #198: where does the event bar actually land (px)?
process.env.TZ = 'Asia/Kolkata';

import dayjs from 'dayjs';
import { afterAll, describe, expect, it } from 'vitest';
import { ViewType } from '../src/config/default';
import { renderProbe } from './helpers/renderProbe';

const { Day, Week, Month } = ViewType;
const noWeekend = { displayWeekend: false };
const TOL = 8; // px: cell margins (2-6px) + rounding

// Expected bar extent in px = event clamped to the visible window, mapped onto visible cells.
// Week/Month/Custom cells are positioned proportionally inside the day; Day-view cells are whole slots.
function expectedExtent(c, r) {
  const cw = r.cellWidth;
  const cells = r.headers.map(t => dayjs(t));
  const unit = c.view === Day ? [30, 'minute'] : [1, 'day'];
  const cellEnd = i => cells[i].add(unit[0], unit[1]);
  const s = dayjs(c.start);
  const e = /^\d{4}-\d{2}-\d{2}$/.test(c.end) ? dayjs(c.end).endOf('day') : dayjs(c.end);
  const frac = (t, i) => (c.view === Day ? 0 : t.diff(cells[i], 'minute') / 1440);
  let left;
  let right;
  for (let i = 0; i < cells.length; i += 1) {
    if (cellEnd(i) > s && cells[i] < e) {
      if (left === undefined) left = i * cw + (s > cells[i] ? frac(s, i) * cw : 0);
      right = (i + 1) * cw - (e < cellEnd(i) && c.view !== Day ? (1 - frac(e, i)) * cw : 0);
    }
  }
  return left === undefined ? null : { left, right };
}

const CASES = [
  {
    id: 'a1',
    view: Week,
    date: '2026-10-07',
    start: '2026-10-10 23:00:00',
    end: '2026-10-12 09:00:00',
    note: 'Sat23->Mon09, wk Oct5-11',
  },
  {
    id: 'a2',
    view: Week,
    date: '2026-10-14',
    start: '2026-10-10 23:00:00',
    end: '2026-10-12 09:00:00',
    note: 'Sat23->Mon09, wk Oct12-18',
  },
  {
    id: 'a4',
    view: Week,
    date: '2026-10-14',
    config: noWeekend,
    start: '2026-10-10 23:00:00',
    end: '2026-10-12 09:00:00',
    note: 'Sat23->Mon09, no wknd, wk Oct12-18',
  },
  {
    id: 'a6',
    sundayWeek: true,
    date: '2026-10-14',
    start: '2026-10-10 23:00:00',
    end: '2026-10-12 09:00:00',
    note: 'Sat23->Mon09, Sun-wk Oct11-17',
  },
  {
    id: 'a7',
    sundayWeek: true,
    date: '2026-10-14',
    config: noWeekend,
    start: '2026-10-10 23:00:00',
    end: '2026-10-12 09:00:00',
    note: 'Sat23->Mon09, Sun-wk no wknd',
  },
  {
    id: 'b1',
    view: Week,
    date: '2026-10-07',
    start: '2026-10-11 10:00:00',
    end: '2026-10-12 10:00:00',
    note: 'Sun10->Mon10, wk Oct5-11',
  },
  {
    id: 'b2',
    view: Week,
    date: '2026-10-14',
    start: '2026-10-11 10:00:00',
    end: '2026-10-12 10:00:00',
    note: 'Sun10->Mon10, wk Oct12-18',
  },
  {
    id: 'b3',
    sundayWeek: true,
    date: '2026-10-14',
    start: '2026-10-11 10:00:00',
    end: '2026-10-12 10:00:00',
    note: 'Sun10->Mon10, Sun-wk Oct11-17',
  },
  {
    id: 'c1',
    view: Month,
    date: '2026-10-01',
    start: '2026-09-30 10:00:00',
    end: '2026-10-15 10:00:00',
    note: 'Sep30->Oct15, Month Oct',
  },
  {
    id: 'c2',
    view: Month,
    date: '2026-09-01',
    start: '2026-09-30 10:00:00',
    end: '2026-10-15 10:00:00',
    note: 'Sep30->Oct15, Month Sep',
  },
  { id: 'c3', view: Month, date: '2026-10-01', start: '2026-09-30', end: '2026-10-15', note: 'date-only, Month Oct' },
  {
    id: 'c5',
    view: Month,
    date: '2026-10-01',
    start: '2026-09-30 10:00:00',
    end: '2026-10-01 10:00:00',
    note: 'Sep30->Oct1 (span 1), Month Oct',
  },
  {
    id: 'd1',
    view: Day,
    date: '2026-10-01',
    start: '2026-09-30 10:00:00',
    end: '2026-10-02 10:00:00',
    note: 'Day middle (month boundary)',
  },
  {
    id: 'd2',
    view: Day,
    date: '2026-09-30',
    start: '2026-09-30 10:00:00',
    end: '2026-10-02 10:00:00',
    note: 'Day first',
  },
  {
    id: 'd3',
    view: Day,
    date: '2026-10-02',
    start: '2026-09-30 10:00:00',
    end: '2026-10-02 10:00:00',
    note: 'Day last',
  },
  {
    id: 'd4',
    view: Day,
    date: '2026-10-04',
    start: '2026-09-05 10:00:00',
    end: '2026-10-05 10:00:00',
    note: 'Day 5th->5th',
  },
  {
    id: 'e1',
    view: Day,
    date: '2027-01-01',
    start: '2026-12-31 10:00:00',
    end: '2027-01-02 10:00:00',
    note: 'Day Jan 1',
  },
  {
    id: 'e2',
    view: Week,
    date: '2026-12-30',
    start: '2026-12-31 10:00:00',
    end: '2027-01-02 10:00:00',
    note: 'Week year boundary',
  },
  {
    id: 'e3',
    view: Month,
    date: '2027-01-01',
    start: '2026-12-31 10:00:00',
    end: '2027-01-02 10:00:00',
    note: 'Month Jan carry',
  },
  {
    id: 'f1',
    view: Week,
    date: '2026-10-07',
    start: '2026-10-06 10:00:00',
    end: '2026-10-08 00:00:00',
    note: 'ends 00:00, Week',
  },
  { id: 'g1', view: Week, date: '2026-10-07', start: '2026-10-05', end: '2026-10-07', note: 'date-only Week' },
];

const rows = [];
const r1 = n => Math.round(n);

describe.each(CASES)('$id $note', c => {
  const r = renderProbe(c);
  const exp = expectedExtent(c, r);
  const bar = r.bars[0];
  const act = bar ? { left: bar.left, right: bar.left + bar.width } : null;
  const ok =
    !r.error &&
    r.bars.length === (exp ? 1 : 0) &&
    (!exp || (Math.abs(act.left - exp.left) <= TOL && Math.abs(act.right - exp.right) <= TOL));
  rows.push({
    id: c.id,
    note: c.note,
    cellW: r.cellWidth,
    tableW: r.tableWidth,
    'expected px': exp ? `${r1(exp.left)}..${r1(exp.right)}` : 'none',
    'actual px': r.error ? `ERROR ${r.error}` : act ? `${r1(act.left)}..${r1(act.right)}` : 'none',
    ok: ok ? 'PASS' : 'FAIL',
  });

  it('renders without throwing', () => expect(r.error).toBeUndefined());
  it('bar covers the clamped event interval', () => {
    expect(r.bars.length).toBe(exp ? 1 : 0);
    if (!exp) return;
    expect(Math.abs(act.left - exp.left)).toBeLessThanOrEqual(TOL);
    expect(Math.abs(act.right - exp.right)).toBeLessThanOrEqual(TOL);
  });
  it('bar stays inside the content table', () => {
    if (!act) return;
    expect(act.left).toBeGreaterThanOrEqual(0);
    expect(act.right).toBeLessThanOrEqual(r.tableWidth);
  });
});

afterAll(() => {
  console.log(`\nTZ=${process.env.TZ}  (render-level)`);
  console.table(rows);
});
