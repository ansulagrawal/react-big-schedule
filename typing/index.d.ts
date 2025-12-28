import { ConfigType, Dayjs, OptionType } from 'dayjs';
import React, { CSSProperties } from 'react';

export class Scheduler<EventType extends EventItem = EventItem> extends React.Component<SchedulerProps<EventType>, any> {}

export const AddMorePopover: <EventType extends EventItem = EventItem>(props: AddMorePopoverProps<EventType>) => React.ReactElement;

export interface SchedulerProps<EventType extends EventItem = EventItem> {
  schedulerData: SchedulerData<EventType>;
  prevClick(schedulerData: SchedulerData<EventType>): void;
  nextClick(schedulerData: SchedulerData<EventType>): void;
  onSelectDate(schedulerData: SchedulerData<EventType>, date: string): void;
  onViewChange(schedulerData: SchedulerData<EventType>, view: View): void;
  eventItemClick?: (schedulerData: SchedulerData<EventType>, event: EventType) => void;
  eventItemTemplateResolver?: (
    schedulerData: SchedulerData<EventType>,
    event: EventType,
    bgColor: string,
    isStart: boolean,
    isEnd: boolean,
    mustAddCssClass: string,
    mustBeHeight: number,
    agendaMaxEventWidth: number
  ) => void;
  eventItemPopoverTemplateResolver?: (schedulerData: SchedulerData<EventType>, event: EventType, title: string, start: Dayjs, end: Dayjs, statusColor: string) => void;
  toggleExpandFunc?: (schedulerData: SchedulerData<EventType>, slotId: string) => void;
  viewEventClick?: (schedulerData: SchedulerData<EventType>, event: EventType) => void;
  viewEventText?: string;
  viewEvent2Text?: string;
  viewEvent2Click?: (schedulerData: SchedulerData<EventType>, event: EventType) => void;
  updateEventStart?: (schedulerData: SchedulerData<EventType>, event: EventType, newStart: string) => void;
  updateEventEnd?: (schedulerData: SchedulerData<EventType>, event: EventType, newEnd: string) => void;
  moveEvent?: (schedulerData: SchedulerData<EventType>, event: EventType, slotId: string, slotName: string, start: string, end: string) => void;
  newEvent?: (schedulerData: SchedulerData<EventType>, slotId: string, slotName: string, start: string, end: string, type: string, item: EventType) => void;
  onScrollLeft?: (schedulerData: SchedulerData<EventType>, schedulerContent: React.ReactNode, maxScrollLeft: number) => void;
  onScrollRight?: (schedulerData: SchedulerData<EventType>, schedulerContent: React.ReactNode, maxScrollLeft: number) => void;
  onScrollTop?: (schedulerData: SchedulerData<EventType>, schedulerContent: React.ReactNode, maxScrollTop: number) => void;
  onScrollBottom?: (schedulerData: SchedulerData<EventType>, schedulerContent: React.ReactNode, maxScrollTop: number) => void;
  onSetAddMoreState?: (newState: State<EventType>) => void;
  conflictOccurred?: (
    schedulerData: SchedulerData<EventType>,
    action: string,
    item: EventType,
    type: string,
    slotId: string,
    slotName: string,
    newStart: string,
    newEnd: string
  ) => void;
  nonAgendaCellHeaderTemplateResolver?: (
    schedulerData: SchedulerData<EventType>,
    item: { time: string; nonWorkingTime: boolean },
    formattedDateItems: string[],
    style: CSSProperties
  ) => void;
  subtitleGetter?: (schedulerData: SchedulerData<EventType>, event: EventType) => void;
  movingEvent?: (
    schedulerData: SchedulerData<EventType>,
    slotId: string,
    slotName: string,
    newStart: string,
    newEnd: string,
    action: string,
    type: string,
    item: EventType
  ) => void;
  slotClickedFunc?: (schedulerData: SchedulerData<EventType>, slot: ResourceEvent<EventType>) => void;
  slotItemTemplateResolver?: (
    schedulerData: SchedulerData<EventType>,
    slot: ResourceEvent<EventType>,
    slotClickedFunc: (schedulerData: SchedulerData<EventType>, slot: ResourceEvent<EventType>) => void,
    width: number,
    clsName: string
  ) => void;
  leftCustomHeader?: React.ReactNode;
  rightCustomHeader?: React.ReactNode;
  dndSources?: DnDSource[];
  parentRef?: React.RefObject<any>;
}

export interface AddMorePopoverProps<EventType extends EventItem = EventItem> {
  schedulerData: SchedulerData<EventType>;
  headerItem: HeaderItem<EventType>;
  left: number;
  top: number;
  height: number;
  closeAction: (newState: State<EventType>) => void;
  subtitleGetter?: SchedulerProps<EventType>['subtitleGetter'];
  moveEvent?: SchedulerProps<EventType>['moveEvent'];
  eventItemClick?: SchedulerProps<EventType>['eventItemClick'];
  viewEventClick?: SchedulerProps<EventType>['viewEventClick'];
  viewEventText?: string;
  viewEvent2Text?: string;
  viewEvent2Click?: SchedulerProps<EventType>['viewEvent2Click'];
  eventItemTemplateResolver?: SchedulerProps<EventType>['eventItemTemplateResolver'];
}

