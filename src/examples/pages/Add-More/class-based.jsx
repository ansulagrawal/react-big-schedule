import { Component } from 'react';
import { getNextNumericEventId } from '../../../helper/utility';
import { AddMorePopover, DemoData, Scheduler, SchedulerData, ViewType, wrapperFun } from '../../../index';
import { confirmAction, showInfo } from '../../helpers/dialogs';
import { messages } from '../../helpers/messages';

class AddMore extends Component {
  constructor(props) {
    super(props);

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
    this.state = {
      viewModel: schedulerData,
      headerItem: undefined,
      left: 0,
      top: 0,
      height: 0,
    };
  }

  render() {
    const { viewModel } = this.state;

    let popover = <div />;
    if (this.state.headerItem !== undefined) {
      popover = (
        <AddMorePopover
          headerItem={this.state.headerItem}
          eventItemClick={this.eventClicked}
          viewEventClick={this.ops1}
          viewEventText="Ops 1"
          viewEvent2Click={this.ops2}
          viewEvent2Text="Ops 2"
          schedulerData={viewModel}
          closeAction={this.onSetAddMoreState}
          left={this.state.left}
          top={this.state.top}
          height={this.state.height}
          moveEvent={this.moveEvent}
        />
      );
    }

    return (
      <div>
        <Scheduler
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
          newEvent={this.newEvent}
          onSetAddMoreState={this.onSetAddMoreState}
          toggleExpandFunc={this.toggleExpandFunc}
        />
        {popover}
      </div>
    );
  }

  prevClick = schedulerData => {
    schedulerData.prev();
    schedulerData.setEvents(DemoData.events);
    this.setState({
      viewModel: schedulerData,
    });
  };

  nextClick = schedulerData => {
    schedulerData.next();
    schedulerData.setEvents(DemoData.events);
    this.setState({
      viewModel: schedulerData,
    });
  };

  onViewChange = (schedulerData, view) => {
    schedulerData.setViewType(view.viewType, view.showAgenda, view.isEventPerspective);
    schedulerData.setEvents(DemoData.events);
    this.setState({
      viewModel: schedulerData,
    });
  };

  onSelectDate = (schedulerData, date) => {
    schedulerData.setDate(date);
    schedulerData.setEvents(DemoData.events);
    this.setState({
      viewModel: schedulerData,
    });
  };

  eventClicked = (_schedulerData, event) => {
    showInfo(messages.clicked(event));
  };

  ops1 = (_schedulerData, event) => {
    showInfo(messages.ops('Ops 1', event));
  };

  ops2 = (_schedulerData, event) => {
    showInfo(messages.ops('Ops 2', event));
  };

  newEvent = (schedulerData, slotId = '', slotName = '', start = '', end = '', _type = '', item = '') => {
    confirmAction(messages.create(slotName, start, end), () => {
      const newFreshId = getNextNumericEventId(schedulerData.events);
      const selectedResourceIds =
        Array.isArray(item?.resourceIds) && item.resourceIds.length > 0 ? item.resourceIds : [slotId];

      const newEvent = {
        id: newFreshId,
        title: 'New event you just created',
        start,
        end,
        resourceId: selectedResourceIds[0],
        resourceIds: selectedResourceIds,
        bgColor: 'purple',
      };
      schedulerData.addEvent(newEvent);
      this.setState({
        viewModel: schedulerData,
      });
    });
  };

  updateEventStart = (schedulerData, event, newStart) => {
    confirmAction(messages.adjustStart(event, newStart), () => {
      schedulerData.updateEventStart(event, newStart);
    });
    this.setState({
      viewModel: schedulerData,
    });
  };

  updateEventEnd = (schedulerData, event, newEnd) => {
    confirmAction(messages.adjustEnd(event, newEnd), () => {
      schedulerData.updateEventEnd(event, newEnd);
    });
    this.setState({
      viewModel: schedulerData,
    });
  };

  moveEvent = (schedulerData, event, slotId, slotName, start, end) => {
    confirmAction(messages.move(event, slotName, start, end), () => {
      schedulerData.moveEvent(event, slotId, slotName, start, end);
      this.setState({
        viewModel: schedulerData,
      });
    });
  };

  onSetAddMoreState = newState => {
    if (newState === undefined) {
      this.setState({
        headerItem: undefined,
        left: 0,
        top: 0,
        height: 0,
      });
    } else {
      this.setState({
        ...newState,
      });
    }
  };

  toggleExpandFunc = (schedulerData, slotId) => {
    schedulerData.toggleExpandStatus(slotId);
    this.setState({
      viewModel: schedulerData,
    });
  };
}

export default wrapperFun(AddMore);
