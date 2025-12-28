/* eslint-disable */
import { PropTypes } from 'prop-types';
import React, { Component } from 'react';
import { CellUnit, DATETIME_FORMAT, DnDTypes, SummaryPos } from '../config/default';
import { getPos } from '../helper/utility';
import AddMore from './AddMore';
import SelectedArea from './SelectedArea';
import Summary from './Summary';

class ResourceEvents extends Component {
  static propTypes = {
    resourceEvents: PropTypes.object.isRequired,
    schedulerData: PropTypes.object.isRequired,
    dndSource: PropTypes.object.isRequired,
    onSetAddMoreState: PropTypes.func,
    updateEventStart: PropTypes.func,
    updateEventEnd: PropTypes.func,
    moveEvent: PropTypes.func,
    movingEvent: PropTypes.func,
    conflictOccurred: PropTypes.func,
    subtitleGetter: PropTypes.func,
    eventItemClick: PropTypes.func,
    viewEventClick: PropTypes.func,
    viewEventText: PropTypes.string,
    viewEvent2Click: PropTypes.func,
    viewEvent2Text: PropTypes.string,
    newEvent: PropTypes.func,
    eventItemTemplateResolver: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.state = {
      isSelecting: false,
      left: 0,
      width: 0,
    };
    this.supportTouch = false; // 'ontouchstart' in window;
  }

  componentDidMount() {
    const { schedulerData } = this.props;
    const { config } = schedulerData;
    this.supportTouch = 'ontouchstart' in window;

    if (config.creatable === true) {
      this.supportTouchHelper();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      const { schedulerData } = this.props;
      this.supportTouchHelper('remove');
      if (schedulerData.config.creatable) {
        this.supportTouchHelper();
      }
    }
  }

  supportTouchHelper = (evType = 'add') => {
    const ev = evType === 'add' ? this.eventContainer.addEventListener : this.eventContainer.removeEventListener;
    if (this.supportTouch) {
      // ev('touchstart', this.initDrag, false);
    } else {
      ev('mousedown', this.initDrag, false);
    }
  };

  initDrag = ev => {
    const { isSelecting } = this.state;
    if (isSelecting) return;
    if ((ev.srcElement || ev.target) !== this.eventContainer) return;

    ev.stopPropagation();

    const { resourceEvents } = this.props;
    if (resourceEvents.groupOnly) return;
    const [clientX, toReturn] = this.dragHelper(ev, 'init');

    if (toReturn) {
      return;
    }

    const { schedulerData } = this.props;
    const cellWidth = schedulerData.getContentCellWidth();
    const pos = getPos(this.eventContainer);
    const startX = clientX - pos.x;
    const leftIndex = Math.floor(startX / cellWidth);
    const left = leftIndex * cellWidth;
    const rightIndex = Math.ceil(startX / cellWidth);
    const width = (rightIndex - leftIndex) * cellWidth;

    this.setState({ startX, left, leftIndex, width, rightIndex, isSelecting: true });

    if (this.supportTouch) {
      document.documentElement.addEventListener('touchmove', this.doDrag, false);
      document.documentElement.addEventListener('touchend', this.stopDrag, false);
      document.documentElement.addEventListener('touchcancel', this.cancelDrag, false);
    } else {
      document.documentElement.addEventListener('mousemove', this.doDrag, false);
      document.documentElement.addEventListener('mouseup', this.stopDrag, false);
    }
    document.onselectstart = () => false;
    document.ondragstart = () => false;
  };

  doDrag = ev => {
    ev.stopPropagation();

    const [clientX, toReturn] = this.dragHelper(ev, 'do');

    if (toReturn) {
      return;
    }
    const { startX } = this.state;
    const { schedulerData } = this.props;
    const { headers } = schedulerData;
    const cellWidth = schedulerData.getContentCellWidth();
    const pos = getPos(this.eventContainer);
    const currentX = clientX - pos.x;
    let leftIndex = Math.floor(Math.min(startX, currentX) / cellWidth);
    leftIndex = leftIndex < 0 ? 0 : leftIndex;
    const left = leftIndex * cellWidth;
    let rightIndex = Math.ceil(Math.max(startX, currentX) / cellWidth);
    rightIndex = rightIndex > headers.length ? headers.length : rightIndex;
    const width = (rightIndex - leftIndex) * cellWidth;

    this.setState({ leftIndex, left, rightIndex, width, isSelecting: true });
  };

