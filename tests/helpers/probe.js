import dayjs from 'dayjs';
import SchedulerData from '../../src/components/SchedulerData';
import { CellUnit, ViewType } from '../../src/config/default';

const RESOURCES = [{ id: 'r1', name: 'R1' }];

// Custom view emulating a Sunday-start week (library Week view is always ISO / Monday-start).
const sundayWeekBehaviors = {
  getCustomDateFunc: (schedulerData, num, date) => {
    const base = date !== undefined ? dayjs(date) : schedulerData.startDate.add(num, 'weeks');
    const startDate = base.day(0).startOf('day');
    return { startDate, endDate: startDate.add(6, 'days').endOf('day'), cellUnit: CellUnit.Day };
  },
};

export function makeScheduler({ view, date, config = {}, sundayWeek = false }) {
  const viewType = sundayWeek ? ViewType.Custom : view;
  const sd = new SchedulerData(
    date,
    viewType,
    false,
    false,
    { schedulerWidth: 1000, ...config },
    sundayWeek ? sundayWeekBehaviors : undefined,
  );
  sd.setResources(RESOURCES);
  return sd;
}

/**
 * Returns what the renderer would see for a single event:
 *  span       - span stored on the header event where render === true (undefined if never rendered)
 *  cells      - every header cell the event is attached to, with its render flag
 *  firstCell  - header time of the cell flagged render === true
 */
export function probe({ view, date, start, end, config, sundayWeek }) {
  const sd = makeScheduler({ view, date, config, sundayWeek });
  sd.setEvents([{ id: 1, start, end, resourceId: 'r1', title: 'evt' }]);
  const row = sd.renderData.find(r => r.slotId === 'r1');
  const cells = [];
  row.headerItems.forEach((h, index) => {
    const ev = h.events.find(e => e?.eventItem?.id === 1);
    if (ev) cells.push({ index, time: h.time, render: ev.render, span: ev.span });
  });
  const rendered = cells.filter(c => c.render);
  return {
    span: rendered[0]?.span,
    renderCount: rendered.length,
    firstCell: rendered[0]?.time,
    firstIndex: rendered[0]?.index,
    cellCount: cells.length,
    cellTimes: cells.map(c => c.time.slice(0, 16)),
    headerCount: sd.headers.length,
  };
}
