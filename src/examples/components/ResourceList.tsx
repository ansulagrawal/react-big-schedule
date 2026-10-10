import type SchedulerData from '../../components/SchedulerData';
import type { DnDSource } from '../../index';
import DragItem, { type NewEventHandler } from './DragItem';

interface ResourceListProps {
  schedulerData: SchedulerData;
  newEvent: NewEventHandler;
  resourceDndSource: DnDSource;
}

export default function ResourceList({ schedulerData, newEvent, resourceDndSource }: ResourceListProps) {
  return (
    <ul className="dnd-list">
      {schedulerData.resources.map(resource => (
        <DragItem
          key={resource.id}
          name={resource.name}
          payload={{ resource }}
          newEvent={newEvent}
          schedulerData={schedulerData}
          dndSource={resourceDndSource}
        />
      ))}
    </ul>
  );
}
