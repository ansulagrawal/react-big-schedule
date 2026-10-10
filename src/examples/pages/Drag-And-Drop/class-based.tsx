import { Component } from 'react';
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
  viewModel: SchedulerData;
  taskDndSource: DnDSource;
  resourceDndSource: DnDSource;
}

class DragAndDrop extends Component<object, State> {
  constructor(props: object) {
    super(props);

    const schedulerData = new SchedulerData('2022-12-18', ViewType.Month, false, false, {
      monthCellWidth: 120,
      // configurable drop preview: green dashed box where the dragged item would land
      dropPreviewStyle: { border: '2px dashed #52c41a', background: 'rgba(82, 196, 26, 0.16)' },
      views: [
        { viewName: 'Resource View', viewType: ViewType.Month, showAgenda: false, isEventPerspective: false },
        { viewName: 'Task View', viewType: ViewType.Month, showAgenda: false, isEventPerspective: true },
      ],
    });
    schedulerData.localeDayjs.locale('en');
    schedulerData.setResources(DemoData.resources);
    schedulerData.setEvents(DemoData.eventsForTaskView);
    this.state = {
      viewModel: schedulerData,
      taskDndSource: new DnDSource((props: { task: EventGroup }) => props.task, true, DnDTypes.TASK),
      resourceDndSource: new DnDSource((props: { resource: Resource }) => props.resource, true, DnDTypes.RESOURCE),
    };
  }

  render() {
    const { viewModel, taskDndSource, resourceDndSource } = this.state;

    return (
      <div>
        <h4 className="ex-subtitle">
          {viewModel.isEventPerspective
            ? 'Drag a resource from outside and drop to the resource view.'
            : 'Drag a task from outside and drop to the resource view'}
        </h4>
        <div className="ex-dnd-layout">
          <div className="ex-dnd-main">
            <Scheduler
              CustomResourceHeader={() => <div>Custom Header</div>}
              schedulerData={viewModel}
              prevClick={this.prevClick}
              nextClick={this.nextClick}
              onSelectDate={this.onSelectDate}
              onViewChange={this.onViewChange}
              eventItemClick={this.eventClicked}
              viewEventClick={this.ops1}
              viewEventText="Ops 1"
              viewEvent2Text="Ops 2"
              viewEvent2Click={this.ops2}
              updateEventStart={this.updateEventStart}
              updateEventEnd={this.updateEventEnd}
              moveEvent={this.moveEvent}
              movingEvent={this.movingEvent}
              newEvent={this.newEvent}
              subtitleGetter={this.subtitleGetter}
              dndSources={[taskDndSource, resourceDndSource]}
              toggleExpandFunc={this.toggleExpandFunc}
            />
          </div>
          <div className="ex-dnd-side">
            {viewModel.isEventPerspective ? (
              <ResourceList schedulerData={viewModel} newEvent={this.newEvent} resourceDndSource={resourceDndSource} />
            ) : (
              <TaskList schedulerData={viewModel} newEvent={this.newEvent} taskDndSource={taskDndSource} />
            )}
          </div>
        </div>
      </div>
    );
  }

  prevClick: SP['prevClick'] = schedulerData => {
    schedulerData.prev();
    schedulerData.setEvents(DemoData.eventsForTaskView);
    this.setState({ viewModel: schedulerData });
  };

  nextClick: SP['nextClick'] = schedulerData => {
    schedulerData.next();
    schedulerData.setEvents(DemoData.eventsForTaskView);
    this.setState({ viewModel: schedulerData });
  };

  onViewChange: SP['onViewChange'] = (schedulerData, view) => {
    schedulerData.setViewType(asViewType(view.viewType), view.showAgenda, view.isEventPerspective);
    schedulerData.config.creatable = !view.isEventPerspective;
    schedulerData.setEvents(DemoData.eventsForTaskView);
    this.setState({ viewModel: schedulerData });
  };

  onSelectDate: SP['onSelectDate'] = (schedulerData, date) => {
    schedulerData.setDate(date);
    schedulerData.setEvents(DemoData.eventsForTaskView);
    this.setState({ viewModel: schedulerData });
  };

  eventClicked: NonNullable<SP['eventItemClick']> = (_schedulerData, event) => {
    showInfo(messages.clicked(event));
  };

  ops1: NonNullable<SP['viewEventClick']> = (_schedulerData, event) => {
    showInfo(messages.ops('Ops 1', event));
  };

  ops2: NonNullable<SP['viewEvent2Click']> = (_schedulerData, event) => {
    showInfo(messages.ops('Ops 2', event));
  };

  newEvent = (
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

      let newEvent: SchedulerEvent = {
        id: newFreshId,
        title: 'New event you just created',
        start,
        end,
        resourceId: slotId,
        resourceIds: Array.isArray(item?.resourceIds) && item.resourceIds.length > 0 ? item.resourceIds : [slotId],
        bgColor: 'purple',
      };

      if (type === DnDTypes.RESOURCE && item?.id !== undefined) {
        newEvent = { ...newEvent, groupId: slotId, groupName: slotName, resourceId: item.id, resourceIds: [item.id] };
      } else if (type === DnDTypes.TASK && item?.id !== undefined) {
        newEvent = { ...newEvent, groupId: item.id, groupName: item.name };
      }

      schedulerData.addEvent(newEvent);
      this.setState({ viewModel: schedulerData });
    });
  };

  updateEventStart: NonNullable<SP['updateEventStart']> = (schedulerData, event, newStart) => {
    confirmAction(messages.adjustStart(event, newStart), () => {
      schedulerData.updateEventStart(event, newStart);
    });
    this.setState({ viewModel: schedulerData });
  };

  updateEventEnd: NonNullable<SP['updateEventEnd']> = (schedulerData, event, newEnd) => {
    confirmAction(messages.adjustEnd(event, newEnd), () => {
      schedulerData.updateEventEnd(event, newEnd);
    });
    this.setState({ viewModel: schedulerData });
  };

  moveEvent: NonNullable<SP['moveEvent']> = (schedulerData, event, slotId, slotName, start, end) => {
    confirmAction(messages.move(event, slotName, start, end), () => {
      schedulerData.moveEvent(event, slotId, slotName, start, end);
      this.setState({ viewModel: schedulerData });
    });
  };

  movingEvent: NonNullable<SP['movingEvent']> = (
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

  subtitleGetter: NonNullable<SP['subtitleGetter']> = (schedulerData, event) =>
    schedulerData.isEventPerspective ? schedulerData.getResourceById(event.resourceId)?.name : event.groupName;

  toggleExpandFunc: NonNullable<SP['toggleExpandFunc']> = (schedulerData, slotId) => {
    schedulerData.toggleExpandStatus(slotId);
    this.setState({ viewModel: schedulerData });
  };
}

export default wrapperFun(DragAndDrop);
