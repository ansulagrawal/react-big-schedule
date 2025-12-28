/* eslint-disable */
import React from 'react';

function TaskItem({ task, isDragging, connectDragSource, connectDragPreview }) {
  const dragContent = <li style={{ color: 'red', fontWeight: 'bold', fontSize: '20px', listStyle: 'none' }}>{task.name}</li>;

  return isDragging ? null : <>{connectDragPreview(connectDragSource(dragContent))}</>;
}

export default TaskItem;
