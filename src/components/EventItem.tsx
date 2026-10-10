import { Component, type MouseEvent, type ReactNode } from 'react';
import { type ConnectDragPreview, type ConnectDragSource, useDrag } from 'react-dnd';
import { CellUnit, DATETIME_FORMAT, DnDTypes } from '../config/default';
import type { EventPopoverCallbacks, Id, NewEventDraft, SchedulerEvent } from '../types';
import type DnDSource from './DnDSource';
import EventItemPopover from './EventItemPopover';
import type SchedulerData from './SchedulerData';
import Popover from './ui/Popover';

type DragType = 'start' | 'end';

interface StopDragHelperArgs {
  count: number;
  cellUnit: CellUnit;
  config: SchedulerData['config'];
  dragType: DragType;
  eventItem: SchedulerEvent;
  localeDayjs: SchedulerData['localeDayjs'];
  value: string;
}

const stopDragHelper = ({
  count,
  cellUnit,
  config,
  dragType,
  eventItem,
  localeDayjs,
  value,
}: StopDragHelperArgs): Promise<string> => {
  const whileTrue = true;
  let tCount = 0;
  let i = 0;
  let result = value;
  return new Promise<string>(resolve => {
    if (count !== 0 && cellUnit !== CellUnit.Hour && config.displayWeekend === false) {
      while (whileTrue) {
        i = count > 0 ? i + 1 : i - 1;
        const date = localeDayjs(new Date(eventItem[dragType === 'start' ? 'start' : 'end'])).add(i, 'days');
        const dayOfWeek = date.day();

        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          tCount = count > 0 ? tCount + 1 : tCount - 1;
          if (tCount === count) {
            result = date.format(DATETIME_FORMAT);
            break;
          }
        }
      }
    }
    resolve(result);
  });
};

interface ResizableArgs {
  eventItem: SchedulerEvent;
  isInPopover: boolean;
  schedulerData: SchedulerData;
}

const startResizable = ({ eventItem, isInPopover, schedulerData }: ResizableArgs) =>
  schedulerData.config.startResizable === true &&
  isInPopover === false &&
  (eventItem.resizable === undefined || eventItem.resizable !== false) &&
  (eventItem.startResizable === undefined || eventItem.startResizable !== false);

const endResizable = ({ eventItem, isInPopover, schedulerData }: ResizableArgs) =>
  schedulerData.config.endResizable === true &&
  isInPopover === false &&
  (eventItem.resizable === undefined || eventItem.resizable !== false) &&
  (eventItem.endResizable === undefined || eventItem.endResizable !== false);

type ConflictEvent = SchedulerEvent | NewEventDraft;

export interface EventItemProps extends EventPopoverCallbacks {
  schedulerData: SchedulerData;
  eventItem: SchedulerEvent;
  isStart: boolean;
  isEnd: boolean;
  left: number;
  width: number;
  top: number;
  height?: number;
  isInPopover: boolean;
  leftIndex: number;
  rightIndex: number;
  /** Row (slot) the event is drawn in; used by the vertical resource view. */
  slotId?: Id;
  dndSource?: DnDSource;
  updateEventStart?: (schedulerData: SchedulerData, eventItem: SchedulerEvent, newStart: string) => void;
  updateEventEnd?: (schedulerData: SchedulerData, eventItem: SchedulerEvent, newEnd: string) => void;
  moveEvent?: (
    schedulerData: SchedulerData,
    eventItem: SchedulerEvent,
    slotId: Id,
    slotName: string | undefined,
    start: string,
    end: string,
  ) => void;
  conflictOccurred?: (
    schedulerData: SchedulerData,
    action: string,
    eventItem: ConflictEvent,
    type: DnDTypes,
    slotId: Id,
    slotName: string | null | undefined,
    start: string,
    end: string,
  ) => void;
}

interface EventItemInnerProps extends EventItemProps {
  isDragging?: boolean;
  dragRef?: ConnectDragSource;
  dragPreviewRef?: ConnectDragPreview;
}

export interface EventItemState {
  left: number;
  top: number;
  width: number;
  height?: number;
  contentMousePosX: number;
  eventItemLeftRect: number;
  eventItemRightRect: number;
  startX?: number;
  endX?: number;
}

