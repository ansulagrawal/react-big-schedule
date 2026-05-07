import { PropTypes } from 'prop-types';
import React, { PureComponent } from 'react';
import { useDrop } from 'react-dnd';
import { CellUnit, DATETIME_FORMAT, DnDTypes, SummaryPos } from '../config/default';
import { getPos } from '../helper/utility';
import AddMore from './AddMore';
import EventItem from './EventItem';
import SelectedArea from './SelectedArea';
import Summary from './Summary';

const DEFAULT_ROW_HEIGHT = 50;

class ResourceEvents extends PureComponent {
  static propTypes = {
    resourceEvents: PropTypes.object.isRequired,
    schedulerData: PropTypes.object.isRequired,
    schedulerDataVersion: PropTypes.number,
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
    onSelectionChange: PropTypes.func,
    isRowSelected: PropTypes.bool,
    selectionPreview: PropTypes.shape({
      isSelecting: PropTypes.bool,
      left: PropTypes.number,
      width: PropTypes.number,
    }),
  };

  constructor(props) {
    super(props);

    this.state = {
      isSelecting: false,
      left: 0,
      width: 0,

      // Add vertical selection tracking
      originalStartRowIndex: -1,
      startRowIndex: -1,
      endRowIndex: -1,
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
    const prevCreatable = prevProps.schedulerData?.config?.creatable;
    const currentCreatable = this.props.schedulerData?.config?.creatable;
    if (prevCreatable !== currentCreatable) {
      this.supportTouchHelper('remove');
      if (currentCreatable) {
        this.supportTouchHelper();
      }
    }
  }

  componentWillUnmount() {
    this.cleanupDragInteraction();
    this.supportTouchHelper('remove');
    this.emitSelectionChange(false, [], { left: 0, width: 0 });
  }

  cleanupDragInteraction = () => {
    document.documentElement.removeEventListener('touchmove', this.doDrag, false);
    document.documentElement.removeEventListener('touchend', this.stopDrag, false);
    document.documentElement.removeEventListener('touchcancel', this.cancelDrag, false);
    document.documentElement.removeEventListener('mousemove', this.doDrag, false);
    document.documentElement.removeEventListener('mouseup', this.stopDrag, false);
    document.onselectstart = null;
    document.ondragstart = null;
  };

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

    // Get the row index of this resource
    const startRowIndex = this.getResourceRowIndex(resourceEvents.slotId);

    this.setState({
      startX,
      left,
      leftIndex,
      width,
      rightIndex,
      isSelecting: true,
      originalStartRowIndex: startRowIndex,
      startRowIndex,
      endRowIndex: startRowIndex, // Initially same as start
    });
    this.emitSelectionChange(true, this.getSelectedResourceIds(startRowIndex, startRowIndex), { left, width });

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
    const { startX, originalStartRowIndex } = this.state;
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

    // Calculate current row based on per-row heights (not a uniform row height assumption).
    let clientY = ev.clientY;
    if (this.supportTouch && ev.changedTouches && ev.changedTouches.length > 0) {
      clientY = ev.changedTouches[0].clientY;
    }
    const currentY = clientY - pos.y;
    const displayRenderData = this.getDisplayRenderData();
    if (displayRenderData.length === 0) {
      this.setState({
        leftIndex,
        left,
        rightIndex,
        width,
        isSelecting: true,
        startRowIndex: -1,
        endRowIndex: -1,
      });
      this.emitSelectionChange(true, [], { left, width });
      return;
    }

    const rowHeights = displayRenderData.map(row => row?.rowHeight || DEFAULT_ROW_HEIGHT);
    const startRowTop = rowHeights.slice(0, Math.max(0, originalStartRowIndex)).reduce((sum, h) => sum + h, 0);
    const absoluteY = startRowTop + currentY;

    let cumulativeHeight = 0;
    let currentRowIndex = rowHeights.length - 1;
    for (let i = 0; i < rowHeights.length; i += 1) {
      cumulativeHeight += rowHeights[i];
      if (absoluteY < cumulativeHeight) {
        currentRowIndex = i;
        break;
      }
    }
    if (absoluteY < 0) {
      currentRowIndex = 0;
    }

    const minRowIndex = Math.min(originalStartRowIndex, currentRowIndex);
    const maxRowIndex = Math.max(originalStartRowIndex, currentRowIndex);

    // Clamp to valid row indices
    const clampedMinRow = Math.max(0, minRowIndex);
    const clampedMaxRow = Math.min(displayRenderData.length - 1, maxRowIndex);

    this.setState({
      leftIndex,
      left,
      rightIndex,
      width,
      isSelecting: true,
      startRowIndex: clampedMinRow,
      endRowIndex: clampedMaxRow,
    });
    this.emitSelectionChange(true, this.getSelectedResourceIds(clampedMinRow, clampedMaxRow), { left, width });
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
    if (ev?.stopPropagation) ev.stopPropagation();

    const { schedulerData, newEvent, resourceEvents } = this.props;
    const { headers, events, config, cellUnit, localeDayjs } = schedulerData;
    const { leftIndex, rightIndex } = this.state;
    this.cleanupDragInteraction();

    if (headers.length === 0 || !resourceEvents.headerItems || resourceEvents.headerItems.length === 0) {
      this.setState({
        startX: 0,
        leftIndex: 0,
        left: 0,
        rightIndex: 0,
        width: 0,
        isSelecting: false,
        originalStartRowIndex: -1,
        startRowIndex: -1,
        endRowIndex: -1,
      });
      this.emitSelectionChange(false, [], { left: 0, width: 0 });
      return;
    }

    const maxLeftIndex = headers.length - 1;
    const safeLeftIndex = Math.max(0, Math.min(leftIndex, maxLeftIndex));
    const maxRightIndex = Math.min(headers.length, resourceEvents.headerItems.length);
    let safeRightIndex = Math.max(1, rightIndex, safeLeftIndex + 1);
    safeRightIndex = Math.min(safeRightIndex, maxRightIndex);

    const startTime = headers[safeLeftIndex].time;
    let endTime = resourceEvents.headerItems[safeRightIndex - 1].end;
    if (cellUnit !== CellUnit.Hour) {
      endTime = localeDayjs(new Date(resourceEvents.headerItems[safeRightIndex - 1].start))
        .hour(23)
        .minute(59)
        .second(59)
        .format(DATETIME_FORMAT);
    }

    // Get selected resource IDs
    const selectedResourceIds = this.getSelectedResourceIds();
    const slotId = selectedResourceIds.length > 0 ? selectedResourceIds[0] : resourceEvents.slotId;
    const slotName =
      selectedResourceIds.length > 0 ? schedulerData.getResourceById(slotId)?.name || slotId : resourceEvents.slotName;

    this.setState({
      startX: 0,
      leftIndex: 0,
      left: 0,
      rightIndex: 0,
      width: 0,
      isSelecting: false,
      originalStartRowIndex: -1,
      startRowIndex: -1,
      endRowIndex: -1,
    });
    this.emitSelectionChange(false, [], { left: 0, width: 0 });

    let hasConflict = false;
    if (config.checkConflict) {
      const start = localeDayjs(new Date(startTime));
      const end = localeDayjs(endTime);

      events.forEach(e => {
        const eventResourceIds = e.resourceIds || [e.resourceId];
        const hasOverlap = selectedResourceIds.some(selectedId => eventResourceIds.includes(selectedId));

        if (hasOverlap) {
          const eStart = localeDayjs(e.start);
          const eEnd = localeDayjs(e.end);
          if (
            (start >= eStart && start < eEnd) ||
            (end > eStart && end <= eEnd) ||
            (eStart >= start && eStart < end) ||
            (eEnd > start && eEnd <= end)
          )
            hasConflict = true;
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
            resourceId: slotId, // Keep for backward compatibility
            resourceIds: selectedResourceIds, // Add multi-resource support
            slotId,
            slotName,
            title: undefined,
          },
          DnDTypes.EVENT,
          slotId,
          slotName,
          startTime,
          endTime
        );
      } else {
        console.log('Conflict occurred, set conflictOccurred func in Scheduler to handle it');
      }
    } else if (newEvent !== undefined) {
      // Pass resourceIds for multi-resource events
      newEvent(schedulerData, slotId, slotName, startTime, endTime, undefined, {
        resourceIds: selectedResourceIds.length > 1 ? selectedResourceIds : undefined,
      });
    }
  };

