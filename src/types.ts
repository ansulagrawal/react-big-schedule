import type { Dayjs } from 'dayjs';
import type { CSSProperties, ReactNode } from 'react';
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
  [extra: string]: unknown;
}

export interface Resource {
  id: Id;
  name: string;
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
  startDate: Dayjs | string;
  endDate: Dayjs | string;
  cellUnit: CellUnit;
}

export interface HeaderCell {
  time: string;
  nonWorkingTime: boolean;
  [extra: string]: unknown;
}
