import { ViewType, CellUnit } from '../config/default';

export const getSummary = () => ({ text: 'Summary', color: 'red', fontSize: '1.2rem' });

export const getCustomDate = (schedulerData, num, date = schedulerData.startDate) => {
  const { viewType, localeDayjs } = schedulerData;
  let startDate;
  let endDate;
  let cellUnit;

  if (viewType === ViewType.Custom1) {
    const monday = localeDayjs(new Date(date)).startOf('week');
    startDate = num === 0 ? monday : localeDayjs(new Date(monday)).add(2 * num, 'weeks');
    endDate = localeDayjs(new Date(startDate)).add(1, 'weeks').endOf('week');
    cellUnit = CellUnit.Day;
  } else if (viewType === ViewType.Custom2) {
    const firstDayOfMonth = localeDayjs(new Date(date)).startOf('month');
    startDate = num === 0 ? firstDayOfMonth : localeDayjs(new Date(firstDayOfMonth)).add(2 * num, 'months');
    endDate = localeDayjs(new Date(startDate)).add(1, 'months').endOf('month');
    cellUnit = CellUnit.Day;
  } else {
    startDate = num === 0 ? date : localeDayjs(new Date(date)).add(2 * num, 'days');
    endDate = localeDayjs(new Date(startDate)).add(1, 'days');
    cellUnit = CellUnit.Hour;
  }

  return { startDate, endDate, cellUnit };
};

export const getNonAgendaViewBodyCellBgColor = (schedulerData, slotId, header) =>
  header.nonWorkingTime ? undefined : '#87e8de';

export const getDateLabel = (schedulerData, viewType, startDate, endDate) => {
  const { localeDayjs } = schedulerData;
  const start = localeDayjs(new Date(startDate));
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

export const getEventText = (schedulerData, event) =>
  schedulerData.isEventPerspective
    ? schedulerData.resources.find(item => item.id === event.resourceId)?.name || event.title
    : event.title;

export const getScrollSpecialDayjs = schedulerData => {
  const { localeDayjs } = schedulerData;
  return localeDayjs(new Date());
};

export const isNonWorkingTime = (schedulerData, time) => {
  const { localeDayjs, cellUnit } = schedulerData;
  if (cellUnit === CellUnit.Hour) {
    const hour = localeDayjs(new Date(time)).hour();
    return hour < 9 || hour > 18;
  }
  const dayOfWeek = localeDayjs(new Date(time)).day();
  return dayOfWeek === 0 || dayOfWeek === 6;
};

export default {
  getSummaryFunc: undefined,
  getCustomDateFunc: undefined,
  getNonAgendaViewBodyCellBgColorFunc: undefined,
  getScrollSpecialDayjsFunc: getScrollSpecialDayjs,
  getDateLabelFunc: getDateLabel,
  getEventTextFunc: getEventText,
  isNonWorkingTimeFunc: isNonWorkingTime,
};
