import { useDrag } from 'react-dnd';

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
      style={{
        padding: '12px 16px',
        margin: '8px 0',
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '6px',
        color: '#495057',
        fontWeight: '600',
        fontSize: '14px',
        listStyle: 'none',
        cursor: 'grab',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        transition: 'all 0.2s ease',
      }}
      className="task-item-hover"
    >
      {task.name}
    </li>
  );

  return isDragging ? null : <div ref={dragPreviewRef}>{dragContent}</div>;
}

export default TaskItem;
