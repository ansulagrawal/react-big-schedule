import { useEffect, useReducer, useState } from 'react';
import { DemoData, DnDSource, SchedulerData, ViewType, wrapperFun } from '../../../index';
import type { EventGroup, Resource, SchedulerEvent } from '../../../types';
import ResourceList from '../../components/ResourceList';
import TaskList from '../../components/TaskList';
import Scheduler from '../../components/ThemedScheduler';
import { DnDTypes } from '../../helpers/DnDTypes';
import { confirmAction, showInfo } from '../../helpers/dialogs';
import { messages } from '../../helpers/messages';
import { asViewType, type DndItem, type SP } from '../../helpers/scheduler';

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

function DragAndDrop() {
  const [state, dispatch] = useReducer(reducer, { showScheduler: false });
  const [taskDndSource] = useState(
    () => new DnDSource((props: { task: EventGroup }) => props.task, true, DnDTypes.TASK),
  );
  const [resourceDndSource] = useState(
    () => new DnDSource((props: { resource: Resource }) => props.resource, true, DnDTypes.RESOURCE),
  );

  useEffect(() => {
    const schedulerData = new SchedulerData('2022-12-18', ViewType.Month, false, false, {
      monthCellWidth: 120,
      // configurable drop preview: green dashed box where the dragged item would land
      dropPreviewStyle: { border: '2px dashed #52c41a', background: 'rgba(82, 196, 26, 0.16)' },
      views: [
        { viewName: 'Resource View', viewType: ViewType.Month, showAgenda: false, isEventPerspective: false },
        { viewName: 'Task View', viewType: ViewType.Month, showAgenda: false, isEventPerspective: true },
        { viewName: 'Agenda View', viewType: ViewType.Month, showAgenda: true, isEventPerspective: false },
      ],
    });
    schedulerData.localeDayjs.locale('en');
    schedulerData.setResources(DemoData.resources);
    schedulerData.setEvents(DemoData.eventsForTaskView);
    dispatch({ type: 'INITIALIZE', payload: schedulerData });
  }, []);

  const update = (schedulerData: SchedulerData) => dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });

  const prevClick: SP['prevClick'] = schedulerData => {
    schedulerData.prev();
    schedulerData.setEvents(DemoData.eventsForTaskView);
    update(schedulerData);
  };

  const nextClick: SP['nextClick'] = schedulerData => {
    schedulerData.next();
    schedulerData.setEvents(DemoData.eventsForTaskView);
    update(schedulerData);
  };

  const onViewChange: SP['onViewChange'] = (schedulerData, view) => {
    schedulerData.setViewType(asViewType(view.viewType), view.showAgenda, view.isEventPerspective);
    schedulerData.config.creatable = !view.isEventPerspective;
    schedulerData.setEvents(DemoData.eventsForTaskView);
    update(schedulerData);
  };

  const onSelectDate: SP['onSelectDate'] = (schedulerData, date) => {
    schedulerData.setDate(date);
    schedulerData.setEvents(DemoData.eventsForTaskView);
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

  const newEvent = (
    schedulerData: SchedulerData,
    slotId: string | number,
    slotName: string,
    start: string,
    end: string,
    type?: string,
    item?: DndItem,
  ) => {
    confirmAction(messages.create(slotName, start, end), () => {
      let newFreshId = 0;
      for (const e of schedulerData.events) {
        if (typeof e.id === 'number' && e.id >= newFreshId) newFreshId = e.id + 1;
      }

      let created: SchedulerEvent = {
        id: newFreshId,
        title: 'New event you just created',
        start,
        end,
        resourceId: slotId,
        resourceIds: Array.isArray(item?.resourceIds) && item.resourceIds.length > 0 ? item.resourceIds : [slotId],
        bgColor: 'purple',
      };

      if (type === DnDTypes.RESOURCE && item?.id !== undefined) {
        created = { ...created, groupId: slotId, groupName: slotName, resourceId: item.id, resourceIds: [item.id] };
      } else if (type === DnDTypes.TASK && item?.id !== undefined) {
        created = { ...created, groupId: item.id, groupName: item.name };
      }

      schedulerData.addEvent(created);
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

  const movingEvent: NonNullable<SP['movingEvent']> = (
    schedulerData,
    slotId,
    slotName,
    newStart,
    newEnd,
    action,
    type,
    item,
  ) => {
    console.log('moving event', schedulerData, slotId, slotName, newStart, newEnd, action, type, item);
  };

  const subtitleGetter: NonNullable<SP['subtitleGetter']> = (schedulerData, event) =>
    schedulerData.isEventPerspective ? schedulerData.getResourceById(event.resourceId)?.name : event.groupName;

  const toggleExpandFunc: NonNullable<SP['toggleExpandFunc']> = (schedulerData, slotId) => {
    schedulerData.toggleExpandStatus(slotId);
    update(schedulerData);
  };

  const { viewModel } = state;
  if (!state.showScheduler || !viewModel) return null;

  return (
    <>
      <h4 className="ex-subtitle">
        {viewModel.isEventPerspective
          ? 'Drag a resource from outside and drop to the resource view.'
          : 'Drag a task from outside and drop to the resource view'}
      </h4>
      <div className="ex-dnd-layout">
        <div className="ex-dnd-main">
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
            movingEvent={movingEvent}
            newEvent={newEvent}
            subtitleGetter={subtitleGetter}
            dndSources={[taskDndSource, resourceDndSource]}
            toggleExpandFunc={toggleExpandFunc}
          />
        </div>
        <div className="ex-dnd-side">
          {viewModel.isEventPerspective ? (
            <ResourceList schedulerData={viewModel} newEvent={newEvent} resourceDndSource={resourceDndSource} />
          ) : (
            <TaskList schedulerData={viewModel} newEvent={newEvent} taskDndSource={taskDndSource} />
          )}
        </div>
      </div>
    </>
  );
}

export default wrapperFun(DragAndDrop);
