import type { ReactNode } from 'react';
import type { EventPopoverCallbacks, SchedulerEvent } from '../types';
import type SchedulerData from './SchedulerData';

export interface EventItemPopoverProps extends EventPopoverCallbacks {
  schedulerData: SchedulerData;
  eventItem: SchedulerEvent;
  title: string;
  startTime: string;
  endTime: string;
  statusColor: string;
}

const Row = ({ dot, children, truncate }: { dot?: ReactNode; children: ReactNode; truncate?: boolean }) => (
  <div className="rbs:flex rbs:items-center">
    <div className="rbs:w-6 rbs:shrink-0">{dot ?? <div />}</div>
    <div className={`rbs:min-w-0 rbs:flex-1${truncate ? ' overflow-text' : ''}`}>{children}</div>
  </div>
);

function EventItemPopover({
  schedulerData,
  eventItem,
  title,
  startTime,
  endTime,
  statusColor,
  subtitleGetter,
  viewEventClick,
  viewEventText,
  viewEvent2Click,
  viewEvent2Text,
  eventItemPopoverTemplateResolver,
}: EventItemPopoverProps) {
  const { localeDayjs, config } = schedulerData;
  const start = localeDayjs(new Date(startTime));
  const end = localeDayjs(new Date(endTime));

  if (eventItemPopoverTemplateResolver) {
    return <>{eventItemPopoverTemplateResolver(schedulerData, eventItem, title, start, end, statusColor)}</>;
  }

  const subtitle = subtitleGetter ? subtitleGetter(schedulerData, eventItem) : null;
  const showViewEvent = viewEventText && viewEventClick && (eventItem.clickable1 === undefined || eventItem.clickable1);
  const showViewEvent2 =
    viewEvent2Text && viewEvent2Click && (eventItem.clickable2 === undefined || eventItem.clickable2);

  const renderViewEvent = (
    text: string,
    clickHandler: (schedulerData: SchedulerData, eventItem: SchedulerEvent) => void,
    marginLeft = 0,
  ) => (
    <button
      className="header2-text rbs-txt-btn-dis"
      type="button"
      style={{
        color: 'var(--rbs-accent)',
        cursor: 'pointer',
        marginLeft: `${marginLeft}px`,
      }}
      onClick={() => clickHandler(schedulerData, eventItem)}
    >
      {text}
    </button>
  );

  return (
    <div style={{ width: config.eventItemPopoverWidth }}>
      <Row
        truncate
        dot={
          config.eventItemPopoverShowColor ? (
            <div className="status-dot" style={{ backgroundColor: statusColor }} />
          ) : null
        }
      >
        <span className="header2-text" title={title}>
          {title}
        </span>
      </Row>
      {subtitle && (
        <Row truncate>
          <span className="header2-text" title={typeof subtitle === 'string' ? subtitle : undefined}>
            {subtitle}
          </span>
        </Row>
      )}
      <Row>
        <span className="header1-text">{start.format('HH:mm')}</span>
        {config.eventItemPopoverDateFormat && (
          <span className="help-text" style={{ marginLeft: '8px' }}>
            {start.format(config.eventItemPopoverDateFormat)}
          </span>
        )}
        <span className="header2-text" style={{ marginLeft: '8px' }}>
          -
        </span>
        <span className="header1-text" style={{ marginLeft: '8px' }}>
          {end.format('HH:mm')}
        </span>
        {config.eventItemPopoverDateFormat && (
          <span className="help-text" style={{ marginLeft: '8px' }}>
            {end.format(config.eventItemPopoverDateFormat)}
          </span>
        )}
      </Row>
      {(showViewEvent || showViewEvent2) && (
        <Row>
          {showViewEvent && renderViewEvent(viewEventText, viewEventClick)}
          {showViewEvent2 && renderViewEvent(viewEvent2Text, viewEvent2Click, 16)}
        </Row>
      )}
    </div>
  );
}

export default EventItemPopover;
