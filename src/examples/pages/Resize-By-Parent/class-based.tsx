import { Component, createRef } from 'react';
import { DemoData, SchedulerData, ViewType, wrapperFun } from '../../../index';
import Scheduler from '../../components/ThemedScheduler';
import { showInfo } from '../../helpers/dialogs';
import { messages } from '../../helpers/messages';
import { asViewType, type SP } from '../../helpers/scheduler';
import Button from '../../ui/Button';

const getInitialSchedulerData = () => {
  const schedulerData = new SchedulerData(new Date(), ViewType.Week, false, false, {
    responsiveByParent: true,
    schedulerWidth: '100%',
    schedulerHeight: '100%',
    underneathHeight: 50,
    schedulerContentHeight: '100%',
    headerEnabled: true,
  });
  schedulerData.localeDayjs.locale('en');
  schedulerData.setResources(DemoData.resources);
  schedulerData.setEvents(DemoData.events);
  return schedulerData;
};

interface State {
  viewModel: SchedulerData;
  parentWidth: number;
  parentHeight: number;
}

class ResizeByParent extends Component<object, State> {
  parentRef = createRef<HTMLElement>();

  state: State = {
    viewModel: getInitialSchedulerData(),
    parentWidth: 800,
    parentHeight: 400,
  };

  toggleExpandFunc: NonNullable<SP['toggleExpandFunc']> = (schedulerData, slotId) => {
    schedulerData.toggleExpandStatus(slotId);
    this.setState({ viewModel: schedulerData });
  };

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

  onSelectDate: SP['onSelectDate'] = (schedulerData, date) => {
    schedulerData.setDate(date);
    schedulerData.setEvents(DemoData.events);
    this.setState({ viewModel: schedulerData });
  };

  onViewChange: SP['onViewChange'] = (schedulerData, view) => {
    schedulerData.setViewType(asViewType(view.viewType), view.showAgenda, view.isEventPerspective);
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

  increaseWidth = () => {
    this.setState(state => ({ parentWidth: state.parentWidth + 100 }));
  };

  decreaseWidth = () => {
    this.setState(state => ({ parentWidth: Math.max(state.parentWidth - 100, 300) }));
  };

  increaseHeight = () => {
    this.setState(state => ({ parentHeight: state.parentHeight + 50 }));
  };

  decreaseHeight = () => {
    this.setState(state => ({ parentHeight: Math.max(state.parentHeight - 50, 200) }));
  };

  toggleHeader = () => {
    const { viewModel } = this.state;
    viewModel.config = { ...viewModel.config, headerEnabled: !viewModel.config.headerEnabled };
    this.setState({ viewModel });
  };

  render() {
    const { viewModel, parentWidth, parentHeight } = this.state;
    return (
      <div>
        <div className="ex-toolbar">
          <Button onClick={this.decreaseWidth}>- Decrease Width</Button>
          <Button onClick={this.increaseWidth}>+ Increase Width</Button>
          <span>Current parent width: {parentWidth}px</span>
        </div>
        <div className="ex-toolbar">
          <Button onClick={this.decreaseHeight}>- Decrease Height</Button>
          <Button onClick={this.increaseHeight}>+ Increase Height</Button>
          <span>Current parent height: {parentHeight}px</span>
        </div>
        <div className="ex-toolbar">
          <Button onClick={this.toggleHeader}>{viewModel.config.headerEnabled ? 'Disable' : 'Enable'} Header</Button>
        </div>
        <section
          ref={this.parentRef}
          id="scheduler-parent"
          className="scheduler-container ex-resize-parent"
          style={{ width: parentWidth, height: parentHeight }}
        >
          <Scheduler
            parentRef={this.parentRef}
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
        </section>
      </div>
    );
  }
}

export default wrapperFun(ResizeByParent);
