import { Col, Row, Typography } from 'antd';
import { Component } from 'react';
import { DemoData, DnDSource, Scheduler, SchedulerData, ViewType, wrapperFun } from '../../../index';
import ResourceList from '../../components/ResourceList';
import TaskList from '../../components/TaskList';
import { DnDTypes } from '../../helpers/DnDTypes';
import { messages } from '../../helpers/messages';

class DragAndDrop extends Component {
  constructor(props) {
    super(props);

    const schedulerData = new SchedulerData('2022-12-18', ViewType.Month, false, false, {
      monthCellWidth: 120,
      views: [
        {
          viewName: 'Resource View',
          viewType: ViewType.Month,
          showAgenda: false,
          isEventPerspective: false,
        },
        {
          viewName: 'Task View',
          viewType: ViewType.Month,
          showAgenda: false,
          isEventPerspective: true,
        },
      ],
    });
    schedulerData.localeDayjs.locale('en');
    schedulerData.setResources(DemoData.resources);
    schedulerData.setEvents(DemoData.eventsForTaskView);
    this.state = {
      viewModel: schedulerData,
      taskDndSource: new DnDSource(props => props.task, true, DnDTypes.TASK),
      resourceDndSource: new DnDSource(props => props.resource, true, DnDTypes.RESOURCE),
    };
  }

  render() {
    const { viewModel, taskDndSource, resourceDndSource } = this.state;

    return (
      <div>
        <Row align="middle" justify="center">
          <Typography.Title level={4}>
            {viewModel.isEventPerspective
              ? 'Drag a resource from outside and drop to the resource view.'
              : 'Drag a task from outside and drop to the resource view'}
          </Typography.Title>
        </Row>
        <Row>
          <Col span={20}>
            <div>
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
          </Col>
          <Col span={4}>
            {viewModel.isEventPerspective ? (
              <ResourceList schedulerData={viewModel} newEvent={this.newEvent} resourceDndSource={resourceDndSource} />
            ) : (
              <TaskList schedulerData={viewModel} newEvent={this.newEvent} taskDndSource={taskDndSource} />
            )}
          </Col>
        </Row>
      </div>
    );
  }

  prevClick = schedulerData => {
    schedulerData.prev();
    schedulerData.setEvents(DemoData.eventsForTaskView);
    this.setState({
      viewModel: schedulerData,
    });
  };

  nextClick = schedulerData => {
    schedulerData.next();
    schedulerData.setEvents(DemoData.eventsForTaskView);
    this.setState({
      viewModel: schedulerData,
    });
  };

  onViewChange = (schedulerData, view) => {
    schedulerData.setViewType(view.viewType, view.showAgenda, view.isEventPerspective);
    schedulerData.config.creatable = !view.isEventPerspective;
    schedulerData.setEvents(DemoData.eventsForTaskView);
    this.setState({
      viewModel: schedulerData,
    });
  };

  onSelectDate = (schedulerData, date) => {
    schedulerData.setDate(date);
    schedulerData.setEvents(DemoData.eventsForTaskView);
    this.setState({
      viewModel: schedulerData,
    });
  };

  eventClicked = (_schedulerData, event) => {
    alert(messages.clicked(event));
  };

  ops1 = (_schedulerData, event) => {
    alert(messages.ops('Ops 1', event));
  };

  ops2 = (_schedulerData, event) => {
    alert(messages.ops('Ops 2', event));
  };

  newEvent = (schedulerData, slotId, slotName, start, end, type, item) => {
    if (confirm(messages.create(slotName, start, end))) {
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
        resourceIds: Array.isArray(item?.resourceIds) && item.resourceIds.length > 0 ? item.resourceIds : [slotId],
        bgColor: 'purple',
      };

      if (type === DnDTypes.RESOURCE) {
        newEvent = {
          ...newEvent,
          groupId: slotId,
          groupName: slotName,
          resourceId: item.id,
          resourceIds: [item.id],
        };
      } else if (type === DnDTypes.TASK) {
        newEvent = {
          ...newEvent,
          groupId: item.id,
          groupName: item.name,
        };
      }

      schedulerData.addEvent(newEvent);
      this.setState({
        viewModel: schedulerData,
      });
    }
  };

  updateEventStart = (schedulerData, event, newStart) => {
    if (confirm(messages.adjustStart(event, newStart))) {
      schedulerData.updateEventStart(event, newStart);
    }
    this.setState({
      viewModel: schedulerData,
    });
  };

  updateEventEnd = (schedulerData, event, newEnd) => {
    if (confirm(messages.adjustEnd(event, newEnd))) {
      schedulerData.updateEventEnd(event, newEnd);
    }
    this.setState({
      viewModel: schedulerData,
    });
  };

  moveEvent = (schedulerData, event, slotId, slotName, start, end) => {
    if (confirm(messages.move(event, slotName, start, end))) {
      schedulerData.moveEvent(event, slotId, slotName, start, end);
      this.setState({
        viewModel: schedulerData,
      });
    }
  };

  movingEvent = (schedulerData, slotId, slotName, newStart, newEnd, action, type, item) => {
    console.log('moving event', schedulerData, slotId, slotName, newStart, newEnd, action, type, item);
  };

  subtitleGetter = (schedulerData, event) =>
    schedulerData.isEventPerspective ? schedulerData.getResourceById(event.resourceId).name : event.groupName;

  toggleExpandFunc = (schedulerData, slotId) => {
    schedulerData.toggleExpandStatus(slotId);
    this.setState({
      viewModel: schedulerData,
    });
  };
}

export default wrapperFun(DragAndDrop);