export class SchedulerData<EventType extends EventItem = EventItem> {
  localeDayjs(date?: ConfigType): Dayjs;
  localeDayjs(date?: ConfigType, format?: OptionType, strict?: boolean): Dayjs;
  localeDayjs(date?: ConfigType, format?: OptionType, locale?: string, strict?: boolean): Dayjs;

  cellUnit: CellUnit;
  viewType: ViewType;
  startDate: string;
  config: SchedulerDataConfig;
  resources: Resource[];
  events: EventType[];
  eventGroups: EventGroup<EventType>[];
  eventGroupsAutoGenerated: boolean;
  showAgenda: boolean;
  isEventPerspective: boolean;
  resizing: boolean;
  scrollToSpecialDayjs: boolean;
  documentWidth: number;
  behaviors: SchedulerDataBehaviors<EventType>;

  constructor(
    date?: string | Dayjs,
    viewType?: ViewType,
    showAgenda?: boolean,
    isEventPerspective?: boolean,
    newConfig?: SchedulerDataConfig,
    newBehaviours?: SchedulerDataBehaviors<EventType>
  );

  setSchedulerLocale(preset: string | ILocale, object?: Partial<ILocale>): void;
  setCalendarPopoverLocale(lang: string): void;
  setResources(resources: Resource[]): void;
  setEvents(events: EventType[]): void;
  prev(): void;
  next(): void;
  setViewType(viewType?: ViewType, showAgenda?: boolean, isEventPerspective?: boolean): void;
  setDate(date?: string): void;
  setEventGroups(eventGroups: EventGroup<EventType>[]): void;
  setEventGroupsAutoGenerated(autoGenerated: boolean): void;
  setMinuteStep(minuteStep: number): void;
  getMinuteStepsInHour(): number;
  addEventGroup(eventGroup: EventGroup<EventType>): void;
  updateEventStart(event: EventType, newStart: string): void;
  updateEventEnd(event: EventType, newEnd: string): void;
  moveEvent(event: EventType, newSlotId: string, newSlotName: string, newStart: string, newEnd: string): void;
  getSlots(): EventGroup<EventType>[] | Resource[];
  addResource(resource: Resource): void;
  getSlotById(slotId: string): EventType;
  toggleExpandStatus(slotId: string): void;
  removeEventById(eventId: string): void;
  removeEvent(event: EventType): void;
  isEventInTimeWindow(eventStart: Date | Dayjs, eventEnd: Date | Dayjs, windowStart: Date | Dayjs, windowEnd: Date | Dayjs): boolean;
  addEvent(newEvent: EventType): void;
  getResourceById(resourceId: string): ResourceEvent<EventType>;
  getViewStartDate(): Dayjs;
  getViewEndDate(): Dayjs;
  getViewDates(): { startDate: Dayjs; endDate: Dayjs };
}

export class DnDContext {
  constructor(sources: DnDSource[], DecoratedComponent: React.ReactNode);
}

export class DnDSource {
  constructor(resolveDragObjFunc: (props: {}) => any, DecoratedComponent: React.ReactNode, dragAnDropEnabled: boolean, dndType: string);
}

export enum CellUnit {
  Day,
  Hour,
}

export enum ViewType {
  Day,
  Week,
  Month,
  Quarter,
  Year,
  Custom,
  Custom1,
  Custom2,
}

export interface View {
  viewName?: string;
  viewType: ViewType;
  showAgenda: boolean;
  isEventPerspective: boolean;
}

export interface EventGroup<EventType extends EventItem = EventItem> {
  id: string;
  name: string;
  state: EventType;
}

export interface EventItem {
  id: number | string;
  start: string;
  end: string;
  resourceId: string;
  title: string;
  bgColor?: string;
  rrule?: string;
  showPopover?: boolean;
  resizable?: boolean;
  movable?: boolean;
  startResizable?: boolean;
  endResizable?: boolean;
  groupId?: string;
  groupName?: string;
  /**
   * @deprecated This property should not be used as EXRULE has been [deprecated in RFC 5545](https://icalendar.org/iCalendar-RFC-5545/a-3-deprecated-features.html) and does not support a DTSTART property
   */
  exrule?: string;
  exdates?: string[];
  [x: string]: unknown;
}

export interface ResourceEvent<EventType extends EventItem = EventItem> {
  id: number;
  name: string;
  parentId?: string;
  groupOnly?: boolean;
  hasSummary?: boolean;
  expanded?: boolean;
  headerItems?: EventType[];
  render?: boolean;
  rowHeight: number;
  rowMaxCount: number;
}

export interface Resource {
  id: string;
  name: string;
  parentId?: string;
  groupOnly?: boolean;
}

export interface HeaderItem<EventType extends EventItem = EventItem> {
  time: string;
  start: string;
  end: string;
  addMore: number;
  addMoreIndex: number;
  count: number;
  nonWorkingTime: boolean;
  events: EventType[];
}

