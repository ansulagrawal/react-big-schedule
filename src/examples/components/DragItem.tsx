import { useDrag } from 'react-dnd';
import type { DnDSourceProps } from '../../components/DnDSource';
import type SchedulerData from '../../components/SchedulerData';
import type { DnDSource } from '../../index';

/** Any `newEvent` callback; the drag source calls it with its own argument list. */
export type NewEventHandler = (...args: never[]) => void;

interface DragItemProps {
  name: string;
  /** What is handed to the drag source resolver, e.g. `{ task }` or `{ resource }`. */
  payload: Record<string, unknown>;
  schedulerData: SchedulerData;
  dndSource?: DnDSource;
  newEvent: NewEventHandler;
}

/** A draggable list entry; renders nothing while it is being dragged. */
export default function DragItem({ name, payload, schedulerData, dndSource, newEvent }: DragItemProps) {
  // useDrag is called unconditionally (rules of hooks); without a source the item simply cannot be dragged
  const [{ isDragging }, dragRef, dragPreviewRef] = useDrag(() => {
    if (!dndSource) {
      return { type: '__NONE__', canDrag: () => false, collect: () => ({ isDragging: false }) };
    }
    return dndSource.getDragOptions({ ...payload, schedulerData, newEvent } as DnDSourceProps);
  }, [payload, schedulerData, dndSource, newEvent]);

  if (isDragging) return null;
  return (
    <div
      ref={node => {
        dragPreviewRef(node);
      }}
    >
      <li
        ref={node => {
          dragRef(node);
        }}
        className="task-item-hover"
      >
        {name}
      </li>
    </div>
  );
}
