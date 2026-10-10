import { Row, Typography } from 'antd';
import { useState } from 'react';
import { CellUnit, DemoData, Scheduler, SchedulerData, ViewType, wrapperFun } from '../../../index';
import SourceCode from '../../components/SourceCode';
import { URLS } from '../../constants';

const copyOf = schedulerData => Object.assign(Object.create(Object.getPrototypeOf(schedulerData)), schedulerData);

// Custom views choose the column cadence through `cellUnit`: Custom = one column per week (6 months),
// Custom1 = one column per month (a year).
const getCustomDateFunc = (schedulerData, num, date = schedulerData.startDate) => {
  const { localeDayjs, viewType } = schedulerData;
  if (viewType === ViewType.Custom1) {
    const start = localeDayjs(new Date(date)).startOf('year').add(num, 'years');
    return { startDate: start, endDate: start.endOf('year'), cellUnit: CellUnit.Month };
  }
  const start = localeDayjs(new Date(date))
    .startOf('month')
    .add(num * 6, 'months');
  return { startDate: start, endDate: start.add(5, 'months').endOf('month'), cellUnit: CellUnit.Week };
};

const getDateLabel = (schedulerData, viewType, startDate, endDate) => {
  const { localeDayjs } = schedulerData;
  const start = localeDayjs(new Date(startDate));
  const end = localeDayjs(new Date(endDate));
  return viewType === ViewType.Custom1
    ? start.format('YYYY')
    : `${start.format('MMM YYYY')} - ${end.format('MMM YYYY')}`;
};

const createSchedulerData = () => {
  const schedulerData = new SchedulerData(
    '2022-12-22',
    ViewType.Custom,
    false,
    false,
    {
      customMaxEvents: 3,
      nonAgendaWeekCellHeaderFormat: '[W]ww|MMM D',
      views: [
        { viewName: 'Weeks', viewType: ViewType.Custom, showAgenda: false, isEventPerspective: false },
        { viewName: 'Months', viewType: ViewType.Custom1, showAgenda: false, isEventPerspective: false },
      ],
    },
    { getCustomDateFunc, getDateLabelFunc: getDateLabel },
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
