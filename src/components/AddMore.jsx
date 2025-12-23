import PropTypes from 'prop-types';

/**
 * Render a compact "more" button showing how many additional events exist and call an action when clicked.
 * @param {{config: {eventItemHeight: number}}} schedulerData - Scheduler data object; used for layout configuration (`config.eventItemHeight`).
 * @param {number} number - The count of additional events to display (rendered as `+{number} more`).
 * @param {number} left - Left position (CSS) for the button.
 * @param {number} width - Width (CSS) for the button.
 * @param {number} top - Top position (CSS) for the button.
 * @param {function(object): void} clickAction - Callback invoked with `headerItem` when the button is clicked.
 * @param {object} headerItem - Payload passed to `clickAction` on click.
 * @returns {JSX.Element} The button element that displays the "+N more" text.
 */
function AddMore({ schedulerData, number, left, width, top, clickAction, headerItem }) {
  const { config } = schedulerData;
  const content = `+${number} more`;

  return (
    <button
      type="button"
      className="timeline-event"
      style={{ left, width, top }}
      onClick={() => clickAction(headerItem)}
    >
      <div style={{ height: config.eventItemHeight, color: '#999', textAlign: 'center' }}>{content}</div>
    </button>
  );
}

AddMore.propTypes = {
  schedulerData: PropTypes.object.isRequired,
  number: PropTypes.number.isRequired,
  left: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  top: PropTypes.number.isRequired,
  clickAction: PropTypes.func.isRequired,
  headerItem: PropTypes.object.isRequired,
};

export default AddMore;
