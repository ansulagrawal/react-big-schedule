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
  /** RFC 5545 RRULE string, expanded by the recurring-events engine (Pro) or the built-in simple expander. */
  rrule?: string;
}

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
