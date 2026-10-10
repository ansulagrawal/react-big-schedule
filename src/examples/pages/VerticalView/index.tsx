import dayjs from 'dayjs';
import { useState } from 'react';
import { getNextNumericEventId } from '../../../helper/utility';
import { DemoData, SchedulerData, ViewType, wrapperFun } from '../../../index';
import type { SchedulerEvent } from '../../../types';
import PageHeader from '../../components/PageHeader';
import Scheduler from '../../components/ThemedScheduler';
import { confirmAction } from '../../helpers/dialogs';
import { messages } from '../../helpers/messages';
import { asViewType, copyOf, type SP } from '../../helpers/scheduler';

// a couple of short events next to the demo data, to move and resize (today, so the demo is never stale)
const today = dayjs().format('YYYY-MM-DD');
const events: SchedulerEvent[] = [
  ...DemoData.events,
  { id: 9001, title: 'Standup', start: `${today} 10:00:00`, end: `${today} 11:30:00`, resourceId: 'r5' },
  {
    id: 9002,
    title: 'Review',
    start: `${today} 13:00:00`,
    end: `${today} 14:00:00`,
    resourceId: 'r6',
    bgColor: '#f759ab',
  },
];

const createSchedulerData = () => {
  const schedulerData = new SchedulerData(new Date(), ViewType.VerticalResource, false, false, {
    dayMaxEvents: 99,
    eventItemPopoverTrigger: 'click',
    schedulerContentHeight: 600,
    dayStartFrom: 9,
    dayStopTo: 18,
    views: [
      { viewName: 'Vertical', viewType: ViewType.VerticalResource, showAgenda: false, isEventPerspective: false },
    ],
  });
  schedulerData.setResources(DemoData.resources);
  schedulerData.setEvents(events);
  return schedulerData;
};

function VerticalView() {
  const [viewModel, setViewModel] = useState(createSchedulerData);

  const update = (schedulerData: SchedulerData) => setViewModel(copyOf(schedulerData));

  const prevClick: SP['prevClick'] = schedulerData => {
    schedulerData.prev();
    schedulerData.setEvents(events);
    update(schedulerData);
  };

  const nextClick: SP['nextClick'] = schedulerData => {
    schedulerData.next();
    schedulerData.setEvents(events);
    update(schedulerData);
  };

  const onSelectDate: SP['onSelectDate'] = (schedulerData, date) => {
    schedulerData.setDate(date);
    schedulerData.setEvents(events);
    update(schedulerData);
  };

  const onViewChange: SP['onViewChange'] = (schedulerData, view) => {
    schedulerData.setViewType(asViewType(view.viewType), view.showAgenda, view.isEventPerspective);
    schedulerData.setEvents(events);
    update(schedulerData);
  };

  const newEvent: NonNullable<SP['newEvent']> = (schedulerData, slotId, slotName, start, end, _type, item) => {
    confirmAction(messages.create(slotName, start, end), () => {
      const resourceIds = Array.isArray(item?.resourceIds) && item.resourceIds.length > 0 ? item.resourceIds : [slotId];
      schedulerData.addEvent({
        id: getNextNumericEventId(schedulerData.events),
        title: 'New event you just created',
        start,
        end,
        resourceId: resourceIds[0] ?? slotId,
        resourceIds,
        bgColor: 'purple',
      });
      update(schedulerData);
    });
  };

  const moveEvent: NonNullable<SP['moveEvent']> = (schedulerData, event, slotId, slotName, start, end) => {
    confirmAction(messages.move(event, slotName, start, end), () => {
      schedulerData.moveEvent(event, slotId, slotName, start, end);
      update(schedulerData);
    });
  };

  const updateEventStart: NonNullable<SP['updateEventStart']> = (schedulerData, event, newStart) => {
    confirmAction(messages.adjustStart(event, newStart), () => {
      schedulerData.updateEventStart(event, newStart);
      update(schedulerData);
    });
  };

  const updateEventEnd: NonNullable<SP['updateEventEnd']> = (schedulerData, event, newEnd) => {
    confirmAction(messages.adjustEnd(event, newEnd), () => {
      schedulerData.updateEventEnd(event, newEnd);
      update(schedulerData);
    });
  };

  return (
    <>
      <PageHeader title="Vertical Resource View" />
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
    </>
  );
}

export default wrapperFun(VerticalView);
