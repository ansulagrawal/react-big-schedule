import { useEffect, useReducer, useState } from 'react';
import { AddMorePopover, DemoData, Scheduler, SchedulerData, ViewType, wrapperFun } from '../../../index';

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
      besidesWidth: 350,
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

  const eventClicked = (schedulerData, event) => {
    alert(`You just clicked an event: {id: ${event.id}, title: ${event.title}}`);
  };

  const ops1 = (schedulerData, event) => {
    alert(`You just executed ops1 to event: {id: ${event.id}, title: ${event.title}}`);
  };

  const ops2 = (schedulerData, event) => {
    alert(`You just executed ops2 to event: {id: ${event.id}, title: ${event.title}}`);
  };

  const newEvent = (schedulerData, slotId, slotName, start, end, type, item) => {
    if (
      confirm(
        `Do you want to create a new event? {slotId: ${slotId}, slotName: ${slotName}, ` +
          `start: ${start}, end: ${end}, type: ${type}, item: ${item}}`
      )
    ) {
      let newFreshId = 0;
      schedulerData.events.forEach(item => {
        if (item.id >= newFreshId) newFreshId = item.id + 1;
      });

      const newEvent = {
        id: newFreshId,
        title: 'New event you just created',
        start,
        end,
        resourceId: slotId,
        bgColor: 'purple',
      };
      schedulerData.addEvent(newEvent);
      dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
    }
  };

  const updateEventStart = (schedulerData, event, newStart) => {
    if (
      confirm(
        `Do you want to adjust the start of the event? {eventId: ${event.id}, ` +
          `eventTitle: ${event.title}, newStart: ${newStart}}`
      )
    ) {
      schedulerData.updateEventStart(event, newStart);
    }
    dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
  };

  const updateEventEnd = (schedulerData, event, newEnd) => {
    if (
      confirm(
        `Do you want to adjust the end of the event? {eventId: ${event.id}, ` +
          `eventTitle: ${event.title}, newEnd: ${newEnd}}`
      )
    ) {
      schedulerData.updateEventEnd(event, newEnd);
    }
    dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
  };

  const moveEvent = (schedulerData, event, slotId, slotName, start, end) => {
    if (
      confirm(
        `Do you want to move the event? {eventId: ${event.id}, eventTitle: ${event.title}, newSlotId: ${slotId}, ` +
          `newSlotName: ${slotName}, newStart: ${start}, newEnd: ${end}}`
      )
    ) {
      schedulerData.moveEvent(event, slotId, slotName, start, end);
      dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
    }
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
