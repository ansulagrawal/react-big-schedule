import { Row, Space, Switch, Typography } from 'antd';
import { useState } from 'react';
import { DemoData, Scheduler, SchedulerData, ViewType, wrapperFun } from '../../../index';
import SourceCode from '../../components/SourceCode';
import { URLS } from '../../constants';

const copyOf = schedulerData => Object.assign(Object.create(Object.getPrototypeOf(schedulerData)), schedulerData);

const createSchedulerData = () => {
  const schedulerData = new SchedulerData('2022-12-22', ViewType.Week, false, false, {
    // weekends are left out of the day columns
    displayWeekend: false,
    views: [
      { viewName: 'Week', viewType: ViewType.Week, showAgenda: false, isEventPerspective: false },
      { viewName: 'Month', viewType: ViewType.Month, showAgenda: false, isEventPerspective: false },
      { viewName: 'Agenda', viewType: ViewType.Week, showAgenda: true, isEventPerspective: false },
    ],
  });
  schedulerData.setResources(DemoData.resources);
  schedulerData.setEvents(DemoData.events);
  return schedulerData;
};

function HideWeekends() {
  const [viewModel, setViewModel] = useState(createSchedulerData);
  const [showWeekends, setShowWeekends] = useState(false);

  const refresh = schedulerData => {
    schedulerData.setEvents(DemoData.events);
    setViewModel(copyOf(schedulerData));
  };

  const toggleWeekends = checked => {
    viewModel.config.displayWeekend = checked;
    setShowWeekends(checked);
    // rebuild the day columns for the current date
    viewModel.setDate(viewModel.startDate);
    refresh(viewModel);
  };

  return (
    <>
      <Row align="middle" justify="center">
        <Typography.Title level={2} className="m-0">
          Hide Weekends and Agenda Example
        </Typography.Title>
      </Row>
      <SourceCode value={URLS.examples.hideWeekends} />
      <Space style={{ margin: '12px 0' }}>
        <Switch checked={showWeekends} onChange={toggleWeekends} />
        Show weekends (`displayWeekend`)
      </Space>
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

export default wrapperFun(HideWeekends);
