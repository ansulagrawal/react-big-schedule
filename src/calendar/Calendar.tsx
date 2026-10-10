import type { Dayjs } from 'dayjs';
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import SchedulerData from '../components/SchedulerData';
import { ViewType } from '../config/default';
import Toolbar from './Toolbar';
import { withTimeZone } from './timezone';
import type { CalendarCallbacks, CalendarOptions, CalendarViewName, CalendarViewProps, EventSource } from './types';
import { useEventSources } from './useEventSources';
import { useRecurrence } from './useRecurrence';
import { getViewRange, getViewTitle, stepDate } from './utils';

const DayGridView = lazy(() => import('./views/DayGridView'));
const TimeGridView = lazy(() => import('./views/TimeGridView'));
const ListView = lazy(() => import('./views/ListView'));
const MultiMonthView = lazy(() => import('./views/MultiMonthView'));

const VIEW_LABELS: Record<CalendarViewName, string> = {
  dayGridMonth: 'Month',
  dayGridWeek: 'Week grid',
  dayGridDay: 'Day grid',
  timeGridWeek: 'Week',
  timeGridDay: 'Day',
  listDay: 'List day',
  listWeek: 'List',
  listMonth: 'List month',
  listYear: 'List year',
  multiMonthYear: 'Year',
  multiMonthStack: 'Year stack',
  multiMonthContinuous: 'Year flow',
};

export interface CalendarProps extends CalendarOptions, CalendarCallbacks {
  /** Events: an array, a `(range) => events` function, or a `{ url }` JSON feed. */
  events?: EventSource;
  /** More sources (arrays, functions, feeds, or `{ events, color, textColor }`) merged with `events`. */
  eventSources?: EventSource[];
  /** Controlled view. */
  view?: CalendarViewName;
  initialView?: CalendarViewName;
  onViewChange?: (view: CalendarViewName) => void;
  /** Controlled date (anchor of the visible range). */
  date?: Dayjs | string | Date;
  initialDate?: Dayjs | string | Date;
  onDateChange?: (date: Dayjs) => void;
  /** Views offered in the toolbar switcher. */
  views?: CalendarViewName[];
  /** Set false to hide the built-in toolbar and drive view/date yourself. */
  toolbar?: boolean;
  /** Colour scheme: 'default' (transparent, follows the page), 'light', 'dark' or any custom data-rbs-theme value. */
  theme?: string;
}

const DEFAULT_VIEWS: CalendarViewName[] = ['dayGridMonth', 'timeGridWeek', 'timeGridDay', 'listWeek', 'multiMonthYear'];

function pickView(view: CalendarViewName) {
  if (view.startsWith('dayGrid')) return DayGridView;
  if (view.startsWith('timeGrid')) return TimeGridView;
  if (view.startsWith('list')) return ListView;
  return MultiMonthView;
}

function Calendar({
  events: eventsProp,
  eventSources,
  view: viewProp,
  initialView = 'dayGridMonth',
  onViewChange,
  date: dateProp,
  initialDate,
  onDateChange,
  views = DEFAULT_VIEWS,
  toolbar = true,
  theme,
  ...rest
}: CalendarProps) {
  // one locale-bound dayjs per calendar (same isolation as <Scheduler>, see #146)
  const baseDayjs = useMemo(() => new SchedulerData(undefined, ViewType.Week, false, false).localeDayjs, []);
  useMemo(() => baseDayjs.locale(rest.locale ?? baseDayjs.locale()), [baseDayjs, rest.locale]);
  const dayjs = useMemo(() => withTimeZone(baseDayjs, rest.timeZone), [baseDayjs, rest.timeZone]);

  const [innerView, setInnerView] = useState(initialView);
  const [innerDate, setInnerDate] = useState(() => dayjs(initialDate as string | Date | undefined));
  const view = viewProp ?? innerView;
  const date = useMemo(
    () => (dateProp === undefined ? dayjs(innerDate.valueOf()) : dayjs(dateProp as string | Date)),
    [dayjs, dateProp, innerDate],
  );

  const setView = useCallback(
    (next: CalendarViewName) => {
      if (viewProp === undefined) setInnerView(next);
      onViewChange?.(next);
    },
    [viewProp, onViewChange],
  );
  const setDate = useCallback(
    (next: Dayjs) => {
      if (dateProp === undefined) setInnerDate(next);
      onDateChange?.(next);
    },
    [dateProp, onDateChange],
  );
  const goTo = useCallback(
    (nextView: CalendarViewName, nextDate: Dayjs) => {
      setView(nextView);
      setDate(nextDate);
    },
    [setView, setDate],
  );

  const range = useMemo(() => getViewRange(view, date, rest.firstDay ?? 0), [view, date, rest.firstDay]);
  const { onDatesSet, onLoading, onEventsError } = rest;
  const sourced = useEventSources(eventsProp, eventSources, range, onLoading, onEventsError);
  const events = useRecurrence(sourced.events, range, dayjs);
  useEffect(() => {
    onDatesSet?.({ ...range, view });
  }, [range.start.valueOf(), range.end.valueOf(), view]);

  const View = pickView(view);
  const viewProps: CalendarViewProps = { ...rest, view, date, events, dayjs, goTo };

  return (
    <div
      data-rbs-theme={theme}
      className={`rbs-calendar rbs-container ${rest.className ?? ''}`}
      style={{ height: rest.height, ...rest.style }}
    >
      {toolbar && (
        <Toolbar
          title={getViewTitle(view, date, range)}
          view={view}
          views={views.map(name => ({ name, label: VIEW_LABELS[name] }))}
          today={dayjs()}
          loading={sourced.loading}
          onPrev={() => setDate(stepDate(view, date, -1))}
          onNext={() => setDate(stepDate(view, date, 1))}
          onToday={() => setDate(dayjs())}
          onView={setView}
        />
      )}
      <Suspense fallback={<span className="rbs-spinner" role="status" aria-label="Loading" />}>
        <View {...viewProps} />
      </Suspense>
    </div>
  );
}

export default Calendar;
