import PropTypes from 'prop-types';

/**
 * Render a positioned highlighted area representing the current selection.
 *
 * Renders a div positioned by the provided left offset and width with its
 * background color taken from schedulerData.config.selectedAreaColor.
 *
 * @param {Object} props
 * @param {number} props.left - Left offset (CSS value) for the selected area.
 * @param {number} props.width - Width (CSS value) for the selected area.
 * @param {Object} props.schedulerData - Scheduler state object; used to read `config.selectedAreaColor`.
 * @returns {JSX.Element} A div with class 'selected-area' styled to represent the selection.
 */
function SelectedArea({ left, width, schedulerData }) {
  const { config } = schedulerData;

  const selectedAreaStyle = {
    left,
    width,
    top: 0,
    bottom: 0,
    backgroundColor: config.selectedAreaColor,
  };

  return <div className='selected-area' style={selectedAreaStyle} />;
}

SelectedArea.propTypes = {
  schedulerData: PropTypes.object.isRequired,
  left: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
};

export default SelectedArea;