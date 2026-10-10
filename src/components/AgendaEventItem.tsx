import type { ReactNode } from 'react';
import type { EventPopoverCallbacks, SchedulerEvent } from '../types';
import EventItemPopover from './EventItemPopover';
import type SchedulerData from './SchedulerData';
import Popover from './ui/Popover';

export interface AgendaEventItemProps extends EventPopoverCallbacks {
  schedulerData: SchedulerData;
  eventItem: SchedulerEvent;
  isStart: boolean;
  isEnd: boolean;
}

function AgendaEventItem(props: AgendaEventItemProps) {
  const { eventItem, isStart, isEnd, eventItemClick, schedulerData, eventItemTemplateResolver } = props;
  const { config, behaviors } = schedulerData;

  let roundCls = 'round-none';
  if (isStart && isEnd) {
    roundCls = 'round-all';
  } else if (isStart) {
    roundCls = 'round-head';
  } else if (isEnd) {
    roundCls = 'round-tail';
  }

  const backgroundColor = eventItem.bgColor || config.defaultEventBgColor;
  const titleText = behaviors.getEventTextFunc(schedulerData, eventItem);

  const eventItemStyle = {
    height: config.eventItemHeight,
    maxWidth: config.agendaMaxEventWidth,
    backgroundColor,
  };

  let eventItemTemplate: ReactNode = (
    <div className={`${roundCls} event-item`} key={eventItem.id} style={eventItemStyle}>
      <span
        style={{
          marginLeft: '10px',
          lineHeight: `${config.eventItemHeight}px`,
        }}
      >
        {titleText}
      </span>
    </div>
  );

  if (eventItemTemplateResolver) {
    eventItemTemplate = eventItemTemplateResolver(
      schedulerData,
      eventItem,
      backgroundColor,
      isStart,
      isEnd,
      'event-item',
      config.eventItemHeight,
      config.agendaMaxEventWidth,
    );
  }

  const handleClick = () => eventItemClick?.(schedulerData, eventItem);

  const eventLink = (
    <button type="button" className="day-event rbs-txt-btn-dis" onClick={handleClick}>
      {eventItemTemplate}
    </button>
  );

  const content = (
    <EventItemPopover
      {...props}
      title={eventItem.title}
      startTime={eventItem.start}
      endTime={eventItem.end}
      statusColor={backgroundColor}
    />
  );

  return config.eventItemPopoverEnabled ? (
    <Popover placement="bottomLeft" content={content} trigger="hover" className="scheduler-agenda-event-popover">
      {eventLink}
    </Popover>
  ) : (
    <span>{eventLink}</span>
  );
}

export default AgendaEventItem;
