import * as antdLocale from 'antd/es/locale/pt_BR';
import * as dayjsLocale from 'dayjs/locale/pt-br';
import { Component } from 'react';

import { DemoData, Scheduler, SchedulerData, ViewType, wrapperFun } from '../../../index';

class CustomTime extends Component {
  constructor(props) {
    super(props);

    const schedulerData = new SchedulerData('2022-12-22', ViewType.Day, false, false, {
      besidesWidth: 300,
      dayMaxEvents: 99,
      dayStartFrom: 8,
      dayStopTo: 18,
      customMaxEvents: 9965,
      eventItemPopoverTrigger: 'click',
      schedulerContentHeight: '100%',
      views: [],
    });

    schedulerData.setSchedulerLocale(dayjsLocale);
    schedulerData.setCalendarPopoverLocale(antdLocale);
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
        viewEventClick={this.ops1}
        viewEventText="Ops 1"
        viewEvent2Text="Ops 2"
        viewEvent2Click={this.ops2}
        updateEventStart={this.updateEventStart}
        updateEventEnd={this.updateEventEnd}
        moveEvent={this.moveEvent}
        newEvent={this.newEvent}
        onScrollLeft={this.onScrollLeft}
        onScrollRight={this.onScrollRight}
        onScrollTop={this.onScrollTop}
        onScrollBottom={this.onScrollBottom}
        toggleExpandFunc={this.toggleExpandFunc}
      />
    );
  }

  prevClick = schedulerData => {
    schedulerData.prev();
    schedulerData.setEvents(DemoData.events);
    this.setState({ viewModel: schedulerData });
  };

  nextClick = schedulerData => {
    schedulerData.next();
    schedulerData.setEvents(DemoData.events);
    this.setState({ viewModel: schedulerData });
  };

  onViewChange = (schedulerData, view) => {
    const start = new Date();
    schedulerData.setViewType(view.viewType, view.showAgenda, view.isEventPerspective);
    schedulerData.setEvents(DemoData.events);
    this.setState({ viewModel: schedulerData });
    function secondsBetween(date1, date2) {
      const diff = Math.abs(date1.getTime() - date2.getTime());
      return diff / 1000;
    }

    console.log('Elapsed seconds: ' + secondsBetween(start, new Date()));
  };

  onSelectDate = (schedulerData, date) => {
    schedulerData.setDate(date);
    schedulerData.setEvents(DemoData.events);
    this.setState({
      viewModel: schedulerData,
    });
  };

  eventClicked = (schedulerData, event) => {
    alert(`You just clicked an event: {id: ${event.id}, title: ${event.title}}`);
  };

  ops1 = (schedulerData, event) => {
    alert(`You just executed ops1 to event: {id: ${event.id}, title: ${event.title}}`);
  };

  ops2 = (schedulerData, event) => {
    alert(`You just executed ops2 to event: {id: ${event.id}, title: ${event.title}}`);
  };

  newEvent = (schedulerData, slotId, slotName, start, end, type, item) => {
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

      let newEvent = {
        id: newFreshId,
        title: 'New event you just created',
        start: start,
        end: end,
        resourceId: slotId,
        bgColor: 'purple',
      };
      schedulerData.addEvent(newEvent);
      this.setState({ viewModel: schedulerData });
    }
  };

  updateEventStart = (schedulerData, event, newStart) => {
    if (
      confirm(
        `Do you want to adjust the start of the event? {eventId: ${event.id}, ` +
          `eventTitle: ${event.title}, newStart: ${newStart}}`
      )
    ) {
      schedulerData.updateEventStart(event, newStart);
      this.setState({ viewModel: schedulerData });
    }
  };

  updateEventEnd = (schedulerData, event, newEnd) => {
    if (
      confirm(
        `Do you want to adjust the end of the event? {eventId: ${event.id}, ` +
          `eventTitle: ${event.title}, newEnd: ${newEnd}}`
      )
    ) {
      schedulerData.updateEventEnd(event, newEnd);
      this.setState({ viewModel: schedulerData });
    }
  };

  moveEvent = (schedulerData, event, slotId, slotName, start, end) => {
    if (
      confirm(
        `Do you want to move the event? {eventId: ${event.id}, eventTitle: ${event.title}, ` +
          `newSlotId: ${slotId}, newSlotName: ${slotName}, newStart: ${start}, newEnd: ${end}}`
      )
    ) {
      schedulerData.moveEvent(event, slotId, slotName, start, end);
      this.setState({ viewModel: schedulerData });
    }
  };

  onScrollRight = (schedulerData, schedulerContent, maxScrollLeft) => {
    if (schedulerData.ViewTypes === ViewType.Day) {
      schedulerData.next();
      schedulerData.setEvents(DemoData.events);
      this.setState({ viewModel: schedulerData });

      schedulerContent.scrollLeft = maxScrollLeft - 10;
    }
  };

  onScrollLeft = (schedulerData, schedulerContent) => {
    if (schedulerData.ViewTypes === ViewType.Day) {
      schedulerData.prev();
      schedulerData.setEvents(DemoData.events);
      this.setState({ viewModel: schedulerData });

      schedulerContent.scrollLeft = 10;
    }
  };

  onScrollTop = () => console.log('onScrollTop');

  onScrollBottom = () => console.log('onScrollBottom');

  toggleExpandFunc = (schedulerData, slotId) => {
    schedulerData.toggleExpandStatus(slotId);
    this.setState({ viewModel: schedulerData });
  };
}

export default wrapperFun(CustomTime);
