import { Row, Typography } from 'antd';
import { useState } from 'react';
import { DemoData, Scheduler, SchedulerData, ViewType, wrapperFun } from '../../../index';
import SourceCode from '../../components/SourceCode';
import { URLS } from '../../constants';

const copyOf = schedulerData => Object.assign(Object.create(Object.getPrototypeOf(schedulerData)), schedulerData);

const createSchedulerData = () => {
  const schedulerData = new SchedulerData('2022-12-22', ViewType.Quarter, false, false, {
    // header rows: month names, then week numbers, then the day cells
    showMonthRow: true,
    showWeekNumber: true,
    schedulerMaxHeight: 400,
    views: [
      { viewName: 'Quarter', viewType: ViewType.Quarter, showAgenda: false, isEventPerspective: false },
      { viewName: 'Month', viewType: ViewType.Month, showAgenda: false, isEventPerspective: false },
      { viewName: 'Week', viewType: ViewType.Week, showAgenda: false, isEventPerspective: false },
    ],
  });
  schedulerData.setResources(DemoData.resources);
  schedulerData.setEvents(DemoData.events);
  return schedulerData;
};

function GroupedHeader() {
  const [viewModel, setViewModel] = useState(createSchedulerData);

  const update = schedulerData => setViewModel(copyOf(schedulerData));

  const refresh = schedulerData => {
    schedulerData.setEvents(DemoData.events);
    update(schedulerData);
  };

  const prevClick = schedulerData => {
    schedulerData.prev();
    refresh(schedulerData);
  };

  const nextClick = schedulerData => {
    schedulerData.next();
    refresh(schedulerData);
  };

  const onSelectDate = (schedulerData, date) => {
    schedulerData.setDate(date);
    refresh(schedulerData);
  };

  const onViewChange = (schedulerData, view) => {
    schedulerData.setViewType(view.viewType, view.showAgenda, view.isEventPerspective);
    refresh(schedulerData);
  };

  return (
    <>
      <Row align="middle" justify="center">
        <Typography.Title level={2} className="m-0">
          Grouped Header Example
        </Typography.Title>
      </Row>
      <SourceCode value={URLS.examples.groupedHeader} />
      <Scheduler
        schedulerData={viewModel}
        prevClick={prevClick}
        nextClick={nextClick}
        onSelectDate={onSelectDate}
        onViewChange={onViewChange}
      />
    </>
  );
}

export default wrapperFun(GroupedHeader);
