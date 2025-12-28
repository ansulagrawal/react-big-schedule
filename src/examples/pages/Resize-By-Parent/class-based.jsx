import React, { Component, createRef } from 'react';
import { Button } from 'antd';
import { DemoData, Scheduler, SchedulerData, ViewType, wrapperFun } from '../../../index';

// Top-level constant for initial SchedulerData, following other examples
const getInitialSchedulerData = () => {
  const schedulerData = new SchedulerData('2022-12-18', ViewType.Week, false, false, {
    responsiveByParent: true,
    schedulerWidth: '100%',
    schedulerHeight: '100%',
    besidesWidth: 50,
    underneathHeight: 50,
    schedulerContentHeight: '100%',
    headerEnabled: true,
  });
  schedulerData.localeDayjs.locale('en');
  schedulerData.setResources(DemoData.resources);
  schedulerData.setEvents(DemoData.events);
  return schedulerData;
};

class ResizeByParent extends Component {
  constructor(props) {
    super(props);
    this.parentRef = createRef();
    this.state = {
      viewModel: getInitialSchedulerData(),
      parentWidth: 800,
      parentHeight: 400,
    };
  }

  componentDidMount() {
    // this.forceUpdate();
  }

  toggleExpandFunc = (schedulerData, slotId) => {
    schedulerData.toggleExpandStatus(slotId);
    this.setState({ viewModel: schedulerData });
  };

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

  onSelectDate = (schedulerData, date) => {
    schedulerData.setDate(date);
    schedulerData.setEvents(DemoData.events);
    this.setState({ viewModel: schedulerData });
  };

  onViewChange = (schedulerData, view) => {
    schedulerData.setViewType(view.viewType, view.showAgenda, view.isEventPerspective);
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

  increaseWidth = () => {
    this.setState(state => ({ parentWidth: state.parentWidth + 100 }));
  };

  decreaseWidth = () => {
    this.setState(state => ({ parentWidth: state.parentWidth > 300 ? state.parentWidth - 100 : state.parentWidth }));
  };

  increaseHeight = () => {
    this.setState(state => ({ parentHeight: state.parentHeight + 50 }));
  };

  decreaseHeight = () => {
    this.setState(state => ({ parentHeight: state.parentHeight > 200 ? state.parentHeight - 50 : state.parentHeight }));
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
        <div style={{ marginBottom: 16, marginTop: 16 }}>
          <div style={{ marginBottom: 8 }}>
            <Button onClick={this.decreaseWidth} style={{ marginRight: 8 }}>- Decrease Width</Button>
            <Button onClick={this.increaseWidth} style={{ marginRight: 8 }}>+ Increase Width</Button>
            <span style={{ marginLeft: 16 }}>
              Current parent width:&nbsp;
              {parentWidth}
              px
            </span>
          </div>
          <div style={{ marginBottom: 8 }}>
            <Button onClick={this.decreaseHeight} style={{ marginRight: 8 }}>- Decrease Height</Button>
            <Button onClick={this.increaseHeight}>+ Increase Height</Button>
            <span style={{ marginLeft: 16 }}>
              Current parent height:&nbsp;
              {parentHeight}
              px
            </span>
          </div>
          <div>
            <Button onClick={this.toggleHeader} style={{ marginRight: 8 }}>
              {viewModel.config.headerEnabled ? 'Disable' : 'Enable'}
              &nbsp;Header
            </Button>
          </div>
        </div>
        <div
          ref={this.parentRef}
          id="scheduler-parent"
          className="scheduler-container"
          role="region"
          style={{
            border: '2px solid #1890ff',
            transition: 'width 0.3s, height 0.3s',
            width: parentWidth,
            height: parentHeight,
            margin: '0 auto',
            background: '#f0f5ff',
            padding: 8,
          }}
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
        </div>
      </div>
    );
  }
}

export default wrapperFun(ResizeByParent);
