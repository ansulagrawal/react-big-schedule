/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-return-assign */
import { Popover } from 'antd';
import { PropTypes } from 'prop-types';
import React, { Component } from 'react';
import { CellUnit, DATETIME_FORMAT, DnDTypes } from '../config/default';
import EventItemPopover from './EventItemPopover';

const stopDragHelper = ({ count, cellUnit, config, dragType, eventItem, localeDayjs, value }) => {
  const whileTrue = true;
  let tCount = 0;
  let i = 0;
  let result = value;
  return new Promise(resolve => {
    if (count !== 0 && cellUnit !== CellUnit.Hour && config.displayWeekend === false) {
      while (whileTrue) {
        i = count > 0 ? i + 1 : i - 1;
        const date = localeDayjs(new Date(eventItem[dragType])).add(i, 'days');
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

const startResizable = ({ eventItem, isInPopover, schedulerData }) => schedulerData.config.startResizable === true
  && isInPopover === false
  && (eventItem.resizable === undefined || eventItem.resizable !== false)
  && (eventItem.startResizable === undefined || eventItem.startResizable !== false);

const endResizable = ({ eventItem, isInPopover, schedulerData }) => schedulerData.config.endResizable === true
  && isInPopover === false
  && (eventItem.resizable === undefined || eventItem.resizable !== false)
  && (eventItem.endResizable === undefined || eventItem.endResizable !== false);

class EventItem extends Component {
  constructor(props) {
    super(props);

    const { left, top, width } = props;
    this.state = { left, top, width, contentMousePosX: 0, eventItemLeftRect: 0, eventItemRightRect: 0 };
    this.startResizer = undefined;
    this.endResizer = undefined;

    this.supportTouch = false; // 'ontouchstart' in window;

    this.eventItemRef = React.createRef();
    this._isMounted = false;
  }

  componentDidMount() {
    this._isMounted = true;
    this.supportTouch = 'ontouchstart' in window;
    this.subscribeResizeEvent(this.props);
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      const { left, top, width } = this.props;
      this.setState({ left, top, width });

      this.subscribeResizeEvent(this.props);
    }
  }

  resizerHelper = (dragType, eventType = 'addEventListener') => {
    const resizer = dragType === 'start' ? this.startResizer : this.endResizer;
    const doDrag = dragType === 'start' ? this.doStartDrag : this.doEndDrag;
    const stopDrag = dragType === 'start' ? this.stopStartDrag : this.stopEndDrag;
    const cancelDrag = dragType === 'start' ? this.cancelStartDrag : this.cancelEndDrag;
    if (this.supportTouch) {
      resizer[eventType]('touchmove', doDrag, false);
      resizer[eventType]('touchend', stopDrag, false);
      resizer[eventType]('touchcancel', cancelDrag, false);
    } else {
      document.documentElement[eventType]('mousemove', doDrag, false);
      document.documentElement[eventType]('mouseup', stopDrag, false);
    }
  };

  initDragHelper = (ev, dragType) => {
    const { schedulerData, eventItem } = this.props;
    const slotId = schedulerData._getEventSlotId(eventItem);
    const slot = schedulerData.getSlotById(slotId);
    if (!!slot && !!slot.groupOnly) return;
    if (schedulerData._isResizing()) return;

    ev.stopPropagation();
    let clientX = 0;
    if (this.supportTouch) {
      if (ev.changedTouches.length === 0) return;
      const touch = ev.changedTouches[0];
      clientX = touch.pageX;
    } else {
      if (ev.buttons !== undefined && ev.buttons !== 1) return;
      clientX = ev.clientX;
    }
    this.setState({ [dragType === 'start' ? 'startX' : 'endX']: clientX });

    schedulerData._startResizing();
    this.resizerHelper(dragType, 'addEventListener');
    document.onselectstart = () => false;
    document.ondragstart = () => false;
  };

  initStartDrag = ev => {
    this.initDragHelper(ev, 'start');
  };

  doStartDrag = ev => {
    ev.stopPropagation();

    let clientX = 0;
    if (this.supportTouch) {
      if (ev.changedTouches.length === 0) return;
      const touch = ev.changedTouches[0];
      clientX = touch.pageX;
    } else {
      clientX = ev.clientX;
    }
    const { left, width, leftIndex, rightIndex, schedulerData } = this.props;
    const cellWidth = schedulerData.getContentCellWidth();
    const offset = leftIndex > 0 ? 5 : 6;
    const minWidth = cellWidth - offset;
    const maxWidth = rightIndex * cellWidth - offset;
    const { startX } = this.state;
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

  stopStartDrag = async ev => {
    ev.stopPropagation();
    this.resizerHelper('start', 'removeEventListener');
    document.onselectstart = null;
    document.ondragstart = null;
    const { width, left, top, leftIndex, rightIndex, schedulerData, eventItem, updateEventStart, conflictOccurred } = this.props;
    schedulerData._stopResizing();
    const { width: stateWidth } = this.state;
    if (stateWidth === width) return;

    let clientX = 0;
    if (this.supportTouch) {
      if (ev.changedTouches.length === 0) {
        this.setState({ left, top, width });
        return;
      }
      const touch = ev.changedTouches[0];
      clientX = touch.pageX;
    } else {
      clientX = ev.clientX;
    }
    const { cellUnit, events, config, localeDayjs } = schedulerData;
    const cellWidth = schedulerData.getContentCellWidth();
    const offset = leftIndex > 0 ? 5 : 6;
    const minWidth = cellWidth - offset;
    const maxWidth = rightIndex * cellWidth - offset;
    const { startX } = this.state;
    const newWidth = width + startX - clientX;
    const deltaX = clientX - startX;
    let sign = 1;
    if (deltaX < 0) {
      sign = -1;
    } else if (deltaX === 0) {
      sign = 0;
    }
    let count = (sign > 0 ? Math.floor(Math.abs(deltaX) / cellWidth) : Math.ceil(Math.abs(deltaX) / cellWidth)) * sign;
    if (newWidth < minWidth) count = rightIndex - leftIndex - 1;
    else if (newWidth > maxWidth) count = -leftIndex;
    let newStart = localeDayjs(new Date(eventItem.start))
      .add(cellUnit === CellUnit.Hour ? count * config.minuteStep : count, cellUnit === CellUnit.Hour ? 'minutes' : 'days')
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
    let slotName;
    const slot = schedulerData.getSlotById(slotId);
    if (slot) slotName = slot.name;
    if (config.checkConflict) {
      const start = localeDayjs(new Date(newStart));
      const end = localeDayjs(new Date(eventItem.end));

      events.forEach(e => {
        if (schedulerData._getEventSlotId(e) === slotId && e.id !== eventItem.id) {
          const eStart = localeDayjs(new Date(e.start));
          const eEnd = localeDayjs(new Date(e.end));
          if ((start >= eStart && start < eEnd) || (end > eStart && end <= eEnd) || (eStart >= start && eStart < end) || (eEnd > start && eEnd <= end)) hasConflict = true;
        }
      });
    }

    if (hasConflict) {
      this.setState({ left, top, width });

      if (conflictOccurred !== undefined) {
        conflictOccurred(schedulerData, 'StartResize', eventItem, DnDTypes.EVENT, slotId, slotName, newStart, eventItem.end);
      } else {
        console.log('Conflict occurred, set conflictOccurred func in Scheduler to handle it');
      }
      this.subscribeResizeEvent(this.props);
    } else if (updateEventStart !== undefined) updateEventStart(schedulerData, eventItem, newStart);
  };

  cancelStartDrag = ev => {
    ev.stopPropagation();

    this.startResizer.removeEventListener('touchmove', this.doStartDrag, false);
    this.startResizer.removeEventListener('touchend', this.stopStartDrag, false);
    this.startResizer.removeEventListener('touchcancel', this.cancelStartDrag, false);
    document.onselectstart = null;
    document.ondragstart = null;
    const { schedulerData, left, top, width } = this.props;
    schedulerData._stopResizing();
    this.setState({ left, top, width });
  };

  initEndDrag = ev => {
    this.initDragHelper(ev, 'end');
  };

  doEndDrag = ev => {
    ev.stopPropagation();
    let clientX = 0;
    if (this.supportTouch) {
      if (ev.changedTouches.length === 0) return;
      const touch = ev.changedTouches[0];
      clientX = touch.pageX;
    } else {
      clientX = ev.clientX;
    }
    const { width, leftIndex, schedulerData } = this.props;
    const { headers } = schedulerData;
    const cellWidth = schedulerData.getContentCellWidth();
    const offset = leftIndex > 0 ? 5 : 6;
    const minWidth = cellWidth - offset;
    const maxWidth = (headers.length - leftIndex) * cellWidth - offset;
    const { endX } = this.state;

    let newWidth = width + clientX - endX;
    if (newWidth < minWidth) newWidth = minWidth;
    else if (newWidth > maxWidth) newWidth = maxWidth;

    this.setState({ width: newWidth });
  };

  stopEndDrag = async ev => {
    ev.stopPropagation();
    this.resizerHelper('end', 'removeEventListener');

    document.onselectstart = null;
    document.ondragstart = null;

    const { left, top, width, leftIndex, rightIndex, schedulerData, eventItem, updateEventEnd, conflictOccurred } = this.props;

    schedulerData._stopResizing();
    const { width: stateWidth } = this.state;

    if (stateWidth === width) return;

    let clientX = 0;
    if (this.supportTouch) {
      if (ev.changedTouches.length === 0) {
        this.setState({ left, top, width });
        return;
      }
      const touch = ev.changedTouches[0];
      clientX = touch.pageX;
    } else {
      clientX = ev.clientX;
    }
    const { headers, cellUnit, events, config, localeDayjs } = schedulerData;

    const cellWidth = schedulerData.getContentCellWidth();
    const offset = leftIndex > 0 ? 5 : 6;
    const minWidth = cellWidth - offset;
    const maxWidth = (headers.length - leftIndex) * cellWidth - offset;
    const { endX } = this.state;

    const newWidth = width + clientX - endX;
    const deltaX = newWidth - width;
    let sign = 1;
    if (deltaX < 0) {
      sign = -1;
    } else if (deltaX === 0) {
      sign = 0;
    }

    let count = (sign < 0 ? Math.floor(Math.abs(deltaX) / cellWidth) : Math.ceil(Math.abs(deltaX) / cellWidth)) * sign;
    if (newWidth < minWidth) count = leftIndex - rightIndex + 1;
    else if (newWidth > maxWidth) count = headers.length - rightIndex;
    let newEnd = localeDayjs(new Date(eventItem.end))
      .add(cellUnit === CellUnit.Hour ? count * config.minuteStep : count, cellUnit === CellUnit.Hour ? 'minutes' : 'days')
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
          if ((start >= eStart && start < eEnd) || (end > eStart && end <= eEnd) || (eStart >= start && eStart < end) || (eEnd > start && eEnd <= end)) {
            hasConflict = true;
          }
        }
      });
    }

    if (hasConflict) {
      this.setState({ left, top, width });

      if (conflictOccurred !== undefined) {
        conflictOccurred(schedulerData, 'EndResize', eventItem, DnDTypes.EVENT, slotId, slot ? slot.name : null, eventItem.start, newEnd);
      } else {
        console.error('Conflict occurred, set conflictOccurred func in Scheduler to handle it');
      }
      this.subscribeResizeEvent(this.props);
    } else if (updateEventEnd !== undefined) {
      updateEventEnd(schedulerData, eventItem, newEnd);
    }
  };

  cancelEndDrag = ev => {
    ev.stopPropagation();

    this.endResizer.removeEventListener('touchmove', this.doEndDrag, false);
    this.endResizer.removeEventListener('touchend', this.stopEndDrag, false);
    this.endResizer.removeEventListener('touchcancel', this.cancelEndDrag, false);
    document.onselectstart = null;
    document.ondragstart = null;
    const { schedulerData, left, top, width } = this.props;
    schedulerData._stopResizing();
    this.setState({ left, top, width });
  };

  handleMouseMove = event => {
    const rect = this.eventItemRef.current.getBoundingClientRect();
    this.setState({
      contentMousePosX: event.clientX,
      eventItemLeftRect: rect.left,
      eventItemRightRect: rect.right,
    });
  };

  subscribeResizeEvent = props => {
    if (this.startResizer !== undefined && this.startResizer !== null) {
      if (this.supportTouch) {
        // this.startResizer.removeEventListener('touchstart', this.initStartDrag, false);
        // if (startResizable(props))
        //     this.startResizer.addEventListener('touchstart', this.initStartDrag, false);
      } else {
        this.startResizer.removeEventListener('mousedown', this.initStartDrag, false);
        if (startResizable(props)) this.startResizer.addEventListener('mousedown', this.initStartDrag, false);
      }
    }
    if (this.endResizer !== undefined && this.endResizer !== null) {
      if (this.supportTouch) {
        // this.endResizer.removeEventListener('touchstart', this.initEndDrag, false);
        // if (endResizable(props))
        //     this.endResizer.addEventListener('touchstart', this.initEndDrag, false);
      } else {
        this.endResizer.removeEventListener('mousedown', this.initEndDrag, false);
        if (endResizable(props)) this.endResizer.addEventListener('mousedown', this.initEndDrag, false);
      }
    }
  };

  render() {
    const { eventItem, isStart, isEnd, isInPopover, eventItemClick, schedulerData, isDragging, connectDragSource, connectDragPreview, eventItemTemplateResolver } = this.props;
    const { config, localeDayjs } = schedulerData;
    const { left, width, top } = this.state;
    let roundCls;
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
    const content = <EventItemPopover {...this.props} eventItem={eventItem} title={eventItem.title} startTime={eventItem.start} endTime={eventItem.end} statusColor={bgColor} />;

    const start = localeDayjs(new Date(eventItem.start));
    const eventTitle = isInPopover ? `${start.format('HH:mm')} ${titleText}` : titleText;
    let startResizeDiv = <div />;
    if (startResizable(this.props)) startResizeDiv = <div className="event-resizer event-start-resizer" ref={ref => (this.startResizer = ref)} />;
    let endResizeDiv = <div />;
    if (endResizable(this.props)) endResizeDiv = <div className="event-resizer event-end-resizer" ref={ref => (this.endResizer = ref)} />;

    let eventItemTemplate = (
      <div className={`${roundCls} event-item`} key={eventItem.id} style={{ height: config.eventItemHeight, backgroundColor: bgColor }}>
        <span style={{ marginLeft: '10px', lineHeight: `${config.eventItemHeight}px` }}>{eventTitle}</span>
      </div>
    );
    if (eventItemTemplateResolver !== undefined) {
      eventItemTemplate = eventItemTemplateResolver(schedulerData, eventItem, bgColor, isStart, isEnd, 'event-item', config.eventItemHeight, undefined);
    }

    const a = (
      <a
        className="timeline-event"
        ref={this.eventItemRef}
        onMouseMove={isPopoverPlacementMousePosition ? this.handleMouseMove : undefined}
        style={{ left, width, top }}
        onClick={() => {
          if (eventItemClick) eventItemClick(schedulerData, eventItem);
        }}
      >
        {eventItemTemplate}
        {startResizeDiv}
        {endResizeDiv}
      </a>
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

    const aItem = config.dragAndDropEnabled ? connectDragPreview(connectDragSource(a)) : a;

    if (isDragging ? null : schedulerData._isResizing() || config.eventItemPopoverEnabled === false || eventItem.showPopover === false) {
      return <div>{aItem}</div>;
    }

    return (
      <Popover
        motion={isPopoverPlacementMousePosition ? '' : undefined}
        align={isPopoverPlacementMousePosition ? { offset: [popoverOffsetX, popoverPlacement.includes('top') ? -10 : 10], overflow: {} } : undefined}
        placement={isPopoverPlacementMousePosition ? mousePositionPlacement : popoverPlacement}
        content={content}
        trigger={config.eventItemPopoverTrigger}
        overlayClassName="scheduler-event-item-popover"
      >
        {aItem}
      </Popover>
    );
  }
}

export default EventItem;

EventItem.propTypes = {
  schedulerData: PropTypes.object.isRequired,
  eventItem: PropTypes.object.isRequired,
  isStart: PropTypes.bool.isRequired,
  isEnd: PropTypes.bool.isRequired,
  left: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  top: PropTypes.number.isRequired,
  isInPopover: PropTypes.bool.isRequired,
  leftIndex: PropTypes.number.isRequired,
  rightIndex: PropTypes.number.isRequired,
  isDragging: PropTypes.bool,
  connectDragSource: PropTypes.func,
  connectDragPreview: PropTypes.func,
  updateEventStart: PropTypes.func,
  updateEventEnd: PropTypes.func,
  moveEvent: PropTypes.func,
  subtitleGetter: PropTypes.func,
  eventItemClick: PropTypes.func,
  viewEventClick: PropTypes.func,
  viewEventText: PropTypes.string,
  viewEvent2Click: PropTypes.func,
  viewEvent2Text: PropTypes.string,
  conflictOccurred: PropTypes.func,
  eventItemTemplateResolver: PropTypes.func,
};

EventItem.defaultProps = {
  isDragging: undefined,
  connectDragSource: undefined,
  connectDragPreview: undefined,
  updateEventStart: undefined,
  updateEventEnd: undefined,
  moveEvent: undefined,
  subtitleGetter: undefined,
  eventItemClick: undefined,
  viewEventClick: undefined,
  viewEventText: undefined,
  viewEvent2Click: undefined,
  viewEvent2Text: undefined,
  conflictOccurred: undefined,
  eventItemTemplateResolver: undefined,
};
