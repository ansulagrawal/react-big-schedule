import PropTypes from 'prop-types';
import React from 'react';

/**
 * Render the table body (<tbody>) containing resource rows and cells based on schedulerData.
 * @param {object} schedulerData - Scheduler state and helpers. Expected properties used: `renderData` (array of row descriptors with `slotId`, `render`, `rowHeight`, `groupOnly`, `nonWorkingTime`), `headers` (array of header descriptors with `time` and `nonWorkingTime`), `config` (including `nonWorkingTimeBodyBgColor` and `groupOnlySlotColor`), `behaviors` (optional `getNonAgendaViewBodyCellBgColorFunc`), `getContentCellWidth()` and `isVerticalResourceView()`.
 * @returns {JSX.Element} The rendered `<tbody>` element containing a `<tr>` per rendered row and `<td>` cells for each header with computed inline styles.
 */
function BodyView({ schedulerData }) {
  const { renderData, headers, config, behaviors } = schedulerData;
  const width = schedulerData.getContentCellWidth();

  const tableRows = renderData
    .filter(o => o.render)
    .map(row => {
      const { slotId, groupOnly, rowHeight } = row;
      const rowCells = headers.map(header => {
        const key = `${slotId}_${header.time}`;
        const style = { width, minWidth: width };
        const isVertical = schedulerData.isVerticalResourceView();

        if (isVertical) {
          if (row.nonWorkingTime) {
            style.backgroundColor = config.nonWorkingTimeBodyBgColor;
          }
        } else if (header.nonWorkingTime) {
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
  schedulerDataVersion: PropTypes.number,
};

export default React.memo(BodyView);
