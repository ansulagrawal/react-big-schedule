// biome-ignore-all lint/a11y: div-based CSS grid with explicit ARIA grid roles
import type { Dayjs } from 'dayjs';
import { memo, useMemo } from 'react';
import type { DateRange } from '../../types';
import Cell from './Cell';
import { weekdayOrder } from './MonthGrid';
import { type MonthShared, onGridKey, weekNumber } from './shared';

function Continuous({ range, shared }: { range: DateRange; shared: MonthShared }) {
  const { firstDay, weekends, weekNumbers, today } = shared;
  const cols = weekdayOrder(firstDay, weekends);
  const weeks = useMemo(() => {
    const out: Dayjs[][] = [];
    for (let d = range.start; d.isBefore(range.end); ) {
      const row: Dayjs[] = [];
      for (let i = 0; i < 7; i++, d = d.add(1, 'day')) if (weekends || (d.day() !== 0 && d.day() !== 6)) row.push(d);
      out.push(row);
    }
    return out;
  }, [range, weekends]);
  const template = `5.5rem ${weekNumbers ? '1.75rem ' : ''}repeat(${cols.length}, minmax(0, 1fr))`;
  const tabDay = today.isSame(range.start, 'year') ? today : range.start.add(7, 'day');

  return (
    <div role="grid" aria-label="Year" onKeyDown={e => onGridKey(e, cols.length)}>
      <div role="row" className="rbs-mm-row rbs-mm-head rbs-mm-sticky" style={{ gridTemplateColumns: template }}>
        <span role="columnheader" />
        {weekNumbers && <span role="columnheader" className="rbs-mm-wk" />}
        {cols.map(d => (
          <span role="columnheader" key={d} className="rbs-mm-dow">
            {today.day(d).format('ddd')}
          </span>
        ))}
      </div>
      {weeks.map(row => {
        const first = row[0] as Dayjs;
        const marker = row.find(d => d.date() === 1);
        return (
          <div role="row" className="rbs-mm-row" style={{ gridTemplateColumns: template }} key={first.valueOf()}>
            <span className={`rbs-mm-marker${marker ? ' rbs-mm-marker-on' : ''}`}>
              {marker ? marker.format('MMMM') : ''}
            </span>
            {weekNumbers && <span className="rbs-mm-wk">{weekNumber(first, firstDay)}</span>}
            {row.map(d => (
              <Cell
                key={d.valueOf()}
                day={d}
                shared={shared}
                tabbable={d.isSame(tabDay, 'day')}
                alt={d.month() % 2 === 1}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

export default memo(Continuous);
