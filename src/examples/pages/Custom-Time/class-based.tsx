import 'dayjs/locale/pt-br';
import { Component } from 'react';
import { getNextNumericEventId } from '../../../helper/utility';
import { DemoData, SchedulerData, ViewType, wrapperFun } from '../../../index';
import Scheduler from '../../components/ThemedScheduler';
import { confirmAction, showInfo } from '../../helpers/dialogs';
import { messages } from '../../helpers/messages';
import { asViewType, type SP } from '../../helpers/scheduler';

interface State {
  viewModel: SchedulerData;
}

class CustomTime extends Component<object, State> {
  constructor(props: object) {
    super(props);

    const schedulerData = new SchedulerData(new Date(), ViewType.Day, false, false, {
      dayMaxEvents: 99,
      dayStartFrom: 8,
      dayStopTo: 18,
      customMaxEvents: 9965,
      eventItemPopoverTrigger: 'click',
      views: [],
      showWeekNumber: true,
      schedulerContentHeight: '100%',
      weekNumberRowHeight: 30,
    });

    schedulerData.setSchedulerLocale('pt-br');
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
    const start = performance.now();
    schedulerData.setViewType(asViewType(view.viewType), view.showAgenda, view.isEventPerspective);
    schedulerData.setEvents(DemoData.events);
    this.setState({ viewModel: schedulerData });
    console.log(`Elapsed seconds: ${(performance.now() - start) / 1000}`);
  };

  onSelectDate: SP['onSelectDate'] = (schedulerData, date) => {
    schedulerData.setDate(date);
    schedulerData.setEvents(DemoData.events);
    this.setState({ viewModel: schedulerData });
  };

  ops1: NonNullable<SP['viewEventClick']> = (_schedulerData, event) => {
    showInfo(messages.ops('Ops 1', event));
  };

  ops2: NonNullable<SP['viewEvent2Click']> = (_schedulerData, event) => {
    showInfo(messages.ops('Ops 2', event));
  };

  newEvent: NonNullable<SP['newEvent']> = (schedulerData, slotId, slotName, start, end, _type, item) => {
    confirmAction(messages.create(slotName, start, end), () => {
      const selectedResourceIds =
        Array.isArray(item?.resourceIds) && item.resourceIds.length > 0 ? item.resourceIds : [slotId];

      schedulerData.addEvent({
        id: getNextNumericEventId(schedulerData.events),
        title: 'New event you just created',
        start,
        end,
        resourceId: selectedResourceIds[0] ?? slotId,
        resourceIds: selectedResourceIds,
        bgColor: 'purple',
      });
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

  onScrollRight: NonNullable<SP['onScrollRight']> = (schedulerData, schedulerContent, maxScrollLeft) => {
    if (schedulerData.viewType === ViewType.Day) {
      schedulerData.next();
      schedulerData.setEvents(DemoData.events);
      this.setState({ viewModel: schedulerData });

      schedulerContent.scrollLeft = maxScrollLeft - 10;
    }
  };

  onScrollLeft: NonNullable<SP['onScrollLeft']> = (schedulerData, schedulerContent) => {
    if (schedulerData.viewType === ViewType.Day) {
      schedulerData.prev();
      schedulerData.setEvents(DemoData.events);
      this.setState({ viewModel: schedulerData });

      schedulerContent.scrollLeft = 10;
    }
  };

  onScrollTop = () => console.log('onScrollTop');

  onScrollBottom = () => console.log('onScrollBottom');

  toggleExpandFunc: NonNullable<SP['toggleExpandFunc']> = (schedulerData, slotId) => {
    schedulerData.toggleExpandStatus(slotId);
    this.setState({ viewModel: schedulerData });
  };
}

export default wrapperFun(CustomTime);
