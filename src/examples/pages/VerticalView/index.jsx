import { Row, Typography } from 'antd';
import { useState } from 'react';
import { getNextNumericEventId } from '../../../helper/utility';
import { DemoData, Scheduler, SchedulerData, ViewType, wrapperFun } from '../../../index';
import { confirmAction } from '../../helpers/dialogs';
import { messages } from '../../helpers/messages';

// a couple of short events next to the demo data, to move and resize
const events = [
  ...DemoData.events,
  { id: 9001, title: 'Standup', start: '2022-12-22 10:00:00', end: '2022-12-22 11:30:00', resourceId: 'r5' },
  {
    id: 9002,
    title: 'Review',
    start: '2022-12-22 13:00:00',
    end: '2022-12-22 14:00:00',
    resourceId: 'r6',
    bgColor: '#f759ab',
  },
];

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
    schedulerData.setEvents(events);
    return schedulerData;
  });

  const prevClick = schedulerData => {
    schedulerData.prev();
    schedulerData.setEvents(events);
    setViewModel(Object.assign(Object.create(Object.getPrototypeOf(schedulerData)), schedulerData));
  };

  const nextClick = schedulerData => {
    schedulerData.next();
    schedulerData.setEvents(events);
    setViewModel(Object.assign(Object.create(Object.getPrototypeOf(schedulerData)), schedulerData));
  };

  const onSelectDate = (schedulerData, date) => {
    schedulerData.setDate(date);
    schedulerData.setEvents(events);
    setViewModel(Object.assign(Object.create(Object.getPrototypeOf(schedulerData)), schedulerData));
  };

  const onViewChange = (schedulerData, view) => {
    schedulerData.setViewType(view.viewType, view.showAgenda, view.isEventPerspective);
    schedulerData.setEvents(events);
    setViewModel(Object.assign(Object.create(Object.getPrototypeOf(schedulerData)), schedulerData));
  };

  const newEvent = (schedulerData, slotId, slotName, start, end, _type, item) => {
    confirmAction(messages.create(slotName, start, end), () => {
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
    });
  };

  const moveEvent = (schedulerData, event, slotId, slotName, start, end) => {
    confirmAction(messages.move(event, slotName, start, end), () => {
      schedulerData.moveEvent(event, slotId, slotName, start, end);
      setViewModel(Object.assign(Object.create(Object.getPrototypeOf(schedulerData)), schedulerData));
    });
  };

  const updateEventStart = (schedulerData, event, newStart) => {
    confirmAction(messages.adjustStart(event, newStart), () => {
      schedulerData.updateEventStart(event, newStart);
      setViewModel(Object.assign(Object.create(Object.getPrototypeOf(schedulerData)), schedulerData));
    });
  };

  const updateEventEnd = (schedulerData, event, newEnd) => {
    confirmAction(messages.adjustEnd(event, newEnd), () => {
      schedulerData.updateEventEnd(event, newEnd);
      setViewModel(Object.assign(Object.create(Object.getPrototypeOf(schedulerData)), schedulerData));
    });
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
          moveEvent={moveEvent}
          updateEventStart={updateEventStart}
          updateEventEnd={updateEventEnd}
        />
      </div>
    </>
  );
};

export default wrapperFun(VerticalView);
