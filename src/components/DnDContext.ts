import type { DropTargetHookSpec, DropTargetMonitor } from 'react-dnd';
import { CellUnit, DATETIME_FORMAT, DnDTypes, ViewType } from '../config/default';
import { getPos } from '../helper/utility';
import type { Id, RenderItem, SchedulerConfig, SchedulerEvent } from '../types';
import type DnDSource from './DnDSource';
import type { DnDAction, DragItem, DropResult, Identifier } from './DnDSource';
import type SchedulerData from './SchedulerData';

/** The drop-target component: exposes the row element and (optionally) a drop preview setter. */
export interface DropTargetComponent {
  eventContainer: HTMLElement | null;
  setDropPreview?: (preview: DropPreview) => void;
}

/** Box shown while dragging, in px relative to the row. */
export interface DropPreview {
  left: number;
  width: number;
}

/** Props the component owning the drop target passes to getDropOptions. */
export interface DnDContextProps {
  schedulerData: SchedulerData;
  resourceEvents: RenderItem;
  // method syntax on purpose: parameter bivariance lets components declare narrower callback signatures
  movingEvent?(
    schedulerData: SchedulerData,
    slotId: Id,
    slotName: string | undefined,
    start: string,
    end: string,
    action: DnDAction,
    type: Identifier,
    item: DragItem,
  ): void;
}

type DropMonitor = DropTargetMonitor<DragItem, DropResult>;

export default class DnDContext {
  sourceMap: Map<Identifier, DnDSource>;
  config?: SchedulerConfig;

  constructor(sources: DnDSource[]) {
    this.sourceMap = new Map();
    sources.forEach(item => {
      this.sourceMap.set(item.dndType, item);
    });
  }

  extractInitialTimes = (
    monitor: DropMonitor,
    pos: { x: number; y: number },
    cellWidth: number,
    resourceEvents: RenderItem,
    cellUnit: CellUnit,
    localeDayjs: SchedulerData['localeDayjs'],
  ) => {
    // a drag is in progress, so the initial offset is set
    const initialPoint = monitor.getInitialClientOffset() as { x: number; y: number };
    const initialLeftIndex = Math.floor((initialPoint.x - pos.x) / cellWidth);
    const initialStart = resourceEvents.headerItems[initialLeftIndex].start;
    let initialEnd = resourceEvents.headerItems[initialLeftIndex].end;
    if (cellUnit !== CellUnit.Hour) {
      const end = localeDayjs(new Date(initialStart)).hour(23).minute(59).second(59);
      initialEnd = end.format(DATETIME_FORMAT);
    }
    return { initialStart, initialEnd };
  };

  // Vertical resource view: rows are time slots and columns are resources, so the pointer column picks the
  // resource and the pointer row, relative to the row the event was grabbed in, shifts its time.
  getVerticalMove = (
    props: DnDContextProps,
    monitor: DropMonitor,
    component: DropTargetComponent,
  ): DropResult | null => {
    const { schedulerData, resourceEvents } = props;
    const { localeDayjs, config } = schedulerData;
    const event = monitor.getItem() as SchedulerEvent;
    const pos = getPos(component.eventContainer);
    const column = Math.floor(
      ((monitor.getClientOffset() as { x: number }).x - pos.x) / schedulerData.getContentCellWidth(),
    );
    const header = resourceEvents.headerItems[Math.max(0, Math.min(column, resourceEvents.headerItems.length - 1))];
    if (!header) return null;

    const grabbedSlotId = this.sourceMap.get(monitor.getItemType() as Identifier)?.dragSlotId ?? resourceEvents.slotId;
    const shift = localeDayjs(resourceEvents.slotId).diff(localeDayjs(grabbedSlotId));
    const start = localeDayjs(event.start).add(shift, 'ms');
    const end = start.add(localeDayjs(event.end).diff(localeDayjs(event.start)), 'ms');

    // crossResourceMove disabled: the event stays in its resource and only moves in time
    const keepResource = config.crossResourceMove === false;
    const slotId = keepResource ? schedulerData._getEventSlotId(event) : header.id;
    const slotName = schedulerData.getSlotById(slotId)?.name;

    return {
      slotId,
      slotName,
      start: start.format(DATETIME_FORMAT),
      end: end.format(DATETIME_FORMAT),
      isVertical: true,
    };
  };

  // Box shown while dragging: the cells (in this row) the dragged item would cover, as { left, width }.
  getDropPreview = (
    resourceEvents: RenderItem,
    cellWidth: number,
    firstIndex: number,
    start?: string,
    end?: string,
  ): DropPreview => {
    const { headerItems } = resourceEvents;
    let first = firstIndex;
    let count = 1;
    if (start && end) {
      const from = new Date(start);
      const to = new Date(end);
      const covered = headerItems.reduce<number[]>((acc, header, index) => {
        if (new Date(header.end) > from && new Date(header.start) < to) acc.push(index);
        return acc;
      }, []);
      if (covered.length > 0) {
        first = covered[0];
        count = covered.length;
      }
    }
    return { left: first * cellWidth, width: count * cellWidth };
  };