  cancelDrag = ev => {
    if (ev?.stopPropagation) ev.stopPropagation();

    const { isSelecting } = this.state;
    if (isSelecting) {
      this.cleanupDragInteraction();
      this.setState({
        startX: 0,
        leftIndex: 0,
        left: 0,
        rightIndex: 0,
        width: 0,
        isSelecting: false,
        originalStartRowIndex: -1,
        startRowIndex: -1,
        endRowIndex: -1,
      });
      this.emitSelectionChange(false, [], { left: 0, width: 0 });
    }
  };

  emitSelectionChange = (isSelecting, selectedResourceIds, preview = {}) => {
    const { onSelectionChange } = this.props;
    if (onSelectionChange) {
      onSelectionChange(isSelecting, selectedResourceIds, preview);
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
    // Also set the drop ref if it exists
    const { dropRef } = this.props;
    if (dropRef) {
      dropRef(element);
    }
  };

  getResourceRowIndex = slotId => {
    return this.getDisplayRenderData().findIndex(row => row.slotId === slotId);
  };

  getDisplayRenderData = () => {
    const { schedulerData } = this.props;
    return schedulerData.renderData.filter(row => row.render);
  };

  getSelectedResourceIds = (startOverride, endOverride) => {
    const { startRowIndex, endRowIndex } = this.state;
    const displayRenderData = this.getDisplayRenderData();
    const from = startOverride !== undefined ? startOverride : startRowIndex;
    const to = endOverride !== undefined ? endOverride : endRowIndex;

    if (from === -1 || to === -1) {
      return [];
    }

    const selectedResourceIds = [];
    for (let i = from; i <= to; i++) {
      const row = displayRenderData[i];
      if (row && !row.groupOnly) {
        selectedResourceIds.push(row.slotId);
      }
    }

    return selectedResourceIds;
  };

  render() {
    const { resourceEvents, schedulerData, dndSource } = this.props;
    const { cellUnit, startDate, endDate, config, localeDayjs } = schedulerData;
    const { isSelecting, left, width, startRowIndex, endRowIndex } = this.state;
    const cellWidth = schedulerData.getContentCellWidth();
    const cellMaxEvents = schedulerData.getCellMaxEvents();
    const rowWidth = schedulerData.getContentTableWidth();

    const selectedArea = isSelecting ? (
      <SelectedArea schedulerData={schedulerData} left={left} width={width} />
    ) : (
      <div />
    );

    const sharedSelecting = this.props.selectionPreview?.isSelecting;
    const isSharedSelectedRow = sharedSelecting && this.props.isRowSelected;
    const sharedLeft = this.props.selectionPreview?.left || 0;
    const sharedWidth = this.props.selectionPreview?.width || 0;
    const sharedSelectedArea =
      !isSelecting && isSharedSelectedRow ? (
        <SelectedArea schedulerData={schedulerData} left={sharedLeft} width={sharedWidth} />
      ) : null;

    // Add vertical selection overlay
    const verticalSelectionOverlay =
      isSelecting && startRowIndex !== endRowIndex ? <div className="vertical-selection-overlay" /> : null;

    const eventList = [];
    resourceEvents.headerItems.forEach((headerItem, index) => {
      if (headerItem.count > 0 || headerItem.summary !== undefined) {
        const isTop =
          config.summaryPos === SummaryPos.TopRight ||
          config.summaryPos === SummaryPos.Top ||
          config.summaryPos === SummaryPos.TopLeft;
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
            let isStart = eventStart >= durationStart;
            let isEnd = eventEnd <= durationEnd;
            let left = index * cellWidth + (index > 0 ? 2 : 3);
            let width = evt.span * cellWidth - (index > 0 ? 5 : 6) > 0 ? evt.span * cellWidth - (index > 0 ? 5 : 6) : 0;
            const dayStart = localeDayjs(new Date(headerItem.start)).startOf('day');
            const dayDurationMinutes = 1440;
            const baseCellWidth = cellWidth - (index > 0 ? 5 : 6);

            if (cellUnit === CellUnit.Day) {
              if (evt.span === 1) {
                const startOffsetMinutes = eventStart.diff(dayStart, 'minute');
                const eventDurationMinutes = eventEnd.diff(eventStart, 'minute');
                const startPercentage = startOffsetMinutes / dayDurationMinutes;
                const durationPercentage = eventDurationMinutes / dayDurationMinutes;
                const leftOffset = baseCellWidth * startPercentage;
                const eventWidth = baseCellWidth * durationPercentage;

                left = index * cellWidth + (index > 0 ? 2 : 3) + leftOffset;
                width = Math.max(1, eventWidth); // ensure minimum width of 1px
              } else {
                const headerStart = localeDayjs(new Date(headerItem.start));
                const headerEnd = localeDayjs(new Date(headerItem.end));
                const isFirstDay = eventStart >= headerStart && eventStart < headerEnd;

                if (isFirstDay) {
                  const eventStartDayStart = eventStart.startOf('day');
                  const eventEndDayEnd = eventEnd.endOf('day');
                  const totalSpanMinutes = eventEndDayEnd.diff(eventStartDayStart, 'minute');
                  const eventStartOffsetMinutes = eventStart.diff(eventStartDayStart, 'minute');
                  const eventDurationMinutes = eventEnd.diff(eventStart, 'minute');
                  const startPercentage = eventStartOffsetMinutes / dayDurationMinutes;
                  const durationPercentage = totalSpanMinutes > 0 ? eventDurationMinutes / totalSpanMinutes : 1;
                  const totalWidth = evt.span * cellWidth - (index > 0 ? 5 : 6);
                  const leftOffset = cellWidth * startPercentage;
                  const eventWidth = totalWidth * durationPercentage;

                  left = index * cellWidth + (index > 0 ? 2 : 3) + leftOffset;
                  width = Math.max(1, eventWidth);
                }
              }
            } else {
              width = evt.span * cellWidth - (index > 0 ? 5 : 6) > 0 ? evt.span * cellWidth - (index > 0 ? 5 : 6) : 0;
            }

            const top = marginTop + idx * config.eventItemLineHeight;
            const eventKey = `${evt.eventItem.id}_${resourceEvents.slotId}_${index}`;
            const eventItem = (
              <EventItem
                key={eventKey}
                schedulerData={schedulerData}
                eventItem={evt.eventItem}
                dndSource={dndSource}
                isStart={isStart}
                isEnd={isEnd}
                isInPopover={false}
                left={left}
                width={width}
                top={top}
                leftIndex={index}
                rightIndex={index + evt.span}
                // Passing through functional props
                eventItemClick={this.props.eventItemClick}
                viewEventClick={this.props.viewEventClick}
                viewEventText={this.props.viewEventText}
                viewEvent2Click={this.props.viewEvent2Click}
                viewEvent2Text={this.props.viewEvent2Text}
                eventItemTemplateResolver={this.props.eventItemTemplateResolver}
                subtitleGetter={this.props.subtitleGetter}
                updateEventStart={this.props.updateEventStart}
                updateEventEnd={this.props.updateEventEnd}
                moveEvent={this.props.moveEvent}
                conflictOccurred={this.props.conflictOccurred}
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
              schedulerData={schedulerData}
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
          const summary = (
            <Summary
              key={key}
              schedulerData={schedulerData}
              summary={headerItem.summary}
              left={left}
              width={width}
              top={top}
            />
          );
          eventList.push(summary);
        }
      }
    });

    const eventContainer = (
      <div ref={this.eventContainerRef} className="event-container" style={{ height: resourceEvents.rowHeight }}>
        {selectedArea}
        {sharedSelectedArea}
        {verticalSelectionOverlay}
        {eventList}
      </div>
    );
    return (
      <tr>
        <td style={{ width: rowWidth }}>{eventContainer}</td>
      </tr>
    );
  }
}

// Wrapper component to use useDrop hook
const ResourceEventsWithDnD = props => {
  const { schedulerData, dndContext } = props;
  const { config } = schedulerData;
  const componentRef = React.useRef(null);
  const propsRef = React.useRef(props);

  // Keep propsRef up to date
  React.useEffect(() => {
    propsRef.current = props;
  }, [props]);

  // Always call useDrop unconditionally (Rules of Hooks)
  // Disable functionality when drag and drop is not enabled
  const [{ isOver, canDrop }, dropRef] = useDrop(() => {
    // If drag and drop is disabled, return a no-op spec
    if (!config.dragAndDropEnabled || !dndContext) {
      return {
        accept: [],
        collect: () => ({ isOver: false, canDrop: false }),
      };
    }

    const spec = dndContext.getDropSpec();
    return {
      accept: [...dndContext.sourceMap.keys()],
      drop: (item, monitor) => spec.drop(propsRef.current, monitor, componentRef.current),
      hover: (item, monitor) => spec.hover(propsRef.current, monitor, componentRef.current),
      canDrop: (item, monitor) => spec.canDrop(propsRef.current, monitor),
      collect: monitor => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    };
  }, [dndContext, config.dragAndDropEnabled]);

  return <ResourceEvents ref={componentRef} {...props} dropRef={dropRef} isOver={isOver} canDrop={canDrop} />;
};

ResourceEventsWithDnD.displayName = 'ResourceEventsWithDnD';

export default React.memo(ResourceEventsWithDnD);
