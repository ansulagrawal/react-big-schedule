import { Component } from 'react';

import { DemoData, Scheduler, SchedulerData, ViewType, wrapperFun } from '../../../index';
import { showInfo } from '../../helpers/dialogs';
import { messages } from '../../helpers/messages';

class Readonly extends Component {
  constructor(props) {
    super(props);

    const schedulerData = new SchedulerData('2022-12-22', ViewType.Week, false, false, {
      startResizable: false,
      endResizable: false,
      movable: false,
      creatable: false,
    });
    schedulerData.localeDayjs.locale('en');
    schedulerData.setResources(DemoData.resources);
    schedulerData.setEvents(DemoData.events);
    this.state = {
      viewModel: schedulerData,
    };
  }

  render() {
    const { viewModel } = this.state;
    return (
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
        toggleExpandFunc={this.toggleExpandFunc}
      />
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

  toggleExpandFunc = (schedulerData, slotId) => {
    schedulerData.toggleExpandStatus(slotId);
    this.setState({ viewModel: schedulerData });
  };
}

export default wrapperFun(Readonly);
