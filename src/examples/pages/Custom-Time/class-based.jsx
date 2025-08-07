/* eslint-disable */
import * as antdLocale from 'antd/locale/pt_BR';
import * as dayjsLocale from 'dayjs/locale/pt-br';
import React, { Component } from 'react';
import { DemoData, Scheduler, SchedulerData, ViewType, wrapperFun } from '../../../index';

class CustomTime extends Component {
  constructor(props) {
    super(props);

    const schedulerData = new SchedulerData(
      '2022-12-22',
      ViewType.Day,
      false,
      false,
      {
        besidesWidth: 300,
        dayMaxEvents: 99,
        dayStartFrom: 8, // 8 AM
        dayStopTo: 18,  // 7 PM
        customMaxEvents: 9965,
        eventItemPopoverTrigger: 'click',
        schedulerContentHeight: '100%',
        views: [],
      },
    );

    schedulerData.setSchedulerLocale(dayjsLocale);
    schedulerData.setCalendarPopoverLocale(antdLocale);
    schedulerData.setResources(DemoData.resources);
    schedulerData.setEvents(DemoData.events);
    this.state = {
      viewModel: schedulerData,
    };
  }

  // Helper function to clamp times to 8 AM and 7 PM
  clampEventTimes = (schedulerData, start, end) => {
    const { dayStartFrom, dayStopTo } = schedulerData.config;
    const startDate = new Date(start);
    const endDate = new Date(end);

    // Get the date part to preserve it
    const dateStr = startDate.toISOString().split('T')[0];

    // Clamp start time to 8 AM
    if (startDate.getHours() < dayStartFrom) {
      startDate.setHours(dayStartFrom, 0, 0, 0);
    }

    // Clamp end time to 7 PM
    if (endDate.getHours() > dayStopTo || (endDate.getHours() === dayStopTo && endDate.getMinutes() > 0)) {
      endDate.setHours(dayStopTo, 0, 0, 0);
    }

    // Ensure end is not before start
    if (endDate < startDate) {
      endDate.setTime(startDate.getTime() + 30 * 60 * 1000); // Default to 30 minutes after start
    }

    return {
      clampedStart: `${dateStr}T${startDate.getHours().toString().padStart(2, '0')}:00:00`,
      clampedEnd: `${dateStr}T${endDate.getHours().toString().padStart(2, '0')}:00:00`,
    };
  };

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

  prevClick = (schedulerData) => {
    schedulerData.prev();
    schedulerData.setEvents(DemoData.events);
    this.setState({ viewModel: schedulerData });
  };

  nextClick = (schedulerData) => {
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
    this.setState({ viewModel: schedulerData });
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
    const { clampedStart, clampedEnd } = this.clampEventTimes(schedulerData, start, end);

    if (confirm(`Do you want to create a new event? {slotId: ${slotId}, slotName: ${slotName}, start: ${clampedStart}, end: ${clampedEnd}, type: ${type}, item: ${item}}`)) {
      let newFreshId = 0;
      schedulerData.events.forEach((item) => {
        if (item.id >= newFreshId) newFreshId = item.id + 1;
      });

      let newEvent = {
        id: newFreshId,
        title: 'New event you just created',
        start: clampedStart,
        end: clampedEnd,
        resourceId: slotId,
        bgColor: 'purple',
      };
      schedulerData.addEvent(newEvent);
      this.setState({ viewModel: schedulerData });
    }
  };

  updateEventStart = (schedulerData, event, newStart) => {
    const { clampedStart } = this.clampEventTimes(schedulerData, newStart, event.end);
    if (confirm(`Do you want to adjust the start of the event? {eventId: ${event.id}, eventTitle: ${event.title}, newStart: ${clampedStart}}`)) {
      schedulerData.updateEventStart(event, clampedStart);
      this.setState({ viewModel: schedulerData });
    }
  };

  updateEventEnd = (schedulerData, event, newEnd) => {
    const { clampedEnd } = this.clampEventTimes(schedulerData, event.start, newEnd);
    if (confirm(`Do you want to adjust the end of the event? {eventId: ${event.id}, eventTitle: ${event.title}, newEnd: ${clampedEnd}}`)) {
      schedulerData.updateEventEnd(event, clampedEnd);
      this.setState({ viewModel: schedulerData });
    }
  };

  moveEvent = (schedulerData, event, slotId, slotName, start, end) => {
    const { clampedStart, clampedEnd } = this.clampEventTimes(schedulerData, start, end);
    if (
      confirm(
        `Do you want to move the event? {eventId: ${event.id}, eventTitle: ${event.title}, newSlotId: ${slotId}, newSlotName: ${slotName}, newStart: ${clampedStart}, newEnd: ${clampedEnd}}`
      )
    ) {
      schedulerData.moveEvent(event, slotId, slotName, clampedStart, clampedEnd);
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