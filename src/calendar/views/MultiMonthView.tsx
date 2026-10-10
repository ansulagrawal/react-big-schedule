import type { Dayjs } from 'dayjs';
import { memo, useMemo } from 'react';
import type { CalendarViewProps } from '../types';
import { getViewRange, normalizeEvent } from '../utils';
import { bucketByDay } from './list/bucket';
import Continuous from './multimonth/Continuous';
import MonthGrid from './multimonth/MonthGrid';
import type { MonthShared } from './multimonth/shared';

function MultiMonthView(props: CalendarViewProps) {
  const { view, date, events, dayjs, firstDay = 0, weekends = true, weekNumbers = false, className } = props;
  const range = useMemo(() => getViewRange(view, date, firstDay), [view, date, firstDay]);
  const normalized = useMemo(() => events.map(e => normalizeEvent(dayjs, e)), [events, dayjs]);
  const buckets = useMemo(() => bucketByDay(normalized, range), [normalized, range]);
  const bgBuckets = useMemo(
    () =>
      bucketByDay(
        events.filter(e => e.display === 'background').map(e => normalizeEvent(dayjs, { ...e, display: 'auto' })),
        range,
      ),
    [events, dayjs, range],
  );
  const today = useMemo(() => dayjs().startOf('day'), [dayjs]);
  const shared: MonthShared = {
    buckets,
    bgBuckets,
    today,
    firstDay,
    weekends,
    weekNumbers,
    compact: view === 'multiMonthYear',
    eventClassNames: props.eventClassNames,
    eventContent: props.eventContent,
    view,
    onDateClick: props.onDateClick,
    onEventClick: props.onEventClick,
    goTo: props.goTo,
    dayCellClassNames: props.dayCellClassNames,
  };
  const months = useMemo(() => {
    const y = date.startOf('year');
    return Array.from({ length: 12 }, (_, i): Dayjs => y.add(i, 'month'));
  }, [date]);

  return (
    <div className={`rbs-mm rbs-mm-${view} ${className ?? ''}`}>
      {view === 'multiMonthContinuous' ? (
        <Continuous range={range} shared={shared} />
      ) : (
        <div className="rbs-mm-months">
          {months.map(m => (
            <MonthGrid key={m.valueOf()} month={m} shared={shared} />
          ))}
        </div>
      )}
    </div>
  );
}

export default memo(MultiMonthView);
