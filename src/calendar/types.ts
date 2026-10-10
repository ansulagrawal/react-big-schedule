import type { Dayjs } from 'dayjs';
import type { CSSProperties, ReactNode } from 'react';
import type { LocaleDayjs } from '../types';

/** Every built-in calendar view (FullCalendar naming). Resource timeline stays in <Scheduler>. */
export type CalendarViewName =
  | 'dayGridMonth'
  | 'dayGridWeek'
  | 'dayGridDay'
  | 'timeGridWeek'
  | 'timeGridDay'
  | 'listDay'
  | 'listWeek'
  | 'listMonth'
  | 'listYear'
  | 'multiMonthYear'
  | 'multiMonthStack'
  | 'multiMonthContinuous';

export type DateLike = string | number | Date | Dayjs;

export interface CalendarEvent {
  id: string | number;
  title: string;
  start: DateLike;
  end?: DateLike;
  allDay?: boolean;
  /** Background colour of the event; falls back to the theme accent. */
  color?: string;
  textColor?: string;
  /** 'background' paints the time range behind other events instead of an event chip. */
  display?: 'auto' | 'block' | 'list-item' | 'background' | 'none';
  editable?: boolean;
  startEditable?: boolean;
  durationEditable?: boolean;
  /** Free-form data, handed back untouched in every callback. */
  extendedProps?: Record<string, unknown>;
  classNames?: string[];
  /**
   * RFC 5545 rule (`FREQ=WEEKLY;BYDAY=MO,WE`, optionally with DTSTART/EXDATE lines). Expanded for the visible range only.
   * DTSTART defaults to `start`; an embedded DTSTART is read as wall-clock time in the calendar's time zone.
   * The event's `start`/`end` give the first occurrence and the duration of every occurrence.
   */
  rrule?: string;
  /** FullCalendar-style simple recurrence (weekly days + time of day). Takes `start`/`end` duration when no times are given. */
  recurrence?: SimpleRecurrence;
  /** Occurrences to skip (matched by start instant, or by day for all-day events). Applies to `rrule` and `recurrence`. */
  exceptions?: DateLike[];
}

/** Weekly recurrence without RRULE syntax. */
export interface SimpleRecurrence {
  /** 0 = Sunday ... 6 = Saturday. */
  daysOfWeek: number[];
  /** 'HH:mm'. Omit both times for all-day occurrences. */
  startTime?: string;
  /** 'HH:mm'. Omit to reuse the duration of the event. */
  endTime?: string;
  /** First day (inclusive) the recurrence applies. */
  startRecur?: DateLike;
  /** Day (exclusive) the recurrence stops, like FullCalendar. */
  endRecur?: DateLike;
}

/** Visible range handed to dynamic event sources. */
export type EventFetchRange = DateRange;

/** Function source. Receives an AbortSignal that fires when the user navigates away before it resolves. */
export type EventFetcher = (range: EventFetchRange, signal: AbortSignal) => CalendarEvent[] | Promise<CalendarEvent[]>;

/** JSON feed source: GET (or POST) `url` with `start` / `end` ISO query params, expects a CalendarEvent[] response. */
export interface EventFeed {
  url: string;
  method?: 'GET' | 'POST';
  /** Extra query params (form body for POST); a function is evaluated on every fetch. */
  params?: Record<string, string | number | boolean> | (() => Record<string, string | number | boolean>);
  /** Same as `params`; merged on top of it (FullCalendar's extraParams). */
  extraParams?: Record<string, string | number | boolean> | (() => Record<string, string | number | boolean>);
  headers?: Record<string, string>;
  /** Query param names. Default 'start' / 'end'. */
  startParam?: string;
  endParam?: string;
  /** Default colours for events of this feed. */
  color?: string;
  textColor?: string;
}

export type EventSourceInput = CalendarEvent[] | EventFetcher | EventFeed;

/** Any source wrapped with colours that fill in events lacking their own. */
export interface EventSourceObject {
  events: EventSourceInput;
  color?: string;
  textColor?: string;
}

export type EventSource = EventSourceInput | EventSourceObject;

