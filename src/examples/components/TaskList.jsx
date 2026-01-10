import TaskItem from './TaskItem';

function TaskList({ schedulerData, newEvent, taskDndSource }) {
  const tasks = schedulerData.eventGroups;

  return (
    <ul>
      {tasks?.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          newEvent={newEvent}
          schedulerData={schedulerData}
          dndSource={taskDndSource}
        />
      ))}
    </ul>
  );
}

export default TaskList;
