import { Row, Typography } from 'antd';
import { useState } from 'react';
import { getNextNumericEventId } from '../../../helper/utility';
import { DemoData, Scheduler, SchedulerData, ViewType, wrapperFun } from '../../../index';
import { messages } from '../../helpers/messages';

const VerticalView = () => {
  const [viewModel, setViewModel] = useState(() => {
    const schedulerData = new SchedulerData('2022-12-22', ViewType.VerticalResource, false, false, {
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
    schedulerData.setEvents(schedulerData.events);
    setViewModel(Object.assign(Object.create(Object.getPrototypeOf(schedulerData)), schedulerData));
  };

  const nextClick = schedulerData => {
    schedulerData.next();
    schedulerData.setEvents(schedulerData.events);
    setViewModel(Object.assign(Object.create(Object.getPrototypeOf(schedulerData)), schedulerData));
  };

  const onSelectDate = (schedulerData, date) => {
    schedulerData.setDate(date);
    schedulerData.setEvents(schedulerData.events);
    setViewModel(Object.assign(Object.create(Object.getPrototypeOf(schedulerData)), schedulerData));
  };

  const onViewChange = (schedulerData, view) => {
    schedulerData.setViewType(view.viewType, view.showAgenda, view.isEventPerspective);
    schedulerData.setEvents(schedulerData.events);
    setViewModel(Object.assign(Object.create(Object.getPrototypeOf(schedulerData)), schedulerData));
  };

  const newEvent = (schedulerData, slotId, slotName, start, end, _type, item) => {
    if (!confirm(messages.create(slotName, start, end))) return;

    const resourceIds = Array.isArray(item?.resourceIds) && item.resourceIds.length > 0 ? item.resourceIds : [slotId];
    schedulerData.addEvent({
      id: getNextNumericEventId(schedulerData.events),
      title: 'New event you just created',
      start,
      end,
      resourceId: resourceIds[0],
      resourceIds,
      bgColor: 'purple',
    });
    setViewModel(Object.assign(Object.create(Object.getPrototypeOf(schedulerData)), schedulerData));
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
          newEvent={newEvent}
        />
      </div>
    </>
  );
};

export default wrapperFun(VerticalView);