type ResizeEvent = globalThis.MouseEvent | TouchEvent;

// Resize handlers take the mouse/touch union (and may be async); DOM listeners are typed for plain Event.
const asListener = (fn: (ev: ResizeEvent) => unknown) => fn as unknown as EventListener;

class EventItem extends Component<EventItemInnerProps, EventItemState> {
  startResizer: HTMLDivElement | null | undefined;
  endResizer: HTMLDivElement | null | undefined;
  supportTouch: boolean;
  eventItemElement: HTMLButtonElement | null;
  _isMounted: boolean;

  constructor(props: EventItemInnerProps) {
    super(props);

    const { left, top, width, height } = props;
    this.state = {
      left,
      top,
      width,
      height,
      contentMousePosX: 0,
      eventItemLeftRect: 0,
      eventItemRightRect: 0,
    };
    this.startResizer = undefined;
    this.endResizer = undefined;

    this.supportTouch = false; // 'ontouchstart' in window;

    this.eventItemElement = null;
    this._isMounted = false;
  }

  componentDidMount() {
    this._isMounted = true;
    this.supportTouch = 'ontouchstart' in window;
    this.subscribeResizeEvent(this.props);
  }

  componentDidUpdate(prevProps: EventItemInnerProps) {
    const { left, top, width, height } = this.props;
    if (prevProps.left !== left || prevProps.top !== top || prevProps.width !== width || prevProps.height !== height) {
      this.setState({ left, top, width, height });
    }

    // Re-subscribe when resize-related props change or when position/size changes
    // (size changes indicate a resize occurred and DOM elements may have been recreated)
    if (
      prevProps.schedulerData !== this.props.schedulerData ||
      prevProps.eventItem !== this.props.eventItem ||
      prevProps.isInPopover !== this.props.isInPopover ||
      prevProps.left !== left ||
      prevProps.top !== top ||
      prevProps.width !== width
    ) {
      this.subscribeResizeEvent(this.props);
    }
  }

  eventItemRef = (ref: HTMLButtonElement | null) => {
    this.eventItemElement = ref;
    // Attach drag refs if they exist
    const { dragRef, dragPreviewRef } = this.props;
    if (dragRef && ref) {
      dragRef(ref);
    }
    if (dragPreviewRef && ref) {
      dragPreviewRef(ref);
    }
  };

  resizerHelper = (dragType: DragType, eventType: 'addEventListener' | 'removeEventListener' = 'addEventListener') => {
    const resizer = dragType === 'start' ? this.startResizer : this.endResizer;
    const doDrag = dragType === 'start' ? this.doStartDrag : this.doEndDrag;
    const stopDrag = dragType === 'start' ? this.stopStartDrag : this.stopEndDrag;
    const cancelDrag = dragType === 'start' ? this.cancelStartDrag : this.cancelEndDrag;
    if (this.supportTouch) {
      resizer?.[eventType]('touchmove', asListener(doDrag), false);
      resizer?.[eventType]('touchend', asListener(stopDrag), false);
      resizer?.[eventType]('touchcancel', asListener(cancelDrag), false);
    } else {
      document.documentElement[eventType]('mousemove', asListener(doDrag), false);
      document.documentElement[eventType]('mouseup', asListener(stopDrag), false);
    }
  };

  initDragHelper = (ev: ResizeEvent, dragType: DragType) => {
    const { schedulerData, eventItem } = this.props;
    const slotId = schedulerData._getEventSlotId(eventItem);
    const slot = schedulerData.getSlotById(slotId);
    if (slot?.groupOnly) return;
    if (schedulerData._isResizing()) return;

    ev.stopPropagation();
    let clientX = 0;
    if (this.supportTouch) {
      const { changedTouches } = ev as TouchEvent;
      if (changedTouches.length === 0) return;
      const touch = changedTouches[0];
      clientX = touch.pageX;
    } else {
      const { buttons } = ev as globalThis.MouseEvent;
      if (buttons !== undefined && buttons !== 1) return;
      clientX = (ev as globalThis.MouseEvent).clientX;
    }
    if (dragType === 'start') this.setState({ startX: clientX });
    else this.setState({ endX: clientX });

    schedulerData._startResizing();
    this.resizerHelper(dragType, 'addEventListener');
    document.onselectstart = () => false;
    document.ondragstart = () => false;
  };

