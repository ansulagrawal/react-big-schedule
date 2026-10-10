import { useState } from 'react';
import { DemoData, SchedulerData, SummaryPos, ViewType, wrapperFun } from '../../../index';
import type { Behaviors, SchedulerEvent } from '../../../types';
import PageHeader from '../../components/PageHeader';
import Scheduler from '../../components/ThemedScheduler';
import { toast } from '../../helpers/dialogs';
import { asViewType, copyOf, type SP } from '../../helpers/scheduler';
import Button from '../../ui/Button';
import Switch from '../../ui/Switch';

// events with an extra `owner` field, shown in the custom popover
const events: SchedulerEvent[] = DemoData.events.map(event => ({
  ...event,
  owner: event.resourceId === 'r1' ? 'Team A' : 'Team B',
}));

// Cell summary: number of events starting in the cell
const getSummaryFunc: NonNullable<Behaviors['getSummaryFunc']> = (_schedulerData, headerEvents) => ({
  text: headerEvents.length > 0 ? String(headerEvents.length) : '',
  color: '#d4380d',
  fontSize: '12px',
});

const createSchedulerData = () => {
  const schedulerData = new SchedulerData(
    new Date(),
    ViewType.Month,
    false,
    false,
    {
      // header row stays frozen and the body scrolls once the rows are taller than this
      schedulerMaxHeight: 360,
      summaryPos: SummaryPos.TopRight,
      checkConflict: false,
      crossResourceMove: true,
      views: [
        { viewName: 'Month', viewType: ViewType.Month, showAgenda: false, isEventPerspective: false },
        { viewName: 'Week', viewType: ViewType.Week, showAgenda: false, isEventPerspective: false },
      ],
    },
    { getSummaryFunc },
  );
  schedulerData.setResources(DemoData.resources);
  schedulerData.setEvents(events);
  return schedulerData;
};

// Custom event style: a card with a coloured edge
const eventItemTemplateResolver: NonNullable<SP['eventItemTemplateResolver']> = (
  _schedulerData,
  event,
  bgColor,
  _isStart,
  _isEnd,
  mustAddCssClass,
  mustBeHeight,
) => (
  <div
    key={event.id}
    className={`${mustAddCssClass} ex-custom-event`}
    style={{ height: mustBeHeight, borderLeftColor: bgColor }}
  >
    {event.title}
  </div>
);

// Custom popover: shows an extra event field (`owner`)
const eventItemPopoverTemplateResolver: NonNullable<SP['eventItemPopoverTemplateResolver']> = (
  _schedulerData,
  event,
  title,
  start,
  end,
) => (
  <div style={{ minWidth: 200 }}>
    <strong>{title}</strong>
    <div>
      {start.format('MMM D HH:mm')} to {end.format('MMM D HH:mm')}
    </div>
    <div>Owner: {String(event.owner)}</div>
  </div>
);

// Custom header cell: weekday letter and day number
const nonAgendaCellHeaderTemplateResolver: NonNullable<SP['nonAgendaCellHeaderTemplateResolver']> = (
  _schedulerData,
  item,
  formattedDateItems,
  style,
) => (
  <th key={`header-${item.time}`} className="header3-text" style={style}>
    <div>{formattedDateItems.join(' ')}</div>
  </th>
);

function Customization() {
  const [viewModel, setViewModel] = useState(createSchedulerData);
  const [checkConflict, setCheckConflict] = useState(false);
  const [crossResourceMove, setCrossResourceMove] = useState(true);

  const update = (schedulerData: SchedulerData) => setViewModel(copyOf(schedulerData));

  const prevClick: SP['prevClick'] = schedulerData => {
    schedulerData.prev();
    schedulerData.setEvents(events);
    update(schedulerData);
  };

  const nextClick: SP['nextClick'] = schedulerData => {
    schedulerData.next();
    schedulerData.setEvents(events);
    update(schedulerData);
  };

  const onSelectDate: SP['onSelectDate'] = (schedulerData, date) => {
    schedulerData.setDate(date);
    schedulerData.setEvents(events);
    update(schedulerData);
  };

  const onViewChange: SP['onViewChange'] = (schedulerData, view) => {
    schedulerData.setViewType(asViewType(view.viewType), view.showAgenda, view.isEventPerspective);
    schedulerData.setEvents(events);
    update(schedulerData);
  };

  const moveEvent: NonNullable<SP['moveEvent']> = (schedulerData, event, slotId, slotName, start, end) => {
    schedulerData.moveEvent(event, slotId, slotName, start, end);
    update(schedulerData);
  };

  const conflictOccurred: NonNullable<SP['conflictOccurred']> = (_schedulerData, action, event) => {
    toast(`Can't ${action.toLowerCase()} "${event.title ?? 'the event'}": it overlaps another event.`);
  };

  const addResource = () => {
    const next = viewModel.resources.length;
    viewModel.addResource({ id: `r${next}`, name: `Resource${next}` });
    update(viewModel);
  };

  const toggleConflictCheck = (checked: boolean) => {
    viewModel.config.checkConflict = checked;
    setCheckConflict(checked);
  };

  const toggleCrossResourceMove = (checked: boolean) => {
    viewModel.config.crossResourceMove = checked;
    setCrossResourceMove(checked);
  };

  return (
    <>
      <PageHeader title="Customization Example" source="Customization/index.tsx" />
      <div className="ex-toolbar">
        <Button onClick={addResource}>Add resource</Button>
        <Switch checked={checkConflict} onChange={toggleConflictCheck}>
          Reject overlapping events
        </Switch>
        <Switch checked={crossResourceMove} onChange={toggleCrossResourceMove}>
          Allow moving events to another resource
        </Switch>
      </div>
      <Scheduler
        schedulerData={viewModel}
        prevClick={prevClick}
        nextClick={nextClick}
        onSelectDate={onSelectDate}
        onViewChange={onViewChange}
        moveEvent={moveEvent}
        conflictOccurred={conflictOccurred}
        leftCustomHeader={<strong>Team schedule</strong>}
        eventItemTemplateResolver={eventItemTemplateResolver}
        eventItemPopoverTemplateResolver={eventItemPopoverTemplateResolver}
        nonAgendaCellHeaderTemplateResolver={nonAgendaCellHeaderTemplateResolver}
        slotClickedFunc={(_schedulerData, slot) => toast(`Clicked ${slot.slotName}`)}
        onScrollLeft={() => toast('Reached the first day')}
        onScrollRight={() => toast('Reached the last day')}
      />
    </>
  );
}

export default wrapperFun(Customization);
