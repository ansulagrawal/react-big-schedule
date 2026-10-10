import type SchedulerData from '../components/SchedulerData';
import { CellUnit, ViewType } from '../config/default';
import type { Behaviors, CustomDate, DateInput, HeaderCell, Id, SchedulerEvent, SummaryResult } from '../types';

/** `new Date(x)` for any dayjs input (a Dayjs is converted through its millisecond value, as `new Date` does). */
export const toDate = (d: DateInput): Date =>
  new Date(typeof d === 'string' || typeof d === 'number' || d instanceof Date ? d : d.valueOf());

export const getSummary = (): SummaryResult => ({
  text: 'Summary',
  color: 'red',
  fontSize: '1.2rem',
});

export const getCustomDate = (
  schedulerData: SchedulerData,
  num: number,
  date: DateInput = schedulerData.startDate,
): CustomDate => {
  const { viewType, localeDayjs } = schedulerData;
  let startDate: CustomDate['startDate'];
  let endDate: CustomDate['endDate'];
  let cellUnit: CustomDate['cellUnit'];

  if (viewType === ViewType.Custom1) {
    const monday = localeDayjs(toDate(date)).startOf('week');
    startDate = num === 0 ? monday : localeDayjs(toDate(monday)).add(2 * num, 'weeks');
    endDate = localeDayjs(toDate(startDate)).add(1, 'weeks').endOf('week');
    cellUnit = CellUnit.Day;
  } else if (viewType === ViewType.Custom2) {
    const firstDayOfMonth = localeDayjs(toDate(date)).startOf('month');
    startDate = num === 0 ? firstDayOfMonth : localeDayjs(toDate(firstDayOfMonth)).add(2 * num, 'months');
    endDate = localeDayjs(toDate(startDate)).add(1, 'months').endOf('month');
    cellUnit = CellUnit.Day;
  } else {
    startDate = num === 0 ? date : localeDayjs(toDate(date)).add(2 * num, 'days');
    endDate = localeDayjs(toDate(startDate)).add(1, 'days');
    cellUnit = CellUnit.Hour;
  }

  return { startDate, endDate, cellUnit };
};

export const getNonAgendaViewBodyCellBgColor = (_schedulerData: SchedulerData, _slotId: Id, header: HeaderCell) =>
  header.nonWorkingTime ? undefined : '#87e8de';

export const getDateLabel = (
  schedulerData: SchedulerData,
  viewType: ViewType,
  startDate: DateInput,
  endDate: DateInput,
) => {
  const { localeDayjs } = schedulerData;
  const start = localeDayjs(toDate(startDate));
  const end = localeDayjs(endDate);
  let dateLabel = '';

  if (
    viewType === ViewType.Week ||
    (start !== end && (viewType === ViewType.Custom || viewType === ViewType.Custom1 || viewType === ViewType.Custom2))
  ) {
    dateLabel = `${start.format('MMM D')}-${end.format('D, YYYY')}`;
    if (start.month() !== end.month()) dateLabel = `${start.format('MMM D')}-${end.format('MMM D, YYYY')}`;
    if (start.year() !== end.year()) dateLabel = `${start.format('MMM D, YYYY')}-${end.format('MMM D, YYYY')}`;
  } else if (viewType === ViewType.Month) {
    dateLabel = start.format('MMMM YYYY');
  } else if (viewType === ViewType.Quarter) {
    dateLabel = `${start.format('MMM D')}-${end.format('MMM D, YYYY')}`;
  } else if (viewType === ViewType.Year) {
    dateLabel = start.format('YYYY');
  } else {
    dateLabel = start.format('MMM D, YYYY');
  }

  return dateLabel;
};

export const getEventText = (schedulerData: SchedulerData, event: SchedulerEvent) =>
  schedulerData.isEventPerspective
    ? schedulerData.resources.find(item => item.id === event.resourceId)?.name || event.title
    : event.title;

export const getScrollSpecialDayjs = (schedulerData: SchedulerData) => {
  const { localeDayjs } = schedulerData;
  return localeDayjs(new Date());
};

export const isNonWorkingTime = (schedulerData: SchedulerData, time: string) => {
  const { localeDayjs, cellUnit } = schedulerData;
  if (cellUnit === CellUnit.Hour) {
    const hour = localeDayjs(new Date(time)).hour();
    return hour < 9 || hour > 18;
  }
  const dayOfWeek = localeDayjs(new Date(time)).day();
  return dayOfWeek === 0 || dayOfWeek === 6;
};

const defaultBehaviors: Behaviors = {
  getSummaryFunc: undefined,
  getCustomDateFunc: undefined,
  getNonAgendaViewBodyCellBgColorFunc: undefined,
  getScrollSpecialDayjsFunc: getScrollSpecialDayjs,
  getDateLabelFunc: getDateLabel,
  getEventTextFunc: getEventText,
  isNonWorkingTimeFunc: isNonWorkingTime,
};

export default defaultBehaviors;
