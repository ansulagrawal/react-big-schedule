import React, { PureComponent, type ReactNode } from 'react';
import { type ConnectDropTarget, useDrop } from 'react-dnd';
import { CellUnit, DATETIME_FORMAT, DnDTypes, SummaryPos } from '../config/default';
import { toDate } from '../helper/behaviors';
import { getPos, normalizeEventEnd, normalizeEventStart } from '../helper/utility';
import type { HeaderItem, Id, RenderItem } from '../types';
import AddMore from './AddMore';
import type DnDContext from './DnDContext';
import type DnDSource from './DnDSource';
import EventItem, { type EventItemProps } from './EventItem';
import type SchedulerData from './SchedulerData';
import SelectedArea from './SelectedArea';
import Summary from './Summary';

const DEFAULT_ROW_HEIGHT = 50;

export interface SelectionPreview {
  isSelecting?: boolean;
  left?: number;
  width?: number;
}

export interface AddMoreState {
  headerItem: HeaderItem;
  left: number;
  top: number;
  height: number;
}

export interface DropPreview {
  left: number;
  width: number;
}

export interface ResourceEventsProps
  extends Pick<
    EventItemProps,
    | 'updateEventStart'
    | 'updateEventEnd'
    | 'moveEvent'
    | 'conflictOccurred'
    | 'subtitleGetter'
    | 'eventItemClick'
    | 'viewEventClick'
    | 'viewEventText'
    | 'viewEvent2Click'
    | 'viewEvent2Text'
    | 'eventItemTemplateResolver'
    | 'eventItemPopoverTemplateResolver'
  > {
  resourceEvents: RenderItem;
  schedulerData: SchedulerData;
  schedulerDataVersion?: number;
  dndSource: DnDSource;
  dndContext?: DnDContext;
  onSetAddMoreState?: (state: AddMoreState) => void;
  movingEvent?: (
    schedulerData: SchedulerData,
    slotId: Id,
    slotName: string,
    newStart: string,
    newEnd: string,
    action: string,
    type: string,
    item: unknown,
  ) => void;
  newEvent?: (
    schedulerData: SchedulerData,
    slotId: Id,
    slotName: string,
    start: string,
    end: string,
    type?: string,
    item?: { resourceIds?: Id[] },
  ) => void;
  onSelectionChange?: (isSelecting: boolean, selectedResourceIds: Id[], preview: SelectionPreview) => void;
  isRowSelected?: boolean;
  selectionPreview?: SelectionPreview;
}

interface ResourceEventsInnerProps extends ResourceEventsProps {
  dropRef?: ConnectDropTarget;
  isOver?: boolean;
  canDrop?: boolean;
}

export interface ResourceEventsState {
  isSelecting: boolean;
  left: number;
  width: number;
  originalStartRowIndex: number;
  startRowIndex: number;
  endRowIndex: number;
  dropPreview: DropPreview | null;
  startX?: number;
  leftIndex?: number;
  rightIndex?: number;
}

type DragEvent = MouseEvent | TouchEvent;

// Drag handlers take the mouse/touch union; DOM listeners are typed for plain Event.
const asListener = (fn: (ev: DragEvent) => unknown) => fn as unknown as EventListener;

class ResourceEvents extends PureComponent<ResourceEventsInnerProps, ResourceEventsState> {
  eventContainer: HTMLDivElement | null = null;
  supportTouch: boolean;

