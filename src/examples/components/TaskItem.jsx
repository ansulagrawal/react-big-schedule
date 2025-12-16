/* eslint-disable */
import React from 'react';
import { useDrag } from 'react-dnd';

function TaskItem({ task, schedulerData, dndSource, newEvent }) {
  // For external drag sources, always enable if dndSource is provided
  const isDragEnabled = dndSource !== undefined;
  
  const dragOptions = isDragEnabled ? dndSource.getDragOptions({ task, schedulerData, newEvent }) : null;
  
  const [{ isDragging }, dragRef, dragPreviewRef] = isDragEnabled && dragOptions
    ? useDrag(() => dragOptions)
    : [{ isDragging: false }, null, null];

  const dragContent = <li ref={dragRef} style={{ color: 'red', fontWeight: 'bold', fontSize: '20px', listStyle: 'none' }}>{task.name}</li>;

  return isDragging ? null : <div ref={dragPreviewRef}>{dragContent}</div>;
}

export default TaskItem;
