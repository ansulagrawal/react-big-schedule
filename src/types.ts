import type dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import type { CSSProperties, ReactNode } from 'react';
import type SchedulerData from './components/SchedulerData';
import type { CellUnit, SummaryPos, ViewType } from './config/default';

export type Id = string | number;

export interface SchedulerEvent {
  id: Id;
  title: string;
  start: string;
  end: string;
  resourceId: Id;
  bgColor?: string;
  rrule?: string;
  movable?: boolean;
  resizable?: boolean;
  startResizable?: boolean;
  endResizable?: boolean;
  showPopover?: boolean;
  clickable1?: boolean;
  clickable2?: boolean;
  groupId?: Id;
  groupName?: string;
  /** Multi-resource event: shown on every listed resource row. */
  resourceIds?: Id[];
  exdates?: (string | Date)[];
  exrule?: string;
  recurringEventId?: Id;
  recurringEventStart?: string;
  recurringEventEnd?: string;
  [extra: string]: unknown;
}

export interface Resource {
  id: Id;
  name: string;
  title?: string;
  parentId?: Id;
  groupOnly?: boolean;
  expanded?: boolean;
  hidden?: boolean;
  [extra: string]: unknown;
}

export interface ViewConfig {
  viewName: string;
  viewType: ViewType;
  showAgenda: boolean;
  isEventPerspective: boolean;
}

export type Size = number | string;

export interface SchedulerConfig {
  schedulerWidth: Size;
  underneathHeight: number;
  schedulerMaxHeight: number;
  tableHeaderHeight: number;
  schedulerContentHeight: Size;
  responsiveByParent: boolean;
  agendaResourceTableWidth: Size;
  agendaMaxEventWidth: number;
  dayResourceTableWidth: Size;
  weekResourceTableWidth: Size;
  monthResourceTableWidth: Size;
  quarterResourceTableWidth: Size;
  yearResourceTableWidth: Size;
  customResourceTableWidth: Size;
  dayCellWidth: Size;
  weekCellWidth: Size;
  monthCellWidth: Size;
  quarterCellWidth: Size;
  yearCellWidth: Size;
  customCellWidth: Size;
  dayMaxEvents: number;
  weekMaxEvents: number;
  monthMaxEvents: number;
  quarterMaxEvents: number;
  yearMaxEvents: number;
  customMaxEvents: number;
  eventItemPopoverTrigger: 'hover' | 'click';
  /** top|bottom + Left|Right, optionally suffixed with MousePosition. */
  eventItemPopoverPlacement: string;
  eventItemPopoverWidth: number;
  eventItemHeight: number;
  eventItemLineHeight: number;
  nonAgendaSlotMinHeight: number;
  dayStartFrom: number;
  dayStopTo: number;
  defaultEventBgColor: string;
  selectedAreaColor: string;
  nonWorkingTimeHeadColor: string;
  nonWorkingTimeHeadBgColor: string;
  nonWorkingTimeBodyBgColor: string;
  summaryColor: string;
  summaryPos: SummaryPos;
  groupOnlySlotColor: string;
  headerBorderColor: string;
  selectedSlotBorderColor?: string;
  selectedSlotShadowColor?: string;
  selectedSlotColor?: string;
  schedulerHeight?: Size;
  weekNumberRowHeight: number;
  showWeekNumber: boolean;
  showMonthRow: boolean;
  monthRowHeight: number;
  dropPreviewEnabled: boolean;
  dropPreviewClassName: string;
  dropPreviewStyle?: CSSProperties;
  /** Colour scheme: built-in 'light' | 'dark' | 'classic', or any custom data-rbs-theme value. */
  theme?: string;
  startResizable: boolean;
  endResizable: boolean;
  movable: boolean;
  creatable: boolean;
  crossResourceMove: boolean;
  checkConflict: boolean;
  scrollToSpecialDayjsEnabled: boolean;
  eventItemPopoverEnabled: boolean;
  eventItemPopoverShowColor: boolean;
  calendarPopoverEnabled: boolean;
  recurringEventsEnabled: boolean;
  viewChangeSpinEnabled: boolean;
  dateChangeSpinEnabled: boolean;
  headerEnabled: boolean;
  resourceViewEnabled: boolean;
  displayWeekend: boolean;
  relativeMove: boolean;
  defaultExpanded: boolean;
  dragAndDropEnabled: boolean;
  schedulerHeaderEventsFuncsTimeoutMs: number;
  resourceName: string;
  taskName: string;
  agendaViewHeader: string;
  weekNumberLabel: string;
  addMorePopoverHeaderFormat: string;
  eventItemPopoverDateFormat: string;
  nonAgendaDayCellHeaderFormat: string;
  nonAgendaWeekCellHeaderFormat: string;
  nonAgendaMonthCellHeaderFormat: string;
  nonAgendaYearCellHeaderFormat: string;
  nonAgendaQuarterCellHeaderFormat: string;
  nonAgendaOtherCellHeaderFormat: string;
  minuteStep: number;
  views: ViewConfig[];
  [extra: string]: unknown;
}

export interface SummaryResult {
  text: ReactNode;
  color: string;
  fontSize: string;
}

export interface CustomDate {
  startDate: DateInput;
  endDate: DateInput;
  cellUnit: CellUnit;
}

