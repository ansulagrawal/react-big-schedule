import { useState } from 'react';
import { DemoData, SchedulerData, ViewType, wrapperFun } from '../../../index';
import PageHeader from '../../components/PageHeader';
import Scheduler from '../../components/ThemedScheduler';
import { asViewType, copyOf, type SP } from '../../helpers/scheduler';

const createSchedulerData = () => {
  const schedulerData = new SchedulerData(new Date(), ViewType.Quarter, false, false, {
    // header rows: month names, then week numbers, then the day cells
    showMonthRow: true,
    showWeekNumber: true,
    schedulerMaxHeight: 400,
    views: [
      { viewName: 'Quarter', viewType: ViewType.Quarter, showAgenda: false, isEventPerspective: false },
      { viewName: 'Month', viewType: ViewType.Month, showAgenda: false, isEventPerspective: false },
      { viewName: 'Week', viewType: ViewType.Week, showAgenda: false, isEventPerspective: false },
    ],
  });
  schedulerData.setResources(DemoData.resources);
  schedulerData.setEvents(DemoData.events);
  return schedulerData;
};

function GroupedHeader() {
  const [viewModel, setViewModel] = useState(createSchedulerData);

  const refresh = (schedulerData: SchedulerData) => {
    schedulerData.setEvents(DemoData.events);
    setViewModel(copyOf(schedulerData));
  };

  const prevClick: SP['prevClick'] = schedulerData => {
    schedulerData.prev();
    refresh(schedulerData);
  };

  const nextClick: SP['nextClick'] = schedulerData => {
    schedulerData.next();
    refresh(schedulerData);
  };

  const onSelectDate: SP['onSelectDate'] = (schedulerData, date) => {
    schedulerData.setDate(date);
    refresh(schedulerData);
  };

  const onViewChange: SP['onViewChange'] = (schedulerData, view) => {
    schedulerData.setViewType(asViewType(view.viewType), view.showAgenda, view.isEventPerspective);
    refresh(schedulerData);
  };

  return (
    <>
      <PageHeader title="Grouped Header Example" source="Grouped-Header/index.tsx" />
      <Scheduler
        schedulerData={viewModel}
        prevClick={prevClick}
        nextClick={nextClick}
        onSelectDate={onSelectDate}
        onViewChange={onViewChange}
      />
    </>
  );
}

export default wrapperFun(GroupedHeader);
