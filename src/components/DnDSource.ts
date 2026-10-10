import type { DragSourceHookSpec, DragSourceMonitor } from 'react-dnd';
import { DATETIME_FORMAT, DnDTypes, ViewType } from '../config/default';
import type { Id, RenderItem, SchedulerEvent } from '../types';
import type SchedulerData from './SchedulerData';

/** What is being dragged: an existing event, or a custom object from an external drag source. */
export interface DragItem {
  id?: Id;
  title?: string;
  start?: string;
  end?: string;
  resourceId?: Id;
  movable?: boolean;
}

/** react-dnd item type identifier. */
export type Identifier = string | symbol;

export type DnDAction = 'New' | 'Move';

/** Value returned by the drop target (see DnDContext) and read back in endDrag. */
export interface DropResult {
  slotId: Id;
  slotName?: string;
  start: string;
  end: string;
  initialStart?: string | null;
  initialEnd?: string | null;
  isVertical?: boolean;
}

/** Props the component owning the drag source passes to getDragSpec/getDragOptions. */
export interface DnDSourceProps {
  schedulerData: SchedulerData;
  slotId?: Id;
  resourceEvents?: RenderItem;
  // method syntax on purpose: parameter bivariance lets components declare narrower callback signatures
  moveEvent?(
    schedulerData: SchedulerData,
    event: SchedulerEvent,
    slotId: Id,
    slotName: string | undefined,
    start: string,
    end: string,
  ): void;
  newEvent?(
    schedulerData: SchedulerData,
    slotId: Id,
    slotName: string | undefined,
    start: string,
    end: string,
    type: Identifier,
    item: DragItem,
  ): void;
  conflictOccurred?(
    schedulerData: SchedulerData,
    action: DnDAction,
    item: DragItem,
    type: Identifier,
    slotId: Id,
    slotName: string | undefined,
    start: string,
    end: string,
  ): void;
}

export default class DnDSource {
  // `never`: each component passes a resolver typed for its own props object (a DnDSourceProps subtype)
  resolveDragObjFunc: (props: never) => DragItem;
  dndType: string;
  DnDEnabled: boolean;
  dragSlotId: Id | undefined;

  constructor(resolveDragObjFunc: (props: never) => DragItem, DnDEnabled: boolean, dndType: string = DnDTypes.EVENT) {
    this.resolveDragObjFunc = resolveDragObjFunc;
    this.dndType = dndType;
    this.DnDEnabled = DnDEnabled;
    // vertical view: the time row the user grabbed the event in (an event is drawn once per row it covers)
    this.dragSlotId = undefined;
  }

  getDragSpec = () => ({
    // beginDrag: (props, monitor, component) => this.resolveDragObjFunc(props),
    beginDrag: (props: DnDSourceProps): DragItem => {
      this.dragSlotId = props.slotId;
      return this.resolveDragObjFunc(props as never);
    },
    // endDrag: (props, monitor, component) => {
    endDrag: (props: DnDSourceProps, monitor: DragSourceMonitor<DragItem, DropResult>) => {
      this.dragSlotId = undefined;
      if (!monitor.didDrop()) return;

      const { moveEvent, newEvent, schedulerData } = props;
      const { events, config, viewType, localeDayjs } = schedulerData;
      const item = monitor.getItem();
      const type = monitor.getItemType() as Identifier;
      // didDrop() is true here, so a drop result exists
      const dropResult = monitor.getDropResult() as DropResult;
      let { slotId } = dropResult;
      let { slotName } = dropResult;
      let newStart = dropResult.start;
      let newEnd = dropResult.end;
      const { initialStart } = dropResult;
      // const { initialEnd } = dropResult;
      let action: DnDAction = 'New';

      const isEvent = type === DnDTypes.EVENT;
      if (isEvent) {
        const event = item as SchedulerEvent; // an EVENT drag always carries an event
        if (dropResult.isVertical) {
          // the vertical drop already resolved the final start/end (see DnDContext.getVerticalMove)
        } else if (config.relativeMove) {
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

      let hasConflict = false;
      if (config.checkConflict) {
        const start = localeDayjs(newStart);
        const end = localeDayjs(newEnd);

        events.forEach(e => {
          if (schedulerData._getEventSlotId(e) === slotId && (!isEvent || e.id !== item.id)) {
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
        const { conflictOccurred } = props;
        if (conflictOccurred !== undefined) {
          conflictOccurred(schedulerData, action, item, type, slotId, slotName, newStart, newEnd);
        } else {
          console.log('Conflict occurred, set conflictOccurred func in Scheduler to handle it');
        }
      } else if (isEvent) {
        if (moveEvent !== undefined) {
          moveEvent(schedulerData, item as SchedulerEvent, slotId, slotName, newStart, newEnd);
        }
      } else if (newEvent !== undefined) newEvent(schedulerData, slotId, slotName, newStart, newEnd, type, item);
    },

    canDrag: (props: DnDSourceProps) => {
      const { schedulerData, resourceEvents } = props;
      const item = this.resolveDragObjFunc(props as never);
      if (schedulerData._isResizing()) return false;
      const { config } = schedulerData;
      return (
        config.movable &&
        (resourceEvents === undefined || !resourceEvents.groupOnly) &&
        (item.movable === undefined || item.movable !== false)
      );
    },
  });

  // Returns the drag specification for use with useDrag hook
  // This should be called with props from the component using the hook
  getDragOptions = (props: DnDSourceProps): DragSourceHookSpec<DragItem, DropResult, { isDragging: boolean }> => {
    const spec = this.getDragSpec();
    return {
      type: this.dndType,
      item: () => spec.beginDrag(props),
      end: (_item, monitor) => spec.endDrag(props, monitor),
      canDrag: () => spec.canDrag(props),
      collect: monitor => ({
        isDragging: monitor.isDragging(),
      }),
    };
  };
}