  dragHelper = (ev, dragType) => {
    let clientX = 0;
    if (this.supportTouch) {
      if (ev.changedTouches.length === 0) return [clientX, true];
      const touch = ev.changedTouches[0];
      clientX = touch.pageX;
    } else if (dragType === 'init') {
      if (ev.buttons !== undefined && ev.buttons !== 1) return [clientX, true];
      clientX = ev.clientX;
    } else {
      clientX = ev.clientX;
    }
    return [clientX, false];
  };

  stopDrag = ev => {
    ev.stopPropagation();

    const { schedulerData, newEvent, resourceEvents } = this.props;
    const { headers, events, config, cellUnit, localeDayjs } = schedulerData;
    const { leftIndex, rightIndex } = this.state;
    if (this.supportTouch) {
      document.documentElement.removeEventListener('touchmove', this.doDrag, false);
      document.documentElement.removeEventListener('touchend', this.stopDrag, false);
      document.documentElement.removeEventListener('touchcancel', this.cancelDrag, false);
    } else {
      document.documentElement.removeEventListener('mousemove', this.doDrag, false);
      document.documentElement.removeEventListener('mouseup', this.stopDrag, false);
    }
    document.onselectstart = null;
    document.ondragstart = null;

    const startTime = headers[leftIndex].time;
    let endTime = resourceEvents.headerItems[rightIndex - 1].end;
    if (cellUnit !== CellUnit.Hour) {
      endTime = localeDayjs(new Date(resourceEvents.headerItems[rightIndex - 1].start))
        .hour(23)
        .minute(59)
        .second(59)
        .format(DATETIME_FORMAT);
    }
    const { slotId } = resourceEvents;
    const { slotName } = resourceEvents;

    this.setState({
      startX: 0,
      leftIndex: 0,
      left: 0,
      rightIndex: 0,
      width: 0,
      isSelecting: false,
    });

    let hasConflict = false;
    if (config.checkConflict) {
      const start = localeDayjs(new Date(startTime));
      const end = localeDayjs(endTime);

      events.forEach(e => {
        if (schedulerData._getEventSlotId(e) === slotId) {
          const eStart = localeDayjs(e.start);
          const eEnd = localeDayjs(e.end);
          if ((start >= eStart && start < eEnd) || (end > eStart && end <= eEnd) || (eStart >= start && eStart < end) || (eEnd > start && eEnd <= end)) hasConflict = true;
        }
      });
    }

    if (hasConflict) {
      const { conflictOccurred } = this.props;
      if (conflictOccurred !== undefined) {
        conflictOccurred(
          schedulerData,
          'New',
          {
            id: undefined,
            start: startTime,
            end: endTime,
            slotId,
            slotName,
            title: undefined,
          },
          DnDTypes.EVENT,
          slotId,
          slotName,
          startTime,
          endTime,
        );
      } else {
        console.log('Conflict occurred, set conflictOccurred func in Scheduler to handle it');
      }
    } else if (newEvent !== undefined) newEvent(schedulerData, slotId, slotName, startTime, endTime);
  };

  cancelDrag = ev => {
    ev.stopPropagation();

    const { isSelecting } = this.state;
    if (isSelecting) {
      document.documentElement.removeEventListener('touchmove', this.doDrag, false);
      document.documentElement.removeEventListener('touchend', this.stopDrag, false);
      document.documentElement.removeEventListener('touchcancel', this.cancelDrag, false);
      document.onselectstart = null;
      document.ondragstart = null;
      this.setState({
        startX: 0,
        leftIndex: 0,
        left: 0,
        rightIndex: 0,
        width: 0,
        isSelecting: false,
      });
    }
  };

  onAddMoreClick = headerItem => {
    const { onSetAddMoreState, resourceEvents, schedulerData } = this.props;
    if (onSetAddMoreState) {
      const { config } = schedulerData;
      const cellWidth = schedulerData.getContentCellWidth();
      const index = resourceEvents.headerItems.indexOf(headerItem);
      if (index !== -1) {
        let left = index * (cellWidth - 1);
        const pos = getPos(this.eventContainer);
        left += pos.x;
        const top = pos.y;
        const height = (headerItem.count + 1) * config.eventItemLineHeight + 20;

        onSetAddMoreState({
          headerItem,
          left,
          top,
          height,
        });
      }
    }
  };

