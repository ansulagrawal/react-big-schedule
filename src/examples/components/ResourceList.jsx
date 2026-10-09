import ResourceItem from './ResourceItem';

function ResourceList({ schedulerData, newEvent, resourceDndSource }) {
  const resources = schedulerData.resources;

  return (
    <ul className="dnd-list">
      {resources.map(resource => (
        <ResourceItem
          key={resource.id}
          resource={resource}
          newEvent={newEvent}
          schedulerData={schedulerData}
          dndSource={resourceDndSource}
        />
      ))}
    </ul>
  );
}

export default ResourceList;