export interface HeaderCell {
  time: string;
  nonWorkingTime?: boolean;
  [extra: string]: unknown;
}

export interface HeaderEvent {
  render: boolean;
  span: number;
  eventItem: SchedulerEvent;
  [extra: string]: unknown;
}

/** One timeline cell of a slot row (events falling in that cell). */
export interface HeaderItem {
  time: string;
  start: string;
  end: string;
  nonWorkingTime?: boolean;
  id: Id;
  style: CSSProperties;
  count: number;
  addMore: number;
  addMoreIndex: number;
  summary?: SummaryResult;
  events: (HeaderEvent | undefined)[];
  [extra: string]: unknown;
}

/** One rendered slot row (resource or event group). */
export interface RenderItem {
  slotId: Id;
  slotName: string;
  slotTitle?: string;
  parentId?: Id;
  groupOnly?: boolean;
  hasSummary: boolean;
  rowMaxCount: number;
  rowHeight: number;
  headerItems: HeaderItem[];
  indent: number;
  hasChildren: boolean;
  expanded: boolean;
  render: boolean;
  nonWorkingTime?: boolean;
  [extra: string]: unknown;
}

/** Props shared by the event popover and the components that forward them to it. */
export interface EventPopoverCallbacks {
  subtitleGetter?: (schedulerData: SchedulerData, eventItem: SchedulerEvent) => ReactNode;
  eventItemClick?: (schedulerData: SchedulerData, eventItem: SchedulerEvent) => void;
  viewEventClick?: (schedulerData: SchedulerData, eventItem: SchedulerEvent) => void;
  viewEventText?: string;
  viewEvent2Click?: (schedulerData: SchedulerData, eventItem: SchedulerEvent) => void;
  viewEvent2Text?: string;
  eventItemTemplateResolver?: (
    schedulerData: SchedulerData,
    eventItem: SchedulerEvent,
    bgColor: string,
    isStart: boolean,
    isEnd: boolean,
    mustAddCssClass: string,
    mustBeHeight: number,
    agendaMaxEventWidth?: number,
  ) => ReactNode;
  eventItemPopoverTemplateResolver?: (
    schedulerData: SchedulerData,
    eventItem: SchedulerEvent,
    title: string,
    start: Dayjs,
    end: Dayjs,
    statusColor: string,
  ) => ReactNode;
}

export type SlotClickedFunc = (schedulerData: SchedulerData, slot: RenderItem) => void;
export type SlotItemTemplateResolver = (
  schedulerData: SchedulerData,
  slot: RenderItem,
  slotClickedFunc: SlotClickedFunc | undefined,
  width: number,
  className: string,
) => ReactNode;

/** Payload passed to conflictOccurred when a brand-new event (drag-select) conflicts. */
export interface NewEventDraft {
  id: undefined;
  start: string;
  end: string;
  resourceId: Id;
  resourceIds: Id[];
  slotId: Id;
  slotName: string;
  title: undefined;
}

/** Anything dayjs (and so localeDayjs) accepts as a date. */
export type DateInput = string | number | Date | Dayjs;

/** A dayjs locale name or locale object. */
export type LocalePreset = NonNullable<Parameters<typeof dayjs.locale>[0]>;

/** Per-instance dayjs factory (locale applied per created date, see SchedulerData). */
export interface LocaleDayjs {
  (date?: DateInput, format?: string, strict?: boolean): Dayjs;
  locale(): string;
  locale(preset: LocalePreset): LocaleDayjs;
  utc: (date?: DateInput) => Dayjs;
  /** Interpret a wall-clock string in an IANA zone (or convert a Date / timestamp / Dayjs into it). */
  tz: (date: DateInput, zone: string) => Dayjs;
}

/** Event group used by the event-perspective views. */
export interface EventGroup {
  id: Id;
  name: string;
  title?: string;
  parentId?: Id;
  groupOnly?: boolean;
  state?: SchedulerEvent;
  [extra: string]: unknown;
}

export type Slot = Resource | EventGroup;

/** A column header of the timeline (or a resource in the vertical resource view). */
export interface Header {
  time: string;
  name?: string;
  nonWorkingTime?: boolean;
  style?: CSSProperties;
  id?: Id;
  [extra: string]: unknown;
}

export interface Behaviors {
  getSummaryFunc?: (
    schedulerData: SchedulerData,
    headerEvents: SchedulerEvent[],
    slotId: Id,
    slotName: string,
    headerStart: string,
    headerEnd: string,
  ) => SummaryResult;
  getCustomDateFunc?: (schedulerData: SchedulerData, num: number, date?: DateInput) => CustomDate;
  getNonAgendaViewBodyCellBgColorFunc?: (
    schedulerData: SchedulerData,
    slotId: Id,
    header: HeaderCell,
  ) => string | undefined;
  getScrollSpecialDayjsFunc: (schedulerData: SchedulerData, start?: Dayjs, end?: Dayjs) => Dayjs;
  getDateLabelFunc: (
    schedulerData: SchedulerData,
    viewType: ViewType,
    startDate: DateInput,
    endDate: DateInput,
  ) => string;
  getEventTextFunc: (schedulerData: SchedulerData, event: SchedulerEvent) => string;
  isNonWorkingTimeFunc: (schedulerData: SchedulerData, time: string) => boolean;
}
