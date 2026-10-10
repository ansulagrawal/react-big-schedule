import { Row, Typography } from 'antd';
import { useState } from 'react';
import { CellUnit, DemoData, Scheduler, SchedulerData, SummaryPos, ViewType, wrapperFun } from '../../../index';
import SourceCode from '../../components/SourceCode';
import { URLS } from '../../constants';

const copyOf = schedulerData => Object.assign(Object.create(Object.getPrototypeOf(schedulerData)), schedulerData);

// Custom views choose the column cadence through `cellUnit`: Custom = one column per week (6 months),
// Custom1 = one column per month (a year), Custom2 = one column per quarter (two years).
const getCustomDateFunc = (schedulerData, num, date = schedulerData.startDate) => {
  const { localeDayjs, viewType } = schedulerData;
  if (viewType === ViewType.Custom2) {
    const start = localeDayjs(date)
      .startOf('year')
      .add(num * 2, 'years');
    return { startDate: start, endDate: start.add(1, 'years').endOf('year'), cellUnit: CellUnit.Quarter };
  }
  if (viewType === ViewType.Custom1) {
    const start = localeDayjs(date).startOf('year').add(num, 'years');
    return { startDate: start, endDate: start.endOf('year'), cellUnit: CellUnit.Month };
  }
  const start = localeDayjs(date)
    .startOf('month')
    .add(num * 6, 'months')
    // weekly columns advance from Monday, so start on a week boundary too
    .startOf('isoWeek');
  return { startDate: start, endDate: start.add(5, 'months').endOf('month'), cellUnit: CellUnit.Week };
};

const getDateLabel = (schedulerData, viewType, startDate, endDate) => {
  const { localeDayjs } = schedulerData;
  const start = localeDayjs(startDate);
  const end = localeDayjs(endDate);
  if (viewType === ViewType.Custom1) return start.format('YYYY');
  if (viewType === ViewType.Custom2) return `${start.format('YYYY')} - ${end.format('YYYY')}`;
  return `${start.format('MMM YYYY')} - ${end.format('MMM YYYY')}`;
};

// Cell summary: number of events starting in the cell
const getSummaryFunc = (_schedulerData, headerEvents) => ({
  text: headerEvents.length > 0 ? String(headerEvents.length) : '',
  color: '#262626',
  fontSize: '12px',
});

const createSchedulerData = () => {
  const schedulerData = new SchedulerData(
    '2022-12-22',
    ViewType.Custom,
    false,
    false,
    {
      customMaxEvents: 3,
      summaryPos: SummaryPos.Top,
      nonAgendaWeekCellHeaderFormat: '[W]ww|MMM D',
      nonAgendaMonthCellHeaderFormat: 'MMM|YYYY',
      nonAgendaQuarterCellHeaderFormat: '[Q]Q|YYYY',
      views: [
        { viewName: 'Weeks', viewType: ViewType.Custom, showAgenda: false, isEventPerspective: false },
        { viewName: 'Months', viewType: ViewType.Custom1, showAgenda: false, isEventPerspective: false },
        { viewName: 'Quarters', viewType: ViewType.Custom2, showAgenda: false, isEventPerspective: false },
      ],
    },
    { getCustomDateFunc, getDateLabelFunc: getDateLabel, getSummaryFunc },
  );
  schedulerData.setResources(DemoData.resources);
  schedulerData.setEvents(DemoData.events);
  return schedulerData;
};

function Cadence() {
  const [viewModel, setViewModel] = useState(createSchedulerData);

  const refresh = schedulerData => {
    schedulerData.setEvents(DemoData.events);
    setViewModel(copyOf(schedulerData));
  };

  return (
    <>
      <Row align="middle" justify="center">
        <Typography.Title level={2} className="m-0">
          Weekly / Monthly Columns Example
        </Typography.Title>
      </Row>
      <SourceCode value={URLS.examples.cadence} />
      <Scheduler
        schedulerData={viewModel}
        prevClick={schedulerData => {
          schedulerData.prev();
          refresh(schedulerData);
        }}
        nextClick={schedulerData => {
          schedulerData.next();
          refresh(schedulerData);
        }}
        onSelectDate={(schedulerData, date) => {
          schedulerData.setDate(date);
          refresh(schedulerData);
        }}
        onViewChange={(schedulerData, view) => {
          schedulerData.setViewType(view.viewType, view.showAgenda, view.isEventPerspective);
          refresh(schedulerData);
        }}
      />
    </>
  );
}

export default wrapperFun(Cadence);
