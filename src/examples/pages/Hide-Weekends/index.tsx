import { useState } from 'react';
import { DemoData, SchedulerData, ViewType, wrapperFun } from '../../../index';
import PageHeader from '../../components/PageHeader';
import Scheduler from '../../components/ThemedScheduler';
import { asViewType, copyOf } from '../../helpers/scheduler';
import Switch from '../../ui/Switch';

const createSchedulerData = () => {
  const schedulerData = new SchedulerData(new Date(), ViewType.Week, false, false, {
    // weekends are left out of the day columns
    displayWeekend: false,
    views: [
      { viewName: 'Week', viewType: ViewType.Week, showAgenda: false, isEventPerspective: false },
      { viewName: 'Month', viewType: ViewType.Month, showAgenda: false, isEventPerspective: false },
      { viewName: 'Agenda', viewType: ViewType.Week, showAgenda: true, isEventPerspective: false },
    ],
  });
  schedulerData.setResources(DemoData.resources);
  schedulerData.setEvents(DemoData.events);
  return schedulerData;
};

function HideWeekends() {
  const [viewModel, setViewModel] = useState(createSchedulerData);
  const [showWeekends, setShowWeekends] = useState(false);

  const refresh = (schedulerData: SchedulerData) => {
    schedulerData.setEvents(DemoData.events);
    setViewModel(copyOf(schedulerData));
  };

  const toggleWeekends = (checked: boolean) => {
    viewModel.config.displayWeekend = checked;
    setShowWeekends(checked);
    // rebuild the day columns for the current date
    viewModel.setDate(viewModel.startDate);
    refresh(viewModel);
  };

  return (
    <>
      <PageHeader title="Hide Weekends and Agenda Example" source="Hide-Weekends/index.tsx" />
      <div className="ex-toolbar">
        <Switch checked={showWeekends} onChange={toggleWeekends}>
          Show weekends (<code>displayWeekend</code>)
        </Switch>
      </div>
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
      />
    </>
  );
}

export default wrapperFun(HideWeekends);
