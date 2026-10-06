import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Scheduler as RawScheduler, wrapperFun } from '../../src/components/index';
import { makeScheduler } from './probe';

const Scheduler = wrapperFun(RawScheduler);

// Fixed pixel widths so geometry is deterministic.
export const CELL = { day: 30, week: 100, month: 60, custom: 100 };
const PX_CONFIG = {
  schedulerWidth: 4000,
  besidesWidth: 0,
  dayCellWidth: CELL.day,
  weekCellWidth: CELL.week,
  monthCellWidth: CELL.month,
  customCellWidth: CELL.custom,
  weekResourceTableWidth: 160,
};

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
if (!window.matchMedia) {
  window.matchMedia = () => ({
    matches: false,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
  });
}
if (!window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

/**
 * Mounts <Scheduler> and returns the pixel geometry of event bars plus whether the
 * scheduler body (resource rows) actually rendered.
 */
export function renderProbe({ view, date, start, end, config = {}, sundayWeek }) {
  const sd = makeScheduler({ view, date, config: { ...PX_CONFIG, ...config }, sundayWeek });
  sd.setEvents([{ id: 1, start, end, resourceId: 'r1', title: 'evt' }]);
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  let error;
  const noop = () => {};
  try {
    act(() => {
      root.render(
        <Scheduler
          schedulerData={sd}
          prevClick={noop}
          nextClick={noop}
          onSelectDate={noop}
          onViewChange={noop}
          toggleExpandFunc={noop}
        />,
      );
    });
  } catch (e) {
    error = e;
  }
  const bars = [...container.querySelectorAll('.timeline-event')].map(el => ({
    left: Number.parseFloat(el.style.left),
    width: Number.parseFloat(el.style.width),
  }));
  const result = {
    error: error ? String(error.message ?? error) : undefined,
    bars,
    cellWidth: sd.getContentCellWidth(),
    tableWidth: sd.getContentTableWidth(),
    headers: sd.headers.map(h => h.time),
    rowCount: container.querySelectorAll('.scheduler-content tbody tr, .event-container').length,
  };
  act(() => root.unmount());
  container.remove();
  return result;
}
