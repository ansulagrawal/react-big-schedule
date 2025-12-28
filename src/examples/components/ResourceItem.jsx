/* eslint-disable */
import React from 'react';

function ResourceItem({ resource, isDragging, connectDragSource, connectDragPreview }) {
  const dragContent = <li style={{ color: 'red', fontWeight: 'bold', fontSize: '20px', listStyle: 'none' }}>{resource.name}</li>;

  return isDragging ? null : <div>{connectDragPreview(connectDragSource(dragContent))}</div>;
}

export default ResourceItem;
