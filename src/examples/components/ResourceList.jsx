/* eslint-disable */
import React from 'react';

function ResourceList({ schedulerData, newEvent, resourceDndSource }) {
  const DnDResourceItem = resourceDndSource.getDragSource();
  const resources = schedulerData.resources;

  return (
    <ul>
      {resources.map(resource => (
        <DnDResourceItem key={resource.id} resource={resource} newEvent={newEvent} schedulerData={schedulerData} />
      ))}
    </ul>
  );
}

export default ResourceList;
