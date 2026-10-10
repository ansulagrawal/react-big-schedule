import { Component } from 'react';
import { DemoData, SchedulerData, ViewType, wrapperFun } from '../../../index';
import Scheduler from '../../components/ThemedScheduler';
import { showInfo } from '../../helpers/dialogs';
import { messages } from '../../helpers/messages';
import { asViewType, type SP } from '../../helpers/scheduler';

interface State {
  viewModel: SchedulerData;
}

class Readonly extends Component<object, State> {
  constructor(props: object) {
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
    this.state = { viewModel: schedulerData };
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

  prevClick: SP['prevClick'] = schedulerData => {
    schedulerData.prev();
    schedulerData.setEvents(DemoData.events);
    this.setState({ viewModel: schedulerData });
  };

  nextClick: SP['nextClick'] = schedulerData => {
    schedulerData.next();
    schedulerData.setEvents(DemoData.events);
    this.setState({ viewModel: schedulerData });
  };

  onViewChange: SP['onViewChange'] = (schedulerData, view) => {
    schedulerData.setViewType(asViewType(view.viewType), view.showAgenda, view.isEventPerspective);
    schedulerData.setEvents(DemoData.events);
    this.setState({ viewModel: schedulerData });
  };

  onSelectDate: SP['onSelectDate'] = (schedulerData, date) => {
    schedulerData.setDate(date);
    schedulerData.setEvents(DemoData.events);
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

  toggleExpandFunc: NonNullable<SP['toggleExpandFunc']> = (schedulerData, slotId) => {
    schedulerData.toggleExpandStatus(slotId);
    this.setState({ viewModel: schedulerData });
  };
}

export default wrapperFun(Readonly);
