/* eslint-disable */
import React from 'react';
import ResourceItem from './ResourceItem';

/**
 * Render an unordered list of resources, each rendered as a ResourceItem.
 * @param {Object} schedulerData - Scheduler state object that contains a `resources` array.
 * @param {*} newEvent - Value passed through to each ResourceItem for creating or initializing new events.
 * @param {*} resourceDndSource - Drag-and-drop source passed through to each ResourceItem.
 * @returns {JSX.Element} An unordered list (<ul>) containing ResourceItem elements for each resource.
 */
function ResourceList({ schedulerData, newEvent, resourceDndSource }) {
  const resources = schedulerData.resources;

  return (
    <ul>
      {resources.map(resource => (
        <ResourceItem key={resource.id} resource={resource} newEvent={newEvent} schedulerData={schedulerData} dndSource={resourceDndSource} />
      ))}
    </ul>
  );
}

export default ResourceList;