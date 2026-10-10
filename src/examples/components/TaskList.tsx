import type SchedulerData from '../../components/SchedulerData';
import type { DnDSource } from '../../index';
import DragItem, { type NewEventHandler } from './DragItem';

interface TaskListProps {
  schedulerData: SchedulerData;
  newEvent: NewEventHandler;
  taskDndSource: DnDSource;
}

export default function TaskList({ schedulerData, newEvent, taskDndSource }: TaskListProps) {
  return (
    <ul className="dnd-list">
      {schedulerData.eventGroups.map(task => (
        <DragItem
          key={task.id}
          name={task.name}
          payload={{ task }}
          newEvent={newEvent}
          schedulerData={schedulerData}
          dndSource={taskDndSource}
        />
      ))}
    </ul>
  );
}
