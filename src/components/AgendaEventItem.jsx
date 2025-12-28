import React from 'react';
import PropTypes from 'prop-types';
import { Popover } from 'antd';
import EventItemPopover from './EventItemPopover';

function AgendaEventItem(props) {
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

  const eventItemStyle = { height: config.eventItemHeight, maxWidth: config.agendaMaxEventWidth, backgroundColor };

  let eventItemTemplate = (
    <div className={`${roundCls} event-item`} key={eventItem.id} style={eventItemStyle}>
      <span style={{ marginLeft: '10px', lineHeight: `${config.eventItemHeight}px` }}>{titleText}</span>
    </div>
  );

  if (eventItemTemplateResolver) {
    eventItemTemplate = eventItemTemplateResolver(schedulerData, eventItem, backgroundColor, isStart, isEnd, 'event-item', config.eventItemHeight, config.agendaMaxEventWidth);
  }

  const handleClick = () => eventItemClick?.(schedulerData, eventItem);

  const eventLink = (
    <button type="button" className="day-event txt-btn-dis" onClick={handleClick}>
      {eventItemTemplate}
    </button>
  );

  const content = <EventItemPopover {...props} title={eventItem.title} startTime={eventItem.start} endTime={eventItem.end} statusColor={backgroundColor} />;

  return config.eventItemPopoverEnabled ? (
    <Popover placement="bottomLeft" content={content} trigger="hover" overlayClassName="scheduler-agenda-event-popover">
      {eventLink}
    </Popover>
  ) : (
    <span>{eventLink}</span>
  );
}

AgendaEventItem.propTypes = {
  schedulerData: PropTypes.object.isRequired,
  eventItem: PropTypes.object.isRequired,
  isStart: PropTypes.bool.isRequired,
  isEnd: PropTypes.bool.isRequired,
  subtitleGetter: PropTypes.func,
  eventItemClick: PropTypes.func,
  viewEventClick: PropTypes.func,
  viewEventText: PropTypes.string,
  viewEvent2Click: PropTypes.func,
  viewEvent2Text: PropTypes.string,
  eventItemTemplateResolver: PropTypes.func,
};

export default AgendaEventItem;
