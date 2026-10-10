import type { ReactNode } from 'react';
import { DATE_FORMAT } from '../config/default';
import { toDate } from '../helper/behaviors';
import type {
  EventPopoverCallbacks,
  HeaderEvent,
  RenderItem,
  SlotClickedFunc,
  SlotItemTemplateResolver,
} from '../types';
import AgendaEventItem from './AgendaEventItem';
import type SchedulerData from './SchedulerData';

export interface AgendaResourceEventsProps extends EventPopoverCallbacks {
  schedulerData: SchedulerData;
  resourceEvents: RenderItem;
  slotClickedFunc?: SlotClickedFunc;
  slotItemTemplateResolver?: SlotItemTemplateResolver;
}

function AgendaResourceEvents(props: AgendaResourceEventsProps) {
  const { schedulerData, resourceEvents, slotClickedFunc, slotItemTemplateResolver } = props;
  const { startDate, endDate, config, localeDayjs } = schedulerData;
  const width = schedulerData.getResourceTableWidth() - 2;

  const events = resourceEvents.headerItems.flatMap(item => {
    const start = localeDayjs(toDate(startDate));
    const end = localeDayjs(endDate).add(1, 'days');
    const headerStart = localeDayjs(toDate(item.start));
    const headerEnd = localeDayjs(toDate(item.end));
    // compare calendar dates: dayjs objects are never === each other
    if (
      start.format(DATE_FORMAT) === headerStart.format(DATE_FORMAT) &&
      end.format(DATE_FORMAT) === headerEnd.format(DATE_FORMAT)
    ) {
      return item.events
        .filter((evt): evt is HeaderEvent => evt !== undefined)
        .map(evt => {
          const durationStart = localeDayjs(toDate(startDate));
          const durationEnd = localeDayjs(endDate).add(1, 'days');
          const eventStart = localeDayjs(evt.eventItem.start);
          const eventEnd = localeDayjs(evt.eventItem.end);
          const isStart = eventStart >= durationStart;
          const isEnd = eventEnd < durationEnd;
          return (
            <AgendaEventItem
              {...props}
              key={evt.eventItem.id}
              eventItem={evt.eventItem}
              isStart={isStart}
              isEnd={isEnd}
            />
          );
        });
    }
    return [];
  });

  const slotItemContent = slotClickedFunc ? (
    <button className="rbs-txt-btn-dis" type="button" onClick={() => slotClickedFunc(schedulerData, resourceEvents)}>
      {resourceEvents.slotName}
    </button>
  ) : (
    <span>{resourceEvents.slotName}</span>
  );

  let slotItem: ReactNode = (
    <div
      style={{ width }}
      title={resourceEvents.slotTitle || resourceEvents.slotName}
      className="overflow-text header2-text"
    >
      {slotItemContent}
    </div>
  );

  if (slotItemTemplateResolver) {
    const temp = slotItemTemplateResolver(
      schedulerData,
      resourceEvents,
      slotClickedFunc,
      width,
      'overflow-text header2-text',
    );

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

export default AgendaResourceEvents;
