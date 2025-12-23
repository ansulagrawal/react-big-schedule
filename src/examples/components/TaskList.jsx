/* eslint-disable */
import React from 'react';
import TaskItem from './TaskItem';

/**
 * Renders a list of tasks from scheduler data as TaskItem components.
 *
 * @param {Object} props
 * @param {Object} props.schedulerData - Scheduler data containing an `eventGroups` array of task objects.
 * @param {Function} props.newEvent - Callback used to create a new event for a task.
 * @param {*} props.taskDndSource - Drag-and-drop source passed to each TaskItem.
 * @returns {JSX.Element} A <ul> element containing a TaskItem for each task in `schedulerData.eventGroups`.
 */
function TaskList({ schedulerData, newEvent, taskDndSource }) {
  const tasks = schedulerData.eventGroups;

  return (
    <ul>
      {tasks?.map(task => (
        <TaskItem key={task.id} task={task} newEvent={newEvent} schedulerData={schedulerData} dndSource={taskDndSource} />
      ))}
    </ul>
  );
}

export default TaskList;