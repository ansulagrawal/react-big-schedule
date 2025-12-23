/* eslint-disable */
import { useDrag } from 'react-dnd';

/**
 * Render a draggable task item styled as a red, bold list element and hide it while it is being dragged.
 *
 * When `dndSource` is provided the component uses its drag options to enable dragging; when `dndSource` is absent dragging is disabled and the item is rendered normally. While the item is in the dragging state the component returns `null`.
 *
 * @param {Object} props
 * @param {{ name: string }} props.task - Task data; `task.name` is displayed as the item label.
 * @param {Object} props.schedulerData - Scheduler context passed through to `dndSource.getDragOptions` when available.
 * @param {Object} [props.dndSource] - Drag-and-drop source object; if provided its `getDragOptions({ task, schedulerData, newEvent })` is used to configure dragging.
 * @param {Object} [props.newEvent] - Additional event data forwarded to `dndSource.getDragOptions` when available.
 * @returns {import('react').ReactNode} The rendered task item element, or `null` when the item is being dragged. */
function TaskItem({ task, schedulerData, dndSource, newEvent }) {
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
    return dndSource.getDragOptions({ task, schedulerData, newEvent });
  }, [task, schedulerData, dndSource, newEvent]);

  const dragContent = (
    <li ref={dragRef} style={{ color: 'red', fontWeight: 'bold', fontSize: '20px', listStyle: 'none' }}>
      {task.name}
    </li>
  );

  return isDragging ? null : <div ref={dragPreviewRef}>{dragContent}</div>;
}

export default TaskItem;