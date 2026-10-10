import { Row, Typography } from 'antd';
import { useState } from 'react';
import { DemoData, Scheduler, SchedulerData, ViewType, wrapperFun } from '../../../index';
import SourceCode from '../../components/SourceCode';
import { URLS } from '../../constants';

const copyOf = schedulerData => Object.assign(Object.create(Object.getPrototypeOf(schedulerData)), schedulerData);

const createSchedulerData = () => {
  const schedulerData = new SchedulerData('2022-12-22', ViewType.Day, false, false, {
    // narrow cells so the day overflows the container and the content can be scrolled sideways
    dayCellWidth: 90,
    views: [{ viewName: 'Day', viewType: ViewType.Day, showAgenda: false, isEventPerspective: false }],
  });
  schedulerData.setResources(DemoData.resources);
  schedulerData.setEvents(DemoData.events);
  return schedulerData;
};

// Scrolling to either end loads the neighbouring day and keeps the scroll position near that end.
function InfiniteScroll() {
  const [viewModel, setViewModel] = useState(createSchedulerData);

  const refresh = schedulerData => {
    schedulerData.setEvents(DemoData.events);
    setViewModel(copyOf(schedulerData));
  };

  const onScrollRight = (schedulerData, schedulerContent, maxScrollLeft) => {
    schedulerData.next();
    refresh(schedulerData);
    schedulerContent.scrollLeft = maxScrollLeft - 10;
  };

  const onScrollLeft = (schedulerData, schedulerContent) => {
    schedulerData.prev();
    refresh(schedulerData);
    schedulerContent.scrollLeft = 10;
  };

  return (
    <>
      <Row align="middle" justify="center">
        <Typography.Title level={2} className="m-0">
          Infinite Scroll Example
        </Typography.Title>
      </Row>
      <SourceCode value={URLS.examples.infiniteScroll} />
      <Typography.Paragraph style={{ textAlign: 'center' }}>
        Scroll the timeline to its left or right end to load the previous or next day.
      </Typography.Paragraph>
      <Scheduler
        schedulerData={viewModel}
        prevClick={schedulerData => {
          schedulerData.prev();
          refresh(schedulerData);
        }}
        nextClick={schedulerData => {
          schedulerData.next();
          refresh(schedulerData);
        }}
        onSelectDate={(schedulerData, date) => {
          schedulerData.setDate(date);
          refresh(schedulerData);
        }}
        onViewChange={(schedulerData, view) => {
          schedulerData.setViewType(view.viewType, view.showAgenda, view.isEventPerspective);
          refresh(schedulerData);
        }}
        onScrollLeft={onScrollLeft}
        onScrollRight={onScrollRight}
      />
    </>
  );
}

export default wrapperFun(InfiniteScroll);
