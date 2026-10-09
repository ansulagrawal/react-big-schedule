import { Button, message, Row, Space, Switch, Typography } from 'antd';
import { useState } from 'react';
import { DemoData, Scheduler, SchedulerData, SummaryPos, ViewType, wrapperFun } from '../../../index';
import SourceCode from '../../components/SourceCode';
import { URLS } from '../../constants';

// events with an extra `owner` field, shown in the custom popover
const events = DemoData.events.map(event => ({ ...event, owner: event.resourceId === 'r1' ? 'Team A' : 'Team B' }));

const copyOf = schedulerData => Object.assign(Object.create(Object.getPrototypeOf(schedulerData)), schedulerData);

// Cell summary: number of events starting in the cell
const getSummaryFunc = (_schedulerData, headerEvents) => ({
  text: headerEvents.length > 0 ? String(headerEvents.length) : '',
  color: '#d4380d',
  fontSize: '12px',
});

const createSchedulerData = () => {
  const schedulerData = new SchedulerData(
    '2022-12-22',
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

// Custom event style: a white card with a coloured edge
const eventItemTemplateResolver = (_schedulerData, event, bgColor, _isStart, _isEnd, mustAddCssClass, mustBeHeight) => (
  <div
    key={event.id}
    className={mustAddCssClass}
    style={{
      height: mustBeHeight,
      background: '#fff',
      border: '1px solid #d9d9d9',
      borderLeft: `4px solid ${bgColor}`,
      borderRadius: 4,
      color: '#262626',
      overflow: 'hidden',
      padding: '0 6px',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }}
  >
    {event.title}
  </div>
);

// Custom popover: shows an extra event field (`owner`)
const eventItemPopoverTemplateResolver = (_schedulerData, event, title, start, end) => (
  <div style={{ minWidth: 200 }}>
    <Typography.Text strong>{title}</Typography.Text>
    <div>
      {start.format('MMM D HH:mm')} to {end.format('MMM D HH:mm')}
    </div>
    <div>Owner: {event.owner}</div>
  </div>
);

// Custom header cell: weekday letter and day number
const nonAgendaCellHeaderTemplateResolver = (_schedulerData, item, formattedDateItems, style) => (
  <th key={`header-${item.time}`} className="header3-text" style={style}>
    <div>{formattedDateItems.join(' ')}</div>
  </th>
);

function Customization() {
  const [viewModel, setViewModel] = useState(createSchedulerData);
  const [checkConflict, setCheckConflict] = useState(false);
  const [crossResourceMove, setCrossResourceMove] = useState(true);

  const update = schedulerData => setViewModel(copyOf(schedulerData));

  const prevClick = schedulerData => {
    schedulerData.prev();
    schedulerData.setEvents(schedulerData.events);
    update(schedulerData);
  };

  const nextClick = schedulerData => {
    schedulerData.next();
    schedulerData.setEvents(schedulerData.events);
    update(schedulerData);
  };

  const onSelectDate = (schedulerData, date) => {
    schedulerData.setDate(date);
    schedulerData.setEvents(schedulerData.events);
    update(schedulerData);
  };

  const onViewChange = (schedulerData, view) => {
    schedulerData.setViewType(view.viewType, view.showAgenda, view.isEventPerspective);
    schedulerData.setEvents(schedulerData.events);
    update(schedulerData);
  };

  const moveEvent = (schedulerData, event, slotId, slotName, start, end) => {
    schedulerData.moveEvent(event, slotId, slotName, start, end);
    update(schedulerData);
  };

  const conflictOccurred = (_schedulerData, action, event) => {
    message.warning(`Can't ${action.toLowerCase()} "${event.title ?? 'the event'}": it overlaps another event.`);
  };

  const addResource = () => {
    const next = viewModel.resources.length;
    viewModel.addResource({ id: `r${next}`, name: `Resource${next}` });
    update(viewModel);
  };

  const toggleConflictCheck = checked => {
    viewModel.config.checkConflict = checked;
    setCheckConflict(checked);
  };

  const toggleCrossResourceMove = checked => {
    viewModel.config.crossResourceMove = checked;
    setCrossResourceMove(checked);
  };

  return (
    <>
      <Row align="middle" justify="center">
        <Typography.Title level={2} className="m-0">
          Customization Example
        </Typography.Title>
      </Row>
      <SourceCode value={URLS.examples.customization} />
      <Space wrap size="large" style={{ margin: '12px 0' }}>
        <Button onClick={addResource}>Add resource</Button>
        <Space>
          <Switch checked={checkConflict} onChange={toggleConflictCheck} />
          Reject overlapping events
        </Space>
        <Space>
          <Switch checked={crossResourceMove} onChange={toggleCrossResourceMove} />
          Allow moving events to another resource
        </Space>
      </Space>
      <Scheduler
        schedulerData={viewModel}
        prevClick={prevClick}
        nextClick={nextClick}
        onSelectDate={onSelectDate}
        onViewChange={onViewChange}
        moveEvent={moveEvent}
        conflictOccurred={conflictOccurred}
        leftCustomHeader={<Typography.Text strong>Team schedule</Typography.Text>}
        eventItemTemplateResolver={eventItemTemplateResolver}
        eventItemPopoverTemplateResolver={eventItemPopoverTemplateResolver}
        nonAgendaCellHeaderTemplateResolver={nonAgendaCellHeaderTemplateResolver}
        slotClickedFunc={(_schedulerData, slot) => message.info(`Clicked ${slot.slotName}`)}
        onScrollLeft={() => message.info('Reached the first day')}
        onScrollRight={() => message.info('Reached the last day')}
      />
    </>
  );
}

export default wrapperFun(Customization);