export interface BusinessHours {
  /** 0 = Sunday ... 6 = Saturday. Default Mon-Fri. */
  daysOfWeek?: number[];
  /** 'HH:mm' */
  startTime?: string;
  endTime?: string;
}

export interface DateRange {
  start: Dayjs;
  end: Dayjs;
}

export interface EventClickInfo {
  event: CalendarEvent;
  jsEvent: React.MouseEvent | MouseEvent;
}

export interface DateClickInfo {
  date: Dayjs;
  allDay: boolean;
  jsEvent: React.MouseEvent | MouseEvent;
}

export interface SelectInfo {
  start: Dayjs;
  end: Dayjs;
  allDay: boolean;
}

export interface EventChangeInfo {
  event: CalendarEvent;
  oldEvent: CalendarEvent;
  /** Call to undo the change in a controlled calendar. */
  revert: () => void;
}

export interface EventContentArg {
  event: CalendarEvent;
  view: CalendarViewName;
  timeText: string;
  isStart: boolean;
  isEnd: boolean;
  isPast: boolean;
  isFuture: boolean;
  isToday: boolean;
}

/** Options shared by every view; the <Calendar> shell fills in defaults. */
export interface CalendarOptions {
  locale?: string;
  /**
   * Time zone dates are displayed and reported in: 'local' (default), 'UTC' or an IANA name ('Asia/Kolkata').
   * Event strings with an offset/`Z` are converted; strings without one are wall-clock time in this zone.
   */
  timeZone?: 'local' | 'UTC' | (string & {});
  /** 0 = Sunday ... 6 = Saturday. Default 0. */
  firstDay?: number;
  weekends?: boolean;
  weekNumbers?: boolean;
  nowIndicator?: boolean;
  businessHours?: boolean | BusinessHours;
  selectable?: boolean;
  editable?: boolean;
  /** Max events per day cell before "+N more" (dayGrid). true = fit to cell height. */
  dayMaxEvents?: boolean | number;
  /** Minutes per time-grid slot row. Default 30. */
  slotDuration?: number;
  /** 'HH:mm' */
  slotMinTime?: string;
  slotMaxTime?: string;
  /** Pixel height of one slot row in time-grid views. Default 28. */
  slotHeight?: number;
  /** Fixed height in px or CSS value; 'auto' grows with content. */
  height?: number | string;
  /** 'HH:mm' scroll target on mount in time-grid. Default 08:00. */
  scrollTime?: string;
  /** Hide events from other months in dayGrid month. */
  showNonCurrentDates?: boolean;
  eventTimeFormat?: string;
  eventContent?: (arg: EventContentArg) => ReactNode;
  eventClassNames?: (arg: EventContentArg) => string | string[];
  dayCellClassNames?: (arg: { date: Dayjs; isToday: boolean; isOther: boolean }) => string | string[];
  noEventsContent?: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export interface CalendarCallbacks {
  onEventClick?: (info: EventClickInfo) => void;
  onDateClick?: (info: DateClickInfo) => void;
  onSelect?: (info: SelectInfo) => void;
  /** Event moved by drag-and-drop (start/end already updated on `event`). */
  onEventDrop?: (info: EventChangeInfo) => void;
  /** Event resized (start/end already updated on `event`). */
  onEventResize?: (info: EventChangeInfo) => void;
  /** Visible date range changed (navigation or view change). */
  onDatesSet?: (range: DateRange & { view: CalendarViewName }) => void;
  onNavLinkDayClick?: (date: Dayjs) => void;
  /** A dynamic event source started (true) or all of them finished (false) loading. */
  onLoading?: (isLoading: boolean) => void;
  /** A function or JSON-feed source failed. Aborted (stale) requests are not reported. */
  onEventsError?: (error: Error) => void;
}

/** What the shell passes to every view component. */
export interface CalendarViewProps extends CalendarOptions, CalendarCallbacks {
  view: CalendarViewName;
  /** Anchor date of the visible range. */
  date: Dayjs;
  events: CalendarEvent[];
  dayjs: LocaleDayjs;
  /** Called by views to switch view/date (nav links, "+N more", year month titles). */
  goTo: (view: CalendarViewName, date: Dayjs) => void;
}
