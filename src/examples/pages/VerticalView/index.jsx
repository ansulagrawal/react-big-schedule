import { Row, Typography } from 'antd';
import { useState } from 'react';
import { DemoData, Scheduler, SchedulerData, ViewType, wrapperFun } from '../../../index';

const VerticalView = () => {
  const [viewModel, setViewModel] = useState(() => {
    const schedulerData = new SchedulerData('2022-12-22', ViewType.VerticalResource, false, false, {
      besidesWidth: 100,
      dayMaxEvents: 99,
      eventItemPopoverTrigger: 'click',
      schedulerContentHeight: 600,
      dayStartFrom: 9,
      dayStopTo: 18,
      views: [
        {
          viewName: 'Vertical',
          viewType: ViewType.VerticalResource,
          showAgenda: false,
          isEventPerspective: false,
        },
      ],
    });
    schedulerData.setResources(DemoData.resources);
    schedulerData.setEvents(DemoData.events);
    return schedulerData;
  });

  const prevClick = schedulerData => {
    schedulerData.prev();
    schedulerData.setEvents(DemoData.events);
    setViewModel({ ...schedulerData });
  };

  const nextClick = schedulerData => {
    schedulerData.next();
    schedulerData.setEvents(DemoData.events);
    setViewModel({ ...schedulerData });
  };

  const onSelectDate = (schedulerData, date) => {
    schedulerData.setDate(date);
    schedulerData.setEvents(DemoData.events);
    setViewModel({ ...schedulerData });
  };

  const onViewChange = (schedulerData, view) => {
    schedulerData.setViewType(view.viewType, view.showAgenda, view.isEventPerspective);
    schedulerData.setEvents(DemoData.events);
    setViewModel({ ...schedulerData });
  };

  return (
    <>
      <Row align="middle" justify="center">
        <Typography.Title level={2} className="m-0">
          Vertical Resource View
        </Typography.Title>
      </Row>
      <div style={{ marginTop: '20px' }}>
        <Scheduler
          schedulerData={viewModel}
          prevClick={prevClick}
          nextClick={nextClick}
          onSelectDate={onSelectDate}
          onViewChange={onViewChange}
        />
      </div>
    </>
  );
};

export default wrapperFun(VerticalView);
