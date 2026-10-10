import { useState } from 'react';
import type { EventPopoverCallbacks, HeaderItem, SchedulerEvent } from '../types';
import DnDSource from './DnDSource';
import EventItem from './EventItem';
import type SchedulerData from './SchedulerData';
import { Close } from './ui/Icons';

export interface AddMorePopoverProps extends EventPopoverCallbacks {
  schedulerData: SchedulerData;
  headerItem: HeaderItem;
  left: number;
  top: number;
  height: number;
  closeAction: (headerItem?: HeaderItem) => void;
  moveEvent?: (...args: unknown[]) => void;
}

function AddMorePopover(props: AddMorePopoverProps) {
  const { schedulerData, headerItem, left, top, height, closeAction } = props;
  const { config, localeDayjs } = schedulerData;
  const { time, start, end, events } = headerItem;

  const [dndSource] = useState(
    () => new DnDSource((p: { eventItem: SchedulerEvent }) => p.eventItem, schedulerData.config.dragAndDropEnabled),
  );

  const header = localeDayjs(new Date(time)).format(config.addMorePopoverHeaderFormat);
  const durationStart = localeDayjs(new Date(start));
  const durationEnd = localeDayjs(end);
  const eventList = events.map((evt, i) => {
    if (evt !== undefined) {
      const eventStart = localeDayjs(evt.eventItem.start);
      const eventEnd = localeDayjs(evt.eventItem.end);
      const isStart = eventStart >= durationStart;
      const isEnd = eventEnd < durationEnd;
      const eventItemTop = 12 + (i + 1) * config.eventItemLineHeight;

      return (
        <EventItem
          {...props}
          key={evt.eventItem.id}
          eventItem={evt.eventItem}
          dndSource={dndSource}
          leftIndex={0}
          isInPopover
          isStart={isStart}
          isEnd={isEnd}
          rightIndex={1}
          left={10}
          width={138}
          top={eventItemTop}
        />
      );
    }
    return null;
  });

  return (
    <div className="rbs-add-more-popover-overlay" style={{ left, top, height, minWidth: '170px' }}>
      <div className="rbs:flex rbs:items-center rbs:justify-between">
        <span className="base-text rbs:min-w-0 rbs:flex-1">{header}</span>
        <button type="button" className="rbs-icon-btn" aria-label="Close" onClick={() => closeAction(undefined)}>
          <Close />
        </button>
      </div>
      {eventList.filter(Boolean)}
    </div>
  );
}

export default AddMorePopover;