  initStartDrag = (ev: ResizeEvent) => {
    this.initDragHelper(ev, 'start');
  };

  doStartDrag = (ev: ResizeEvent) => {
    ev.stopPropagation();

    let clientX = 0;
    if (this.supportTouch) {
      const { changedTouches } = ev as TouchEvent;
      if (changedTouches.length === 0) return;
      const touch = changedTouches[0];
      clientX = touch.pageX;
    } else {
      clientX = (ev as globalThis.MouseEvent).clientX;
    }
    const { left, width, leftIndex, rightIndex, schedulerData } = this.props;
    const cellWidth = schedulerData.getContentCellWidth();
    const offset = leftIndex > 0 ? 5 : 6;
    const minWidth = cellWidth - offset;
    const maxWidth = rightIndex * cellWidth - offset;
    const startX = this.state.startX ?? 0;
    let newLeft = left + clientX - startX;
    let newWidth = width + startX - clientX;
    if (newWidth < minWidth) {
      newWidth = minWidth;
      newLeft = (rightIndex - 1) * cellWidth + (rightIndex - 1 > 0 ? 2 : 3);
    } else if (newWidth > maxWidth) {
      newWidth = maxWidth;
      newLeft = 3;
    }

    this.setState({ left: newLeft, width: newWidth });
  };

