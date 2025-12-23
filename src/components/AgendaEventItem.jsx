import { Popover } from 'antd';
import PropTypes from 'prop-types';
import EventItemPopover from './EventItemPopover';

/**
 * Render an agenda-style event item with optional custom template and hover popover.
 *
 * @param {Object} props - Component props.
 * @param {Object} props.schedulerData - Scheduler configuration and behaviors.
 * @param {Object} props.eventItem - Event data (id, title, start, end, bgColor, etc.).
 * @param {boolean} props.isStart - True when this item is the start segment of the event.
 * @param {boolean} props.isEnd - True when this item is the end segment of the event.
 * @param {Function} [props.eventItemClick] - Click handler called as (schedulerData, eventItem).
 * @param {Function} [props.eventItemTemplateResolver] - Optional resolver to provide a custom event item element.
 * @returns {React.Element} A rendered event item element; wrapped in a Popover when popovers are enabled in the scheduler config.
 */
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
    eventItemTemplate = eventItemTemplateResolver(
      schedulerData,
      eventItem,
      backgroundColor,
      isStart,
      isEnd,
      'event-item',
      config.eventItemHeight,
      config.agendaMaxEventWidth
    );
  }

  const handleClick = () => eventItemClick?.(schedulerData, eventItem);

  const eventLink = (
    <button type='button' className='day-event txt-btn-dis' onClick={handleClick}>
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
    <Popover placement='bottomLeft' content={content} trigger='hover' overlayClassName='scheduler-agenda-event-popover'>
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