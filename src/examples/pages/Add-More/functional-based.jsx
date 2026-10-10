import { useEffect, useReducer, useState } from 'react';
import { AddMorePopover, DemoData, Scheduler, SchedulerData, ViewType, wrapperFun } from '../../../index';
import { confirmAction, showInfo } from '../../helpers/dialogs';
import { messages } from '../../helpers/messages';

let schedulerData;

const initialState = {
  showScheduler: false,
  viewModel: {},
};

function reducer(state, action) {
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
  const [state, dispatch] = useReducer(reducer, initialState);

  const [popoverState, setPopoverState] = useState({
    headerItem: undefined,
    left: 0,
    top: 0,
    height: 0,
  });

  useEffect(() => {
    schedulerData = new SchedulerData('2022-12-18', ViewType.Week, false, false, {
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

  const prevClick = schedulerData => {
    schedulerData.prev();
    schedulerData.setEvents(DemoData.events);
    dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
  };

  const nextClick = schedulerData => {
    schedulerData.next();
    schedulerData.setEvents(DemoData.events);
    dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
  };

  const onViewChange = (schedulerData, view) => {
    schedulerData.setViewType(view.viewType, view.showAgenda, view.isEventPerspective);
    schedulerData.setEvents(DemoData.events);
    dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
  };

  const onSelectDate = (schedulerData, date) => {
    schedulerData.setDate(date);
    schedulerData.setEvents(DemoData.events);
    dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
  };

  const eventClicked = (_schedulerData, event) => {
    showInfo(messages.clicked(event));
  };

  const ops1 = (_schedulerData, event) => {
    showInfo(messages.ops('Ops 1', event));
  };

  const ops2 = (_schedulerData, event) => {
    showInfo(messages.ops('Ops 2', event));
  };

  const newEvent = (schedulerData, slotId, slotName, start, end, _type, item) => {
    confirmAction(messages.create(slotName, start, end), () => {
      let newFreshId = 0;
      schedulerData.events.forEach(existingEvent => {
        if (existingEvent.id >= newFreshId) newFreshId = existingEvent.id + 1;
      });
      const hasResourceIds = Array.isArray(item?.resourceIds) && item.resourceIds.length > 0;

      const newEvent = {
        id: newFreshId,
        title: 'New event you just created',
        start,
        end,
        resourceId: hasResourceIds ? item.resourceIds[0] : slotId,
        resourceIds: hasResourceIds ? item.resourceIds : [slotId],
        bgColor: 'purple',
      };
      schedulerData.addEvent(newEvent);
      dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
    });
  };

  const updateEventStart = (schedulerData, event, newStart) => {
    confirmAction(messages.adjustStart(event, newStart), () => {
      schedulerData.updateEventStart(event, newStart);
    });
    dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
  };

  const updateEventEnd = (schedulerData, event, newEnd) => {
    confirmAction(messages.adjustEnd(event, newEnd), () => {
      schedulerData.updateEventEnd(event, newEnd);
    });
    dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
  };

  const moveEvent = (schedulerData, event, slotId, slotName, start, end) => {
    confirmAction(messages.move(event, slotName, start, end), () => {
      schedulerData.moveEvent(event, slotId, slotName, start, end);
      dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
    });
  };

  const onSetAddMoreState = newState => {
    if (newState === undefined) {
      setPopoverState({
        headerItem: undefined,
        left: 0,
        top: 0,
        height: 0,
      });
    } else {
      setPopoverState({
        ...newState,
      });
    }
  };

  const toggleExpandFunc = (schedulerData, slotId) => {
    schedulerData.toggleExpandStatus(slotId);
    dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
  };

  let popover = <div />;
  if (popoverState.headerItem !== undefined) {
    popover = (
      <AddMorePopover
        headerItem={popoverState.headerItem}
        eventItemClick={eventClicked}
        viewEventClick={ops1}
        viewEventText="Ops 1"
        viewEvent2Click={ops2}
        viewEvent2Text="Ops 2"
        schedulerData={state.viewModel}
        closeAction={onSetAddMoreState}
        left={popoverState.left}
        top={popoverState.top}
        height={popoverState.height}
        moveEvent={moveEvent}
      />
    );
  }

  return (
    <>
      {state.showScheduler && (
        <div>
          <Scheduler
            schedulerData={state.viewModel}
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
            onSetAddMoreState={onSetAddMoreState}
            toggleExpandFunc={toggleExpandFunc}
          />
          {popover}
        </div>
      )}
    </>
  );
}

export default wrapperFun(AddMore);
