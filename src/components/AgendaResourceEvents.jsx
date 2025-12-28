import React from 'react';
import PropTypes from 'prop-types';
import AgendaEventItem from './AgendaEventItem';

function AgendaResourceEvents(props) {
  const { schedulerData, resourceEvents, slotClickedFunc, slotItemTemplateResolver } = props;
  const { startDate, endDate, config, localeDayjs } = schedulerData;
  const width = schedulerData.getResourceTableWidth() - 2;

  const events = resourceEvents.headerItems.flatMap(item => {
    const start = localeDayjs(new Date(startDate));
    const end = localeDayjs(endDate).add(1, 'days');
    const headerStart = localeDayjs(new Date(item.start));
    const headerEnd = localeDayjs(new Date(item.end));
    if (start === headerStart && end === headerEnd) {
      return item.events.map(evt => {
        const durationStart = localeDayjs(new Date(startDate));
        const durationEnd = localeDayjs(endDate).add(1, 'days');
        const eventStart = localeDayjs(evt.eventItem.start);
        const eventEnd = localeDayjs(evt.eventItem.end);
        const isStart = eventStart >= durationStart;
        const isEnd = eventEnd < durationEnd;
        return <AgendaEventItem {...props} key={evt.eventItem.id} eventItem={evt.eventItem} isStart={isStart} isEnd={isEnd} />;
      });
    }
    return [];
  });

  const slotItemContent = slotClickedFunc ? (
    <button className="txt-btn-dis" type="button" onClick={() => slotClickedFunc(schedulerData, resourceEvents)}>
      {resourceEvents.slotName}
    </button>
  ) : (
    <span>{resourceEvents.slotName}</span>
  );

  let slotItem = (
    <div style={{ width }} title={resourceEvents.slotTitle || resourceEvents.slotName} className="overflow-text header2-text">
      {slotItemContent}
    </div>
  );

  if (slotItemTemplateResolver) {
    const temp = slotItemTemplateResolver(schedulerData, resourceEvents, slotClickedFunc, width, 'overflow-text header2-text');

    if (temp) {
      slotItem = temp;
    }
  }

  return (
    <tr style={{ minHeight: config.eventItemLineHeight + 2 }}>
      <td data-resource-id={resourceEvents.slotId}>{slotItem}</td>
      <td>
        <div className="day-event-container">{events}</div>
      </td>
    </tr>
  );
}

AgendaResourceEvents.propTypes = {
  schedulerData: PropTypes.object.isRequired,
  resourceEvents: PropTypes.object.isRequired,
  subtitleGetter: PropTypes.func,
  eventItemClick: PropTypes.func,
  viewEventClick: PropTypes.func,
  viewEventText: PropTypes.string,
  viewEvent2Click: PropTypes.func,
  viewEvent2Text: PropTypes.string,
  slotClickedFunc: PropTypes.func,
  slotItemTemplateResolver: PropTypes.func,
};

export default AgendaResourceEvents;
