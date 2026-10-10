// biome-ignore-all lint/a11y: div-based CSS grid with explicit ARIA grid roles
import type { Dayjs } from 'dayjs';
import { memo, useMemo } from 'react';
import Cell from './Cell';
import { type MonthShared, onGridKey, weekNumber } from './shared';

/** Weekday columns in display order (firstDay-rotated, weekends optionally dropped). */
export function weekdayOrder(firstDay: number, weekends: boolean): number[] {
  return Array.from({ length: 7 }, (_, i) => (firstDay + i) % 7).filter(d => weekends || (d !== 0 && d !== 6));
}

function MonthGrid({ month, shared }: { month: Dayjs; shared: MonthShared }) {
  const { firstDay, weekends, weekNumbers, today, goTo } = shared;
  const cols = weekdayOrder(firstDay, weekends);
  const weeks = useMemo(() => {
    const out: (Dayjs | null)[][] = [];
    const start = month.startOf('month');
    const lead = (start.day() - firstDay + 7) % 7;
    let d = start.subtract(lead, 'day');
    const end = month.endOf('month');
    while (!d.isAfter(end)) {
      const row: (Dayjs | null)[] = [];
      for (let i = 0; i < 7; i++, d = d.add(1, 'day')) {
        if (weekends || (d.day() !== 0 && d.day() !== 6)) row.push(d.month() === month.month() ? d : null);
      }
      out.push(row);
    }
    return out;
  }, [month, firstDay, weekends]);
  const tabDay = today.isSame(month, 'month') ? today : month.startOf('month');
  const label = month.format('MMMM YYYY');
  const template = `${weekNumbers ? '1.75rem ' : ''}repeat(${cols.length}, minmax(0, 1fr))`;

  return (
    <section className="rbs-mm-month" aria-label={label}>
      <h3 className="rbs-mm-title">
        <button type="button" onClick={() => goTo('dayGridMonth', month.startOf('month'))}>
          {month.format('MMMM')}
          <span className="rbs-mm-year-lbl"> {month.format('YYYY')}</span>
        </button>
      </h3>
      <div role="grid" aria-label={label} onKeyDown={e => onGridKey(e)}>
        <div role="row" className="rbs-mm-row rbs-mm-head" style={{ gridTemplateColumns: template }}>
          {weekNumbers && <span role="columnheader" className="rbs-mm-wk" />}
          {cols.map(d => (
            <span role="columnheader" key={d} className="rbs-mm-dow">
              {today.day(d).format('dd')}
            </span>
          ))}
        </div>
        {weeks.map((row, i) => {
          const first = row.find((x): x is Dayjs => x !== null) as Dayjs;
          return (
            <div role="row" className="rbs-mm-row" style={{ gridTemplateColumns: template }} key={first.valueOf()}>
              {weekNumbers && <span className="rbs-mm-wk">{weekNumber(first, firstDay)}</span>}
              {row.map((d, j) =>
                d ? (
                  <Cell key={d.valueOf()} day={d} shared={shared} tabbable={d.isSame(tabDay, 'day')} />
                ) : (
                  // biome-ignore lint/suspicious/noArrayIndexKey: static filler
                  <span role="gridcell" className="rbs-mm-pad" key={`${i}-${j}`} />
                ),
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default memo(MonthGrid);