export interface HeaderEvent<EventType extends EventItem = EventItem> {
  render: boolean;
  span: number;
  eventItem: EventType;
}

export interface State<EventType extends EventItem = EventItem> {
  headerItem: HeaderItem<EventType>;
  left: number;
  top: number;
  height: number;
}

export interface SchedulerDataConfig {
  schedulerWidth?: `${number}%`;
  besidesWidth?: number;
  underneathHeight?: number;
  schedulerMaxHeight?: number;
  tableHeaderHeight?: number;
  schedulerContentHeight?: string | number;
  agendaResourceTableWidth?: string | number;
  agendaMaxEventWidth?: string | number;
  dayResourceTableWidth?: string | number;
  weekResourceTableWidth?: string | number;
  monthResourceTableWidth?: string | number;
  quarterResourceTableWidth?: string | number;
  yearResourceTableWidth?: string | number;
  customResourceTableWidth?: string | number;
  dayCellWidth?: string | number;
  weekCellWidth?: string | number;
  monthCellWidth?: string | number;
  quarterCellWidth?: string | number;
  yearCellWidth?: string | number;
  customCellWidth?: string | number;
  dayMaxEvents?: number;
  weekMaxEvents?: number;
  monthMaxEvents?: number;
  quarterMaxEvents?: number;
  yearMaxEvents?: number;
  customMaxEvents?: number;
  eventItemPopoverTrigger?: 'hover' | 'click';
  eventItemPopoverPlacement?:
    | 'topLeftMousePosition'
    | 'bottomLeftMousePosition'
    | 'topRightMousePosition'
    | 'bottomRightMousePosition'
    | 'top'
    | 'left'
    | 'right'
    | 'bottom'
    | 'topLeft'
    | 'topRight'
    | 'bottomLeft'
    | 'bottomRight'
    | 'leftTop'
    | 'leftBottom'
    | 'rightTop'
    | 'rightBottom';
  eventItemPopoverWidth?: number;
  eventItemHeight?: number;
  eventItemLineHeight?: number;
  nonAgendaSlotMinHeight?: number;
  dayStartFrom?: number;
  dayStopTo?: number;
  defaultEventBgColor?: string;
  selectedAreaColor?: string;
  nonWorkingTimeHeadColor?: string;
  nonWorkingTimeHeadBgColor?: string;
  nonWorkingTimeBodyBgColor?: string;
  summaryColor?: string;
  summaryPos?: SummaryPos;
  groupOnlySlotColor?: string;
  startResizable?: boolean;
  endResizable?: boolean;
  movable?: boolean;
  creatable?: boolean;
  crossResourceMove?: boolean;
  checkConflict?: boolean;
  scrollToSpecialDaysjsEnabled?: boolean;
  eventItemPopoverEnabled?: boolean;
  calendarPopoverEnabled?: boolean;
  recurringEventsEnabled?: boolean;
  viewChangeSpinEnabled?: boolean;
  dateChangeSpinEnabled?: boolean;
  headerEnabled?: boolean;
  resourceViewEnabled?: boolean;
  displayWeekend?: boolean;
  relativeMove?: boolean;
  defaultExpanded?: boolean;
  dragAndDropEnabled?: boolean;
  schedulerHeaderEventsFuncsTimeoutMs?: number;
  resourceName?: string;
  taskName?: string;
  agendaViewHeader?: string;
  addMorePopoverHeaderFormat?: string;
  eventItemPopoverDateFormat?: string;
  nonAgendaDayCellHeaderFormat?: string;
  nonAgendaOtherCellHeaderFormat?: string;
  minuteStep?: number;
  views?: View[];
  responsiveByParent?: boolean;
}

export enum SummaryPos {
  Top,
  TopRight,
  TopLeft,
  Bottom,
  BottomRight,
  BottomLeft,
}

export interface SchedulerDataBehaviors<EventType extends EventItem = EventItem> {
  isNonWorkingTimeFunc?: (schedulerData: SchedulerData<EventType>, time: string) => boolean;
  getCustomDateFunc?: (schedulerData: SchedulerData<EventType>, num: number, date?: string | Dayjs) => { startDate: string | Dayjs; endDate: string | Dayjs; cellUnit: CellUnit };
  getEventTextFunc?: (schedulerData: SchedulerData<EventType>, event: EventType) => string;
  getDateLabel?: (schedulerData: SchedulerData<EventType>, viewType: ViewType, startDate: string | Date, endDate: string | Date) => string;
  getScrollSpecialDayjs?: (schedulerData: SchedulerData<EventType>, startDayjs: Dayjs, endDays: Dayjs) => Dayjs;
  getSummaryFunc?: (
    schedulerData: SchedulerData<EventType>,
    headerEvents: HeaderEvent<EventType>[],
    slotId: string,
    slotName: string,
    headerStart: string,
    headerEnd: string
  ) => { text: string; color: string; fontSize: string };
  getNonAgendaViewBodyCellBgColorFunc?: (schedulerData: SchedulerData<EventType>, slotId: string, header: { nonWorkingTime: boolean; time: string }) => string;
}

export const DATE_FORMAT = 'YYYY-MM-DD';

export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
