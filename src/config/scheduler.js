import { SummaryPos, ViewType } from './default';

/**
 * Default scheduler configuration
 *
 * User-facing strings (resourceName, taskName, agendaViewHeader, weekNumberLabel)
 * are set to English defaults but can be overridden through:
 * 1. Passing a custom config object when creating SchedulerData
 * 2. Using setLabelsProvider() from the i18n module to set a custom labels provider
 * 3. Directly modifying config properties after instantiation
 */
export default {
  schedulerWidth: '100%',
  besidesWidth: 20,
  underneathHeight: 20,
  schedulerMaxHeight: 0,
  tableHeaderHeight: 40,
  schedulerContentHeight: '500px',

  responsiveByParent: false,

  agendaResourceTableWidth: 160,
  agendaMaxEventWidth: 100,

  dayResourceTableWidth: 160,
  weekResourceTableWidth: '16%',
  monthResourceTableWidth: 160,
  quarterResourceTableWidth: 160,
  yearResourceTableWidth: 160,
  customResourceTableWidth: 160,

  dayCellWidth: 30,
  weekCellWidth: '12%',
  monthCellWidth: 80,
  quarterCellWidth: 80,
  yearCellWidth: 80,
  customCellWidth: 80,

  dayMaxEvents: 99,
  weekMaxEvents: 99,
  monthMaxEvents: 99,
  quarterMaxEvents: 99,
  yearMaxEvents: 99,
  customMaxEvents: 99,

  eventItemPopoverTrigger: 'hover',
  eventItemPopoverPlacement: 'bottomLeft',
  eventItemPopoverWidth: 300,

  eventItemHeight: 22,
  eventItemLineHeight: 24,
  nonAgendaSlotMinHeight: 0,
  dayStartFrom: 0,
  dayStopTo: 23,
  defaultEventBgColor: '#80C5F6',
  selectedAreaColor: '#7EC2F3',
  nonWorkingTimeHeadColor: '#999999',
  nonWorkingTimeHeadBgColor: '#fff0f6',
  nonWorkingTimeBodyBgColor: '#fff0f6',
  summaryColor: '#666',
  summaryPos: SummaryPos.TopRight,
  groupOnlySlotColor: '#F8F8F8',
  headerBorderColor: '#e9e9e9',
  weekNumberRowHeight: 24,

  showWeekNumber: false,
  startResizable: true,
  endResizable: true,
  movable: true,
  creatable: true,
  crossResourceMove: true,
  checkConflict: false,
  scrollToSpecialDayjsEnabled: true,
  eventItemPopoverEnabled: true,
  eventItemPopoverShowColor: true,
  calendarPopoverEnabled: true,
  recurringEventsEnabled: true,
  viewChangeSpinEnabled: true,
  dateChangeSpinEnabled: true,
  headerEnabled: true,
  resourceViewEnabled: true,
  displayWeekend: true,
  relativeMove: true,
  defaultExpanded: true,
  dragAndDropEnabled: true,

  schedulerHeaderEventsFuncsTimeoutMs: 100,

  resourceName: 'Resource Name',
  taskName: 'Task Name',
  agendaViewHeader: 'Agenda',
  weekNumberLabel: 'Week No.',
  addMorePopoverHeaderFormat: 'MMM D, YYYY dddd',
  eventItemPopoverDateFormat: 'MMM D',
  nonAgendaDayCellHeaderFormat: 'ha',
  nonAgendaWeekCellHeaderFormat: 'ww/YYYY',
  nonAgendaMonthCellHeaderFormat: 'MMM YYYY',
  nonAgendaYearCellHeaderFormat: 'YYYY',
  nonAgendaOtherCellHeaderFormat: 'ddd M/D',

  minuteStep: 30,

  views: [
    { viewName: 'Day', viewType: ViewType.Day, showAgenda: false, isEventPerspective: false },
    { viewName: 'Week', viewType: ViewType.Week, showAgenda: false, isEventPerspective: false },
    { viewName: 'Month', viewType: ViewType.Month, showAgenda: false, isEventPerspective: false },
    { viewName: 'Quarter', viewType: ViewType.Quarter, showAgenda: false, isEventPerspective: false },
    { viewName: 'Year', viewType: ViewType.Year, showAgenda: false, isEventPerspective: false },
  ],
};
