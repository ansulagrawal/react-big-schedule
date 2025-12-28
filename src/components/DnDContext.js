import { DropTarget } from 'react-dnd';
import { DnDTypes, CellUnit, DATETIME_FORMAT, ViewType } from '../config/default';
import { getPos } from '../helper/utility';

export default class DnDContext {
  constructor(sources, DecoratedComponent) {
    this.sourceMap = new Map();
    sources.forEach(item => {
      this.sourceMap.set(item.dndType, item);
    });
    this.DecoratedComponent = DecoratedComponent;
  }

  extractInitialTimes = (monitor, pos, cellWidth, resourceEvents, cellUnit, localeDayjs) => {
    const initialPoint = monitor.getInitialClientOffset();
    const initialLeftIndex = Math.floor((initialPoint.x - pos.x) / cellWidth);
    const initialStart = resourceEvents.headerItems[initialLeftIndex].start;
    let initialEnd = resourceEvents.headerItems[initialLeftIndex].end;
    if (cellUnit !== CellUnit.Hour) {
      const end = localeDayjs(new Date(initialStart)).hour(23).minute(59).second(59);
      initialEnd = end.format(DATETIME_FORMAT);
    }
    return { initialStart, initialEnd };
  };

  getDropSpec = () => ({
    drop: (props, monitor, component) => {
      const { schedulerData, resourceEvents } = props;
      const { cellUnit, localeDayjs } = schedulerData;
      const type = monitor.getItemType();
      const pos = getPos(component.eventContainer);
      const cellWidth = schedulerData.getContentCellWidth();
      let initialStartTime = null;
      let initialEndTime = null;
      if (type === DnDTypes.EVENT) {
        const { initialStart, initialEnd } = this.extractInitialTimes(monitor, pos, cellWidth, resourceEvents, cellUnit, localeDayjs);
        initialStartTime = initialStart;
        initialEndTime = initialEnd;
      }
      const point = monitor.getClientOffset();
      const leftIndex = Math.floor((point.x - pos.x) / cellWidth);
      const startTime = resourceEvents.headerItems[leftIndex].start;
      let endTime = resourceEvents.headerItems[leftIndex].end;
      if (cellUnit !== CellUnit.Hour) {
        endTime = localeDayjs(new Date(resourceEvents.headerItems[leftIndex].start)).hour(23).minute(59).second(59)
          .format(DATETIME_FORMAT);
      }

      return {
        slotId: resourceEvents.slotId,
        slotName: resourceEvents.slotName,
        start: startTime,
        end: endTime,
        initialStart: initialStartTime,
        initialEnd: initialEndTime,
      };
    },

    hover: (props, monitor, component) => {
      const { schedulerData, resourceEvents, movingEvent } = props;
      const { cellUnit, config, viewType, localeDayjs } = schedulerData;
      this.config = config;
      const item = monitor.getItem();
      const type = monitor.getItemType();
      const pos = getPos(component.eventContainer);
      const cellWidth = schedulerData.getContentCellWidth();
      let initialStart = null;
      // let initialEnd = null;
      if (type === DnDTypes.EVENT) {
        // const { initialStart: iStart, initialEnd: iEnd } = this.extractInitialTimes(monitor, pos, cellWidth, resourceEvents, cellUnit, localeDayjs);
        const { initialStart: iStart } = this.extractInitialTimes(monitor, pos, cellWidth, resourceEvents, cellUnit, localeDayjs);
        initialStart = iStart;
        // initialEnd = iEnd;
      }

      const point = monitor.getClientOffset();
      const leftIndex = Math.floor((point.x - pos.x) / cellWidth);
      if (!resourceEvents.headerItems[leftIndex]) {
        return;
      }
      let newStart = resourceEvents.headerItems[leftIndex].start;
      let newEnd = resourceEvents.headerItems[leftIndex].end;
      if (cellUnit !== CellUnit.Hour) {
        newEnd = localeDayjs(new Date(resourceEvents.headerItems[leftIndex].start)).hour(23).minute(59).second(59)
          .format(DATETIME_FORMAT);
      }
      let { slotId, slotName } = resourceEvents;
      let action = 'New';
      const isEvent = type === DnDTypes.EVENT;
      if (isEvent) {
        const event = item;
        if (config.relativeMove) {
          newStart = localeDayjs(event.start)
            .add(localeDayjs(newStart).diff(localeDayjs(new Date(initialStart))), 'ms')
            .format(DATETIME_FORMAT);
        } else if (viewType !== ViewType.Day) {
          const tmpDayjs = localeDayjs(newStart);
          newStart = localeDayjs(event.start).year(tmpDayjs.year()).month(tmpDayjs.month()).date(tmpDayjs.date())
            .format(DATETIME_FORMAT);
        }
        newEnd = localeDayjs(newStart)
          .add(localeDayjs(event.end).diff(localeDayjs(event.start)), 'ms')
          .format(DATETIME_FORMAT);

        // if crossResourceMove disabled, slot returns old value
        if (config.crossResourceMove === false) {
          slotId = schedulerData._getEventSlotId(item);
          slotName = undefined;
          const slot = schedulerData.getSlotById(slotId);
          if (slot) slotName = slot.name;
        }

        action = 'Move';
      }

      if (movingEvent) {
        movingEvent(schedulerData, slotId, slotName, newStart, newEnd, action, type, item);
      }
    },

    canDrop: (props, monitor) => {
      const { schedulerData, resourceEvents } = props;
      const item = monitor.getItem();
      if (schedulerData._isResizing()) return false;
      const { config } = schedulerData;
      return config.movable && !resourceEvents.groupOnly && (item.movable === undefined || item.movable !== false);
    },
  });

  getDropCollect = (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
  });

  getDropTarget = dragAndDropEnabled => (dragAndDropEnabled ? DropTarget([...this.sourceMap.keys()], this.getDropSpec(), this.getDropCollect)(this.DecoratedComponent) : this.DecoratedComponent);

  getDndSource = (dndType = DnDTypes.EVENT) => this.sourceMap.get(dndType);
}
