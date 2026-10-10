import { Component } from 'react';
import type { AddMoreState } from '../../../components/ResourceEvents';
import { getNextNumericEventId } from '../../../helper/utility';
import { AddMorePopover, DemoData, SchedulerData, ViewType, wrapperFun } from '../../../index';
import Scheduler from '../../components/ThemedScheduler';
import { confirmAction, showInfo } from '../../helpers/dialogs';
import { messages } from '../../helpers/messages';
import { asViewType, type SP } from '../../helpers/scheduler';

interface State {
  viewModel: SchedulerData;
  popover?: AddMoreState;
}

class AddMore extends Component<object, State> {
  constructor(props: object) {
    super(props);

    const schedulerData = new SchedulerData(new Date(), ViewType.Week, false, false, {
      dayMaxEvents: 2,
      weekMaxEvents: 4,
      monthMaxEvents: 4,
      quarterMaxEvents: 4,
      yearMaxEvents: 4,
    });
    schedulerData.localeDayjs.locale('en');
    schedulerData.setResources(DemoData.resources);
    schedulerData.setEvents(DemoData.events);
    this.state = { viewModel: schedulerData };
  }

  render() {
    const { viewModel, popover } = this.state;

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
        {popover && (
          <AddMorePopover
            headerItem={popover.headerItem}
            eventItemClick={this.eventClicked}
            viewEventClick={this.ops1}
            viewEventText="Ops 1"
            viewEvent2Click={this.ops2}
            viewEvent2Text="Ops 2"
            schedulerData={viewModel}
            closeAction={this.closePopover}
            left={popover.left}
            top={popover.top}
            height={popover.height}
            moveEvent={this.moveEvent as (...args: unknown[]) => void}
          />
        )}
      </div>
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

  onSetAddMoreState: NonNullable<SP['onSetAddMoreState']> = popover => {
    this.setState({ popover });
  };

  closePopover = () => {
    this.setState({ popover: undefined });
  };

  toggleExpandFunc: NonNullable<SP['toggleExpandFunc']> = (schedulerData, slotId) => {
    schedulerData.toggleExpandStatus(slotId);
    this.setState({ viewModel: schedulerData });
  };
}

export default wrapperFun(AddMore);