  getDropSpec = () => ({
    drop: (props: DnDContextProps, monitor: DropMonitor, component: DropTargetComponent): DropResult | undefined => {
      const { schedulerData, resourceEvents } = props;
      const { cellUnit, localeDayjs } = schedulerData;
      const type = monitor.getItemType() as Identifier;
      if (schedulerData.isVerticalResourceView() && type === DnDTypes.EVENT) {
        return this.getVerticalMove(props, monitor, component) ?? undefined;
      }
      const pos = getPos(component.eventContainer);
      const cellWidth = schedulerData.getContentCellWidth();
      let initialStartTime: string | null = null;
      let initialEndTime: string | null = null;
      if (type === DnDTypes.EVENT) {
        const { initialStart, initialEnd } = this.extractInitialTimes(
          monitor,
          pos,
          cellWidth,
          resourceEvents,
          cellUnit,
          localeDayjs,
        );
        initialStartTime = initialStart;
        initialEndTime = initialEnd;
      }
      const point = monitor.getClientOffset() as { x: number; y: number };
      const leftIndex = Math.floor((point.x - pos.x) / cellWidth);
      const startTime = resourceEvents.headerItems[leftIndex].start;
      let endTime = resourceEvents.headerItems[leftIndex].end;
      if (cellUnit !== CellUnit.Hour) {
        endTime = localeDayjs(new Date(resourceEvents.headerItems[leftIndex].start))
          .hour(23)
          .minute(59)
          .second(59)
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

    hover: (props: DnDContextProps, monitor: DropMonitor, component: DropTargetComponent) => {
      const { schedulerData, resourceEvents, movingEvent } = props;
      const { cellUnit, config, viewType, localeDayjs } = schedulerData;
      this.config = config;
      const item = monitor.getItem();
      const type = monitor.getItemType() as Identifier;
      if (schedulerData.isVerticalResourceView() && type === DnDTypes.EVENT) {
        const move = this.getVerticalMove(props, monitor, component);
        const column = Math.floor(
          ((monitor.getClientOffset() as { x: number }).x - getPos(component.eventContainer).x) /
            schedulerData.getContentCellWidth(),
        );
        const columnIndex = Math.max(0, Math.min(column, resourceEvents.headerItems.length - 1));
        component.setDropPreview?.(
          this.getDropPreview(resourceEvents, schedulerData.getContentCellWidth(), columnIndex),
        );
        if (move && movingEvent) {
          movingEvent(schedulerData, move.slotId, move.slotName, move.start, move.end, 'Move', type, item);
        }
        return;
      }
      const pos = getPos(component.eventContainer);
      const cellWidth = schedulerData.getContentCellWidth();
      let initialStart: string | null = null;
      if (type === DnDTypes.EVENT) {
        const { initialStart: iStart } = this.extractInitialTimes(
          monitor,
          pos,
          cellWidth,
          resourceEvents,
          cellUnit,
          localeDayjs,
        );
        initialStart = iStart;
      }

      const point = monitor.getClientOffset() as { x: number; y: number };
      const leftIndex = Math.floor((point.x - pos.x) / cellWidth);
      if (!resourceEvents.headerItems[leftIndex]) {
        return;
      }
      let newStart = resourceEvents.headerItems[leftIndex].start;
      let newEnd = resourceEvents.headerItems[leftIndex].end;
      if (cellUnit !== CellUnit.Hour) {
        newEnd = localeDayjs(new Date(resourceEvents.headerItems[leftIndex].start))
          .hour(23)
          .minute(59)
          .second(59)
          .format(DATETIME_FORMAT);
      }
      let { slotId } = resourceEvents;
      let slotName: string | undefined = resourceEvents.slotName;
      let action: DnDAction = 'New';
      const isEvent = type === DnDTypes.EVENT;
      if (isEvent) {
        const event = item as SchedulerEvent; // an EVENT drag always carries an event
        if (config.relativeMove) {
          newStart = localeDayjs(event.start)
            .add(localeDayjs(newStart).diff(localeDayjs(new Date(initialStart as string))), 'ms')
            .format(DATETIME_FORMAT);
        } else if (viewType !== ViewType.Day) {
          const tmpDayjs = localeDayjs(newStart);
          newStart = localeDayjs(event.start)
            .year(tmpDayjs.year())
            .month(tmpDayjs.month())
            .date(tmpDayjs.date())
            .format(DATETIME_FORMAT);
        }
        newEnd = localeDayjs(newStart)
          .add(localeDayjs(event.end).diff(localeDayjs(event.start)), 'ms')
          .format(DATETIME_FORMAT);

        // if crossResourceMove disabled, slot returns old value
        if (config.crossResourceMove === false) {
          slotId = schedulerData._getEventSlotId(event);
          slotName = undefined;
          const slot = schedulerData.getSlotById(slotId);
          if (slot) slotName = slot.name;
        }

        action = 'Move';
      }

      component.setDropPreview?.(
        this.getDropPreview(
          resourceEvents,
          cellWidth,
          leftIndex,
          isEvent ? newStart : undefined,
          isEvent ? newEnd : undefined,
        ),
      );

      if (movingEvent) {
        movingEvent(schedulerData, slotId, slotName, newStart, newEnd, action, type, item);
      }
    },

    canDrop: (props: DnDContextProps, monitor: DropMonitor) => {
      const { schedulerData, resourceEvents } = props;
      const item = monitor.getItem();
      if (schedulerData._isResizing()) return false;
      const { config } = schedulerData;
      return config.movable && !resourceEvents.groupOnly && (item.movable === undefined || item.movable !== false);
    },
  });

  // Returns the drop specification for use with useDrop hook
  // This should be called with props from the component using the hook
  getDropOptions = (
    props: DnDContextProps,
    component: DropTargetComponent,
  ): DropTargetHookSpec<DragItem, DropResult, { isOver: boolean; canDrop: boolean }> => {
    const spec = this.getDropSpec();
    return {
      accept: [...this.sourceMap.keys()],
      drop: (_item, monitor) => spec.drop(props, monitor, component),
      hover: (_item, monitor) => spec.hover(props, monitor, component),
      canDrop: (_item, monitor) => spec.canDrop(props, monitor),
      collect: monitor => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    };
  };

  getDndSource = (dndType: string = DnDTypes.EVENT) => this.sourceMap.get(dndType);
}
