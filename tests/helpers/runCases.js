import { afterAll, describe, expect, it } from 'vitest';
import { ViewType } from '../../src/config/default';
import { probe } from './probe';

const { Day, Week, Month } = ViewType;
const VIEW_NAME = { [Day]: 'Day', [Week]: 'Week', [Month]: 'Month' };
const fmt = e => (e === null ? 'not rendered' : `${e.first} span=${e.span}`);
const rows = [];

export function runCases(cases) {
  describe.each(cases)('$id $note', c => {
    const actual = probe(c);
    const actualSummary = actual.renderCount === 0 ? null : { first: actual.firstCell.slice(0, 16), span: actual.span };
    const pass = JSON.stringify(actualSummary) === JSON.stringify(c.expected);
    rows.push({
      id: c.id,
      view: c.sundayWeek ? 'Week(Sun)' : VIEW_NAME[c.view],
      note: c.note,
      expected: fmt(c.expected),
      actual: fmt(actualSummary),
      cells: actual.cellCount,
      renders: actual.renderCount,
      ok: pass ? 'PASS' : 'FAIL',
    });

    it('renders in the expected first cell with the expected span', () => {
      expect(actualSummary).toEqual(c.expected);
    });

    it('invariant: span == covered cells, render flag set exactly once', () => {
      if (actual.cellCount === 0) return;
      expect(actual.renderCount).toBe(1);
      expect(actual.span).toBe(actual.cellCount);
    });
  });

  afterAll(() => {
    console.log(`\nTZ=${process.env.TZ}`);
    console.table(rows);
  });
}
