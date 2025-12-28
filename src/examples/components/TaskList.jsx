/* eslint-disable */
import React from 'react';

function TaskList({ schedulerData, newEvent, taskDndSource }) {
  const DnDTaskItem = taskDndSource.getDragSource();
  const tasks = schedulerData.eventGroups;

  return (
    <ul>
      {tasks?.map(task => (
        <DnDTaskItem key={task.id} task={task} newEvent={newEvent} schedulerData={schedulerData} />
      ))}
    </ul>
  );
}

export default TaskList;
