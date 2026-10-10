import { useState } from 'react';
import { DemoData, SchedulerData, ViewType, wrapperFun } from '../../../index';
import PageHeader from '../../components/PageHeader';
import Scheduler from '../../components/ThemedScheduler';
import { asViewType, copyOf, type SP } from '../../helpers/scheduler';

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

  const refresh = (schedulerData: SchedulerData) => {
    schedulerData.setEvents(DemoData.events);
    setViewModel(copyOf(schedulerData));
  };

  const onScrollRight: NonNullable<SP['onScrollRight']> = (schedulerData, schedulerContent, maxScrollLeft) => {
    schedulerData.next();
    refresh(schedulerData);
    schedulerContent.scrollLeft = maxScrollLeft - 10;
  };

  const onScrollLeft: NonNullable<SP['onScrollLeft']> = (schedulerData, schedulerContent) => {
    schedulerData.prev();
    refresh(schedulerData);
    schedulerContent.scrollLeft = 10;
  };

  return (
    <>
      <PageHeader title="Infinite Scroll Example" source="Infinite-Scroll/index.tsx" />
      <p className="ex-center">Scroll the timeline to its left or right end to load the previous or next day.</p>
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
          schedulerData.setViewType(asViewType(view.viewType), view.showAgenda, view.isEventPerspective);
          refresh(schedulerData);
        }}
        onScrollLeft={onScrollLeft}
        onScrollRight={onScrollRight}
      />
    </>
  );
}

export default wrapperFun(InfiniteScroll);