  stopStartDrag = async (ev: ResizeEvent) => {
    ev.stopPropagation();
    this.resizerHelper('start', 'removeEventListener');
    document.onselectstart = null;
    document.ondragstart = null;
    const { width, left, top, leftIndex, rightIndex, schedulerData, eventItem, updateEventStart, conflictOccurred } =
      this.props;
    schedulerData._stopResizing();
    if (schedulerData.isVerticalResourceView()) {
      await this.stopVerticalResize(ev, 'start');
      return;
    }
    const { width: stateWidth } = this.state;
    if (stateWidth === width) return;

    let clientX = 0;
    if (this.supportTouch) {
      const { changedTouches } = ev as TouchEvent;
      if (changedTouches.length === 0) {
        this.setState({ left, top, width });
        return;
      }
      const touch = changedTouches[0];
      clientX = touch.pageX;
    } else {
      clientX = (ev as globalThis.MouseEvent).clientX;
    }
    const { cellUnit, events, config, localeDayjs } = schedulerData;
    const cellWidth = schedulerData.getContentCellWidth();
    const offset = leftIndex > 0 ? 5 : 6;
    const minWidth = cellWidth - offset;
    const maxWidth = rightIndex * cellWidth - offset;
    const startX = this.state.startX ?? 0;
    const newWidth = width + startX - clientX;
    const deltaX = clientX - startX;
    let sign = 1;
    if (deltaX < 0) {
      sign = -1;
    } else if (deltaX === 0) {
      sign = 0;
    }
    let count = Math.round(Math.abs(deltaX) / cellWidth) * sign;
    if (newWidth < minWidth) count = rightIndex - leftIndex - 1;
    else if (newWidth > maxWidth) count = -leftIndex;
    let newStart = localeDayjs(new Date(eventItem.start))
      .add(
        cellUnit === CellUnit.Hour ? count * config.minuteStep : count,
        cellUnit === CellUnit.Hour ? 'minutes' : 'days',
      )
      .format(DATETIME_FORMAT);

    newStart = await stopDragHelper({
      count,
      cellUnit,
      config,
      eventItem,
      localeDayjs,
      dragType: 'start',
      value: newStart,
    });

    let hasConflict = false;
    const slotId = schedulerData._getEventSlotId(eventItem);
    let slotName: string | undefined;
    const slot = schedulerData.getSlotById(slotId);
    if (slot) slotName = slot.name;
    if (config.checkConflict) {
      const start = localeDayjs(new Date(newStart));
      const end = localeDayjs(new Date(eventItem.end));

      events.forEach(e => {
        if (schedulerData._getEventSlotId(e) === slotId && e.id !== eventItem.id) {
          const eStart = localeDayjs(new Date(e.start));
          const eEnd = localeDayjs(new Date(e.end));
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
      this.setState({ left, top, width });

      if (conflictOccurred !== undefined) {
        conflictOccurred(
          schedulerData,
          'StartResize',
          eventItem,
          DnDTypes.EVENT,
          slotId,
          slotName,
          newStart,
          eventItem.end,
        );
      } else {
        console.log('Conflict occurred, set conflictOccurred func in Scheduler to handle it');
      }
      this.subscribeResizeEvent(this.props);
    } else if (updateEventStart !== undefined) updateEventStart(schedulerData, eventItem, newStart);
  };

  // Vertical resource view: rows are time slots, so the row under the pointer gives the new start (its top
  // edge) or end (its bottom edge). The event is drawn once per row, so this works for any row height.
  stopVerticalResize = async (ev: ResizeEvent, dragType: DragType) => {
    const { schedulerData, eventItem, updateEventStart, updateEventEnd, conflictOccurred } = this.props;
    const { config, events, localeDayjs } = schedulerData;
    const { clientX, clientY } = ev as globalThis.MouseEvent;
    const row = document.elementFromPoint(clientX, clientY)?.closest<HTMLElement>('[data-slot-id]');
    if (!row) return;

    const rowStart = localeDayjs(row.dataset.slotId);
    const isStart = dragType === 'start';
    const newStart = isStart ? rowStart.format(DATETIME_FORMAT) : eventItem.start;
    const newEnd = isStart ? eventItem.end : rowStart.add(config.minuteStep, 'minutes').format(DATETIME_FORMAT);
    if (!localeDayjs(newEnd).isAfter(localeDayjs(newStart))) return;
    if (isStart ? newStart === eventItem.start : newEnd === eventItem.end) return;

    const slotId = schedulerData._getEventSlotId(eventItem);
    const hasConflict =
      config.checkConflict &&
      events.some(e => {
        if (schedulerData._getEventSlotId(e) !== slotId || e.id === eventItem.id) return false;
        return localeDayjs(newStart).isBefore(localeDayjs(e.end)) && localeDayjs(newEnd).isAfter(localeDayjs(e.start));
      });

    if (hasConflict) {
      conflictOccurred?.(
        schedulerData,
        isStart ? 'StartResize' : 'EndResize',
        eventItem,
        DnDTypes.EVENT,
        slotId,
        schedulerData.getSlotById(slotId)?.name,
        newStart,
        newEnd,
      );
    } else if (isStart) updateEventStart?.(schedulerData, eventItem, newStart);
    else updateEventEnd?.(schedulerData, eventItem, newEnd);
  };

  // Vertical resource view: the event is drawn once per time row; only the row holding the event's start
  // (or end) gets the top (or bottom) handle.
  getVerticalEdges = () => {
    const { schedulerData, eventItem, slotId } = this.props;
    if (!schedulerData.isVerticalResourceView() || !slotId) return { top: true, bottom: true };
    const { localeDayjs, config } = schedulerData;
    const rowStart = localeDayjs(slotId);
    const rowEnd = rowStart.add(config.minuteStep, 'minutes');
    const eventStart = localeDayjs(eventItem.start);
    const eventEnd = localeDayjs(eventItem.end);
    return {
      top: !eventStart.isBefore(rowStart) && eventStart.isBefore(rowEnd),
      bottom: eventEnd.isAfter(rowStart) && !eventEnd.isAfter(rowEnd),
    };
  };

  cancelStartDrag = (ev: ResizeEvent) => {
    ev.stopPropagation();

    this.startResizer?.removeEventListener('touchmove', asListener(this.doStartDrag), false);
    this.startResizer?.removeEventListener('touchend', asListener(this.stopStartDrag), false);
    this.startResizer?.removeEventListener('touchcancel', asListener(this.cancelStartDrag), false);
    document.onselectstart = null;
    document.ondragstart = null;
    const { schedulerData, left, top, width } = this.props;
    schedulerData._stopResizing();
    this.setState({ left, top, width });
  };

  initEndDrag = (ev: ResizeEvent) => {
    this.initDragHelper(ev, 'end');
  };

  doEndDrag = (ev: ResizeEvent) => {
    ev.stopPropagation();
    let clientX = 0;
    if (this.supportTouch) {
      const { changedTouches } = ev as TouchEvent;
      if (changedTouches.length === 0) return;
      const touch = changedTouches[0];
      clientX = touch.pageX;
    } else {
      clientX = (ev as globalThis.MouseEvent).clientX;
    }
    const { width, leftIndex, schedulerData } = this.props;
    const { headers } = schedulerData;
    const cellWidth = schedulerData.getContentCellWidth();
    const offset = leftIndex > 0 ? 5 : 6;
    const minWidth = cellWidth - offset;
    const maxWidth = (headers.length - leftIndex) * cellWidth - offset;
    const endX = this.state.endX ?? 0;

    let newWidth = width + clientX - endX;
    if (newWidth < minWidth) newWidth = minWidth;
    else if (newWidth > maxWidth) newWidth = maxWidth;

    this.setState({ width: newWidth });
  };

  stopEndDrag = async (ev: ResizeEvent) => {
    ev.stopPropagation();
    this.resizerHelper('end', 'removeEventListener');

    document.onselectstart = null;
    document.ondragstart = null;

    const { left, top, width, leftIndex, rightIndex, schedulerData, eventItem, updateEventEnd, conflictOccurred } =
      this.props;

    schedulerData._stopResizing();
    if (schedulerData.isVerticalResourceView()) {
      await this.stopVerticalResize(ev, 'end');
      return;
    }
    const { width: stateWidth } = this.state;

    if (stateWidth === width) return;

    let clientX = 0;
    if (this.supportTouch) {
      const { changedTouches } = ev as TouchEvent;
      if (changedTouches.length === 0) {
        this.setState({ left, top, width });
        return;
      }
      const touch = changedTouches[0];
      clientX = touch.pageX;
    } else {
      clientX = (ev as globalThis.MouseEvent).clientX;
    }
    const { headers, cellUnit, events, config, localeDayjs } = schedulerData;

    const cellWidth = schedulerData.getContentCellWidth();
    const offset = leftIndex > 0 ? 5 : 6;
    const minWidth = cellWidth - offset;
    const maxWidth = (headers.length - leftIndex) * cellWidth - offset;
    const endX = this.state.endX ?? 0;

    const newWidth = width + clientX - endX;
    const deltaX = newWidth - width;
    let sign = 1;
    if (deltaX < 0) {
      sign = -1;
    } else if (deltaX === 0) {
      sign = 0;
    }

    let count = Math.round(Math.abs(deltaX) / cellWidth) * sign;
    if (newWidth < minWidth) count = leftIndex - rightIndex + 1;
    else if (newWidth > maxWidth) count = headers.length - rightIndex;
    let newEnd = localeDayjs(new Date(eventItem.end))
      .add(
        cellUnit === CellUnit.Hour ? count * config.minuteStep : count,
        cellUnit === CellUnit.Hour ? 'minutes' : 'days',
      )
      .format(DATETIME_FORMAT);
    newEnd = await stopDragHelper({
      dragType: 'end',
      cellUnit,
      config,
      count,
      value: newEnd,
      eventItem,
      localeDayjs,
    });

    let hasConflict = false;
    const slotId = schedulerData._getEventSlotId(eventItem);
    const slot = schedulerData.getSlotById(slotId);

    if (config.checkConflict) {
      const start = localeDayjs(new Date(eventItem.start));
      const end = localeDayjs(new Date(newEnd));

      events.forEach(e => {
        if (schedulerData._getEventSlotId(e) === slotId && e.id !== eventItem.id) {
          const eStart = localeDayjs(new Date(e.start));
          const eEnd = localeDayjs(new Date(e.end));
          if (
            (start >= eStart && start < eEnd) ||
            (end > eStart && end <= eEnd) ||
            (eStart >= start && eStart < end) ||
            (eEnd > start && eEnd <= end)
          ) {
            hasConflict = true;
          }
        }
      });
    }

    if (hasConflict) {
      this.setState({ left, top, width });

      if (conflictOccurred !== undefined) {
        conflictOccurred(
          schedulerData,
          'EndResize',
          eventItem,
          DnDTypes.EVENT,
          slotId,
          slot ? slot.name : null,
          eventItem.start,
          newEnd,
        );
      } else {
        console.error('Conflict occurred, set conflictOccurred func in Scheduler to handle it');
      }
      this.subscribeResizeEvent(this.props);
    } else if (updateEventEnd !== undefined) {
      updateEventEnd(schedulerData, eventItem, newEnd);
    }
  };

  cancelEndDrag = (ev: ResizeEvent) => {
    ev.stopPropagation();

    this.endResizer?.removeEventListener('touchmove', asListener(this.doEndDrag), false);
    this.endResizer?.removeEventListener('touchend', asListener(this.stopEndDrag), false);
    this.endResizer?.removeEventListener('touchcancel', asListener(this.cancelEndDrag), false);
    document.onselectstart = null;
    document.ondragstart = null;
    const { schedulerData, left, top, width } = this.props;
    schedulerData._stopResizing();
    this.setState({ left, top, width });
  };

  handleMouseMove = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = this.eventItemElement ? this.eventItemElement.getBoundingClientRect() : { left: 0, right: 0 };
    this.setState({
      contentMousePosX: event.clientX,
      eventItemLeftRect: rect.left,
      eventItemRightRect: rect.right,
    });
  };

  subscribeResizeEvent = (props: EventItemInnerProps) => {
    if (this.startResizer !== undefined && this.startResizer !== null) {
      if (this.supportTouch) {
        // this.startResizer.removeEventListener('touchstart', this.initStartDrag, false);
        // if (startResizable(props))
        //     this.startResizer.addEventListener('touchstart', this.initStartDrag, false);
      } else {
        this.startResizer.removeEventListener('mousedown', asListener(this.initStartDrag), false);
        if (startResizable(props))
          this.startResizer.addEventListener('mousedown', asListener(this.initStartDrag), false);
      }
    }
    if (this.endResizer !== undefined && this.endResizer !== null) {
      if (this.supportTouch) {
        // this.endResizer.removeEventListener('touchstart', this.initEndDrag, false);
        // if (endResizable(props))
        //     this.endResizer.addEventListener('touchstart', this.initEndDrag, false);
      } else {
        this.endResizer.removeEventListener('mousedown', asListener(this.initEndDrag), false);
        if (endResizable(props)) this.endResizer.addEventListener('mousedown', asListener(this.initEndDrag), false);
      }
    }
  };

  render() {
    const {
      eventItem,
      isStart,
      isEnd,
      isInPopover,
      eventItemClick,
      schedulerData,
      isDragging,
      eventItemTemplateResolver,
    } = this.props;
    const { config, localeDayjs } = schedulerData;
    const { left, width, top, height } = this.state;
    let roundCls: string;
    const popoverPlacement = config.eventItemPopoverPlacement;
    const isPopoverPlacementMousePosition = /(top|bottom)(Right|Left)MousePosition/.test(popoverPlacement);

    if (isStart) {
      roundCls = isEnd ? 'round-all' : 'round-head';
    } else {
      roundCls = isEnd ? 'round-tail' : 'round-none';
    }
    let bgColor = config.defaultEventBgColor;

    if (eventItem.bgColor) bgColor = eventItem.bgColor;

    const titleText = schedulerData.behaviors.getEventTextFunc(schedulerData, eventItem);
    const content = (
      <EventItemPopover
        {...this.props}
        eventItem={eventItem}
        title={eventItem.title}
        startTime={eventItem.start}
        endTime={eventItem.end}
        statusColor={bgColor}
      />
    );

    const start = localeDayjs(new Date(eventItem.start));
    const eventTitle = isInPopover ? `${start.format('HH:mm')} ${titleText}` : titleText;
    const verticalEdges = this.getVerticalEdges();
    let startResizeDiv = <div />;
    if (startResizable(this.props) && verticalEdges.top)
      startResizeDiv = (
        <div
          className="event-resizer event-start-resizer"
          ref={ref => {
            this.startResizer = ref;
          }}
        />
      );
    let endResizeDiv = <div />;
    if (endResizable(this.props) && verticalEdges.bottom)
      endResizeDiv = (
        <div
          className="event-resizer event-end-resizer"
          ref={ref => {
            this.endResizer = ref;
          }}
        />
      );

    let eventItemTemplate: ReactNode = (
      <div
        className={`${roundCls} event-item`}
        key={eventItem.id}
        style={{ height: height || config.eventItemHeight, backgroundColor: bgColor }}
      >
        <span
          style={{
            marginLeft: '10px',
            lineHeight: `${config.eventItemHeight}px`,
          }}
        >
          {eventTitle}
        </span>
      </div>
    );
    if (eventItemTemplateResolver !== undefined) {
      eventItemTemplate = eventItemTemplateResolver(
        schedulerData,
        eventItem,
        bgColor,
        isStart,
        isEnd,
        'event-item',
        config.eventItemHeight,
        undefined,
      );
    }

    const a = (
      <button
        type="button"
        className="timeline-event"
        ref={this.eventItemRef}
        onMouseMove={isPopoverPlacementMousePosition ? this.handleMouseMove : undefined}
        style={{
          left,
          width,
          top,
          height,
          cursor: 'pointer',
          background: 'none',
          border: 'none',
          padding: 0,
          display: 'block',
          textAlign: 'left',
        }}
        onClick={() => {
          if (eventItemClick) eventItemClick(schedulerData, eventItem);
        }}
      >
        {eventItemTemplate}
        {startResizeDiv}
        {endResizeDiv}
      </button>
    );

    const getMousePositionOptionsData = () => {
      let popoverOffsetX = 0;
      let mousePositionPlacement = '';

      if (isPopoverPlacementMousePosition) {
        const isMousePositionPlacementLeft = popoverPlacement.includes('Left');
        const { contentMousePosX } = this.state;
        const popoverWidth = config.eventItemPopoverWidth;
        const { eventItemLeftRect } = this.state;
        const { eventItemRightRect } = this.state;
        let eventItemMousePosX = isMousePositionPlacementLeft ? eventItemLeftRect : eventItemRightRect;
        let posAdjustControl = isMousePositionPlacementLeft ? 1 : -1;

        mousePositionPlacement = popoverPlacement.replace('MousePosition', '');

        const distance = 10;

        if (isMousePositionPlacementLeft && this._isMounted) {
          if (contentMousePosX + popoverWidth + distance > window.innerWidth) {
            mousePositionPlacement = `${popoverPlacement.replace(/(Right|Left).*/, '')}Right`;
            eventItemMousePosX = eventItemRightRect;
            posAdjustControl = -1;
          }
        } else if (contentMousePosX - popoverWidth - distance < 0) {
          mousePositionPlacement = `${popoverPlacement.replace(/(Right|Left).*/, '')}Left`;
          eventItemMousePosX = eventItemLeftRect;
          posAdjustControl = 1;
        }

        popoverOffsetX = contentMousePosX - eventItemMousePosX - 20 * posAdjustControl;
      }

      return { popoverOffsetX, mousePositionPlacement };
    };

    const { popoverOffsetX, mousePositionPlacement } = getMousePositionOptionsData();

    const aItem = a;

    if (
      isDragging
        ? null
        : schedulerData._isResizing() || config.eventItemPopoverEnabled === false || eventItem.showPopover === false
    ) {
      return <div>{aItem}</div>;
    }

    return (
      <Popover
        offset={isPopoverPlacementMousePosition ? [popoverOffsetX, 0] : undefined}
        placement={isPopoverPlacementMousePosition ? mousePositionPlacement : popoverPlacement}
        content={content}
        trigger={config.eventItemPopoverTrigger}
      >
        {aItem}
      </Popover>
    );
  }
}

// Wrapper component to use useDrag hook
function EventItemWithDnD(props: EventItemProps) {
  const { dndSource } = props;

  // Always call useDrag unconditionally (Rules of Hooks)
  // Disable functionality when dndSource is not provided
  const [{ isDragging }, dragRef, dragPreviewRef] = useDrag(() => {
    // If dndSource is not provided, return a no-op spec
    if (!dndSource) {
      return {
        type: '__NONE__',
        canDrag: () => false,
        collect: () => ({ isDragging: false }),
      };
    }

    // Get drag options from dndSource
    return dndSource.getDragOptions(props);
  }, [props, dndSource]);

  return <EventItem {...props} isDragging={isDragging} dragRef={dragRef} dragPreviewRef={dragPreviewRef} />;
}

EventItemWithDnD.displayName = 'EventItemWithDnD';

export default EventItemWithDnD;
