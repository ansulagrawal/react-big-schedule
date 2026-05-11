import { useDrag } from 'react-dnd';

/**
 * Renders a draggable task list item that displays the task's name and delegates drag behavior to the provided drag source; renders nothing while the item is being dragged.
 * @param {{task: {name: string}, schedulerData: any, dndSource: {getDragOptions: Function}|null, newEvent: any}} props - Component props.
 * @param {object} props.task - Task object whose `name` is displayed.
 * @param {*} props.schedulerData - Scheduler state or context forwarded to the drag source.
 * @param {{getDragOptions: Function}|null} props.dndSource - Drag source provider; when absent, drag is disabled.
 * @param {*} props.newEvent - Additional event data forwarded to the drag source.
 * @returns {React.ReactElement|null} The task item wrapped for drag preview, or `null` while the item is being dragged.
 */
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
    <li
      ref={dragRef}
      className="task-item-hover"
    >
      {task.name}
    </li>
  );

  return isDragging ? null : <div ref={dragPreviewRef}>{dragContent}</div>;
}

export default TaskItem;
