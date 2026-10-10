import { useEffect, useReducer, useState } from 'react';
import type { AddMoreState } from '../../../components/ResourceEvents';
import { getNextNumericEventId } from '../../../helper/utility';
import { AddMorePopover, DemoData, SchedulerData, ViewType, wrapperFun } from '../../../index';
import Scheduler from '../../components/ThemedScheduler';
import { confirmAction, showInfo } from '../../helpers/dialogs';
import { messages } from '../../helpers/messages';
import { asViewType, type SP } from '../../helpers/scheduler';

interface State {
  showScheduler: boolean;
  viewModel?: SchedulerData;
}

type Action = { type: 'INITIALIZE' | 'UPDATE_SCHEDULER'; payload: SchedulerData };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'INITIALIZE':
      return { showScheduler: true, viewModel: action.payload };
    case 'UPDATE_SCHEDULER':
      return { ...state, viewModel: action.payload };
    default:
      return state;
  }
}

function AddMore() {
  const [state, dispatch] = useReducer(reducer, { showScheduler: false });
  const [popover, setPopover] = useState<AddMoreState | undefined>();

  useEffect(() => {
    const schedulerData = new SchedulerData('2022-12-18', ViewType.Week, false, false, {
      dayMaxEvents: 2,
      weekMaxEvents: 4,
      monthMaxEvents: 4,
      quarterMaxEvents: 4,
      yearMaxEvents: 4,
    });
    schedulerData.localeDayjs.locale('en');
    schedulerData.setResources(DemoData.resources);
    schedulerData.setEvents(DemoData.events);

    dispatch({ type: 'INITIALIZE', payload: schedulerData });
  }, []);

  const update = (schedulerData: SchedulerData) => dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });

  const prevClick: SP['prevClick'] = schedulerData => {
    schedulerData.prev();
    schedulerData.setEvents(DemoData.events);
    update(schedulerData);
  };

  const nextClick: SP['nextClick'] = schedulerData => {
    schedulerData.next();
    schedulerData.setEvents(DemoData.events);
    update(schedulerData);
  };

  const onViewChange: SP['onViewChange'] = (schedulerData, view) => {
    schedulerData.setViewType(asViewType(view.viewType), view.showAgenda, view.isEventPerspective);
    schedulerData.setEvents(DemoData.events);
    update(schedulerData);
  };

  const onSelectDate: SP['onSelectDate'] = (schedulerData, date) => {
    schedulerData.setDate(date);
    schedulerData.setEvents(DemoData.events);
    update(schedulerData);
  };

  const eventClicked: NonNullable<SP['eventItemClick']> = (_schedulerData, event) => {
    showInfo(messages.clicked(event));
  };

  const ops1: NonNullable<SP['viewEventClick']> = (_schedulerData, event) => {
    showInfo(messages.ops('Ops 1', event));
  };

  const ops2: NonNullable<SP['viewEvent2Click']> = (_schedulerData, event) => {
    showInfo(messages.ops('Ops 2', event));
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

  const updateEventStart: NonNullable<SP['updateEventStart']> = (schedulerData, event, newStart) => {
    confirmAction(messages.adjustStart(event, newStart), () => {
      schedulerData.updateEventStart(event, newStart);
    });
    update(schedulerData);
  };

  const updateEventEnd: NonNullable<SP['updateEventEnd']> = (schedulerData, event, newEnd) => {
    confirmAction(messages.adjustEnd(event, newEnd), () => {
      schedulerData.updateEventEnd(event, newEnd);
    });
    update(schedulerData);
  };

  const moveEvent: NonNullable<SP['moveEvent']> = (schedulerData, event, slotId, slotName, start, end) => {
    confirmAction(messages.move(event, slotName, start, end), () => {
      schedulerData.moveEvent(event, slotId, slotName, start, end);
      update(schedulerData);
    });
  };

  const toggleExpandFunc: NonNullable<SP['toggleExpandFunc']> = (schedulerData, slotId) => {
    schedulerData.toggleExpandStatus(slotId);
    update(schedulerData);
  };

  const { viewModel } = state;
  if (!state.showScheduler || !viewModel) return null;

  return (
    <div>
      <Scheduler
        schedulerData={viewModel}
        prevClick={prevClick}
        nextClick={nextClick}
        onSelectDate={onSelectDate}
        onViewChange={onViewChange}
        eventItemClick={eventClicked}
        viewEventClick={ops1}
        viewEventText="Ops 1"
        viewEvent2Text="Ops 2"
        viewEvent2Click={ops2}
        updateEventStart={updateEventStart}
        updateEventEnd={updateEventEnd}
        moveEvent={moveEvent}
        newEvent={newEvent}
        onSetAddMoreState={setPopover}
        toggleExpandFunc={toggleExpandFunc}
      />
      {popover && (
        <AddMorePopover
          headerItem={popover.headerItem}
          eventItemClick={eventClicked}
          viewEventClick={ops1}
          viewEventText="Ops 1"
          viewEvent2Click={ops2}
          viewEvent2Text="Ops 2"
          schedulerData={viewModel}
          closeAction={() => setPopover(undefined)}
          left={popover.left}
          top={popover.top}
          height={popover.height}
          moveEvent={moveEvent as (...args: unknown[]) => void}
        />
      )}
    </div>
  );
}

export default wrapperFun(AddMore);
