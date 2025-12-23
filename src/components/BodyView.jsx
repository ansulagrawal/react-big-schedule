import PropTypes from 'prop-types';

/**
 * Render the scheduler's non-agenda body as a table body element.
 *
 * Generates a <tbody> containing one row per renderable slot from `schedulerData.renderData`,
 * with a cell per header where cell width and background color are derived from the scheduler configuration
 * and optional behavior callbacks.
 *
 * @param {Object} schedulerData - Scheduler state and helpers.
 * @param {Array} schedulerData.renderData - Array of slot descriptors; only entries with `render: true` are rendered.
 * @param {Array} schedulerData.headers - Array of header descriptors used to create columns.
 * @param {Object} schedulerData.config - Configuration values used for default cell styling.
 * @param {Object} schedulerData.behaviors - Optional behavior callbacks (e.g., `getNonAgendaViewBodyCellBgColorFunc`).
 * @param {Function} schedulerData.getContentCellWidth - Function returning the width applied to non-final cells.
 * @returns {JSX.Element} A <tbody> element containing the rendered rows and cells.
 */
function BodyView({ schedulerData }) {
  const { renderData, headers, config, behaviors } = schedulerData;
  const width = schedulerData.getContentCellWidth();

  const tableRows = renderData
    .filter(o => o.render)
    .map(({ slotId, groupOnly, rowHeight }) => {
      const rowCells = headers.map((header, index) => {
        const key = `${slotId}_${header.time}`;
        const style = index === headers.length - 1 ? {} : { width };
        if (header.nonWorkingTime) {
          style.backgroundColor = config.nonWorkingTimeBodyBgColor;
        }
        if (groupOnly) {
          style.backgroundColor = config.groupOnlySlotColor;
        }
        if (behaviors.getNonAgendaViewBodyCellBgColorFunc) {
          const cellBgColor = behaviors.getNonAgendaViewBodyCellBgColorFunc(schedulerData, slotId, header);
          if (cellBgColor) {
            style.backgroundColor = cellBgColor;
          }
        }
        return (
          <td key={key} style={style}>
            <div />
          </td>
        );
      });

      return (
        <tr key={slotId} style={{ height: rowHeight }}>
          {rowCells}
        </tr>
      );
    });

  return <tbody>{tableRows}</tbody>;
}

BodyView.propTypes = {
  schedulerData: PropTypes.object.isRequired,
};

export default BodyView;