  constructor(props: ResourceEventsInnerProps) {
    super(props);

    this.state = {
      isSelecting: false,
      left: 0,
      width: 0,

      // Add vertical selection tracking
      originalStartRowIndex: -1,
      startRowIndex: -1,
      endRowIndex: -1,

      // where the dragged item would land (set from the drop target's hover)
      dropPreview: null,
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

  componentDidUpdate(prevProps: ResourceEventsInnerProps) {
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

  setDropPreview = (dropPreview: DropPreview) => {
    if (!Number.isFinite(dropPreview.left) || !Number.isFinite(dropPreview.width)) return;
    const current = this.state.dropPreview;
    if (current?.left === dropPreview.left && current?.width === dropPreview.width) return;
    this.setState({ dropPreview });
  };

  cleanupDragInteraction = () => {
    document.documentElement.removeEventListener('touchmove', asListener(this.doDrag), false);
    document.documentElement.removeEventListener('touchend', asListener(this.stopDrag), false);
    document.documentElement.removeEventListener('touchcancel', asListener(this.cancelDrag), false);
    document.documentElement.removeEventListener('mousemove', asListener(this.doDrag), false);
    document.documentElement.removeEventListener('mouseup', asListener(this.stopDrag), false);
    document.onselectstart = null;
    document.ondragstart = null;
  };

  supportTouchHelper = (evType: 'add' | 'remove' = 'add') => {
    const container = this.eventContainer;
    if (!container) return;
    const ev = evType === 'add' ? container.addEventListener : container.removeEventListener;
    if (this.supportTouch) {
      // ev('touchstart', this.initDrag, false);
    } else {
      // keeps the original unbound call, as ev is not invoked on the container
      ev.call(container, 'mousedown', asListener(this.initDrag), false);
    }
  };

  initDrag = (ev: DragEvent) => {
    const { isSelecting } = this.state;
    if (isSelecting) return;
    if (ev.target !== this.eventContainer) return;

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
      document.documentElement.addEventListener('touchmove', asListener(this.doDrag), false);
      document.documentElement.addEventListener('touchend', asListener(this.stopDrag), false);
      document.documentElement.addEventListener('touchcancel', asListener(this.cancelDrag), false);
    } else {
      document.documentElement.addEventListener('mousemove', asListener(this.doDrag), false);
      document.documentElement.addEventListener('mouseup', asListener(this.stopDrag), false);
    }
    document.onselectstart = () => false;
    document.ondragstart = () => false;
  };

  doDrag = (ev: DragEvent) => {
    ev.stopPropagation();

    const [clientX, toReturn] = this.dragHelper(ev, 'do');

    if (toReturn) {
      return;
    }
    const { originalStartRowIndex } = this.state;
    const startX = this.state.startX ?? 0;
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
    let clientY = (ev as MouseEvent).clientY;
    const { changedTouches } = ev as TouchEvent;
    if (this.supportTouch && changedTouches && changedTouches.length > 0) {
      clientY = changedTouches[0].clientY;
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

  dragHelper = (ev: DragEvent, dragType: 'init' | 'do'): [number, boolean] => {
    let clientX = 0;
    if (this.supportTouch) {
      const { changedTouches } = ev as TouchEvent;
      if (changedTouches.length === 0) return [clientX, true];
      const touch = changedTouches[0];
      clientX = touch.pageX;
    } else if (dragType === 'init') {
      const { buttons } = ev as MouseEvent;
      if (buttons !== undefined && buttons !== 1) return [clientX, true];
      clientX = (ev as MouseEvent).clientX;
    } else {
      clientX = (ev as MouseEvent).clientX;
    }
    return [clientX, false];
  };

  stopDrag = (ev?: DragEvent) => {
    if (ev?.stopPropagation) ev.stopPropagation();

    const { schedulerData, newEvent, resourceEvents } = this.props;
    const { headers, events, config, cellUnit, localeDayjs } = schedulerData;
    const { leftIndex, rightIndex } = this.state;
    this.cleanupDragInteraction();

    const resetSelection = () => {
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
    };

    if (headers.length === 0 || !resourceEvents.headerItems || resourceEvents.headerItems.length === 0) {
      resetSelection();
      return;
    }

    // a cell width of 0 (container not measured yet) makes the drag indexes NaN or Infinity
    const toIndex = (value: number | undefined, fallback: number) =>
      value !== undefined && Number.isFinite(value) ? value : fallback;
    const maxLeftIndex = headers.length - 1;
    const safeLeftIndex = Math.max(0, Math.min(toIndex(leftIndex, 0), maxLeftIndex));
    const maxRightIndex = Math.min(headers.length, resourceEvents.headerItems.length);
    let safeRightIndex = Math.max(1, toIndex(rightIndex, 1), safeLeftIndex + 1);
    safeRightIndex = Math.min(safeRightIndex, maxRightIndex);

    // headers and headerItems can be out of step while the view rebuilds; drop the selection instead of throwing
    if (!headers[safeLeftIndex] || !resourceEvents.headerItems[safeRightIndex - 1]) {
      resetSelection();
      return;
    }

    const isVertical = schedulerData.isVerticalResourceView();
    // vertical view: rows are time slots and columns are resources, so the roles swap
    const selectedRowIds = this.getSelectedResourceIds();
    let startTime: string;
    let endTime: string;
    if (isVertical) {
      // in the vertical view slot ids are the row's time string
      startTime = (selectedRowIds[0] ?? resourceEvents.slotId) as string;
      const lastRowId = selectedRowIds[selectedRowIds.length - 1] ?? startTime;
      endTime = localeDayjs(new Date(lastRowId)).add(config.minuteStep, 'minutes').format(DATETIME_FORMAT);
    } else {
      startTime = headers[safeLeftIndex].time;
      endTime = resourceEvents.headerItems[safeRightIndex - 1].end;
      if (cellUnit !== CellUnit.Hour) {
        endTime = localeDayjs(new Date(resourceEvents.headerItems[safeRightIndex - 1].start))
          .hour(23)
          .minute(59)
          .second(59)
          .format(DATETIME_FORMAT);
      }
    }

    // Get selected resource IDs
    const selectedResourceIds = isVertical
      ? headers
          .slice(safeLeftIndex, safeRightIndex)
          .map(header => header.id)
          .filter((id): id is Id => id !== undefined)
      : selectedRowIds;
    const slotId = selectedResourceIds.length > 0 ? selectedResourceIds[0] : resourceEvents.slotId;
    const slotName =
      selectedResourceIds.length > 0
        ? String(schedulerData.getResourceById(slotId)?.name || slotId)
        : resourceEvents.slotName;

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
          endTime,
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

  cancelDrag = (ev?: DragEvent) => {
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

  emitSelectionChange = (isSelecting: boolean, selectedResourceIds: Id[], preview: SelectionPreview = {}) => {
    const { onSelectionChange } = this.props;
    if (onSelectionChange) {
      onSelectionChange(isSelecting, selectedResourceIds, preview);
    }
  };

  onAddMoreClick = (headerItem: HeaderItem) => {
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
        const height = ((headerItem.count ?? 0) + 1) * config.eventItemLineHeight + 20;

        onSetAddMoreState({
          headerItem,
          left,
          top,
          height,
        });
      }
    }
  };

  eventContainerRef = (element: HTMLDivElement | null) => {
    this.eventContainer = element;
    // Also set the drop ref if it exists
    const { dropRef } = this.props;
    if (dropRef) {
      dropRef(element);
    }
  };

  getResourceRowIndex = (slotId: Id) => {
    return this.getDisplayRenderData().findIndex(row => row.slotId === slotId);
  };

  getDisplayRenderData = () => {
    const { schedulerData } = this.props;
    return schedulerData.renderData.filter(row => row.render);
  };

  getSelectedResourceIds = (startOverride?: number, endOverride?: number): Id[] => {
    const { startRowIndex, endRowIndex } = this.state;
    const displayRenderData = this.getDisplayRenderData();
    const from = startOverride !== undefined ? startOverride : startRowIndex;
    const to = endOverride !== undefined ? endOverride : endRowIndex;

    if (from === -1 || to === -1) {
      return [];
    }

    const selectedResourceIds: Id[] = [];
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

    const eventList: ReactNode[] = [];
    resourceEvents.headerItems.forEach((headerItem, index) => {
      if ((headerItem.count ?? 0) > 0 || headerItem.summary !== undefined) {
        const isTop =
          config.summaryPos === SummaryPos.TopRight ||
          config.summaryPos === SummaryPos.Top ||
          config.summaryPos === SummaryPos.TopLeft;
        const marginTop = resourceEvents.hasSummary && isTop ? 1 + config.eventItemLineHeight : 1;
        const renderEventsMaxIndex = headerItem.addMore === 0 ? cellMaxEvents : (headerItem.addMoreIndex ?? 0);

        headerItem.events.forEach((evt, idx) => {
          if (idx < renderEventsMaxIndex && evt !== undefined && evt.render) {
            let durationStart = localeDayjs(toDate(startDate));
            let durationEnd = localeDayjs(endDate);
            if (cellUnit === CellUnit.Hour) {
              durationStart = localeDayjs(toDate(startDate)).add(config.dayStartFrom, 'hours');
              durationEnd = localeDayjs(endDate).add(config.dayStopTo + 1, 'hours');
            }
            const eventStart = normalizeEventStart(evt.eventItem.start);
            const eventEnd = normalizeEventEnd(evt.eventItem.end);
            const isStart = eventStart >= durationStart;
            const isEnd = eventEnd <= durationEnd;
            let left = index * cellWidth + (index > 0 ? 2 : 3);
            let width = evt.span * cellWidth - (index > 0 ? 5 : 6) > 0 ? evt.span * cellWidth - (index > 0 ? 5 : 6) : 0;

            if (cellUnit === CellUnit.Day || cellUnit === CellUnit.Hour) {
              // Clamp the event to the cells it covers, then position it proportionally inside the
              // first and last cell (each cell's own duration, so DST days and sub-slot times are handled).
              const lastHeaderItem = resourceEvents.headerItems[index + evt.span - 1] ?? headerItem;
              const firstCellStart = localeDayjs(new Date(headerItem.start));
              const firstCellEnd = localeDayjs(new Date(headerItem.end));
              const lastCellStart = localeDayjs(new Date(lastHeaderItem.start));
              const lastCellEnd = localeDayjs(new Date(lastHeaderItem.end));
              const clampedStart = eventStart.isAfter(firstCellStart) ? eventStart : firstCellStart;
              const clampedEnd = eventEnd.isBefore(lastCellEnd) ? eventEnd : lastCellEnd;
              const startFraction = clampedStart.diff(firstCellStart) / firstCellEnd.diff(firstCellStart);
              const endFraction = clampedEnd.diff(lastCellStart) / lastCellEnd.diff(lastCellStart);
              const usableWidth = evt.span * cellWidth - (index > 0 ? 5 : 6);

              left = index * cellWidth + (index > 0 ? 2 : 3) + (usableWidth * startFraction) / evt.span;
              width = Math.max(1, (usableWidth * (evt.span - 1 + endFraction - startFraction)) / evt.span);
            } else {
              width = evt.span * cellWidth - (index > 0 ? 5 : 6) > 0 ? evt.span * cellWidth - (index > 0 ? 5 : 6) : 0;
            }

            const top = schedulerData.isVerticalResourceView() ? 0 : marginTop + idx * config.eventItemLineHeight;
            const height = schedulerData.isVerticalResourceView() ? resourceEvents.rowHeight : undefined;
            if (schedulerData.isVerticalResourceView()) {
              const eventCount = headerItem.count ?? 0;
              const itemWidth = (cellWidth - (index > 0 ? 5 : 6)) / eventCount;
              left = index * cellWidth + (index > 0 ? 2 : 3) + idx * itemWidth;
              width = itemWidth;
            }
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
                slotId={resourceEvents.slotId}
                left={left}
                width={width}
                top={top}
                height={height}
                leftIndex={index}
                rightIndex={index + evt.span}
                // Passing through functional props
                eventItemClick={this.props.eventItemClick}
                viewEventClick={this.props.viewEventClick}
                viewEventText={this.props.viewEventText}
                viewEvent2Click={this.props.viewEvent2Click}
                viewEvent2Text={this.props.viewEvent2Text}
                eventItemTemplateResolver={this.props.eventItemTemplateResolver}
                eventItemPopoverTemplateResolver={this.props.eventItemPopoverTemplateResolver}
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

        if (headerItem.addMore !== undefined && headerItem.addMore > 0) {
          const left = index * cellWidth + (index > 0 ? 2 : 3);
          const width = cellWidth - (index > 0 ? 5 : 6);
          const top = marginTop + (headerItem.addMoreIndex ?? 0) * config.eventItemLineHeight;
          const addMoreItem = (
            <AddMore
              key={`add-more-${headerItem.time}`}
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

    // drop preview: styled box where the item being dragged over this row would be placed
    const { dropPreview } = this.state;
    const dropPreviewBox =
      this.props.isOver && this.props.canDrop && config.dropPreviewEnabled !== false && dropPreview ? (
        <div
          className={`drop-preview${config.dropPreviewClassName ? ` ${config.dropPreviewClassName}` : ''}`}
          style={{ left: dropPreview.left, width: dropPreview.width, ...config.dropPreviewStyle }}
        />
      ) : null;

    const eventContainer = (
      <div
        ref={this.eventContainerRef}
        className="event-container"
        data-slot-id={resourceEvents.slotId}
        style={{ height: resourceEvents.rowHeight }}
      >
        {selectedArea}
        {sharedSelectedArea}
        {verticalSelectionOverlay}
        {dropPreviewBox}
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
const ResourceEventsWithDnD = (props: ResourceEventsProps) => {
  const { schedulerData, dndContext } = props;
  const { config } = schedulerData;
  const componentRef = React.useRef<ResourceEvents>(null);
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
      drop: (_item, monitor) =>
        componentRef.current ? spec.drop(propsRef.current, monitor, componentRef.current) : undefined,
      hover: (_item, monitor) => {
        if (componentRef.current) spec.hover(propsRef.current, monitor, componentRef.current);
      },
      canDrop: (_item, monitor) => spec.canDrop(propsRef.current, monitor),
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
