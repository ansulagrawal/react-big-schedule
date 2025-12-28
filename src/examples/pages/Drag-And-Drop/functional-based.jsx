import { Col, Row, Typography } from 'antd';
import React, { useEffect, useReducer, useState } from 'react';
import { DemoData, DnDSource, Scheduler, SchedulerData, ViewType, wrapperFun } from '../../../index';
import ResourceItem from '../../components/ResourceItem';
import ResourceList from '../../components/ResourceList';
import TaskItem from '../../components/TaskItem';
import TaskList from '../../components/TaskList';
import { DnDTypes } from '../../helpers/DnDTypes';

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

let schedulerData;
function DragAndDrop() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [taskDndSource, setTaskDndSource] = useState(new DnDSource(props => props.task, TaskItem, true, DnDTypes.TASK));
  const [resourceDndSource, setResourceDndSource] = useState(new DnDSource(props => props.resource, ResourceItem, true, DnDTypes.RESOURCE));

  useEffect(() => {
    schedulerData = new SchedulerData('2022-12-18', ViewType.Month, false, false, {
      schedulerMaxHeight: 500,
      besidesWidth: window.innerWidth <= 1600 ? 400 : 500,
      views: [
        { viewName: 'Agenda View', viewType: ViewType.Month, showAgenda: true, isEventPerspective: false },
        { viewName: 'Resource View', viewType: ViewType.Month, showAgenda: false, isEventPerspective: false },
        { viewName: 'Task View', viewType: ViewType.Month, showAgenda: false, isEventPerspective: true },
      ],
    });
    schedulerData.localeDayjs.locale('en');
    schedulerData.setResources(DemoData.resources);
    schedulerData.setEvents(DemoData.eventsForTaskView);

    dispatch({ type: 'INITIALIZE', payload: schedulerData });
    setTaskDndSource(new DnDSource(props => props.task, TaskItem, true, DnDTypes.TASK));
    setResourceDndSource(new DnDSource(props => props.resource, ResourceItem, true, DnDTypes.RESOURCE));

    return () => {
      schedulerData = null;
    };
  }, []);

  const prevClick = schedulerData => {
    schedulerData.prev();
    schedulerData.setEvents(DemoData.eventsForTaskView);
    this.setState({ viewModel: schedulerData });
  };

  const nextClick = schedulerData => {
    schedulerData.next();
    schedulerData.setEvents(DemoData.eventsForTaskView);
    dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
  };

  const onViewChange = (schedulerData, view) => {
    schedulerData.setViewType(view.viewType, view.showAgenda, view.isEventPerspective);
    schedulerData.config.creatable = !view.isEventPerspective;
    schedulerData.setEvents(DemoData.eventsForTaskView);
    dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
  };

  const onSelectDate = (schedulerData, date) => {
    schedulerData.setDate(date);
    schedulerData.setEvents(DemoData.eventsForTaskView);
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
    if (confirm(`Do you want to create a new event? {slotId: ${slotId}, slotName: ${slotName}, start: ${start}, end: ${end}, type: ${type}, item: ${item}}`)) {
      let newFreshId = 0;
      schedulerData.events.forEach(item => {
        if (item.id >= newFreshId) newFreshId = item.id + 1;
      });

      let newEvent = {
        id: newFreshId,
        title: 'New event you just created',
        start,
        end,
        resourceId: slotId,
        bgColor: 'purple',
      };

      if (type === DnDTypes.RESOURCE) {
        newEvent = {
          ...newEvent,
          groupId: slotId,
          groupName: slotName,
          resourceId: item.id,
        };
      } else if (type === DnDTypes.TASK) {
        newEvent = {
          ...newEvent,
          groupId: item.id,
          groupName: item.name,
        };
      }

      schedulerData.addEvent(newEvent);
      dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
    }
  };

  const updateEventStart = (schedulerData, event, newStart) => {
    if (confirm(`Do you want to adjust the start of the event? {eventId: ${event.id}, eventTitle: ${event.title}, newStart: ${newStart}}`)) {
      schedulerData.updateEventStart(event, newStart);
    }
    dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
  };

  const updateEventEnd = (schedulerData, event, newEnd) => {
    if (confirm(`Do you want to adjust the end of the event? {eventId: ${event.id}, eventTitle: ${event.title}, newEnd: ${newEnd}}`)) {
      schedulerData.updateEventEnd(event, newEnd);
    }
    dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
  };

  const moveEvent = (schedulerData, event, slotId, slotName, start, end) => {
    if (
      confirm(
        `Do you want to move the event? {eventId: ${event.id}, eventTitle: ${event.title}, newSlotId: ${slotId}, newSlotName: ${slotName}, newStart: ${start}, newEnd: ${end}`
      )
    ) {
      schedulerData.moveEvent(event, slotId, slotName, start, end);
      dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
    }
  };

  const movingEvent = (schedulerData, slotId, slotName, newStart, newEnd, action, type, item) => {
    console.log('moving event', schedulerData, slotId, slotName, newStart, newEnd, action, type, item);
  };

  const subtitleGetter = (schedulerData, event) => (schedulerData.isEventPerspective ? schedulerData.getResourceById(event.resourceId).name : event.groupName);

  const toggleExpandFunc = (schedulerData, slotId) => {
    schedulerData.toggleExpandStatus(slotId);
    dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
  };

  return (
    <>
      {state.showScheduler && (
        <>
          <Row align="middle" justify="center">
            <Typography.Title level={4}>
              {state.showScheduler
                && (state.viewModel?.isEventPerspective ? 'Drag a resource from outside and drop to the resource view.' : 'Drag a task from outside and drop to the resource view')}
            </Typography.Title>
          </Row>
          <Row>
            <Col span={20}>
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
                movingEvent={movingEvent}
                newEvent={newEvent}
                subtitleGetter={subtitleGetter}
                dndSources={[taskDndSource, resourceDndSource]}
                toggleExpandFunc={toggleExpandFunc}
              />
            </Col>
            <Col span={4}>
              {state.viewModel.isEventPerspective ? (
                <ResourceList schedulerData={state.viewModel} newEvent={newEvent} resourceDndSource={resourceDndSource} />
              ) : (
                <TaskList schedulerData={state.viewModel} newEvent={newEvent} taskDndSource={taskDndSource} />
              )}
            </Col>
          </Row>
        </>
      )}
    </>
  );
}

export default wrapperFun(DragAndDrop);