  eventContainerRef = element => {
    this.eventContainer = element;
  };

  render() {
    const { resourceEvents, schedulerData, connectDropTarget, dndSource } = this.props;
    const { cellUnit, startDate, endDate, config, localeDayjs } = schedulerData;
    const { isSelecting, left, width } = this.state;
    const cellWidth = schedulerData.getContentCellWidth();
    const cellMaxEvents = schedulerData.getCellMaxEvents();
    const rowWidth = schedulerData.getContentTableWidth();
    const DnDEventItem = dndSource.getDragSource();

    const selectedArea = isSelecting ? <SelectedArea {...this.props} left={left} width={width} /> : <div />;

    const eventList = [];
    resourceEvents.headerItems.forEach((headerItem, index) => {
      if (headerItem.count > 0 || headerItem.summary !== undefined) {
        const isTop = config.summaryPos === SummaryPos.TopRight || config.summaryPos === SummaryPos.Top || config.summaryPos === SummaryPos.TopLeft;
        const marginTop = resourceEvents.hasSummary && isTop ? 1 + config.eventItemLineHeight : 1;
        const renderEventsMaxIndex = headerItem.addMore === 0 ? cellMaxEvents : headerItem.addMoreIndex;

        headerItem.events.forEach((evt, idx) => {
          if (idx < renderEventsMaxIndex && evt !== undefined && evt.render) {
            let durationStart = localeDayjs(new Date(startDate));
            let durationEnd = localeDayjs(endDate);
            if (cellUnit === CellUnit.Hour) {
              durationStart = localeDayjs(new Date(startDate)).add(config.dayStartFrom, 'hours');
              durationEnd = localeDayjs(endDate).add(config.dayStopTo + 1, 'hours');
            }
            const eventStart = localeDayjs(evt.eventItem.start);
            const eventEnd = localeDayjs(evt.eventItem.end);
            const isStart = eventStart >= durationStart;
            const isEnd = eventEnd <= durationEnd;
            const left = index * cellWidth + (index > 0 ? 2 : 3);
            const width = evt.span * cellWidth - (index > 0 ? 5 : 6) > 0 ? evt.span * cellWidth - (index > 0 ? 5 : 6) : 0;
            const top = marginTop + idx * config.eventItemLineHeight;
            const eventItem = (
              <DnDEventItem
                {...this.props}
                key={evt.eventItem.id}
                eventItem={evt.eventItem}
                isStart={isStart}
                isEnd={isEnd}
                isInPopover={false}
                left={left}
                width={width}
                top={top}
                leftIndex={index}
                rightIndex={index + evt.span}
              />
            );
            eventList.push(eventItem);
          }
        });

        if (headerItem.addMore > 0) {
          const left = index * cellWidth + (index > 0 ? 2 : 3);
          const width = cellWidth - (index > 0 ? 5 : 6);
          const top = marginTop + headerItem.addMoreIndex * config.eventItemLineHeight;
          const addMoreItem = (
            <AddMore
              {...this.props}
              key={headerItem.time}
              headerItem={headerItem}
              number={headerItem.addMore}
              left={left}
              width={width}
              top={top}
              clickAction={this.onAddMoreClick}
            />
          );
          eventList.push(addMoreItem);
        }

        if (headerItem.summary !== undefined) {
          const top = isTop ? 1 : resourceEvents.rowHeight - config.eventItemLineHeight + 1;
          const left = index * cellWidth + (index > 0 ? 2 : 3);
          const width = cellWidth - (index > 0 ? 5 : 6);
          const key = `${resourceEvents.slotId}_${headerItem.time}`;
          const summary = <Summary key={key} schedulerData={schedulerData} summary={headerItem.summary} left={left} width={width} top={top} />;
          eventList.push(summary);
        }
      }
    });

    const eventContainer = (
      <div ref={this.eventContainerRef} className="event-container" style={{ height: resourceEvents.rowHeight }}>
        {selectedArea}
        {eventList}
      </div>
    );
    return (
      <tr>
        <td style={{ width: rowWidth }}>{config.dragAndDropEnabled ? connectDropTarget(eventContainer) : eventContainer}</td>
      </tr>
    );
  }
}

export default ResourceEvents;
