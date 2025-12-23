/* eslint-disable */
import { useDrag } from 'react-dnd';

/**
 * Render a resource list item that is draggable when a drag source is provided.
 *
 * @param {Object} props
 * @param {{name: string}} props.resource - Resource data; `resource.name` is displayed.
 * @param {Object} props.schedulerData - Scheduler context passed to `dndSource.getDragOptions`.
 * @param {{ getDragOptions: Function }|null} props.dndSource - Drag-and-drop source that must implement `getDragOptions({ resource, schedulerData, newEvent })`. If falsy, dragging is disabled.
 * @param {Object} [props.newEvent] - Optional event template forwarded to `getDragOptions`.
 * @returns {JSX.Element|null} The rendered resource item element, or `null` while the item is being dragged.
 */
function ResourceItem({ resource, schedulerData, dndSource, newEvent }) {
  // Always call useDrag unconditionally (Rules of Hooks)
  // Disable functionality when dndSource is not provided
  const [{ isDragging }, dragRef, dragPreviewRef] = useDrag(() => {
    // If dndSource is not provided, return a no-op spec
    if (!dndSource) {
      return {
        type: '__NONE__',
        canDrag: () => false,
        collect: () => ({ isDragging: false }),
      };
    }

    // Get drag options from dndSource
    return dndSource.getDragOptions({ resource, schedulerData, newEvent });
  }, [resource, schedulerData, dndSource, newEvent]);

  const dragContent = (
    <li ref={dragRef} style={{ color: 'red', fontWeight: 'bold', fontSize: '20px', listStyle: 'none' }}>
      {resource.name}
    </li>
  );

  return isDragging ? null : <div ref={dragPreviewRef}>{dragContent}</div>;
}

export default ResourceItem;